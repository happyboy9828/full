'use client';

import React, { useEffect, useRef } from 'react';
import { initExcelPdfConverter } from '../../../utils/tools';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initExcelPdfConverter(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}