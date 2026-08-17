// Kosova Hub — v2 Design: Modern B2B · Light Theme · Plus Jakarta Sans
// Vivid cobalt/teal/violet · White card panels · Clean professional
import React, { useState, useMemo, useEffect } from 'react'
import {
  fetchProfiles, insertProfile, insertContactLead, insertBooking,
  fetchSiteContent, formToDb,
} from './supabase.js'
import { notifyAdminNewProfile, sendEnquiry, sendBookingConfirmation } from './emailService.js'

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const G = {
  bg:        '#F0F2F7',
  white:     '#FFFFFF',
  surface:   '#F8F9FC',
  card:      '#FFFFFF',
  text:      '#0E1628',
  muted:     'rgba(14,22,40,0.52)',
  dim:       'rgba(14,22,40,0.32)',
  border:    'rgba(14,22,40,0.09)',
  blue:      '#2458D4',
  blueDim:   'rgba(36,88,212,0.08)',
  blueBd:    'rgba(36,88,212,0.22)',
  teal:      '#0B8A7E',
  tealDim:   'rgba(11,138,126,0.08)',
  violet:    '#6B35C2',
  violetDim: 'rgba(107,53,194,0.08)',
  green:     '#0F7B4F',
  red:       '#C23535',
  shadow:    '0 2px 16px rgba(14,22,40,0.07)',
  shadowHov: '0 10px 40px rgba(14,22,40,0.13)',
  navBg:     '#0E1628',
}

// ─── SECTOR PALETTE — vivid, works on white cards ────────────────────────────
const CATS = [
  { id:'software',   icon:'💻', color:'#2458D4', labels:{en:'Software & IT',     sq:'Softuer & IT'}},
  { id:'support',    icon:'🛠️', color:'#6B35C2', labels:{en:'Tech Support',      sq:'Mbështetje Tech'}},
  { id:'consulting', icon:'📊', color:'#0B8A7E', labels:{en:'Consulting',         sq:'Konsulencë'}},
  { id:'media',      icon:'🎬', color:'#C45C0A', labels:{en:'Media & Content',    sq:'Media & Content'}},
  { id:'production', icon:'🏭', color:'#8B5E10', labels:{en:'Production',         sq:'Prodhim'}},
  { id:'textile',    icon:'🧵', color:'#B03080', labels:{en:'Textile & Fashion',  sq:'Tekstil & Modë'}},
  { id:'bpo',        icon:'📞', color:'#0878A0', labels:{en:'BPO / Call Centre',  sq:'BPO / Call Center'}},
  { id:'design',     icon:'🎨', color:'#8B28A8', labels:{en:'Design & Creative',  sq:'Dizajn & Kreativ'}},
  { id:'logistics',  icon:'🚚', color:'#0A7A3C', labels:{en:'Logistics',          sq:'Logjistikë'}},
  { id:'legal',      icon:'⚖️', color:'#4A5568', labels:{en:'Legal & Finance',    sq:'Ligjor & Financa'}},
]

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en:{
    tagline:'The B2B Gateway to Kosova',
    navHome:'Home', navDir:'Companies', navConcierge:'Concierge', navGov:'Invest',
    registerBtn:'List Your Business',
    h1a:'Connect your business', h1b:'with Kosova.',
    heroSub:'Discover verified companies, freelancers and consultants — ready to partner with EU businesses today.',
    searchPH:'Search companies, skills, cities…',
    browseBtn:'Browse Directory', learnBtn:'How it works',
    statComp:'Companies', statFL:'Freelancers', statPart:'Partners', statTax:'Corp. Tax',
    featuredTitle:'Featured Listings', allSectors:'All', viewAll:'View all →',
    onlyComp:'Companies', onlyFL:'Freelancers', allTypes:'All',
    noResults:'No results', noResultsSub:'Try different keywords or filters.',
    verified:'Verified', featured:'Featured', contact:'Contact',
    viewProfile:'View profile', employees:'Employees',
    concTitle:'Kosova Concierge',
    concSub:'Our partners handle your entire Kosova business visit — meetings, site tours, government appointments.',
    concCta:'Request a Visit',
    bookTitle:'Request a Kosova Visit',
    bookName:'Your name *', bookComp:'Company', bookEmail:'Email *',
    bookGoal:'Your objective', bookGoalPH:'e.g. Meet software teams, find manufacturing partners…',
    bookWhen:'Preferred period', bookPax:'Participants',
    bookSend:'Submit Request', bookDone:'Request submitted!', bookDoneSub:'We\'ll reply within 24 hours.',
    govTitle:'Invest in Kosova', govSub:'10% flat corporate tax · Euro currency · Young educated workforce · EU accession path',
    govFactsTitle:'Key Facts',
    govFacts:[['10%','Corporate Tax'],['18%','VAT'],['€1','Min. Capital'],['5–10 days','Formation'],['EUR','Currency'],['1.8M','Population'],['63%','Under 35'],['2008','Independence']],
    govSteps:[
      {ic:'🖥️',t:'Register Online',d:'Full registration via ARBK portal.',time:'1–3 days'},
      {ic:'💶',t:'Share Capital',d:'Minimum €1 — no barrier to entry.',time:'1 day'},
      {ic:'📋',t:'Tax ID',d:'Automatically assigned at registration.',time:'1–2 days'},
      {ic:'🏦',t:'Bank Account',d:'10 licensed banks available.',time:'2–5 days'},
    ],
    whyKosova:[
      ['📉','Lowest Tax in Region','10% flat corporate income tax.'],
      ['💶','Euro Currency','No FX risk for EU companies.'],
      ['🎓','Young Talent','63% under 35, strong STEM base.'],
      ['🌍','EU Path','Clear accession trajectory.'],
    ],
    regTitle:'List Your Business',
    regFree:'Free listing · Published within 48h',
    regName:'Name *', regCity:'City *', regEmail:'Email *',
    regDesc:'Description', regDescPH:'Describe your services…',
    regTags:'Skills / Tags', regTagsPH:'React, Node.js, Manufacturing…',
    regSend:'Submit listing →', regDone:'Submitted!', regDoneSub:'We\'ll review and publish within 24–48h.',
    enquiryTo:'Enquiry to', enquiryName:'Your name *', enquiryEmail:'Your email *',
    enquiryMsg:'Message', enquiryPH:'Hello, I\'m looking for…',
    enquirySend:'Send Enquiry', enquiryDone:'Sent!', enquiryDoneSub:'will be in touch.',
    links:'Official Links', footer:'© 2025 Kosova Hub · Business Bridge Platform',
  },
  sq:{
    tagline:'Porta B2B për Kosovën',
    navHome:'Kryefaqja', navDir:'Kompanitë', navConcierge:'Concierge', navGov:'Investoni',
    registerBtn:'Listo Biznesin Tënd',
    h1a:'Lidhuni me biznesin', h1b:'Kosovar.',
    heroSub:'Zbuloni kompani, freelancerë dhe konsulentë të verifikuar — gati për partneritet me biznese europiane.',
    searchPH:'Kërko kompani, aftësi, qytete…',
    browseBtn:'Shfleto Drejtorinë', learnBtn:'Si funksionon',
    statComp:'Kompani', statFL:'Freelancerë', statPart:'Partnerë', statTax:'Tatim Korp.',
    featuredTitle:'Listime të Theksuara', allSectors:'Të gjitha', viewAll:'Shiko të gjitha →',
    onlyComp:'Kompani', onlyFL:'Freelancerë', allTypes:'Të gjitha',
    noResults:'Asnjë rezultat', noResultsSub:'Provo terma të tjerë.',
    verified:'Verifikuar', featured:'I Theksuar', contact:'Kontakto',
    viewProfile:'Shiko profilin', employees:'Punonjës',
    concTitle:'Concierge Kosovës',
    concSub:'Partnerët tanë organizojnë vizitën tuaj të plotë të biznesit — takime, turne, takime qeveritare.',
    concCta:'Kërko Vizitë',
    bookTitle:'Kërko Vizitë', bookName:'Emri *', bookComp:'Kompania', bookEmail:'Email *',
    bookGoal:'Qëllimi', bookGoalPH:'p.sh. Takim me ekipe software…',
    bookWhen:'Periudha preferenciale', bookPax:'Pjesëmarrës',
    bookSend:'Dërgo Kërkesën', bookDone:'Kërkesa u dërgua!', bookDoneSub:'Do ju kontaktojmë brenda 24 orësh.',
    govTitle:'Investoni në Kosovë', govSub:'Tatim 10% · Euro · Talent i ri · Rrugë BE',
    govFactsTitle:'Të Dhënat Kryesore',
    govFacts:[['10%','Tatim'],['18%','TVSH'],['1€','Kapitali Min.'],['5–10 ditë','Themelimi'],['EUR','Valuta'],['1.8M','Banorë'],['63%','Nën 35'],['2008','Pavarësia']],
    govSteps:[
      {ic:'🖥️',t:'Regjistrim Online',d:'Regjistrim i plotë në ARBK.',time:'1–3 ditë'},
      {ic:'💶',t:'Kapitali',d:'Minimum 1€ — pa pengesa.',time:'1 ditë'},
      {ic:'📋',t:'Numri Fiskal',d:'Caktohet automatikisht.',time:'1–2 ditë'},
      {ic:'🏦',t:'Llogari Bankare',d:'10 banka të licencuara.',time:'2–5 ditë'},
    ],
    whyKosova:[
      ['📉','Tatimi Më i Ulët','Tatim 10% i sheshtë korporativ.'],
      ['💶','Valuta Euro','Pa rrezik kursi valutor.'],
      ['🎓','Talent i Ri','63% nën 35, bazë e fortë STEM.'],
      ['🌍','Rruga BE','Trajektore e qartë anëtarësimi.'],
    ],
    regTitle:'Listo Biznesin Tënd', regFree:'Falas · Publikohet brenda 48h',
    regName:'Emri *', regCity:'Qyteti *', regEmail:'Email *',
    regDesc:'Përshkrim', regDescPH:'Përshkruani shërbimet tuaja…',
    regTags:'Aftësi / Tags', regTagsPH:'React, Node.js…',
    regSend:'Dërgo listimin →', regDone:'U dërgua!', regDoneSub:'Do ta rishikojmë brenda 24–48 orësh.',
    enquiryTo:'Kërkesë për', enquiryName:'Emri juaj *', enquiryEmail:'Email juaj *',
    enquiryMsg:'Mesazhi', enquiryPH:'Mirëdita, po kërkoj…',
    enquirySend:'Dërgo', enquiryDone:'U dërgua!', enquiryDoneSub:'do t\'ju kontaktojë.',
    links:'Lidhje Zyrtare', footer:'© 2025 Kosova Hub · Business Bridge Platform',
  }
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function hexToRgba(hex, a) {
  try { const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `rgba(${r},${g},${b},${a})` } catch { return `rgba(36,88,212,${a})` }
}
function catColor(id) { return CATS.find(c=>c.id===id)?.color||G.blue }
function catLabel(id,lang) { return CATS.find(c=>c.id===id)?.labels[lang]||id }
function catIcon(id) { return CATS.find(c=>c.id===id)?.icon||'🏢' }
function normalise(p) {
  if (!p) return p
  return { ...p,
    coverImage: p.coverImage||p.cover_image||null,
    coverFocus: p.coverFocus||p.cover_focus||'50% 50%',
    logoUrl: p.logoUrl||p.logo_url||null,
    logoColor: p.logoColor||p.logo_color||catColor(p.cat)||G.blue,
    tags: p.tags||[],
    desc: typeof p.description==='string' ? { en: p.description, sq: p.description } : (p.desc||{}),
  }
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #root { font-family: 'Plus Jakarta Sans', sans-serif; background: ${G.bg}; color: ${G.text}; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
button { cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
a { color: inherit; text-decoration: none; }
input, textarea, select { font-family: 'Plus Jakarta Sans', sans-serif; }

/* LAYOUT */
.wrap2 { max-width: 1200px; margin: 0 auto; padding: 0 28px; }
.section2 { padding: 72px 0; }
.grid-3 { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px,1fr)); gap: 18px; }
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* CARD */
.c2 { background: ${G.white}; border: 1px solid ${G.border}; border-radius: 14px; transition: all 0.22s cubic-bezier(0.4,0,0.2,1); position: relative; overflow: hidden; }
.c2:hover { box-shadow: ${G.shadowHov}; transform: translateY(-4px); border-color: rgba(14,22,40,0.15); }

