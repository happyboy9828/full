/**
 * Seed script for the administrative account system.
 *
 * Usage:
 *   node scripts/seed-admin.js            # ensure the bootstrap super admin exists
 *   node scripts/seed-admin.js --demo     # also seed demo admins + application users
 *
 * Environment:
 *   ADMIN_BOOTSTRAP_EMAIL     email of the bootstrap super admin
 *   ADMIN_BOOTSTRAP_NAME      display name for the bootstrap super admin
 *   ADMIN_BOOTSTRAP_PASSWORD  password for the bootstrap super admin
 *
 * The bootstrap password falls back to ADMIN_PASSWORD (legacy) and finally to
 * a generated one that is printed once — never reuse a generated password in
 * production without rotating it.
 */

import crypto from "crypto";
import mongoose from "mongoose";
import config from "../config/env.js";
import { Admin, AppUser, AdminSession } from "../models/index.js";
import { hashPassword } from "../utils/password.js";
import { ROLES } from "../config/roles.js";

const DEMO = process.argv.includes("--demo");

function generatePassword() {
  return `Doc-${crypto.randomBytes(6).toString("hex")}-${Math.floor(Math.random() * 90 + 10)}`;
}

async function ensureBootstrapAdmin() {
  const email = String(config.adminBootstrapEmail || "admin@docstools.app")
    .trim()
    .toLowerCase();
  const password = config.adminBootstrapPassword || config.adminPassword || generatePassword();
  const generated = !config.adminBootstrapPassword && !config.adminPassword;

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`[seed] super admin already exists: ${email}`);
    if (existing.role !== ROLES.SUPERADMIN) {
      existing.role = ROLES.SUPERADMIN;
      await existing.save();
      console.log("[seed] promoted existing account to superadmin");
    }
  } else {
    await Admin.create({
      email,
      name: config.adminBootstrapName || "Super Administrator",
      passwordHash: hashPassword(password),
      role: ROLES.SUPERADMIN,
      recoveryPhone: null,
      passwordUpdatedAt: new Date(),
    });

    console.log(`[seed] created super admin: ${email}`);
    if (generated) {
      console.log(`[seed] generated password: ${password}`);
      console.log("[seed] store this now — it is not recoverable from the database.");
    }
  }

  // The account used by the SMS password-recovery flow is the primary
  // operator account in single-operator deployments — make sure it can
  // actually administer.
  const recoveryEmail = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (recoveryEmail && recoveryEmail !== email) {
    const recoveryAdmin = await Admin.findOne({ email: recoveryEmail });
    if (recoveryAdmin && recoveryAdmin.role !== ROLES.SUPERADMIN) {
      recoveryAdmin.role = ROLES.SUPERADMIN;
      await recoveryAdmin.save();
      console.log(`[seed] promoted recovery account to superadmin: ${recoveryEmail}`);
    }
  }
}

const DEMO_ADMINS = [
  { email: "analyst@docstools.app", name: "Dana Analyst", role: ROLES.ANALYST },
  { email: "viewer@docstools.app", name: "Vic Viewer", role: ROLES.VIEWER },
  { email: "ops@docstools.app", name: "Ola Operations", role: ROLES.ADMIN },
];

const DEMO_USERS = [
  { name: "Ada Lovelace", email: "ada@example.com", role: "owner", status: "active", plan: "enterprise", company: "Analytical Engines Ltd" },
  { name: "Grace Hopper", email: "grace@example.com", role: "admin", status: "active", plan: "team", company: "Hopper Systems" },
  { name: "Alan Turing", email: "alan@example.com", role: "member", status: "active", plan: "pro", company: "Bletchley Labs" },
  { name: "Katherine Johnson", email: "katherine@example.com", role: "member", status: "invited", plan: "pro", company: "Orbital Research" },
  { name: "Edsger Dijkstra", email: "edsger@example.com", role: "viewer", status: "suspended", plan: "free", company: "The Algorithm House" },
];

async function seedDemoAdmins() {
  const password = process.env.ADMIN_DEMO_PASSWORD || "Docstools#2026";
  for (const demo of DEMO_ADMINS) {
    const existing = await Admin.findOne({ email: demo.email });
    if (existing) continue;
    await Admin.create({
      email: demo.email,
      name: demo.name,
      passwordHash: hashPassword(password),
      role: demo.role,
      passwordUpdatedAt: new Date(),
    });
    console.log(`[seed] created ${demo.role}: ${demo.email}`);
  }
  console.log(`[seed] demo admin password: ${password}`);
}

async function seedDemoUsers() {
  for (const demo of DEMO_USERS) {
    const existing = await AppUser.findOne({ email: demo.email });
    if (existing) continue;
    await AppUser.create({ ...demo, lastSeenAt: demo.status === "active" ? new Date() : null });
    console.log(`[seed] created app user: ${demo.email}`);
  }
}

async function main() {
  await mongoose.connect(config.mongoUri, {
    dbName: config.dbName,
    serverSelectionTimeoutMS: 30000,
  });
  console.log(`[seed] connected to ${config.dbName}`);

  await ensureBootstrapAdmin();

  if (DEMO) {
    await seedDemoAdmins();
    await seedDemoUsers();
  }

  // Remove expired sessions so the seed leaves a clean slate.
  const result = await AdminSession.deleteMany({ expiresAt: { $lt: new Date() } });
  if (result.deletedCount) {
    console.log(`[seed] removed ${result.deletedCount} expired session(s)`);
  }

  console.log("[seed] done");
}

main()
  .catch((error) => {
    console.error("[seed] failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
