'use client';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AdminContractPayload } from '@/lib/contracts/adminContractPayload';
import { computeSpecialEventPricing, formatAllergyDisplay, formatSkinDisplay, SIGNATURE_TYPEFACE_OPTIONS, type SignatureTypefaceId } from '@/lib/contracts/adminContractPayload';
import type { WizardChunkClient } from '@/lib/contracts/contractFragment';
import type { SpecialEventInitId } from '@/lib/contracts/specialEventConstants';
import { SPECIAL_EVENT_INIT_LABELS } from '@/lib/contracts/specialEventInitLabels';
import NativeBlocks from './NativeBlocks';
import WizardSelect from './WizardSelect';
import { getWizardLang } from './wizardI18n';

type WApi = { ok:true; chunks:WizardChunkClient[]; stepLabels:string[]; requiredInitialIds:SpecialEventInitId[] };
const FONTS_HREF='https://fonts.googleapis.com/css2?family=Allura&family=Caveat:wght@400;600&family=Cinzel:wght@500;600&family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Parisienne&display=swap';
const needsDetail=(s:string)=>s.includes('details below')||s.includes('detalles abajo')||s.includes('Multiple')||s.includes('Múltiples')||s.includes('Other')||s.includes('Otro')||s.includes('Scalp')||s.includes('cuero cabelludo');

function initials(name:string){const p=name.trim().split(/\s+/);let o='';for(const w of p){for(let i=0;i<w.length&&o.length<4;i++){const c=w[i]!.toUpperCase();if(c>='A'&&c<='Z'){o+=c;break;}}}if(!o){for(const w of p){if(w.length>0&&o.length<4)o+=w[0]!.toUpperCase();}}return o.slice(0,4)||'✓';}
function longDate(iso:string){const d=new Date(`${iso}T12:00:00`);return isNaN(d.getTime())?iso:d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});}
function shortDate(iso:string){const d=new Date(`${iso}T12:00:00`);if(isNaN(d.getTime()))return iso;const mm=String(d.getMonth()+1).padStart(2,'0');const dd=String(d.getDate()).padStart(2,'0');return `${mm}/${dd}/${d.getFullYear()}`;}


async function rasterSig(text:string,family:string){await document.fonts.ready;const w=500,h=130,dpr=Math.min(window.devicePixelRatio||1,2),c=document.createElement('canvas');c.width=w*dpr;c.height=h*dpr;const x=c.getContext('2d');if(!x)return'';x.scale(dpr,dpr);x.fillStyle='#fff';x.fillRect(0,0,w,h);x.fillStyle='#1e1018';let px=44;x.textAlign='center';x.textBaseline='middle';const m=(p:number)=>{x.font=`${p}px ${family}`;return x.measureText(text.trim()||' ').width;};while(px>16&&m(px)>w-48)px-=2;x.font=`${px}px ${family}`;x.fillText(text.trim()||' ',w/2,h/2);const u=c.toDataURL('image/png');return u.includes(',')?u.split(',')[1]||'':u;}

