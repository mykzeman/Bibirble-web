// Bibirble service worker: lets the installed app work offline.
// Bump CACHE when shipping changes so players get the new files.
const CACHE = 'bibirble-v13';
const SHELL = [
    './',
    'index.html',
    'manifest.webmanifest',
    'styles/styles.css',
    'scripts/answer.js',
    'scripts/books.js',
    'scripts/data.js',
    'scripts/game.js',
    'scripts/keyboard.js',
    'scripts/parse.js',
    'scripts/submit.js',
    'scripts/useful.js',
    'fonts/material-symbols-rounded.woff2',
    'icons/icon.svg',
    'icons/icon-192.png',
    'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    // cache: 'reload' skips the browser's HTTP cache so a new version never
    // gets stale files from the old one.
    event.waitUntil(caches.open(CACHE).then((cache) =>
        cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' })))));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Network first so updates show up right away; fall back to cache offline.
// 'no-cache' checks with the server every time (cheap when nothing changed)
// instead of trusting the browser's HTTP cache, which could hand back old
// scripts. The big verse file (bible_sections.json) gets cached the first time
// it loads.
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
    event.respondWith(
        fetch(req, { cache: 'no-cache' }).then((res) => {
            if (res.ok) {
                const copy = res.clone();
                caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
        }).catch(() => caches.match(req, { ignoreSearch: true }))
    );
});
