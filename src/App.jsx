// Kosova Hub — Design v2 — Modern B2B · Dark Cards · Plus Jakarta Sans
import React, { useState, useMemo, useEffect } from 'react'
import {
  fetchProfiles, fetchAllProfilesAdmin, insertProfile, verifyProfile, deleteProfile, updateProfile,
  insertContactLead, insertBooking, fetchSiteContent,
} from './supabase.js'
import { notifyAdminNewProfile, sendEnquiry, sendBookingConfirmation } from './emailService.js'

const G = {
  bg:'#F0F2F7', surface:'#F8F9FC', card:'#FFFFFF', navBg:'#0E1628',
  text:'#0E1628', muted:'rgba(14,22,40,0.52)', dim:'rgba(14,22,40,0.32)',
  border:'rgba(14,22,40,0.09)',
  blue:'#2458D4', blueDim:'rgba(36,88,212,0.08)', blueBd:'rgba(36,88,212,0.22)',
  violet:'#6B35C2', green:'#0F7B4F', red:'#C23535', white:'#FFFFFF',
}
const CATS = [
  {id:'software',  icon:'💻',color:'#4a8fd4',labels:{en:'Software & IT',   sq:'Softuer & IT'}},
  {id:'support',   icon:'🛠️',color:'#7a5ec4',labels:{en:'Tech Support',    sq:'Mbështetje Tech'}},
  {id:'consulting',icon:'📊',color:'#2a9a8e',labels:{en:'Consulting',       sq:'Konsulencë'}},
  {id:'media',     icon:'🎬',color:'#d46a2a',labels:{en:'Media & Content',  sq:'Media & Content'}},
  {id:'production',icon:'🏭',color:'#a07040',labels:{en:'Production',       sq:'Prodhim'}},
  {id:'textile',   icon:'🧵',color:'#c04080',labels:{en:'Textile & Fashion',sq:'Tekstil & Modë'}},
  {id:'bpo',       icon:'📞',color:'#2090b8',labels:{en:'BPO / Call Centre',sq:'BPO / Call Center'}},
  {id:'design',    icon:'🎨',color:'#9040b8',labels:{en:'Design & Creative',sq:'Dizajn & Kreativ'}},
  {id:'logistics', icon:'🚚',color:'#208a50',labels:{en:'Logistics',        sq:'Logjistikë'}},
  {id:'legal',     icon:'⚖️',color:'#607080',labels:{en:'Legal & Finance',  sq:'Ligjor & Financa'}},
]
const T={
  en:{tagline:'The B2B Gateway to Kosova',navHome:'Home',navDir:'Companies',navConcierge:'Concierge',navGov:'Government',
    registerBtn:'List Your Business',h1a:'Connect your business',h1b:'with Kosova.',
    heroSub:'Discover verified companies and freelancers — ready for worldwide business partnerships.',
    browseBtn:'Browse Directory',allSectors:'All',viewAll:'View all →',onlyComp:'Companies',onlyFL:'Freelancers',allTypes:'All',
    noResults:'No results',noResultsSub:'Try different keywords or filters.',
    verified:'Verified',featured:'Featured',contact:'Contact',statComp:'Companies',statFL:'Freelancers',statPart:'Partners',
    featuredTitle:'Featured Listings',
    concTitle:'Kosova Concierge',concSub:'Our partners handle your entire Kosova business visit — meetings, site tours, government appointments.',concCta:'Request a Visit',
    bookTitle:'Request a Kosova Visit',bookName:'Your name *',bookComp:'Company',bookEmail:'Email *',
    bookGoal:'Your objective',bookGoalPH:'e.g. Meet software teams, find suppliers…',bookWhen:'Preferred period',bookPax:'Participants',
    bookSend:'Submit Request',bookDone:'Request submitted!',bookDoneSub:"We'll reply within 24 hours.",
    govTitle:'Do Business in Kosova',govSub:'10% flat corporate tax · Euro currency · Strategic location · Growing international hub',govFactsTitle:'Key Facts',
    govFacts:[['10%','Corporate Tax'],['18%','VAT'],['€1','Min. Capital'],['5–10 days','Formation'],['EUR','Currency'],['1.8M','Population'],['63%','Under 35'],['2008','Independence']],
    govSteps:[{ic:'🖥️',t:'Register Online',d:'Full registration via ARBK.',time:'1–3 days'},{ic:'💶',t:'Share Capital',d:'Minimum €1.',time:'1 day'},{ic:'📋',t:'Tax ID',d:'Auto-assigned.',time:'1–2 days'},{ic:'🏦',t:'Bank Account',d:'10 licensed banks.',time:'2–5 days'}],
    whyKosova:[['📉','Lowest Tax','10% flat corporate tax.'],['💶','Euro Currency','No FX risk.'],['📍','Strategic Location','Balkans gateway to global markets.'],['🌍','EU Path','Clear accession trajectory.']],
    regTitle:'List Your Business',regFree:'Free for 6 months · No credit card needed',
    regName:'Name *',regCity:'City *',regEmail:'Email *',regDesc:'Description',regDescPH:'Describe your services…',regTags:'Skills / Tags',regTagsPH:'React, Node.js…',
    regSend:'Submit →',regDone:'Submitted!',regDoneSub:"We'll review and publish within 24–48h.",
    enquiryTo:'Enquiry to',enquiryName:'Your name *',enquiryEmail:'Your email *',enquiryMsg:'Message',enquiryPH:"Hello, I'm looking for…",
    enquirySend:'Send Enquiry',enquiryDone:'Sent!',enquiryDoneSub:'will be in touch.',
    links:'Official Links',footer:'© 2025 Kosova Hub · Business Bridge Platform'},
  sq:{tagline:'Porta B2B për Kosovën',navHome:'Kryefaqja',navDir:'Kompanitë',navConcierge:'Concierge',navGov:'Qeveria',
    registerBtn:'Listo Biznesin Tënd',h1a:'Lidhuni me biznesin',h1b:'Kosovar.',
    heroSub:'Zbuloni kompani dhe freelancerë të verifikuar — gati për partneritet ndërkombëtar.',
    browseBtn:'Shfleto Drejtorinë',allSectors:'Të gjitha',viewAll:'Shiko të gjitha →',onlyComp:'Kompani',onlyFL:'Freelancerë',allTypes:'Të gjitha',
    noResults:'Asnjë rezultat',noResultsSub:'Provo terma të tjerë.',
    verified:'Verifikuar',featured:'I Theksuar',contact:'Kontakto',statComp:'Kompani',statFL:'Freelancerë',statPart:'Partnerë',
    featuredTitle:'Listime të Theksuara',
    concTitle:'Concierge Kosovës',concSub:'Partnerët tanë organizojnë vizitën tuaj të plotë — takime, turne, takime qeveritare.',concCta:'Kërko Vizitë',
    bookTitle:'Kërko Vizitë',bookName:'Emri *',bookComp:'Kompania',bookEmail:'Email *',
    bookGoal:'Qëllimi',bookGoalPH:'p.sh. Takim me ekipe software…',bookWhen:'Periudha preferenciale',bookPax:'Pjesëmarrës',
    bookSend:'Dërgo Kërkesën',bookDone:'U dërgua!',bookDoneSub:"Do t'ju kontaktojmë brenda 24 orësh.",
    govTitle:'Bëje Biznes në Kosovë',govSub:'Tatim 10% · Euro · Vendndodhje strategjike · Hub ndërkombëtar',govFactsTitle:'Të Dhënat Kryesore',
    govFacts:[['10%','Tatim'],['18%','TVSH'],['1€','Kapitali'],['5–10 ditë','Themelimi'],['EUR','Valuta'],['1.8M','Banorë'],['63%','Nën 35'],['2008','Pavarësia']],
    govSteps:[{ic:'🖥️',t:'Regjistrim Online',d:'Regjistrim i plotë në ARBK.',time:'1–3 ditë'},{ic:'💶',t:'Kapitali',d:'Minimum 1€.',time:'1 ditë'},{ic:'📋',t:'Numri Fiskal',d:'Caktohet automatikisht.',time:'1–2 ditë'},{ic:'🏦',t:'Llogari Bankare',d:'10 banka të licencuara.',time:'2–5 ditë'}],
    whyKosova:[['📉','Tatimi','Tatim 10% i sheshtë.'],['💶','Euro','Pa rrezik kursi.'],['📍','Vendndodhje','Portë e Ballkanit.'],['🌍','Rruga BE','Trajektore e qartë.']],
    regTitle:'Listo Biznesin Tënd',regFree:'Falas 6 muaj · Pa kartë krediti',
    regName:'Emri *',regCity:'Qyteti *',regEmail:'Email *',regDesc:'Përshkrim',regDescPH:'Përshkruani shërbimet tuaja…',regTags:'Aftësi / Tags',regTagsPH:'React, Node.js…',
    regSend:'Dërgo →',regDone:'U dërgua!',regDoneSub:"Do ta rishikojmë brenda 24–48 orësh.",
    enquiryTo:'Kërkesë për',enquiryName:'Emri juaj *',enquiryEmail:'Email juaj *',enquiryMsg:'Mesazhi',enquiryPH:'Mirëdita, po kërkoj…',
    enquirySend:'Dërgo',enquiryDone:'U dërgua!',enquiryDoneSub:'do t\'ju kontaktojë.',
    links:'Lidhje Zyrtare',footer:'© 2025 Kosova Hub · Business Bridge Platform'}
}

