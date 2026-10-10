// Bibirble service worker: lets the installed app work offline.
// Bump CACHE when shipping changes so players get the new files.
const CACHE = 'bibirble-v1';
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
    'icons/icon.svg',
    'icons/icon-192.png',
    'icons/icon-512.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
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
// The big verse file (bible_sections.json) gets cached the first time it loads.
self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
    event.respondWith(
        fetch(req).then((res) => {
            if (res.ok) {
                const copy = res.clone();
                caches.open(CACHE).then((cache) => cache.put(req, copy));
            }
            return res;
        }).catch(() => caches.match(req, { ignoreSearch: true }))
    );
});
