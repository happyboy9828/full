import ContentPage from "../../components/ContentPage/ContentPage";

export const metadata = {
  title: "Copyright Policy (DMCA)",
  description:
    "Docstools Copyright and DMCA policy. We respect intellectual property rights and respond to takedown requests.",
};

export default function DMCAPage() {
  return (
    <ContentPage
      title="Copyright Policy &amp; DMCA"
      description="How Docstools handles copyright and DMCA takedown requests."
      eyebrow="Copyright"
    >
      <div className="prose">
        <p>
          <strong>Last updated: October 12, 2026</strong>
        </p>

        <h2>Respect for Intellectual Property</h2>
        <p>
          Docstools respects the intellectual property rights of others. Because all file processing
          occurs locally in your browser and we never receive, store, or transmit any file contents,
          we have no visibility into the content that users process through our tools.
        </p>

        <h2>DMCA Takedown</h2>
        <p>
          If you believe that content accessible through Docstools violates your copyright or any
          applicable intellectual property law, please submit a DMCA takedown notice to our
          designated agent:
        </p>

        <h3>Designated Agent</h3>
        <p>
          <strong>Docstools Copyright Agent</strong>
          <br />
          Email: <a href="mailto:copyright@docstools.app">copyright@docstools.app</a>
          <br />
          Please include &quot;DMCA Notice&quot; in the subject line.
        </p>

        <h3>Notice Requirements</h3>
        <p>Your notice must include:</p>
        <ol>
          <li>The physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
          <li>Identification of the copyrighted work that you claim has been infringed.</li>
          <li>Identification of the allegedly infringing material, including the URL or location where it can be found.</li>
          <li>Your contact information, including name, mailing address, phone number, and email address.</li>
          <li>A statement by you that you have a good-faith belief that the use is not authorized by the copyright owner.</li>
          <li>A statement that the above information is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of the copyright.</li>
        </ol>

        <h3>Counter-Notice</h3>
        <p>
          If you believe your content was removed in error, you may submit a counter-notice to the
          same email address. We will follow the DMCA process for restoring content where applicable.
        </p>

        <h2>Repeat Infringer Policy</h2>
        <p>
          We will terminate access to the Service for users who repeatedly infringe the copyright of
          others, in accordance with DMCA guidelines.
        </p>

        <h2>Ownership of Docstools Materials</h2>
        <p>
          All content, logos, trademarks, and software on this site (excluding user-processed files)
          are the property of Docstools and are protected by copyright and other intellectual property
          laws. You may not use, reproduce, or distribute our materials without prior written consent.
        </p>
      </div>
    </ContentPage>
  );
}
