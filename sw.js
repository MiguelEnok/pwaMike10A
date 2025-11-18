// Nombre del caché
const CACHE_NAME = "v1_cache_mike";

// Archivos que queremos cachear
const urlsToCache = [
    "/",
    "/index.html",
    "/css/styles.css",
    "/css/styles copy.css",
    "/manifest.json",

    "/img/doom-dark-ages.png",
    "/img/doom-eternal.png",
    "/img/doom1.png",
    "/img/doom2-exp.png",
    "/img/doom3.png",

    //iconos
    "/iconos/1.png",
    "/iconos/2.png",
    "/iconos/3.png",
    "/iconos/4.png",
    "/iconos/5.png",
    "/iconos/6.png",
    "/iconos/facebook.png",
    "/iconos/instagram.png",
    "/iconos/twitter.png",

    //iconosLol
    "/img/16.png",
    "/img/24.png",
    "/img/32.png",
    "/img/64.png",
    "/img/96.png",
    "/img/128.png",
    "/img/192.png",
    "/img/256.png",
    "/img/512.png",
    "/img/1024.png",
];

// Instalación del service worker y cacheo inicial
self.addEventListener("install", (e) => {
    console.log("[Service Worker] Instalando y cacheando archivos...");
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Archivos cacheados");
            return cache.addAll(urlsToCache);
        }).catch((err) => console.log("[Service Worker] Error al cachear archivos:", err))
    );
});

// Activación del service worker
self.addEventListener("activate", (e) => {
    console.log("[Service Worker] Activado");

    const cacheWhitelist = [CACHE_NAME];

    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log("[Service Worker] Borrando caché vieja:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            )
        }
        )
    ).then(() => {
        self.clients.claim();
    });
});

// Interceptar peticiones y responder con caché
self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            if (response) {
                console.log("[Service Worker] Recurso encontrado en caché:", e.request.url);
                return response;
            }
            return fetch(e.request);
        })
    );
});
