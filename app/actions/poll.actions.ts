"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export type PollActionResult =
  | { success: true; message: string }
  | { success: false; message: string };

export async function submitPollVote(
  optionId: string,
): Promise<PollActionResult> {
  // Fetch the option to get its pollId — needed for the cookie key
  const option = await prisma.pollOption.findUnique({
    where: { id: optionId },
    select: { pollId: true },
  });

  if (!option) {
    return { success: false, message: "Poll option not found." };
  }

  const cookieKey = `voted_${option.pollId}`;
  const cookieStore = await cookies();

  if (cookieStore.get(cookieKey)) {
    return { success: false, message: "You have already voted on this poll." };
  }

  // Atomic increment — no read-then-write, safe under high concurrency
  await prisma.pollOption.update({
    where: { id: optionId },
    data: { votes: { increment: 1 } },
  });

  // Set a secure, HttpOnly cookie to prevent double-voting
  cookieStore.set(cookieKey, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: "/",
  });

  revalidatePath("/");

  return { success: true, message: "Vote registered." };
}
