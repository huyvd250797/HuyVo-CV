import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
// Accept the preview daemon's Vite-style flags and translate to Next.js.
const args=process.argv.slice(2).filter(a=>a!=='--strictPort').map(a=>a==='--host'?'--hostname':a);
const child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'dev','--webpack',...args],{stdio:'inherit',env:process.env});
for (const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??0));
