// Download Progress Popup - Minimal blank box
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useOverlaySlot } from "../overlay";
import { subscribeDownloadProgress } from "./DownloadProgressTrigger";
import "./DownloadProgressPopup.css";

const DEFAULTS = {
  slot: "download-progress",
  autoCloseMs: 1000,
  countdownMs: 5000,
};

export default function DownloadProgressPopup({
  isOpen = false,
  onClose = null,
  onComplete = null,
  durationMs = 3000,
  slot = DEFAULTS.slot,
  autoCloseMs = DEFAULTS.autoCloseMs,
  countdownMs = DEFAULTS.countdownMs,
  dismissible = false,
  onDownloadStart = null,
}) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const restoreRef = useRef(null);
  const countdownRef = useRef(null);
  const progressRef = useRef(null);
  const downloadStartedRef = useRef(false);
  const startTimeRef = useRef(null);
  const blocked = useOverlaySlot(`download:${slot}`, isOpen);

  const [countdownProgress, setCountdownProgress] = useState(100);
  const [timeRemaining, setTimeRemaining] = useState(Math.ceil(5000 / 1000));

  const close = useCallback(() => {
    if (countdownRef.current) {
      window.clearInterval(countdownRef.current);
    }
    onClose?.();
  }, [onClose]);

  const complete = useCallback(() => {
    onComplete?.();
    const timer = window.setTimeout(() => {
      close();
    }, autoCloseMs);
    return () => window.clearTimeout(timer);
  }, [autoCloseMs, close, onComplete]);

  // Countdown phase with progress bar
  useEffect(() => {
    if (!isOpen || blocked) return;

    setCountdownProgress(100);
    setTimeRemaining(Math.ceil(countdownMs / 1000));
    startTimeRef.current = Date.now();

    progressRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remainingPct = Math.max(0, 100 - (elapsed / countdownMs) * 100);
      setCountdownProgress(remainingPct);
      setTimeRemaining(Math.max(0, Math.ceil((countdownMs - elapsed) / 1000)));
    }, 50);

    countdownRef.current = window.setInterval(() => {
      // Countdown tick for any other logic
    }, 1000);

    return () => {
      if (progressRef.current) {
        window.clearInterval(progressRef.current);
      }
      if (countdownRef.current) {
        window.clearInterval(countdownRef.current);
      }
    };
  }, [isOpen, blocked, countdownMs]);

  // When countdown completes, fire download and close
  useEffect(() => {
    if (!isOpen || blocked) return;

    const timer = window.setTimeout(() => {
      if (!downloadStartedRef.current && onDownloadStart) {
        downloadStartedRef.current = true;
        try {
          onDownloadStart();
        } catch (err) {
          console.error("Download start failed:", err);
        }
      }
      complete();
    }, countdownMs);

    return () => window.clearTimeout(timer);
  }, [isOpen, blocked, countdownMs, onDownloadStart, complete]);

  // Modal behaviour
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

  return (
    <div
      className="ad-download-progress"
      onClick={(event) => event.target === event.currentTarget && dismissible && close()}
    >
      <div
        className="ad-download-progress-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Download"
        data-slot={slot}
        ref={dialogRef}
      >
        <div className="ad-download-progress-header">
          <div className="ad-download-progress-notification" aria-live="polite">
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false" width="16" height="16">
              <path d="M8 1L1 15h14L8 1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 5v4M8 11v0.01" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Download starting...</span>
          </div>
          <button
            type="button"
            className="ad-download-progress-close"
            onClick={close}
            ref={closeRef}
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="ad-download-progress-body">
          <div className="ad-download-progress-ad-box">
            <p className="ad-download-progress-ad-text">LIMITED OFFER</p>
            <p className="ad-download-progress-ad-subtext">Get 50% Off Premium — Upgrade today!</p>
          </div>
          <div className="ad-download-progress-countdown-bar-container" aria-label="Countdown timer">
            <div
              className="ad-download-progress-countdown-bar"
              style={{ width: `${countdownProgress}%` }}
            />
          </div>
          <div className="ad-download-progress-time-remaining" aria-live="polite">
            {timeRemaining}s remaining
          </div>
        </div>
      </div>
    </div>
  );
}

export function useDownloadProgress() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});
  const onCompleteRef = useRef(null);
  const onCloseRef = useRef(null);
  const onDownloadStartRef = useRef(null);

  const trigger = useCallback((options = {}) => {
    const { onComplete, onClose, onDownloadStart, ...rest } = options;
    onCompleteRef.current = onComplete;
    onCloseRef.current = onClose;
    onDownloadStartRef.current = onDownloadStart;
    setConfig(rest);
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
        {...config}
        {...props}
        isOpen={isOpen}
        onClose={handleClose}
        onComplete={handleComplete}
        onDownloadStart={handleDownloadStart}
      />
    ),
  };
}