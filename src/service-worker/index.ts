import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute, setDefaultHandler } from "workbox-routing";
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from "workbox-strategies";

import { PurgablePlugin } from "./purgeable-plugin";

declare const self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();
cleanupOutdatedCaches();

// PreCache the html
precacheAndRoute(self.__WB_MANIFEST);

// Cache Google Fonts
registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new StaleWhileRevalidate({
    cacheName: "google-fonts-stylesheets",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts-assets",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 10,
      }),
    ],
  }),
);

// Cache Cloudflare CDN Assets
registerRoute(
  ({ url }) => url.origin === "https://cdnjs.cloudflare.com",
  new CacheFirst({
    cacheName: "cdn-assets",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 10,
      }),
    ],
  }),
);

// Cache import-maps
registerRoute(
  ({ url }) => url.pathname.endsWith("/import-map.json"),
  new NetworkFirst({
    cacheName: "import-maps",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 30,
        maxEntries: 20,
      }),
    ],
  }),
);

// Cache mfe assets
registerRoute(
  ({ url }) =>
    ["localhost", ".cloudfront.net", ".hackney.gov.uk"].some((origin) =>
      url.origin.includes(origin),
    ) &&
    url.pathname.endsWith(".js") &&
    !url.pathname.endsWith(".hot-update.js") &&
    !url.pathname.endsWith("/sw.js"),
  new CacheFirst({
    cacheName: "mfe-assets",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 50,
      }),
      new PurgablePlugin(),
    ],
  }),
);

registerRoute(
  ({ url }) =>
    url.origin.includes("execute-api.eu-west-2.amazonaws.com") &&
    url.pathname.includes("/api/"),
  new NetworkFirst({
    networkTimeoutSeconds: 5,
    cacheName: "api",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [200, 404],
      }),
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  }),
  "GET",
);

setDefaultHandler(
  new StaleWhileRevalidate({
    cacheName: "default",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24,
      }),
    ],
  }),
);

const routeHandler = createHandlerBoundToURL("/index.html");
// Deny access to fallback routing in cypress `/__/#/`
registerRoute(new NavigationRoute(routeHandler, { denylist: [/^\/__\//] }));
