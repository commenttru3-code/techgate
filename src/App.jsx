// Kosova Hub — Design v2 — B2B Editorial Theme
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  fetchProfiles, insertProfile, updateProfile, deleteProfile, verifyProfile,
  insertContactLead, insertBooking,
  formToDb, fetchSiteContent, saveSiteContent,
  fetchSettings, upsertSetting,
} from './supabase.js'
import { notifyAdminNewProfile, sendEnquiry, sendBookingConfirmation } from './emailService.js'

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const G = {
  bg:        '#0f1117',
  surface:   '#171a22',
  card:      '#1c2030',
  border:    'rgba(200,160,80,0.12)',
  amber:     '#C8954A',
  amberDim:  'rgba(200,149,74,0.10)',
  amberBd:   'rgba(200,149,74,0.28)',
  slate:     '#4A7FA5',
  slateDim:  'rgba(74,127,165,0.10)',
  slateBd:   'rgba(74,127,165,0.28)',
  text:      '#E2DDD6',
  muted:     'rgba(226,221,214,0.46)',
  dim:       'rgba(226,221,214,0.26)',
  green:     '#4B9E6B',
  red:       '#C44040',
  rule:      'rgba(200,160,80,0.16)',
  amber2:    '#E8C882',
}

// ─── SECTORS ─────────────────────────────────────────────────────────────────
const CATS = [
  { id:'software',   icon:'💻', color:'#4a7fa5', labels:{en:'Software & IT',    sq:'Softuer & IT'}},
  { id:'support',    icon:'🛠️', color:'#6b7fa8', labels:{en:'Tech Support',     sq:'Mbështetje Tech'}},
  { id:'consulting', icon:'📊', color:'#5a8a6e', labels:{en:'Consulting',        sq:'Konsulencë'}},
  { id:'media',      icon:'🎬', color:'#7a6aaa', labels:{en:'Media & Content',   sq:'Media & Content'}},
  { id:'production', icon:'🏭', color:'#8a7055', labels:{en:'Production',        sq:'Prodhim'}},
  { id:'textile',    icon:'🧵', color:'#9a7878', labels:{en:'Textile & Fashion', sq:'Tekstil & Modë'}},
  { id:'bpo',        icon:'📞', color:'#5c7a8a', labels:{en:'BPO / Call Centre', sq:'BPO / Call Center'}},
  { id:'design',     icon:'🎨', color:'#8a7a4a', labels:{en:'Design & Creative', sq:'Dizajn & Kreativ'}},
  { id:'logistics',  icon:'🚚', color:'#4a7a6e', labels:{en:'Logistics',         sq:'Logjistikë'}},
  { id:'legal',      icon:'⚖️', color:'#7a5a5a', labels:{en:'Legal & Finance',   sq:'Ligjor & Financa'}},
]

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    tagline:'Business Gateway to Kosova',
    navHome:'Home', navDir:'Companies', navConcierge:'Concierge', navGov:'Invest',
    registerBtn:'List Your Company',
    h1:'Your Business Gateway', h2:'to Kosova',
    heroSub:'Connect with verified companies, freelancers and consultants from Kosova for your next outsourcing or partnership.',
    statComp:'Companies', statFL:'Freelancers', statPart:'Partners', statTax:'Corp. Tax',
    sectionFeatured:'Featured Listings', sectionSectors:'Sectors', sectionPartners:'Partners',
    viewAll:'View all', listFree:'List for free →',
    searchPH:'Search companies, skills, cities…',
    allSectors:'All Sectors', allTypes:'All', onlyComp:'Companies', onlyFL:'Freelancers',
    verified:'Verified', sponsored:'Featured', contact:'Contact', viewProfile:'View profile',
    noResults:'No results found', noResultsSub:'Try different search terms or filters',
    concHeroTitle:'Kosova Concierge',
    concHeroSub:'Our partners organise your complete business visit — meetings, site tours, government appointments.',
    concReq:'Request a Visit', concPartners:'Our Partners',
    bookTitle:'Request a Kosova Visit', bookName:'Your name *', bookComp:'Company',
    bookEmail:'Email *', bookGoal:'Your goal', bookGoalPH:'e.g. Meet software teams, find suppliers…',
    bookWhen:'Preferred dates', bookPax:'Participants', bookSend:'Submit Request',
    bookDoneTitle:'Request Submitted!', bookDoneSub:'Our team will reply within 24 hours.',
    govH1:'Invest & Incorporate', govH2:'in Kosova',
    govSub:'Low corporate tax, Euro currency, EU accession perspective and a young educated workforce.',
    govFactsTitle:'Kosova at a Glance',
    govFacts:[['10%','Corporate Tax'],['18%','VAT'],['€1','Min. Capital'],['5–10 days','Formation'],['EUR','Currency'],['1.8M','Population'],['63%','Under 35'],['2008','Independence']],
    govSteps:[
      {ic:'🖥️',t:'Online Registration',d:'Full registration via ARBK portal.',time:'1–3 days'},
      {ic:'💶',t:'Share Capital',d:'Minimum capital of just €1.',time:'1 day'},
      {ic:'📋',t:'Tax Number',d:'Automatically assigned upon registration.',time:'1–2 days'},
      {ic:'🏦',t:'Bank Account',d:'10 licensed banks available.',time:'2–5 days'},
    ],
    govLinks:'Official Resources',
    regTitle:'List Your Business', regComp:'🏢 Company', regCompS:'Company, Team, Agency',
    regFL:'👤 Freelancer', regFLS:'Self-employed, Solo',
    regSP:'🤝 Partner', regSPS:'Network, Institution',
    regFree:'Free · Published within 24–48h',
    regName:'Company / Name *', regCity:'City *', regEmail:'Email *',
    regDesc:'Description', regDescPH:'Describe your services and expertise…',
    regTags:'Skills / Tags', regTagsPH:'React, Node.js, Manufacturing…',
    regSend:'Submit →', regDoneTitle:'Submitted!', regDoneSub:'We\'ll review and publish within 24–48 hours.',
    reqTitle:'Enquiry to', reqName:'Your name *', reqEmail:'Your email *',
    reqMsg:'Message', reqPH:'Hello, we are looking for…',
    reqSend:'Send Enquiry', reqCancel:'Cancel',
    reqDoneTitle:'Sent!', reqDoneSub:'will be in touch shortly.',
    footer:'© 2025 Kosova Hub · Business Bridge Platform',
  },
  sq: {
    tagline:'Porta Juaj e Biznesit në Kosovë',
    navHome:'Kryefaqja', navDir:'Kompanitë', navConcierge:'Concierge', navGov:'Invest',
    registerBtn:'Regjistro Kompaninë',
    h1:'Porta Juaj e Biznesit', h2:'në Kosovë',
    heroSub:'Lidhuni me kompani, freelancerë dhe konsulentë të verifikuar nga Kosova për projektin tuaj.',
    statComp:'Kompani', statFL:'Freelancerë', statPart:'Partnerë', statTax:'Tatim Korp.',
    sectionFeatured:'Listimemet e Theksuara', sectionSectors:'Sektorët', sectionPartners:'Partnerët',
    viewAll:'Shiko të gjitha', listFree:'Regjistrohu falas →',
    searchPH:'Kërko kompani, aftësi, qytete…',
    allSectors:'Të gjitha', allTypes:'Të gjitha', onlyComp:'Kompani', onlyFL:'Freelancerë',
    verified:'Verifikuar', sponsored:'E Theksuar', contact:'Kontakto', viewProfile:'Shiko profilin',
    noResults:'Asnjë rezultat', noResultsSub:'Provo terma të tjerë',
    concHeroTitle:'Concierge Kosovës',
    concHeroSub:'Partnerët tanë organizojnë vizitën tuaj të plotë — takime, turne, takime qeveritare.',
    concReq:'Kërko Vizitë', concPartners:'Partnerët Tanë',
    bookTitle:'Kërko Vizitë', bookName:'Emri juaj *', bookComp:'Kompania',
    bookEmail:'Email *', bookGoal:'Qëllimi', bookGoalPH:'p.sh. Takim me ekipe software…',
    bookWhen:'Data preferenciale', bookPax:'Pjesëmarrës', bookSend:'Dërgo Kërkesën',
    bookDoneTitle:'Kërkesa u dërgua!', bookDoneSub:'Ekipi ynë do t\'ju kontaktojë brenda 24 orësh.',
    govH1:'Investoni &', govH2:'Themeloni në Kosovë',
    govSub:'Taksa të ulëta, Euro, perspektivë BE dhe talent i ri i arsimuar.',
    govFactsTitle:'Kosova — Të Dhënat',
    govFacts:[['10%','Tatim'],['18%','TVSH'],['1€','Kapitali'],['5–10 ditë','Themelimi'],['EUR','Valuta'],['1.8M','Banorë'],['63%','Nën 35'],['2008','Pavarësia']],
    govSteps:[
      {ic:'🖥️',t:'Regjistrim Online',d:'Regjistrim i plotë në ARBK.',time:'1–3 ditë'},
      {ic:'💶',t:'Kapitali',d:'Kapital minimal prej 1€.',time:'1 ditë'},
      {ic:'📋',t:'Numri Fiskal',d:'Caktohet automatikisht.',time:'1–2 ditë'},
      {ic:'🏦',t:'Llogari Bankare',d:'10 banka të licencuara.',time:'2–5 ditë'},
    ],
    govLinks:'Burime Zyrtare',
    regTitle:'Listo Biznesin Tënd', regComp:'🏢 Kompani', regCompS:'Firmë, Ekip, Agjenci',
    regFL:'👤 Freelancer', regFLS:'I vetëpunësuar',
    regSP:'🤝 Partner', regSPS:'Rrjet, Institucion',
    regFree:'Falas · Publikohet brenda 24–48h',
    regName:'Kompania / Emri *', regCity:'Qyteti *', regEmail:'Email *',
    regDesc:'Përshkrim', regDescPH:'Përshkruani shërbimet tuaja…',
    regTags:'Aftësi / Tags', regTagsPH:'React, Node.js…',
    regSend:'Dërgo →', regDoneTitle:'U dërgua!', regDoneSub:'Do ta rishikojmë dhe publikojmë brenda 24–48 orësh.',
    reqTitle:'Kërkesë për', reqName:'Emri juaj *', reqEmail:'Email juaj *',
    reqMsg:'Mesazhi', reqPH:'Mirëdita, ne kërkojmë…',
    reqSend:'Dërgo Kërkesën', reqCancel:'Anulo',
    reqDoneTitle:'U dërgua!', reqDoneSub:'do t\'ju kontaktojë.',
    footer:'© 2025 Kosova Hub · Business Bridge Platform',
  },
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────
function hexToRgba(hex, a) {
  try { const h=hex.replace('#',''); const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16); return `rgba(${r},${g},${b},${a})` } catch { return `rgba(74,127,165,${a})` }
}
function catLabel(id, lang) { return CATS.find(c=>c.id===id)?.labels[lang]||id }
function catColor(id) { return CATS.find(c=>c.id===id)?.color||G.amber }
function catIcon(id) { return CATS.find(c=>c.id===id)?.icon||'🏢' }
function normaliseProfile(p) {
  if (!p) return p
  return { ...p,
    prevCompanies: p.prevCompanies||p.prev_companies||null,
    featuredProject: p.featuredProject||p.featured_project||null,
    linkedin: p.linkedin||null, github: p.github||null,
    certifications: p.certifications||null, availability: p.availability||null,
    videoUrl: p.videoUrl||p.video_url||null,
    coverImage: p.coverImage||p.cover_image||null,
    coverFocus: p.coverFocus||p.cover_focus||'50% 50%',
    logoColor: p.logoColor||p.logo_color||catColor(p.cat)||G.amber,
    logoUrl: p.logoUrl||p.logo_url||null,
  }
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{background:${G.bg};color:${G.text};font-family:'Inter',sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;max-width:100vw;}
button{cursor:pointer;font-family:'Inter',sans-serif;}
a{color:inherit;text-decoration:none;}
input,textarea,select{font-family:'Inter',sans-serif;}

/* ── LAYOUT ── */
.wrap{max-width:1240px;margin:0 auto;padding:0 24px;}
.section{padding:64px 0;}
.section-sm{padding:40px 0;}

/* ── RULE HEADER ── */
.rule-header{display:flex;align-items:center;gap:16px;margin-bottom:32px;}
.rule-header h2{font-family:'EB Garamond',serif;font-size:28px;font-weight:600;color:${G.text};white-space:nowrap;letter-spacing:-0.3px;}
.rule-header::after{content:'';flex:1;height:1px;background:${G.rule};}

/* ── CARD ── */
.card2{background:${G.card};border:1px solid ${G.border};border-radius:10px;transition:all 0.22s;position:relative;overflow:hidden;}
.card2:hover{border-color:${G.amberBd};box-shadow:0 8px 32px rgba(0,0,0,0.28);}
.card2.sp{border-color:${G.amberBd};}

/* ── BUTTONS ── */
.btn-amber{background:${G.amber};color:#0f1117;border:none;padding:10px 22px;border-radius:6px;font-weight:600;font-size:13px;letter-spacing:0.3px;transition:all 0.18s;}
.btn-amber:hover{background:${G.amber2};transform:translateY(-1px);}
.btn-outline{background:transparent;color:${G.amber};border:1.5px solid ${G.amberBd};padding:9px 20px;border-radius:6px;font-weight:600;font-size:13px;transition:all 0.18s;}
.btn-outline:hover{background:${G.amberDim};border-color:${G.amber};}
.btn-ghost{background:transparent;color:${G.muted};border:1px solid rgba(226,221,214,0.12);padding:8px 16px;border-radius:6px;font-size:12px;transition:all 0.18s;}
.btn-ghost:hover{color:${G.text};border-color:rgba(226,221,214,0.28);}
.btn-slate{background:${G.slate};color:white;border:none;padding:10px 22px;border-radius:6px;font-weight:600;font-size:13px;transition:all 0.18s;}
.btn-slate:hover{background:#5a8fba;transform:translateY(-1px);}

/* ── FORM ── */
.inp2{background:rgba(255,255,255,0.04);border:1px solid rgba(226,221,214,0.12);border-radius:6px;padding:10px 14px;color:${G.text};width:100%;font-size:14px;outline:none;transition:border 0.18s;}
.inp2:focus{border-color:${G.amberBd};}
.inp2::placeholder{color:${G.dim};}
.label2{display:block;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${G.dim};margin-bottom:6px;}

/* ── NAV ── */
.nav2{position:fixed;top:0;left:0;right:0;z-index:100;height:60px;background:rgba(15,17,23,0.92);border-bottom:1px solid ${G.border};backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);}
.navlink2{background:transparent;border:none;color:${G.muted};font-size:12px;font-weight:500;letter-spacing:0.5px;padding:6px 12px;border-radius:5px;transition:all 0.16s;}
.navlink2:hover{color:${G.text};}
.navlink2.on{color:${G.amber};}

/* ── BADGE ── */
.badge{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;letter-spacing:0.4px;}
.badge-amber{background:${G.amberDim};color:${G.amber};border:1px solid ${G.amberBd};}
.badge-slate{background:${G.slateDim};color:${G.slate};border:1px solid ${G.slateBd};}
.badge-green{background:rgba(75,158,107,0.10);color:${G.green};border:1px solid rgba(75,158,107,0.25);}
.badge-dim{background:rgba(226,221,214,0.06);color:${G.muted};border:1px solid rgba(226,221,214,0.12);}

/* ── TAG CHIP ── */
.chip{display:inline-block;padding:3px 8px;background:rgba(226,221,214,0.06);border:1px solid rgba(226,221,214,0.10);border-radius:4px;font-size:11px;color:${G.muted};transition:all 0.14s;}
.chip:hover{color:${G.text};border-color:rgba(226,221,214,0.22);}

/* ── MODAL ── */
.modal-bg2{position:fixed;inset:0;background:rgba(5,8,15,0.80);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(8px);}
.modal2{background:${G.surface};border:1px solid ${G.border};border-radius:12px;padding:28px 26px;max-width:520px;width:100%;max-height:92vh;overflow-y:auto;}

/* ── SECTOR DOT ── */
.sector-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}

/* ── SCORE BAR ── */
.score-track{width:100%;height:5px;background:rgba(226,221,214,0.08);border-radius:3px;overflow:hidden;}
.score-fill{height:100%;border-radius:3px;transition:width 0.7s cubic-bezier(0.4,0,0.2,1);}

/* ── VIDEO HERO ── */
.hero-video{position:fixed;inset:0;z-index:0;overflow:hidden;}
.hero-video video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;-webkit-transform:translateZ(0);transform:translateZ(0);}

