import { createClient } from "npm:@supabase/supabase-js@2.110.2";
import webpush from "npm:web-push@3.6.7";

const required = (name: string) => {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const partsAt = (date: Date, timezone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, weekday: "short", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday")), date: `${get("year")}-${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
};

Deno.serve(async (request) => {
  try {
    if (request.headers.get("x-cron-secret") !== required("CRON_SECRET")) return new Response("Unauthorized", { status: 401 });
    const url = required("SUPABASE_URL");
    const secretBundle = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const serviceKey = secretBundle.default || required("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    webpush.setVapidDetails(required("VAPID_SUBJECT"), required("VAPID_PUBLIC_KEY"), required("VAPID_PRIVATE_KEY"));

    const { data: subscriptions, error } = await supabase.from("push_subscriptions").select("user_id,endpoint,subscription,timezone").eq("enabled", true);
    if (error) throw error;
    const ids = [...new Set((subscriptions ?? []).map((item) => item.user_id))];
    const { data: snapshots, error: snapshotError } = ids.length ? await supabase.from("dayflow_snapshots").select("user_id,data").in("user_id", ids) : { data: [], error: null };
    if (snapshotError) throw snapshotError;
    const byUser = new Map((snapshots ?? []).map((row) => [row.user_id, row.data]));
    let sent = 0;

    for (const item of subscriptions ?? []) {
      const snapshot = byUser.get(item.user_id);
      const routine = snapshot?.routines?.find((candidate: { id: string }) => candidate.id === snapshot.settings?.activeRoutineId);
      if (!routine) continue;
      const local = partsAt(new Date(), item.timezone || "UTC");
      for (const block of routine.blocks ?? []) {
        const lead = block.notificationMinutesBefore;
        if (block.day !== local.weekday || typeof lead !== "number" || lead <= 0) continue;
        const [hour, minute] = String(block.start).split(":").map(Number);
        if (hour * 60 + minute - lead !== local.minutes) continue;
        const delivery = { user_id: item.user_id, endpoint: item.endpoint, block_id: block.id, local_date: local.date, lead_minutes: lead };
        const { error: claimError } = await supabase.from("notification_deliveries").insert(delivery);
        if (claimError?.code === "23505") continue;
        if (claimError) throw claimError;
        try {
          await webpush.sendNotification(item.subscription, JSON.stringify({ title: `In ${lead} min: ${block.title}`, body: block.tinyStart || "Open DayFlow when you're ready.", tag: `block-${block.id}-${local.date}`, url: "/" }));
          sent += 1;
        } catch (pushError) {
          const status = (pushError as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) await supabase.from("push_subscriptions").delete().eq("endpoint", item.endpoint);
          else await supabase.from("notification_deliveries").delete().match(delivery);
        }
      }
    }
    return Response.json({ checked: subscriptions?.length ?? 0, sent });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
});
