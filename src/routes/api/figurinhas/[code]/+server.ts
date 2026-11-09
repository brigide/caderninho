import { error, json } from '@sveltejs/kit';
import { z } from 'zod';
import type { RequestHandler } from './$types';
import { createDb } from '#lib/server/db/index.js';
import { adjustCopias, setCopias, stickerExists } from '#lib/server/stickers.js';

const bodySchema = z
	.object({
		delta: z.number().int().min(-99).max(99).optional(),
		set: z.number().int().min(0).max(99).optional()
	})
	.refine((b) => (b.delta === undefined) !== (b.set === undefined), 'Informe delta ou set');

export const POST: RequestHandler = async ({ params, request, locals, url }) => {
	if (!locals.user) error(401, 'Entre para registrar figurinhas');
	const origin = request.headers.get('origin');
	if (origin && origin !== url.origin) error(403, 'Origem inválida');

	const parsed = bodySchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) error(400, 'Corpo inválido');

	const code = params.code.toUpperCase();
	const db = createDb();
	if (!(await stickerExists(db, code))) error(404, `Figurinha ${code} não existe neste álbum`);

	const copias =
		parsed.data.set !== undefined
			? await setCopias(db, locals.user.id, code, parsed.data.set)
			: await adjustCopias(db, locals.user.id, code, parsed.data.delta!);
	return json({ code, copias });
};
