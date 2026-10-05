import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.js';
import {buildRoom} from '../dist/room.js';
import {artworks} from '../dist/artworks.js';
// Geometry construction is tested against real Three.js. Only the canvas
// drawing surface is stubbed because this check does not render pixels.
const canvas=()=>({width:512,height:512,getContext:()=>({fillRect(){},strokeRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},stroke(){},fill(){},fillText(){},getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){},createRadialGradient:()=>({addColorStop(){}})})});
globalThis.document={createElement:canvas};
const scene=new THREE.Scene();const room=buildRoom(scene);
for(const art of artworks){let texture=new THREE.Texture();texture.userData.asset=art.image||`crop-${art.id}`;room.makePainting(art,texture);}
scene.updateMatrixWorld(true);
let triangles=0,meshes=0;const problems=[];
scene.traverse(o=>{if(!o.isMesh)return;meshes++;const p=o.geometry.attributes.position;triangles+=(o.geometry.index?o.geometry.index.count:p.count)/3;for(let i=0;i<p.array.length;i++)if(!Number.isFinite(p.array[i])){problems.push('Nonfinite geometry '+o.uuid);break;}});
for(const art of artworks){if(!art.title||!art.description||!art.note)problems.push('Incomplete metadata '+art.id);if(art.image&&!fs.existsSync(new URL('../dist/'+art.image,import.meta.url)))problems.push('Missing image '+art.id);const bounds=new THREE.Box3().setFromObject(art.group);if(bounds.max.y>8.4)problems.push('Frame intersects ceiling cornice '+art.id);if(art.wall!=='floor'&&bounds.min.y<1.1)problems.push('Frame below wainscot '+art.id);}
for(let i=0;i<artworks.length;i++)for(let j=i+1;j<artworks.length;j++){const a=artworks[i],b=artworks[j];if(a.wall==='floor'||b.wall!==a.wall)continue;if(Math.abs(a.at[0]-b.at[0])<(a.width+b.width)/2+.37&&Math.abs(a.at[1]-b.at[1])<(a.height+b.height)/2+.37)problems.push(`Wall frame overlap ${a.id}/${b.id}`);}
const ray=new THREE.Raycaster();for(const art of artworks){const n=new THREE.Vector3(0,0,1).applyQuaternion(art.group.quaternion);const target=art.mesh.getWorldPosition(new THREE.Vector3());ray.set(target.clone().addScaledVector(n,3),n.clone().negate());if(!ray.intersectObject(art.mesh).length)problems.push('Painting raycast failed '+art.id);}
let details={paintings:artworks.length,identified:artworks.filter(a=>!a.imagined).length,imagined:artworks.filter(a=>a.imagined).length,roomMeshes:meshes,triangles,colliders:room.colliders.length,problems};fs.writeFileSync(new URL('../validation/geometry.json',import.meta.url),JSON.stringify(details,null,2));console.log(JSON.stringify(details,null,2));
// Optional geometry export for a separate spatial preview, not browser QA.
if(process.argv.includes('--export')){const out={meshes:[],materials:{},paintings:artworks.map(({id,crop,image,title})=>({id,crop,image,title}))};scene.traverse(o=>{if(!o.isMesh)return;const g=o.geometry,m=o.material;if(!out.materials[m.uuid])out.materials[m.uuid]={color:m.color?.toArray(),roughness:m.roughness??.8,metalness:m.metalness??0,opacity:m.opacity??1,emissive:m.emissive?.toArray(),emissiveIntensity:m.emissiveIntensity??0,asset:m.map?.userData.asset};out.meshes.push({p:Array.from(g.attributes.position.array),uv:g.attributes.uv?Array.from(g.attributes.uv.array):null,index:g.index?Array.from(g.index.array):null,matrix:o.matrixWorld.toArray(),material:m.uuid});});fs.writeFileSync(new URL('../validation/scene.json',import.meta.url),JSON.stringify(out));}
if(problems.length)process.exitCode=1;
