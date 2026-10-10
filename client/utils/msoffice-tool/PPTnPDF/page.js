// src/pages/toolPage.js
import { renderPptPdfTool } from './PPTnPDF.js';
import './PPTnPDF.css';

export function initToolPage() {
  const root = document.getElementById('root') || document.body;
  root.innerHTML = '<div id="ppt-pdf-app"></div>';
  renderPptPdfTool('ppt-pdf-app');
}