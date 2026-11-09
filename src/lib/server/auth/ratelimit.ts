import { eq } from 'drizzle-orm';
import { schema, type Db } from '../db/index.js';

export type RateLimitResult = { allowed: boolean; remaining: number; retryAfterMs: number };

/** Lógica pura da janela fixa: decide a partir do estado atual. */
export function evaluateWindow(
	state: { windowStart: number; count: number } | null,
	now: number,
	limit: number,
	windowMs: number
): { next: { windowStart: number; count: number }; result: RateLimitResult } {
	const fresh = !state || now - state.windowStart >= windowMs;
	const windowStart = fresh ? now : state!.windowStart;
	const count = (fresh ? 0 : state!.count) + 1;
	const allowed = count <= limit;
	return {
		next: { windowStart, count },
		result: {
			allowed,
			remaining: Math.max(0, limit - count),
			retryAfterMs: allowed ? 0 : windowStart + windowMs - now
		}
	};
}

/** Janela fixa persistida no D1. Ex.: `consume(db, 'login:1.2.3.4', 10, 60*60*1000)`. */
export async function consume(
	db: Db,
	key: string,
	limit: number,
	windowMs: number,
	now = Date.now()
): Promise<RateLimitResult> {
	const rows = await db
		.select()
		.from(schema.rateLimits)
		.where(eq(schema.rateLimits.key, key))
		.limit(1);
	const { next, result } = evaluateWindow(rows[0] ?? null, now, limit, windowMs);
	await db
		.insert(schema.rateLimits)
		.values({ key, ...next })
		.onConflictDoUpdate({ target: schema.rateLimits.key, set: next });
	return result;
}
