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
  policyDate: "11 October 2026",

  // Supabase (parent accounts and sync). Leave blank to run with no accounts:
  // the site then works fully on the device with nothing sent anywhere.
  supabaseUrl: "https://gchrttqakyisdmcucoid.supabase.co",
  supabaseAnonKey: "sb_publishable_TMcAYKlZYIePzya2MqZKrQ_unV--JIs",  // publishable key: safe to be public. NEVER the secret/service_role key
  supabaseRegion: "EU (Ireland, eu-west-1)", // match the region you pick when creating the project

  // Supabase JS library: self-hosted at site/vendor/supabase.js (version 2.45.4). Nothing loads from other sites.
  // To update it, see site/vendor/README.txt. Leave supabaseCdn blank: the security rules in _headers block other sources.
  supabaseCdn: "",

  // Donations. Leave blank to hide the button.
  donateUrl: "https://buy.stripe.com/4gMdR86ec8o42Q05j8bwk00",            // e.g. "https://ko-fi.com/yourname" or a Stripe payment link
  donateLabel: "Support the site",

  // Optional built-in photo packs (see photos/README.txt), e.g. ["vehicles"]. Parents can add their own photos either way.
  photoPacks: []
};
