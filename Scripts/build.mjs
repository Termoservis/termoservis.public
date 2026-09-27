import { cp, mkdir, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "dist");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
// Ship only public assets, never development tools or the archived website.
for (const item of [
  "index.html",
  "md",
  "_headers",
  "assets",
  "Styles/site.css",
  "Scripts/site.js",
  "Resources/Images/Termoservis.png",
  "Resources/Images/TermoservisMD.png",
  "Resources/DIMNJACI.pdf",
]) {
  await mkdir(path.dirname(path.join(output, item)), { recursive: true });
  await cp(path.join(root, item), path.join(output, item), { recursive: true });
}
console.log("Static website ready in dist/.");
