import { ShieldCheck } from "lucide-react";

export function FactCheckBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 shadow-sm shadow-emerald-500/10">
      <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
        AI Fact-Checked
      </span>
      <span className="h-1 w-1 rounded-full bg-emerald-500/60" />
      <span className="text-xs text-emerald-600/70 dark:text-emerald-500">Verified Source</span>
    </div>
  );
}
