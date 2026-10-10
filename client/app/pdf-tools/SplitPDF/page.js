'use client';

import React, { useEffect, useRef } from 'react';
import { initSplitPdfTool } from '../../../utils/tools';
import './SplitPDF.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initSplitPdfTool(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}