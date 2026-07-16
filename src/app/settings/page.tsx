"use client";

import * as React from "react";
import Link from "next/link";
import {
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  Database,
  Download,
  Monitor,
  Moon,
  Palette,
  Pill,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";

import { CloudSyncCard } from "@/components/cloud-sync-card";
import { useCloud } from "@/components/cloud-provider";
import { EnergyModeSelector } from "@/components/energy-mode-selector";
import { MinimumDayToggle } from "@/components/minimum-day-toggle";
import { NotificationSettingsCard } from "@/components/notification-settings-card";
import { PageContainer, LoadingCards } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { ProductSignature } from "@/components/product-signature";
import { useStore } from "@/components/store-provider";
import { DefaultSupportNeedSelector } from "@/components/support-need-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { VacationModeCard } from "@/components/vacation-mode";
import { APP_TAGLINE, PRODUCT_ATTRIBUTION } from "@/lib/constants";
import { dateKey } from "@/lib/time";
import type { InterfaceColor, ThemeMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    hydrated,
    settings,
    routines,
    setActiveRoutine,
    setMedicationTracking,
    restartOnboarding,
    exportData,
    importData,
    resetData,
  } = useStore();
  const { isPersistent } = useCloud();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [resetOpen, setResetOpen] = React.useState(false);

  const flash = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(null), 2500);
  };

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `dayflow-backup-${dateKey()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    flash("Backup downloaded");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    flash(importData(await file.text()) ? "Backup imported" : "That backup could not be read");
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Make DayFlow fit your brain" />
      <PageContainer className="space-y-3">
        {!hydrated ? (
          <LoadingCards />
        ) : (
          <>
            <SettingsGroup title="Appearance" note="Theme and interface color" icon={Palette} defaultOpen>
              <ThemeSelect />
              <ColorSelect />
            </SettingsGroup>

            <SettingsGroup title="Plan & support" note="Routine, energy, and low-capacity days" icon={SlidersHorizontal}>
              <Card>
                <CardContent className="space-y-3 p-4">
                  <div>
                    <p className="text-sm font-semibold">Current routine</p>
                    <p className="text-xs text-muted-foreground">This drives Today and reminders.</p>
                  </div>
                  <Select value={settings.activeRoutineId} onValueChange={setActiveRoutine}>
                    <SelectTrigger aria-label="Current routine"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {routines.map((routine) => (
                        <SelectItem key={routine.id} value={routine.id}>{routine.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="ghost" size="sm" className="-ml-2 text-primary" onClick={restartOnboarding}>
                    <Sparkles className="size-4" />
                    Revisit quick setup
                  </Button>
                </CardContent>
              </Card>

              <EnergyModeSelector />
              <DefaultSupportNeedSelector />
              <MinimumDayToggle />

              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Pill className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <label htmlFor="medication-context" className="text-sm font-semibold">Medication context</label>
                    <p className="text-xs text-muted-foreground">Optional context only; no dose or medical advice.</p>
                  </div>
                  <Switch id="medication-context" checked={Boolean(settings.medicationTracking)} onCheckedChange={setMedicationTracking} />
                </CardContent>
              </Card>
              <VacationModeCard />
            </SettingsGroup>

            <SettingsGroup title="Saving & reminders" note="Supabase account and notifications" icon={Database} defaultOpen>
              <div id="cloud" className="scroll-mt-24">
                <CloudSyncCard />
              </div>
              <NotificationSettingsCard />
            </SettingsGroup>

            <SettingsGroup title="Tools & data" note="Career tracker, backups, and reset" icon={BriefcaseBusiness}>
              <Link href="/applications" className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:bg-accent">
                <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-300">
                  <BriefcaseBusiness className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Job application tracker</p>
                  <p className="text-xs text-muted-foreground">Optional tool — hidden from the main navigation.</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>

              <Card>
                <CardContent className="space-y-3 p-4">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {isPersistent
                      ? "Your live plan saves to your private Supabase account. Backups are optional."
                      : "You are previewing without persistent storage. Sign in above before relying on these changes."}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleExport}><Download className="size-4" />Export</Button>
                    <Button variant="outline" onClick={() => fileRef.current?.click()}><Upload className="size-4" />Import</Button>
                  </div>
                  <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
                  {message ? <p className="text-center text-sm font-medium text-primary">{message}</p> : null}
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Reset everything</p>
                    <p className="text-xs text-muted-foreground">Clears the Supabase snapshot after your next save.</p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => setResetOpen(true)}>
                    <Trash2 className="size-4" />Reset
                  </Button>
                </CardContent>
              </Card>
            </SettingsGroup>

            <div className="px-3 pt-3 text-center">
              <ProductSignature className="text-sm" />
              <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
              <p className="mt-2 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-primary">
                {PRODUCT_ATTRIBUTION}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">v0.3.0 · Supabase-first</p>
            </div>
          </>
        )}
      </PageContainer>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all data?</DialogTitle>
            <DialogDescription>
              This clears routines, logs, habits, and optional tools. If you are signed in, the empty starter state will save to Supabase. Export first if you may want it later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { resetData(); setResetOpen(false); flash("All data reset"); }}>
              Yes, reset everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SettingsGroup({
  title,
  note,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details className="group rounded-3xl border bg-card" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">{title}</h2>
          <p className="truncate text-xs text-muted-foreground">{note}</p>
        </div>
        <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className="space-y-3 border-t border-border/70 p-3">{children}</div>
    </details>
  );
}

function ThemeSelect() {
  const { settings, setThemeMode } = useStore();
  const options: { id: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ];
  const current = settings.theme ?? "system";

  return (
    <div>
      <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">Brightness</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const Icon = option.icon;
          const active = current === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => setThemeMode(option.id)}
              className={cn(
                "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-2xl border text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                active ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/20" : "bg-background hover:bg-accent",
              )}
            >
              <Icon className="size-5" />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const COLORS: { id: InterfaceColor; label: string; swatch: string }[] = [
  { id: "iris", label: "Iris", swatch: "bg-violet-600" },
  { id: "blue", label: "Blue", swatch: "bg-blue-600" },
  { id: "teal", label: "Teal", swatch: "bg-teal-600" },
  { id: "rose", label: "Rose", swatch: "bg-rose-600" },
  { id: "amber", label: "Amber", swatch: "bg-amber-500" },
];

function ColorSelect() {
  const { settings, setInterfaceColor } = useStore();
  const current = settings.interfaceColor ?? "iris";
  return (
    <div>
      <p className="mb-2 px-1 text-xs font-semibold text-muted-foreground">Interface color</p>
      <div className="grid grid-cols-5 gap-2" role="group" aria-label="Interface color">
        {COLORS.map((color) => {
          const active = color.id === current;
          return (
            <button
              key={color.id}
              type="button"
              aria-label={color.label}
              aria-pressed={active}
              onClick={() => setInterfaceColor(color.id)}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-2xl border bg-background text-[0.65rem] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                active && "border-primary ring-2 ring-primary/25",
              )}
            >
              <span className={cn("size-6 rounded-full ring-2 ring-background shadow-sm", color.swatch)} />
              {color.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
