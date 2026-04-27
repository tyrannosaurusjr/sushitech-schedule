import type { Metadata } from "next";
import ContactForm from "./ContactForm";

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
            <p className="text-neutral-700 leading-relaxed text-lg">
              I noticed a lot of people having trouble navigating the schedule on the day, so I put
              together something cleaner. Built the morning the event started, took about 1.5 hours.
              Full timetable view so you can see what is running in parallel,
              a live Now Happening strip, and session links you can actually share.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 text-foreground">Who built it</h2>
            <div className="flex items-start gap-6 mb-6">
              <img
                src="https://www.mkultraman.com/images/matt-portrait.webp"
                alt="Matt Ketchum"
                className="w-24 h-24 rounded-full object-cover shrink-0"
              />
              <div>
                <p className="text-neutral-700 leading-relaxed text-lg mb-4">
                  Matt Ketchum. Digital infrastructure for SMEs in Japan. I audit your tech stack,
                  cut what you do not need, fix what is broken, and build what is missing. 10 years
                  in Tokyo. 40+ clients across F&amp;B, media, professional services, events, and retail.
                </p>
                <p className="text-neutral-700 leading-relaxed text-lg mb-5">
                  Stack Audit · Infrastructure Build · Ongoing Management
                </p>
                <div className="flex items-center gap-5">
                  <a
                    href="https://mkultraman.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-medium text-lg transition-colors"
                  >
                    mkultraman.com →
                  </a>
                  <a
                    href="https://www.linkedin.com/in/matthew-ketchum/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-500 hover:text-neutral-800 font-medium transition-colors flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-neutral-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-2 text-foreground">Get in touch</h2>
            <p className="text-neutral-500 mb-6">
              Running an event, product, or company with broken systems? Tell me what is going on.
            </p>
            <ContactForm />
          </section>
        </div>
      </div>
    </div>
  );
}
