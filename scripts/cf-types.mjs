// Gera worker-configuration.d.ts via `wrangler types` e remove a referência ao
// entrypoint de build (mainModule), que faria o svelte-check varrer .svelte-kit/.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

execSync('npx wrangler types', { stdio: 'inherit' });
const f = 'worker-configuration.d.ts';
const src = readFileSync(f, 'utf8');
const out = src.replace(/\n\tinterface GlobalProps \{[\s\S]*?\n\t\}/, '');
writeFileSync(f, out);
console.log(
	out === src
		? 'cf-types: GlobalProps não encontrado (nada removido)'
		: 'cf-types: GlobalProps removido'
);
