/**
 * Push local data/*.json seed files to Cloudflare KV.
 * Run after `npm run seed` to sync KV with fresh seed data.
 *
 * Usage: npm run seed:kv
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const KV_NAMESPACE_ID = "c958b7ea19de47109058ea06753c9529";
const DATA_DIR = path.join(process.cwd(), "data");
const COLLECTIONS = ["users", "gigs", "swipes", "matches"];

for (const name of COLLECTIONS) {
  const filePath = path.join(DATA_DIR, `${name}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");

  // Wrangler kv key put expects the value via stdin or --value flag
  const key = `collection:${name}`;
  const compact = JSON.stringify(JSON.parse(raw));

  execSync(
    `npx wrangler kv key put --namespace-id="${KV_NAMESPACE_ID}" --remote "${key}" '${compact.replace(/'/g, "'\\''")}'`,
    { stdio: "inherit" },
  );

  console.log(`  KV: ${key} (${compact.length} bytes)`);
}

console.log("");
console.log("KV seed complete. Deploy or refresh the app to pick up changes.");
