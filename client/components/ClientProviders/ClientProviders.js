"use client";

import TrackingProvider from "../TrackingProvider/TrackingProvider";

export default function ClientProviders({ children }) {
  return <TrackingProvider>{children}</TrackingProvider>;
}