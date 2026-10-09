// Download Progress Popup - Shows countdown then progress bar when user clicks download
// Appears as a modal overlay with countdown (5s) then animated progress bar
// Auto-dismisses when progress reaches 100%

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useOverlaySlot } from "../overlay";
import { subscribeDownloadProgress } from "./DownloadProgressTrigger";
import "./DownloadProgressPopup.css";

const DEFAULTS = {
  slot: "download-progress",
  label: "Downloading",
  title: "Preparing your download",
  description: "Your file is being processed and will start shortly.",
  autoCloseMs: 1000,
  countdownMs: 5000, // 5 second countdown before download starts
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function DownloadProgressPopup({
  // Trigger control
  isOpen = false,
  onClose = null,
  onComplete = null,
  // Progress simulation
  durationMs = 3000, // Total time to reach 100% after countdown
  // Content
  slot = DEFAULTS.slot,
  label = DEFAULTS.label,
  title = DEFAULTS.title,
  description = DEFAULTS.description,
  // Behavior
  autoCloseMs = DEFAULTS.autoCloseMs,
  countdownMs = DEFAULTS.countdownMs,
  dismissible = false, // Can't dismiss during download
  // Callback to execute actual download after countdown
  onDownloadStart = null,
}) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("countdown"); // countdown, preparing, downloading, completing
  const [countdown, setCountdown] = useState(Math.ceil(countdownMs / 1000));
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const restoreRef = useRef(null);
  const animationRef = useRef(null);
  const countdownRef = useRef(null);
  const startTimeRef = useRef(null);
  const downloadStartedRef = useRef(false);
  const blocked = useOverlaySlot(`download:${slot}`, isOpen);

  const close = useCallback(() => {
    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
    }
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
    }
    onClose?.();
  }, [onClose]);

  const complete = useCallback(() => {
    setProgress(100);
    setPhase("completing");
    onComplete?.();

    // Auto-close after delay
    const timer = window.setTimeout(() => {
      close();
    }, autoCloseMs);

    return () => window.clearTimeout(timer);
  }, [autoCloseMs, close]);

  // Countdown phase
  useEffect(() => {
    if (!isOpen || blocked || phase !== "countdown") return;

    setCountdown(Math.ceil(countdownMs / 1000));
    downloadStartedRef.current = false;

    countdownRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          window.clearInterval(countdownRef.current);
          countdownRef.current = null;
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
      }
    };
  }, [isOpen, blocked, countdownMs, phase]);

  // Transition from countdown to progress animation
  useEffect(() => {
    if (phase !== "countdown" || countdown > 0) return;

    // Start the actual download when countdown reaches 0
    if (!downloadStartedRef.current && onDownloadStart) {
      downloadStartedRef.current = true;
      onDownloadStart();
    }

    // Move to progress animation phase
    setPhase("preparing");
    setProgress(0);
    startTimeRef.current = Date.now();
  }, [phase, countdown, onDownloadStart]);

  // Animate progress from 0 to 100 (after countdown)
  useEffect(() => {
    if (!isOpen || blocked || phase === "countdown") return;

    const animate = () => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      const rawProgress = clamp((elapsed / durationMs) * 100, 0, 100);

      setProgress(rawProgress);

      if (rawProgress < 30) {
        setPhase("preparing");
      } else if (rawProgress < 95) {
        setPhase("downloading");
      } else {
        setPhase("completing");
      }

      if (rawProgress < 100) {
        animationRef.current = window.requestAnimationFrame(animate);
      } else {
        complete();
      }
    };

    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        window.cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isOpen, blocked, durationMs, complete, phase]);

  // Modal behaviour while open: scroll lock, Escape (if dismissible), focus trap, focus restore.
  useEffect(() => {
    if (!isOpen || blocked) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;

    restoreRef.current = document.activeElement;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    closeRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape" && dismissible) {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      restoreRef.current?.focus?.();
    };
  }, [isOpen, blocked, close, dismissible]);

  if (!isOpen || blocked) return null;

  const phaseLabels = {
    countdown: `Download starts in {countdown}s...`,
    preparing: "Preparing download...",
    downloading: "Downloading...",
    completing: "Finalizing...",
  };

  const isCountdownPhase = phase === "countdown";
  const displayPhase = isCountdownPhase ? "countdown" : phase;

  return (
    <div
      className="ad-download-progress"
      onClick={(event) => event.target === event.currentTarget && dismissible && close()}
    >
      <div
        className="ad-download-progress-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-slot={slot}
        ref={dialogRef}
      >
        <div className="ad-download-progress-header">
          <span className="ad-download-progress-label">{label}</span>
          {dismissible && (
            <button
              type="button"
              className="ad-download-progress-close"
              onClick={close}
              aria-label="Close download progress"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        <div className="ad-download-progress-body">
          <div className="ad-download-progress-spinner" aria-hidden="true" />
          <h2 className="ad-download-progress-title">{title}</h2>
          <p className="ad-download-progress-desc">{description}</p>
          {isCountdownPhase && (
            <div className="ad-download-progress-countdown" aria-live="polite">
              {countdown}
            </div>
          )}
          <p className="ad-download-progress-phase">
            {isCountdownPhase 
              ? "Download starts in..." 
              : phaseLabels[displayPhase]
            }
          </p>

          <div className="ad-download-progress-bar-container" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="Download progress">
            <div
              className="ad-download-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="ad-download-progress-percent" aria-hidden="true">
            {isCountdownPhase ? `${countdown}s` : `${Math.round(progress)}%`}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for triggering download progress with countdown from any component
export function useDownloadProgress() {
  const [isOpen, setIsOpen] = useState(false);
  const onCompleteRef = useRef(null);
  const onCloseRef = useRef(null);
  const onDownloadStartRef = useRef(null);

  const trigger = useCallback((options = {}) => {
    const { onComplete, onClose, onDownloadStart, ...rest } = options;
    onCompleteRef.current = onComplete;
    onCloseRef.current = onClose;
    onDownloadStartRef.current = onDownloadStart;
    setIsOpen(true);
  }, []);

  const handleComplete = useCallback(() => {
    onCompleteRef.current?.();
    onCompleteRef.current = null;
  }, []);

  const handleClose = useCallback(() => {
    onCloseRef.current?.();
    onCloseRef.current = null;
    onDownloadStartRef.current = null;
    setIsOpen(false);
  }, []);

  const handleDownloadStart = useCallback(() => {
    onDownloadStartRef.current?.();
    onDownloadStartRef.current = null;
  }, []);

  // Register this instance as the active download trigger so non-React tool
  // init functions (which run outside a component tree) can reach it without
  // violating the Rules of Hooks.
  useEffect(() => {
    return subscribeDownloadProgress(trigger);
  }, [trigger]);

  return {
    isOpen,
    trigger,
    handleComplete,
    handleClose,
    handleDownloadStart,
    DownloadProgressPopup: (props) => (
      <DownloadProgressPopup
        {...props}
        isOpen={isOpen}
        onClose={handleClose}
        onComplete={handleComplete}
        onDownloadStart={handleDownloadStart}
      />
    ),
  };
}