function hexToRgba(hex,a){try{const h=hex.replace('#','');const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);return`rgba(${r},${g},${b},${a})`}catch{return`rgba(36,88,212,${a})`}}
function catColor(id){return CATS.find(c=>c.id===id)?.color||G.blue}
function catLabel(id,lang){return CATS.find(c=>c.id===id)?.labels[lang]||id}
function catIcon(id){return CATS.find(c=>c.id===id)?.icon||'🏢'}
function normalise(p){if(!p)return p;return{...p,coverImage:p.coverImage||p.cover_image||null,coverFocus:p.coverFocus||p.cover_focus||'50% 50%',logoUrl:p.logoUrl||p.logo_url||null,logoColor:p.logoColor||p.logo_color||catColor(p.cat)||G.blue,tags:p.tags||[],desc:typeof p.description==='string'?{en:p.description,sq:p.description}:(p.desc||{})}}
function calcMatch(p,skills){if(!skills.length)return null;const tags=(p.tags||[]).map(t=>t.toLowerCase());const desc=(p.desc?.en||'').toLowerCase();let hits=0;for(const s of skills){const sl=s.toLowerCase().trim();if(!sl)continue;if(tags.some(t=>t.includes(sl)||sl.includes(t))||desc.includes(sl))hits++}return skills.length?Math.round((hits/skills.length)*100):null}

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{font-family:'Plus Jakarta Sans',sans-serif;background:#F0F2F7;color:#0E1628;-webkit-font-smoothing:antialiased;overflow-x:hidden;}
button{cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;}
a{color:inherit;text-decoration:none;}
input,textarea,select{font-family:'Plus Jakarta Sans',sans-serif;}
.wrap2{max-width:1200px;margin:0 auto;padding:0 26px;}
.section2{padding:60px 0;}
.grid-3{display:grid;grid-template-columns:repeat(auto-fill,minmax(295px,1fr));gap:15px;}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.btn-primary2{background:#2458D4;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-weight:700;font-size:13px;transition:all 0.18s;}
.btn-primary2:hover{background:#1a45b8;transform:translateY(-1px);box-shadow:0 6px 20px rgba(36,88,212,0.35);}
.btn-outline2{background:transparent;color:#2458D4;border:2px solid rgba(36,88,212,0.35);padding:9px 20px;border-radius:8px;font-weight:600;font-size:13px;transition:all 0.18s;}
.btn-outline2:hover{background:rgba(36,88,212,0.09);border-color:#2458D4;}
.btn-white2{background:#fff;color:#0E1628;border:none;padding:10px 22px;border-radius:8px;font-weight:700;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.15);transition:all 0.18s;}
.btn-white2:hover{box-shadow:0 6px 20px rgba(0,0,0,0.25);transform:translateY(-1px);}
.btn-ghost2{background:transparent;color:rgba(14,22,40,0.52);border:1px solid rgba(14,22,40,0.14);padding:7px 13px;border-radius:7px;font-size:12px;font-weight:500;transition:all 0.16s;}
.btn-ghost2:hover{color:#0E1628;border-color:rgba(14,22,40,0.30);}
.inp2{background:#FFFFFF;border:1.5px solid rgba(14,22,40,0.14);border-radius:8px;padding:10px 14px;color:#0E1628;width:100%;font-size:14px;outline:none;transition:border 0.18s;}
.inp2:focus{border-color:#2458D4;box-shadow:0 0 0 3px rgba(36,88,212,0.12);}
.inp2::placeholder{color:rgba(14,22,40,0.28);}
.label2{display:block;font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:rgba(14,22,40,0.40);margin-bottom:6px;}
.nav2{position:fixed;top:0;left:0;right:0;z-index:100;height:62px;background:#0E1628;border-bottom:1px solid rgba(226,221,214,0.08);}
.modal-bg2{position:fixed;inset:0;background:rgba(14,22,40,0.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:14px;backdrop-filter:blur(8px);}
.modal2{background:#FFFFFF;border:1px solid rgba(14,22,40,0.10);border-radius:14px;padding:24px;max-width:520px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.55);}
.sec-label{display:inline-flex;align-items:center;gap:7px;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#4a8fd4;margin-bottom:11px;}
.sec-label::before{content:'';display:block;width:16px;height:2px;background:#4a8fd4;border-radius:1px;}
@keyframes slide2{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
.ticker2{overflow:hidden;position:relative;}
.ticker2-track{display:flex;gap:11px;width:max-content;animation:slide2 28s linear infinite;}
.ticker2-track:hover{animation-play-state:paused;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:rgba(14,22,40,0.18);border-radius:3px;}
@media(max-width:768px){.wrap2{padding:0 13px;}.section2{padding:38px 0;}.grid-3{grid-template-columns:1fr;}.grid-2{grid-template-columns:1fr;}.hide-mob{display:none!important;}.nav-links2{display:none!important;}.hamburger2{display:flex!important;}}
`

function VideoBg2({src:vsrc}){
  const ref=React.useRef(null)
  useEffect(()=>{const v=ref.current;if(!v)return;v.muted=true;const play=()=>{v.muted=true;v.play().catch(()=>{})};play();document.addEventListener('touchstart',play,{once:true});document.addEventListener('visibilitychange',()=>{if(!document.hidden)play()})},[vsrc])
  if(!vsrc)return null
  return(<div style={{position:'absolute',inset:0,overflow:'hidden',zIndex:0}}><video ref={ref} autoPlay loop muted playsInline preload="auto" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',WebkitTransform:'translateZ(0)',transform:'translateZ(0)'}}><source src={vsrc} type="video/mp4"/></video><div style={{position:'absolute',inset:0,background:'rgba(10,14,30,0.72)'}}/><div style={{position:'absolute',bottom:0,left:0,right:0,height:'55%',background:'linear-gradient(0deg,rgba(10,14,30,0.99) 0%,transparent 100%)'}}/></div>)
}

function Lg({name,color=G.blue,url=null,size=44}){
  const br=Math.round(size*0.22)
  if(url)return<div style={{width:size,height:size,borderRadius:br,overflow:'hidden',flexShrink:0,border:'1.5px solid rgba(255,255,255,0.10)'}}><img src={url} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
  return(<div style={{width:size,height:size,borderRadius:br,background:hexToRgba(color,0.15),border:`1.5px solid ${hexToRgba(color,0.30)}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontWeight:800,fontSize:Math.round(size*0.36),color,lineHeight:1}}>{(name||'?').slice(0,2).toUpperCase()}</span></div>)
}

function Card2({p,lang,t,onContact,onView,score}){
  const [hov,setHov]=useState(false)
  const isSp=p.tier==='sponsored'
  const sc=catColor(p.cat)
  const desc=(p.desc?.[lang]||p.desc?.en||'').slice(0,112)
  return(
    <div style={{position:'relative',paddingTop:isSp?14:0}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      {isSp&&<div style={{position:'absolute',top:0,right:18,zIndex:3,background:`linear-gradient(135deg,${G.blue},#1a3aaa)`,color:'#fff',fontSize:9,fontWeight:800,letterSpacing:'1.5px',textTransform:'uppercase',padding:'5px 13px 6px',borderRadius:'0 0 9px 9px',boxShadow:'0 5px 18px rgba(36,88,212,0.44)'}}>★ FEATURED</div>}
      <div onClick={()=>onView?.(p)} style={{background:isSp?hexToRgba(sc,0.05):'#FFFFFF',border:isSp?`1px solid ${hexToRgba(sc,0.28)}`:`1px solid ${hov?hexToRgba(sc,0.25):'rgba(14,22,40,0.09)'}`,borderTop:`3px solid ${sc}`,borderRadius:12,overflow:'hidden',cursor:'pointer',position:'relative',boxShadow:isSp?`0 6px 28px rgba(14,22,40,0.12),0 0 0 1px ${hexToRgba(sc,0.08)}`:(hov?'0 8px 28px rgba(14,22,40,0.11)':'0 2px 14px rgba(14,22,40,0.07)'),transition:'all 0.22s cubic-bezier(0.4,0,0.2,1)'}}>
        {p.coverImage&&<div style={{height:64,overflow:'hidden',position:'relative'}}><img src={p.coverImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:p.coverFocus||'50% 50%'}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,rgba(255,255,255,0.95) 0%,transparent 60%)'}}/></div>}
        <div style={{padding:'14px 16px 14px'}}>
          <div style={{display:'flex',gap:10,alignItems:'flex-start',marginBottom:9}}>
            <Lg name={p.logo||p.name} color={sc} url={p.logoUrl} size={42}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:14,color:G.text,lineHeight:1.2,marginBottom:2}}>{p.name}</div><div style={{fontSize:11,color:G.dim,display:'flex',gap:5,flexWrap:'wrap'}}>{p.city&&<span>📍 {p.city}</span>}{p.employees&&<span>· 👥 {p.employees}</span>}</div></div>
          </div>
          {desc&&<p style={{fontSize:12,color:G.muted,lineHeight:1.65,marginBottom:8}}>{desc}{(p.desc?.[lang]||p.desc?.en||'').length>112?'…':''}</p>}
          {p.tags?.length>0&&<div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:8}}>{p.tags.slice(0,5).map(tag=><span key={tag} style={{padding:'2px 7px',borderRadius:4,fontSize:10,fontWeight:600,background:hexToRgba(sc,0.12),color:hexToRgba(sc,0.90),border:`1px solid ${hexToRgba(sc,0.22)}`}}>{tag}</span>)}</div>}
          <div style={{marginBottom:10}}><span style={{display:'inline-flex',alignItems:'center',gap:3,padding:'2px 7px',borderRadius:5,fontSize:10,fontWeight:600,background:hexToRgba(sc,0.10),color:sc,border:`1px solid ${hexToRgba(sc,0.20)}`}}>{catIcon(p.cat)} {catLabel(p.cat,lang)}</span></div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:7,borderTop:`1px solid ${G.border}`,paddingTop:10}}>
            {p.verified?<span style={{display:'inline-flex',alignItems:'center',gap:3,fontSize:10,fontWeight:700,color:'#4ade80',padding:'2px 6px',background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.22)',borderRadius:20}}>✓ {t.verified}</span>:<div/>}
            <div style={{display:'flex',gap:5,alignItems:'center'}}>
              {score!=null&&<div style={{display:'flex',alignItems:'center',gap:5}}><div style={{width:46,height:4,background:'rgba(255,255,255,0.08)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${score}%`,borderRadius:3,transition:'width 0.7s ease',background:score>=80?'#4ade80':score>=50?G.blue:'rgba(255,255,255,0.22)'}}/></div><span style={{fontSize:10,fontWeight:700,color:score>=80?'#4ade80':score>=50?G.blue:'rgba(255,255,255,0.35)'}}>{score}%</span></div>}
              <button style={{padding:'5px 11px',fontSize:11,fontWeight:600,borderRadius:6,cursor:'pointer',transition:'all 0.16s',background:isSp?hexToRgba(sc,0.15):'rgba(255,255,255,0.06)',color:isSp?sc:'rgba(240,239,238,0.70)',border:`1px solid ${isSp?hexToRgba(sc,0.28):'rgba(255,255,255,0.12)'}`}} onClick={e=>{e.stopPropagation();onContact?.(p)}}>{t.contact}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EnquiryModal2({target,t,onClose}){
  const [form,setForm]=useState({name:'',email:'',msg:''})
  const [sent,setSent]=useState(false)
  const [busy,setBusy]=useState(false)
  const send=async()=>{if(!form.name||!form.email)return;setBusy(true);try{await insertContactLead({profile_id:target.id,name:form.name,email:form.email,message:form.msg});await sendEnquiry({toName:target.name,toEmail:target.contact||target.email,fromName:form.name,fromEmail:form.email,message:form.msg});setSent(true)}catch{}setBusy(false)}
  return(<div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal2">{sent?<div style={{textAlign:'center',padding:'28px 0'}}><div style={{width:50,height:50,borderRadius:'50%',background:'rgba(15,123,79,0.12)',border:'2px solid rgba(15,123,79,0.30)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 13px',fontSize:22}}>✓</div><div style={{fontWeight:700,fontSize:18,marginBottom:5}}>{t.enquiryDone}</div><div style={{color:G.muted,fontSize:13}}>{target.name} {t.enquiryDoneSub}</div></div>:<><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}><div><div style={{fontWeight:700,fontSize:17,marginBottom:3}}>{t.enquiryTo} {target.name}</div><div style={{fontSize:12,color:G.muted}}>{catLabel(target.cat,'en')} · {target.city}</div></div><button onClick={onClose} className="btn-ghost2">✕</button></div><div style={{display:'flex',flexDirection:'column',gap:12}}><div><label className="label2">{t.enquiryName}</label><input className="inp2" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div><div><label className="label2">{t.enquiryEmail}</label><input className="inp2" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div><div><label className="label2">{t.enquiryMsg}</label><textarea className="inp2" rows={4} placeholder={t.enquiryPH} value={form.msg} onChange={e=>setForm(p=>({...p,msg:e.target.value}))} style={{resize:'vertical'}}/></div><div style={{display:'flex',gap:8,justifyContent:'flex-end'}}><button className="btn-ghost2" onClick={onClose}>Cancel</button><button className="btn-primary2" onClick={send} disabled={busy}>{busy?'Sending…':t.enquirySend}</button></div></div></>}</div></div>)
}

function DetailModal2({p,lang,t,onClose,onContact}){
  if(!p)return null
  const sc=catColor(p.cat)
  return(<div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal2" style={{maxWidth:570,padding:0,borderRadius:14,overflow:'hidden'}}><div style={{height:5,background:`linear-gradient(90deg,${sc},${G.blue})`}}/>{p.coverImage&&<div style={{height:85,overflow:'hidden',position:'relative'}}><img src={p.coverImage} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:p.coverFocus||'50% 50%'}}/><div style={{position:'absolute',inset:0,background:'linear-gradient(0deg,#171a22 0%,transparent 55%)'}}/></div>}<div style={{padding:'18px 21px 0'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}><div style={{display:'flex',gap:11,alignItems:'center'}}><Lg name={p.logo||p.name} color={sc} url={p.logoUrl} size={46}/><div><div style={{display:'flex',gap:5,alignItems:'center',flexWrap:'wrap',marginBottom:3}}><span style={{fontWeight:700,fontSize:17,color:G.text}}>{p.name}</span>{p.verified&&<span style={{fontSize:9,fontWeight:700,color:'#4ade80',padding:'2px 6px',background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.22)',borderRadius:20}}>✓ {t.verified}</span>}</div><div style={{fontSize:12,color:G.muted,display:'flex',gap:7,flexWrap:'wrap'}}><span style={{padding:'2px 6px',background:hexToRgba(sc,0.10),color:sc,border:`1px solid ${hexToRgba(sc,0.20)}`,borderRadius:5,fontSize:10,fontWeight:600}}>{catIcon(p.cat)} {catLabel(p.cat,lang)}</span>{p.city&&<span>📍 {p.city}</span>}{p.employees&&<span>👥 {p.employees}</span>}</div></div></div><button onClick={onClose} className="btn-ghost2">✕</button></div></div><div style={{padding:'17px 21px',maxHeight:'52vh',overflowY:'auto'}}>{(p.desc?.[lang]||p.desc?.en)&&<p style={{color:G.muted,lineHeight:1.72,fontSize:13,marginBottom:13}}>{p.desc?.[lang]||p.desc?.en}</p>}{p.tags?.length>0&&<div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:13}}>{p.tags.map(tag=><span key={tag} style={{padding:'2px 6px',borderRadius:4,fontSize:11,background:hexToRgba(sc,0.10),color:sc,border:`1px solid ${hexToRgba(sc,0.18)}`}}>{tag}</span>)}</div>}{p.website&&<div style={{marginBottom:9}}><label className="label2">Website</label><a href={`https://${p.website.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" style={{color:G.blue,fontSize:13,fontWeight:500}}>{p.website} →</a></div>}</div><div style={{padding:'13px 21px',borderTop:`1px solid ${G.border}`,display:'flex',justifyContent:'flex-end',gap:8}}>{p.website&&<a href={`https://${p.website.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" className="btn-ghost2" style={{padding:'7px 14px',fontSize:12}}>Website →</a>}<button className="btn-primary2" onClick={()=>{onClose();onContact?.(p)}}>{t.contact}</button></div></div></div>)
}

function RegModal2({t,lang,onClose}){
  const [step,setStep]=useState(0)
  const [type,setType]=useState(null)
  const [tier,setTier]=useState('free')
  const [form,setForm]=useState({name:'',city:'',email:'',website:'',phone:'',desc:'',tags:'',cat:'software',euLangs:'',employees:''})
  const [done,setDone]=useState(false)
  const [busy,setBusy]=useState(false)
  const f=(k,v)=>setForm(p=>({...p,[k]:v}))
  const submit=async()=>{if(!form.name||!form.city||!form.email)return;setBusy(true);try{await insertProfile({name:form.name,city:form.city,email:form.email,website:form.website||null,phone:form.phone||null,description:form.desc,tags:form.tags.split(',').map(s=>s.trim()).filter(Boolean),category:form.cat,type,tier,status:'pending',logo_color:catColor(form.cat),eu_langs:form.euLangs||null,employees:form.employees||null});await notifyAdminNewProfile({name:form.name,email:form.email,type,cat:form.cat,city:form.city});setDone(true)}catch(e){console.error(e)}setBusy(false)}
  if(done)return(<div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal2" style={{textAlign:'center',padding:'46px 30px'}}><div style={{width:58,height:58,borderRadius:'50%',background:'rgba(15,123,79,0.12)',border:'2px solid rgba(15,123,79,0.28)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:25}}>✓</div><div style={{fontWeight:700,fontSize:20,marginBottom:7}}>{t.regDone}</div><div style={{color:G.muted,marginBottom:22}}>{t.regDoneSub}</div><button className="btn-primary2" onClick={onClose}>Close</button></div></div>)
  return(<div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}><div className="modal2" style={{maxWidth:540}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:19}}><div style={{fontWeight:700,fontSize:19}}>{t.regTitle}</div><button onClick={onClose} className="btn-ghost2">✕</button></div>
  {step===0&&<div style={{display:'flex',flexDirection:'column',gap:9}}>{[['company','🏢','Company / Agency','Register your company or agency'],['freelancer','👤','Freelancer / Consultant','Solo professional listing'],['partner','🤝','Partner / Institution','Network or institution']].map(([id,ic,label,sub])=><button key={id} onClick={()=>{setType(id);setStep(1)}} style={{display:'flex',alignItems:'center',gap:13,padding:'14px 16px',background:G.surface,border:`1.5px solid ${G.border}`,borderRadius:10,textAlign:'left',color:G.text,transition:'all 0.18s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=G.blue;e.currentTarget.style.background=G.blueDim}} onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(226,221,214,0.10)';e.currentTarget.style.background=G.surface}}><span style={{fontSize:21}}>{ic}</span><div><div style={{fontWeight:600,fontSize:13}}>{label}</div><div style={{fontSize:12,color:G.muted}}>{sub}</div></div><span style={{marginLeft:'auto',color:G.blue}}>→</span></button>)}</div>}
  {step===1&&<div><div style={{fontWeight:600,fontSize:13,marginBottom:13,color:G.muted}}>Choose your listing plan</div><div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:16}}>
    <button onClick={()=>{setTier('free');setStep(2)}} style={{padding:'15px 16px',background:tier==='free'?G.blueDim:'rgba(255,255,255,0.03)',border:`2px solid ${tier==='free'?G.blue:'rgba(226,221,214,0.10)'}`,borderRadius:10,textAlign:'left',cursor:'pointer'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontWeight:700,fontSize:14,color:G.text}}>Free Listing</span><span style={{fontWeight:800,fontSize:17,color:'#4ade80'}}>Free</span></div>
      <div style={{fontSize:12,color:G.muted,marginBottom:7}}>Basic profile — visible to all visitors</div>
      <div style={{fontSize:11,color:'#4ade80',fontWeight:600}}>🎉 {t.regFree}</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:8}}>{['Name & city','Sector','Description','Tags & skills','Contact button'].map(f=><span key={f} style={{fontSize:10,color:G.muted,background:'rgba(255,255,255,0.04)',border:`1px solid ${G.border}`,borderRadius:4,padding:'2px 6px'}}>✓ {f}</span>)}</div>
    </button>
    <button onClick={()=>{setTier('sponsored');setStep(2)}} style={{padding:'15px 16px',background:tier==='sponsored'?G.blueDim:'rgba(255,255,255,0.03)',border:`2px solid ${tier==='sponsored'?G.blue:'rgba(226,221,214,0.10)'}`,borderRadius:10,textAlign:'left',cursor:'pointer',position:'relative'}}>
      <div style={{position:'absolute',top:-1,right:13,background:`linear-gradient(135deg,${G.blue},#1a3aaa)`,color:'#fff',fontSize:9,fontWeight:800,letterSpacing:'1px',padding:'3px 9px 4px',borderRadius:'0 0 7px 7px'}}>★ FEATURED</div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontWeight:700,fontSize:14,color:G.text}}>Sponsored Listing</span><span style={{fontWeight:800,fontSize:17,color:G.blue}}>€49/mo</span></div>
      <div style={{fontSize:12,color:G.muted,marginBottom:7}}>Premium placement — featured on homepage & directory top</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:8}}>{['Everything in Free','Homepage featured','Cover image','Priority placement','Sponsored badge','Analytics'].map(f=><span key={f} style={{fontSize:10,color:'#93B4F8',background:G.blueDim,border:`1px solid ${G.blueBd}`,borderRadius:4,padding:'2px 6px'}}>✓ {f}</span>)}</div>
    </button>
  </div><button className="btn-ghost2" onClick={()=>setStep(0)}>← Back</button></div>}
  {step===2&&<div style={{display:'flex',flexDirection:'column',gap:12}}>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}><div><label className="label2">{t.regName}</label><input className="inp2" value={form.name} onChange={e=>f('name',e.target.value)}/></div><div><label className="label2">{t.regCity}</label><input className="inp2" value={form.city} onChange={e=>f('city',e.target.value)}/></div></div>
    <div><label className="label2">{t.regEmail}</label><input className="inp2" type="email" value={form.email} onChange={e=>f('email',e.target.value)}/></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}><div><label className="label2">Website</label><input className="inp2" placeholder="example.com" value={form.website} onChange={e=>f('website',e.target.value)}/></div><div><label className="label2">Phone</label><input className="inp2" placeholder="+383 44…" value={form.phone} onChange={e=>f('phone',e.target.value)}/></div></div>
    <div><label className="label2">Sector</label><select className="inp2" value={form.cat} onChange={e=>f('cat',e.target.value)}>{CATS.map(c=><option key={c.id} value={c.id}>{c.labels[lang]||c.labels.en}</option>)}</select></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:11}}><div><label className="label2">Employees</label><input className="inp2" placeholder="1–10, 10–50…" value={form.employees} onChange={e=>f('employees',e.target.value)}/></div><div><label className="label2">EU Languages</label><input className="inp2" placeholder="EN, DE, FR…" value={form.euLangs} onChange={e=>f('euLangs',e.target.value)}/></div></div>
    <div><label className="label2">{t.regDesc}</label><textarea className="inp2" rows={3} placeholder={t.regDescPH} value={form.desc} onChange={e=>f('desc',e.target.value)} style={{resize:'vertical'}}/></div>
    <div><label className="label2">{t.regTags}</label><input className="inp2" placeholder={t.regTagsPH} value={form.tags} onChange={e=>f('tags',e.target.value)}/></div>
    {tier==='sponsored'&&<div style={{padding:'10px 13px',background:G.blueDim,border:`1.5px solid ${G.blueBd}`,borderRadius:8,fontSize:13,color:'#93B4F8'}}>⭐ Featured placement. Our team will contact you about payment after approval.</div>}
    <div style={{fontSize:11,color:G.dim,textAlign:'center'}}>{tier==='free'?`🎉 ${t.regFree}`:'★ Sponsored · €49/month after approval'}</div>
    <div style={{display:'flex',justifyContent:'space-between',gap:8,marginTop:3}}><button className="btn-ghost2" onClick={()=>setStep(1)}>← Back</button><button className="btn-primary2" onClick={submit} disabled={busy}>{busy?'Submitting…':t.regSend}</button></div>
  </div>}
  </div></div>)
}

function Home2({lang,t,profiles,setPage,onReg}){
  const [detail,setDetail]=useState(null)
  const [contact,setContact]=useState(null)
  const sponsored=useMemo(()=>profiles.filter(p=>p.tier==='sponsored').slice(0,6),[profiles])
  const partners=useMemo(()=>profiles.filter(p=>p.type==='partner').slice(0,12),[profiles])
  const stats=useMemo(()=>[profiles.filter(p=>p.type==='company').length||120,profiles.filter(p=>p.type==='freelancer').length||48,profiles.filter(p=>p.type==='partner').length||12],[profiles])
  return(<div>
    <div style={{background:G.navBg,paddingTop:62,position:'relative',overflow:'hidden',minHeight:490,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <VideoBg2 src="/bg-video-home.mp4"/>
      <div className="wrap2" style={{position:'relative',zIndex:1,paddingTop:56,paddingBottom:60}}>
        <div style={{maxWidth:670}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'4px 11px',background:'rgba(36,88,212,0.18)',border:'1px solid rgba(36,88,212,0.35)',borderRadius:20,marginBottom:20}}><div style={{width:6,height:6,borderRadius:'50%',background:G.blue}}/><span style={{fontSize:11,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',color:'#93B4F8'}}>{t.tagline}</span></div>
          <h1 style={{fontWeight:800,fontSize:'clamp(34px,6vw,66px)',lineHeight:1.06,letterSpacing:'-1.5px',marginBottom:16}}><span style={{color:'#F0EFEE'}}>{t.h1a}</span><br/><span style={{background:`linear-gradient(135deg,${G.blue} 0%,${G.violet} 100%)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{t.h1b}</span></h1>
          <p style={{fontSize:'clamp(14px,2vw,17px)',color:'rgba(240,239,238,0.60)',lineHeight:1.72,marginBottom:30,maxWidth:510}}>{t.heroSub}</p>
          <div style={{display:'flex',gap:11,flexWrap:'wrap',marginBottom:44}}><button className="btn-white2" style={{padding:'11px 24px',fontSize:14}} onClick={()=>setPage('directory')}>{t.browseBtn}</button><button className="btn-outline2" style={{color:'rgba(240,239,238,0.80)',borderColor:'rgba(240,239,238,0.20)',padding:'10px 20px',fontSize:14}} onClick={onReg}>{t.registerBtn}</button></div>
          <div style={{display:'flex',gap:34,flexWrap:'wrap'}}>{[[stats[0],t.statComp],[stats[1],t.statFL],[stats[2],t.statPart]].map(([n,l])=><div key={l}><div style={{fontWeight:800,fontSize:36,color:G.text,letterSpacing:'-2px',lineHeight:1}}>{n}+</div><div style={{fontSize:11,color:'rgba(240,239,238,0.38)',fontWeight:600,letterSpacing:'1.5px',textTransform:'uppercase',marginTop:4}}>{l}</div></div>)}</div>
        </div>
      </div>
    </div>
    <div style={{background:G.bg}}>
      {sponsored.length>0&&<div className="section2 wrap2"><div className="sec-label">{t.featuredTitle}</div><div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:18}}><h2 style={{fontWeight:700,fontSize:22,letterSpacing:'-0.4px',color:G.text}}>{t.featuredTitle}</h2><button className="btn-ghost2" onClick={()=>setPage('directory')}>{t.viewAll}</button></div><div className="grid-3">{sponsored.map(p=><Card2 key={p.id} p={p} lang={lang} t={t} onContact={setContact} onView={setDetail}/>)}</div></div>}
      {partners.length>0&&<div style={{paddingBottom:48,borderBottom:`1px solid ${G.border}`}}><div className="wrap2" style={{marginBottom:14}}><div className="sec-label">Official Partners</div></div><div className="ticker2"><div className="ticker2-track">{[...partners,...partners].map((p,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:9,padding:'9px 14px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:9,flexShrink:0,minWidth:162}}><Lg name={p.logo||p.name} color={catColor(p.cat)} url={p.logoUrl} size={30}/><div><div style={{fontWeight:600,fontSize:12,color:'#F0EFEE'}}>{p.name}</div><div style={{fontSize:10,color:G.dim}}>{p.city||catLabel(p.cat,'en')}</div></div></div>)}</div></div></div>}
      <div className="section2 wrap2"><div className="sec-label">Sectors</div><h2 style={{fontWeight:700,fontSize:22,marginBottom:18,letterSpacing:'-0.4px',color:G.text}}>Browse by Sector</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:9}}>{CATS.map(cat=><button key={cat.id} onClick={()=>setPage('directory')} style={{display:'flex',alignItems:'center',gap:9,padding:'12px 14px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:9,textAlign:'left',transition:'all 0.18s',cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=hexToRgba(cat.color,0.42);e.currentTarget.style.background=hexToRgba(cat.color,0.08);e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.background=G.surface;e.currentTarget.style.transform=''}}><div style={{width:32,height:32,borderRadius:8,background:hexToRgba(cat.color,0.14),border:`1px solid ${hexToRgba(cat.color,0.22)}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0}}>{cat.icon}</div><span style={{fontWeight:600,fontSize:12,color:G.text,lineHeight:1.25}}>{cat.labels[lang]||cat.labels.en}</span></button>)}</div></div>
      <div style={{background:G.navBg,padding:'48px 0',borderTop:`1px solid ${G.border}`}}><div className="wrap2" style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:22,flexWrap:'wrap'}}><div><div className="sec-label" style={{color:'#93B4F8'}}>For Businesses</div><h3 style={{fontWeight:700,fontSize:22,color:'#F0EFEE',marginBottom:7,letterSpacing:'-0.3px'}}>Is your business on Kosova Hub?</h3><p style={{color:'rgba(240,239,238,0.48)',fontSize:13,maxWidth:400}}>Get discovered by international companies. Free for 6 months — no credit card needed.</p></div><div style={{display:'flex',gap:9,flexWrap:'wrap',flexShrink:0}}><button className="btn-white2" style={{padding:'11px 24px'}} onClick={onReg}>{t.registerBtn}</button><button className="btn-outline2" style={{color:'rgba(240,239,238,0.76)',borderColor:'rgba(240,239,238,0.18)',padding:'10px 18px'}} onClick={()=>setPage('concierge')}>Learn more →</button></div></div></div>
      <footer style={{borderTop:`1px solid ${G.border}`,padding:'20px 0'}}><div className="wrap2" style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:9}}><span style={{fontSize:12,color:G.dim}}>{t.footer}</span><div style={{display:'flex',gap:14}}>{['Privacy','Terms','Contact'].map(l=><a key={l} href="#" style={{fontSize:12,color:G.dim}}>{l}</a>)}</div></div></footer>
    </div>
    {detail&&<DetailModal2 p={detail} lang={lang} t={t} onClose={()=>setDetail(null)} onContact={p=>{setDetail(null);setContact(p)}}/>}
    {contact&&<EnquiryModal2 target={contact} t={t} onClose={()=>setContact(null)}/>}
  </div>)
}

function Directory2({lang,t,profiles}){
  const [q,setQ]=useState('')
  const [cat,setCat]=useState('')
  const [typeF,setTypeF]=useState('all')
  const [detail,setDetail]=useState(null)
  const [contact,setContact]=useState(null)
  const [selSkills,setSelSkills]=useState([])
  const [matchMode,setMatchMode]=useState(false)
  const [skillInput,setSkillInput]=useState('')
  const [sectorOpen,setSectorOpen]=useState(false)
  const [matchOpen,setMatchOpen]=useState(false)

  const base=useMemo(()=>profiles.filter(p=>p.type!=='partner'),[profiles])
  const toggleSkill=s=>setSelSkills(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s])
  const allTags=useMemo(()=>{const counts={};base.forEach(p=>(p.tags||[]).forEach(t=>{counts[t]=(counts[t]||0)+1}));return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,24).map(([t])=>t)},[base])
  const skills=useMemo(()=>[...new Set([...selSkills,...skillInput.split(',').map(s=>s.trim()).filter(Boolean)])]  ,[selSkills,skillInput])
  const activeCat=CATS.find(c=>c.id===cat)

  const results=useMemo(()=>{
    let r=base
    if(typeF==='company')r=r.filter(p=>p.type==='company')
    if(typeF==='freelancer')r=r.filter(p=>p.type==='freelancer')
    if(cat)r=r.filter(p=>p.cat===cat)
    if(q.trim()){const lq=q.toLowerCase();r=r.filter(p=>(p.name+' '+(p.tags||[]).join(' ')+' '+p.city+' '+(p.desc?.en||'')).toLowerCase().includes(lq))}
    if(matchMode&&skills.length){r=r.map(p=>({...p,_score:calcMatch(p,skills)})).filter(p=>p._score>0).sort((a,b)=>b._score-a._score);return r}
    return r
  },[base,q,cat,typeF,matchMode,skills])

  const grouped=useMemo(()=>{
    if(matchMode&&skills.length)return null
    const g={};results.forEach(p=>{const key=p.cat||'other';if(!g[key])g[key]=[];g[key].push(p)});return g
  },[results,matchMode,skills])

  return(
    <div style={{background:G.bg,minHeight:'100vh',paddingTop:62}}>
      <div style={{background:G.navBg,padding:'48px 0 36px',position:'relative',overflow:'hidden'}}>
        <VideoBg2 src="/bg-video-companies.mp4"/>
        <div className="wrap2" style={{position:'relative',zIndex:1}}>
          <div className="sec-label" style={{color:'#93B4F8'}}>Business Directory</div>
          <h1 style={{fontWeight:800,fontSize:'clamp(28px,5vw,48px)',letterSpacing:'-1px',color:'#F0EFEE',marginBottom:7}}>Companies &amp; Freelancers</h1>
          <p style={{color:'rgba(240,239,238,0.50)',fontSize:14}}>Verified businesses from Kosova — open to worldwide partnerships</p>
        </div>
      </div>

      <div className="wrap2" style={{paddingTop:22,paddingBottom:48}}>
        {/* Search + type + dropdowns row */}
        <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}>
          <input className="inp2" placeholder={t.searchPH||'Search companies, skills, cities…'} value={q} onChange={e=>setQ(e.target.value)} style={{flex:1,minWidth:180,maxWidth:380}}/>

          {/* Type filter */}
          <div style={{display:'flex',gap:3,background:'rgba(14,22,40,0.05)',padding:3,borderRadius:8,border:`1px solid ${G.border}`}}>
            {[['all',t.allTypes],['company',t.onlyComp],['freelancer',t.onlyFL]].map(([v,l])=>(
              <button key={v} onClick={()=>setTypeF(v)} style={{padding:'5px 12px',borderRadius:6,border:'none',fontSize:12,fontWeight:600,background:typeF===v?G.blue:'transparent',color:typeF===v?'#fff':G.muted,cursor:'pointer',transition:'all 0.15s'}}>{l}</button>
            ))}
          </div>

          {/* Sector dropdown toggle */}
          <div style={{position:'relative'}}>
            <button onClick={()=>{setSectorOpen(v=>!v);setMatchOpen(false)}}
              style={{display:'flex',alignItems:'center',gap:7,padding:'8px 14px',background:cat?hexToRgba(activeCat?.color||G.blue,0.08):'#FFFFFF',border:`1.5px solid ${cat?hexToRgba(activeCat?.color||G.blue,0.35):G.border}`,borderRadius:8,fontSize:13,fontWeight:600,color:cat?(activeCat?.color||G.blue):G.text,cursor:'pointer',transition:'all 0.16s',whiteSpace:'nowrap'}}>
              {cat?<span>{activeCat?.icon} {activeCat?.labels[lang]||cat}</span>:<span>🏭 {t.allSectors}</span>}
              <span style={{fontSize:10,opacity:0.6}}>{sectorOpen?'▲':'▼'}</span>
            </button>
            {sectorOpen&&(
              <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,zIndex:50,background:'#FFFFFF',border:`1px solid ${G.border}`,borderRadius:10,boxShadow:'0 8px 28px rgba(14,22,40,0.14)',minWidth:220,padding:6}}>
                <button onClick={()=>{setCat('');setSectorOpen(false)}}
                  style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 12px',background:!cat?hexToRgba(G.blue,0.07):'transparent',border:'none',borderRadius:7,fontSize:13,fontWeight:600,color:!cat?G.blue:G.text,cursor:'pointer',textAlign:'left',marginBottom:2}}>
                  {t.allSectors} {!cat&&<span style={{marginLeft:'auto',color:G.blue}}>✓</span>}
                </button>
                {CATS.map(c=>(
                  <button key={c.id} onClick={()=>{setCat(c.id);setSectorOpen(false)}}
                    style={{display:'flex',alignItems:'center',gap:8,width:'100%',padding:'8px 12px',background:cat===c.id?hexToRgba(c.color,0.08):'transparent',border:'none',borderRadius:7,fontSize:13,color:cat===c.id?c.color:G.text,cursor:'pointer',textAlign:'left',fontWeight:cat===c.id?600:400}}>
                    <span>{c.icon}</span><span style={{flex:1}}>{c.labels[lang]||c.labels.en}</span>
                    {cat===c.id&&<span style={{color:c.color}}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Skill match dropdown toggle */}
          <button onClick={()=>{setMatchOpen(v=>!v);setSectorOpen(false)}}
            style={{display:'flex',alignItems:'center',gap:7,padding:'8px 14px',background:matchMode?hexToRgba(G.blue,0.08):'#FFFFFF',border:`1.5px solid ${matchMode?G.blue:G.border}`,borderRadius:8,fontSize:13,fontWeight:600,color:matchMode?G.blue:G.text,cursor:'pointer',transition:'all 0.16s',whiteSpace:'nowrap'}}>
            🎯 Skill Match {skills.length>0&&<span style={{background:G.blue,color:'#fff',borderRadius:20,padding:'1px 7px',fontSize:10,fontWeight:700}}>{skills.length}</span>}
            <span style={{fontSize:10,opacity:0.6}}>{matchOpen?'▲':'▼'}</span>
          </button>
        </div>

        {/* Skill match panel — opens below */}
        {matchOpen&&(
          <div style={{marginBottom:14,padding:'14px 16px',background:'#FFFFFF',border:`1.5px solid ${G.blueBd}`,borderRadius:10,boxShadow:'0 4px 16px rgba(14,22,40,0.08)'}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
              <input className="inp2" placeholder="Type skills… (comma separated)"
                value={skillInput} onChange={e=>setSkillInput(e.target.value)}
                style={{flex:1,fontSize:13,padding:'7px 12px'}} autoFocus/>
              <button onClick={()=>{setMatchMode(v=>!v);if(matchMode){setSelSkills([]);setSkillInput('')}}}
                style={{padding:'7px 14px',borderRadius:7,border:`1.5px solid ${matchMode?G.blue:G.border}`,background:matchMode?G.blue:'transparent',color:matchMode?'#fff':G.muted,fontSize:12,fontWeight:600,cursor:'pointer',flexShrink:0}}>
                {matchMode?'✓ Matching':'Activate'}
              </button>
            </div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {allTags.map(tag=>(
                <button key={tag} onClick={()=>{toggleSkill(tag);setMatchMode(true)}}
                  style={{padding:'4px 10px',borderRadius:20,border:`1.5px solid ${selSkills.includes(tag)?hexToRgba(G.blue,0.50):G.border}`,background:selSkills.includes(tag)?hexToRgba(G.blue,0.09):'transparent',color:selSkills.includes(tag)?G.blue:G.muted,fontSize:11,fontWeight:600,cursor:'pointer',transition:'all 0.13s'}}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{fontSize:12,color:G.dim,marginBottom:14}}>
          {results.length} listing{results.length!==1?'s':''} found
          {matchMode&&skills.length>0&&<span style={{color:G.blue,marginLeft:7}}>· Matching: {skills.join(', ')}</span>}
          {cat&&<span style={{marginLeft:7,color:activeCat?.color}}>· {activeCat?.labels[lang]}</span>}
        </div>

        {results.length===0?(
          <div style={{textAlign:'center',padding:'56px 0',color:G.muted}}>
            <div style={{fontSize:36,marginBottom:11}}>🔍</div>
            <div style={{fontWeight:700,fontSize:18,marginBottom:5,color:G.text}}>{t.noResults}</div>
            <div style={{fontSize:13}}>{t.noResultsSub}</div>
          </div>
        ):matchMode&&skills.length>0?(
          <div className="grid-3">{results.map(p=><Card2 key={p.id} p={p} lang={lang} t={t} onContact={setContact} onView={setDetail} score={p._score}/>)}</div>
        ):grouped?(
          Object.entries(grouped).map(([catId,ps])=>{
            const cat2=CATS.find(c=>c.id===catId);if(!ps.length)return null
            return(
              <div key={catId} style={{marginBottom:36}}>
                <div style={{display:'flex',alignItems:'center',gap:9,marginBottom:13,paddingBottom:9,borderBottom:`2px solid ${hexToRgba(cat2?.color||G.blue,0.18)}`}}>
                  <span style={{fontSize:17}}>{cat2?.icon||'🏢'}</span>
                  <span style={{fontWeight:700,fontSize:14,color:G.text}}>{cat2?.labels[lang]||catId}</span>
                  <span style={{fontSize:12,color:G.dim}}>({ps.length})</span>
                </div>
                <div className="grid-3">{ps.map(p=><Card2 key={p.id} p={p} lang={lang} t={t} onContact={setContact} onView={setDetail}/>)}</div>
              </div>
            )
          })
        ):null}
      </div>
      {detail&&<DetailModal2 p={detail} lang={lang} t={t} onClose={()=>setDetail(null)} onContact={p=>{setDetail(null);setContact(p)}}/>}
      {contact&&<EnquiryModal2 target={contact} t={t} onClose={()=>setContact(null)}/>}
    </div>
  )
}

function Concierge2({lang,t,siteContent,partnerProfiles=[]}){
  const [bookModal,setBookModal]=useState(false)
  const [form,setForm]=useState({name:'',company:'',email:'',goal:'',timeframe:'',pax:'1'})
  const [done,setDone]=useState(false)
  const [busy,setBusy]=useState(false)
  const P=siteContent?.partners||{}
  const submit=async()=>{if(!form.name||!form.email)return;setBusy(true);try{await insertBooking({name:form.name,company:form.company||null,email:form.email,goal:form.goal||null,timeframe:form.timeframe||null,pax:parseInt(form.pax)||1});await sendBookingConfirmation({name:form.name,email:form.email});setDone(true)}catch{}setBusy(false)}
  const packages=[
    {ic:'📋',name:'Initial Consultation',price:'Free',per:'',desc:'30-min call to discuss your objectives and get matched with the right Kosova contacts.',features:['Video call','Needs assessment','Partner recommendation'],highlight:false},
    {ic:'📅',name:'Day Programme',price:'€499',per:'/person',desc:'Full curated business day — 3 to 5 company meetings, logistics and preparation included.',features:['3–5 company meetings','Transfer & logistics','Meeting briefs','Follow-up notes'],highlight:false},
    {ic:'🗓️',name:'Full Week Programme',price:'€1,490',per:'/person',desc:'Immersive business week — meetings, government appointments, site visits and networking event.',features:['8–12 meetings','Government access','Site visits','Networking event','Full debrief report'],highlight:true},
  ]
  return(<div style={{background:G.bg,minHeight:'100vh',paddingTop:62}}>
    <div style={{background:G.navBg,padding:'52px 0 44px',position:'relative',overflow:'hidden'}}><VideoBg2 src="/bg-video-concierge.mp4"/><div className="wrap2" style={{position:'relative',zIndex:1}}><div className="sec-label" style={{color:'#93B4F8'}}>Exclusive Service</div><h1 style={{fontWeight:800,fontSize:'clamp(32px,5.5vw,56px)',letterSpacing:'-1px',color:'#F0EFEE',marginBottom:13}}>{t.concTitle}</h1><p style={{fontSize:'clamp(13px,2vw,17px)',color:'rgba(240,239,238,0.56)',maxWidth:520,lineHeight:1.72,marginBottom:24}}>{t.concSub}</p><button className="btn-white2" style={{padding:'11px 24px'}} onClick={()=>setBookModal(true)}>{t.concCta}</button></div></div>
    <div className="wrap2" style={{paddingTop:44,paddingBottom:48}}>
      <div className="sec-label">General Partners</div>
      <h2 style={{fontWeight:700,fontSize:22,marginBottom:20,letterSpacing:'-0.3px',color:G.text}}>Our General Partners</h2>
      <div className="grid-2" style={{marginBottom:48}}>
        <div style={{background:G.surface,border:`1px solid ${G.border}`,borderTop:`3px solid ${G.blue}`,borderRadius:12,overflow:'hidden'}}>
          {P.rootsgtm_cover&&<div style={{height:70,overflow:'hidden'}}><img src={P.rootsgtm_cover} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:P.rootsgtm_cover_focus||'50% 50%'}}/></div>}
          <div style={{padding:'17px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:11}}>{P.rootsgtm_logo?<img src={P.rootsgtm_logo} alt="" style={{width:40,height:40,borderRadius:8,objectFit:'cover',border:'1.5px solid rgba(255,255,255,0.10)'}}/>:<div style={{width:40,height:40,borderRadius:8,background:G.blueDim,border:`1.5px solid ${G.blueBd}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:19}}>🚀</div>}<div><div style={{fontWeight:700,fontSize:15,color:G.text}}>{P.rootsgtm_name||'rootsGTM'}</div><div style={{fontSize:11,color:G.dim}}>General Partner · Active</div></div><span style={{marginLeft:'auto',fontSize:10,fontWeight:700,color:'#4ade80',padding:'2px 6px',background:'rgba(74,222,128,0.08)',border:'1px solid rgba(74,222,128,0.22)',borderRadius:20}}>✓ Live</span></div><p style={{fontSize:12,color:G.muted,lineHeight:1.65,marginBottom:12}}>{P.rootsgtm_desc||'rootsGTM is our exclusive sales and business development network connecting EU businesses with Kosova.'}</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:12}}>{['🤝 Direct contact','📅 Meeting setup','🎤 Events','📄 Follow-up'].map(f=><div key={f} style={{fontSize:11,color:G.muted,background:'rgba(255,255,255,0.03)',border:`1px solid ${G.border}`,borderRadius:5,padding:'5px 8px'}}>{f}</div>)}</div><button className="btn-primary2" style={{width:'100%'}} onClick={()=>setBookModal(true)}>Enquire via rootsGTM →</button></div>
        </div>
        <div style={{background:G.surface,border:`1px solid ${G.border}`,borderTop:'3px solid #D97706',borderRadius:12,overflow:'hidden'}}>
          {P.gov_cover&&<div style={{height:70,overflow:'hidden'}}><img src={P.gov_cover} alt="" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:P.gov_cover_focus||'50% 50%'}}/></div>}
          <div style={{padding:'17px'}}><div style={{display:'flex',alignItems:'center',gap:10,marginBottom:11}}>{P.gov_logo?<img src={P.gov_logo} alt="" style={{width:40,height:40,borderRadius:8,objectFit:'cover',border:'1.5px solid rgba(255,255,255,0.10)'}}/>:<div style={{width:40,height:40,borderRadius:8,background:'rgba(217,119,6,0.12)',border:'1.5px solid rgba(217,119,6,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19}}>🏛️</div>}<div><div style={{fontWeight:700,fontSize:15,color:G.text}}>{P.gov_name||'Kosova Government'}</div><div style={{fontSize:11,color:G.dim}}>InvestKosova · Official Partner</div></div><span style={{marginLeft:'auto',fontSize:10,fontWeight:700,color:'#B45309',padding:'2px 6px',background:'rgba(217,119,6,0.10)',border:'1px solid rgba(217,119,6,0.22)',borderRadius:20}}>⏳ Negotiating</span></div><p style={{fontSize:12,color:G.muted,lineHeight:1.65,marginBottom:12}}>{P.gov_desc||'Building an official partnership with InvestKosova and the Ministry of Economy for investment support.'}</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:12}}>{['🏛️ InvestKosova','📋 Formation help','🤝 Gov meetings','📊 Investment support'].map(f=><div key={f} style={{fontSize:11,color:G.muted,background:'rgba(255,255,255,0.03)',border:`1px solid ${G.border}`,borderRadius:5,padding:'5px 8px'}}>{f}</div>)}</div><button onClick={()=>setBookModal(true)} style={{width:'100%',padding:'9px',borderRadius:8,border:'2px solid rgba(217,119,6,0.28)',background:'rgba(217,119,6,0.08)',color:'#B45309',fontWeight:700,fontSize:12,cursor:'pointer'}}>Request Government Meeting →</button></div>
        </div>
      </div>
      <div className="sec-label">Pricing</div>
      <h2 style={{fontWeight:700,fontSize:22,marginBottom:6,letterSpacing:'-0.3px',color:G.text}}>Concierge Packages</h2>
      <p style={{color:G.muted,fontSize:13,marginBottom:22}}>All packages include dedicated support before, during and after your visit.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(255px,1fr))',gap:13,marginBottom:48}}>
        {packages.map(pkg=><div key={pkg.name} style={{background:G.surface,border:`1px solid ${pkg.highlight?hexToRgba(G.blue,0.40):'rgba(255,255,255,0.08)'}`,borderTop:`3px solid ${pkg.highlight?G.blue:'rgba(255,255,255,0.14)'}`,borderRadius:12,padding:'20px',position:'relative',boxShadow:pkg.highlight?'0 8px 32px rgba(36,88,212,0.18)':'none'}}>
          {pkg.highlight&&<div style={{position:'absolute',top:-1,right:13,background:`linear-gradient(135deg,${G.blue},#1a3aaa)`,color:'#fff',fontSize:9,fontWeight:800,letterSpacing:'1px',padding:'3px 9px 4px',borderRadius:'0 0 7px 7px'}}>MOST POPULAR</div>}
          <div style={{fontSize:21,marginBottom:9}}>{pkg.ic}</div>
          <div style={{fontWeight:700,fontSize:15,marginBottom:4,color:G.text}}>{pkg.name}</div>
          <div style={{display:'flex',alignItems:'baseline',gap:3,marginBottom:9}}><span style={{fontWeight:800,fontSize:24,color:pkg.highlight?G.blue:'#F0EFEE',letterSpacing:'-0.5px'}}>{pkg.price}</span>{pkg.per&&<span style={{fontSize:11,color:G.dim}}>{pkg.per}</span>}</div>
          <p style={{fontSize:12,color:G.muted,lineHeight:1.65,marginBottom:13}}>{pkg.desc}</p>
          <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:16}}>{pkg.features.map(f=><div key={f} style={{display:'flex',gap:6,alignItems:'center',fontSize:12,color:G.muted}}><span style={{color:pkg.highlight?G.blue:'#4ade80',fontWeight:700}}>✓</span>{f}</div>)}</div>
          <button onClick={()=>setBookModal(true)} className={pkg.highlight?'btn-primary2':'btn-outline2'} style={{width:'100%'}}>{pkg.price==='Free'?'Book free call →':'Request package →'}</button>
        </div>)}
      </div>
      <div className="sec-label">Process</div>
      <h2 style={{fontWeight:700,fontSize:22,marginBottom:20,letterSpacing:'-0.3px',color:G.text}}>How It Works</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(178px,1fr))',gap:11,marginBottom:48}}>
        {[{n:'01',ic:'📋',title:'Share your needs',desc:'Fill the form — 2 minutes.'},{n:'02',ic:'🎯',title:'We match you',desc:'rootsGTM finds the best Kosova contacts.'},{n:'03',ic:'📅',title:'Visit is planned',desc:'Meetings, tours and appointments arranged.'},{n:'04',ic:'✈️',title:'You arrive',desc:'Full schedule prepared and confirmed.'},{n:'05',ic:'📄',title:'Follow-up',desc:'Contracts, next steps and ongoing support.'}].map(step=><div key={step.n} style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,padding:'16px'}}><div style={{fontSize:10,fontWeight:800,color:G.blue,letterSpacing:'1.5px',marginBottom:7}}>{step.n}</div><div style={{fontSize:17,marginBottom:7}}>{step.ic}</div><div style={{fontWeight:600,fontSize:13,marginBottom:4,color:G.text}}>{step.title}</div><div style={{fontSize:12,color:G.muted,lineHeight:1.6}}>{step.desc}</div></div>)}
      </div>
      {partnerProfiles.length>0&&<div><div className="sec-label">Network</div><h2 style={{fontWeight:700,fontSize:22,marginBottom:20,letterSpacing:'-0.3px',color:G.text}}>Our Partner Network</h2><div className="grid-3">{partnerProfiles.map(p=><Card2 key={p.id} p={p} lang={lang} t={t} onContact={()=>{}} onView={()=>{}}/>)}</div></div>}
    </div>
    {bookModal&&<div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&setBookModal(false)}><div className="modal2" style={{maxWidth:460}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:18}}><div style={{fontWeight:700,fontSize:18}}>{t.bookTitle}</div><button onClick={()=>setBookModal(false)} className="btn-ghost2">✕</button></div>{done?<div style={{textAlign:'center',padding:'24px 0'}}><div style={{width:50,height:50,borderRadius:'50%',background:'rgba(15,123,79,0.12)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:22}}>✓</div><div style={{fontWeight:700,fontSize:18,marginBottom:5}}>{t.bookDone}</div><div style={{color:G.muted}}>{t.bookDoneSub}</div></div>:<div style={{display:'flex',flexDirection:'column',gap:11}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><div><label className="label2">{t.bookName}</label><input className="inp2" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div><div><label className="label2">{t.bookComp}</label><input className="inp2" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))}/></div></div><div><label className="label2">{t.bookEmail}</label><input className="inp2" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div><div><label className="label2">{t.bookGoal}</label><textarea className="inp2" rows={3} placeholder={t.bookGoalPH} value={form.goal} onChange={e=>setForm(f=>({...f,goal:e.target.value}))} style={{resize:'vertical'}}/></div><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><div><label className="label2">{t.bookWhen}</label><input className="inp2" placeholder="e.g. June 2025" value={form.timeframe} onChange={e=>setForm(f=>({...f,timeframe:e.target.value}))}/></div><div><label className="label2">{t.bookPax}</label><select className="inp2" value={form.pax} onChange={e=>setForm(f=>({...f,pax:e.target.value}))}>{['1','2','3','4','5','6','7','8+'].map(n=><option key={n}>{n}</option>)}</select></div></div><button className="btn-primary2" onClick={submit} disabled={busy} style={{marginTop:3}}>{busy?'Submitting…':t.bookSend}</button></div>}</div></div>}
  </div>)
}

function Gov2({lang,t}){
  const links=[{l:'ARBK — Business Registration',u:'https://arbk.rks-gov.net'},{l:'InvestKosova',u:'https://investkosova.com'},{l:'Tax Administration (ATK)',u:'https://www.atk-ks.org'},{l:'Chamber of Commerce (OEK)',u:'https://www.kkk-rks.com'}]
  return(<div style={{background:G.bg,minHeight:'100vh',paddingTop:62}}>
    <div style={{background:G.navBg,padding:'50px 0 42px',position:'relative',overflow:'hidden'}}><VideoBg2 src="/bg-video-gov.mp4"/><div className="wrap2" style={{position:'relative',zIndex:1}}><div className="sec-label" style={{color:'#93B4F8'}}>Official Information</div><h1 style={{fontWeight:800,fontSize:'clamp(28px,5vw,52px)',letterSpacing:'-1px',color:'#F0EFEE',marginBottom:11}}>{t.govTitle}</h1><p style={{fontSize:'clamp(13px,1.8vw,16px)',color:'rgba(240,239,238,0.50)',maxWidth:500,lineHeight:1.7}}>{t.govSub}</p></div></div>
    <div className="wrap2" style={{paddingTop:40,paddingBottom:48}}>
      <div className="sec-label">At a Glance</div><h2 style={{fontWeight:700,fontSize:22,marginBottom:20,letterSpacing:'-0.3px',color:G.text}}>{t.govFactsTitle}</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(124px,1fr))',gap:9,marginBottom:44}}>
        {t.govFacts.map(([val,label],i)=><div key={label} style={{textAlign:'center',padding:'17px 12px',background:G.surface,border:`1px solid ${G.border}`,borderTop:`3px solid ${CATS[i%CATS.length].color}`,borderRadius:10}}><div style={{fontWeight:800,fontSize:24,color:G.text,letterSpacing:'-0.5px',lineHeight:1,marginBottom:5}}>{val}</div><div style={{fontSize:11,color:G.muted,fontWeight:500}}>{label}</div></div>)}
      </div>
      <div className="sec-label">Formation</div><h2 style={{fontWeight:700,fontSize:22,marginBottom:20,letterSpacing:'-0.3px',color:G.text}}>Company Formation</h2>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(215px,1fr))',gap:11,marginBottom:44}}>
        {t.govSteps.map((step,i)=><div key={i} style={{display:'flex',gap:11,padding:'15px',background:G.surface,border:`1px solid ${G.border}`,borderLeft:`3px solid ${G.blue}`,borderRadius:10,alignItems:'flex-start'}}><div style={{width:36,height:36,borderRadius:8,background:G.blueDim,border:`1.5px solid ${G.blueBd}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{step.ic}</div><div><div style={{fontWeight:700,fontSize:13,marginBottom:4,color:G.text}}>{step.t}</div><div style={{fontSize:12,color:G.muted,lineHeight:1.55,marginBottom:6}}>{step.d}</div><span style={{fontSize:10,fontWeight:700,color:G.blue,padding:'2px 6px',background:G.blueDim,border:`1px solid ${G.blueBd}`,borderRadius:4}}>⏱ {step.time}</span></div></div>)}
      </div>
      <div className="grid-2">
        <div><div className="sec-label">Benefits</div><h2 style={{fontWeight:700,fontSize:22,marginBottom:18,letterSpacing:'-0.3px',color:G.text}}>Why Kosova?</h2><div style={{display:'flex',flexDirection:'column',gap:10}}>{t.whyKosova.map(([ic,title,desc])=><div key={title} style={{display:'flex',gap:11,padding:'13px 15px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:10,alignItems:'flex-start'}}><div style={{width:34,height:34,borderRadius:8,background:'rgba(255,255,255,0.04)',border:`1px solid ${G.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{ic}</div><div><div style={{fontWeight:600,fontSize:13,marginBottom:3,color:G.text}}>{title}</div><div style={{fontSize:12,color:G.muted,lineHeight:1.5}}>{desc}</div></div></div>)}</div></div>
        <div><div className="sec-label">Resources</div><h2 style={{fontWeight:700,fontSize:22,marginBottom:18,letterSpacing:'-0.3px',color:G.text}}>{t.links}</h2><div style={{display:'flex',flexDirection:'column',gap:8}}>{links.map(lk=><a key={lk.u} href={lk.u} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 15px',background:G.surface,border:`1px solid ${G.border}`,borderRadius:9,fontSize:13,color:G.text,fontWeight:500,transition:'all 0.16s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=G.blue;e.currentTarget.style.color=G.blue}} onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';e.currentTarget.style.color='#F0EFEE'}}>{lk.l} <span style={{color:G.blue,fontSize:12}}>→</span></a>)}</div></div>
      </div>
    </div>
  </div>)
}

function AdminPage2({onClose}){
  const [pwd,setPwd]=useState('')
  const [auth,setAuth]=useState(false)
  const [tab,setTab]=useState('pending')
  const [profiles,setProfiles]=useState([])
  const [loading,setLoading]=useState(false)
  const [msg,setMsg]=useState('')
  const [editP,setEditP]=useState(null)
  const [ef,setEf]=useState({})
  const ADMIN_PWD='kosovahub2025'
  const load=async()=>{setLoading(true);try{const rows=await fetchAllProfilesAdmin();if(rows)setProfiles(rows)}catch{};setLoading(false)}
  const login=()=>{if(pwd===ADMIN_PWD){setAuth(true);load()}else setMsg('Wrong password')}
  const approve=async(id)=>{try{await verifyProfile(id);setProfiles(p=>p.map(x=>x.id===id?{...x,status:'active',verified:true}:x));setMsg('✓ Approved')}catch{setMsg('Error')}}
  const unapprove=async(id)=>{try{await updateProfile(id,{verified:false,status:'pending'});setProfiles(p=>p.map(x=>x.id===id?{...x,status:'pending',verified:false}:x));setMsg('✓ Unverified')}catch{setMsg('Error')}}
  const remove=async(id)=>{if(!window.confirm('Delete?'))return;try{await deleteProfile(id);setProfiles(p=>p.filter(x=>x.id!==id));setMsg('✓ Deleted')}catch{setMsg('Error')}}
  const saveEdit=async()=>{if(!editP)return;try{await updateProfile(editP.id,{name:ef.name,city:ef.city,description:ef.desc,category:ef.cat,tier:ef.tier,website:ef.website||null,phone:ef.phone||null});setProfiles(p=>p.map(x=>x.id===editP.id?{...x,...ef,cat:ef.cat}:x));setMsg('✓ Saved');setEditP(null)}catch{setMsg('Save failed')}}
  const pending=profiles.filter(p=>p.status==='pending'||p.status==='pending_review')
  const active=profiles.filter(p=>p.status==='active'||p.verified)
  const shown=tab==='pending'?pending:tab==='active'?active:profiles
  const Row=({p})=>(<div style={{display:'flex',gap:10,alignItems:'center',padding:'10px 13px',background:'rgba(255,255,255,0.03)',border:`1px solid ${G.border}`,borderRadius:8,marginBottom:6}}><Lg name={p.logo||p.name} color={catColor(p.cat)} url={p.logoUrl} size={32}/><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:13,color:G.text}}>{p.name}</div><div style={{fontSize:11,color:G.dim}}>{p.type} · {catLabel(p.cat,'en')} · {p.city} · {p.email}</div></div><span style={{fontSize:10,padding:'2px 6px',borderRadius:4,fontWeight:600,background:p.status==='active'||p.verified?'rgba(15,123,79,0.12)':G.blueDim,color:p.status==='active'||p.verified?'#4ade80':G.blue,border:`1px solid ${p.status==='active'||p.verified?'rgba(74,222,128,0.25)':G.blueBd}`}}>{p.status||'pending'}</span><div style={{display:'flex',gap:4}}><button onClick={()=>{setEditP(p);setEf({name:p.name,city:p.city||'',desc:p.desc?.en||p.description||'',cat:p.cat||'software',tier:p.tier||'free',website:p.website||'',phone:p.phone||''})}} style={{padding:'4px 8px',fontSize:11,background:'rgba(255,255,255,0.06)',border:`1px solid ${G.border}`,borderRadius:5,color:G.muted,cursor:'pointer'}}>✏️</button>{(p.status==='pending'||p.status==='pending_review')&&<button onClick={()=>approve(p.id)} className="btn-primary2" style={{padding:'4px 9px',fontSize:11}}>✓</button>}{(p.status==='active'||p.verified)&&<button onClick={()=>unapprove(p.id)} style={{padding:'4px 8px',fontSize:11,background:'rgba(217,119,6,0.10)',border:'1px solid rgba(217,119,6,0.22)',borderRadius:5,color:'#B45309',cursor:'pointer'}}>⊘</button>}<button onClick={()=>remove(p.id)} style={{padding:'4px 8px',fontSize:11,background:'rgba(194,53,53,0.10)',border:'1px solid rgba(194,53,53,0.22)',borderRadius:5,color:'#f87171',cursor:'pointer'}}>✕</button></div></div>)
  return(<div style={{position:'fixed',inset:0,background:'rgba(5,8,18,0.86)',zIndex:300,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'13px',overflowY:'auto',backdropFilter:'blur(8px)'}}><div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:13,width:'100%',maxWidth:840,boxShadow:'0 24px 64px rgba(0,0,0,0.60)',marginTop:10,marginBottom:10}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'15px 20px',borderBottom:'1px solid rgba(255,255,255,0.08)'}}><div style={{fontWeight:800,fontSize:15,color:G.text}}>⚙️ Admin — Kosova Hub</div><button onClick={onClose} className="btn-ghost2">✕ Close</button></div>
    {!auth?<div style={{padding:'42px 20px',maxWidth:290,margin:'0 auto',textAlign:'center'}}><div style={{fontWeight:700,fontSize:16,marginBottom:5,color:G.text}}>Admin Login</div><div style={{fontSize:13,color:G.muted,marginBottom:16}}>Enter admin password</div><input className="inp2" type="password" placeholder="Password" value={pwd} onChange={e=>setPwd(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} style={{marginBottom:10}}/>{msg&&<div style={{color:'#f87171',fontSize:12,marginBottom:8}}>{msg}</div>}<button className="btn-primary2" style={{width:'100%'}} onClick={login}>Login →</button></div>
    :<div style={{padding:'16px 20px'}}><div style={{display:'flex',gap:5,marginBottom:14,flexWrap:'wrap',alignItems:'center'}}><div style={{display:'flex',gap:3,background:'rgba(255,255,255,0.04)',padding:3,borderRadius:7}}>{[['pending',`Pending (${pending.length})`],['active',`Active (${active.length})`],['all',`All (${profiles.length})`]].map(([id,l])=><button key={id} onClick={()=>setTab(id)} style={{padding:'5px 12px',borderRadius:5,border:'none',fontSize:12,fontWeight:600,background:tab===id?G.blue:'transparent',color:tab===id?'#fff':G.muted,cursor:'pointer'}}>{l}</button>)}</div><button onClick={load} className="btn-ghost2">↻</button>{msg&&<span style={{fontSize:12,color:'#4ade80',fontWeight:600}}>{msg}</span>}</div>
    {loading?<div style={{textAlign:'center',padding:'26px',color:G.muted}}>Loading…</div>:shown.length>0?shown.map(p=><Row key={p.id} p={p}/>):<div style={{textAlign:'center',padding:'26px',color:G.dim,fontSize:13}}>No profiles here</div>}</div>}
  </div>
  {editP&&<div style={{position:'fixed',inset:0,background:'rgba(5,8,18,0.72)',zIndex:310,display:'flex',alignItems:'center',justifyContent:'center',padding:'14px'}} onClick={e=>e.target===e.currentTarget&&setEditP(null)}><div style={{background:G.surface,border:`1px solid ${G.border}`,borderRadius:12,padding:'20px',maxWidth:480,width:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.55)'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}><div style={{fontWeight:700,fontSize:16,color:G.text}}>Edit — {editP.name}</div><button onClick={()=>setEditP(null)} className="btn-ghost2">✕</button></div><div style={{display:'flex',flexDirection:'column',gap:11}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><div><label className="label2">Name</label><input className="inp2" value={ef.name||''} onChange={e=>setEf(f=>({...f,name:e.target.value}))}/></div><div><label className="label2">City</label><input className="inp2" value={ef.city||''} onChange={e=>setEf(f=>({...f,city:e.target.value}))}/></div></div><div><label className="label2">Website</label><input className="inp2" value={ef.website||''} onChange={e=>setEf(f=>({...f,website:e.target.value}))}/></div><div><label className="label2">Phone</label><input className="inp2" value={ef.phone||''} onChange={e=>setEf(f=>({...f,phone:e.target.value}))}/></div><div><label className="label2">Sector</label><select className="inp2" value={ef.cat||'software'} onChange={e=>setEf(f=>({...f,cat:e.target.value}))}>{CATS.map(c=><option key={c.id} value={c.id}>{c.labels.en}</option>)}</select></div><div><label className="label2">Tier</label><select className="inp2" value={ef.tier||'free'} onChange={e=>setEf(f=>({...f,tier:e.target.value}))}>{['free','sponsored'].map(v=><option key={v} value={v}>{v}</option>)}</select></div><div><label className="label2">Description</label><textarea className="inp2" rows={3} value={ef.desc||''} onChange={e=>setEf(f=>({...f,desc:e.target.value}))} style={{resize:'vertical'}}/></div><div style={{display:'flex',gap:7,justifyContent:'flex-end'}}><button className="btn-ghost2" onClick={()=>setEditP(null)}>Cancel</button><button className="btn-primary2" onClick={saveEdit}>Save Changes</button></div></div></div></div>}
  </div>)
}

function Nav2({page,setPage,lang,setLang,t,onReg}){
  const [mob,setMob]=useState(false)
  const PAGES=[['home',t.navHome],['directory',t.navDir],['concierge',t.navConcierge],['gov',t.navGov]]
  return(<><nav className="nav2"><div className="wrap2" style={{height:62,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
    <button onClick={()=>setPage('home')} style={{background:'transparent',border:'none',display:'flex',alignItems:'center',gap:9,cursor:'pointer',padding:0}}>
      <div style={{width:29,height:29,borderRadius:7,background:`linear-gradient(135deg,${G.blue},${G.violet})`,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontWeight:800,fontSize:14,color:'#fff'}}>K</span></div>
      <div><div style={{fontWeight:800,fontSize:15,color:G.text,letterSpacing:'-0.3px',lineHeight:1.1}}>Kosova Hub</div><div style={{fontSize:9,color:'rgba(240,239,238,0.33)',letterSpacing:'1px',textTransform:'uppercase'}}>B2B Gateway</div></div>
    </button>
    <div className="nav-links2" style={{display:'flex',gap:2}}>{PAGES.map(([p,l])=><button key={p} onClick={()=>setPage(p)} style={{background:page===p?G.blueDim:'transparent',color:page===p?'#93B4F8':'rgba(240,239,238,0.56)',border:page===p?`1px solid ${G.blueBd}`:'1px solid transparent',borderRadius:7,padding:'6px 11px',fontSize:13,fontWeight:500,cursor:'pointer',transition:'all 0.15s'}}>{l}</button>)}</div>
    <div style={{display:'flex',gap:6,alignItems:'center'}}>{['en','sq'].map(l=><button key={l} onClick={()=>setLang(l)} style={{background:lang===l?G.blueDim:'transparent',border:`1px solid ${lang===l?G.blueBd:'transparent'}`,borderRadius:5,padding:'4px 7px',color:lang===l?'#93B4F8':'rgba(240,239,238,0.36)',fontSize:11,fontWeight:700,cursor:'pointer'}}>{l.toUpperCase()}</button>)}<button className="btn-primary2 hide-mob" style={{padding:'7px 14px',fontSize:12}} onClick={onReg}>{t.registerBtn}</button><button className="hamburger2" onClick={()=>setMob(v=>!v)} style={{display:'none',flexDirection:'column',gap:4,background:'transparent',border:'none',padding:6,cursor:'pointer'}}>{[0,1,2].map(i=><span key={i} style={{display:'block',width:18,height:1.5,background:'rgba(240,239,238,0.62)',borderRadius:1}}/>)}</button></div>
  </div></nav>
  {mob&&<div style={{position:'fixed',top:62,left:0,right:0,background:G.navBg,borderBottom:'1px solid rgba(255,255,255,0.08)',zIndex:99,padding:'9px 13px 13px'}}>{PAGES.map(([p,l])=><button key={p} onClick={()=>{setPage(p);setMob(false)}} style={{display:'block',width:'100%',textAlign:'left',background:page===p?G.blueDim:'transparent',border:'none',borderRadius:7,padding:'10px 12px',color:page===p?'#93B4F8':'rgba(240,239,238,0.66)',fontSize:14,fontWeight:500,marginBottom:3,cursor:'pointer'}}>{l}</button>)}<button className="btn-primary2" style={{width:'100%',marginTop:6}} onClick={()=>{onReg();setMob(false)}}>{t.registerBtn}</button></div>}
  </>)
}

class EB extends React.Component{
  constructor(p){super(p);this.state={err:null}}
  static getDerivedStateFromError(e){return{err:e}}
  render(){if(this.state.err)return(<div style={{padding:38,background:'#0f1117',color:'#f87171',fontFamily:'monospace',minHeight:'100vh'}}><h2 style={{marginBottom:14}}>⚠ App error — paste this to Claude:</h2><pre style={{whiteSpace:'pre-wrap',fontSize:12,background:'rgba(255,255,255,0.04)',padding:14,borderRadius:8,border:'1px solid rgba(248,113,113,0.18)'}}>{this.state.err?.toString()}{'\n'}{this.state.err?.stack}</pre></div>);return this.props.children}
}

export default function App(){
  const [lang,setLang]=useState('en')
  const [page,setPage]=useState('home')
  const [profiles,setProfiles]=useState([])
  const [siteContent,setSC]=useState({})
  const [showReg,setShowReg]=useState(false)
  const [showAdmin,setShowAdmin]=useState(false)
  const t=T[lang]||T.en
  useEffect(()=>{if(window.location.search.includes('admin')||window.location.hash.includes('admin'))setShowAdmin(true)},[])
  useEffect(()=>{fetchProfiles().then(rows=>{if(rows)setProfiles(rows.map(normalise).filter(p=>p.status==='active'||p.verified))}).catch(()=>{});fetchSiteContent().then(d=>{if(d)setSC(d)}).catch(()=>{})},[])
  const partnerProfiles=useMemo(()=>profiles.filter(p=>p.type==='partner'),[profiles])
  return(<EB><div style={{background:G.bg,minHeight:'100vh'}}><style dangerouslySetInnerHTML={{__html:CSS}}/><Nav2 page={page} setPage={setPage} lang={lang} setLang={setLang} t={t} onReg={()=>setShowReg(true)}/>{page==='home'&&<Home2 lang={lang} t={t} profiles={profiles} setPage={setPage} onReg={()=>setShowReg(true)}/>}{page==='directory'&&<Directory2 lang={lang} t={t} profiles={profiles}/>}{page==='concierge'&&<Concierge2 lang={lang} t={t} siteContent={siteContent} partnerProfiles={partnerProfiles}/>}{page==='gov'&&<Gov2 lang={lang} t={t}/>}{showReg&&<RegModal2 t={t} lang={lang} onClose={()=>setShowReg(false)}/>}{showAdmin&&<AdminPage2 onClose={()=>setShowAdmin(false)}/>}</div></EB>)
}
