'use client';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AdminContractPayload } from '@/lib/contracts/adminContractPayload';
import { computeSpecialEventPricing, SIGNATURE_TYPEFACE_OPTIONS, type SignatureTypefaceId } from '@/lib/contracts/adminContractPayload';
import type { WizardChunkClient } from '@/lib/contracts/contractFragment';
import type { SpecialEventInitId } from '@/lib/contracts/specialEventConstants';
import { SPECIAL_EVENT_INIT_LABELS } from '@/lib/contracts/specialEventInitLabels';
import NativeBlocks from './NativeBlocks';
import WizardSelect from './WizardSelect';

type WApi = { ok:true; chunks:WizardChunkClient[]; stepLabels:string[]; requiredInitialIds:SpecialEventInitId[] };
const FONTS_HREF='https://fonts.googleapis.com/css2?family=Allura&family=Caveat:wght@400;600&family=Cinzel:wght@500;600&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Parisienne&display=swap';
const ALLERGY_OPTS=['','None','Latex','Fragrance / Perfume','Hair Dye / PPD','Shellac / Gel products','Nail Acrylic / Monomer','Nickel / Metal','Adhesives / Glue','Essential Oils','Preservatives (parabens, formaldehyde)','Multiple allergies — see details below','Other — see details below'];
const SKIN_OPTS=['','None','Sensitive skin','Eczema','Psoriasis','Rosacea','Acne / Active breakouts','Dermatitis','Scalp condition','Thin / damaged hair or scalp','Recent chemical service (within 4 weeks)','Multiple conditions — see details below','Other — see details below'];
const PHOTO_OPTS=['','Option 1 — Full Consent','Option 2 — Limited Consent / Final Look Only','Option 3 — No Consent'];
const needsDetail=(s:string)=>s.includes('details below')||s.includes('Multiple')||s.includes('Other')||s.includes('Scalp');
const WORDS=['Brewing the glam ✨','Curling the clauses 💇‍♀️','Polishing the fine print 💅','Steaming the details 🧖‍♀️','Blending the terms 🎨','Setting the sparkle 💎','Mixing the magic 🪄','Priming the pages 📋','Styling your contract 💄','Almost runway ready 👠'];

function initials(name:string){const p=name.trim().split(/\s+/);let o='';for(const w of p){for(let i=0;i<w.length&&o.length<4;i++){const c=w[i]!.toUpperCase();if(c>='A'&&c<='Z'){o+=c;break;}}}if(!o){for(const w of p){if(w.length>0&&o.length<4)o+=w[0]!.toUpperCase();}}return o.slice(0,4)||'✓';}
function longDate(iso:string){const d=new Date(`${iso}T12:00:00`);return isNaN(d.getTime())?iso:d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});}


