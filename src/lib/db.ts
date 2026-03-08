import fs from "node:fs";
import path from "node:path";
import gigsSeed from "../../data/gigs.json";
import matchesSeed from "../../data/matches.json";
import swipesSeed from "../../data/swipes.json";
import usersSeed from "../../data/users.json";

const DATA_DIR = path.join(process.cwd(), "data");
const seedCollections: Record<string, unknown[]> = {
  gigs: gigsSeed,
  matches: matchesSeed,
  swipes: swipesSeed,
  users: usersSeed,
};

declare global {
  var __lancerinCollectionStoreMode: "fs" | "kv" | "memory" | undefined;
  var __lancerinMemoryCollections: Map<string, unknown[]> | undefined;
  var __lancerinKV: KVNamespace | undefined;
}

// Cloudflare KV type (available in Workers runtime)
interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

function cloneRows<T>(rows: T[]): T[] {
  return JSON.parse(JSON.stringify(rows)) as T[];
}

function collectionPath(collection: string): string {
  return path.join(DATA_DIR, `${collection}.json`);
}

function ensureCollection(collection: string): void {
  const filePath = collectionPath(collection);
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "[]", "utf-8");
  }
}

function getMemoryCollections(): Map<string, unknown[]> {
  if (!globalThis.__lancerinMemoryCollections) {
    globalThis.__lancerinMemoryCollections = new Map(
      Object.entries(seedCollections).map(([collection, rows]) => [
        collection,
        cloneRows(rows as unknown[]),
      ]),
    );
  }

  return globalThis.__lancerinMemoryCollections;
}

function canUseFilesystemStore(): boolean {
  if (globalThis.__lancerinCollectionStoreMode === "fs") return true;
  if (globalThis.__lancerinCollectionStoreMode) return false;

  try {
    ensureCollection("users");
    globalThis.__lancerinCollectionStoreMode = "fs";
    return true;
  } catch {
    return false;
  }
}

// --- KV-backed persistence for Cloudflare Workers ---

function getKV(): KVNamespace | null {
  if (globalThis.__lancerinKV) return globalThis.__lancerinKV;

  // Vinext exposes env bindings on process.env at runtime
  const kv = (globalThis as Record<string, unknown>).LANCERIN_KV ??
    (typeof process !== "undefined" ? (process.env as Record<string, unknown>).LANCERIN_KV : undefined);

  if (kv && typeof (kv as KVNamespace).get === "function") {
    globalThis.__lancerinKV = kv as KVNamespace;
    return globalThis.__lancerinKV;
  }

  return null;
}

async function kvRead<T>(collection: string): Promise<T[] | null> {
  const kv = getKV();
  if (!kv) return null;

  const raw = await kv.get(`collection:${collection}`);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : null;
  } catch {
    return null;
  }
}

async function kvWrite<T>(collection: string, rows: T[]): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;

  await kv.put(`collection:${collection}`, JSON.stringify(rows));
  return true;
}

// --- Public API (sync for backward compat, with KV seeding) ---

export function readCollection<T>(collection: string): T[] {
  // 1. Filesystem (local dev)
  if (canUseFilesystemStore()) {
    try {
      ensureCollection(collection);
      const raw = fs.readFileSync(collectionPath(collection), "utf-8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      globalThis.__lancerinCollectionStoreMode = "memory";
    }
  }

  // 2. Memory (Workers fallback — KV seeds asynchronously below)
  return cloneRows((getMemoryCollections().get(collection) ?? []) as T[]);
}

export function writeCollection<T>(collection: string, rows: T[]): void {
  // 1. Filesystem (local dev)
  if (canUseFilesystemStore()) {
    try {
      ensureCollection(collection);
      fs.writeFileSync(
        collectionPath(collection),
        `${JSON.stringify(rows, null, 2)}\n`,
        "utf-8",
      );
      return;
    } catch {
      globalThis.__lancerinCollectionStoreMode = "memory";
    }
  }

  // 2. Memory (immediate for current isolate)
  getMemoryCollections().set(collection, cloneRows(rows));

  // 3. KV (async persistence — fire and forget for cross-isolate consistency)
  void kvWrite(collection, rows);
}

// Awaitable version for API routes that need guaranteed KV persistence
export async function writeCollectionAsync<T>(collection: string, rows: T[]): Promise<void> {
  writeCollection(collection, rows);
  await kvWrite(collection, rows);
}

// --- KV hydration: refresh memory from KV on every request ---
// No guard — always re-reads from KV to pick up writes from other isolates.
// Cost: ~40ms (4 small KV reads). Acceptable for hackathon scope.

export async function hydrateFromKV(): Promise<void> {
  if (canUseFilesystemStore()) return;

  const kv = getKV();
  if (!kv) return;

  const collections = getMemoryCollections();

  for (const name of Object.keys(seedCollections)) {
    const rows = await kvRead(name);
    if (rows && rows.length > 0) {
      collections.set(name, rows);
    }
  }
}
