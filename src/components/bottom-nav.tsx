"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Home,
  SlidersHorizontal,
  Sprout,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: Home },
  { href: "/routines", label: "Routines", icon: CalendarDays },
  { href: "/habits", label: "Habits", icon: Sprout },
  { href: "/review", label: "Review", icon: ChartNoAxesColumnIncreasing },
  { href: "/settings", label: "Settings", icon: SlidersHorizontal },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-2 pb-2 safe-bottom">
      <div className="pointer-events-auto mx-auto flex max-w-md items-stretch justify-between rounded-[1.4rem] border border-border/80 bg-card/90 p-1 shadow-lg shadow-foreground/10 backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[1rem] px-0.5 py-1.5 text-[0.62rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                active
                  ? "bg-hero text-hero-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-full items-center justify-center rounded-xl transition-colors",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
