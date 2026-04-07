// Footer is a Server Component — no "use client" needed at the top level.
// The NewsletterForm sub-component is isolated as a client island.

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Twitter,
  Youtube,
  Instagram,
  Facebook,
  Linkedin,
  Send,
  Smartphone,
  ArrowRight,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_COLUMNS = [
  {
    heading: "Top News",
    links: [
      { label: "India",         href: "/category/india"         },
      { label: "World",         href: "/category/world"         },
      { label: "Politics",      href: "/category/politics"      },
      { label: "Business",      href: "/category/business"      },
      { label: "Technology",    href: "/category/technology"    },
      { label: "Science",       href: "/category/science"       },
      { label: "Sports",        href: "/category/sports"        },
      { label: "Entertainment", href: "/category/entertainment" },
      { label: "Health",        href: "/category/health"        },
      { label: "Education",     href: "/category/education"     },
    ],
  },
  {
    heading: "Our Platforms",
    links: [
      { label: "E-Paper",        href: "/epaper"      },
      { label: "Video News",     href: "/video"       },
      { label: "Reels / Stories",href: "/stories"     },
      { label: "Classifieds",    href: "/classifieds" },
      { label: "News Archive",   href: "/archive"     },
      { label: "Live Blog",      href: "/live"        },
      { label: "Search",         href: "/search"      },
      { label: "Horoscope",      href: "/#horoscope"  },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Us",       href: "#" },
      { label: "Careers",        href: "#" },
      { label: "Advertise",      href: "#" },
      { label: "Press / Media",  href: "#" },
      { label: "Contact Us",     href: "#" },
      { label: "Newsroom Blog",  href: "#" },
      { label: "Investor Relations", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy",      href: "#" },
      { label: "Terms of Service",    href: "#" },
      { label: "Cookie Policy",       href: "#" },
      { label: "DPDP Act Compliance", href: "#" },
      { label: "Grievance Officer",   href: "#" },
      { label: "Corrections Policy",  href: "#" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "Twitter / X",  href: "#", Icon: Twitter   },
  { label: "YouTube",      href: "#", Icon: Youtube   },
  { label: "Instagram",    href: "#", Icon: Instagram },
  { label: "Facebook",     href: "#", Icon: Facebook  },
  { label: "LinkedIn",     href: "#", Icon: Linkedin  },
];

const YEAR = new Date().getFullYear();

// ─── Newsletter CTA (client island) ──────────────────────────────────────────

function NewsletterForm() {
  const [email,     setEmail]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    // Placeholder — wire to real email service when ready
    setSubmitted(true);
  }

  return submitted ? (
    <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
      <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
      You're subscribed. Breaking news will reach you first.
    </p>
  ) : (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md gap-2"
      aria-label="Newsletter signup"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className={[
          "flex-1 rounded-lg border border-neutral-700 bg-neutral-800",
          "px-4 py-2.5 text-sm text-white placeholder-neutral-500",
          "outline-none transition-colors",
          "focus:border-red-500 focus:ring-1 focus:ring-red-500/40",
        ].join(" ")}
      />
      <button
        type="submit"
        className={[
          "flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2.5",
          "text-sm font-bold text-white transition-colors hover:bg-red-700",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950",
        ].join(" ")}
      >
        Subscribe <ArrowRight className="size-3.5" />
      </button>
    </form>
  );
}

// ─── Main Footer ──────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer
      className="mt-auto border-t border-neutral-800 bg-neutral-950 text-neutral-400"
      aria-label="Site footer"
    >

      {/* ── Zone 1: Newsletter CTA ──────────────────────────────────── */}
      <div className="border-b border-neutral-800 bg-neutral-900">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-500">
              <Send className="size-3.5" />
              Breaking News Alerts
            </p>
            <h2 className="mt-1 font-headline text-lg font-black text-white">
              Stay ahead of every story.
            </h2>
            <p className="mt-0.5 text-sm text-neutral-400">
              Get the most important headlines delivered to your inbox — no spam, ever.
            </p>
          </div>
          <div className="shrink-0">
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* ── Zone 2: Multi-Column Navigation ────────────────────────── */}
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">

          {/* Brand column — spans 2 cols on lg */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <Link
              href="/"
              className="font-headline text-2xl font-black text-white transition-colors hover:text-red-400"
            >
              NewsroomX
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">
              India's most advanced AI-powered digital newsroom. Real-time
              updates, Gemini AI analysis, live cricket & markets — all in one
              platform.
            </p>

            {/* App download badges */}
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href="#"
                aria-label="Download on the App Store"
                className={[
                  "flex items-center gap-2 rounded-lg border border-neutral-700",
                  "px-3 py-2 text-xs font-semibold text-neutral-300",
                  "transition-colors hover:border-neutral-500 hover:text-white",
                ].join(" ")}
              >
                <Smartphone className="size-4 shrink-0" />
                <span>
                  <span className="block text-[9px] font-normal text-neutral-500 uppercase tracking-wider">Download on the</span>
                  App Store
                </span>
              </a>
              <a
                href="#"
                aria-label="Get it on Google Play"
                className={[
                  "flex items-center gap-2 rounded-lg border border-neutral-700",
                  "px-3 py-2 text-xs font-semibold text-neutral-300",
                  "transition-colors hover:border-neutral-500 hover:text-white",
                ].join(" ")}
              >
                <Smartphone className="size-4 shrink-0" />
                <span>
                  <span className="block text-[9px] font-normal text-neutral-500 uppercase tracking-wider">Get it on</span>
                  Google Play
                </span>
              </a>
            </div>

            {/* Social icons */}
            <div className="mt-5 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    "border border-neutral-800 text-neutral-500",
                    "transition-all hover:border-neutral-600 hover:text-white",
                  ].join(" ")}
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.heading}>
              {/* Column header — red left-border accent from the blueprint */}
              <h3 className="border-l-2 border-red-600 pl-2 text-xs font-semibold uppercase tracking-widest text-white">
                {col.heading}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── Zone 3: Copyright bar ───────────────────────────────────── */}
      <div className="border-t border-neutral-800">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">

          {/* Copyright */}
          <p className="text-xs text-neutral-500">
            © {YEAR} Biskranti IT Innovation Pvt. Ltd. | Powered by Shubhstra Tech Ltd. All rights reserved.
          </p>

          {/* Legal quick links */}
          <nav
            aria-label="Legal links"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
          >
            {["Privacy Policy", "Terms of Service", "Cookie Policy", "Sitemap"].map((label) => (
              <Link
                key={label}
                href="#"
                className="text-xs text-neutral-500 transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Language selector */}
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="text-neutral-600">|</span>
            {[
              { code: "EN", label: "English" },
              { code: "मर", label: "मराठी"  },
              { code: "हि", label: "हिंदी"   },
            ].map(({ code, label }) => (
              <button
                key={code}
                aria-label={`Switch to ${label}`}
                className="rounded px-1.5 py-0.5 text-[11px] font-semibold transition-colors hover:bg-neutral-800 hover:text-white"
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
}
