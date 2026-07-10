"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BriefcaseBusiness,
  CalendarDays,
  Home,
  LineChart,
  Repeat,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: Home },
  { href: "/routines", label: "Routines", icon: CalendarDays },
  { href: "/habits", label: "Habits", icon: Repeat },
  { href: "/applications", label: "Apps", icon: BriefcaseBusiness },
  { href: "/review", label: "Review", icon: LineChart },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-lg safe-bottom">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-1">
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
                "flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[0.65rem] font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-full items-center justify-center rounded-full transition-colors",
                  active && "bg-primary/10",
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