/* BUTTONS */
.btn-primary2 { background: ${G.blue}; color: #fff; border: none; padding: 11px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; letter-spacing: -0.1px; transition: all 0.18s; }
.btn-primary2:hover { background: #1A45B8; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(36,88,212,0.28); }
.btn-outline2 { background: transparent; color: ${G.blue}; border: 2px solid ${G.blueBd}; padding: 10px 22px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: all 0.18s; }
.btn-outline2:hover { background: ${G.blueDim}; border-color: ${G.blue}; }
.btn-white2 { background: #fff; color: ${G.text}; border: none; padding: 11px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; transition: all 0.18s; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.btn-white2:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.14); transform: translateY(-1px); }
.btn-ghost2 { background: transparent; color: ${G.muted}; border: 1px solid ${G.border}; padding: 7px 14px; border-radius: 7px; font-size: 12px; font-weight: 500; transition: all 0.16s; }
.btn-ghost2:hover { color: ${G.text}; border-color: rgba(14,22,40,0.22); }

/* FORM */
.inp2 { background: ${G.white}; border: 1.5px solid ${G.border}; border-radius: 8px; padding: 10px 14px; color: ${G.text}; width: 100%; font-size: 14px; outline: none; transition: border 0.18s; }
.inp2:focus { border-color: ${G.blue}; box-shadow: 0 0 0 3px ${G.blueDim}; }
.inp2::placeholder { color: ${G.dim}; }
.label2 { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; color: ${G.dim}; margin-bottom: 6px; }

/* PILL / BADGE / TAG */
.pill2 { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.chip2 { display: inline-block; padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: 500; background: ${G.bg}; border: 1px solid ${G.border}; color: ${G.muted}; }

/* NAV */
.nav2 { position: fixed; top: 0; left: 0; right: 0; z-index: 100; height: 62px; background: ${G.navBg}; }

/* SECTION LABEL */
.sec-label { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${G.blue}; margin-bottom: 14px; }
.sec-label::before { content: ''; display: block; width: 20px; height: 2px; background: ${G.blue}; border-radius: 1px; }

/* STAT */
.stat2 { padding: 20px 24px; background: ${G.white}; border-radius: 12px; border: 1px solid ${G.border}; }

/* SECTOR CHIP */
.sector-chip { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; }

/* MODAL */
.modal-bg2 { position: fixed; inset: 0; background: rgba(14,22,40,0.55); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(6px); }
.modal2 { background: ${G.white}; border-radius: 16px; padding: 28px; max-width: 520px; width: 100%; max-height: 92vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(14,22,40,0.18); }

/* SCORE BAR */
.score-track2 { width: 100%; height: 5px; background: ${G.bg}; border-radius: 3px; overflow: hidden; }
.score-fill2 { height: 100%; border-radius: 3px; transition: width 0.7s cubic-bezier(0.4,0,0.2,1); }

/* SCROLLBAR */
::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${G.border}; border-radius: 3px; }

/* MOBILE */
@media(max-width: 768px) {
  .wrap2 { padding: 0 16px; }
  .section2 { padding: 48px 0; }
  .grid-3 { grid-template-columns: 1fr; }
  .grid-2 { grid-template-columns: 1fr; }
  .hide-mob { display: none !important; }
  .nav-links2 { display: none !important; }
  .hamburger2 { display: flex !important; }
}
@media(max-width: 480px) {
  .wrap2 { padding: 0 12px; }
}
`

// ─── LOGO ────────────────────────────────────────────────────────────────────
function Lg({ name, color=G.blue, url=null, size=46 }) {
  const br = Math.round(size*0.22)
  if (url) return <div style={{ width:size, height:size, borderRadius:br, overflow:'hidden', flexShrink:0, border:`1.5px solid ${G.border}` }}><img src={url} alt={name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>
  return (
    <div style={{ width:size, height:size, borderRadius:br, background:hexToRgba(color,0.10), border:`1.5px solid ${hexToRgba(color,0.22)}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:Math.round(size*0.36), color, lineHeight:1 }}>{(name||'?').slice(0,2).toUpperCase()}</span>
    </div>
  )
}

