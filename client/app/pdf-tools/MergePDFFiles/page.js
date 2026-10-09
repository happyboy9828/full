'use client';

import React, { useEffect, useRef } from 'react';
import { initMergePdfTool } from '../../../utils/tools';
import './MergePDFFiles.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initMergePdfTool(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}