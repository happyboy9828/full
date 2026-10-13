import Link from "next/link";
import { blogPosts } from "../posts";
import ContentPage from "../../../components/ContentPage/ContentPage";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }) {
  const post = blogPosts.find((p) => p.slug === params.slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `https://docfix.app/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

const postContent = {
  "compress-image-without-losing-quality": {
    intro:
      "Image compression is the art of making files smaller without sacrificing the quality that matters to you. The key is understanding your options and using the right settings for the right job.",
    sections: [
      {
        title: "Lossy vs Lossless Compression",
        content:
          "Lossless compression (PNG, GIF) removes redundant data without discarding any information, so the image is identical when decompressed. Lossy compression (JPG, WebP with reduced quality) permanently discards some data, which can introduce visible artifacts — but the file savings are much larger.",
      },
      {
        title: "Choosing the Right Quality",
        content:
          "For JPG, a quality setting of 80–85% preserves excellent visual fidelity while cutting file size by 60–80% compared to 100%. For WebP, quality 75–80% often beats JPG at even lower sizes. Preview your output before deciding.",
      },
      {
        title: "Convert Format Too",
        content:
          "Switching from a bulky format to a modern one can dramatically reduce size. WebP and AVIF offer superior compression over PNG and JPG, though browser support varies. Always keep the original as a backup.",
      },
      {
        title: "Why Browser-Based Matters",
        content:
          "Tools like DocFix process your image entirely in your browser using WebAssembly. Your file never touches a server, which means it is both faster (no upload wait) and more private (no one can see your data).",
      },
    ],
  },
  "webp-vs-png-best-format": {
    intro:
      "WebP and PNG both support transparency, but they differ in file size and browser support. Here is a quick guide to picking the right one.",
    sections: [
      {
        title: "When to Use WebP",
        content:
          "Choose WebP for web images that need transparency or animation with small file sizes. WebP typically achieves 25–35% smaller files than PNG at equivalent quality. Most modern browsers (Chrome, Firefox, Edge, Safari 14+) support WebP.",
      },
      {
        title: "When to Use PNG",
        content:
          "Choose PNG when you need maximum browser compatibility or lossless quality. PNG is the safest choice for logos, screenshots, and images with sharp edges or text.",
      },
      {
        title: "Converting Without Uploads",
        content:
          "Use DocFix&apos;s WebP ⇄ PNG Converter to switch formats instantly in your browser — no server, no waiting, no privacy risk.",
      },
    ],
  },
  "why-browser-based-tools-are-safer": {
    intro:
      "Every time you upload a file to a cloud-based tool, you entrust your data to a third party. Browser-based processing eliminates that risk entirely.",
    sections: [
      {
        title: "No Server = No Data Leak",
        content:
          "When processing happens in your browser, the file contents never leave your device. There is no server to hack, no database to breach, and no logs to subpoena.",
      },
      {
        title: "Faster Results",
        content:
          "Without uploading and downloading, results appear in milliseconds. WebAssembly runs at near-native speed right on your hardware.",
      },
      {
        title: "Works Offline",
        content:
          "Once a tool loads, you can use it even without an internet connection.",
      },
    ],
  },
  "convert-jpg-to-png-transparent-background": {
    intro:
      "JPG does not support transparency. To get a PNG with a transparent background from a JPG, you need to remove the original background first.",
    sections: [
      {
        title: "Step 1: Remove the Background",
        content:
          "Upload your JPG to an AI background removal tool (like DocFix&apos;s Remove BG) to isolate the subject. The background will be replaced with transparency.",
      },
      {
        title: "Step 2: Convert to PNG",
        content:
          "With the background removed, export or convert the image as PNG. PNG preserves the alpha channel (transparency) that JPG cannot.",
      },
      {
        title: "Step 3: Verify Edges",
        content:
          "Zoom in on the subject edges and clean up any halo or stray pixels. Fine-tune with manual brushes if needed.",
      },
    ],
  },
  "compress-pdf-files-online-for-free": {
    intro:
      "Large PDFs are a hassle — they slow down email, clog downloads, and eat storage. Here is how to shrink them quickly and securely.",
    sections: [
      {
        title: "Why PDFs Get Large",
        content:
          "PDFs balloon in size when they contain high-resolution images, embedded fonts, or unnecessary metadata. The trick is to recompress the images and strip the extras.",
      },
      {
        title: "Compression Techniques",
        content:
          "PDF compression typically works by downsampling images to a lower DPI (e.g., 150 DPI for screen reading), re-encoding them with efficient codecs, and removing redundant objects.",
      },
      {
        title: "Privacy Matters",
        content:
          "When you compress a PDF in your browser, the file is processed locally — no server ever sees your document. This is essential for contracts, reports, and any sensitive paperwork.",
      },
      {
        title: "Quality vs Size Tradeoff",
        content:
          "High-quality compression keeps text crisp and images clear but produces larger files. For most online sharing, a balanced setting delivers great results at a fraction of the original size.",
      },
    ],
  },
};

export default function BlogPostPage({ params }) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    return (
      <ContentPage title="Post Not Found" description="This article does not exist." eyebrow="Blog">
        <div className="prose">
          <p>The blog post you are looking for could not be found.</p>
          <Link href="/blog">← Back to all posts</Link>
        </div>
      </ContentPage>
    );
  }

  const content = postContent[post.slug] || { intro: post.excerpt, sections: [] };

  return (
    <ContentPage
      title={post.title}
      description={post.excerpt}
      eyebrow={`Blog · ${post.readingTime}`}
    >
      <article className="blog-post-article">
        <time dateTime={post.date}>{post.date}</time>
        <p className="blog-post-intro">{content.intro}</p>

        {content.sections.map((section, i) => (
          <div key={i}>
            <h3>{section.title}</h3>
            <p>{section.content}</p>
          </div>
        ))}

        <Link href="/blog" className="tool-btn tool-btn-ghost">
          ← Back to all posts
        </Link>
      </article>
    </ContentPage>
  );
}
