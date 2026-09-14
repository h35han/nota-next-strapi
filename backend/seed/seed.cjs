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
const { existsSync, statSync } = require('node:fs');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const { createStrapi } = require('@strapi/strapi');

const appDir = path.join(__dirname, '..');
const distDir = path.join(appDir, 'dist');

// Where the scraped media lives locally. Override with MEDIA_SRC to point at
// a volume-mounted copy in production, e.g. MEDIA_SRC=/mnt/media/frontend-public.
const MEDIA_SRC = process.env.MEDIA_SRC || path.resolve(__dirname, '..', '..', 'frontend', 'public');

const UPLOAD_FILE_UID = 'plugin::upload.file';

const MIME_BY_EXT = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.json': 'application/json',
};

const COLLECTIONS = {
  products: 'api::product.product',
  specs: 'api::spec.spec',
  audiences: 'api::audience.audience',
  features: 'api::feature.feature',
  color_variants: 'api::color-variant.color-variant',
  box_items: 'api::box-item.box-item',
  detail_cards: 'api::detail-card.detail-card',
  team_members: 'api::team-member.team-member',
};

const PERMISSION_UID = 'plugin::users-permissions.permission';

/**
 * Grant the Public role read access to every api:: content type.
 * Strapi does not open REST routes for filesystem content types by default,
 * so without this the site would get 403s. Idempotent.
 */
async function grantPublicRead({ strapi }) {
  const actions = Object.keys(strapi.contentTypes)
    .filter((uid) => uid.startsWith('api::'))
    .flatMap((uid) => [`${uid}.find`, `${uid}.findOne`]);

  const role = await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: 'public' } });
  if (!role) {
    console.error(`[seed] Could not find the "public" users-permissions role.`);
    return 0;
  }

  const existing = await strapi.documents(PERMISSION_UID).findMany({});
  const existingActions = new Set(existing.map((p) => p.action));

  let granted = 0;
  for (const action of actions) {
    if (existingActions.has(action)) continue;
    try {
      await strapi.documents(PERMISSION_UID).create({
        data: { action, role: { set: [role.id] } },
        status: 'published',
      });
      granted += 1;
    } catch (err) {
      console.error(`[seed] Failed to grant ${action}: ${err.message}`);
    }
  }

  console.log(`[seed] Public role: ${granted} new permission(s) granted, ${actions.length} total.`);
  return granted;
}

/** Recursively collect every "/media/…" string in the seed payload. */
function collectMediaPaths(data) {
  const paths = new Set();
  const walk = (val) => {
    if (typeof val === 'string') {
      if (val.startsWith('/media/')) paths.add(val);
      return;
    }
    if (Array.isArray(val)) return val.forEach(walk);
    if (val && typeof val === 'object') return Object.values(val).forEach(walk);
  };
  walk(data);
  return [...paths];
}

/**
 * Upload every referenced media file once into the upload library
 * (Strapi media) and return a path → fileId map.
 *
 * Uploads persist into ${appDir}/public/uploads via the local provider —
 * on Railway that directory lives on the volume, so the library survives
 * deploys. Idempotent: files already in the library are reused by name.
 */
async function ensureMedia({ strapi, paths }) {
  const map = new Map();
  const uploadService = strapi.plugin('upload').service('upload');
  let uploaded = 0;
  let reused = 0;

  for (const p of paths) {
    const src = path.join(MEDIA_SRC, p);
    if (!existsSync(src)) {
      console.warn(`[seed] media "$${p}" not found under MEDIA_SRC (${MEDIA_SRC}) — left empty`);
      map.set(p, null);
      continue;
    }

    const name = path.basename(p);
    try {
      const existing = await strapi.db.query(UPLOAD_FILE_UID).findOne({ where: { name } });
      if (existing) {
        map.set(p, existing.id);
        reused += 1;
        continue;
      }

      const size = statSync(src).size;
      const ext = path.extname(name).toLowerCase();
      const [file] = await uploadService.upload({
        data: { fileInfo: { name } },
        files: {
          filepath: src,
          originalFilename: name,
          size,
          mimetype: MIME_BY_EXT[ext] || 'application/octet-stream',
        },
      });
      map.set(p, file.id);
      uploaded += 1;
    } catch (err) {
      console.error(`[seed] media upload failed for ${name}: ${err.message}`);
      map.set(p, null);
    }
  }

  console.log(`[seed] Media library: ${uploaded} uploaded, ${reused} reused, total ${map.size}.`);
  return map;
}

