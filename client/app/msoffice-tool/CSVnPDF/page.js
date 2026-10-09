'use client';

import React, { useEffect, useRef } from 'react';
import { initCSVExcelTool } from '../../../utils/tools';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initCSVExcelTool(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}