export default function ClientSignWizard({token,adminPayload,contractNumber,onComplete}:{token:string;adminPayload:AdminContractPayload;contractNumber:string|null;onComplete:(r:string|null)=>void}){
const t=useMemo(()=>getWizardLang(adminPayload.contractType),[adminPayload.contractType]);
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
const[typedText,setTypedText]=useState('');
const[wordIdx,setWordIdx]=useState(0);
const[loadProg,setLoadProg]=useState(0);
const[submitProg,setSubmitProg]=useState(0);
const[submitWordIdx,setSubmitWordIdx]=useState(0);
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
useEffect(()=>{if(!wiz)return;const id=setInterval(()=>setWordIdx(i=>(i+1)%t.loadingWords.length),2200);return()=>clearInterval(id);},[wiz,t]);
useLayoutEffect(()=>{topRef.current?.scrollIntoView({behavior:'auto',block:'start'});window.scrollTo(0,0);},[phase]);

useEffect(()=>{let c=false;(async()=>{try{const r=await fetch(`/api/contracts/sign/${encodeURIComponent(token)}/wizard`);const d=await r.json();if(c)return;if(!r.ok||!d.ok){setLoadErr(d.error||'Could not load.');return;}setWiz(d as WApi);}catch{if(!c)setLoadErr('Could not load.');}})();return()=>{c=true;};},[token]);

// Loading progress
useEffect(()=>{if(wiz)return;const id=setInterval(()=>setLoadProg(p=>{if(p>=92)return 92;return Math.min(92,p+(p<40?3:p<70?2:0.7));}),100);return()=>clearInterval(id);},[wiz]);
useEffect(()=>{if(wiz)setLoadProg(100);},[wiz]);

/* Submit loading animation */
useEffect(()=>{if(!submitting){setSubmitProg(0);setSubmitWordIdx(0);return;}
const prog=setInterval(()=>setSubmitProg(p=>{if(p>=95)return 95;return Math.min(95,p+(p<30?4:p<60?2.5:p<80?1.2:0.4));}),120);
const word=setInterval(()=>setSubmitWordIdx(i=>(i+1)%t.submitWords.length),2000);
return()=>{clearInterval(prog);clearInterval(word);};},[submitting]);

const stepInits=useCallback((p:number):SpecialEventInitId[]=>{if(!wiz||p<1||p>tc)return[];return wiz.chunks[p-1].initialIds.filter(id=>wiz.requiredInitialIds.includes(id));},[wiz,tc]);

const pos=useCallback((e:React.MouseEvent<HTMLCanvasElement>|React.TouchEvent<HTMLCanvasElement>)=>{const c=canvasRef.current;if(!c)return{x:0,y:0};const r=c.getBoundingClientRect();const sx=c.width/r.width,sy=c.height/r.height;if('touches' in e&&e.touches[0])return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy};const me=e as React.MouseEvent<HTMLCanvasElement>;return{x:(me.clientX-r.left)*sx,y:(me.clientY-r.top)*sy};},[]);
const startDraw=useCallback((e:React.MouseEvent<HTMLCanvasElement>|React.TouchEvent<HTMLCanvasElement>)=>{drawing.current=true;last.current=pos(e);},[pos]);
const endDraw=useCallback(()=>{drawing.current=false;last.current=null;},[]);
const doDraw=useCallback((e:React.MouseEvent<HTMLCanvasElement>|React.TouchEvent<HTMLCanvasElement>)=>{if(!drawing.current)return;const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;const p2=pos(e);const prev=last.current;if(prev){ctx.strokeStyle='#1e1018';ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(prev.x,prev.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();}last.current=p2;},[pos]);
const clearCanvas=useCallback(()=>{const c=canvasRef.current;if(!c)return;const ctx=c.getContext('2d');if(!ctx)return;ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);setSigPng('');},[]);
useEffect(()=>{const c=canvasRef.current;if(!c||phase!==signIdx||sigMode!=='draw')return;const dpr=Math.min(window.devicePixelRatio||1,2);const w=Math.min(500,c.clientWidth||320),h=130;c.width=w*dpr;c.height=h*dpr;const ctx=c.getContext('2d');if(!ctx)return;ctx.scale(dpr,dpr);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);},[phase,signIdx,sigMode]);
const canvasB64=useCallback(()=>{const c=canvasRef.current;if(!c)return'';const u=c.toDataURL('image/png');return u.includes(',')?u.split(',')[1]||'':u;},[]);

const tapInitial=useCallback((id:SpecialEventInitId)=>{const v=initials(pname||adminPayload.clientLegalName||'');if(v)setInits(prev=>({...prev,[id]:v}));},[pname,adminPayload.clientLegalName]);

