import ContentPage from "../../components/ContentPage/ContentPage";

export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about DocFix tools, privacy, and usage. All processes run in your browser.",
};

const faqData = [
  {
    category: "Privacy",
    items: [
      {
        q: "Is my file uploaded to your servers?",
        a: "No. Every tool in DocFix runs entirely in your browser using WebAssembly (WASM) and JavaScript. Your files are read into your browser&apos;s memory, processed on your device, and never sent over the network to any server.",
      },
      {
        q: "Is it really free?",
        a: "Yes — 100% free, forever. There are no subscriptions, no credit card required, and no hidden fees. We make no money from your data because we never see it.",
      },
      {
        q: "Do you store or log my files?",
        a: "No. DocFix does not store, log, or process files on any server. File contents exist only in your browser&apos;s memory during processing and are gone once you close the tab.",
      },
      {
        q: "Do you use cookies?",
        a: "We use a single essential cookie to remember your theme preference (light, dark, or system). No tracking cookies, no advertising cookies, no analytics identifiers are stored on your browser.",
      },
    ],
  },
  {
    category: "How It Works",
    items: [
      {
        q: "What is WebAssembly (WASM) and why does it matter?",
        a: "WebAssembly (WASM) is a low-level binary format that runs in your browser at near-native speed. DocFix uses WASM to perform complex file processing — image encoding, PDF manipulation, compression — directly on your device without any server round-trips.",
      },
      {
        q: "Can I use DocFix offline?",
        a: "Once a tool has fully loaded in your browser, most processing works offline without an internet connection. You only need connectivity to initially open the page.",
      },
      {
        q: "Which browsers are supported?",
        a: "DocFix works in all modern browsers: Chrome, Firefox, Safari, Edge, and their mobile equivalents. Some advanced features (like WebP encoding) may be limited in older browser versions.",
      },
    ],
  },
  {
    category: "Usage",
    items: [
      {
        q: "Is there a file size limit?",
        a: "File size limits depend on your device&apos;s available memory (RAM). Most modern browsers handle images up to 8192px on the longest side well. Large batch operations may take a few moments to complete in your browser.",
      },
      {
        q: "How many files can I process at once?",
        a: "Most tools support batch processing of up to 50 files at once. Drag multiple files onto any tool&apos;s drop zone and they will be queued for processing together.",
      },
      {
        q: "Can I download all my results at once?",
        a: "Yes. After batch processing, you can download individual files or use the &quot;Download All (.ZIP)&quot; option to get a single compressed archive of all your results.",
      },
      {
        q: "Do I need to create an account?",
        a: "No account is needed. You can open any tool and start working immediately. There are no sign-ups, no logins, and no personal information required.",
      },
    ],
  },
  {
    category: "Troubleshooting",
    items: [
      {
        q: "Why is my conversion slow?",
        a: "Large images or high batch counts can take time because all processing happens locally in your browser. For best results, try reducing image dimensions before processing or process fewer files per batch.",
      },
      {
        q: "The tool isn&apos;t working. What should I do?",
        a: "Try refreshing the page first. If the issue persists, clear your browser cache and ensure you&apos;re using an up-to-date browser. Still stuck? Email hello@docfix.app with your browser version and a description of the issue.",
      },
      {
        q: "Can I report a bug or suggest a feature?",
        a: "Absolutely. We welcome feedback (and even feature requests for new tools). Use our contact form or email hello@docfix.app — we read every message.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <ContentPage
      title="Frequently Asked Questions"
      description="Quick answers to common questions about DocFix tools and privacy."
      eyebrow="FAQ"
    >
      <div className="prose">
        {faqData.map((section) => (
          <div key={section.category} className="faq-section">
            <h2>{section.category}</h2>
            <ul className="faq-list">
              {section.items.map((item) => (
                <li key={item.q} className="faq-item">
                  <details>
                    <summary className="faq-q">{item.q}</summary>
                    <div className="faq-a">{item.a}</div>
                  </details>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
