"use client";

import * as React from "react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import {
  ArrowLeft,
  ArrowLeftRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Compass,
  Focus,
  Gauge,
  GraduationCap,
  LifeBuoy,
  ListStart,
  Save,
  ShieldCheck,
  Sparkles,
  StickyNote,
  type LucideIcon,
} from "lucide-react";

import { BrandIcon } from "@/components/brand-icon";
import { ProductSignature } from "@/components/product-signature";
import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import { BALANCED_ROUTINE_ID } from "@/lib/data/routines";
import { PRODUCT_ATTRIBUTION, SUPPORT_NEEDS } from "@/lib/constants";
import type { SupportNeed } from "@/lib/types";
import { cn } from "@/lib/utils";

type Step = "welcome" | "support" | "rhythm" | "account" | "ready";

const STEPS: Step[] = ["welcome", "support", "rhythm", "account", "ready"];
const STEP_LABELS: Record<Step, string> = {
  welcome: "Welcome",
  support: "A little help",
  rhythm: "Your week",
  account: "Your account",
  ready: "All set",
};

const SUPPORT_ICONS: Record<SupportNeed, LucideIcon> = {
  start: ListStart,
  focus: Focus,
  remember: StickyNote,
  switch: ArrowLeftRight,
  overwhelmed: Gauge,
  varies: Sparkles,
};

const ROUTINE_CHOICES = [
  {
    id: BALANCED_ROUTINE_ID,
    label: "A balanced week",
    note: "Work, meals, downtime, and a clear end to the day.",
    icon: Compass,
  },
  {
    id: "student-week",
    label: "Mostly school",
    note: "Classes, study time, assignments, and breaks.",
    icon: GraduationCap,
  },
  {
    id: "focus-work",
    label: "Focus work",
    note: "Focus time, messages, lunch, and a set finish.",
    icon: BriefcaseBusiness,
  },
  {
    id: "shift-week",
    label: "Shift work",
    note: "Getting ready, work, breaks, and time to wind down.",
    icon: Clock3,
  },
  {
    id: "blank",
    label: "Start blank",
    note: "Keep only the structure you add yourself.",
    icon: Sparkles,
  },
] as const;

