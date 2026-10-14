// 404 handler - redirects to dedicated /404error page
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dedicated 404 error page
    router.replace("/404error");
  }, [router]);

  // Render nothing while redirecting
  return null;
}