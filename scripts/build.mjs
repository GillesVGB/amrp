import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'outputs');
execFileSync(process.execPath,[path.join(root,'scripts/check.mjs')],{cwd:root,stdio:'inherit'});
fs.mkdirSync(output,{recursive:true});
for(const file of ['index.html','_redirects'])fs.copyFileSync(path.join(root,'public',file),path.join(output,file));
execFileSync(process.execPath,[path.join(root,'apply-design.mjs'),'--root',output],{cwd:root,stdio:'inherit'});
// The installer backup is useful on an existing server, but is not a public asset.
fs.rmSync(path.join(output,'index.html.before-heerlen-design'),{force:true});
const html=fs.readFileSync(path.join(output,'index.html'),'utf8');
for(const name of ['amsterdam-heerlen.css','amsterdam-regulations.css','amsterdam-regulations-data.js','amsterdam-heerlen.js','amsterdam-regulations.js']){
 if(!html.includes('/assets/'+name)||!fs.statSync(path.join(output,'assets',name)).isFile())throw Error('Publicatiebestand ontbreekt: '+name);
}
fs.writeFileSync(path.join(output,'build-info.json'),JSON.stringify({app:'Amsterdam Roleplay',commit:process.env.COMMIT_REF||'local',builtAt:new Date().toISOString()},null,2)+'\n');
const count=fs.readdirSync(path.join(output,'assets')).length+3;
console.log('Netlify-build klaar: outputs/index.html, SPA-routering en '+count+' publicatiebestanden.');
