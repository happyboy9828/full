// src/pages/toolPage.js
import { initCSVExcelTool } from './CSVnExcel.js';
import './CSVnExcel.css';

export function renderToolPage(containerElement) {
  // Initialize tool inside given DOM node
  initCSVExcelTool(containerElement);
}