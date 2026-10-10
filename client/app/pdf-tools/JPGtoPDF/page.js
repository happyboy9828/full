'use client';

import React, { useEffect, useRef } from 'react';
import { initJpgToPdfTool } from '../../../utils/tools';
import './JPGtoPDF.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initJpgToPdfTool(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}