// ─── PROFILE CARD ─────────────────────────────────────────────────────────────
function Card2({ p, lang, t, onContact, onView, score }) {
  const isSp = p.tier==='sponsored'
  const sc = catColor(p.cat)
  const desc = (p.desc?.[lang]||p.desc?.en||'').slice(0,110)
  return (
    <div className="c2" style={{ cursor:'pointer' }} onClick={()=>onView?.(p)}>
      {/* Top color band */}
      <div style={{ height:5, background: isSp ? `linear-gradient(90deg,${sc},${G.blue})` : sc, borderRadius:'14px 14px 0 0' }} />
      {/* Cover image */}
      {p.coverImage && (
        <div style={{ height:72, overflow:'hidden', margin:'0 -1px', position:'relative' }}>
          <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:p.coverFocus||'50% 50%' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(255,255,255,0.95) 0%,rgba(255,255,255,0) 60%)' }} />
        </div>
      )}
      <div style={{ padding:'16px 18px 18px' }}>
        {/* Header */}
        <div style={{ display:'flex', gap:11, alignItems:'flex-start', marginBottom:10 }}>
          <Lg name={p.logo||p.name} color={sc} url={p.logoUrl} size={44} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:3 }}>
              <span style={{ fontWeight:700, fontSize:15, color:G.text, lineHeight:1.2 }}>{p.name}</span>
              {isSp && <span className="pill2" style={{ background:hexToRgba(G.blue,0.10), color:G.blue, border:`1px solid ${hexToRgba(G.blue,0.20)}` }}>★ {t.featured}</span>}
              {p.verified && <span className="pill2" style={{ background:hexToRgba(G.green,0.10), color:G.green, border:`1px solid ${hexToRgba(G.green,0.22)}` }}>✓ {t.verified}</span>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <span className="sector-chip" style={{ background:hexToRgba(sc,0.09), color:sc, border:`1px solid ${hexToRgba(sc,0.18)}` }}>
                {catIcon(p.cat)} {catLabel(p.cat,lang)}
              </span>
              {p.city && <span style={{ fontSize:12, color:G.dim }}>📍 {p.city}</span>}
            </div>
          </div>
        </div>
        {/* Description */}
        {desc && <p style={{ fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:12 }}>{desc}{(p.desc?.[lang]||p.desc?.en||'').length>110?'…':''}</p>}
        {/* Tags */}
        {p.tags?.length > 0 && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
            {p.tags.slice(0,5).map(tag=><span key={tag} className="chip2" style={{ color:hexToRgba(sc,0.85), borderColor:hexToRgba(sc,0.15), background:hexToRgba(sc,0.05) }}>{tag}</span>)}
          </div>
        )}
        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, borderTop:`1px solid ${G.border}`, paddingTop:12 }}>
          <div style={{ display:'flex', gap:6 }}>
            {p.employees && <span className="pill2" style={{ background:G.bg, color:G.dim, border:`1px solid ${G.border}`, fontSize:10 }}>👥 {p.employees}</span>}
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {score!=null && (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div className="score-track2" style={{ width:48 }}>
                  <div className="score-fill2" style={{ width:`${score}%`, background:score>=80?G.green:score>=50?G.blue:G.dim }} />
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:score>=80?G.green:score>=50?G.blue:G.dim }}>{score}%</span>
              </div>
            )}
            <button className="btn-ghost2" style={{ fontSize:11, padding:'5px 12px' }}
              onClick={e=>{e.stopPropagation();onContact?.(p)}}>{t.contact}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ENQUIRY MODAL ────────────────────────────────────────────────────────────
