# Service Worker

A service worker is a background script that persist in a user's browser and provides
performance enhancements, and unlocks some features not available to scripts normally,
like push notifications. It runs in a separate context, so has no access to the DOM,
however it does share some context like IndexDB etc.

## Caching

Service workers, once installed and activated, have the ability to intercept all requests
made by the browser. This allows us to cache assets (js, css, html, api responses, etc)
from requests and serve them using any kind of strategy, e.g. cache-first,
stale-while-revalidating, network-first.

This also means that once cached we can serve our application while the user is offline,
even if they don't have the web page open.

Another useful strategy is pre-fetching, where a supplied manifest file can be preloaded
on activation of a service worker.

## Code

Google's Workbox is a set of tools to help craft a service worker's logic. At MMH we use
this defined in our
[root config](https://github.com/LBHackney-IT/mtfh-frontend-root/blob/main/src/service-worker/index.ts).

We use a cache-first approach for files that we know won't change as they are versioned in
the file name. So things like a MFE's assets which produce file names like
`[name].[contenthash].js` we can guarentee the cache-first approach won't produce issues.

However, things like the `import-map.json` files, do not have any versioning we can rely
on, so we use a network-first strategy.

Additionally, we provide a PurgeablePlugin Strategy Plugin, that will remove any old cache
files if a MFE's assets have changed.

Currently in our
[template file](https://github.com/LBHackney-IT/mtfh-frontend-root/blob/cc6857a6efb7e59ab03ac8ecd40ea2fafaaf277d/src/index.ejs#L46)
we disable the service worker in production and local development. We felt that it needs
supervision still before we release it to production, as well as the risk of releasing
something problematic without the knowledge to resolve it.

## Disabled Service Workers

As mentioned above service workers are disabled in local and production environments.

The reason its disabled in local is due to a limitation of the Workbox's Webpack
InjectManifest plugin and how webpack emits built files in devServer.

Another place where we remove the service worker is in Cypress. Cypress has very limited
support for service workers, and often competes with a service worker's features. Both can
intercept network requests, and manipulate a fallback html page.

## Dangers

Service workers are notoriously challenging. Using the incorrect caching strategy can
provide weird UI issues, and even more difficult to resolve, as the problem is now baked
into the user's browser.

When making changes to a service worker, it is important to test them out in dev/staging
environmnets for a period of time, and subsequent deployments have been made to see that
no UI issues creep in.
