"use client";

import * as React from "react";

import { useStore } from "@/components/store-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FRICTION_REASONS } from "@/lib/constants";
import type { FrictionReason } from "@/lib/types";
import { cn } from "@/lib/utils";

interface FrictionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskType: "block" | "habit";
  refId: string;
  title: string;
  onLogged?: () => void;
}

export function FrictionDialog({
  open,
  onOpenChange,
  taskType,
  refId,
  title,
  onLogged,
}: FrictionDialogProps) {
  const { skipTask } = useStore();
  const [reason, setReason] = React.useState<FrictionReason | null>(null);
  const [note, setNote] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setReason(null);
      setNote("");
    }
  }, [open]);

  const submit = () => {
    skipTask({
      taskType,
      refId,
      title,
      reason: reason ?? "other",
      note,
    });
    onOpenChange(false);
    onLogged?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>No shame — what got in the way?</DialogTitle>
          <DialogDescription>
            Skipping <span className="font-medium text-foreground">{title}</span>.
            Noticing the friction is how we make tomorrow easier.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {FRICTION_REASONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setReason(r.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                reason === r.id
                  ? "border-primary bg-primary/10 font-medium"
                  : "border-border hover:bg-accent",
              )}
            >
              <span className="text-lg">{r.emoji}</span>
              {r.label}
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Anything you want to remember? (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />

        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={submit}>
            Log it &amp; let it go
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/** Self-contained skip control: a button that opens the friction dialog. */
export function SkipTaskButton({
  taskType,
  refId,
  title,
  onLogged,
  className,
  variant = "ghost",
  size = "sm",
  children = "Skip",
}: {
  taskType: "block" | "habit";
  refId: string;
  title: string;
  onLogged?: () => void;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  children?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {children}
      </Button>
      <FrictionDialog
        open={open}
        onOpenChange={setOpen}
        taskType={taskType}
        refId={refId}
        title={title}
        onLogged={onLogged}
      />
    </>
  );
}
