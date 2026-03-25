"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, ChevronRight, TrendingUp, Clock } from "lucide-react";

const YEARS = [2026, 2025, 2024, 2023];
const MONTHS = [
  "जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल",
  "मे", "जून", "जुलै", "ऑगस्ट",
  "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर",
];

const MOCK_ARCHIVE: Record<string, { id: string; title: string; category: string; date: string; views: string; slug: string }[]> = {
  "2026-2": [
    { id: "a1", title: "महाराष्ट्र विधानसभा अधिवेशन: नवीन कृषी विधेयक मंजूर", category: "राजकारण", date: "फेब्रुवारी १५, २०२६", views: "45K", slug: "/search?q=कृषी+विधेयक" },
    { id: "a2", title: "पुणे मेट्रो फेज-३ ला केंद्र सरकारची मंजुरी", category: "शहर", date: "फेब्रुवारी १२, २०२६", views: "32K", slug: "/search?q=पुणे+मेट्रो" },
    { id: "a3", title: "ISRO चे नवीन उपग्रह यशस्वीरित्या प्रक्षेपित", category: "विज्ञान", date: "फेब्रुवारी १०, २०२६", views: "78K", slug: "/search?q=ISRO" },
    { id: "a4", title: "RBI ने व्याजदर स्थिर ठेवले — बाजारात सकारात्मक प्रतिक्रिया", category: "अर्थव्यवस्था", date: "फेब्रुवारी ८, २०२६", views: "29K", slug: "/search?q=RBI+व्याजदर" },
    { id: "a5", title: "भारत-ऑस्ट्रेलिया क्रिकेट मालिका: भारताचा ३-१ ने विजय", category: "क्रीडा", date: "फेब्रुवारी ५, २०२६", views: "1.2M", slug: "/search?q=क्रिकेट" },
    { id: "a6", title: "AI स्टार्टअप्सना सरकारी निधी: ₹५०० कोटींची घोषणा", category: "तंत्रज्ञान", date: "फेब्रुवारी ३, २०२६", views: "56K", slug: "/search?q=AI+स्टार्टअप" },
  ],
  "2026-1": [
    { id: "b1", title: "नवीन वर्षात शेअर बाजार विक्रमी उच्चांकावर", category: "अर्थव्यवस्था", date: "जानेवारी ३१, २०२६", views: "88K", slug: "/search?q=शेअर+बाजार" },
    { id: "b2", title: "महाराष्ट्रात थंडीची लाट — मुंबईत तापमान १२ अंशांवर", category: "हवामान", date: "जानेवारी २५, २०२६", views: "41K", slug: "/search?q=थंडी+मुंबई" },
    { id: "b3", title: "Tata Motors चे नवीन इलेक्ट्रिक SUV लाँच", category: "वाहने", date: "जानेवारी २०, २०२६", views: "95K", slug: "/search?q=Tata+Electric" },
    { id: "b4", title: "पद्म पुरस्कार जाहीर — महाराष्ट्रातील ५ मान्यवरांचा समावेश", category: "राष्ट्रीय", date: "जानेवारी १५, २०२६", views: "67K", slug: "/search?q=पद्म+पुरस्कार" },
  ],
  "2025-12": [
    { id: "c1", title: "२०२५ चा आढावा: भारताची सर्वात मोठी उपलब्धी", category: "विशेष", date: "डिसेंबर ३१, २०२५", views: "2.4M", slug: "/search?q=2025+आढावा" },
    { id: "c2", title: "नाताळ उत्सव: मुंबईत लाखो पर्यटक", category: "मनोरंजन", date: "डिसेंबर २५, २०२५", views: "340K", slug: "/search?q=नाताळ+मुंबई" },
    { id: "c3", title: "संसदेचे हिवाळी अधिवेशन संपन्न — ३२ विधेयके मंजूर", category: "राजकारण", date: "डिसेंबर २०, २०२५", views: "52K", slug: "/search?q=संसद+अधिवेशन" },
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  राजकारण: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  अर्थव्यवस्था: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  क्रीडा: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  तंत्रज्ञान: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  विज्ञान: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  शहर: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  default: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
};

// Monthly article counts for the heatmap
const MONTHLY_COUNTS: Record<number, number[]> = {
  2026: [124, 98, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  2025: [145, 132, 178, 156, 189, 167, 143, 198, 172, 165, 154, 201],
  2024: [132, 118, 165, 143, 176, 154, 138, 187, 161, 152, 141, 189],
  2023: [98, 87, 134, 112, 145, 123, 107, 156, 130, 121, 110, 158],
};

export default function ArchivePage() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(2);

  const archiveKey = `${selectedYear}-${selectedMonth}`;
  const articles = MOCK_ARCHIVE[archiveKey] ?? [];
  const counts = MONTHLY_COUNTS[selectedYear] ?? [];
  const maxCount = Math.max(...counts.filter((c) => c > 0), 1);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero */}
      <div className="border-b border-neutral-200 bg-white px-4 py-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 dark:bg-white">
              <Calendar className="size-5 text-white dark:text-neutral-900" />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-black text-neutral-900 dark:text-white sm:text-3xl">
                News Archive
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Browse our complete history of published stories
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {/* Year selector */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-neutral-500">Year:</span>
          {YEARS.map((year) => (
            <button
              key={year}
              onClick={() => { setSelectedYear(year); setSelectedMonth(1); }}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-all ${
                selectedYear === year
                  ? "bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        {/* Month heatmap grid */}
        <div className="mb-8 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Select Month — Article Volume
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
            {MONTHS.map((month, idx) => {
              const count = counts[idx] ?? 0;
              const intensity = count > 0 ? Math.ceil((count / maxCount) * 4) : 0;
              const isSelected = selectedMonth === idx + 1;
              const bgMap = ["bg-neutral-100 dark:bg-neutral-800", "bg-red-100 dark:bg-red-900/30", "bg-red-200 dark:bg-red-800/40", "bg-red-400 dark:bg-red-700/60", "bg-red-600 dark:bg-red-600"];
              return (
                <button
                  key={month}
                  onClick={() => count > 0 && setSelectedMonth(idx + 1)}
                  disabled={count === 0}
                  className={`group flex flex-col items-center gap-1 rounded-xl p-2 transition-all ${
                    isSelected
                      ? "ring-2 ring-neutral-900 ring-offset-1 dark:ring-white"
                      : count > 0 ? "hover:scale-105" : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className={`h-8 w-full rounded-lg ${bgMap[intensity]} transition-colors`} />
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                    {month.slice(0, 3)}
                  </span>
                  {count > 0 && (
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-neutral-900 dark:text-white">
              {MONTHS[selectedMonth - 1]} {selectedYear}
              <span className="ml-2 text-sm font-normal text-neutral-400">
                ({articles.length} articles)
              </span>
            </h2>
            <div className="flex items-center gap-1 text-xs text-neutral-400">
              <TrendingUp className="size-3.5" /> Sorted by popularity
            </div>
          </div>

          {articles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 py-16 text-center dark:border-neutral-700">
              <Calendar className="mx-auto mb-3 size-10 text-neutral-300 dark:text-neutral-600" />
              <p className="font-semibold text-neutral-500">No articles for this period</p>
              <p className="mt-1 text-sm text-neutral-400">Select a different month or year</p>
            </div>
          ) : (
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-800" />

              {articles.map((article, idx) => (
                <div key={article.id} className="relative flex gap-4 pb-4 pl-10">
                  {/* Timeline dot */}
                  <div className={`absolute left-2.5 top-3 h-3 w-3 rounded-full border-2 border-white shadow-sm dark:border-neutral-950 ${
                    idx === 0 ? "bg-red-500" : "bg-neutral-400 dark:bg-neutral-600"
                  }`} />

                  <Link
                    href={article.slug}
                    className="group flex-1 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[article.category] ?? CATEGORY_COLORS.default}`}>
                            {article.category}
                          </span>
                          {idx === 0 && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                              🔥 Top Story
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 font-headline text-sm font-bold leading-snug text-neutral-900 group-hover:text-red-700 dark:text-neutral-100 dark:group-hover:text-red-400 sm:text-base">
                          {article.title}
                        </h3>
                      </div>
                      <ChevronRight className="mt-1 size-4 shrink-0 text-neutral-300 group-hover:text-neutral-600 dark:text-neutral-600 dark:group-hover:text-neutral-300" />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" /> {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="size-3" /> {article.views} views
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
