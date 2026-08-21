/**
 * Load Gold server secrets without .env files.
 * Live: K8s envFrom → process.env already set.
 * Local: GCP Secret Manager `onegold_prod` (ADC / gcloud SA).
 */
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const GCP_PROJECT = process.env.GOOGLE_CLOUD_PROJECT || 'gentle-epoch-277301';
const SECRET_NAME = process.env.ONEGOLD_GCP_SECRET || 'onegold_prod';

let loaded = false;

export async function ensureGoldSecrets(): Promise<void> {
  if (loaded) return;
  if (process.env.MONGO_URI) {
    loaded = true;
    return;
  }

  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({
    name: `projects/${GCP_PROJECT}/secrets/${SECRET_NAME}/versions/latest`,
  });
  const raw = version.payload?.data?.toString() || '';
  let data: Record<string, string> = {};
  try {
    data = JSON.parse(raw);
  } catch {
    if (raw.startsWith('mongodb')) {
      data = { MONGO_URI: raw.trim() };
    } else {
      throw new Error(`Gold secret ${SECRET_NAME} is not JSON and not a Mongo URI`);
    }
  }

  for (const key of ['MONGO_URI', 'MONGO_DB', 'MARKETPLACE_MONGO_URI'] as const) {
    if (data[key] && !process.env[key]) {
      process.env[key] = data[key];
    }
  }
  loaded = true;
}

export function goldMongoUri(): string {
  const uri = String(process.env.MONGO_URI || '').trim();
  if (!uri) {
    throw new Error(
      'MONGO_URI missing. Live: mount K8s secret onegold-backend-env. Local: pnpm run dev:secrets (GCP onegold_prod).'
    );
  }
  return uri;
}

export function goldMongoDbName(): string {
  return String(process.env.MONGO_DB || 'onegoldDB').trim() || 'onegoldDB';
}
