import ContentPage from "../../components/ContentPage/ContentPage";

export const metadata = {
  title: "Documentation",
  description: "Technical documentation and guides for Docstools tools.",
};

export default function DocsPage() {
  return (
    <ContentPage
      title="Documentation"
      description="Learn how to use Docstools tools effectively."
      eyebrow="Docs"
    >
      <div className="prose">
        <h2>Getting Started</h2>
        <p>
          Docstools is a suite of browser-based file tools. No installation required — just open a tool
          and start working. Everything runs locally in your browser using WebAssembly.
        </p>

        <h2>Tools Overview</h2>
        <ul>
          <li>
            <strong>Image Tools:</strong> Compress, resize, convert (JPG ⇄ PNG, WebP ⇄ PNG), remove
            backgrounds, add watermarks, generate favicons, and convert to Base64.
          </li>
          <li>
            <strong>PDF Tools:</strong> Split, merge, compress, rotate, and convert PDFs — all in
            your browser.
          </li>
          <li>
            <strong>Dev Tools:</strong> Minify CSS/HTML, generate passwords, create and scan QR
            codes.
          </li>
          <li>
            <strong>Text Tools:</strong> Case conversion, Lorem Ipsum generation, paragraph
            writing, line sorting, duplicate removal, and word counting.
          </li>
        </ul>

        <h2>Common Workflows</h2>
        <h3>Batch Processing</h3>
        <p>
          Drag multiple files onto any tool&apos;s drop zone. Most tools support up to 50 files at
          once and offer a &quot;Download All (.ZIP)&quot; option.
        </p>

        <h3>Download Options</h3>
        <p>
          Download individual files or use &quot;Download All (.ZIP)&quot; to get a single archive.
        </p>

        <h3>Privacy First</h3>
        <p>
          All processing happens locally in your browser. No uploads, no accounts required. See our{" "}
          <a href="/privacy">Privacy Policy</a> and{" "}
          <a href="/how-it-works">How It Works</a> for details.
        </p>
      </div>
    </ContentPage>
  );
}
