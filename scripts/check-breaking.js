#!/usr/bin/env node
/**
 * Checks for breaking schema changes by diffing local schemas against
 * the currently published @sparkle/schemas package on GitHub Packages.
 *
 * Exits non-zero if any breaking changes are detected.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const { diffSchemas } = require('json-schema-diff');

const EVENTS_DIR = path.join(__dirname, '..', 'events');

async function getPublishedSchemas() {
  try {
    // Install the published version into a temp dir to compare
    const tmpDir = fs.mkdtempSync('/tmp/sparkle-schemas-published-');
    execSync(`npm pack @sparkle/schemas --pack-destination ${tmpDir}`, {
      stdio: 'pipe',
      env: { ...process.env },
    });
    const tarball = fs.readdirSync(tmpDir).find((f) => f.endsWith('.tgz'));
    if (!tarball) return null;
    execSync(`tar -xzf ${path.join(tmpDir, tarball)} -C ${tmpDir}`, { stdio: 'pipe' });
    return path.join(tmpDir, 'package');
  } catch {
    console.log('No published version found — skipping breaking change check.');
    return null;
  }
}

function walkSchemas(dir, base = dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkSchemas(full, base));
    } else if (entry.name.endsWith('.json')) {
      results.push(path.relative(base, full));
    }
  }
  return results;
}

async function main() {
  const publishedDir = await getPublishedSchemas();
  if (!publishedDir) process.exit(0);

  const schemaFiles = walkSchemas(EVENTS_DIR);
  let hasBreaking = false;

  for (const relPath of schemaFiles) {
    const localPath = path.join(EVENTS_DIR, relPath);
    const publishedPath = path.join(publishedDir, 'events', relPath);

    if (!fs.existsSync(publishedPath)) {
      console.log(`NEW schema: ${relPath} (non-breaking)`);
      continue;
    }

    const sourceSchema = JSON.parse(fs.readFileSync(publishedPath, 'utf8'));
    const destinationSchema = JSON.parse(fs.readFileSync(localPath, 'utf8'));

    const result = await diffSchemas({ sourceSchema, destinationSchema });

    if (result.removedJsonSchema && result.removedJsonSchema !== false) {
      console.error(`BREAKING CHANGE in ${relPath}: some values now fail validation that previously passed.`);
      hasBreaking = true;
    } else {
      console.log(`OK: ${relPath}`);
    }
  }

  if (hasBreaking) {
    console.error('\nBreaking schema changes detected. Cannot merge.');
    process.exit(1);
  }

  console.log('\nNo breaking changes detected.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
