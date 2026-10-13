import ContentPage from "../../../components/ContentPage/ContentPage";

export const metadata = {
  title: "About DocFix",
  description: "Learn about DocFix — fast, private, browser-based image tools for everyone.",
};

export default function AboutPage() {
  return (
    <ContentPage
      title="About DocFix"
      description="Our mission: make image processing fast, private, and accessible."
      eyebrow="About"
    >
      <div className="prose">
        <h2>What is DocFix?</h2>
        <p>DocFix is a collection of image tools that run entirely in your browser. No uploads, no cloud processing, no waiting for servers. Everything happens on your device using modern web APIs.</p>

        <h2>Why Browser-Based?</h2>
        <ul>
          <li><strong>Privacy:</strong> Your images never leave your computer.</li>
          <li><strong>Speed:</strong> No upload/download latency. Processing is instant.</li>
          <li><strong>Offline-ready:</strong> Once loaded, tools work without internet.</li>
          <li><strong>No accounts needed:</strong> Open a tool and start working immediately.</li>
        </ul>

        <h2>Technology</h2>
        <p>DocFix uses HTML5 Canvas, Web Workers, and modern JavaScript APIs. Built with Next.js and React.</p>

        <h2>Open Source</h2>
        <p>The core image processing logic is open source. Check out the <a href="https://github.com/docfix" target="_blank" rel="noopener noreferrer">GitHub repository</a>.</p>

        <h2>Team</h2>
        <div className="team-grid">
          <article className="team-card">
            <div className="team-avatar" aria-hidden="true">👨‍💻</div>
            <h3 className="team-name">Alex Chen</h3>
            <p className="team-role">Founder & Lead Developer</p>
            <p className="team-bio">Full-stack engineer passionate about privacy-first tools and client-side processing.</p>
          </article>
          <article className="team-card">
            <div className="team-avatar" aria-hidden="true">👩‍💻</div>
            <h3 className="team-name">Maria Rodriguez</h3>
            <p className="team-role">Co-Founder & UI/UX Designer</p>
            <p className="team-bio">Designer focused on accessible, intuitive interfaces for developer tools.</p>
          </article>
          <article className="team-card">
            <div className="team-avatar" aria-hidden="true">👨‍💻</div>
            <h3 className="team-name">James Wilson</h3>
            <p className="team-role">Senior Developer</p>
            <p className="team-bio">Specializes in WebAssembly, Canvas APIs, and performance optimization.</p>
          </article>
        </div>

        <h2>Contact</h2>
        <p>Questions or feedback? Email <a href="mailto:hello@docfix.app">hello@docfix.app</a>.</p>
      </div>
    </ContentPage>
  );
}