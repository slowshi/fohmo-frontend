/* global workbox */
workbox.getConfig({
  debug: false
});

workbox.skipWaiting();
workbox.cientsClaim();

window.self.__precacheManifest = [].concat(window.self.__precacheManifest || []);
workbox.precaching.supressWarnings();
workbox.precaching.precacheAndRoute(window.self.__precacheManifest, {});
