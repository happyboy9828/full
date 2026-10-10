import React, { useEffect, useRef } from 'react';
import { initHtmlToDocx } from './HTMLnDOC.js';
import './HTMLnDOC.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initHtmlToDocx(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}