import ContentPage from "../../components/ContentPage/ContentPage";

export const metadata = {
  title: "Pricing — Free Forever",
  description:
    "DocFix is 100% free with no limits. No subscriptions, no credit card, no hidden fees. All tools run in your browser.",
};

export default function PricingPage() {
  return (
    <ContentPage
      title="Pricing"
      description="All DocFix tools are completely free. No subscriptions. No limits."
      eyebrow="Pricing"
    >
      <div className="prose">
        <h2>Free Forever</h2>
        <p>
          Every tool on DocFix is 100% free to use — forever. No credit card required, no
          subscriptions, no hidden fees. Because all processing happens in your browser, there are no
          server costs to pass on to you.
        </p>

        <h2>What&apos;s Included</h2>
        <ul>
          <li>Full access to all browser-based tools</li>
          <li>Batch processing (up to 50 files at once)</li>
          <li>Zero file uploads — your data stays private</li>
          <li>No accounts or sign-ups required</li>
          <li>Regular updates and new tools</li>
        </ul>

        <h2>No Pro Tier</h2>
        <p>
          Unlike other platforms that gate powerful features behind a paywall, DocFix believes
          privacy-respecting tools should be free and accessible to everyone. We have no plans to
          introduce paid tiers or premium features.
        </p>

        <h2>Support the Project</h2>
        <p>
          If you find DocFix useful, the best way to support us is to share it with friends and
          colleagues who value their privacy. Link back to us, leave feedback, or spread the word on
          social media.
        </p>

        <p>
          Questions? <a href="/contact">Contact us</a> or check the{" "}
          <a href="/faq">FAQ</a>.
        </p>
      </div>
    </ContentPage>
  );
}
