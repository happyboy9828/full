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
          window.removeEventListener("docfix:consent", handleConsent);
        }
      };
      window.addEventListener("docfix:consent", handleConsent);
      return () => window.removeEventListener("docfix:consent", handleConsent);
    }
  }, [getConsent, setConsent]);

  return children;
}