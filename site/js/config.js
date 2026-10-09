/* ============================================================
   Calm Match site settings. Edit this file, then redeploy.
   Everything here is public (it is sent to every browser), so
   never put a Supabase service_role key or any password here.
   ============================================================ */
window.CM_CONFIG = {
  siteName: "Calm Match",

  // Who runs the site (shown in the privacy policy and terms).
  ownerName: "J.P Cunningham",
  contactEmail: "hello@calmmatch.com",   // general questions, feedback, accessibility
  privacyEmail: "privacy@calmmatch.com",  // data requests: access, deletion, corrections, complaints
  siteUrl: "https://calmmatch.com",
  policyDate: "9 October 2026",

  // Supabase (parent accounts and sync). Leave blank to run with no accounts:
  // the site then works fully on the device with nothing sent anywhere.
  supabaseUrl: "https://gchrttqakyisdmcucoid.supabase.co",
  supabaseAnonKey: "sb_publishable_TMcAYKlZYIePzya2MqZKrQ_unV--JIs",  // publishable key: safe to be public. NEVER the secret/service_role key
  supabaseRegion: "EU (Ireland, eu-west-1)", // match the region you pick when creating the project

  // Supabase JS library. The site first tries /vendor/supabase.js (self-hosted, best for privacy),
  // then falls back to this pinned CDN copy.
  supabaseCdn: "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js",

  // Donations. Leave blank to hide the button.
  donateUrl: "",            // e.g. "https://ko-fi.com/yourname" or a Stripe payment link
  donateLabel: "Support the site",

  // Optional built-in photo packs (see photos/README.txt), e.g. ["vehicles"]. Parents can add their own photos either way.
  photoPacks: []
};
