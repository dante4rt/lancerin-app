import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

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

export function readCollection<T>(collection: string): T[] {
  ensureCollection(collection);
  const raw = fs.readFileSync(collectionPath(collection), "utf-8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function writeCollection<T>(collection: string, rows: T[]): void {
  ensureCollection(collection);
  fs.writeFileSync(
    collectionPath(collection),
    `${JSON.stringify(rows, null, 2)}\n`,
    "utf-8",
  );
}
