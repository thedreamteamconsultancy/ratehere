// Run this in browser console to clear all service workers
// This will fix the continuous update prompts

// Unregister all service workers
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister().then(function(success) {
      console.log('Service Worker unregistered:', success);
    });
  }
});

// Clear all caches
caches.keys().then(function(cacheNames) {
  return Promise.all(
    cacheNames.map(function(cacheName) {
      return caches.delete(cacheName);
    })
  );
}).then(function() {
  console.log('All caches cleared');
});

// Clear localStorage flag
localStorage.removeItem('pwa-install-dismissed');

console.log('Service workers and caches cleared. Please refresh the page.');
