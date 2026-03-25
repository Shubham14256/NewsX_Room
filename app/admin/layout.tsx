import type { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { Sidebar } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/auth/logout-button";
import { authOptions } from "@/lib/auth";

const ADMIN_ROLES = ["ADMIN", "EDITOR", "REPORTER"] as const;

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!ADMIN_ROLES.includes(session.user.role as (typeof ADMIN_ROLES)[number])) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-neutral-50 md:flex dark:bg-neutral-950">
      <Sidebar
        userName={session.user.name}
        userRole={session.user.role}
        actionsSlot={<LogoutButton />}
      />
      <main className="w-full p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
