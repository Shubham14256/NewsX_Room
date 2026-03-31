"use client";

import { useEffect, useRef, useState } from "react";
import { unstable_catchError as catchError } from "next/error";
import { Sparkles, Bookmark, BookmarkCheck, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ZodiacSign {
  id:      string;
  name:    string;   // English
  marathi: string;   // Marathi name
  emoji:   string;
  dates:   string;   // date range label
  element: "fire" | "earth" | "air" | "water";
}

interface HoroscopeReading {
  text:        string;
  luckyColor:  string;
  luckyNumber: number;
  luckyTime:   string;
  mood:        string;
}

// ─── Zodiac data ──────────────────────────────────────────────────────────────

const SIGNS: ZodiacSign[] = [
  { id: "aries",       name: "Aries",       marathi: "मेष",     emoji: "♈", dates: "Mar 21 – Apr 19", element: "fire"  },
  { id: "taurus",      name: "Taurus",      marathi: "वृषभ",    emoji: "♉", dates: "Apr 20 – May 20", element: "earth" },
  { id: "gemini",      name: "Gemini",      marathi: "मिथुन",   emoji: "♊", dates: "May 21 – Jun 20", element: "air"   },
  { id: "cancer",      name: "Cancer",      marathi: "कर्क",    emoji: "♋", dates: "Jun 21 – Jul 22", element: "water" },
  { id: "leo",         name: "Leo",         marathi: "सिंह",    emoji: "♌", dates: "Jul 23 – Aug 22", element: "fire"  },
  { id: "virgo",       name: "Virgo",       marathi: "कन्या",   emoji: "♍", dates: "Aug 23 – Sep 22", element: "earth" },
  { id: "libra",       name: "Libra",       marathi: "तुला",    emoji: "♎", dates: "Sep 23 – Oct 22", element: "air"   },
  { id: "scorpio",     name: "Scorpio",     marathi: "वृश्चिक", emoji: "♏", dates: "Oct 23 – Nov 21", element: "water" },
  { id: "sagittarius", name: "Sagittarius", marathi: "धनु",     emoji: "♐", dates: "Nov 22 – Dec 21", element: "fire"  },
  { id: "capricorn",   name: "Capricorn",   marathi: "मकर",     emoji: "♑", dates: "Dec 22 – Jan 19", element: "earth" },
  { id: "aquarius",    name: "Aquarius",    marathi: "कुंभ",    emoji: "♒", dates: "Jan 20 – Feb 18", element: "air"   },
  { id: "pisces",      name: "Pisces",      marathi: "मीन",     emoji: "♓", dates: "Feb 19 – Mar 20", element: "water" },
];

const ELEMENT_STYLES: Record<ZodiacSign["element"], string> = {
  fire:  "from-orange-500/20 to-red-500/10 border-orange-300/40 dark:border-orange-700/30",
  earth: "from-emerald-500/20 to-teal-500/10 border-emerald-300/40 dark:border-emerald-700/30",
  air:   "from-sky-500/20 to-violet-500/10 border-sky-300/40 dark:border-sky-700/30",
  water: "from-blue-500/20 to-cyan-500/10 border-blue-300/40 dark:border-blue-700/30",
};

const ELEMENT_BADGE: Record<ZodiacSign["element"], string> = {
  fire:  "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  earth: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  air:   "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  water: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

// ─── Deterministic reading generator ─────────────────────────────────────────
// Seeded by (dateString + signId) so the reading is stable for the entire day
// but changes the next day. No Math.random() — pure deterministic hash.

const READINGS_POOL = [
  "आज तुमच्यासाठी एक विशेष दिवस आहे. नवीन संधी दरवाजावर ठोठावत आहेत. आत्मविश्वासाने पुढे जा आणि यश तुमचेच आहे.",
  "आर्थिक बाबतीत आज सावधगिरी बाळगा. कुटुंबाशी संवाद साधणे फायदेशीर ठरेल. संध्याकाळी एक आनंददायी बातमी मिळण्याची शक्यता आहे.",
  "कामाच्या ठिकाणी तुमची मेहनत आज फळाला येईल. वरिष्ठांकडून कौतुक मिळेल. प्रेम संबंधांमध्ये आज विशेष जवळीक अनुभवाल.",
  "आरोग्याकडे लक्ष द्या आणि पुरेशी विश्रांती घ्या. मित्रांसोबत वेळ घालवणे मनाला ताजेतवाने करेल. नवीन प्रकल्पाची सुरुवात करण्यासाठी हा उत्तम दिवस आहे.",
  "आज तुमची सर्जनशीलता शिखरावर असेल. कलात्मक कामांमध्ये यश मिळेल. प्रवासाची योजना आखण्यासाठी हा दिवस अनुकूल आहे.",
  "व्यावसायिक निर्णय घेताना विचारपूर्वक पाऊल टाका. जुन्या मित्राशी भेट होण्याची शक्यता आहे. आर्थिक लाभाचे संकेत दिसत आहेत.",
  "आज तुमच्या जीवनात सकारात्मक बदल येण्याची शक्यता आहे. ध्यान आणि योगाभ्यास केल्यास मन शांत राहील. कुटुंबासाठी काही विशेष करण्याची संधी मिळेल.",
  "शिक्षण आणि ज्ञानाच्या क्षेत्रात आज विशेष प्रगती होईल. नवीन कौशल्य शिकण्यासाठी हा उत्तम वेळ आहे. आत्मविश्वास वाढवण्यावर भर द्या.",
  "आज तुमचे नेतृत्वगुण चमकतील. सहकाऱ्यांचा विश्वास संपादन करण्याची संधी आहे. संध्याकाळी कौटुंबिक वातावरण आनंदमय असेल.",
  "आज एखाद्या जुन्या समस्येचे निराकरण होण्याची शक्यता आहे. नवीन व्यावसायिक संपर्क फायदेशीर ठरतील. स्वतःवर विश्वास ठेवा.",
  "प्रेम आणि नातेसंबंधांमध्ये आज विशेष उबदारपणा जाणवेल. आर्थिक स्थिती सुधारण्याचे संकेत आहेत. आरोग्य उत्तम राहील.",
  "आज तुमची अंतर्ज्ञानशक्ती तीव्र असेल. महत्त्वाचे निर्णय घेण्यासाठी हा योग्य वेळ आहे. सामाजिक कार्यात सहभागी होणे लाभदायक ठरेल.",
];

const COLORS = ["लाल", "निळा", "हिरवा", "पिवळा", "केशरी", "जांभळा", "पांढरा", "गुलाबी", "सोनेरी", "आकाशी"];
const MOODS  = ["उत्साही 🌟", "शांत 🌿", "आनंदी 😊", "आत्मविश्वासू 💪", "सर्जनशील 🎨", "प्रेमळ ❤️", "विचारशील 🤔", "धाडसी ⚡"];
const TIMES  = ["सकाळी ७–९", "दुपारी १२–२", "संध्याकाळी ५–७", "रात्री ८–१०", "सकाळी ९–११"];

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function getReading(signId: string, dateStr: string): HoroscopeReading {
  const seed = hashCode(`${dateStr}:${signId}`);
  return {
    text:        READINGS_POOL[seed % READINGS_POOL.length]!,
    luckyColor:  COLORS[(seed >> 3) % COLORS.length]!,
    luckyNumber: (seed % 9) + 1,
    luckyTime:   TIMES[(seed >> 5) % TIMES.length]!,
    mood:        MOODS[(seed >> 7) % MOODS.length]!,
  };
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

const LS_SAVED_ZODIAC = "newsx_saved_zodiac";

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key); }
  catch { return null; }
}

