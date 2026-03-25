import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LiveDeskClient } from "./live-desk-client";

export default async function LiveDeskPage() {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "EDITOR"].includes(session.user.role)) {
    redirect("/login");
  }

  const events = await prisma.liveEvent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      updates: { orderBy: { createdAt: "desc" }, take: 50 },
    },
  }).catch(() => []);

  return <LiveDeskClient initialEvents={events} />;
}
