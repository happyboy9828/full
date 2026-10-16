"use client";

import TrackingProvider from "../TrackingProvider/TrackingProvider";
import { AuthProvider } from "../AuthProvider/AuthProvider";

export default function ClientProviders({ children }) {
  return (
    <AuthProvider>
      <TrackingProvider>{children}</TrackingProvider>
    </AuthProvider>
  );
}