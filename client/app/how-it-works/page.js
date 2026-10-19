import ContentPage from "../../components/ContentPage/ContentPage";

export const metadata = {
  title: "How It Works — 100% Browser-Based Processing",
  description:
    "Docstools runs entirely in your browser using WebAssembly (WASM). No uploads, no servers, no data leaves your device.",
};

export default function HowItWorksPage() {
  return (
    <ContentPage
      title="How It Works"
      description="Everything you process stays on your device. Here's the technical flow behind Docstools."
      eyebrow="Technology"
    >
      <div className="prose">
        <h2>The Docstools Processing Flow</h2>
        <p>
          Unlike traditional online file tools, Docstools never sends your files to a server. Here is
          exactly what happens when you use any tool:
        </p>

        <ol className="how-it-works-steps">
          <li>
            <strong>You open a tool</strong> in your browser. The page, the user interface, and the
            processing engine (WebAssembly modules, JavaScript libraries) all download directly to
            your device.
          </li>
          <li>
            <strong>You select a file</strong> using the drag-and-drop area or file picker. The file
            is read into your browser&apos;s memory — it is never transmitted over the network.
          </li>
          <li>
            <strong>Processing happens locally</strong> — your browser&apos;s JavaScript engine and
            WebAssembly runtime perform the actual work (compressing, converting, resizing, etc.)
            using only your device&apos;s CPU and memory.
          </li>
          <li>
            <strong>You download the result</strong> directly to your computer. The processed file
            is generated as a blob in your browser and saved to your device.
          </li>
        </ol>

        <h2>Why WebAssembly (WASM)?</h2>
        <p>
          WebAssembly (WASM) is a low-level binary format that runs in the browser at near-native
          speed. Docstools uses WASM to perform computationally intensive tasks — such as image
          encoding, PDF manipulation, and data compression — directly on your device without any
          server round-trips. Because WASM runs in a sandboxed environment inside your browser, it
          cannot access your file system or any server without your explicit permission.
        </p>

        <h2>Architecture Diagram</h2>
        <pre className="tool-code">
{`┌─────────────┐   ┌──────────────────────┐
│  Your Device  │   │  The Docstools Website  │
│  (Browser)    │   │  (No Backend)        │
│               │   │                      │
│  ┌─────────┐  │   │  ┌───────────────┐   │
│  │ Your    │  │   │  │ WebAssembly   │   │
│  │ File    │──┼──►│  │ (WASM Module) │   │
│  │         │  │   │  │ JS Libraries  │   │
│  ├─────────┤  │   │  └───────────────┘   │
│  │ Process  │◄─┼───┼────────┘           │
│  │ (CPU)    │  │   │                      │
│  ├─────────┤  │   │                      │
│  │ Download │◄─┼───┘                      │
│  │ Result   │  │                            │
│  └─────────┘  │                            │
└─────────────┘   └────────────────────────┘`}
        </pre>

        <h2>Benefits of Browser-Based Processing</h2>
        <ul>
          <li>
            <strong>Privacy:</strong> Your files never leave your device. Not even Docstools can see
            them.
          </li>
          <li>
            <strong>Speed:</strong> No upload or download latency. Results render in milliseconds.
          </li>
          <li>
            <strong>Offline:</strong> Once a tool loads, it works without an internet connection.
          </li>
          <li>
            <strong>Security:</strong> Files are processed in an isolated sandbox. No data to be
            intercepted or breached.
          </li>
        </ul>
      </div>
    </ContentPage>
  );
}
