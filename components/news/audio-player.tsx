"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, Square, Headphones } from "lucide-react";

interface Props {
  title: string;
  content: string; // raw HTML — will be stripped before reading
}

type PlayerState = "idle" | "playing" | "paused" | "unsupported";

const SPEED_OPTIONS = [1, 1.5, 2] as const;
type Speed = (typeof SPEED_OPTIONS)[number];

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    // Strip mock AI prefixes injected by fallback functions
    .replace(/^Mock AI (Summary|Rewrite|SEO):\s*/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function pickVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  // 1. Prefer Marathi voices
  const marathi = voices.find(
    (v) => v.lang.includes("mr") || v.name.toLowerCase().includes("marathi"),
  );
  if (marathi) return marathi;

  // 2. Fallback: Hindi (closest to Marathi phonetics)
  const hindi = voices.find((v) => v.lang.startsWith("hi"));
  if (hindi) return hindi;

  // 3. Fallback: any English voice
  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

export function AudioPlayer({ title, content }: Props) {
  const [state, setState] = useState<PlayerState>("idle");
  const [speed, setSpeed] = useState<Speed>(1);
  const [progress, setProgress] = useState(0); // 0–100
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const charIndexRef = useRef(0);
  const totalCharsRef = useRef(0);

  // Check support on mount
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setState("unsupported");
    }
  }, []);

  // Cancel speech on unmount (prevents audio continuing after navigation)
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const clearProgressTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const buildUtterance = useCallback(
    (text: string, startChar = 0): SpeechSynthesisUtterance => {
      const utter = new SpeechSynthesisUtterance(text.slice(startChar));
      utter.rate = speed;
      // Force Marathi language — browser will use best available voice
      utter.lang = "mr-IN";

      const voices = window.speechSynthesis.getVoices();
      const voice = pickVoice(voices);
      if (voice) utter.voice = voice;

      totalCharsRef.current = text.length;

      utter.onboundary = (e) => {
        if (e.name === "word") {
          charIndexRef.current = startChar + e.charIndex;
          const pct = Math.min(100, (charIndexRef.current / totalCharsRef.current) * 100);
          setProgress(pct);
        }
      };

      utter.onend = () => {
        setState("idle");
        setProgress(0);
        charIndexRef.current = 0;
        clearProgressTimer();
      };

      utter.onerror = () => {
        setState("idle");
        clearProgressTimer();
      };

      return utter;
    },
    [speed],
  );

  function handlePlay() {
    if (state === "unsupported") return;

    const text = `${title}. ${stripHtml(content)}`;

    if (state === "paused") {
      window.speechSynthesis.resume();
      setState("playing");
      return;
    }

    window.speechSynthesis.cancel();
    const utter = buildUtterance(text, charIndexRef.current);
    utteranceRef.current = utter;

    // Voices may not be loaded yet — wait for them
    const speak = () => {
      window.speechSynthesis.speak(utter);
      setState("playing");
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      speak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        // Re-pick voice now that they're loaded
        const voice = pickVoice(window.speechSynthesis.getVoices());
        if (voice) utter.voice = voice;
        speak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }

  function handlePause() {
    window.speechSynthesis.pause();
    setState("paused");
  }

  function handleStop() {
    window.speechSynthesis.cancel();
    setState("idle");
    setProgress(0);
    charIndexRef.current = 0;
    clearProgressTimer();
  }

  function cycleSpeed() {
    const idx = SPEED_OPTIONS.indexOf(speed);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    setSpeed(next);
    // If currently playing, restart at current position with new speed
    if (state === "playing") {
      window.speechSynthesis.cancel();
      const text = `${title}. ${stripHtml(content)}`;
      const utter = buildUtterance(text, charIndexRef.current);
      utter.rate = next;
      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    }
  }

  if (state === "unsupported") return null;

  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-700 dark:bg-neutral-800/50">
      <Headphones className="size-4 shrink-0 text-neutral-400" />

      {/* Play / Pause */}
      <button
        onClick={state === "playing" ? handlePause : handlePlay}
        aria-label={state === "playing" ? "Pause audio" : "Play audio"}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-neutral-900"
      >
        {state === "playing" ? (
          <Pause className="size-3.5" />
        ) : (
          <Play className="size-3.5 translate-x-px" />
        )}
      </button>

      {/* Progress bar */}
      <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-neutral-900 transition-all duration-300 dark:bg-white"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Speed toggle */}
      <button
        onClick={cycleSpeed}
        aria-label={`Playback speed ${speed}x`}
        className="w-10 shrink-0 rounded-md border border-neutral-300 px-1.5 py-0.5 text-center text-xs font-semibold text-neutral-600 transition-colors hover:border-neutral-500 dark:border-neutral-600 dark:text-neutral-300"
      >
        {speed}x
      </button>

      {/* Stop */}
      {(state === "playing" || state === "paused") && (
        <button
          onClick={handleStop}
          aria-label="Stop audio"
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
        >
          <Square className="size-3.5" />
        </button>
      )}

      <span className="hidden text-xs text-neutral-400 sm:block">Listen</span>
    </div>
  );
}
