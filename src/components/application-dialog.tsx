"use client";

import * as React from "react";

import { useStore } from "@/components/store-provider";
import { DayFlowIcon } from "@/components/dayflow-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  APPLICATION_STATUSES,
  APPLICATION_TYPES,
  APP_PRIORITY_META,
} from "@/lib/constants";
import type {
  Application,
  ApplicationStatus,
  ApplicationType,
  Importance,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface FormState {
  company: string;
  role: string;
  status: ApplicationStatus;
  type: ApplicationType;
  priority: Importance;
  location: string;
  link: string;
  deadline: string;
  resumeVersion: string;
  referralContact: string;
  followUpDate: string;
  notes: string;
}

const EMPTY: FormState = {
  company: "",
  role: "",
  status: "saved",
  type: "full-time",
  priority: "medium",
  location: "",
  link: "",
  deadline: "",
  resumeVersion: "",
  referralContact: "",
  followUpDate: "",
  notes: "",
};

const PRIORITIES: Importance[] = ["low", "medium", "high"];

export function ApplicationDialog({
  open,
  onOpenChange,
  application,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application?: Application;
}) {
  const { addApplication, updateApplication } = useStore();
  const [form, setForm] = React.useState<FormState>(EMPTY);

  React.useEffect(() => {
    if (!open) return;
    setForm(
      application
        ? {
            company: application.company,
            role: application.role,
            status: application.status,
            type: application.type ?? "full-time",
            priority: application.priority ?? "medium",
            location: application.location ?? "",
            link: application.link ?? "",
            deadline: application.deadline ?? "",
            resumeVersion: application.resumeVersion ?? "",
            referralContact: application.referralContact ?? "",
            followUpDate: application.followUpDate ?? "",
            notes: application.notes ?? "",
          }
        : EMPTY,
    );
  }, [open, application]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const canSave = form.company.trim() && form.role.trim();

  const submit = () => {
    if (!canSave) return;
    const payload = {
      company: form.company.trim(),
      role: form.role.trim(),
      status: form.status,
      type: form.type,
      priority: form.priority,
      location: form.location.trim() || undefined,
      link: form.link.trim() || undefined,
      deadline: form.deadline || undefined,
      resumeVersion: form.resumeVersion.trim() || undefined,
      referralContact: form.referralContact.trim() || undefined,
      followUpDate: form.followUpDate || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (application) updateApplication(application.id, payload);
    else addApplication(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{application ? "Edit application" : "Add application"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Field label="Company" htmlFor="app-company">
            <Input
              id="app-company"
              value={form.company}
              onChange={(e) => set("company", e.target.value)}
              placeholder="Example company"
              autoFocus
            />
          </Field>
          <Field label="Role" htmlFor="app-role">
            <Input
              id="app-role"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="Product designer"
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Type">
              <Select value={form.type} onValueChange={(v) => set("type", v as ApplicationType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={form.status} onValueChange={(v) => set("status", v as ApplicationStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_STATUSES.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <DayFlowIcon name={s.id} /> {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Priority">
            <div className="grid grid-cols-3 gap-2">
              {PRIORITIES.map((p) => {
                const active = form.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => set("priority", p)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    {APP_PRIORITY_META[p].label}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Location" htmlFor="app-location">
              <Input
                id="app-location"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="Remote or city"
              />
            </Field>
            <Field label="Link" htmlFor="app-link">
              <Input
                id="app-link"
                value={form.link}
                onChange={(e) => set("link", e.target.value)}
                placeholder="https://…"
                inputMode="url"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Deadline" htmlFor="app-deadline">
              <Input
                id="app-deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </Field>
            <Field label="Follow-up" htmlFor="app-followup">
              <Input
                id="app-followup"
                type="date"
                value={form.followUpDate}
                onChange={(e) => set("followUpDate", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="Resume version" htmlFor="app-resume">
              <Input
                id="app-resume"
                value={form.resumeVersion}
                onChange={(e) => set("resumeVersion", e.target.value)}
                placeholder="SWE v3"
              />
            </Field>
            <Field label="Referral" htmlFor="app-referral">
              <Input
                id="app-referral"
                value={form.referralContact}
                onChange={(e) => set("referralContact", e.target.value)}
                placeholder="Alex (LinkedIn)"
              />
            </Field>
          </div>

          <Field label="Notes" htmlFor="app-notes">
            <Textarea
              id="app-notes"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button onClick={submit} disabled={!canSave} className="w-full">
            {application ? "Save changes" : "Add application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
