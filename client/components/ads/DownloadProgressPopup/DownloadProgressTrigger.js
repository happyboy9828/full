"use client";

import { canDownload, recordDownload, getDownloadStats } from "@/utils/shared/downloadLimit";

// Non-React trigger registry for the global DownloadProgressPopup.
//
// Tool init functions (initDuplicateRemover, initSortTextTool, initWebpPngConverter,
// etc.) and plain imperative download handlers run outside any React component
// tree, so they cannot call the useDownloadProgress hook directly - doing so
// throws "Invalid hook call".
//
// Instead they call triggerDownloadProgress(), which forwards to the currently
// mounted global popup instance (mounted via GlobalDownloadProgress in the root
// layout). The popup registers its trigger on mount and unregisters on unmount
// via the useDownloadProgress hook. If no popup is mounted (e.g. before
// hydration), the download starts immediately so the button never does nothing.

let current = null;

export function subscribeDownloadProgress(trigger) {
  current = trigger;
  return () => {
    if (current === trigger) current = null;
  };
}

export function triggerDownloadProgress(options = {}) {
  // Check download limit before proceeding
  if (!canDownload()) {
    const stats = getDownloadStats();
    const resetTime = new Date(stats.resetsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    alert(`Daily download limit reached (${stats.limit}/day). Limit resets at ${resetTime} UTC.`);
    return;
  }

  if (current) {
    current({
      ...options,
      onDownloadStart: () => {
        recordDownload();
        if (options.onDownloadStart) options.onDownloadStart();
      }
    });
    return;
  }

  if (options.onDownloadStart) {
    try {
      recordDownload();
      options.onDownloadStart();
    } catch (err) {
      console.error("Download start failed:", err);
    }
  }
}
