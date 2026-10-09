'use client';

import React, { useEffect, useRef } from 'react';
import { initSortTextTool } from '../../../utils/tools';
import '../../../utils/writing-tool/Sort Text/tool.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div id="tool-mount-point"></div>';
      const mountPoint = containerRef.current.querySelector('#tool-mount-point');
      initSortTextTool(mountPoint);
    }
  }, []);

  return <div ref={containerRef}></div>;
}