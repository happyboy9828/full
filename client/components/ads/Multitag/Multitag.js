// Multitag (All-in-one) - Best to test for total revenue
// Earning model: Depends on the ad formats it serves and the resulting impressions, clicks, and conversions.
// Why choose it: Monetag can optimize ad delivery across supported formats.
// Best use: Test it if you want automated monetization rather than managing each format individually.
// Watch out: It may serve formats that are not strictly impression-only, so check its settings.

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import InPagePush from "../InPagePush/InPagePush";
import VignetteBanner from "../VignetteBanner/VignetteBanner";
import "./Multitag.css";

const DEFAULTS = {
  slot: "multitag",
  label: "Advertisement",
  advertiser: "PixelForge Pro",
  title: "Batch convert images without the upload",
  description: "Run every format in one browser-only queue.",
  cta: "Try it free",
  href: "/",
  // InPagePush config
  inPagePushEnabled: true,
  inPagePushPosition: "bottom-right",
  inPagePushDelayMs: 4000,
  inPagePushAutoHideMs: 14000,
  // Vignette config
  vignetteEnabled: true,
  vignetteDelayMs: 0,
  vignetteAutoHideMs: 8000,
  vignetteMinSessionTimeMs: 30000,
  // Session
  oncePerSession: true,
  sessionKey: "ads:multitag",
};

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
    // Failing to remember only costs one extra impression per reload.
  }
}

export default function Multitag({
  enabled = true,
  // InPagePush props
  inPagePushEnabled = DEFAULTS.inPagePushEnabled,
  inPagePushPosition = DEFAULTS.inPagePushPosition,
  inPagePushDelayMs = DEFAULTS.inPagePushDelayMs,
  inPagePushAutoHideMs = DEFAULTS.inPagePushAutoHideMs,
  // Vignette props
  vignetteEnabled = DEFAULTS.vignetteEnabled,
  vignetteDelayMs = DEFAULTS.vignetteDelayMs,
  vignetteAutoHideMs = DEFAULTS.vignetteAutoHideMs,
  vignetteMinSessionTimeMs = DEFAULTS.vignetteMinSessionTimeMs,
  // Shared
  oncePerSession = DEFAULTS.oncePerSession,
  sessionKey = DEFAULTS.sessionKey,
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
  const [showInPagePush, setShowInPagePush] = useState(false);
  const [showVignette, setShowVignette] = useState(false);
  const impressionRef = useRef(onImpression);
  const dismissRef = useRef(onDismiss);

  useEffect(() => {
    impressionRef.current = onImpression;
    dismissRef.current = onDismiss;
  }, [onImpression, onDismiss]);

  // Track if we've shown any ad this session
  const shownRef = useRef(false);

  // Handle InPagePush impression
  const handleInPagePushImpression = useCallback(() => {
    if (!shownRef.current) {
      shownRef.current = true;
      if (oncePerSession) rememberSession(sessionKey);
      impressionRef.current?.();
    }
  }, [oncePerSession, sessionKey]);

  // Handle Vignette impression
  const handleVignetteImpression = useCallback(() => {
    if (!shownRef.current) {
      shownRef.current = true;
      if (oncePerSession) rememberSession(sessionKey);
      impressionRef.current?.();
    }
  }, [oncePerSession, sessionKey]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    dismissRef.current?.();
  }, []);

  // Check session guard for initial render
  useEffect(() => {
    if (!enabled) return;

    if (oncePerSession && seenThisSession(sessionKey)) {
      shownRef.current = true;
    }
  }, [enabled, oncePerSession, sessionKey]);

  // Render InPagePush if enabled and not shown yet
  const shouldShowInPagePush = enabled && inPagePushEnabled && !shownRef.current;

  // Render Vignette if enabled and not shown yet
  const shouldShowVignette = enabled && vignetteEnabled && !shownRef.current;

  return (
    <div className="ad-multitag" data-slot={slot}>
      {shouldShowInPagePush && (
        <InPagePush
          enabled={true}
          position={inPagePushPosition}
          delayMs={inPagePushDelayMs}
          autoHideMs={inPagePushAutoHideMs}
          oncePerSession={false} // Handled by parent
          sessionKey={sessionKey}
          slot={`${slot}-inpage`}
          label={label}
          advertiser={advertiser}
          title={title}
          description={description}
          cta={cta}
          href={href}
          creative={creative}
          onImpression={handleInPagePushImpression}
          onDismiss={handleDismiss}
        />
      )}

      {shouldShowVignette && (
        <VignetteBanner
          enabled={true}
          delayMs={vignetteDelayMs}
          autoHideMs={vignetteAutoHideMs}
          oncePerSession={false} // Handled by parent
          sessionKey={sessionKey}
          minSessionTimeMs={vignetteMinSessionTimeMs}
          slot={`${slot}-vignette`}
          label={label}
          advertiser={advertiser}
          title={title}
          description={description}
          cta={cta}
          href={href}
          creative={creative}
          onImpression={handleVignetteImpression}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}