async function rasterSig(text:string,family:string){await document.fonts.ready;const w=500,h=130,dpr=Math.min(window.devicePixelRatio||1,2),c=document.createElement('canvas');c.width=w*dpr;c.height=h*dpr;const x=c.getContext('2d');if(!x)return'';x.scale(dpr,dpr);x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#1e1018';let px=44;x.textAlign='center';x.textBaseline='middle';const m=(p:number)=>{x.font=`${p}px ${family}`;return x.measureText(text.trim()||' ').width;};while(px>16&&m(px)>w-48)px-=2;x.font=`${px}px ${family}`;x.fillText(text.trim()||' ',w/2,h/2);const u=c.toDataURL('image/png');return u.includes(',')?u.split(',')[1]||'':u;}

export default function ClientSignWizard({token,adminPayload,contractNumber,onComplete}:{token:string;adminPayload:AdminContractPayload;contractNumber:string|null;onComplete:(r:string|null)=>void}){
const[wiz,setWiz]=useState<WApi|null>(null);
const[loadErr,setLoadErr]=useState('');
const[phase,setPhase]=useState(0);
const[err,setErr]=useState('');
const[submitting,setSubmitting]=useState(false);
const[als,setAls]=useState('');const[ald,setAld]=useState('');
const[sks,setSks]=useState('');const[skd,setSkd]=useState('');
const[pv,setPv]=useState('');const[pr,setPr]=useState('');
const[inits,setInits]=useState<Record<string,string>>({});
const[pname,setPname]=useState(adminPayload.clientLegalName||'');
const[signDate]=useState(()=>new Date().toISOString().slice(0,10));
const[geo,setGeo]=useState(false);
const[sigPng,setSigPng]=useState('');
const[sigMode,setSigMode]=useState<'draw'|'type'>('draw');
const[typeface,setTypeface]=useState<SignatureTypefaceId>('dancing');
const[typedText,setTypedText]=useState(adminPayload.clientLegalName||'');
const[wordIdx,setWordIdx]=useState(0);
const[loadProg,setLoadProg]=useState(0);
const canvasRef=useRef<HTMLCanvasElement|null>(null);
const drawing=useRef(false);const last=useRef<{x:number;y:number}|null>(null);
const topRef=useRef<HTMLDivElement|null>(null);
const pendingScrollRef=useRef<string|null>(null);

const tc=wiz?.chunks.length??0;
const allInitLabelHtml=useMemo(()=>{if(!wiz)return{} as Record<string,string>;const m:Record<string,string>={};for(const ch of wiz.chunks){Object.assign(m,ch.initLabelHtml);}return m;},[wiz]);
const total=1+tc+2;
const signIdx=tc+1;
const pricing=useMemo(()=>computeSpecialEventPricing(adminPayload),[adminPayload]);

useEffect(()=>{const id='ggs-sign-fonts';if(!document.getElementById(id)){const l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=FONTS_HREF;document.head.appendChild(l);}},[]);
useEffect(()=>{if(!wiz)return;const id=setInterval(()=>setWordIdx(i=>(i+1)%WORDS.length),2200);return()=>clearInterval(id);},[wiz]);
useLayoutEffect(()=>{topRef.current?.scrollIntoView({behavior:'auto',block:'start'});window.scrollTo(0,0);},[phase]);

useEffect(()=>{let c=false;(async()=>{try{const r=await fetch(`/api/contracts/sign/${encodeURIComponent(token)}/wizard`);const d=await r.json();if(c)return;if(!r.ok||!d.ok){setLoadErr(d.error||'Could not load.');return;}setWiz(d as WApi);}catch{if(!c)setLoadErr('Could not load.');}})();return()=>{c=true;};},[token]);

// Loading progress
useEffect(()=>{if(wiz)return;const id=setInterval(()=>setLoadProg(p=>{if(p>=92)return 92;return Math.min(92,p+(p<40?3:p<70?2:0.7));}),100);return()=>clearInterval(id);},[wiz]);
useEffect(()=>{if(wiz)setLoadProg(100);},[wiz]);

const stepInits=useCallback((p:number):SpecialEventInitId[]=>{if(!wiz||p<1||p>tc)return[];return wiz.chunks[p-1].initialIds.filter(id=>wiz.requiredInitialIds.includes(id));},[wiz,tc]);

const pos=useCallback((e:React.MouseEvent<HTMLCanvasElement>|React.TouchEvent<HTMLCanvasElement>)=>{const c=canvasRef.current;if(!c)return{x:0,y:0};const r=c.getBoundingClientRect();const sx=c.width/r.width,sy=c.height/r.height;if('touches' in e&&e.touches[0])return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy};const me=e as React.MouseEvent<HTMLCanvasElement>;return{x:(me.clientX-r.left)*sx,y:(me.clientY-r.top)*sy};},[]);
const startDraw=useCallback((e:React.MouseEvent<HTMLCanvasElement>|React.TouchEvent<HTMLCanvasElement>)=>{drawing.current=true;last.current=pos(e);},[pos]);
const endDraw=useCallback(()=>{drawing.current=false;last.current=null;},[]);
const doDraw=useCallback((e:React.MouseEvent<HTMLCanvasElement>|React.TouchEvent<HTMLCanvasElement>)=>{if(!drawing.current)return;const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;const p2=pos(e);const prev=last.current;if(prev){ctx.strokeStyle='#1e1018';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();}last.current=p2;},[pos]);
const clearCanvas=useCallback(()=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);setSigPng('');},[]);
useEffect(()=>{const c=canvasRef.current;if(!c||phase!==signIdx||sigMode!=='draw')return;const dpr=Math.min(window.devicePixelRatio||1,2);const w=Math.min(500,c.clientWidth||320),h=130;c.width=w*dpr;c.height=h*dpr;const ctx=c.getContext('2d');if(!ctx)return;ctx.scale(dpr,dpr);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);},[phase,signIdx,sigMode]);
const canvasB64=useCallback(()=>{const c=canvasRef.current;if(!c)return'';const u=c.toDataURL('image/png');return u.includes(',')?u.split(',')[1]||'':u;},[]);

