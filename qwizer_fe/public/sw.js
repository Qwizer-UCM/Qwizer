/* eslint-disable no-underscore-dangle */
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

/*
  Some developers want to be able to publish a new service worker and have it control 
  already-open web pages as soon as soon as it activates, which will not happen by default.
*/
self.skipWaiting();
clientsClaim();

/*
  Precachear los ficheros estaticos, es decir los que estaran en la capeta build, que es la que
  se usa para desplegar el proyecto en produccion(index.html,.css,.js...) para el funcionamiento de la app
*/
cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST); // cachea cuando el service worker se esta instalando

/*
Si no hay conexion cuando el usuario va a enviar el test,
cachear esa peticion y cuando haya conexion enviarla.
*/
const sentTestUrl = `${import.meta.env.REACT_APP_API_URL}/test/\\d+/enviar$`;

registerRoute(
  new RegExp(sentTestUrl),
  new NetworkOnly({
    plugins: [
      new BackgroundSyncPlugin('test-post-requests', {
        maxRetentionTime: 24 * 60, // Reintentar por un maximo de 24h
      }),
    ],
  }),
  'POST'
);

// TODO Problema, no se cachean la primera vez que se carga la página debido a que el sw no esta aun registrado
// TODO revisar estrategias https://developer.chrome.com/docs/workbox/caching-resources-during-runtime/
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({
    cacheName: 'google-fonts-stylesheets',
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://cdn.jsdelivr.net',
  new StaleWhileRevalidate({
    cacheName: 'jsdelivr-cache',
  })
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new StaleWhileRevalidate({
    cacheName: 'gstatic-cache',
  })
);
