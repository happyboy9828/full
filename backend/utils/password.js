import crypto from "crypto";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;

/**
 * Password hashing helpers.
 *
 * Format: `salt:keyHex` where `salt` is 16 random bytes (hex) and `keyHex`
 * is the scrypt derived key. Verification uses a timing-safe comparison so
 * the response time does not leak how much of the hash matched.
 *
 * scrypt is used rather than bcrypt/argon2 because it ships with Node's
 * standard library — no native build step, no extra dependency to audit.
 */

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `${salt}:${key.toString("hex")}`;
}

export function verifyPassword(password, stored) {
  if (typeof password !== "string" || !stored || !stored.includes(":")) return false;
  const [salt, keyHex] = stored.split(":");
  if (!salt || !keyHex) return false;

  let key;
  try {
    key = crypto.scryptSync(password, salt, KEY_LENGTH, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
    });
  } catch {
    return false;
  }

  const expected = Buffer.from(keyHex, "hex");
  const actual = key;
  // timingSafeEqual throws when lengths differ — bail out before that.
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}

/**
 * A throw-away hash used to spend the same amount of CPU on a login attempt
 * for an account that does not exist, so response timing does not reveal
 * whether an email is registered.
 */
let dummyHash = null;
export function dummyVerify() {
  if (!dummyHash) {
    dummyHash = hashPassword("timing-equalisation-placeholder");
  }
  return verifyPassword("timing-equalisation-placeholder", dummyHash);
}

/**
 * Password policy: minimum 8 characters with at least one letter and one
 * number. Returns `null` when the password is acceptable, otherwise a
 * human-readable reason.
 */
export function passwordPolicyError(password) {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (password.length > 200) {
    return "Password must be 200 characters or fewer";
  }
  if (!/[a-zA-Z]/.test(password)) {
    return "Password must contain at least one letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
}
