import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Navbar from "./../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { getPages } from "../lib/pages";
import Multitag from "../components/ads/Multitag/Multitag";
import ClientProviders from "../components/ClientProviders/ClientProviders";
import "./globals.css";
import "./tool.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata = {
  title: {
    default: "DocFix",
    template: "%s · DocFix",
  },
  description: "A collection of small browser-only image tools.",
  icons: {
    icon: "/logo.svg",
  },
};

// Ad configuration using new formats:
// 1. In-Page Push (Banner) - appears between content sections
// 2. Vignette Banner - fullscreen between page transitions
// 3. Multitag (All-in-one) - manages both formats with session capping
export default function RootLayout({ children }) {
  const pages = getPages();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Word (.docx) Libraries */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/html-docx-js@0.3.1/dist/html-docx.min.js"
          strategy="lazyOnload"
        />

        {/* Excel (.xlsx, .csv) Library */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"
          strategy="lazyOnload"
        />

        {/* PowerPoint (.pptx) Library */}
        <Script
          src="https://cdn.jsdelivr.net/gh/gitbrent/pptxgenjs@3.12.0/dist/pptxgen.bundle.js"
          strategy="lazyOnload"
        />

        {/* PDF Generation & Rendering Libraries */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"
          strategy="lazyOnload"
        />
        <Script
          id="pdfjs-worker-config"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.pdfjsLib) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
                  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              }
            `,
          }}
        />

        {/* Utilities */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
          strategy="lazyOnload"
        />
      </head>
      <body className="flex min-h-full flex-col">
        <ClientProviders>
          <Navbar pages={pages} />

          <div className="mx-auto w-full max-w-[var(--tool-width)] flex-1 px-6 xl:max-w-[1400px]">
            <main className="flex min-w-0 flex-col">{children}</main>
          </div>

          <Footer />

          {/* Multitag manages InPagePush (corner banner) and Vignette (page transition) */}
          <Multitag
            slot="multitag"
            label="Advertisement"
            advertiser="PixelForge Pro"
            title="Batch convert images without the upload"
            description="Run every format in one browser-only queue."
            cta="Try it free"
            href="/"
            // InPagePush config
            inPagePushEnabled={true}
            inPagePushPosition="bottom-right"
            inPagePushDelayMs={4000}
            inPagePushAutoHideMs={14000}
            // Vignette config
            vignetteEnabled={true}
            vignetteDelayMs={0}
            vignetteAutoHideMs={8000}
            vignetteMinSessionTimeMs={30000}
            // Session
            oncePerSession={true}
            sessionKey="ads:multitag"
          />
        </ClientProviders>
      </body>
    </html>
  );
}