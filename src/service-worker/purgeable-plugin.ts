import { WorkboxPlugin } from "workbox-core";

declare const self: ServiceWorkerGlobalScope;

/**
 * A plugin that can be used to purge assets from the cache.
 * Utilising capture groups from a regex pattern tp identify the match
 * and compare of an incoming url to that of existing cached requests.
 * e.g having assets compiled by webpack with the following
 * output `[name].[contenthash].js`
 *
 * This plugin will purge the first match of the pattern in the cache
 */
export class PurgablePlugin implements WorkboxPlugin {
  private readonly _pattern: RegExp;
  private readonly _groups: { match: number; compare: number };

  /**
   * Construct a new PurgeablePlugin, by default will match against
   * `[name].[contenthash].js`
   * @param {RegExp} pattern - The pattern to match against the url
   * that must include two capture groups.
   * @param {string} groups - Map of indexes to match in the pattern assertion
   */
  constructor(
    pattern = /([a-z-]+).([a-zA-Z0-9]+).js$/,
    groups = { match: 1, compare: 2 },
  ) {
    this._pattern = pattern;
    this._groups = groups;

    if (process.env.NODE_ENV !== "production") {
      const patternMatch = this._pattern.toString().match(/(\(.*?\))/g);
      if (!patternMatch || !patternMatch[0] || !patternMatch[1]) {
        console.error(
          "[workbox]: The pattern provided to the PurgeablePlugin must include both the match and compare capture groups.",
        );
      }
    }
  }

  private _extractMatchGroups(url: string) {
    const match = url.match(this._pattern);
    if (match) {
      return {
        match: match[this._groups.match],
        compare: match[this._groups.compare],
      };
    }
    return null;
  }

  async cacheDidUpdate({
    cacheName,
    request,
  }: {
    cacheName: string;
    request: Request;
  }): Promise<void> {
    const incoming = this._extractMatchGroups(request.url);
    if (!incoming || !incoming.match || !incoming.compare) {
      return;
    }
    const cache = await self.caches.open(cacheName);
    const cachedRequests = await cache.keys();

    const match = cachedRequests.find((req) => {
      if (req.url === request.url) {
        return false;
      }

      const cacheMatch = this._extractMatchGroups(req.url);
      if (cacheMatch) {
        const found =
          cacheMatch.match === incoming.match && cacheMatch.compare !== incoming.compare;

        return found;
      }
      return false;
    });

    if (match) {
      await cache.delete(match).then((res) => {
        if (process.env.NODE_ENV !== "production") {
          if (res) {
            console.log(`[workbox]: Removing cache file ${match.url}`);
          } else {
            console.error(`[workbox]: Unable to remove cache file ${match.url}`);
          }
        }
      });
    }
  }
}
