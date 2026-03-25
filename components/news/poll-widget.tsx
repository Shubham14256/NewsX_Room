"use client";

import { useEffect, useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";
import { BarChart2, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitPollVote } from "@/app/actions/poll.actions";

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
}

interface PollWidgetProps {
  poll: Poll;
}

function computePercent(votes: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((votes / total) * 100);
}

export function PollWidget({ poll }: PollWidgetProps) {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Optimistic state — mirrors options with locally incremented votes
  const [optimisticOptions, addOptimisticVote] = useOptimistic(
    poll.options,
    (current, votedId: string) =>
      current.map((o) =>
        o.id === votedId ? { ...o, votes: o.votes + 1 } : o,
      ),
  );

  // Check localStorage on mount to avoid hydration mismatch
  useEffect(() => {
    const voted = localStorage.getItem(`poll_voted_${poll.id}`);
    if (voted) {
      setHasVoted(true);
      setSelectedId(voted);
    }
  }, [poll.id]);

  const totalVotes = optimisticOptions.reduce((sum, o) => sum + o.votes, 0);

  function handleVote(optionId: string) {
    if (hasVoted || isPending) return;

    startTransition(async () => {
      // Optimistic update — instant UI feedback
      addOptimisticVote(optionId);
      setSelectedId(optionId);
      setHasVoted(true);

      const result = await submitPollVote(optionId);

      if (!result.success) {
        // Revert optimistic state by resetting hasVoted
        // useOptimistic auto-reverts when the transition ends without committing
        setHasVoted(false);
        setSelectedId(null);
        toast.error(result.message);
        return;
      }

      // Persist vote in localStorage so the result view persists across page loads
      localStorage.setItem(`poll_voted_${poll.id}`, optionId);
      toast.success("Vote registered.");
    });
  }

  const showResults = hasVoted;

  return (
    <div className="my-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-5 py-3 dark:border-neutral-800 dark:bg-neutral-800/50">
        <BarChart2 size={16} className="text-neutral-500 dark:text-neutral-400" />
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          Poll
        </span>
      </div>

      <div className="px-5 py-5">
        <p className="font-headline text-base font-bold leading-snug text-neutral-900 dark:text-white">
          {poll.question}
        </p>

        <div className="mt-4 space-y-3">
          {optimisticOptions.map((option) => {
            const pct = computePercent(option.votes, totalVotes);
            const isSelected = selectedId === option.id;

            if (showResults) {
              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={cn(
                        "font-medium",
                        isSelected
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-600 dark:text-neutral-300",
                      )}
                    >
                      {isSelected && (
                        <CheckCircle2
                          size={13}
                          className="mr-1.5 inline text-emerald-500"
                        />
                      )}
                      {option.text}
                    </span>
                    <span className="font-semibold tabular-nums text-neutral-700 dark:text-neutral-200">
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isSelected
                          ? "bg-neutral-900 dark:bg-white"
                          : "bg-neutral-300 dark:bg-neutral-600",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            }

            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={isPending}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
                  "border-neutral-200 bg-neutral-50 text-neutral-800 hover:border-neutral-400 hover:bg-neutral-100",
                  "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-500 dark:hover:bg-neutral-700",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                {isPending && selectedId === option.id ? (
                  <Loader2 size={13} className="mr-2 inline animate-spin" />
                ) : null}
                {option.text}
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
          {totalVotes.toLocaleString()} vote{totalVotes !== 1 ? "s" : ""}
          {showResults ? " · Results" : " · Click to vote"}
        </p>
      </div>
    </div>
  );
}
