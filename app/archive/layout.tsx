import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";
import { getNavSections } from "@/lib/navigation";

export default async function ArchiveLayout({ children }: { children: ReactNode }) {
  const navSections = await getNavSections();
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar sections={navSections} />
      {children}
    </div>
  );
}
