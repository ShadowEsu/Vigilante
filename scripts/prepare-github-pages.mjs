import fs from "fs";
import path from "path";

const root = process.cwd();
const stash = path.join(root, ".github-pages-stash");

const moves = [
  "src/app/api",
  "src/app/app",
  "src/app/preview/new",
  "src/app/preview/settings",
  "src/app/preview/agent",
  "src/app/preview/insights",
  "src/app/preview/analytics",
  "src/app/preview/signals",
  "src/app/preview/agents",
  "src/middleware.ts",
];

const actionStub = `"use server";

import type { TargetType } from "@/types/database";

export interface CreateAnalysisInput {
  name: string;
  target_type: TargetType;
  target: string;
  source_url: string;
  model: string;
  budget_cap_usd: number;
  cadence_minutes: number;
}

export async function createAnalysis(_input: CreateAnalysisInput) {
  return { ok: false as const, error: "Unavailable on static site" };
}

export async function signOut() {
  return;
}
`;

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function moveDir(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
  rmrf(from);
}

rmrf(stash);
fs.mkdirSync(stash, { recursive: true });

for (const rel of moves) {
  const from = path.join(root, rel);
  if (!fs.existsSync(from)) continue;
  const to = path.join(stash, rel.replace(/\//g, "__"));
  moveDir(from, to);
  console.log(`stashed ${rel}`);
}

const actionsFile = path.join(root, "src/app/actions/analysis.ts");
const actionsStash = path.join(stash, "analysis.ts");
if (fs.existsSync(actionsFile)) {
  fs.copyFileSync(actionsFile, actionsStash);
  fs.writeFileSync(actionsFile, actionStub);
  console.log("stubbed src/app/actions/analysis.ts");
}
