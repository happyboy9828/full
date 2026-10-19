import Link from "next/link";
import ContentPage from "../../components/ContentPage/ContentPage";
import { blogPosts } from "./posts";

export const metadata = {
  title: "Blog",
  description: "Latest tutorials, tips, and updates from the Docstools team. All about browser-based file processing.",
};

export default function BlogPage() {
  return (
    <ContentPage
      title="Blog"
      description="Tutorials, tips, and updates on browser-based file processing and privacy."
      eyebrow="News"
    >
      <div className="prose">
        <ul className="blog-list">
          {blogPosts.map((post) => (
            <li key={post.slug} className="blog-post">
              <span className="blog-date">{post.date}</span>
              <h3 className="blog-title">
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="blog-desc">{post.excerpt}</p>
              <span className="blog-read-time">{post.readingTime}</span>
            </li>
          ))}
        </ul>
      </div>
    </ContentPage>
  );
}
