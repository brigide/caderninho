import { asc } from 'drizzle-orm';
import { createDb, schema } from '#lib/server/db/index.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const db = createDb();
	const [sections, stickers] = await Promise.all([
		db.select().from(schema.sections).orderBy(asc(schema.sections.position)),
		db.select().from(schema.stickers).orderBy(asc(schema.stickers.sortOrder))
	]);
	return { sections, stickers };
};
