import { useEffect } from "react";
import { Link } from "react-router-dom";

const Roadmap = () => {
  useEffect(() => {
    document.title = "Accountant AI Roadmap";
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold">Accountant AI Roadmap</h1>
          <p className="text-muted-foreground mt-2">Vision, scope, and launch plan</p>
        </div>
      </header>

      <section className="px-4 sm:px-6 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <article className="space-y-3">
            <h2 className="text-2xl font-semibold">Website Goals</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Product/Service Sales or Subscriptions: Offer AI products/services via e‑commerce and
                subscription models with easy checkout.
              </li>
              <li>
                Showcase Accounting AI Capabilities: Demonstrate AI assistant, taxes, forensic analysis,
                financial advice—everything a modern accountant can do, faster and with fewer mistakes.
              </li>
            </ul>
          </article>

          <article className="space-y-3">
            <h2 className="text-2xl font-semibold">Outline Scope</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <section>
                <h3 className="text-xl font-medium">Design</h3>
                <p className="text-muted-foreground mt-2">
                  Visually appealing, easy to navigate, interesting, with user‑friendly colors (blue, white, etc.).
                  Surfaces features clearly and accessibly.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-medium">Content</h3>
                <p className="text-muted-foreground mt-2">
                  AI financial advisor, Tax Center, financial health charts, document processing, bookkeeping.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-medium">Functionality</h3>
                <p className="text-muted-foreground mt-2">
                  Stripe for payments; Plaid/Yodlee for bank access; capabilities aligned with an accountant’s toolkit.
                </p>
              </section>
              <section>
                <h3 className="text-xl font-medium">Optimization</h3>
                <p className="text-muted-foreground mt-2">
                  Fully responsive and optimized for major browsers and search engines.
                </p>
              </section>
            </div>
          </article>

          <article className="space-y-3">
            <h2 className="text-2xl font-semibold">Website Structure</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Homepage: Hero with headline and CTAs (Get Started, Try Demo) + Testimonials.
              </li>
              <li>
                Pricing/Plans: Transparent tiers (Basic, Professional, Enterprise) + Demo option.
              </li>
              <li>
                Privacy & Legal: Privacy Policy, Terms of Service, Cookie Policy.
              </li>
            </ul>
          </article>

          <article className="space-y-3">
            <h2 className="text-2xl font-semibold">Timeline</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Pre‑Development (market research) – Done ✅</li>
              <li>Design Phase (UX/UI) – Done ✅</li>
              <li>Development (Backend, AI, Frontend) – Done ✅</li>
              <li>Testing – In progress 🔬</li>
              <li>Deployment – Next</li>
              <li>Launch – Public release</li>
              <li>Post‑Launch – Monitoring & iteration</li>
            </ul>
          </article>

          <article className="space-y-3">
            <h2 className="text-2xl font-semibold">Final Note</h2>
            <p className="text-muted-foreground">
              Some bars need improved visibility in day mode to match night mode clarity. We’ll keep parity while
              preserving design.
            </p>
          </article>

          <div className="pt-2">
            <Link to="/" className="story-link">Back to Home</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Roadmap;
