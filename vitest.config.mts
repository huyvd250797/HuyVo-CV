import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({
 resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},
 oxc:{jsx:{runtime:'automatic'}},
 test:{environment:'jsdom',include:['tests/*.ui.test.tsx','tests/*.api.test.ts'],testTimeout:15000},
});