const tapInitial=useCallback((id:SpecialEventInitId)=>{const v=initials(pname||adminPayload.clientLegalName||'');if(v)setInits(prev=>({...prev,[id]:v}));},[pname,adminPayload.clientLegalName]);

/* Find first missing initial across ALL chunks and navigate there */
const scrollToNextInit=useCallback(()=>{if(!wiz)return;
for(let ci=0;ci<wiz.chunks.length;ci++){const ch=wiz.chunks[ci];
for(const sec of ch.sections){for(const id of sec.initialIds){if(wiz.requiredInitialIds.includes(id)&&!(inits[id]||'').trim()){
const targetPhase=ci+1;
pendingScrollRef.current=`init-${id}`;
if(phase!==targetPhase){setPhase(targetPhase);}else{
const el=document.getElementById(`init-${id}`);
if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('csInitPulse');setTimeout(()=>el.classList.remove('csInitPulse'),1500);}
pendingScrollRef.current=null;}
return;}}}}},[wiz,inits,phase]);

/* After phase changes, scroll to the pending initial */
useEffect(()=>{const id=pendingScrollRef.current;if(!id)return;
const tryScroll=(attempt:number)=>{const el=document.getElementById(id);
if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('csInitPulse');setTimeout(()=>el.classList.remove('csInitPulse'),1500);pendingScrollRef.current=null;}
else if(attempt<10){setTimeout(()=>tryScroll(attempt+1),150);}};
setTimeout(()=>tryScroll(0),100);},[phase]);

const allInitsDone=useMemo(()=>{if(!wiz)return false;return wiz.requiredInitialIds.every(id=>(inits[id]||'').trim().length>0);},[wiz,inits]);
const missingInitsCount=useMemo(()=>{if(!wiz)return 0;return wiz.requiredInitialIds.filter(id=>!(inits[id]||'').trim()).length;},[wiz,inits]);

const goNext=useCallback(()=>{if(!wiz)return;setErr('');
if(phase>=1&&phase<=tc){const ids=stepInits(phase);for(const id of ids){if(!(inits[id]||'').trim()){setErr('Tap each initial box to acknowledge.');return;}}
const ch=wiz.chunks[phase-1];const chunkHasAllergy=ch.sections.some(s=>s.initialIds.includes('init_allergy' as SpecialEventInitId));const chunkHasPhoto=ch.sections.some(s=>s.initialIds.includes('init_photo' as SpecialEventInitId));
if(chunkHasAllergy){if(!als){setErr('Please select an allergy / sensitivity option.');return;}if(needsDetail(als)&&!ald.trim()){setErr('Please describe your allergies.');return;}if(!sks){setErr('Please select a skin / scalp condition option.');return;}if(needsDetail(sks)&&!skd.trim()){setErr('Please describe your conditions.');return;}}
if(chunkHasPhoto){if(!pv){setErr('Please select a photo / video consent option.');return;}}}
/* Block sign step if ANY initials are missing globally */
if(phase===tc&&!allInitsDone){setErr(`${missingInitsCount} initial(s) still missing. Tap "Next Initial" to find them.`);return;}
if(phase===signIdx){if(!pname.trim()){setErr('Enter your printed legal name.');return;}if(!geo){setErr('Please confirm data collection consent.');return;}
if(sigMode==='draw'){const b=canvasB64();if(b.length<80){setErr('Please draw your signature.');return;}setSigPng(b);setPhase(p=>p+1);return;}
const fam=SIGNATURE_TYPEFACE_OPTIONS.find(o=>o.id===typeface)?.family??'serif';void rasterSig(typedText.trim()||pname.trim(),fam).then(b=>{if(b.length<80){setErr('Could not create signature. Try Draw mode.');return;}setSigPng(b);setPhase(p=>p+1);});return;}
setPhase(p=>p+1);},[wiz,phase,tc,stepInits,inits,als,ald,sks,skd,pv,pr,signIdx,pname,geo,sigMode,canvasB64,typeface,typedText,allInitsDone,missingInitsCount]);