/* Find first missing initial on the CURRENT page only */
const scrollToNextInit=useCallback(()=>{if(!wiz||phase<1||phase>tc)return;
const ch=wiz.chunks[phase-1];
for(const sec of ch.sections){for(const id of sec.initialIds){if(wiz.requiredInitialIds.includes(id)&&!(inits[id]||'').trim()){
const el=document.getElementById(`init-${id}`);
if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('csInitPulse');setTimeout(()=>el.classList.remove('csInitPulse'),1500);}
return;}}}},[wiz,inits,phase,tc]);

/* After phase changes, scroll to the pending initial */
useEffect(()=>{const id=pendingScrollRef.current;if(!id)return;
const tryScroll=(attempt:number)=>{const el=document.getElementById(id);
if(el){el.scrollIntoView({behavior:'smooth',block:'center'});el.classList.add('csInitPulse');setTimeout(()=>el.classList.remove('csInitPulse'),1500);pendingScrollRef.current=null;}
else if(attempt<10){setTimeout(()=>tryScroll(attempt+1),150);}};
setTimeout(()=>tryScroll(0),100);},[phase]);

const allInitsDone=useMemo(()=>{if(!wiz)return false;return wiz.requiredInitialIds.every(id=>(inits[id]||'').trim().length>0);},[wiz,inits]);
const missingInitsCount=useMemo(()=>{if(!wiz)return 0;return wiz.requiredInitialIds.filter(id=>!(inits[id]||'').trim()).length;},[wiz,inits]);
const pageInitsMissing=useMemo(()=>{if(!wiz||phase<1||phase>tc)return 0;const ch=wiz.chunks[phase-1];return ch.sections.flatMap(s=>s.initialIds).filter(id=>wiz.requiredInitialIds.includes(id)&&!(inits[id]||'').trim()).length;},[wiz,inits,phase,tc]);

const goNext=useCallback(()=>{if(!wiz)return;setErr('');
if(phase>=1&&phase<=tc){const ids=stepInits(phase);for(const id of ids){if(!(inits[id]||'').trim()){setErr(t.tapEach);return;}}
const ch=wiz.chunks[phase-1];const chunkHasAllergy=ch.sections.some(s=>s.initialIds.includes('init_allergy' as SpecialEventInitId));const chunkHasPhoto=ch.sections.some(s=>s.initialIds.includes('init_photo' as SpecialEventInitId));
if(chunkHasAllergy){if(!als){setErr(t.selectAllergy);return;}if(needsDetail(als)&&!ald.trim()){setErr(t.describeAllergyErr);return;}if(!sks){setErr(t.selectSkin);return;}if(needsDetail(sks)&&!skd.trim()){setErr(t.describeSkinErr);return;}}
if(chunkHasPhoto){if(!pv){setErr(t.selectPhoto);return;}}}
/* Block sign step if ANY initials are missing globally */
if(phase===tc&&!allInitsDone){setErr(t.missingInitials(missingInitsCount));return;}
if(phase===signIdx){if(!pname.trim()){setErr(t.enterName);return;}if(!geo){setErr(t.confirmConsent);return;}
if(sigMode==='draw'){const b=canvasB64();if(b.length<80){setErr(t.drawSig);return;}setSigPng(b);setPhase(p=>p+1);return;}
const fam=SIGNATURE_TYPEFACE_OPTIONS.find(o=>o.id===typeface)?.family??'serif';void rasterSig(typedText.trim()||pname.trim(),fam).then(b=>{if(b.length<80){setErr(t.drawFail);return;}setSigPng(b);setPhase(p=>p+1);});return;}
setPhase(p=>p+1);},[wiz,phase,tc,stepInits,inits,als,ald,sks,skd,pv,pr,signIdx,pname,geo,sigMode,canvasB64,typeface,typedText,allInitsDone,missingInitsCount,t]);

