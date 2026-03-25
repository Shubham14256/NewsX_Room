"use client";

import { Twitter, Linkedin, Mail } from "lucide-react";
import { toast } from "sonner";

export function JournalistSocialButtons({ email }: { email: string }) {
  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        onClick={() => toast.info("Twitter profile coming soon!")}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <Twitter className="size-3.5 text-sky-500" /> Twitter
      </button>
      <button
        onClick={() => toast.info("LinkedIn profile coming soon!")}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <Linkedin className="size-3.5 text-blue-600" /> LinkedIn
      </button>
      <a
        href={`mailto:${email}`}
        className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
      >
        <Mail className="size-3.5 text-red-500" /> Email
      </a>
    </div>
  );
}