const submit=useCallback(async()=>{if(!wiz)return;setErr('');setSubmitting(true);
try{const sig=sigPng.trim()||canvasB64();if(sig.length<80){setErr('Signature required.');setSubmitting(false);return;}
const body={mode:'special-events-v1' as const,allergySelect:als,allergyDetail:ald,skinSelect:sks,skinDetail:skd,photoValue:pv,photoRestrict:'',geoConsent:true as const,initials:Object.fromEntries(wiz.requiredInitialIds.map(id=>[id,(inits[id]||'').trim().toUpperCase()])),printedName:pname.trim(),clientSignDateDisplay:longDate(signDate),signatureMethod:sigMode,...(sigMode==='type'?{signatureTypefaceId:typeface}:{}),signaturePngBase64:sig};
const r=await fetch(`/api/contracts/sign/${encodeURIComponent(token)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
const d=await r.json().catch(()=>({}));if(!r.ok){setErr(typeof d.error==='string'?d.error:'Submission failed.');setSubmitting(false);return;}
onComplete(typeof d.referenceCode==='string'?d.referenceCode:null);}catch{setErr('Network error.');}setSubmitting(false);
},[wiz,sigPng,canvasB64,als,ald,sks,skd,pv,pr,inits,pname,signDate,sigMode,typeface,token,onComplete]);

// ── LOADING ──
if(loadErr)return<div className="csShell"><p style={{color:'#ff6b8a',textAlign:'center',padding:48}}>{loadErr}</p></div>;
if(!wiz)return(
<div className="csShell" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh'}}>
<div style={{textAlign:'center',maxWidth:400,padding:'0 24px'}}>
<div style={{fontSize:48,marginBottom:16,animation:'csPulse 2s ease-in-out infinite'}}>💎</div>
<h1 className="csGradTitle">Preparing Your Agreement</h1>
{contractNumber&&<p className="csContractNum">{contractNumber}</p>}
<p style={{color:'#888',fontSize:'.82rem',marginBottom:28}}>for {adminPayload.clientLegalName}</p>
<div className="csBarWrap"><div className="csBarFill" style={{width:`${Math.round(loadProg)}%`}}/></div>
<p style={{color:'#555',fontSize:'.62rem',fontWeight:600,letterSpacing:'1.5px',marginBottom:20}}>{Math.round(loadProg)}%</p>
<p style={{color:'#ccc',fontSize:'.85rem',minHeight:26}}>{WORDS[wordIdx]}</p>
<div style={{display:'flex',justifyContent:'center',gap:5,marginTop:20}}>{[0,1,2].map(i=><span key={i} className="csDot" style={{animationDelay:`${i*.15}s`}}/>)}</div>
</div></div>);

const stepLabel=phase===0?'Overview':phase>=1&&phase<=tc?wiz.stepLabels[phase-1]||`Part ${phase}`:phase===signIdx?'Sign':'Review & Submit';
const curInits=stepInits(phase);
const typeFam=SIGNATURE_TYPEFACE_OPTIONS.find(o=>o.id===typeface)?.family??'serif';

return(
<><div className="csShell" ref={topRef}>
{/* Top bar */}
<div className="csTopBar">
<div><div className="csTopBrand">Glitz & Glamour</div><div className="csTopSub">{stepLabel}</div></div>
<div className="csProgWrap"><div className="csProgBar"><div className="csProgFill" style={{width:`${((phase+1)/total)*100}%`}}/></div><span className="csProgLabel">Step {phase+1}/{total}</span></div>
</div>

<div className="csWrap">
{/* ── OVERVIEW ── */}
{phase===0&&(
<div className="csCard"><div className="csCardHead"><span className="csCardTitle">Agreement Overview</span>{contractNumber&&<span className="csCardBadge">{contractNumber}</span>}</div>
<div className="csCardBody">
<p style={{color:'#888',fontSize:'.82rem',lineHeight:1.7,marginBottom:16}}>Review the summary below, then continue through each part. You will initial each section, enter health details, sign, and submit.</p>
<div className="csInfoGrid">
{[['Client',adminPayload.clientLegalName],['Phone',adminPayload.phone],['Email',adminPayload.email],['Event',`${adminPayload.eventType} · ${adminPayload.eventDate}`],['Venue',adminPayload.venue],['Start Time',adminPayload.startTime],['Headcount',adminPayload.headcount]].map(([k,v])=>(
<div key={k} className="csInfoRow"><span className="csInfoK">{k}</span><span className="csInfoV">{v}</span></div>))}
</div>
<h3 className="csH3" style={{marginTop:20}}>Services</h3>
<div className="csTblWrap"><table className="csTbl"><thead><tr><th>Service</th><th>Price</th><th>Notes</th></tr></thead><tbody>
{pricing.serviceLines.map((r,i)=><tr key={i}><td>{r.description}</td><td>{r.priceDisplay}</td><td>{r.notes}</td></tr>)}
<tr className="csTotalRow"><td colSpan={2} style={{textAlign:'right',fontWeight:600}}>Grand Total</td><td style={{fontWeight:700}}>${pricing.grandTotal.toFixed(2)}</td></tr>
</tbody></table></div>
</div></div>)}

{/* ── TERM STEPS ── */}
{phase>=1&&phase<=tc&&(()=>{const ch=wiz.chunks[phase-1];const secInits=(sid:number)=>{const sec=ch.sections[sid];if(!sec)return[];return sec.initialIds.filter(id=>wiz.requiredInitialIds.includes(id));};return(
<div className="csCard"><div className="csCardHead"><span className="csCardTitle">{stepLabel}</span><span className="csCardBadge">{phase}/{tc}</span></div>
<div className="csCardBody">
{ch.sections.map((sec,si)=>{const sids=secInits(si);const hasAllergy=sec.initialIds.includes('init_allergy' as SpecialEventInitId);const hasPhoto=sec.initialIds.includes('init_photo' as SpecialEventInitId);return(<div key={si}>
<NativeBlocks blocks={sec.blocks}/>
{hasAllergy&&(<div className="csClientFields">
<h4 className="csFieldTitle">Your Health Disclosure</h4>
<label className="csLabel">Allergies / Sensitivities</label>
<WizardSelect options={ALLERGY_OPTS} value={als} onChange={setAls} placeholder="Select allergy / sensitivity…"/>
{needsDetail(als)&&<textarea className="csTextarea" placeholder="Describe allergies…" value={ald} onChange={e=>setAld(e.target.value)}/>}
<label className="csLabel">Skin / Scalp Conditions</label>
<WizardSelect options={SKIN_OPTS} value={sks} onChange={setSks} placeholder="Select skin / scalp condition…"/>
{needsDetail(sks)&&<textarea className="csTextarea" placeholder="Describe conditions…" value={skd} onChange={e=>setSkd(e.target.value)}/>}
</div>)}
{hasPhoto&&(<div className="csClientFields">
<h4 className="csFieldTitle">Photo / Video Consent</h4>
<label className="csLabel">Photo / Video Consent</label>
<WizardSelect options={PHOTO_OPTS} value={pv} onChange={setPv} placeholder="Select photo / video consent…"/>

</div>)}
{sids.length>0&&<div style={{margin:'14px 0 18px'}}><h4 style={{color:'#FF6BA8',fontSize:'.65rem',letterSpacing:'2px',textTransform:'uppercase',marginBottom:8}}>TAP TO INITIAL</h4>
{sids.map(id=>{const done=!!(inits[id]||'').trim();return(
<button key={id} id={`init-${id}`} type="button" className={`csInitRow${done?' csInitDone':''}`} onClick={()=>tapInitial(id)}>
<span className="csInitBox">{done?inits[id]:<span className="csInitPH">TAP</span>}</span>
{allInitLabelHtml[id]?
<span className="csInitLabel" dangerouslySetInnerHTML={{__html:allInitLabelHtml[id]}}/>:
<span className="csInitLabel">{SPECIAL_EVENT_INIT_LABELS[id]||id}</span>}
{done&&<span className="csInitCheck">✓</span>}
</button>);})}
</div>}
{si<ch.sections.length-1&&<hr className="csHr"/>}
</div>);})}
</div></div>);})()}

{/* ── SIGN ── */}
{phase===signIdx&&(
<div className="csCard"><div className="csCardHead"><span className="csCardTitle">Sign Agreement</span></div>
<div className="csCardBody">
<label className="csLabel">Printed Legal Name</label>
<input className="csInput" value={pname} onChange={e=>setPname(e.target.value)} placeholder="Your full legal name"/>
<label className="csLabel" style={{marginTop:14}}>Signing Date</label>
<input className="csInput" value={longDate(signDate)} readOnly style={{opacity:.7,cursor:'not-allowed'}}/>
<div className="csGeoRow" onClick={()=>setGeo(g=>!g)} style={{cursor:'pointer'}}>
<span className={`csGeoBox${geo?' csGeoDone':''}`}>{geo?'✓':''}</span>
<span className="csGeoLabel">I consent to the collection of my IP address, device info, and signing timestamp for verification purposes (Section 29).</span>
</div>
<div className="csSigBlock">
<h4 style={{textAlign:'center',marginBottom:14,color:'#fff'}}>Your Signature</h4>
<div className="csSigTabs"><button type="button" className={`csSigTab${sigMode==='draw'?' csSigTabOn':''}`} onClick={()=>setSigMode('draw')}>✏️ Draw</button><button type="button" className={`csSigTab${sigMode==='type'?' csSigTabOn':''}`} onClick={()=>setSigMode('type')}>⌨️ Type</button></div>
{sigMode==='draw'?(
<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
<p style={{color:'#888',fontSize:'.72rem'}}>Draw your signature below</p>
<canvas ref={canvasRef} className="csSigCanvas" onMouseDown={startDraw} onMouseUp={endDraw} onMouseLeave={endDraw} onMouseMove={doDraw} onTouchStart={startDraw} onTouchEnd={endDraw} onTouchMove={doDraw}/>
<button type="button" className="csBtnClear" onClick={clearCanvas}>Clear</button>
</div>):(
<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
<input className="csInput" style={{maxWidth:360}} value={typedText} onChange={e=>setTypedText(e.target.value)} placeholder="Type your name"/>
<div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
{SIGNATURE_TYPEFACE_OPTIONS.map(o=><button key={o.id} type="button" className={`csFontOpt${typeface===o.id?' csFontSel':''}`} onClick={()=>setTypeface(o.id)}><span style={{fontFamily:o.family,fontSize:'1.1rem',color:'#FF6BA8'}}>{typedText.trim()||'Preview'}</span><span style={{fontSize:'.55rem',color:'#888',display:'block',marginTop:2}}>{o.label}</span></button>)}
</div>
<div className="csSigPreview"><span style={{fontFamily:typeFam,fontSize:'2rem',color:'#FF6BA8'}}>{typedText.trim()||pname.trim()||'Your Name'}</span></div>
</div>)}
</div>
</div></div>)}

{/* ── REVIEW ── */}
{phase===tc+2&&(
<div className="csCard"><div className="csCardHead"><span className="csCardTitle">Review & Submit</span></div>
<div className="csCardBody">
<p style={{color:'#ccc',fontSize:'.84rem',lineHeight:1.7,marginBottom:16}}>Review your details below. Once submitted, your signed PDF will be generated.</p>
<div className="csInfoGrid">
<div className="csInfoRow"><span className="csInfoK">Name</span><span className="csInfoV">{pname}</span></div>
<div className="csInfoRow"><span className="csInfoK">Date</span><span className="csInfoV">{longDate(signDate)}</span></div>
<div className="csInfoRow"><span className="csInfoK">Initials</span><span className="csInfoV">{Object.keys(inits).length} of {wiz.requiredInitialIds.length} completed</span></div>
<div className="csInfoRow"><span className="csInfoK">Signature</span><span className="csInfoV">{sigPng.length>80?'✅ Captured':'❌ Missing'}</span></div>
</div>
{sigPng.length>80&&<div style={{textAlign:'center',margin:'16px 0'}}><img src={`data:image/png;base64,${sigPng}`} alt="Signature" style={{maxWidth:280,border:'1px solid #333',borderRadius:8}}/></div>}
{err&&<p className="csErr">{err}</p>}
<button type="button" className="csBtnSubmit" disabled={submitting} onClick={submit}>{submitting?'Submitting…':'Submit Agreement'}</button>
</div></div>)}

{err&&phase!==tc+2&&<p className="csErr">{err}</p>}
</div>
</div>

{/* Nav buttons — portaled to body so position:fixed always works */}
{typeof document !== 'undefined' && createPortal(
<>
{phase>0&&<button type="button" className="csFloatBack" onClick={()=>{setErr('');setPhase(p=>p-1);}}>← Back</button>}
{!allInitsDone&&phase>0&&<button type="button" className="csFloatInit" onClick={scrollToNextInit}>Next Initial ({missingInitsCount})</button>}
{phase<tc+2&&<button type="button" className="csFloatNext" onClick={goNext}>Continue →</button>}
</>,
document.body
)}
</>);
}
