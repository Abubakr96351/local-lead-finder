import Link from "next/link";
import {
  ArrowRight,
  Search,
  Gauge,
  MessageSquareText,
  Radar as RadarIcon,
  Globe2,
  Download,
  Clock,
} from "lucide-react";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { ProductPreview } from "@/components/marketing/ProductPreview";
import { Faq } from "@/components/marketing/Faq";

const STEPS = [
  {
    step: "01",
    title: "Pick an industry & city",
    description:
      "Tell it what kind of business and where — plumbers in Tampa, dentists in Austin, whatever niche you sell into.",
    icon: Search,
  },
  {
    step: "02",
    title: "It scores every website",
    description:
      "Each result gets checked for reachability, HTTPS, mobile support, and stale copyright years, then rolled into an opportunity score.",
    icon: Gauge,
  },
  {
    step: "03",
    title: "You send a warmer pitch",
    description:
      "Shortlist the best opportunities, generate a personalized opener for each one, and export straight to CSV.",
    icon: MessageSquareText,
  },
];

const FEATURES = [
  {
    icon: Search,
    title: "Targeted scraping",
    description:
      "Search Google Maps by industry, city, and country and pull contact info, website, rating, and review count for every result.",
  },
  {
    icon: Gauge,
    title: "AI website analysis",
    description:
      "Every lead gets an opportunity score with a plain-language reason — a dead site, no HTTPS, no mobile support, or a stale copyright year.",
  },
  {
    icon: MessageSquareText,
    title: "Outreach generator",
    description:
      "Turn a lead's specific weak points into a personalized outreach message in one click, instead of starting from a blank cursor.",
  },
  {
    icon: RadarIcon,
    title: "Prospect radar",
    description:
      "Set a niche, a region, and a cadence — new prospects get scanned for automatically and land in your inbox without you lifting a finger.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-full flex-col">
      <MarketingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#111214]">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, #f59e0b 0, transparent 35%), radial-gradient(circle at 80% 0%, #f59e0b 0, transparent 30%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-amber-300">
                Powered by live Google Maps data
              </span>
              <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                Find local businesses that{" "}
                <span className="text-amber-400">actually need you</span>
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-gray-400">
                Local Lead Finder crawls Google Maps for any industry in any city, scores
                every business&apos;s website, and hands you a ranked list of the ones
                worth pitching first.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/scraper"
                  className="inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-[#111214] transition hover:bg-amber-300"
                >
                  Open the scraper
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  See how it works
                </a>
              </div>
            </div>

            <div className="mx-auto mt-14 max-w-4xl">
              <ProductPreview />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              From search to sent pitch, in three steps
            </h2>
            <p className="mt-3 text-gray-600">
              No spreadsheets, no manual site-checking — just a ranked list of who to
              contact and why.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ step, title, description, icon: Icon }) => (
              <div key={step} className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#111214] text-amber-400">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="mt-4 text-xs font-semibold tracking-widest text-gray-400">
                  STEP {step}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-gray-50 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                Everything you need to build a pitch list
              </h2>
              <p className="mt-3 text-gray-600">
                Four tools that work together, so you go from &quot;find leads&quot; to
                &quot;send outreach&quot; without switching tabs.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Free to revisit
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    Every search is cached for 7 days, so reopening one from Past
                    Searches is instant and costs nothing.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <Download className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Export anywhere
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600">
                    One click turns a results page into a CSV you can drop into your CRM
                    or outreach tool of choice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global reach */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <Globe2 className="mx-auto h-9 w-9 text-amber-500" strokeWidth={1.75} />
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Works anywhere Google Maps does
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-600">
            Since it runs on the Google Places API, Local Lead Finder can search any
            city, in any country Google Maps covers — not just your home market.
          </p>
        </section>

        {/* CTA banner */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="rounded-2xl bg-[#111214] px-8 py-14 text-center sm:px-16">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Your next client is one search away
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-gray-400">
              Pick an industry, pick a city, and see who needs what you sell.
            </p>
            <Link
              href="/scraper"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-semibold text-[#111214] transition hover:bg-amber-300"
            >
              Open the scraper
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-6xl px-6 pb-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Frequently asked questions
            </h2>
          </div>
          <div className="mt-10">
            <Faq />
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
