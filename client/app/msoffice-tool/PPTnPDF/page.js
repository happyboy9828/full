'use client';

import React, { useEffect, useRef } from 'react';
import { renderPptPdfTool } from '../../../utils/tools';
import '../../../utils/msoffice-tool/PPTnPDF/PPTnPDF.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = '<div id="ppt-pdf-app"></div>';
      renderPptPdfTool('ppt-pdf-app');
    }
  }, []);

  return <div ref={containerRef}></div>;
}