/* ── SCROLL BAR ── */
::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:rgba(200,149,74,0.25);border-radius:3px;}

/* ── MOBILE ── */
@media(max-width:768px){
  .wrap{padding:0 16px;}
  .section{padding:40px 0;}
  .rule-header h2{font-size:22px;}
  .hide-mobile{display:none !important;}
  .navlinks-desktop{display:none !important;}
  .hamburger2{display:flex !important;}
  nav2-reg{display:none !important;}
}
@media(max-width:480px){
  .wrap{padding:0 12px;}
  .grid-3{grid-template-columns:1fr !important;}
  .grid-2{grid-template-columns:1fr !important;}
}
`

// ─── VIDEO BACKGROUND ─────────────────────────────────────────────────────────
function VideoBg({ src }) {
  const ref = React.useRef(null)
  useEffect(() => {
    const v = ref.current; if (!v) return
    v.muted = true
    const play = () => { v.muted = true; v.play().catch(()=>{}) }
    play()
    document.addEventListener('touchstart', play, { once:true })
    document.addEventListener('click', play, { once:true })
    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) play() })
  }, [src])
  return (
    <div className="hero-video">
      <video ref={ref} autoPlay loop muted playsInline preload="auto">
        <source src={src} type="video/mp4" />
      </video>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(10,13,20,0.78) 0%,rgba(10,13,20,0.55) 50%,rgba(10,13,20,0.78) 100%)' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'50%', background:'linear-gradient(0deg,rgba(10,13,20,0.98) 0%,transparent 100%)' }} />
    </div>
  )
}

// ─── LOGO COMPONENT ───────────────────────────────────────────────────────────
function Logo2({ text, color='#4a7fa5', url=null, size=44 }) {
  const bg = hexToRgba(color, 0.15)
  const br = Math.round(size * 0.25)
  if (url) return <div style={{ width:size, height:size, borderRadius:br, overflow:'hidden', flexShrink:0, background:bg }}><img src={url} alt={text} style={{ width:'100%', height:'100%', objectFit:'cover' }} /></div>
  return (
    <div style={{ width:size, height:size, borderRadius:br, background:bg, border:`1.5px solid ${hexToRgba(color,0.30)}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <span style={{ fontFamily:"'EB Garamond',serif", fontWeight:700, fontSize:size*0.38, color, lineHeight:1 }}>{(text||'?').slice(0,2)}</span>
    </div>
  )
}

