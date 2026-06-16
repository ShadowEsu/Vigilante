import fs from "fs";
import path from "path";

const root = process.cwd();
const stash = path.join(root, ".github-pages-stash");

if (!fs.existsSync(stash)) {
  console.log("nothing to restore");
  process.exit(0);
}

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function moveDir(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (fs.existsSync(to)) rmrf(to);
  fs.cpSync(from, to, { recursive: true });
  rmrf(from);
}

const actionsStash = path.join(stash, "analysis.ts");
const actionsFile = path.join(root, "src/app/actions/analysis.ts");
if (fs.existsSync(actionsStash)) {
  fs.mkdirSync(path.dirname(actionsFile), { recursive: true });
  fs.copyFileSync(actionsStash, actionsFile);
  console.log("restored src/app/actions/analysis.ts");
}

for (const entry of fs.readdirSync(stash)) {
  if (entry === "analysis.ts") continue;
  const from = path.join(stash, entry);
  const rel = entry.replace(/__/g, "/");
  const to = path.join(root, rel);
  moveDir(from, to);
  console.log(`restored ${rel}`);
}

rmrf(stash);
