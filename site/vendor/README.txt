The Supabase sign-in library, self-hosted (required for parent accounts).

supabase.js here is @supabase/supabase-js version 2.45.4 (UMD build). It is NOT included in the zips Claude sends,
so keep this file when you copy in a new version of the site. Without it, the Account page says accounts aren't available.

To update the library later:
  1. Open https://cdn.jsdelivr.net/npm/@supabase/supabase-js@<new version>/dist/umd/supabase.js in your browser,
     save it over this supabase.js, and change the version number above.
  2. Deploy, then sign in, sign out and reset a password to check it works.
The site never loads code from other sites: the security rules in _headers only allow scripts from calmmatch.com.
