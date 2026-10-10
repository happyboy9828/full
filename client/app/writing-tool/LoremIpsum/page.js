'use client';

import React, { useEffect, useRef } from 'react';
import { initLoremIpsumGenerator } from '../../../utils/tools';
import '../../../utils/writing-tool/Lorem Ipsum Generator/tool.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div id="lorem-ipsum-app"></div>';
      setTimeout(() => {
        initLoremIpsumGenerator('lorem-ipsum-app');
      }, 0);
    }
  }, []);

  return <div ref={containerRef}></div>;
}