const submit=useCallback(async()=>{if(!wiz)return;setErr('');setSubmitting(true);
try{const sig=sigPng.trim()||canvasB64();if(sig.length<80){setErr(t.sigRequired);setSubmitting(false);return;}
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
<h1 className="csGradTitle">{t.preparingTitle}</h1>
{contractNumber&&<p className="csContractNum">{contractNumber}</p>}
<p style={{color:'#888',fontSize:'.82rem',marginBottom:28}}>{adminPayload.clientLegalName}</p>
<div className="csBarWrap"><div className="csBarFill" style={{width:`${Math.round(loadProg)}%`}}/></div>
<p style={{color:'#555',fontSize:'.62rem',fontWeight:600,letterSpacing:'1.5px',marginBottom:20}}>{Math.round(loadProg)}%</p>
<p style={{color:'#ccc',fontSize:'.85rem',minHeight:26}}>{t.loadingWords[wordIdx]}</p>
<div style={{display:'flex',justifyContent:'center',gap:5,marginTop:20}}>{[0,1,2].map(i=><span key={i} className="csDot" style={{animationDelay:`${i*.15}s`}}/>)}</div>
</div></div>);

const stepLabel=phase===0?t.overview:phase>=1&&phase<=tc?wiz.stepLabels[phase-1]||`Part ${phase}`:phase===signIdx?t.sign:t.reviewSubmit;
const curInits=stepInits(phase);
const typeFam=SIGNATURE_TYPEFACE_OPTIONS.find(o=>o.id===typeface)?.family??'serif';

return(
<><div className="csShell" ref={topRef}>
{/* Top bar */}
<div className="csTopBar">
<div><div className="csTopBrand">Glitz & Glamour</div><div className="csTopSub">{stepLabel}</div></div>
<div className="csProgWrap"><div className="csProgBar"><div className="csProgFill" style={{width:`${((phase+1)/total)*100}%`}}/></div><span className="csProgLabel">{t.step} {phase+1}/{total}</span></div>
</div>

<div className="csWrap">
{/* ── OVERVIEW ── */}
{phase===0&&(
<div className="csCard"><div className="csCardHead"><span className="csCardTitle">{t.agreementOverview}</span>{contractNumber&&<span className="csCardBadge">{contractNumber}</span>}</div>
<div className="csCardBody">
<p style={{color:'#888',fontSize:'.82rem',lineHeight:1.7,marginBottom:16}}>{t.overviewDesc}</p>
<div className="csInfoGrid">
{[[t.client,adminPayload.clientLegalName],[t.phone,adminPayload.phone],[t.email,adminPayload.email],[t.event,`${adminPayload.eventType} · ${adminPayload.eventDate ? shortDate(adminPayload.eventDate) : '—'}`],[t.venue,adminPayload.venue],[t.startTime,adminPayload.startTime],[t.headcount,adminPayload.headcount],[t.totalSvcBooked,adminPayload.minSvc||'—']].map(([k,v])=>
<div key={k} className="csInfoRow"><span className="csInfoK">{k}</span><span className="csInfoV">{v}</span></div>)}
</div>
<h3 className="csH3" style={{marginTop:20}}>{t.services}</h3>
<div className="csTblWrap"><table className="csTbl"><thead><tr><th>{t.service}</th><th>{t.price}</th><th>{t.notes}</th></tr></thead><tbody>
{pricing.serviceLines.map((r,i)=><tr key={i}><td>{r.description}</td><td>{r.priceDisplay}</td><td>{r.notes}</td></tr>)}
<tr className="csTotalRow"><td colSpan={2} style={{textAlign:'right',fontWeight:600}}>{t.grandTotal}</td><td style={{fontWeight:700}}>${pricing.grandTotal.toFixed(2)}</td></tr>
</tbody></table></div>
</div></div>)}

{/* ── TERM STEPS ── */}
{phase>=1&&phase<=tc&&(()=>{const ch=wiz.chunks[phase-1];const secInits=(sid:number)=>{const sec=ch.sections[sid];if(!sec)return[];return sec.initialIds.filter(id=>wiz.requiredInitialIds.includes(id));};return(
<div className="csCard"><div className="csCardHead"><span className="csCardTitle">{stepLabel}</span><span className="csCardBadge">{phase}/{tc}</span></div>
<div className="csCardBody">
{ch.sections.map((sec,si)=>{const sids=secInits(si);const hasAllergy=sec.initialIds.includes('init_allergy' as SpecialEventInitId);const hasPhoto=sec.initialIds.includes('init_photo' as SpecialEventInitId);return(<div key={si}>
{(()=>{const KV_OVERRIDES:Record<string,string>={'Known Allergies / Sensitivities':als||'—','Alergias / Sensibilidades Conocidas':als||'—','Skin Conditions':sks||'—','Condiciones de la Piel':sks||'—',"Client's Photo/Video Decision":pv||'—','Restrictions / Conditions':pv==='No — consent denied'?(pr||'—'):'—'};const photoLive=pv||'—';const escaped=photoLive.replace(/&/g,'&amp;').replace(/</g,'&lt;');const liveBlocks=sec.blocks.map(b=>{if(b.type==='keyValue'&&KV_OVERRIDES[b.label]!==undefined)return{...b,value:KV_OVERRIDES[b.label]};if(b.type==='callout'&&(b.text.includes('Your election:')||b.text.includes('Su elección:')))return{...b,text:b.text.replace(/((?:Your election|Su elecci[óo]n):<\/strong>\s*)(?:<span[^>]*>)?\s*—\s*(?:<\/span>)?/,'$1'+escaped)};return b;});return <NativeBlocks blocks={liveBlocks}/>})()}
{hasAllergy&&(<div className="csClientFields">
<h4 className="csFieldTitle">{t.yourHealthDisclosure}</h4>
<label className="csLabel">{t.allergiesLabel}</label>
<WizardSelect options={t.allergyOpts} value={als} onChange={setAls} placeholder={t.allergyPlaceholder}/>
{needsDetail(als)&&<textarea className="csTextarea" placeholder={t.describeAllergies} value={ald} onChange={e=>setAld(e.target.value)}/>}
<label className="csLabel">{t.skinLabel}</label>
<WizardSelect options={t.skinOpts} value={sks} onChange={setSks} placeholder={t.skinPlaceholder}/>
{needsDetail(sks)&&<textarea className="csTextarea" placeholder={t.describeConditions} value={skd} onChange={e=>setSkd(e.target.value)}/>}
</div>)}
{hasPhoto&&(<div className="csClientFields">
<h4 className="csFieldTitle">{t.photoVideoConsent}</h4>
<label className="csLabel">{t.photoVideoConsent}</label>
<WizardSelect options={t.photoOpts} value={pv} onChange={setPv} placeholder={t.photoPlaceholder}/>

</div>)}
{sids.length>0&&<div style={{margin:'14px 0 18px'}}><h4 style={{color:'#FF6BA8',fontSize:'.65rem',letterSpacing:'2px',textTransform:'uppercase',marginBottom:8}}>{t.tapToInitial}</h4>
{sids.map(id=>{const done=!!(inits[id]||'').trim();return(
<button key={id} id={`init-${id}`} type="button" className={`csInitRow${done?' csInitDone':''}`} onClick={()=>tapInitial(id)}>
<span className="csInitBox">{done?inits[id]:<span className="csInitPH">{t.tap}</span>}</span>
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
<div className="csCard"><div className="csCardHead"><span className="csCardTitle">{t.signTitle}</span></div>
<div className="csCardBody">
{/* Section 31 body text */}
<div className="csSec31Prose">
<p>{t.sec31p1}</p>
<p><strong>{t.sec31p2.split(':')[0]}:</strong>{t.sec31p2.slice(t.sec31p2.indexOf(':') + 1)}</p>
<p>{t.sec31p3}</p>
</div>

<label className="csLabel" style={{marginTop:20}}>{t.printedName}</label>
<input className="csInput" value={pname} onChange={e=>setPname(e.target.value)} placeholder={t.namePlaceholder}/>
<label className="csLabel" style={{marginTop:14}}>{t.signingDate}</label>
<input className="csInput" value={longDate(signDate)} readOnly style={{opacity:.7,cursor:'not-allowed'}}/>


<div className="csSigBlock">
<h4 style={{textAlign:'center',marginBottom:14,color:'#fff'}}>{t.yourSignature}</h4>
<div className="csSigTabs"><button type="button" className={`csSigTab${sigMode==='draw'?' csSigTabOn':''}`} onClick={()=>setSigMode('draw')}>{t.draw}</button><button type="button" className={`csSigTab${sigMode==='type'?' csSigTabOn':''}`} onClick={()=>setSigMode('type')}>{t.type}</button></div>
{sigMode==='draw'?(
<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
<p style={{color:'#888',fontSize:'.72rem'}}>{t.drawHint}</p>
<canvas ref={canvasRef} className="csSigCanvas" onMouseDown={startDraw} onMouseUp={endDraw} onMouseLeave={endDraw} onMouseMove={doDraw} onTouchStart={startDraw} onTouchEnd={endDraw} onTouchMove={doDraw}/>
<button type="button" className="csBtnClear" onClick={clearCanvas}>{t.clear}</button>
</div>):(
<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
<input className="csInput" style={{maxWidth:360}} value={typedText} onChange={e=>setTypedText(e.target.value)} placeholder={t.typePlaceholder} autoComplete="off"/>
<div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
{SIGNATURE_TYPEFACE_OPTIONS.map(o=><button key={o.id} type="button" className={`csFontOpt${typeface===o.id?' csFontSel':''}`} onClick={()=>setTypeface(o.id)}><span style={{fontFamily:o.family,fontSize:'1.1rem',color:'#FF6BA8'}}>{typedText.trim()||t.preview}</span><span style={{fontSize:'.55rem',color:'#888',display:'block',marginTop:2}}>{o.label}</span></button>)}
</div>
<div className="csSigPreview"><span style={{fontFamily:typeFam,fontSize:'2rem',color:'#FF6BA8'}}>{typedText.trim()||pname.trim()||t.yourName}</span></div>
</div>)}
</div>

{/* Geo / Data consent checkbox */}
<div className="csGeoRow" onClick={()=>setGeo(g=>!g)} style={{cursor:'pointer'}}>
<span className={`csGeoBox${geo?' csGeoDone':''}`}>{geo?'✓':''}</span>
<span className="csGeoLabel"><strong>{t.geoConsentBold}</strong> {t.geoConsentBody}</span>
</div>

{/* "By signing above" confirmation */}
<p className="csSec31Confirm" dangerouslySetInnerHTML={{__html:t.bySigningAbove}}/>

</div></div>)}

{/* ── REVIEW ── */}
{phase===tc+2&&(
<div className="csCard"><div className="csCardHead"><span className="csCardTitle">{t.reviewSubmit}</span></div>
<div className="csCardBody">
<p style={{color:'#ccc',fontSize:'.84rem',lineHeight:1.7,marginBottom:16}}>{t.reviewDesc}</p>

{/* BOOKING DETAILS */}
<div className="csReviewSection">
<p className="csReviewSectionTitle" style={{color:'var(--pk2)'}}>{t.bookingDetails}</p>
<div className="csInfoGrid" style={{margin:0}}>
<div className="csInfoRow"><span className="csInfoK">{t.eventDate}</span><span className="csInfoV">{adminPayload.eventDate ? shortDate(adminPayload.eventDate) : '—'}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.eventLocation}</span><span className="csInfoV">{adminPayload.venue || '—'}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.serviceStartTime}</span><span className="csInfoV">{adminPayload.startTime || '—'}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.confirmedHeadcount}</span><span className="csInfoV">{adminPayload.headcount || '—'}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.totalSvcBookedShort}</span><span className="csInfoV">{adminPayload.minSvc || '—'}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.trialRun}</span><span className="csInfoV">{adminPayload.trialFeeEnabled && adminPayload.trialFee && adminPayload.trialFee !== 'N/A' ? `$${adminPayload.trialFee}` : <span style={{color:'var(--mut)'}}>N/A</span>}</span></div>
</div>
</div>

{/* FINANCIAL SUMMARY */}
<div className="csReviewSection">
<p className="csReviewSectionTitle" style={{color:'#facc15'}}>{t.financialSummary}</p>
<div className="csInfoGrid" style={{margin:0}}>
<div className="csInfoRow"><span className="csInfoK">{t.retainerPaid}</span><span className="csInfoV">{adminPayload.retainer ? `$${parseFloat(adminPayload.retainer).toLocaleString('en-US',{minimumFractionDigits:2})}` : '—'}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.travelFee}</span><span className="csInfoV">{pricing.travelAmount > 0 ? `$${pricing.travelAmount.toLocaleString('en-US',{minimumFractionDigits:2})}` : '—'}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.remainingBalance}</span><span className="csInfoV">{adminPayload.balance ? `$${parseFloat(adminPayload.balance).toLocaleString('en-US',{minimumFractionDigits:2})}` : '—'}</span></div>
<div className="csInfoRow"><span className="csInfoK" style={{color:'#4ade80',fontWeight:700}}>{t.totalContractAmount}</span><span className="csInfoV" style={{color:'#4ade80',fontWeight:700}}>${pricing.grandTotal.toLocaleString('en-US',{minimumFractionDigits:2})}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.paymentPlan}</span><span className="csInfoV" style={adminPayload.ppActive!=='Yes'?{color:'var(--mut)'}:{}}>{adminPayload.ppActive === 'Yes' ? t.active : 'N/A'}</span></div>
</div>
</div>

{/* CLIENT DISCLOSURES */}
<div className="csReviewSection">
<p className="csReviewSectionTitle" style={{color:'#c084fc'}}>{t.clientDisclosures}</p>
<div className="csInfoGrid" style={{margin:0}}>
<div className="csInfoRow"><span className="csInfoK">{t.allergiesSens}</span><span className="csInfoV">{formatAllergyDisplay(als, ald)}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.skinScalp}</span><span className="csInfoV">{formatSkinDisplay(sks, skd)}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.restrictions}</span><span className="csInfoV">{pv === 'No — consent denied' && pr.trim() ? pr.trim() : <span style={{color:'var(--mut)'}}>N/A</span>}</span></div>
<div className="csInfoRow"><span className="csInfoK">{t.photoVideo}</span><span className="csInfoV">{pv || '—'}</span></div>
</div>
</div>

{/* NAME / DATE / INITIALS */}
<div className="csReviewSection">
<p style={{fontSize:'.6rem',letterSpacing:'.5px',textTransform:'uppercase',color:'var(--mut)',fontWeight:600,margin:'0 0 4px'}}>{t.name}</p>
<p style={{margin:'0 0 14px',color:'#fff',fontSize:'1rem',fontWeight:400,fontStyle:'italic'}}>{pname || '—'}</p>
<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
<div>
<p style={{fontSize:'.6rem',letterSpacing:'.5px',textTransform:'uppercase',color:'var(--mut)',fontWeight:600,margin:'0 0 4px'}}>{t.date}</p>
<p style={{margin:0,color:'#fff',fontSize:'.88rem'}}>{shortDate(signDate)}</p>
</div>
<div>
<p style={{fontSize:'.6rem',letterSpacing:'.5px',textTransform:'uppercase',color:'var(--mut)',fontWeight:600,margin:'0 0 4px'}}>{t.initials}</p>
<p style={{margin:0,color:'#fff',fontSize:'.88rem'}}>{Object.keys(inits).length} {t.ofCompleted} {wiz.requiredInitialIds.length} {t.completed}</p>
</div>
</div>
</div>

{/* SIGNATURE PREVIEW */}
{sigPng.length>80&&<div style={{marginBottom:20}}>
<p style={{fontSize:'.6rem',letterSpacing:'.5px',textTransform:'uppercase',color:'var(--mut)',fontWeight:600,margin:'0 0 8px'}}>{t.yourSig}</p>
<div style={{background:'#fff',borderRadius:12,padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
<img src={`data:image/png;base64,${sigPng}`} alt="Signature" style={{maxWidth:'100%',height:'auto',maxHeight:80,display:'block'}}/>
</div>
</div>}

{err&&<p className="csErr">{err}</p>}
<button type="button" className="csBtnSubmit" disabled={submitting} onClick={submit}>{submitting?t.submittingLabel:t.submitAgreement}</button>

{/* ── SUBMIT LOADING OVERLAY ── */}
{submitting&&(
<div style={{position:'fixed',inset:0,zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.82)',backdropFilter:'blur(8px)'}}>
<div style={{textAlign:'center',maxWidth:380,padding:'0 24px',animation:'fadeSlideIn 0.3s ease'}}>
<div style={{fontSize:48,marginBottom:16,animation:'csPulse 2s ease-in-out infinite'}}>💎</div>
<h2 style={{fontFamily:'Poppins,sans-serif',fontSize:'1.3rem',fontWeight:700,background:'linear-gradient(135deg,#FF2D78,#FF6BA8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:8}}>{t.submittingTitle}</h2>
<p style={{color:'#888',fontSize:'.78rem',marginBottom:24}}>{t.dontClose}</p>
<div style={{background:'rgba(255,255,255,0.06)',borderRadius:50,height:10,overflow:'hidden',marginBottom:10,border:'1px solid rgba(255,107,168,0.15)'}}>
<div style={{height:'100%',borderRadius:50,background:'linear-gradient(90deg,#FF2D78,#FF6BA8,#c084fc)',transition:'width 0.3s ease',width:`${Math.round(submitProg)}%`}}/>
</div>
<p style={{color:'#FF6BA8',fontSize:'.72rem',fontWeight:600,letterSpacing:'1.5px',marginBottom:20}}>{Math.round(submitProg)}%</p>
<p style={{color:'#ccc',fontSize:'.88rem',minHeight:26,transition:'opacity 0.3s'}}>{t.submitWords[submitWordIdx]}</p>
<div style={{display:'flex',justifyContent:'center',gap:5,marginTop:16}}>{[0,1,2].map(i=><span key={i} className="csDot" style={{animationDelay:`${i*.15}s`}}/>)}</div>
</div>
</div>)}

{/* LEGAL DISCLAIMER */}
<p style={{fontSize:'.72rem',color:'var(--mut)',lineHeight:1.7,margin:'16px 0 0',textAlign:'center'}}>{t.submitDisclaimer}</p>
<p style={{fontSize:'.6rem',color:'var(--mut)',lineHeight:1.6,margin:'10px 0 0',textAlign:'center'}}>{t.submitAmendment}</p>
</div></div>)}

{err&&phase!==tc+2&&<p className="csErr">{err}</p>}
</div>
</div>

{/* Nav buttons — portaled to body so position:fixed always works */}
{typeof document !== 'undefined' && createPortal(
<>
{phase>0&&<button type="button" className="csFloatBack" onClick={()=>{setErr('');setPhase(p=>p-1);}}>{t.back}</button>}
{pageInitsMissing>0&&phase>=1&&phase<=tc&&<button type="button" className="csFloatInit" onClick={scrollToNextInit}>{t.nextInitial} ({pageInitsMissing})</button>}
{phase<tc+2&&<button type="button" className="csFloatNext" onClick={goNext}>{t.continueBtn}</button>}
</>,
document.body
)}
</>);
}
