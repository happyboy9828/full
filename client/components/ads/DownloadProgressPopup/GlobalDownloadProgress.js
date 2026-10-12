"use client";

import { useDownloadProgress } from "./DownloadProgressPopup";

// Mounts the site-wide download notification popup. Any tool or page that
// calls triggerDownloadProgress() (from DownloadProgressTrigger) gets the
// countdown + progress dialog here, no matter where the download button lives.
export default function GlobalDownloadProgress() {
  const { DownloadProgressPopup } = useDownloadProgress();
  return <DownloadProgressPopup />;
}
