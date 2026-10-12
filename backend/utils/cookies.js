import config from "../config/env.js";

export function setSessionCookie(res, token) {
  const options = {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: config.adminSessionTtlMs,
    path: "/",
  };
  res.cookie("admin_session", token, options);
  return options;
}

export function clearSessionCookie(res) {
  res.clearCookie("admin_session", {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  });
}
