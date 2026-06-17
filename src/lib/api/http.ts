import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export function apiOk<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ ok: true, ...data }, { status });
}

export function apiError(
  message: string,
  status = 400,
  code: ApiErrorCode = "VALIDATION_ERROR",
  extra?: Record<string, unknown>
) {
  return NextResponse.json(
    { ok: false, error: message, code, ...extra },
    { status }
  );
}
