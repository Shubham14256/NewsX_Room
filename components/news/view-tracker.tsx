"use client";

import { useEffect } from "react";

interface ViewTrackerProps {
  slug: string;
}

export function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    void fetch(`/api/articles/${slug}/view`, {
      method: "POST",
    }).catch(() => {
      // Fail silently by design; analytics should never break reading.
    });
  }, [slug]);

  return null;
}
