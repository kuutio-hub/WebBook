
const CACHE_NAME = 'web-ebook-reader-cache-v1.5.0.0';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/index.js',
  '/constants.js',
  '/services/dbService.js',
  '/services/epubService.js',
  '/services/hyphenationService.js',
  '/services/pdfService.js',
  '/services/themeService.js',
  '/views/bookDetails.js',
  '/views/converterModal.js',
  '/views/icons.js',
  '/views/library.js',
  '/views/pdfReader.js',
  '/views/reader.js',
  '/views/readerControls.js',
  '/views/wikiModal.js',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&family=Inter:wght@400;700&family=Lora:wght@400;700&family=Merriweather:wght@400;700&family=Noto+Serif:wght@400;700&family=Playfair+Display:wght@400;700&family=Roboto+Slab:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js',
  'https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js',
  'https://unpkg.com/hypher@0.2.5/dist/hypher.js',
  'https://unpkg.com/hyphenation.hu@0.2.1/dist/hyphenation.hu.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll for atomic operation, but handle potential individual failures if necessary.
        return cache.addAll(URLS_TO_CACHE.map(url => new Request(url, { mode: 'no-cors' })))
            .catch(error => {
                console.error('Failed to cache some resources during install:', error);
            });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            // This is a basic offline fallback.
            // You might want to return a specific offline page for navigation requests.
        });
      }
    )
  );
});
