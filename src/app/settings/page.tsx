"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  BellOff,
  Download,
  Monitor,
  Moon,
  Sun,
  Trash2,
  Upload,
} from "lucide-react";

import { EnergyModeSelector } from "@/components/energy-mode-selector";
import { MinimumDayToggle } from "@/components/minimum-day-toggle";
import { PageContainer, LoadingCards } from "@/components/page-container";
import { PageHeader } from "@/components/page-header";
import { useStore } from "@/components/store-provider";
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
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { dateKey } from "@/lib/time";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { hydrated, settings, routines, setActiveRoutine, exportData, importData, resetData } =
    useStore();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [resetOpen, setResetOpen] = React.useState(false);

  const flash = (msg: string) => {
    setMessage(msg);
    window.setTimeout(() => setMessage(null), 2500);
  };

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dayflow-backup-${dateKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    flash("Backup downloaded ✓");
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const text = await file.text();
    flash(importData(text) ? "Data imported ✓" : "Couldn't read that file");
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Make DayFlow yours" />
      <PageContainer className="space-y-5">
        {!hydrated ? (
          <LoadingCards />
        ) : (
          <>
            <Section title="Active routine">
              <Card>
                <CardContent className="p-4">
                  <Select value={settings.activeRoutineId} onValueChange={setActiveRoutine}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {routines.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.emoji} {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Drives your Today screen and weekly agenda.
                  </p>
                </CardContent>
              </Card>
            </Section>

            <Section title="Energy & load">
              <EnergyModeSelector />
              <MinimumDayToggle />
            </Section>

            <Section title="Appearance">
              <ThemeSelect />
            </Section>

            <Section title="Reminders">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <BellOff className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Push reminders</p>
                    <p className="text-xs text-muted-foreground">
                      Coming soon — gentle nudges for your next block.
                    </p>
                  </div>
                  <Switch disabled aria-label="Reminders (coming soon)" />
                </CardContent>
              </Card>
            </Section>

            <Section title="Your data">
              <Card>
                <CardContent className="space-y-3 p-4">
                  <p className="text-xs text-muted-foreground">
                    Everything is stored privately on this device. Export a backup
                    or move it to another device.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={handleExport}>
                      <Download className="size-4" />
                      Export
                    </Button>
                    <Button variant="outline" onClick={() => fileRef.current?.click()}>
                      <Upload className="size-4" />
                      Import
                    </Button>
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleImport}
                  />
                  {message ? (
                    <p className="text-center text-sm font-medium text-primary">
                      {message}
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Reset everything</p>
                    <p className="text-xs text-muted-foreground">
                      Clears all logs, habits, and applications on this device.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setResetOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    Reset
                  </Button>
                </CardContent>
              </Card>
            </Section>

            <div className="pt-2 text-center">
              <p className="text-sm font-semibold">{APP_NAME}</p>
              <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                v0.1.0 · MVP · localStorage
              </p>
            </div>
          </>
        )}
      </PageContainer>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all data?</DialogTitle>
            <DialogDescription>
              This permanently clears everything stored on this device. Consider
              exporting a backup first. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetData();
                setResetOpen(false);
                flash("All data cleared");
              }}
            >
              Yes, reset everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-sm font-semibold text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function ThemeSelect() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const options = [
    { id: "light", label: "Light", icon: Sun },
    { id: "dark", label: "Dark", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ] as const;

  const current = mounted ? theme ?? "system" : "system";

  return (
    <Card>
      <CardContent className="p-3">
        <div className="grid grid-cols-3 gap-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            const active = current === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTheme(opt.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent",
                )}
              >
                <Icon className="size-5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
