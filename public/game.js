import * as THREE from 'three';
import {RelaySocket} from './relay.js?v=__V__';
import {GI,SK_IC,IT_IC,UI_IC} from './icons.js?v=__V__';
const gi=(n,c,st='')=>GI[n]?`<svg class="gi" viewBox="0 0 512 512" style="${c?'color:'+c+';':''}${st}">${GI[n]}</svg>`:'';
const uiI=(k,c,st)=>gi(UI_IC[k],c,st);
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {EL,CLASSES,WBASE,OBASE,ALLW,SLOTS,SLOT_N,ABASE,AFF,UNIQUES,ORBS,SKILLS,RAYS,STAT_N,MON,RAREMODS,THEMES,ZONES,MAPMODS,OBJ_POOL,BOSS_SK} from './data.js?v=__V__';

const $=id=>document.getElementById(id);
const rand=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rand(a,b+1)),pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const wpick=l=>{let s=0;for(const x of l)s+=x[1];let r=Math.random()*s;for(const x of l){r-=x[1];if(r<=0)return x[0]}return l[0][0]};
const angLerp=(a,b,t)=>{let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return a+d*t};
const wrapA=a=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ================= QUALITY / RENDERER ================= */
const touch=matchMedia('(pointer:coarse)').matches;
let Q='high';try{Q=localStorage.getItem('tlen_q')||(touch?'low':'high')}catch(e){}
function setQBtns(){document.querySelectorAll('#qSeg button').forEach(b=>b.classList.toggle('on',b.dataset.q===Q))}setQBtns();
$('qSeg').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;Q=b.dataset.q;try{localStorage.setItem('tlen_q',Q)}catch(_){}setQBtns();applyQ()});
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();scene.background=new THREE.Color('#1c1a26');scene.fog=new THREE.FogExp2(0x1c1a26,.02);
const camera=new THREE.PerspectiveCamera(42,1,.1,220);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(256,256),.7,.45,.9);composer.addPass(bloom);composer.addPass(new OutputPass());
const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},uTint:{value:new THREE.Color(1,1,1)},uSat:{value:1.08},uCon:{value:1.06},uVig:{value:.38},uTime:{value:0}},
vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
fragmentShader:'uniform sampler2D tDiffuse;uniform vec3 uTint;uniform float uSat,uCon,uVig,uTime;varying vec2 vUv;float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uTime)*43758.5453);}void main(){vec4 c=texture2D(tDiffuse,vUv);vec3 col=c.rgb;float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,uSat);col=(col-.5)*uCon+.5;col*=uTint;vec2 d=vUv-.5;float v=1.-dot(d,d)*uVig*2.2;col*=clamp(v,0.,1.);col+=(h(vUv*800.)-.5)*.018;gl_FragColor=vec4(clamp(col,0.,1.),c.a);}'});
composer.addPass(grade);
const hemi=new THREE.HemisphereLight(0x8090c0,0x3a2a20,1.1);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xffc89a,2.4);sun.castShadow=true;Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:90});sun.shadow.bias=-.0008;sun.shadow.normalBias=.03;scene.add(sun,sun.target);
function applyQ(){if(typeof grade!=='undefined')grade.enabled=Q!=='low';const pr=Q==='high'?Math.min(devicePixelRatio,1.75):Math.min(devicePixelRatio,1.1);renderer.setPixelRatio(pr);composer.setPixelRatio(pr);
sun.shadow.mapSize.set(Q==='high'?2048:1024,Q==='high'?2048:1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}bloom.strength=Q==='high'?.75:.6;resize()}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);composer.setSize(w,h);camera.aspect=w/h;camera.fov=w<h?58:42;camera.updateProjectionMatrix();pMat.uniforms.uScale.value=h*.5*renderer.getPixelRatio()}
addEventListener('resize',resize);

/* ================= PARTICLES ================= */
const PM=3500,pGeo=new THREE.BufferGeometry(),pPos=new Float32Array(PM*3),pCol=new Float32Array(PM*3),pSz=new Float32Array(PM),pAl=new Float32Array(PM);
const pV=new Float32Array(PM*3),pLife=new Float32Array(PM),pMax=new Float32Array(PM),pS0=new Float32Array(PM),pG=new Float32Array(PM),pD=new Float32Array(PM);let pI=0;
pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3));pGeo.setAttribute('pcol',new THREE.BufferAttribute(pCol,3));pGeo.setAttribute('psize',new THREE.BufferAttribute(pSz,1));pGeo.setAttribute('palpha',new THREE.BufferAttribute(pAl,1));
const pMat=new THREE.ShaderMaterial({uniforms:{uScale:{value:400}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
vertexShader:`attribute float psize;attribute float palpha;attribute vec3 pcol;varying vec3 vC;varying float vA;uniform float uScale;void main(){vC=pcol;vA=palpha;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=psize*uScale/-mv.z;gl_Position=projectionMatrix*mv;}`,
fragmentShader:`varying vec3 vC;varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.0,d);a*=a;gl_FragColor=vec4(vC*a*vA,a*vA);}`});
const pts=new THREE.Points(pGeo,pMat);pts.frustumCulled=false;scene.add(pts);
function emit(x,y,z,vx,vy,vz,life,size,r,g,b,grav=0,drag=0){const i=pI;pI=(pI+1)%PM;pPos[i*3]=x;pPos[i*3+1]=y;pPos[i*3+2]=z;pV[i*3]=vx;pV[i*3+1]=vy;pV[i*3+2]=vz;pLife[i]=life;pMax[i]=life;pS0[i]=size;pCol[i*3]=r;pCol[i*3+1]=g;pCol[i*3+2]=b;pG[i]=grav;pD[i]=drag}
const CC={};const C3=h=>CC[h]||(CC[h]=(()=>{const c=new THREE.Color(h);return[c.r,c.g,c.b]})());
function burst(p,hex,n=18,spd=4,size=.35,life=.7,mul=2,grav=-6){const[r,g,b]=C3(hex);for(let i=0;i<n;i++){const a=rand(0,6.28),u=rand(-.2,1),s=spd*rand(.3,1);emit(p.x,p.y,p.z,Math.cos(a)*s,u*s+1,Math.sin(a)*s,life*rand(.6,1.2),size*rand(.6,1.3),r*mul,g*mul,b*mul,grav,1.5)}}
function updParticles(dt){for(let i=0;i<PM;i++){if(pLife[i]<=0){if(pAl[i]!==0){pAl[i]=0;pSz[i]=0}continue}pLife[i]-=dt;const k=pLife[i]/pMax[i];const dr=Math.max(0,1-pD[i]*dt);
pV[i*3]*=dr;pV[i*3+2]*=dr;pV[i*3+1]=pV[i*3+1]*dr+pG[i]*dt;pPos[i*3]+=pV[i*3]*dt;pPos[i*3+1]=Math.max(.03,pPos[i*3+1]+pV[i*3+1]*dt);pPos[i*3+2]+=pV[i*3+2]*dt;pAl[i]=Math.max(0,Math.min(1,k*2.2));pSz[i]=pS0[i]*(.4+.6*k)}
pGeo.attributes.position.needsUpdate=pGeo.attributes.pcol.needsUpdate=pGeo.attributes.psize.needsUpdate=pGeo.attributes.palpha.needsUpdate=true}
const flashes=[0,1,2].map(()=>{const l=new THREE.PointLight(0xff8a3a,0,14,2);scene.add(l);return{l,t:0,i:0,d:1}});let fI=0;
function flash(p,hex,int=40,dur=.3){const f=flashes[fI++%flashes.length];f.l.color.set(hex);f.l.position.set(p.x,(p.y||0)+1,p.z);f.t=dur;f.d=dur;f.i=int}

/* ================= ASSETS ================= */
const A={};const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);let loadedN=0;const RNG0=Math.random;
const loading={};async function loadAsset(n){if(A[n])return;if(!loading[n])loading[n]=new Promise((res,rej)=>loader.load('assets/'+n+'.glb',g=>{A[n]=g;res()},undefined,rej));return loading[n]}
async function loadMany(list,cb){await Promise.all(list.map(async n=>{await loadAsset(n);loadedN++;cb&&cb()}))}
const PT={};
function prop(name,s=1){let t=PT[name];if(!t){t=A.props.scene.getObjectByName(name);if(!t)return new THREE.Group();t.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});PT[name]=t}const c=t.clone(true);c.position.set(0,0,0);c.rotation.set(0,0,0);c.scale.setScalar(s);return c}
const eyeMats={};const eyeMat=hex=>eyeMats[hex]||(eyeMats[hex]=new THREE.MeshBasicMaterial({color:new THREE.Color(hex).multiplyScalar(4),toneMapped:false}));
function makeChar(name,o={}){const g=A[name];const root=SkeletonUtils.clone(g.scene);const mm=new Map(),meshes={};
root.traverse(m=>{if(!m.isMesh)return;m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;meshes[m.name]=m;
if(o.show){if(ALLW.includes(m.name)||(/_Hat$|_Helmet$/.test(m.name)&&!o.keepHead))m.visible=o.show.includes(m.name)}
if(/Eyes/.test(m.name)&&o.eyes){m.material=eyeMat(o.eyes);return}
if(!mm.has(m.material)){const c=m.material.clone();if(o.tint)c.color.multiply(new THREE.Color(o.tint));if(o.ghost){c.transparent=true;c.opacity=.62;c.emissive=new THREE.Color(o.tint||'#88c8ff');c.emissiveIntensity=.5}mm.set(m.material,c)}m.material=mm.get(m.material)});
const anims=g.animations.length?g.animations:(/^skeleton/.test(name)?A.anim_skel.animations:A.anim_hero.animations);const mixer=new THREE.AnimationMixer(root),clips={};for(const c of anims)clips[c.name]=c;
if(o.layered){const low=/^(root|hips|upperleg|lowerleg|foot|toes|kneeIK|control|heelIK|IK-)/;for(const c of anims){const lo=[],hi=[];for(const t of c.tracks)(low.test(t.name.split('.')[0])?lo:hi).push(t);clips['U:'+c.name]=new THREE.AnimationClip('U:'+c.name,c.duration,hi);clips['L:'+c.name]=new THREE.AnimationClip('L:'+c.name,c.duration,lo)}}
const C={root,mixer,clips,meshes,mats:[...mm.values()],cur:null,curN:'',lock:0,
play(n,p={}){const c=clips[n];if(!c)return null;const a=mixer.clipAction(c);if(this.cur===a&&!p.restart){a.timeScale=p.ts||1;return a}
a.reset();a.setLoop(p.once?THREE.LoopOnce:THREE.LoopRepeat,Infinity);a.clampWhenFinished=!!p.once;a.timeScale=p.ts||1;a.setEffectiveWeight(1);a.play();if(this.cur&&this.cur!==a)a.crossFadeFrom(this.cur,p.fade??.15,false);this.cur=a;this.curN=n;
if(p.once&&p.lock!==false)this.lock=c.duration/(p.ts||1)*(p.lockK??.85);return a},
lay:{U:{cur:null,n:''},L:{cur:null,n:''}},
playL(ly,n,p={}){const c=clips[ly+':'+n];if(!c)return null;const Ly=this.lay[ly];const a=mixer.clipAction(c);if(Ly.cur===a&&!p.restart){a.timeScale=p.ts||1;return a}
a.reset();a.setLoop(p.once?THREE.LoopOnce:THREE.LoopRepeat,Infinity);a.clampWhenFinished=!!p.once;a.timeScale=p.ts||1;a.setEffectiveWeight(1);a.play();if(Ly.cur&&Ly.cur!==a)a.crossFadeFrom(Ly.cur,p.fade??.12,false);Ly.cur=a;Ly.n=n;return a},
attach(bone,pn,s=1){const b=root.getObjectByName(bone)||root.getObjectByName(bone.replace('.',''));if(!b)return;const w=prop(pn,s);b.add(w);return w}};
return C}

/* ================= TEXTURES / GROUND / GRASS ================= */
function noiseTex(c1,c2,c3,opts={}){const S=512,cv=document.createElement('canvas');cv.width=cv.height=S;const x=cv.getContext('2d');x.fillStyle=c1;x.fillRect(0,0,S,S);
const dot=(px,py,r,col,a)=>{x.globalAlpha=a;x.fillStyle=col;for(const ox of[-S,0,S])for(const oy of[-S,0,S]){if(px+ox<-r||px+ox>S+r||py+oy<-r||py+oy>S+r)continue;x.beginPath();x.arc(px+ox,py+oy,r,0,7);x.fill()}};
for(let i=0;i<260;i++)dot(rand(0,S),rand(0,S),rand(20,70),Math.random()<.5?c2:c3,rand(.05,.14));for(let i=0;i<5000;i++)dot(rand(0,S),rand(0,S),rand(.6,3.5),Math.random()<.5?c2:c3,rand(.15,.45));
if(opts.tiles){x.globalAlpha=.55;x.strokeStyle=opts.tiles;x.lineWidth=3;const n=4,s=S/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const off=(j%2)*s/2;x.strokeRect(i*s+off,j*s,s,s);x.strokeRect(i*s+off-S,j*s,s,s)}}
x.globalAlpha=1;const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t}
const radTex=(stops)=>{const cv=document.createElement('canvas');cv.width=cv.height=128;const x=cv.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);for(const[o,c]of stops)g.addColorStop(o,c);x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(cv)};
const softTex=radTex([[0,'rgba(255,255,255,1)'],[.4,'rgba(255,255,255,.5)'],[1,'rgba(255,255,255,0)']]);
const scorchTex=radTex([[0,'rgba(0,0,0,.85)'],[.6,'rgba(20,8,0,.5)'],[1,'rgba(0,0,0,0)']]);
const poolTex=radTex([[0,'rgba(255,255,255,.55)'],[.7,'rgba(255,255,255,.3)'],[.95,'rgba(255,255,255,.6)'],[1,'rgba(255,255,255,0)']]);
const beamTex=(()=>{const cv=document.createElement('canvas');cv.width=4;cv.height=128;const x=cv.getContext('2d');const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.7,'rgba(255,255,255,.5)');g.addColorStop(1,'rgba(255,255,255,1)');x.fillStyle=g;x.fillRect(0,0,4,128);return new THREE.CanvasTexture(cv)})();
const gU={uTime:{value:0}};
function makeGrass(count,area,col,avoid,parent){const geo=new THREE.PlaneGeometry(.14,.8,1,3);geo.translate(0,.4,0);const p=geo.attributes.position,cols=[];const c0=new THREE.Color(col).multiplyScalar(.35),c1=new THREE.Color(col);
for(let i=0;i<p.count;i++){const y=p.getY(i);p.setX(i,p.getX(i)*(1-y/.85));const c=c0.clone().lerp(c1,y/.8);cols.push(c.r,c.g,c.b)}geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));
const m=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:1});
m.onBeforeCompile=s=>{s.uniforms.uTime=gU.uTime;s.vertexShader='uniform float uTime;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
vec4 wp0=instanceMatrix*vec4(0.,0.,0.,1.);float hh=position.y;transformed.x+=sin(uTime*1.8+wp0.x*.4+wp0.z*.3)*.16*hh*hh;transformed.z+=cos(uTime*1.4+wp0.x*.25)*.1*hh*hh;`)};
const im=new THREE.InstancedMesh(geo,m,count);im.receiveShadow=true;const d=new THREE.Object3D(),cc=new THREE.Color();let n=0;
const rr=(a,b)=>a+RNG0()*(b-a);for(let t=0;t<count*2&&n<count;t++){const x=rr(-area,area),z=rr(-area,area);if(avoid&&avoid(x,z))continue;d.position.set(x,0,z);d.rotation.y=rr(0,6.28);const s=rr(.6,1.4);d.scale.set(s,s*rr(.7,1.3),s);d.updateMatrix();im.setMatrixAt(n,d.matrix);cc.setHSL(0,0,rr(.75,1.15));im.setColorAt(n,cc);n++}
im.count=n;parent.add(im);return im}
function makeGround(size,tex,rep,parent){const geo=new THREE.PlaneGeometry(size,size,64,64);geo.rotateX(-Math.PI/2);const p=geo.attributes.position,cols=[];
for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);const n=.5+.25*Math.sin(x*.11+z*.07)+.15*Math.sin(x*.27-z*.21)+.1*Math.sin(z*.5+x*.13);const v=lerp(.55,1.15,clamp(n,0,1));cols.push(v,v,v)}
geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));tex.repeat.set(rep,rep);const g=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({map:tex,vertexColors:true,roughness:.95}));g.receiveShadow=true;parent.add(g);return g}

/* ================= SAVE / PLAYER ================= */
let uid=1,P=null,ST=null;
const SAVE='tlen3_save';
const CHARS_KEY='tlen3_chars';let CUR=0;
function charsGet(){let c=null;try{c=JSON.parse(localStorage.getItem(CHARS_KEY))}catch(e){}if(!c||!Array.isArray(c.list)){c={list:[],cur:0};try{const o=JSON.parse(localStorage.getItem(SAVE));if(o&&o.cls)c.list.push(o)}catch(e){}}return c}
function charsPut(c){try{localStorage.setItem(CHARS_KEY,JSON.stringify(c))}catch(e){}}
function save(){if(!P)return;const c=charsGet();c.list[CUR]=P;c.cur=CUR;charsPut(c)}
function load(i){try{const c=charsGet();if(i==null)i=c.cur||0;const s=c.list[i];if(s&&s.cls&&CLASSES[s.cls]){CUR=i;s.eq=s.eq||{};s.bag=s.bag||[];s.lore=s.lore||[];s.sk=s.sk||{};s.slots=s.slots||[null,null,null];s.pas=s.pas||[];s.orbs=s.orbs||{};s.auraOff=s.auraOff||[];s.maxMap=s.maxMap||0;
uid=1+Math.max(0,...s.bag.map(i=>i.id),...Object.values(s.eq).map(i=>i.id));return s}}catch(e){}return null}
const START_W={mage:'wand',knight:'sword',rogue:'xbow',barbarian:'axe'},START_SK={mage:'fireball',knight:'cleave',rogue:'volley',barbarian:'heavystrike'};
function freshP(cls){const wb=WBASE[START_W[cls]];const w={id:uid++,slot:'weapon',wb:START_W[cls],base:'Старый '+wb.n.toLowerCase(),name:'Старый '+wb.n.toLowerCase(),rar:0,ilvl:1,upg:0,dmg:[wb.dmg[0]+1,wb.dmg[2]+1],aff:[]};
if(cls==='knight'||cls==='rogue')w.name=w.base=(cls==='knight'?'Старый меч':'Старый арбалет');
const p={cls,lvl:1,xp:0,gold:0,spts:1,ppts:0,sk:{[START_SK[cls]]:1},slots:[START_SK[cls],null,null],pas:[cls+'_s'],eq:{weapon:w},bag:[],orbs:{trans:2,alt:2},maxZone:1,maxMap:0,lore:[],auraOff:[]};return p}

/* ================= PASSIVE TREE ================= */
const TREE={nodes:{},list:[]};
(function genTree(){const order=['mage','knight','barbarian','rogue'],base={mage:-90,knight:0,barbarian:90,rogue:180};const R=[115,165,215,265,315];
const add=(n)=>{n.links=n.links||[];TREE.nodes[n.id]=n;TREE.list.push(n);return n};const link=(a,b)=>{a.links.push(b.id);b.links.push(a.id)};
for(const cls of order){const a0=base[cls]*Math.PI/180;const st=add({id:cls+'_s',x:Math.cos(a0)*60,y:Math.sin(a0)*60,t:'start',cls,n:CLASSES[cls].n,st:{}});
RAYS[cls].forEach((ray,ri)=>{const ang=a0+(ri-1)*.55;let prev=st;R.forEach((rr,k)=>{const isNo=k===2,isEnd=k===4;const st2=isNo?ray.no.st:isEnd?ray.end.st:ray.sm;
const n=add({id:`${cls}_${ri}_${k}`,x:Math.cos(ang)*rr,y:Math.sin(ang)*rr,t:isEnd?(ray.end.key?'key':'notable'):isNo?'notable':'small',cls,n:isNo?ray.no.n:isEnd?ray.end.n:ray.n,st:st2,d:isEnd?ray.end.d:null});link(prev,n);prev=n})})}
// мосты между соседними классами
for(let i=0;i<4;i++){const a=order[i],b=order[(i+1)%4];const aa=(base[a]+(base[b]-base[a]+360)%360/2)*Math.PI/180;
for(const[rr,k]of[[190,1],[290,3]]){const n=add({id:`br_${a}_${k}`,x:Math.cos(aa)*rr,y:Math.sin(aa)*rr,t:'small',cls:null,n:k===1?'Стойкость':'Мастерство',st:k===1?{hp:15,dmgP:4}:{dmgP:8,aspd:3}});
link(n,TREE.nodes[`${a}_2_${k}`]);link(n,TREE.nodes[`${b}_0_${k}`])}}})();
function canAlloc(id){const n=TREE.nodes[id];if(!n||P.pas.includes(id))return false;return n.links.some(l=>P.pas.includes(l))}
function canRefund(id){if(!P.pas.includes(id)||TREE.nodes[id].t==='start')return false;const rest=P.pas.filter(x=>x!==id);const start=P.cls+'_s';const seen=new Set([start]),q=[start];
while(q.length){const c=q.pop();for(const l of TREE.nodes[c].links)if(rest.includes(l)&&!seen.has(l)){seen.add(l);q.push(l)}}return rest.every(x=>seen.has(x))}

/* ================= STATS ================= */
const KEYS=['dmgF','dmgP','physP','fireP','coldP','lightP','chaosP','holyP','meleeP','projP','aoeP','hp','hpP','mana','manaP','manaRegen','regen','armor','armorP','aspd','crit','critM','critX','move','leech','burnCh','chillStr','shockCh','bleed','chainAdd','pierce','projAdd','poisonDur','spreadPoison','execute','slamR','stunCh','reflect','dmgTaken','auraP','dashCd','skillLvl','gold','rarity','cdr','bloodMagic'];
function addSt(s,st,k=1){for(const key in st)s[key]=(s[key]||0)+st[key]*k}
function calc(eq=P.eq){const C=CLASSES[P.cls],s={};for(const k of KEYS)s[k]=0;s.hp=C.hp+P.lvl*C.hpL;s.mana=C.mana+P.lvl*C.manaL;s.armor=C.armor;s.crit=5;s.critM=150;s.regen=1+P.lvl*.2;s.manaRegen=3+P.lvl*.15;
let min=0,max=0,aps=1.2,range=C.ranged?10:2.2;const w=eq.weapon;
if(w){const m=1+.1*w.upg,WB=WBASE[w.wb];min=w.dmg[0]*m;max=w.dmg[1]*m;aps=WB.aps;range=WB.range}else{min=1;max=3}
for(const k of SLOTS){const it=eq[k];if(!it)continue;const m=1+.1*it.upg;if(it.cimp)s[it.cimp.k]+=it.cimp.v;if(it.armor)s.armor+=it.armor*m;if(it.imp)s[it.imp.k]+=it.imp.v*m;for(const a of it.aff)s[a.k]+=a.v*m;if(it.st)addSt(s,it.st)}
for(const id of P.pas)addSt(s,TREE.nodes[id].st);ascSt(s);panSt(s);
for(const id in P.sk){const sk=SKILLS[id];if(sk&&sk.kind==='mod'&&P.sk[id]>0)addSt(s,sk.st,P.sk[id])}
for(const b of H.buffs)addSt(s,b.st);
for(const id of activeAuras())addSt(s,SKILLS[id].p.st,(1+s.auraP/100)*(1+.12*(skLvl(id)-1)));
s.hp=Math.max(10,s.hp*(1+s.hpP/100));s.mana=Math.max(5,s.mana*(1+s.manaP/100));s.armor=Math.max(0,s.armor*(1+s.armorP/100));
s.min=Math.max(1,min+s.dmgF);s.max=Math.max(s.min+1,max+s.dmgF);s.aps=aps*(1+s.aspd/100);s.range=range;s.crit=Math.min(80,s.crit*(1+s.critX/100));s.critM=Math.max(110,s.critM);
s.speed=6.2*(1+s.move/100);if(P.hc)s.rarity+=25;s.leech=Math.min(12,s.leech);s.reserve=activeAuras().length*.25;s.dmgTaken=Math.max(-75,s.dmgTaken);
const el=C.basicEl;s.dps=(s.min+s.max)/2*(1+inc(s,el,{melee:!C.ranged,proj:!!C.ranged})/100)*s.aps*(1+s.crit/100*(s.critM/100-1));return s}
function inc(s,el,t={}){let v=s.dmgP;v+=el==='phys'?s.physP:el==='fire'?s.fireP:el==='cold'?s.coldP:el==='light'?s.lightP:el==='chaos'?s.chaosP:el==='holy'?s.holyP+s.lightP*.3:0;if(t.melee)v+=s.meleeP;if(t.proj)v+=s.projP;return v}
function recalc(){if(NET.on&&P)setTimeout(sendInfo,0);const hpK=ST?H.hp/ST.hp:1;ST=calc();if(H.hp>ST.hp)H.hp=ST.hp;const mm=ST.mana*(1-ST.reserve);if(H.mana>mm)H.mana=mm;if(P)heroLook()}
const skLvl=id=>(P.sk[id]||0)+(P.sk[id]?ST?ST.skillLvl:0:0);
function activeAuras(){if(!P)return[];return P.slots.filter(id=>id&&SKILLS[id]&&SKILLS[id].kind==='aura'&&P.sk[id]>0&&!P.auraOff.includes(id))}
const need=l=>Math.round(30*Math.pow(l,1.65)+20);

/* ================= STATE ================= */
const S={mid:0,seed:1,building:false,mode:'load',L:1,zi:0,th:THEMES[0],zone:null,mods:[],paused:false,panel:null,ctx:null,sel:null,boss:null,cleared:false,shake:0,bagWarn:0,hurtV:0,shop:[],pasSel:null};
const H={g:new THREE.Group(),hp:100,mana:50,atkT:0,castT:0,cds:[0,0,0],dashCd:0,flask:3,healT:0,healR:0,target:null,inv:0,face:0,faceT:0,c:null,pick:null,buffs:[],es:0,immortal:0,whirl:null,leap:null,charge:null,barrage:null,queue:[],mistT:0,regenOff:false};
scene.add(H.g);const hLight=new THREE.PointLight(0x8fd0ff,7,10,2);hLight.position.set(0,4.2,2.2);H.g.add(hLight);

/* ================= WORLDS ================= */
const town=new THREE.Group(),zone=new THREE.Group();scene.add(town,zone);
let townObs=[],zoneObs=[],dyn=new THREE.Group();zone.add(dyn);
let mons=[],allies=[],loot=[],projs=[],grounds=[],pending=[],traps=[],rings=[],decals=[],bolts2=[],chests=[],exitP=null,lights=[],emitters=[];
const torchLights=[0,1,2,3].map((x,i)=>{const l=new THREE.PointLight(0xff9a40,0,13,2);l.userData.ph=i*1.7;scene.add(l);return l});
let NPCS=[],npcChars=[],portalDisc=null,fireLight=null;
const PR={tree_dead_large:[1.25,.6],tree_dead_medium:[1.25,.45],tree_dead_small:[1.3,.4],rock_single_A:[8,1.2],rock_single_B:[8,1.2],rock_single_C:[8,1.4],rock_single_D:[8,1.2],rock_single_E:[8,1.6],
gravestone:[1,.6],grave_A:[1,1],grave_B:[1,1],gravemarker_A:[1,.4],gravemarker_B:[1,.4],crypt:[1,4],arch:[1,0],pillar:[1,.6],post_skull:[1,.4],skull_candle:[1,.5],ribcage:[1,0],bone_A:[1,0],bone_B:[1,0],skull:[1,.4],
coffin:[1,1.1],bench_decorated:[1,.8],fence:[1,0],fence_seperate_broken:[1,0],shrine:[1,.6],tree_pine_orange_medium:[1.1,.9],tree_pine_yellow_medium:[1.1,.9],pumpkin_orange_jackolantern:[.8,.5],tent:[6,1.6],
pillar_decorated:[1,1.1],column:[1.4,.5],rubble_large:[1,2.4],rubble_half:[1,1.7],wall_half:[1,1],wall_broken:[1,1.6],barrel_large:[1,.9],keg:[1,1],box_large:[1,.8],table_long_decorated_A:[1,1.3],
sword_shield_broken:[1,0],d_candle_triple:[1.2,0],banner_patternA_red:[1,.4],lantern_standing:[1.7,.35],torch_lit:[1.5,.3]};
function place(name,x,z,parent,obs,opt={}){const d=PR[name]||[1,.6];const s=(opt.s||d[0])*(opt.sv?rand(1-opt.sv,1+opt.sv):1);const o=prop(name,s);o.position.set(x,opt.y||0,z);o.rotation.y=opt.ry??rand(0,6.28);parent.add(o);
const r=opt.r!==undefined?opt.r:d[1]*(s/d[0]);if(r>0&&obs)obs.push({x,z,r});return o}
function buildTown(){townObs=[];
makeGround(90,noiseTex('#3b4a2c','#4c5e34','#2a341f'),16,town);
const dm=new THREE.MeshStandardMaterial({map:noiseTex('#5a4a38','#6a5640','#3e3226'),roughness:1});dm.map.repeat.set(3,3);
const dirt=new THREE.Mesh(new THREE.CircleGeometry(10,48).rotateX(-Math.PI/2),dm);dirt.position.y=.02;dirt.receiveShadow=true;town.add(dirt);
const path=new THREE.Mesh(new THREE.PlaneGeometry(4.5,14).rotateX(-Math.PI/2),dm);path.position.set(0,.025,-14);path.receiveShadow=true;town.add(path);
makeGrass(Q==='high'?7000:3500,40,'#6f8f3e',(x,z)=>Math.hypot(x,z)<10.5||(Math.abs(x)<2.6&&z<-6&&z>-22),town);
for(let i=0;i<9;i++){const a=i/9*6.28;place('rock_single_B',Math.cos(a)*1.25,Math.sin(a)*1.25,town,null,{s:3.2})}
for(let i=0;i<4;i++){const l=prop('resource_lumber',2.2);l.position.set(0,.12,0);l.rotation.y=i*.8;town.add(l)}
townObs.push({x:0,z:0,r:1.5});fireLight=new THREE.PointLight(0xff8a3a,60,22,2);fireLight.position.set(0,1.8,0);town.add(fireLight);emitters.push({x:0,y:.4,z:0,kind:'fire',w:town});
place('building_market_red',-10,-6,town,townObs,{s:5,ry:.5,r:3.2});place('building_blacksmith_red',10.5,-6,town,townObs,{s:5,ry:-.6,r:3.4});
place('building_tavern_red',-15,6,town,townObs,{s:5,ry:1.2,r:3.3});place('building_home_A_red',15,6,town,townObs,{s:5,ry:-1.3,r:2.3});place('building_home_B_red',-18,-8,town,townObs,{s:5,ry:.9,r:2.8});
place('building_well_red',7,7,town,townObs,{s:4,ry:0,r:1.5});
for(const[x,z]of[[4,11],[-5,11.5],[16,-12],[-12,13]])place('tent',x,z,town,townObs,{s:6,r:1.6});
for(const[n,x,z,s,r]of[['crate_A_big',-7,-3.2,5,.6],['crate_open',-12.6,-3,5,.7],['barrel',-7.6,-1.8,5,.5],['sack',-12,-1.8,5,0],['weaponrack',13,-3,6,.7],['barrel',8,-3.2,5,.5],['resource_lumber',14,-1,4,1],['wheelbarrow',-4,6,5,.8],['bucket_water',6,5.5,5,0],['crate_long_A',3.6,-4.5,5,.8],['target',-3,-21,7,0],['bucket_arrows',-4,-20,6,0],['barrel',12,3,5,.5]])place(n,x,z,town,townObs,{s,r});
for(const[x,z]of[[-3.2,-10],[3.2,-10],[-3.2,-17],[3.2,-17],[9,1.5],[-9,1.5]]){place('lantern_standing',x,z,town,townObs,{s:1.7});lights.push({x,y:1.6,z,hex:'#ffb050',w:'town'});emitters.push({x,y:1.25,z,kind:'lamp',w:town})}
for(let i=0;i<22;i++){const a=i/22*6.28+rand(-.1,.1),r=rand(25,30);place(pick(['trees_A_large','trees_B_large']),Math.cos(a)*r,Math.sin(a)*r,town,null,{s:rand(5,7)})}
for(let i=0;i<14;i++){const a=rand(0,6.28),r=rand(17,23);place(pick(['tree_single_A','tree_single_B']),Math.cos(a)*r,Math.sin(a)*r,town,townObs,{s:rand(4,5.5),r:.7})}
for(let i=0;i<10;i++){const a=rand(0,6.28),r=rand(14,24);place(pick(['rock_single_A','rock_single_C','rock_single_D']),Math.cos(a)*r,Math.sin(a)*r,town,townObs,{s:rand(5,8),r:1})}
place('flag_red',-3.4,-20.5,town,null,{s:7,ry:0});place('flag_red',3.4,-20.5,town,null,{s:7,ry:0});
place('arch_gate',0,-22,town,null,{s:1.35,ry:0});townObs.push({x:-2.6,z:-22,r:.8},{x:2.6,z:-22,r:.8});
portalDisc=new THREE.Mesh(new THREE.CircleGeometry(2.3,48),new THREE.MeshBasicMaterial({color:new THREE.Color('#9a5cff').multiplyScalar(2.2),transparent:true,opacity:.75,side:THREE.DoubleSide,toneMapped:false,map:softTex}));
portalDisc.position.set(0,2.6,-22);town.add(portalDisc);const pl=new THREE.PointLight(0xa070ff,30,14,2);pl.position.set(0,2.6,-20.5);town.add(pl);emitters.push({x:0,y:2.6,z:-22,kind:'portal',w:town});
const mer=makeChar('merchant',{show:[]});mer.root.position.set(-8.6,0,-2.6);mer.root.rotation.y=.4;town.add(mer.root);mer.play('Idle');
const smi=makeChar('barbarian',{show:['1H_Axe']});smi.root.position.set(9.2,0,-2.8);smi.root.rotation.y=-.5;town.add(smi.root);smi.play('1H_Melee_Attack_Chop',{ts:.7});
const kn=makeChar('knight',{show:['1H_Sword','Badge_Shield','Knight_Helmet']});kn.root.position.set(3.6,0,-19.5);kn.root.rotation.y=-.3;town.add(kn.root);kn.play('Idle');
npcChars=[mer,smi,kn];
{const st=place('chest_gold',-5.4,3.4,town,townObs,{s:1.15,ry:.9,r:.8});const sl=new THREE.PointLight(0xffc070,2.2,6,2);sl.position.set(-5.4,1.6,3.4);town.add(sl)}
NPCS=[{id:'stash',name:'Хранилище',x:-5.4,z:3.4,lx:-5.4,lz:3.4,ly:1.9},{id:'merchant',name:'Торговка Вера',x:-8.2,z:-1.4,lx:-8.6,lz:-2.6,ly:2.9},{id:'smith',name:'Кузнец Гром',x:8.8,z:-1.5,lx:9.2,lz:-2.8,ly:3.1},{id:'portal',name:'Портал',x:0,z:-19.6,lx:0,lz:-22,ly:5.6}];
for(const n of NPCS){const el=document.createElement('div');el.className='npcn';el.textContent=n.name;$('npcl').appendChild(el);n.el=el}}
let zGround=null,zGrass=null;
function clearZone(){if(S.ess&&S.ess.el)S.ess.el.remove();S.ess=null;for(const m of mons)if(m.lab)m.lab.remove();if(S.rift&&S.rift.el)S.rift.el.remove();S.rift=null;if(S.shrines)for(const sh of S.shrines)sh.el.remove();S.shrines=[];zone.remove(dyn);for(const m of mons)m.c.mats.forEach(x=>x.dispose());mons=[];for(const a of allies)a.c&&a.c.mats.forEach(x=>x.dispose());allies=[];for(const l of loot)l.el.remove();loot=[];
for(const arr of[projs,grounds,pending,traps,bolts2])for(const o of arr)if(o.m)scene.remove(o.m);projs=[];grounds=[];pending=[];traps=[];bolts2=[];
for(const r of rings){scene.remove(r.m);r.m.material.dispose()}rings=[];for(const d of decals){scene.remove(d.m);d.m.material.dispose()}decals=[];chests=[];exitP=null;zoneObs=[];if(OBJ)for(const e of OBJ.ents)e.el&&e.el.remove();OBJ=null;
emitters=emitters.filter(e=>e.w!==zone);lights=lights.filter(l=>l.w==='town');if(zGround){zone.remove(zGround);zGround.geometry.dispose();zGround.material.map.dispose();zGround.material.dispose();zGround=null}
if(zGrass){zone.remove(zGrass);zGrass.geometry.dispose();zGrass.material.dispose();zGrass=null}dyn=new THREE.Group();zone.add(dyn);H.whirl=H.leap=H.charge=H.barrage=null;H.queue=[]}
const mod=k=>S.mods.some(m=>m.k===k);
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function buildZone(){clearZone();S.mid=0;S.building=true;S.rift=null;Math.random=mulberry(S.seed||1);try{buildZone0();if(!S.pin&&Math.random()<(S.zi<0?(P.atlN&&P.atlN.includes('rift')?.75:.5):.3))makeRift();S.shrines=[];const mapZ=S.zi<0&&P.atlN;for(let i=0;i<(Math.random()<.6?1:0)+(Math.random()<.3?1:0)+(mapZ&&P.atlN.includes('shr')?1:0);i++)makeShrine();S.ess=null;if(!S.pin&&Math.random()<(mapZ&&P.atlN.includes('ess')?.56:.28))makeEss()}finally{Math.random=RNG0;S.building=false}}
function buildZone0(){const Z=S.zone,th=THEMES[Z.th];S.th=th;
zGround=makeGround(130,noiseTex(th.g[0],th.g[1],th.g[2],{tiles:th.tiles}),th.tiles?26:18,zone);
const start={x:0,z:46},bossP={x:0,z:-44};const near=(x,z,r)=>Math.hypot(x-start.x,z-start.z)<r||Math.hypot(x-bossP.x,z-bossP.z)<r+3;
if(th.water)for(let i=0;i<14;i++){const x=rand(-50,50),z=rand(-40,40);if(near(x,z,9))continue;const w=new THREE.Mesh(new THREE.CircleGeometry(rand(2,5),24).rotateX(-Math.PI/2),new THREE.MeshStandardMaterial({color:'#2a4a48',roughness:.05,metalness:.3,transparent:true,opacity:.55,emissive:'#0a2a22',emissiveIntensity:.6}));w.position.set(x,.04,z);w.scale.z=rand(.6,1);dyn.add(w)}
for(let i=-60;i<=60;i+=5)for(const[x,z]of[[i,-60],[i,60],[-60,i],[60,i]])place(pick(th.bord),x+rand(-1.5,1.5),z+rand(-1.5,1.5),dyn,null,{sv:.2});
let n=0;for(let t=0;t<900&&n<120;t++){const x=rand(-55,55),z=rand(-55,55);if(near(x,z,8))continue;const nm=wpick(th.dec),r=(PR[nm]||[1,.6])[1];if(zoneObs.some(o=>Math.hypot(o.x-x,o.z-z)<o.r+r+1.6))continue;place(nm,x,z,dyn,zoneObs);
if(nm==='skull_candle'||nm==='d_candle_triple')emitters.push({x,y:.9,z,kind:'candle',w:zone});n++}
for(let i=0;i<16;i++){let x=rand(-46,46),z=lerp(40,-38,i/15)+rand(-4,4);if(i%2)x=rand(-12,12);place(th.light,x,z,dyn,zoneObs);const tor=th.light==='torch_lit';
lights.push({x,y:tor?1.4:1.6,z,hex:tor?'#ff8a30':'#ffb050',w:'zone'});emitters.push({x,y:1.25,z,kind:tor?'torch':'lamp',w:zone})}
if(th.gn)zGrass=makeGrass(Q==='high'?th.gn:th.gn*.45|0,56,th.grass,(x,z)=>zoneObs.some(o=>o.r>1&&Math.hypot(o.x-x,o.z-z)<o.r*.8),zone);
for(let i=0;i<4;i++){for(let t=0;t<50;t++){const x=rand(-48,48),z=rand(-36,38);if(near(x,z,10)||zoneObs.some(o=>Math.hypot(o.x-x,o.z-z)<o.r+2))continue;const gold=i===0;const c=place(gold?'chest_gold':'chest',x,z,dyn,zoneObs,{s:.9,r:.8});chests.push({o:c,x,z,gold,open:false});break}}
const packN=Math.round(13*(mod('pack')?1.4:1));let packs=0;for(let t=0;t<600&&packs<packN;t++){const x=rand(-46,46),z=rand(-32,34);if(Math.hypot(x,z-46)<15)continue;if(zoneObs.some(o=>Math.hypot(o.x-x,o.z-z)<o.r+1.5))continue;
const sz=ri(3,5),rare=mod('rare')?packs%2===1:packs%4===2,magic=!rare&&Math.random()<.3;for(let k=0;k<(magic?3:sz);k++){const a=rand(0,6.28),d=rand(.8,3);spawnMon(wpick(Z.mons),x+Math.cos(a)*d,z+Math.sin(a)*d,{rare:rare&&k===0,magic})}packs++}
S.boss=spawnMon(Z.bt,bossP.x,bossP.z,{boss:1});S.boss.kit=Z.kit||['slam','summon'];S.boss.phases=Z.phases;S.boss.abT=2;S.boss.sumN=0;S.cleared=false;setupObjective();
const ar=new THREE.Mesh(new THREE.RingGeometry(8.5,9,64).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color(th.eyes).multiplyScalar(1.4),transparent:true,opacity:.35,toneMapped:false}));ar.position.set(bossP.x,.05,bossP.z);dyn.add(ar);
setEnv(th.fog,th.fd,th.moon,th.mi,th.hs)}
function setEnv(fog,fd,sunC,si,hs){{const c=new THREE.Color(sunC).lerp(new THREE.Color('#ffffff'),.88);grade.uniforms.uTint.value.copy(c).multiplyScalar(1.06);grade.uniforms.uVig.value=town.visible?.28:.32}scene.background.set(fog);scene.fog.color.set(fog);scene.fog.density=fd;sun.color.set(sunC);sun.intensity=si;hemi.color.set(hs);hemi.groundColor.set('#3a3028');hemi.intensity=town.visible?1:1.7;renderer.toneMappingExposure=town.visible?1.05:1.3}

/* ================= MONSTERS ================= */
const hpBgM=new THREE.SpriteMaterial({color:0x000000,opacity:.75,transparent:true,depthTest:false}),hpFgM=new THREE.SpriteMaterial({color:0xe03a2e,depthTest:false}),hpRareM=new THREE.SpriteMaterial({color:0xffd84a,depthTest:false}),hpAllyM=new THREE.SpriteMaterial({color:0x5ad06a,depthTest:false});
function hpBar(g,hy,mat){const bg=new THREE.Sprite(hpBgM),fg=new THREE.Sprite(mat);bg.position.set(0,hy,0);bg.scale.set(1.3,.15,1);fg.center.set(0,.5);fg.position.set(-.62,hy,0);fg.scale.set(1.24,.09,1);bg.renderOrder=fg.renderOrder=5;g.add(bg,fg);return[bg,fg]}
function spawnMon(type,x,z,o){if(isGuest()&&!S.building)return null;const D=MON[type],L=S.L,th=S.th;const boss=!!o.boss;const sc=(D.sc||1)*(boss?(D.sc?1.6:2.3):o.rare?1.2:1);
const c=makeChar(D.model,{eyes:boss?th.eyes:o.rare?'#ffd84a':o.magic?'#6a9aff':th.eyes,tint:o.tint||(boss?th.tint:D.tint),show:D.show||[]});
if(D.w)for(const[b,w]of D.w)c.attach(b,w,1);if(D.ghost)for(const m of c.mats){m.transparent=true;m.opacity=.55;m.depthWrite=false}const g=new THREE.Group();g.position.set(x,0,z);c.root.scale.setScalar(sc);c.root.rotation.y=rand(0,6.28);g.add(c.root);
if(o.rare||boss||o.magic){const r=new THREE.Mesh(new THREE.RingGeometry(.75,1,32).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color(boss?th.eyes:o.rare?'#ffd84a':'#5a8aff').multiplyScalar(2),transparent:true,opacity:.6,toneMapped:false,depthWrite:false}));r.position.y=.05;r.scale.setScalar(sc);g.add(r)}
const[bg,fg]=hpBar(g,2.5*sc+.3,o.rare?hpRareM:hpFgM);bg.visible=fg.visible=false;dyn.add(g);
if(D.sk){const a=c.play('Skeletons_Awaken_Standing',{once:true,lock:false});if(a){a.time=0;a.paused=true}}else c.play('Idle');
let hm=(1+.6*(partyN()-1))*Math.pow(1.3,L-1)*(o.rare?3.5:o.magic?1.7:1)*(boss?(D.sc?14:22)*(S.pin?2.5:1):1)*(mod('mhp')?1.4:1),dm=Math.pow(1.2,L-1)*(o.rare?1.4:1)*(boss?2.6:1)*(mod('mdmg')?1.3:1);
const rmods=o.rare?shuffle(RAREMODS.slice()).slice(0,ri(1,2)):[];if(rmods.some(m=>m.k==='tough'))hm*=2;
const name=boss?S.zone.boss:o.rare?rmods.map(m=>m.n).join(' ')+' '+D.n.toLowerCase():o.magic?pick(['Свирепый','Проворный','Яростный','Стойкий','Гниющий'])+' '+D.n.toLowerCase():D.n;
let spd=D.spd*(o.rare?1.1:1)*(mod('mspd')?1.25:1)*(rmods.some(m=>m.k==='fast')?1.4:1);
const M={g,c,type,D,name,hp:D.hp*hm,max:D.hp*hm,dmg:D.dmg*dm*(o.magic?1.2:1),spd,r:.45*sc,sc,rare:!!o.rare,magic:!!o.magic,boss,rm:rmods.map(m=>m.k),atkT:rand(.5,1.2),aggro:false,wake:0,flash:0,bg,fg,dead:0,slamT:3,sumT:6,summoned:false,hitT:-1,face:c.root.rotation.y,
st:{burn:null,bleed:null,poison:[],chill:0,shock:0,stun:0,blind:0},dotAcc:0,dotT:0};M.id=o.id!==undefined?o.id:S.mid++;if(o.id!==undefined)S.mid=Math.max(S.mid,o.id+1);M.dyn=!S.building||!!o.net;
if(M.rare||M.magic){const el=document.createElement('div');el.className='mnl '+(M.rare?'r':'m');el.innerHTML=esc(name)+(M.rare&&rmods.length?`<small>${rmods.map(m=>m.n).join(' · ')}</small>`:'');el.style.display='none';$('labels').appendChild(el);M.lab=el}
mons.push(M);if(NET.on&&NET.host&&!S.building&&S.mode==='zone')nsend({t:'spawn',zk:zkey(),id:M.id,type,x:+x.toFixed(1),z:+z.toFixed(1),rare:!!o.rare});return M}
function wake(M){if(!M||M.aggro)return;if(M.boss&&OBJ&&!OBJ.done&&OBJ.barrier)return;if(M.boss){music('boss');banner(M.name,'Умения: '+M.kit.filter(k=>k!=='enrage').map(k=>BOSS_SK[k]).join(' · '),'boss');S.shake=.35;snd(70,1.2,'sawtooth',.14,.6)}M.aggro=true;if(M.D.sk){const a=M.c.play('Skeletons_Awaken_Standing',{once:true,ts:1.6,restart:true});M.wake=a?a.getClip().duration/1.6*.8:0;const p=M.g.position;burst({x:p.x,y:.3,z:p.z},'#6a5a4a',12,2.5,.5,.8,.6,-3)}}

/* ================= ALLIES ================= */
function summon(id,lvl){const sk=SKILLS[id],p=sk.p;for(const a of allies.filter(a=>a.src===id)){a.hp=0}
for(let i=0;i<p.count;i++){const c=makeChar(p.model,{tint:p.tint,ghost:p.ghost,eyes:'#7aff5a',show:p.model==='knight'?['1H_Sword','Round_Shield','Knight_Helmet']:[]});if(p.model==='skeleton_minion')c.attach('handslot.r','Skeleton_Blade',1);
const g=new THREE.Group();const hp0=H.g.position;g.position.set(hp0.x+rand(-2,2),0,hp0.z+rand(-2,2));c.root.scale.setScalar(p.sc);g.add(c.root);const[bg,fg]=hpBar(g,2.5*p.sc+.3,hpAllyM);dyn.add(g);
const max=ST.hp*.5*p.hp*(1+.15*(lvl-1));allies.push({g,c,src:id,hp:max,max,m:p.dmg*(1+.15*(lvl-1)),spd:5,range:1.8,atkT:0,face:0,poison:p.poison,bg,fg,kind:'minion',lockT:0});burst({x:g.position.x,y:1,z:g.position.z},p.tint,30,3,.4,.8,2)}}
function spawnTotem(sk,lvl,ctx){for(const a of allies.filter(a=>a.kind==='totem'))a.hp=0;const g=new THREE.Group();const p=H.g.position;g.position.set(p.x+Math.sin(H.face)*1.8,0,p.z+Math.cos(H.face)*1.8);
const col=prop('column',1.6);g.add(col);const top=new THREE.Mesh(new THREE.SphereGeometry(.35,12,8),new THREE.MeshBasicMaterial({color:new THREE.Color('#ff8a4a').multiplyScalar(3),toneMapped:false}));top.position.y=2.4;g.add(top);dyn.add(g);
allies.push({g,kind:'totem',hp:1e9,max:1e9,life:sk.p.dur,int:sk.p.int,t:.5,r:sk.p.r,ctx,top})}
function updAllies(dt){const hp=H.g.position;for(let i=allies.length-1;i>=0;i--){const a=allies[i],q=a.g.position;
if(a.kind==='totem'){a.life-=dt;a.t-=dt;a.top.position.y=2.4+Math.sin(time*4)*.1;if(a.t<=0){a.t=a.int;const R=a.r*(1+(ST.aoeP+ST.slamR)/100);aoeHit(q.x,q.z,R,a.ctx);ringFx(q.x,q.z,R,'#ff9a4a',.35);burst({x:q.x,y:.3,z:q.z},'#c8a070',18,4,.4,.5,1.2);S.shake=Math.max(S.shake,.05)}
if(a.life<=0){burst({x:q.x,y:1,z:q.z},'#ff9a4a',30,4);dyn.remove(a.g);allies.splice(i,1)}continue}
if(a.hp<=0){burst({x:q.x,y:1,z:q.z},'#9fd0ff',25,3);dyn.remove(a.g);a.c.mats.forEach(x=>x.dispose());allies.splice(i,1);continue}
a.bg.visible=a.fg.visible=a.hp<a.max;a.fg.scale.x=1.24*Math.max(0,a.hp/a.max);
let best=null,bd=12;for(const M of mons){if(M.dead)continue;const d=Math.hypot(M.g.position.x-q.x,M.g.position.z-q.z);if(d<bd&&Math.hypot(M.g.position.x-hp.x,M.g.position.z-hp.z)<16){bd=d;best=M}}
a.atkT-=dt;a.c.lock-=dt;let mv=false;
if(best){const dx=best.g.position.x-q.x,dz=best.g.position.z-q.z;a.face=Math.atan2(dx,dz);if(bd>a.range+best.r){q.x+=dx/bd*a.spd*dt;q.z+=dz/bd*a.spd*dt;mv=true}else if(a.atkT<=0&&a.c.lock<=0){a.atkT=1.1;a.c.play(a.c.clips['1H_Melee_Attack_Chop']?'1H_Melee_Attack_Chop':'1H_Melee_Attack_Slice_Diagonal',{once:true,restart:true,ts:1.4});
const ctx={m:a.m,el:a.poison?'chaos':'phys',melee:1,ally:1,poison:a.poison};setTimeout(()=>{if(!best.dead)dealDmg(best,ctx)},250)}}
else{const dx=hp.x-q.x,dz=hp.z-q.z,d=Math.hypot(dx,dz);if(d>3.5){q.x+=dx/d*a.spd*1.2*dt;q.z+=dz/d*a.spd*1.2*dt;a.face=Math.atan2(dx,dz);mv=true}if(d>30){q.x=hp.x+1;q.z=hp.z+1}}
if(a.c.lock<=0)a.c.play(mv?(a.c.clips['Running_B']?'Running_B':'Running_A'):'Idle');a.c.root.rotation.y=angLerp(a.c.root.rotation.y,a.face,.2);collide(q,.4);a.c.mixer.update(dt)}}

/* ================= FX ================= */
function ringFx(x,z,R,hex,dur=.4,w=.15){const m=new THREE.Mesh(new THREE.RingGeometry(1-w,1,64).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color(hex).multiplyScalar(3),transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));m.position.set(x,.12,z);scene.add(m);rings.push({m,t:0,dur,R});if(R>=2.5&&Q!=='low'){const c=C3(hex),n=Math.min(70,Math.round(R*7));for(let i=0;i<n;i++){const a=i/n*6.283+rand(0,.2),r=R*rand(.15,1);emit(x+Math.cos(a)*r*.3,rand(.2,.6),z+Math.sin(a)*r*.3,Math.cos(a)*r/dur*.7,rand(1,3.5),Math.sin(a)*r/dur*.7,rand(.35,.7),rand(.28,.5),c[0],c[1],c[2],2,2)}}}
function arcFx(x,z,face,R,arcDeg,hex){const a=arcDeg*Math.PI/180;const m=new THREE.Mesh(new THREE.RingGeometry(R*.55,R,32,1,-a/2,a).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color(hex).multiplyScalar(2.2),transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false,side:THREE.DoubleSide}));
m.position.set(x,.9,z);m.rotation.y=face-Math.PI/2;scene.add(m);rings.push({m,t:0,dur:.22,R:0,arc:1})}
function decal(x,z,R,dur=4,tex=scorchTex,col=null){const mt=new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,opacity:1});if(col){mt.color.set(col);mt.blending=THREE.AdditiveBlending}const m=new THREE.Mesh(new THREE.PlaneGeometry(R*2,R*2).rotateX(-Math.PI/2),mt);m.position.set(x,.03,z);m.rotation.y=rand(0,6);scene.add(m);const d={m,t:dur,d:dur};decals.push(d);return d}
function updFx(dt){for(let i=rings.length-1;i>=0;i--){const f=rings[i];f.t+=dt;const k=f.t/f.dur,e=1-Math.pow(1-Math.min(1,k),3);if(!f.arc)f.m.scale.setScalar(.2+f.R*e);else f.m.scale.setScalar(.8+.3*e);f.m.material.opacity=Math.max(0,1-k);if(k>=1){scene.remove(f.m);f.m.geometry.dispose();f.m.material.dispose();rings.splice(i,1)}}
for(let i=decals.length-1;i>=0;i--){const d=decals[i];d.t-=dt;d.m.material.opacity=Math.min(1,d.t/d.d*2);if(d.t<=0){scene.remove(d.m);d.m.geometry.dispose();d.m.material.dispose();decals.splice(i,1)}}
for(let i=bolts2.length-1;i>=0;i--){const b=bolts2[i];b.t-=dt;b.m.material.opacity=Math.max(0,b.t/.18);if(b.t<=0){scene.remove(b.m);b.m.geometry.dispose();b.m.material.dispose();bolts2.splice(i,1)}}
for(const f of flashes){if(f.t>0){f.t-=dt;f.l.intensity=f.i*Math.max(0,f.t/f.d)}else f.l.intensity=0}}
function lightning(a,b,hex='#f4f07a'){const pts=[];const n=8;for(let i=0;i<=n;i++){const t=i/n;pts.push(new THREE.Vector3(lerp(a.x,b.x,t)+(i%n?rand(-.35,.35):0),lerp(a.y,b.y,t)+(i%n?rand(-.3,.3):0),lerp(a.z,b.z,t)+(i%n?rand(-.35,.35):0)))}
const m=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:new THREE.Color(hex).multiplyScalar(4),transparent:true,toneMapped:false}));scene.add(m);bolts2.push({m,t:.18})}
const nums=[];for(let i=0;i<44;i++){const el=document.createElement('div');el.className='num';el.style.display='none';$('nums').appendChild(el);nums.push({el,t:0,p:new THREE.Vector3(),on:false,vx:0})}
let numI=0;function num(p,txt,cls=''){const n=nums[numI++%nums.length];n.on=true;n.t=0;n.p.copy(p);n.vx=rand(-.8,.8);n.el.className='num '+cls;n.el.textContent=txt;n.el.style.display='block'}
const pv=new THREE.Vector3();function proj(p,out){pv.copy(p).project(camera);out.x=(pv.x*.5+.5)*innerWidth;out.y=(-pv.y*.5+.5)*innerHeight;return pv.z<1&&pv.z>-1}
const sp={x:0,y:0};
function updNums(dt){for(const n of nums){if(!n.on)continue;n.t+=dt;n.p.y+=dt*(2.2-n.t*2);n.p.x+=n.vx*dt;if(n.t>1||!proj(n.p,sp)){n.on=false;n.el.style.display='none';continue}
const s=n.t<.12?.6+n.t/.12*.7:1.3-Math.min(.3,(n.t-.12)*1.2);n.el.style.transform=`translate(${sp.x}px,${sp.y}px) translate(-50%,-50%) scale(${s})`;n.el.style.opacity=1-Math.max(0,n.t-.6)*2.5}}
let toastT=0;function toast(t,d=3){const e=$('toast');e.textContent=t;e.classList.add('on');toastT=d}
let AC=null,master;
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.4;master.connect(AC.destination)}catch(e){AC=null}}
function snd(f,d,type='sine',v=.15,sl=0){if(!AC)return;try{const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(sl)o.frequency.exponentialRampToValueAtTime(Math.max(30,f*sl),t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(master);o.start(t);o.stop(t+d+.05)}catch(e){}}
function noise(d,v=.15,f=800){if(!AC)return;try{const t=AC.currentTime,b=AC.createBuffer(1,Math.max(1,AC.sampleRate*d|0),AC.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=(Math.random()*2-1)*(1-i/a.length);const s=AC.createBufferSource();s.buffer=b;const fl=AC.createBiquadFilter();fl.type='lowpass';fl.frequency.value=f;const g=AC.createGain();g.gain.value=v;s.connect(fl).connect(g).connect(master);s.start(t)}catch(e){}}

/* ================= DAMAGE ================= */
function rollCtx(ctx){const c=Math.random()*100<ST.crit;const base=(ctx.flat??rand(ST.min,ST.max)*ctx.m)*(ctx.sup||1);return{d:base*(1+inc(ST,ctx.el,ctx)/100)*(c?ST.critM/100:1),c}}
function dealDmg(M,ctx,dd){if(M.dead||ctx.ghost)return;if(M.boss&&OBJ&&!OBJ.done){if(!ctx.dot&&Math.random()<.3)num(M.g.position.clone().setY(2.6*M.sc),'неуязвим','');return}let d,c=false;if(dd!==undefined)d=dd;else{const r=rollCtx(ctx);d=r.d;c=r.c}
if(ST.execute&&M.hp<M.max*.35)d*=1+ST.execute/100;if(M.st.shock>0)d*=1.2;if(M.D.block&&!ctx.dot&&Math.random()<M.D.block){d*=.4;num(M.g.position.clone().setY(2.6*M.sc),'блок','')}
M.hp-=d;if(!ctx.dot&&M.rm&&M.rm.includes('thorns')&&!ctx.ally&&!ctx.fromPeer&&Math.random()<.35)hurtHero(Math.min(d*.06,M.dmg*.5),null);if(!ctx.dot){M.flash=1;wake(M);for(const o of mons)if(!o.aggro&&o.g.position.distanceTo(M.g.position)<9)wake(o);
const p=M.g.position.clone();p.y=2.3*M.sc;num(p,Math.round(d)+(c?'!':''),(c?'crit ':'')+'e-'+(ctx.el||'phys'));if(ST.leech&&!ctx.ally&&!ctx.fromPeer)H.hp=Math.min(ST.hp,H.hp+d*ST.leech/100);applyStatus(M,ctx,d)}
else{M.dotAcc+=d}
if(isGuest()){if(!ctx.dot||dd!==undefined)nsend({t:'hit',zk:zkey(),id:M.id,d:Math.round(d*10)/10,el:ctx.el,ig:ctx.ignite?1:0,st:ctx.stun?1:0,po:ctx.poison?1:0,bl:ctx.bleed?1:0});if(M.hp<1)M.hp=1}
else if(M.hp<=0)killMon(M);else if(!ctx.dot&&!M.boss&&M.c.lock<=0&&Math.random()<.3&&M.c.clips['Hit_A'])M.c.play('Hit_A',{once:true,ts:1.4,restart:true,lockK:.7})}
function applyStatus(M,ctx,d){const s=M.st;const el=ctx.el;
if(el==='fire'&&(ctx.ignite||Math.random()*100<ST.burnCh+(mod('fire')?0:0)))s.burn={dps:d*.3,t:3};
if(el==='cold')s.chill=2.2;if(el==='light'&&Math.random()*100<25+ST.shockCh)s.shock=3;
if(el==='chaos'||ctx.poison)s.poison.push({dps:d*.22,t:4*(1+ST.poisonDur/100)});if(s.poison.length>12)s.poison.shift();
if((el==='phys'&&Math.random()*100<ST.bleed)||ctx.bleed)s.bleed={dps:d*.3,t:4};
if(ctx.stun||Math.random()*100<ST.stunCh+(ctx.stunCh||0))s.stun=M.boss?.3:1.1}
function aoeHit(x,z,R,ctx,f){let n=0;for(const M of mons.slice())if(!M.dead&&Math.hypot(M.g.position.x-x,M.g.position.z-z)<R+M.r){dealDmg(M,ctx);n++;f&&f(M)}return n}
function killMon(M){if(M.dead)return;M.dead=.01;if(M.lab){M.lab.remove();M.lab=null}if(NET.on&&NET.host&&!M.netKill)nsend({t:'kill',zk:zkey(),id:M.id});if(M.silent){M.dead=2.9;return}if(M.leader&&OBJ){const e=OBJ.ents.find(e=>e.M===M);if(e&&!e.done){e.done=true;objStep(M.g.position)}}const L=S.L,p=M.g.position.clone();p.y=1.2;M.c.play(M.c.clips['Death_C_Skeletons']?'Death_C_Skeletons':'Death_A',{once:true,restart:true,ts:1.2});
burst(p,M.boss?S.th.eyes:M.rare?'#ffd84a':'#d8cfb4',M.boss?70:22,M.boss?8:4.5,.4,.8,1.6);flash(p,M.boss?S.th.eyes:'#ffb060',M.boss?120:25,.35);noise(.25,.12,1600);snd(M.boss?90:170,.3,'sawtooth',.05,.4);
if(M.rm.includes('fiery')&&!isGuest())tele(p.x,p.z,3,.6,M.dmg*1.5,'#ff5a1a');
if(M.D.burst&&!isGuest())tele(p.x,p.z,2.4,.7,M.dmg*1.6,'#7aff3a');
if(M.rm.includes('volatile')&&!isGuest())for(let i=0;i<3;i++){const a=i*2.1+rand(0,1);tele(p.x+Math.cos(a)*2.5,p.z+Math.sin(a)*2.5,2.2,1+i*.25,M.dmg*1.3,'#ffb03a')}
if(ST.spreadPoison&&M.st.poison.length){for(const o of mons)if(o!==M&&!o.dead&&o.g.position.distanceTo(M.g.position)<4.5){o.st.poison.push(...M.st.poison.map(x=>({dps:x.dps,t:x.t})));burst(o.g.position.clone().setY(1),'#7aff5a',6,2)}}
gainXp(Math.round(M.D.xp*(6+L*4)*(M.rare?4:M.magic?1.8:1)*(M.boss?12:1)));deathFx(M,p);riftKill(p);if(M.ess){dropEss(p,M.ess);if(Math.random()<.35)dropEss(p,M.ess)}if(M.rare&&!M.boss&&!(S.slow>0))S.slow=.14;if(!M.netKill||true){csAdd('k');if(M.rare)csAdd('r');if(M.boss){csAdd('b');if(S.zi<0&&!S.pin&&!S.abyss)csAdd('m')}}H.flask=Math.min(3,H.flask+(M.rare?1:M.boss?3:.25));
const q=1+(S.mods.reduce((a,m)=>a+m.q,0)+(S.zi<0?atlasBonus()+(atl('iiq')?15:0):0))/100,rr=ST.rarity+(S.zi<0?[0,10,25][S.mapRar|0]:0),gm=1+ST.gold/100;
if(S.zi<0){const t=S.map;const ch=(M.boss?1:M.rare?.1:.012)*(atl('maps')?1.4:1);if(Math.random()<ch*q)dropMap(p,genMap(Math.max(1,Math.min(MAXT,t+(Math.random()<.35?1:0)-(Math.random()<.2?1:0)))));if(M.boss&&Math.random()<.45)dropMap(p,genMap(Math.min(MAXT,t+1)));if(M.boss&&!S.pin&&t>=4&&Math.random()<.35*(atl('frag')?1.5:1))dropFrag(p);if(M.boss&&atl('boss')){dropItem(p,genItem(L+1,2,rr));dropItem(p,genItem(L+1,2,rr))}if(M.boss&&S.pin)pinReward(p)}
else if(M.boss&&S.zi===7&&!P.atlasGift){P.atlasGift=1;for(let i=0;i<3;i++)dropMap(p,genMap(1))}
if(M.boss){if(Math.random()<.35*(atl('div')?2:1))dropDiv(p);if(S.zi>=0&&Math.random()<.22){const U=UNIQUES.find(u=>u.n===BOSS_U[S.zi]);if(U)dropItem(p,makeUnique(U,L+1))}if(Math.random()<.5)dropGem(p);for(let i=0;i<5;i++)dropItem(p,genItem(L+1,i===0?2:1,rr));for(let i=0;i<3;i++)dropOrb(p);dropGold(p,Math.round(L*rand(40,70)*gm));S.shake=.8;S.slow=1.1;haptic('heavy');bossDown()}
else if(M.rare){if(Math.random()<.06*q*(atl('div')?2:1))dropDiv(p);if(Math.random()<.12*q)dropGem(p);dropItem(p,genItem(L,1,rr));dropItem(p,genItem(L,1,rr));if(Math.random()<.5)dropItem(p,genItem(L,2,rr));if(Math.random()<.5*q)dropOrb(p);dropGold(p,Math.round(L*rand(10,20)*gm))}
else{const mg=M.magic?2.5:1;if(Math.random()<.004*q*mg)dropGem(p);if(Math.random()<.005*q*mg*(atl('div')?2:1))dropDiv(p);if(Math.random()<.18*q*mg)dropItem(p,genItem(L,M.magic?1:0,rr));if(Math.random()<.06*q*mg)dropOrb(p);if(Math.random()<.45)dropGold(p,Math.round(L*rand(2,6)*gm))}}
function hurtHero(d,src){if(H.inv>0||S.mode!=='zone'||H.leap)return;if(src&&src.name)H.lastHit=src.name;const dr=ST.armor/(ST.armor+40+S.L*25);d*=(1-dr)*(1+ST.dmgTaken/100);
if(H.es>0){const a=Math.min(H.es,d);H.es-=a;d-=a;if(a>0)burst(H.g.position.clone().setY(1.4),'#7fb8ff',4,2,.3,.3,2)}
if(src&&ST.reflect&&src.hp>0&&!src.dead&&Math.hypot(src.g.position.x-H.g.position.x,src.g.position.z-H.g.position.z)<4)dealDmg(src,{el:'phys',dot:0,m:0,flat:0},d*ST.reflect/100*4+1);
H.hp-=d;const p=H.g.position.clone();p.y=2.6;if(d>=1)num(p,'-'+Math.round(d),'hurt');S.shake=Math.max(S.shake,.12);S.hurtV=1;noise(.12,.1,500);if(d>ST.hp*.12)haptic(d>ST.hp*.25?'heavy':'medium');
if(H.hp<=0){if(H.immortal>0){H.hp=1}else{H.hp=0;die()}}}
function enemyHitAlly(a,d){a.hp-=d;burst(a.g.position.clone().setY(1.2),'#ff5a4a',5,2,.25,.3,1.5)}
function gainXp(x){P.xp+=x;while(P.xp>=need(P.lvl)){P.xp-=need(P.lvl);P.lvl++;P.spts++;P.ppts++;recalc();H.hp=ST.hp;H.mana=ST.mana*(1-ST.reserve);const p=H.g.position.clone();p.y=2.8;num(p,'Уровень '+P.lvl,'lvl');
ringFx(H.g.position.x,H.g.position.z,5,'#ffd774',.8,.1);for(let i=0;i<70;i++){const a=rand(0,6.28),r=rand(0,1.2);emit(H.g.position.x+Math.cos(a)*r,rand(0,.5),H.g.position.z+Math.sin(a)*r,0,rand(3,7),0,rand(.8,1.5),rand(.2,.45),3,2.2,.8,0,.5)}
flash(H.g.position,'#ffd774',60,.8);snd(523,.15,'triangle',.15);setTimeout(()=>snd(784,.3,'triangle',.15),120);toast((touch?'Новый уровень! Есть очко умений и пассивное очко.':'Новый уровень! Есть очко умений (K) и пассивное очко (P).'),4)}}

/* ================= HERO SKILLS ================= */
const ANIM={cast:'Spellcast_Shoot',raise:'Spellcast_Raise',long:'Spellcast_Long',summon:'Spellcast_Summon',buff:'Use_Item',cry:'Cheer',throw:'Throw',stab:'1H_Melee_Attack_Stab',bash:'Block_Attack',leap:'Jump_Full_Short',spin:'2H_Melee_Attack_Spinning'};
function animFor(k){const two=P.eq.weapon&&WBASE[P.eq.weapon.wb].hands===2;
if(k==='melee')return two?pick(['2H_Melee_Attack_Slice','2H_Melee_Attack_Chop']):pick(['1H_Melee_Attack_Slice_Diagonal','1H_Melee_Attack_Slice_Horizontal','1H_Melee_Attack_Chop']);
if(k==='slam')return P.cls==='mage'||P.cls==='rogue'?'Spellcast_Raise':'2H_Melee_Attack_Chop';if(k==='shoot')return two?'2H_Ranged_Shoot':'1H_Ranged_Shoot';
if(k==='cast'&&P.cls!=='mage')return P.cls==='rogue'?'1H_Ranged_Shoot':'1H_Melee_Attack_Chop';if(k==='spin'&&P.cls==='mage')return 'Spellcast_Long';return ANIM[k]||'Spellcast_Shoot'}
function nearest(range=14,from=H.g.position){let best=null,bd=range;for(const M of mons){if(M.dead)continue;const d=Math.hypot(M.g.position.x-from.x,M.g.position.z-from.z);if(d<bd){bd=d;best=M}}return best}
function aimAt(M){const p=H.g.position;if(M){H.faceT=Math.atan2(M.g.position.x-p.x,M.g.position.z-p.z);H.face=H.faceT;H.aimT=.45}return H.face}
const clipDur=n=>{const c=H.c.clips[n];return c?c.duration:.8};
function hUpper(n,ts=1.6){if(H.fullT>0)return;H.c.playL('U',n,{once:true,restart:true,ts,fade:.08});H.upT=clipDur(n)/ts*.92;if(!H.moving){H.c.playL('L',n,{once:true,restart:true,ts,fade:.08});H.legT=H.upT}}
function hFull(n,ts=1.6,k=.9,loop=false){H.c.playL('U',n,{once:!loop,restart:true,ts,fade:.08});H.c.playL('L',n,{once:!loop,restart:true,ts,fade:.08});H.fullT=loop?.2:clipDur(n)/ts*k;H.upT=H.legT=0}
function heroAnim(k,ts=1.6){hUpper(animFor(k),ts);H.castT=0;H.aimT=.45}
function heroLoco(dt,moving){H.upT-=dt;H.legT-=dt;if(H.fullT>0){H.fullT-=dt;return}if(H.whirl){const n=animFor('spin');H.c.playL('U',n,{ts:1.5});H.c.playL('L',n,{ts:1.5});return}
const idle=P.eq.weapon&&WBASE[P.eq.weapon.wb].hands===2&&!CLASSES[P.cls].ranged?'2H_Melee_Idle':'Idle';const run='Running_A',rts=ST.speed/6.2*1.05;
if(moving)H.c.playL('L',run,{ts:rts});else if(H.legT<=0)H.c.playL('L',idle);
if(H.upT<=0){if(moving)H.c.playL('U',run,{ts:rts});else H.c.playL('U',idle)}}
const projGeo=new THREE.SphereGeometry(.16,10,8),arrowGeo=new THREE.CylinderGeometry(.035,.035,.9,5).rotateX(Math.PI/2),waveGeo=new THREE.RingGeometry(.6,1,24,1,Math.PI*.15,Math.PI*.7);
const PMAT={};const pmat=hex=>PMAT[hex]||(PMAT[hex]=new THREE.MeshBasicMaterial({color:new THREE.Color(hex).multiplyScalar(5),toneMapped:false}));
const arrowMat=new THREE.MeshStandardMaterial({color:'#4a3420',metalness:.2});
function makeProjMesh(el,o){let m;const col=EL[el].c;
if(o.axe){m=prop(P&&P.cls==='barbarian'?'Skeleton_Axe':'Skeleton_Axe',1.1);m.userData.spin=1}
else if(o.wave){m=new THREE.Mesh(waveGeo,new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(3),transparent:true,opacity:.85,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));m.rotation.x=-Math.PI/2;const g=new THREE.Group();g.add(m);m=g;m.userData.wave=1}
else if(o.arrow){m=new THREE.Mesh(arrowGeo,el==='phys'?arrowMat:pmat(col))}
else{m=new THREE.Mesh(projGeo,pmat(col))}
m.scale.multiplyScalar(o.size||1);return m}
function spawnProj(from,dir,o){const m=makeProjMesh(o.el,o);m.position.copy(from);if(!m.userData.wave)m.lookAt(from.x+dir.x,from.y,from.z+dir.z);else m.rotation.y=Math.atan2(dir.x,dir.z);scene.add(m);
projs.push({m,v:dir.clone().multiplyScalar(o.speed),life:o.life||1,ctx:o.ctx,pierce:o.pierce||0,hit:new Set(),explode:o.explode||0,el:o.el,wobble:o.wobble,team:o.team||'hero',orb:o.orb,tick:0,dmg:o.dmg,size:o.size||1,col:EL[o.el].c,trail:!o.arrow||o.el!=='phys'})}
let CUR_SUP=1,CUR_MX=1;
function castProj(sk,lvl,M,o={}){const p=H.g.position,face=aimAt(M);const n=(sk.p.n||1)+ST.projAdd;const spread=(sk.p.spread||(n>1?20+n*4:0))*Math.PI/180;
const ctx={sup:CUR_SUP,m:sk.m+sk.mL*(lvl-1),el:sk.el,proj:1,ignite:sk.el==='fire'&&ST.burnCh>=100};
for(let i=0;i<n;i++){const a=face+(n>1?(sk.p.spread>=360?i/n*Math.PI*2:-spread/2+spread*i/(n-1)):0);const dir=new THREE.Vector3(Math.sin(a),0,Math.cos(a));
spawnProj(new THREE.Vector3(p.x+dir.x*.7,1.4,p.z+dir.z*.7),dir,{el:sk.el,speed:sk.p.speed,life:sk.p.life||1.1,pierce:(sk.p.pierce||0)+ST.pierce,explode:sk.p.explode,size:sk.p.size,wobble:sk.p.wobble,ctx,arrow:P.cls==='rogue'&&!sk.p.axe&&sk.el!=='fire'&&sk.el!=='chaos'?1:sk.el==='phys'&&!sk.p.axe&&!sk.p.wave,axe:sk.p.axe,wave:sk.p.wave})}}
function castSkill(i){const id=P&&P.slots[i];const sp=id&&supOf(id);if(!sp)return castSkill0(i);const st0=ST;ST=sp.st;CUR_SUP=sp.more;CUR_MX=sp.mx;try{castSkill0(i)}finally{ST=st0;CUR_SUP=1;CUR_MX=1}}
function castSkill0(i){if(S.mode!=='zone'||S.paused||H.leap||H.charge)return;const id=P.slots[i];if(!id)return;const sk=SKILLS[id];const lvl=skLvl(id);if(!lvl)return;
if(sk.kind==='aura'){const k=P.auraOff.indexOf(id);if(k>=0)P.auraOff.splice(k,1);else P.auraOff.push(id);recalc();toast(sk.n+(k>=0?': включена':': выключена'),1.4);return}
if(H.cds[i]>0)return;const cost=Math.round((sk.mana||0)*(1+.08*(lvl-1))*CUR_MX);
if(ST.bloodMagic){if(H.hp<=cost+1){toast('Мало здоровья',1);return}H.hp-=cost}else{if(H.mana<cost){toast('Не хватает маны',1);return}H.mana-=cost}
if(sk.p&&sk.p.hpCost){H.hp=Math.max(1,H.hp-ST.hp*sk.p.hpCost)}
H.cds[i]=(sk.cd||0)/(1+ST.cdr/100);H.cdMax=H.cdMax||[1,1,1];H.cdMax[i]=Math.max(.01,H.cds[i]);H.lastCast=.35;
const M=nearest(sk.p&&sk.p.range||15),p=H.g.position;const ctx={sup:CUR_SUP,m:(sk.m||0)+(sk.mL||0)*(lvl-1),el:sk.el,melee:['cone','whirl','leap','charge','slam','shadow','wave'].includes(sk.kind),stun:sk.p&&sk.p.stun,stunCh:sk.p&&sk.p.stunCh,bleed:sk.p&&sk.p.bleed,ignite:sk.el==='fire'&&ST.burnCh>=100};
const aoe=1+ST.aoeP/100,ec=EL[sk.el||'phys'].c;if(NET.on){const tg=M?M.g.position:{x:p.x+Math.sin(H.face)*6,z:p.z+Math.cos(H.face)*6};nsend({t:'cast',zk:zkey(),sk:id,f:+(M?Math.atan2(M.g.position.x-p.x,M.g.position.z-p.z):H.face).toFixed(2),tx:+tg.x.toFixed(1),tz:+tg.z.toFixed(1)})}
switch(sk.kind){
case'proj':heroAnim(sk.a,1.8);castProj(sk,lvl,M);snd(sk.el==='fire'?320:600,.12,'triangle',.06,1.6);break;
case'nova':{heroAnim(sk.a,2);const R=sk.p.r*aoe*(1+(sk.p.bleed?0:0));novaFx(p.x,p.z,R,ec);aoeHit(p.x,p.z,R,ctx);break}
case'aoe':{heroAnim(sk.a,2);const cnt=sk.p.count||1;const tgts=cnt>1&&sk.p.spread>5?mons.filter(m=>!m.dead&&m.g.position.distanceTo(p)<sk.p.spread+6):[];
for(let k=0;k<cnt;k++){let tx,tz;if(tgts.length&&sk.p.spread>5){const t=pick(tgts);tx=t.g.position.x+rand(-1,1);tz=t.g.position.z+rand(-1,1)}else{const c=M?M.g.position:{x:p.x+Math.sin(H.face)*6,z:p.z+Math.cos(H.face)*6};tx=c.x+(k?rand(-sk.p.spread,sk.p.spread):0);tz=c.z+(k?rand(-sk.p.spread,sk.p.spread):0)}
queueAoe(tx,tz,sk.p.r*aoe,(sk.p.delay||.3)+(cnt>1?k*.12:0),ctx,sk)}break}
case'ground':{heroAnim(sk.a,2);const c=M?M.g.position:{x:p.x+Math.sin(H.face)*5,z:p.z+Math.cos(H.face)*5};addGround(sk.p.heal?p.x:c.x,sk.p.heal?p.z:c.z,sk.p.r*aoe,sk.p.dur,ctx,sk);break}
case'chain':{heroAnim(sk.a,2);if(!M){toast('Нет цели',.8);break}let from=p.clone().setY(1.5),cur=M;const hit=new Set();const n=sk.p.chains+ST.chainAdd+1;
for(let k=0;k<n&&cur;k++){hit.add(cur);const to=cur.g.position.clone().setY(1.2*cur.sc);lightning(from,to);dealDmg(cur,ctx);burst(to,'#f4f07a',6,3,.25,.3,2.5);from=to;let nb=null,nd=8;for(const o of mons){if(o.dead||hit.has(o))continue;const d=o.g.position.distanceTo(cur.g.position);if(d<nd){nd=d;nb=o}}cur=nb}
flash(p,'#f4f07a',25,.15);noise(.12,.1,3000);break}
case'cone':{const hits=sk.p.hits||1;aimAt(M);for(let k=0;k<hits;k++)H.queue.push({t:k*.16,f:()=>{heroAnim(sk.a,2.2);const R=sk.p.r*aoe;arcFx(p.x,p.z,H.face,R,sk.p.arc,sk.el==='holy'?'#fff2b0':'#e8e0d0');noise(.08,.08,2500);
let n=0;for(const m of mons.slice()){if(m.dead)continue;const dx=m.g.position.x-p.x,dz=m.g.position.z-p.z,d=Math.hypot(dx,dz);if(d>R+m.r)continue;if(Math.abs(wrapA(Math.atan2(dx,dz)-H.face))>sk.p.arc*Math.PI/360&&d>m.r+.6)continue;dealDmg(m,ctx);n++}if(n)S.shake=Math.max(S.shake,.06)}});break}
case'slam':{heroAnim(sk.a,1.6);const fx=p.x+Math.sin(H.face)*1.4,fz=p.z+Math.cos(H.face)*1.4;H.queue.push({t:.22,f:()=>{slamAt(fx,fz,sk.p.r*(1+(ST.aoeP+ST.slamR)/100),ctx,ec);if(sk.p.after)H.queue.push({t:.6,f:()=>slamAt(fx,fz,sk.p.r*1.25*(1+(ST.aoeP+ST.slamR)/100),{...ctx,m:ctx.m*.6},ec)})}});break}
case'wave':{heroAnim(sk.a,1.8);const dx=Math.sin(aimAt(M)),dz=Math.cos(H.face);const R=sk.p.r*(1+(ST.aoeP+ST.slamR)/100);for(let k=1;k*sk.p.step<=sk.p.len;k++){const x=p.x+dx*k*sk.p.step,z=p.z+dz*k*sk.p.step;H.queue.push({t:.15+k*.05,f:()=>{aoeHit(x,z,R,ctx);burst({x,y:.2,z},'#a08060',10,4,.45,.5,1,-9);ringFx(x,z,R,'#c8a070',.3);decal(x,z,R*.9,2.5)}})}S.shake=.15;break}
case'whirl':H.whirl={t:sk.p.dur,tick:0,int:sk.p.tick,r:sk.p.r*aoe,ctx,ec};break;
case'leap':{const tgt=M||{g:{position:new THREE.Vector3(p.x+Math.sin(H.face)*7,0,p.z+Math.cos(H.face)*7)}};aimAt(M);const to=tgt.g.position;const d=Math.hypot(to.x-p.x,to.z-p.z),k=Math.max(0,(d-1)/d);
H.leap={sx:p.x,sz:p.z,tx:p.x+(to.x-p.x)*k,tz:p.z+(to.z-p.z)*k,t:0,dur:.55,ctx,r:sk.p.r*(1+(ST.aoeP+ST.slamR)/100),ec};hFull('Jump_Full_Short',2.1,.9);H.inv=.6;break}
case'charge':{aimAt(M);H.charge={dx:Math.sin(H.face),dz:Math.cos(H.face),t:sk.p.dist/24,ctx,hit:new Set()};hFull(animFor('bash'),1.4,.8);H.inv=.4;break}
case'shadow':{if(!M){toast('Нет цели',.8);break}const q=M.g.position,dx=q.x-p.x,dz=q.z-p.z,d=Math.hypot(dx,dz)||1;burst(p.clone().setY(1),'#5a3a7a',24,3,.5,.6,1.2,0);
p.x=q.x+dx/d*1.3;p.z=q.z+dz/d*1.3;collide(p,.45);H.faceT=H.face=Math.atan2(q.x-p.x,q.z-p.z);burst(p.clone().setY(1),'#5a3a7a',24,3,.5,.6,1.2,0);heroAnim('stab',2);H.queue.push({t:.12,f:()=>{dealDmg(M,ctx);burst(M.g.position.clone().setY(1.2),'#b070ff',14,4,.3,.4,2.5)}});noise(.15,.1,1500);break}
case'barrage':{if(!M){toast('Нет цели',.8);break}aimAt(M);H.barrage={n:sk.p.n+ST.projAdd*2,int:sk.p.int,t:0,M,ctx,sk};break}
case'orb':{heroAnim(sk.a,1.8);const dir=new THREE.Vector3(Math.sin(aimAt(M)),0,Math.cos(H.face));spawnProj(new THREE.Vector3(p.x+dir.x,1.5,p.z+dir.z),dir,{el:'light',speed:sk.p.speed,life:sk.p.life,pierce:999,size:3,ctx,orb:{r:sk.p.r*aoe,int:sk.p.tick}});break}
case'buff':{heroAnim(sk.a,1.6);const k=1+.15*(lvl-1);const st={};if(sk.p.st)for(const key in sk.p.st)st[key]=sk.p.st[key]*(sk.p.st[key]<0&&key!=='dmgTaken'?1:k);
H.buffs=H.buffs.filter(b=>b.id!==id);H.buffs.push({id,t:sk.p.dur*(1+.05*(lvl-1)),st,n:sk.n});if(sk.p.shield)H.es=ST.hp*sk.p.shield*k;if(sk.p.immortal)H.immortal=sk.p.dur;if(sk.p.heal)H.hp=Math.min(ST.hp,H.hp+ST.hp*sk.p.heal);
if(sk.p.blind)for(const m of mons)if(!m.dead&&m.g.position.distanceTo(p)<7){m.st.blind=sk.p.blind;burst(m.g.position.clone().setY(1.5),'#888',6,1.5,.6,1,.6,0)}
recalc();ringFx(p.x,p.z,2.5,sk.p.shield?'#7fb8ff':sk.p.immortal?'#ff5a3a':'#ffd774',.5);for(let j=0;j<30;j++){const a=rand(0,6.28);emit(p.x+Math.cos(a)*.8,rand(.1,2),p.z+Math.sin(a)*.8,0,rand(1,2.5),0,.8,.3,...C3(sk.p.shield?'#7fb8ff':'#ffd774').map(v=>v*2),0,1)}snd(400,.4,'triangle',.1,1.5);break}
case'warcry':{heroAnim('cry',1.6);const R=sk.p.r*aoe;ringFx(p.x,p.z,R,'#ffd774',.5,.25);ringFx(p.x,p.z,R*.6,'#ff9a4a',.4,.2);S.shake=.25;noise(.4,.2,300);snd(150,.5,'sawtooth',.1,.6);
for(const m of mons)if(!m.dead&&m.g.position.distanceTo(p)<R){wake(m);m.st.stun=Math.max(m.st.stun,m.boss?.4:1.6)}const k=1+.15*(lvl-1);const st={};for(const key in sk.p.st)st[key]=sk.p.st[key]*k;H.buffs=H.buffs.filter(b=>b.id!==id);H.buffs.push({id,t:sk.p.dur,st,n:sk.n});recalc();break}
case'summon':heroAnim('summon',1.8);summon(id,lvl);snd(220,.6,'sine',.1,2);break;
case'trap':{heroAnim('throw',2);const tx=p.x+Math.sin(aimAt(M))*3,tz=p.z+Math.cos(H.face)*3;const m=prop(sk.p.cloud?'skull':'coin_stack_small',sk.p.cloud?.5:.4);m.position.set(tx,0,tz);scene.add(m);
traps.push({m,x:tx,z:tz,arm:.5,r:sk.p.r*aoe,ctx,cloud:sk.p.cloud,sk,life:15});break}
case'totem':heroAnim('cast',1.6);spawnTotem(sk,lvl,ctx);break}}
function novaFx(x,z,R,ec){ringFx(x,z,R,ec,.45,.18);ringFx(x,z,R*.75,'#ffffff',.35,.08);decal(x,z,R*.8,3);flash({x,y:0,z},ec,90,.45);S.shake=Math.max(S.shake,.18);
const[r,g,b]=C3(ec);for(let i=0;i<110;i++){const a=rand(0,6.28),s=rand(R*1.4,R*2.4);emit(x+Math.cos(a)*.6,rand(.2,.8),z+Math.sin(a)*.6,Math.cos(a)*s,rand(.5,2.5),Math.sin(a)*s,rand(.35,.6),rand(.4,.8),r*3,g*3,b*3,1,3.2)}noise(.5,.2,700)}
function slamAt(x,z,R,ctx,ec){aoeHit(x,z,R,ctx);ringFx(x,z,R,'#e8c890',.4,.2);decal(x,z,R,3);flash({x,y:0,z},'#ffc880',40,.3);S.shake=Math.max(S.shake,.3);noise(.4,.25,350);
for(let i=0;i<60;i++){const a=rand(0,6.28),v=rand(2,6);emit(x+Math.cos(a)*rand(0,R*.8),.2,z+Math.sin(a)*rand(0,R*.8),Math.cos(a)*v*.4,rand(2,6),Math.sin(a)*v*.4,rand(.4,.8),rand(.4,.8),1.4,1.1,.7,-12,1)}}
function queueAoe(x,z,R,delay,ctx,sk){const el=sk.el;let m=null;
if(sk.p.meteor){m=new THREE.Mesh(new THREE.SphereGeometry(.6,12,8),pmat('#ff7a2a'));m.position.set(x+4,14,z+2);scene.add(m)}
if(sk.p.hammer){m=prop('Skeleton_Axe',1.6);m.position.set(x,6,z);scene.add(m)}
const mark=new THREE.Mesh(new THREE.RingGeometry(R*.9,R,40).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color(EL[el].c).multiplyScalar(1.5),transparent:true,opacity:.5,toneMapped:false,depthWrite:false}));mark.position.set(x,.06,z);scene.add(mark);
pending.push({x,z,r:R,t:delay,T:delay,ctx,m,mark,sk,arrows:sk.p.arrows})}
function addGround(x,z,R,dur,ctx,sk){const col=EL[sk.el].c;const d=decal(x,z,R,dur,poolTex,new THREE.Color(col).multiplyScalar(sk.el==='holy'?.22:.5));grounds.push({x,z,r:R,t:dur,tick:0,ctx:{...ctx,m:ctx.m*.5,dotG:1},heal:sk.p.heal,blizz:sk.p.blizzard,col,team:'hero'})}

/* ================= BASIC ATTACK ================= */
function basicAttack(M,moving){const C=CLASSES[P.cls],p=H.g.position;if(NET.on)nsend({t:'ba',zk:zkey(),f:+H.face.toFixed(2),tx:+M.g.position.x.toFixed(1),tz:+M.g.position.z.toFixed(1)});const ctx={m:1,el:C.basicEl,melee:!C.ranged,proj:!!C.ranged};
if(C.ranged){const dir=new THREE.Vector3(M.g.position.x-p.x,0,M.g.position.z-p.z).normalize();spawnProj(new THREE.Vector3(p.x+dir.x*.6,1.5,p.z+dir.z*.6),dir,{el:C.basicEl,speed:P.cls==='rogue'?32:24,life:.8,ctx,arrow:P.cls==='rogue',size:1});
aimAt(M);hUpper(P.cls==='mage'?'Spellcast_Shoot':animFor('shoot'),clamp(ST.aps/1.3,1,2.6)*1.5);snd(P.cls==='rogue'?900:rand(650,760),.07,P.cls==='rogue'?'square':'triangle',.04,1.6)}
else{aimAt(M);hUpper(animFor('melee'),clamp(ST.aps/1.2,1,2.4)*1.5);H.queue.push({t:.15,f:()=>{if(M.dead)return;arcFx(p.x,p.z,H.face,ST.range+.6,100,'#e8e0d0');
for(const m of mons.slice()){if(m.dead)continue;const dx=m.g.position.x-p.x,dz=m.g.position.z-p.z,d=Math.hypot(dx,dz);if(d<ST.range+m.r+.3&&(m===M||Math.abs(wrapA(Math.atan2(dx,dz)-H.face))<.9))dealDmg(m,ctx)}noise(.07,.06,2800)}})}}
function dash(){if(S.mode==='town'){interact();return}if(S.mode!=='zone'||H.dashCd>0||S.paused||H.leap)return;H.dashCd=2.5/(1+ST.dashCd/100);H.dashMax=H.dashCd;H.inv=.35;const ix=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0)+joy.dx,iz=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0)+joy.dy;const a=Math.hypot(ix,iz)>.15?Math.atan2(ix,iz):H.face;H.face=H.faceT=a;H.whirl=null;
hFull('Dodge_Forward',1.7,.95);H.dashV={x:Math.sin(a)*16,z:Math.cos(a)*16,t:.4};snd(420,.2,'sine',.1,2);noise(.2,.08,2500);H.target=null}
function flask(){if(S.mode!=='zone'||S.paused)return;if(H.flask<1){toast('Флакон пуст. Он наполняется от убийств.',1.5);return}const mm=ST.mana*(1-ST.reserve);if(H.hp>=ST.hp&&H.mana>=mm*.9)return;H.flask-=1;H.healT=1.5;H.healR=ST.hp*.55/1.5;H.mana=Math.min(mm,H.mana+mm*.4);H.buffs=H.buffs.filter(b=>b.n!=='Ртуть');H.buffs.push({n:'Ртуть',t:3,st:{move:25}});recalc();snd(300,.3,'sine',.12,1.8);
for(let i=0;i<30;i++){const a=rand(0,6.28);emit(H.g.position.x+Math.cos(a)*.6,rand(.2,1.6),H.g.position.z+Math.sin(a)*.6,0,rand(1,2.5),0,rand(.6,1),.3,.4,2.4,.6,0,1)}}

/* ================= HERO LOOK ================= */
const weaponMats={};
/* ---- свечение заточки: +1..5 мерцание, +6 аура, +10 лучи ---- */
const ENCH=new Set();let _gTex=null,_rTex=null;
function gTex(){if(_gTex)return _gTex;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.25,'rgba(255,255,255,.55)');g.addColorStop(.6,'rgba(255,255,255,.12)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);_gTex=new THREE.CanvasTexture(c);_gTex.colorSpace=THREE.SRGBColorSpace;return _gTex}
function rTex(){if(_rTex)return _rTex;const W=32,Hh=256,c=document.createElement('canvas');c.width=W;c.height=Hh;const x=c.getContext('2d');const im=x.createImageData(W,Hh);
for(let y=0;y<Hh;y++){const v=1-Math.abs(y-Hh/2)/(Hh/2);const a=Math.pow(v,2.2);for(let i=0;i<W;i++){const u=(i-W/2)/(W/2);const b=Math.exp(-u*u*9)*a;const o=(y*W+i)*4;im.data[o]=im.data[o+1]=im.data[o+2]=255;im.data[o+3]=Math.round(255*b)}}
x.putImageData(im,0,0);_rTex=new THREE.CanvasTexture(c);_rTex.colorSpace=THREE.SRGBColorSpace;return _rTex}
const ENCH_COL=r=>r===3?'#ff9a3a':r===2?'#ffd84a':r===1?'#7fa6ff':'#b5ccff';
function clearEnchant(mesh){const fx=mesh&&mesh.userData.ench;if(!fx)return;if(fx.g.parent)fx.g.parent.remove(fx.g);fx.g.traverse(o=>{if(o.material)o.material.dispose()});ENCH.delete(fx);mesh.userData.ench=null}
function setEnchant(mesh,upg,rar){if(!mesh)return;upg=upg|0;const fx0=mesh.userData.ench;if(fx0&&fx0.upg===upg&&fx0.rar===rar)return;clearEnchant(mesh);
if(!mesh.userData.baseMat)mesh.userData.baseMat=mesh.material;
if(upg<=0&&rar<2){mesh.material=mesh.userData.baseMat;return}
const col=new THREE.Color(ENCH_COL(rar));const m=mesh.userData.baseMat.clone();m.emissive=col.clone();m.emissiveIntensity=.25;mesh.material=m;
mesh.geometry.computeBoundingBox();const bb=mesh.geometry.boundingBox,c=bb.getCenter(new THREE.Vector3()),sz=bb.getSize(new THREE.Vector3());
const L=Math.max(sz.x,sz.y,sz.z),ax=sz.y>=sz.x&&sz.y>=sz.z?new THREE.Vector3(0,1,0):sz.x>=sz.z?new THREE.Vector3(1,0,0):new THREE.Vector3(0,0,1);
const g=new THREE.Group();g.position.copy(c);mesh.add(g);const fx={mesh,mat:m,g,upg,rar,col,L,c,ax,lo:bb.min.clone(),hi:bb.max.clone(),aura:[],rays:[],core:null,ph:Math.random()*6.28,acc:0};
const sm=(map,o,colr)=>new THREE.Sprite(new THREE.SpriteMaterial({map,color:colr||col,transparent:true,opacity:o,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true}));
if(upg>=6){for(let i=0;i<3;i++){const s=sm(gTex(),.3);s.position.copy(ax).multiplyScalar((i-1)*L*.32);s.scale.setScalar(L*.62);s.renderOrder=5;g.add(s);fx.aura.push(s)}}
if(upg>=10){const wc=col.clone().lerp(new THREE.Color('#ffffff'),.45);fx.core=sm(gTex(),.7,wc);fx.core.scale.setScalar(L*.55);fx.core.renderOrder=6;g.add(fx.core);
for(let i=0;i<5;i++){const s=sm(rTex(),.6,wc);s.material.rotation=i*Math.PI/5;s.scale.set(L*.07,L*1.5,1);s.renderOrder=6;g.add(s);fx.rays.push(s)}}
mesh.userData.ench=fx;ENCH.add(fx)}
const _ev=new THREE.Vector3();
function vis(o){for(;o;o=o.parent)if(!o.visible)return false;return true}
function updEnchant(dt){const t=performance.now()/1000;for(const fx of ENCH){if(!fx.mesh.parent||!vis(fx.mesh))continue;const u=fx.upg,ph=fx.ph;
fx.mat.emissiveIntensity=u>0?(.18+u*.055)+Math.sin(t*(2+u*.18)+ph)*(.08+u*.022)+Math.sin(t*7.3+ph*2)*.03*Math.min(u,5):.25;
fx.aura.forEach((s,i)=>{const k=.5+.5*Math.sin(t*1.8+i*2.1+ph);s.material.opacity=(.26+.04*(u-6))*(.65+.35*k);s.scale.setScalar(fx.L*(.62+.14*k))});
if(fx.core){const k=.5+.5*Math.sin(t*2.6+ph);fx.core.material.opacity=.45+.25*k;fx.core.scale.setScalar(fx.L*(.48+.1*k));
fx.rays.forEach((s,i)=>{const d=i%2?1:-1;s.material.rotation=i*Math.PI/5+t*.28*d;const k2=.5+.5*Math.sin(t*1.6+i*1.37+ph);s.scale.set(fx.L*(.05+.03*k2),fx.L*(1.05+.75*k2),1);s.material.opacity=.3+.45*k2})}
if(u>=3&&(Q!=='low'||Math.random()<.5)){fx.acc+=dt*(u<6?u*.8:u<10?u*2.2:u*3.5);while(fx.acc>1){fx.acc-=1;const a=Math.random();_ev.set(lerp(fx.lo.x,fx.hi.x,Math.random()),lerp(fx.lo.y,fx.hi.y,Math.random()),lerp(fx.lo.z,fx.hi.z,Math.random()));fx.mesh.localToWorld(_ev);
const c=u>=10&&a<.4?[1,1,.95]:[fx.col.r,fx.col.g,fx.col.b];emit(_ev.x,_ev.y,_ev.z,rand(-.25,.25),rand(.2,.9),rand(-.25,.25),rand(.45,.9),u>=10?rand(.1,.18):rand(.06,.12),c[0],c[1],c[2],0,1.5)}}}}
function heroLook(){if(!H.c)return;const C=CLASSES[P.cls],ms=H.c.meshes,w=P.eq.weapon,o=P.eq.offhand;for(const n of ALLW)if(ms[n])ms[n].visible=false;
const glowUp=(mesh,it)=>{if(!mesh||!it)return;setEnchant(mesh,it.upg,it.rar)};for(const n of ALLW)if(ms[n]&&ms[n].userData.ench&&!(w&&WBASE[w.wb].mesh===n)&&!(o&&o.mesh===n))setEnchant(ms[n],0,0);
if(w){const mn=WBASE[w.wb].mesh;if(ms[mn]){ms[mn].visible=true;glowUp(ms[mn],w)}}
if(o&&!(w&&WBASE[w.wb].hands===2)&&ms[o.mesh]){ms[o.mesh].visible=true;glowUp(ms[o.mesh],o)}
if(C.hat&&ms[C.hat])ms[C.hat].visible=!!P.eq.helmet;
if(C.cape&&ms[C.cape]){const ch=P.eq.chest;ms[C.cape].visible=!!ch;if(ch){if(!ms[C.cape].userData.baseMat)ms[C.cape].userData.baseMat=ms[C.cape].material;const m=ms[C.cape].userData.baseMat.clone();m.color.lerp(new THREE.Color(['#bbbbbb','#6a7aff','#e8c040','#e0702a'][ch.rar]),.55);ms[C.cape].material=m}}}

/* ================= ITEMS ================= */
const ORB_K=Object.keys(ORBS);
function itemPool(slot){return Object.keys(AFF).filter(k=>AFF[k].s.includes(slot))}
function addAff(it){const have=it.aff.map(a=>a.k);const pool=itemPool(it.slot).filter(k=>!have.includes(k));if(!pool.length)return false;const k=pick(pool);const[a,b]=AFF[k].r(it.ilvl);it.aff.push({k,v:a+(b-a)*Math.random()});return true}
function rollAff(it,n){it.aff=[];for(let i=0;i<n;i++)addAff(it)}
function nameIt(it){const MS=['силы','пламени','жизни','ворона','бури','теней','рассвета','волка','стужи','гнева'],RA=['Гибель','Шёпот','Клык','Пепел','Зов','Коготь','Слеза','Венец','Жало','Плач','Рок','Дар'],RB=['Ворона','Бездны','Тлена','Бури','Мёртвых','Зари','Змея','Короля','Волков','Луны','Ночи'];
it.name=it.rar===1?it.base+' '+pick(MS):it.rar===2?pick(RA)+' '+pick(RB):it.rar===0?it.base:it.name}
function genItem(l,minR=0,rarity=0,forceSlot){const C=CLASSES[P.cls];const r=Math.random()*(1-Math.min(.5,rarity/200));
if(r<.012&&!forceSlot){const pool=UNIQUES.filter(u=>!u.wb||WBASE[u.wb].cls===P.cls);return makeUnique(pick(pool),l)}
let rar=r<.17?2:r<.55?1:0;rar=Math.max(rar,minR);const slot=forceSlot||wpick([['weapon',16],['offhand',9],['helmet',11],['chest',11],['gloves',11],['boots',11],['ring',12],['amulet',9]]);
const it={id:uid++,slot,rar,ilvl:l,upg:0,aff:[]};
if(slot==='weapon'){const wb=pick(C.weapons),W=WBASE[wb];it.wb=wb;it.base=W.n;it.dmg=[Math.round((W.dmg[0]+W.dmg[1]*l)*rand(.85,1.15)),Math.round((W.dmg[2]+W.dmg[3]*l)*rand(.85,1.15))]}
else if(slot==='offhand'){const ob=P.cls==='barbarian'&&Math.random()<.5?'baxe':C.off,O=OBASE[ob];it.ob=ob;it.base=O.n;it.mesh=pick(O.mesh);it.imp={k:O.imp.k,v:Math.round((O.imp.a+O.imp.b*l)*rand(.85,1.15)*10)/10};if(O.imp.k==='armor')it.armor=0}
else{const B=ABASE[slot];it.base=pick(B.n);if(B.arm)it.armor=Math.round((B.arm[0]+B.arm[1]*l)*rand(.85,1.15))}
rollAff(it,[0,ri(1,2),ri(3,4)][rar]);nameIt(it);return it}
const price=it=>Math.round((4+it.ilvl*3)*[1,2.2,5,14][it.rar]*(1+it.upg*.4));
const upCost=it=>Math.round(15*it.ilvl*Math.pow(it.upg+1,1.7));
const upChance=it=>[100,100,100,90,80,65,50,40,30,20][it.upg]||0;
function applyOrb(k,it){const o=P.orbs;if(!(o[k]>0))return 'Нет сферы';if(it.corr)return 'Осквернённую вещь нельзя изменить';if(k==='vaal'){o[k]--;return vaal(it)}if(it.rar===3)return 'На уникальные вещи сферы не действуют';
const ok={trans:it.rar===0,alt:it.rar===1,aug:it.rar===1&&it.aff.length<2,regal:it.rar===1,chaos:it.rar===2,exalt:it.rar===2&&it.aff.length<6,divine:it.rar>=1,scour:it.rar>=1}[k];if(!ok)return 'Эта сфера не подходит к этой вещи';
o[k]--;if(k==='trans'){it.rar=1;rollAff(it,ri(1,2));nameIt(it)}else if(k==='alt'){rollAff(it,ri(1,2));nameIt(it)}else if(k==='aug')addAff(it);else if(k==='regal'){it.rar=2;addAff(it);nameIt(it)}
else if(k==='chaos'){rollAff(it,ri(3,5));nameIt(it)}else if(k==='exalt')addAff(it);else if(k==='divine'){for(const a of it.aff){const[x,y]=AFF[a.k].r(it.ilvl);a.v=x+(y-x)*Math.random()}}else if(k==='scour'){it.rar=0;it.aff=[];it.name=it.base}
snd(500,.25,'triangle',.12,2);return null}

/* ================= LOOT ================= */
const gemG=new THREE.OctahedronGeometry(.22,0),orbG=new THREE.SphereGeometry(.18,12,10);
const RCH=['#d6d2c8','#8ea2ff','#ffe36b','#d8782e'],RN=['Обычный','Магический','Редкий','Уникальный'];
function lootObj(p,el,o){const x=p.x+rand(-1.8,1.8),z=p.z+rand(-1.8,1.8),g=new THREE.Group();g.position.set(p.x,1,p.z);dyn.add(g);$('labels').appendChild(el);el.style.display='none';
const l=Object.assign({g,el,pos:g.position,fly:{t:0,sx:p.x,sz:p.z,tx:x,tz:z}},o);el.onclick=()=>{H.target=new THREE.Vector3(l.fly.tx,0,l.fly.tz);H.pick=l};loot.push(l);return l}
function dropItem(p,it){const up=P&&isUpg(it);if(P&&!up&&((P.lf>=1&&it.rar===0)||(P.lf>=2&&it.rar===1))){return dropGold(p,Math.max(1,Math.round(price(it)*.6)))}
const el=document.createElement('div');el.className='loot t'+it.rar;el.style.color=RCH[it.rar];el.innerHTML=(up?'<b class="lup">▲</b>':'')+itIcon(it)+esc(it.name)+(it.upg?' +'+it.upg:'');const l=lootObj(p,el,{it,hi:it.rar>=2||up});
const col=new THREE.Color(RCH[it.rar]);const gem=new THREE.Mesh(gemG,new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:it.rar>=2?2.5:1.2,roughness:.3,metalness:.3}));gem.position.y=.35;l.g.add(gem);l.gem=gem;
if(it.rar>=2){const b=new THREE.Mesh(new THREE.CylinderGeometry(.18,.45,9,12,1,true),new THREE.MeshBasicMaterial({color:col.clone().multiplyScalar(2),map:beamTex,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));b.position.y=4.5;b.scale.y=.01;l.g.add(b);l.beam=b}
if(it.rar===3){haptic('ok');chime([523,784,1047,1568],.11);l.beam&&(l.beam.scale.x=l.beam.scale.z=1.6)}else if(it.rar===2)chime([660,990],.08)}
function layoutLoot(){const V=loot.filter(l=>l.vis);V.sort((a,b)=>(b.hi|0)-(a.hi|0)||a.sy-b.sy);const placed=[];
for(const l of V){if(!l.w){l.el.style.display='block';l.w=l.el.offsetWidth||90;l.h=l.el.offsetHeight||18}let y=l.sy,tries=0;const x0=l.sx-l.w/2,x1=l.sx+l.w/2;
for(;tries<14;tries++){const hit=placed.find(q=>x0<q.x1&&x1>q.x0&&y-l.h<q.y&&y>q.y-q.h);if(!hit)break;y=hit.y-hit.h-2}
placed.push({x0,x1,y,h:l.h});l.el.style.display='block';l.el.style.transform=`translate(${l.sx}px,${y}px) translate(-50%,-100%)`}}
function chime(fs,v){fs.forEach((f,i)=>setTimeout(()=>snd(f,.45,'triangle',v,1.6),i*85))}
function dropOrb(p){const k=wpick(ORB_K.map(k=>[k,ORBS[k].w]));const el=document.createElement('div');el.className='loot o';el.innerHTML=uiI('orb:'+k,ORBS[k].c)+esc(ORBS[k].n);const l=lootObj(p,el,{orb:k});
const m=new THREE.Mesh(orbG,new THREE.MeshStandardMaterial({color:ORBS[k].c,emissive:ORBS[k].c,emissiveIntensity:1.6,roughness:.2,metalness:.5}));m.position.y=.3;l.g.add(m);l.gem=m;
const hi={exalt:3,divine:3,chaos:2,regal:2}[k]||0;if(hi){el.classList.add('h'+hi);l.hi=true;const col=new THREE.Color(hi===3?'#fff6d8':'#ffd36a');const b=new THREE.Mesh(new THREE.CylinderGeometry(.16,.4,9,12,1,true),new THREE.MeshBasicMaterial({color:col.clone().multiplyScalar(2),map:beamTex,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));b.position.y=4.5;b.scale.y=.01;l.g.add(b);l.beam=b;
hi===3?chime([784,1175,1568,2093],.1):chime([880,1320],.07)}else snd(990,.2,'sine',.06,1.3)}
function dropGold(p,a){const el=document.createElement('div');el.className='loot g';el.innerHTML=uiI('gold','#ffd774')+a+' золота';const l=lootObj(p,el,{gold:a});l.g.add(prop('coin_stack_small',.55))}
function tryPick(l){if(l.ess){P.ess=P.ess||{};P.ess[l.ess]=(P.ess[l.ess]||0)+1;toast('Подобрано: '+ESS[l.ess].n+' (используй на верстаке)',2.5);chime([660,990],.08)}else if(l.div){P.cards=P.cards||{};P.cards[l.div]=(P.cards[l.div]||0)+1;const C=DIV.find(c=>c.id===l.div);toast('Гадальная карта: '+C.n+' ('+P.cards[l.div]+'/'+C.need+')',2.5);chime([988,1319,1568],.07)}else if(l.gem2){P.gems=P.gems||{};P.gems[l.gem2]=(P.gems[l.gem2]||0)+1;toast('Камень поддержки: '+SUPP[l.gem2].n+' (вставь в умение)',2.5);chime([660,880,1100],.08)}else if(l.frag){P.frag=(P.frag||0)+1;toast('Фрагмент Тлена ('+P.frag+'/4)',2);chime([440,660,880],.08)}else if(l.mapIt){P.maps=P.maps||[];P.maps.push(l.mapIt);toast('Подобрано: '+l.mapIt.name+' (тир '+l.mapIt.tier+')',1.6);snd(880,.12,'triangle',.08,1.4);burst({x:l.pos.x,y:.4,z:l.pos.z},'#9ad0ff',10,2,.3,.5,2,-2)}else if(l.gold){P.gold+=l.gold;snd(1300,.06,'square',.035);burst({x:l.pos.x,y:.4,z:l.pos.z},'#ffd060',8,2,.25,.4,2,-2)}
else if(l.orb){P.orbs[l.orb]=(P.orbs[l.orb]||0)+1;toast('Подобрано: '+ORBS[l.orb].n,1.4);burst({x:l.pos.x,y:.4,z:l.pos.z},ORBS[l.orb].c,10,2,.3,.5,2,-2);snd(1100,.12,'triangle',.08,1.4)}
else{if(P.bag.length>=36){if(S.bagWarn<=0){toast('Сумка полна. Продай лишнее у торговки.',2);S.bagWarn=3}return}P.bag.push(l.it);if(l.it.rar===3){csAdd('u');P.uSeen=P.uSeen||[];if(!P.uSeen.includes(l.it.name)){P.uSeen.push(l.it.name);toast('Новая уникальная вещь в коллекции: '+l.it.name,3)}}snd(600,.1,'triangle',.08,1.3);burst({x:l.pos.x,y:.5,z:l.pos.z},RCH[l.it.rar],10,2,.3,.5,2,-2);if(l.it.rar>=2)toast('Подобрано: '+l.it.name,1.6)}
l.el.remove();dyn.remove(l.g);loot.splice(loot.indexOf(l),1);if(H.pick===l)H.pick=null}
function openChest(c){c.open=true;if(NET.on)nsend({t:'chest',zk:zkey(),i:chests.indexOf(c)});const p={x:c.x,y:.8,z:c.z};burst(p,'#ffd060',40,5,.35,.9,2);flash(p,'#ffd060',40,.5);snd(330,.15,'triangle',.12);setTimeout(()=>snd(660,.3,'triangle',.12),120);
const n=c.gold?3:ri(1,2);for(let i=0;i<n;i++)dropItem(p,genItem(S.L,c.gold&&i===0?2:0,ST.rarity));if(Math.random()<(c.gold?1:.4))dropOrb(p);dropGold(p,Math.round(S.L*rand(8,18)*(c.gold?3:1)*(1+ST.gold/100)));
c.o.rotation.z=.08;c.o.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.multiplyScalar(.55)}})}

/* ================= MOVEMENT / INPUT ================= */
function collide(p,r){const obs=S.mode==='town'?townObs:zoneObs;for(const o of obs){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz),m=o.r+r;if(d<m&&d>0){p.x=o.x+dx/d*m;p.z=o.z+dz/d*m}}
if(S.mode==='town'){const d=Math.hypot(p.x,p.z);if(d>23){p.x*=23/d;p.z*=23/d}}else{p.x=clamp(p.x,-56,56);p.z=clamp(p.z,-56,56)}}
const K={},joy={id:null,ox:0,oy:0,dx:0,dy:0},mouse={down:false,id:null};
const ray=new THREE.Raycaster(),gp=new THREE.Plane(new THREE.Vector3(0,1,0),0),ndc=new THREE.Vector2(),hitP=new THREE.Vector3();
function groundAt(e){ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);ray.setFromCamera(ndc,camera);return ray.ray.intersectPlane(gp,hitP)?hitP.clone():null}
canvas.addEventListener('pointerdown',e=>{if(S.mode!=='town'&&S.mode!=='zone'||S.paused)return;initAudio();
if(e.pointerType==='mouse'){mouse.down=true;mouse.id=e.pointerId;const g=groundAt(e);if(g){H.target=g;H.pick=null;ringFx(g.x,g.z,.7,'#d8b56a',.3,.25)}}
else if(joy.id===null){joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.dx=joy.dy=0;const j=$('joy');j.style.left=e.clientX+'px';j.style.top=e.clientY+'px';j.style.display='block';$('knob').style.transform=''}
try{canvas.setPointerCapture(e.pointerId)}catch(_){}});
canvas.addEventListener('pointermove',e=>{if(mouse.down&&e.pointerId===mouse.id){const g=groundAt(e);if(g)H.target=g}
if(e.pointerId===joy.id){let dx=e.clientX-joy.ox,dy=e.clientY-joy.oy;const l=Math.hypot(dx,dy);if(l>52){dx*=52/l;dy*=52/l}joy.dx=dx/52;joy.dy=dy/52;$('knob').style.transform=`translate(${dx}px,${dy}px)`}});
const up=e=>{if(e.pointerId===mouse.id)mouse.down=false;if(e.pointerId===joy.id){joy.id=null;joy.dx=joy.dy=0;$('joy').style.display='none'}};
canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
addEventListener('keydown',e=>{if(S.mode!=='town'&&S.mode!=='zone')return;if(e.target&&e.target.tagName==='INPUT'){if(e.code==='Escape')closePanels();return}K[e.code]=true;
if(e.code==='Escape'){closePanels();return}if(e.code==='KeyI')togglePanel('inv');if(e.code==='KeyK')togglePanel('sk');if(e.code==='KeyP')togglePanel('pas');if(e.code==='KeyG')togglePanel('party');if(S.paused)return;
const si={KeyQ:0,Digit1:0,KeyE:1,Digit2:1,KeyR:2,Digit3:2}[e.code];if(si!==undefined)castSkill(si);if(e.code==='Space'){e.preventDefault();dash()}if(e.code==='KeyF'||e.code==='Digit4')flask();if(e.code==='KeyT'&&S.mode==='zone')enterTown();if(e.code==='KeyJ')togglePanel('ch');if(e.code==='Enter'&&S.mode==='town')interact()});
addEventListener('keyup',e=>{K[e.code]=false});
const tap=(el,f)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();initAudio();f();el.classList.add('press');setTimeout(()=>el.classList.remove('press'),120)});el.addEventListener('contextmenu',e=>e.preventDefault())};
for(let i=0;i<3;i++)tap($('s'+i),()=>{if(S.mode==='town'){togglePanel('sk');return}castSkill(i)});tap($('sDash'),dash);tap($('sFlask'),flask);$('bTown').onclick=()=>{if(S.mode==='zone')enterTown()};
$('bParty').onclick=()=>togglePanel('party');$('bInv').onclick=()=>togglePanel('inv');$('bSk').onclick=()=>togglePanel('sk');$('bPas').onclick=()=>togglePanel('pas');
function moveHero(dt){let mx=(K.KeyD||K.ArrowRight?1:0)-(K.KeyA||K.ArrowLeft?1:0)+joy.dx,mz=(K.KeyS||K.ArrowDown?1:0)-(K.KeyW||K.ArrowUp?1:0)+joy.dy;let l=Math.hypot(mx,mz);const p=H.g.position;
if(H.dashV&&H.dashV.t>0){H.dashV.t-=dt;p.x+=H.dashV.x*dt;p.z+=H.dashV.z*dt;collide(p,.45);for(let i=0;i<4;i++)emit(p.x+rand(-.3,.3),rand(.3,1.8),p.z+rand(-.3,.3),0,rand(0,.5),0,.45,.45,.6,1.4,3,0,1);return true}
if(H.leap){const L=H.leap;L.t+=dt;const k=Math.min(1,L.t/L.dur);p.x=lerp(L.sx,L.tx,k);p.z=lerp(L.sz,L.tz,k);H.c.root.position.y=Math.sin(k*Math.PI)*2.6;if(k>=1){H.c.root.position.y=0;H.leap=null;slamAt(p.x,p.z,L.r,L.ctx,L.ec)}return true}
if(H.charge){const c=H.charge;c.t-=dt;p.x+=c.dx*24*dt;p.z+=c.dz*24*dt;collide(p,.45);for(const m of mons)if(!m.dead&&!c.hit.has(m)&&m.g.position.distanceTo(p)<1.6+m.r){c.hit.add(m);dealDmg(m,c.ctx);m.g.position.x+=c.dx*1.5;m.g.position.z+=c.dz*1.5}
emit(p.x,rand(.3,1),p.z,rand(-1,1),rand(0,1),rand(-1,1),.4,.4,1.5,1.3,1,0,1);if(c.t<=0)H.charge=null;return true}
if(l>.08){H.target=null;H.pick=null}else if(H.target){const dx=H.target.x-p.x,dz=H.target.z-p.z,d=Math.hypot(dx,dz);if(d<.3&&!mouse.down)H.target=null;else if(d>.3){mx=dx/d;mz=dz/d;l=1}}
if(l>.08){if(l>1){mx/=l;mz/=l;l=1}const sp=ST.speed*(H.whirl?.75:1)*(mod('chill')?.85:1)*(H.chillT>0?.7:1);p.x+=mx*sp*dt;p.z+=mz*sp*dt;if(!(H.aimT>0))H.faceT=Math.atan2(mx,mz)}
collide(p,.45);return l>.08}

/* ================= UI ================= */
const RC=RCH;
function setPaused(){S.paused=!!S.panel||['ovDead','ovLore','ovTitle','ovLoad','ovClass'].some(x=>$(x).classList.contains('on'))}
function closePanels(){lobbyClose();for(const id of['pInv','pSk','pPas','pPortal','pParty','pShop','pSmith','pStash','pCh'])$(id).classList.remove('on');S.panel=null;S.sel=null;setPaused();save()}
function togglePanel(w,ctx){if(S.mode!=='town'&&S.mode!=='zone')return;if(S.panel===w&&!ctx){closePanels();return}closePanels();S.panel=w;S.ctx=ctx||null;
({inv:()=>{$('pInv').classList.add('on');renderInv()},sk:()=>{$('pSk').classList.add('on');renderSk()},pas:()=>{$('pPas').classList.add('on');renderPas()},portal:()=>{$('pPortal').classList.add('on');renderPortal()},party:()=>{$('pParty').classList.add('on');renderParty()},shop:()=>{$('pShop').classList.add('on');$('pShop').querySelector('header p').textContent=npcQuote('merchant');T.tab=P.bag.length?'sell':'buy';T.tray.clear();T.last=null;T.buySel=null;renderShop()},smith:()=>{$('pSmith').classList.add('on');$('pSmith').querySelector('header p').textContent=npcQuote('smith');T.res=null;renderSmith()},ch:()=>{$('pCh').classList.add('on');renderCh()},stash:()=>{$('pStash').classList.add('on');T.last=null;renderStash()}})[w]();setPaused()}
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closePanels);
document.querySelectorAll('.panel').forEach(p=>p.addEventListener('pointerdown',e=>{if(e.target===p)closePanels()}));
const ICO={weapon:'<path d="M5 20L15.5 9.5"/><circle cx="17.5" cy="6.5" r="3.2"/>',wand:'<path d="M5 20L15.5 9.5"/><circle cx="17.5" cy="6.5" r="3.2"/>',staff:'<path d="M6 21L18 4"/><circle cx="18" cy="4.5" r="2.5"/><path d="M14 6l3 3"/>',
sword:'<path d="M5 19L17 5l2 0 0 2L5 19z"/><path d="M7 14l3 3M4 20l2-2"/>',gsword:'<path d="M4 20L18 4h2v2L6 20z"/><path d="M6 13l5 5M3 21l2-2"/>',xbow:'<path d="M4 12h14M18 12l-3-3M18 12l-3 3"/><path d="M8 5c3 3 3 11 0 14"/>',hxbow:'<path d="M3 12h16M19 12l-3-3M19 12l-3 3"/><path d="M7 3c4 4 4 14 0 18"/>',
axe:'<path d="M6 21L16 6"/><path d="M13 4c4 0 7 3 7 7-3 0-5-1-6-3z"/>',gaxe:'<path d="M5 21L17 5"/><path d="M12 3c5 0 9 4 9 9-4 0-6-2-7-4zM14 6c-4 0-7 2-8 5 3 0 5-1 6-2z"/>',
offhand:'<path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6z"/>',book:'<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M8 4v13"/>',knife:'<path d="M5 19l10-10 4-4-1 5-9 9zM4 20l2-2"/>',baxe:'<path d="M6 21L16 6"/><path d="M13 4c4 0 7 3 7 7-3 0-5-1-6-3z"/>',
helmet:'<path d="M5 16a7 7 0 0 1 14 0v3H5z"/><path d="M12 9v10"/>',chest:'<path d="M8 4L4 7l2 4 2-1v10h8V10l2 1 2-4-4-3-2 2h-4z"/>',gloves:'<path d="M7 21v-8L5 9.5 6.5 8.5 8.5 11V5h2v6V4h2v7V5h2v8l2-2 1.5 1.5L15 21z"/>',boots:'<path d="M8 3h5v11l6 3v3H8z"/>',ring:'<circle cx="12" cy="14.5" r="5.5"/><path d="M10 7l2-3.5L14 7z"/>',amulet:'<path d="M6 3c0 6 3 8.5 6 8.5S18 9 18 3"/><path d="M12 12l4 4-4 5-4-5z"/>'};
const itKey=it=>it.wb?'w:'+it.wb:it.ob?'o:'+it.ob:ABASE[it.slot]?it.slot+':'+Math.max(0,ABASE[it.slot].n.indexOf(it.base)):null;
const itIcon=it=>{const n=IT_IC[itKey(it)];if(n&&GI[n])return `<svg class="gi" viewBox="0 0 512 512">${GI[n]}</svg>`;return itIcon0(it)};
const itIcon0=it=>`<svg viewBox="0 0 24 24">${ICO[it.wb||(it.slot==='offhand'?(OBASE[it.ob]&&it.ob==='book'?'book':it.ob==='knife'?'knife':it.ob==='baxe'?'baxe':'offhand'):it.slot)]||ICO[it.slot]}</svg>`;
const cellHTML=(it,extra='',attr='')=>`<button class="cell ${extra}" ${attr} style="color:${RC[it.rar]};border-color:${RC[it.rar]}66;box-shadow:inset 0 0 12px ${RC[it.rar]}22">${itIcon(it)}${it.upg?`<small>+${it.upg}</small>`:''}</button>`;
const fmt=(v,i)=>i?Math.round(v):Math.round(v*10)/10;
const stLine=(k,v)=>`${v>0?'+':''}${fmt(v,Math.abs(v)>=5)}${STAT_N[k]||' '+k}`;
function itemLines(it){const u=it.upg,m=1+.1*u,L=[];if(it.dmg)L.push(`<li>Урон: ${Math.round(it.dmg[0]*m)}–${Math.round(it.dmg[1]*m)}${it.wb?' · '+WBASE[it.wb].aps+' уд/с · '+(WBASE[it.wb].hands===2?'двуручное':'одноручное'):''}</li>`);
if(it.armor)L.push(`<li>Броня: ${Math.round(it.armor*m)}</li>`);if(it.imp)L.push(`<li>${stLine(it.imp.k,it.imp.v*m)}</li>`);
for(const a of it.aff)L.push(`<li class="aff">${AFF[a.k].t.replace('{v}',fmt(a.v*m,AFF[a.k].i))}</li>`);if(it.st)for(const k in it.st)L.push(`<li class="uq">${k==='bloodMagic'?'':stLine(k,it.st[k])}</li>`);if(it.lore)L.push(`<li class="lore">«${esc(it.lore)}»</li>`);return L.join('')}
function cmpHTML(it){const cur=P.eq[it.slot];const eq=Object.assign({},P.eq,{[it.slot]:it});if(it.slot==='weapon'&&WBASE[it.wb].hands===2)delete eq.offhand;const a=ST,b=calc(eq);
const rows=[['Урон в сек.',b.dps-a.dps,1],['Здоровье',b.hp-a.hp,0],['Броня',b.armor-a.armor,0],['Шанс крита',b.crit-a.crit,1],['Мана',b.mana-a.mana,0]];
const r=rows.filter(x=>Math.abs(x[1])>=.05).map(x=>`<span class="${x[1]>0?'up':'down'}">${x[0]} ${x[1]>0?'+':''}${fmt(x[1],!x[2])}</span>`).join(' · ');return `<div class="cmp">${cur?'Вместо «'+esc(cur.name)+'»: ':'Слот пуст: '}${r||'без изменений'}</div>`}
function selItem(){if(!S.sel)return null;return S.sel.w==='bag'?P.bag[S.sel.k]:S.sel.w==='shop'?S.shop[S.sel.k]:P.eq[S.sel.k]}
function renderInv(){const ctx=S.ctx;$('invT').textContent=ctx==='merchant'?'Торговка Вера':ctx==='smith'?'Кузнец Гром':'Снаряжение';
$('invP').textContent=ctx==='merchant'?'«Покупаю всё, что принесёшь из земель Тлена. И продаю кое-что.»':ctx==='smith'?'«Заточу оружие и броню. Чем выше заточка, тем больше риск.»':'Сферы применяются к выбранной вещи прямо здесь.';
$('eqList').innerHTML='<div class="doll">'+SLOTS.map(s=>{const it=P.eq[s];const sel=S.sel&&S.sel.w==='eq'&&S.sel.k===s;const blocked=s==='offhand'&&P.eq.weapon&&WBASE[P.eq.weapon.wb].hands===2;
const ic=it?cellHTML(it):`<button class="cell" style="color:#4a4650">${(n=>n&&GI[n]?`<svg class="gi" style="filter:none;opacity:.5" viewBox="0 0 512 512">${GI[n]}</svg>`:'')(IT_IC[s==='weapon'?'w:sword':s==='offhand'?'o:shield':s+':0'])}</button>`;
return `<div class="dslot ${sel?'sel':''} ${blocked?'blk':''}" data-eq="${s}" style="grid-area:${s}">${ic}<small>${it?'<b style="color:'+RC[it.rar]+'">'+esc(it.name)+(it.upg?' +'+it.upg:'')+'</b>':blocked?'двуручное':SLOT_N[s]}</small></div>`}).join('')+'</div>';
const s=ST;$('statList').innerHTML=[['Урон',Math.round(s.min)+'–'+Math.round(s.max)],['Урон в сек. (атака)',fmt(s.dps,0)],['Скорость атак',fmt(s.aps,0)+'/с'],['Шанс крита',fmt(s.crit,0)+'%'],['Крит. урон',Math.round(s.critM)+'%'],['Здоровье',Math.round(s.hp)],['Мана',Math.round(s.mana)+(s.reserve?` (резерв ${Math.round(s.reserve*100)}%)`:'')],['Броня',Math.round(s.armor)],
['Огонь / Холод / Молния',`+${Math.round(s.fireP+s.dmgP)}% / +${Math.round(s.coldP+s.dmgP)}% / +${Math.round(s.lightP+s.dmgP)}%`],['Физ. / Яд / Свет',`+${Math.round(s.physP+s.dmgP)}% / +${Math.round(s.chaosP+s.dmgP)}% / +${Math.round(s.holyP+s.dmgP)}%`],['Регенерация',fmt(s.regen,0)+'/с'],['Вампиризм',fmt(s.leech,0)+'%'],['Скорость бега',(s.move>=0?'+':'')+Math.round(s.move)+'%'],['Редкость добычи','+'+Math.round(s.rarity)+'%']].map(x=>`<dt>${x[0]}</dt><dd>${x[1]}</dd>`).join('');
$('orbBar').innerHTML=ORB_K.map(k=>`<span class="orb" title="${ORBS[k].n}: ${ORBS[k].d}" style="--c:${ORBS[k].c}">${uiI('orb:'+k,ORBS[k].c)}${P.orbs[k]||0}</span>`).join('');
$('bagCount').textContent='Сумка '+P.bag.length+'/36 · '+P.gold+' зол.';$('lfBtn').textContent='Фильтр добычи: '+['все вещи','без обычных','только редкие'][P.lf|0];$('sellAll').style.display=ctx==='merchant'?'':'none';$('sellEvery').style.display=ctx==='merchant'?'':'none';
let shop='';if(ctx==='merchant'){shop='<div class="shop"><b>Товары торговки</b><div class="bag">'+S.shop.map((it,i)=>cellHTML(it,S.sel&&S.sel.w==='shop'&&S.sel.k===i?'sel':'',`data-shop="${i}"`)).join('')+'</div><div class="acts">'+
['trans','alt','aug'].map(k=>`<button class="ab alt" data-buyorb="${k}">${uiI('orb:'+k,ORBS[k].c,'width:18px;height:18px;vertical-align:-4px;margin-right:6px')}${ORBS[k].n} · ${orbPrice(k)} зол.</button>`).join('')+'</div></div>'}$('shopBox').innerHTML=shop;
let cells='';for(let i=0;i<36;i++){const it=P.bag[i];const sel=S.sel&&S.sel.w==='bag'&&S.sel.k===i;cells+=it?cellHTML(it,sel?'sel':'',`data-bag="${i}"`):'<button class="cell" disabled style="cursor:default"></button>'}$('bag').innerHTML=cells;
const it=selItem();const d=$('detail');if(!it){d.innerHTML='<p class="muted" style="margin:0">Нажми на вещь в сумке или в снаряжении.</p>';return}
let acts='';const w=S.sel.w;
if(w==='shop'){const pr=price(it)*4;acts+=`<button class="ab" data-a="buy" ${P.gold<pr?'disabled':''}>Купить за ${pr} зол.</button>`}
else{if(w==='bag')acts+=`<button class="ab" data-a="equip">Надеть</button>`;else acts+=`<button class="ab alt" data-a="unequip" ${P.bag.length>=36?'disabled':''}>Снять</button>`;
if(ctx==='merchant'&&w==='bag')acts+=`<button class="ab" data-a="sell">Продать за ${price(it)} зол.</button>`;
if(ctx==='smith'&&!it.corr){if(it.upg<10){const c=upCost(it);acts+=`<button class="ab" data-a="up" ${P.gold<c?'disabled':''}>Заточить до +${it.upg+1} · ${c} зол. · шанс ${upChance(it)}%</button>`}else acts+='<span class="muted">Заточено до предела</span>'}
if(!ctx&&w==='bag')acts+=`<button class="ab alt" data-a="drop">Выбросить</button>`;if(w==='bag'&&NET.on)for(const pr of Object.values(NET.peers).filter(x=>x.cls))acts+=`<button class="ab alt" data-a="gift" data-to="${pr.id}">Передать: ${esc(pr.name)}</button>`;
if(!it.corr)acts+='<div class="orbacts">'+ORB_K.filter(k=>P.orbs[k]>0&&(it.rar<3||k==='vaal')).map(k=>`<button class="ob" data-orb="${k}" style="--c:${ORBS[k].c}" title="${ORBS[k].d}">${uiI('orb:'+k,ORBS[k].c)}${ORBS[k].n} (${P.orbs[k]})</button>`).join('')+'</div>'}
d.innerHTML=`${ttHTML(it)}${w!=='eq'?cmpHTML(it):''}<div class="acts">${acts}</div>`}
const orbPrice=k=>({trans:25,alt:40,aug:60}[k])*Math.max(1,S.L||1);
$('lfBtn').onclick=()=>{P.lf=((P.lf|0)+1)%3;save();renderInv();toast(['Показываются все вещи','Обычные вещи сразу превращаются в золото','Обычные и магические превращаются в золото. Вещи лучше надетых всегда видны'][P.lf],2.6)};
$('pInv').addEventListener('click',e=>{const b=e.target.closest('[data-bag],[data-eq],[data-a],[data-shop],[data-orb],[data-buyorb]');if(!b)return;
if(b.dataset.bag!==undefined){S.sel={w:'bag',k:+b.dataset.bag};renderInv();return}if(b.dataset.shop!==undefined){S.sel={w:'shop',k:+b.dataset.shop};renderInv();return}
if(b.dataset.buyorb){const k=b.dataset.buyorb,pr=orbPrice(k);if(P.gold>=pr){P.gold-=pr;P.orbs[k]=(P.orbs[k]||0)+1;snd(1200,.08,'square',.05)}renderInv();return}
const row=e.target.closest('[data-eq]');if(row&&!b.dataset.a&&!b.dataset.orb){if(P.eq[row.dataset.eq])S.sel={w:'eq',k:row.dataset.eq};renderInv();return}
const it=selItem();if(!it)return;
if(b.dataset.orb){const err=applyOrb(b.dataset.orb,it);if(err)toast(err,2);recalc();save();renderInv();return}
const a=b.dataset.a;
if(a==='equip'){const cur=P.eq[it.slot];if(it.slot==='offhand'&&P.eq.weapon&&WBASE[P.eq.weapon.wb].hands===2){toast('Двуручное оружие занимает обе руки',2);return}
if(it.slot==='weapon'&&WBASE[it.wb].hands===2&&P.eq.offhand){if(P.bag.length>=36){toast('Нет места для второй руки',2);return}P.bag.push(P.eq.offhand);delete P.eq.offhand}
P.eq[it.slot]=it;const idx=P.bag.indexOf(it);if(cur)P.bag[idx]=cur;else P.bag.splice(idx,1);S.sel={w:'eq',k:it.slot};recalc();snd(500,.1,'triangle',.1,1.4)}
else if(a==='unequip'){if(P.bag.length>=36)return;P.bag.push(it);delete P.eq[it.slot];S.sel=null;recalc()}
else if(a==='sell'){P.gold+=price(it);P.bag.splice(S.sel.k,1);S.sel=null;snd(1200,.08,'square',.05)}
else if(a==='buy'){const pr=price(it)*4;if(P.gold<pr||P.bag.length>=36)return;P.gold-=pr;P.bag.push(it);S.shop.splice(S.sel.k,1);S.sel=null;snd(1200,.08,'square',.05)}
else if(a==='drop'){P.bag.splice(S.sel.k,1);S.sel=null}
else if(a==='gift'){const to=e.target.closest('[data-to]').dataset.to;const it2=P.bag[S.sel.k];if(!it2)return;P.bag.splice(S.sel.k,1);S.sel=null;nsend({t:'gift',to,it:it2});toast('Передано: '+it2.name,2)}
else if(a==='up'){const c=upCost(it);if(P.gold<c)return;P.gold-=c;if(Math.random()*100<upChance(it)){it.upg++;toast('Успех! '+it.name+' +'+it.upg,2);snd(660,.12,'triangle',.15);setTimeout(()=>snd(990,.25,'triangle',.15),100);npcChars[1]&&npcChars[1].play('Cheer',{once:true,restart:true})}else{toast('Металл не выдержал. Золото сгорело, вещь цела.',2.5);snd(120,.4,'sawtooth',.12,.5)}recalc()}
save();renderInv()});
$('sellAll').onclick=()=>{let g=0;P.bag=P.bag.filter(it=>{if(it.rar<=1&&it.upg===0){g+=price(it);return false}return true});P.gold+=g;S.sel=null;if(g){toast('Продано на '+g+' зол.',2);snd(1200,.08,'square',.05)}save();renderInv()};
{let armT=0;const se=$('sellEvery');se.onclick=()=>{if(!P.bag.length){toast('Сумка пуста',1.5);return}const now=performance.now();if(now-armT>3000){armT=now;se.textContent='Точно? Ещё раз';setTimeout(()=>{if(performance.now()-armT>=2900)se.textContent='Продать всё'},3000);return}armT=0;se.textContent='Продать всё';let g=0,n=P.bag.length;for(const it of P.bag)g+=price(it);P.bag=[];P.gold+=g;S.sel=null;toast('Продано '+n+' предм. на '+g+' зол.',2);snd(1200,.08,'square',.05);save();renderInv()}}

// ----- skills panel
const KIND_N={proj:'Снаряд',nova:'Область',aoe:'Область',ground:'Зона',chain:'Цепь',cone:'Удар',slam:'Удар о землю',wave:'Волна',whirl:'Вращение',leap:'Прыжок',charge:'Рывок',shadow:'Телепорт',barrage:'Шквал',orb:'Сфера',buff:'Усиление',warcry:'Клич',aura:'Аура',summon:'Призыв',trap:'Ловушка',totem:'Тотем',mod:'Пассивное'};
const KIND_I={proj:'<path d="M4 12h12M12 7l5 5-5 5"/>',nova:'<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-dasharray="3 2.5"/>',aoe:'<circle cx="12" cy="13" r="6"/><path d="M12 2v6"/>',ground:'<path d="M3 17c3-2 6 2 9 0s6-2 9 0M3 13c3-2 6 2 9 0s6-2 9 0"/>',chain:'<path d="M13 2L5 13h6l-2 9 9-12h-6z"/>',cone:'<path d="M4 20L20 8M6 12c4-6 10-7 14-4"/>',slam:'<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',wave:'<path d="M3 18l4-4 3 3 4-6 3 3 4-6"/>',whirl:'<path d="M12 12m-2 0a2 2 0 1 0 4 0 4 4 0 1 0-8 0 6 6 0 1 0 12 0"/>',leap:'<path d="M4 18c3-12 13-12 16 0"/><path d="M18 14l2 4 3-2"/>',charge:'<path d="M3 12h10M9 8l4 4-4 4M15 5v14"/>',shadow:'<circle cx="12" cy="9" r="4"/><path d="M5 21c1-5 13-5 14 0"/>',barrage:'<path d="M3 7h10M3 12h12M3 17h10M13 4l4 3-4 3"/>',orb:'<circle cx="12" cy="12" r="5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',buff:'<path d="M12 3l7 3v6c0 5-3 8-7 9-4-1-7-4-7-9V6z"/>',warcry:'<path d="M12 4v10M12 18v2M6 6l-2-2M18 6l2-2"/>',aura:'<circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="9"/>',summon:'<circle cx="12" cy="7" r="3"/><path d="M6 21v-4a6 6 0 0 1 12 0v4"/>',trap:'<path d="M12 4l9 16H3z"/>',totem:'<path d="M9 21V5h6v16M7 5h10"/>',mod:'<path d="M12 3v18M3 12h18"/>'};
for(const k in SKILLS)SKILLS[k]._k=k;
{const f=$('sFlask'),d=$('sDash');f.querySelector('svg').outerHTML=uiI('flask','#ff6a5a');d.querySelector('svg').outerHTML=uiI('dash','#8fc0ff');for(const [id,k] of [['bParty','party'],['bInv','inv'],['bSk','sk'],['bPas','pas'],['bCh','ch'],['bTown','town']]){const b=$(id);if(b)b.insertAdjacentHTML('afterbegin',uiI(k,'#e8c98a','width:16px;height:16px;vertical-align:-3px;margin-right:5px;filter:none'))}const g=$('gold');if(g){g.removeAttribute('id');g.innerHTML=uiI('gold','#ffd774','width:16px;height:16px;vertical-align:-3px;margin-right:4px;filter:none')+'<span id="gold">'+g.textContent+'</span>'}}
const skIcon=sk=>{const n=SK_IC[sk._k];if(n&&GI[n]){const c=sk.el?EL[sk.el].c:sk.kind==='mod'?'#c9c3b8':'#ffd774';return `<svg class="gi" viewBox="0 0 512 512" style="color:${c}">${GI[n]}</svg>`}return skIcon0(sk)};
const skIcon0=sk=>`<svg viewBox="0 0 24 24" fill="none" stroke="${sk.el?EL[sk.el].c:sk.kind==='aura'?'#ffd774':sk.kind==='mod'?'#bbb':'#ffd774'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${KIND_I[sk.kind]}</svg>`;
function skNums(id,lv){const sk=SKILLS[id];if(!lv)lv=1;const out=[];if(sk.m)out.push('Урон '+Math.round((sk.m+sk.mL*(lv-1))*100)+'% от оружия');if(sk.mana)out.push('Мана '+Math.round(sk.mana*(1+.08*(lv-1))));if(sk.cd)out.push('Перезарядка '+sk.cd+'с');
if(sk.kind==='mod')out.push(Object.entries(sk.st).map(([k,v])=>stLine(k,v*lv)).join(', '));if(sk.kind==='aura')out.push('Резерв 25% маны');if(sk.el)out.push(EL[sk.el].n);return out.join(' · ')}
const branchList=(cls,b)=>Object.keys(SKILLS).filter(id=>SKILLS[id].c===cls&&SKILLS[id].b===b);
function skAvail(id){const sk=SKILLS[id];const br=branchList(sk.c,sk.b);const idx=br.indexOf(id);const prevOk=idx===0||(P.sk[br[idx-1]]||0)>0;return P.lvl>=sk.req&&prevOk}
function renderSk(){const C=CLASSES[P.cls];$('skP').textContent=`Очков умений: ${P.spts}. Активных умений с собой: 3 (Q, E, R) + рывок. Каждое следующее умение ветки открывается после изучения предыдущего.`;
$('slotRow').innerHTML=[0,1,2].map(i=>{const id=P.slots[i],sk=id&&SKILLS[id];return `<div class="slotc">${sk?skIcon(sk):''}<div><small>${['Q','E','R'][i]}</small><b>${sk?sk.n:'пусто'}</b></div></div>`}).join('');
$('skCols').innerHTML=C.branches.map((bn,b)=>`<section><h4>${bn}</h4>`+branchList(P.cls,b).map(id=>{const sk=SKILLS[id],lv=P.sk[id]||0,max=sk.max||5,av=skAvail(id),act=sk.kind!=='mod';
return `<div class="skc ${lv?'on':''} ${av?'':'lock'}"><div class="skh">${skIcon(sk)}<div><b>${sk.n}</b><small>${KIND_N[sk.kind]} · ур. ${sk.req}+</small></div><button class="ab" data-up="${id}" ${P.spts&&av&&lv<max?'':'disabled'} aria-label="Изучить">+</button></div>
<div class="pips">${'◆'.repeat(lv)}${'◇'.repeat(max-lv)}</div><p>${sk.d}</p><p class="nums">${skNums(id,Math.max(1,lv))}</p>${act&&lv&&sk.kind!=='aura'?sockHTML(id):''}${act&&lv?`<div class="slotbtns">${[0,1,2].map(i=>`<button class="sb ${P.slots[i]===id?'on':''}" data-slot="${id}:${i}">${['Q','E','R'][i]}</button>`).join('')}</div>`:''}</div>`}).join('')+'</section>').join('')}
$('pSk').addEventListener('click',e=>{const so=e.target.closest('[data-sock],[data-put]');if(so){sockClick(so.dataset);return}const u=e.target.closest('[data-up]'),s=e.target.closest('[data-slot]');
if(u){const id=u.dataset.up,sk=SKILLS[id];if(!P.spts||!skAvail(id)||(P.sk[id]||0)>=(sk.max||5))return;P.sk[id]=(P.sk[id]||0)+1;P.spts--;if(sk.kind!=='mod'&&P.sk[id]===1){const free=P.slots.indexOf(null);if(free>=0)P.slots[free]=id}recalc();snd(660,.12,'triangle',.12,1.5);save();renderSk();updSkillBar()}
if(s){const[id,i]=s.dataset.slot.split(':');const j=P.slots.indexOf(id);if(j>=0)P.slots[j]=P.slots[+i]===id?null:P.slots[+i];P.slots[+i]=id;if(j===+i)P.slots[+i]=id;recalc();save();renderSk();updSkillBar()}});
// ----- passive tree
/* ================= ВОСХОЖДЕНИЕ ================= */
const ASC={
mage:[{id:'elem',n:'Стихийник',d:'Повелевает огнём, льдом и молнией одновременно.',c:'#ff9a4a',ic:'fire-ring',nodes:[{n:'Триада стихий',st:{fireP:20,coldP:20,lightP:20}},{n:'Сердце бури',st:{chainAdd:1,shockCh:15}},{n:'Вечный пожар',st:{burnCh:20,aoeP:20}},{n:'Апофеоз',st:{dmgP:30,cdr:15},k:1}]},
 {id:'occ',n:'Чернокнижник',d:'Тёмная магия, яды и жизнь врагов в обмен на свою.',c:'#b06aff',ic:'death-skull',nodes:[{n:'Шёпот бездны',st:{chaosP:25,poisonDur:30}},{n:'Пожиратель душ',st:{leech:2,manaRegen:4}},{n:'Проклятая плоть',st:{hpP:20,regen:4}},{n:'Тьма',st:{chaosP:40,critM:30},k:1}]}],
knight:[{id:'guard',n:'Страж',d:'Несокрушимая стена. Ауры сильнее, урон отражается.',c:'#7fb4ff',ic:'crenulated-shield',nodes:[{n:'Каменная кожа',st:{armorP:40}},{n:'Светлая аура',st:{auraP:30,regen:3}},{n:'Последний рубеж',st:{dmgTaken:-10,hpP:15}},{n:'Возмездие',st:{reflect:25,armorP:30},k:1}]},
 {id:'glad',n:'Гладиатор',d:'Мастер ближнего боя: кровь, оглушения и шквал ударов.',c:'#ff6a5a',ic:'crossed-swords',nodes:[{n:'Кровавая арена',st:{meleeP:25,bleed:20}},{n:'Шквал',st:{aspd:12,crit:2}},{n:'Сокрушитель',st:{stunCh:15,slamR:25}},{n:'Чемпион толпы',st:{meleeP:40,critM:40},k:1}]}],
rogue:[{id:'deadeye',n:'Охотник',d:'Стрелы летят дальше, пробивают и множатся.',c:'#7cf08e',ic:'arrow-scope',nodes:[{n:'Лишний болт',st:{projAdd:1}},{n:'Бронебойность',st:{pierce:2,projP:20}},{n:'Ветер в спину',st:{move:12,aspd:8}},{n:'Глаз бури',st:{projP:40,critM:30},k:1}]},
 {id:'assn',n:'Убийца',d:'Смертельные криты и яды, добивание раненых.',c:'#c0ff5a',ic:'hooded-assassin',nodes:[{n:'Точный удар',st:{crit:4,critM:30}},{n:'Чёрный яд',st:{chaosP:30,poisonDur:40}},{n:'Добивание',st:{execute:40}},{n:'Тень смерти',st:{critX:50,dmgP:20},k:1}]}],
barbarian:[{id:'bers',n:'Берсерк',d:'Ярость и вампиризм. Сильнее, когда рискует.',c:'#ff4a3a',ic:'brutal-helm',nodes:[{n:'Жажда крови',st:{leech:2,aspd:10}},{n:'Безрассудство',st:{dmgP:30,dmgTaken:10}},{n:'Живучесть',st:{regen:6,hpP:15}},{n:'Бойня',st:{meleeP:45,move:8},k:1}]},
 {id:'chief',n:'Вождь',d:'Огонь предков и сокрушительные удары о землю.',c:'#ff9a3a',ic:'totem',nodes:[{n:'Пламя предков',st:{fireP:30,burnCh:15}},{n:'Землетряс',st:{slamR:25,aoeP:20}},{n:'Шкура тура',st:{hp:60,armorP:25}},{n:'Ярость Вождя',st:{fireP:40,aoeP:20,stunCh:10},k:1}]}]};
const ASC_SRC='Очки Восхождения дают стражи «Лагеря культистов», «Затопленных руин», «Сердца Тлена» и первая покорённая карта 5-го тира.';
function ascTotal(){if(!P)return 0;return [2,5,7].filter(z=>(P.lore||[]).includes(z)).length+((P.atlas||[]).some(t=>t>=5)?1:0)}
function ascSub(){return P.ascC?ASC[P.cls].find(a=>a.id===P.ascC):null}
function ascSt(s){const a=ascSub();if(!a)return;for(const i of P.asc||[])addSt(s,a.nodes[i].st)}
function ascHTML(){const tot=ascTotal(),used=(P.asc||[]).length,free=tot-used,a=ascSub();
let h=`<div class="asc"><div class="asch"><b>Восхождение</b><span>${tot?`очков: <b style="color:#ffd774">${free}</b> из ${tot}`:'закрыто'}</span></div>`;
if(!tot)h+=`<p class="muted">${ASC_SRC}</p>`;
else if(!a)h+=`<p class="muted" style="margin:4px 0 8px">Выберите путь — навсегда для этого героя.</p><div class="ascc">`+ASC[P.cls].map(x=>`<button class="ascb" data-asc="${x.id}" style="--c:${x.c}">${gi(x.ic,x.c,'width:34px;height:34px')}<b>${x.n}</b><small>${x.d}</small><ul>${x.nodes.map(n=>`<li>${n.k?'★ ':''}${n.n}: ${Object.entries(n.st).map(([k,v])=>stLine(k,v)).join(', ')}</li>`).join('')}</ul></button>`).join('')+'</div>';
else h+=`<div class="ascn" style="--c:${a.c}">${gi(a.ic,a.c,'width:30px;height:30px')}<b style="color:${a.c}">${a.n}</b></div><div class="ascl">`+a.nodes.map((n,i)=>{const on=(P.asc||[]).includes(i);return `<button class="ascnode ${on?'on':''} ${n.k?'key':''}" data-an="${i}" ${on||free<=0?'disabled':''} style="--c:${a.c}"><b>${n.k?'★ ':''}${n.n}</b><small>${Object.entries(n.st).map(([k,v])=>stLine(k,v)).join(', ')}</small>${on?'<i>изучено</i>':free>0?'<i>изучить</i>':''}</button>`}).join('')+`</div>${tot<4?`<p class="muted" style="font-size:12px;margin:6px 0 0">${ASC_SRC}</p>`:''}`;
return h+'</div>'}
function renderPas(){$('ascBox').innerHTML=ascHTML()+panHTML();$('pasP').textContent=`Пассивных очков: ${P.ppts}. Изучай узлы, соединённые с уже изученными. Большие узлы — сильные эффекты, кольца — ключевые.`;
const cls=P.cls;let lines='',nodes='';const done=new Set();
for(const n of TREE.list)for(const l of n.links){const k=[n.id,l].sort().join('|');if(done.has(k))continue;done.add(k);const m=TREE.nodes[l];const on=P.pas.includes(n.id)&&P.pas.includes(l);lines+=`<line x1="${n.x}" y1="${n.y}" x2="${m.x}" y2="${m.y}" class="${on?'on':''}"/>`}
for(const n of TREE.list){const on=P.pas.includes(n.id),av=canAlloc(n.id);const r=n.t==='start'?16:n.t==='key'?15:n.t==='notable'?12:7;const col=n.cls?CLASSES[n.cls].col:'#bbb';
nodes+=`<g class="pn ${on?'on':''} ${av?'av':''} ${S.pasSel===n.id?'sel':''}" data-n="${n.id}"><circle cx="${n.x}" cy="${n.y}" r="${r+8}" fill="transparent"/>${n.t==='key'?`<circle cx="${n.x}" cy="${n.y}" r="${r+4}" class="kr" style="stroke:${col}"/>`:''}<circle cx="${n.x}" cy="${n.y}" r="${r}" class="nc" style="--c:${col}"/>${n.t==='start'?`<text x="${n.x}" y="${n.y+4}" text-anchor="middle">${n.n[0]}</text>`:''}</g>`}
const tz=S.treeZ||1,sc0=$('tree').scrollLeft,st0=$('tree').scrollTop;$('tree').innerHTML=`<div class="tzb"><button data-tz="-1">−</button><span>${Math.round(tz*100)}%</span><button data-tz="1">+</button></div><svg viewBox="-360 -360 720 720" style="width:${tz*100}%;max-height:none">${lines}${nodes}</svg>`;$('tree').scrollLeft=sc0;$('tree').scrollTop=st0;
const n=S.pasSel&&TREE.nodes[S.pasSel];const box=$('pasInfo');if(!n){box.innerHTML='<p class="muted" style="margin:0">Нажми на узел дерева.</p>';return}
const on=P.pas.includes(n.id);const st=Object.entries(n.st).filter(([k])=>k!=='bloodMagic').map(([k,v])=>`<li>${stLine(k,v)}</li>`).join('');const rc=20*P.lvl;
box.innerHTML=`<h4>${n.n}</h4><div class="sub">${n.t==='key'?'Ключевой узел':n.t==='notable'?'Значимый узел':n.t==='start'?'Старт класса '+(n.cls?CLASSES[n.cls].n:''):'Узел'}${n.cls&&n.cls!==cls&&n.t!=='start'?' · ветка класса '+CLASSES[n.cls].n:''}</div>${n.d?`<p>${n.d}</p>`:''}<ul>${st}</ul><div class="acts">${!on&&canAlloc(n.id)?`<button class="ab" data-pa="add" ${P.ppts?'':'disabled'}>Изучить</button>`:''}${on&&canRefund(n.id)?`<button class="ab alt" data-pa="ref" ${P.gold>=rc?'':'disabled'}>Сбросить · ${rc} зол.</button>`:''}</div>`}
$('pPas').addEventListener('click',e=>{const g=e.target.closest('[data-n]');if(g){S.pasSel=g.dataset.n;renderPas();return}const a=e.target.closest('[data-pa]');if(!a||!S.pasSel)return;
if(a.dataset.pa==='add'&&P.ppts&&canAlloc(S.pasSel)){P.pas.push(S.pasSel);P.ppts--;snd(660,.12,'triangle',.12,1.5)}else if(a.dataset.pa==='ref'&&canRefund(S.pasSel)&&P.gold>=20*P.lvl){P.gold-=20*P.lvl;P.pas=P.pas.filter(x=>x!==S.pasSel);P.ppts++}recalc();save();renderPas()});
// ----- portal
function renderPortal(){let h='<h4 class="ph">Кампания</h4><div class="zl">';for(let i=0;i<Math.min(P.maxZone,8);i++){const Z=ZONES[i];h+=`<button class="zb" data-z="${i}"><b>${i+1}. ${Z.n}</b><small>Уровень монстров ${i+1}${i+1===P.maxZone?' · новая':''} · Страж: ${Z.boss}</small></button>`}h+='</div>';
if(P.maxZone>8)h+=atlasHTML()+abyssHTML()+atlTreeHTML();
$('zoneList').innerHTML=h}
$('zoneList').addEventListener('click',e=>{const ab=e.target.closest('[data-aby]');if(ab){closePanels();enterAbyss(+ab.dataset.aby);return}const an=e.target.closest('[data-an2]');if(an){if(atlPts()>0){P.atlN=P.atlN||[];if(!P.atlN.includes(an.dataset.an2))P.atlN.push(an.dataset.an2);chime([587,880],.08);save()}renderPortal();return}const b=e.target.closest('[data-z],[data-mp],[data-mo],[data-go],[data-free],[data-pin]');if(!b)return;const d=b.dataset;
if(d.z!==undefined){closePanels();enterZone(+d.z,0);return}
if(d.mp!==undefined){AT.sel=+d.mp;renderPortal();return}
if(d.mo){const m=P.maps[AT.sel];if(m&&mapOrb(m,d.mo))save();renderPortal();return}
if(d.pin){if((P.frag||0)<4)return;P.frag-=4;save();closePanels();enterZone(-1,14,null,{zi:7,tier:14,rar:2,mods:['mdmg','mhp'],pin:1});return}
if(d.free){closePanels();enterZone(-1,1,null,{zi:Math.floor(Math.random()*8),tier:1,rar:0,mods:[]});return}
if(d.go!==undefined){const m=P.maps[AT.sel];if(!m)return;P.maps.splice(AT.sel,1);AT.sel=null;save();closePanels();enterZone(-1,m.tier,null,m)}});
// ----- skill bar
function updSkillBar(){for(let i=0;i<3;i++){const id=P.slots[i],sk=id&&SKILLS[id],b=$('s'+i);b.innerHTML=(sk?skIcon(sk)+`<span class="sn">${sk.n}</span>`:'<span class="sn">пусто</span>')+`<em>${['Q','E','R'][i]}</em>`;b.classList.toggle('aura',!!sk&&sk.kind==='aura');b.classList.toggle('off',!!sk&&sk.kind==='aura'&&P.auraOff.includes(id))}}

/* ================= FLOW ================= */
function rollShop(){S.shop=[];for(let i=0;i<8;i++)S.shop.push(genItem(Math.max(1,P.maxZone>8?8+P.maxMap:P.maxZone),Math.random()<.35?1:0,0,i<2?'weapon':undefined))}
function enterTown(){S.mode='town';setTimeout(()=>cloudSave(true),1500);setTimeout(()=>music('town'),50);closePanels();clearZone();town.visible=true;zone.visible=false;H.g.position.set(2.6,0,5);H.target=null;H.buffs=[];H.es=0;recalc();H.hp=ST.hp;H.mana=ST.mana*(1-ST.reserve);H.flask=3;H.fullT=H.upT=H.legT=0;
setEnv('#1c1a26',.016,'#ffc08a',2.6,'#8090c0');$('bossBar').classList.remove('on');rollShop();save();$('zoneName').textContent='Лагерь у костра';$('zoneSub').textContent=touch?'Торговка, кузнец и портал на севере':'Торговка, кузнец и портал. K — умения, P — пассивы, I — сумка'}
function enterZone(zi,tier,net,mi){if(isGuest()&&!net){toast('Портал открывает лидер группы',2);return}S.mods=[];S.seed=net?net.seed:Math.floor(RNG0()*1e9);if(zi>=0){S.zi=zi;S.zone=ZONES[zi];S.L=zi+1;S.map=0;S.mapRar=0;S.pin=false;S.abyss=0}else{const base=mi?ZONES[mi.zi]:pick(ZONES);S.zi=-1;S.map=tier;S.L=8+tier;S.mapRar=mi?mi.rar:0;S.pin=!!(mi&&mi.pin);S.abyss=mi&&mi.abyss||0;S.mods=mi?mi.mods.map(k=>MAPMODS.find(m=>m.k===k)).filter(Boolean):[];
if(net){S.zone=net.zone;S.mods=net.mods}else if(S.pin)S.zone={n:'Обитель Пожирателя',th:3,mons:[['fallen',2],['berserker',2],['necro',1],['brute',1.5]],boss:'Пожиратель Тлена',bt:'brute',obj:{t:'hunt',n:'Убей стражей Обители',c:2},kit:['slam','meteors','spiral','summon','teleport','nova','charge','enrage'],phases:1};else S.zone={n:'Карта: '+base.n,th:base.th,mons:base.mons.concat([['fallen',1],['necro',.6],['berserker',1]]),boss:base.boss+' Кошмара',bt:base.bt,obj:pick(OBJ_POOL),kit:shuffle(Object.keys(BOSS_SK).filter(k=>k!=='enrage')).slice(0,3).concat(tier>=3?['enrage']:[])}}
if(net&&zi>=0){S.zone=ZONES[zi]}S.mode='zone';town.visible=false;zone.visible=true;buildZone();if(NET.on&&NET.host&&!net)nsend({t:'zone',zi,tier,seed:S.seed,zone:S.zone,mods:S.mods,L:S.L});H.g.position.set(0,0,46);H.target=null;H.buffs=[];H.es=0;recalc();H.hp=ST.hp;H.mana=ST.mana*(1-ST.reserve);H.flask=3;H.regenOff=mod('noregen');
for(const id of P.slots)if(id&&SKILLS[id].kind==='summon'&&P.sk[id])summon(id,skLvl(id));
music('zone');$('zoneName').textContent=S.zone.n;banner(S.zone.n,S.abyss?'Бездна · глубина '+S.abyss+' · '+S.mods.length+' мод.':S.pin?'Финальная битва Атласа':S.zi<0?'Карта · тир '+S.map+(S.mods.length?' · '+S.mods.length+' мод.':''):'Уровень монстров '+S.L,'zone');$('zoneSub').textContent='Уровень монстров '+S.L+(S.mods.length?' · '+S.mods.map(m=>m.n).join(' · '):' · Страж ждёт на севере');setTimeout(()=>{if(S.mode==='zone')toast('Иди на север. В конце зоны тебя ждёт '+S.zone.boss+'.',3.5)},2600);snd(200,.8,'sine',.12,2)}
function bossDown(){S.cleared=true;if(S.abyss){const d=S.abyss;P.abyssBest=Math.max(P.abyssBest||0,d);if(d%5===0){P.abyssCk=Math.max(P.abyssCk||1,d+1);setTimeout(()=>{const p=S.boss.g.position;for(let i=0;i<Math.floor(d/5);i++)dropOrb(p);toast('Глубина '+d+' пройдена! Контрольная точка: '+(d+1),3)},800)}csAdd('abyss',d,1)}setTimeout(()=>music('zone'),2500);let lore=null,next='';if(S.zi>=0){if(S.zi+2>P.maxZone){P.maxZone=S.zi+2;next=S.zi<7?'Открыта зона «'+ZONES[S.zi+1].n+'».':'Открыты карты Кошмара!'}if(!P.lore.includes(S.zi)){P.lore.push(S.zi);lore=S.zone.lore;if([2,5,7].includes(S.zi))next+=' Получено очко Восхождения (Пассивы)!';if(S.zi===3)next+=' Открыта великая сила Пантеона (Пассивы)!';if(S.zi===5)next+=' Открыта малая сила Пантеона (Пассивы)!'}}else{if(S.map>P.maxMap&&!S.pin&&!S.abyss){P.maxMap=S.map}P.atlas=P.atlas||[];if(!S.pin&&!S.abyss&&!P.atlas.includes(S.map)){const hadA=P.atlas.some(t=>t>=5);P.atlas.push(S.map);if(!hadA&&S.map>=5)toast('Получено очко Восхождения!',3);next='Атлас: тир '+S.map+' покорён (+3% к количеству предметов на картах).'}}
const p=S.boss.g.position;const g=prop('arch_gate',1);g.position.set(p.x,0,p.z-4);dyn.add(g);const d=new THREE.Mesh(new THREE.CircleGeometry(1.7,40),new THREE.MeshBasicMaterial({color:new THREE.Color('#9a5cff').multiplyScalar(2.2),transparent:true,opacity:.8,side:THREE.DoubleSide,toneMapped:false,map:softTex}));d.position.set(0,1.95,0);g.add(d);exitP=g;emitters.push({x:p.x,y:1.95,z:p.z-4,kind:'portal',w:zone});
save();$('bossBar').classList.remove('on');setTimeout(()=>{if(lore){$('loreH').textContent=S.zone.boss+' повержен';$('loreP').textContent=lore;$('loreM').textContent=next+' Собери добычу и войди в портал, чтобы вернуться в лагерь.';$('ovLore').classList.add('on');setPaused()}else toast('Страж повержен! '+next,4)},1400)}
$('bLore').onclick=()=>{$('ovLore').classList.remove('on');setPaused()};
function die(){csAdd('death');{const k=$('deadKill');if(k)k.textContent=H.lastHit?'Тебя сразил: '+H.lastHit:''}if(P.hc){P.dead=1;save();$('deadH').textContent='Герой пал навсегда';$('deadP').textContent='Хардкор не прощает. Его вещи в хранилище остаются для других героев.';$('bRevive').textContent='На титульный экран'}S.mode='dead';H.whirl=null;hFull('Death_A',1,99);setTimeout(()=>{$('ovDead').classList.add('on');setPaused()},1500);snd(80,1.4,'sawtooth',.15,.4)}
$('bRevive').onclick=()=>{$('ovDead').classList.remove('on');if(P&&P.dead){location.reload();return}enterTown();setPaused()};
function interact(){const n=nearNpc();if(!n)return;if(n.id==='merchant'){npcChars[0].play('Interact',{once:true,restart:true});togglePanel('shop')}else if(n.id==='smith')togglePanel('smith');else if(n.id==='stash')togglePanel('stash');else{if(isGuest()){const z=NET.leaderZone;if(z)enterZone(z.zi,z.tier,z);else toast('Жди, пока лидер группы откроет портал',2);return}togglePanel('portal')}}
$('interact').onclick=interact;
function nearNpc(){if(S.mode!=='town')return null;const p=H.g.position;return NPCS.find(n=>Math.hypot(n.x-p.x,n.z-p.z)<3.2)||null}
async function startGame(p){initAudio();P=p;stashLoad();setTimeout(chBadge,500);$('ovClass').classList.remove('on');$('ovTitle').classList.remove('on');$('ovLoad').classList.add('on');$('lTxt').textContent='Призываю героя…';setPaused();
await loadAsset(CLASSES[P.cls].model);if(H.c)H.g.remove(H.c.root);H.c=makeChar(CLASSES[P.cls].model,{show:[],keepHead:1,layered:1});H.upT=H.legT=H.fullT=0;H.g.add(H.c.root);H.buffs=[];ST=null;recalc();H.hp=ST.hp;H.mana=ST.mana;
$('ovLoad').classList.remove('on');$('hud').classList.add('on');updSkillBar();enterTown();setPaused();sendInfo();if(NET.pendingJoin){const c=NET.pendingJoin;NET.pendingJoin=null;netConnect(c)}if(P.lvl===1&&P.xp===0)toast(touch?'Подойди к порталу на севере лагеря. Умения и пассивы — кнопки сверху.':'Подойди к порталу на севере лагеря. Умения — K, пассивное дерево — P.',5)}
$('bCont').onclick=()=>{const s=load();if(s)startGame(s)};
$('bNew').onclick=()=>{$('ovTitle').classList.remove('on');$('ovClass').classList.add('on');renderClasses();setPaused()};
function renderClasses(){$('classList').innerHTML=Object.entries(CLASSES).map(([k,c])=>`<button class="clc" data-cls="${k}" style="--c:${c.col}"><b>${uiI('cls:'+k,c.col,'width:30px;height:30px;vertical-align:-7px;margin-right:6px')}${c.n}</b><span>${c.role}</span><small>Ветки: ${c.branches.join(' · ')}</small><small>Оружие: ${c.weapons.map(w=>WBASE[w].n).join(', ')}</small></button>`).join('')}
$('classList').addEventListener('click',e=>{const b=e.target.closest('[data-cls]');if(!b)return;const c=charsGet();if(c.list.length>=8){toast('Максимум 8 героев. Удалите одного на титульном экране.',3);return}CUR=c.list.length;const np=freshP(b.dataset.cls);if($('hcChk').checked)np.hc=1;startGame(np)});
$('bBack').onclick=()=>{$('ovClass').classList.remove('on');$('ovTitle').classList.add('on');setPaused()};

/* ================= OBJECTIVES ================= */
const BOSSP={x:0,z:-44};let OBJ=null;
function objLabel(){const el=document.createElement('div');el.className='objl';$('labels').appendChild(el);return el}
function freeSpot(minZ,maxZ,avoid=2.5){for(let t=0;t<120;t++){const x=rand(-44,44),z=rand(minZ,maxZ);if(zoneObs.some(o=>Math.hypot(o.x-x,o.z-z)<o.r+avoid))continue;if(Math.hypot(x-BOSSP.x,z-BOSSP.z)<15||Math.hypot(x,z-46)<10)continue;if(OBJ&&OBJ.ents.some(e=>Math.hypot(e.x-x,e.z-z)<14))continue;return{x,z}}return{x:rand(-30,30),z:rand(minZ,maxZ)}}
const zMon=()=>wpick(S.zone.mons.filter(m=>m[0]!=='brute'&&m[0]!=='necro'));
function glowSphere(r,col,y){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),new THREE.MeshStandardMaterial({color:col,emissive:col,emissiveIntensity:1.6,roughness:.3}));m.position.y=y;return m}
function setupObjective(){const o=S.zone.obj||{t:'hunt',n:'Убей вожаков',c:3};OBJ={t:o.t,n:o.n,c:o.c,have:0,done:false,ents:[]};const th=S.th;
if(o.t!=='totems'){const b=new THREE.Mesh(new THREE.CylinderGeometry(9.8,9.8,5,64,1,true),new THREE.MeshBasicMaterial({color:new THREE.Color(th.eyes).multiplyScalar(1.4),map:beamTex,transparent:true,opacity:.7,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));b.position.set(BOSSP.x,2.5,BOSSP.z);dyn.add(b);OBJ.barrier=b}
const add=e=>{e.prog=0;e.done=false;e.el=objLabel();OBJ.ents.push(e);return e};
if(o.t==='nests')for(let i=0;i<o.c;i++){const s=freeSpot(-30,32);const g=new THREE.Group();g.position.set(s.x,0,s.z);g.add(prop('ribcage',1.8));const sac=glowSphere(.75,'#6aff2a',.8);g.add(sac);dyn.add(g);zoneObs.push({x:s.x,z:s.z,r:1.1});add({x:s.x,z:s.z,g,sac,ch:2.5,spawnT:rand(1,4),verb:'Выжечь гнездо'})}
if(o.t==='altars')for(let i=0;i<o.c;i++){const s=freeSpot(-30,32);const g=new THREE.Group();g.position.set(s.x,0,s.z);g.add(prop('shrine',1.5));dyn.add(g);zoneObs.push({x:s.x,z:s.z,r:.9});add({x:s.x,z:s.z,g,ch:3,verb:'Зажечь огонь',amb:'altar'})}
if(o.t==='rescue')for(let i=0;i<o.c;i++){const s=freeSpot(-30,32);const g=new THREE.Group();g.position.set(s.x,0,s.z);for(const[dx,dz,ry]of[[1.1,0,Math.PI/2],[-1.1,0,Math.PI/2],[0,1.1,0],[0,-1.1,0]]){const f=prop('fence',1);f.position.set(dx,0,dz);f.rotation.y=ry;g.add(f)}
const c=makeChar('merchant',{tint:'#e8dcc8',show:[]});c.root.rotation.y=rand(0,6);g.add(c.root);c.play('Idle');dyn.add(g);zoneObs.push({x:s.x,z:s.z,r:1.3});add({x:s.x,z:s.z,g,c,ch:3,verb:'Освободить пленника',amb:'cult'})}
if(o.t==='hunt')for(let i=0;i<o.c;i++){const s=freeSpot(-30,30);for(let k=0;k<3;k++)spawnMon(zMon(),s.x+rand(-2.5,2.5),s.z+rand(-2.5,2.5),{});const L=spawnMon(wpick(S.zone.mons),s.x,s.z,{rare:1});L.leader=1;L.name='Вожак · '+L.name;
const bm=new THREE.Mesh(new THREE.CylinderGeometry(.25,.6,12,12,1,true),new THREE.MeshBasicMaterial({color:new THREE.Color('#ff3a2a').multiplyScalar(2),map:beamTex,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));bm.position.y=6;L.g.add(bm);
const e=add({x:s.x,z:s.z,M:L,verb:'Вожак'});e.el.style.display='none'}
if(o.t==='relics')for(let i=0;i<o.c;i++){const s=freeSpot(-32,34);const g=new THREE.Group();g.position.set(s.x,0,s.z);const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.55,0),new THREE.MeshStandardMaterial({color:'#7fe0ff',emissive:'#5ad0ff',emissiveIntensity:2.2,roughness:.2,metalness:.4}));gem.position.y=1;g.add(gem);
const bm=new THREE.Mesh(new THREE.CylinderGeometry(.3,.7,10,12,1,true),new THREE.MeshBasicMaterial({color:new THREE.Color('#5ad0ff').multiplyScalar(2),map:beamTex,transparent:true,opacity:.45,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));bm.position.y=5;g.add(bm);dyn.add(g);
spawnMon(zMon(),s.x+2,s.z+1,{rare:1});for(let k=0;k<3;k++)spawnMon(zMon(),s.x+rand(-3,3),s.z+rand(-3,3),{});add({x:s.x,z:s.z,g,gem,verb:'Фрагмент печати',pick:1})}
if(o.t==='defend'){let s={x:0,z:4};zoneObs=zoneObs.filter(q=>Math.hypot(q.x-s.x,q.z-s.z)>7.5);const g=new THREE.Group();g.position.set(s.x,0,s.z);g.add(prop('shrine',1.8));
const ring=new THREE.Mesh(new THREE.RingGeometry(5.7,6,64).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color('#ffd774').multiplyScalar(1.6),transparent:true,opacity:.7,toneMapped:false}));ring.position.y=.06;g.add(ring);dyn.add(g);
for(const ch of dyn.children.slice())if(ch!==g&&ch.position&&Math.hypot(ch.position.x-s.x,ch.position.z-s.z)<6&&!ch.isMesh)dyn.remove(ch);
zoneObs.push({x:s.x,z:s.z,r:1});add({x:s.x,z:s.z,g,ring,verb:'Священный огонь',defend:1,waveT:3})}
if(o.t==='totems'){for(let i=0;i<o.c;i++){const a=i/o.c*Math.PI*2+.4,x=BOSSP.x+Math.cos(a)*12,z=BOSSP.z+Math.sin(a)*12;const g=new THREE.Group();g.position.set(x,0,z);g.add(prop('pillar_decorated',1.2));const orb=glowSphere(.45,'#c060ff',3.4);g.add(orb);dyn.add(g);zoneObs.push({x,z,r:1.1});
const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(),new THREE.Vector3()]),new THREE.LineBasicMaterial({color:new THREE.Color('#d070ff').multiplyScalar(3),toneMapped:false}));scene.add(line);add({x,z,g,orb,line,ch:2,verb:'Разрушить обелиск'})}
const sh=new THREE.Mesh(new THREE.SphereGeometry(1.6,24,16),new THREE.MeshBasicMaterial({color:new THREE.Color('#b060ff').multiplyScalar(1.2),transparent:true,opacity:.25,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));sh.position.y=1.6;sh.scale.setScalar(S.boss.sc);S.boss.g.add(sh);OBJ.shield=sh}
updObjHud()}
function updObjHud(){const el=$('objTxt');if(!OBJ){el.textContent='';return}if(OBJ.done){el.innerHTML='<b class="ok">✓</b> Путь к Стражу открыт: '+esc(S.zone.boss);return}
el.innerHTML='Задание: '+esc(OBJ.n)+' · <b>'+(OBJ.t==='defend'?Math.floor(OBJ.have)+' / '+OBJ.c+' с':OBJ.have+' / '+OBJ.c)+'</b>'}
function ambush(e,kind){const n=kind==='cult'?3:4;for(let k=0;k<n;k++){const a=rand(0,6.28),d=rand(4,7);const t=kind==='cult'?(S.zone.mons.some(m=>m[0]==='cultist')?'cultist':zMon()):'minion';const m=spawnMon(t,e.x+Math.cos(a)*d,e.z+Math.sin(a)*d,{});wake(m)}toast(kind==='cult'?'Засада!':'Мёртвые поднимаются из могил!',1.8)}
function objStep(pos){OBJ.have++;burst({x:pos.x,y:1.5,z:pos.z},'#ffd774',40,5,.4,.9,2.2);flash({x:pos.x,y:1,z:pos.z},'#ffd774',50,.5);snd(660,.2,'triangle',.12,1.5);setTimeout(()=>snd(990,.3,'triangle',.12),120);
if(OBJ.have>=OBJ.c&&!OBJ.done)objDone();else toast(OBJ.n+': '+OBJ.have+' / '+OBJ.c,1.8);updObjHud()}
function objDone(){OBJ.done=true;updObjHud();toast('Задание выполнено! '+(OBJ.t==='totems'?'Страж больше не защищён.':'Барьер пал — путь к Стражу открыт.'),4);
const p=H.g.position.clone();dropItem(p,genItem(S.L,1,ST.rarity));dropItem(p,genItem(S.L,1,ST.rarity));dropOrb(p);gainXp(Math.round(30*S.L*S.L));
if(OBJ.shield){S.boss.g.remove(OBJ.shield);OBJ.shield=null}if(OBJ.barrier)OBJ.barFade=1}
function updObjective(dt){if(!OBJ)return;const p=H.g.position;
if(OBJ.barFade){OBJ.barFade-=dt*.7;OBJ.barrier.material.opacity=Math.max(0,OBJ.barFade*.7);OBJ.barrier.scale.y=Math.max(.01,OBJ.barFade);if(OBJ.barFade<=0){dyn.remove(OBJ.barrier);OBJ.barFade=0}}
for(const e of OBJ.ents){if(e.c)e.c.mixer.update(dt);if(e.done)continue;const d=Math.hypot(e.x-p.x,e.z-p.z);
if(e.M){continue}
if(e.pick){e.gem.rotation.y+=dt*2;e.gem.position.y=1+Math.sin(time*2.5)*.15;e.el.textContent=e.verb;if(d<1.8){completeEnt(e)}continue}
if(e.defend){const inside=d<6||zonePeers().some(pr=>Math.hypot(pr.g.position.x-e.x,pr.g.position.z-e.z)<6);e.ring.material.opacity=inside?.95:.45;if(inside&&!isGuest()){e.prog+=dt;OBJ.have=Math.min(OBJ.c,e.prog);if(Math.random()<.9)emit(e.x+rand(-.3,.3),1.6,e.z+rand(-.3,.3),0,rand(1.5,3),0,rand(.5,.9),rand(.5,.8),3,1.2,.3,.5,.5)}
e.waveT-=dt;if(e.waveT<=0&&e.prog>.5){e.waveT=6;const n=3+Math.floor(e.prog/15);for(let k=0;k<n;k++){const a=rand(0,6.28),r=rand(16,20);const m=spawnMon(zMon(),e.x+Math.cos(a)*r,e.z+Math.sin(a)*r,{rare:k===0&&e.prog>20});wake(m)}}
e.el.innerHTML=`${e.verb}: ${Math.floor(e.prog)} / ${OBJ.c} с${inside?'':' · встань в круг'}`;if(Math.floor(e.prog*4)!==Math.floor((e.prog-dt)*4))updObjHud();
if(e.prog>=OBJ.c&&!isGuest()){completeEnt(e)}continue}
// channel objects
if(e.sac){e.sac.scale.setScalar(1+Math.sin(time*4+e.x)*.12);e.spawnT-=dt;if(e.spawnT<=0&&!isGuest()&&Math.min(d,...zonePeers().map(pr=>Math.hypot(pr.g.position.x-e.x,pr.g.position.z-e.z)))<22){e.spawnT=7;for(let k=0;k<2;k++){const m=spawnMon('minion',e.x+rand(-2,2),e.z+rand(-2,2),{});wake(m)}burst({x:e.x,y:1,z:e.z},'#6aff2a',20,3,.4,.6,1.6)}if(Math.random()<.3)emit(e.x+rand(-.5,.5),1,e.z+rand(-.5,.5),0,.6,0,.8,.5,.4,1.8,.3,0,0)}
if(e.line){const b=S.boss.g.position;const a=e.line.geometry.attributes.position;a.setXYZ(0,e.x,3.4,e.z);a.setXYZ(1,b.x,1.6*S.boss.sc,b.z);a.needsUpdate=true;e.orb.scale.setScalar(1+Math.sin(time*5)*.15)}
if(d<2.8){e.prog+=dt;if(e.amb&&!e.ambD){e.ambD=1;if(isGuest())nsend({t:'amb',zk:zkey(),i:OBJ.ents.indexOf(e)});else ambush(e,e.amb)}const[r,g,b]=C3(e.sac?'#ffaa3a':e.line?'#d070ff':'#ffd774');emit(p.x+rand(-.3,.3),1.2,p.z+rand(-.3,.3),(e.x-p.x)*1.5,1,(e.z-p.z)*1.5,.5,.35,r*2,g*2,b*2,0,0)}else e.prog=Math.max(0,e.prog-dt*.5);
e.el.innerHTML=`${e.verb}${e.prog>0?` <i style="--p:${Math.round(e.prog/e.ch*100)}%"></i>`:''}`;
if(e.prog>=e.ch){completeEnt(e)}}}
function completeEnt(e,fromNet,silent){if(e.done)return;e.done=true;if(e.el)e.el.remove();if(!fromNet&&NET.on)nsend({t:'objdone',zk:zkey(),i:OBJ.ents.indexOf(e)});
if(e.pick){dyn.remove(e.g)}if(e.defend){OBJ.have=OBJ.c;burst({x:e.x,y:1.5,z:e.z},'#ffd774',80,7,.5,1,2.5);if(!OBJ.done)objDone();updObjHud();return}

if(e.sac){e.g.remove(e.sac);burst({x:e.x,y:1,z:e.z},'#6aff2a',60,6,.5,.9,2);burst({x:e.x,y:1,z:e.z},'#ff8a2a',40,5,.5,.8,2);decal(e.x,e.z,2.5,8)}
if(e.amb==='altar'){emitters.push({x:e.x,y:1.6,z:e.z,kind:'fire',w:zone});lights.push({x:e.x,y:2,z:e.z,hex:'#ff9a40',w:'zone'})}
if(e.c){e.c.play('Cheer',{once:true,restart:true});const g=e.g;setTimeout(()=>{burst({x:e.x,y:1.5,z:e.z},'#fff2b0',40,3,.4,1,2);g.remove(e.c.root)},1400);dropGold({x:e.x,y:1,z:e.z},Math.round(S.L*rand(15,30)));if(Math.random()<.6)dropOrb({x:e.x,y:1,z:e.z})}
if(e.line){scene.remove(e.line);e.g.remove(e.orb);burst({x:e.x,y:3.4,z:e.z},'#c060ff',50,6,.5,.8,2.2)}
if(silent){OBJ.have++;if(OBJ.have>=OBJ.c&&!OBJ.done)objDone();updObjHud();return}objStep(e)}

/* ================= BOSS SKILLS ================= */
function tele(x,z,R,delay,dmg,col,cb,fromNet){if(NET.on&&NET.host&&!fromNet)nsend({t:'tele',zk:zkey(),x:+x.toFixed(1),z:+z.toFixed(1),R,dl:delay,d:Math.round(dmg),col});const m=new THREE.Mesh(new THREE.CircleGeometry(R,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(.7),transparent:true,opacity:.3,depthWrite:false}));m.position.set(x,.06,z);
const f=new THREE.Mesh(new THREE.CircleGeometry(R,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(1.6),transparent:true,opacity:.45,depthWrite:false,toneMapped:false}));f.position.y=.01;f.scale.setScalar(.01);m.add(f);scene.add(m);
pending.push({x,z,r:R,t:delay,T:delay,enemy:1,d:dmg,m,boss:1,f,col,cb})}
function enemyShot(x,z,ang,speed,dmg,col='#c060ff',fromNet,kind){if(NET.on&&NET.host&&!fromNet)nsend({t:'eshot',zk:zkey(),x:+x.toFixed(1),z:+z.toFixed(1),a:+ang.toFixed(3),s:speed,d:Math.round(dmg),col,k:kind});const m=kind==='bolt'?new THREE.Mesh(arrowGeo,arrowMat):kind==='knife'?new THREE.Mesh(arrowGeo,pmat('#d0d0e0')):new THREE.Mesh(projGeo,pmat(col));if(!kind||kind==='orb')m.scale.setScalar(1.5);m.rotation.y=ang;m.position.set(x,1.4,z);scene.add(m);projs.push({m,v:new THREE.Vector3(Math.sin(ang)*speed,0,Math.cos(ang)*speed),life:3,team:'enemy',dmg,orbE:!kind||kind==='orb',hit:new Set()})}
function bossKit(M){if(!M.phases)return M.kit;const k=M.hp/M.max;return k>.6?['barrage','slam','summon']:k>.3?['spiral','teleport','summon','slam','nova','ring']:['meteors','nova','spiral','charge','teleport','cross']}
function bossAI(M,dt,dist){const kit=bossKit(M),q=M.g.position,p=H.g.position,c=M.c,col=S.th.eyes;
if(M.kit.includes('enrage')&&!M.enraged&&M.hp<M.max*.3){M.enraged=1;M.spd*=1.4;for(const m of c.mats)m.color.lerp(new THREE.Color('#ff3a2a'),.35);toast(M.name+' впадает в ярость!',2.5);ringFx(q.x,q.z,6,'#ff3a2a',.6,.2);S.shake=.4;noise(.6,.25,300)}
if(M.phases){const ph=M.hp/M.max>.6?1:M.hp/M.max>.3?2:3;if(ph!==M.ph){if(M.ph)toast(M.name+': фаза '+ph+'!',2.5);M.ph=ph;M.abT=Math.min(M.abT,1)}}
M.abT-=dt;if(M.abT>0||nearestPlayer(q).d>20||c.lock>0)return;const opts=kit.filter(k=>k!=='enrage'&&!(k==='summon'&&M.sumN>=4));if(!opts.length)return;const k=pick(opts);M.abT=(M.enraged?1.7:2.8)+rand(0,1.2);
num(q.clone().setY(3.4*M.sc),BOSS_SK[k],'cast');if(NET.on)nsend({t:'bcast',zk:zkey(),id:M.id,n:BOSS_SK[k]});const atk=c.clips['2H_Melee_Attack_Chop']?'2H_Melee_Attack_Chop':M.D.atk,cast=c.clips['Spellcast_Raise']?'Spellcast_Raise':c.clips['Spellcast_Shoot']?'Spellcast_Shoot':atk;
switch(k){
case'slam':c.play(atk,{once:true,restart:true,ts:.8});{const NP=nearestPlayer(q);tele(NP.x,NP.z,3.4,1.1,M.dmg*1.7,col)}break;
case'pools':c.play(cast,{once:true,restart:true,ts:1});for(let i=0;i<3;i++){const x=p.x+(i?rand(-3,3):0),z=p.z+(i?rand(-3,3):0);tele(x,z,2.4,.8,0,'#6aff3a',()=>{const d=decal(x,z,2.4,6,poolTex,new THREE.Color('#5aff2a').multiplyScalar(.5));grounds.push({x,z,r:2.4,t:6,tick:0,team:'enemy',dps:M.dmg*.55,col:'#6aff3a'})})}break;
case'summon':c.play(c.clips['Spellcast_Summon']?'Spellcast_Summon':cast,{once:true,restart:true});M.sumN++;for(let i=0;i<4;i++){const a=i*1.57+rand(-.3,.3);const m=spawnMon(zMon(),q.x+Math.cos(a)*4,q.z+Math.sin(a)*4,{});wake(m)}break;
case'barrage':{c.play(cast,{once:true,restart:true,ts:1.2});const base=Math.atan2(p.x-q.x,p.z-q.z);setTimeout(()=>{if(M.dead)return;for(let i=0;i<9;i++)enemyShot(q.x,q.z,base-.7+i*.175,11,M.dmg*.7,col)},350);break}
case'spiral':c.play(cast,{ts:1});M.spiral={t:3.2,ang:0,tick:0};break;
case'ring':{c.play(cast,{once:true,restart:true});const n=14,R=7;for(let i=0;i<n;i++){const a=i/n*6.283;tele(q.x+Math.cos(a)*R,q.z+Math.sin(a)*R,2.2,1.1,M.dmg*1.3,'#ff4aa0')}for(let i=0;i<20;i++){const a=i/20*6.283;tele(q.x+Math.cos(a)*11,q.z+Math.sin(a)*11,2.2,1.5,M.dmg*1.3,'#ff4aa0')}break}
case'cross':{c.play(atk,{once:true,restart:true});for(const off of [0,Math.PI/4])for(let d=0;d<4;d++){const a=off+d*Math.PI/2;for(let i=1;i<=6;i++)tele(q.x+Math.sin(a)*i*2.6,q.z+Math.cos(a)*i*2.6,1.6,off?1.6+i*.05:.9+i*.05,M.dmg*1.2,off?'#ffb03a':'#ff6a2a')}S.shake=.25;break}
case'meteors':c.play(cast,{once:true,restart:true});for(let i=0;i<7;i++){const x=p.x+(i?rand(-6,6):0),z=p.z+(i?rand(-6,6):0);const met=new THREE.Mesh(new THREE.SphereGeometry(.5,10,8),pmat('#ff6a1a'));met.position.set(x+3,14,z+2);scene.add(met);const dl=.9+i*.13;
tele(x,z,2.3,dl,M.dmg*1.2,'#ff5a1a',()=>{scene.remove(met);decal(x,z,2.3,3)});const t0=performance.now();const tick=()=>{const k2=Math.min(1,(performance.now()-t0)/1000/dl);met.position.set(x+3*(1-k2),14*(1-k2),z+2*(1-k2));if(k2<1&&met.parent)requestAnimationFrame(tick)};tick()}break;
case'charge':{const a=Math.atan2(p.x-q.x,p.z-q.z),L=16;const m=new THREE.Mesh(new THREE.PlaneGeometry(2.8,L).rotateX(-Math.PI/2).translate(0,0,L/2),new THREE.MeshBasicMaterial({color:new THREE.Color(col).multiplyScalar(1.4),transparent:true,opacity:.35,depthWrite:false,toneMapped:false}));
m.position.set(q.x,.07,q.z);m.rotation.y=a;scene.add(m);M.charge={a,wait:.85,t:.55,m,hit:false};M.face=a;c.root.rotation.y=a;c.play(c.clips['2H_Melee_Idle']?'2H_Melee_Idle':'Idle');break}
case'spin':M.spinT=3;M.spinTick=0;break;
case'teleport':{burst(q.clone().setY(1.5),'#5a3a7a',40,4,.6,.8,1.4,0);const a=H.face;q.x=p.x-Math.sin(a)*2.6;q.z=p.z-Math.cos(a)*2.6;collide(q,M.r);burst(q.clone().setY(1.5),'#5a3a7a',40,4,.6,.8,1.4,0);noise(.3,.15,1500);
M.face=Math.atan2(p.x-q.x,p.z-q.z);c.root.rotation.y=M.face;c.play(atk,{once:true,restart:true,ts:.9});tele(q.x,q.z,3.2,.75,M.dmg*1.5,col);break}
case'nova':c.play(cast,{once:true,restart:true,ts:.7});tele(q.x,q.z,7.5,1.5,M.dmg*1.6,col);break}}
function bossBusy(M,dt,dist){const q=M.g.position,p=H.g.position,c=M.c;
if(M.charge){const ch=M.charge;if(ch.wait>0){ch.wait-=dt;ch.m.material.opacity=.25+(.85-ch.wait)*.5;return true}
if(ch.m){scene.remove(ch.m);ch.m=null;c.play(c.clips['Running_A']?'Running_A':M.D.run,{ts:2.5});noise(.4,.2,400)}ch.t-=dt;q.x+=Math.sin(ch.a)*30*dt;q.z+=Math.cos(ch.a)*30*dt;collide(q,M.r);
emit(q.x,rand(.3,1.5),q.z,rand(-1,1),rand(0,1),rand(-1,1),.5,.6,1.5,1,.6,0,1);if(!ch.hit&&Math.hypot(p.x-q.x,p.z-q.z)<1.6+M.r){ch.hit=true;hurtHero(M.dmg*1.8,M);S.shake=.4}for(const pr of zonePeers())if(!ch['h'+pr.id]&&Math.hypot(pr.g.position.x-q.x,pr.g.position.z-q.z)<1.6+M.r){ch['h'+pr.id]=1;hurtTarget({peer:pr},M.dmg*1.8)}if(ch.t<=0)M.charge=null;return true}
if(M.spiral){const s=M.spiral;s.t-=dt;s.tick-=dt;if(s.tick<=0){s.tick=.11;for(let i=0;i<3;i++)enemyShot(q.x,q.z,s.ang+i*Math.PI*2/3,7.5,M.dmg*.5,S.th.eyes);s.ang+=.33}if(s.t<=0){M.spiral=null;c.play('Idle')}return true}
if(M.spinT>0){M.spinT-=dt;M.spinTick-=dt;const d=dist||1;q.x+=(p.x-q.x)/d*M.spd*1.5*dt;q.z+=(p.z-q.z)/d*M.spd*1.5*dt;collide(q,M.r);c.root.rotation.y+=dt*16;c.play(c.clips['2H_Melee_Attack_Spinning']?'2H_Melee_Attack_Spinning':M.D.atk,{ts:1.3});
if(M.spinTick<=0){M.spinTick=.4;const R=2.2+M.r;if(Math.hypot(p.x-q.x,p.z-q.z)<R)hurtHero(M.dmg*.55,M);for(const pr of zonePeers())if(Math.hypot(pr.g.position.x-q.x,pr.g.position.z-q.z)<R)hurtTarget({peer:pr},M.dmg*.55);for(let i=0;i<12;i++){const a=rand(0,6.28);emit(q.x+Math.cos(a)*R,1.2,q.z+Math.sin(a)*R,-Math.sin(a)*9,0,Math.cos(a)*9,.25,.45,1.6,1.4,1.2,0,3)}}return true}
return false}

/* ================= UPDATE ================= */
let time=0;
function update(dt){updEnchant(dt);monFx(dt);updRift(dt);updShrines(dt);updEss(dt);const p=H.g.position;const moving=S.mode==='dead'?false:moveHero(dt);
if(!H.leap&&!H.charge)H.face=angLerp(H.face,H.faceT,1-Math.pow(.0005,dt));H.c.root.rotation.y=H.face;
for(let i=0;i<3;i++)H.cds[i]=Math.max(0,H.cds[i]-dt);H.dashCd=Math.max(0,H.dashCd-dt);H.inv=Math.max(0,H.inv-dt);S.bagWarn-=dt;H.castT-=dt;H.c.lock-=dt;H.immortal=Math.max(0,H.immortal-dt);H.lastCast=(H.lastCast||0)-dt;H.aimT=(H.aimT||0)-dt;
for(let i=H.queue.length-1;i>=0;i--){const q=H.queue[i];q.t-=dt;if(q.t<=0){H.queue.splice(i,1);q.f()}}
let bchg=false;for(let i=H.buffs.length-1;i>=0;i--){H.buffs[i].t-=dt;if(H.buffs[i].t<=0){H.buffs.splice(i,1);bchg=true}}if(bchg)recalc();if(!H.buffs.some(b=>SKILLS[b.id]&&SKILLS[b.id].p.shield))H.es=0;
if(S.mode!=='dead'){const mm=ST.mana*(1-ST.reserve);H.mana=Math.min(mm,H.mana+ST.manaRegen*dt);if(!H.regenOff)H.hp=Math.min(ST.hp,H.hp+ST.regen*dt);if(H.healT>0){H.healT-=dt;H.hp=Math.min(ST.hp,H.hp+H.healR*dt)}
H.moving=moving;if(!H.leap)heroLoco(dt,moving);}
if(S.mode!=='zone')return;
if(OBJ&&OBJ.barrier&&!OBJ.done){const d=Math.hypot(p.x-BOSSP.x,p.z-BOSSP.z);if(d<10.3){p.x=BOSSP.x+(p.x-BOSSP.x)/d*10.3;p.z=BOSSP.z+(p.z-BOSSP.z)/d*10.3}}updObjective(dt);
for(const l of loot.slice())if(l.fly.t>=1&&Math.hypot(l.pos.x-p.x,l.pos.z-p.z)<(l.it?1.5:2.8))tryPick(l);
for(const c of chests)if(!c.open&&Math.hypot(c.x-p.x,c.z-p.z)<2.2)openChest(c);
// whirl
if(H.whirl){const w=H.whirl;w.t-=dt;w.tick-=dt;if(w.tick<=0){w.tick=w.int/(ST.aps/1.3);aoeHit(p.x,p.z,w.r,w.ctx);for(let i=0;i<10;i++){const a=rand(0,6.28);emit(p.x+Math.cos(a)*w.r*.8,rand(.6,1.4),p.z+Math.sin(a)*w.r*.8,-Math.sin(a)*8,0,Math.cos(a)*8,.25,.4,1.6,1.5,1.3,0,3)}noise(.06,.05,2200)}H.c.root.rotation.y=time*14;if(w.t<=0)H.whirl=null}
if(H.barrage){const b=H.barrage;b.t-=dt;if(b.t<=0&&b.n>0){b.n--;b.t=b.int;const tgt=b.M.dead?nearest(15):b.M;if(tgt){aimAt(tgt);const dir=new THREE.Vector3(tgt.g.position.x-p.x,0,tgt.g.position.z-p.z).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),rand(-.08,.08));
spawnProj(new THREE.Vector3(p.x+dir.x*.6,1.4,p.z+dir.z*.6),dir,{el:'phys',speed:34,life:.9,ctx:{...b.ctx,proj:1},arrow:1});hUpper(animFor('shoot'),3);snd(900,.05,'square',.04,1.6)}}if(b.n<=0)H.barrage=null}
// auto attack
H.atkT-=dt;const range=ST.range;const best=nearest(CLASSES[P.cls].ranged?range+.5:range+2.5);
if(best&&H.atkT<=0&&!(H.dashV&&H.dashV.t>0)&&!H.whirl&&!H.leap&&!H.charge&&!H.barrage&&H.lastCast<=0){const d=Math.hypot(best.g.position.x-p.x,best.g.position.z-p.z);if(CLASSES[P.cls].ranged||d<range+best.r+.3){H.atkT=1/ST.aps;basicAttack(best,moving);if(!moving)H.faceT=Math.atan2(best.g.position.x-p.x,best.g.position.z-p.z)}}
// projectiles
for(let i=projs.length-1;i>=0;i--){const b=projs[i];b.life-=dt;if(b.wobble){b.v.applyAxisAngle(new THREE.Vector3(0,1,0),rand(-6,6)*dt)}b.m.position.addScaledVector(b.v,dt);const bp=b.m.position;if(b.m.userData.spin)b.m.rotation.x+=dt*18;
if(b.trail&&b.team==='hero'){const[r,g,bb]=C3(b.col);emit(bp.x,bp.y,bp.z,rand(-.3,.3),rand(-.3,.3),rand(-.3,.3),.25,.3*b.size,r*2,g*2,bb*2,0,2)}
if(b.team==='enemy'){if(b.orbE){const[r,g,bb]=C3('#c060ff');emit(bp.x,bp.y,bp.z,0,0,0,.3,.4,r*2,g*2,bb*2)}let hitA=null;for(const a of allies)if(a.kind!=='totem'&&a.g.position.distanceTo(bp)<1)hitA=a;
if(Math.hypot(bp.x-p.x,bp.z-p.z)<.7){hurtHero(b.dmg);b.life=0;burst(bp,b.orbE?'#c060ff':'#ff9a4a',8,2.5,.3,.3,2)}else if(hitA){enemyHitAlly(hitA,b.dmg);b.life=0}else if(zoneObs.some(o=>o.r>.5&&Math.hypot(o.x-bp.x,o.z-bp.z)<o.r))b.life=0}
else{if(b.orb){b.tick-=dt;if(b.tick<=0){b.tick=b.orb.int;let n=0;for(const m of mons){if(m.dead||n>=3)continue;if(m.g.position.distanceTo(bp)<b.orb.r){lightning(bp,m.g.position.clone().setY(1.2));dealDmg(m,b.ctx);n++}}}}
else for(const M of mons){if(M.dead||b.hit.has(M))continue;const q=M.g.position;if(Math.hypot(q.x-bp.x,q.z-bp.z)<M.r+.4*b.size){b.hit.add(M);dealDmg(M,b.ctx);burst(bp,b.col,8,3,.3,.35,2,-2);
if(b.explode){const R=b.explode*(1+ST.aoeP/100);aoeHit(bp.x,bp.z,R,{...b.ctx,proj:0},m=>m!==M);ringFx(bp.x,bp.z,R,b.col,.35);flash(bp,b.col,30,.25);burst(bp,b.col,26,5,.45,.5,2.5);noise(.18,.12,900)}
if(b.pierce--<=0){b.life=0;break}}}}
if(b.life<=0){scene.remove(b.m);projs.splice(i,1)}}
// pending aoe
for(let i=pending.length-1;i>=0;i--){const a=pending[i];a.t-=dt;if(a.m){const k=1-a.t/a.T;if(a.sk&&a.sk.p.meteor){a.m.position.set(lerp(a.x+4,a.x,k),lerp(14,0,k),lerp(a.z+2,a.z,k));emit(a.m.position.x,a.m.position.y,a.m.position.z,0,1,0,.4,.8,3,1,.3,0,0)}else if(a.sk&&a.sk.p.hammer){a.m.position.y=lerp(6,0,k*k);a.m.rotation.z=k*3}}
if(a.arrows&&Math.random()<.6)emit(a.x+rand(-a.r,a.r),5,a.z+rand(-a.r,a.r),0,-25,0,.2,.2,1.5,1.3,1,0,0);
if(a.t<=0){pending.splice(i,1);if(a.m)scene.remove(a.m);if(a.mark)scene.remove(a.mark);
if(a.enemy){if(Math.hypot(p.x-a.x,p.z-a.z)<a.r&&a.d)hurtHero(a.d);const ec=a.col||'#ff5a1a';if(a.d){burst({x:a.x,y:.5,z:a.z},ec,30,5,.45,.6,2);ringFx(a.x,a.z,a.r,ec,.35);S.shake=Math.max(S.shake,.2);noise(.3,.15,500)}a.cb&&a.cb();continue}
aoeHit(a.x,a.z,a.r,a.ctx);const ec=EL[a.ctx.el].c;ringFx(a.x,a.z,a.r,ec,.35);if(!a.arrows){decal(a.x,a.z,a.r,3);flash({x:a.x,y:0,z:a.z},ec,50,.3);S.shake=Math.max(S.shake,.15);burst({x:a.x,y:.4,z:a.z},ec,34,6,.5,.6,2.5);noise(.3,.18,600)}else burst({x:a.x,y:.3,z:a.z},'#c8b090',8,2,.3,.3,1.2)}}
// grounds
for(let i=grounds.length-1;i>=0;i--){const gr=grounds[i];gr.t-=dt;gr.tick-=dt;const[r,g,b]=C3(gr.col);if(Math.random()<.8)emit(gr.x+rand(-gr.r,gr.r)*.8,gr.blizz?4:.1,gr.z+rand(-gr.r,gr.r)*.8,gr.blizz?rand(-2,2):0,gr.blizz?-8:rand(.4,1.2),0,gr.blizz?.5:.8,gr.blizz?.25:.5,r*1.8,g*1.8,b*1.8,0,0);
if(gr.tick<=0&&gr.team==='enemy'){gr.tick=.4;if(Math.hypot(p.x-gr.x,p.z-gr.z)<gr.r)hurtHero(gr.dps*.4)}else if(gr.tick<=0){gr.tick=.4;if(gr.heal){if(Math.hypot(p.x-gr.x,p.z-gr.z)<gr.r)H.hp=Math.min(ST.hp,H.hp+ST.hp*.025);for(const a of allies)if(a.g.position.distanceTo(new THREE.Vector3(gr.x,0,gr.z))<gr.r)a.hp=Math.min(a.max,a.hp+a.max*.04)}
if(!gr.ctx.ghost)for(const m of mons.slice())if(!m.dead&&Math.hypot(m.g.position.x-gr.x,m.g.position.z-gr.z)<gr.r+m.r){const r2=rollCtx(gr.ctx);dealDmg(m,{...gr.ctx,dot:1},r2.d*.4);applyStatus(m,gr.ctx,r2.d*.4)}}
if(gr.t<=0)grounds.splice(i,1)}
// traps
for(let i=traps.length-1;i>=0;i--){const t=traps[i];t.arm-=dt;t.life-=dt;if(t.arm<=0){const trig=mons.some(m=>!m.dead&&Math.hypot(m.g.position.x-t.x,m.g.position.z-t.z)<1.8+m.r);
if(trig||t.life<=0){traps.splice(i,1);scene.remove(t.m);if(trig){if(t.cloud)addGround(t.x,t.z,t.r,5,t.ctx,t.sk);else{aoeHit(t.x,t.z,t.r,t.ctx);ringFx(t.x,t.z,t.r,'#e8d0a0',.35);burst({x:t.x,y:.3,z:t.z},'#e8d0a0',30,6,.4,.5,1.6);S.shake=.12;noise(.2,.15,1200)}}}}}
// death mist aura
if(activeAuras().includes('deathmist')){H.mistT-=dt;if(Math.random()<.5)emit(p.x+rand(-5,5),.2,p.z+rand(-5,5),0,.3,0,1.2,.8,.3,.9,.2,0,0);if(H.mistT<=0){H.mistT=.5;for(const m of mons)if(!m.dead&&m.g.position.distanceTo(p)<5.5){const r2=rollCtx({m:.3,el:'chaos'});dealDmg(m,{el:'chaos',dot:1},r2.d);m.st.poison.push({dps:r2.d*.2,t:3})}}}
updAllies(dt);
// monsters
for(const M of mons.slice()){const g=M.g,q=g.position,c=M.c;const dist=Math.hypot(p.x-q.x,p.z-q.z);g.visible=dist<48;c.lock-=dt;
if(M.dead){M.dead+=dt;M.flash=Math.max(0,M.flash-dt*5);for(const m of c.mats)m.emissive.setScalar(M.flash*.7);if(M.dead>2.2){const k=Math.min(1,(M.dead-2.2)/.8);q.y=-k*.8;if(k>=1){dyn.remove(g);c.mats.forEach(x=>x.dispose());mons.splice(mons.indexOf(M),1)}}if(dist<40)c.mixer.update(dt);continue}
// statuses
const s=M.st;let dot=0;if(s.burn){s.burn.t-=dt;dot+=s.burn.dps;if(Math.random()<.4)emit(q.x+rand(-.3,.3),rand(.5,2)*M.sc,q.z+rand(-.3,.3),0,1.5,0,.4,.4,3,1,.3,0,0);if(s.burn.t<=0)s.burn=null}
if(s.bleed){s.bleed.t-=dt;dot+=s.bleed.dps;if(Math.random()<.2)emit(q.x,1.2*M.sc,q.z,rand(-1,1),1,rand(-1,1),.5,.25,1.6,.1,.1,-8,0);if(s.bleed.t<=0)s.bleed=null}
if(s.poison.length){for(const x of s.poison){x.t-=dt;dot+=x.dps}s.poison=s.poison.filter(x=>x.t>0);if(Math.random()<.3)emit(q.x+rand(-.3,.3),rand(.5,2)*M.sc,q.z+rand(-.3,.3),0,.6,0,.5,.35,.4,1.6,.3,0,0)}
s.chill=Math.max(0,s.chill-dt);s.shock=Math.max(0,s.shock-dt);s.stun=Math.max(0,s.stun-dt);s.blind=Math.max(0,s.blind-dt);if(s.shock>0&&Math.random()<.1)emit(q.x,rand(.5,2),q.z,rand(-2,2),rand(-1,2),rand(-2,2),.15,.25,3,3,1,0,0);
if(dot>0&&!isGuest()){dealDmg(M,{el:'chaos',dot:1},dot*dt*(1+ST.dmgP/100));M.dotT-=dt;if(M.dotT<=0&&M.dotAcc>0){M.dotT=.6;num(q.clone().setY(2.3*M.sc),Math.round(M.dotAcc),'dot');M.dotAcc=0}if(M.dead)continue}
M.flash=Math.max(0,M.flash-dt*5);const chillK=s.chill>0?Math.max(.3,1-.3*(1+ST.chillStr/100)):1;for(const m of c.mats){m.emissive.setRGB(M.flash*.7,M.flash*.7+(s.chill>0?.12:0),M.flash*.7+(s.chill>0?.3:0))}
if(M.max>M.hp){M.bg.visible=M.fg.visible=true;M.fg.scale.x=1.24*Math.max(0,M.hp/M.max)}
if(!M.aggro&&!isGuest()&&nearestPlayer(q).d<(M.boss?17:13))wake(M);
c.mixer.timeScale=chillK;
if(isGuest()){if(M.wake>0)M.wake-=dt;else if(M.net){const k=1-Math.pow(.001,dt);q.x+=(M.net.x-q.x)*k;q.z+=(M.net.z-q.z)*k;M.face=angLerp(M.face,M.net.f,k);c.root.rotation.y=M.face;if(M.net.a&&c.curN!==M.net.a){const once=/Attack|Shoot|Throw|Spellcast|Hit/.test(M.net.a);c.play(M.net.a,{once,restart:true,ts:1.3,lock:false})}}if(M.boss&&dist<25){$('bossBar').classList.add('on');$('bossName').textContent=M.name;$('bossFill').style.width=Math.max(0,M.hp/M.max*100)+'%'}}
else if(M.aggro){if(M.wake>0){M.wake-=dt}else if(M.boss&&bossBusy(M,dt,dist)){}else if(s.stun>0){c.play('Idle_Combat')||c.play('Idle');if(Math.random()<.2)emit(q.x+rand(-.3,.3),2.6*M.sc,q.z+rand(-.3,.3),0,.3,0,.4,.3,3,3,1,0,0)}else{
const NP=nearestPlayer(q);let T={x:NP.x,z:NP.z,ally:null,peer:NP.peer};let bestA=null,ba=6;for(const a of allies){if(a.kind==='totem')continue;const d=a.g.position.distanceTo(q);if(d<ba&&d<dist){ba=d;bestA=a}}if(bestA)T={x:bestA.g.position.x,z:bestA.g.position.z,ally:bestA};
const dx=T.x-q.x,dz=T.z-q.z,d=Math.hypot(dx,dz)||.01,rng=M.D.range+M.r;let mv=0;const sp=M.spd*chillK;
if(c.lock<=0){if(M.D.ranged){if(d>rng*.9)mv=1;else if(d<4)mv=-.7}else if(d>rng)mv=1}
if(mv){q.x+=dx/d*sp*mv*dt;q.z+=dz/d*sp*mv*dt;c.play(M.D.run,{ts:sp/M.D.rs*1.1})}else if(c.lock<=0)c.play(c.clips['Idle_Combat']?'Idle_Combat':'Idle');
M.face=angLerp(M.face,Math.atan2(dx,dz),1-Math.pow(.002,dt));c.root.rotation.y=M.face;
M.atkT-=dt;if(d<=rng+.3&&M.atkT<=0&&c.lock<=0){M.atkT=M.D.cd;c.play(M.D.atk,{once:true,restart:true,ts:M.boss?1:1.35});M.hitT=M.D.ranged?.45:M.boss?.55:.38;M.tgt=T.ally;M.tgtP=T.peer}
if(M.hitT>0){M.hitT-=dt;if(M.hitT<=0){M.hitT=-1;const miss=s.blind>0&&Math.random()<.5;
if(M.D.ranged){const sp2=new THREE.Vector3(q.x+Math.sin(M.face)*.6,1.4,q.z+Math.cos(M.face)*.6),v=new THREE.Vector3(T.x-sp2.x,0,T.z-sp2.z).normalize();const kind=M.D.ranged;
enemyShot(sp2.x,sp2.z,Math.atan2(v.x,v.z),kind==='orb'?9:15,M.dmg,'#c060ff',0,kind);noise(.08,.06,3000)}
else if(!miss){if(M.tgt&&M.tgt.hp>0){if(M.tgt.g.position.distanceTo(q)<rng+.8)enemyHitAlly(M.tgt,M.dmg)}else if(M.tgtP&&M.tgtP.g){if(Math.hypot(M.tgtP.g.position.x-q.x,M.tgtP.g.position.z-q.z)<rng+.8)hurtTarget({peer:M.tgtP},M.dmg)}else if(Math.hypot(p.x-q.x,p.z-q.z)<rng+.8){hurtHero(M.dmg,M);if(M.rm.includes('vamp'))M.hp=Math.min(M.max,M.hp+M.dmg);burst({x:p.x,y:1.2,z:p.z},'#ff5a4a',6,2,.25,.3,1.5)}}}}
if(M.rm.includes('frost')&&dist<4){H.chillT=.3}
if((M.D.summoner||M.rm.includes('summon'))&&!M.boss){M.sumT-=dt;if(M.sumT<=0&&mons.length<90){M.sumT=7;c.play('Spellcast_Summon',{once:true,restart:true});for(let k=0;k<2;k++){const s2=spawnMon('minion',q.x+rand(-2,2),q.z+rand(-2,2),{});wake(s2)}}}
if(M.boss){$('bossBar').classList.add('on');$('bossName').textContent=M.name+(OBJ&&!OBJ.done?' · неуязвим':'');$('bossFill').style.width=Math.max(0,M.hp/M.max*100)+'%';{const bb=$('bossBar').querySelector('.bar');const want=M.phases?'p':M.kit&&M.kit.includes('enrage')?'e':'';if(bb.dataset.k!==want){bb.dataset.k=want;bb.querySelectorAll('.tk').forEach(x=>x.remove());(want==='p'?[60,30]:want==='e'?[30]:[]).forEach(v=>bb.insertAdjacentHTML('beforeend',`<span class="tk" style="left:${v}%"></span>`))}$('bossBar').classList.toggle('enr',!!M.enraged)}bossAI(M,dt,dist)}}}
for(const O of mons){if(O===M||O.dead)continue;const ox=q.x-O.g.position.x,oz=q.z-O.g.position.z,od=Math.hypot(ox,oz),mn=M.r+O.r;if(od<mn&&od>0){q.x+=ox/od*(mn-od)*.5;q.z+=oz/od*(mn-od)*.5}}
collide(q,M.r);if(dist<40)c.mixer.update(dt)}
// boss slam pending fill
for(const a of pending)if(a.boss&&a.f){const k=1-a.t/a.T;a.f.scale.setScalar(Math.max(.01,k))}
if(H.chillT>0)H.chillT-=dt;
if(exitP&&Math.hypot(exitP.position.x-p.x,exitP.position.z-p.z)<2){if(S.abyss&&!isGuest()){const d=S.abyss+1;exitP=null;enterAbyss(d)}else{enterTown();toast('Ты вернулся в лагерь. Продай добычу и улучши снаряжение.',3)}}}

/* ================= MINIMAP ================= */
const mc=$('mini').getContext('2d');
function drawMini(){const W=mc.canvas.width,s=W/(S.bigMap?110:40);mc.clearRect(0,0,W,W);if(S.mode!=='zone')return;const hx=H.g.position.x,hz=H.g.position.z;const tx=x=>(x-hx)*s+W/2,tz=z=>(z-hz)*s+W/2;
mc.save();mc.beginPath();mc.arc(W/2,W/2,W/2,0,7);mc.clip();mc.fillStyle='rgba(255,255,255,.12)';for(const o of zoneObs){if(Math.abs(o.x-hx)>(S.bigMap?60:22)||Math.abs(o.z-hz)>(S.bigMap?60:22))continue;mc.beginPath();mc.arc(tx(o.x),tz(o.z),Math.max(1.2,o.r*s*.7),0,7);mc.fill()}
for(const c of chests)if(!c.open){mc.fillStyle='#d8b56a';mc.fillRect(tx(c.x)-2.5,tz(c.z)-2.5,5,5)}
for(const l of loot){const c=l.gold?'#d8b56a':l.orb?'#fff3b0':l.mapIt?'#9ad0ff':l.frag?'#ff5a8a':l.gem2?'#5ee07a':l.div?'#cfe8ff':l.ess?ESS[l.ess].c:RCH[l.it.rar];mc.fillStyle=c;const r=l.hi?2.6:1.5;mc.fillRect(tx(l.pos.x)-r,tz(l.pos.z)-r,r*2,r*2);if(l.hi){mc.strokeStyle=c;mc.lineWidth=1;mc.beginPath();mc.arc(tx(l.pos.x),tz(l.pos.z),5+2*Math.sin(performance.now()/200),0,7);mc.stroke()}}
for(const a of allies){mc.fillStyle='#5ad06a';mc.beginPath();mc.arc(tx(a.g.position.x),tz(a.g.position.z),2,0,7);mc.fill()}
for(const M of mons){if(M.dead)continue;mc.fillStyle=M.boss?'#d04fff':M.rare?'#ffd84a':'#e0483c';const r=M.boss?4.5:M.rare?3:2;mc.beginPath();mc.arc(tx(M.g.position.x),tz(M.g.position.z),r,0,7);mc.fill()}
if(OBJ)for(const e of OBJ.ents){if(e.done)continue;const ex=e.M?e.M.g.position.x:e.x,ez=e.M?e.M.g.position.z:e.z;let X=tx(ex),Z=tz(ez);const dd=Math.hypot(X-W/2,Z-W/2);if(dd>W/2-7){X=W/2+(X-W/2)/dd*(W/2-7);Z=W/2+(Z-W/2)/dd*(W/2-7)}mc.save();mc.translate(X,Z);mc.rotate(Math.PI/4);mc.fillStyle=e.M?'#ff5a3a':'#ffd774';mc.strokeStyle='#000';mc.fillRect(-4,-4,8,8);mc.strokeRect(-4,-4,8,8);mc.restore()}
if(exitP){mc.fillStyle='#9a5cff';mc.beginPath();mc.arc(tx(exitP.position.x),tz(exitP.position.z),4,0,7);mc.fill()}
if(S.boss&&!S.boss.dead){const bx=S.boss.g.position.x-hx,bz=S.boss.g.position.z-hz,bd=Math.hypot(bx,bz);if(bd*s>W/2-6){mc.fillStyle='#d04fff';const a=Math.atan2(bz,bx);mc.beginPath();mc.arc(W/2+Math.cos(a)*(W/2-7),W/2+Math.sin(a)*(W/2-7),4,0,7);mc.fill()}}
mc.restore();mc.fillStyle='#fff';mc.beginPath();mc.arc(W/2,W/2,3,0,7);mc.fill()}

/* ================= LOOP ================= */
let last=performance.now(),orbit=0,frameN=0,lightT=0;const camT=new THREE.Vector3(),cp=new THREE.Vector3();
function updEmitters(dt){const hp=H.g.position;if(zone.visible&&S.th&&S.th.water&&S.mode==='zone'){const n=Q==='low'?4:12;for(let i=0;i<n;i++)emit(hp.x+rand(-16,16),rand(7,10),hp.z+rand(-14,12),-.8,-16,0,.55,.13,.7,.8,1.1,0,0);S.ltT=(S.ltT||rand(12,25))-dt;if(S.ltT<=0){S.ltT=rand(14,30);skyFlash()}}for(const e of emitters){if((e.w===town&&!town.visible)||(e.w===zone&&!zone.visible))continue;if(Math.abs(e.x-hp.x)>26||Math.abs(e.z-hp.z)>26)continue;
if(e.kind==='fire'){for(let i=0;i<3;i++)emit(e.x+rand(-.4,.4),e.y,e.z+rand(-.4,.4),rand(-.2,.2),rand(1.5,3),rand(-.2,.2),rand(.5,.9),rand(.5,.9),3,rand(.9,1.4),.25,.5,.5);if(Math.random()<.3)emit(e.x,e.y+.5,e.z,rand(-.5,.5),rand(2,4),rand(-.5,.5),rand(1,2),.12,3,1.5,.4,0,.2)}
else if(e.kind==='torch'){if(Math.random()<.7)emit(e.x+rand(-.08,.08),e.y,e.z+rand(-.08,.08),0,rand(.8,1.4),0,rand(.25,.45),rand(.3,.45),3,1.2,.3,.3,.3)}
else if(e.kind==='lamp'){if(Math.random()<.2)emit(e.x,e.y,e.z,0,.05,0,.5,.45,1.5,1,.35,0,0)}
else if(e.kind==='candle'){if(Math.random()<.3)emit(e.x+rand(-.15,.15),e.y,e.z+rand(-.15,.15),0,.3,0,.4,.22,3,1.6,.5,0,0)}
else if(e.kind==='portal'){for(let i=0;i<2;i++){const a=rand(0,6.28),r=rand(1.2,2);emit(e.x+Math.cos(a)*r,e.y+Math.sin(a)*r,e.z+.1,-Math.cos(a)*1.2,-Math.sin(a)*1.2,0,rand(.6,1),rand(.2,.35),1.6,.8,3,0,0)}}}
if(Math.random()<(S.th.embers&&zone.visible?.9:.35)){const x=hp.x+rand(-14,14),z=hp.z+rand(-12,10);if(zone.visible&&S.th.embers)emit(x,rand(0,1),z,rand(-.3,.3),rand(.5,1.3),rand(-.3,.3),rand(2,3.5),rand(.12,.22),3,1.1,.3,0,0);else{const c=zone.visible?C3(S.th.eyes):[.8,.8,.3];emit(x,rand(.4,2.5),z,rand(-.2,.2),rand(-.1,.2),rand(-.2,.2),rand(2,4),rand(.1,.18),c[0]*1.2,c[1]*1.2,c[2]*1.2,0,0)}}}
function assignLights(){const hp=H.g.position;const L=(town.visible?lights.filter(l=>l.w==='town'):lights.filter(l=>l.w==='zone')).map(l=>({l,d:Math.hypot(l.x-hp.x,l.z-hp.z)})).sort((a,b)=>a.d-b.d);
const n=Q==='high'?4:2;torchLights.forEach((tl,i)=>{const x=L[i];if(i<n&&x&&x.d<26){tl.position.set(x.l.x,x.l.y,x.l.z);tl.color.set(x.l.hex);tl.userData.on=true}else{tl.userData.on=false;tl.intensity=0}})}
const $hp=$('hpFill'),$hpT=$('hpTxt'),$mp=$('mpFill'),$mpT=$('mpTxt'),$xp=$('xpFill'),$lv=$('lvlTxt'),$gold=$('gold'),$es=$('esFill');
function frame(now){requestAnimationFrame(frame);grade.uniforms.uTime.value=(now%1000)/1000;let dt=Math.min(.05,(now-last)/1000);if(S.slow>0){S.slow-=dt;dt*=S.slow>0?.3:1}last=now;time+=dt;frameN++;gU.uTime.value=time;
if(S.mode==='town'||S.mode==='zone'||S.mode==='dead'){if(!S.paused)update(dt);H.c.mixer.update(S.paused?0:dt)}
if(town.visible)for(const c of npcChars)c.mixer.update(dt);
netTick(dt);updParticles(S.paused?0:dt);updFx(dt);updNums(dt);if(!S.paused||S.mode==='title')updEmitters(dt);
lightT-=dt;if(lightT<=0){lightT=.4;assignLights()}for(const tl of torchLights)if(tl.userData.on)tl.intensity=18+Math.sin(time*13+tl.userData.ph)*2.5+Math.sin(time*7.3+tl.userData.ph*2)*2;
if(fireLight)fireLight.intensity=55+Math.sin(time*11)*7+Math.sin(time*17.3)*5;if(portalDisc){portalDisc.rotation.z+=dt*.8;portalDisc.material.opacity=.6+Math.sin(time*2)*.12}if(exitP)exitP.children[exitP.children.length-1].rotation.z+=dt;
for(const l of loot){const f=l.fly;if(f.t<1){f.t=Math.min(1,f.t+dt*1.8);l.pos.x=lerp(f.sx,f.tx,f.t);l.pos.z=lerp(f.sz,f.tz,f.t);l.pos.y=1+Math.sin(f.t*Math.PI)*1.8-f.t;if(f.t>=1)l.pos.y=0}
if(l.gem){l.gem.rotation.y+=dt*2;l.gem.position.y=.35+Math.sin(time*3+l.pos.x)*.08}if(l.beam&&f.t>=1)l.beam.scale.y=Math.min(1,l.beam.scale.y+dt*3);
if(f.t>=1&&proj(cp.copy(l.pos).setY(1),sp)){l.sx=sp.x;l.sy=sp.y;l.vis=1}else{l.vis=0;l.el.style.display='none'}}
layoutLoot();
if(OBJ)for(const e of OBJ.ents){if(e.done||!e.el||e.M)continue;const h=e.pick?2.4:e.defend?3.2:e.line?4.4:2.8;if(proj(cp.set(e.x,h,e.z),sp)&&Math.hypot(e.x-H.g.position.x,e.z-H.g.position.z)<32){e.el.style.display='block';e.el.style.transform=`translate(${sp.x}px,${sp.y}px) translate(-50%,-100%)`}else e.el.style.display='none'}
for(const n of NPCS){if(S.mode==='town'&&proj(cp.set(n.lx,n.ly,n.lz),sp)){n.el.style.display='block';n.el.style.transform=`translate(${sp.x}px,${sp.y}px) translate(-50%,-100%)`}else n.el.style.display='none'}
if(S.mode==='title'||S.mode==='load'){orbit+=dt*.06;camera.position.set(Math.cos(orbit)*22,9,Math.sin(orbit)*22);camera.lookAt(0,1.5,-4);sun.position.set(14,30,10);sun.target.position.set(0,0,0)}
else{const p=H.g.position,port=camera.aspect<1?1.3:1;cp.set(p.x,15*port,p.z+13.5*port);camera.position.lerp(cp,1-Math.pow(.003,dt));camT.lerp(p,1-Math.pow(.003,dt));camera.lookAt(camT.x,camT.y+.8,camT.z);
if(S.shake>0){S.shake-=dt;const k=S.shake*.9;camera.position.x+=rand(-k,k);camera.position.y+=rand(-k,k)*.6}sun.position.set(p.x+12,26,p.z+9);sun.target.position.set(p.x,0,p.z)}
if(ST&&P&&S.mode!=='title'&&S.mode!=='load'){const mm=ST.mana*(1-ST.reserve);$hp.style.height=H.hp/ST.hp*100+'%';$hpT.textContent=Math.ceil(H.hp)+' / '+Math.round(ST.hp);$es.style.opacity=H.es>0?Math.min(1,H.es/(ST.hp*.3)):0;
$mp.style.height=H.mana/Math.max(1,mm)*100*(1-ST.reserve)+'%';$mpT.textContent=Math.floor(H.mana)+' / '+Math.round(mm);
$xp.style.width=P.xp/need(P.lvl)*100+'%';$lv.textContent=CLASSES[P.cls].n+' · уровень '+P.lvl+' · '+Math.floor(P.xp)+' / '+need(P.lvl)+' опыта';$gold.textContent=P.gold+' зол.';
const sb=$('skB'),pb=$('pasB');sb.textContent=P.spts;sb.classList.toggle('on',P.spts>0);pb.textContent=P.ppts;pb.classList.toggle('on',P.ppts>0);const z=S.mode==='zone';$('bTown').style.display=z?'block':'none';$('mini').style.display=z?'block':'none';
for(let i=0;i<3;i++)$('s'+i).style.setProperty('--cd',H.cds[i]/((H.cdMax&&H.cdMax[i])||1));if(frameN%6===0)for(let i=0;i<3;i++){const id=P.slots[i],sk=id&&SKILLS[id];let lack=false;if(sk&&sk.mana&&sk.kind!=='aura'){const sp=supOf(id),c=Math.round(sk.mana*(1+.08*(skLvl(id)-1))*(sp?sp.mx:1));lack=ST.bloodMagic?H.hp<=c+1:H.mana<c}$('s'+i).classList.toggle('nomana',lack)}$('sDash').style.setProperty('--cd',H.dashCd/(H.dashMax||2.5));$('sFlask').style.setProperty('--cd',1-Math.min(1,H.flask));$('flaskN').textContent=Math.floor(H.flask);
$('buffs').innerHTML=H.buffs.map(b=>`<span>${b.n} ${Math.ceil(b.t)}с</span>`).join('')+activeAuras().map(id=>`<span class="au">${SKILLS[id].n}</span>`).join('');
const n=nearNpc(),ib=$('interact');ib.classList.toggle('on',!!n&&!S.paused);if(n)ib.textContent=(n.id==='portal'?'Открыть портал':n.id==='stash'?'Открыть хранилище':'Говорить: '+n.name)+(touch?'':' (Enter)');
S.hurtV=Math.max(0,S.hurtV-dt*2.5);const low=H.hp/ST.hp<.3?.35+Math.sin(time*6)*.15:0;$('vig').style.opacity=Math.max(S.hurtV*.8,low);if(frameN%3===0)drawMini()}
if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').classList.remove('on')}
composer.render()}

/* ================= NETWORK (кооператив) ================= */
const NET={ws:null,id:null,room:null,host:true,on:false,peers:{},sendT:0,snapT:0,name:'',pendingJoin:null,leaderZone:null,syncWait:false};
try{NET.name=localStorage.getItem('tlen_name')||''}catch(e){}
const isGuest=()=>NET.on&&!NET.host;
const zkey=()=>S.mode==='zone'&&S.zone?(S.zone.n+'|'+S.L+'|'+S.seed):'town';
function nsend(o){if(NET.ws&&NET.ws.readyState===1)try{NET.ws.send(JSON.stringify(o))}catch(e){}}
function partyN(){return 1+Object.values(NET.peers).filter(p=>p.cls).length}
function zonePeers(){const k=zkey();return Object.values(NET.peers).filter(p=>p.zk===k&&p.g&&!p.dead)}
function nearestPlayer(q){let best={x:H.g.position.x,z:H.g.position.z,peer:null,d:Math.hypot(H.g.position.x-q.x,H.g.position.z-q.z)};if(S.mode==='dead')best.d=999;
for(const pr of zonePeers()){const d=Math.hypot(pr.g.position.x-q.x,pr.g.position.z-q.z);if(d<best.d)best={x:pr.g.position.x,z:pr.g.position.z,peer:pr,d}}return best}
function hurtTarget(t,d,src){if(t.peer)nsend({t:'hurt',to:t.peer.id,d});else hurtHero(d,src)}
function myLook(){const w=P.eq.weapon,o=P.eq.offhand,C=CLASSES[P.cls];return{w:w?WBASE[w.wb].mesh:null,wr:w?w.rar:0,wu:w?w.upg:0,o:o&&!(w&&WBASE[w.wb].hands===2)?o.mesh:null,hat:!!P.eq.helmet,cape:P.eq.chest?P.eq.chest.rar:-1}}
function sendInfo(){if(!P)return;nsend({t:'info',name:NET.name||CLASSES[P.cls].n,cls:P.cls,lvl:P.lvl,look:myLook()})}
const WSBASE=/workers\.dev$|^localhost|^127\./.test(location.hostname)?(location.protocol==='https:'?'wss://':'ws://')+location.host:'wss://tlen-game.zemlitlena.workers.dev';
function netConnect(code){netLeave(true);code=code.toUpperCase().replace(/[^A-Z0-9]/g,'');if(code.length<4){toast('Код группы — 4–8 символов',2);return}
const ws=/[?&]net=cf/.test(location.search)?new WebSocket(WSBASE+'/ws/'+code):new RelaySocket(code,(location.search.match(/[?&]broker=([^&]+)/)||[])[1]?[decodeURIComponent(location.search.match(/[?&]broker=([^&]+)/)[1])]:undefined);NET.ws=ws;NET.room=code;
ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(_){return}onNet(m)};
ws.onclose=()=>{if(NET.ws!==ws)return;NET.on=false;NET.ws=null;for(const id in NET.peers)dropPeer(id);NET.host=true;toast('Связь с группой потеряна',2.5);renderParty()};
ws.onerror=()=>{if(NET.ws===ws)toast('Не удалось подключиться к группе',2.5)}}
function netLeave(silent){if(NET.ws){const w=NET.ws;NET.ws=null;try{w.close()}catch(e){}}for(const id in NET.peers)dropPeer(id);NET.on=false;NET.host=true;NET.room=null;if(!silent){toast('Ты покинул группу',1.5);renderParty()}}
function dropPeer(id){const pr=NET.peers[id];if(!pr)return;if(pr.g)pr.g.parent&&pr.g.parent.remove(pr.g);if(pr.el)pr.el.remove();delete NET.peers[id];renderPartyHud()}
function setHost(h){const was=NET.host;NET.host=h===NET.id;if(NET.host&&!was&&NET.on){toast('Ты теперь лидер группы',2);S.mid=Math.max(S.mid,...mons.map(m=>m.id+1),0)}}
async function ensurePeer(m){let pr=NET.peers[m.from];if(!pr)pr=NET.peers[m.from]={id:m.from,name:'Игрок',cls:null,x:0,z:0,f:0,zk:'',U:'Idle',L:'Idle',hp:1,mx:1};
if(m.t==='info'){const ch=pr.cls!==m.cls;Object.assign(pr,{name:m.name,cls:m.cls,lvl:m.lvl,look:m.look});if(ch||!pr.c){await loadAsset(CLASSES[m.cls].model);if(pr.g&&pr.g.parent)pr.g.parent.remove(pr.g);
pr.c=makeChar(CLASSES[m.cls].model,{show:[],keepHead:1,layered:1});pr.g=new THREE.Group();pr.g.add(pr.c.root);pr.g.position.set(pr.x,0,pr.z);scene.add(pr.g);
if(!pr.el){pr.el=document.createElement('div');pr.el.className='peerl';$('npcl').appendChild(pr.el)}}peerLook(pr);renderPartyHud()}return pr}
function peerLook(pr){if(!pr.c||!pr.look)return;const ms=pr.c.meshes,lk=pr.look,C=CLASSES[pr.cls];for(const n of ALLW)if(ms[n])ms[n].visible=false;if(lk.w&&ms[lk.w]){ms[lk.w].visible=true;setEnchant(ms[lk.w],lk.wu||0,lk.wr||0)}if(lk.o&&ms[lk.o])ms[lk.o].visible=true;
if(C.hat&&ms[C.hat])ms[C.hat].visible=lk.hat;if(C.cape&&ms[C.cape])ms[C.cape].visible=lk.cape>=0;if(pr.el)pr.el.innerHTML=`${esc(pr.name)} <small>${C.n} · ${pr.lvl}</small><i style="--p:${Math.round(pr.hp/pr.mx*100)}%"></i>`}
function myAnim(){return H.c?[H.c.lay.U.n,H.c.lay.L.n]:['Idle','Idle']}
function netTick(dt){if(!NET.on||!P||!H.c)return;NET.sendT-=dt;if(NET.sendT<=0){NET.sendT=.1;const p=H.g.position,[U,L]=myAnim();
nsend({t:'st',x:+p.x.toFixed(2),z:+p.z.toFixed(2),f:+H.face.toFixed(2),U,L,zk:zkey(),hp:Math.round(H.hp),mx:Math.round(ST.hp),y:+(H.c.root.position.y||0).toFixed(2),dead:S.mode==='dead'?1:0})}
if(NET.host&&S.mode==='zone'&&zonePeers().length){NET.snapT-=dt;if(NET.snapT<=0){NET.snapT=.12;const ms=[];for(const M of mons){if(M.dead)continue;
ms.push([M.id,+M.g.position.x.toFixed(1),+M.g.position.z.toFixed(1),+M.face.toFixed(2),Math.round(M.hp),M.c.curN,M.aggro?1:0])}nsend({t:'snap',zk:zkey(),ms,obj:OBJ&&OBJ.t==='defend'?OBJ.have:undefined})}}
// peers render
for(const id in NET.peers){const pr=NET.peers[id];if(!pr.g)continue;const vis=pr.zk===zkey();pr.g.visible=vis;if(!vis){if(pr.el)pr.el.style.display='none';continue}
const g=pr.g.position;const k=1-Math.pow(.0005,dt);g.x+=(pr.x-g.x)*k;g.z+=(pr.z-g.z)*k;pr.c.root.position.y=pr.y||0;pr.c.root.rotation.y=angLerp(pr.c.root.rotation.y,pr.f,k);
if(pr.c.lay.U.n!==pr.U)pr.c.playL('U',pr.U,{fade:.1});if(pr.c.lay.L.n!==pr.L)pr.c.playL('L',pr.L,{fade:.1});pr.c.mixer.update(dt);
if(pr.el&&proj(cp.set(g.x,3,g.z),sp)){pr.el.style.display='block';pr.el.style.transform=`translate(${sp.x}px,${sp.y}px) translate(-50%,-100%)`}else if(pr.el)pr.el.style.display='none'}}
const monById=id=>mons.find(m=>m.id===id);
async function onNet(m){const t=m.t;
if(t==='rift'){if(m.zk!==zkey()||!S.rift)return;const R=S.rift;if(m.st===1){if(R.st===0)toast('Разлом открыт!',2);R.st=1;R.r=m.r;R.t=m.tt;R.k=m.k}else if(m.st===2&&R.st===1){R.k=m.k;R.t=0;R.fin=1}return}
if(t==='gift'){if(m.to&&m.to!==NET.id)return;const it=m.it;if(!it)return;it.id=uid++;if(P.bag.length<36){P.bag.push(it);toast((NET.peers[m.from]&&NET.peers[m.from].name||'Союзник')+' передал вам: '+it.name,3);chime([660,880,1100],.08);save()}else{stashLoad().tabs[0].push(it);stashSave();toast('Подарок отправлен в хранилище: '+it.name,3)}return}
if(t==='hello'){NET.id=m.id;NET.on=true;setHost(m.host);toast('Ты в группе '+NET.room+(NET.host?' · ты лидер':''),2.5);sendInfo();renderParty();return}
if(t==='full'){toast('Группа уже заполнена (3 игрока)',2.5);netLeave(true);return}
if(t==='join'){setHost(m.host);sendInfo();toast('В группу вошёл новый игрок',1.8);return}
if(t==='leave'){const pr=NET.peers[m.id];if(pr)toast(pr.name+' покинул группу',1.8);dropPeer(m.id);setHost(m.host);renderParty();return}
if(t==='info'){await ensurePeer(m);renderParty();return}
const pr=NET.peers[m.from];
if(t==='st'){const p=pr||await ensurePeer(m);const wasZk=p.zk;Object.assign(p,{x:m.x,z:m.z,f:m.f,U:m.U,L:m.L,zk:m.zk,hp:m.hp,mx:m.mx,y:m.y,dead:m.dead});if(p.g&&wasZk!==m.zk)p.g.position.set(m.x,0,m.z);
if(p.el&&p.look)p.el.querySelector('i')&&p.el.querySelector('i').style.setProperty('--p',Math.round(m.hp/m.mx*100)+'%');
if(NET.host&&m.zk===zkey()&&S.mode==='zone'&&wasZk!==m.zk)sendSync(m.from);return}
if(t==='zone'){NET.leaderZone=m;if(S.mode==='town'){toast('Лидер открыл портал: '+m.zone.n+'. Подойди к порталу, чтобы войти.',4)}renderParty();return}
if(t==='hurt'){if(S.mode==='zone')hurtHero(m.d);return}
if(m.zk&&m.zk!==zkey())return;
if(t==='cast'&&pr&&pr.g){ghostCast(pr,m);return}
if(t==='ba'&&pr&&pr.g){ghostBasic(pr,m);return}
if(S.mode!=='zone')return;
if(t==='snap'&&isGuest()){for(const r of m.ms){const M=monById(r[0]);if(!M||M.dead)continue;M.net={x:r[1],z:r[2],f:r[3],a:r[5]};M.hp=r[4];if(r[6]&&!M.aggro)wake(M)}
if(m.obj!==undefined&&OBJ&&OBJ.t==='defend'){const e=OBJ.ents[0];if(e){e.prog=m.obj;OBJ.have=m.obj}}return}
if(t==='spawn'&&isGuest()){if(monById(m.id))return;S.building=true;const M=spawnMon(m.type,m.x,m.z,{rare:m.rare,net:1,id:m.id});S.building=false;if(M&&m.aw)wake(M);return}
if(t==='kill'){const M=monById(m.id);if(M&&!M.dead){M.netKill=1;killMon(M)}return}
if(t==='hit'&&NET.host){const M=monById(m.id);if(M&&!M.dead){dealDmg(M,{el:m.el,ignite:m.ig,stun:m.st,poison:m.po,bleed:m.bl,fromPeer:1,crit:m.c},m.d)}return}
if(t==='tele'){tele(m.x,m.z,m.R,m.dl,m.d,m.col,null,1);return}
if(t==='eshot'){enemyShot(m.x,m.z,m.a,m.s,m.d,m.col,1,m.k);return}
if(t==='bcast'){const M=monById(m.id);if(M)num(M.g.position.clone().setY(3.4*M.sc),m.n,'cast');return}
if(t==='objdone'){if(!OBJ)return;const e=OBJ.ents[m.i];if(e&&!e.done)completeEnt(e,1);return}
if(t==='amb'&&NET.host){if(!OBJ)return;const e=OBJ.ents[m.i];if(e)ambush(e,e.amb);return}
if(t==='chest'){const c=chests[m.i];if(c&&!c.open){c.open=true;c.o.rotation.z=.08;c.o.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.color.multiplyScalar(.55)}})}return}
if(t==='sync'&&isGuest()){for(const id of m.dead){const M=monById(id);if(M&&!M.dead){M.netKill=1;M.silent=1;killMon(M)}}S.building=true;for(const s of m.sp)if(!monById(s.id))spawnMon(s.type,s.x,s.z,{rare:s.rare,net:1,id:s.id});S.building=false;
if(OBJ)for(const i of m.od){const e=OBJ.ents[i];if(e&&!e.done)completeEnt(e,1,1)}for(const i of m.ch){const c=chests[i];if(c)c.open=true}return}}
function sendSync(to){const alive=new Set(mons.filter(m=>!m.dead).map(m=>m.id));const dead=[];for(let i=0;i<S.mid;i++)if(!alive.has(i))dead.push(i);
nsend({t:'sync',to,zk:zkey(),dead,sp:mons.filter(m=>!m.dead&&m.dyn).map(m=>({id:m.id,type:m.type,x:+m.g.position.x.toFixed(1),z:+m.g.position.z.toFixed(1),rare:m.rare})),od:OBJ?OBJ.ents.map((e,i)=>e.done?i:-1).filter(i=>i>=0):[],ch:chests.map((c,i)=>c.open?i:-1).filter(i=>i>=0)})}
// визуальные повторы умений союзников
function ghostBasic(pr,m){const g=pr.g.position,C=CLASSES[pr.cls];if(C.ranged){const a=Math.atan2(m.tx-g.x,m.tz-g.z),dir=new THREE.Vector3(Math.sin(a),0,Math.cos(a));spawnProj(new THREE.Vector3(g.x+dir.x*.6,1.5,g.z+dir.z*.6),dir,{el:C.basicEl,speed:pr.cls==='rogue'?32:24,life:.8,ctx:{ghost:1,el:C.basicEl},arrow:pr.cls==='rogue',size:1})}
else arcFx(g.x,g.z,m.f,2.8,100,'#e8e0d0')}
function ghostCast(pr,m){const sk=SKILLS[m.sk];if(!sk)return;const g=pr.g.position,f=m.f,ec=EL[sk.el||'phys'].c,ctx={ghost:1,el:sk.el||'phys',m:0};
switch(sk.kind){case'proj':{const n=sk.p.n||1,spread=(sk.p.spread||(n>1?20+n*4:0))*Math.PI/180;for(let i=0;i<n;i++){const a=f+(n>1?(sk.p.spread>=360?i/n*Math.PI*2:-spread/2+spread*i/(n-1)):0),dir=new THREE.Vector3(Math.sin(a),0,Math.cos(a));
spawnProj(new THREE.Vector3(g.x+dir.x*.7,1.4,g.z+dir.z*.7),dir,{el:sk.el,speed:sk.p.speed,life:sk.p.life||1.1,pierce:99,explode:sk.p.explode,size:sk.p.size,wobble:sk.p.wobble,ctx,arrow:pr.cls==='rogue'&&!sk.p.axe,axe:sk.p.axe,wave:sk.p.wave})}break}
case'nova':novaFx(g.x,g.z,sk.p.r,ec);break;case'aoe':case'ground':case'totem':case'trap':ringFx(m.tx,m.tz,(sk.p.r||3),ec,.6);burst({x:m.tx,y:.5,z:m.tz},ec,30,5,.45,.6,2.2);break;
case'chain':lightning(g.clone().setY(1.5),new THREE.Vector3(m.tx,1.2,m.tz));break;case'cone':arcFx(g.x,g.z,f,sk.p.r,sk.p.arc,'#e8e0d0');break;
case'slam':case'wave':case'leap':slamAt(m.tx,m.tz,sk.p.r||3,ctx,ec);break;case'orb':{const dir=new THREE.Vector3(Math.sin(f),0,Math.cos(f));spawnProj(new THREE.Vector3(g.x+dir.x,1.5,g.z+dir.z),dir,{el:'light',speed:sk.p.speed,life:sk.p.life,pierce:999,size:3,ctx})}break;
case'warcry':case'buff':case'summon':ringFx(g.x,g.z,sk.p.r||2.5,'#ffd774',.5);break}}
// ----- группа: UI
function renderParty(){const box=$('partyBox');if(!box)return;const link=NET.room?location.origin+location.pathname+'?room='+NET.room:'';
if(!NET.on){box.innerHTML=`<label class="fl">Имя героя<input id="pName" maxlength="16" value="${esc(NET.name)}" placeholder="${P?CLASSES[P.cls].n:'Имя'}"></label>
<div class="acts"><button class="ab" data-pa2="create">Создать группу</button></div><label class="fl">Или войти по коду<input id="pCode" maxlength="8" placeholder="Например, K7QX"></label><div class="acts"><button class="ab alt" data-pa2="join">Войти</button></div>
<div class="sect" style="margin-top:14px"><span>Открытые группы</span><button class="chip" data-pa2="lobby">Обновить</button></div><div id="lobbyList">${lobbyHTML()}</div><p class="muted">Играть вместе могут до 3 героев. Каждый получает свою добычу. Сложность монстров растёт с размером группы.</p>`;lobbyOpen();return}
const mem=[`<li><b>${esc(NET.name||CLASSES[P.cls].n)}</b> · ${CLASSES[P.cls].n} ${P.lvl}${NET.host?' · <span class="lead">лидер</span>':''} (ты)</li>`].concat(Object.values(NET.peers).map(p=>`<li><b>${esc(p.name)}</b> · ${p.cls?CLASSES[p.cls].n:''} ${p.lvl||''}</li>`)).join('');
box.innerHTML=`<p>Код группы: <b class="code">${NET.room}</b></p><div class="acts"><button class="ab" data-pa2="copy">Скопировать приглашение</button><button class="ab alt" data-pa2="leave">Покинуть группу</button></div><ul class="mem">${mem}</ul>
${NET.leaderZone&&!NET.host?`<p class="muted">Лидер открыл: ${esc(NET.leaderZone.zone.n)}. Иди к порталу в лагере.</p>`:''}<p class="muted">Ссылка для друзей: <span class="lnk">${esc(link)}</span></p>${NET.host?`<label class="hcl" style="justify-content:flex-start"><input type="checkbox" id="openChk" ${NET.open?'checked':''}> Открытая группа — видна всем в списке «Открытые группы»</label>`:''}`}
$('partyBox').addEventListener('change',e=>{if(e.target.id==='openChk'){NET.open=e.target.checked;advTick(true)}});
$('partyBox').addEventListener('click',e=>{const jb=e.target.closest('[data-lj]');if(jb){lobbyClose();netConnect(jb.dataset.lj);setTimeout(renderParty,300);return}const b=e.target.closest('[data-pa2]');if(!b)return;if(b.dataset.pa2==='lobby'){lobbyClose();lobbyOpen();return}const a=b.dataset.pa2;const nm=$('pName');if(nm){NET.name=nm.value.trim().slice(0,16);try{localStorage.setItem('tlen_name',NET.name)}catch(_){}}
if(a==='create'){const c=Array.from({length:5},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)]).join('');netConnect(c)}
if(a==='join'){netConnect(($('pCode').value||'').trim())}if(a==='leave'){netLeave()}
if(a==='copy'){const link=location.origin+location.pathname+'?room='+NET.room;const txt='Заходи ко мне в «Земли Тлена»: '+link;try{navigator.clipboard.writeText(txt).then(()=>toast('Приглашение скопировано',1.5),()=>toast(link,6))}catch(_){toast(link,6)}
if(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.openTelegramLink){try{Telegram.WebApp.openTelegramLink('https://t.me/share/url?url='+encodeURIComponent(link)+'&text='+encodeURIComponent('Заходи в мою группу в «Земли Тлена»'))}catch(_){}}}
setTimeout(renderParty,300)});
function renderPartyHud(){const el=$('partyHud');if(!el)return;el.innerHTML=Object.values(NET.peers).filter(p=>p.cls).map(p=>`<div class="pm"><b>${esc(p.name)}</b> <small>${CLASSES[p.cls].n} ${p.lvl}${p.zk===zkey()?'':' · '+(p.zk==='town'?'в лагере':'в другой зоне')}</small><i style="--p:${Math.round((p.hp||1)/(p.mx||1)*100)}%"></i></div>`).join('')}
setInterval(()=>{if(NET.on)renderPartyHud()},700);

/* ================= BOOT ================= */
(async()=>{try{const u=new URL(location.href);const rm=u.searchParams.get('room')||(window.Telegram&&Telegram.WebApp&&Telegram.WebApp.initDataUnsafe&&Telegram.WebApp.initDataUnsafe.start_param);if(rm)NET.pendingJoin=rm;if(window.Telegram&&Telegram.WebApp){Telegram.WebApp.ready();Telegram.WebApp.expand()}}catch(e){}applyQ();requestAnimationFrame(frame);const base=['anim_hero','anim_skel','props','skeleton_warrior','skeleton_minion','skeleton_rogue','skeleton_mage','merchant','barbarian','knight'];
try{await loadMany(base,()=>{$('lFill').style.width=loadedN/base.length*100+'%'})}catch(e){console.error(e);$('lTxt').textContent='Не удалось загрузить модели. Обнови страницу.';return}
$('lTxt').textContent='Строю мир…';await new Promise(r=>setTimeout(r,30));
buildTown();town.visible=true;zone.visible=false;setEnv('#1c1a26',.016,'#ffc08a',2.6,'#8090c0');renderer.compile(scene,camera);
S.mode='title';$('ovLoad').classList.remove('on');$('ovTitle').classList.add('on');cloudLoad(ok=>{if(ok)toast('Прогресс загружен из облака Telegram',2.5);renderChars()});renderChars();setPaused();
window.__dbg={S,H,dropDiv:p=>dropDiv(p),dropItem:(p,it)=>dropItem(p,it),dropOrb:p=>dropOrb(p),genItem:(...a)=>genItem(...a),heroLook:()=>heroLook(),togglePanel:(w,c)=>togglePanel(w,c),get P(){return P},enterZone,mons:()=>mons,castSkill,gainXp,SK:SKILLS,ST:()=>ST,obj:()=>OBJ,kill:m=>killMon(m),NET,joinLeader:()=>{const z=NET.leaderZone;if(z)enterZone(z.zi,z.tier,z)}}})();

/* ================= ТОРГОВКА И КУЗНИЦА ================= */
const T={tab:'sell',tray:new Set(),last:null,buySel:null,sm:null,res:null};
const goldPill=()=>uiI('gold','#ffd774')+P.gold+' зол.';
const itId=it=>{if(it.id==null)it.id=uid++;return it.id};
function isUpg(it){if(!it||!P.eq||!SLOTS.includes(it.slot))return false;const eq=Object.assign({},P.eq,{[it.slot]:it});if(it.slot==='weapon'&&WBASE[it.wb]&&WBASE[it.wb].hands===2)delete eq.offhand;const a=ST,b=calc(eq);
return b.dps>a.dps*1.03||(Math.abs(b.dps-a.dps)<a.dps*.01&&(b.hp>a.hp+3||b.armor>a.armor+3))}
function tcell(it,o={}){const pr=o.pr!=null?`<span class="pr ${o.no?'no':''}">${o.pr}</span>`:'';const up=o.up?'<span class="upb">▲</span>':'';
return `<button class="cell ${o.cls||''} ${pr?'has-pr':''}" ${o.attr||''} style="color:${RC[it.rar]};border-color:${RC[it.rar]}66;box-shadow:inset 0 0 12px ${RC[it.rar]}22">${itIcon(it)}${it.upg?`<small>+${it.upg}</small>`:''}${up}${pr}</button>`}
function detHTML(it,acts=''){return `<div class="tdet">${ttHTML(it)}${cmpHTML(it)}${acts?`<div class="acts">${acts}</div>`:''}</div>`}
function renderShop(){$('shGold').innerHTML=goldPill();document.querySelectorAll('#shTabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===T.tab));
for(const id of [...T.tray])if(!P.bag.some(it=>itId(it)===id))T.tray.delete(id);
let h='';
if(T.tab==='sell'){const tr=P.bag.filter(it=>T.tray.has(itId(it)));const sum=tr.reduce((a,it)=>a+price(it),0);
h+=`<div class="sect"><span>Ваше предложение</span></div><div class="chips" style="margin:-2px 0 8px"><button class="chip" data-q="0">+ Обычные</button><button class="chip" data-q="1">+ Магические</button><button class="chip" data-q="2">+ Редкие</button><button class="chip" data-q="all">Всё</button>${tr.length?'<button class="chip" data-q="clr">Очистить</button>':''}</div>`;
h+=`<div class="tray">${tr.length?'<div class="bag">'+tr.map(it=>tcell(it,{pr:price(it),attr:`data-tr="${itId(it)}"`})).join('')+'</div>':'<div class="hint">Нажимайте на вещи в сумке — они появятся здесь. Нажмите ещё раз, чтобы убрать.</div>'}</div>`;
const rare=tr.filter(it=>it.rar>=2||it.upg>0).length;
h+=`<div class="deal"><div class="sum">Вещей: ${tr.length} · вы получите <b>${sum}</b> зол.${rare?`<br><small style="color:#ffb35a">Среди них ${rare} редк./уник./заточенных</small>`:''}</div><button class="ab" data-a="sellgo" ${tr.length?'':'disabled'}>Продать</button></div>`;
h+=`<div class="sect"><span>Сумка ${P.bag.length}/36</span><small style="text-transform:none;letter-spacing:0">▲ — лучше надетого</small></div><div class="bag">`;
for(let i=0;i<36;i++){const it=P.bag[i];h+=it?tcell(it,{pr:price(it),up:isUpg(it),cls:T.tray.has(itId(it))?'intray':'',attr:`data-sb="${i}"`}):'<button class="cell" disabled style="cursor:default"></button>'}
h+='</div>';const L=T.last!=null&&P.bag.find(it=>itId(it)===T.last);if(L)h+=detHTML(L)}
else{h+=`<div class="sect"><span>Снаряжение</span><span style="text-transform:none;letter-spacing:0">цена × уровень зоны</span></div><div class="bag">`+
(S.shop.length?S.shop.map((it,i)=>{const pr=price(it)*4;return tcell(it,{pr,no:P.gold<pr,up:isUpg(it),cls:T.buySel===i?'sel':'',attr:`data-buy="${i}"`})}).join(''):'<div class="muted">Товар раскуплен — загляни после следующего похода.</div>')+'</div>';
const B=T.buySel!=null&&S.shop[T.buySel];if(B){const pr=price(B)*4;h+=detHTML(B,`<button class="ab" data-a="buygo" ${P.gold<pr||P.bag.length>=36?'disabled':''}>Купить за ${pr} зол.</button>${P.bag.length>=36?'<span class="muted">Сумка полна</span>':''}`)}
h+=divHTML();h+='<div class="sect"><span>Сферы</span></div>'+['trans','alt','aug'].map(k=>{const pr=orbPrice(k);return `<div class="orbrow">${uiI('orb:'+k,ORBS[k].c)}<div><b style="color:${ORBS[k].c}">${ORBS[k].n} <small style="display:inline;color:#a99f8f">· у вас ${P.orbs[k]||0}</small></b><small>${ORBS[k].d}</small></div><button class="ab" data-bo="${k}" ${P.gold<pr?'disabled':''}>${pr} зол.</button></div>`}).join('')}
$('shBody').innerHTML=h}
$('pShop').addEventListener('click',e=>{const dv=e.target.closest('[data-dv]');if(dv){const C=DIV.find(c=>c.id===dv.dataset.dv);if(C&&(P.cards[C.id]||0)>=C.need){P.cards[C.id]-=C.need;C.f();toast('Обмен: '+C.rw,3);chime([523,659,784,1047,1319],.1);haptic('ok');save();renderShop()}return}const b=e.target.closest('[data-tab],[data-sb],[data-tr],[data-q],[data-a],[data-buy],[data-bo]');if(!b)return;const d=b.dataset;
if(d.tab){T.tab=d.tab;T.buySel=null}
else if(d.sb!==undefined){const it=P.bag[+d.sb];if(!it)return;const id=itId(it);T.tray.has(id)?T.tray.delete(id):T.tray.add(id);T.last=id;snd(900,.04,'square',.03)}
else if(d.tr!==undefined){T.tray.delete(+d.tr);T.last=+d.tr}
else if(d.q){if(d.q==='clr')T.tray.clear();else for(const it of P.bag)if(d.q==='all'||(it.rar===+d.q&&it.upg===0))T.tray.add(itId(it))}
else if(d.a==='sellgo'){let g=0,n=0;P.bag=P.bag.filter(it=>{if(T.tray.has(itId(it))){g+=price(it);n++;return false}return true});T.tray.clear();T.last=null;P.gold+=g;if(n){toast('Продано '+n+' предм. за '+g+' зол.',2);snd(1200,.08,'square',.05);setTimeout(()=>snd(1500,.08,'square',.05),90)}save()}
else if(d.buy!==undefined){T.buySel=+d.buy}
else if(d.a==='buygo'){const it=S.shop[T.buySel];if(!it)return;const pr=price(it)*4;if(P.gold<pr||P.bag.length>=36)return;P.gold-=pr;P.bag.push(it);S.shop.splice(T.buySel,1);T.buySel=null;toast('Куплено: '+it.name,1.5);snd(1200,.08,'square',.05);save()}
else if(d.bo){const pr=orbPrice(d.bo);if(P.gold<pr)return;P.gold-=pr;P.orbs[d.bo]=(P.orbs[d.bo]||0)+1;snd(1200,.08,'square',.05);save()}
renderShop()});
/* кузница */
function smItems(){const L=[];for(const s of SLOTS)if(P.eq[s])L.push({it:P.eq[s],w:'eq',k:s});P.bag.forEach((it,i)=>L.push({it,w:'bag',k:i}));return L}
function upRows(it){const a=1+.1*it.upg,b=a+.1,R=[['Сила вещи','+'+it.upg*10+'%','+'+(it.upg+1)*10+'%']],r=Math.round;
if(it.dmg)R.push(['Урон',`${r(it.dmg[0]*a)}–${r(it.dmg[1]*a)}`,`${r(it.dmg[0]*b)}–${r(it.dmg[1]*b)}`]);
if(it.armor)R.push(['Броня',r(it.armor*a),r(it.armor*b)]);
if(it.imp)R.push([STAT_N[it.imp.k]||it.imp.k,fmt(it.imp.v*a,Math.abs(it.imp.v)>=5),fmt(it.imp.v*b,Math.abs(it.imp.v)>=5)]);
for(const f of it.aff){const A=AFF[f.k];R.push([A.t.replace('{v}','').replace(/^[\s+%]+/,'').trim()||f.k,fmt(f.v*a,A.i),fmt(f.v*b,A.i)])}return R}
const glowName=u=>u>=10?'лучи':u>=6?'аура':u>=1?'мерцание':'нет';
function renderSmith(){$('smGold').innerHTML=goldPill();const L=smItems();
if(!T.sm||!L.some(x=>x.it===T.sm))T.sm=(P.eq.weapon)||(L[0]&&L[0].it)||null;
let list='<div><div class="sect" style="margin-top:0"><span>Что заточить</span></div><div class="smlist">'+(L.length?L.map(x=>{const it=x.it,mx=it.upg>=10;return `<div role="button" class="smrow ${T.sm===it?'sel':''}" data-sm="${x.w}:${x.k}">${tcell(it).replace(/^<button/,'<span').replace(/<\/button>$/,'</span>')}<span><b style="color:${RC[it.rar]}">${esc(it.name)}</b><small>${x.w==='eq'?'надето · '+SLOT_N[it.slot]:'в сумке · '+SLOT_N[it.slot]}${mx?' · предел':' · шанс '+upChance(it)+'%'}</small></span><span class="lv">+${it.upg}</span></div>`}).join(''):'<p class="muted">Нет вещей.</p>')+'</div></div>';
let anv='<div class="anvil">';const it=T.sm;
if(!it)anv+='<p class="muted">Выберите вещь слева.</p>';
else{const u=it.upg,mx=u>=10||it.corr;anv+=`<div class="big">${tcell(it)}</div><h4 style="color:${RC[it.rar]}">${esc(it.name)}</h4><div class="lvl">+${u}${mx?'':`<span>→</span>+${u+1}`}</div>`;
anv+='<div class="pips">'+Array.from({length:10},(_,i)=>`<i class="${i<u?'on':i===u&&!mx?'nx':''}"></i>`).join('')+'</div><div class="pipl">'+Array.from({length:10},(_,i)=>`<span>${i===0?'мерцание':i===5?'аура':i===9?'лучи':''}</span>`).join('')+'</div>';
if(mx)anv+=it.corr?'<p class="res fail">Осквернённую вещь нельзя заточить.</p>':'<p class="res ok">Заточено до предела — оружие сияет лучами.</p>';
else{const c=upCost(it),ch=upChance(it),col=ch>=80?'#5ee07a':ch>=50?'#ffd774':'#ff7a6a';
anv+='<div class="urows">'+upRows(it).map(r=>`<div><span>${esc(String(r[0]))}</span><span><span class="a">${r[1]}</span> → <span class="b">${r[2]}</span></span></div>`).join('')+'</div>';
const ng=glowName(u+1);if(ng!==glowName(u))anv+=`<div class="risk" style="color:#ffd774">На +${u+1} появится свечение: ${ng}</div>`;
anv+=`<div class="chance"><div class="bar"><i style="width:${ch}%;background:${col}"></i></div><b style="color:${col}">${ch}%</b></div>`;
anv+=`<div class="risk">${ch>=100?'Без риска.':`При неудаче золото сгорит, вещь останется +${u}.`}</div>`;
anv+=`<button class="ab" data-a="upgo" ${P.gold<c?'disabled':''}>Заточить · ${c} зол.</button>${P.gold<c?`<div class="risk" style="color:#ff7a6a;margin-top:6px">Не хватает ${c-P.gold} зол.</div>`:''}`}
anv+=`<p class="res ${T.res?T.res.k:''}">${T.res?T.res.t:''}</p>`}
anv+='</div>'+benchHTML(it);$('smBody').innerHTML=list+'<div>'+anv+'</div>';
if(T.res&&T.res.fresh){T.res.fresh=false;const a=$('smBody').querySelector('.anvil');a.classList.add(T.res.k)}}
$('pSmith').addEventListener('click',e=>{const es=e.target.closest('[data-ess]');if(es){const k=es.dataset.ess,it=T.sm;if(!it||!(P.ess&&P.ess[k]>0)||it.rar===3||it.aff.some(a=>a.k===k)||!itemPool(it.slot).includes(k))return;const[a,b]=AFF[k].r(it.ilvl);P.ess[k]--;it.aff.push({k,v:b*1.3,es:1});if(it.rar<2){it.rar=2;nameIt(it)}chime([523,784,1047,1568],.1);haptic('ok');recalc();save();renderSmith();return}const bc=e.target.closest('[data-bench]');if(bc){benchDo(bc.dataset.bench);return}const b=e.target.closest('[data-sm],[data-a]');if(!b)return;
if(b.dataset.sm){const [w,k]=b.dataset.sm.split(':');T.sm=w==='eq'?P.eq[k]:P.bag[+k];T.res=null}
else if(b.dataset.a==='upgo'){const it=T.sm;if(!it||it.upg>=10)return;const c=upCost(it);if(P.gold<c)return;P.gold-=c;
if(Math.random()*100<upChance(it)){it.upg++;csAdd('up',it.upg,1);T.res={k:'ok',t:'Успех! Теперь +'+it.upg,fresh:true};snd(660,.12,'triangle',.15);setTimeout(()=>snd(990,.25,'triangle',.15),100);npcChars[1]&&npcChars[1].play('Cheer',{once:true,restart:true})}
else{T.res={k:'fail',t:'Металл не выдержал. Золото сгорело, вещь цела.',fresh:true};snd(120,.4,'sawtooth',.12,.5)}recalc();save()}
renderSmith()});

/* хранилище — общее для всех героев этого браузера */
const STASH_KEY='tlen3_stash',ST_N=48;let STASH=null,stTab=0;
function stashLoad(){if(STASH)return STASH;try{STASH=JSON.parse(localStorage.getItem(STASH_KEY))}catch(e){}if(!STASH||!Array.isArray(STASH.tabs))STASH={tabs:[[],[],[],[]],names:['Общая','Оружие','Броня','Ценное']};for(const t of STASH.tabs)for(const it of t)if(it&&it.id!=null&&it.id>=uid)uid=it.id+1;return STASH}
function stashSave(){try{localStorage.setItem(STASH_KEY,JSON.stringify(STASH))}catch(e){}}
function renderStash(){const S0=stashLoad(),tab=S0.tabs[stTab];$('stGold').innerHTML=goldPill();
let h='<div class="tabs">'+S0.names.map((n,i)=>`<button data-stt="${i}" class="${i===stTab?'on':''}">${n} <small style="opacity:.6">${S0.tabs[i].length}</small></button>`).join('')+'</div>';
h+=`<div class="sect"><span>Вкладка «${S0.names[stTab]}» · ${tab.length}/${ST_N}</span><span class="chips">${stTab===1?'<button class="chip" data-sq="w">Сложить оружие</button>':stTab===2?'<button class="chip" data-sq="a">Сложить броню</button>':stTab===3?'<button class="chip" data-sq="r">Сложить редкие и уник.</button>':'<button class="chip" data-sq="all">Сложить всё</button>'}</span></div><div class="bag stb">`;
for(let i=0;i<ST_N;i++){const it=tab[i];h+=it?tcell(it,{up:isUpg(it),attr:`data-st="${i}"`}):'<button class="cell" disabled style="cursor:default"></button>'}
h+=`</div><div class="sect"><span>Сумка ${P.bag.length}/36</span><small style="text-transform:none;letter-spacing:0">нажмите — переложить</small></div><div class="bag">`;
for(let i=0;i<36;i++){const it=P.bag[i];h+=it?tcell(it,{up:isUpg(it),attr:`data-sbg="${i}"`}):'<button class="cell" disabled style="cursor:default"></button>'}
h+='</div>';const L=T.last;if(L)h+=detHTML(L);$('stBody').innerHTML=h}
$('pStash').addEventListener('click',e=>{const b=e.target.closest('[data-stt],[data-st],[data-sbg],[data-sq]');if(!b)return;const d=b.dataset,tab=stashLoad().tabs[stTab];
if(d.stt){stTab=+d.stt;T.last=null}
else if(d.st!==undefined){const it=tab[+d.st];if(!it)return;if(P.bag.length>=36){toast('Сумка полна',1.5);return}tab.splice(+d.st,1);P.bag.push(it);T.last=it;snd(700,.05,'triangle',.05)}
else if(d.sbg!==undefined){const it=P.bag[+d.sbg];if(!it)return;if(tab.length>=ST_N){toast('Вкладка заполнена',1.5);return}P.bag.splice(+d.sbg,1);tab.push(it);T.last=it;snd(500,.05,'triangle',.05)}
else if(d.sq){const f={w:it=>it.slot==='weapon'||it.slot==='offhand',a:it=>!['weapon','offhand'].includes(it.slot),r:it=>it.rar>=2,all:()=>true}[d.sq];P.bag=P.bag.filter(it=>{if(f(it)&&tab.length<ST_N){tab.push(it);return false}return true})}
stashSave();save();renderStash()});

/* ================= АТЛАС: КАРТЫ ================= */
const MAXT=12,AT={sel:null};
const mapName=m=>'Карта: '+ZONES[m.zi].n;
function genMap(t){const r=Math.random();const m={id:uid++,map:1,tier:t,zi:Math.floor(Math.random()*8),rar:r<.08?2:r<.3?1:0,mods:[]};rollMapMods(m);m.name=mapName(m);return m}
function rollMapMods(m){const n=m.rar===2?3+(Math.random()<.4?1:0):m.rar===1?1+(Math.random()<.5?1:0):0;m.mods=shuffle(MAPMODS.map(x=>x.k)).slice(0,n)}
const mapQ=m=>m.mods.reduce((a,k)=>a+(MAPMODS.find(x=>x.k===k)||{q:0}).q,0);
const atlasBonus=()=>((P.atlas||[]).length)*3;
function dropMap(p,m){const el=document.createElement('div');el.className='loot mp'+(m.tier>=6?' hi':'');el.innerHTML=uiI('map','#9ad0ff')+esc(m.name)+' · тир '+m.tier;const l=lootObj(p,el,{mapIt:m,hi:m.tier>=4||m.rar===2});
const g=new THREE.Mesh(new THREE.BoxGeometry(.5,.06,.36),new THREE.MeshStandardMaterial({color:'#c9d8ff',emissive:'#5a8aff',emissiveIntensity:1.4,roughness:.5}));g.position.y=.3;l.g.add(g);l.gem=g;
if(m.tier>=4||m.rar===2){const col=new THREE.Color('#9ad0ff');const b=new THREE.Mesh(new THREE.CylinderGeometry(.16,.4,9,12,1,true),new THREE.MeshBasicMaterial({color:col.clone().multiplyScalar(2),map:beamTex,transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));b.position.y=4.5;b.scale.y=.01;l.g.add(b);l.beam=b}
chime([587,880],.08)}
function mapOrb(m,k){if(!(P.orbs[k]>0))return false;let ok=false;
if(k==='trans'&&m.rar===0){m.rar=1;rollMapMods(m);ok=true}else if(k==='alt'&&m.rar===1){rollMapMods(m);ok=true}
else if(k==='aug'&&m.rar===1&&m.mods.length<2){const pool=MAPMODS.map(x=>x.k).filter(x=>!m.mods.includes(x));m.mods.push(pick(pool));ok=true}
else if(k==='regal'&&m.rar===1){m.rar=2;const pool=MAPMODS.map(x=>x.k).filter(x=>!m.mods.includes(x));m.mods.push(pick(pool));ok=true}
else if(k==='chaos'&&m.rar===2){rollMapMods(m);ok=true}else if(k==='scour'&&m.rar>0){m.rar=0;m.mods=[];ok=true}
if(!ok){toast('Эта сфера сюда не подходит',1.5);return false}P.orbs[k]--;snd(1000,.1,'triangle',.08);return true}
function atlasHTML(){const L=(P.maps||[]).map((m,i)=>({m,i})).sort((a,b)=>b.m.tier-a.m.tier||b.m.rar-a.m.rar);const done=P.atlas||[];
let h=`<h4 class="ph">Атлас Кошмара</h4><div class="atl">`+Array.from({length:MAXT},(_,i)=>`<i class="${done.includes(i+1)?'on':''}" title="Тир ${i+1}">${i+1}</i>`).join('')+`</div><p class="muted" style="margin:4px 0 10px">Покорено тиров: ${done.length}/${MAXT} · бонус к количеству предметов на картах +${atlasBonus()}%. Карты выпадают с монстров на картах; стражи роняют карты выше тиром.</p>`;
h+='<div class="mapgrid">'+L.map(({m,i})=>`<button class="mapc r${m.rar} ${AT.sel===i?'sel':''}" data-mp="${i}"><b>${m.tier}</b><span>${esc(ZONES[m.zi].n)}</span>${m.mods.length?`<small>+${mapQ(m)}% предм.</small>`:''}</button>`).join('')+`<button class="mapc free" data-free="1"><b>1</b><span>Простая карта</span><small>бесплатно</small></button></div>`;
h+=`<div class="pin"><div>${gi('death-skull','#ff5a8a','width:34px;height:34px')}</div><div><b>Обитель Пожирателя</b><small>Финальный босс Атласа. Нужно 4 Фрагмента Тлена — их роняют стражи карт 4-го тира и выше. У вас: <b style="color:#ff8aa8">${P.frag||0}/4</b>${P.pinK?' · побед: '+P.pinK:''}</small></div><button class="ab" data-pin="1" ${(P.frag||0)>=4?'':'disabled'}>Войти</button></div>`;
const m=AT.sel!=null&&P.maps[AT.sel];
if(m){const RCm=['#c8c8c8','#8888ff','#ffd84a'];h+=`<div class="tdet"><h4 style="color:${RCm[m.rar]}">${esc(m.name)}</h4><div class="sub">${['Обычная','Магическая','Редкая'][m.rar]} карта · тир ${m.tier} · монстры ${8+m.tier} уровня</div><ul>${m.mods.map(k=>`<li class="aff">${MAPMODS.find(x=>x.k===k).n}</li>`).join('')||'<li class="muted">Без модификаторов</li>'}</ul>
<div class="cmp">Количество предметов: <b style="color:#7cf08e">+${mapQ(m)+atlasBonus()}%</b>${m.rar?` · редкость предметов: <b style="color:#7cf08e">+${[0,10,25][m.rar]}%</b>`:''}</div>
<div class="sect" style="margin-top:10px"><span>Изменить карту сферами</span></div><div class="orbacts">${['trans','alt','aug','regal','chaos','scour'].map(k=>`<button class="ob" data-mo="${k}" style="--c:${ORBS[k].c}" ${P.orbs[k]>0?'':'disabled'}>${uiI('orb:'+k,ORBS[k].c)}${ORBS[k].n.replace('Сфера ','')} (${P.orbs[k]||0})</button>`).join('')}</div>
<div class="acts" style="margin-top:10px"><button class="ab" data-go="1">Открыть карту</button></div></div>`}
return h}

$('ascBox').addEventListener('click',e=>{const b=e.target.closest('[data-asc],[data-an]');if(!b)return;
if(b.dataset.asc){const x=ASC[P.cls].find(a=>a.id===b.dataset.asc);if(!confirm('Выбрать путь «'+x.n+'»? Изменить выбор будет нельзя.'))return;P.ascC=x.id;P.asc=[];toast('Путь Восхождения: '+x.n,2.5);chime([523,659,784,1047],.1)}
else{const i=+b.dataset.an;if(ascTotal()-(P.asc||[]).length<=0)return;P.asc=P.asc||[];if(!P.asc.includes(i))P.asc.push(i);chime([659,988],.09)}
recalc();save();renderPas()});

/* эффекты смерти и аур монстров */
function deathFx(M,p){if(M.silent)return;const c=M.boss?'#ffb040':M.rare?'#ffd84a':M.magic?'#6a9aff':null;
for(let i=0;i<(M.boss?60:M.rare?28:10);i++){const a=rand(0,6.28),v=rand(1,M.boss?7:4);emit(p.x,rand(.3,1.4)*M.sc,p.z,Math.cos(a)*v,rand(1,4),Math.sin(a)*v,rand(.5,1.1),rand(.08,.18),.55,.5,.45,6,1)}
if(c){const C=C3(c);for(let i=0;i<(M.boss?50:18);i++){const a=rand(0,6.28);emit(p.x+Math.cos(a)*.4,rand(.4,1.6)*M.sc,p.z+Math.sin(a)*.4,Math.cos(a)*rand(.3,1),rand(2,5),Math.sin(a)*rand(.3,1),rand(.8,1.6),rand(.12,.22),C[0],C[1],C[2],-.5,1.2)}
const r=new THREE.Mesh(new THREE.RingGeometry(.6,1,48).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(2),transparent:true,opacity:.8,toneMapped:false,depthWrite:false,blending:THREE.AdditiveBlending}));r.position.set(p.x,.08,p.z);dyn.add(r);
const t0=performance.now(),D=M.boss?1.4:.7,R=M.boss?14:5;const tk=()=>{const k=(performance.now()-t0)/1000/D;if(k>=1||!r.parent){dyn.remove(r);r.material.dispose();return}r.scale.setScalar(1+k*R);r.material.opacity=.8*(1-k);requestAnimationFrame(tk)};tk()}}
function monLabels(){const hp=H.g.position;for(const M of mons){if(!M.lab)continue;if(M.dead){M.lab.style.display='none';continue}const p=M.g.position;if(Math.abs(p.x-hp.x)<16&&Math.abs(p.z-hp.z)<14&&proj(cp.set(p.x,2.9*M.sc,p.z),sp)){M.lab.style.display='block';M.lab.style.transform=`translate(${sp.x}px,${sp.y}px) translate(-50%,-100%)`}else M.lab.style.display='none'}}
function monFx(dt){monLabels();if(frameN%2)return;for(const M of mons){if(M.dead||!(M.rare||M.magic||M.boss))continue;const p=M.g.position;if(Math.random()<(M.boss?.9:M.rare?.5:.25)){const c=C3(M.boss?S.th.eyes:M.rare?'#ffd84a':'#6a9aff');const a=rand(0,6.28),r=M.r*rand(.8,1.4);emit(p.x+Math.cos(a)*r,rand(.1,.4),p.z+Math.sin(a)*r,0,rand(.6,1.6),0,rand(.5,.9),rand(.06,.12),c[0],c[1],c[2],0,1)}}}

/* подсказка предмета в стиле PoE */
function ttHTML(it){const u=it.upg,m=1+.1*u,R=['n','m','r','u'][it.rar];const seg=[];
const base=[];if(it.dmg)base.push(`<div>Урон: <b>${Math.round(it.dmg[0]*m)}–${Math.round(it.dmg[1]*m)}</b></div>`);if(it.wb)base.push(`<div>Ударов в секунду: <b>${WBASE[it.wb].aps}</b></div><div class="g">${WBASE[it.wb].hands===2?'Двуручное':'Одноручное'}</div>`);if(it.armor)base.push(`<div>Броня: <b>${Math.round(it.armor*m)}</b></div>`);if(u)base.push(`<div>Заточка: <b style="color:#ffd774">+${u}</b> <span class="g">(+${u*10}% к свойствам)</span></div>`);
if(base.length)seg.push(base.join(''));seg.push(`<div class="g">Уровень предмета: <b>${it.ilvl}</b></div>`);
if(it.imp||it.cimp)seg.push((it.imp?`<div class="mod">${stLine(it.imp.k,it.imp.v*m)}</div>`:'')+(it.cimp?`<div class="mod" style="color:#ff6a5a">${stLine(it.cimp.k,it.cimp.v)}</div>`:''));
const af=it.aff.map(a=>`<div class="mod${a.cr?' cr':''}">${AFF[a.k].t.replace('{v}',fmt(a.v*m,AFF[a.k].i))}${a.cr?' <small>(создано)</small>':''}</div>`);if(it.st)for(const k in it.st)if(k!=='bloodMagic')af.push(`<div class="mod">${stLine(k,it.st[k])}</div>`);else af.push('<div class="mod">Умения тратят здоровье вместо маны</div>');
if(af.length)seg.push(af.join(''));if(it.corr)seg.push('<div style="color:#d20000;font-weight:700">Осквернено</div>');if(it.lore)seg.push(`<div class="lore">«${esc(it.lore)}»</div>`);
const two=it.rar>=2;return `<div class="tt ${R}"><div class="tth"><b>${esc(it.name)}</b>${two?`<span>${esc(it.base)}</span>`:''}</div><div class="ttb">${seg.join('<i class="sep"></i>')}</div></div>`}

function dropFrag(p){const el=document.createElement('div');el.className='loot fr';el.innerHTML=gi('death-skull','#ff5a8a')+'Фрагмент Тлена';const l=lootObj(p,el,{frag:1,hi:true});
const g=new THREE.Mesh(new THREE.OctahedronGeometry(.28),new THREE.MeshStandardMaterial({color:'#ff5a8a',emissive:'#ff2a6a',emissiveIntensity:2,roughness:.3}));g.position.y=.35;l.g.add(g);l.gem=g;
const col=new THREE.Color('#ff5a8a');const b=new THREE.Mesh(new THREE.CylinderGeometry(.16,.4,9,12,1,true),new THREE.MeshBasicMaterial({color:col.clone().multiplyScalar(2),map:beamTex,transparent:true,opacity:.55,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,toneMapped:false}));b.position.y=4.5;b.scale.y=.01;l.g.add(b);l.beam=b;chime([330,494,659],.1)}
function pinReward(p){P.pinK=(P.pinK||0)+1;let u=null;for(let i=0;i<800&&!u;i++){const it=genItem(S.L,2,300);if(it.rar===3)u=it}if(u)dropItem(p,u);for(let i=0;i<4;i++)dropItem(p,genItem(S.L,2,200));
const orb=k=>{const el=document.createElement('div');el.className='loot o h3';el.innerHTML=uiI('orb:'+k,ORBS[k].c)+esc(ORBS[k].n);const l=lootObj(p,el,{orb:k,hi:true});const m=new THREE.Mesh(orbG,new THREE.MeshStandardMaterial({color:ORBS[k].c,emissive:ORBS[k].c,emissiveIntensity:2}));m.position.y=.3;l.g.add(m);l.gem=m};
orb('exalt');orb('exalt');orb('divine');orb('chaos');orb('chaos');setTimeout(()=>toast('Пожиратель Тлена повержен! Атлас покорён — победа № '+P.pinK,5),1500)}

/* ================= ИСПЫТАНИЯ ================= */
const CH=[
{id:'k100',n:'Первая кровь',d:'Убить 100 монстров',ic:'sword-slice',p:()=>[cs('k'),100],rw:{alt:2,trans:2}},
{id:'k1000',n:'Жнец',d:'Убить 1000 монстров',ic:'reaper-scythe',p:()=>[cs('k'),1000],rw:{chaos:2}},
{id:'r25',n:'Охотник на редких',d:'Убить 25 редких монстров',ic:'arrow-scope',p:()=>[cs('r'),25],rw:{regal:1}},
{id:'b3',n:'Победитель стражей',d:'Победить 3 стражей',ic:'crenulated-shield',p:()=>[cs('b'),3],rw:{aug:2,alt:2}},
{id:'camp',n:'Конец кампании',d:'Победить Сердце Тлена',ic:'death-skull',p:()=>[P.maxZone>8?1:0,1],rw:{exalt:1}},
{id:'uniq',n:'Легенда',d:'Подобрать уникальную вещь',ic:'crowned-skull',p:()=>[cs('u'),1],rw:{chaos:2}},
{id:'up6',n:'Аура кузнеца',d:'Заточить вещь до +6',ic:'anvil-impact',p:()=>[cs('up'),6],rw:{divine:1}},
{id:'up10',n:'Сияние',d:'Заточить вещь до +10',ic:'sun',p:()=>[cs('up'),10],rw:{exalt:2}},
{id:'rift5',n:'Страж Разлома',d:'Закрыть 5 разломов',ic:'magic-portal',p:()=>[cs('rift'),5],rw:{chaos:2,regal:1}},
{id:'maps5',n:'Картограф',d:'Пройти 5 карт',ic:'treasure-map',p:()=>[cs('m'),5],rw:{regal:2}},
{id:'at10',n:'Покоритель Атласа',d:'Покорить 10 тиров Атласа',ic:'world',p:()=>[(P.atlas||[]).length,10],rw:{exalt:1,divine:1}},
{id:'asc',n:'Восхождение',d:'Выбрать путь Восхождения',ic:'angel-wings',p:()=>[P.ascC?1:0,1],rw:{chaos:1}},
{id:'ucol',n:'Коллекционер',d:'Найти 8 разных уникальных вещей',ic:'crowned-skull',p:()=>[(P.uSeen||[]).length,8],rw:{exalt:1,divine:2}},
{id:'aby10',n:'Глубины',d:'Достичь 10-й глубины Бездны',ic:'magic-portal',p:()=>[cs('abyss'),10],rw:{exalt:1,chaos:3}},
{id:'pin',n:'Пожиратель',d:'Победить Пожирателя Тлена',ic:'fanged-skull',p:()=>[P.pinK||0,1],rw:{exalt:3}}];
const cs=k=>(P.cs&&P.cs[k])||0;
function csAdd(k,v=1,max){P.cs=P.cs||{};P.cs[k]=max?Math.max(P.cs[k]||0,v):(P.cs[k]||0)+v;if(frameN%1===0)chBadge()}
function chReady(){let d=0;try{const D=dailyGet();d=D.t.filter(t=>{const x=DPOOL.find(q=>q.k===t.k);return x&&!t.got&&cs(t.k)-t.b>=x.g}).length}catch(e){}return d+CH.filter(c=>{const[a,b]=c.p();return a>=b&&!(P.chc||[]).includes(c.id)}).length}
function chBadge(){if(!P)return;const n=chReady(),b=$('chB');if(!b)return;b.textContent=n;b.classList.toggle('on',n>0)}
function renderCh(){const got=P.chc||[];if(S.chTab==='g'){$('chBody').innerHTML=chTabs()+guideHTML();return}let h=chTabs()+dailyHTML()+`<div class="sect" style="margin-top:14px"><span>Испытания</span></div><div class="chsum"><span>Выполнено: <b style="color:#ffd774">${got.length}</b> из ${CH.length}</span></div><div class="chl">`;
for(const c of CH){const[a,b]=c.p(),done=a>=b,g=got.includes(c.id);const rw=Object.entries(c.rw).map(([k,v])=>uiI('orb:'+k,ORBS[k].c,'width:14px;height:14px;vertical-align:-2px;filter:none')+'×'+v).join(' ');
h+=`<div class="chr ${done?'done':''} ${g?'got':''}">${gi(GI[c.ic]?c.ic:'trophy-cup','#ffd774')}<div><b>${c.n}</b><small>${c.d} · ${Math.min(a,b)}/${b}</small><div class="bar"><i style="width:${Math.min(100,a/b*100)}%"></i></div></div><div>${g?'<span class="rw">получено</span>':done?`<button class="ab" data-ch="${c.id}">Забрать</button>`:`<span class="rw">${rw}</span>`}</div></div>`}
const us=P.uSeen||[];h+=`</div><div class="sect" style="margin-top:16px"><span>Коллекция уникальных · ${us.length}/${UNIQUES.length}</span></div><div class="ucol">`+UNIQUES.map(u=>us.includes(u.n)?`<span class="on" title="${esc(u.lore||'')}">${esc(u.n)}</span>`:'<span>???</span>').join('')+'</div>';const lo=(P.lore||[]).filter(i=>ZONES[i]&&ZONES[i].lore);h+=`<div class="sect" style="margin-top:16px"><span>Летопись · ${lo.length}/8</span></div>`+(lo.length?lo.sort((a,b)=>a-b).map(i=>`<div class="lore1"><b>${i+1}. ${esc(ZONES[i].n)} — ${esc(ZONES[i].boss)}</b><p>${esc(ZONES[i].lore)}</p></div>`).join(''):'<p class="muted">Победи стражей кампании, чтобы узнать историю Тлена.</p>');$('chBody').innerHTML=h+statsHTML()}
$('chBody').addEventListener('click',e=>{const b=e.target.closest('[data-ch]');if(!b)return;const c=CH.find(x=>x.id===b.dataset.ch);const[a,n]=c.p();P.chc=P.chc||[];if(a<n||P.chc.includes(c.id))return;P.chc.push(c.id);for(const[k,v]of Object.entries(c.rw))P.orbs[k]=(P.orbs[k]||0)+v;chime([523,659,784,1047],.1);toast('Награда: '+c.n,2);save();renderCh();chBadge()});
$('bCh').onclick=()=>togglePanel('ch');

/* ================= КАМНИ ПОДДЕРЖКИ ================= */
const SUPP={
multi:{n:'Множественные снаряды',d:'+2 снаряда, урон −25%',st:{projAdd:2},more:.75,k:['proj','barrage']},
pierce:{n:'Пронзание',d:'Снаряды пронзают ещё 3 цели',st:{pierce:3},k:['proj','barrage']},
chain:{n:'Цепь',d:'+2 перескока, урон −10%',st:{chainAdd:2},more:.9,k:['chain','proj']},
area:{n:'Обширная область',d:'+40% к области действия',st:{aoeP:40},k:['nova','aoe','ground','slam','wave','whirl','warcry','leap','orb','cone']},
conc:{n:'Концентрация',d:'+35% урона, область −25%',st:{aoeP:-25},more:1.35,k:['nova','aoe','ground','slam','wave','whirl','leap','orb','cone']},
brut:{n:'Жестокость',d:'+30% урона, мана +30%',more:1.3,mx:1.3},
fast:{n:'Быстрые чары',d:'Перезарядка быстрее на 30%, мана +20%',st:{cdr:30},mx:1.2},
leech:{n:'Кровопийца',d:'3% урона умения — в здоровье',st:{leech:3}},
crit:{n:'Меткий удар',d:'+5% шанса и +30% силы крита',st:{crit:5,critM:30}},
elem:{n:'Сила стихий',d:'+25% урона огнём, холодом и молнией',st:{fireP:25,coldP:25,lightP:25}}};
const SUPK=Object.keys(SUPP);
const supFits=(k,sk)=>!SUPP[k].k||SUPP[k].k.includes(sk.kind);
function supOf(id){const L=(P.links&&P.links[id]||[]).filter(k=>k&&SUPP[k]);if(!L.length)return null;const st=Object.assign({},ST);let more=1,mx=1;
for(const k of L){const g=SUPP[k];if(g.st)for(const x in g.st)st[x]=(st[x]||0)+g.st[x];if(g.more)more*=g.more;if(g.mx)mx*=g.mx}
st.crit=Math.min(80,st.crit);st.leech=Math.min(15,st.leech);return{st,more,mx}}
function gemFree(k){let used=0;for(const id in (P.links||{}))for(const x of P.links[id])if(x===k)used++;return ((P.gems||{})[k]||0)-used}
function dropGem(p){const k=pick(SUPK);const el=document.createElement('div');el.className='loot gm';el.innerHTML=gi('gem-pendant','#5ee07a')+'Камень: '+esc(SUPP[k].n);const l=lootObj(p,el,{gem2:k,hi:true});
const g=new THREE.Mesh(new THREE.OctahedronGeometry(.22),new THREE.MeshStandardMaterial({color:'#5ee07a',emissive:'#2ac04a',emissiveIntensity:1.8,roughness:.2}));g.position.y=.35;l.g.add(g);l.gem=g;chime([784,1047],.07)}
let sockOpen=null;
function sockHTML(id){P.links=P.links||{};const L=P.links[id]||[null,null],sk=SKILLS[id];let h='<div class="socks">'+[0,1].map(j=>{const k=L[j];return `<button class="sock ${k?'on':''} ${sockOpen===id+':'+j?'op':''}" data-sock="${id}:${j}">${k?gi('gem-pendant','#5ee07a','width:14px;height:14px;filter:none')+SUPP[k].n:'◇ пустое гнездо'}</button>`}).join('')+'</div>';
if(sockOpen&&sockOpen.startsWith(id+':')){const j=+sockOpen.split(':')[1];const opts=SUPK.filter(k=>supFits(k,sk)&&(gemFree(k)>0||L[j]===k));
h+='<div class="sockl">'+(L[j]?`<button class="chip" data-put="${id}:${j}:">Вынуть</button>`:'')+(opts.length?opts.map(k=>`<button class="chip gemc" data-put="${id}:${j}:${k}"><b>${SUPP[k].n}</b> <small>${SUPP[k].d} · ×${gemFree(k)}</small></button>`).join(''):'<span class="muted" style="font-size:12.5px">Нет подходящих камней. Камни поддержки выпадают с редких монстров и стражей.</span>')+'</div>'}
return h}
function sockClick(d){if(d.sock){sockOpen=sockOpen===d.sock?null:d.sock}else if(d.put!==undefined){const[id,j,k]=d.put.split(':');P.links=P.links||{};const L=P.links[id]=P.links[id]||[null,null];L[+j]=k||null;sockOpen=null;snd(900,.06,'triangle',.06);save()}renderSk()}

/* ================= РАЗЛОМ (лиговая механика) ================= */
function makeRift(){const s=freeSpot(-28,30,4);if(!s)return;const g=new THREE.Group();g.position.set(s.x,0,s.z);
const core=new THREE.Mesh(new THREE.TorusGeometry(1.1,.12,12,48),new THREE.MeshBasicMaterial({color:new THREE.Color('#c46aff').multiplyScalar(2.2),toneMapped:false}));core.position.y=1.6;g.add(core);
const inner=new THREE.Mesh(new THREE.CircleGeometry(1,40),new THREE.MeshBasicMaterial({color:'#6a1aaa',transparent:true,opacity:.75,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,depthWrite:false}));inner.position.y=1.6;g.add(inner);
const zoneR=new THREE.Mesh(new THREE.RingGeometry(.96,1,96).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:new THREE.Color('#b05aff').multiplyScalar(2),transparent:true,opacity:0,toneMapped:false,depthWrite:false}));zoneR.position.y=.06;g.add(zoneR);
const fill=new THREE.Mesh(new THREE.CircleGeometry(1,64).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:'#5a1a8a',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));fill.position.y=.05;g.add(fill);
dyn.add(g);const el=objLabel();el.innerHTML='<b style="color:#d08aff">Разлом</b><br><small>подойди, чтобы открыть</small>';S.rift={x:s.x,z:s.z,g,core,inner,zoneR,fill,el,st:0,t:0,r:4,sp:0,k:0}}
function riftKill(p){const R=S.rift;if(!R||R.st!==1)return;if(Math.hypot(p.x-R.x,p.z-R.z)<R.r+1){R.k++;R.t=Math.min(R.t+.35,25);R.r=Math.min(15,R.r+.18)}}
function updRift(dt){const R=S.rift;if(!R||S.mode!=='zone')return;const t=performance.now()/1000;R.core.rotation.z+=dt*1.5;R.core.rotation.y=Math.sin(t)*.4;R.inner.material.opacity=.5+.25*Math.sin(t*3);R.inner.lookAt(camera.position);
if(R.st===0){if(Math.random()<.3)emit(R.x+rand(-.8,.8),rand(.6,2.6),R.z+rand(-.8,.8),0,rand(.2,.8),0,rand(.6,1),rand(.08,.15),.8,.4,1,0,1);
if(proj(cp.set(R.x,3.3,R.z),sp)&&Math.hypot(R.x-H.g.position.x,R.z-H.g.position.z)<30){R.el.style.display='block';R.el.style.transform=`translate(${sp.x}px,${sp.y}px) translate(-50%,-100%)`}else R.el.style.display='none';
if(!isGuest()&&[H.g.position,...zonePeers().map(p=>p.g.position)].some(q=>Math.hypot(R.x-q.x,R.z-q.z)<2.8)){R.st=1;R.t=15;if(NET.on)nsend({t:'rift',zk:zkey(),st:1,r:R.r,tt:R.t,k:0});toast('Разлом открыт! Убивай тварей внутри круга — время продлевается.',3);chime([220,330,440,660],.12);S.shake=.4}return}
if(R.st===1){R.t-=dt;R.sp-=dt;if(NET.on&&!isGuest()){R.nt=(R.nt||0)-dt;if(R.nt<=0){R.nt=1;nsend({t:'rift',zk:zkey(),st:1,r:R.r,tt:R.t,k:R.k})}}R.zoneR.scale.setScalar(R.r);R.fill.scale.setScalar(R.r);R.zoneR.material.opacity=.7;R.fill.material.opacity=.13+.04*Math.sin(t*4);
for(let i=0;i<3;i++){const a=rand(0,6.28);emit(R.x+Math.cos(a)*R.r,.2,R.z+Math.sin(a)*R.r,0,rand(.5,1.5),0,rand(.5,.9),rand(.1,.16),.75,.35,1,0,1)}
R.el.style.display='block';if(proj(cp.set(R.x,3.3,R.z),sp))R.el.style.transform=`translate(${sp.x}px,${sp.y}px) translate(-50%,-100%)`;R.el.innerHTML=`<b style="color:#d08aff">Разлом</b> · ${Math.ceil(R.t)} с · убито ${R.k}`;
if(!isGuest()&&R.sp<=0&&mons.length<110){R.sp=Math.max(.5,1.3-R.k*.01);const n=ri(2,3);for(let k=0;k<n;k++){const a=rand(0,6.28),d=R.r*rand(.6,.95);const m=spawnMon(zMon(),R.x+Math.cos(a)*d,R.z+Math.sin(a)*d,{magic:Math.random()<.35,tint:'#8a3aff'});if(m){wake(m);burst({x:m.g.position.x,y:1,z:m.g.position.z},'#c46aff',10,3,.3,.5,1.4)}}}
if(R.t<=0&&(!isGuest()||R.fin)){R.st=2;if(NET.on&&!isGuest())nsend({t:'rift',zk:zkey(),st:2,k:R.k});R.el.remove();R.g.visible=false;const p={x:R.x,z:R.z},L=S.L,rr=ST.rarity+20;S.shake=.6;
const n=3+Math.floor(R.k/12);for(let i=0;i<n;i++)dropItem(p,genItem(L+1,i<2?2:1,rr));for(let i=0;i<2+Math.floor(R.k/20);i++)dropOrb(p);if(Math.random()<.4+R.k*.004)dropGem(p);if(S.zi<0&&Math.random()<.35)dropMap(p,genMap(Math.min(MAXT,S.map+1)));
for(let i=0;i<70;i++){const a=rand(0,6.28),v=rand(2,8);emit(R.x,1,R.z,Math.cos(a)*v,rand(2,6),Math.sin(a)*v,rand(.8,1.4),rand(.12,.22),.8,.4,1,4,1)}
toast('Разлом закрыт! Убито тварей: '+R.k+'. Забирай сокровища.',3.5);chime([440,554,659,880],.12);csAdd('rift')}}}

function banner(t,sub,kind){const b=$('banner');b.className='on '+(kind||'');document.body.classList.add('bn');clearTimeout(banner.u);banner.u=setTimeout(()=>document.body.classList.remove('bn'),kind==='boss'?3800:3000);b.innerHTML=`<i></i><b>${esc(t)}</b><small>${esc(sub||'')}</small><i></i>`;clearTimeout(banner.t);banner.t=setTimeout(()=>b.className=kind||'',kind==='boss'?3600:2800)}

/* ================= МУЗЫКА (процедурный эмбиент) ================= */
let MUS=null,musOn=(()=>{try{return localStorage.getItem('tlen_mus')!=='0'}catch(e){return true}})();
const NF=n=>440*Math.pow(2,(n-69)/12);
const PROG={town:{ch:[[50,57,62,65],[46,53,58,62],[53,60,65,69],[48,55,60,64]],len:9,v:.05,cut:1100,bell:[74,77,79,81,84]},
zone:{ch:[[45,52,57,60],[41,48,53,57],[38,45,50,53],[40,47,52,56]],len:8,v:.05,cut:800,bell:[69,72,74,76,79]},
boss:{ch:[[36,43,48,51],[32,39,44,48],[34,41,46,50],[31,38,43,47]],len:4,v:.06,cut:1400,bell:[60,63,67,70],pulse:1}};
function music(kind){if(!AC||!musOn){if(MUS)stopMusic();return}if(MUS&&MUS.kind===kind)return;stopMusic();const P0=PROG[kind];const t=AC.currentTime;
const out=AC.createGain();out.gain.setValueAtTime(0,t);out.gain.linearRampToValueAtTime(P0.v,t+3);const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=P0.cut;lp.Q.value=.7;
const dl=AC.createDelay(1);dl.delayTime.value=.42;const fb=AC.createGain();fb.gain.value=.42;dl.connect(fb).connect(dl);
lp.connect(out);lp.connect(dl);dl.connect(out);out.connect(master);
const lfo=AC.createOscillator(),lg=AC.createGain();lfo.frequency.value=.07;lg.gain.value=P0.cut*.35;lfo.connect(lg).connect(lp.frequency);lfo.start();
const vs=[];for(let i=0;i<4;i++)for(const [ty,dt] of [['sawtooth',-6],['triangle',5]]){const o=AC.createOscillator();o.type=ty;o.detune.value=dt;o.frequency.value=NF(P0.ch[0][i]);const g=AC.createGain();g.gain.value=ty==='sawtooth'?.18:.32;o.connect(g).connect(lp);o.start();vs.push({o,i})}
MUS={kind,out,vs,lfo,step:0,timers:[]};
const chord=()=>{if(!MUS||MUS.kind!==kind)return;MUS.step=(MUS.step+1)%P0.ch.length;const c=P0.ch[MUS.step],tt=AC.currentTime;for(const v of vs)v.o.frequency.setTargetAtTime(NF(c[v.i]),tt,.8);MUS.timers.push(setTimeout(chord,P0.len*1000))};
MUS.timers.push(setTimeout(chord,P0.len*1000));
const bell=()=>{if(!MUS||MUS.kind!==kind)return;const tt=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=NF(pick(P0.bell));g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(.09,tt+.02);g.gain.exponentialRampToValueAtTime(.001,tt+2.6);o.connect(g);g.connect(dl);g.connect(out);o.start(tt);o.stop(tt+2.7);MUS.timers.push(setTimeout(bell,rand(2500,6000)))};MUS.timers.push(setTimeout(bell,2000));
if(P0.pulse){const pul=()=>{if(!MUS||MUS.kind!==kind)return;const tt=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(70,tt);o.frequency.exponentialRampToValueAtTime(38,tt+.25);g.gain.setValueAtTime(.35,tt);g.gain.exponentialRampToValueAtTime(.001,tt+.3);o.connect(g).connect(out);o.start(tt);o.stop(tt+.32);MUS.timers.push(setTimeout(pul,MUS.step%2?430:860))};pul()}}
function stopMusic(){if(!MUS)return;const M=MUS;MUS=null;M.timers.forEach(clearTimeout);const t=AC.currentTime;M.out.gain.cancelScheduledValues(t);M.out.gain.setTargetAtTime(0,t,.6);setTimeout(()=>{try{M.vs.forEach(v=>v.o.stop());M.lfo.stop();M.out.disconnect()}catch(e){}},3000)}
function musToggle(){musOn=!musOn;try{localStorage.setItem('tlen_mus',musOn?'1':'0')}catch(e){}if(!musOn)stopMusic();else music(S.mode==='town'?'town':S.boss&&S.boss.aggro&&!S.cleared?'boss':'zone');const b=$('bMus');if(b)b.textContent='Музыка: '+(musOn?'вкл':'выкл')}

$('bMus').onclick=()=>{initAudio();musToggle()};$('bMus').textContent='Музыка: '+(musOn?'вкл':'выкл');

function makeUnique(U,l){const it={id:uid++,slot:U.slot,base:U.base||WBASE[U.wb].n,name:U.n,rar:3,ilvl:l,upg:0,aff:[],st:{...U.st},lore:U.lore};
if(U.wb){const W=WBASE[U.wb];it.wb=U.wb;it.dmg=[Math.round((W.dmg[0]+W.dmg[1]*l)*1.15),Math.round((W.dmg[2]+W.dmg[3]*l)*1.15)]}if(ABASE[U.slot]&&ABASE[U.slot].arm)it.armor=Math.round((ABASE[U.slot].arm[0]+ABASE[U.slot].arm[1]*l)*1.2);return it}
const BOSS_U=['Жезл Морга','Ледяной шёпот','Чумной венец','Сердце Пепла','Пасть бездны','Клятва паладина','Корона Тлена','Глаз Атласа'];

$('mini').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();S.bigMap=!S.bigMap;const c=$('mini');c.width=c.height=S.bigMap?230:140;c.classList.toggle('big',S.bigMap);drawMini()});

const QUOTES={merchant:['«Покупаю всё, что принесёшь из земель Тлена. И продаю кое-что.»','«Опять с полной сумкой? Вываливай, посмотрим.»','«Сферы нынче дороги. Но для тебя — почти даром.»','«Говорят, на картах Кошмара падает настоящее золото.»','«Не продавай то, что лучше надетого. Я серьёзно.»'],
smith:['«Каждая ступень делает вещь на 10% сильнее. Чем выше заточка — тем больше риск.»','«После шестой ступени металл начинает светиться. Красиво, а?»','«Десятка — это уже легенда. Лучи видно за милю.»','«Сгорит золото — не беда. Вещь-то цела.»']};
function npcQuote(k){return pick(QUOTES[k])}

function renderChars(){const c=charsGet(),el=$('charList');if(!el)return;if(!c.list.length){el.innerHTML='';return}
el.innerHTML='<div class="sect" style="justify-content:center"><span>Ваши герои</span></div>'+c.list.map((p,i)=>p&&p.cls?`<div class="chc" style="--c:${CLASSES[p.cls].col}"><button class="chp" data-play="${i}">${uiI('cls:'+p.cls,CLASSES[p.cls].col,'width:30px;height:30px')}<span><b>${CLASSES[p.cls].n}${p.ascC&&ASC[p.cls]?' · '+ASC[p.cls].find(a=>a.id===p.ascC).n:''}</b><small>${p.hc?'<span style="color:#ff6a5a">'+(p.dead?'☠ пал · ':'Хардкор · ')+'</span>':''}Уровень ${p.lvl} · ${p.maxZone>8?'Атлас: '+((p.atlas||[]).length)+' тиров':'Зона '+Math.min(8,p.maxZone)}</small></span></button><button class="chd" data-del="${i}" title="Удалить">×</button></div>`:'').join('')}
$('charList').addEventListener('click',e=>{const pl=e.target.closest('[data-play]'),dl=e.target.closest('[data-del]');
if(pl){const s=load(+pl.dataset.play);if(s&&s.dead){toast('Этот герой пал навсегда',2);return}if(s)startGame(s)}
if(dl){const i=+dl.dataset.del,c=charsGet();if(!dl.dataset.armed){dl.dataset.armed=1;dl.textContent='Удалить?';setTimeout(()=>{if(dl.isConnected){delete dl.dataset.armed;dl.textContent='×'}},2500);return}c.list.splice(i,1);c.cur=0;charsPut(c);renderChars()}});

/* верстак: гарантированное свойство за золото и сферу */
const crIdx=it=>it.aff.findIndex(a=>a.cr);
const benchCost=it=>Math.round(40*it.ilvl+60);
function benchHTML(it){if(it&&it.corr)return '<div class="bench"><p class="muted" style="font-size:12.5px;color:#ff6a5a">Осквернённую вещь нельзя изменить на верстаке.</p></div>';return benchHTML0(it)+essHTML(it)}
function benchHTML0(it){if(!it||!SLOTS.includes(it.slot))return'';let h='<div class="bench"><div class="sect"><span>Верстак</span><small style="text-transform:none;letter-spacing:0">одно созданное свойство на вещь</small></div>';
if(it.rar===0||it.rar===3)return h+`<p class="muted" style="font-size:12.5px">${it.rar===3?'Уникальные вещи нельзя изменить.':'Сначала сделайте вещь магической (Сфера превращения).'}</p></div>`;
if(crIdx(it)>=0){const a=it.aff[crIdx(it)];return h+`<p style="font-size:13px">Создано: <span style="color:#b8a0ff">${a?AFF[a.k].t.replace('{v}',fmt(a.v,AFF[a.k].i)):''}</span></p><button class="ab alt" data-bench="rm">Убрать созданное свойство</button></div>`}
const full=it.aff.length>=(it.rar===1?2:6);if(full)return h+'<p class="muted" style="font-size:12.5px">Нет свободных мест для свойства.</p></div>';
const have=it.aff.map(a=>a.k);const pool=itemPool(it.slot).filter(k=>!have.includes(k));const c=benchCost(it),orbs=P.orbs.aug||0;
h+=`<p class="muted" style="font-size:12.5px;margin:0 0 6px">Цена: ${c} зол. + 1 ${ORBS.aug.n.toLowerCase()} (у вас ${orbs}).</p><div class="benchl">`+pool.map(k=>{const[a,b]=AFF[k].r(it.ilvl),v=(a+b)/2;return `<button class="chip" data-bench="${k}" ${P.gold<c||orbs<1?'disabled':''}>${AFF[k].t.replace('{v}',fmt(v,AFF[k].i))}</button>`}).join('')+'</div></div>';return h}
function benchDo(k){const it=T.sm;if(!it)return;if(k==='rm'){const i=crIdx(it);if(i>=0){it.aff.splice(i,1);recalc();save();renderSmith()}return}
const c=benchCost(it);if(P.gold<c||!(P.orbs.aug>0))return;const[a,b]=AFF[k].r(it.ilvl);P.gold-=c;P.orbs.aug--;it.aff.push({k,v:(a+b)/2,cr:1});snd(800,.12,'triangle',.1);chime([523,784],.07);recalc();save();renderSmith()}

/* святилища: временные благословения */
const SHR=[{n:'Святилище ярости',c:'#ff5a3a',st:{dmgP:60},d:'+60% урона'},{n:'Святилище ветра',c:'#7cf0e0',st:{move:35,aspd:25},d:'+35% скорости бега, +25% скорости атак'},{n:'Святилище камня',c:'#c9b8a0',st:{dmgTaken:-40,armorP:60},d:'−40% получаемого урона'},{n:'Святилище жизни',c:'#5ee07a',st:{regen:25,leech:3},d:'Сильная регенерация и вампиризм'},{n:'Святилище удачи',c:'#ffd774',st:{rarity:80,gold:80},d:'+80% редкости добычи и золота'}];
function makeShrine(){const s=freeSpot(-30,34,3),k=Math.floor(Math.random()*SHR.length),D=SHR[k];const g=new THREE.Group();g.position.set(s.x,0,s.z);const o=prop('shrine',1.2);g.add(o);
const gl=new THREE.Mesh(new THREE.SphereGeometry(.45,16,12),new THREE.MeshBasicMaterial({color:new THREE.Color(D.c).multiplyScalar(2.2),toneMapped:false}));gl.position.y=2.1;g.add(gl);dyn.add(g);zoneObs.push({x:s.x,z:s.z,r:.9});
const el=objLabel();el.innerHTML=`<b style="color:${D.c}">${D.n}</b>`;S.shrines.push({x:s.x,z:s.z,g,gl,el,k,used:false})}
function updShrines(dt){if(!S.shrines||S.mode!=='zone')return;const t=performance.now()/1000;for(const sh of S.shrines){if(sh.used)continue;const D=SHR[sh.k];sh.gl.position.y=2.1+Math.sin(t*2+sh.x)*.15;
if(Math.random()<.25){const c=C3(D.c);emit(sh.x+rand(-.5,.5),rand(1.4,2.6),sh.z+rand(-.5,.5),0,rand(.3,.9),0,rand(.5,.9),rand(.06,.12),c[0],c[1],c[2],0,1)}
const d=Math.hypot(sh.x-H.g.position.x,sh.z-H.g.position.z);if(d<26&&proj(cp.set(sh.x,3,sh.z),sp)){sh.el.style.display='block';sh.el.style.transform=`translate(${sp.x}px,${sp.y}px) translate(-50%,-100%)`}else sh.el.style.display='none';
if(d<2){sh.used=true;sh.el.remove();sh.gl.visible=false;H.buffs=H.buffs.filter(b=>!b.shr);H.buffs.push({n:['Ярость','Ветер','Камень','Жизнь','Удача'][sh.k],t:25,st:D.st,shr:1});recalc();toast(D.n+': '+D.d+' на 25 секунд',3);chime([440,660,880,1320],.09);burst({x:sh.x,y:1.5,z:sh.z},D.c,40,5,.4,.8,2);csAdd('shr')}}}

$('tree').addEventListener('click',e=>{const b=e.target.closest('[data-tz]');if(!b)return;e.stopPropagation();const el=$('tree');const old=S.treeZ||1;const z=Math.max(1,Math.min(3,old+(+b.dataset.tz)*.5));if(z===old)return;
const cx=(el.scrollLeft+el.clientWidth/2)/el.scrollWidth,cy=(el.scrollTop+el.clientHeight/2)/el.scrollHeight;S.treeZ=z;renderPas();requestAnimationFrame(()=>{el.scrollLeft=cx*el.scrollWidth-el.clientWidth/2;el.scrollTop=cy*el.scrollHeight-el.clientHeight/2})},true);

/* ежедневные задания */
const DPOOL=[{k:'k',n:'Убить 150 монстров',g:150,rw:{alt:3}},{k:'r',n:'Убить 10 редких монстров',g:10,rw:{chaos:1}},{k:'b',n:'Победить 2 стражей',g:2,rw:{regal:1}},{k:'rift',n:'Закрыть разлом',g:1,rw:{chaos:1,aug:2}},{k:'shr',n:'Активировать 2 святилища',g:2,rw:{trans:4}},{k:'m',n:'Пройти 2 карты',g:2,rw:{chaos:2},atlas:1},{k:'u',n:'Подобрать уникальную вещь',g:1,rw:{exalt:1},hard:1}];
const today=()=>new Date().toISOString().slice(0,10);
function dailyGet(){const d=today();if(!P.daily||P.daily.date!==d){let pool=DPOOL.filter(x=>(!x.atlas||P.maxZone>8));const seed=[...d].reduce((a,c)=>a*31+c.charCodeAt(0)|0,7);const r=mulberry(seed);pool=pool.sort(()=>r()-.5).slice(0,3);P.daily={date:d,t:pool.map(x=>({k:x.k,b:cs(x.k),got:0}))};save()}return P.daily}
function dailyHTML(){const D=dailyGet();let h=`<div class="sect"><span>Задания дня</span><small style="text-transform:none;letter-spacing:0">обновятся завтра</small></div><div class="chl">`;
for(let i=0;i<D.t.length;i++){const t=D.t[i],x=DPOOL.find(q=>q.k===t.k);if(!x)continue;const v=Math.min(x.g,cs(t.k)-t.b),done=v>=x.g;const rw=Object.entries(x.rw).map(([k,n])=>uiI('orb:'+k,ORBS[k].c,'width:14px;height:14px;vertical-align:-2px;filter:none')+'×'+n).join(' ');
h+=`<div class="chr ${done?'done':''} ${t.got?'got':''}">${gi('sun','#ffb35a')}<div><b>${x.n}</b><small>${v}/${x.g}</small><div class="bar"><i style="width:${v/x.g*100}%"></i></div></div><div>${t.got?'<span class="rw">получено</span>':done?`<button class="ab" data-dl="${i}">Забрать</button>`:`<span class="rw">${rw}</span>`}</div></div>`}
return h+'</div>'}
$('chBody').addEventListener('click',e=>{const b=e.target.closest('[data-dl]');if(!b)return;const D=dailyGet(),t=D.t[+b.dataset.dl],x=DPOOL.find(q=>q.k===t.k);if(!t||t.got||cs(t.k)-t.b<x.g)return;t.got=1;for(const[k,v]of Object.entries(x.rw))P.orbs[k]=(P.orbs[k]||0)+v;chime([523,659,784,1047],.1);toast('Задание дня выполнено!',2);save();renderCh();chBadge()});

function skyFlash(){const old=hemi.intensity;hemi.intensity=old*3.5;setTimeout(()=>hemi.intensity=old,90);setTimeout(()=>{hemi.intensity=old*2.4;setTimeout(()=>hemi.intensity=old,70)},170);setTimeout(()=>{noise(1.6,.12,180);snd(50,1.4,'sawtooth',.06,.5)},500+Math.random()*900)}

/* всплывающие подсказки при наведении мыши (ПК) */
function itemFromEl(el){const d=el.dataset;if(d.bag!==undefined)return P.bag[+d.bag];if(d.sb!==undefined)return P.bag[+d.sb];if(d.sbg!==undefined)return P.bag[+d.sbg];if(d.eq!==undefined)return P.eq[d.eq];if(d.buy!==undefined)return S.shop[+d.buy];if(d.shop!==undefined)return S.shop[+d.shop];if(d.st!==undefined){const t=stashLoad().tabs[stTab];return t&&t[+d.st]}if(d.tr!==undefined)return P.bag.find(it=>itId(it)===+d.tr);return null}
if(matchMedia('(hover:hover)').matches){const tf=document.createElement('div');tf.id='ttf';document.body.appendChild(tf);
document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'){tf.style.display='none';return}const el=e.target.closest&&e.target.closest('[data-bag],[data-sb],[data-sbg],[data-eq],[data-buy],[data-shop],[data-st],[data-tr]');const it=el&&P&&itemFromEl(el);
if(!it){tf.style.display='none';tf._it=null;return}if(tf._it!==it){tf._it=it;tf.innerHTML=ttHTML(it)+(SLOTS.includes(it.slot)&&!el.dataset.eq?cmpHTML(it):'')}tf.style.display='block';const w=tf.offsetWidth,h=tf.offsetHeight;let x=e.clientX+18,y=e.clientY+14;if(x+w>innerWidth-8)x=e.clientX-w-18;if(y+h>innerHeight-8)y=innerHeight-h-8;tf.style.left=x+'px';tf.style.top=Math.max(8,y)+'px'})}

/* вибрация на телефоне */
let hapT=0;function haptic(k){const now=performance.now();if(now-hapT<120)return;hapT=now;try{const T=window.Telegram&&Telegram.WebApp&&Telegram.WebApp.HapticFeedback;if(T&&Telegram.WebApp.initData){k==='ok'?T.notificationOccurred('success'):T.impactOccurred(k==='heavy'?'heavy':k==='light'?'light':'medium');return}if(navigator.vibrate)navigator.vibrate(k==='heavy'?60:k==='ok'?[30,40,30]:k==='light'?12:25)}catch(e){}}

/* справочник */
const GUIDE=[['Управление','Телефон: коснись экрана и веди пальцем — герой идёт и сам бьёт ближайших врагов. Q/E/R — умения, синяя кнопка — рывок в сторону движения, красная — флакон. ПК: WASD или мышь, Q/E/R, пробел, F.'],
['Лагерь','Торговка Вера покупает и продаёт вещи и сферы. Кузнец Гром затачивает вещи до +10 и добавляет свойства на верстаке. Хранилище — общий сундук для всех героев. Портал на севере ведёт в земли и на карты.'],
['Добыча','Чем ярче подпись и выше столб света, тем ценнее вещь: белые — обычные, синие — магические, жёлтые — редкие, оранжевые — уникальные. ▲ — лучше надетого. Фильтр добычи в сумке превращает мусор в золото.'],
['Сферы','Превращения: обычная → магическая. Перемен: перебросить магическую. Дополнения: +свойство магической. Царская: магическая → редкая. Хаоса: перебросить редкую. Возвышения: +свойство редкой. Божественная: перебросить значения. Очищения: убрать всё. Ваал: осквернить вещь — может стать сильнее (заточка до +12, особое свойство) или не измениться, но изменить её потом нельзя. Сферы работают и на картах.'],
['Заточка','Каждая ступень +10% ко всем свойствам вещи. С +1 оружие мерцает, с +6 появляется аура, на +10 — лучи. При неудаче сгорает золото, вещь остаётся.'],
['Умения и камни','У каждого класса 21 умение в трёх ветках, с собой — три. В каждое умение можно вставить 2 камня поддержки: больше снарядов, цепь, область, урон и другие. Камни падают с редких монстров и стражей.'],
['Восхождение','Победа над стражами «Лагеря культистов», «Затопленных руин», «Сердца Тлена» и первая карта 5-го тира дают очки Восхождения. Выбери один из двух подклассов в окне «Пассивы».'],
['Пантеон','Победа над стражами «Пепельного леса» и «Затопленных руин» открывает силы Пантеона (окно «Пассивы»): одну великую и одну малую. Их можно менять когда угодно.'],
['Атлас','После кампании открываются карты: тир 1–12, редкость и модификаторы. Больше модификаторов — больше добычи. Каждый покорённый тир даёт +3% к количеству предметов. Стражи карт 4+ тира роняют Фрагменты Тлена — 4 фрагмента открывают Обитель Пожирателя.'],
['Гадальные карты','Редкие карты с монстров. Соберите полный набор — Торговка Вера (вкладка «Купить») обменяет его на уникальную вещь, сферы, камни или карту высокого тира.'],
['Эссенции','Иногда в зоне стоит кристалл эссенции. Подойди — из него выйдет сильный страж. С него падает эссенция: на верстаке она добавляет вещи мощное свойство (на 30% сильнее лучшего броска), а обычную вещь делает редкой.'],
['Бездна','После кампании в портале есть Бездна — бесконечный спуск. Портал стража ведёт на следующую глубину, монстры и модификаторы растут. Каждые 5 глубин — контрольная точка. Выйти можно кнопкой «В лагерь».'],
['События','Разлом: подойди, и круг наполнится тварями — убивай внутри, чтобы продлить время, в конце сокровища. Святилища дают сильное благословение на 25 секунд.'],
['Группа','До 3 игроков. Кнопка «Группа» → «Создать группу» и отправьте ссылку другу, или отметьте «Открытая группа» — тогда вас увидят все в списке «Открытые группы». У каждого своя добыча, вещи можно передавать союзнику из сумки.']];
function guideHTML(){return '<div class="guide">'+GUIDE.map(([t,d],i)=>`<details ${i===0?'open':''}><summary>${t}</summary><p>${d}</p></details>`).join('')+'</div>'}

function chTabs(){return `<div class="tabs"><button data-cht="c" class="${S.chTab!=='g'?'on':''}">Испытания</button><button data-cht="g" class="${S.chTab==='g'?'on':''}">Справочник</button></div>`}
$('chBody').addEventListener('click',e=>{const b=e.target.closest('[data-cht]');if(!b)return;S.chTab=b.dataset.cht;renderCh()});

/* лобби открытых групп */
let LOB=null,LADV={},ADV=null;
function lobbyOpen(){if(LOB||NET.on)return;try{LOB=new RelaySocket('LOBBY1',BRK(),{max:999});LOB.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(_){return}if(m.t==='adv'&&m.room){LADV[m.room]=Object.assign(m,{at:Date.now()});lobbyRender()}}}catch(e){LOB=null}}
function lobbyRender(){const el=$('lobbyList');if(!el)return;const h=lobbyHTML();if(el._h!==h){el._h=h;el.innerHTML=h}}
function lobbyClose(){if(LOB){try{LOB.close()}catch(e){}LOB=null}}
function lobbyHTML(){const now=Date.now();const L=Object.values(LADV).filter(a=>now-a.at<12000&&a.n<3);if(!L.length)return '<p class="muted" style="font-size:12.5px">Пока никого. Создайте группу и отметьте «Открытая группа» — вас увидят другие игроки.</p>';
return L.map(a=>`<div class="lob"><span>${uiI('cls:'+a.cls,CLASSES[a.cls]?CLASSES[a.cls].col:'#fff','width:22px;height:22px;filter:none')}<b>${esc(a.name)}</b> <small>ур. ${a.lvl} · ${esc(a.zone||'лагерь')} · ${a.n}/3</small></span><button class="ab" data-lj="${esc(a.room)}">Войти</button></div>`).join('')}
function advTick(now){if(!NET.on||!NET.host||!NET.open){if(ADV){try{ADV.close()}catch(e){}ADV=null}return}if(!ADV){ADV=new RelaySocket('LOBBY1',BRK(),{max:999})}
const send=()=>{if(ADV&&ADV.readyState===1)ADV.send(JSON.stringify({t:'adv',room:NET.room,name:NET.name||CLASSES[P.cls].n,cls:P.cls,lvl:P.lvl,n:1+Object.values(NET.peers).filter(p=>p.cls).length,zone:S.mode==='zone'?S.zone.n:'лагерь'}))};if(now)setTimeout(send,1800);else send()}
setInterval(()=>{advTick();if(LOB)lobbyRender()},4000);

function BRK(){const m=location.search.match(/[?&]broker=([^&]+)/);return m?[decodeURIComponent(m[1])]:undefined}

/* ================= ГАДАЛЬНЫЕ КАРТЫ ================= */
const DIV=[
{id:'wolf',n:'Волчья тропа',need:5,rw:'Уникальная вещь «Кольцо тысячи стрел»',f:()=>giveU('Кольцо тысячи стрел'),flav:'Стая всегда находит добычу.'},
{id:'ash',n:'Пепел и пламя',need:4,rw:'Уникальная вещь «Сердце Пепла»',f:()=>giveU('Сердце Пепла'),flav:'Из пепла встаёт новое пламя.'},
{id:'crown',n:'Ноша короля',need:6,rw:'Уникальная вещь «Корона Тлена»',f:()=>giveU('Корона Тлена'),flav:'Тяжела корона мёртвых.'},
{id:'exalt',n:'Возвышение',need:7,rw:'3 сферы возвышения',f:()=>giveO('exalt',3),flav:'Лишь избранным дано подняться.'},
{id:'chaos',n:'Безумный торговец',need:4,rw:'10 сфер хаоса',f:()=>giveO('chaos',10),flav:'Он платит, не глядя.'},
{id:'divine',n:'Божья искра',need:6,rw:'4 божественные сферы',f:()=>giveO('divine',4),flav:'Совершенство — в мелочах.'},
{id:'gems',n:'Ювелир',need:3,rw:'3 случайных камня поддержки',f:()=>{for(let i=0;i<3;i++){const k=pick(SUPK);P.gems=P.gems||{};P.gems[k]=(P.gems[k]||0)+1}},flav:'Каждый камень — история.'},
{id:'map',n:'Картограф',need:5,rw:'Редкая карта 10-го тира',f:()=>{const m=genMap(10);m.rar=2;rollMapMods(m);P.maps=P.maps||[];P.maps.push(m)},flav:'Он видел края мира.'},
{id:'frag',n:'Голод Пожирателя',need:5,rw:'4 Фрагмента Тлена',f:()=>{P.frag=(P.frag||0)+4},flav:'Оно ждёт в Обители.'},
{id:'storm',n:'Око бури',need:4,rw:'Уникальная вещь «Ураган» или «Посох вечной зимы»',f:()=>giveU(pick(['Ураган','Посох вечной зимы'])),flav:'В центре бури — тишина.'}];
function giveU(n){const U=UNIQUES.find(u=>u.n===n);if(!U)return;const it=makeUnique(U,Math.max(S.L||1,P.lvl));if(P.bag.length<36)P.bag.push(it);else{stashLoad().tabs[0].push(it);stashSave()}}
function giveO(k,n){P.orbs[k]=(P.orbs[k]||0)+n}
function dropDiv(p){const W={gems:3,chaos:3,wolf:2,ash:2,storm:1.5,map:1.5,frag:1.5,crown:1,divine:1,exalt:.6};const cid=wpick(DIV.map(c=>[c.id,W[c.id]||1])),C=DIV.find(c=>c.id===cid);const el=document.createElement('div');el.className='loot dv';el.innerHTML=gi('card-random','#cfe8ff')+esc(C.n);const l=lootObj(p,el,{div:C.id,hi:true});
const g=new THREE.Mesh(new THREE.BoxGeometry(.32,.46,.03),new THREE.MeshStandardMaterial({color:'#e8f2ff',emissive:'#8ab8ff',emissiveIntensity:1.6}));g.position.y=.4;l.g.add(g);l.gem=g;chime([988,1319],.07)}
function divHTML(){P.cards=P.cards||{};const have=DIV.filter(c=>(P.cards[c.id]||0)>0);let h='<div class="sect"><span>Гадальные карты</span><small style="text-transform:none;letter-spacing:0">собери набор — получи награду</small></div>';
if(!have.length)return h+'<p class="muted" style="font-size:12.5px">Гадальные карты изредка выпадают с монстров, чаще — с редких и стражей. Соберите полный набор, и Вера обменяет его на награду.</p>';
return h+'<div class="divl">'+have.map(c=>{const n=P.cards[c.id],ok=n>=c.need;return `<div class="divc ${ok?'ok':''}"><b>${esc(c.n)}</b><small>${n}/${c.need}</small><div class="rw">${esc(c.rw)}</div><i>«${esc(c.flav)}»</i>${ok?`<button class="ab" data-dv="${c.id}">Обменять</button>`:''}</div>`}).join('')+'</div>'}

/* ================= ОБЛАЧНОЕ СОХРАНЕНИЕ (Telegram) И ЭКСПОРТ ================= */
const TGCS=()=>{try{const w=window.Telegram&&Telegram.WebApp;return w&&w.initData&&w.CloudStorage&&w.isVersionAtLeast&&w.isVersionAtLeast('6.9')?w.CloudStorage:null}catch(e){return null}};
function bundle(){return JSON.stringify({v:1,t:Date.now(),chars:charsGet(),stash:stashLoad()})}
function unbundle(str){const o=JSON.parse(str);if(!o||!o.chars||!Array.isArray(o.chars.list))throw new Error('bad');charsPut(o.chars);if(o.stash){STASH=o.stash;stashSave()}try{localStorage.setItem('tlen_t',String(o.t||Date.now()))}catch(e){}return o}
let cloudBusy=false,cloudLast=0;
function cloudSave(force){const CS=TGCS();if(!CS||cloudBusy)return;const now=Date.now();if(!force&&now-cloudLast<45000)return;cloudLast=now;cloudBusy=true;
try{const str=bundle(),n=Math.ceil(str.length/3800),t=String(now);let left=n+2;const done=()=>{if(--left<=0)cloudBusy=false};
for(let i=0;i<n;i++)CS.setItem('sv_'+i,str.slice(i*3800,(i+1)*3800),done);CS.setItem('sv_n',String(n),done);CS.setItem('sv_t',t,done);try{localStorage.setItem('tlen_t',t)}catch(e){}}catch(e){cloudBusy=false}}
function cloudLoad(cb){const CS=TGCS();if(!CS)return cb(false);CS.getItems(['sv_n','sv_t'],(err,v)=>{if(err||!v||!v.sv_n)return cb(false);const n=+v.sv_n,t=+v.sv_t||0;let lt=0;try{lt=+localStorage.getItem('tlen_t')||0}catch(e){}
const loc=charsGet();if(lt>=t&&loc.list.length)return cb(false);CS.getItems(Array.from({length:n},(_,i)=>'sv_'+i),(e2,parts)=>{if(e2||!parts)return cb(false);try{unbundle(Array.from({length:n},(_,i)=>parts['sv_'+i]||'').join(''));cb(true)}catch(e){cb(false)}})})}
setInterval(()=>{if(P)cloudSave()},50000);
function exportSave(){const code=btoa(unescape(encodeURIComponent(bundle())));try{navigator.clipboard.writeText(code).then(()=>toast('Код сохранения скопирован. Сохраните его в заметках.',3),()=>prompt('Скопируйте код сохранения:',code))}catch(e){prompt('Скопируйте код сохранения:',code)}}
function importSave(){const code=prompt('Вставьте код сохранения:');if(!code)return;try{unbundle(decodeURIComponent(escape(atob(code.trim()))));toast('Сохранение загружено',2);renderChars()}catch(e){toast('Код не подошёл',2)}}

$('bExp').onclick=exportSave;$('bImp').onclick=importSave;

/* ================= ЭССЕНЦИИ ================= */
const ESS={hp:{n:'Эссенция жизни',c:'#ff5a5a'},fireP:{n:'Эссенция гнева',c:'#ff8a3a'},coldP:{n:'Эссенция стужи',c:'#7ad0ff'},lightP:{n:'Эссенция грома',c:'#ffe85a'},crit:{n:'Эссенция точности',c:'#ffffff'},aspd:{n:'Эссенция ярости',c:'#ff6ad0'},move:{n:'Эссенция ветра',c:'#7cf0e0'},rarity:{n:'Эссенция алчности',c:'#ffd774'},armor:{n:'Эссенция камня',c:'#c9b8a0'},leech:{n:'Эссенция голода',c:'#c03a5a'}};
const ESK=Object.keys(ESS);
function makeEss(){const s=freeSpot(-28,30,3),k=ESK[Math.floor(Math.random()*ESK.length)],E=ESS[k];const g=new THREE.Group();g.position.set(s.x,0,s.z);
const cr=new THREE.Mesh(new THREE.OctahedronGeometry(1.1,0),new THREE.MeshStandardMaterial({color:E.c,emissive:E.c,emissiveIntensity:.8,transparent:true,opacity:.55,roughness:.1,metalness:.3}));cr.scale.set(1,1.8,1);cr.position.y=1.7;g.add(cr);dyn.add(g);zoneObs.push({x:s.x,z:s.z,r:1});
const el=objLabel();el.innerHTML=`<b style="color:${E.c}">${E.n}</b><br><small>подойди — освободи стража</small>`;S.ess={x:s.x,z:s.z,g,cr,el,k,st:0,M:null}}
function updEss(dt){const E0=S.ess;if(!E0||S.mode!=='zone')return;const E=ESS[E0.k];const t=performance.now()/1000;
if(E0.st===0){E0.cr.rotation.y+=dt*.6;if(Math.random()<.2){const c=C3(E.c);emit(E0.x+rand(-.6,.6),rand(.5,3),E0.z+rand(-.6,.6),0,rand(.2,.6),0,rand(.6,1),rand(.1,.2),c[0],c[1],c[2],0,1)}
const d=Math.hypot(E0.x-H.g.position.x,E0.z-H.g.position.z);if(d<26&&proj(cp.set(E0.x,4,E0.z),sp)){E0.el.style.display='block';E0.el.style.transform=`translate(${sp.x}px,${sp.y}px) translate(-50%,-100%)`}else E0.el.style.display='none';
if(d<2.4&&!isGuest()){E0.st=1;E0.el.remove();E0.cr.visible=false;burst({x:E0.x,y:1.6,z:E0.z},E.c,50,6,.4,.9,2);noise(.5,.2,900);S.shake=.35;const M=spawnMon(wpick(S.zone.mons),E0.x,E0.z+1.5,{rare:1,tint:E.c});if(M){M.ess=E0.k;M.name=E.n.replace('Эссенция','Страж')+' · '+M.name;if(M.lab)M.lab.firstChild.textContent=M.name;M.hp*=1.5;M.max*=1.5;wake(M)}toast('Страж эссенции освобождён!',2)}}}
function dropEss(p,k){const E=ESS[k];const el=document.createElement('div');el.className='loot es';el.style.color=E.c;el.innerHTML=gi('crystal-growth',E.c)+esc(E.n);const l=lootObj(p,el,{ess:k,hi:true});
const g=new THREE.Mesh(new THREE.OctahedronGeometry(.22),new THREE.MeshStandardMaterial({color:E.c,emissive:E.c,emissiveIntensity:1.8}));g.scale.y=1.6;g.position.y=.4;l.g.add(g);l.gem=g;chime([660,990,1320],.08)}

function essHTML(it){const E=P.ess||{};const have=ESK.filter(k=>E[k]>0);if(!it||!SLOTS.includes(it.slot)||!have.length)return'';let h='<div class="bench" style="border-color:rgba(255,215,116,.3)"><div class="sect"><span>Эссенции</span><small style="text-transform:none;letter-spacing:0">мощное свойство, сверх лимита верстака</small></div>';
if(it.rar===3)return h+'<p class="muted" style="font-size:12.5px">Уникальные вещи нельзя изменить.</p></div>';
const pool=itemPool(it.slot);h+='<div class="benchl">'+have.map(k=>{const ok=pool.includes(k)&&!it.aff.some(a=>a.k===k);const[a,b]=AFF[k]?AFF[k].r(it.ilvl):[0,0];return `<button class="chip" data-ess="${k}" ${ok?'':'disabled'} style="color:${ESS[k].c}">${ESS[k].n} ×${E[k]}${ok?' → '+AFF[k].t.replace('{v}',fmt(b*1.3,AFF[k].i)):' (не для этой вещи)'}</button>`}).join('')+'</div>';
return h+'<p class="muted" style="font-size:11.5px;margin:6px 0 0">Обычная вещь станет редкой. Свойство на 30% сильнее лучшего броска.</p></div>'}

/* развитие Атласа */
const AN=[{id:'rift',n:'Зов разлома',d:'Разломы на картах встречаются на 25% чаще'},{id:'shr',n:'Святые места',d:'+1 святилище на каждой карте'},{id:'maps',n:'Картограф',d:'Карты выпадают на 40% чаще'},{id:'div',n:'Гадалка',d:'Гадальные карты выпадают вдвое чаще'},{id:'ess',n:'Кристаллы',d:'Эссенции встречаются вдвое чаще'},{id:'boss',n:'Богатые стражи',d:'Стражи карт роняют +2 редкие вещи'},{id:'frag',n:'Голод',d:'Фрагменты Тлена выпадают на 50% чаще'},{id:'iiq',n:'Сокровищница',d:'+15% к количеству предметов на картах'}];
const atl=k=>!!(P&&P.atlN&&P.atlN.includes(k))&&S.zi<0;
function atlPts(){return (P.atlas||[]).length+(P.pinK||0)-(P.atlN||[]).length}
function atlTreeHTML(){const pts=atlPts();return `<div class="sect" style="margin-top:12px"><span>Развитие Атласа</span><span style="text-transform:none;letter-spacing:0">очков: <b style="color:#9ad0ff">${pts}</b></span></div><div class="atln">`+AN.map(n=>{const on=(P.atlN||[]).includes(n.id);return `<button class="atlb ${on?'on':''}" data-an2="${n.id}" ${on||pts<=0?'disabled':''}><b>${n.n}</b><small>${n.d}</small></button>`}).join('')+'</div><p class="muted" style="font-size:12px">Очки: 1 за каждый покорённый тир и за каждую победу над Пожирателем. Бонусы действуют только на картах.</p>'}

/* сфера ваал: осквернение */
const CIMP=[{k:'skillLvl',v:1,s:['amulet','helmet']},{k:'dmgP',v:25},{k:'hpP',v:12},{k:'crit',v:3},{k:'aspd',v:8},{k:'move',v:8,s:['boots']},{k:'leech',v:2},{k:'cdr',v:10},{k:'rarity',v:20}];
function vaal(it){it.corr=1;const r=Math.random();let msg;
if(r<.25){msg='Осквернение: без изменений'}
else if(r<.5){const pool=CIMP.filter(c=>!c.s||c.s.includes(it.slot));const c=pick(pool);it.cimp={k:c.k,v:c.v};msg='Осквернение: новое свойство — '+stLine(c.k,c.v)}
else if(r<.75){if(it.rar===3){it.upg=Math.min(12,it.upg+2);msg='Осквернение: заточка +2 (до +'+it.upg+')'}else{it.rar=2;rollAff(it,ri(4,6));nameIt(it);msg='Осквернение: вещь переродилась редкой'}}
else{it.upg=Math.min(12,it.upg+2);msg='Осквернение: заточка +2 (до +'+it.upg+')'}
snd(140,.6,'sawtooth',.12,.4);setTimeout(()=>snd(900,.3,'triangle',.08),200);burst(H.g.position.clone().setY(1.5),'#ff2a2a',30,4,.3,.6,2);haptic('heavy');toast(msg,3);return null}

setInterval(()=>{if(P&&(S.mode==='zone'||S.mode==='town'))csAdd('sec',10)},10000);
function statsHTML(){const f=n=>n>=1e6?(n/1e6).toFixed(1)+'M':n>=1e4?(n/1e3).toFixed(1)+'k':String(Math.round(n));const h=Math.floor(cs('sec')/3600),m=Math.floor(cs('sec')%3600/60);
const rows=[['Время в игре',h+' ч '+m+' мин'],['Убито монстров',f(cs('k'))],['Редких',f(cs('r'))],['Стражей',f(cs('b'))],['Карт пройдено',f(cs('m'))],['Разломов закрыто',f(cs('rift'))],['Святилищ',f(cs('shr'))],['Уникальных найдено',f(cs('u'))],['Лучшая заточка','+'+cs('up')],['Смертей',f(cs('death'))]];
return `<div class="sect" style="margin-top:16px"><span>Статистика героя</span></div><dl class="stats">`+rows.map(r=>`<dt>${r[0]}</dt><dd>${r[1]}</dd>`).join('')+'</dl>'}

/* ================= БЕЗДНА: бесконечный спуск ================= */
function enterAbyss(d){const n=Math.min(MAPMODS.length,1+Math.floor(d/3));const mods=shuffle(MAPMODS.map(m=>m.k)).slice(0,n);
enterZone(-1,d,null,{zi:Math.floor(Math.random()*8),tier:d,rar:2,mods,abyss:d});S.zone.n='Бездна · глубина '+d;$('zoneName').textContent=S.zone.n}
function abyssHTML(){const best=P.abyssBest||0,ck=P.abyssCk||1;return `<div class="pin aby"><div>${gi('magic-portal','#b06aff','width:34px;height:34px')}</div><div><b>Бездна</b><small>Бесконечный спуск: каждая глубина сильнее и с большим числом модификаторов. Портал стража ведёт глубже. Каждые 5 глубин — контрольная точка и сферы. Рекорд: <b style="color:#d0a0ff">${best}</b></small></div><div style="display:flex;flex-direction:column;gap:4px"><button class="ab" data-aby="${ck}">${ck>1?'С глубины '+ck:'Начать'}</button>${ck>1?'<button class="ab alt" data-aby="1">С 1</button>':''}</div></div>`}

/* ================= ПАНТЕОН ================= */
const PAN={maj:[{id:'sol',n:'Душа Солнца',st:{dmgTaken:-8,armorP:15},d:'−8% получаемого урона, +15% брони'},{id:'lun',n:'Душа Луны',st:{move:10,aspd:6},d:'+10% скорости бега, +6% скорости атак'},{id:'gai',n:'Душа Земли',st:{regen:5,hpP:8},d:'+5 здоровья в сек., +8% здоровья'}],
min:[{id:'vam',n:'Душа Голода',st:{leech:1},d:'+1% вампиризма'},{id:'gol',n:'Душа Алчности',st:{rarity:12,gold:15},d:'+12% редкости, +15% золота'},{id:'tim',n:'Душа Времени',st:{cdr:8},d:'+8% к скорости перезарядки'}]};
function panSt(s){if(!P||!P.pan)return;for(const k of ['maj','min']){const x=PAN[k].find(p=>p.id===P.pan[k]);if(x&&panOpen(k))addSt(s,x.st)}}
const panOpen=k=>(P.lore||[]).includes(k==='maj'?3:5);
function panHTML(){let h='<div class="asc" style="border-color:rgba(150,200,255,.3);background:linear-gradient(180deg,rgba(120,170,255,.07),rgba(0,0,0,.15))"><div class="asch"><b style="color:#a8d0ff">Пантеон</b><span style="font-size:12px;color:#a99f8f">можно менять в любой момент</span></div>';
for(const k of ['maj','min']){const open=panOpen(k);h+=`<div class="sect" style="margin-top:6px"><span>${k==='maj'?'Великая сила':'Малая сила'}</span></div>`;
if(!open){h+=`<p class="muted" style="font-size:12.5px;margin:0">Откроется после победы над стражем «${ZONES[k==='maj'?3:5].n}».</p>`;continue}
h+='<div class="ascl" style="grid-template-columns:repeat(3,minmax(0,1fr))">'+PAN[k].map(p=>`<button class="ascnode ${P.pan&&P.pan[k]===p.id?'on':''}" data-pan="${k}:${p.id}" style="--c:#a8d0ff"><b>${p.n}</b><small>${p.d}</small></button>`).join('')+'</div>'}
return h+'</div>'}
$('ascBox').addEventListener('click',e=>{const b=e.target.closest('[data-pan]');if(!b)return;const[k,id]=b.dataset.pan.split(':');P.pan=P.pan||{};P.pan[k]=id;chime([587,784],.07);recalc();save();renderPas()});
