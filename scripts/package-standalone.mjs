import { build } from 'esbuild';
import fs from 'node:fs';
import { Script } from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(root,'dist');
const assets=Object.fromEntries(fs.readdirSync(path.join(dist,'assets')).filter(f=>/\.(png|jpe?g|webp)$/.test(f)).map(f=>['./assets/'+f,'data:image/'+(/jpe?g$/.test(f)?'jpeg':f.split('.').pop())+';base64,'+fs.readFileSync(path.join(dist,'assets',f)).toString('base64')]));
const sources=JSON.parse(fs.readFileSync(path.join(dist,'sources.json'),'utf8'));
for(const source of Object.values(sources)){if(source.localImage&&assets[source.localImage])source.localImage=assets[source.localImage];}
const result=await build({entryPoints:[path.join(dist,'main.js')],bundle:true,write:false,format:'iife',minify:true,target:['es2022'],plugins:[{name:'embedded-assets',setup(b){b.onLoad({filter:/\/(main|artworks)\.js$/},args=>{let code=fs.readFileSync(args.path,'utf8');for(const [src,data] of Object.entries(assets))code=code.split("'"+src+"'").join(JSON.stringify(data));if(args.path.endsWith('main.js'))code=code.replace("fetch('./sources.json').then(r=>r.json()).catch(()=>({}))",'Promise.resolve('+JSON.stringify(sources)+')');return{contents:code,loader:'js'};});}}]});
let html=fs.readFileSync(path.join(dist,'index.html'),'utf8');html=html.replace('<link rel="stylesheet" href="./style.css">','<style>'+fs.readFileSync(path.join(dist,'style.css'),'utf8')+'</style>');html=html.replace(/<script type="importmap">[\s\S]*?<\/script>/,'');html=html.replace('<script type="module" src="./main.js"></script>',()=>'<script>'+result.outputFiles[0].text.replaceAll('</script','<\\/script')+'</script>');for(const [src,data]of Object.entries(assets))html=html.split('"'+src+'"').join('"'+data+'"');const inline=html.match(/<script>([\s\S]*?)<\/script>/);if(!inline)throw new Error('Standalone script missing');new Script(inline[1],{filename:'The Cabinet.html'});fs.writeFileSync(path.join(root,'The Cabinet.html'),html);console.log(JSON.stringify({file:path.join(root,'The Cabinet.html'),bytes:Buffer.byteLength(html),embeddedImages:Object.keys(assets).length}));
