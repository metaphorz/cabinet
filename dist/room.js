import * as THREE from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
const TAU=Math.PI*2;
let seed=1628;
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296;}
export function buildRoom(scene){
 const colliders=[]; const curiosities=[];
 const mat=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 function texture(kind,color){const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d');x.fillStyle=color;x.fillRect(0,0,512,512);if(kind==='wood'){for(let i=0;i<2100;i++){let y=rnd()*512;x.strokeStyle=`rgba(${rnd()>.5?'10,5,0':'191,143,81'},${rnd()*.11})`;x.lineWidth=rnd()*2;x.beginPath();x.moveTo(0,y);for(let j=0;j<=512;j+=16)x.lineTo(j,y+Math.sin(j/90+i)*2+rnd());x.stroke();}}else{const d=x.getImageData(0,0,512,512);for(let i=0;i<d.data.length;i+=4){const n=(rnd()-.5)*16;d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n;}x.putImageData(d,0,0);}let t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;return t;}
 const oak=mat('#70513b',.77);oak.map=texture('wood','#705039');
 const dark=mat('#302a22',.7);dark.map=texture('wood','#382e23');
 const carved=mat('#55432d',.57);carved.map=oak.map;
 const gold=mat('#b89046',.31,.7), brightGold=mat('#d8ba76',.3,.72), bronze=mat('#785135',.39,.75);
 const plaster=mat('#7c7b69',.95);plaster.map=texture('plaster','#8b8872');
 const stone=mat('#cec3a4',.83);stone.map=texture('plaster','#c9c0a5');
 const marble=mat('#c9c3ae',.6);marble.map=texture('plaster','#c9c4b1');
 const cloth=mat('#602a24',.99), black=mat('#191d1c',.7), paper=mat('#d7c9a4',.92);
 const sphereGeo=new THREE.SphereGeometry(1,20,16), boxGeo=new THREE.BoxGeometry(1,1,1);
 function mesh(g,m,p,s,parent=scene){let o=new THREE.Mesh(g,m);if(p)o.position.set(...p);if(s)o.scale.set(...s);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
 const box=(p,s,m=oak,parent=scene)=>mesh(boxGeo,m,p,s,parent);
 const ball=(p,s,m=marble,parent=scene)=>mesh(sphereGeo,m,p,s,parent);
 function cylinder(p,rt,rb,h,m=oak,parent=scene,n=24){return mesh(new THREE.CylinderGeometry(rt,rb,h,n),m,p,null,parent);}
 function lathe(points,m,p=[0,0,0],scale=1,parent=scene){return mesh(new THREE.LatheGeometry(points.map(a=>new THREE.Vector2(...a)),48),m,p,[scale,scale,scale],parent);}
 function tube(points,r,m=bronze,parent=scene){let curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));return mesh(new THREE.TubeGeometry(curve,32,r,8,false),m,null,null,parent);}
 function rod(a,b,r,m=bronze,parent=scene){let d=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));let o=cylinder(new THREE.Vector3(...a).addScaledVector(d,.5).toArray(),r,r,d.length(),m,parent,12);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o;}
 function ring(p,r,thick,m=gold,parent=scene){return mesh(new THREE.TorusGeometry(r,thick,8,64),m,p,null,parent);}
 function shadow(x,z,w,d,opacity=.4,y=.012,parent=scene){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d');const g=ctx.createRadialGradient(32,32,2,32,32,32);g.addColorStop(0,`rgba(0,0,0,${opacity})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);const m=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false});const o=mesh(new THREE.PlaneGeometry(w,d),m,[x,y,z],null,parent);o.rotation.x=-Math.PI/2;o.castShadow=false;return o;}
 // A warm stone floor with individually varied slabs and narrow mortar joints.
 box([0,-.15,0],[18.4,.3,14.4],mat('#514b3d'));
 for(let x=-8.6;x<9;x+=1.44)for(let z=-6.6;z<7;z+=1.2){let fm=stone.clone();fm.color.setHSL(.095+rnd()*.012,.18+rnd()*.06,.46+rnd()*.09);box([x,-.023,z],[1.425,.06,1.183],fm);}
 // Upper plaster walls, wooden lower paneling, and structural trim.
 box([0,4.4,-7.1],[18.4,8.8,.22],plaster);box([9.1,4.4,0],[.22,8.8,14.4],plaster);
 // Entrance wall around an open arch into an antechamber.
 box([-5.65,4.4,7.1],[6.7,8.8,.22],plaster);box([5.65,4.4,7.1],[6.7,8.8,.22],plaster);box([0,6.7,7.1],[4.6,4.2,.22],plaster);
 box([-9.1,.65,0],[.22,1.3,14.4],plaster);box([-9.1,8,0],[.22,1.6,14.4],plaster);
 let windowCenters=[-2.7,1.0,4.7];
 box([-9.1,4.3,-5.68],[.22,6,2.65],plaster);
 for(let z of [-4.32,-.84,2.86,6.66])box([-9.1,4.15,z],[.3,6.2,.54],plaster);
 for(let y of [.18,1.1,4.95,8.03,8.2,8.4]){let hh=y===4.95?.14:.16;box([0,y,-6.92],[18.2,hh,.25],dark);box([8.94,y,0],[.25,hh,14],dark);if(y!==4.95)box([-8.94,y,0],[.25,hh,14],dark);}
 for(let x=-8.5;x<9;x+=1.0){box([x,.6,-6.86],[.07,1.05,.12],dark);box([x,.64,-6.875],[.82,.68,.03],carved);}
 for(let z=-6.6;z<7;z+=1.05){box([8.86,.6,z],[.12,1.05,.07],dark);box([8.87,.64,z],[.03,.68,.85],carved);}
 // Leaded glazing sits in deep timber frames. Small variations catch daylight.
 const lead=mat('#434333',.48,.15),glassColors=['#bad0c4','#c7d9ce','#e2dfc1','#a7c4bb'];
 const glassMaterials=glassColors.map(color=>new THREE.MeshStandardMaterial({color,emissive:'#bcd4dc',emissiveIntensity:.38,roughness:.18,transparent:true,opacity:.77,side:THREE.DoubleSide}));
 for(let z of windowCenters){let g=new THREE.Group();g.position.set(-9,0,z);scene.add(g);
  for(let q of [-1.48,1.48])box([0,4.15,q],[.25,5.75,.15],dark,g);
  for(let y of [1.3,4.1,7.04])box([0,y,0],[.25,.19,3.12],dark,g);
  box([.12,1.24,0],[.64,.14,3.26],stone,g);
  for(let zz=-1.3;zz<=1.4;zz+=.27){rod([0,1.4,zz],[0,6.95,zz],.012,lead,g);}
  for(let y=1.55;y<7;y+=.39)rod([0,y,-1.42],[0,y,1.42],.011,lead,g);
  for(let zz=-1.3;zz<1.4;zz+=.27)for(let y=1.56;y<6.9;y+=.39){const gm=glassMaterials[Math.floor(rnd()*4)];let pane=mesh(new THREE.PlaneGeometry(.257,.377),gm,[-.035,y+.195,zz+.135],null,g);pane.rotation.y=Math.PI/2;pane.castShadow=false;}
  box([0,4.15,0],[.25,5.7,.11],dark,g);
 }
 // A glimpse of a northern city beyond the glazing, rather than a blank void.
 const sky=mesh(new THREE.PlaneGeometry(90,45),new THREE.MeshBasicMaterial({color:'#bdd0cb'}),[-20,13,0]);sky.rotation.y=Math.PI/2;sky.castShadow=false;
 for(let i=0;i<12;i++){let z=-20+i*3.5,h=3+rnd()*3;box([-17-rnd()*2,h/2,z],[2.5,h,2.8],mat('#807c69'));let roof=mesh(new THREE.ConeGeometry(2.05,2.0,4),mat(i%2?'#645b4b':'#825b47'),[-17.5,h+1,z]);roof.rotation.y=Math.PI/4;}
 // Coffered timber ceiling with inset gold fillets.
 box([0,8.72,0],[18.4,.25,14.4],oak);
 for(let x=-7.5;x<9;x+=3)for(let z=-5.25;z<7;z+=3.5){box([x,8.51,z],[2.82,.16,3.32],dark);box([x,8.49,z],[2.54,.15,3.04],carved);box([x,8.44,z],[2.22,.08,2.72],oak);for(let dx of [-1.19,1.19])box([x+dx,8.36,z],[.025,.03,2.91],gold);for(let dz of [-1.45,1.45])box([x,8.36,z+dz],[2.41,.03,.025],gold);let rosette=cylinder([x,8.32,z],.12,.14,.055,gold);}
 for(let x=-9;x<=9;x+=3)box([x,8.33,0],[.18,.4,14.2],carved);
 for(let z=-7;z<=7;z+=3.5)box([0,8.33,z],[18,.4,.18],carved);
 // Carved entrance and antechamber.
 for(let x of [-2.3,2.3]){box([x,2.3,6.92],[.32,4.6,.48],dark);box([x,2.3,6.65],[.12,4.45,.1],gold);}box([0,4.65,6.92],[5.02,.4,.52],dark);box([0,4.86,6.9],[5.3,.12,.6],carved);
 box([0,-.04,9.6],[5,.12,5.5],stone);box([0,2.7,12.2],[5.1,5.4,.25],plaster);box([-2.6,2.7,9.6],[.2,5.4,5.5],dark);box([2.6,2.7,9.6],[.2,5.4,5.5],dark);
 // A monumental dark stone portal and heraldic crest on the right wall.
 const portal=new THREE.Group();portal.position.set(8.77,0,-.35);portal.rotation.y=-Math.PI/2;scene.add(portal);
 for(let x of [-1.25,1.25]){box([x,1.7,0],[.33,3.4,.3],black,portal);box([x,3.4,.05],[.5,.17,.43],black,portal);box([x,.15,.05],[.48,.3,.45],black,portal);}box([0,3.55,0],[3.0,.36,.38],black,portal);box([0,3.9,0],[3.24,.18,.5],dark,portal);box([0,1.7,-.1],[2.2,3.4,.03],mat('#121c20'),portal);
 const inscription=document.createElement('canvas');inscription.width=768;inscription.height=96;const ix=inscription.getContext('2d');ix.fillStyle='#202923';ix.fillRect(0,0,768,96);ix.fillStyle='#c3ad76';ix.font='28px Georgia';ix.textAlign='center';ix.fillText('VIVE  L’ESPRIT',384,61);const it=new THREE.CanvasTexture(inscription);it.colorSpace=THREE.SRGBColorSpace;mesh(new THREE.PlaneGeometry(2.8,.35),new THREE.MeshBasicMaterial({map:it}),[0,3.61,.205],null,portal);
 let shield=ball([0,4.87,0],[.62,.85,.13],gold,portal);ball([0,4.88,.1],[.52,.71,.1],mat('#28443d',.6),portal);
 for(let y of [4.58,4.92]){let a=box([-.19,y,.22],[.48,.075,.025],gold,portal);a.rotation.z=.62;let b=box([.19,y,.22],[.48,.075,.025],gold,portal);b.rotation.z=-.62;}
 for(let side of [-1,1]){tube([[side*.52,5.55,0],[side*.82,5.36,0],[side*1.0,4.68,0],[side*1.48,4.92,0]],.04,stone,portal);for(let i=0;i<13;i++){let t=i/12;ball([side*(.5+t*.94),5.46-Math.sin(t*Math.PI)*.55,.05],[.1,.12,.07],stone,portal);}}
 // Furniture: turned legs, paneled doors, small drawers, polished fittings.
 function table(x,z,w,d,h,m=oak){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);box([0,h,0],[w,.14,d],m,g);box([0,h-.22,0],[w-.1,.32,d-.1],dark,g);for(let xx of [-w/2+.2,w/2-.2])for(let zz of [-d/2+.18,d/2-.18]){lathe([[.09,0],[.15,.06],[.1,.13],[.08,.25],[.15,.36],[.12,.48],[.06,.65],[.12,.8],[.1,h-.2]],m,[xx,0,zz],1,g);}shadow(x,z,w+1,d+1,.46);colliders.push({x,z,hx:w/2+.2,hz:d/2+.2});return g;}
 const mainTable=table(0,-.05,3.6,2.1,1.13,dark);
 // Draped crimson velvet has physical folds along its edge.
 box([0,1.218,0],[3.66,.03,2.15],cloth,mainTable);
 for(let side of [-1,1]){const geo=new THREE.PlaneGeometry(3.66,.52,75,10);let p=geo.attributes.position;for(let i=0;i<p.count;i++){p.setZ(i,Math.sin(p.getX(i)*20)*.028*(.3+Math.abs(p.getY(i))));}geo.computeVertexNormals();let drape=mesh(geo,cloth,[0,.95,side*1.08],null,mainTable);if(side<0)drape.rotation.y=Math.PI;}
 const cabinet=table(-.3,-6.15,3.3,.8,1.22,oak);box([0,.58,0],[3.05,1.08,.72],oak,cabinet);for(let xx of [-.95,0,.95]){box([xx,.61,.382],[.83,.85,.09],dark,cabinet);box([xx,.61,.435],[.66,.67,.025],carved,cabinet);ball([xx+.18,.62,.47],[.035,.035,.024],gold,cabinet);}box([0,1.23,0],[3.5,.12,1.02],carved,cabinet);
 const leftTable=table(-7.2,-3.35,2.4,1.25,1.15,dark);
 const statueBase=table(7.65,-3.55,1.35,4.2,.78,dark);
 // Natural-history objects: a spiral nautilus with a pearly aperture.
 function nautilus(x,y,z,s,parent){let g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(s);parent.add(g);let pts=[];for(let i=0;i<170;i++){let a=i/169*TAU*2.5,r=.025*Math.exp(.19*a);pts.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r+.46,0));}let curve=new THREE.CatmullRomCurve3(pts);let o=mesh(new THREE.TubeGeometry(curve,180,.055,12,false),mat('#c9ab82',.44),null,null,g);let sh=ball([.25,.48,0],[.33,.43,.23],mat('#d8c8a8',.35),g);sh.rotation.z=.7;let aperture=ball([.40,.34,.14],[.19,.28,.025],mat('#ead9be',.27),g);aperture.rotation.z=.65;for(let i=0;i<12;i++){let a=i*.28;let o=ring([.25,.48,0],.20+i*.009,.007,mat('#896449',.6),g);o.scale.set(1,1.4,1);o.rotation.y=a*.1;}return g;}
 nautilus(1.22,1.24,.15,.58,mainTable);
 // A terrestrial globe: engraved longitude/latitude, hand-tinted parchment.
 const gc=document.createElement('canvas');gc.width=1024;gc.height=512;const gx=gc.getContext('2d');gx.fillStyle='#bca77a';gx.fillRect(0,0,1024,512);for(let i=0;i<16000;i++){gx.fillStyle=`rgba(53,40,18,${rnd()*.09})`;gx.fillRect(rnd()*1024,rnd()*512,1,1);}gx.strokeStyle='#635b3e';gx.lineWidth=.7;for(let i=0;i<1024;i+=64){gx.beginPath();gx.moveTo(i,0);gx.lineTo(i,512);gx.stroke();}for(let i=0;i<512;i+=64){gx.beginPath();gx.moveTo(0,i);gx.lineTo(1024,i);gx.stroke();}
 // Stylized cartographic land masses are explicitly an interpretive globe.
 const lands=[[[90,115],[140,72],[248,93],[310,161],[253,194],[202,250],[150,194]],[[239,256],[312,281],[330,365],[276,447],[239,356]],[[450,177],[510,137],[551,177],[614,234],[568,320],[506,323],[467,244]],[[492,115],[555,77],[664,92],[751,140],[850,126],[844,213],[734,229],[678,274],[611,214]],[[795,324],[853,297],[909,342],[881,388],[822,377]]];gx.fillStyle='#6f7951';for(let land of lands){gx.beginPath();land.forEach(([x,y],i)=>i?gx.lineTo(x,y):gx.moveTo(x,y));gx.closePath();gx.fill();gx.stroke();}gx.fillStyle='#54442c';gx.font='italic 18px Georgia';gx.fillText('OCEANVS',355,350);let gt=new THREE.CanvasTexture(gc);gt.colorSpace=THREE.SRGBColorSpace;
 const globe=new THREE.Group();globe.position.set(-7.35,1.17,-3.4);scene.add(globe);lathe([[.34,0],[.34,.05],[.2,.09],[.08,.16],[.065,.32],[.14,.39]],bronze,[0,0,0],1,globe);let earth=mesh(new THREE.SphereGeometry(.46,48,32),new THREE.MeshStandardMaterial({map:gt,roughness:.68}),[0,.85,0],null,globe);earth.rotation.z=.3;ring([0,.85,0],.5,.023,gold,globe).rotation.z=.3;let horizon=ring([0,.82,0],.57,.032,gold,globe);horizon.rotation.x=Math.PI/2;for(let a of [0,Math.PI])tube([[Math.cos(a)*.52,.82,0],[Math.cos(a)*.4,.42,0],[0,.3,0]],.026,bronze,globe);
 // Porcelain vessels, pewter, books and scientific instruments.
 const porcelain=mat('#d8d9c6',.24),blue=mat('#28475a',.35,.08);
 function vase(x,y,z,s,parent=scene){let v=lathe([[0,0],[.14,0],[.15,.05],[.14,.09],[.22,.16],[.24,.34],[.16,.51],[.095,.58],[.09,.7],[.12,.72],[.12,.75],[.075,.75]],porcelain,[x,y,z],s,parent);for(let yy of [.08,.5,.67]){let rr=yy===.5?.164:.12;let r=ring([x,y+yy*s,z],rr*s,.009*s,blue,parent);r.rotation.x=Math.PI/2;}return v;}
 vase(-.8,1.28,-6.2,1.0);vase(.5,1.29,-6.2,.65);vase(.8,1.25,.05,.45,mainTable);
 function book(x,y,z,w,d,angle,parent=scene){let g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=angle;parent.add(g);box([0,.055,0],[w,.075,d],paper,g);for(let yy of [0,.1])box([0,yy,0],[w+.04,.025,d+.03],mat('#483b2a'),g);for(let zz=-d/2+.07;zz<d/2;zz+=.13)box([-w/2-.02,.055,zz],[.014,.11,.014],gold,g);return g;}
 book(-.8,1.26,-.3,.64,.46,-.25,mainTable);book(-.55,1.37,-.29,.56,.4,.1,mainTable);book(-6.45,1.24,-3.2,.48,.68,.25);
 let astrolabe=ring([-.55,1.57,.36],.28,.018,gold,mainTable);for(let a=0;a<TAU;a+=TAU/12)rod([-.55,1.57,.36],[-.55+Math.cos(a)*.25,1.57+Math.sin(a)*.25,.36],.005,gold,mainTable);cylinder([-.55,1.28,.36],.17,.21,.04,bronze,mainTable);rod([-.55,1.28,.36],[-.55,1.55,.36],.026,bronze,mainTable);
 // Small bronze horses, modeled as joined sculptural volumes.
 function horse(x,y,z,s,rot,parent=scene){let g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;g.scale.setScalar(s);parent.add(g);ball([0,.53,0],[.4,.21,.16],bronze,g);ball([.3,.77,0],[.13,.3,.11],bronze,g).rotation.z=.48;ball([.43,1.0,0],[.19,.10,.085],bronze,g).rotation.z=-.3;for(let zz of [-.12,.12])for(let xx of [-.23,.22]){let xx2=xx+(xx>0?.13:-.1);tube([[xx,.5,zz],[xx2,.24,zz],[xx2-.04,.06,zz]],.035,bronze,g);ball([xx2-.01,.045,zz],[.066,.04,.045],bronze,g);}for(let zz of [-.065,.065]){let ear=mesh(new THREE.ConeGeometry(.035,.14,8),bronze,[.4,1.12,zz],null,g);ear.rotation.z=.2;}tube([[-.32,.63,0],[-.52,.56,0],[-.5,.2,0],[-.64,.14,0]],.035,bronze,g);tube([[.3,1.06,0],[.17,.87,0],[.09,.67,0]],.04,dark,g);box([0,0,0],[.94,.055,.5],dark,g);return g;}
 horse(.03,1.28,-.32,.67,.7,mainTable);horse(.55,1.28,-.5,.52,-.5,mainTable);
 // Sculpted busts and antiquities. Their scale and material follow the source,
 // while forms are modern interpretive models, not claimed museum scans.
 function head(g,x,y,z,s=1,beard=false){ball([x,y,z],[.16*s,.225*s,.16*s],marble,g);ball([x,y+.11*s,z-.055*s],[.17*s,.18*s,.15*s],marble,g);ball([x,y-.12*s,z+.015*s],[.115*s,.12*s,.12*s],marble,g);ball([x,y-.035*s,z+.161*s],[.035*s,.07*s,.05*s],marble,g);for(let side of [-1,1]){ball([x+side*.164*s,y-.008*s,z],[.033*s,.063*s,.032*s],marble,g);ball([x+side*.066*s,y+.038*s,z+.133*s],[.048*s,.018*s,.017*s],marble,g);tube([[x+side*.11*s,y+.073*s,z+.12*s],[x+side*.062*s,y+.083*s,z+.157*s],[x+side*.02*s,y+.065*s,z+.15*s]],.012*s,marble,g);}ball([x,y-.1*s,z+.137*s],[.048*s,.012*s,.02*s],marble,g);for(let i=0;i<27;i++){let a=i/27*TAU,yy=y+.12*s+Math.sin(i*3)*.045*s;ball([x+Math.cos(a)*.145*s,yy,z+Math.sin(a)*.13*s],[.04*s,.047*s,.04*s],marble,g);}if(beard)for(let i=0;i<15;i++){let a=(i/14)*Math.PI;ball([x+Math.cos(a)*.12*s,y-.12*s-Math.sin(a)*.12*s,z+.105*s],[.033*s,.056*s,.035*s],marble,g);}}
 function bust(x,y,z,s=1,rot=0,beard=false){let g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=rot;g.scale.setScalar(s);scene.add(g);lathe([[.25,0],[.25,.06],[.16,.08],[.1,.15],[.11,.23]],marble,[0,0,0],1,g);ball([0,.40,0],[.37,.21,.18],marble,g);cylinder([0,.6,0],.075,.12,.28,marble,g);head(g,0,.84,0,1,beard);for(let i=0;i<7;i++)tube([[-.25+i*.035,.52,.12],[-.1+i*.024,.33,.18],[.16,.25,.08]],.014,marble,g);return g;}
 bust(-1.4,1.32,-6.13,.8,.2,true);bust(1.05,1.32,-6.12,.75,-.35);bust(8.48,4.09,-1.98,.72,-Math.PI/2,true);bust(8.48,4.09,1.28,.72,-Math.PI/2);
 function statue(x,z,height,pose=0){let g=new THREE.Group();g.position.set(x,.8,z);g.rotation.y=-Math.PI/2+.18;g.scale.setScalar(height/2);scene.add(g);cylinder([0,.08,0],.4,.43,.16,marble,g);ball([0,1.28,0],[.26,.42,.16],marble,g);cylinder([0,1.69,0],.065,.10,.16,marble,g);head(g,0,1.94,0,.85,pose===2);
  // Drapery is a continuous folded surface with asymmetric hems.
  let geo=new THREE.CylinderGeometry(.21,.33,1.22,72,20,true);let p=geo.attributes.position;for(let i=0;i<p.count;i++){let a=Math.atan2(p.getZ(i),p.getX(i)),yy=p.getY(i);let wave=(Math.sin(a*12+yy*1.6)*.024+Math.sin(a*23)*.008)*(1-(yy+.61)/1.9);let r=Math.hypot(p.getX(i),p.getZ(i))+wave;p.setX(i,Math.cos(a)*r);p.setZ(i,Math.sin(a)*r);p.setY(i,yy+Math.sin(a*2)*.025);}geo.computeVertexNormals();mesh(geo,marble,[0,.77,0],null,g);
  ball([-.13,.18,.18],[.085,.06,.17],marble,g);ball([.13,.18,.16],[.085,.06,.17],marble,g);
  tube([[-.23,1.51,0],[-.33,1.20,.05],[-.27,.99,.15]],.072,marble,g);ball([-.27,.98,.15],[.07,.11,.04],marble,g);
  if(pose===1){tube([[.23,1.50,0],[.47,1.57,.03],[.60,1.76,.02]],.07,marble,g);ball([.6,1.78,.02],[.06,.09,.04],marble,g);}else{tube([[.23,1.51,0],[.4,1.26,0],[.31,1.07,.18]],.072,marble,g);ball([.31,1.07,.18],[.06,.09,.04],marble,g);}for(let i=0;i<5;i++)tube([[-.25,1.53-i*.04,.13],[0,1.33-i*.08,.23],[.2,1.16-i*.09,.17]],.025,marble,g);shadow(x,z,1.1,1.1,.35);return g;}
 statue(7.7,-5.0,2.75,1);statue(7.7,-3.35,2.55,0);statue(7.7,-1.9,2.7,2);
 // A brass chandelier, suspended by a chain with two tiers of curling arms.
 const chandelier=new THREE.Group();chandelier.position.set(0,5.55,-.5);scene.add(chandelier);
 for(let yy=1.2;yy<2.7;yy+=.13){let link=ring([0,yy,0],.064,.012,bronze,chandelier);link.rotation.y=Math.round(yy/.13)%2*Math.PI/2;}
 lathe([[0,-.58],[.09,-.58],[.13,-.5],[.10,-.37],[.22,-.3],[.3,-.15],[.25,0],[.1,.17],[.13,.4],[.1,.65],[.19,.77],[.2,.84],[.1,1],[.06,1.2]],gold,[0,0,0],1,chandelier);
 const wax=mat('#dfc9a0',.8),flame=new THREE.MeshBasicMaterial({color:'#ffd59a'});
 for(let tier=0;tier<2;tier++)for(let i=0;i<8;i++){let a=i*TAU/8+tier*.38,r=tier?.78:1.18,yy=tier?.7:0;let g=new THREE.Group();g.rotation.y=a;chandelier.add(g);tube([[.1,yy,0],[.4,yy-.12,0],[r-.05,yy-.22,0],[r,yy+.1,0]],.031,gold,g);tube([[.33,yy-.08,0],[.5,yy+.16,0],[.68,yy+.12,0],[.60,yy-.025,0]],.023,bronze,g);lathe([[0,0],[.13,.03],[.14,.055],[.09,.09],[.04,.11]],gold,[r,yy+.06,0],1,g);cylinder([r,yy+.29,0],.035,.04,.3,wax,g);ball([r,yy+.48,0],[.023,.06,.023],flame,g);}
 const candleLight=new THREE.PointLight('#ffcf87',30,10,2);candleLight.position.set(0,6.2,-.5);scene.add(candleLight);
 // Daylight and warm reflected light; one shadow-casting sun controls cost.
 scene.add(new THREE.HemisphereLight('#d6e4e5','#807055',2.1));scene.add(new THREE.AmbientLight('#eddfbb',.40));
 const sun=new THREE.DirectionalLight('#fff0cc',4.2);sun.position.set(-15,9,6);sun.target.position.set(4,0,-4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-15;sun.shadow.camera.right=15;sun.shadow.camera.top=15;sun.shadow.camera.bottom=-15;sun.shadow.camera.near=.5;sun.shadow.camera.far=45;sun.shadow.bias=-.0007;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun,sun.target);
 const fill=new THREE.PointLight('#d7e2e8',70,22,2);fill.position.set(-5.5,5,1);scene.add(fill);
 const warm=new THREE.PointLight('#ffdaac',35,18,2);warm.position.set(5,5.8,-3);scene.add(warm);
 // The painting construction is shared with the collection controller.
 function makePainting(art,texture){let group=new THREE.Group();let w=art.width,h=w/art.ratio;
  let frameMaterial=art.id%4===0?carved:art.id%3===0?dark:gold;
  box([0,0,-.055],[w+.24,h+.24,.12],dark,group);
  const layers=[{out:.17,thick:.075,z:.008,mat:frameMaterial},{out:.095,thick:.034,z:.067,mat:brightGold},{out:.04,thick:.046,z:.073,mat:dark},{out:.012,thick:.018,z:.082,mat:gold}];
  for(let l of layers){for(let s of [-1,1]){box([s*(w/2+l.out),0,l.z],[l.thick,h+l.out*2+l.thick,.09],l.mat,group);box([0,s*(h/2+l.out),l.z],[w+l.out*2,l.thick,.09],l.mat,group);}}
  if(art.width>1.7)for(let x of [-1,1])for(let y of [-1,1]){let r=ring([x*(w/2+.16),y*(h/2+.16),.061],.06,.014,frameMaterial,group);ball([x*(w/2+.16),y*(h/2+.16),.083],[.027,.027,.018],brightGold,group);}
  let pm=new THREE.MeshStandardMaterial({map:texture,roughness:.91,metalness:0,emissive:'#fff2d5',emissiveMap:texture,emissiveIntensity:.17});let picture=mesh(new THREE.PlaneGeometry(w,h),pm,[0,0,.085],null,group);picture.castShadow=false;picture.userData.art=art;group.userData.art=art;
  if(art.wall==='back'){group.position.set(art.at[0],art.at[1],-6.69);}else if(art.wall==='right'){group.position.set(8.68,art.at[1],art.at[0]);group.rotation.y=-Math.PI/2;}else if(art.wall==='left'){group.position.set(-8.67,art.at[1],art.at[0]);group.rotation.y=Math.PI/2;}else {group.position.set(...art.at);group.rotation.set(-.11,art.angle||0,0);const easel=new THREE.Group();easel.position.copy(group.position);easel.rotation.y=art.angle||0;scene.add(easel);box([0,-h/2-.11,-.015],[w+.34,.07,.22],oak,easel);for(let side of [-1,1]){let leg=box([side*w*.3,-.25,-.12],[.06,Math.max(h+.6,art.at[1]*2),.08],dark,easel);leg.rotation.z=side*.07;}let backleg=box([0,-art.at[1]/2,-.46],[.075,art.at[1]+.1,.075],dark,easel);backleg.rotation.x=-.38;shadow(art.at[0],art.at[2],w+1,.9,.30);colliders.push({x:art.at[0],z:art.at[2],hx:w/2+.15,hz:.5});}
  // Small brass number plates make the catalogue numbering visible in-world.
  const c=document.createElement('canvas');c.width=128;c.height=64;let cx=c.getContext('2d');cx.fillStyle='#302d23';cx.fillRect(0,0,128,64);cx.strokeStyle='#b59b61';cx.strokeRect(3,3,122,58);cx.fillStyle='#ead6a0';cx.font='26px Georgia';cx.textAlign='center';cx.fillText(art.imagined?'✧':String(art.id).padStart(2,'0'),64,42);let tx=new THREE.CanvasTexture(c);tx.colorSpace=THREE.SRGBColorSpace;mesh(new THREE.PlaneGeometry(.22,.11),new THREE.MeshBasicMaterial({map:tx}),[0,-h/2-.28,.07],null,group);
  scene.add(group);art.group=group;art.mesh=picture;art.height=h;return picture;
 }
 curiosities.push({title:'Terrestrial globe',description:'An interpretive brass-mounted globe with a parchment-colored map. Globes united geography, trade, and learned collecting.',position:[-7.35,1.95,-3.4],radius:.65},{title:'Bronze horses & instruments',description:'Small bronze horses, an astrolabe, books, and a nautilus shell share the central table. These modern models evoke the cabinet’s interest in art, nature, and knowledge.',position:[0,1.5,0],radius:1.1},{title:'Classical sculpture',description:'Draped figures and portrait busts evoke the study of antiquity. These are newly modeled interpretations, not scans of the sculptures in the painting.',position:[7.7,2.5,-3.5],radius:1.2});
 // Bake stationary room geometry by material to reduce thousands of small
 // sculptural pieces to a manageable set of draw calls. Painting meshes stay
 // independent so raycasting and texture upgrades retain their identity.
 scene.updateMatrixWorld(true);
 const batches=new Map();const originals=[];
 scene.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const key=o.material.uuid+'_'+o.castShadow+'_'+o.receiveShadow;let b=batches.get(key);if(!b){b={material:o.material,cast:o.castShadow,receive:o.receiveShadow,geometries:[]};batches.set(key,b);}b.geometries.push(o.geometry.clone().applyMatrix4(o.matrixWorld));originals.push(o);});
 for(const o of originals)o.removeFromParent();
 for(const b of batches.values()){const geometry=mergeGeometries(b.geometries,false);if(!geometry)throw new Error('Room geometry batching failed');const merged=new THREE.Mesh(geometry,b.material);merged.castShadow=b.cast;merged.receiveShadow=b.receive;scene.add(merged);for(const g of b.geometries)g.dispose();}
 return {makePainting,colliders,curiosities,materials:{oak,dark,gold},sun,shadow};
}
