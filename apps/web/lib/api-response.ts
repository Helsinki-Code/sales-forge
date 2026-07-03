import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function ok(data: unknown, init: ResponseInit = {}) { return NextResponse.json({ data }, { status: 200, ...init }); }
export function created(data: unknown) { return NextResponse.json({ data }, { status: 201 }); }
export function apiError(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ error: { code: "validation_error", message: "Request validation failed", details: error.issues } }, { status: 400 });
  const message = error instanceof Error ? error.message : "Unexpected error";
  const status = /unauthorized|authentication/i.test(message) ? 401 : /forbidden|permission/i.test(message) ? 403 : /not found/i.test(message) ? 404 : /limit exceeded/i.test(message) ? 402 : 500;
  return NextResponse.json({ error: { code: status === 500 ? "internal_error" : "request_failed", message: status === 500 ? "The request could not be completed" : message } }, { status });
}
