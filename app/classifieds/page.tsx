"use client";

import { useState } from "react";
import { Home, Briefcase, Heart, Car, Laptop, GraduationCap, Plus, MapPin, Clock, Star } from "lucide-react";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "all", label: "सर्व", icon: Star },
  { id: "realestate", label: "रिअल इस्टेट 🏠", icon: Home },
  { id: "jobs", label: "नोकऱ्या 💼", icon: Briefcase },
  { id: "matrimony", label: "विवाह 💍", icon: Heart },
  { id: "vehicles", label: "वाहने 🚗", icon: Car },
  { id: "electronics", label: "इलेक्ट्रॉनिक्स 💻", icon: Laptop },
  { id: "education", label: "शिक्षण 🎓", icon: GraduationCap },
];

const ADS = [
  {
    id: "1", category: "realestate",
    title: "२ BHK फ्लॅट विक्रीसाठी — पुणे, बाणेर",
    price: "₹85 लाख", location: "बाणेर, पुणे", time: "२ तासांपूर्वी",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=80",
    badge: "Featured", badgeColor: "bg-amber-500",
    desc: "नवीन बांधकाम, पार्किंग, जिम, स्विमिंग पूल सुविधा. तातडीने विक्री.",
  },
  {
    id: "2", category: "jobs",
    title: "Senior Software Engineer — Pune (Remote)",
    price: "₹18–25 LPA", location: "पुणे / Remote", time: "५ तासांपूर्वी",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
    badge: "Urgent", badgeColor: "bg-red-500",
    desc: "React, Node.js, AWS अनुभव आवश्यक. ५+ वर्षे अनुभव. तातडीने भरती.",
  },
  {
    id: "3", category: "matrimony",
    title: "वधू हवी — मराठी ब्राह्मण, वय २५–३०",
    price: "संपर्क करा", location: "नाशिक", time: "१ दिवसापूर्वी",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80",
    badge: "New", badgeColor: "bg-emerald-500",
    desc: "उच्चशिक्षित, सरकारी नोकरी असलेल्या वधूसाठी स्थळ. कुटुंब सुसंस्कृत.",
  },
  {
    id: "4", category: "vehicles",
    title: "Honda City 2021 — उत्कृष्ट स्थितीत",
    price: "₹9.5 लाख", location: "मुंबई, अंधेरी", time: "३ तासांपूर्वी",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=400&q=80",
    badge: "Verified", badgeColor: "bg-blue-500",
    desc: "Single owner, 42,000 km, सर्व कागदपत्रे तयार. Test drive उपलब्ध.",
  },
  {
    id: "5", category: "electronics",
    title: "MacBook Pro M3 — 16GB/512GB",
    price: "₹1,45,000", location: "बंगळुरू", time: "१ तासापूर्वी",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80",
    badge: "Featured", badgeColor: "bg-amber-500",
    desc: "३ महिने जुना, वॉरंटी शिल्लक. बॉक्ससह सर्व accessories.",
  },
  {
    id: "6", category: "education",
    title: "UPSC Coaching — Batch Starting June",
    price: "₹45,000/वर्ष", location: "दिल्ली / Online", time: "२ दिवसांपूर्वी",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80",
    badge: "New", badgeColor: "bg-emerald-500",
    desc: "अनुभवी faculty, study material, mock tests. Limited seats available.",
  },
];

export default function ClassifiedsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all" ? ADS : ADS.filter((a) => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-headline text-3xl font-black sm:text-4xl">
                स्थानिक जाहिराती
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                तुमच्या परिसरातील सर्वोत्तम ऑफर्स — रिअल इस्टेट, नोकऱ्या, वाहने आणि बरेच काही
              </p>
            </div>
            <button
              onClick={() => toast.success("जाहिरात पोस्ट करण्यासाठी लवकरच उपलब्ध होईल!", { description: "Premium listing at just ₹99" })}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 active:scale-95"
            >
              <Plus className="size-4" />
              जाहिरात द्या — ₹99
            </button>
          </div>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-6">
            {[["12,400+", "Active Ads"], ["3.2L+", "Monthly Views"], ["98%", "Response Rate"]].map(([val, label]) => (
              <div key={label}>
                <p className="text-xl font-black text-amber-400">{val}</p>
                <p className="text-xs text-neutral-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Category filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900"
                  : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Ad grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ad) => (
            <div
              key={ad.id}
              className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="relative h-44 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ad.image}
                  alt={ad.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white ${ad.badgeColor}`}>
                  {ad.badge}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-headline text-base font-bold leading-snug text-neutral-900 line-clamp-2 dark:text-white">
                  {ad.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                  {ad.desc}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-black text-neutral-900 dark:text-white">{ad.price}</p>
                  <button
                    onClick={() => toast.success("विक्रेत्याशी संपर्क साधत आहे...")}
                    className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    संपर्क करा
                  </button>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-neutral-400">
                  <span className="flex items-center gap-1"><MapPin className="size-3" />{ad.location}</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" />{ad.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
