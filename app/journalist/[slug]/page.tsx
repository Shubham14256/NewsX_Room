import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, FileText, Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { getNavSections } from "@/lib/navigation";
import { JournalistSocialButtons } from "@/components/news/journalist-social-buttons";

export const dynamic = "force-dynamic";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=800&q=80";
const AVATAR_COLORS = ["from-red-500 to-orange-500", "from-blue-500 to-violet-500", "from-emerald-500 to-teal-500", "from-amber-500 to-yellow-400"];

export default async function JournalistProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // slug is the author's name slugified — find by matching
  const author = await prisma.user.findFirst({
    where: {
      role: { in: ["ADMIN", "EDITOR", "REPORTER"] },
      name: { contains: slug.replace(/-/g, " "), mode: "insensitive" },
    },
    include: {
      articles: {
        where: { published_at: { not: null } },
        orderBy: { published_at: "desc" },
        take: 6,
        include: { category: true },
      },
    },
  });

  if (!author) notFound();

  const navSections = await getNavSections();
  const totalViews = author.articles.reduce((sum, a) => sum + a.views, 0);
  const colorIdx = author.name.charCodeAt(0) % AVATAR_COLORS.length;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar sections={navSections} />

      {/* Hero banner */}
      <div className="h-40 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900" />

      <main className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        {/* Profile card */}
        <div className="-mt-16 rounded-2xl border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end">
            {/* Avatar */}
            <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[colorIdx]} text-3xl font-black text-white shadow-lg ring-4 ring-white dark:ring-neutral-900`}>
              {author.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-headline text-2xl font-black text-neutral-900 dark:text-white">
                  {author.name}
                </h1>
                <CheckCircle2 className="size-5 text-blue-500" />
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                  {author.role}
                </span>
              </div>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Senior Correspondent · NewsroomX Digital Media
              </p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                राजकारण, अर्थव्यवस्था आणि सामाजिक विषयांवर लेखन करणारे अनुभवी पत्रकार.
                १०+ वर्षांचा पत्रकारितेचा अनुभव. पुरस्कारप्राप्त लेखक.
              </p>

              <JournalistSocialButtons email={author.email} />
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-neutral-100 pt-5 dark:border-neutral-800">
            {[
              { label: "Articles", value: author.articles.length, icon: FileText },
              { label: "Total Views", value: totalViews > 0 ? `${(totalViews / 1000).toFixed(1)}K` : "12.4K", icon: Eye },
              { label: "Loyalty Points", value: author.points > 0 ? author.points : 840, icon: CheckCircle2 },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <Icon className="mx-auto mb-1 size-4 text-neutral-400" />
                <p className="text-xl font-black text-neutral-900 dark:text-white">{value}</p>
                <p className="text-xs text-neutral-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div className="mt-8">
          <h2 className="mb-4 font-headline text-xl font-bold text-neutral-900 dark:text-white">
            Recent Articles
          </h2>
          {author.articles.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-400 dark:border-neutral-700">
              No published articles yet.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {author.articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="group flex gap-3 overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800">
                    <Image
                      src={article.imageUrl ?? FALLBACK_IMAGE}
                      alt={article.title}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase text-red-600 dark:text-red-400">
                      {article.category.name}
                    </p>
                    <h3 className="mt-0.5 text-sm font-bold leading-snug text-neutral-900 line-clamp-2 dark:text-neutral-100">
                      {article.title}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                      <Eye className="size-3" /> {article.views.toLocaleString()} views
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
