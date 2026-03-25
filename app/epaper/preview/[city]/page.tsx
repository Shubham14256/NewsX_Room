import Link from "next/link";
import { ArrowLeft, Download, Share2, ChevronLeft, ChevronRight } from "lucide-react";

const EDITIONS: Record<string, {
  city: string;
  title: string;
  date: string;
  headlines: { cat: string; title: string; summary: string }[];
}> = {
  pune: {
    city: "पुणे",
    title: "NewsroomX — पुणे आवृत्ती",
    date: "२५ मार्च, २०२६ | सकाळी आवृत्ती | वर्ष ५, अंक ८४",
    headlines: [
      { cat: "मुख्य बातमी", title: "पुणे मेट्रोचा विस्तार: हिंजवडी ते शिवाजीनगर नवीन मार्ग मंजूर", summary: "केंद्र सरकारने पुणे मेट्रोच्या नवीन मार्गाला मंजुरी दिली असून या प्रकल्पामुळे शहरातील वाहतूक कोंडी कमी होण्यास मदत होणार आहे. अंदाजे ₹४,२०० कोटी खर्चाचा हा प्रकल्प २०२८ पर्यंत पूर्ण होणे अपेक्षित आहे." },
      { cat: "राजकारण", title: "महाराष्ट्र विधानसभा: नवीन कृषी विधेयकावर जोरदार चर्चा", summary: "विधानसभेत काल कृषी सुधारणा विधेयकावर तीव्र वादविवाद झाला. विरोधी पक्षांनी शेतकऱ्यांच्या हिताचे प्रश्न उपस्थित केले." },
      { cat: "क्रीडा", title: "IPL 2026: पुणे सुपरजायंट्सचा मुंबईवर रोमांचक विजय", summary: "काल रात्री झालेल्या सामन्यात पुणे सुपरजायंट्सने मुंबई इंडियन्सला शेवटच्या चेंडूवर पराभूत केले. विराट कोहलीने ८५ धावांची खेळी केली." },
      { cat: "व्यापार", title: "Infosys ने जाहीर केले ५,००० नवीन रोजगार — पुण्यात मोठे केंद्र", summary: "माहिती तंत्रज्ञान क्षेत्रातील दिग्गज कंपनी Infosys ने पुण्यात नवीन AI संशोधन केंद्र उभारण्याची घोषणा केली आहे." },
      { cat: "शिक्षण", title: "पुणे विद्यापीठाचा नवीन AI अभ्यासक्रम — प्रवेश सुरू", summary: "सावित्रीबाई फुले पुणे विद्यापीठाने आर्टिफिशियल इंटेलिजन्स आणि मशीन लर्निंग या विषयांचे नवीन पदव्युत्तर अभ्यासक्रम सुरू केले आहेत." },
    ],
  },
  mumbai: {
    city: "मुंबई",
    title: "NewsroomX — मुंबई आवृत्ती",
    date: "२५ मार्च, २०२६ | विशेष आवृत्ती | वर्ष ५, अंक ८४",
    headlines: [
      { cat: "मुख्य बातमी", title: "मुंबई कोस्टल रोड: वाहतूक सुरू — प्रवासाचा वेळ ५० टक्क्यांनी कमी", summary: "बहुप्रतीक्षित मुंबई कोस्टल रोड प्रकल्प अखेर पूर्ण झाला असून आज पासून सर्वसामान्य नागरिकांसाठी खुला करण्यात आला आहे. मरीन ड्राइव्ह ते वर्सोवा हे अंतर आता केवळ २० मिनिटांत पार करता येणार आहे." },
      { cat: "अर्थव्यवस्था", title: "BSE Sensex नवीन उच्चांक: ८५,००० अंकांचा टप्पा पार", summary: "भारतीय शेअर बाजाराने आज ऐतिहासिक उच्चांक गाठला. परदेशी गुंतवणूकदारांच्या मोठ्या खरेदीमुळे बाजारात तेजी आली." },
      { cat: "मनोरंजन", title: "बॉलीवूड: नवीन ब्लॉकबस्टर चित्रपटाने पहिल्याच दिवशी ₹१०० कोटी", summary: "या वर्षातील सर्वाधिक प्रतीक्षित चित्रपट आज प्रदर्शित झाला असून पहिल्याच दिवशी विक्रमी गल्ला जमवला आहे." },
      { cat: "पायाभूत सुविधा", title: "धारावी पुनर्विकास: पहिल्या टप्प्याचे काम सुरू", summary: "आशियातील सर्वात मोठ्या झोपडपट्टी पुनर्विकास प्रकल्पाचे काम अधिकृतपणे सुरू झाले. ७ लाख रहिवाशांना नवीन घरे मिळणार." },
      { cat: "हवामान", title: "मुंबईत उष्णतेची लाट — तापमान ३८ अंशांवर", summary: "हवामान विभागाने मुंबईसाठी उष्णतेचा इशारा जारी केला आहे. नागरिकांनी दुपारी बाहेर न पडण्याचा सल्ला देण्यात आला आहे." },
    ],
  },
};

