import ContentPage from "../../components/ContentPage/ContentPage";
import FeedbackFormWrapper from "../../components/FeedbackForm/FeedbackFormWrapper";
import "./contact.css";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the Docstools team for support, feedback, or business inquiries.",
};

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact Docstools"
      description="We'd love to hear from you."
      eyebrow="Contact"
    >
      <div className="prose contact-page">
        <p>
          Have a question, feedback, or an idea for improving Docstools? We'd love to hear from you.
        </p>
        <p>
          For general inquiries and support requests, email us or use the contact form below. We aim to respond within <strong>1–2 business days</strong>.
        </p>

        <div className="contact-section">
          <h2>Get in Touch</h2>
          <h3>Email Support</h3>
          <p>
            For general questions, technical support, suggestions, or other inquiries, contact us at{" "}
            <a href="mailto:darkdevils702@gmail.com" className="contact-email">
              darkdevils702@gmail.com
            </a>.
          </p>
        </div>

        <div className="contact-section">
          <h2>Send Us a Message</h2>
          <p>
            Found a bug, have a feature request, or want to share your experience with Docstools? Send us a message using the form below.
          </p>
          <p>No account is required.</p>
          <div className="contact-form-wrapper">
            <FeedbackFormWrapper />
          </div>
          <p className="contact-note">
            We use the information you submit to review and respond to your inquiry. Please avoid including passwords or sensitive personal information in your message. See our <a href="/privacy">Privacy Policy</a> for more information.
          </p>
        </div>

        <div className="contact-section">
          <h2>How Can We Help?</h2>
          <ul className="contact-info-list">
            <li>
              <strong>Technical Support:</strong> Describe the problem, the tool you were using, your browser and operating system, and the steps needed to reproduce the issue.
            </li>
            <li>
              <strong>Feature Requests:</strong> Tell us which tool you'd like to see improved or what new functionality would be useful.
            </li>
            <li>
              <strong>Business &amp; Partnerships:</strong> Contact us to discuss potential collaborations, business opportunities, or licensing.
            </li>
            <li>
              <strong>Press &amp; Media:</strong> Reach out for information about Docstools, approved brand assets, or media inquiries.
            </li>
          </ul>
        </div>

        <div className="contact-section">
          <h2>Need a Quick Answer?</h2>
          <p>
            Before contacting us, visit our <a href="/faq" className="contact-faq-link">FAQ</a> for answers to common questions about Docstools and its tools.
          </p>
          <p>
            We're always looking for ways to make Docstools better. Thank you for being part of our journey.
          </p>
          <p className="contact-signoff">
            <strong>The Docstools Team</strong>
          </p>
          <p className="contact-signoff-email">
            <a href="mailto:darkdevils702@gmail.com" className="contact-email">
              darkdevils702@gmail.com
            </a>
          </p>
        </div>
      </div>
    </ContentPage>
  );
}
