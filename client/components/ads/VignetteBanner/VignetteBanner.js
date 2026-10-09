// Vignette Banner - Fullscreen ad between page transitions
// Earning model: Can generate impression revenue; actual payment depends on ad delivery and campaign.
// Why choose it: A prominent ad can receive more visibility than a small banner.
// Best placement: Between page transitions or at natural pauses in the user journey.
// Watch out: Avoid interrupting users while they are uploading or downloading a document.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "./VignetteBanner.css";

const DEFAULTS = {
  slot: "vignette",
  label: "Advertisement",
  advertiser: "PixelForge Pro",
  title: "Batch convert images without the upload",
  description: "Run every format in one browser-only queue.",
  cta: "Try it free",
  href: "/",
  delayMs: 0,
  autoHideMs: 8000,
  sessionKey: "ads:vignette",
  minSessionTimeMs: 30000,
};

function initials(name) {
  return name.trim().slice(0, 2).toUpperCase();
}

function seenThisSession(key) {
  try {
    return window.sessionStorage.getItem(key) !== null;
  } catch {
    return false;
  }
}

function rememberSession(key) {
  try {
    window.sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // Failing to remember only costs one extra banner per reload.
  }
}

function getSessionStartTime() {
  try {
    const stored = window.sessionStorage.getItem("ads:session:start");
    return stored ? parseInt(stored, 10) : null;
  } catch {
    return null;
  }
}

function setSessionStartTime() {
  try {
    if (!window.sessionStorage.getItem("ads:session:start")) {
      window.sessionStorage.setItem("ads:session:start", String(Date.now()));
    }
  } catch {
    // Ignore
  }
}

export default function VignetteBanner({
  enabled = true,
  delayMs = DEFAULTS.delayMs,
  autoHideMs = DEFAULTS.autoHideMs,
  dismissible = true,
  oncePerSession = true,
  sessionKey = DEFAULTS.sessionKey,
  minSessionTimeMs = DEFAULTS.minSessionTimeMs,
  slot = DEFAULTS.slot,
  label = DEFAULTS.label,
  advertiser = DEFAULTS.advertiser,
  title = DEFAULTS.title,
  description = DEFAULTS.description,
  cta = DEFAULTS.cta,
  href = DEFAULTS.href,
  creative = null,
  onImpression = null,
  onDismiss = null,
}) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [left, setLeft] = useState(autoHideMs);
  const leftRef = useRef(autoHideMs);
  const shownRef = useRef(false);
  const impressionRef = useRef(onImpression);
  const previousPathRef = useRef(pathname);
  const sessionStartRef = useRef(getSessionStartTime());

  useEffect(() => {
    impressionRef.current = onImpression;
  }, [onImpression]);

  // Initialize session start time
  useEffect(() => {
    if (!sessionStartRef.current) {
      setSessionStartTime();
      sessionStartRef.current = getSessionStartTime();
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  // Show vignette on route change (page transition)
  useEffect(() => {
    if (!enabled) return;

    const currentPath = pathname;
    const isNavigation = previousPathRef.current !== currentPath && previousPathRef.current !== null;
    previousPathRef.current = currentPath;

    if (!isNavigation) return;

    // Check minimum session time before showing
    const sessionStart = sessionStartRef.current;
    if (sessionStart && Date.now() - sessionStart < minSessionTimeMs) {
      return;
    }

    if (oncePerSession && seenThisSession(sessionKey)) {
      shownRef.current = true;
      return;
    }

    const showVignette = () => {
      if (shownRef.current) return;
      shownRef.current = true;
      rememberSession(sessionKey);
      leftRef.current = Math.max(0, autoHideMs);
      setLeft(leftRef.current);
      setVisible(true);
      impressionRef.current?.();
    };

    if (delayMs > 0) {
      const timer = window.setTimeout(showVignette, Math.max(0, delayMs));
      return () => window.clearTimeout(timer);
    } else {
      showVignette();
    }
  }, [enabled, pathname, delayMs, oncePerSession, sessionKey, autoHideMs, minSessionTimeMs]);

  // Auto-hide timer
  useEffect(() => {
    if (!visible || !autoHideMs) return;

    const started = Date.now() - (autoHideMs - leftRef.current);
    const timer = window.setInterval(() => {
      leftRef.current = Math.max(0, autoHideMs - (Date.now() - started));
      setLeft(leftRef.current);
      if (leftRef.current === 0) {
        window.clearInterval(timer);
        dismiss();
      }
    }, 200);

    return () => window.clearInterval(timer);
  }, [visible, autoHideMs, dismiss]);

  if (!visible) return null;

  const ratio = autoHideMs > 0 ? left / autoHideMs : 0;

  return (
    <div
      className="ad-vignette"
      aria-label={label}
      data-slot={slot}
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div className="ad-vignette-overlay" />
      <div className="ad-vignette-dialog" role="dialog" aria-modal="true" aria-label={label}>
        <div className="ad-vignette-header">
          <span className="ad-vignette-label">Advertisement</span>
          {dismissible && (
            <button
              type="button"
              className="ad-vignette-close"
              onClick={dismiss}
              aria-label="Close advertisement"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="ad-vignette-creative">
          {creative ?? <span className="ad-vignette-mark">{initials(advertiser)}</span>}
        </div>

        <div className="ad-vignette-body">
          <p className="ad-vignette-advertiser">{advertiser}</p>
          <h2 className="ad-vignette-title">{title}</h2>
          <p className="ad-vignette-desc">{description}</p>
        </div>

        <div className="ad-vignette-actions">
          <a
            className="ad-vignette-cta"
            href={href}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            onClick={dismiss}
          >
            {cta}
          </a>
        </div>

        {autoHideMs > 0 ? (
          <div className="ad-vignette-timer" aria-hidden="true">
            <div className="ad-vignette-timer-bar" style={{ width: `${ratio * 100}%` }} />
          </div>
        ) : null}
      </div>
    </div>
  );
}