// PWA Configuration and Offline Support

// Service Worker for offline functionality
const CACHE_NAME = 'green-penny-pal-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add other static assets
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).catch(() => {
          // If both cache and network fail, return offline page
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Background sync for pending activities
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-activities') {
    event.waitUntil(syncPendingActivities());
  }
});

async function syncPendingActivities() {
  try {
    const db = await openDB();
    const pendingActivities = await getAllPendingActivities(db);
    
    for (const activity of pendingActivities) {
      try {
        // Attempt to sync with server
        const response = await fetch('/api/activities', {
          method: 'POST',
          body: JSON.stringify(activity.data),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          // Remove from pending queue
          await removePendingActivity(db, activity.id);
        }
      } catch (error) {
        console.log('Sync failed for activity:', activity.id);
      }
    }
  } catch (error) {
    console.log('Background sync failed:', error);
  }
}

// IndexedDB for offline data storage
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GreenPennyPalDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Store for offline activities
      if (!db.objectStoreNames.contains('pendingActivities')) {
        const store = db.createObjectStore('pendingActivities', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
      
      // Store for cached user data
      if (!db.objectStoreNames.contains('userData')) {
        db.createObjectStore('userData', { keyPath: 'key' });
      }
      
      // Store for cached suggestions
      if (!db.objectStoreNames.contains('suggestions')) {
        const suggestionsStore = db.createObjectStore('suggestions', { keyPath: 'id' });
        suggestionsStore.createIndex('userId', 'userId', { unique: false });
        suggestionsStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

async function getAllPendingActivities(db) {
  const transaction = db.transaction(['pendingActivities'], 'readonly');
  const store = transaction.objectStore('pendingActivities');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removePendingActivity(db, id) {
  const transaction = db.transaction(['pendingActivities'], 'readwrite');
  const store = transaction.objectStore('pendingActivities');
  
  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}