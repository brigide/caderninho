import { asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { createDb, schema } from '#lib/server/db/index.js';
import { getCopias } from '#lib/server/stickers.js';

export const load: PageServerLoad = async ({ locals }) => {
	const db = createDb();
	const [sections, stickers, copias] = await Promise.all([
		db.select().from(schema.sections).orderBy(asc(schema.sections.position)),
		db
			.select({
				code: schema.stickers.code,
				sortOrder: schema.stickers.sortOrder,
				sectionId: schema.stickers.sectionId,
				kind: schema.stickers.kind,
				page: schema.stickers.page
			})
			.from(schema.stickers)
			.orderBy(asc(schema.stickers.sortOrder)),
		getCopias(db, locals.user!.id)
	]);
	return { sections, stickers, copias };
};
