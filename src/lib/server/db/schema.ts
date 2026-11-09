import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	displayName: text('display_name').notNull(),
	passwordHash: text('password_hash').notNull(),
	passwordSalt: text('password_salt').notNull(),
	hashIters: integer('hash_iters').notNull().default(100000),
	createdAt: integer('created_at').notNull()
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at').notNull()
});

export const sections = sqliteTable('sections', {
	id: text('id').primaryKey(), // spring | summer | autumn | winter | extras
	name: text('name').notNull(),
	position: integer('position').notNull()
});

export const stickers = sqliteTable('stickers', {
	code: text('code').primaryKey(),
	sortOrder: integer('sort_order').notNull(),
	sectionId: text('section_id')
		.notNull()
		.references(() => sections.id),
	kind: text('kind', { enum: ['regular', 'especial', 'ameba'] }).notNull(),
	page: integer('page'),
	label: text('label')
});

/** copias: 0 faltando · 1 colada · 2+ repetida (copias-1 disponíveis p/ troca) */
export const userStickers = sqliteTable(
	'user_stickers',
	{
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		stickerCode: text('sticker_code')
			.notNull()
			.references(() => stickers.code),
		copias: integer('copias').notNull().default(0),
		updatedAt: integer('updated_at').notNull()
	},
	(t) => [
		primaryKey({ columns: [t.userId, t.stickerCode] }),
		index('idx_user_stickers_code').on(t.stickerCode)
	]
);

export const turmas = sqliteTable('turmas', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	ownerId: text('owner_id')
		.notNull()
		.references(() => users.id),
	createdAt: integer('created_at').notNull()
});

export const turmaMembros = sqliteTable(
	'turma_membros',
	{
		turmaId: text('turma_id')
			.notNull()
			.references(() => turmas.id, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		role: text('role', { enum: ['owner', 'member'] }).notNull(),
		joinedAt: integer('joined_at').notNull()
	},
	(t) => [primaryKey({ columns: [t.turmaId, t.userId] })]
);

export const turmaConvites = sqliteTable('turma_convites', {
	token: text('token').primaryKey(),
	turmaId: text('turma_id')
		.notNull()
		.references(() => turmas.id, { onDelete: 'cascade' }),
	createdBy: text('created_by')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at').notNull(),
	maxUses: integer('max_uses').notNull().default(1),
	uses: integer('uses').notNull().default(0)
});

export const stickerEvents = sqliteTable('sticker_events', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	stickerCode: text('sticker_code').notNull(),
	delta: integer('delta').notNull(), // +1 / -1
	at: integer('at').notNull()
});

/** Janela de rate limit por chave (ex.: `login:<ip>`). */
export const rateLimits = sqliteTable('rate_limits', {
	key: text('key').primaryKey(),
	windowStart: integer('window_start').notNull(),
	count: integer('count').notNull().default(0)
});
