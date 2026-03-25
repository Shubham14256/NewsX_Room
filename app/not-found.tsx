import Link from "next/link";
import { Search, Home, ArrowLeft, Newspaper } from "lucide-react";

const SUGGESTED = [
  { label: "राजकारण", href: "/category/politics" },
  { label: "क्रीडा", href: "/category/sports" },
  { label: "तंत्रज्ञान", href: "/category/tech" },
  { label: "E-Paper", href: "/epaper" },
];

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-16 dark:bg-neutral-950">
      <div className="w-full max-w-lg text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 shadow-xl dark:bg-white">
            <Newspaper className="size-7 text-white dark:text-neutral-900" />
          </div>
        </div>

        {/* 404 gradient text */}
        <p
          className="font-headline text-8xl font-black leading-none sm:text-9xl"
          style={{
            background: "linear-gradient(135deg, #ef4444, #f97316, #eab308)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          404
        </p>

        <h1 className="mt-4 font-headline text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">
          Lost in the Newsroom?
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          ही बातमी सापडली नाही. कदाचित ती हलवली गेली असेल किंवा हटवली गेली असेल.
          <br />खाली शोधा किंवा मुख्यपृष्ठावर परत जा.
        </p>

        {/* Search bar */}
        <div className="mt-8">
          <form action="/search" method="get">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-neutral-400" />
              <input
                name="q"
                type="search"
                placeholder="बातमी शोधा..."
                className="w-full rounded-2xl border border-neutral-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none transition-shadow focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500"
              />
            </div>
          </form>
        </div>

        {/* Suggested categories */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {SUGGESTED.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-white"
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 sm:w-auto"
          >
            <Home className="size-4" />
            Return to Frontpage
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}