// ─── SECTION RULE HEADER ─────────────────────────────────────────────────────
function RuleHeader({ title, right }) {
  return (
    <div className="rule-header">
      <h2>{title}</h2>
      <div style={{ flex:1, height:1, background:G.rule }} />
      {right && <div style={{ flexShrink:0 }}>{right}</div>}
    </div>
  )
}

// ─── PROFILE CARD — B2B Editorial Style ──────────────────────────────────────
function ProfileCard2({ p, lang, t, onContact, onView, matchScore }) {
  const [hov, setHov] = useState(false)
  const isSp = p.tier === 'sponsored'
  const isFL = p.type === 'freelancer'
  const sc = catColor(p.cat)
  const desc = (p.desc?.[lang] || p.desc?.en || '').slice(0, 120)

  return (
    <div className={`card2${isSp ? ' sp' : ''}`}
      style={{ borderLeft: `3px solid ${sc}`, cursor:'pointer',
        boxShadow: hov ? `0 8px 32px rgba(0,0,0,0.30), 0 0 0 1px ${hexToRgba(sc,0.20)}` : 'none',
        transition:'all 0.22s' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onView?.(p)}>

      {/* Cover image — slim top band */}
      {p.coverImage && (
        <div style={{ position:'relative', height:56, overflow:'hidden', margin:'0 -1px', marginTop:'-1px' }}>
          <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: p.coverFocus||'50% 50%' }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(28,32,48,1) 0%,rgba(28,32,48,0.3) 60%,rgba(28,32,48,0) 100%)' }} />
        </div>
      )}

      <div style={{ padding:'16px 18px 18px' }}>
        {/* Header row */}
        <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginBottom:10 }}>
          <Logo2 text={p.logo||p.name} color={sc} url={p.logoUrl} size={42} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3, flexWrap:'wrap' }}>
              <span style={{ fontFamily:"'EB Garamond',serif", fontWeight:600, fontSize:17, color:G.text, letterSpacing:'-0.2px', lineHeight:1.2 }}>{p.name}</span>
              {isSp && <span className="badge badge-amber">Featured</span>}
              {p.verified && <span className="badge badge-green">✓</span>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <div className="sector-dot" style={{ background:sc }} />
                <span style={{ fontSize:11, color:G.muted }}>{catLabel(p.cat, lang)}</span>
              </div>
              {p.city && <span style={{ fontSize:11, color:G.dim }}>· {p.city}</span>}
              {isFL && p.languages && <span style={{ fontSize:11, color:G.dim }}>· {p.languages}</span>}
            </div>
          </div>
        </div>

        {/* Description */}
        {desc && (
          <p style={{ fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:12 }}>{desc}{(p.desc?.[lang]||p.desc?.en||'').length>120?'…':''}</p>
        )}

        {/* Tags */}
        {p.tags?.length > 0 && (
          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:14 }}>
            {p.tags.slice(0,5).map(tag=>(
              <span key={tag} className="chip" style={{ borderColor:hexToRgba(sc,0.18), color:hexToRgba(sc,0.8) }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, borderTop:`1px solid ${G.border}`, paddingTop:12 }}>
          <div style={{ display:'flex', gap:6 }}>
            {p.employees && <span className="badge badge-dim">👥 {p.employees}</span>}
            {isFL && p.availability && <span className="badge badge-green">Available</span>}
          </div>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {matchScore !== undefined && matchScore !== null && (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div className="score-track" style={{ width:52 }}>
                  <div className="score-fill" style={{ width:`${matchScore}%`, background: matchScore>=80?G.green:matchScore>=50?G.amber:G.muted }} />
                </div>
                <span style={{ fontSize:11, color:matchScore>=80?G.green:matchScore>=50?G.amber:G.muted, fontWeight:600 }}>{matchScore}%</span>
              </div>
            )}
            <button className="btn-ghost" style={{ fontSize:11, padding:'5px 12px' }}
              onClick={e=>{e.stopPropagation();onContact?.(p)}}>{t.contact}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ENQUIRY MODAL ────────────────────────────────────────────────────────────
function EnquiryModal({ target, t, onClose }) {
  const [form, setForm] = useState({ name:'', email:'', msg:'' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  const send = async () => {
    if (!form.name||!form.email) return
    setSending(true)
    try {
      await insertContactLead({ profile_id:target.id, name:form.name, email:form.email, message:form.msg })
      await sendEnquiry({ toName:target.name, toEmail:target.contact||target.email, fromName:form.name, fromEmail:form.email, message:form.msg })
      setSent(true)
    } catch {}
    setSending(false)
  }

  return (
    <div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal2">
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:"'EB Garamond',serif", fontSize:22, fontWeight:600, marginBottom:4 }}>{t.reqTitle} {target.name}</div>
            <div style={{ fontSize:12, color:G.muted }}>{catLabel(target.cat,'en')} · {target.city}</div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding:'6px 10px', alignSelf:'flex-start' }}>✕</button>
        </div>
        {sent ? (
          <div style={{ textAlign:'center', padding:'32px 0' }}>
            <div style={{ fontSize:36, marginBottom:12 }}>✓</div>
            <div style={{ fontFamily:"'EB Garamond',serif", fontSize:22, fontWeight:600, marginBottom:8 }}>{t.reqDoneTitle}</div>
            <div style={{ color:G.muted, fontSize:14 }}>{target.name} {t.reqDoneSub}</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div><label className="label2">{t.reqName}</label><input className="inp2" value={form.name} onChange={e=>f('name',e.target.value)} /></div>
            <div><label className="label2">{t.reqEmail}</label><input className="inp2" type="email" value={form.email} onChange={e=>f('email',e.target.value)} /></div>
            <div><label className="label2">{t.reqMsg}</label><textarea className="inp2" rows={4} placeholder={t.reqPH} value={form.msg} onChange={e=>f('msg',e.target.value)} style={{ resize:'vertical' }} /></div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button className="btn-ghost" onClick={onClose}>{t.reqCancel}</button>
              <button className="btn-amber" onClick={send} disabled={sending}>{sending?'Sending…':t.reqSend}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── REGISTRATION MODAL ───────────────────────────────────────────────────────
function RegModal({ t, lang, onClose }) {
  const [step, setStep] = useState(0) // 0=type, 1=form
  const [type, setType] = useState(null)
  const [form, setForm] = useState({ name:'', city:'', email:'', website:'', phone:'', desc:'', tags:'', cat:'software', logoColor:'#4a7fa5', eu_langs:'' })
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)
  const f = (k,v) => setForm(p=>({...p,[k]:v}))

  const submit = async () => {
    if (!form.name||!form.city||!form.email) return
    setSaving(true)
    try {
      const data = {
        name: form.name, city: form.city, email: form.email,
        website: form.website||null, phone: form.phone||null,
        description: form.desc, tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean),
        category: form.cat, type: type, tier: 'free', status: 'pending',
        logo_color: form.logoColor, eu_langs: form.eu_langs||null,
      }
      await insertProfile(data)
      await notifyAdminNewProfile({ name:form.name, email:form.email, type, cat:form.cat, city:form.city })
      setDone(true)
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  if (done) return (
    <div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal2" style={{ textAlign:'center', padding:'48px 32px' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✓</div>
        <div style={{ fontFamily:"'EB Garamond',serif", fontSize:28, fontWeight:600, marginBottom:8 }}>{t.regDoneTitle}</div>
        <div style={{ color:G.muted, marginBottom:24 }}>{t.regDoneSub}</div>
        <button className="btn-amber" onClick={onClose}>Close</button>
      </div>
    </div>
  )

  return (
    <div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal2">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
          <div style={{ fontFamily:"'EB Garamond',serif", fontSize:24, fontWeight:600 }}>
            {step===0 ? t.regTitle : `${t.regName.split(' *')[0]} details`}
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding:'6px 10px' }}>✕</button>
        </div>

        {step===0 ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[['company',t.regComp,t.regCompS],['freelancer',t.regFL,t.regFLS],['partner',t.regSP,t.regSPS]].map(([id,label,sub])=>(
              <button key={id} onClick={()=>{setType(id);setStep(1)}}
                style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background: G.card, border:`1px solid ${G.border}`, borderRadius:8, padding:'16px 18px', textAlign:'left', color:G.text, transition:'all 0.18s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=G.amberBd}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border}}>
                <div>
                  <div style={{ fontWeight:600, marginBottom:2 }}>{label}</div>
                  <div style={{ fontSize:12, color:G.muted }}>{sub}</div>
                </div>
                <span style={{ color:G.amber, fontSize:18 }}>→</span>
              </button>
            ))}
            <div style={{ fontSize:12, color:G.dim, textAlign:'center', marginTop:8 }}>{t.regFree}</div>
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
                {CATS.map(c=><option key={c.id} value={c.id}>{c.labels[lang]}</option>)}
              </select>
            </div>
            <div><label className="label2">{t.regDesc}</label><textarea className="inp2" rows={3} placeholder={t.regDescPH} value={form.desc} onChange={e=>f('desc',e.target.value)} style={{ resize:'vertical' }} /></div>
            <div><label className="label2">{t.regTags}</label><input className="inp2" placeholder={t.regTagsPH} value={form.tags} onChange={e=>f('tags',e.target.value)} /></div>
            <div style={{ display:'flex', gap:8, justifyContent:'space-between', alignItems:'center', marginTop:4 }}>
              <button className="btn-ghost" onClick={()=>setStep(0)}>← Back</button>
              <button className="btn-amber" onClick={submit} disabled={saving}>{saving?'Submitting…':t.regSend}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PROFILE DETAIL MODAL ─────────────────────────────────────────────────────
function ProfileModal({ p, lang, t, onClose, onContact }) {
  if (!p) return null
  const sc = catColor(p.cat)
  const isSp = p.tier === 'sponsored'
  const isFL = p.type === 'freelancer'
  return (
    <div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal2" style={{ maxWidth:600, padding:0 }}>
        {/* Header */}
        <div style={{ padding:'24px 24px 0', borderBottom:`1px solid ${G.border}`, paddingBottom:20, borderLeft:`4px solid ${sc}`, borderRadius:'11px 11px 0 0' }}>
          {p.coverImage && (
            <div style={{ position:'relative', height:80, overflow:'hidden', margin:'-24px -24px 16px', borderRadius:'11px 11px 0 0' }}>
              <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:p.coverFocus||'50% 50%' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(23,26,34,1) 0%,rgba(23,26,34,0) 60%)' }} />
            </div>
          )}
          <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
            <Logo2 text={p.logo||p.name} color={sc} url={p.logoUrl} size={52} />
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:4 }}>
                <span style={{ fontFamily:"'EB Garamond',serif", fontSize:22, fontWeight:600 }}>{p.name}</span>
                {isSp && <span className="badge badge-amber">Featured</span>}
                {p.verified && <span className="badge badge-green">✓ Verified</span>}
              </div>
              <div style={{ fontSize:12, color:G.muted, display:'flex', gap:10, flexWrap:'wrap' }}>
                <span><span className="sector-dot" style={{ background:sc, display:'inline-block', marginRight:4 }} />{catLabel(p.cat,lang)}</span>
                {p.city && <span>📍 {p.city}</span>}
                {p.employees && <span>👥 {p.employees}</span>}
                {isFL && p.languages && <span>🗣 {p.languages}</span>}
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost" style={{ padding:'6px 10px', flexShrink:0 }}>✕</button>
          </div>
        </div>
        {/* Body */}
        <div style={{ padding:'20px 24px', maxHeight:'60vh', overflowY:'auto' }}>
          {(p.desc?.[lang]||p.desc?.en) && (
            <div style={{ marginBottom:18 }}>
              <div className="label2" style={{ marginBottom:8 }}>About</div>
              <p style={{ color:G.muted, lineHeight:1.7, fontSize:14 }}>{p.desc?.[lang]||p.desc?.en}</p>
            </div>
          )}
          {p.tags?.length > 0 && (
            <div style={{ marginBottom:18 }}>
              <div className="label2" style={{ marginBottom:8 }}>Skills & Services</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {p.tags.map(tag=><span key={tag} className="chip">{tag}</span>)}
              </div>
            </div>
          )}
          {p.prevCompanies && (
            <div style={{ marginBottom:18 }}>
              <div className="label2" style={{ marginBottom:8 }}>Previous Clients</div>
              <div style={{ color:G.muted, fontSize:13 }}>{p.prevCompanies}</div>
            </div>
          )}
          {p.website && (
            <div style={{ marginBottom:18 }}>
              <div className="label2" style={{ marginBottom:8 }}>Website</div>
              <a href={`https://${p.website.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" style={{ color:G.amber, fontSize:14 }}>{p.website}</a>
            </div>
          )}
          {p.linkedin && (
            <div style={{ marginBottom:18 }}>
              <div className="label2" style={{ marginBottom:8 }}>LinkedIn</div>
              <a href={p.linkedin} target="_blank" rel="noopener noreferrer" style={{ color:G.amber, fontSize:14 }}>View Profile →</a>
            </div>
          )}
        </div>
        {/* Footer */}
        <div style={{ padding:'16px 24px', borderTop:`1px solid ${G.border}`, display:'flex', justifyContent:'flex-end', gap:8 }}>
          {p.website && <a href={`https://${p.website.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding:'8px 16px', fontSize:12 }}>Website →</a>}
          <button className="btn-amber" onClick={()=>{onClose();onContact?.(p)}}>{t.contact}</button>
        </div>
      </div>
    </div>
  )
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage2({ lang, t, profiles, siteContent, onRegister, setPage }) {
  const [detail, setDetail] = useState(null)
  const [contact, setContact] = useState(null)

  const sponsored = useMemo(()=>profiles.filter(p=>p.tier==='sponsored').slice(0,6),[profiles])
  const partners  = useMemo(()=>profiles.filter(p=>p.type==='partner').slice(0,8),[profiles])
  const stats = useMemo(()=>{
    const comp = profiles.filter(p=>p.type==='company').length
    const fl   = profiles.filter(p=>p.type==='freelancer').length
    const part = profiles.filter(p=>p.type==='partner').length
    return [comp||124, fl||48, part||12]
  },[profiles])

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>
      <VideoBg src="/bg-video-home.mp4" />

      {/* ── HERO ── */}
      <div style={{ position:'relative', zIndex:1, minHeight:'92vh', display:'flex', flexDirection:'column', justifyContent:'center', paddingTop:80 }}>
        <div className="wrap">
          <div style={{ maxWidth:680 }}>
            {/* Eyebrow */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ width:28, height:2, background:G.amber }} />
              <span style={{ fontSize:11, fontWeight:600, letterSpacing:'2px', textTransform:'uppercase', color:G.amber }}>{t.tagline}</span>
            </div>
            {/* Headline */}
            <h1 style={{ fontFamily:"'EB Garamond',serif", fontSize:'clamp(42px,7vw,80px)', fontWeight:700, lineHeight:1.05, letterSpacing:'-1px', marginBottom:20, color:'#F0EBE0' }}>
              {t.h1}<br /><em style={{ color:G.amber, fontStyle:'italic' }}>{t.h2}</em>
            </h1>
            <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'rgba(226,221,214,0.70)', lineHeight:1.7, marginBottom:32, maxWidth:540 }}>{t.heroSub}</p>
            {/* CTAs */}
            <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:48 }}>
              <button className="btn-amber" style={{ padding:'13px 28px', fontSize:14 }} onClick={()=>setPage('directory')}>Browse Companies →</button>
              <button className="btn-outline" style={{ padding:'12px 24px', fontSize:14 }} onClick={onRegister}>{t.registerBtn}</button>
            </div>
            {/* Stats */}
            <div style={{ display:'flex', gap:40, flexWrap:'wrap' }}>
              {[[stats[0],t.statComp],[stats[1],t.statFL],[stats[2],t.statPart],['10%',t.statTax]].map(([n,l])=>(
                <div key={l}>
                  <div style={{ fontFamily:"'EB Garamond',serif", fontSize:32, fontWeight:700, color:'#F0EBE0', lineHeight:1 }}>{n}</div>
                  <div style={{ fontSize:11, color:G.muted, letterSpacing:'0.5px', marginTop:3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT SECTIONS (solid dark bg) ── */}
      <div style={{ position:'relative', zIndex:1, background:G.bg }}>

        {/* ── FEATURED LISTINGS ── */}
        {sponsored.length > 0 && (
          <div className="section wrap">
            <RuleHeader title={t.sectionFeatured}
              right={<button className="btn-ghost" onClick={()=>setPage('directory')}>{t.viewAll} →</button>} />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
              {sponsored.map(p=>(
                <ProfileCard2 key={p.id} p={p} lang={lang} t={t}
                  onContact={setContact} onView={setDetail} />
              ))}
            </div>
          </div>
        )}

        {/* ── SECTORS ── */}
        <div className="section wrap" style={{ borderTop:`1px solid ${G.border}` }}>
          <RuleHeader title={t.sectionSectors} />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
            {CATS.map(cat=>(
              <button key={cat.id} onClick={()=>setPage('directory')}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px', background:G.card, border:`1px solid ${G.border}`, borderRadius:8, textAlign:'left', color:G.text, transition:'all 0.18s', cursor:'pointer' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=hexToRgba(cat.color,0.35);e.currentTarget.style.background=hexToRgba(cat.color,0.06)}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.background=G.card}}>
                <div style={{ width:32, height:32, borderRadius:8, background:hexToRgba(cat.color,0.15), display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{cat.icon}</div>
                <div>
                  <div style={{ fontWeight:500, fontSize:13, color:G.text }}>{cat.labels[lang]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── PARTNERS ── */}
        {partners.length > 0 && (
          <div className="section-sm wrap" style={{ borderTop:`1px solid ${G.border}` }}>
            <RuleHeader title={t.sectionPartners}
              right={<span style={{ fontSize:12, color:G.muted }}>{partners.length} active</span>} />
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              {partners.map(p=>(
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:G.card, border:`1px solid ${G.border}`, borderRadius:8, cursor:'pointer', transition:'all 0.18s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=G.amberBd}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=G.border}>
                  <Logo2 text={p.logo||p.name} color={catColor(p.cat)} url={p.logoUrl} size={32} />
                  <div>
                    <div style={{ fontSize:13, fontWeight:500, color:G.text }}>{p.name}</div>
                    {p.city && <div style={{ fontSize:11, color:G.dim }}>{p.city}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA BANNER ── */}
        <div className="section-sm" style={{ borderTop:`1px solid ${G.border}`, background:`linear-gradient(135deg,${hexToRgba(G.amber,0.05)} 0%,transparent 100%)` }}>
          <div className="wrap" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
            <div>
              <h3 style={{ fontFamily:"'EB Garamond',serif", fontSize:28, fontWeight:600, marginBottom:6, color:'#F0EBE0' }}>List your business for free</h3>
              <p style={{ color:G.muted, fontSize:14 }}>Get discovered by EU companies looking to partner with Kosova businesses.</p>
            </div>
            <button className="btn-amber" style={{ padding:'13px 28px', fontSize:14, flexShrink:0 }} onClick={onRegister}>{t.listFree}</button>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ borderTop:`1px solid ${G.border}`, padding:'24px 0' }}>
          <div className="wrap" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <span style={{ fontSize:12, color:G.dim }}>{t.footer}</span>
            <div style={{ display:'flex', gap:16 }}>
              {['Privacy','Terms','Contact'].map(l=><a key={l} href="#" style={{ fontSize:12, color:G.dim }}>{l}</a>)}
            </div>
          </div>
        </footer>
      </div>

      {detail && <ProfileModal p={detail} lang={lang} t={t} onClose={()=>setDetail(null)} onContact={p=>{setDetail(null);setContact(p)}} />}
      {contact && <EnquiryModal target={contact} t={t} onClose={()=>setContact(null)} />}
    </div>
  )
}

// ─── DIRECTORY PAGE ───────────────────────────────────────────────────────────
function DirectoryPage2({ lang, t, profiles }) {
  const [q, setQ]           = useState('')
  const [cat, setCat]       = useState('')
  const [typeF, setTypeF]   = useState('all')
  const [detail, setDetail] = useState(null)
  const [contact, setContact] = useState(null)

  const results = useMemo(()=>{
    let r = profiles
    if (typeF==='company')    r = r.filter(p=>p.type==='company')
    if (typeF==='freelancer') r = r.filter(p=>p.type==='freelancer')
    if (cat)  r = r.filter(p=>p.cat===cat)
    if (q.trim()) {
      const lq = q.toLowerCase()
      r = r.filter(p=>(p.name+' '+(p.tags||[]).join(' ')+' '+p.city+' '+(p.desc?.en||'')).toLowerCase().includes(lq))
    }
    return r
  },[profiles,q,cat,typeF])

  return (
    <div style={{ background:G.bg, minHeight:'100vh', paddingTop:76 }}>
      <VideoBg src="/bg-video-companies.mp4" />
      <div style={{ position:'relative', zIndex:1 }}>
        {/* Page header */}
        <div style={{ background:'linear-gradient(0deg,rgba(15,17,23,1) 0%,transparent 100%)', padding:'48px 0 32px' }}>
          <div className="wrap">
            <h1 style={{ fontFamily:"'EB Garamond',serif", fontSize:'clamp(36px,5vw,56px)', fontWeight:700, letterSpacing:'-0.5px', color:'#F0EBE0', marginBottom:8 }}>Companies &amp; Freelancers</h1>
            <p style={{ color:G.muted, fontSize:15 }}>Verified businesses from Kosova ready to partner with EU companies</p>
          </div>
        </div>

        <div style={{ background:G.bg, minHeight:'70vh' }}>
          <div className="wrap" style={{ paddingTop:24, paddingBottom:48 }}>
            {/* Controls */}
            <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap', alignItems:'center' }}>
              <input className="inp2" placeholder={t.searchPH} value={q} onChange={e=>setQ(e.target.value)}
                style={{ flex:1, minWidth:220, maxWidth:400 }} />
              <div style={{ display:'flex', gap:6 }}>
                {[['all',t.allTypes],['company',t.onlyComp],['freelancer',t.onlyFL]].map(([v,l])=>(
                  <button key={v} onClick={()=>setTypeF(v)}
                    className={typeF===v?'btn-amber':'btn-ghost'}
                    style={{ padding:'8px 14px', fontSize:12 }}>{l}</button>
                ))}
              </div>
            </div>

            {/* Sector filters */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:24 }}>
              <button onClick={()=>setCat('')} className={!cat?'btn-amber':'btn-ghost'} style={{ padding:'5px 12px', fontSize:11 }}>{t.allSectors}</button>
              {CATS.map(c=>(
                <button key={c.id} onClick={()=>setCat(cat===c.id?'':c.id)}
                  style={{ padding:'5px 12px', fontSize:11, cursor:'pointer', border:`1px solid ${cat===c.id?hexToRgba(c.color,0.50):hexToRgba(c.color,0.18)}`, borderRadius:5, background: cat===c.id?hexToRgba(c.color,0.18):'transparent', color: cat===c.id?c.color:G.muted, transition:'all 0.15s' }}>
                  {c.icon} {c.labels[lang]}
                </button>
              ))}
            </div>

            {/* Results count */}
            <div style={{ marginBottom:16, fontSize:12, color:G.muted }}>
              {results.length} {results.length===1?'listing':'listings'} found
            </div>

            {/* Grid */}
            {results.length > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
                {results.map(p=>(
                  <ProfileCard2 key={p.id} p={p} lang={lang} t={t}
                    onContact={setContact} onView={setDetail} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign:'center', padding:'64px 0', color:G.muted }}>
                <div style={{ fontSize:36, marginBottom:12 }}>🔍</div>
                <div style={{ fontFamily:"'EB Garamond',serif", fontSize:22, marginBottom:6 }}>{t.noResults}</div>
                <div style={{ fontSize:14 }}>{t.noResultsSub}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {detail && <ProfileModal p={detail} lang={lang} t={t} onClose={()=>setDetail(null)} onContact={p=>{setDetail(null);setContact(p)}} />}
      {contact && <EnquiryModal target={contact} t={t} onClose={()=>setContact(null)} />}
    </div>
  )
}

// ─── CONCIERGE PAGE ───────────────────────────────────────────────────────────
function ConciergePage2({ lang, t, siteContent }) {
  const [bookModal, setBookModal] = useState(false)
  const [bookForm, setBookForm] = useState({ name:'', company:'', email:'', goal:'', timeframe:'', pax:'1' })
  const [bookDone, setBookDone] = useState(false)
  const [bookSaving, setBookSaving] = useState(false)
  const P = siteContent?.partners || {}

  const submitBook = async () => {
    if (!bookForm.name||!bookForm.email) return
    setBookSaving(true)
    try {
      await insertBooking({ name:bookForm.name, company:bookForm.company||null, email:bookForm.email, goal:bookForm.goal||null, timeframe:bookForm.timeframe||null, pax:parseInt(bookForm.pax)||1 })
      await sendBookingConfirmation({ name:bookForm.name, email:bookForm.email })
      setBookDone(true)
    } catch {}
    setBookSaving(false)
  }

  const howSteps = [
    { n:'01', ic:'📋', t:'Describe your needs', d:'Fill in the short form or schedule an initial call.' },
    { n:'02', ic:'🎯', t:'We match you', d:'rootsGTM identifies the best companies for your goals.' },
    { n:'03', ic:'🤝', t:'Partner plans your visit', d:'Meetings, site tours and government appointments are arranged.' },
    { n:'04', ic:'✈️', t:'You arrive', d:'Everything prepared — contacts, schedule, logistics.' },
    { n:'05', ic:'📄', t:'Follow-up', d:'Contracts, next steps and long-term partnership support.' },
  ]

  return (
    <div style={{ background:G.bg, minHeight:'100vh', paddingTop:60 }}>
      <VideoBg src="/bg-video-concierge.mp4" />

      <div style={{ position:'relative', zIndex:1 }}>
        {/* ── HERO ── */}
        <div style={{ padding:'80px 0 60px', background:'linear-gradient(0deg,rgba(15,17,23,1) 0%,transparent 80%)' }}>
          <div className="wrap">
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:24, height:2, background:G.amber }} />
              <span style={{ fontSize:11, fontWeight:600, letterSpacing:'2px', textTransform:'uppercase', color:G.amber }}>Exclusive Service</span>
            </div>
            <h1 style={{ fontFamily:"'EB Garamond',serif", fontSize:'clamp(38px,6vw,68px)', fontWeight:700, letterSpacing:'-0.5px', color:'#F0EBE0', marginBottom:16 }}>{t.concHeroTitle}</h1>
            <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'rgba(226,221,214,0.68)', maxWidth:560, lineHeight:1.7, marginBottom:32 }}>{t.concHeroSub}</p>
            <button className="btn-amber" style={{ padding:'13px 28px', fontSize:14 }} onClick={()=>setBookModal(true)}>{t.concReq}</button>
          </div>
        </div>

        <div style={{ background:G.bg }}>
          {/* ── HOW IT WORKS ── */}
          <div className="section wrap" style={{ borderTop:`1px solid ${G.border}` }}>
            <RuleHeader title="How It Works" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:16 }}>
              {howSteps.map(step=>(
                <div key={step.n} style={{ padding:'20px', background:G.card, border:`1px solid ${G.border}`, borderRadius:10, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:12, right:14, fontFamily:"'EB Garamond',serif", fontSize:36, fontWeight:700, color:hexToRgba(G.amber,0.08), lineHeight:1 }}>{step.n}</div>
                  <div style={{ fontSize:24, marginBottom:10 }}>{step.ic}</div>
                  <div style={{ fontFamily:"'EB Garamond',serif", fontWeight:600, fontSize:16, marginBottom:6, color:G.text }}>{step.t}</div>
                  <div style={{ fontSize:13, color:G.muted, lineHeight:1.6 }}>{step.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── PARTNERS ── */}
          <div className="section wrap" style={{ borderTop:`1px solid ${G.border}` }}>
            <RuleHeader title="General Partners" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {/* rootsGTM */}
              <div style={{ background:G.card, border:`1px solid ${G.slateBd}`, borderRadius:12, overflow:'hidden' }}>
                {P.rootsgtm_cover && <div style={{ height:90, overflow:'hidden', position:'relative' }}><img src={P.rootsgtm_cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:P.rootsgtm_cover_focus||'50% 50%' }} /><div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(28,32,48,0.9) 0%,transparent 60%)' }} /></div>}
                <div style={{ padding:'20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    {P.rootsgtm_logo ? <img src={P.rootsgtm_logo} alt="" style={{ width:42, height:42, borderRadius:8, objectFit:'cover', border:`1.5px solid ${G.slateBd}` }} /> : <div style={{ width:42, height:42, borderRadius:8, background:G.slateDim, border:`1.5px solid ${G.slateBd}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🚀</div>}
                    <div>
                      <div style={{ fontFamily:"'EB Garamond',serif", fontWeight:600, fontSize:18, color:G.slate }}>{P.rootsgtm_name||'rootsGTM'}</div>
                      <div style={{ fontSize:11, color:G.dim }}>General Partner · Active</div>
                    </div>
                    <span className="badge badge-green" style={{ marginLeft:'auto' }}>✓ Live</span>
                  </div>
                  <p style={{ fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:16 }}>{P.rootsgtm_desc||'rootsGTM is our exclusive sales network for EU–Kosova connections.'}</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:16 }}>
                    {['🤝 Direct client contact','📅 Meeting organisation','🎤 Events & networking','📄 Follow-up & contracts'].map(f=>(
                      <div key={f} style={{ fontSize:12, color:G.muted, background:G.slateDim, border:`1px solid ${G.slateBd}`, borderRadius:5, padding:'6px 8px' }}>{f}</div>
                    ))}
                  </div>
                  <button className="btn-slate" style={{ width:'100%' }} onClick={()=>setBookModal(true)}>Enquire via rootsGTM →</button>
                </div>
              </div>

              {/* Government */}
              <div style={{ background:G.card, border:`1px solid ${G.amberBd}`, borderRadius:12, overflow:'hidden' }}>
                {P.gov_cover && <div style={{ height:90, overflow:'hidden', position:'relative' }}><img src={P.gov_cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:P.gov_cover_focus||'50% 50%' }} /><div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg,rgba(28,32,48,0.9) 0%,transparent 60%)' }} /></div>}
                <div style={{ padding:'20px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    {P.gov_logo ? <img src={P.gov_logo} alt="" style={{ width:42, height:42, borderRadius:8, objectFit:'cover', border:`1.5px solid ${G.amberBd}` }} /> : <div style={{ width:42, height:42, borderRadius:8, background:G.amberDim, border:`1.5px solid ${G.amberBd}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>🏛️</div>}
                    <div>
                      <div style={{ fontFamily:"'EB Garamond',serif", fontWeight:600, fontSize:18, color:G.amber }}>{P.gov_name||'Kosova Government'}</div>
                      <div style={{ fontSize:11, color:G.dim }}>InvestKosova · Official Partner</div>
                    </div>
                    <span className="badge badge-amber" style={{ marginLeft:'auto' }}>⏳ Negotiating</span>
                  </div>
                  <p style={{ fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:16 }}>{P.gov_desc||'Building an official partnership with InvestKosova and the Ministry of Economy.'}</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:16 }}>
                    {['🏛️ InvestKosova meetings','📋 Company formation advice','🤝 Ministry appointments','📊 Investment support'].map(f=>(
                      <div key={f} style={{ fontSize:12, color:G.muted, background:G.amberDim, border:`1px solid ${G.amberBd}`, borderRadius:5, padding:'6px 8px' }}>{f}</div>
                    ))}
                  </div>
                  <button className="btn-amber" style={{ width:'100%' }} onClick={()=>setBookModal(true)}>Request Government Meeting →</button>
                </div>
              </div>
            </div>
          </div>

          {/* ── CTA ── */}
          <div style={{ borderTop:`1px solid ${G.border}`, padding:'48px 0', background:`linear-gradient(135deg,${hexToRgba(G.amber,0.04)} 0%,transparent 100%)` }}>
            <div className="wrap" style={{ textAlign:'center' }}>
              <h3 style={{ fontFamily:"'EB Garamond',serif", fontSize:36, fontWeight:700, color:'#F0EBE0', marginBottom:12 }}>Ready for your Kosova visit?</h3>
              <p style={{ color:G.muted, marginBottom:24, fontSize:15 }}>Free initial call · Reply within 24h · No deposit required</p>
              <button className="btn-amber" style={{ padding:'14px 32px', fontSize:15 }} onClick={()=>setBookModal(true)}>Request a Visit →</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOOKING MODAL ── */}
      {bookModal && (
        <div className="modal-bg2" onClick={e=>e.target===e.currentTarget&&setBookModal(false)}>
          <div className="modal2" style={{ maxWidth:500 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:24 }}>
              <div style={{ fontFamily:"'EB Garamond',serif", fontSize:24, fontWeight:600 }}>{t.bookTitle}</div>
              <button onClick={()=>setBookModal(false)} className="btn-ghost" style={{ padding:'6px 10px' }}>✕</button>
            </div>
            {bookDone ? (
              <div style={{ textAlign:'center', padding:'32px 0' }}>
                <div style={{ fontSize:42, marginBottom:12 }}>✓</div>
                <div style={{ fontFamily:"'EB Garamond',serif", fontSize:24, fontWeight:600, marginBottom:8 }}>{t.bookDoneTitle}</div>
                <div style={{ color:G.muted }}>{t.bookDoneSub}</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label className="label2">{t.bookName}</label><input className="inp2" value={bookForm.name} onChange={e=>setBookForm(f=>({...f,name:e.target.value}))} /></div>
                  <div><label className="label2">{t.bookComp}</label><input className="inp2" value={bookForm.company} onChange={e=>setBookForm(f=>({...f,company:e.target.value}))} /></div>
                </div>
                <div><label className="label2">{t.bookEmail}</label><input className="inp2" type="email" value={bookForm.email} onChange={e=>setBookForm(f=>({...f,email:e.target.value}))} /></div>
                <div><label className="label2">{t.bookGoal}</label><textarea className="inp2" rows={3} placeholder={t.bookGoalPH} value={bookForm.goal} onChange={e=>setBookForm(f=>({...f,goal:e.target.value}))} style={{ resize:'vertical' }} /></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div><label className="label2">{t.bookWhen}</label><input className="inp2" placeholder="e.g. June 2025" value={bookForm.timeframe} onChange={e=>setBookForm(f=>({...f,timeframe:e.target.value}))} /></div>
                  <div><label className="label2">{t.bookPax}</label>
                    <select className="inp2" value={bookForm.pax} onChange={e=>setBookForm(f=>({...f,pax:e.target.value}))}>
                      {['1','2','3','4','5','6','7','8+'].map(n=><option key={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
                <button className="btn-amber" onClick={submitBook} disabled={bookSaving} style={{ marginTop:4 }}>{bookSaving?'Submitting…':t.bookSend}</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── GOVERNMENT / INVEST PAGE ─────────────────────────────────────────────────
function GovPage2({ lang, t }) {
  const facts = t.govFacts
  const steps = t.govSteps
  const links = [
    { label:'ARBK — Business Registration', url:'https://arbk.rks-gov.net' },
    { label:'InvestKosova', url:'https://investkosova.com' },
    { label:'Tax Administration of Kosova', url:'https://www.atk-ks.org' },
    { label:'Chamber of Commerce', url:'https://www.kkk-rks.com' },
  ]

  return (
    <div style={{ background:G.bg, minHeight:'100vh', paddingTop:60 }}>
      <VideoBg src="/bg-video-gov.mp4" />

      <div style={{ position:'relative', zIndex:1 }}>
        {/* ── HERO ── */}
        <div style={{ padding:'80px 0 56px', background:'linear-gradient(0deg,rgba(15,17,23,1) 0%,transparent 80%)' }}>
          <div className="wrap">
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'4px 12px', background:G.amberDim, border:`1px solid ${G.amberBd}`, borderRadius:4, marginBottom:20 }}>
              <span style={{ fontSize:11, fontWeight:600, letterSpacing:'1.5px', textTransform:'uppercase', color:G.amber }}>Official Information</span>
            </div>
            <h1 style={{ fontFamily:"'EB Garamond',serif", fontSize:'clamp(38px,6vw,64px)', fontWeight:700, letterSpacing:'-0.5px', color:'#F0EBE0', lineHeight:1.05, marginBottom:16 }}>
              {t.govH1}<br /><em style={{ color:G.amber, fontStyle:'italic' }}>{t.govH2}</em>
            </h1>
            <p style={{ fontSize:'clamp(15px,2vw,18px)', color:'rgba(226,221,214,0.68)', maxWidth:520, lineHeight:1.7 }}>{t.govSub}</p>
          </div>
        </div>

        <div style={{ background:G.bg }}>
          {/* ── KEY FACTS ── */}
          <div className="section wrap" style={{ borderTop:`1px solid ${G.border}` }}>
            <RuleHeader title={t.govFactsTitle} />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:12 }}>
              {facts.map(([val,label])=>(
                <div key={label} style={{ padding:'20px 16px', background:G.card, border:`1px solid ${G.border}`, borderRadius:10, textAlign:'center' }}>
                  <div style={{ fontFamily:"'EB Garamond',serif", fontSize:30, fontWeight:700, color:G.amber, lineHeight:1, marginBottom:6 }}>{val}</div>
                  <div style={{ fontSize:11, color:G.muted, letterSpacing:'0.5px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FORMATION STEPS ── */}
          <div className="section wrap" style={{ borderTop:`1px solid ${G.border}` }}>
            <RuleHeader title="Company Formation Process" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:14 }}>
              {steps.map((step,i)=>(
                <div key={i} style={{ display:'flex', gap:14, padding:'18px', background:G.card, border:`1px solid ${G.border}`, borderRadius:10, alignItems:'flex-start' }}>
                  <div style={{ width:40, height:40, borderRadius:8, background:G.amberDim, border:`1.5px solid ${G.amberBd}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{step.ic}</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, marginBottom:4, color:G.text }}>{step.t}</div>
                    <div style={{ fontSize:12, color:G.muted, lineHeight:1.5, marginBottom:6 }}>{step.d}</div>
                    <span className="badge badge-amber">{step.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── WHY KOSOVA ── */}
          <div className="section wrap" style={{ borderTop:`1px solid ${G.border}` }}>
            <RuleHeader title="Why Kosova?" />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
              <div>
                {[
                  ['📉','Lowest Tax in Region','10% flat corporate income tax — among the lowest in Europe.'],
                  ['💶','Euro Currency','No exchange rate risk for EU companies.'],
                  ['🎓','Young Educated Workforce','63% of the population under 35 with strong STEM education.'],
                  ['🌍','EU Accession Path','Ongoing accession process with strong EU alignment.'],
                ].map(([ic,title,desc])=>(
                  <div key={title} style={{ display:'flex', gap:14, paddingBottom:20, marginBottom:20, borderBottom:`1px solid ${G.border}` }}>
                    <div style={{ fontSize:24, flexShrink:0, marginTop:2 }}>{ic}</div>
                    <div>
                      <div style={{ fontFamily:"'EB Garamond',serif", fontWeight:600, fontSize:17, marginBottom:4 }}>{title}</div>
                      <div style={{ fontSize:13, color:G.muted, lineHeight:1.6 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'24px', background:G.card, border:`1px solid ${G.amberBd}`, borderRadius:12 }}>
                <div style={{ fontFamily:"'EB Garamond',serif", fontSize:22, fontWeight:600, marginBottom:16 }}>Official Resources</div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {links.map(l=>(
                    <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer"
                      style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:G.bg, border:`1px solid ${G.border}`, borderRadius:7, fontSize:13, color:G.text, transition:'all 0.16s' }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=G.amberBd;e.currentTarget.style.color=G.amber}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=G.border;e.currentTarget.style.color=G.text}}>
                      {l.label} <span style={{ color:G.amber, fontSize:12 }}>→</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav2({ page, setPage, lang, setLang, t, onRegister }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const PAGES = [['home',t.navHome],['directory',t.navDir],['concierge',t.navConcierge],['gov',t.navGov]]

  return (
    <>
      <nav className="nav2">
        <div className="wrap" style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {/* Brand */}
          <button onClick={()=>setPage('home')} style={{ background:'transparent', border:'none', display:'flex', alignItems:'center', gap:10, cursor:'pointer', padding:0 }}>
            <div style={{ width:30, height:30, borderRadius:6, background:`linear-gradient(135deg,${G.amber},${G.amber2})`, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontFamily:"'EB Garamond',serif", fontWeight:800, fontSize:16, color:'#0f1117' }}>K</span>
            </div>
            <div style={{ textAlign:'left' }}>
              <div style={{ fontFamily:"'EB Garamond',serif", fontWeight:700, fontSize:17, color:'#F0EBE0', letterSpacing:'-0.2px', lineHeight:1.1 }}>Kosova Hub</div>
              <div style={{ fontSize:9, color:G.dim, letterSpacing:'1px', textTransform:'uppercase', lineHeight:1 }}>B2B Gateway</div>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="navlinks-desktop" style={{ display:'flex', gap:2, alignItems:'center' }}>
            {PAGES.map(([p,l])=>(
              <button key={p} className={`navlink2${page===p?' on':''}`} onClick={()=>setPage(p)}>{l}</button>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {/* Lang */}
            <div style={{ display:'flex', gap:2 }}>
              {['en','sq'].map(l=>(
                <button key={l} onClick={()=>setLang(l)}
                  style={{ background:lang===l?G.amberDim:'transparent', border:`1px solid ${lang===l?G.amberBd:'transparent'}`, borderRadius:4, padding:'4px 8px', color:lang===l?G.amber:G.dim, fontSize:11, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <button className="btn-amber hide-mobile" style={{ padding:'7px 16px', fontSize:12 }} onClick={onRegister}>{t.registerBtn}</button>
            {/* Hamburger */}
            <button className="hamburger2" onClick={()=>setMobileOpen(v=>!v)}
              style={{ display:'none', flexDirection:'column', gap:4, background:'transparent', border:'none', padding:6, cursor:'pointer' }}>
              {[0,1,2].map(i=><span key={i} style={{ display:'block', width:20, height:1.5, background:G.muted, borderRadius:1 }} />)}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ position:'fixed', top:60, left:0, right:0, background:G.surface, borderBottom:`1px solid ${G.border}`, zIndex:99, padding:'12px 16px 16px' }}>
          {PAGES.map(([p,l])=>(
            <button key={p} onClick={()=>{setPage(p);setMobileOpen(false)}}
              style={{ display:'block', width:'100%', textAlign:'left', background: page===p?G.amberDim:'transparent', border:'none', borderRadius:6, padding:'12px 14px', color:page===p?G.amber:G.text, fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:500, marginBottom:4, cursor:'pointer' }}>
              {l}
            </button>
          ))}
          <button className="btn-amber" style={{ width:'100%', marginTop:8 }} onClick={()=>{onRegister();setMobileOpen(false)}}>{t.registerBtn}</button>
        </div>
      )}
    </>
  )
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function App2() {
  const [lang, setLang] = useState('en')
  const [page, setPage] = useState('home')
  const [profiles, setProfiles] = useState([])
  const [siteContent, setSiteContent] = useState({})
  const [showReg, setShowReg] = useState(false)

  const t = T[lang] || T.en

  // Load profiles
  useEffect(()=>{
    fetchProfiles().then(rows=>{
      if (rows) setProfiles(rows.map(normaliseProfile).filter(p=>p.status==='active'||p.verified))
    }).catch(()=>{})
    fetchSiteContent().then(d=>{ if(d) setSiteContent(d) }).catch(()=>{})
  },[])

  return (
    <div style={{ background:G.bg, minHeight:'100vh' }}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <Nav2 page={page} setPage={setPage} lang={lang} setLang={setLang} t={t} onRegister={()=>setShowReg(true)} />
      <div style={{ paddingTop: page==='home' ? 0 : 0 }}>
        {page==='home'      && <HomePage2 lang={lang} t={t} profiles={profiles} siteContent={siteContent} onRegister={()=>setShowReg(true)} setPage={setPage} />}
        {page==='directory' && <DirectoryPage2 lang={lang} t={t} profiles={profiles} />}
        {page==='concierge' && <ConciergePage2 lang={lang} t={t} siteContent={siteContent} />}
        {page==='gov'       && <GovPage2 lang={lang} t={t} />}
      </div>
      {showReg && <RegModal t={t} lang={lang} onClose={()=>setShowReg(false)} />}
    </div>
  )
}