/**
 * Split a document entry into its non-media fields and its media relations.
 *
 * Strapi's documents API silently drops `{ connect }` media relations when
 * they are passed to `create` — they only persist via a follow-up `update`.
 * So the seed creates entries without media, then applies the media fields
 * with a second `update` call.
 */
function splitMediaFromEntry({ strapi, uid, entry, media }) {
  const model = strapi.getModel(uid);
  const clean = { ...entry };
  const mediaFields = {};

  for (const [key, value] of Object.entries(entry)) {
    const attr = model.attributes[key];
    if (!attr || attr.type !== 'media') continue;
    delete clean[key];

    if (typeof value === 'string' && value.startsWith('/media/')) {
      const id = media.get(value);
      if (id) mediaFields[key] = { connect: [id] };
    }
  }
  return { clean, mediaFields };
}

function assertBuildExists() {
  const requirements = [
    path.join(distDir, 'config', 'server.js'),
    path.join(distDir, 'src', 'api'),
  ];
  const missing = requirements.filter((p) => !existsSync(p));
  if (missing.length > 0) {
    console.error(
      `[seed] Compiled backend not found under ${distDir}.\n` +
        '[seed] Run "npm run build --workspace backend" and try again.'
    );
    process.exit(1);
  }
}

/** Create a published document with its media applied via a follow-up update. */
async function createWithMedia({ strapi, uid, clean, mediaFields }) {
  const doc = await strapi.documents(uid).create({ data: clean, status: 'published' });
  if (Object.keys(mediaFields).length > 0) {
    await strapi.documents(uid).update({
      documentId: doc.documentId,
      data: mediaFields,
      status: 'published',
    });
  }
  return doc;
}

async function upsertCollection({ strapi, uid, sb, entries, reset }) {
  const existing = await strapi.documents(uid).findMany({});

  if (!reset && existing.length > 0) {
    console.log(`[seed] ${uid}: ${existing.length} existing — skipping (use --reset to re-seed)`);
    return { created: 0, skipped: 1 };
  }

  if (reset && existing.length > 0) {
    for (const doc of existing) {
      await strapi.documents(uid).delete({ documentId: doc.documentId });
    }
    console.log(`[seed] ${uid}: deleted ${existing.length} existing entries`);
  }

  for (const { clean, mediaFields } of sb) {
    await createWithMedia({ strapi, uid, clean, mediaFields });
  }

  console.log(`[seed] ${uid}: created ${entries.length} entry(-ies), published`);
  return { created: entries.length, skipped: 0 };
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
    // Phase 1 — make sure every referenced asset exists in the media library.
    const media = await ensureMedia({ strapi, paths: collectMediaPaths(data) });

    // Phase 2 — seed the content, wiring media relations from the file ids.
    for (const [key, uid] of Object.entries(COLLECTIONS)) {
      const split = (data[key] ?? []).map((entry) =>
        splitMediaFromEntry({ strapi, uid, entry, media })
      );
      const { created: c, skipped: s } = await upsertCollection({
        strapi,
        uid,
        sb: split,
        entries: data[key] ?? [],
        reset,
      });
      created += c;
      skipped += s;
    }

    // Single type — the homepage holds the site-level copy and section texts.
    const homepageData = data.homepage ?? {};
    if (homepageData && Object.keys(homepageData).length > 0) {
      const uid = 'api::homepage.homepage';
      const { clean, mediaFields } = splitMediaFromEntry({
        strapi,
        uid,
        entry: homepageData,
        media,
      });
      let existing = null;
      try {
        [existing] = await strapi.documents(uid).findMany({});
      } catch {
        existing = null;
      }

      if (existing && !reset) {
        console.log(`[seed] ${uid}: exists — skipping (use --reset to re-seed)`);
        skipped += 1;
      } else {
        if (existing) {
          await strapi.documents(uid).delete({ documentId: existing.documentId });
          console.log(`[seed] ${uid}: deleted previous entry`);
        }
        await createWithMedia({ strapi, uid, clean, mediaFields });
        console.log(`[seed] ${uid}: seeded, published`);
        created += 1;
      }
    }

    // Grant the Public role read access to all api:: content types while the
    // DB connection is still open.
    await grantPublicRead({ strapi });
  } finally {
    await strapi.destroy();
  }

  console.log(`\n[seed] Done. Created ${created}, skipped ${skipped} item(s).`);
}

main().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});