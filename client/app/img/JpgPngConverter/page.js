"use client";

import { useEffect, useRef } from "react";
import { initJpgPngConverter } from "../../../utils/image-tools/JpgPngConverter/index.js";

export default function JpgPngConverterPage() {
  const ref = useRef(null);

  useEffect(() => {
    const unmount = initJpgPngConverter(ref.current);
    return () => unmount?.();
  }, []);

  return <div ref={ref} className="tool-page" />;
}