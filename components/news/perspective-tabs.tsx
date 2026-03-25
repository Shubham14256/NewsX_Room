"use client";

import { useState } from "react";

type Perspective = "left" | "facts" | "right";

const TABS: { id: Perspective; label: string; emoji: string; color: string }[] = [
  { id: "left", label: "डाव्या विचारांचे", emoji: "🔴", color: "text-red-600 dark:text-red-400" },
  { id: "facts", label: "तटस्थ तथ्ये", emoji: "⚪", color: "text-neutral-700 dark:text-neutral-200" },
  { id: "right", label: "उजव्या विचारांचे", emoji: "🔵", color: "text-blue-600 dark:text-blue-400" },
];

const PERSPECTIVE_LABELS: Record<Perspective, string> = {
  left: "हा दृष्टिकोन सामाजिक न्याय, समानता आणि सरकारी हस्तक्षेपाच्या बाजूने आहे.",
  facts: "हे विश्लेषण केवळ सत्यापित तथ्यांवर आधारित आहे — कोणताही राजकीय पक्षपात नाही.",
  right: "हा दृष्टिकोन राष्ट्रीय सुरक्षा, बाजारपेठ स्वातंत्र्य आणि परंपरागत मूल्यांवर भर देतो.",
};

export function PerspectiveTabs() {
  const [active, setActive] = useState<Perspective>("facts");

  return (
    <div className="my-5 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/60 shadow-sm backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-900/60">
      {/* Tab bar */}
      <div className="relative flex border-b border-neutral-200/60 dark:border-neutral-700/60">
        {/* Sliding pill */}
        <div
          className="absolute bottom-0 top-0 w-1/3 rounded-t-xl bg-neutral-100/80 transition-all duration-300 ease-out dark:bg-neutral-800/80"
          style={{
            left: `${TABS.findIndex((t) => t.id === active) * 33.33}%`,
          }}
        />
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`relative z-10 flex flex-1 items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors sm:text-sm ${
              active === tab.id ? tab.color : "text-neutral-400 dark:text-neutral-500"
            }`}
          >
            <span>{tab.emoji}</span>
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Perspective note */}
      <div className="px-4 py-3">
        <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          {PERSPECTIVE_LABELS[active]}
        </p>
        <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
          ✨ AI-generated perspectives for unbiased reading. Content remains unchanged.
        </p>
      </div>
    </div>
  );
}
