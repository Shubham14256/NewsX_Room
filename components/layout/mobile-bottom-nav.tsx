"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Play, Newspaper, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Home",       href: "/",            icon: Home        },
  { label: "Videos",     href: "/video",        icon: Play        },
  { label: "E-Paper",    href: "/epaper",       icon: Newspaper   },
  { label: "जाहिराती",  href: "/classifieds",  icon: ShoppingBag },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-neutral-950 pb-safe md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="grid w-full grid-cols-4">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors duration-150",
                isActive ? "text-red-500" : "text-neutral-400 hover:text-neutral-200",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
