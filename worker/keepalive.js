/* Calm Match — keeps the free Supabase project (parent accounts) from being paused for inactivity.
   Runs on the Cron Trigger in wrangler.jsonc (every 3 days), never on a visitor's request.
   It calls public.keepalive() (supabase/04-keepalive.sql), which writes one timestamp. No visitor data is sent
   or stored. The URL and the publishable key are the same public values as site/js/config.js (check.py compares them). */
export async function keepAlive(env) {
  const url = env.SUPABASE_URL, key = env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) { console.log("keepalive: no Supabase settings in wrangler.jsonc vars, skipped"); return; }
  const res = await fetch(url.replace(/\/$/, "") + "/rest/v1/rpc/keepalive", {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: "{}",
  });
  // A failure here doesn't affect the site. Only the status is logged, so a paused or broken project shows up in the Worker's logs.
  console.log("keepalive: Supabase answered " + res.status);
  if (!res.ok) throw new Error("keepalive failed: " + res.status);
}
