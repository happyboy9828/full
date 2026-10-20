/**
 * Offline test suite for the admin authentication / RBAC layer.
 *
 * Run with:  node test/admin-auth.test.js
 *
 * These tests exercise everything that does NOT require a live MongoDB
 * connection: password hashing, the RBAC matrix, session-independent
 * helpers and request validation. Integration behaviour that needs the
 * database is covered by the seed script + the manual smoke test documented
 * in ADMIN_SPEC.md.
 */

import assert from "node:assert/strict";
import { hashPassword, verifyPassword, dummyVerify, passwordPolicyError } from "../utils/password.js";
import {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  permissionsForRole,
  hasPermission,
  roleAtLeast,
  isValidRole,
  publicAdmin,
  roleLabel,
} from "../config/roles.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(`      ${error.message}`);
  }
}

console.log("\npassword hashing");

test("hashes and verifies the correct password", () => {
  const hash = hashPassword("kingdom");
  assert.ok(hash.includes(":"));
  assert.ok(verifyPassword("kingdom", hash));
});

test("rejects an incorrect password", () => {
  const hash = hashPassword("kingdom");
  assert.equal(verifyPassword("wrong", hash), false);
});

test("produces a different hash for the same password (random salt)", () => {
  assert.notEqual(hashPassword("kingdom"), hashPassword("kingdom"));
});

test("rejects malformed stored hashes without throwing", () => {
  assert.equal(verifyPassword("kingdom", "not-a-hash"), false);
  assert.equal(verifyPassword("kingdom", "salt:"), false);
  assert.equal(verifyPassword("kingdom", ":deadbeef"), false);
  assert.equal(verifyPassword("kingdom", "abc:zz"), false);
});

test("rejects non-string passwords", () => {
  assert.equal(verifyPassword(null, hashPassword("x")), false);
  assert.equal(verifyPassword(undefined, hashPassword("x")), false);
  assert.equal(verifyPassword(12345, hashPassword("x")), false);
});

test("dummy verification succeeds (timing equalisation path)", () => {
  assert.equal(dummyVerify(), true);
});

console.log("\npassword policy");

test("accepts a compliant password", () => {
  assert.equal(passwordPolicyError("kingdom1"), null);
});

test("rejects short passwords", () => {
  assert.match(passwordPolicyError("abc1"), /at least 8/);
});

test("rejects passwords without a number", () => {
  assert.match(passwordPolicyError("abcdefgh"), /number/);
});

test("rejects passwords without a letter", () => {
  assert.match(passwordPolicyError("12345678"), /letter/);
});

test("rejects non-string passwords", () => {
  assert.ok(passwordPolicyError(undefined));
  assert.ok(passwordPolicyError(null));
});

console.log("\nRBAC matrix");

test("every role is valid", () => {
  for (const role of Object.values(ROLES)) {
    assert.ok(isValidRole(role), `${role} should be valid`);
  }
  assert.equal(isValidRole("root"), false);
  assert.equal(isValidRole(undefined), false);
});

test("superadmin holds every permission", () => {
  const all = Object.values(PERMISSIONS);
  assert.deepEqual(permissionsForRole(ROLES.SUPERADMIN).sort(), all.sort());
  for (const permission of all) {
    assert.ok(hasPermission(ROLES.SUPERADMIN, permission));
  }
});

test("admin can manage users but not administrators", () => {
  assert.ok(hasPermission(ROLES.ADMIN, PERMISSIONS.USERS_VIEW));
  assert.ok(hasPermission(ROLES.ADMIN, PERMISSIONS.USERS_MANAGE));
  assert.ok(hasPermission(ROLES.ADMIN, PERMISSIONS.SYSTEM_VIEW));
  assert.equal(hasPermission(ROLES.ADMIN, PERMISSIONS.ADMINS_MANAGE), false);
  assert.equal(hasPermission(ROLES.ADMIN, PERMISSIONS.SETTINGS_MANAGE), false);
});

test("analyst can read analytics and activity only", () => {
  assert.ok(hasPermission(ROLES.ANALYST, PERMISSIONS.ANALYTICS_VIEW));
  assert.ok(hasPermission(ROLES.ANALYST, PERMISSIONS.ACTIVITY_VIEW));
  assert.equal(hasPermission(ROLES.ANALYST, PERMISSIONS.USERS_VIEW), false);
  assert.equal(hasPermission(ROLES.ANALYST, PERMISSIONS.USERS_MANAGE), false);
  assert.equal(hasPermission(ROLES.ANALYST, PERMISSIONS.SYSTEM_VIEW), false);
});

test("viewer only sees the dashboard", () => {
  assert.deepEqual(permissionsForRole(ROLES.VIEWER), [PERMISSIONS.DASHBOARD_VIEW]);
  assert.equal(hasPermission(ROLES.VIEWER, PERMISSIONS.ANALYTICS_VIEW), false);
  assert.equal(hasPermission(ROLES.VIEWER, PERMISSIONS.ACTIVITY_VIEW), false);
  assert.equal(hasPermission(ROLES.VIEWER, PERMISSIONS.USERS_VIEW), false);
});

test("unknown roles hold no permissions", () => {
  assert.deepEqual(permissionsForRole("root"), []);
  assert.equal(hasPermission("root", PERMISSIONS.DASHBOARD_VIEW), false);
  assert.equal(hasPermission(undefined, PERMISSIONS.DASHBOARD_VIEW), false);
});

test("role levels are ordered superadmin > admin > analyst > viewer", () => {
  assert.ok(roleAtLeast(ROLES.SUPERADMIN, ROLES.ADMIN));
  assert.ok(roleAtLeast(ROLES.ADMIN, ROLES.ANALYST));
  assert.ok(roleAtLeast(ROLES.ANALYST, ROLES.VIEWER));
  assert.ok(roleAtLeast(ROLES.VIEWER, ROLES.VIEWER));
  assert.equal(roleAtLeast(ROLES.VIEWER, ROLES.ADMIN), false);
  assert.equal(roleAtLeast(ROLES.ANALYST, ROLES.SUPERADMIN), false);
});

test("role matrix is exhaustive", () => {
  assert.equal(Object.keys(ROLE_PERMISSIONS).length, Object.values(ROLES).length);
});

test("role labels are human readable", () => {
  assert.equal(roleLabel(ROLES.SUPERADMIN), "Super Admin");
  assert.equal(roleLabel(ROLES.VIEWER), "Viewer");
  assert.equal(roleLabel("nope"), "Unknown");
});

console.log("\nserialisation");

test("publicAdmin strips the password hash and lockout counters", () => {
  const serialised = publicAdmin({
    _id: "abc123",
    email: "admin@docstools.app",
    name: "Super Administrator",
    passwordHash: "salt:secret",
    role: ROLES.SUPERADMIN,
    isActive: true,
    failedLoginAttempts: 3,
    lockedUntil: null,
    recoveryPhone: null,
  });

  assert.equal(serialised.passwordHash, undefined);
  assert.equal(serialised.failedLoginAttempts, undefined);
  assert.equal(serialised.email, "admin@docstools.app");
  assert.equal(serialised.id, "abc123");
  assert.equal(serialised.role, ROLES.SUPERADMIN);
  assert.equal(serialised.roleLabel, "Super Admin");
});

test("publicAdmin handles a null document", () => {
  assert.equal(publicAdmin(null), null);
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed === 0 ? 0 : 1);