function lsSet(key: string, val: string): void {
  try { localStorage.setItem(key, val); }
  catch { /* Safari private mode */ }
}

function lsRemove(key: string): void {
  try { localStorage.removeItem(key); }
  catch { /* silently ignore */ }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function todayLabel(): string {
  return new Intl.DateTimeFormat("mr-IN", { dateStyle: "full" }).format(new Date());
}

// ─── Inner component ──────────────────────────────────────────────────────────

function DailyHoroscopeInner() {
  const [mounted,    setMounted]    = useState(false);
  const [selected,   setSelected]   = useState<string | null>(null);
  const [savedSign,  setSavedSign]  = useState<string | null>(null);
  const [saveAnim,   setSaveAnim]   = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Restore saved zodiac after mount
  useEffect(() => {
    if (!mounted) return;
    const saved = lsGet(LS_SAVED_ZODIAC);
    if (saved) {
      setSavedSign(saved);
      setSelected(saved); // auto-expand their sign
    }
  }, [mounted]);

  // Cleanup save animation timer
  useEffect(() => {
    return () => {
      if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
    };
  }, []);

  function handleSelect(signId: string) {
    setSelected((prev) => prev === signId ? null : signId);
  }

  function handleSave(signId: string) {
    if (savedSign === signId) {
      // Unsave
      lsRemove(LS_SAVED_ZODIAC);
      setSavedSign(null);
    } else {
      lsSet(LS_SAVED_ZODIAC, signId);
      setSavedSign(signId);
      // Trigger save animation
      if (saveTimerRef.current !== null) clearTimeout(saveTimerRef.current);
      setSaveAnim(true);
      saveTimerRef.current = setTimeout(() => {
        setSaveAnim(false);
        saveTimerRef.current = null;
      }, 800);
    }
  }

  if (!mounted) {
    // Skeleton — same dimensions as the real component, no layout shift
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-4 h-5 w-40 rounded bg-neutral-200 dark:bg-neutral-700" />
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const date    = todayStr();
  const dateLabel = todayLabel();
  const selectedSign = SIGNS.find((s) => s.id === selected);
  const reading = selectedSign ? getReading(selectedSign.id, date) : null;

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
      aria-label="दैनिक राशीभविष्य"
    >
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-neutral-100 bg-gradient-to-r from-violet-50 to-indigo-50 px-5 py-3 dark:border-neutral-800 dark:from-violet-950/20 dark:to-indigo-950/20">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" />
            <h2 className="font-headline text-base font-bold text-neutral-900 dark:text-white">
              दैनिक राशीभविष्य
            </h2>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
              आजचे
            </span>
          </div>
          {savedSign && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 dark:text-violet-400">
              <BookmarkCheck className="size-3" />
              {SIGNS.find((s) => s.id === savedSign)?.marathi} सेव्ह केले
            </span>
          )}
        </div>

        {/* ── Zodiac grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-1.5 p-3 sm:grid-cols-12">
          {SIGNS.map((sign) => {
            const isSelected = selected === sign.id;
            const isSaved    = savedSign === sign.id;

            return (
              <button
                key={sign.id}
                onClick={() => handleSelect(sign.id)}
                aria-label={`${sign.marathi} (${sign.name}) राशी निवडा`}
                aria-pressed={isSelected}
                className={[
                  "group flex flex-col items-center gap-0.5 rounded-xl border py-2 transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1",
                  isSelected
                    ? "border-violet-400 bg-violet-50 shadow-sm dark:border-violet-600 dark:bg-violet-950/30"
                    : "border-neutral-100 bg-neutral-50 hover:border-neutral-300 hover:bg-white dark:border-neutral-800 dark:bg-neutral-800/50 dark:hover:border-neutral-600",
                ].join(" ")}
              >
                <span className={["text-lg leading-none transition-transform duration-200", isSelected ? "scale-125" : "group-hover:scale-110"].join(" ")}>
                  {sign.emoji}
                </span>
                <span className={[
                  "text-[9px] font-bold leading-none",
                  isSelected ? "text-violet-700 dark:text-violet-300" : "text-neutral-500 dark:text-neutral-400",
                ].join(" ")}>
                  {sign.marathi}
                </span>
                {isSaved && (
                  <span className="text-[8px] text-violet-500">●</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Reading card — expands when a sign is selected ───────── */}
        {selectedSign && reading && (
          <div
            className={[
              "mx-3 mb-3 overflow-hidden rounded-xl border bg-gradient-to-br p-4",
              ELEMENT_STYLES[selectedSign.element],
            ].join(" ")}
            // aria-live so screen readers announce the reading when it appears
            aria-live="polite"
            aria-atomic="true"
          >
            {/* Reading header */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedSign.emoji}</span>
                  <div>
                    <p className="font-headline text-lg font-black text-neutral-900 dark:text-white">
                      {selectedSign.marathi}
                      <span className="ml-1.5 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                        ({selectedSign.name})
                      </span>
                    </p>
                    <p className="text-[10px] text-neutral-400">{selectedSign.dates}</p>
                  </div>
                </div>
                <p className="mt-1 text-[10px] font-semibold text-neutral-400">
                  📅 {dateLabel}
                </p>
              </div>

              {/* Element badge */}
              <span className={["shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase", ELEMENT_BADGE[selectedSign.element]].join(" ")}>
                {selectedSign.element}
              </span>
            </div>

            {/* Reading text */}
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
              {reading.text}
            </p>

            {/* Lucky details */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "शुभ रंग",  value: reading.luckyColor  },
                { label: "शुभ अंक",  value: String(reading.luckyNumber) },
                { label: "शुभ वेळ",  value: reading.luckyTime   },
                { label: "मूड",      value: reading.mood        },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-lg border border-white/60 bg-white/50 px-2.5 py-2 dark:border-neutral-700/40 dark:bg-neutral-800/40"
                >
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs font-bold text-neutral-800 dark:text-neutral-100">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Save button */}
            <button
              onClick={() => handleSave(selectedSign.id)}
              aria-label={savedSign === selectedSign.id ? "माझी रास अनसेव्ह करा" : "माझी रास सेव्ह करा"}
              className={[
                "mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-1",
                savedSign === selectedSign.id
                  ? "border-violet-400 bg-violet-100 text-violet-700 dark:border-violet-600 dark:bg-violet-900/30 dark:text-violet-300"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-violet-300 hover:bg-violet-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
                saveAnim && savedSign === selectedSign.id ? "scale-105" : "scale-100",
              ].join(" ")}
            >
              {savedSign === selectedSign.id
                ? <><BookmarkCheck className="size-3.5" /> माझी रास सेव्ह केली ✓</>
                : <><Bookmark className="size-3.5" /> माझी रास सेव्ह करा</>}
            </button>
          </div>
        )}

        {/* Prompt when nothing selected */}
        {!selected && (
          <div className="flex items-center justify-center gap-2 pb-4 text-xs text-neutral-400">
            <ChevronDown className="size-3.5 animate-bounce" />
            तुमची रास निवडा
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Error boundary ───────────────────────────────────────────────────────────

function HoroscopeFallback(
  _props: {},
  { error }: { error: Error; unstable_retry: () => void; reset: () => void },
) {
  if (process.env.NODE_ENV === "development") {
    console.warn("[DailyHoroscope] Render error suppressed:", error.message);
  }
  return null;
}

const HoroscopeBoundary = catchError(HoroscopeFallback);

export function DailyHoroscope() {
  return (
    <HoroscopeBoundary>
      <DailyHoroscopeInner />
    </HoroscopeBoundary>
  );
}
