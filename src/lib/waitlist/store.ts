import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { PlanTier } from "@/lib/billing/plans";

export interface WaitlistEntry {
  id: string;
  email: string;
  company?: string;
  role?: string;
  source: string;
  plan_tier?: PlanTier;
  promo_code?: string;
  discount_percent?: number;
  founding_credit?: boolean;
  due_monthly_usd?: number;
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const FILE = path.join(DATA_DIR, "waitlist.json");

async function readAll(): Promise<WaitlistEntry[]> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as WaitlistEntry[];
  } catch {
    return [];
  }
}

export async function addWaitlistLocal(entry: Omit<WaitlistEntry, "id" | "created_at">): Promise<WaitlistEntry> {
  const all = await readAll();
  const email = entry.email.toLowerCase().trim();
  if (all.some((e) => e.email.toLowerCase() === email)) {
    throw new Error("Already on the waitlist");
  }
  const item: WaitlistEntry = {
    ...entry,
    email,
    id: randomUUID(),
    created_at: new Date().toISOString(),
  };
  all.unshift(item);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
  return item;
}

export async function countWaitlistLocal(): Promise<number> {
  return (await readAll()).length;
}
