"use client";

import { useState } from "react";
import Link from "next/link";
import { X, ChevronUp, ChevronDown, Share2 } from "lucide-react";
import { toast } from "sonner";

const STORIES = [
  {
    id: "1",
    category: "राजकारण",
    headline: "महाराष्ट्रात नवीन सरकार स्थापन होणार",
    summary:
      "राज्यातील राजकीय घडामोडींमध्ये मोठी उलथापालथ झाली असून नवीन आघाडी सरकार स्थापन होण्याचे संकेत मिळत आहेत. विविध पक्षांमध्ये चर्चा सुरू असून लवकरच अधिकृत घोषणा होण्याची शक्यता आहे.",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80",
    time: "२ तासांपूर्वी",
    readTime: "१ मिनिट",
  },
  {
    id: "2",
    category: "तंत्रज्ञान",
    headline: "भारतात AI क्रांती: ५ लाख नोकऱ्या निर्माण होणार",
    summary:
      "केंद्र सरकारच्या नव्या AI धोरणानुसार पुढील तीन वर्षांत देशभरात पाच लाखांहून अधिक तंत्रज्ञान क्षेत्रातील रोजगार निर्माण होतील. स्टार्टअप्सना विशेष अनुदान देण्याची योजना जाहीर करण्यात आली आहे.",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80",
    time: "४ तासांपूर्वी",
    readTime: "१ मिनिट",
  },
  {
    id: "3",
    category: "क्रीडा",
    headline: "विराट कोहलीने केला ऐतिहासिक विक्रम",
    summary:
      "भारताचा स्टार फलंदाज विराट कोहलीने आंतरराष्ट्रीय क्रिकेटमध्ये एक नवीन विक्रम प्रस्थापित केला आहे. या कामगिरीमुळे त्याने सचिन तेंडुलकरच्या काही विक्रमांशी बरोबरी साधली असून चाहत्यांमध्ये उत्साहाचे वातावरण आहे.",
    image: "https://images.unsplash.com/photo-1540747913346-19212a4b423e?auto=format&fit=crop&w=800&q=80",
    time: "५ तासांपूर्वी",
    readTime: "१ मिनिट",
  },
  {
    id: "4",
    category: "अर्थव्यवस्था",
    headline: "सोन्याचे भाव ७५,००० रुपयांवर पोहोचले",
    summary:
      "आंतरराष्ट्रीय बाजारातील घडामोडींमुळे देशांतर्गत सोन्याच्या किमती विक्रमी उच्चांकावर पोहोचल्या आहेत. गुंतवणूकदारांनी सावधगिरी बाळगण्याचा सल्ला तज्ज्ञांनी दिला असून बाजारात अस्थिरता कायम आहे.",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
    time: "६ तासांपूर्वी",
    readTime: "१ मिनिट",
  },
];

export default function StoriesPage() {
  const [current, setCurrent] = useState(0);

  const goNext = () => setCurrent((p) => Math.min(p + 1, STORIES.length - 1));
  const goPrev = () => setCurrent((p) => Math.max(p - 1, 0));

  const story = STORIES[current]!;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: story.headline, url: window.location.href }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(window.location.href).catch(() => null);
      toast.success("लिंक कॉपी झाली!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Story card */}
      <div className="relative h-full w-full overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-500"
          style={{ backgroundImage: `url(${story.image})` }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

        {/* Progress bars */}
        <div className="absolute left-0 right-0 top-0 flex gap-1 px-4 pt-4">
          {STORIES.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className={`h-full rounded-full bg-white transition-all duration-300 ${
                  i < current ? "w-full" : i === current ? "w-full" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Top bar */}
        <div className="absolute left-0 right-0 top-6 flex items-center justify-between px-4 pt-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600">
              <span className="text-xs font-black text-white">N</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white">NewsroomX</p>
              <p className="text-xs text-white/60">{story.time}</p>
            </div>
          </div>
          <Link href="/" className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
            <X className="size-4 text-white" />
          </Link>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-16">
          <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            {story.category}
          </span>
          <h1 className="mt-3 font-headline text-2xl font-black leading-tight text-white sm:text-3xl">
            {story.headline}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            {story.summary}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs text-white/50">📖 {story.readTime} वाचन</span>
            <button
              onClick={() => void handleShare()}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
            >
              <Share2 className="size-3" /> शेअर करा
            </button>
          </div>
        </div>

        {/* Nav buttons */}
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-2">
          <button
            onClick={goPrev}
            disabled={current === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all disabled:opacity-30 hover:bg-white/30"
          >
            <ChevronUp className="size-5 text-white" />
          </button>
          <button
            onClick={goNext}
            disabled={current === STORIES.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-all disabled:opacity-30 hover:bg-white/30"
          >
            <ChevronDown className="size-5 text-white" />
          </button>
        </div>

        {/* Tap zones for mobile */}
        <button
          className="absolute bottom-0 left-0 top-16 w-1/3"
          onClick={goPrev}
          aria-label="Previous story"
        />
        <button
          className="absolute bottom-0 right-0 top-16 w-1/3"
          onClick={goNext}
          aria-label="Next story"
        />

        {/* Story counter */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <p className="text-xs text-white/50">
            {current + 1} / {STORIES.length}
          </p>
        </div>
      </div>
    </div>
  );
}
