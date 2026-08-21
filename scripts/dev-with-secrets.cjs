#!/usr/bin/env node
/**
 * Local Gold dev — load GCP Secret Manager `onegold_prod` into env, then next dev.
 * No .env.local with Mongo passwords.
 *
 * Usage: pnpm run dev:secrets
 * Needs: gcloud ADC or GOOGLE_APPLICATION_CREDENTIALS for gentle-epoch-277301.
 */
const { spawn } = require('child_process');
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'gentle-epoch-277301';
const SECRET = process.env.ONEGOLD_GCP_SECRET || 'onegold_prod';

async function main() {
  if (!process.env.MONGO_URI) {
    const client = new SecretManagerServiceClient();
    const [version] = await client.accessSecretVersion({
      name: `projects/${PROJECT}/secrets/${SECRET}/versions/latest`,
    });
    const raw = version.payload.data.toString('utf8');
    const data = JSON.parse(raw);
    for (const k of ['MONGO_URI', 'MONGO_DB', 'MARKETPLACE_MONGO_URI']) {
      if (data[k]) process.env[k] = data[k];
    }
    console.log(`[gold] loaded secrets from GCP ${SECRET} (keys: ${Object.keys(data).join(',')})`);
  } else {
    console.log('[gold] MONGO_URI already set (K8s/CI)');
  }

  const child = spawn(
    'pnpm',
    ['exec', 'next', 'dev', '--port', process.env.PORT || '3000'],
    { stdio: 'inherit', env: process.env, shell: true }
  );
  child.on('exit', (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error('[gold] failed to load secrets:', err.message || err);
  console.error('Use SA with secretAccessor on onegold_prod, or set MONGO_URI in the shell.');
  process.exit(1);
});
