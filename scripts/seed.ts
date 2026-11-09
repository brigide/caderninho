// Gera data/seed.sql a partir de data/stickers.csv (idempotente: INSERT OR REPLACE).
// Se o CSV não existir, gera o catálogo provisório (1..276, 4 estações × 69).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SECTIONS = [
	['spring', 'Primavera', 1],
	['summer', 'Verão', 2],
	['autumn', 'Outono', 3],
	['winter', 'Inverno', 4]
] as const;

type Row = {
	code: string;
	sort_order: number;
	section_id: string;
	kind: string;
	page: string;
	label: string;
};

function placeholder(): Row[] {
	const rows: Row[] = [];
	for (let i = 1; i <= 276; i++) {
		const kind = i % 17 === 1 ? 'especial' : i % 23 === 0 ? 'ameba' : 'regular';
		rows.push({
			code: String(i),
			sort_order: i,
			section_id: SECTIONS[Math.floor((i - 1) / 69)][0],
			kind,
			page: String(Math.floor((i - 1) / 8) + 2),
			label: ''
		});
	}
	return rows;
}

function fromCsv(path: string): Row[] {
	const [header, ...lines] = readFileSync(path, 'utf8').trim().split(/\r?\n/);
	const cols = header.split(',');
	return lines
		.filter((l) => l.trim())
		.map((l) => {
			const v = l.split(',');
			const o = Object.fromEntries(cols.map((c, i) => [c, (v[i] ?? '').trim()]));
			return { ...o, sort_order: Number(o.sort_order) } as Row;
		});
}

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;
const rows = existsSync('data/stickers.csv') ? fromCsv('data/stickers.csv') : placeholder();

let sql = '-- gerado por scripts/seed.ts\n';
for (const [id, name, pos] of SECTIONS)
	sql += `INSERT OR REPLACE INTO sections (id, name, position) VALUES (${q(id)}, ${q(name)}, ${pos});\n`;
for (const r of rows)
	sql += `INSERT OR REPLACE INTO stickers (code, sort_order, section_id, kind, page, label) VALUES (${q(r.code)}, ${r.sort_order}, ${q(r.section_id)}, ${q(r.kind)}, ${r.page ? Number(r.page) : 'NULL'}, ${r.label ? q(r.label) : 'NULL'});\n`;

writeFileSync('data/seed.sql', sql);
console.log(
	`data/seed.sql: ${rows.length} figurinhas (${existsSync('data/stickers.csv') ? 'csv' : 'placeholder'})`
);
