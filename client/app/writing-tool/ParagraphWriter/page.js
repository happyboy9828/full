'use client';

import React, { useEffect, useRef } from 'react';
import { initParagraphWriter } from '../../../utils/tools';
import '../../../utils/writing-tool/Paragraph Writer/tool.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div id="paragraph-writer-app"></div>';
      setTimeout(() => {
        initParagraphWriter('paragraph-writer-app');
      }, 0);
    }
  }, []);

  return <div ref={containerRef}></div>;
}