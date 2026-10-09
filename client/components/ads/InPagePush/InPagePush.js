// In-Page Push (Banner) - Best overall fit
// Earning model: Primarily impression-based, depending on campaign and traffic.
// Why choose it: Ads appear inside your website without requiring visitors to click.
// Best placement: Between content sections or below the document tool.
// User experience: Generally less disruptive than popunders.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./InPagePush.css";

const DEFAULTS = {
  slot: "in-page-push",
  label: "Advertisement",
  advertiser: "PixelForge Pro",
  title: "Batch convert images without the upload",
  description: "Run every format in one browser-only queue.",
  cta: "Try it free",
  href: "/",
  position: "bottom-right",
  delayMs: 4000,
  autoHideMs: 14000,
  sessionKey: "ads:in-page-push",
};

const POSITIONS = new Set(["bottom-right", "bottom-left", "top-right", "top-left"]);

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

export default function InPagePush({
  enabled = true,
  delayMs = DEFAULTS.delayMs,
  position = DEFAULTS.position,
  autoHideMs = DEFAULTS.autoHideMs,
  dismissible = true,
  pauseOnHover = true,
  oncePerSession = true,
  sessionKey = DEFAULTS.sessionKey,
  slot = DEFAULTS.slot,
  label = DEFAULTS.label,
  advertiser = DEFAULTS.advertiser,
  title = DEFAULTS.title,
  description = DEFAULTS.description,
  cta = DEFAULTS.cta,
  href = DEFAULTS.href,
  onImpression = null,
  onDismiss = null,
}) {
  const [visible, setVisible] = useState(false);
  const [left, setLeft] = useState(autoHideMs);
  const [paused, setPaused] = useState(false);
  const leftRef = useRef(autoHideMs);
  const unitRef = useRef(null);
  const shownRef = useRef(false);
  const impressionRef = useRef(onImpression);

  useEffect(() => {
    impressionRef.current = onImpression;
  }, [onImpression]);

  const place = POSITIONS.has(position) ? position : DEFAULTS.position;

  const dismiss = useCallback(() => {
    setVisible(false);
    onDismiss?.();
  }, [onDismiss]);

  // Delay first, then the session guard: the timer is cheap and the guard is the
  // only thing that decides whether the unit is ever shown.
  useEffect(() => {
    if (!enabled) return;

    if (oncePerSession && seenThisSession(sessionKey)) {
      shownRef.current = true;
      return;
    }

    const timer = window.setTimeout(() => {
      if (shownRef.current) return;
      shownRef.current = true;
      rememberSession(sessionKey);
      leftRef.current = Math.max(0, autoHideMs);
      setLeft(leftRef.current);
      setVisible(true);
      impressionRef.current?.();
    }, Math.max(0, delayMs));

    return () => window.clearTimeout(timer);
  }, [enabled, delayMs, oncePerSession, sessionKey, autoHideMs]);

  // Auto-hide. The remaining time is kept in a ref so hover and focus can pause
  // the countdown and resume it from where it stopped.
  useEffect(() => {
    if (!visible || !autoHideMs || (pauseOnHover && paused)) return;

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
  }, [visible, autoHideMs, paused, pauseOnHover, dismiss]);

  if (!visible) return null;

  const ratio = autoHideMs > 0 ? left / autoHideMs : 0;

  return (
    <aside
      className={`ad-inpage is-${place}`}
      aria-label={label}
      data-slot={slot}
      ref={unitRef}
      onPointerEnter={() => pauseOnHover && setPaused(true)}
      onPointerLeave={() => pauseOnHover && setPaused(false)}
      onFocusCapture={() => pauseOnHover && setPaused(true)}
      onBlurCapture={() => pauseOnHover && setPaused(false)}
    >
      <span className="ad-inpage-mark" aria-hidden="true">
        {initials(advertiser)}
      </span>

      <div className="ad-inpage-body">
        <p className="ad-inpage-meta">
          <span className="ad-inpage-label">Ad</span>
          <span className="ad-inpage-advertiser">{advertiser}</span>
        </p>
        <a
          className="ad-inpage-title"
          href={href}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          onClick={dismiss}
        >
          {title}
        </a>
        <p className="ad-inpage-desc">{description}</p>
      </div>

      <div className="ad-inpage-actions">
        <a
          className="ad-inpage-cta"
          href={href}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          onClick={dismiss}
        >
          {cta}
        </a>
        {dismissible ? (
          <button
            type="button"
            className="ad-inpage-close"
            onClick={dismiss}
            aria-label="Dismiss advertisement"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path
                d="M4 4l8 8M12 4l-8 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {autoHideMs > 0 ? (
        <span className="ad-inpage-timer" aria-hidden="true">
          <span className="ad-inpage-timer-bar" style={{ width: `${ratio * 100}%` }} />
        </span>
      ) : null}
    </aside>
  );
}