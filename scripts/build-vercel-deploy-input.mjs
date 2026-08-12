import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = "/home/ubuntu/hobee-mobile/vercel-backend";
const ignored = new Set(["docs"]);

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
await writeFile("/tmp/hobee-vercel-deploy.json", JSON.stringify({ name: "hobee-backend", target: "preview", teamId: "team_NDlLRcFbnWLRyIlIuf1a2doi", files }, null, 2));
