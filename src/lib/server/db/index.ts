import { drizzle } from 'drizzle-orm/d1';
import { env } from 'cloudflare:workers';
import * as schema from './schema';

export type Db = ReturnType<typeof createDb>;

/** Conexão Drizzle sobre o binding D1 `DB` (ver wrangler.jsonc). */
export function createDb() {
	return drizzle(env.DB, { schema });
}

export { schema };
