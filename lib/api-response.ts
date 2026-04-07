import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code = "INTERNAL_ERROR", status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status },
  );
}

export function apiFailure(error: unknown, status?: number) {
  // ── ZodError: return the first field-level message ────────────────────────
  if (error instanceof ZodError) {
    const first = error.issues[0];
    return NextResponse.json(
      {
        success: false,
        error: {
          message: first ? `${first.path.join(".")}: ${first.message}` : "Validation failed.",
          code:    "VALIDATION_ERROR",
        },
      },
      { status: 400 },
    );
  }

  // ── ApiError: structured error with custom status ─────────────────────────
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: { message: error.message, code: error.code },
      },
      { status: error.status },
    );
  }

  // ── Prisma known errors: surface useful DB messages in dev ────────────────
  if (
    error instanceof Error &&
    error.constructor.name === "PrismaClientKnownRequestError"
  ) {
    const prismaErr = error as Error & { code?: string };
    const isDev = process.env.NODE_ENV === "development";
    return NextResponse.json(
      {
        success: false,
        error: {
          message: isDev ? error.message : "A database error occurred. Please try again.",
          code:    prismaErr.code ?? "DB_ERROR",
        },
      },
      { status: 500 },
    );
  }

  // ── String errors ─────────────────────────────────────────────────────────
  if (typeof error === "string") {
    return NextResponse.json(
      {
        success: false,
        error: { message: error, code: "ERROR" },
      },
      { status: status ?? 500 },
    );
  }

  // ── Unknown: never expose internals to client ─────────────────────────────
  if (process.env.NODE_ENV === "development" && error instanceof Error) {
    console.error("[apiFailure] Unhandled error:", error);
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Something went wrong. Please try again.",
        code:    "INTERNAL_ERROR",
      },
    },
    { status: status ?? 500 },
  );
}
