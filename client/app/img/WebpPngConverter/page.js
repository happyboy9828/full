"use client";

import { useEffect, useRef } from "react";
import { initWebpPngConverter } from "../../../utils/image-tools/WebpPngConverter/index.js";

export default function WebpPngConverterPage() {
  const ref = useRef(null);

  useEffect(() => {
    const unmount = initWebpPngConverter(ref.current);
    return () => unmount?.();
  }, []);

  return <div ref={ref} className="tool-page" />;
}
