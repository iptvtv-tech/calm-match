/* Calm Match — the site's Worker.
   Everything is a static file from site/ (the ASSETS binding in wrangler.jsonc) except /review/api,
   which saves the Irish checker's ticks (worker/review-api.js). No other code runs on requests.
   On a timer (the Cron Trigger in wrangler.jsonc) it keeps the Supabase project awake (worker/keepalive.js). */
import { reviewApi } from "./review-api.js";
import { keepAlive } from "./keepalive.js";

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === "/review/api") return reviewApi(request, env);
    return env.ASSETS.fetch(request);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(keepAlive(env));
  },
};
