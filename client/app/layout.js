import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { getPages } from "../lib/pages";
import Multitag from "../components/ads/Multitag/Multitag";
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
      <body className="flex min-h-full flex-col">
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
      </body>
    </html>
  );
}