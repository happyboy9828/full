'use client';

import React, { useEffect, useRef } from 'react';
import { initTxtWordConverter } from '../../../utils/tools';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initTxtWordConverter(containerRef.current);
    }
  }, []);

  return (
    <div className="page-container" style={{ padding: '20px' }}>
      <div ref={containerRef}></div>
    </div>
  );
}