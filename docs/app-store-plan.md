# App-store versions: plan (not built)

Status: groundwork only. Calm Match already installs from the browser ("Add to Home Screen") and works offline,
so nothing here is needed to launch.

## Google Play (simplest)
- Wrap the site as a Trusted Web Activity with Bubblewrap (`npm i -g @bubblewrap/cli`, then `bubblewrap init --manifest=https://calmmatch.com/manifest.webmanifest`).
- Needs a Google Play developer account (one-off fee) in your name, and your app signing key's SHA-256 fingerprint.
- Publish `site/.well-known/assetlinks.json` with that fingerprint so the app opens the site without a browser bar.
- Families policy: the app targets children, so it must join Google Play's Families programme. That means the
  Data safety form (Calm Match collects nothing on the device; accounts are optional and parent-only) and the
  Teacher Approved review if wanted.

## Apple App Store (more work)
- Apple doesn't accept a plain website wrapper. It needs a native shell (for example Capacitor) with some
  native value, and an Apple Developer account (yearly fee).
- The Kids category has strict rules: no third-party analytics or ads (Calm Match has none), parental gate before
  links out (the grown-ups button already is one; the donate link would need to sit behind it, which it does).
- App privacy "nutrition label": Data Not Collected for the app; the optional account collects an email address.

## Before either
- Final icons at store sizes, screenshots on phone and tablet, a short description, and the privacy policy URL.
- Decide who the publisher is (your name or the registered business name, see checklist item lawD).
