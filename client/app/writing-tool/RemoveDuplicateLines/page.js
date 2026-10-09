'use client';

import React, { useEffect, useRef } from 'react';
import { initDuplicateRemover } from '../../../utils/tools';
import '../../../utils/writing-tool/Remove Duplicate Lines/tool.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div id="tool-mount-point"></div>';
      const mountPoint = containerRef.current.querySelector('#tool-mount-point');
      initDuplicateRemover(mountPoint);
    }
  }, []);

  return <div ref={containerRef}></div>;
}