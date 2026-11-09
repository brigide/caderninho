import { z } from 'zod';

export const usernameSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(3, 'Usuário precisa de pelo menos 3 caracteres')
	.max(24, 'Usuário pode ter no máximo 24 caracteres')
	.regex(/^[a-z0-9_.]+$/, 'Use só letras minúsculas, números, ponto ou _');

export const passwordSchema = z
	.string()
	.min(8, 'Senha precisa de pelo menos 8 caracteres')
	.max(128, 'Senha longa demais');

export const displayNameSchema = z
	.string()
	.trim()
	.min(1, 'Diga como a turma te chama')
	.max(40, 'Nome pode ter no máximo 40 caracteres');

export const loginSchema = z.object({ usuario: usernameSchema, senha: passwordSchema });

export const registroSchema = z.object({
	nome: displayNameSchema,
	usuario: usernameSchema,
	senha: passwordSchema
});

/** Primeiro erro legível de um ZodError, por campo. */
export function fieldErrors(err: z.ZodError): Record<string, string> {
	const out: Record<string, string> = {};
	for (const issue of err.issues) {
		const k = String(issue.path[0] ?? '_');
		if (!(k in out)) out[k] = issue.message;
	}
	return out;
}

/** Garante o tipo uniforme dos erros devolvidos pelas actions. */
export const errs = (o: Record<string, string>): Record<string, string> => o;
