// Offline-Betrieb des Gebärden-Wörterbuchs. Erzeugt von baue_woerterbuch_github.py – nicht von Hand ändern.
const CACHE = "woerterbuch-48ab112ca2";
const FILES = ["./", "./index.html", "./datenschutz.html", "./jszip.min.js", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    // Seite: erst Netz (damit Änderungen ankommen), ohne Netz aus dem Speicher
    // jede Seite unter ihrer eigenen Adresse speichern (sonst würde z. B. datenschutz.html die Startseite überschreiben)
    e.respondWith(fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })
      .catch(() => caches.match(req).then(r => r || caches.match("./") || caches.match("./index.html"))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
