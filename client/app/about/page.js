import ContentPage from "../../components/ContentPage/ContentPage";

export const metadata = {
  title: "About DocFix",
  description:
    "Simple, fast, and privacy-conscious file tools for everyone. DocFix makes working with documents and files easier without unnecessary complexity.",
};

export default function AboutPage() {
  return (
    <ContentPage
      title="About DocFix"
      description="Simple, fast, and privacy-conscious file tools for everyone."
      eyebrow="About"
    >
      <div className="prose">
        <p>
          DocFix makes working with documents and files easier. Our goal is to
          provide useful, accessible tools that help people process their files
          without unnecessary complexity.
        </p>

        <p>
          Whether you&apos;re preparing a document, working with a PDF, or handling an
          image, DocFix aims to make everyday file tasks simpler, faster, and
          more convenient.
        </p>

        <h2>Our Mission</h2>
        <p>
          Our mission is to make powerful file tools accessible to everyone
          while putting privacy, simplicity, and usability first.
        </p>
        <p>
          Documents and images can contain sensitive personal or professional
          information. That&apos;s why we believe file tools should be designed with
          privacy in mind, giving users a clear understanding of how their files
          are processed.
        </p>
        <p>
          We&apos;re building DocFix to make everyday file tasks easier without
          making users navigate complicated workflows or create an account just
          to get started.
        </p>

        <h2>Why Choose DocFix?</h2>

        <h3>Privacy by Design</h3>
        <p>
          We believe your files deserve careful handling. Our tools are
          designed with privacy in mind, and we aim to minimize unnecessary
          data collection.
        </p>
        <p>
          <em>
            Publish the stronger claim that files never leave your device only
            for tools verified to process files entirely in the browser.
          </em>
        </p>

        <h3>Fast and Convenient</h3>
        <p>
          Get your work done with straightforward tools designed to reduce
          unnecessary steps. Where processing happens locally, files can be
          handled without waiting for uploads to a remote server.
        </p>

        <h3>Simple to Use</h3>
        <p>
          No complicated workflows. Our goal is to make file processing
          accessible to beginners and experienced users alike.
        </p>

        <h3>Accessible When You Need It</h3>
        <p>
          Use DocFix directly from your browser, without installing desktop
          software. Account requirements may vary as the platform evolves.
        </p>

        <h2>How We Build DocFix</h2>
        <p>
          We use modern web technologies to build tools that are responsive,
          practical, and easy to use.
        </p>
        <p>
          Depending on the tool, these technologies may include JavaScript,
          browser APIs, WebAssembly, Canvas, and Web Workers to perform
          file-processing tasks efficiently.
        </p>
        <p>
          We focus on making each tool easy to understand, reliable to use, and
          transparent about how it handles your files.
        </p>

        <h2>Our Approach to Privacy</h2>
        <p>
          Privacy is an important part of how we think about DocFix.
        </p>
        <p>
          We aim to collect only the information needed to operate and improve
          the service. File-processing behavior may differ between tools, so we
          encourage users to consult our Privacy Policy for details about data
          handling, storage, and third-party services.
        </p>
        <p>
          Our long-term goal is to make useful file utilities available with as
          little friction and unnecessary data collection as possible.
        </p>

        <h2>Built for Everyday File Tasks</h2>
        <ul>
          <li>Students organizing assignments and study materials.</li>
          <li>Professionals handling everyday documents.</li>
          <li>Creators working with images and digital files.</li>
          <li>Individuals looking for convenient browser-based utilities.</li>
        </ul>
        <p>
          Whatever your workflow, we want DocFix to help you spend less time
          managing files and more time getting things done.
        </p>

        <h2>Get in Touch</h2>
        <p>
          Have a question, found an issue, or have an idea for a new tool?
        </p>
        <p>
          We&apos;d love to hear from you. Your feedback helps us improve DocFix and
          build tools that better serve your needs.
        </p>
        <p>
          Contact us:{" "}
          <a href="mailto:hello@docfix.app">hello@docfix.app</a>
        </p>
        <p>
          Explore DocFix and discover a simpler way to work with your files.
        </p>

        <hr />

        <p>
          <em>DocFix — Practical file tools, designed with privacy in mind.</em>
        </p>
      </div>
    </ContentPage>
  );
}
