/* DayFlow service worker — offline-friendly basics.
 *
 * Strategy:
 *   • Navigations  → network-first, fall back to cache, then the app shell ("/").
 *   • Static/asset → stale-while-revalidate.
 * The app itself keeps its data in localStorage, so once the shell loads it
 * remains fully usable offline.
 */
const CACHE = "dayflow-v2";
const APP_SHELL = [
  "/",
  "/routines",
  "/habits",
  "/applications",
  "/review",
  "/settings",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Best-effort: a single 404 shouldn't abort the whole install.
      await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Never intercept or cache auth flows (e.g. /auth/callback?code=…).
  if (url.pathname.startsWith("/auth/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cached = await caches.match(request);
          return cached || (await caches.match("/")) || Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })(),
  );
});

self.addEventListener("push", (event) => {
  const fallback = { title: "DayFlow by Halynt", body: "Your next block is coming up.", url: "/" };
  let payload = fallback;
  try { payload = { ...fallback, ...event.data.json() }; } catch { /* use gentle fallback */ }
  event.waitUntil(self.registration.showNotification(payload.title, {
    body: payload.body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    tag: payload.tag || "dayflow-reminder",
    data: { url: payload.url || "/" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = windows.find((client) => client.url.startsWith(self.location.origin));
    if (existing) { await existing.focus(); if ("navigate" in existing) await existing.navigate(target); return; }
    await self.clients.openWindow(target);
  })());
});
