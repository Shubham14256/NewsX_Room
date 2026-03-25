"use client";

import {
  Menu,
  LayoutDashboard,
  PenSquare,
  Newspaper,
  FolderTree,
  Users,
  Settings,
  Bot,
  BookOpen,
  MessageSquare,
  Radio,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ComponentType, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Write Article", href: "/admin/articles/new", icon: PenSquare },
  { label: "All Articles", href: "/admin/articles", icon: Newspaper },
  { label: "Auto Importer", href: "/admin/importer", icon: Bot },
  { label: "E-Paper", href: "/admin/epaper", icon: BookOpen },
  { label: "Live Desk", href: "/admin/live", icon: Radio },
  { label: "Comments", href: "/admin/comments", icon: MessageSquare },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface SidebarProps {
  userName?: string | null;
  userRole?: string | null;
  actionsSlot?: ReactNode;
}

export function Sidebar({ userName, userRole, actionsSlot }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="border-b border-neutral-200 bg-white p-4 md:hidden dark:border-neutral-800 dark:bg-neutral-950">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen((value) => !value)}
          aria-label="Toggle admin sidebar"
        >
          <Menu className="size-4" />
          Menu
        </Button>
      </div>

      {/* Backdrop — closes sidebar on tap outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-72 border-r border-neutral-200 bg-white p-4 transition-transform md:sticky md:block md:translate-x-0 dark:border-neutral-800 dark:bg-neutral-950",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="mb-6 flex h-14 items-center border-b border-neutral-200 px-2 dark:border-neutral-800">
          <p className="font-headline text-xl font-bold">NewsroomX Admin</p>
        </div>

        <div className="mb-5 rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {userName ?? "Newsroom User"}
          </p>
          <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            {userRole ?? "USER"}
          </p>
          {actionsSlot ? <div className="mt-3">{actionsSlot}</div> : null}
        </div>

        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-900 dark:hover:text-white",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
