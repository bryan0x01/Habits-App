import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";

// DayFlow keeps a signed-out preview, so routes stay public. Clerk still reads
// the session here and makes it available to the app and Supabase client.
const withClerk = clerkMiddleware();

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  // Clerk development instances perform a browser handshake that loops when a
  // production Next server is exercised on localhost. Browser tests cover the
  // signed-out preview, so they bypass only that handshake. This variable is
  // never set in a deployed environment.
  if (process.env.DAYFLOW_E2E === "1") return NextResponse.next();
  return withClerk(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
