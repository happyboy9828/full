"use client";

import { useEffect } from "react";
import { useTracking } from "@/lib/tracking";

export default function TrackingProvider({ children }) {
  const { setConsent, getConsent } = useTracking();

  useEffect(() => {
    const consent = getConsent();
    if (consent === null) {
      const handleConsent = (event) => {
        if (event.detail?.consent === true || event.detail?.consent === false) {
          setConsent(event.detail.consent);
          window.removeEventListener("docstools:consent", handleConsent);
        }
      };
      window.addEventListener("docstools:consent", handleConsent);
      return () => window.removeEventListener("docstools:consent", handleConsent);
    }
  }, [getConsent, setConsent]);

  return children;
}