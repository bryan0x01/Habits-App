import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

// DayFlow keeps a signed-out preview, so routes stay public. Clerk still reads
// the session here and makes it available to the app and Supabase client.
const withClerk = clerkMiddleware();

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // Every route is public and Supabase RLS is the data boundary. Keep the app
  // available as a signed-out preview when server-side Clerk verification is
  // not configured; the client SDK can still create and restore sessions with
  // the publishable key. A secret enables the normal Clerk middleware path.
  // E2E also bypasses Clerk's localhost development-browser handshake.
  if (!process.env.CLERK_SECRET_KEY || process.env.DAYFLOW_E2E === "1") {
    return NextResponse.next();
  }
  return withClerk(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
