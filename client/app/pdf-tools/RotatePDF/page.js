'use client';

import React, { useEffect, useRef } from 'react';
import { initRotatePdfTool } from '../../../utils/tools';
import './RotatePDF.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initRotatePdfTool(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}