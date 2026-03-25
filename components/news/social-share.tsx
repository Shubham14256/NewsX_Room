"use client";

import { Copy, Facebook, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface SocialShareProps {
  title: string;
}

export function SocialShare({ title }: SocialShareProps) {
  const getCurrentUrl = () => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.location.href;
  };

  const shareText = `${title} - Read more on NewsroomX`;

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    const url = getCurrentUrl();

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
      } catch {
        // User cancellation should remain silent.
      }
      return;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`;
    openLink(whatsappUrl);
  };

  const shareToWhatsapp = () => {
    const url = getCurrentUrl();
    openLink(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${url}`)}`);
  };

  const shareToX = () => {
    const url = getCurrentUrl();
    openLink(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`);
  };

  const shareToFacebook = () => {
    const url = getCurrentUrl();
    openLink(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getCurrentUrl());
      toast.success("Article link copied.");
    } catch {
      toast.error("Unable to copy link.");
    }
  };

  return (
    <section className="mt-5">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleNativeShare}>
          <Share2 className="size-4" />
          Share
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={shareToWhatsapp}>
          <Share2 className="size-4" />
          WhatsApp
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={shareToX}>
          <Twitter className="size-4" />X
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={shareToFacebook}>
          <Facebook className="size-4" />
          Facebook
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={copyLink}>
          <Copy className="size-4" />
          Copy Link
        </Button>
      </div>
    </section>
  );
}
