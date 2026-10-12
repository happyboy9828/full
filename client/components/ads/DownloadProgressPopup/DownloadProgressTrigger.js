"use client";

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
  if (current) {
    current(options);
    return;
  }

  if (options.onDownloadStart) {
    try {
      options.onDownloadStart();
    } catch (err) {
      console.error("Download start failed:", err);
    }
  }
}
