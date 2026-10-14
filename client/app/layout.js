import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Navbar from "./../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { getPages } from "../lib/pages";
import Multitag from "../components/ads/Multitag/Multitag";
import GlobalDownloadProgress from "../components/ads/DownloadProgressPopup/GlobalDownloadProgress";
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
    default: "DocFix — Free Private File Tools",
    template: "%s · DocFix",
  },
  description:
    "Compress, convert, and edit images, PDFs, and text entirely in your browser. 100% private — no uploads, no cookies, no server storage.",
  icons: {
    icon: "/logo.svg",
  },
  metadataBase: "https://docfix.app",
  alternates: {
    canonical: "https://docfix.app",
  },
  openGraph: {
    type: "website",
    siteName: "DocFix",
    locale: "en-US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DocFix — browser-only file tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@docfix",
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
        <meta name="monetag" content="00c83d096c767c17643d90b438ee8e19" />
        {/* Utilities */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"
          strategy="lazyOnload"
        />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"
          strategy="lazyOnload"
        />
        {/* pdf-lib for PDF generation, page extraction, splitting, merging, and rotation */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"
          strategy="lazyOnload"
        />
        {/* PDF.js for PDF rendering and thumbnail generation */}
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
      </head>
      <body className="flex min-h-full flex-col">
        <ClientProviders>
          <Navbar pages={pages} />

          <div className="mx-auto w-full max-w-[var(--tool-width)] flex-1 px-6 xl:max-w-[1400px]">
            <main className="flex min-w-0 flex-col">{children}</main>
          </div>

          <Footer />

          {/* Global download notification popup (countdown + progress) */}
          <GlobalDownloadProgress />

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