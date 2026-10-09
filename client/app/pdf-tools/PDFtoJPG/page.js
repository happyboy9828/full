'use client';

import React, { useEffect, useRef } from 'react';
import { initPdfToJpgTool } from '../../../utils/tools';
import './PDFtoJPG.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initPdfToJpgTool(containerRef.current);
    }
  }, []);

  return <div ref={containerRef} />;
}