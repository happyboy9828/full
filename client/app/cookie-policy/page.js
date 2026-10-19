import ContentPage from "../../components/ContentPage/ContentPage";

export const metadata = {
  title: "Cookie Policy",
  description:
    "Docstools uses minimal cookies. We only store a theme preference cookie — no tracking, no advertising cookies.",
};

export default function CookiePolicyPage() {
  return (
    <ContentPage
      title="Cookie Policy"
      description="How Docstools uses (and does not use) cookies."
      eyebrow="Cookies"
    >
      <div className="prose">
        <p>
          <strong>Last updated: October 12, 2026</strong>
        </p>

        <h2>Overview</h2>
        <p>
          Docstools is committed to transparency about how we use cookies and similar tracking
          technologies. Because all of our tools run entirely in your browser, we use very few
          cookies — and none for tracking or advertising.
        </p>

        <h2>Cookies We Do Not Use</h2>
        <ul>
          <li>We do <strong>not</strong> use analytics cookies (no Google Analytics, Plausible, etc.).</li>
          <li>We do <strong>not</strong> use advertising or targeting cookies.</li>
          <li>We do <strong>not</strong> use third-party tracking cookies.</li>
          <li>We do <strong>not</strong> use profiling or behavioral advertising cookies.</li>
        </ul>

        <h2>Cookies We Use</h2>
        <table className="cookie-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Purpose</th>
              <th>Type</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>docstools-theme</td>
              <td>Remembers your color scheme preference (light, dark, or system)</td>
              <td>Essential</td>
              <td>Persistent (until changed)</td>
            </tr>
          </tbody>
        </table>

        <h2>Local Storage & Session Storage</h2>
        <p>
          Docstools does <strong>not</strong> use local storage or session storage to persist any
          personal data or file information. Any in-memory state (such as your current theme or
          tool settings) is reset when you close the browser tab.
        </p>

        <h2>Managing Cookies</h2>
        <p>
          Since we only use a single essential cookie, there is no cookie consent banner required.
          If you wish to delete this cookie, you can do so through your browser&apos;s privacy settings.
          Removing the cookie will simply reset your theme preference to &quot;system&quot; on your
          next visit.
        </p>

        <h2>GDPR &amp; CCPA Compliance</h2>
        <p>
          For users in the EU, UK, and California: Docstools is fully compliant with GDPR and CCPA
          requirements. We process no personal data, serve no tracking cookies, and do not sell any
          information. The only data we collect is anonymized, aggregated analytics (page views,
          browser type) that cannot be linked to an individual.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          If we ever add new cookie usage, we will update this policy and revise the &quot;Last
          updated&quot; date above.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about cookies? Email <a href="mailto:hello@docstools.app">hello@docstools.app</a>.
        </p>
      </div>
    </ContentPage>
  );
}
