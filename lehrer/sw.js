// Offline-Betrieb des Gebärden-Wörterbuchs (lehrer-App). Erzeugt von baue_woerterbuch_github.py – nicht von Hand ändern.
  const CACHE = "lehrer-75400f215f";
  const FILES = ["./", "./index.html", "./datenschutz.html", "./jszip.min.js", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png", "./schriften/bricolage-grotesque-latin-opsz-normal.woff2", "./schriften/atkinson-hyperlegible-next-latin-wght-normal.woff2", "./schriften/OFL.txt"];
  self.addEventListener("install", e => {
    // cache: "reload" – nicht aus dem HTTP-Cache des Browsers füllen (sonst kann eine alte index.html in den neuen Cache geraten)
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(u => new Request(u, {cache: "reload"})))).then(() => self.skipWaiting()));
  });
  self.addEventListener("activate", e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("lehrer-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
  });
  // Prüfer A2/A6: nur im eigenen Speicher suchen; die Schüler-App lässt den Ordner lehrer/ ganz in Ruhe.
  const AUS = "";
  const eigen = req => caches.open(CACHE).then(c => c.match(req));
  const merken = (req, r) => { if (r.ok) { const k = r.clone(); caches.open(CACHE).then(c => c.put(req, k)); } return r; };
  self.addEventListener("fetch", e => {
    const req = e.request, url = new URL(req.url);
    if (req.method !== "GET" || url.origin !== location.origin) return;
    if (AUS && url.href.startsWith(new URL(AUS, self.registration.scope).href)) return;
    if (req.mode === "navigate") {
      // Seite: erst Netz (damit Änderungen ankommen), ohne Netz aus dem eigenen Speicher
      // jede Seite unter ihrer eigenen Adresse speichern (sonst würde z. B. datenschutz.html die Startseite überschreiben)
      e.respondWith(fetch(req).then(r => merken(req, r))
        .catch(() => eigen(req).then(r => r || eigen("./")).then(r => r || eigen("./index.html"))));
      return;
    }
    // Prüfer A3: Übungssätze erst aus dem Netz (Austausch ohne neue sw.js), ohne Netz aus dem Speicher
    if (url.pathname.includes("/daten/")) { e.respondWith(fetch(req, {cache: "no-cache"}).then(r => merken(req, r)).catch(() => eigen(req))); return; }
    e.respondWith(eigen(req).then(r => r || fetch(req)));
  });
  