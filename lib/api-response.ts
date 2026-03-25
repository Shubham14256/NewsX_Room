import { NextResponse } from "next/server";

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
    {
      success: true,
      data,
    },
    { status },
  );
}

export function apiFailure(error: unknown, status?: number) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.status },
    );
  }

  if (typeof error === "string") {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error,
          code: "ERROR",
        },
      },
      { status: status ?? 500 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Something went wrong. Please try again.",
        code: "INTERNAL_ERROR",
      },
    },
    { status: status ?? 500 },
  );
}
