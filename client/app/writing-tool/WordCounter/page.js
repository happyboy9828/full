'use client';

import React, { useEffect, useRef } from 'react';
import { initWordCounter } from '../../../utils/tools';
import '../../../utils/writing-tool/WordCounter/tool.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div id="word-counter-root"></div>';
      const rootEl = containerRef.current.querySelector('#word-counter-root');
      initWordCounter(rootEl);
    }
  }, []);

  return <div ref={containerRef}></div>;
}