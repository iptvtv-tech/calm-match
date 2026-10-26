#!/usr/bin/env node
/* Builds the data for the private Irish review page at calmmatch.com/review/ from the two review sheets.

       node tools/irish-review.js && node tools/singalong.js review > docs/singalong-irish-lyrics.md && node tools/review-page.js

   Writes site/review/data.js (window.REVIEW_DATA). The page itself (site/review/index.html + review.js) is
   hand-written and doesn't change. Item ids are a hash of section + English + Irish, so a line keeps its tick
   until its text changes. The page is behind Cloudflare Access and is not in the service worker or sitemap. */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = path.resolve(__dirname, "..");
const siteMd = fs.readFileSync(path.join(ROOT, "docs/irish-review.md"), "utf8");
const songMd = fs.readFileSync(path.join(ROOT, "docs/singalong-irish-lyrics.md"), "utf8");
const id = (s) => crypto.createHash("sha1").update(s).digest("hex").slice(0, 10);
const unesc = (s) => s.replace(/\\\|/g, "|").trim();

function parse(md, prefix, opts = {}) {
  const sections = []; let cur = null;
  for (const line of md.split("\n")) {
    const h = line.match(/^## (.+)$/);
    if (h) { cur = { title: h[1].trim().replace(/\s*\((?:site|tools)\/[^)]*\)/g, "").replace(/`/g, ""), items: [], intro: [] }; sections.push(cur); continue; }
    if (!cur) continue;
    if (/^\|/.test(line)) {
      const cells = line.slice(1, -1).split(/(?<!\\)\|/).map(unesc);
      if (/^-+$/.test(cells[0].replace(/\s/g, "")) || /^(English|Letter|Number)$/i.test(cells[0]) || cells.length < 2) continue;
      const en = cells[0], ga = cells[1]; if (!en && !ga) continue;
      cur.items.push({ id: prefix + "-" + id(cur.title + "|" + en + "|" + ga), en, ga, syl: opts.syl ? cells[2] : undefined });
      continue;
    }
    const pc = line.match(/^\*\*Please check:\*\*\s*(.+)$/); if (pc) { cur.check = (cur.check || []).concat(pc[1]); continue; }
    const mm = line.match(/^Meaning:\s*(.+)$/); if (mm) { cur.meaning = mm[1]; continue; }
    if (/^\d+\.\s\*\*/.test(line) && /Questions/.test(cur.title)) { const q = line.replace(/^\d+\.\s/, "").replace(/\*\*/g, ""); cur.items.push({ id: prefix + "-q-" + id(q), en: q, ga: "", question: true }); continue; }
    if (/^\*\*[^*]+\*\*$/.test(line.trim()) && cur.items.length) { cur.items.push({ id: prefix + "-h-" + id(line), heading: line.replace(/\*\*/g, "").trim() }); continue; }
    if (line.trim() && !/^_/.test(line) && !cur.items.length) cur.intro.push(line.trim().replace(/`/g, "").replace(/\*\*/g, ""));
  }
  for (const s of sections) s.intro = s.intro.slice(0, 2);
  return sections.filter((s) => s.items.length);
}
const data = { made: new Date().toISOString().slice(0, 10), site: parse(siteMd, "s"), songs: parse(songMd, "g", { syl: true }) };
const n = data.site.concat(data.songs).reduce((a, s) => a + s.items.filter((i) => !i.heading).length, 0);
fs.writeFileSync(path.join(ROOT, "site/review/data.js"), "/* Made by tools/review-page.js. Do not edit: edit the Irish in the source files and rebuild. */\nwindow.REVIEW_DATA = " + JSON.stringify(data).replace(/</g, "\\u003c") + ";\n");
console.log("site/review/data.js: %d items in %d sections", n, data.site.length + data.songs.length);