export function Onboarding() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const {
    hydrated,
    settings,
    routines,
    setActiveRoutine,
    setDefaultSupportNeed,
    addRoutineTemplate,
    createRoutine,
    completeOnboarding,
  } = useStore();
  const [step, setStep] = React.useState<Step>("welcome");
  const [support, setSupport] = React.useState<SupportNeed>(
    settings.defaultSupportNeed ?? "varies",
  );
  const [routineId, setRoutineId] = React.useState(settings.activeRoutineId);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const dialogRef = React.useRef<HTMLElement>(null);
  const wasOpenRef = React.useRef(false);
  const open = hydrated && !settings.onboarded;

  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      setStep("welcome");
      setSupport(settings.defaultSupportNeed ?? "varies");
      setRoutineId(settings.activeRoutineId);
    }
    wasOpenRef.current = open;
  }, [open, settings.activeRoutineId, settings.defaultSupportNeed]);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  React.useLayoutEffect(() => {
    if (!open) return;
    const resetScroll = () => {
      if (overlayRef.current) overlayRef.current.scrollTop = 0;
      dialogRef.current?.focus({ preventScroll: true });
    };
    resetScroll();
    const frame = window.requestAnimationFrame?.(resetScroll);
    return () => {
      if (frame !== undefined) window.cancelAnimationFrame?.(frame);
    };
  }, [open, step]);

  React.useEffect(() => {
    if (open && step === "account" && isSignedIn) setStep("ready");
  }, [isSignedIn, open, step]);

  if (!open) return null;

  const finish = () => {
    setDefaultSupportNeed(support);
    if (routineId === "blank") {
      const id = createRoutine({
        name: "My week",
        description: "An empty week to build myself.",
      });
      setActiveRoutine(id);
    } else if (routines.some((routine) => routine.id === routineId)) {
      setActiveRoutine(routineId);
    } else {
      const id = addRoutineTemplate(routineId);
      if (id) setActiveRoutine(id);
    }
    completeOnboarding();
  };

  const currentStep = STEPS.indexOf(step);
  const selectedSupport =
    SUPPORT_NEEDS.find((item) => item.id === support) ?? SUPPORT_NEEDS[5];
  const selectedRoutine =
    ROUTINE_CHOICES.find((choice) => choice.id === routineId) ?? ROUTINE_CHOICES[0];

  return (
    <div ref={overlayRef} className="fixed inset-0 z-[60] overflow-y-auto bg-background">
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        tabIndex={-1}
        className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] outline-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BrandIcon className="size-9" />
            <div>
              <ProductSignature className="block text-sm leading-none" />
              <p className="mt-1 text-[0.68rem] text-muted-foreground">
                A simple plan for today
              </p>
            </div>
          </div>
          {step !== "welcome" ? (
            <button
              type="button"
              onClick={() => setStep(STEPS[Math.max(0, currentStep - 1)])}
              className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-between text-[0.68rem] font-medium text-muted-foreground">
          <span>Step {currentStep + 1} of {STEPS.length}</span>
          <span>{STEP_LABELS[step]}</span>
        </div>
        <div
          className="mt-2 flex gap-1.5"
          role="progressbar"
          aria-label="Setup progress"
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-valuenow={currentStep + 1}
        >
          {STEPS.map((item, index) => (
            <span
              key={item}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                index <= currentStep ? "bg-primary" : "bg-muted",
              )}
            />
          ))}
        </div>

        {step === "welcome" ? (
          <WelcomeStep
            onStart={() => setStep("support")}
            onDefaults={() => {
              setSupport("varies");
              setRoutineId(BALANCED_ROUTINE_ID);
              setStep(isSignedIn ? "ready" : "account");
            }}
          />
        ) : null}

        {step === "support" ? (
          <div className="flex flex-1 flex-col pt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              A little help
            </p>
            <h1 id="onboarding-title" className="mt-2 text-3xl font-bold tracking-tight">
              What would help most?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Pick one for now. You can change it anytime.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5" role="group" aria-label="Default support">
              {SUPPORT_NEEDS.map((item) => {
                const Icon = SUPPORT_ICONS[item.id];
                const selected = support === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSupport(item.id)}
                    className={cn(
                      "flex min-h-24 flex-col items-start justify-between rounded-[1.25rem] border p-4 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary/30"
                        : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    <Icon className="size-5" />
                    <span>
                      <span className="block text-sm font-semibold">{item.shortLabel}</span>
                      <span className="mt-0.5 block text-[0.68rem] leading-snug text-muted-foreground">
                        {item.label}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <Button className="mt-auto" size="lg" onClick={() => setStep("rhythm")}>Next</Button>
          </div>
        ) : null}

        {step === "rhythm" ? (
          <div className="flex flex-1 flex-col pt-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Your usual week
            </p>
            <h1 id="onboarding-title" className="mt-2 text-3xl font-bold tracking-tight">
              Which one looks most like yours?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Choose the closest one. You can change every task and time later.
            </p>

            <div className="mt-6 space-y-2.5" role="radiogroup" aria-label="Starting routine">
              {ROUTINE_CHOICES.map((choice) => {
                const Icon = choice.icon;
                const selected = routineId === choice.id;
                return (
                  <button
                    key={choice.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setRoutineId(choice.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[1.25rem] border p-3.5 text-left transition-colors",
                      selected
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border bg-card hover:bg-accent",
                    )}
                  >
                    <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary", selected && "bg-primary text-primary-foreground")}>
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{choice.label}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{choice.note}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <Button
              className="mt-6"
              size="lg"
              onClick={() => setStep(isSignedIn ? "ready" : "account")}
            >
              Next
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Nothing here is permanent.
            </p>
          </div>
        ) : null}

        {step === "account" ? (
          <div className="flex flex-1 flex-col justify-center py-8">
            <div className="rounded-[2rem] border bg-card p-6">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Save className="size-5" />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Keep your setup
              </p>
              <h1 id="onboarding-title" className="mt-2 text-3xl font-bold tracking-tight">
                Save your plan
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Create an account so your setup and progress are here next time, on any device.
              </p>

              <div className="mt-6 space-y-2">
                <SignUpButton mode="modal">
                  <Button className="w-full" size="lg" disabled={!authLoaded}>
                    Create account
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button className="w-full" size="lg" variant="outline" disabled={!authLoaded}>
                    I already have an account
                  </Button>
                </SignInButton>
              </div>

              <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                Your DayFlow data stays private in your account.
              </p>
            </div>

            <Button className="mt-3" variant="ghost" onClick={() => setStep("ready")}>
              Not now
            </Button>
          </div>
        ) : null}

        {step === "ready" ? (
          <div className="flex flex-1 flex-col pt-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              All set
            </p>
            <h1 id="onboarding-title" className="mt-1.5 text-[1.7rem] font-bold leading-tight tracking-tight">
              Your setup is ready.
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              You can change any of this later in Settings.
            </p>

            <div className="mt-4 space-y-2">
              <SetupSummary
                icon={SUPPORT_ICONS[selectedSupport.id]}
                label="Help with"
                value={selectedSupport.label}
                note={selectedSupport.prompt}
              />
              <SetupSummary
                icon={selectedRoutine.icon}
                label="Week template"
                value={selectedRoutine.label}
                note={selectedRoutine.note}
              />
            </div>

            <div className="mt-3 rounded-[1.5rem] border bg-card p-3.5">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                What you’ll see
              </p>
              <div className="mt-2.5 space-y-2 text-xs">
                <PreviewPoint icon={ListStart} text="The next thing on your plan." />
                <PreviewPoint icon={Clock3} text="How much time is left." />
                <PreviewPoint icon={LifeBuoy} text="A simpler option when you need one." />
              </div>
            </div>

            <Button className="mt-4" size="lg" onClick={finish}>Go to Today</Button>
            <p className="mt-2 text-center text-[0.68rem] leading-relaxed text-muted-foreground">
              {isSignedIn ? "Your setup will be saved to your account." : "This preview resets when you refresh."}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function WelcomeStep({
  onStart,
  onDefaults,
}: {
  onStart: () => void;
  onDefaults: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center py-10">
      <div className="relative overflow-hidden rounded-[2rem] rounded-br-lg bg-hero p-6 text-hero-foreground">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-hero-accent">
          A simpler day
        </p>
        <h1 id="onboarding-title" className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight">
          Let&apos;s set up your day.
        </h1>
        <p className="mt-4 max-w-sm leading-relaxed text-hero-foreground/75">
          DayFlow keeps your routine in one place and shows you what&apos;s next.
        </p>
        <div className="mt-8 space-y-3 border-t border-hero-foreground/10 pt-5 text-sm">
          <p><span className="font-semibold text-hero-accent">See:</span> one task at a time</p>
          <p><span className="font-semibold text-hero-accent">Adjust:</span> use a lighter option when needed</p>
          <p><span className="font-semibold text-hero-accent">Change:</span> move or skip things without rebuilding the day</p>
        </div>
      </div>

      <Button className="mt-6" size="lg" onClick={onStart}>Set up DayFlow</Button>
      <Button className="mt-2" variant="ghost" onClick={onDefaults}>Use the starter setup</Button>
      <div className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
        <p>This takes about a minute. You can change it later.</p>
        <p className="mt-1 font-semibold text-primary">{PRODUCT_ATTRIBUTION}</p>
      </div>
    </div>
  );
}

function SetupSummary({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-[1.25rem] border bg-card p-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span className="mt-0.5 block text-sm font-semibold">{value}</span>
        <span className="mt-0.5 block text-[0.68rem] leading-snug text-muted-foreground">{note}</span>
      </span>
    </div>
  );
}

function PreviewPoint({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-3.5" />
      </span>
      <span className="flex-1 leading-snug">{text}</span>
      <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden />
    </div>
  );
}
