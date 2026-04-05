"use client";

// ─── Horoscope Mini Feed Widget ───────────────────────────────────────────────
// A compact teaser card — shows the user's saved zodiac reading or a prompt
// to visit the full horoscope. Separate chunk from the full DailyHoroscope.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

const LS_SAVED_ZODIAC = "newsx_saved_zodiac";

const SIGN_EMOJIS: Record<string, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};

const SIGN_MARATHI: Record<string, string> = {
  aries: "मेष", taurus: "वृषभ", gemini: "मिथुन", cancer: "कर्क",
  leo: "सिंह", virgo: "कन्या", libra: "तुला", scorpio: "वृश्चिक",
  sagittarius: "धनु", capricorn: "मकर", aquarius: "कुंभ", pisces: "मीन",
};

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

const LUCKY_COLORS = ["लाल", "निळा", "हिरवा", "पिवळा", "केशरी", "जांभळा", "सोनेरी"];

export default function HoroscopeMini() {
  const [mounted,    setMounted]    = useState(false);
  const [savedSign,  setSavedSign]  = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    try { setSavedSign(localStorage.getItem(LS_SAVED_ZODIAC)); }
    catch { /* Safari private mode */ }
  }, [mounted]);

  if (!mounted) return null;

  const today    = new Date().toISOString().slice(0, 10);
  const seed     = savedSign ? hashCode(`${today}:${savedSign}`) : 0;
  const color    = LUCKY_COLORS[seed % LUCKY_COLORS.length];
  const number   = (seed % 9) + 1;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-r from-violet-50 to-indigo-50 dark:border-neutral-800 dark:from-violet-950/20 dark:to-indigo-950/20">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
              <Sparkles className="size-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
                दैनिक राशीभविष्य
              </p>
              {savedSign ? (
                <p className="font-headline text-base font-bold text-neutral-900 dark:text-white">
                  {SIGN_EMOJIS[savedSign]} {SIGN_MARATHI[savedSign]} · शुभ रंग: {color} · शुभ अंक: {number}
                </p>
              ) : (
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  तुमची रास निवडा आणि आजचे भविष्य जाणून घ्या
                </p>
              )}
            </div>
          </div>
          <Link
            href="/#horoscope"
            className="shrink-0 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-violet-700"
          >
            {savedSign ? "पूर्ण वाचा" : "निवडा"}
          </Link>
        </div>
      </div>
    </div>
  );
}