function EnquiryModal2({ target, t, onClose }) {
  const [form, setForm] = useState({ name:'', email:'', msg:'' })
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const send = async () => {
    if (!form.name||!form.email) return
    setBusy(true)
    try {
      await insertContactLead({ profile_id:target.id, name:form.name, email:form.email, message:form.msg })
      await sendEnquiry({ toName:target.name, toEmail:target.contact||target.email, fromName:form.name, fromEmail:form.email, message:form.msg })
      setSent(true)
    } catch{}
    setBusy(false)
  }

  return (
    <div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal2">
        {sent ? (
          <div style={{ textAlign:'center', padding:'32px 0' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:hexToRgba(G.green,0.10), border:`2px solid ${hexToRgba(G.green,0.25)}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:24 }}>✓</div>
            <div style={{ fontWeight:700, fontSize:20, marginBottom:6 }}>{t.enquiryDone}</div>
            <div style={{ color:G.muted, fontSize:14 }}>{target.name} {t.enquiryDoneSub}</div>
          </div>
        ) : <>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
            <div>
              <div style={{ fontWeight:700, fontSize:19, marginBottom:4 }}>{t.enquiryTo} {target.name}</div>
              <div style={{ fontSize:12, color:G.muted }}>{catLabel(target.cat,'en')} · {target.city}</div>
            </div>
            <button onClick={onClose} className="btn-ghost2">✕</button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div><label className="label2">{t.enquiryName}</label><input className="inp2" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} /></div>
            <div><label className="label2">{t.enquiryEmail}</label><input className="inp2" type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} /></div>
            <div><label className="label2">{t.enquiryMsg}</label><textarea className="inp2" rows={4} placeholder={t.enquiryPH} value={form.msg} onChange={e=>setForm(p=>({...p,msg:e.target.value}))} style={{ resize:'vertical' }} /></div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button className="btn-ghost2" onClick={onClose}>Cancel</button>
              <button className="btn-primary2" onClick={send} disabled={busy}>{busy?'Sending…':t.enquirySend}</button>
            </div>
          </div>
        </>}
      </div>
    </div>
  )
}

// ─── PROFILE DETAIL MODAL ─────────────────────────────────────────────────────
function DetailModal2({ p, lang, t, onClose, onContact }) {
  if (!p) return null
  const sc = catColor(p.cat)
  return (
    <div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal2" style={{ maxWidth:580, padding:0, borderRadius:16, overflow:'hidden' }}>
        {/* Top band */}
        <div style={{ height:6, background:`linear-gradient(90deg,${sc} 0%,${G.blue} 100%)` }} />
        {p.coverImage && (
          <div style={{ height:90, overflow:'hidden', position:'relative' }}>
            <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:p.coverFocus||'50% 50%' }} />
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(255,255,255,0.98) 0%,rgba(255,255,255,0) 55%)' }} />
          </div>
        )}
        <div style={{ padding:'20px 24px 0' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              <Lg name={p.logo||p.name} color={sc} url={p.logoUrl} size={50} />
              <div>
                <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap', marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:19 }}>{p.name}</span>
                  {p.verified && <span className="pill2" style={{ background:hexToRgba(G.green,0.10), color:G.green, border:`1px solid ${hexToRgba(G.green,0.22)}` }}>✓ {t.verified}</span>}
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', fontSize:12, color:G.muted }}>
                  <span className="sector-chip" style={{ background:hexToRgba(sc,0.09), color:sc, border:`1px solid ${hexToRgba(sc,0.18)}` }}>{catIcon(p.cat)} {catLabel(p.cat,lang)}</span>
                  {p.city && <span>📍 {p.city}</span>}
                  {p.employees && <span>👥 {p.employees}</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost2">✕</button>
          </div>
        </div>
        <div style={{ padding:'20px 24px', maxHeight:'55vh', overflowY:'auto' }}>
          {(p.desc?.[lang]||p.desc?.en) && <p style={{ color:G.muted, lineHeight:1.72, fontSize:14, marginBottom:16 }}>{p.desc?.[lang]||p.desc?.en}</p>}
          {p.tags?.length>0 && <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>{p.tags.map(tag=><span key={tag} className="chip2">{tag}</span>)}</div>}
          {p.website && <div style={{ marginBottom:10 }}><label className="label2">Website</label><a href={`https://${p.website.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" style={{ color:G.blue, fontSize:14, fontWeight:500 }}>{p.website} →</a></div>}
          {p.linkedin && <div style={{ marginBottom:10 }}><label className="label2">LinkedIn</label><a href={p.linkedin} target="_blank" rel="noopener noreferrer" style={{ color:G.blue, fontSize:14, fontWeight:500 }}>View Profile →</a></div>}
        </div>
        <div style={{ padding:'14px 24px', borderTop:`1px solid ${G.border}`, display:'flex', justifyContent:'flex-end', gap:8 }}>
          {p.website && <a href={`https://${p.website.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" className="btn-ghost2" style={{ padding:'8px 16px', fontSize:12 }}>Website →</a>}
          <button className="btn-primary2" onClick={()=>{onClose();onContact?.(p)}}>{t.contact}</button>
        </div>
      </div>
    </div>
  )
}

// ─── REGISTRATION MODAL ───────────────────────────────────────────────────────
function RegModal2({ t, lang, onClose }) {
  const [step, setStep] = useState(0)
  const [type, setType] = useState(null)
  const [form, setForm] = useState({ name:'', city:'', email:'', website:'', desc:'', tags:'', cat:'software' })
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  const submit = async () => {
    if (!form.name||!form.city||!form.email) return
    setBusy(true)
    try {
      await insertProfile({ name:form.name, city:form.city, email:form.email, website:form.website||null, description:form.desc, tags:form.tags.split(',').map(s=>s.trim()).filter(Boolean), category:form.cat, type:type, tier:'free', status:'pending', logo_color: catColor(form.cat) })
      await notifyAdminNewProfile({ name:form.name, email:form.email, type, cat:form.cat, city:form.city })
      setDone(true)
    } catch(e){ console.error(e) }
    setBusy(false)
  }

  if (done) return (
    <div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal2" style={{ textAlign:'center', padding:'48px 32px' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:hexToRgba(G.green,0.12), border:`2px solid ${hexToRgba(G.green,0.28)}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:28 }}>✓</div>
        <div style={{ fontWeight:700, fontSize:22, marginBottom:8 }}>{t.regDone}</div>
        <div style={{ color:G.muted, marginBottom:24 }}>{t.regDoneSub}</div>
        <button className="btn-primary2" onClick={onClose}>Close</button>
      </div>
    </div>
  )

  return (
    <div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal2">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
          <div style={{ fontWeight:700, fontSize:20 }}>{t.regTitle}</div>
          <button onClick={onClose} className="btn-ghost2">✕</button>
        </div>
        {step===0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[['company','🏢','Company / Agency'],['freelancer','👤','Freelancer / Consultant'],['partner','🤝','Partner / Institution']].map(([id,ic,label])=>(
              <button key={id} onClick={()=>{setType(id);setStep(1)}}
                style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:G.surface, border:`1.5px solid ${G.border}`, borderRadius:10, textAlign:'left', color:G.text, transition:'all 0.18s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=G.blue;e.currentTarget.style.background=G.blueDim}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.background=G.surface}}>
                <span style={{ fontSize:22 }}>{ic}</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{label}</div>
                  <div style={{ fontSize:12, color:G.dim, marginTop:1 }}>{t.regFree}</div>
                </div>
                <span style={{ marginLeft:'auto', color:G.blue }}>→</span>
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label className="label2">{t.regName}</label><input className="inp2" value={form.name} onChange={e=>f('name',e.target.value)} /></div>
              <div><label className="label2">{t.regCity}</label><input className="inp2" value={form.city} onChange={e=>f('city',e.target.value)} /></div>
            </div>
            <div><label className="label2">{t.regEmail}</label><input className="inp2" type="email" value={form.email} onChange={e=>f('email',e.target.value)} /></div>
            <div>
              <label className="label2">Sector</label>
              <select className="inp2" value={form.cat} onChange={e=>f('cat',e.target.value)}>
                {CATS.map(c=><option key={c.id} value={c.id}>{c.labels[lang]||c.labels.en}</option>)}
              </select>
            </div>
            <div><label className="label2">{t.regDesc}</label><textarea className="inp2" rows={3} placeholder={t.regDescPH} value={form.desc} onChange={e=>f('desc',e.target.value)} style={{ resize:'vertical' }} /></div>
            <div><label className="label2">{t.regTags}</label><input className="inp2" placeholder={t.regTagsPH} value={form.tags} onChange={e=>f('tags',e.target.value)} /></div>
            <div style={{ display:'flex', justifyContent:'space-between', gap:8, marginTop:4 }}>
              <button className="btn-ghost2" onClick={()=>setStep(0)}>← Back</button>
              <button className="btn-primary2" onClick={submit} disabled={busy}>{busy?'Submitting…':t.regSend}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function Home2({ lang, t, profiles, setPage, onReg }) {
  const [detail, setDetail] = useState(null)
  const [contact, setContact] = useState(null)
  const sponsored = useMemo(()=>profiles.filter(p=>p.tier==='sponsored').slice(0,6),[profiles])
  const stats = useMemo(()=>[profiles.filter(p=>p.type==='company').length||120, profiles.filter(p=>p.type==='freelancer').length||48, profiles.filter(p=>p.type==='partner').length||12],[profiles])

  return (
    <div>
      {/* ── HERO — dark panel ── */}
      <div style={{ background:G.navBg, paddingTop:62, paddingBottom:0, position:'relative', overflow:'hidden' }}>
        {/* Decorative blobs */}
        <div style={{ position:'absolute', top:'-30%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(36,88,212,0.18) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-20%', left:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(107,53,194,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div className="wrap2" style={{ position:'relative', zIndex:1, paddingTop:72, paddingBottom:72 }}>
          <div style={{ maxWidth:700 }}>
            {/* Eyebrow */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 12px', background:'rgba(36,88,212,0.18)', border:'1px solid rgba(36,88,212,0.35)', borderRadius:20, marginBottom:24 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:G.blue }} />
              <span style={{ fontSize:11, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#93B4F8' }}>{t.tagline}</span>
            </div>
            {/* Big headline */}
            <h1 style={{ fontWeight:800, fontSize:'clamp(38px,6vw,72px)', lineHeight:1.06, letterSpacing:'-1.5px', marginBottom:20 }}>
              <span style={{ color:'#F0EFEE' }}>{t.h1a}</span><br />
              <span style={{ background:`linear-gradient(135deg, ${G.blue} 0%, ${G.violet} 100%)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{t.h1b}</span>
            </h1>
            <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'rgba(240,239,238,0.62)', lineHeight:1.72, marginBottom:36, maxWidth:520 }}>{t.heroSub}</p>
            {/* CTAs */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:56 }}>
              <button className="btn-white2" onClick={()=>setPage('directory')}>{t.browseBtn}</button>
              <button className="btn-outline2" style={{ color:'rgba(240,239,238,0.85)', borderColor:'rgba(240,239,238,0.22)' }} onClick={onReg}>{t.registerBtn}</button>
            </div>
          </div>

          {/* Stats bar */}
          <div style={{ display:'flex', gap:1, background:'rgba(255,255,255,0.07)', borderRadius:12, overflow:'hidden', maxWidth:580, border:'1px solid rgba(255,255,255,0.08)' }}>
            {[[stats[0],t.statComp,'#93B4F8'],[stats[1],t.statFL,'#B39FE8'],[stats[2],t.statPart,'#6EE7B7'],['10%',t.statTax,'#FCD34D']].map(([n,l,c],i)=>(
              <div key={l} style={{ flex:1, padding:'16px 18px', borderRight: i<3 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ fontWeight:800, fontSize:22, color:c, letterSpacing:'-0.5px', lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:10, color:'rgba(240,239,238,0.45)', marginTop:4, fontWeight:500, letterSpacing:'0.5px', textTransform:'uppercase' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CONTENT — light background ── */}
      <div style={{ background:G.bg }}>

        {/* ── FEATURED ── */}
        {sponsored.length > 0 && (
          <div className="section2 wrap2">
            <div className="sec-label">Featured Listings</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20 }}>
              <h2 style={{ fontWeight:700, fontSize:26, letterSpacing:'-0.5px' }}>{t.featuredTitle}</h2>
              <button className="btn-ghost2" onClick={()=>setPage('directory')}>{t.viewAll}</button>
            </div>
            <div className="grid-3">
              {sponsored.map(p=><Card2 key={p.id} p={p} lang={lang} t={t} onContact={setContact} onView={setDetail} />)}
            </div>
          </div>
        )}

        {/* ── SECTORS ── */}
        <div className="section2 wrap2" style={{ paddingTop:0 }}>
          <div className="sec-label">Sectors</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:20 }}>
            <h2 style={{ fontWeight:700, fontSize:26, letterSpacing:'-0.5px' }}>Browse by Sector</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:10 }}>
            {CATS.map(cat=>(
              <button key={cat.id} onClick={()=>setPage('directory')}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px', background:G.white, border:`1px solid ${G.border}`, borderRadius:10, textAlign:'left', transition:'all 0.18s', cursor:'pointer' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=hexToRgba(cat.color,0.40);e.currentTarget.style.background=hexToRgba(cat.color,0.05);e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=G.shadow}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.background=G.white;e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                <div style={{ width:36, height:36, borderRadius:9, background:hexToRgba(cat.color,0.10), border:`1px solid ${hexToRgba(cat.color,0.18)}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{cat.icon}</div>
                <span style={{ fontWeight:600, fontSize:13, color:G.text, lineHeight:1.25 }}>{cat.labels[lang]||cat.labels.en}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── CTA STRIP ── */}
        <div style={{ background:G.navBg, padding:'56px 0' }}>
          <div className="wrap2" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
            <div>
              <div className="sec-label" style={{ color:'#93B4F8' }}>For Businesses</div>
              <h3 style={{ fontWeight:700, fontSize:26, color:'#F0EFEE', marginBottom:8, letterSpacing:'-0.3px' }}>Is your business on Kosova Hub?</h3>
              <p style={{ color:'rgba(240,239,238,0.55)', fontSize:14, maxWidth:420 }}>Get discovered by EU companies actively looking for Kosova partners. Free listing, published within 48h.</p>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap', flexShrink:0 }}>
              <button className="btn-white2" style={{ padding:'12px 26px' }} onClick={onReg}>{t.registerBtn}</button>
              <button className="btn-outline2" style={{ color:'rgba(240,239,238,0.8)', borderColor:'rgba(240,239,238,0.20)', padding:'11px 22px' }} onClick={()=>setPage('concierge')}>Learn more →</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ background:G.bg, borderTop:`1px solid ${G.border}`, padding:'24px 0' }}>
          <div className="wrap2" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <span style={{ fontSize:12, color:G.dim }}>{t.footer}</span>
            <div style={{ display:'flex', gap:16 }}>
              {['Privacy','Terms','Contact'].map(l=><a key={l} href="#" style={{ fontSize:12, color:G.dim }}>{l}</a>)}
            </div>
          </div>
        </footer>
      </div>

      {detail && <DetailModal2 p={detail} lang={lang} t={t} onClose={()=>setDetail(null)} onContact={p=>{setDetail(null);setContact(p)}} />}
      {contact && <EnquiryModal2 target={contact} t={t} onClose={()=>setContact(null)} />}
    </div>
  )
}

// ─── DIRECTORY PAGE ───────────────────────────────────────────────────────────
function Directory2({ lang, t, profiles }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [typeF, setTypeF] = useState('all')
  const [detail, setDetail] = useState(null)
  const [contact, setContact] = useState(null)

  const results = useMemo(()=>{
    let r = profiles
    if (typeF==='company')    r=r.filter(p=>p.type==='company')
    if (typeF==='freelancer') r=r.filter(p=>p.type==='freelancer')
    if (cat) r=r.filter(p=>p.cat===cat)
    if (q.trim()) { const lq=q.toLowerCase(); r=r.filter(p=>(p.name+' '+(p.tags||[]).join(' ')+' '+p.city+' '+(p.desc?.en||'')).toLowerCase().includes(lq)) }
    return r
  },[profiles,q,cat,typeF])

  return (
    <div style={{ background:G.bg, minHeight:'100vh', paddingTop:62 }}>
      {/* Page header */}
      <div style={{ background:G.navBg, padding:'52px 0 40px' }}>
        <div className="wrap2">
          <div className="sec-label" style={{ color:'#93B4F8' }}>Business Directory</div>
          <h1 style={{ fontWeight:800, fontSize:'clamp(32px,5vw,52px)', letterSpacing:'-1px', color:'#F0EFEE', marginBottom:10 }}>Companies &amp; Freelancers</h1>
          <p style={{ color:'rgba(240,239,238,0.55)', fontSize:15 }}>Verified businesses from Kosova open to EU partnerships</p>
        </div>
      </div>

      <div className="wrap2" style={{ paddingTop:28, paddingBottom:56 }}>
        {/* Search + type filters */}
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          <input className="inp2" placeholder={t.searchPH} value={q} onChange={e=>setQ(e.target.value)}
            style={{ flex:1, minWidth:200, maxWidth:420 }} />
          <div style={{ display:'flex', gap:6, background:G.white, padding:4, borderRadius:9, border:`1px solid ${G.border}` }}>
            {[['all',t.allTypes],['company',t.onlyComp],['freelancer',t.onlyFL]].map(([v,l])=>(
              <button key={v} onClick={()=>setTypeF(v)}
                style={{ padding:'6px 14px', borderRadius:6, border:'none', fontSize:12, fontWeight:600, background:typeF===v?G.blue:'transparent', color:typeF===v?'#fff':G.muted, transition:'all 0.16s' }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Sector filters */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:24 }}>
          <button onClick={()=>setCat('')}
            style={{ padding:'5px 14px', borderRadius:20, border:`1.5px solid ${!cat?G.blue:G.border}`, background:!cat?G.blueDim:'transparent', color:!cat?G.blue:G.muted, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>
            {t.allSectors}
          </button>
          {CATS.map(c=>(
            <button key={c.id} onClick={()=>setCat(cat===c.id?'':c.id)}
              style={{ padding:'5px 12px', borderRadius:20, border:`1.5px solid ${cat===c.id?hexToRgba(c.color,0.50):hexToRgba(c.color,0.20)}`, background:cat===c.id?hexToRgba(c.color,0.10):'transparent', color:cat===c.id?c.color:G.muted, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>
              {c.icon} {c.labels[lang]||c.labels.en}
            </button>
          ))}
        </div>

        <div style={{ fontSize:12, color:G.dim, marginBottom:16 }}>{results.length} {results.length===1?'listing':'listings'} found</div>

        {results.length > 0 ? (
          <div className="grid-3">
            {results.map(p=><Card2 key={p.id} p={p} lang={lang} t={t} onContact={setContact} onView={setDetail} />)}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'64px 0', color:G.muted }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontWeight:700, fontSize:20, marginBottom:6, color:G.text }}>{t.noResults}</div>
            <div style={{ fontSize:14 }}>{t.noResultsSub}</div>
          </div>
        )}
      </div>
      {detail && <DetailModal2 p={detail} lang={lang} t={t} onClose={()=>setDetail(null)} onContact={p=>{setDetail(null);setContact(p)}} />}
      {contact && <EnquiryModal2 target={contact} t={t} onClose={()=>setContact(null)} />}
    </div>
  )
}

// ─── CONCIERGE PAGE ───────────────────────────────────────────────────────────
function Concierge2({ lang, t, siteContent }) {
  const [bookModal, setBookModal] = useState(false)
  const [form, setForm] = useState({ name:'', company:'', email:'', goal:'', timeframe:'', pax:'1' })
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  const P = siteContent?.partners||{}

  const submit = async () => {
    if (!form.name||!form.email) return
    setBusy(true)
    try { await insertBooking({ name:form.name, company:form.company||null, email:form.email, goal:form.goal||null, timeframe:form.timeframe||null, pax:parseInt(form.pax)||1 }); await sendBookingConfirmation({ name:form.name, email:form.email }); setDone(true) } catch{}
    setBusy(false)
  }

  return (
    <div style={{ background:G.bg, minHeight:'100vh', paddingTop:62 }}>
      {/* Hero */}
      <div style={{ background:G.navBg, padding:'56px 0 48px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, width:400, height:400, background:'radial-gradient(circle at 80% 30%, rgba(36,88,212,0.20) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div className="wrap2" style={{ position:'relative', zIndex:1 }}>
          <div className="sec-label" style={{ color:'#93B4F8' }}>Exclusive Service</div>
          <h1 style={{ fontWeight:800, fontSize:'clamp(36px,5.5vw,60px)', letterSpacing:'-1px', color:'#F0EFEE', marginBottom:14 }}>{t.concTitle}</h1>
          <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'rgba(240,239,238,0.58)', maxWidth:540, lineHeight:1.72, marginBottom:28 }}>{t.concSub}</p>
          <button className="btn-white2" style={{ padding:'12px 26px' }} onClick={()=>setBookModal(true)}>{t.concCta}</button>
        </div>
      </div>

      <div className="wrap2" style={{ paddingTop:48, paddingBottom:56 }}>
        {/* How it works */}
        <div className="sec-label">Process</div>
        <h2 style={{ fontWeight:700, fontSize:26, marginBottom:24, letterSpacing:'-0.3px' }}>How It Works</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:56 }}>
          {[
            { n:'01', ic:'📋', t:'Share your needs', d:'Fill in the short form — takes 2 minutes.' },
            { n:'02', ic:'🎯', t:'We match you', d:'Our partner identifies the best Kosova contacts.' },
            { n:'03', ic:'📅', t:'Visit is planned', d:'Meetings, site tours and government appointments arranged.' },
            { n:'04', ic:'✈️', t:'You arrive', d:'Full schedule prepared and confirmed in advance.' },
            { n:'05', ic:'📄', t:'Follow-up support', d:'Contracts, introductions and next steps.' },
          ].map(step=>(
            <div key={step.n} className="c2" style={{ padding:'20px' }}>
              <div style={{ fontSize:11, fontWeight:700, color:G.blue, letterSpacing:'1px', marginBottom:10 }}>{step.n}</div>
              <div style={{ fontSize:20, marginBottom:8 }}>{step.ic}</div>
              <div style={{ fontWeight:600, fontSize:14, marginBottom:5 }}>{step.t}</div>
              <div style={{ fontSize:12, color:G.muted, lineHeight:1.6 }}>{step.d}</div>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="sec-label">Partners</div>
        <h2 style={{ fontWeight:700, fontSize:26, marginBottom:24, letterSpacing:'-0.3px' }}>Our General Partners</h2>
        <div className="grid-2">
          {/* rootsGTM */}
          <div className="c2">
            <div style={{ height:5, background:`linear-gradient(90deg,${G.blue},${G.violet})`, borderRadius:'14px 14px 0 0' }} />
            {P.rootsgtm_cover && <div style={{ height:80, overflow:'hidden' }}><img src={P.rootsgtm_cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:P.rootsgtm_cover_focus||'50% 50%' }} /></div>}
            <div style={{ padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                {P.rootsgtm_logo ? <img src={P.rootsgtm_logo} alt="" style={{ width:44, height:44, borderRadius:10, objectFit:'cover', border:`1.5px solid ${G.border}` }} /> : <div style={{ width:44, height:44, borderRadius:10, background:G.blueDim, border:`1.5px solid ${G.blueBd}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🚀</div>}
                <div>
                  <div style={{ fontWeight:700, fontSize:17 }}>{P.rootsgtm_name||'rootsGTM'}</div>
                  <div style={{ fontSize:11, color:G.dim }}>General Partner</div>
                </div>
                <span className="pill2" style={{ marginLeft:'auto', background:hexToRgba(G.green,0.10), color:G.green, border:`1px solid ${hexToRgba(G.green,0.22)}` }}>✓ Active</span>
              </div>
              <p style={{ fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:16 }}>{P.rootsgtm_desc||'rootsGTM is our exclusive sales and business development network for EU–Kosova connections.'}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                {['🤝 Direct contact','📅 Meeting setup','🎤 Events','📄 Follow-up'].map(f=><div key={f} style={{ fontSize:12, color:G.muted, background:G.surface, border:`1px solid ${G.border}`, borderRadius:6, padding:'7px 10px' }}>{f}</div>)}
              </div>
              <button className="btn-primary2" style={{ width:'100%' }} onClick={()=>setBookModal(true)}>Enquire via rootsGTM →</button>
            </div>
          </div>

          {/* Government */}
          <div className="c2">
            <div style={{ height:5, background:`linear-gradient(90deg,#D97706,#F59E0B)`, borderRadius:'14px 14px 0 0' }} />
            {P.gov_cover && <div style={{ height:80, overflow:'hidden' }}><img src={P.gov_cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:P.gov_cover_focus||'50% 50%' }} /></div>}
            <div style={{ padding:'20px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                {P.gov_logo ? <img src={P.gov_logo} alt="" style={{ width:44, height:44, borderRadius:10, objectFit:'cover', border:`1.5px solid ${G.border}` }} /> : <div style={{ width:44, height:44, borderRadius:10, background:'rgba(217,119,6,0.10)', border:'1.5px solid rgba(217,119,6,0.22)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🏛️</div>}
                <div>
                  <div style={{ fontWeight:700, fontSize:17 }}>{P.gov_name||'Kosova Government'}</div>
                  <div style={{ fontSize:11, color:G.dim }}>InvestKosova · Official Partner</div>
                </div>
                <span className="pill2" style={{ marginLeft:'auto', background:'rgba(217,119,6,0.10)', color:'#B45309', border:'1px solid rgba(217,119,6,0.22)' }}>⏳ Negotiating</span>
              </div>
              <p style={{ fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:16 }}>{P.gov_desc||'Building an official partnership with InvestKosova and the Ministry of Economy for business support services.'}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                {['🏛️ InvestKosova','📋 Formation advice','🤝 Ministry meetings','📊 Investment support'].map(f=><div key={f} style={{ fontSize:12, color:G.muted, background:G.surface, border:`1px solid ${G.border}`, borderRadius:6, padding:'7px 10px' }}>{f}</div>)}
              </div>
              <button onClick={()=>setBookModal(true)} style={{ width:'100%', padding:'10px', borderRadius:8, background:'rgba(217,119,6,0.10)', border:'2px solid rgba(217,119,6,0.28)', color:'#B45309', fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.18s' }}>Request Government Meeting →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {bookModal && (
        <div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&setBookModal(false)}>
          <div className="modal2" style={{ maxWidth:480 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:22 }}>
              <div style={{ fontWeight:700, fontSize:20 }}>{t.bookTitle}</div>
              <button onClick={()=>setBookModal(false)} className="btn-ghost2">✕</button>
            </div>
            {done ? (
              <div style={{ textAlign:'center', padding:'28px 0' }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:hexToRgba(G.green,0.12), display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', fontSize:26 }}>✓</div>
                <div style={{ fontWeight:700, fontSize:20, marginBottom:6 }}>{t.bookDone}</div>
                <div style={{ color:G.muted }}>{t.bookDoneSub}</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label className="label2">{t.bookName}</label><input className="inp2" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
                  <div><label className="label2">{t.bookComp}</label><input className="inp2" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} /></div>
                </div>
                <div><label className="label2">{t.bookEmail}</label><input className="inp2" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
                <div><label className="label2">{t.bookGoal}</label><textarea className="inp2" rows={3} placeholder={t.bookGoalPH} value={form.goal} onChange={e=>setForm(f=>({...f,goal:e.target.value}))} style={{ resize:'vertical' }} /></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label className="label2">{t.bookWhen}</label><input className="inp2" placeholder="e.g. June 2025" value={form.timeframe} onChange={e=>setForm(f=>({...f,timeframe:e.target.value}))} /></div>
                  <div><label className="label2">{t.bookPax}</label><select className="inp2" value={form.pax} onChange={e=>setForm(f=>({...f,pax:e.target.value}))}>{['1','2','3','4','5','6','7','8+'].map(n=><option key={n}>{n}</option>)}</select></div>
                </div>
                <button className="btn-primary2" onClick={submit} disabled={busy} style={{ marginTop:4 }}>{busy?'Submitting…':t.bookSend}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── GOVERNMENT / INVEST PAGE ─────────────────────────────────────────────────
function Gov2({ lang, t }) {
  const links = [
    { l:'ARBK — Business Registration', u:'https://arbk.rks-gov.net' },
    { l:'InvestKosova', u:'https://investkosova.com' },
    { l:'Tax Administration (ATK)', u:'https://www.atk-ks.org' },
    { l:'Chamber of Commerce (OEK)', u:'https://www.kkk-rks.com' },
  ]
  return (
    <div style={{ background:G.bg, minHeight:'100vh', paddingTop:62 }}>
      {/* Hero */}
      <div style={{ background:G.navBg, padding:'56px 0 48px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, width:450, height:450, background:'radial-gradient(circle at 80% 20%, rgba(107,53,194,0.20) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div className="wrap2" style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px', background:'rgba(36,88,212,0.18)', border:'1px solid rgba(36,88,212,0.30)', borderRadius:20, marginBottom:18 }}>
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', color:'#93B4F8' }}>Official Information</span>
          </div>
          <h1 style={{ fontWeight:800, fontSize:'clamp(32px,5vw,56px)', letterSpacing:'-1px', color:'#F0EFEE', marginBottom:12 }}>{t.govTitle}</h1>
          <p style={{ fontSize:'clamp(14px,1.8vw,17px)', color:'rgba(240,239,238,0.55)', maxWidth:560, lineHeight:1.7 }}>{t.govSub}</p>
        </div>
      </div>

      <div className="wrap2" style={{ paddingTop:48, paddingBottom:56 }}>
        {/* Key facts */}
        <div className="sec-label">At a Glance</div>
        <h2 style={{ fontWeight:700, fontSize:26, marginBottom:24, letterSpacing:'-0.3px' }}>{t.govFactsTitle}</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10, marginBottom:52 }}>
          {t.govFacts.map(([val,label],i)=>(
            <div key={label} className="stat2" style={{ textAlign:'center', borderTop:`3px solid ${CATS[i%CATS.length].color}` }}>
              <div style={{ fontWeight:800, fontSize:28, color:G.text, letterSpacing:'-0.5px', lineHeight:1, marginBottom:5 }}>{val}</div>
              <div style={{ fontSize:11, color:G.muted, fontWeight:500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Formation steps */}
        <div className="sec-label">Step by Step</div>
        <h2 style={{ fontWeight:700, fontSize:26, marginBottom:24, letterSpacing:'-0.3px' }}>Company Formation</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))', gap:14, marginBottom:52 }}>
          {t.govSteps.map((step,i)=>(
            <div key={i} className="c2" style={{ padding:'20px', borderLeft:`3px solid ${G.blue}` }}>
              <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                <div style={{ width:42, height:42, borderRadius:10, background:G.blueDim, border:`1.5px solid ${G.blueBd}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{step.ic}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{step.t}</div>
                  <div style={{ fontSize:12, color:G.muted, lineHeight:1.55, marginBottom:8 }}>{step.d}</div>
                  <span className="pill2" style={{ background:G.blueDim, color:G.blue, border:`1px solid ${G.blueBd}`, fontSize:10 }}>⏱ {step.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Why Kosova + Links */}
        <div className="grid-2">
          <div>
            <div className="sec-label">Benefits</div>
            <h2 style={{ fontWeight:700, fontSize:26, marginBottom:24, letterSpacing:'-0.3px' }}>Why Kosova?</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {t.whyKosova.map(([ic,title,desc])=>(
                <div key={title} className="c2" style={{ padding:'16px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{ width:38, height:38, borderRadius:9, background:G.surface, border:`1px solid ${G.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{ic}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, marginBottom:3 }}>{title}</div>
                    <div style={{ fontSize:12, color:G.muted, lineHeight:1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="sec-label">Resources</div>
            <h2 style={{ fontWeight:700, fontSize:26, marginBottom:24, letterSpacing:'-0.3px' }}>{t.links}</h2>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {links.map(lk=>(
                <a key={lk.u} href={lk.u} target="_blank" rel="noopener noreferrer" className="c2"
                  style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', fontSize:14, color:G.text, fontWeight:500, transition:'all 0.18s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=G.blue;e.currentTarget.style.color=G.blue}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.color=G.text}}>
                  {lk.l} <span style={{ color:G.blue, fontSize:12 }}>→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav2({ page, setPage, lang, setLang, t, onReg }) {
  const [mob, setMob] = useState(false)
  const PAGES = [['home',t.navHome],['directory',t.navDir],['concierge',t.navConcierge],['gov',t.navGov]]
  return (
    <>
      <nav className="nav2" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="wrap2" style={{ height:62, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {/* Brand */}
          <button onClick={()=>setPage('home')} style={{ background:'transparent', border:'none', display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:0 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${G.blue} 0%,${G.violet} 100%)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:16, color:'#fff' }}>K</span>
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:'#F0EFEE', letterSpacing:'-0.3px', lineHeight:1.1 }}>Kosova Hub</div>
              <div style={{ fontSize:9, color:'rgba(240,239,238,0.38)', letterSpacing:'1px', textTransform:'uppercase' }}>B2B Gateway</div>
            </div>
          </button>

          {/* Desktop links */}
          <div className="nav-links2" style={{ display:'flex', gap:2 }}>
            {PAGES.map(([p,l])=>(
              <button key={p} onClick={()=>setPage(p)}
                style={{ background:page===p?'rgba(36,88,212,0.18)':'transparent', color:page===p?'#93B4F8':'rgba(240,239,238,0.62)', border:page===p?`1px solid rgba(36,88,212,0.30)`:'1px solid transparent', borderRadius:7, padding:'6px 12px', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all 0.16s' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Right */}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {['en','sq'].map(l=>(
              <button key={l} onClick={()=>setLang(l)}
                style={{ background:lang===l?'rgba(36,88,212,0.22)':'transparent', border:`1px solid ${lang===l?'rgba(36,88,212,0.40)':'transparent'}`, borderRadius:5, padding:'4px 8px', color:lang===l?'#93B4F8':'rgba(240,239,238,0.40)', fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}>
                {l.toUpperCase()}
              </button>
            ))}
            <button className="btn-primary2 hide-mob" style={{ padding:'7px 16px', fontSize:12 }} onClick={onReg}>{t.registerBtn}</button>
            {/* Hamburger */}
            <button className="hamburger2" onClick={()=>setMob(v=>!v)}
              style={{ display:'none', flexDirection:'column', gap:4, background:'transparent', border:'none', padding:6, cursor:'pointer' }}>
              {[0,1,2].map(i=><span key={i} style={{ display:'block', width:20, height:1.5, background:'rgba(240,239,238,0.7)', borderRadius:1 }} />)}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mob && (
        <div style={{ position:'fixed', top:62, left:0, right:0, background:G.navBg, borderBottom:'1px solid rgba(255,255,255,0.08)', zIndex:99, padding:'12px 16px 16px' }}>
          {PAGES.map(([p,l])=>(
            <button key={p} onClick={()=>{setPage(p);setMob(false)}}
              style={{ display:'block', width:'100%', textAlign:'left', background:page===p?'rgba(36,88,212,0.18)':'transparent', border:'none', borderRadius:7, padding:'12px 14px', color:page===p?'#93B4F8':'rgba(240,239,238,0.70)', fontSize:14, fontWeight:500, marginBottom:4, cursor:'pointer' }}>
              {l}
            </button>
          ))}
          <button className="btn-primary2" style={{ width:'100%', marginTop:8 }} onClick={()=>{onReg();setMob(false)}}>{t.registerBtn}</button>
        </div>
      )}
    </>
  )
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App2() {
  const [lang, setLang]           = useState('en')
  const [page, setPage]           = useState('home')
  const [profiles, setProfiles]   = useState([])
  const [siteContent, setSC]      = useState({})
  const [showReg, setShowReg]     = useState(false)
  const t = T[lang]||T.en

  useEffect(()=>{
    fetchProfiles().then(rows=>{ if(rows) setProfiles(rows.map(normalise).filter(p=>p.status==='active'||p.verified)) }).catch(()=>{})
    fetchSiteContent().then(d=>{ if(d) setSC(d) }).catch(()=>{})
  },[])

  return (
    <div style={{ background:G.bg, minHeight:'100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Nav2 page={page} setPage={setPage} lang={lang} setLang={setLang} t={t} onReg={()=>setShowReg(true)} />
      {page==='home'      && <Home2 lang={lang} t={t} profiles={profiles} setPage={setPage} onReg={()=>setShowReg(true)} />}
      {page==='directory' && <Directory2 lang={lang} t={t} profiles={profiles} />}
      {page==='concierge' && <Concierge2 lang={lang} t={t} siteContent={siteContent} />}
      {page==='gov'       && <Gov2 lang={lang} t={t} />}
      {showReg && <RegModal2 t={t} lang={lang} onClose={()=>setShowReg(false)} />}
    </div>
  )
}
