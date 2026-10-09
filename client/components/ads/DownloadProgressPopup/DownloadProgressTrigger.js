"use client";

// Non-React trigger registry for the global DownloadProgressPopup.
//
// Tool init functions (initDuplicateRemover, initSortTextTool, mountWebpToPng,
// etc.) run outside any React component tree, so they cannot call the
// useDownloadProgress hook directly - doing so throws "Invalid hook call".
//
// Instead they call triggerDownloadProgress(), which forwards to the currently
// mounted popup instance. The popup registers its trigger on mount and
// unregisters on unmount via the useDownloadProgress hook.

let current = null;

export function subscribeDownloadProgress(trigger) {
  current = trigger;
  return () => {
    if (current === trigger) current = null;
  };
}

export function triggerDownloadProgress(options = {}) {
  if (options.onDownloadStart) {
    try {
      options.onDownloadStart();
    } catch (err) {
      console.error("Download start failed:", err);
    }
  }
  return null;
}