export default async function EPaperPreviewPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const edition = EDITIONS[city] ?? EDITIONS.pune;

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <Link
          href="/epaper"
          className="flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
        >
          <ArrowLeft className="size-4" /> E-Paper
        </Link>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300">
            <Share2 className="size-3.5" /> Share
          </button>
          <button className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700">
            <Download className="size-3.5" /> Download
          </button>
        </div>
      </div>

      {/* Newspaper */}
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-neutral-950">
          {/* Masthead */}
          <div className="border-b-4 border-neutral-900 bg-white px-6 py-4 dark:border-neutral-100 dark:bg-neutral-950">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-headline text-3xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-4xl">
                  NewsroomX
                </h1>
                <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                  {edition.city} आवृत्ती · Digital Edition
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">{edition.date}</p>
                <p className="mt-0.5 text-xs font-bold text-red-600">मूल्य: ₹५</p>
              </div>
            </div>
            <div className="mt-2 h-px bg-neutral-900 dark:bg-neutral-100" />
            <div className="mt-1 h-px bg-neutral-900 dark:bg-neutral-100" />
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Lead story */}
            <div className="mb-6 border-b border-neutral-200 pb-6 dark:border-neutral-800">
              <span className="inline-block rounded bg-red-600 px-2 py-0.5 text-xs font-bold uppercase text-white">
                {edition.headlines[0]?.cat}
              </span>
              <h2 className="mt-2 font-headline text-2xl font-black leading-tight text-neutral-900 dark:text-white sm:text-3xl">
                {edition.headlines[0]?.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                {edition.headlines[0]?.summary}
              </p>
              {/* Mock image */}
              <div className="mt-4 h-48 w-full overflow-hidden rounded-xl bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-800 dark:to-neutral-700 sm:h-64">
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm font-medium text-neutral-400">[Photo: {edition.city} Correspondent]</p>
                </div>
              </div>
            </div>

            {/* Secondary stories grid */}
            <div className="grid gap-5 sm:grid-cols-2">
              {edition.headlines.slice(1).map((h, i) => (
                <div key={i} className={`${i === 0 ? "sm:col-span-2 border-b border-neutral-200 pb-5 dark:border-neutral-800" : ""}`}>
                  <span className="inline-block rounded bg-neutral-100 px-2 py-0.5 text-xs font-semibold uppercase text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {h.cat}
                  </span>
                  <h3 className="mt-1.5 font-headline text-base font-bold leading-snug text-neutral-900 dark:text-white sm:text-lg">
                    {h.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {h.summary}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-8 border-t border-neutral-200 pt-4 dark:border-neutral-800">
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-400">© NewsroomX Digital Media Pvt. Ltd. · All rights reserved</p>
                <div className="flex items-center gap-3">
                  <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                    <ChevronLeft className="size-5" />
                  </button>
                  <span className="text-xs font-semibold text-neutral-500">Page 1 of 16</span>
                  <button className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                    <ChevronRight className="size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
