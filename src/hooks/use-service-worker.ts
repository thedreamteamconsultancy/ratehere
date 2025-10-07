import { useEffect } from 'react';

// Flag to prevent multiple update prompts
let updatePromptShown = false;

export function useServiceWorker() {
  useEffect(() => {
    // Skip service worker in development to avoid constant update prompts
    const isDevelopment = import.meta.env.DEV;
    
    if (isDevelopment) {
      console.log('Service Worker disabled in development mode');
      return;
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
          });

          console.log('Service Worker registered successfully:', registration.scope);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker is installed but waiting
                  console.log('New content is available; please refresh.');
                  
                  // Show update notification only once
                  if (!updatePromptShown) {
                    updatePromptShown = true;
                    
                    if (confirm('New version available! Click OK to update.')) {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    } else {
                      // Reset flag if user declines, but wait 5 minutes before asking again
                      setTimeout(() => {
                        updatePromptShown = false;
                      }, 5 * 60 * 1000); // 5 minutes
                    }
                  }
                }
              });
            }
          });

          // Handle controller change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service Worker controller changed');
            // Reload only if not already prompted
            if (!updatePromptShown) {
              window.location.reload();
            }
          });

        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      });

      // Handle messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_UPDATED') {
          console.log('Cache updated:', event.data.url);
        }
      });
    }

    // Check for updates periodically (only in production, every hour)
    if ('serviceWorker' in navigator && !isDevelopment) {
      const checkForUpdates = setInterval(() => {
        navigator.serviceWorker.getRegistration().then((registration) => {
          if (registration && !updatePromptShown) {
            registration.update();
          }
        });
      }, 60 * 60 * 1000); // Check every hour (not every minute)

      return () => clearInterval(checkForUpdates);
    }
  }, []);
}

// Hook for online/offline status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('App is online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('App is offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

import React from 'react';
