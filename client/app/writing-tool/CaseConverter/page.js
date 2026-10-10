'use client';

import React, { useEffect, useRef } from 'react';
import { renderCaseConverter } from '../../../utils/tools';
import '../../../utils/writing-tool/Case Converter/tool.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      renderCaseConverter(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}