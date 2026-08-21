import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = "/home/ubuntu/hobee-mobile/vercel-backend";
const ignored = new Set(["docs"]);
const teamId = process.env.VERCEL_TEAM_ID?.trim();

if (!teamId) {
  throw new Error("VERCEL_TEAM_ID is required to build a Vercel deployment input. Use the intended HOBEE owner team; do not use a hardcoded fallback.");
}

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const fullPath = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collect(fullPath));
    else files.push({ file: relative(root, fullPath).replaceAll("\\", "/"), data: await readFile(fullPath, "utf8"), encoding: "utf-8" });
  }
  return files;
}

const files = await collect(root);
await writeFile("/tmp/hobee-vercel-deploy.json", JSON.stringify({ name: "hobee-backend", target: "preview", teamId, files }, null, 2));
