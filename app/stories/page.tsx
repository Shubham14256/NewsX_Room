import { ReelsFeed } from "@/components/news/reels-feed";
import type { Reel } from "@/components/news/reels-feed";

// Mock reels — same shape as the old STORIES array, extended with
// videoUrl (empty = image-only mode) and engagement counts.
// Swap videoUrl for real CDN URLs when the media pipeline is ready.
const REELS: Reel[] = [
  {
    id: "1",
    category: "राजकारण",
    headline: "महाराष्ट्रात नवीन सरकार स्थापन होणार",
    summary:
      "राज्यातील राजकीय घडामोडींमध्ये मोठी उलथापालथ झाली असून नवीन आघाडी सरकार स्थापन होण्याचे संकेत मिळत आहेत.",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=800&q=80",
    videoUrl: "",
    time: "२ तासांपूर्वी",
    articleSlug: "maharashtra-new-government",
    likes: 4200,
    comments: 318,
  },
  {
    id: "2",
    category: "तंत्रज्ञान",
    headline: "भारतात AI क्रांती: ५ लाख नोकऱ्या निर्माण होणार",
    summary:
      "केंद्र सरकारच्या नव्या AI धोरणानुसार पुढील तीन वर्षांत देशभरात पाच लाखांहून अधिक तंत्रज्ञान क्षेत्रातील रोजगार निर्माण होतील.",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80",
    videoUrl: "",
    time: "४ तासांपूर्वी",
    articleSlug: "ai-revolution-india-jobs",
    likes: 8700,
    comments: 542,
  },
  {
    id: "3",
    category: "क्रीडा",
    headline: "विराट कोहलीने केला ऐतिहासिक विक्रम",
    summary:
      "भारताचा स्टार फलंदाज विराट कोहलीने आंतरराष्ट्रीय क्रिकेटमध्ये एक नवीन विक्रम प्रस्थापित केला आहे.",
    image: "https://images.unsplash.com/photo-1540747913346-19212a4b423e?auto=format&fit=crop&w=800&q=80",
    videoUrl: "",
    time: "५ तासांपूर्वी",
    articleSlug: "virat-kohli-historic-record",
    likes: 21300,
    comments: 1840,
  },
  {
    id: "4",
    category: "अर्थव्यवस्था",
    headline: "सोन्याचे भाव ७५,००० रुपयांवर पोहोचले",
    summary:
      "आंतरराष्ट्रीय बाजारातील घडामोडींमुळे देशांतर्गत सोन्याच्या किमती विक्रमी उच्चांकावर पोहोचल्या आहेत.",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
    videoUrl: "",
    time: "६ तासांपूर्वी",
    articleSlug: "gold-price-75000",
    likes: 3100,
    comments: 207,
  },
  {
    id: "5",
    category: "विज्ञान",
    headline: "ISRO चे Chandrayaan-4 मिशन जाहीर",
    summary:
      "भारतीय अंतराळ संशोधन संस्थेने चंद्रावर पाणी शोधण्यासाठी नवीन मोहिमेची घोषणा केली आहे.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80",
    videoUrl: "",
    time: "८ तासांपूर्वी",
    articleSlug: "isro-chandrayaan-4-mission",
    likes: 15600,
    comments: 923,
  },
  {
    id: "6",
    category: "मनोरंजन",
    headline: "बॉलीवूडचा नवीन ब्लॉकबस्टर: पहिल्याच दिवशी ₹100 कोटी",
    summary:
      "या वर्षातील सर्वाधिक प्रतीक्षित चित्रपटाने पहिल्याच दिवशी बॉक्स ऑफिसवर विक्रमी कमाई केली आहे.",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
    videoUrl: "",
    time: "१० तासांपूर्वी",
    articleSlug: "bollywood-blockbuster-100-crore",
    likes: 9800,
    comments: 761,
  },
];

export default function StoriesPage() {
  return <ReelsFeed reels={REELS} />;
}
