"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Newspaper, Video, ShoppingBag, Zap, Sun, Search, Archive } from "lucide-react";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { PositiveNewsToggle } from "@/components/news/positive-news-toggle";
import { StockTicker } from "@/components/news/stock-ticker";
import { LoyaltyCounter } from "@/components/news/loyalty-counter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavSection } from "@/types/news";

const QUICK_LINKS = [
  { label: "E-Paper", href: "/epaper", icon: Newspaper, color: "text-red-600" },
  { label: "Video", href: "/video", icon: Video, color: "text-blue-600" },
  { label: "Stories", href: "/stories", icon: Zap, color: "text-orange-500" },
  { label: "जाहिराती", href: "/classifieds", icon: ShoppingBag, color: "text-amber-600" },
  { label: "Archive", href: "/archive", icon: Archive, color: "text-neutral-600" },
  { label: "Search", href: "/search", icon: Search, color: "text-neutral-600" },
];

interface NavbarProps {
  sections: NavSection[];
}

export function Navbar({ sections }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          {/* Hamburger — mobile only */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 md:hidden dark:border-neutral-700"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>

          <Link href="/" className="font-headline text-xl font-bold tracking-tight">
            NewsroomX
          </Link>

          {/* Desktop nav */}
          <nav className="ml-3 hidden items-center gap-1 md:flex">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-900",
                  "dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-white",
                )}
              >
                {section.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-2">
            {/* Desktop only extras */}
            <div className="hidden md:flex md:items-center md:gap-2">
              <PositiveNewsToggle />
              {QUICK_LINKS.slice(0, 3).map((ql) => (
                <Link
                  key={ql.href}
                  href={ql.href}
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
                >
                  {ql.label}
                </Link>
              ))}
            </div>
            <ThemeToggle />
            <LoyaltyCounter />
            <Link href="/login">
              <Button size="sm">Login</Button>
            </Link>
          </div>
        </div>

        {/* Desktop category scroll bar */}
        <nav className="mx-auto hidden w-full max-w-7xl items-center gap-2 overflow-x-auto px-4 pb-2 md:flex sm:px-6 lg:px-8">
          {sections.map((section) => (
            <Link
              key={`scroll-${section.id}`}
              href={section.href}
              className="shrink-0 rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-600 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-300 dark:hover:text-white"
            >
              {section.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Live Stock Market Ticker — Phase 2 */}
      <StockTicker />

      {/* Mobile full-screen drawer */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-white shadow-2xl dark:bg-neutral-950 md:hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4 dark:border-neutral-800">
              <Link href="/" onClick={() => setMenuOpen(false)} className="font-headline text-lg font-black">
                NewsroomX
              </Link>
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                <X className="size-4" />
              </button>
            </div>

            {/* Quick links */}
            <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Quick Access</p>
              <div className="grid grid-cols-3 gap-2">
                {QUICK_LINKS.map((ql) => {
                  const Icon = ql.icon;
                  return (
                    <Link
                      key={ql.href}
                      href={ql.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-neutral-100 py-3 text-center transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    >
                      <Icon className={`size-5 ${ql.color}`} />
                      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{ql.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">Categories</p>
              <div className="space-y-0.5">
                {sections.map((section) => (
                  <Link
                    key={section.id}
                    href={section.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-900"
                  >
                    {section.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom — Positive toggle + Login */}
            <div className="border-t border-neutral-100 px-4 py-4 dark:border-neutral-800">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  <Sun className="mr-1.5 inline size-4 text-amber-500" />
                  Positive News
                </span>
                <PositiveNewsToggle />
              </div>
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button className="w-full" size="sm">Subscribe / Login</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
