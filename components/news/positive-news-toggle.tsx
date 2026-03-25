"use client";

import { useState } from "react";
import { Sun } from "lucide-react";
import { toast } from "sonner";

export function PositiveNewsToggle() {
  const [enabled, setEnabled] = useState(false);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (next) {
      toast.success("✨ AI ने नकारात्मक बातम्या फिल्टर केल्या!", {
        description: "आता फक्त सकारात्मक आणि प्रेरणादायी बातम्या दिसतील.",
        duration: 3000,
      });
    } else {
      toast("सर्व बातम्या पुन्हा दाखवत आहे.", { duration: 2000 });
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle positive news filter"
      title={enabled ? "Positive News: ON" : "Positive News: OFF"}
      className="flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-all duration-300"
      style={{
        borderColor: enabled ? "#f59e0b" : undefined,
        background: enabled
          ? "linear-gradient(135deg, #fef3c7, #fde68a)"
          : undefined,
        color: enabled ? "#92400e" : undefined,
      }}
    >
      <Sun
        className={`size-3.5 transition-all duration-300 ${
          enabled ? "fill-amber-400 text-amber-500" : "text-neutral-400"
        }`}
      />
      <span className={`hidden sm:inline ${enabled ? "" : "text-neutral-500 dark:text-neutral-400"}`}>
        {enabled ? "Positive" : "Positive"}
      </span>
      {/* iOS-style toggle pill */}
      <div
        className={`relative h-4 w-7 rounded-full transition-colors duration-300 ${
          enabled ? "bg-amber-400" : "bg-neutral-300 dark:bg-neutral-600"
        }`}
      >
        <div
          className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-300 ${
            enabled ? "translate-x-3.5" : "translate-x-0.5"
          }`}
        />
      </div>
    </button>
  );
}
