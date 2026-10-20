"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

import { useAuth } from "@/components/AuthProvider/AuthProvider";

const DEFAULT_REDIRECT = "/kingdome/dashboard";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Only allow same-origin relative redirects — never bounce to an external host.
  const requested = searchParams.get("redirect");
  const redirect =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : DEFAULT_REDIRECT;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!email.trim()) {
      setError("Enter your administrator email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        setNotice("Signed in. Redirecting…");
        router.push(redirect);
        router.refresh();
        return;
      }
      setError(result.error || "Invalid email or password.");
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="12" fill="var(--tool-accent)" />
                <path d="M14 20L22 28L34 16" stroke="var(--tool-on-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="login-title">Kingdome Dashboard</h1>
            <p className="login-subtitle">Administration &amp; traffic analytics</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {error ? (
              <div className="login-error" role="alert">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="login-notice" role="status">
                {notice}
              </div>
            ) : null}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <div className="login-input-wrapper">
                <Mail size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input form-input--email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@docstools.app"
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="password-input-wrapper">
                <Lock size={16} className="login-input-icon" aria-hidden="true" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="form-input form-input--password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true" />
                  Signing in...
                </>
              ) : (
                <>
                  <ShieldCheck size={16} aria-hidden="true" />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>Secure admin access. Sessions expire automatically and every action is logged.</p>
            <Link href="/" className="login-back-link">
              Back to Docstools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="login-page">
          <div className="login-loading">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
