import type { Metadata } from "next";
import Navigation from "../components/Navigation";

export const metadata: Metadata = {
  title: "About | SusHi Tech Tokyo 2026 Schedule",
  description: "Learn about this conference schedule app and who built it",
  openGraph: {
    title: "About | SusHi Tech Tokyo 2026 Schedule",
    description: "Learn about this conference schedule app and who built it",
    type: "website",
    siteName: "SusHi Tech 2026 Schedule — Built by MKUltraman",
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-black mb-12 text-foreground">About this site</h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">About this site</h2>
            <p className="text-neutral-700 leading-relaxed text-lg">
              The official SusHi Tech 2026 schedule loaded in 3+ seconds and had no parallel-track
              timetable view. I built this in 1.5 hours the morning the event started — full timetable,
              real speaker pages, live 'Now Happening' detection, and shareable session URLs.
              It runs as a static site on Cloudflare Pages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 text-foreground">Who built it</h2>
            <p className="text-neutral-700 leading-relaxed text-lg mb-4">
              Matt Ketchum — digital infrastructure consultant based in Tokyo for 10+ years.
              I help Japanese SMEs eliminate tool sprawl, automate broken workflows, and build
              reporting that makes their business legible. 40+ clients. Industries: F&B, media,
              professional services, events, retail.
            </p>
            <p className="text-neutral-700 leading-relaxed text-lg mb-6">
              Services: Stack Audit • Infrastructure Build • Ongoing Management
            </p>
            <p>
              <a
                href="https://mkultraman.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 font-medium text-lg transition-colors"
              >
                mkultraman.com →
              </a>
            </p>
          </section>

          <section className="bg-neutral-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Get in touch</h2>
            <p className="text-neutral-700 leading-relaxed text-lg mb-4">
              Running an event, product, or company with broken systems?
            </p>
            <a
              href="mailto:hello@mkultraman.com"
              className="inline-flex items-center bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Get in touch →
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}