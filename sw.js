const CACHE = "nerd-news-v5";
self.addEventListener("install", e => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(hit => hit || caches.match("./"))));
});
// Morning alert (see alerts.py): the ping has no data, so read today's headline from the site.
self.addEventListener("push", e => e.waitUntil(
  fetch("latest.json", {cache: "no-store"}).then(r => r.json()).catch(() => ({}))
    .then(ed => self.registration.showNotification("Today's Nerd News is ready", {
      body: ed.headline || "Your morning research paper", icon: "icon-192.png", tag: "edition",
    }))));
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: "window"}).then(list => {
    for (const c of list) if ("focus" in c) { c.navigate("./"); return c.focus(); }
    return clients.openWindow("./");
  }));
});
