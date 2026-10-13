import ContentPage from "../../components/ContentPage/ContentPage";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How DocFix handles information when you visit and use our tools — browser-based processing, cookies, download limits, analytics, security, and your privacy rights.",
};

export default function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy Policy"
      description="How we handle information when you visit our website and use our tools."
      eyebrow="Privacy"
    >
      <div className="prose">
        <p>
          At DocFix, we believe your files deserve privacy. This policy
          explains how we handle information when you visit our website and
          use our tools.
        </p>

        <p>
          <strong>Last updated: October 12, 2026</strong>
        </p>

        <h2>1. File Privacy and Processing</h2>
        <p>
          DocFix aims to make file processing simple while minimizing
          unnecessary access to your data.
        </p>
        <p>
          For tools that process files entirely in your browser, your files
          remain on your device and are not uploaded to DocFix servers for
          processing. These tools use browser technologies such as
          JavaScript, WebAssembly (WASM), and HTML5 Canvas, where applicable.
        </p>
        <p>
          Processing methods may vary by tool. Please check the relevant
          tool&apos;s description to understand how your files are handled
          before using it.
        </p>
        <p>
          We do not use your file contents for advertising or sell your
          documents to third parties.
        </p>

        <h2>2. Browser-Based Processing</h2>
        <p>
          Where supported, DocFix processes files locally in your browser.
          Your files are read into browser memory, processed, and made
          available for download without requiring a file upload to our
          servers.
        </p>
        <p>
          Some tools may require an internet connection to load their
          interface, processing libraries, or other resources. Offline
          availability depends on the tool and whether its required resources
          have already been loaded and remain available.
        </p>
        <p>
          We aim to clearly communicate when a tool requires server-side
          processing or an external service.
        </p>

        <h2>3. Information We May Collect</h2>
        <p>
          Depending on how you use DocFix and which features are enabled, we
          may process limited technical or operational information, such as:
        </p>
        <ul>
          <li>Basic technical information needed to deliver and secure the website.</li>
          <li>Error reports and aggregated usage statistics, where analytics are enabled.</li>
          <li>Download counts or an anonymous browser identifier, if needed to enforce usage limits.</li>
          <li>
            Information you voluntarily provide when contacting us, such as
            your name, email address, and message.
          </li>
        </ul>
        <p>
          We aim to collect only information necessary to operate, maintain,
          secure, and improve DocFix.
        </p>
        <p>
          We do not intentionally collect the contents of files processed
          entirely in your browser.
        </p>

        <h2>4. Cookies and Browser Storage</h2>
        <p>
          DocFix may use essential browser storage or cookies to remember
          your preferences, maintain necessary functionality, or enforce
          usage limits.
        </p>
        <p>
          For example, a theme preference may be stored so the website
          remembers your light or dark mode selection. If a browser
          identifier is used to enforce a daily download limit, it may also
          be stored locally or in a cookie.
        </p>
        <p>
          We do not use essential preference or quota identifiers for
          advertising profiling.
        </p>
        <p>
          Any analytics or optional tracking technologies used on the website
          should be described here accurately, including their purpose and
          applicable controls.
        </p>

        <h2>5. Daily Download Limits</h2>
        <p>
          DocFix may apply a daily download limit to help maintain fair and
          reliable access to its tools.
        </p>
        <p>
          If a download limit is enabled, we may track the number of
          downloads associated with a browser identifier, IP address, or
          another usage identifier, depending on the implementation.
        </p>
        <p>
          This information is used to enforce usage limits and help prevent
          abuse. It is not intended to identify the contents of your files.
        </p>
        <p>
          Limits, reset times, and counting rules may vary according to the
          published service rules. We aim to retain quota-related information
          only for as long as reasonably necessary for these purposes.
        </p>

        <h2>6. Analytics and Website Security</h2>
        <p>
          Where enabled, we may use analytics to understand general website
          usage, identify technical problems, and improve our tools.
        </p>
        <p>
          Analytics may involve information such as page views, browser type,
          device information, and error events. We aim to avoid collecting
          file contents or unnecessary personal information through analytics.
        </p>
        <p>
          We may also process technical information needed to protect the
          website against spam, malicious activity, and service abuse.
        </p>
        <p>
          The actual information collected depends on the analytics, hosting,
          security, and monitoring services configured for DocFix.
        </p>

        <h2>7. Third-Party Services</h2>
        <p>
          DocFix may rely on third-party providers for website hosting,
          content delivery, analytics, email communications, or security.
        </p>
        <p>
          These providers may process certain technical information as needed
          to deliver their services. Their handling of information is
          governed by their applicable terms and privacy policies.
        </p>
        <p>
          We do not sell your personal information to third parties or share
          it for third-party advertising purposes.
        </p>
        <p>
          Where applicable, we will identify relevant service providers and
          explain their roles in our privacy practices.
        </p>

        <h2>8. Data Retention and Security</h2>
        <p>
          We aim to retain personal information only for as long as reasonably
          necessary to fulfill the purposes described in this policy, meet
          applicable legal obligations, resolve disputes, and maintain website
          security.
        </p>
        <p>
          Retention periods may differ for contact messages, security logs,
          analytics records, and download-limit information.
        </p>
        <p>
          We use reasonable measures designed to protect information handled
          through DocFix. However, no website or internet transmission can be
          guaranteed to be completely secure.
        </p>

        <h2>9. Your Rights and Choices</h2>
        <p>
          Depending on your location and applicable law, you may have rights
          to request access to, correction of, or deletion of certain
          personal information, or to object to or restrict certain
          processing.
        </p>
        <p>
          You may also be able to control cookies and browser storage through
          your browser settings. Removing stored identifiers may affect
          preferences or usage limits.
        </p>
        <p>
          For tools that process files entirely in your browser, DocFix
          generally does not receive the file contents and therefore may not
          have a copy to retrieve or delete.
        </p>
        <p>
          To submit a privacy-related request, please{" "}
          <a href="/contact">contact us</a>.
        </p>

        <h2>10. Children&apos;s Privacy</h2>
        <p>
          DocFix is not intended to knowingly collect personal information
          from children in circumstances where parental consent is legally
          required. If you believe a child has provided personal information
          to us inappropriately, please contact us so we can review the
          matter.
        </p>

        <h2>11. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy as DocFix&apos;s features,
          technology, and legal requirements change.
        </p>
        <p>
          The latest version will be published on this page with an updated
          revision date. Where required, we will provide additional notice of
          material changes.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy or how DocFix
          handles information, please contact us:
        </p>
        <p>
          <strong>Email:</strong>{" "}
          <a href="mailto:hello@docfix.app">hello@docfix.app</a>
        </p>
        <p>
          <strong>Contact page:</strong>{" "}
          <a href="/contact">/contact</a>
        </p>
        <p>
          We welcome questions and feedback about our privacy practices.
        </p>
      </div>
    </ContentPage>
  );
}
