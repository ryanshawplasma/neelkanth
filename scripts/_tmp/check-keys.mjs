import fs from "node:fs";
import path from "node:path";

const src = fs.readFileSync("src/i18n/messages/admin.ts", "utf8");
const enBlock = src.slice(src.indexOf("  en: {"), src.indexOf("  hi: {"));
const hiBlock = src.slice(src.indexOf("  hi: {"));
const keysOf = (b) => new Set([...b.matchAll(/^\s{4}([a-zA-Z0-9_]+):/gm)].map((m) => m[1]));
const en = keysOf(enBlock), hi = keysOf(hiBlock);

const used = new Set();
function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.tsx?$/.test(f.name)) {
      const s = fs.readFileSync(p, "utf8");
      for (const m of s.matchAll(/"admin\.([a-zA-Z0-9_]+)"/g)) used.add(m[1]);
    }
  }
}
walk("src/app/(admin)"); walk("src/components/admin"); walk("src/lib/admin");

const missingEn = [...used].filter((k) => !en.has(k) && k !== "errX");
const missingHi = [...en].filter((k) => !hi.has(k));
const extraHi = [...hi].filter((k) => !en.has(k));
const unused = [...en].filter((k) => !used.has(k));
console.log("en keys:", en.size, "hi keys:", hi.size, "used:", used.size);
console.log("MISSING in en:", missingEn.join(", ") || "none");
console.log("MISSING in hi:", missingHi.join(", ") || "none");
console.log("EXTRA in hi:", extraHi.join(", ") || "none");
console.log("UNUSED:", unused.join(", ") || "none");
