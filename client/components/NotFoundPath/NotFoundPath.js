"use client";

import { useEffect, useState } from "react";

export default function NotFoundPath() {
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    // Use window.location.pathname to get the actual browser URL
    // Next.js keeps the original invalid URL in the address bar
    setPathname(window.location.pathname);
  }, []);

  if (!pathname || pathname === "/404") return null;

  return (
    <p className="nf-path">
      <span className="nf-path-label">Requested</span>
      <code className="nf-path-value">{pathname}</code>
    </p>
  );
}