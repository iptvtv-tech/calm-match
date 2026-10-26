/* Calm Match — saves the Irish checker's ticks and corrections.
   Handles /review/api inside the site's Worker (see worker/index.js), behind Cloudflare Access.
   Access puts the signed-in person's email on every request (Cf-Access-Authenticated-User-Email);
   without it we refuse, so the API is closed until Access is switched on for /review/*.
   Storage: the KV namespace bound as REVIEW in wrangler.jsonc.
   Keys: item:<id> → { ok, note, by, at }. Nothing about children is ever stored here. */
export async function reviewApi(request, env) {
  const email = request.headers.get("Cf-Access-Authenticated-User-Email");
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" } });
  if (!email) return json({ error: "Sign in through Cloudflare Access first." }, 401);
  if (!env.REVIEW) return json({ error: "The REVIEW storage isn't set up yet (kv_namespaces in wrangler.jsonc)." }, 503);

  if (request.method === "GET") {
    const out = {}; let cursor;
    do {
      const page = await env.REVIEW.list({ prefix: "item:", cursor });
      for (const k of page.keys) { const v = await env.REVIEW.get(k.name, "json"); if (v) out[k.name.slice(5)] = v; }
      cursor = page.list_complete ? null : page.cursor;
    } while (cursor);
    return json({ me: email, items: out });
  }
  if (request.method === "PUT") {
    let body; try { body = await request.json(); } catch (e) { return json({ error: "Bad request." }, 400); }
    const id = String(body.id || "");
    if (!/^[a-z]-[a-z0-9-]{1,40}$/.test(id)) return json({ error: "Bad id." }, 400);
    const note = String(body.note || "").slice(0, 2000);
    const row = { ok: !!body.ok, note, by: email, at: new Date().toISOString() };
    if (!row.ok && !note.trim()) await env.REVIEW.delete("item:" + id); else await env.REVIEW.put("item:" + id, JSON.stringify(row));
    return json({ saved: row });
  }
  return json({ error: "Method not allowed." }, 405);
}
