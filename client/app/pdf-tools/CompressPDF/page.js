'use client';

import React, { useEffect, useRef } from 'react';
import { initCompressPDF } from '../../../utils/tools';
import './CompressPDF.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initCompressPDF(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}