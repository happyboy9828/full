# Docstools

Fast, secure browser-based file tools. Nothing is uploaded to a server — every tool reads your file with the File API and writes the result back with a Blob URL. Zero uploads, no sign-up, free.

**Live site:** https://docstools-frontend.vercel.app

## Tools

### Image Tools (7)
| Route | Tool |
|-------|------|
| `/img/FavIcon` | Favicon Generator — favicon.ico, PWA icons and web manifest from one image |
| `/img/ImageResizer` | Image Resizer — exact pixel dimensions or aspect-ratio crop |
| `/img/ImgCompresser` | Compress Image — quality slider, target size limit, batch ZIP download |
| `/img/ImgToBase64` | Image to Base64 — data URL, HTML tag, CSS background or raw Base64 |
| `/img/JpgPngConverter` | JPG ⇄ PNG Converter — two-way conversion, quality control, transparency handling |
| `/img/WebpPngConverter` | WebP ⇄ PNG Converter — two-way conversion, quality control, transparency handling |
| `/img/Watermark` | Watermark — text or image watermarks with visual 9-point alignment grid |

### PDF Tools (6)
| Route | Tool |
|-------|------|
| `/pdf-tools/SplitPDF` | Split PDF — by pages, ranges or bookmarks |
| `/pdf-tools/MergePDFFiles` | Merge PDF — combine, reorder, rotate and merge pages |
| `/pdf-tools/CompressPDF` | Compress PDF — reduce file size maintaining quality |
| `/pdf-tools/PDFtoJPG` | PDF to JPG — high-quality JPG conversion, customizable DPI |
| `/pdf-tools/RotatePDF` | Rotate PDF — 90°, 180° or 270° rotation |
| `/pdf-tools/JPGtoPDF` | JPG to PDF — combine multiple images into one PDF |

### Dev Tools (5)
| Route | Tool |
|-------|------|
| `/dev-tools/CSSMinifier` | CSS Minifier — strip comments, whitespace and redundant code |
| `/dev-tools/HTMLMinifier` | HTML Minifier — remove comments, collapse whitespace, optimise inline CSS/JS |
| `/dev-tools/PasswordGenerator` | Strong Password Generator — secure passwords and passphrases |
| `/dev-tools/QRCodeGenerator` | QR Code Generator — logos, colour gradients, PNG/SVG/EPS export |
| `/dev-tools/QRCodeScanner` | QR Code Scanner — camera or uploaded images with scan history |

### Text Tools (6)
| Route | Tool |
|-------|------|
| `/writing-tool/CaseConverter` | Case Converter — uppercase, lowercase, title case, camelCase, snake_case and more |
| `/writing-tool/LoremIpsum` | Lorem Ipsum Generator — placeholder text for designs |
| `/writing-tool/ParagraphWriter` | Paragraph Writer — AI-powered paragraph generation |
| `/writing-tool/RemoveDuplicateLines` | Remove Duplicate Lines — preserve order, case-sensitive/insensitive modes |
| `/writing-tool/SortText` | Sort Text — alphabetical, numerical, by length, reverse order |
| `/writing-tool/WordCounter` | Word Counter — words, characters, sentences, paragraphs, reading time |

## Privacy

- **Zero uploads** — all processing happens in your browser; files never leave your device
- **No sign-up** — no accounts, no email, no personal data collected
- **No server storage** — results are returned as local Blob URLs only
- **No third-party cookies** or tracking beyond the ad delivery tag

## Using the Tools

1. Visit https://docstools-frontend.vercel.app
2. Open any tool from the homepage or the full toolkit at `/tools`
3. Drag and drop files or use the file picker
4. Configure your options
5. Download the result — everything happens in your browser

## Contributing

Docstools is a private project. All rights reserved.
