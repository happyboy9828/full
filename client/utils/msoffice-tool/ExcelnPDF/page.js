import { useEffect, useRef } from 'react';
import { initExcelPdfConverter } from './EccelnPDF.js';
import './ExcelnPDF.css';

export default function ToolPage() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initExcelPdfConverter(containerRef.current);
    }
  }, []);

  return <div ref={containerRef}></div>;
}