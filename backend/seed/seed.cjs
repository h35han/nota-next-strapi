#!/usr/bin/env node
/**
 * Seed the NŌTA backend from the scraped content in ./data.json.
 *
 * Usage:
 *   npm run seed --workspace backend                # create only if collection is empty
 *   npm run seed --workspace backend -- --reset     # delete existing entries first, then re-seed
 *
 * Requires a compiled build of the backend (config + content types live in ./dist).
 * Run `npm run build --workspace backend` first if ./dist is missing or stale.
 *
 * Must be CommonJS (.cjs): requiring "@strapi/strapi" pulls in the CJS build,
 * which is the only build that runs the full Strapi stack outside the CLI.
 */
const { existsSync } = require('node:fs');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const { createStrapi } = require('@strapi/strapi');

const appDir = path.join(__dirname, '..');
const distDir = path.join(appDir, 'dist');

const COLLECTIONS = {
  products: 'api::product.product',
  specs: 'api::spec.spec',
  audiences: 'api::audience.audience',
  features: 'api::feature.feature',
  color_variants: 'api::color-variant.color-variant',
  box_items: 'api::box-item.box-item',
};

function assertBuildExists() {
  const requirements = [path.join(distDir, 'config', 'server.js'), path.join(distDir, 'src', 'api')];
  const missing = requirements.filter((p) => !existsSync(p));
  if (missing.length > 0) {
    console.error(
      `[seed] Compiled backend not found under ${distDir}.\n` +
        '[seed] Run "npm run build --workspace backend" and try again.'
    );
    process.exit(1);
  }
}

async function main() {
  require('dotenv').config({ path: path.join(appDir, '.env') });
  assertBuildExists();

  const data = JSON.parse(await readFile(path.join(__dirname, 'data.json'), 'utf8'));
  const reset = process.argv.includes('--reset');

  console.log(`[seed] Booting Strapi (reset=${reset})…`);
  const strapi = createStrapi({ appDir, distDir });
  await strapi.load();

  let created = 0;
  let skipped = 0;

  try {
    for (const [key, uid] of Object.entries(COLLECTIONS)) {
      const entries = data[key] ?? [];
      const existing = await strapi.documents(uid).findMany({});

      if (!reset && existing.length > 0) {
        console.log(`[seed] ${uid}: ${existing.length} existing — skipping (use --reset to re-seed)`);
        skipped += 1;
        continue;
      }

      if (reset && existing.length > 0) {
        for (const doc of existing) {
          await strapi.documents(uid).delete({ documentId: doc.documentId });
        }
        console.log(`[seed] ${uid}: deleted ${existing.length} existing entries`);
      }

      for (const entry of entries) {
        await strapi.documents(uid).create({ data: entry, status: 'published' });
        created += 1;
      }

      console.log(`[seed] ${uid}: created ${entries.length} entry(-ies), published`);
    }
  } finally {
    await strapi.destroy();
  }

  console.log(`\n[seed] Done. Created ${created}, skipped ${skipped} collection(s).`);
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});