import { MongoClient, type Db } from 'mongodb';
import {
  ensureGoldSecrets,
  goldMongoDbName,
  goldMongoUri,
} from '@/lib/loadGoldSecrets';

const opts = { autoSelectFamily: false as const };
let clientPromise: Promise<MongoClient> | null = null;

export async function getGoldMongoClient(): Promise<MongoClient> {
  await ensureGoldSecrets();
  if (!clientPromise) {
    const client = new MongoClient(goldMongoUri(), opts);
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getGoldDb(): Promise<Db> {
  const client = await getGoldMongoClient();
  return client.db(goldMongoDbName());
}
