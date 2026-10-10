'use client';

import React, { useEffect, useRef } from 'react';
import { initWordPdfConverter } from '../../../utils/tools';
import '../../../utils/msoffice-tool/WordnPDF/WordtoPDFnPDFtoWord.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initWordPdfConverter(containerRef.current);
    }
  }, []);

  return <div ref={containerRef} />;
}