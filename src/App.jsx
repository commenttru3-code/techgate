// Business Bridge Platform v2.4 — build: 2025-05-01
import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  fetchProfiles, fetchAllProfilesAdmin,
  insertProfile, updateProfile, deleteProfile, verifyProfile,
  fetchPendingChanges, insertPendingChange, approvePendingChange, rejectPendingChange,
  insertContactLead, insertBooking,
  formToDb, fetchSiteContent, saveSiteContent,
  fetchSettings, upsertSetting,
} from './supabase.js'
import {
  notifyAdminNewProfile, sendVerifyCode, sendBookingConfirmation, sendEnquiry
} from './emailService.js'

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    tagline: 'Business Bridge Platform',
    navHome: 'Home', navDir: 'Companies & Freelancers', navMatch: 'Find Partners',
    navConcierge: 'Concierge & Partners', navGov: 'Government', registerBtn: '+ List Profile',
    live: 'Verified Listings · Live',
    h1a: 'Your Gateway to the', h1b: 'Kosova Business Hub',
    heroSub: 'Companies, freelancers and consultants from Kosova — for your next outsourcing or cooperation project.',
    searchPH: 'e.g. React developer, call centre, CNC manufacturing…', searchBtn: 'Search',
    stat1: 'Companies', stat2: 'Freelancers', stat3: 'Partners', stat4: 'Corporate Tax',
    howTitle: 'How it works',
    f1t: 'Find Companies & Freelancers', f1d: 'Browse all verified listings by sector and skills.',
    f2t: 'Find Partners', f2d: 'Select area and skills — instantly matched against all Kosova listings.',
    f3t: 'Kosova Concierge', f3d: 'rootsGTM organises your complete on-site business visit.',
    catsTitle: 'Sectors', topTitle: '⭐ Top Verified Listings', viewAll: 'View all →',
    ctaTitle: 'List your profile for free', ctaSub: '3 minutes, free. Visible Worldwide.',
    ctaBtn: 'Register →', ctaGov: 'About Kosova',
    rankSub: 'All contacts publicly visible · Pricing Upon Consultation',
    allCats: 'All', allTypes: '🌐 All', onlyComp: '🏢 Companies', onlyFL: '👤 Freelancers',
    sortRating: '⭐ Rating', sortReviews: '💬 Reviews', sortAZ: 'A–Z',
    noResults: 'No results', noResultsSub: 'Try different search terms',
    rateNote: 'Pricing Upon Consultation', verified: '✓ Verified',
    sendReq: 'Send enquiry', viewProf: 'Profile',
    upgradeBtn: '⭐',
    upgradeTitle: 'Increase visibility',
    upgradeSubSp: 'Sponsored · max. 3 slots per category',
    upgradeBenSp: ['🥇 Top 3 positions', 'Sponsored label', 'Featured on homepage', 'Newsletter mention'],
    upgradeNoteSp: 'Maximum 3 sponsored per category.',
    upgradeContact: 'Contact for upgrade:', upgradeMail: 'upgrade@bbplatform.com',
    waitName: 'Your name *', waitEmail: 'Your e-mail *', waitSend: 'Join waitlist ✓',
    waitDoneTitle: 'You\'re on the list!', waitDoneSub: 'We\'ll contact you when a slot opens.',
    reqTitle: 'Enquiry to', reqName: 'Your name *', reqEmail: 'Your e-mail *', reqMsg: 'Message',
    reqPH: 'Hello, we are looking for…', reqSend: 'Send ✓', reqCancel: 'Cancel',
    reqDoneTitle: 'Sent!', reqDoneSub: 'will get back to you.',
    close: 'Close', back: '← Back',
    matchTitle: 'Match Filter', matchSub: 'Select area and skills — instant match against all Kosova listings.',
    matchWhat: 'What are you looking for? *', matchPH: 'e.g. React team, 3–4 developers, remote, start May…',
    matchType: 'Type', matchBoth: 'Company & Freelancer', matchFirm: 'Companies only', matchFL: 'Freelancers only',
    matchDur: 'Duration', matchDurOpts: ['–', 'One-time', '1–3 months', '3–6 months', '6–12 months', 'Ongoing'],
    matchBtn: '🔍 Filter now', matchRunning: 'Searching…',
    matchResults: 'Available listings', matchWhy: 'Why?', noMatch: 'No match — try different criteria.',
    matchDateFrom: 'Available from', matchDateUntil: 'Available until', matchCapacity: 'Number of people',
    matchSkills: 'Skills (comma separated)', matchSkillsPH: 'React, Node.js, TypeScript',
    matchAIBtn: '🤖 AI explains matches', matchAIRunning: 'AI analysing…',
    availFrom: 'Available from', availUntil: 'Available until', availCap: 'Capacity',
    availOnRequest: 'On request', availLabel: 'Availability',
    avail: 'Available', availSoon: 'Available soon', unavail: 'Booked',
    regAvailTitle: 'Availability (for IT / Freelancer / Consulting)',
    regAvailSub: 'Leave empty = On request (default for all other sectors)',
    regAvailFrom: 'Available from', regAvailUntil: 'Available until',
    regAvailCap: 'Capacity (number of people/developers)',
    regAvailCapPH: 'e.g. 3', regSkills: 'Skills / Technologies',
    regSkillsPH: 'React, Node.js, Python, Figma…', regRemote: 'Remote work possible',
    regOnsite: 'On-site (Kosova)', regLangs: 'Languages',
    concHeroTitle: 'Kosova Concierge',
    concHeroSub: 'Our partners organise your complete business visit — meetings, events, government appointments. All from one place.',
    concReq: '🗓 Request visit', concLearn: 'Learn more',
    concAvail: 'Active partners',
    concPartnersTitle: 'General Partners',
    concPartnersSub: 'rootsGTM and the Kosova Government are our official partners — they bring clients and open doors.',
    concPkgTitle: 'Visit Packages', concPkgSub: 'Rates and conditions are agreed in conversation.',
    pkgCta: 'Enquire',
    concHowTitle: 'How does it work?',
    concHowSub: 'From first enquiry to signed contract.',
    howSteps: [
      { n: '01', ic: '📋', t: 'Describe needs', d: 'Form or initial call.' },
      { n: '02', ic: '🎯', t: 'Match your partner', d: 'We find the best-fit listings for your goals.' },
      { n: '03', ic: '🤝', t: 'Partner plans', d: 'rootsGTM coordinates all meetings.' },
      { n: '04', ic: '✈️', t: 'You arrive', d: 'Everything prepared.' },
      { n: '05', ic: '📄', t: 'Follow-up', d: 'Contracts & next steps.' },
    ],
    concSpTitle: 'rootsGTM', concSpSub: 'rootsGTM is our exclusive partner — they know the business culture, the best contacts and handle everything for you.',
    spDeals: 'Deals',
    concCtaTitle: 'Ready for your Kosova visit?',
    concCtaFeats: ['✓ Reply in 24h', '✓ No deposit', '✓ Free initial call', '✓ Flexible booking'],
    concCtaBtn: '🗓 Request visit now →',
    concBecomeTitle: 'Become a Partner',
    concBecomeSub: 'Organisations, chambers of commerce and sales networks can apply to be listed as an official Business Bridge partner. Basic listing is free — featured placement is available as a paid option.',
    concBecomeTypes: ['🏛️ Government & Institutions', '📣 Sales Networks & Agencies', '🌍 Diaspora Organisations', '🤝 Chambers of Commerce'],
    concBecomeBtn: 'Submit application →',
    bookTitle: 'Request Kosova visit', bookName: 'Name *', bookComp: 'Company',
    bookEmail: 'E-mail *', bookGoal: 'Your goal', bookGoalPH: 'e.g. Meet software teams…',
    bookWhen: 'Preferred dates', bookPax: 'Participants', bookSend: 'Submit request ✓',
    bookDoneTitle: 'Request sent!', bookDoneSub: 'Our team will reply within 24 hours.',
    partnerRegTitle: 'Apply as a Partner', partnerRegSub: 'Free · We\'ll reply within 48h',
    partnerOrg: 'Organisation / Name *', partnerType: 'Type of organisation',
    partnerTypes: ['Government / Authority', 'Sales Network / Agency', 'Chamber of Commerce', 'Diaspora Organisation', 'Other'],
    partnerEmail: 'E-mail *', partnerDesc: 'Short description',
    partnerDescPH: 'What can your organisation contribute?', partnerSend: 'Submit application ✓',
    partnerDoneTitle: 'Application submitted!', partnerDoneSub: 'We\'ll be in touch within 48 hours.',
    govBadge: 'Official Information Portal',
    govH1: 'Company Formation &', govH2: 'Investment in Kosova',
    govSub: 'Low taxes, Euro currency, EU accession perspective and a young talent base.',
    govSteps: [
      { ic: '🖥️', t: 'Online Registration', d: 'ARBK fully online.', time: '1–3 days' },
      { ic: '💶', t: 'Share Capital', d: 'Minimum: €1.', time: '1 day' },
      { ic: '📋', t: 'Tax Number', d: 'Automatically assigned.', time: '1–2 days' },
      { ic: '🏦', t: 'Bank Account', d: '10 licensed banks.', time: '2–5 days' },
    ],
    govFactsH: '🇽🇰 Kosova at a glance',
    govFacts: [['10%', 'Corporate Tax'], ['18%', 'VAT'], ['€1', 'Min. Capital'], ['5–10 days', 'Formation'], ['EUR', 'Currency'], ['1.8M', 'Population'], ['63%', 'Under 35'], ['2008', 'Independence']],
    govLinks: 'Official Links',
    regTitle: 'What would you like to list?',
    regComp: '🏢 Company', regCompS: 'Company, Team, Agency',
    regFL: '👤 Freelancer', regFLS: 'Self-employed · Solo',
    regSP: '🤝 Partner', regSPS: 'Free · Reply within 48h',
    regFree: 'Free · Review within 24–48h',
    regName: 'Name / Company *', regCity: 'City *', regEmail: 'E-mail *',
    regDesc: 'Description', regDescPH: 'What do you offer?',
    regTags: 'Skills / Tags', regTagsPH: 'React, Node.js…',
    regSend: 'Submit ✓', regDoneTitle: 'Submitted!', regDoneSub: 'Review and publish within 24–48h.',
    footer: '© 2025 Business Bridge Platform · Kosova',
    footLinks: ['Privacy', 'Terms', 'Imprint', 'Contact'],
  },
  sq: {
    tagline: 'Platforma Urë Biznesi',
    navHome: 'Kreu', navDir: 'Kompani & Freelancerë', navMatch: 'Gjej Partnerë',
    navConcierge: 'Concierge & Partnerë', navGov: 'Qeveria', registerBtn: '+ Regjistrohu',
    live: 'Regjistrimet e Verifikuara · Live',
    h1a: 'Porta Juaj drejt', h1b: 'Qendrës së Biznesit në Kosovë',
    heroSub: 'Kompani, freelancerë dhe konsulentë nga Kosova — për projektin tuaj të ardhshëm.',
    searchPH: 'p.sh. Zhvillues React, qendër thirrjesh…', searchBtn: 'Kërko',
    stat1: 'Kompani', stat2: 'Freelancerë', stat3: 'Partnerë', stat4: 'Tatim mbi korp.',
    howTitle: 'Si funksionon',
    f1t: 'Gjej Kompani & Freelancerë', f1d: 'Shfletoni të gjitha regjistrimet sipas sektorit dhe aftësive.',
    f2t: 'Gjej Partnerë', f2d: 'Zgjidhni fushën dhe aftësitë — përputhje e menjëhershme me të gjitha regjistrimet.',
    f3t: 'Concierge Kosova', f3d: 'rootsGTM organizon vizitën tuaj të plotë të biznesit.',
    catsTitle: 'Sektorët', topTitle: '⭐ Regjistrimet e Verifikuara', viewAll: 'Shiko →',
    ctaTitle: 'Regjistrohu falas tani', ctaSub: '3 minuta, falas. I dukshëm në mbarë botën.',
    ctaBtn: 'Regjistrohu →', ctaGov: 'Rreth Kosovës',
    rankSub: 'Të gjitha kontaktet publike · Kushtet me bisedë',
    allCats: 'Të gjitha', allTypes: '🌐 Të gjitha', onlyComp: '🏢 Kompani', onlyFL: '👤 Freelancerë',
    sortRating: '⭐ Vlerësim', sortReviews: '💬 Komente', sortAZ: 'A–Z',
    noResults: 'Asnjë rezultat', noResultsSub: 'Provoni terma të tjerë',
    rateNote: 'Çmimi me konsultim', verified: '✓ Verifikuar',
    sendReq: 'Dërgo kërkesë', viewProf: 'Profili',
    upgradeBtn: '⭐',
    upgradeTitle: 'Rrit dukshmërinë',
    upgradeSubSp: 'Sponsorizuar · 1 slot për kategori',
    upgradeSubPr: 'Premium · max. 3 slote',
    upgradeBenSp: ['🥇 Pozicioni 1', 'Etiketa Sponsorizuar', 'Featured kryesore', 'Newsletter'],
    upgradeBenPr: ['⭐ Pozicioni 2–4', 'Distinktiv Premium', 'Dukshmëri më e lartë', 'Statistika'],
    upgradeNoteSp: 'Vetëm 1 sponsor për kategori.',
    upgradeNotePr: 'Maksimum 3 premium për kategori.',
    upgradeContact: 'Kontakti:', upgradeMail: 'upgrade@bbplatform.com',
    waitTitle: 'Lista e pritjes', waitSub: 'Ju njoftojmë kur hapet një slot.',
    waitName: 'Emri *', waitEmail: 'E-mail *', waitSend: 'Bashkohu ✓',
    waitDoneTitle: 'Jeni në listë!', waitDoneSub: 'Ju kontaktojmë kur hapet slot.',
    reqTitle: 'Kërkesë për', reqName: 'Emri *', reqEmail: 'E-mail *', reqMsg: 'Mesazhi',
    reqPH: 'Mirëdita, ne kërkojmë…', reqSend: 'Dërgo ✓', reqCancel: 'Anulo',
    reqDoneTitle: 'U dërgua!', reqDoneSub: 'do t\'ju kontaktojë.',
    close: 'Mbyll', back: '← Kthehu',
    matchTitle: 'Filtri i Përputhjes', matchSub: 'Zgjidhni fushën dhe aftësitë — krahasim i menjëhershëm me të gjitha regjistrimet.',
    matchWhat: 'Çfarë po kërkoni? *', matchPH: 'p.sh. Ekip React, 3–4 zhvillues, remote…',
    matchType: 'Lloji', matchBoth: 'Kompani & Freelancer', matchFirm: 'Vetëm kompani', matchFL: 'Vetëm freelancerë',
    matchDur: 'Kohëzgjatja', matchDurOpts: ['–', 'Njëherë', '1–3 muaj', '3–6 muaj', '6–12 muaj', 'Afatgjatë'],
    matchBtn: '🔍 Filtro tani', matchRunning: 'Duke kërkuar…',
    matchResults: 'Regjistrimet e disponueshme', matchWhy: 'Pse?', noMatch: 'Asnjë rezultat — provo kritere të tjera.',
    matchDateFrom: 'Disponueshëm nga', matchDateUntil: 'Disponueshëm deri', matchCapacity: 'Numri i personave',
    matchSkills: 'Aftësi (me presje)', matchSkillsPH: 'React, Node.js, TypeScript',
    matchAIBtn: '🤖 AI shpjegon përputhjet', matchAIRunning: 'AI analizon…',
    availFrom: 'Disponueshëm nga', availUntil: 'Disponueshëm deri', availCap: 'Kapaciteti',
    availOnRequest: 'Me kërkesë', availLabel: 'Disponueshmëria',
    avail: 'Disponueshëm', availSoon: 'Shpejt disponueshëm', unavail: 'I zënë',
    regAvailTitle: 'Disponueshmëria (për IT / Freelancer / Konsulencë)',
    regAvailSub: 'Lëreni bosh = Me kërkesë (standard për sektorët e tjerë)',
    regAvailFrom: 'Disponueshëm nga', regAvailUntil: 'Disponueshëm deri',
    regAvailCap: 'Kapaciteti (numri i personave)',
    regAvailCapPH: 'p.sh. 3', regSkills: 'Aftësi / Teknologji',
    regSkillsPH: 'React, Node.js, Python, Figma…', regRemote: 'Punë remote e mundshme',
    regOnsite: 'Në vend (Kosovë)', regLangs: 'Gjuhët',
    concHeroTitle: 'Concierge Kosova',
    concHeroSub: 'Partnerët tanë organizojnë vizitën tuaj të plotë — takime, evente, takime qeveritare. Gjithçka nga një burim.',
    concReq: '🗓 Kërko vizitë', concLearn: 'Mëso më shumë',
    concAvail: 'Partnerë aktivë',
    concPartnersTitle: 'Partnerët e Përgjithshëm',
    concPartnersSub: 'rootsGTM dhe Qeveria e Kosovës janë partnerët tanë zyrtarë.',
    concPkgTitle: 'Paketat e Vizitës', concPkgSub: 'Kushtet bien dakord në bisedë personale.',
    pkgCta: 'Kërko',
    concHowTitle: 'Si funksionon?', concHowSub: 'Nga kërkesa e parë deri te kontrata.',
    howSteps: [
      { n: '01', ic: '📋', t: 'Përshkruani nevojën', d: 'Formular ose thirrje.' },
      { n: '02', ic: '🎯', t: 'Gjej partnerin', d: 'Gjejmë përputhjet më të mira për qëllimet tuaja.' },
      { n: '03', ic: '🤝', t: 'Partneri planifikon', d: 'rootsGTM koordinon takimet.' },
      { n: '04', ic: '✈️', t: 'Mbërrini', d: 'Gjithçka e përgatitur.' },
      { n: '05', ic: '📄', t: 'Vijim', d: 'Kontrata & hapat e ardhshëm.' },
    ],
    concSpTitle: 'rootsGTM', concSpSub: 'rootsGTM është partneri ynë ekskluziv në Kosovë.',
    spDeals: 'Marrëveshje',
    concCtaTitle: 'Gati për vizitën tuaj?',
    concCtaFeats: ['✓ Përgjigje 24h', '✓ Pa paradhënie', '✓ Thirrje falas', '✓ Fleksibël'],
    concCtaBtn: '🗓 Kërko vizitë →',
    concBecomeTitle: 'Bëhu Partner',
    concBecomeSub: 'Organizatat, dhomat e tregtisë dhe rrjetet e shitjeve mund të aplikojnë për t\'u listuar si partner zyrtar. Listimi bazë është falas — vendosja e theksuar është opsion me pagesë.',
    concBecomeTypes: ['🏛️ Qeveri & Institucione', '📣 Rrjete Shitjesh', '🌍 Organizata Diasporë', '🤝 Dhoma Tregtie'],
    concBecomeBtn: 'Dërgo aplikimin →',
    bookTitle: 'Kërko vizitë', bookName: 'Emri *', bookComp: 'Kompania',
    bookEmail: 'E-mail *', bookGoal: 'Qëllimi', bookGoalPH: 'p.sh. Takim me ekipe software…',
    bookWhen: 'Periudha', bookPax: 'Pjesëmarrës', bookSend: 'Dërgo ✓',
    bookDoneTitle: 'Kërkesa u dërgua!', bookDoneSub: 'Ekipi ynë do t\'ju kontaktojë brenda 24 orësh.',
    partnerRegTitle: 'Apliko si Partner', partnerRegSub: 'Falas · Përgjigje brenda 48h',
    partnerOrg: 'Organizata / Emri *', partnerType: 'Lloji',
    partnerTypes: ['Qeveri / Autoritet', 'Rrjet Shitjesh', 'Dhomë Tregtie', 'Organizatë Diasporë', 'Tjetër'],
    partnerEmail: 'E-mail *', partnerDesc: 'Përshkrim i shkurtër',
    partnerDescPH: 'Çfarë mund të kontribuojë organizata juaj?', partnerSend: 'Dërgo ✓',
    partnerDoneTitle: 'Aplikimi u dërgua!', partnerDoneSub: "Do t'ju kontaktojmë brenda 48 orësh.",
    govBadge: 'Portal Zyrtar',
    govH1: 'Themelimi &', govH2: 'Investimi në Kosovë',
    govSub: 'Taksa të ulëta, Euro, perspektivë BE dhe talent i ri.',
    govSteps: [
      { ic: '🖥️', t: 'Regjistrim Online', d: 'ARBK online.', time: '1–3 ditë' },
      { ic: '💶', t: 'Kapitali', d: 'Min. 1 EUR.', time: '1 ditë' },
      { ic: '📋', t: 'Numri Fiskal', d: 'Automatikisht.', time: '1–2 ditë' },
      { ic: '🏦', t: 'Llogari Bankare', d: '10 banka.', time: '2–5 ditë' },
    ],
    govFactsH: '🇽🇰 Kosova',
    govFacts: [['10%', 'Tatim'], ['18%', 'TVSH'], ['1 EUR', 'Kapitali'], ['5–10 ditë', 'Themelimi'], ['EUR', 'Valuta'], ['1.8M', 'Banorë'], ['63%', 'Nën 35'], ['2008', 'Pavarësia']],
    govLinks: 'Lidhje Zyrtare',
    regTitle: 'Çfarë dëshironi?',
    regComp: '🏢 Kompani', regCompS: 'Firmë, Ekip, Agjenci',
    regFL: '👤 Freelancer', regFLS: 'I vetëpunësuar',
    regSP: '🤝 Partner', regSPS: "Falas · Përgjigje brenda 48h",
    regFree: 'Falas · 24–48h',
    regName: 'Emri / Kompania *', regCity: 'Qyteti *', regEmail: 'E-mail *',
    regDesc: 'Përshkrim', regDescPH: 'Çfarë ofroni?',
    regTags: 'Aftësi / Tags', regTagsPH: 'React, Node.js…',
    regSend: 'Dërgo ✓', regDoneTitle: 'U dërgua!', regDoneSub: 'Publikohet brenda 24–48h.',
    footer: '© 2025 Business Bridge Platform · Kosova',
    footLinks: ['Privatësia', 'Kushtet', 'Imprint', 'Kontakti'],
  },
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SLOTS = { sponsored: 3 }

// ─── NORMALISE DB ROW → App profile object ────────────────────────────────────
// Ensures both snake_case (raw DB) and camelCase keys are always present
function normaliseProfile(p) {
  if (!p) return p
  return {
    ...p,
    // Sponsored premium fields — accept both spellings
    prevCompanies:   p.prevCompanies   || p.prev_companies   || null,
    featuredProject: p.featuredProject || p.featured_project || null,
    linkedin:        p.linkedin        || null,
    github:          p.github          || null,
    certifications:  p.certifications  || null,
    availability:    p.availability    || null,
    videoUrl:        p.videoUrl        || p.video_url        || null,
    coverImage:      p.coverImage      || p.cover_image      || null,
    coverFocus:      p.coverFocus      || p.cover_focus      || '50% 50%',
    logoColor:       p.logoColor       || p.logo_color       || '#4a7fa5',
    logoUrl:         p.logoUrl         || p.logo_url         || null,
  }
}

const CATS = [
  { id: 'software',   icon: '💻', color: '#4a7fa5', labels: { en: 'Software & IT',     sq: 'Softuer & IT'      }, count: 0 },
  { id: 'support',    icon: '🛠️', color: '#6b7fa8', labels: { en: 'Tech Support',      sq: 'Mbështetje Tech'   }, count: 0 },
  { id: 'consulting', icon: '📊', color: '#5a8a6e', labels: { en: 'Consulting',         sq: 'Konsulencë'       }, count: 0 },
  { id: 'media',      icon: '🎬', color: '#7a6aaa', labels: { en: 'Media & Content',    sq: 'Media & Content'  }, count: 0 },
  { id: 'production', icon: '🏭', color: '#8a7055', labels: { en: 'Production',         sq: 'Prodhim'          }, count: 0 },
  { id: 'textile',    icon: '🧵', color: '#9a7878', labels: { en: 'Textile & Fashion',  sq: 'Tekstil & Modë'   }, count: 0 },
  { id: 'bpo',        icon: '📞', color: '#5c7a8a', labels: { en: 'BPO / Call Centre',  sq: 'BPO / Call Center'}, count: 0 },
  { id: 'design',     icon: '🎨', color: '#8a7a4a', labels: { en: 'Design & Creative',  sq: 'Dizajn & Kreativ' }, count: 0 },
  { id: 'logistics',  icon: '🚚', color: '#4a7a6e', labels: { en: 'Logistics',          sq: 'Logjistikë'       }, count: 0 },
  { id: 'legal',      icon: '⚖️', color: '#7a5a5a', labels: { en: 'Legal & Finance',    sq: 'Ligjor & Financa' }, count: 0 },
]


const PROFILES = [
  { id: 'c1', tier: 'sponsored', type: 'company', name: 'AlbaCode', cat: 'software', city: 'Pristina',
   tags: ['React', 'Node.js', 'TypeScript', 'Mobile'], rating: 4.9, reviews: 34, verified: true,
   employees: '15–30', founded: 2019, logo: 'AC', logoColor: '#4a7fa5',
   contact: 'hi@albacode.ks', phone: '+383 44 100 200',
   availFrom: '2025-05-01', availUntil: '2025-10-31', capacity: 4, remote: true, languages: 'DE, EN, SQ',
   skills: ['React', 'Node.js', 'TypeScript', 'React Native', 'PostgreSQL'],
   desc: { de: 'Full-Stack Entwicklung & Mobile Apps für EU-Märkte.', en: 'Full-stack development & mobile apps for EU markets.', sq: 'Zhvillim full-stack dhe aplikacione mobile.', sv: 'Full-stack och mobilappar för EU.' } },
  { id: 'f1', tier: 'premium', type: 'freelancer', name: 'Arton Krasniqi', cat: 'software', city: 'Pristina',
   tags: ['React', 'TypeScript', 'GraphQL'], rating: 4.9, reviews: 28, verified: true,
   availability: 'remote', experience: '7', logo: 'AK', logoColor: '#5a8a6e',
   contact: 'arton.k@dev.ks', phone: '+383 44 200 300',
   availFrom: '2025-06-01', availUntil: '2025-12-31', capacity: 1, remote: true, languages: 'DE, EN, SQ',
   skills: ['React', 'TypeScript', 'GraphQL', 'Next.js', 'Figma'],
   desc: { de: '7 Jahre React-Erfahrung. SaaS-Frontend-Spezialist.', en: '7 years React. SaaS frontend specialist.', sq: '7 vite React. Specialist frontend SaaS.', sv: '7 år React. SaaS-frontendspecialist.' } },
  { id: 'f4', tier: 'premium', type: 'freelancer', name: 'Visar Berisha', cat: 'software', city: 'Ferizaj',
   tags: ['Python', 'Django', 'PostgreSQL'], rating: 4.7, reviews: 15, verified: true,
   availability: 'remote', experience: '6', logo: 'VB', logoColor: '#c9943a',
   contact: 'v.berisha@gmail.com',
   availFrom: '2025-05-15', availUntil: '2025-09-30', capacity: 1, remote: true, languages: 'EN, SQ',
   skills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker'],
   desc: { de: 'Backend & Data Engineer. Python/Django.', en: 'Backend & data engineer. Python/Django.', sq: 'Backend dhe data engineer.', sv: 'Backend och dataingenjör.' } },
  { id: 'c5', tier: 'free', type: 'company', name: 'CloudNest Kosovo', cat: 'software', city: 'Pristina',
   tags: ['DevOps', 'Kubernetes', 'AWS'], rating: 4.6, reviews: 11, verified: true,
   employees: '5–10', founded: 2020, logo: 'CN', logoColor: '#4a7fa5',
   contact: 'team@cloudnest.io',
   availFrom: null, availUntil: null, capacity: null, remote: true, languages: 'EN, SQ',
   skills: ['DevOps', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
   desc: { de: 'Managed Cloud & DevOps für EU-Startups.', en: 'Managed cloud & DevOps for EU startups.', sq: 'Cloud i menaxhuar & DevOps.', sv: 'Molntjänst för EU-startups.' } },
  { id: 'c2', tier: 'sponsored', type: 'company', name: 'SupportXPro', cat: 'support', city: 'Gjakova',
   tags: ['24/7', 'Helpdesk', 'ITIL v4', 'DE/EN/SQ'], rating: 4.8, reviews: 58, verified: true,
   employees: '30–50', founded: 2018, logo: 'SX', logoColor: '#6b7fa8',
   contact: 'ops@supportxpro.ks', phone: '+383 44 300 400',
   availFrom: '2025-05-01', availUntil: null, capacity: 10, remote: true, languages: 'DE, EN, SQ',
   skills: ['Helpdesk', 'ITIL', 'Windows', 'CRM', 'Ticketing'],
   desc: { de: 'Mehrsprachiger Tech-Support, ITIL v4 zertifiziert.', en: 'Multilingual tech support, ITIL v4 certified.', sq: 'Mbështetje teknike shumëgjuhëshe.', sv: 'Flerspråkig support, ITIL v4.' } },
  { id: 'f5', tier: 'premium', type: 'freelancer', name: 'Flori Hyseni', cat: 'support', city: 'Gjakova',
   tags: ['IT-Support', 'Windows', 'CompTIA'], rating: 4.6, reviews: 12, verified: true,
   availability: 'remote', experience: '4', logo: 'FH', logoColor: '#6b7fa8',
   contact: 'flori@support.ks',
   availFrom: '2025-07-01', availUntil: '2025-12-31', capacity: 1, remote: true, languages: 'DE, EN, SQ',
   skills: ['IT-Support', 'Windows', 'CompTIA A+', 'Netzwerk', 'Remote Desktop'],
   desc: { de: 'Deutschsprachiger IT-Support. CompTIA A+.', en: 'German-speaking IT support. CompTIA A+.', sq: 'IT support gjermanisht. CompTIA A+.', sv: 'Tysktalande IT-support.' } },
  { id: 'f3', tier: 'premium', type: 'freelancer', name: 'Rina Morina', cat: 'consulting', city: 'Pristina',
   tags: ['Projektmanagement', 'Agile', 'PMP'], rating: 4.9, reviews: 23, verified: true,
   availability: 'remote', experience: '8', logo: 'RM', logoColor: '#5a8a6e',
   contact: 'rina.m@pm.ks', phone: '+383 44 400 500',
   availFrom: '2025-05-01', availUntil: '2025-08-31', capacity: 1, remote: true, languages: 'DE, EN, SQ, IT',
   skills: ['PMP', 'Agile', 'Scrum', 'JIRA', 'Confluence', 'MS Project'],
   desc: { de: 'Zertifizierte PMP-Projektmanagerin.', en: 'Certified PMP project manager.', sq: 'Menaxhere projektesh PMP.', sv: 'Certifierad PMP-projektledare.' } },
  { id: 'c6', tier: 'free', type: 'company', name: 'TechBridge Kosovo', cat: 'consulting', city: 'Prizren',
   tags: ['ERP', 'SAP', 'Digitalisierung'], rating: 4.7, reviews: 21, verified: true,
   employees: '10–20', founded: 2020, logo: 'TB', logoColor: '#5a8a6e',
   contact: 'info@techbridge-ks.com',
   availFrom: null, availUntil: null, capacity: null, remote: false, languages: 'DE, EN, SQ',
   skills: ['SAP', 'ERP', 'Digitalisierung', 'Change Management'],
   desc: { de: 'IT-Beratung & Digitaltransformation.', en: 'IT consulting & digital transformation.', sq: 'Konsulencë IT & transformim.', sv: 'IT-konsulting.' } },
  { id: 'c3', tier: 'sponsored', type: 'company', name: 'NexCall Solutions', cat: 'bpo', city: 'Pristina',
   tags: ['Inbound', 'Outbound', 'CRM', '6 Sprachen'], rating: 4.5, reviews: 44, verified: true,
   employees: '40–80', founded: 2017, logo: 'NC', logoColor: '#8a7070',
   contact: 'start@nexcall.ks',
   availFrom: null, availUntil: null, capacity: null, remote: true, languages: 'DE, EN, SQ, IT, TR, FR',
   skills: ['Call Center', 'CRM', 'Inbound', 'Outbound', 'Customer Service'],
   desc: { de: 'Call-Center für DACH-Kunden. 6 Sprachen.', en: 'Call centre for DACH. 6 languages.', sq: 'Qendër thirrjesh DACH. 6 gjuhë.', sv: 'Callcenter för DACH. 6 språk.' } },
  { id: 'f6', tier: 'premium', type: 'freelancer', name: 'Dea Berisha', cat: 'bpo', city: 'Pristina',
   tags: ['Kundenservice', 'DE/EN', 'CRM'], rating: 4.7, reviews: 31, verified: true,
   availability: 'remote', experience: '3', logo: 'DB', logoColor: '#8a7070',
   contact: 'dea.va@outlook.com',
   availFrom: null, availUntil: null, capacity: null, remote: true, languages: 'DE, EN, SQ',
   skills: ['Kundenservice', 'CRM', 'E-Mail Management', 'Deutsch native'],
   desc: { de: 'Native-Level Deutsch. Kundenbetreuung & CRM.', en: 'Native German. Customer service & CRM.', sq: 'Gjermanisht native. CRM.', sv: 'Infödd tyska. Kundservice.' } },
  { id: 'f2', tier: 'premium', type: 'freelancer', name: 'Blerta Gashi', cat: 'design', city: 'Prizren',
   tags: ['Figma', 'UI/UX', 'Branding'], rating: 4.8, reviews: 19, verified: true,
   availability: 'remote', experience: '5', logo: 'BG', logoColor: '#8a7a4a',
   contact: 'blerta.design@outlook.com',
   availFrom: null, availUntil: null, capacity: null, remote: true, languages: 'DE, EN, SQ',
   skills: ['Figma', 'UI/UX', 'Branding', 'Prototyping', 'Adobe XD'],
   desc: { de: 'UX-Designerin, Figma-Expertin.', en: 'UX designer, Figma expert.', sq: 'Dizajnere UX, eksperte Figma.', sv: 'UX-designer, Figma-expert.' } },
  { id: 'c4', tier: 'free', type: 'company', name: 'PixelDrin Studio', cat: 'design', city: 'Peja',
   tags: ['Branding', 'Motion', 'Video'], rating: 4.9, reviews: 29, verified: true,
   employees: '5–15', founded: 2021, logo: 'PD', logoColor: '#8a7a4a',
   contact: 'hello@pixeldrin.studio',
   availFrom: null, availUntil: null, capacity: null, remote: true, languages: 'EN, SQ',
   skills: ['Branding', 'Motion Design', 'Video', 'After Effects'],
   desc: { de: 'Kreativagentur für Brand Identity.', en: 'Creative agency for brand identity.', sq: 'Agjensi kreative.', sv: 'Kreativbyrå.' } },
]

const SALES_PEOPLE = [
  { id: 'sp1', name: 'Mentor Gashi', city: 'Pristina', languages: 'DE, EN, SQ', logo: 'MG', logoColor: '#3d7fa8', rating: 4.9, reviews: 47, deals: 124, experience: '8', title: { de: 'Senior Sales Spezialist', en: 'Senior Sales Specialist', sq: 'Specialist i Lartë Shitjesh', sv: 'Senior säljspecialist' }, specialties: { de: ['IT-Outsourcing', 'Firmengründung', 'Tech-Events'], en: ['IT Outsourcing', 'Company formation', 'Tech events'], sq: ['IT Outsourcing', 'Themelim', 'Evente'], sv: ['IT-outsourcing', 'Bolagsbildning', 'Event'] }, bio: { de: 'Ehemaliger BD-Manager bei deutschem IT-Konzern. 124 erfolgreiche EU-Kosova-Kooperationen.', en: 'Former BD manager at German IT company. 124 successful deals.', sq: 'Ish-menaxher BD. 124 bashkëpunime të suksesshme.', sv: 'Tidigare BD-chef. 124 framgångsrika affärer.' }, contact: 'mentor@bbplatform.com', phone: '+383 44 123 456' },
  { id: 'sp2', name: 'Fjolla Kelmendi', city: 'Prizren', languages: 'DE, EN, SQ, IT', logo: 'FK', logoColor: '#6b7fa8', rating: 4.8, reviews: 31, deals: 67, experience: '5', title: { de: 'Sales Spezialistin · Süd-Kosova', en: 'Sales Specialist · South Kosova', sq: 'Specialiste · Jug-Kosovë', sv: 'Säljspecialist · Södra Kosova' }, specialties: { de: ['Produktion', 'Design', 'E-Commerce'], en: ['Production', 'Design', 'E-Commerce'], sq: ['Prodhim', 'Dizajn', 'E-Commerce'], sv: ['Tillverkning', 'Design', 'E-handel'] }, bio: { de: 'MBA. Fokus auf Produktionsbetriebe. Handelskammer Prizren.', en: 'MBA. Focus on production. Prizren Chamber of Commerce.', sq: 'MBA. Fokus prodhimi. Dhoma Tregtie Prizren.', sv: 'MBA. Tillverkning. Handelskammare Prizren.' }, contact: 'fjolla@bbplatform.com', phone: '+383 45 234 567' },
  { id: 'sp3', name: 'Besnik Rama', city: 'Pristina', languages: 'EN, SQ, DE', logo: 'BR', logoColor: '#c9943a', rating: 4.7, reviews: 22, deals: 44, experience: '4', title: { de: 'Sales Spezialist · Startups', en: 'Sales Specialist · Startups', sq: 'Specialist · Startup', sv: 'Säljspecialist · Startups' }, specialties: { de: ['Startups', 'Software-Teams', 'Investoren'], en: ['Startups', 'Software teams', 'Investors'], sq: ['Startup', 'Ekipe software', 'Investitorë'], sv: ['Startups', 'Mjukvaruteam', 'Investerare'] }, bio: { de: 'Serial Entrepreneur, 2 Exits. Kennt die kosovarische Startup-Szene.', en: 'Serial entrepreneur, 2 exits. Kosova startup expert.', sq: 'Sipërmarrës serial, 2 exits. Ekspert startup.', sv: 'Serieentreprenör, 2 exiter.' }, contact: 'besnik@bbplatform.com', phone: '+383 46 345 678' },
]

// ─── THEME ────────────────────────────────────────────────────────────────────
const G = {
  bg: '#050d1b', surface: '#0a1828', card: 'rgba(255,255,255,0.025)',
  border: 'rgba(180,160,100,0.14)', gold: '#c9a44a', goldDim: 'rgba(201,164,74,0.10)',
  goldBorder: 'rgba(201,164,74,0.20)', text: '#e4ddd0', muted: 'rgba(228,221,208,0.48)',
  green: '#4a9e6b', red: '#c94040', blue: '#3d6fc4', purple: '#7b68b0',
  teal: '#3d7fa8', orange: '#c9943a',
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
html,body{overflow-x:hidden;max-width:100vw;}
#root{overflow-x:hidden;}
body{background:#050d1b;margin:0;-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a3040;border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes glow{0%,100%{box-shadow:0 0 0 rgba(201,164,74,0);}50%{box-shadow:0 0 24px rgba(201,164,74,0.24);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
@keyframes ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
.fu{animation:fadeUp 0.38s cubic-bezier(0.4,0,0.2,1) both;}
.fi{animation:fadeIn 0.26s ease both;}
.su{animation:slideUp 0.3s cubic-bezier(0.4,0,0.2,1) both;}
.sp{animation:spin 0.7s linear infinite;}
.glow{animation:glow 3s ease infinite;}
.pg{animation:pulse 2s ease infinite;}
.btn{border:none;cursor:pointer;font-family:'Inter',sans-serif;transition:all 0.18s cubic-bezier(0.4,0,0.2,1);border-radius:6px;-webkit-tap-highlight-color:transparent;}
.btn:active{transform:scale(0.97) !important;}
.gbtn{background:linear-gradient(135deg,#c9a44a 0%,#a8833a 100%);color:#050d1b;padding:10px 22px;font-family:'Raleway',sans-serif;font-weight:700;font-size:13px;letter-spacing:1px;text-transform:uppercase;}
.gbtn:hover{background:#e5ba55;transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,164,74,0.32);}
.gbtn:disabled{opacity:0.38;cursor:not-allowed;transform:none !important;box-shadow:none;}
.ghost{background:transparent;color:rgba(228,221,208,0.50);padding:9px 16px;font-size:13px;border:1px solid rgba(255,255,255,0.09);font-weight:500;}
.ghost:hover{color:#0d2240;border-color:rgba(201,164,74,0.35);background:rgba(201,164,74,0.04);}
.teal-btn{background:linear-gradient(135deg,#3d6fc4 0%,#2a4f9e 100%);color:white;padding:10px 22px;font-family:'Raleway',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.5px;}
.teal-btn:hover{opacity:0.9;transform:translateY(-2px);box-shadow:0 8px 24px rgba(61,111,168,0.28);}
.card{background:rgba(255,255,255,0.02);border:1px solid rgba(180,160,100,0.12);border-radius:12px;transition:all 0.24s cubic-bezier(0.4,0,0.2,1);}
.card:hover{background:rgba(255,255,255,0.04);border-color:rgba(201,164,74,0.38);transform:translateY(-3px);box-shadow:0 18px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(201,164,74,0.10);}
.inp{background:rgba(255,255,255,0.04);border:1px solid rgba(180,160,100,0.18);border-radius:6px;padding:10px 13px;color:#e4ddd0;font-size:14px;outline:none;width:100%;font-family:'Inter',sans-serif;transition:border-color 0.18s,box-shadow 0.18s,background 0.18s;}
.inp:focus{border-color:#c9a44a;box-shadow:0 0 0 3px rgba(201,164,74,0.09);background:rgba(255,255,255,0.07);}
.inp::placeholder{color:rgba(228,221,208,0.30);}
.inp:hover:not(:focus){border-color:rgba(255,255,255,0.18);}
select.inp{cursor:pointer;}
textarea.inp{line-height:1.6;}
.navl{background:transparent;color:rgba(228,221,208,0.88);padding:7px 13px;font-size:12px;font-family:'Raleway',sans-serif;font-weight:700;letter-spacing:0.7px;text-transform:uppercase;border:none;cursor:pointer;border-radius:5px;transition:all 0.16s;}
.navl:hover{color:#c9a44a;background:rgba(201,164,74,0.10);}
.navl.on{color:#c9a44a;background:rgba(201,164,74,0.14);border-bottom:2px solid #c9a44a;}
.tag{display:inline-block;background:rgba(74,127,165,0.08);color:#8eb4d4;border:1px solid rgba(74,127,165,0.15);border-radius:5px;padding:2px 7px;font-size:11px;transition:all 0.16s;}
.modal-bg{position:fixed;inset:0;background:rgba(4,8,20,0.88);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(12px);}
.modal{background:#0a1828;border:1px solid rgba(201,164,74,0.22);border-radius:18px;padding:28px 24px;max-width:500px;width:100%;max-height:92vh;overflow-y:auto;}
.flabel{display:block;font-family:'Raleway',sans-serif;font-size:10px;font-weight:700;color:rgba(228,221,208,0.50);margin-bottom:5px;letter-spacing:1.2px;text-transform:uppercase;}
.sp-bar{height:3px;border-radius:14px 14px 0 0;background:linear-gradient(90deg,#c9a44a,#e8cc8a,rgba(201,164,74,0.3));}
.pr-bar{height:3px;border-radius:14px 14px 0 0;background:linear-gradient(90deg,#c9a44a,#fde68a);}
.sector-pills-mobile{display:none;}
.sector-pills-desktop{display:flex;}
.rank-badge{position:absolute;top:10px;right:10px;}
.filters-sticky-panel{top:0px !important;}
.filters-sticky-panel{top:0px !important;}

@media(max-width:640px){
  nav{padding:0 10px !important;height:56px !important;overflow:visible !important;}
  .nav-links{display:none !important;}
  .nav-lang{display:none !important;}
  .nav-reg-btn{display:none !important;}
  .hamburger{display:flex !important;}
  .nav-brand-text{font-size:11px !important;}
  .hero-pad{padding:32px 16px 24px !important;}
  .section-pad{padding:0 16px !important;}
  .page-pad{padding:16px 16px !important;}
  .page-pad-lg{padding:20px 16px !important;}
  .hero-h1{font-size:28px !important;letter-spacing:-0.5px !important;}
  .grid-2col{grid-template-columns:1fr !important;}
  .grid-3col{grid-template-columns:1fr !important;}
  .grid-4col{grid-template-columns:1fr 1fr !important;}
  .grid-cards{grid-template-columns:1fr !important;}
  .home-features{grid-template-columns:1fr !important;}
  .stat-grid{grid-template-columns:1fr 1fr !important;}
  .pkg-grid{grid-template-columns:1fr !important;}
  .step-grid{grid-template-columns:1fr 1fr !important;}
  .reg-types{flex-direction:column !important;}
  .admin-stats{grid-template-columns:1fr 1fr !important;}
  .admin-tabs{flex-wrap:wrap !important;}
  .admin-edit-2col{grid-template-columns:1fr !important;}
  .admin-edit-3col{grid-template-columns:1fr !important;}
  .admin-settings{grid-template-columns:1fr !important;}
  .partner-cards{grid-template-columns:1fr !important;}
  .footer-inner{flex-direction:column !important;gap:12px !important;}
  .search-row{flex-direction:column !important;}
  .match-cats{gap:6px !important;}
  .nav-reg-btn{display:none !important;}
  /* Concierge responsive */
  .conc-hero{padding:32px 16px 24px !important;}
  .conc-content{padding:24px 16px 40px !important;}
  .conc-partners-grid{grid-template-columns:1fr !important;}
  .conc-pkg-grid{grid-template-columns:1fr !important;}
  .conc-partner-card{padding:14px 13px !important;}
  .conc-partner-card .gp-header{gap:10px !important;margin-bottom:12px !important;flex-wrap:wrap !important;}
  .conc-partner-card .gp-logo{width:46px !important;height:46px !important;border-radius:11px !important;}
  .conc-partner-card .gp-logo span{font-size:18px !important;}
  .conc-partner-card .gp-name{font-size:14px !important;line-height:1.25 !important;}
  .conc-partner-card .gp-sub{font-size:10px !important;}
  .conc-partner-card .gp-badge{font-size:9px !important;padding:2px 7px !important;}
  .conc-partner-card .gp-desc{font-size:12px !important;margin-bottom:12px !important;line-height:1.55 !important;}
  .conc-partner-card .partner-feat-grid{grid-template-columns:1fr 1fr !important;gap:5px !important;margin-bottom:12px !important;}
  .conc-partner-card .partner-feat-item{padding:7px 8px !important;font-size:10px !important;}
  /* Sector pills → dropdown on mobile */
  .sector-pills-desktop{display:none !important;}
  .sector-pills-mobile{display:block !important;}
  /* Match filter bar compact on mobile */
  .match-filter-bar{padding:10px 12px !important;}
  .match-filter-label{font-size:13px !important;}
  .match-filter-sub{display:none !important;}
  /* Filters panel compact on mobile */
  .filters-sticky-panel{padding:10px 12px !important;border-radius:10px !important;}
}
@media(min-width:641px) and (max-width:900px){
  .hero-pad{padding:40px 24px 32px !important;}
  .section-pad{padding:0 24px !important;}
  .page-pad{padding:20px 24px !important;}
  .grid-3col{grid-template-columns:1fr 1fr !important;}
  .grid-4col{grid-template-columns:1fr 1fr !important;}
  .pkg-grid{grid-template-columns:1fr 1fr !important;}
  .home-features{grid-template-columns:1fr 1fr !important;}
  .admin-stats{grid-template-columns:repeat(2,1fr) !important;}
}
@keyframes ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
`
// ─── HELPERS ─────────────────────────────────────────────────────────────────
const catLabel = (id, lang) => CATS.find(c => c.id === id)?.labels[lang] || id
const catColor  = id => CATS.find(c => c.id === id)?.color || G.gold
const catIcon   = id => CATS.find(c => c.id === id)?.icon || '🏢'

function Stars({ r }) {
  return (
    <span style={{ color: G.gold, fontSize: 12 }}>
      {'★'.repeat(Math.round(r))}
      <span style={{ color: 'rgba(180,160,100,0.16)' }}>{'★'.repeat(5 - Math.round(r))}</span>
    </span>
  )
}

// ─── BG VIDEO — handles mobile autoplay (iOS requires .play() call) ───────────
function BgVideo() {
  const ref = React.useRef(null)
  React.useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    const tryPlay = () => v.play().catch(() => {})
    tryPlay()
    // iOS needs a user gesture first — attempt again on first touch/click
    document.addEventListener('touchstart', tryPlay, { once: true, passive: true })
    document.addEventListener('click',      tryPlay, { once: true })
    return () => {
      document.removeEventListener('touchstart', tryPlay)
      document.removeEventListener('click',      tryPlay)
    }
  }, [])
  return (
    <video ref={ref} autoPlay loop muted playsInline
      preload="auto"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', WebkitTransform:'translateZ(0)', transform:'translateZ(0)', willChange:'transform' }}>
      <source src="/bg-video.mp4" type="video/mp4" />
    </video>
  )
}


// ─── VIDEO BACKGROUND — handles mobile autoplay properly ─────────────────────
function VideoBackground({ src }) {
  const ref = React.useRef(null)
  React.useEffect(() => {
    const v = ref.current
    if (!v) return
    v.muted = true
    const tryPlay = () => v.play().catch(() => {})
    tryPlay()
    // Retry on first touch/click if autoplay was blocked (common on mobile)
    const retry = () => { v.muted = true; tryPlay() }
    document.addEventListener('touchstart', retry, { once: true })
    document.addEventListener('click', retry, { once: true })
    // Resume on page visibility change
    const onVisible = () => { if (!document.hidden) tryPlay() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('touchstart', retry)
      document.removeEventListener('click', retry)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [src])
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden', WebkitBackfaceVisibility:'hidden', backfaceVisibility:'hidden' }}>
      <video ref={ref} autoPlay loop muted playsInline preload="auto"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', WebkitTransform:'translateZ(0)', transform:'translateZ(0)', willChange:'transform' }}>
        <source src={src} type="video/mp4" />
      </video>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(5,13,27,0.68) 0%, rgba(5,13,27,0.45) 45%, rgba(5,13,27,0.68) 100%)' }} />
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'45%', background:'linear-gradient(0deg, rgba(5,13,27,0.97) 0%, rgba(5,13,27,0.70) 40%, transparent 100%)' }} />
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'18%', background:'linear-gradient(180deg, rgba(5,13,27,0.50) 0%, transparent 100%)' }} />
    </div>
  )
}

function hexToRgba(hex, alpha) {
  try {
    const h = hex.replace('#','')
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16)
    return `rgba(${r},${g},${b},${alpha})`
  } catch { return `rgba(61,111,168,${alpha})` }
}

// ─── ANIMATED CONNECTION LINES — Kosovo to world cities ──────────────────────
function ConnectionLines() {
  // Kosovo center = center of the enlarged Kosovo glow on the background image
  // Detected via pixel analysis of the actual background image (1536x1024, displayed at 1440x900)
  const K = { x: 730, y: 408 }

  // World capital dots — pixel-detected from the actual background image
  const routes = [
    { x: 548, y: 235, city: 'London',       delay: 0,   dur: 10, color: '#c9a44a' },
    { x: 648, y: 165, city: 'Stockholm',    delay: 1.5, dur: 11, color: '#4a7fa5' },
    { x: 879, y: 203, city: 'Moscow',       delay: 3.0, dur: 9,  color: '#c9a44a' },
    { x: 289, y: 293, city: 'New York',     delay: 0.8, dur: 13, color: '#4a7fa5' },
    { x: 205, y: 416, city: 'Washington',   delay: 5.5, dur: 12, color: '#c9a44a' },
    { x: 304, y: 603, city: 'São Paulo',    delay: 2.2, dur: 14, color: '#4a7fa5' },
    { x: 428, y: 636, city: 'Buenos Aires', delay: 7.0, dur: 13, color: '#c9a44a' },
    { x: 1125, y: 332, city: 'Beijing',     delay: 4.0, dur: 11, color: '#4a7fa5' },
    { x: 1149, y: 378, city: 'Tokyo',       delay: 2.8, dur: 12, color: '#c9a44a' },
    { x: 1091, y: 518, city: 'Singapore',   delay: 6.0, dur: 13, color: '#4a7fa5' },
    { x: 639,  y: 692, city: 'Nairobi',     delay: 4.8, dur: 11, color: '#c9a44a' },
  ]

  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', zIndex:1, pointerEvents:'none' }}
         viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">

      {/* Kosovo glow rings */}
      <circle cx={K.x} cy={K.y} r="42" fill="rgba(201,164,74,0.06)">
        <animate attributeName="r" values="32;58;32" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0.2;1" dur="4s" repeatCount="indefinite"/>
      </circle>
      <circle cx={K.x} cy={K.y} r="20" fill="rgba(201,164,74,0.12)">
        <animate attributeName="r" values="15;30;15" dur="3s" begin="0.6s" repeatCount="indefinite"/>
      </circle>
      <circle cx={K.x} cy={K.y} r="6" fill="#c9a44a" opacity="0.90"/>
      <circle cx={K.x} cy={K.y} r="2.5" fill="#0d2240"/>

      {routes.map((r, i) => {
        // Control point arcs above the straight line for a natural globe arc
        const cpx = (K.x + r.x) / 2
        const offset = Math.hypot(r.x - K.x, r.y - K.y) * 0.18 + 40
        const cpy = Math.min(K.y, r.y) - offset
        const pathD = `M ${K.x} ${K.y} Q ${cpx} ${cpy} ${r.x} ${r.y}`
        const op = r.color === '#c9a44a' ? 0.42 : 0.32

        return (
          <g key={i}>
            {/* Arc line draws then fades */}
            <path d={pathD} fill="none" stroke={r.color}
              strokeWidth="0.9" strokeLinecap="round" strokeDasharray="1400">
              <animate attributeName="stroke-dashoffset"
                values="1400;0;0;1400" keyTimes="0;0.42;0.80;1"
                dur={`${r.dur}s`} begin={`${r.delay}s`} repeatCount="indefinite"/>
              <animate attributeName="stroke-opacity"
                values="0;${op};${op};0" keyTimes="0;0.06;0.80;1"
                dur={`${r.dur}s`} begin={`${r.delay}s`} repeatCount="indefinite"/>
            </path>

            {/* Traveling dot */}
            <circle r="2.0" fill={r.color}>
              <animate attributeName="opacity"
                values="0;0.95;0.95;0;0" keyTimes="0;0.05;0.40;0.44;1"
                dur={`${r.dur}s`} begin={`${r.delay}s`} repeatCount="indefinite"/>
              <animateMotion dur={`${r.dur}s`} begin={`${r.delay}s`}
                repeatCount="indefinite" path={pathD}
                calcMode="spline" keyTimes="0;1"
                keySplines="0.4 0 0.6 1"/>
            </circle>

            {/* Destination dot + arrival ring */}
            <circle cx={r.x} cy={r.y} r="2.8" fill={r.color}>
              <animate attributeName="opacity"
                values="0;0;0.80;0.35;0" keyTimes="0;0.40;0.46;0.80;1"
                dur={`${r.dur}s`} begin={`${r.delay}s`} repeatCount="indefinite"/>
            </circle>
            <circle cx={r.x} cy={r.y} r="3" fill="none" stroke={r.color} strokeWidth="0.7">
              <animate attributeName="r" values="3;16;3" keyTimes="0;0.9;1"
                dur="2.0s" begin={`${r.delay + r.dur * 0.44}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.55;0;0.55" keyTimes="0;0.9;1"
                dur="2.0s" begin={`${r.delay + r.dur * 0.44}s`} repeatCount="indefinite"/>
            </circle>
          </g>
        )
      })}
    </svg>
  )
}

function Logo({ text, color, size = 44, url = null }) {
  if (url) {
    return (
      <div style={{ width: size, height: size, borderRadius: 10, overflow: 'hidden', border: `1px solid rgba(255,255,255,0.10)`, flexShrink: 0 }}>
        <img src={url} alt={text} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 10, background: `linear-gradient(135deg,${color}20,${color}46)`, border: `1px solid ${color}32`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: size > 36 ? 13 : 11, color, flexShrink: 0 }}>
      {text}
    </div>
  )
}

function Avatar({ text, color, size = 46 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg,${color}28,${color}56)`, border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 14, color, flexShrink: 0 }}>
      {text}
    </div>
  )
}

// ─── COVER FOCUS PICKER — 3×3 grid to choose which part of a cover image shows ──
// ─── COVER CROP PICKER — drag + zoom, produces a perfectly cropped image ──────
function CoverCropPicker({ image, onApply, accentColor = '#c9a44a' }) {
  const [offsetX, setOffsetX]   = React.useState(50)  // 0–100: position within the pannable range
  const [offsetY, setOffsetY]   = React.useState(50)
  const [zoom, setZoom]         = React.useState(1)
  const [natural, setNatural]   = React.useState(null) // { w, h } of the source image
  const dragging   = React.useRef(false)
  const startPos    = React.useRef({ x: 0, y: 0, ox: 50, oy: 50 })
  const containerRef = React.useRef()

  if (!image) return null

  const CONTAINER_ASPECT = 3 // output is 900×300 → 3:1

  // Base "cover" size as a % of the container, BEFORE zoom is applied.
  // One dimension is always exactly 100% (the tightly-fitted one); the other
  // overflows according to how the image's aspect ratio differs from 3:1.
  let baseWidthPct = 100, baseHeightPct = 100
  if (natural && natural.w && natural.h) {
    const imgAspect = natural.w / natural.h
    if (imgAspect >= CONTAINER_ASPECT) {
      baseHeightPct = 100
      baseWidthPct  = (imgAspect / CONTAINER_ASPECT) * 100
    } else {
      baseWidthPct  = 100
      baseHeightPct = (CONTAINER_ASPECT / imgAspect) * 100
    }
  }

  const dispWidthPct  = baseWidthPct  * zoom
  const dispHeightPct = baseHeightPct * zoom
  const extraWidthPct  = Math.max(0, dispWidthPct  - 100)
  const extraHeightPct = Math.max(0, dispHeightPct - 100)
  const leftPct = -(extraWidthPct  * offsetX / 100)
  const topPct  = -(extraHeightPct * offsetY / 100)

  const applyDelta = (dxPx, dyPx) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const dxPct = (dxPx / rect.width)  * 100
    const dyPct = (dyPx / rect.height) * 100
    const dOffsetX = extraWidthPct  > 0 ? (dxPct / extraWidthPct)  * 100 : 0
    const dOffsetY = extraHeightPct > 0 ? (dyPct / extraHeightPct) * 100 : 0
    setOffsetX(Math.max(0, Math.min(100, startPos.current.ox - dOffsetX)))
    setOffsetY(Math.max(0, Math.min(100, startPos.current.oy - dOffsetY)))
  }

  const handleMouseDown = e => {
    dragging.current = true
    startPos.current = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY }
    e.preventDefault()
  }
  const handleMouseMove = e => {
    if (!dragging.current) return
    applyDelta(e.clientX - startPos.current.x, e.clientY - startPos.current.y)
  }
  const handleMouseUp = () => { dragging.current = false }

  // Touch support
  const handleTouchStart = e => {
    dragging.current = true
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: offsetX, oy: offsetY }
  }
  const handleTouchMove = e => {
    if (!dragging.current) return
    applyDelta(e.touches[0].clientX - startPos.current.x, e.touches[0].clientY - startPos.current.y)
    e.preventDefault()
  }

  const applyCrop = () => {
    const img = new Image()
    img.onload = () => {
      const W = 900, H = 300   // 3:1 output
      const c = document.createElement('canvas')
      c.width = W; c.height = H
      const ctx = c.getContext('2d')
      const baseScale = Math.max(W / img.width, H / img.height) * zoom
      const sw = W / baseScale, sh = H / baseScale
      const sx = Math.max(0, Math.min(img.width  - sw, (img.width  - sw) * offsetX / 100))
      const sy = Math.max(0, Math.min(img.height - sh, (img.height - sh) * offsetY / 100))
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)
      onApply(c.toDataURL('image/webp', 0.88))
    }
    img.src = image
  }

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontSize: 10, color: 'rgba(228,221,208,0.55)', marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>
        🖱 Drag to reposition · Slider to zoom · Click Apply to confirm
      </div>
      {/* Drag area — 3:1 preview */}
      <div ref={containerRef}
        style={{ position:'relative', width:'100%', maxWidth:300, height:100, borderRadius:10, overflow:'hidden',
          border:`2px solid ${accentColor}55`, cursor:'grab', userSelect:'none', touchAction:'none', background:'#000' }}
        onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleMouseUp}>
        <img src={image} alt="" draggable={false}
          onLoad={e => setNatural({ w: e.target.naturalWidth, h: e.target.naturalHeight })}
          style={{
            position:'absolute',
            width:`${dispWidthPct}%`, height:`${dispHeightPct}%`,
            left:`${leftPct}%`, top:`${topPct}%`,
            maxWidth:'none', display:'block', pointerEvents:'none',
          }} />
        {/* Guide text overlay */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
          <span style={{ fontSize:9, color:'rgba(255,255,255,0.35)', background:'rgba(0,0,0,0.3)', borderRadius:4, padding:'2px 6px' }}>
            drag to adjust
          </span>
        </div>
      </div>
      {/* Zoom slider */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:8 }}>
        <span style={{ fontSize:10, color:'rgba(228,221,208,0.45)', flexShrink:0 }}>Zoom</span>
        <input type="range" min="1" max="3" step="0.05" value={zoom}
          onChange={e => setZoom(parseFloat(e.target.value))}
          style={{ flex:1, accentColor }} />
        <span style={{ fontSize:10, color:`${accentColor}cc`, width:30, textAlign:'right', flexShrink:0 }}>{zoom.toFixed(1)}×</span>
      </div>
      {/* Apply button */}
      <button onClick={applyCrop} style={{ marginTop:10, width:'100%', padding:'7px', fontSize:11, fontWeight:700,
        background:`linear-gradient(135deg,${accentColor},${accentColor}99)`, border:'none', borderRadius:8,
        color:'#050d1b', cursor:'pointer' }}>
        ✓ Apply crop
      </button>
    </div>
  )
}

// Keep backward-compat alias for places still using CoverFocusPicker
function CoverFocusPicker({ image, focus, onChange, accentColor = '#c9a44a' }) {
  if (!image) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ fontSize: 10, color: 'rgba(228,221,208,0.50)', marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>
        Click to choose which part of the image to show:
      </div>
      <div style={{ position: 'relative', width: '100%', maxWidth: 240, borderRadius: 9, overflow: 'hidden', border: `1px solid ${accentColor}40` }}>
        <img src={image} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', objectPosition: focus || '50% 50%', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr' }}>
          {['0% 0%','50% 0%','100% 0%','0% 50%','50% 50%','100% 50%','0% 100%','50% 100%','100% 100%'].map(pt => (
            <button key={pt} onClick={() => onChange(pt)}
              style={{ border: (focus||'50% 50%') === pt ? `2px solid ${accentColor}` : '1px solid rgba(255,255,255,0.18)', background: (focus||'50% 50%') === pt ? `${accentColor}25` : 'rgba(0,0,0,0.05)', cursor: 'pointer' }}>
              {(focus||'50% 50%') === pt && <span style={{ color: accentColor, fontSize: 12 }}>●</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Spin() {
  return <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', flexShrink: 0 }} className="sp" />
}


function ModalClose({ onClose }) {
  return <button onClick={onClose} className="btn ghost" style={{ padding: '5px 10px', fontSize: 15, alignSelf: 'flex-start' }}>✕</button>
}

// ─── PROFILE DETAIL MODAL ────────────────────────────────────────────────────
function ProfileDetailModal({ p, lang, t, onClose, onContact }) {
  if (!p) return null
  const isFL = p.type === 'freelancer'
  const isPartner = p.type === 'partner'
  const isSp = p.tier === 'sponsored'
  const website = p.website ? p.website.replace(/^https?:\/\//,'') : null
  const sectorColor = CATS.find(c => c.id === p.cat)?.color
  const accentColor = isPartner ? '#3d7fa8' : isSp ? '#c9943a' : sectorColor || p.logoColor || '#4a7fa5'

  if (isSp && !isPartner) {
    // ── PREMIUM SPONSORED MODAL — LinkedIn-style hero ─────────────────────────
    return (
      <div className="modal-bg fi" onClick={e => e.target===e.currentTarget && onClose()}>
        <div style={{ background:'#0a1828', border:'1px solid rgba(251,146,60,0.45)', borderRadius:20, width:'100%', maxWidth:620, maxHeight:'94vh', overflowY:'auto', position:'relative', boxShadow:'0 24px 80px rgba(0,0,0,0.6),0 0 60px rgba(251,146,60,0.08)', margin:'0 auto' }}>

          {/* ── COVER BANNER ── */}
          <div style={{ position:'relative', height: p.coverImage ? 140 : 72, borderRadius:'20px 20px 0 0', overflow:'hidden', flexShrink:0 }}>
            {p.coverImage
              ? <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: p.coverFocus||'50% 50%' }} />
              : <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${p.logoColor||'#c9943a'}28 0%,rgba(251,146,60,0.08) 55%,rgba(14,20,32,0.95) 100%)` }} />
            }
            {/* Subtle dark overlay at bottom so logo pops */}
            {p.coverImage && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'50%', background:'linear-gradient(0deg,rgba(14,20,32,0.55) 0%,transparent 100%)' }} />}
            {/* Top orange accent line */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#c9943a,#c9a44a,rgba(251,146,60,0.4),transparent)' }} />
            {/* Close button */}
            <button onClick={onClose} style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:7, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', fontSize:13, backdropFilter:'blur(8px)', zIndex:2 }}>✕</button>
          </div>

          {/* ── LOGO — overlaps bottom of cover ── */}
          <div style={{ position:'relative', padding:'0 20px', marginTop:-36 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
              <div style={{ width:72, height:72, borderRadius:16, overflow:'hidden', flexShrink:0,
                border:'3px solid #0a1828',
                boxShadow:`0 0 0 2px ${p.logoColor||'#c9943a'}55, 0 4px 20px rgba(0,0,0,0.5)`,
                display:'flex', alignItems:'center', justifyContent:'center',
                background:`linear-gradient(135deg,${p.logoColor||'#c9943a'}22,${p.logoColor||'#c9943a'}44)` }}>
                {p.logoUrl ? <img src={p.logoUrl} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : <span style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:22, color:p.logoColor||'#c9943a' }}>{(p.logo||p.name||'?').slice(0,2)}</span>}
              </div>
              <div style={{ display:'flex', gap:5, paddingBottom:6, flexWrap:'wrap' }}>
                <span style={{ fontSize:9, background:'rgba(251,146,60,0.18)', color:'#c9943a', border:'1px solid rgba(251,146,60,0.4)', borderRadius:20, padding:'2px 9px', fontWeight:800, letterSpacing:'0.1px' }}>🚀 SPONSORED</span>
                {p.verified && <span style={{ fontSize:9, background:'rgba(52,199,89,0.12)', color:G.green, border:'1px solid rgba(52,199,89,0.25)', borderRadius:20, padding:'2px 9px', fontWeight:700 }}>✓ VERIFIED</span>}
              </div>
            </div>

            {/* ── NAME + META — below logo ── */}
            <div style={{ marginTop:10 }}>
              <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:'clamp(17px,4vw,23px)', letterSpacing:'-0.1px', lineHeight:1.1, marginBottom:4 }}>{p.name}</div>
              <div style={{ fontSize:11, color:'rgba(228,221,208,0.55)', display:'flex', gap:7, flexWrap:'wrap', marginBottom:10 }}>
                {p.city && <span>📍 {p.city}</span>}
                {p.cat && <span>· {catLabel(p.cat, lang)}</span>}
                {isFL && p.languages && <span>· 🗣 {p.languages}</span>}
                {!isFL && p.employees && <span>· 👥 {p.employees}</span>}
              </div>
            </div>
          </div>

          <div style={{ padding:'4px 20px 20px' }}>
            {p.availability && (
              <div style={{ marginBottom:12 }}>
                <span style={{ fontSize:10, fontWeight:700, padding:'3px 12px', borderRadius:20, fontFamily:"'Inter',sans-serif",
                  background: p.availability==='available'?'rgba(52,199,89,0.12)':p.availability==='limited'?'rgba(251,146,60,0.12)':'rgba(255,255,255,0.05)',
                  color: p.availability==='available'?G.green:p.availability==='limited'?G.orange:G.muted,
                  border: `1px solid ${p.availability==='available'?'rgba(52,199,89,0.3)':p.availability==='limited'?'rgba(251,146,60,0.3)':'rgba(180,160,100,0.10)'}` }}>
                  {p.availability==='available'?'🟢 Available now':p.availability==='limited'?'🟡 Limited capacity':'🔴 Currently booked'}
                </span>
              </div>
            )}
            {(p.desc?.[lang]||p.desc?.en) && (
              <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:'rgba(228,221,208,0.82)', lineHeight:1.7, marginBottom:14 }}>{p.desc[lang]||p.desc.en}</p>
            )}
            {(p.tags||[]).length>0 && (
              <div style={{ marginBottom:13 }}>
                <div style={{ fontSize:9, color:'rgba(251,146,60,0.65)', marginBottom:6, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Expertise & Services</div>
                <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                  {p.tags.map(tg=><span key={tg} style={{ fontSize:10, background:'rgba(251,146,60,0.1)', color:'#c9943a', border:'1px solid rgba(251,146,60,0.25)', borderRadius:20, padding:'3px 10px', fontWeight:600 }}>{tg}</span>)}
                </div>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:7, marginBottom:13 }}>
              {p.markets && <div style={{ background:'rgba(251,146,60,0.05)', border:'1px solid rgba(251,146,60,0.15)', borderRadius:8, padding:'8px 11px' }}>
                <div style={{ fontSize:9, color:'rgba(251,146,60,0.6)', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Markets</div>
                <div style={{ fontSize:11, fontWeight:600 }}>🌍 {p.markets}</div>
              </div>}
              <div style={{ background:'rgba(251,146,60,0.05)', border:'1px solid rgba(251,146,60,0.15)', borderRadius:8, padding:'8px 11px' }}>
                <div style={{ fontSize:9, color:'rgba(251,146,60,0.6)', marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Engagement</div>
                <div style={{ fontSize:11, fontWeight:600 }}>💼 {t.rateNote}</div>
              </div>
            </div>
            {p.prevCompanies && <div style={{ marginBottom:11 }}><div style={{ fontSize:9, color:'rgba(251,146,60,0.65)', marginBottom:5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Previous clients</div><div style={{ background:'rgba(251,146,60,0.04)', border:'1px solid rgba(251,146,60,0.14)', borderRadius:8, padding:'9px 11px', fontSize:12, color:'rgba(228,221,208,0.80)' }}>🏢 {p.prevCompanies}</div></div>}
            {p.featuredProject && <div style={{ marginBottom:11 }}><div style={{ fontSize:9, color:'rgba(251,146,60,0.65)', marginBottom:5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Featured project</div><div style={{ background:'rgba(251,146,60,0.04)', border:'1px solid rgba(251,146,60,0.14)', borderRadius:8, padding:'9px 11px', fontSize:12, color:'rgba(228,221,208,0.80)' }}>🎯 {p.featuredProject}</div></div>}
            {p.certifications && <div style={{ marginBottom:11 }}><div style={{ fontSize:9, color:'rgba(251,146,60,0.65)', marginBottom:5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Certifications & Awards</div><div style={{ background:'rgba(251,146,60,0.04)', border:'1px solid rgba(251,146,60,0.14)', borderRadius:8, padding:'9px 11px', fontSize:12, color:'rgba(228,221,208,0.80)' }}>🏅 {p.certifications}</div></div>}
            {(p.linkedin||p.github) && (
              <div style={{ display:'flex', gap:7, marginBottom:11, flexWrap:'wrap' }}>
                {p.linkedin && <a href={`https://${p.linkedin.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:'rgba(251,146,60,0.06)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:8, color:'#c9943a', textDecoration:'none', fontSize:11, fontWeight:600 }}>in LinkedIn ↗</a>}
                {p.github && <a href={`https://${p.github.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', background:'rgba(251,146,60,0.06)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:8, color:'#c9943a', textDecoration:'none', fontSize:11, fontWeight:600 }}>⬡ Portfolio ↗</a>}
              </div>
            )}
            {p.videoUrl && <div style={{ marginBottom:11 }}><a href={p.videoUrl.startsWith('http')?p.videoUrl:`https://${p.videoUrl}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:9, padding:'9px 13px', background:'rgba(251,146,60,0.06)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:10, textDecoration:'none' }}><span style={{ width:28, height:28, borderRadius:6, background:'rgba(251,146,60,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>▶</span><div><div style={{ fontSize:11, fontWeight:700, color:'#c9943a' }}>Watch intro video</div><div style={{ fontSize:9, color:'rgba(251,146,60,0.55)', marginTop:1 }}>{p.videoUrl.replace(/^https?:\/\//,'').slice(0,36)}</div></div></a></div>}
            {website && <div style={{ background:'rgba(251,146,60,0.06)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:10, padding:'9px 13px', marginBottom:13, display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:15 }}>🌐</span><a href={`https://${website}`} target="_blank" rel="noopener noreferrer" style={{ color:'#c9943a', textDecoration:'none', fontWeight:600, fontSize:12, wordBreak:'break-all' }}>{website} ↗</a></div>}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {p.contact && <button className="btn" style={{ flex:1, minWidth:110, padding:'11px', fontSize:13, fontWeight:700, background:'linear-gradient(135deg,#c9943a,#c9a44a)', color:'#0a1828', border:'none', borderRadius:10, cursor:'pointer' }} onClick={()=>{ onContact(p); onClose() }}>✉️ {lang==='sq'?'Kontakto':'Contact Now'}</button>}
              {website && <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'11px 16px', background:'rgba(251,146,60,0.1)', border:'1px solid rgba(251,146,60,0.3)', borderRadius:10, color:'#c9943a', textDecoration:'none', fontSize:12, fontWeight:600 }}>🌐 {lang==='sq'?'Vizito':'Visit'}</a>}
            </div>
          </div>
        </div>
      </div>
    )
  }


  // ── STANDARD MODAL (free / partner) ──────────────────────────────────────────
  return (
    <div className="modal-bg fi" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:560, maxHeight:'90vh', overflowY:'auto', padding:0, borderRadius:20, border:`1px solid ${accentColor}40`, position:'relative' }}>
        {/* Cover top bar with soft fade */}
        <div style={{ position:'relative', height: p.coverImage ? 100 : 3, overflow:'hidden', borderRadius: p.coverImage ? '20px 20px 0 0' : '20px 20px 0 0', flexShrink:0 }}>
          {p.coverImage
            ? <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: p.coverFocus||'50% 50%' }} />
            : null}
          {!p.coverImage && <div style={{ position:'absolute', inset:0, background:`linear-gradient(90deg,${accentColor},${accentColor}88,transparent)` }} />}
          {p.coverImage && <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg, rgba(14,20,32,1) 0%, rgba(14,20,32,0.55) 45%, rgba(14,20,32,0) 100%)' }} />}
          {p.coverImage && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${accentColor},${accentColor}88,transparent)` }} />}
          {p.coverImage && <button onClick={onClose} style={{ position:'absolute', top:10, right:10, zIndex:2, background:'rgba(180,160,100,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:8, width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#fff', fontSize:13, backdropFilter:'blur(8px)' }}>✕</button>}
        </div>
        <div style={{ padding:'24px 26px 22px', marginTop: p.coverImage ? -14 : 0, position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
            <div style={{ display:'flex', gap:14, alignItems:'center' }}>
              <div style={{ width:60, height:60, borderRadius:14, overflow:'hidden', flexShrink:0, border: p.coverImage ? '3px solid rgba(14,20,32,0.9)' : `2px solid ${accentColor}44`, boxShadow: p.coverImage ? '0 4px 16px rgba(0,0,0,0.4)' : `0 0 16px ${accentColor}14`, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${p.logoColor||accentColor}18,${p.logoColor||accentColor}36)` }}>
                {p.logoUrl ? <img src={p.logoUrl} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : <span style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:18, color:p.logoColor||accentColor }}>{(p.logo||p.name||'?').slice(0,2)}</span>}
              </div>
              <div>
                <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:18, marginBottom:4 }}>{p.name}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  {isPartner && <span style={{ fontSize:10, background:'rgba(61,111,168,0.12)', color:'#3d7fa8', border:'1px solid rgba(61,111,168,0.3)', borderRadius:20, padding:'2px 9px', fontWeight:700 }}>✓ Official Partner</span>}
                  {p.verified && <span style={{ fontSize:10, background:'rgba(52,199,89,0.1)', color:G.green, border:'1px solid rgba(52,199,89,0.2)', borderRadius:20, padding:'2px 9px' }}>✓ Verified</span>}
                  {p.city && <span style={{ fontSize:11, color:G.muted }}>📍 {p.city}</span>}
                </div>
              </div>
            </div>
            {!p.coverImage && <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:`1px solid ${G.border}`, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:G.text, fontSize:16, flexShrink:0 }}>✕</button>}
          </div>
          {(p.desc?.[lang]||p.desc?.en) && <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:'rgba(228,221,208,0.78)', lineHeight:1.75, marginBottom:16 }}>{p.desc[lang]||p.desc.en}</p>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:16 }}>
            {p.cat && !isPartner && <div style={{ background:'#0a1828', border:`1px solid ${G.border}`, borderRadius:9, padding:'9px 13px' }}><div style={{ fontSize:10, color:G.muted, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Sector</div><div style={{ fontSize:12, fontWeight:600 }}>{catLabel(p.cat,lang)}</div></div>}
            {isFL && p.languages && <div style={{ background:'#0a1828', border:`1px solid ${G.border}`, borderRadius:9, padding:'9px 13px' }}><div style={{ fontSize:10, color:G.muted, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Languages</div><div style={{ fontSize:12, fontWeight:600 }}>🗣 {p.languages}</div></div>}
            {!isFL && p.employees && <div style={{ background:'#0a1828', border:`1px solid ${G.border}`, borderRadius:9, padding:'9px 13px' }}><div style={{ fontSize:10, color:G.muted, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Team</div><div style={{ fontSize:12, fontWeight:600 }}>👥 {p.employees}</div></div>}
            {p.markets && <div style={{ background:'#0a1828', border:`1px solid ${G.border}`, borderRadius:9, padding:'9px 13px' }}><div style={{ fontSize:10, color:G.muted, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Markets</div><div style={{ fontSize:12, fontWeight:600 }}>🌍 {p.markets}</div></div>}
          </div>
          {(p.tags||[]).length>0 && <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:16 }}>{p.tags.map(tg=><span key={tg} style={{ fontSize:11, background:`${accentColor}10`, color:accentColor, border:`1px solid ${accentColor}28`, borderRadius:20, padding:'3px 11px' }}>{tg}</span>)}</div>}
          {!isPartner && <div style={{ background:'#0a1828', border:`1px solid ${G.border}`, borderRadius:9, padding:'9px 13px', marginBottom:16 }}><div style={{ fontSize:12, color:accentColor }}>💼 {t.rateNote}</div></div>}
          <div style={{ display:'flex', gap:9, flexWrap:'wrap' }}>
            {p.contact && !isPartner && <button className="btn gbtn" style={{ flex:1, padding:'11px', fontSize:13, fontWeight:700 }} onClick={()=>{ onContact(p); onClose() }}>✉️ {lang==='sq'?'Kontakt':'Contact'}</button>}
            {isPartner && <button className="btn teal-btn" style={{ flex:1, padding:'11px', fontSize:13, fontWeight:700 }} onClick={onClose}>✉️ {lang==='sq'?'Dërgoni kërkesë':'Send Enquiry'}</button>}
            {website && <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'11px 16px', background:`${accentColor}0d`, border:`1px solid ${accentColor}33`, borderRadius:10, color:accentColor, textDecoration:'none', fontSize:13, fontWeight:600 }}>🌐 {website}</a>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── UPGRADE MODAL ────────────────────────────────────────────────────────────
function UpgradeModal({ catId, t, lang, onClose }) {
  const [waitDone, setWaitDone] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })

  const used = useMemo(() => {
    const src = window.__techgateProfiles || []
    const sp = src.filter(p => p.cat === catId && p.tier === 'sponsored' && p.verified).length
    return { sp }
  }, [catId])

  const spFree = SLOTS.sponsored - used.sp
  const catName = catLabel(catId, lang)

  return (
    <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal su">
        {!waitDone ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 19, marginBottom: 3 }}>{t.upgradeTitle}</div>
                <div style={{ fontSize: 12, color: G.muted }}>{catName}</div>
              </div>
              <ModalClose onClose={onClose} />
            </div>

            {/* Slot visual */}
            <div style={{ marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: G.orange, marginBottom: 8, fontFamily: "'Raleway',sans-serif" }}>🚀 {t.upgradeSubSp}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Array.from({ length: SLOTS.sponsored }).map((_, i) => {
                    const taken = i < used.sp
                    return (
                      <div key={i} style={{ flex: 1, height: 32, borderRadius: 8, background: taken ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${taken ? 'rgba(251,146,60,0.4)' : 'rgba(180,160,100,0.10)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: taken ? G.orange : G.green, fontFamily: "'Inter',sans-serif", fontWeight: 600 }}>
                        {taken ? (lang==='sq'?'🔒 Zënë':'🔒 Taken') : (lang==='sq'?'✓ Lirë':'✓ Available')}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {spFree > 0 ? (
              <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: G.muted, marginBottom: 4 }}>{t.upgradeContact}</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 16, color: G.gold }}>{t.upgradeMail}</div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{t.waitTitle}</div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: G.muted, marginBottom: 16 }}>{t.waitSub}</p>
                <div style={{ marginBottom: 12 }}><label className="flabel">{t.waitName}</label><input className="inp" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div style={{ marginBottom: 16 }}><label className="flabel">{t.waitEmail}</label><input className="inp" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <button className="btn gbtn" style={{ width: '100%' }} disabled={!form.name || !form.email} onClick={() => setWaitDone(true)}>{t.waitSend}</button>
              </>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.waitDoneTitle}</div>
            <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 20 }}>{t.waitDoneSub}</p>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={onClose}>{t.close}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── CONTACT MODAL ────────────────────────────────────────────────────────────
function ContactModal({ profile, t, onClose }) {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', msg: '' })
  return (
    <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal su">
        {!sent ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 19 }}>{t.reqTitle}: {profile.name}</div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>Business Bridge Platform</div>
              </div>
              <ModalClose onClose={onClose} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`, borderRadius: 9, padding: '11px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: G.muted, marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'Inter',sans-serif" }}>Kontakt</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: G.blue }}>📧 {profile.contact}</div>
              {profile.phone && <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: G.blue, marginTop: 3 }}>📞 {profile.phone}</div>}
            </div>
            <div style={{ marginBottom: 12 }}><label className="flabel">{t.reqName}</label><input className="inp" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div style={{ marginBottom: 12 }}><label className="flabel">{t.reqEmail}</label><input className="inp" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
            <div style={{ marginBottom: 18 }}><label className="flabel">{t.reqMsg}</label><textarea className="inp" rows={4} value={form.msg} onChange={e => setForm(f => ({ ...f, msg: e.target.value }))} style={{ resize: 'vertical' }} placeholder={t.reqPH} /></div>
            <div style={{ display: 'flex', gap: 9 }}>
              <button className="btn gbtn" style={{ flex: 1 }} disabled={!form.name || !form.email} onClick={async () => {
                insertContactLead({
                  profile_id:   profile.id || null,
                  profile_name: profile.name,
                  sender_name:  form.name,
                  sender_email: form.email,
                  message:      form.msg,
                }).catch(console.error)
                // Forward enquiry — try EmailJS first, fall back to mailto: (always works, no template needed)
                if (profile.contact) {
                  const mailtoFallback = () => {
                    const subject = encodeURIComponent(`Enquiry via Business Bridge Platform`)
                    const body = encodeURIComponent(`Hello ${profile.name},\n\nFrom: ${form.name} (${form.email})\n\n${form.msg}\n\n---\nSent via Business Bridge Platform`)
                    window.open(`mailto:${profile.contact}?subject=${subject}&body=${body}`, '_blank')
                  }
                  sendEnquiry({ toEmail: profile.contact, companyName: profile.name, fromName: form.name, fromEmail: form.email, message: form.msg })
                    .catch(() => mailtoFallback())
                }
                setSent(true)
              }}>{t.reqSend}</button>
              <button className="btn ghost" onClick={onClose}>{t.reqCancel}</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '18px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.reqDoneTitle}</div>
            <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 20 }}><strong>{profile.name}</strong> {t.reqDoneSub}</p>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={onClose}>{t.close}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PROFILE CARD ─────────────────────────────────────────────────────────────
function ProfileCard({ p, lang, t, rank, onContact, onUpgrade, onTagClick, onSelfEdit, matchScore, matchHits, onCardClick }) {
  const isFL = p.type === 'freelancer'
  const isSp = p.tier === 'sponsored'
  const [hov, setHov] = React.useState(false)
  const accentColor = isSp ? '#c9943a' : (CATS.find(c => c.id === p.cat)?.color || p.logoColor || G.gold)

  return (
    <div
      style={{
        borderRadius: 20, overflow: 'hidden', position: 'relative',
        background: isSp
          ? 'rgba(251,146,60,0.05)'
          : 'rgba(255,255,255,0.03)',
        border: isSp
          ? `1px solid ${hov ? 'rgba(251,146,60,0.50)' : 'rgba(251,146,60,0.28)'}`
          : `1px solid ${hov ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.09)'}`,
        boxShadow: hov
          ? isSp
            ? '0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(251,146,60,0.14), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 20px 52px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.04)'
          : '0 4px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)',
        transform: hov && onCardClick ? 'translateY(-5px) scale(1.01)' : 'none',
        transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
        cursor: onCardClick ? 'pointer' : 'default',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onCardClick ? (e) => { if (!e.target.closest('button,a')) onCardClick(p) } : undefined}
    >
      {/* Cover image — top bar with soft gradient fade into card */}
      {(p.coverImage || isSp) && (
        <div style={{ position: 'relative', height: p.coverImage ? 90 : 36, overflow: 'hidden', flexShrink: 0 }}>
          {p.coverImage && <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: p.coverFocus||'50% 50%' }} />}
          {!p.coverImage && isSp && <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,rgba(251,146,60,0.18),rgba(14,20,32,0.9))` }} />}
          {/* Soft gradient fade at bottom */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg, rgba(14,20,32,1) 0%, rgba(14,20,32,0.6) 40%, rgba(14,20,32,0) 100%)' }} />
          {/* Top accent line */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height: isSp ? 3 : 2,
            background: isSp ? 'linear-gradient(90deg,#c9943a,#c9a44a,rgba(251,146,60,0.3),transparent)' : `linear-gradient(90deg,${accentColor}aa,transparent)` }} />
          {isSp && <span style={{ position:'absolute', top:9, right:11, fontSize:9, background:'rgba(251,146,60,0.9)', color:'#050d1b', borderRadius:20, padding:'2px 9px', fontWeight:800, letterSpacing:'0.1px', backdropFilter:'blur(8px)' }}>🚀 SPONSORED</span>}
        </div>
      )}
      {!p.coverImage && !isSp && (
        <div style={{ height: 2, background: `linear-gradient(90deg,${accentColor}55,transparent)` }} />
      )}
      <div style={{ padding: '15px 18px 16px', marginTop: p.coverImage ? -18 : 0, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ display: 'flex', gap: 11, alignItems: 'center', minWidth: 0, flex: 1 }}>
            <div style={{
              width: isSp ? 56 : 46, height: isSp ? 56 : 46, borderRadius: 13, overflow: 'hidden', flexShrink: 0,
              border: isSp ? '3px solid rgba(251,146,60,0.5)' : (p.coverImage ? '2px solid rgba(255,255,255,0.3)' : `2px solid ${accentColor}40`),
              boxShadow: isSp ? '0 0 18px rgba(251,146,60,0.2)' : (p.coverImage ? '0 3px 14px rgba(0,0,0,0.4)' : `0 0 10px ${accentColor}12`),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg,${accentColor}20,${accentColor}38)`,
            }}>
              {p.logoUrl
                ? <img src={p.logoUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 900, fontSize: isSp ? 17 : 14, color: accentColor }}>{(p.logo || p.name || '?').slice(0, 2)}</span>}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: isSp ? 15 : 13, marginBottom: 2,
                color: hov ? (isSp ? '#c9943a' : G.gold) : G.text, transition: 'color 0.18s',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(228,221,208,0.60)' }}>📍 {p.city} · {catLabel(p.cat, lang)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0, marginLeft: 8 }}>
            {matchScore !== null && matchScore !== undefined && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 90 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 9, fontWeight: 700, fontFamily: "'Raleway',sans-serif", letterSpacing: '0.6px', textTransform: 'uppercase', color: G.muted }}>Match</span>
                  <span style={{ fontSize: 12, fontWeight: 800, fontFamily: "'Raleway',sans-serif",
                    color: matchScore>=80 ? G.green : matchScore>=50 ? G.gold : G.muted }}>
                    {matchScore}%
                  </span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${matchScore}%`,
                    background: matchScore>=80
                      ? 'linear-gradient(90deg, #3d8a5a, #4a9e6b)'
                      : matchScore>=50
                      ? 'linear-gradient(90deg, #a8833a, #c9a44a)'
                      : 'linear-gradient(90deg, #5a6a7a, #7a8a9a)',
                    borderRadius: 4,
                    boxShadow: matchScore>=80 ? '0 0 8px rgba(74,158,107,0.6)' : matchScore>=50 ? '0 0 8px rgba(201,164,74,0.6)' : 'none',
                    transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }} />
                </div>
              </div>
            )}
            {p.verified && <span style={{ fontSize: 9, background: 'rgba(52,199,89,0.12)', color: G.green, border: '1px solid rgba(52,199,89,0.22)', borderRadius: 20, padding: '2px 7px', fontWeight: 700 }}>{t.verified}</span>}
          </div>
        </div>

        <div style={{ fontSize: 11, color: G.muted, marginBottom: 7, fontFamily: "'Inter',sans-serif" }}>
          {isFL ? `🗣 ${p.languages}` : `👥 ${p.employees}`}
        </div>
        <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(228,221,208,0.60)', lineHeight: 1.6, marginBottom: 10 }}>
          {(p.desc?.[lang]||p.desc?.en||'').slice(0, isSp?115:90)}{((p.desc?.[lang]||p.desc?.en||'').length>(isSp?115:90))?'…':''}
        </p>
        {(p.tags||[]).length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
            {p.tags.slice(0, isSp?5:4).map(tag => (
              <span key={tag} className="tag"
                style={{ cursor: onTagClick?'pointer':'default', fontSize: 10, transition: 'all 0.15s',
                  ...(isSp ? { background:'rgba(251,146,60,0.09)', color:'#c9943a', border:'1px solid rgba(251,146,60,0.22)' } : {}) }}
                onClick={e => { e.stopPropagation(); onTagClick && onTagClick(tag) }}
                onMouseEnter={e => { if (onTagClick) { e.currentTarget.style.background = isSp?'rgba(251,146,60,0.18)':'rgba(61,111,168,0.15)'; e.currentTarget.style.color = isSp?'#c9943a':G.teal }}}
                onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
        <div style={{ background:'#0a1828', border:`1px solid ${isSp?'rgba(251,146,60,0.15)':G.border}`, borderRadius:7, padding:'6px 11px', marginBottom:11 }}>
          <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:isSp?'#c9943a':G.teal, fontWeight:500 }}>💼 {t.rateNote}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn" style={{ flex:1, padding:'8px', fontSize:11, fontWeight:700, borderRadius:9, transition:'all 0.18s',
            background: isSp?'linear-gradient(135deg,rgba(251,146,60,0.18),rgba(251,146,60,0.1))':'rgba(255,255,255,0.04)',
            color: isSp?'#c9943a':G.text, border: isSp?'1px solid rgba(251,146,60,0.35)':`1px solid ${G.border}` }}
            onMouseEnter={e=>{e.currentTarget.style.background=isSp?'rgba(251,146,60,0.26)':'rgba(201,164,74,0.1)';e.currentTarget.style.borderColor=isSp?'rgba(251,146,60,0.55)':G.goldBorder}}
            onMouseLeave={e=>{e.currentTarget.style.background=isSp?'linear-gradient(135deg,rgba(251,146,60,0.18),rgba(251,146,60,0.1))':'rgba(255,255,255,0.04)';e.currentTarget.style.borderColor=isSp?'rgba(251,146,60,0.35)':G.border}}
            onClick={e=>{e.stopPropagation();onContact(p)}}>{t.sendReq}</button>
          <button className="btn ghost" style={{padding:'8px 10px',fontSize:12,borderRadius:9}} title={t.upgradeTitle} onClick={e=>{e.stopPropagation();onUpgrade(p.cat)}}>⭐</button>
          <button className="btn ghost" style={{padding:'8px 10px',fontSize:11,borderRadius:9}} title={lang==='sq'?'Ndrysho profilin tim':'Edit my profile'} onClick={e=>{e.stopPropagation();onSelfEdit&&onSelfEdit(p)}}>✏️</button>
        </div>
      </div>
    </div>
  )
}


// ─── DIRECTORY PAGE ───────────────────────────────────────────────────────────

const SKILL_SETS = {
  software:   ['React','Vue','Angular','Next.js','TypeScript','JavaScript','Node.js','Python','Django','PHP','Java','DevOps','Kubernetes','AWS','Azure','Mobile','React Native','Flutter','PostgreSQL','MongoDB','GraphQL'],
  support:    ['Helpdesk','ITIL v4','24/7','Windows','CompTIA','ServiceNow','Zendesk','Remote Support','Network','Linux'],
  consulting: ['Agile','Scrum','PMP','SAP','ERP','Change Management','Business Analysis','Digitalisierung','IT-Strategy','PMO'],
  design:     ['Figma','UI/UX','Branding','Adobe XD','Illustrator','Motion','Video','Webflow','Brand Identity','Copywriting'],
  bpo:        ['Inbound','Outbound','CRM','Salesforce','HubSpot','Customer Service','Sales','Lead Generation','GDPR','Multi-language'],
  production: ['CNC','ISO 9001','Lean','CAD','SolidWorks','Quality Control','Injection Moulding','Welding','Sheet Metal','Assembly'],
  logistics:  ['Customs','Freight','EU Corridor','Warehouse','Cold Chain','Tracking','Import/Export','Last Mile','3PL'],
  legal:      ['Commercial Law','Corporate Law','Foreign Investment','Contracts','IP','Compliance','Tax Law','Employment Law'],
}

// Score a profile against selected skills — pure math, no API, free forever
function scoreProfile(profile, selectedSkills) {
  if (selectedSkills.length === 0) return { score: 0, matched: [] }
  const profileTags = profile.tags.map(tg => tg.toLowerCase())
  const matched = selectedSkills.filter(s =>
    profileTags.some(pt => pt.includes(s.toLowerCase()) || s.toLowerCase().includes(pt))
  )
  const score = Math.round((matched.length / selectedSkills.length) * 100)
  return { score, matched }
}

function SkillMatchPanel({ lang, cat, G, dbProfiles, matchSkills, setMatchSkills, resultCount }) {
  const base = new Set()
  const catIds = cat !== 'all' ? [cat] : CATS.map(c => c.id)
  catIds.forEach(catId => {
    ;(SKILL_SETS[catId] || []).forEach(s => base.add(s))
    ;(dbProfiles || []).filter(p => p.cat === catId).forEach(p => (p.tags||[]).forEach(tg => base.add(tg)))
  })
  const skillList = [...base].sort()
  const toggleSkill = s => setMatchSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  return (
    <div>
      <div style={{ fontSize:11, color:G.teal, fontWeight:700, letterSpacing:'0.6px', textTransform:'uppercase', marginBottom:10 }}>
        {lang==='sq'?'Zgjidh aftësitë':'Select skills'}
        {cat !== 'all' && <span style={{ color:'rgba(228,221,208,0.60)', fontWeight:400, marginLeft:6, textTransform:'none' }}>· {(CATS.find(c2=>c2.id===cat)||{}).labels[lang]}</span>}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, maxHeight:120, overflowY:'auto' }}>
        {skillList.map(s => (
          <button key={s} onClick={() => toggleSkill(s)} className="btn"
            style={{ padding:'5px 12px', fontSize:11, fontWeight:matchSkills.includes(s)?700:500, borderRadius:14,
              background:matchSkills.includes(s)?'rgba(61,111,168,0.18)':'rgba(180,160,100,0.10)',
              color:matchSkills.includes(s)?G.teal:'rgba(228,221,208,0.78)',
              border:'1px solid '+(matchSkills.includes(s)?'rgba(61,111,168,0.45)':'rgba(255,255,255,0.14)') }}>
            {matchSkills.includes(s)?'✓ ':''}{s}
          </button>
        ))}
      </div>
      {matchSkills.length > 0 && (
        <div style={{ marginTop:9, display:'flex', alignItems:'center', gap:10, fontSize:12, color:G.teal }}>
          <span>✓ {matchSkills.length} {lang==='sq'?'aftësi':'skills'} · {resultCount} {lang==='sq'?'rezultate':'results'}</span>
          <button onClick={() => setMatchSkills([])} className="btn ghost" style={{ fontSize:11, padding:'3px 9px' }}>✕</button>
        </div>
      )}
    </div>
  )
}

function DirectoryPage({ lang, t, externalTag, onClearTag, initialQ, onQClear, initialCat }) {
  const [q, setQ] = useState(initialQ || '')
  // Sync initialQ when coming from home search
  React.useEffect(() => { if (initialQ) { setQ(initialQ) } }, [initialQ])
  const [typeF, setTypeF] = useState('all')
  const [cat, setCat] = useState(initialCat || 'all')
  React.useEffect(() => { if (initialCat) setCat(initialCat) }, [initialCat])
  const [sort, setSort] = useState('az')
  const [contact, setContact] = useState(null)
  const [upgrade, setUpgrade] = useState(null)
  const [tagFilter, setTagFilter] = useState(externalTag || null)
  const [selfEdit, setSelfEdit] = useState(null)
  const [dirDetail, setDirDetail] = useState(null)
  const [dbProfiles, setDbProfiles] = useState([])
  const [dbLoading, setDbLoading] = useState(true)
  // Skill matching integrated into directory
  const [matchSkills, setMatchSkills] = useState([])
  const [matchMode, setMatchMode] = useState(false) // toggle match panel
  const [typeOpen, setTypeOpen] = useState(false)   // toggle type panel
  const [sectorOpen, setSectorOpen] = useState(false) // toggle sector panel

  // Load verified profiles from Supabase
  useEffect(() => {
    fetchProfiles()
      .then(data => { setDbProfiles(data.map(normaliseProfile)); setDbLoading(false) })
      .catch(() => { setDbProfiles([]); setDbLoading(false) })
  }, [])

  // Use DB profiles if loaded, fall back to hardcoded PROFILES for demo
  const allProfiles = dbProfiles  // only real DB data

  // sync external tag (from profile card click)
  React.useEffect(() => { if (externalTag) setTagFilter(externalTag) }, [externalTag])

  const clearTagFilter = () => { setTagFilter(null); if (onClearTag) onClearTag() }

  const ranked = useMemo(() => {
    const byCat = {}
    allProfiles.forEach(p => {
      if (!byCat[p.cat]) byCat[p.cat] = { sponsored: [], free: [] }
      byCat[p.cat][p.tier === 'sponsored' ? 'sponsored' : 'free'].push(p)
    })
    const result = []
    Object.entries(byCat).forEach(([, groups]) => {
      groups.sponsored.forEach(p => result.push({ ...p, _rank: 1 }))
      groups.free.forEach(p => result.push({ ...p, _rank: null }))
    })
    return result
  }, [allProfiles])

  const filtered = ranked.filter(p => {
    if (p.type === 'partner') return false   // partners show only on Concierge page
    const s = q.toLowerCase()
    const desc = p.desc[lang] || p.desc.en || ''
    const catMatch = cat === 'all' || p.cat === cat
    const skillMatch = matchSkills.length > 0
      ? matchSkills.some(sk => p.tags.some(tg => tg.toLowerCase().includes(sk.toLowerCase())))
      : true
    return (
      (!q || p.name.toLowerCase().includes(s) || desc.toLowerCase().includes(s) || p.tags.some(tg => tg.toLowerCase().includes(s))) &&
      (typeF === 'all' || p.type === typeF) &&
      catMatch && skillMatch &&
      (!tagFilter || p.tags.some(tg => tg.toLowerCase() === tagFilter.toLowerCase()))
    )
  }).map(p => {
    if (matchSkills.length === 0) return { ...p, _matchScore: null }
    const hits = matchSkills.filter(sk => p.tags.some(tg => tg.toLowerCase().includes(sk.toLowerCase())))
    return { ...p, _matchScore: Math.round((hits.length / matchSkills.length) * 100), _matchHits: hits }
  }).sort((a, b) => {
    if (matchSkills.length > 0 && a._matchScore !== b._matchScore) return (b._matchScore||0) - (a._matchScore||0)
    return 0
  })

  const catList = cat === 'all' ? CATS : CATS.filter(c => c.id === cat)
  const activeCat = CATS.find(c => c.id === cat)
  const bgColor = activeCat ? activeCat.color : '#4a7fa5'
  const isSectorSelected = cat !== 'all'

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <VideoBackground src="/bg-video-companies.mp4" />

      {/* ── STICKY PANEL: Filters + Skills — sticks right below nav ── */}
      <div style={{
        position: 'sticky', top: 64, zIndex: 50,
        background: 'rgba(5,14,24,0.46)',
        backdropFilter: 'blur(36px) saturate(160%)',
        WebkitBackdropFilter: 'blur(36px) saturate(160%)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 16,
        marginBottom: 18,
        boxShadow: '0 16px 56px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.10)',
        overflow: 'hidden',
      }}>
        {/* ── Filters ── */}
        <div className="filters-sticky-panel" style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* ── PROFILE TYPE — desktop: pills row, mobile: expandable bar ── */}
          {/* DESKTOP */}
          <div className="sector-pills-desktop" style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, color:'rgba(228,221,208,0.45)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.7px', fontFamily:"'Raleway',sans-serif", marginRight:2 }}>{lang==='sq'?'Lloji':'Type'}</span>
            {[['all', t.allTypes], ['company', t.onlyComp], ['freelancer', t.onlyFL]].map(([v, l]) => (
              <button key={v} onClick={() => setTypeF(v)} className="btn" style={{ padding:'5px 13px', fontSize:12, fontWeight:600, borderRadius:9,
                background: typeF===v ? G.goldDim : 'rgba(255,255,255,0.07)',
                color: typeF===v ? G.gold : 'rgba(228,221,208,0.72)',
                border:`1px solid ${typeF===v ? G.goldBorder : 'rgba(255,255,255,0.11)'}` }}>{l}</button>
            ))}
          </div>
          {/* MOBILE */}
          <div className="sector-pills-mobile" style={{ borderRadius:10, overflow:'hidden', border:`1px solid ${typeF !== 'all' ? 'rgba(201,164,74,0.5)' : 'rgba(255,255,255,0.10)'}` }}>
            <div onClick={() => setTypeOpen(v => !v)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', cursor:'pointer', background: typeF!=='all' ? 'rgba(201,164,74,0.12)' : 'rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize:13 }}>👥</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:12, color: typeF!=='all' ? G.gold : 'rgba(228,221,208,0.85)' }}>{lang==='sq'?'Lloji i profilit':'Profile type'}</div>
                <div style={{ fontSize:10, color:'rgba(228,221,208,0.45)' }}>{typeF==='all' ? (lang==='sq'?'Të gjithë':'All') : typeF==='company' ? t.onlyComp : t.onlyFL}</div>
              </div>
              {typeF!=='all' && <button onClick={e=>{e.stopPropagation();setTypeF('all')}} style={{ background:'rgba(180,160,100,0.10)', border:'none', borderRadius:4, color:'rgba(228,221,208,0.70)', fontSize:10, padding:'2px 6px', cursor:'pointer' }}>✕</button>}
              <span style={{ color:'rgba(228,221,208,0.40)', fontSize:12 }}>{typeOpen?'▲':'▼'}</span>
            </div>
            {typeOpen && (
              <div style={{ padding:'8px 12px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.2)', display:'flex', gap:6 }}>
                {[['all',t.allTypes],['company',t.onlyComp],['freelancer',t.onlyFL]].map(([v,l]) => (
                  <button key={v} onClick={()=>{setTypeF(v);setTypeOpen(false)}} className="btn" style={{ padding:'6px 12px', fontSize:11, fontWeight:600, borderRadius:8,
                    background:typeF===v?G.goldDim:'rgba(255,255,255,0.07)', color:typeF===v?G.gold:'rgba(228,221,208,0.75)',
                    border:`1px solid ${typeF===v?G.goldBorder:'rgba(255,255,255,0.11)'}`}}>{l}</button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop-only divider between Type and Sector */}
          <div className="sector-pills-desktop" style={{ display:'block', height: 1, background: 'linear-gradient(90deg,transparent,rgba(180,160,100,0.12),transparent)', margin: '4px 0' }} />

          {/* ── SECTOR — desktop: pills row, mobile: expandable bar ── */}
          {/* DESKTOP */}
          <div className="sector-pills-desktop" style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, color:'rgba(228,221,208,0.45)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.7px', fontFamily:"'Raleway',sans-serif", marginRight:2 }}>{lang==='sq'?'Sektori':'Sector'}</span>
            <button onClick={() => setCat('all')} className="btn" style={{ padding:'5px 12px', fontSize:11, fontWeight:700, borderRadius:20,
              background:cat==='all'?'#c9a44a':'rgba(255,255,255,0.07)', color:cat==='all'?'#050d1b':'rgba(228,221,208,0.72)',
              border:`1px solid ${cat==='all'?'#c9a44a':'rgba(255,255,255,0.11)'}`,
              boxShadow:cat==='all'?'0 3px 12px rgba(201,164,74,0.38)':'none' }}>{t.allCats}</button>
            {CATS.map(c => (
              <button key={c.id} onClick={() => setCat(c.id)} className="btn" style={{ padding:'5px 12px', fontSize:11, fontWeight:700, borderRadius:20,
                background:cat===c.id?c.color:'rgba(255,255,255,0.07)', color:cat===c.id?'#050d1b':'rgba(228,221,208,0.72)',
                border:`1px solid ${cat===c.id?c.color:'rgba(255,255,255,0.11)'}`,
                boxShadow:cat===c.id?`0 3px 12px ${c.color}44`:'none',
                transition:'all 0.18s' }}>
                {c.icon} {c.labels[lang]}
              </button>
            ))}
          </div>
          {/* MOBILE */}
          {(() => {
            const ac = CATS.find(c => c.id === cat)
            return (
              <div className="sector-pills-mobile" style={{ borderRadius:10, overflow:'hidden', border:`1px solid ${cat!=='all'?`${ac?.color}55`:'rgba(255,255,255,0.10)'}` }}>
                <div onClick={() => setSectorOpen(v => !v)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', cursor:'pointer', background: cat!=='all'?`${ac?.color}12`:'rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize:13 }}>{cat!=='all'?ac?.icon:'🏭'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:12, color:cat!=='all'?ac?.color:'rgba(228,221,208,0.85)' }}>{lang==='sq'?'Sektori':'Sector'}</div>
                    <div style={{ fontSize:10, color:'rgba(228,221,208,0.45)' }}>{cat==='all'?(lang==='sq'?'Të gjithë':'All sectors'):ac?.labels[lang]}</div>
                  </div>
                  {cat!=='all' && <button onClick={e=>{e.stopPropagation();setCat('all')}} style={{ background:'rgba(180,160,100,0.10)', border:'none', borderRadius:4, color:'rgba(228,221,208,0.70)', fontSize:10, padding:'2px 6px', cursor:'pointer' }}>✕</button>}
                  <span style={{ color:'rgba(228,221,208,0.40)', fontSize:12 }}>{sectorOpen?'▲':'▼'}</span>
                </div>
                {sectorOpen && (
                  <div style={{ padding:'8px 12px', borderTop:'1px solid rgba(255,255,255,0.07)', background:'rgba(0,0,0,0.2)', display:'flex', gap:5, flexWrap:'wrap' }}>
                    <button onClick={()=>{setCat('all');setSectorOpen(false)}} className="btn" style={{ padding:'5px 11px', fontSize:11, fontWeight:700, borderRadius:20, background:cat==='all'?'#c9a44a':'rgba(255,255,255,0.07)', color:cat==='all'?'#050d1b':'rgba(228,221,208,0.75)', border:`1px solid ${cat==='all'?'#c9a44a':'rgba(255,255,255,0.11)'}`}}>{t.allCats}</button>
                    {CATS.map(c => (
                      <button key={c.id} onClick={()=>{setCat(c.id);setSectorOpen(false)}} className="btn" style={{ padding:'5px 11px', fontSize:11, fontWeight:700, borderRadius:20,
                        background:cat===c.id?c.color:'rgba(255,255,255,0.07)', color:cat===c.id?'#050d1b':'rgba(228,221,208,0.75)', border:`1px solid ${cat===c.id?c.color:'rgba(255,255,255,0.11)'}`}}>
                        {c.icon} {c.labels[lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {/* ── MATCH FILTER BAR ── */}
          <div onClick={() => setMatchMode(v => !v)}
            className="match-filter-bar"
            style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', borderRadius:11, cursor:'pointer',
              background: matchMode ? 'linear-gradient(90deg,rgba(61,111,168,0.20),rgba(61,111,168,0.09))' : 'rgba(61,111,168,0.06)',
              border: `1px solid ${matchMode ? 'rgba(61,111,168,0.5)' : 'rgba(61,111,168,0.22)'}`,
              transition:'all 0.2s' }}>
            <div style={{ width:26, height:26, borderRadius:7, background: matchMode ? 'linear-gradient(135deg,#3d7fa8,#2a5585)' : 'rgba(61,111,168,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>
              {matchMode ? '✓' : '🔎'}
            </div>
            <div style={{ flex:1 }}>
              <div className="match-filter-label" style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:13, color: matchMode ? G.teal : 'rgba(228,221,208,0.85)' }}>
                Match Filter
              </div>
              <div className="match-filter-sub" style={{ fontSize:10, color:'rgba(228,221,208,0.48)', marginTop:1 }}>
                {matchSkills.length > 0 ? `${matchSkills.length} skill${matchSkills.length>1?'s':''} active` : (lang==='sq'?'Kërko sipas aftësive':'Filter by skills')}
              </div>
            </div>
            {matchSkills.length > 0 && (
              <button onClick={e=>{e.stopPropagation();setMatchSkills([])}} style={{ background:'rgba(61,111,168,0.12)', border:'1px solid rgba(61,111,168,0.35)', borderRadius:5, color:G.teal, fontSize:11, padding:'2px 7px', cursor:'pointer', fontWeight:600 }}>✕ Clear</button>
            )}
            <div style={{ color: matchMode ? G.teal : 'rgba(228,221,208,0.45)', fontSize:15 }}>{matchMode ? '▲' : '▼'}</div>
          </div>

        </div>

        {/* ── Skills panel: appears seamlessly below match bar when open ── */}
        {matchMode && (
          <div style={{
            borderTop: '1px solid rgba(61,111,168,0.22)',
            background: 'rgba(4,8,18,0.6)',
            padding: '12px 16px',
          }}>
            <SkillMatchPanel
              lang={lang} cat={cat} G={G}
              dbProfiles={dbProfiles}
              matchSkills={matchSkills}
              setMatchSkills={setMatchSkills}
              resultCount={filtered.length}
            />
          </div>
        )}
      </div>
      {/* ── END STICKY PANEL ── */}

      {/* Active tag filter banner */}
      {tagFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, background: 'rgba(61,111,168,0.08)', border: '1px solid rgba(61,111,168,0.25)', borderRadius: 9, padding: '9px 14px' }}>
          <span style={{ fontSize: 13, color: G.teal, fontFamily: "'Inter',sans-serif" }}>
            🏷 {lang === 'sq' ? 'Filtër tag:' : 'Tag filter:'} <strong>{tagFilter}</strong>
          </span>
          <button onClick={clearTagFilter} className="btn ghost" style={{ fontSize: 11, padding: '3px 10px', marginLeft: 'auto' }}>✕ {lang === 'sq' ? 'Hiq' : 'Remove'}</button>
        </div>
      )}

      {catList.map(catObj => {
        const catProfiles = filtered.filter(p => p.cat === catObj.id)
        if (catProfiles.length === 0) return null
        return (
          <div key={catObj.id} style={{ marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(230,225,215,0.10)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: `1.5px solid ${catObj.color}`,
                borderLeft: `3px solid ${catObj.color}`,
                borderRadius: 8, padding: '4px 12px',
              }}>
                <span style={{ fontSize: 12 }}>{catObj.icon}</span>
                <span style={{ fontFamily:"'Raleway',sans-serif", fontWeight: 700, fontSize: 12, color: '#e4ddd0', letterSpacing: '0.1px', textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>{catObj.labels[lang]}</span>
                <span style={{ background: catObj.color, color: '#08111e', borderRadius: 5, padding: '1px 6px', fontSize: 10, fontWeight: 800, marginLeft: 2 }}>{catProfiles.length}</span>
              </div>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${catObj.color}60, transparent)` }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
              {catProfiles.map(p => (
                <ProfileCard key={p.id} p={p} lang={lang} t={t} rank={p._rank} onContact={setContact} onUpgrade={setUpgrade} onTagClick={tag => setTagFilter(tag)} onSelfEdit={setSelfEdit} matchScore={p._matchScore} matchHits={p._matchHits} onCardClick={setDirDetail} />
              ))}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 20px', color: G.muted }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontFamily: "'Inter',sans-serif" }}>{t.noResults} "{q}"</div>
          <div style={{ fontSize: 13, fontFamily: "'Inter',sans-serif", marginTop: 6 }}>{t.noResultsSub}</div>
        </div>
      )}

      {contact && <ContactModal profile={contact} t={t} onClose={() => setContact(null)} />}
      {upgrade && <UpgradeModal catId={upgrade} t={t} lang={lang} onClose={() => setUpgrade(null)} />}
      {selfEdit && <SelfEditModal profile={selfEdit} lang={lang} t={t} onClose={() => setSelfEdit(null)} />}
      {dirDetail && <ProfileDetailModal p={dirDetail} lang={lang} t={t} onClose={() => setDirDetail(null)} onContact={p2 => { setDirDetail(null); setContact(p2) }} />}
    </div>
  )
}

// ─── MATCH PAGE ───────────────────────────────────────────────────────────────
function MatchPage({ lang, t }) {
  const [category, setCategory] = useState('all')
  const [skills,   setSkills]   = useState([])
  const [typeF,    setTypeF]    = useState('all')
  const [results,  setResults]  = useState(null)
  const [contact,  setContact]  = useState(null)
  const [dbProfiles, setDbProfiles] = useState([])
  const [dbLoaded, setDbLoaded] = useState(false)

  // Load profiles directly from DB
  useEffect(() => {
    fetchProfiles().then(data => {
      setDbProfiles(data.map(normaliseProfile))
      setDbLoaded(true)
      // Also update window cache for other components
      if (data.length > 0) window.__techgateProfiles = data
    }).catch(() => setDbLoaded(true))
  }, [])

  const allProfiles = dbProfiles.length > 0 ? dbProfiles
    : (window.__techgateProfiles?.length > 0 ? window.__techgateProfiles : [])

  // Skills for the selected category: hardcoded base + any extra tags from DB profiles
  const currentSkills = useMemo(() => {
    const base = new Set(SKILL_SETS[category] || [])
    // Add any tags from DB profiles in this category not already in base
    allProfiles
      .filter(p => p.cat === category)
      .forEach(p => (p.tags || []).forEach(tg => base.add(tg)))
    return [...base]
  }, [category, allProfiles])

  // setcat: change category and clear selected skills
  const setcat = (newCat) => { setCategory(newCat); setSkills([]) }
  const toggleSkill = s => setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])

  const LABELS = {
    de: {
      badge: 'Sofort-Matching · Skills & Kategorie',
      title: 'Partner-Matching',
      sub: 'Wählen Sie Bereich und Skills — wir zeigen sofort alle passenden Einträge.',
      catLabel: '1. Bereich wählen',
      skillLabel: '2. Skills auswählen',
      skillHint: 'Je mehr Skills, desto präziser das Matching.',
      typeLabel: 'Typ',
      noSkillNote: 'Wählen Sie zuerst einen Bereich.',
      btn: '🔍 Jetzt matchen',
      resultsTitle: 'Passende Partner',
      matchedSkills: 'Übereinstimmende Skills',
      allSkills: 'Skills',
      noResults: 'Keine Treffer — anderen Bereich oder andere Skills versuchen.',
      scoreLabel: 'Übereinstimmung',
      rateNote: 'Konditionen per Gespräch',
      sendReq: 'Anfrage senden',
      clearBtn: 'Zurücksetzen',
    },
    en: {
      badge: 'Instant matching · Skills & category',
      title: 'Partner Matching',
      sub: 'Select area and skills — we instantly show all matching listings.',
      catLabel: '1. Select area',
      skillLabel: '2. Select skills',
      skillHint: 'More skills = more precise matching.',
      typeLabel: 'Type',
      noSkillNote: 'Select an area first.',
      btn: '🔍 Match now',
      resultsTitle: 'Matching partners',
      matchedSkills: 'Matching skills',
      allSkills: 'Skills',
      noResults: 'No results — try a different area or skills.',
      scoreLabel: 'Match',
      rateNote: 'Terms on request',
      sendReq: 'Send enquiry',
      clearBtn: 'Reset',
    },
    sq: {
      badge: 'Përputhje e menjëhershme · Aftësi & kategori',
      title: 'Përputhja e Partnerëve',
      sub: 'Zgjidhni fushën dhe aftësitë — shfaqim menjëherë të gjitha regjistrimet përkatëse.',
      catLabel: '1. Zgjidh fushën',
      skillLabel: '2. Zgjidh aftësitë',
      skillHint: 'Sa më shumë aftësi, aq më preciz.',
      typeLabel: 'Lloji',
      noSkillNote: 'Zgjidh fillimisht një fushë.',
      btn: '🔍 Përputh tani',
      resultsTitle: 'Partnerët përputhës',
      matchedSkills: 'Aftësi përputhëse',
      allSkills: 'Aftësi',
      noResults: 'Asnjë rezultat — provo fushë ose aftësi të tjera.',
      scoreLabel: 'Përputhje',
      rateNote: 'Kushtet me kërkesë',
      sendReq: 'Dërgo kërkesë',
      clearBtn: 'Rivendos',
    },
    sv: {
      badge: 'Omedelbar matchning · Kompetenser & kategori',
      title: 'Partnermatchning',
      sub: 'Välj område och kompetenser — vi visar omedelbart alla matchande profiler.',
      catLabel: '1. Välj område',
      skillLabel: '2. Välj kompetenser',
      skillHint: 'Fler kompetenser = precisare matchning.',
      typeLabel: 'Typ',
      noSkillNote: 'Välj ett område först.',
      btn: '🔍 Matcha nu',
      resultsTitle: 'Matchande partners',
      matchedSkills: 'Matchande kompetenser',
      allSkills: 'Kompetenser',
      noResults: 'Inga träffar — prova annat område eller andra kompetenser.',
      scoreLabel: 'Match',
      rateNote: 'Villkor på förfrågan',
      sendReq: 'Skicka förfrågan',
      clearBtn: 'Återställ',
    },
  }
  const Lm = LABELS[lang] || LABELS.en

  // Pure database filter + score — instant, free, no API
  const doMatch = () => {
    const pool = allProfiles
      .filter(p => category === 'all' || p.cat === category)
      .filter(p => typeF === 'all' || p.type === typeF)

    const scored = pool
      .map(p => {
        const { score, matched } = scoreProfile(p, skills)
        // Bonus points for tier
        const tierBonus = p.tier === 'sponsored' ? 8 : p.tier === 'premium' ? 4 : 0
        // Bonus for rating
        const ratingBonus = Math.round((p.rating - 4) * 5)
        const finalScore = Math.min(100, score + tierBonus + ratingBonus)
        return { ...p, _score: finalScore, _matched: matched }
      })
      .filter(p => skills.length === 0 || p._score > 0) // when skills selected, hide 0% matches
      .sort((a, b) => {
        if (b._score !== a._score) return b._score - a._score
        // tiebreak: sponsored > premium > free
        const tier = { sponsored: 0, premium: 1, free: 2 }
        return tier[a.tier] - tier[b.tier]
      })

    setResults(scored)
  }

  const reset = () => { setCategory('all'); setSkills([]); setResults(null) }

  const scoreColor = s => s >= 80 ? G.green : s >= 50 ? G.gold : G.muted
  const scoreLabel = s => {
    if (skills.length === 0) return null // no score when no skills selected
    return s
  }

  return (
    <div style={{ padding: '36px 44px', maxWidth: 1000, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 26 }}>

        <h2 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 'clamp(22px,3.5vw,36px)', letterSpacing: '-0.6px', marginBottom: 8 }}>{Lm.title}</h2>
        <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 15, lineHeight: 1.75 }}>{Lm.sub}</p>
      </div>

      <div className="card" style={{ padding: 26, marginBottom: 24 }}>

        {/* Step 1 — Category pills */}
        <div style={{ marginBottom: 22 }}>
          <label className="flabel">{Lm.catLabel}</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            <button onClick={() => setcat('all')} className="btn" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 20, background: category === 'all' ? G.goldDim : 'rgba(255,255,255,0.04)', color: category === 'all' ? G.gold : G.muted, border: `1px solid ${category === 'all' ? G.goldBorder : 'rgba(255,255,255,0.07)'}` }}>
              🌐 {t.allCats}
            </button>
            {CATS.map(c => (
              <button key={c.id} onClick={() => setcat(c.id)} className="btn" style={{ padding: '8px 16px', fontSize: 13, fontWeight: 600, borderRadius: 20, background: category === c.id ? `${c.color}18` : 'rgba(255,255,255,0.04)', color: category === c.id ? c.color : G.muted, border: `1px solid ${category === c.id ? `${c.color}45` : 'rgba(255,255,255,0.07)'}` }}>
                {c.icon} {c.labels[lang]}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Skills */}
        <div style={{ marginBottom: 22 }}>
          <label className="flabel">{Lm.skillLabel}</label>
          {category === 'all' ? (
            <div style={{ fontSize: 13, color: G.muted, fontFamily: "'Inter',sans-serif", marginTop: 8, fontStyle: 'italic' }}>
              {Lm.noSkillNote}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
                {currentSkills.map(s => {
                  const on = skills.includes(s)
                  return (
                    <button key={s} onClick={() => toggleSkill(s)} className="btn" style={{ padding: '6px 13px', fontSize: 12, fontWeight: on ? 700 : 500, borderRadius: 18, background: on ? 'rgba(61,111,168,0.15)' : 'rgba(255,255,255,0.04)', color: on ? G.teal : G.muted, border: `1px solid ${on ? 'rgba(61,111,168,0.45)' : 'rgba(255,255,255,0.07)'}` }}>
                      {on && '✓ '}{s}
                    </button>
                  )
                })}
              </div>
              {skills.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: G.teal, fontFamily: "'Inter',sans-serif" }}>
                  ✓ {skills.length} {Lm.allSkills}: {skills.join(', ')}
                </div>
              )}
              <div style={{ fontSize: 11, color: G.muted, marginTop: 6, fontFamily: "'Inter',sans-serif" }}>{Lm.skillHint}</div>
            </>
          )}
        </div>

        {/* Type filter */}
        <div style={{ marginBottom: 20, maxWidth: 220 }}>
          <label className="flabel">{Lm.typeLabel}</label>
          <select className="inp" value={typeF} onChange={e => setTypeF(e.target.value)} style={{ marginTop: 6 }}>
            <option value="all">{t.allTypes}</option>
            <option value="company">{t.onlyComp}</option>
            <option value="freelancer">{t.onlyFL}</option>
          </select>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn gbtn" onClick={doMatch}
            style={{ opacity: category === 'all' && skills.length === 0 ? 0.5 : 1 }}>
            {Lm.btn}
          </button>
          {(skills.length > 0 || results !== null) && (
            <button className="btn ghost" onClick={reset}>{Lm.clearBtn}</button>
          )}
        </div>
      </div>

      {/* Results */}
      {results !== null && (
        <div className="fi">
          <h3 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 16 }}>
            {Lm.resultsTitle}
            <span style={{ color: G.gold, marginLeft: 8 }}>({results.length})</span>
          </h3>

          {results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: G.muted, fontFamily: "'Inter',sans-serif" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              {Lm.noResults}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
            {results.map((p, i) => {
              const isFL  = p.type === 'freelancer'
              const isSp  = p.tier === 'sponsored'
              const sc    = scoreLabel(p._score)

              return (
                <div key={p.id} className={`card fu${isSp ? ' glow' : ''}`}
                  style={{ padding: 0, overflow: 'hidden', position: 'relative', animationDelay: `${i * 0.04}s`,
                    borderColor: isSp ? 'rgba(251,146,60,0.4)' : G.border,
                    background: isSp ? 'rgba(251,146,60,0.05)' : 'rgba(255,255,255,0.02)',
                    borderColor: isSp ? 'rgba(251,146,60,0.4)' : 'rgba(180,160,100,0.14)' }}>
                  {/* Cover top bar with soft fade */}
                  {(p.coverImage || isSp) && (
                    <div style={{ position:'relative', height: p.coverImage ? 72 : 36, overflow:'hidden', flexShrink:0 }}>
                      {p.coverImage && <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: p.coverFocus||'50% 50%' }} />}
                      {!p.coverImage && isSp && <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,rgba(251,146,60,0.16),rgba(14,20,32,0.9))` }} />}
                      <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg, rgba(14,20,32,1) 0%, rgba(14,20,32,0.5) 45%, rgba(14,20,32,0) 100%)' }} />
                      <div style={{ position:'absolute', top:0, left:0, right:0, height: isSp ? 3 : 2,
                        background: isSp ? 'linear-gradient(90deg,#c9943a,#c9a44a,transparent)' : `linear-gradient(90deg,${p.logoColor||'#c9a44a'}88,transparent)` }} />
                    </div>
                  )}
                  {!p.coverImage && !isSp && <div style={{ height:2, background:`linear-gradient(90deg,${p.logoColor||G.border}44,transparent)` }} />}
                  <div style={{ padding: 20, marginTop: p.coverImage ? -12 : 0, position:'relative', zIndex:1 }}>

                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ borderRadius: 12, overflow:'hidden', border: p.coverImage ? '2px solid rgba(255,255,255,0.3)' : 'none', boxShadow: p.coverImage ? '0 3px 12px rgba(0,0,0,0.35)' : 'none' }}>
                          <Logo text={p.logo} color={p.logoColor} url={p.logoUrl} />
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>📍 {p.city} · {catLabel(p.cat, lang)}</div>
                          {isFL && <div style={{ fontSize: 11, color: G.muted }}>🗣 {p.languages}</div>}
                        </div>
                      </div>

                      {/* Score badge — only when skills selected */}
                      {sc !== null && (
                        <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: 8 }}>
                          <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 22, color: scoreColor(sc), lineHeight: 1 }}>{sc}%</div>
                          <div style={{ fontSize: 9, color: G.muted, marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{Lm.scoreLabel}</div>
                        </div>
                      )}
                    </div>

                    {/* Match score bar */}
                    {sc !== null && (
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginBottom: 10 }}>
                        <div style={{ height: '100%', width: `${sc}%`, background: `linear-gradient(90deg,${scoreColor(sc)},${scoreColor(sc)}80)`, borderRadius: 2, transition: 'width 0.6s ease' }} />
                      </div>
                    )}

                    {/* Matched skills highlight */}
                    {p._matched && p._matched.length > 0 && (
                      <div style={{ marginBottom: 10, padding: '7px 11px', background: 'rgba(61,111,168,0.07)', border: '1px solid rgba(61,111,168,0.2)', borderRadius: 8 }}>
                        <div style={{ fontSize: 10, color: G.teal, fontWeight: 700, marginBottom: 5, letterSpacing: '0.1px' }}>✓ {Lm.matchedSkills}</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {p._matched.map(s => (
                            <span key={s} style={{ fontSize: 11, background: 'rgba(61,111,168,0.15)', color: G.teal, border: '1px solid rgba(61,111,168,0.35)', borderRadius: 5, padding: '2px 8px', fontWeight: 700 }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* All tags */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 11 }}>
                      {p.tags.map(tag => {
                        const isHit = p._matched && p._matched.map(s => s.toLowerCase()).includes(tag.toLowerCase())
                        return isHit ? null : <span key={tag} className="tag">{tag}</span>
                      })}
                    </div>

                    {/* Tier + rating */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        {isSp && <span style={{ fontSize: 10, background: 'rgba(251,146,60,0.14)', color: G.orange, border: '1px solid rgba(251,146,60,0.3)', borderRadius: 5, padding: '2px 8px', fontWeight: 700, fontFamily: "'Raleway',sans-serif" }}>🚀 {lang==='sq'?'Sponsorizuar':'Sponsored'}</span>}
                        {p.verified && <span style={{ fontSize: 10, background: 'rgba(52,199,89,0.1)', color: G.green, border: '1px solid rgba(52,199,89,0.2)', borderRadius: 5, padding: '2px 7px' }}>{t.verified}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: G.muted, fontFamily: "'Inter',sans-serif" }}>

                      </div>
                    </div>

                    {/* Rate note + CTA */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="btn gbtn" style={{ flex: 1, padding: '9px', fontSize: 12 }} onClick={() => setContact(p)}>
                        {t.sendReq}
                      </button>
                      <span style={{ fontSize: 11, color: G.teal, fontFamily: "'Inter',sans-serif", flexShrink: 0 }}>
                        💬 {t.rateNote}
                      </span>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {contact && <ContactModal profile={contact} t={t} onClose={() => setContact(null)} />}

      {/* ── AD BANNER (bottom of directory, above footer) ── */}
      <div style={{ maxWidth: 1200, margin: '28px auto 8px', padding: '0 44px' }}>
        <AdBanner slot="banner" lang={lang} />
      </div>
    </div>
  )
}

function PartnerCards({ lang, profiles, G, t, onBook }) {
  const [enquiryPartner, setEnquiryPartner] = React.useState(null)
  const [enquirySent, setEnquirySent] = React.useState(false)
  const [eForm, setEForm] = React.useState({ name:'', email:'', msg:'' })
  const [detailPartner, setDetailPartner] = React.useState(null)
  if (!profiles || profiles.length === 0) return null
  const dividerLabel = lang === 'sq' ? 'Partnerë' : 'Partners'
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,164,74,0.22))' }} />
        <span style={{ fontSize: 11, color: '#c9a44a', fontFamily: "'Raleway',sans-serif", fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', background: 'rgba(201,164,74,0.10)', border: '1px solid rgba(201,164,74,0.22)', borderRadius: 20, padding: '4px 16px' }}>{dividerLabel}</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(201,164,74,0.22),transparent)' }} />
      </div>
      <div className="partner-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
        {profiles.map((sp, i) => {
          const website = sp.website ? sp.website.replace(/^https?:\/\//, '') : null
          const color = sp.logoColor || '#3d7fa8'
          return (
            <div key={sp.id}
              onClick={() => setDetailPartner(sp)}
              style={{
                background: hexToRgba(color, 0.05),
                border: `1px solid ${hexToRgba(color, 0.28)}`,
                borderRadius: 20, overflow: 'hidden',
                boxShadow: `0 8px 40px rgba(0,0,0,0.22)`,
                transition: 'transform 0.22s, box-shadow 0.22s, border-color 0.22s',
                position: 'relative', cursor: 'pointer',
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.boxShadow=`0 16px 56px rgba(0,0,0,0.32), 0 0 28px ${hexToRgba(color,0.12)}`;e.currentTarget.style.borderColor=hexToRgba(color,0.45)}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 8px 40px rgba(0,0,0,0.22)';e.currentTarget.style.borderColor=hexToRgba(color,0.28)}}>

              {/* ── COVER BANNER ── */}
              <div style={{ position:'relative', height: sp.coverImage ? 110 : 72, overflow:'hidden', flexShrink:0 }}>
                {sp.coverImage
                  ? <img src={sp.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: sp.coverFocus||'50% 50%' }} />
                  : <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${color}28 0%,${color}08 55%,rgba(5,13,24,0.0) 100%)` }} />}
                {sp.coverImage && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'60%', background:'linear-gradient(0deg,rgba(5,13,24,0.55) 0%,transparent 100%)' }} />}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${color},${color}55,transparent)` }} />
              </div>

              {/* ── LOGO centered, bigger, overlaps cover ── */}
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', padding:'0 18px', marginTop:-38, position:'relative', zIndex:1 }}>
                <div style={{ width:76, height:76, borderRadius:18, overflow:'hidden', flexShrink:0,
                  border: '3px solid rgba(5,13,24,0.9)',
                  boxShadow: `0 0 0 2px ${color}55, 0 8px 28px rgba(0,0,0,0.5)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background:`linear-gradient(135deg,${color}20,${color}44)`,
                  marginBottom:12 }}>
                  {sp.logoUrl
                    ? <img src={sp.logoUrl} alt={sp.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <span style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:24, color }}>{(sp.logo||sp.name||'?').slice(0,2)}</span>}
                </div>

                {/* Name + city centered */}
                <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:17, marginBottom:3, letterSpacing:'-0.1px', color:'#e4ddd0' }}>{sp.name}</div>
                {sp.city && <div style={{ fontSize:11, color:'rgba(228,221,208,0.45)', marginBottom:12 }}>📍 {sp.city}</div>}

                {/* Description */}
                {(sp.desc?.en || sp.desc?.sq) && (
                  <div style={{ fontSize:12, color:'rgba(228,221,208,0.52)', lineHeight:1.6, marginBottom:14, textAlign:'center',
                    display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {sp.desc[lang]||sp.desc.en}
                  </div>
                )}

                {/* Tags */}
                {(sp.tags||[]).length > 0 && (
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center', marginBottom:16 }}>
                    {sp.tags.slice(0,3).map(s=>(
                      <span key={s} style={{ background:`${color}0e`, color, border:`1px solid ${color}25`, borderRadius:20, padding:'3px 10px', fontSize:10 }}>{s}</span>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div style={{ display:'flex', gap:8, paddingBottom:20, width:'100%' }}>
                  <button className="btn teal-btn" style={{ flex:1, padding:'10px', fontSize:12, fontWeight:700, borderRadius:10,
                    background:`linear-gradient(135deg,${color},${color}bb)`, border:'none', color:'#080d1a' }}
                    onClick={e=>{e.stopPropagation(); setEnquiryPartner(sp); setEnquirySent(false); setEForm({name:'',email:'',msg:''})}}>
                    ✉️ {lang==='sq'?'Kontakto':'Contact'}
                  </button>
                  {website && (
                    <a href={`https://${website}`} target="_blank" rel="noopener noreferrer"
                      onClick={e=>e.stopPropagation()}
                      style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'10px 14px', background:`rgba(5,13,24,0.4)`, border:`1px solid ${color}30`, borderRadius:10, color, textDecoration:'none', fontSize:12, backdropFilter:'blur(8px)' }}>
                      🌐
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}

      </div>
      {enquiryPartner && (
        <div className="modal-bg fi" onClick={e=>e.target===e.currentTarget&&setEnquiryPartner(null)}>
          <div className="modal su">
            {!enquirySent ? (<>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
                <div>
                  <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:19 }}>{lang==='sq'?'Kërkesë për':'Enquiry to'}: {enquiryPartner.name}</div>
                  {enquiryPartner.website && <a href={`https://${enquiryPartner.website.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:G.teal, textDecoration:'none' }}>{enquiryPartner.website.replace(/^https?:\/\//,'')} ↗</a>}
                </div>
                <ModalClose onClose={()=>setEnquiryPartner(null)} />
              </div>
              <div style={{ background:'rgba(61,111,168,0.05)', border:'1px solid rgba(61,111,168,0.2)', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:12, color:G.teal }}>
                📧 {lang==='sq'?'Mesazhi dërgohet direkt te':'Message sent directly to'}: <strong>{enquiryPartner.contact}</strong>
              </div>
              <div style={{ marginBottom:11 }}><label className="flabel">{t.reqName}</label><input className="inp" value={eForm.name} onChange={e=>setEForm(f=>({...f,name:e.target.value}))} /></div>
              <div style={{ marginBottom:11 }}><label className="flabel">{t.reqEmail}</label><input className="inp" type="email" value={eForm.email} onChange={e=>setEForm(f=>({...f,email:e.target.value}))} /></div>
              <div style={{ marginBottom:18 }}><label className="flabel">{t.reqMsg}</label><textarea className="inp" rows={4} style={{resize:'vertical'}} value={eForm.msg} onChange={e=>setEForm(f=>({...f,msg:e.target.value}))} placeholder={lang==='sq'?'Përshkruani çfarë po kërkoni…':'Describe what you are looking for…'} /></div>
              <div style={{ display:'flex', gap:9 }}>
                <button className="btn teal-btn" style={{ flex:1 }} disabled={!eForm.name||!eForm.email} onClick={async()=>{
                  if(enquiryPartner.contact) {
                    const mailtoFallback = () => {
                      const subj = encodeURIComponent(`Enquiry via Business Bridge Platform`)
                      const body = encodeURIComponent(`Hello ${enquiryPartner.name},\n\nFrom: ${eForm.name} (${eForm.email})\n\n${eForm.msg}\n\n---\nSent via Business Bridge Platform`)
                      window.open(`mailto:${enquiryPartner.contact}?subject=${subj}&body=${body}`, '_blank')
                    }
                    sendEnquiry({toEmail:enquiryPartner.contact,companyName:enquiryPartner.name,fromName:eForm.name,fromEmail:eForm.email,message:eForm.msg}).catch(()=>mailtoFallback())
                  }
                  insertContactLead({profile_id:enquiryPartner.id||null,profile_name:enquiryPartner.name,sender_name:eForm.name,sender_email:eForm.email,message:eForm.msg}).catch(()=>{})
                  setEnquirySent(true)
                }}>{t.reqSend}</button>
                <button className="btn ghost" onClick={()=>setEnquiryPartner(null)}>{t.reqCancel}</button>
              </div>
            </>) : (
              <div style={{ textAlign:'center', padding:'18px 0' }}>
                <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:21, marginBottom:9 }}>{t.reqDoneTitle}</div>
                <p style={{ fontFamily:"'Inter',sans-serif", color:G.muted, fontSize:14, lineHeight:1.75, marginBottom:18 }}><strong>{enquiryPartner.name}</strong> {t.reqDoneSub}</p>
                <button className="btn teal-btn" style={{ width:'100%' }} onClick={()=>setEnquiryPartner(null)}>{t.close}</button>
              </div>
            )}
          </div>
        </div>
      )}
      {detailPartner && (
        <ProfileDetailModal
          p={detailPartner} lang={lang} t={t}
          onClose={() => setDetailPartner(null)}
          onContact={() => { setEnquiryPartner(detailPartner); setDetailPartner(null) }}
        />
      )}
    </div>
  )
}


// ─── CONCIERGE PAGE ───────────────────────────────────────────────────────────
function ConciergePage({ lang, t, content = {} }) {
  const raw = window.__siteContent || content
  const sc = { partners: { ...(raw.partners || {}) }, concierge: { ...(raw.concierge || {}) } }
  const P = sc.partners
  const CC = sc.concierge
  const [bookModal, setBookModal] = useState(false)
  const [bookForm, setBookForm] = useState({ name:'', company:'', email:'', goal:'', timeframe:'', pax:'1' })
  const [selectedPkg, setSelectedPkg] = useState(null)
  // Load partner-type profiles from DB for the team section
  const [partnerProfiles, setPartnerProfiles] = useState([])
  useEffect(() => {
    if (window.__techgateProfiles) {
      setPartnerProfiles(window.__techgateProfiles.filter(p => p.type === 'partner'))
    } else {
      fetchProfiles().then(data => setPartnerProfiles(data.filter(p => p.type === 'partner').map(normaliseProfile))).catch(() => {})
    }
  }, [])
  const [bookDone, setBookDone] = useState(false)
  const [partnerModal, setPartnerModal] = useState(false)
  const [partnerDone, setPartnerDone] = useState(false)

  const PACKAGES = [
    { ic: '🔍', col: '#4a7fa5', price: { de: 'ab €390', en: 'from €390', sq: 'nga €390', sv: 'från €390' }, name: lang === 'sq' ? 'Vizita Discovery' : 'Discovery Visit', dur: lang === 'sq' ? '1–2 ditë' : '1–2 days', ideal: lang === 'sq' ? 'Eksplorimi i parë' : 'First exploration', inc: lang === 'sq' ? ['Analizë nevojash', '2–3 takime', 'Briefing & raport'] : ['Needs analysis call', '2–3 meetings', 'Briefing & report'] },
    { ic: '🤝', col: G.gold, highlight: true, price: { de: 'ab €790', en: 'from €790', sq: 'nga €790', sv: 'från €790' }, name: lang === 'sq' ? 'Vizita Biznesi' : 'Business Visit', dur: lang === 'sq' ? '2–3 ditë' : '2–3 days', ideal: lang === 'sq' ? 'Projekt konkret' : 'Concrete project', inc: lang === 'sq' ? ['Gjithçka nga Discovery', '4–6 takime', 'Hotel & transport', 'Mbrëmje rrjetëzimi'] : ['Everything in Discovery', '4–6 meetings', 'Hotel & transfer', 'Networking evening'] },
    { ic: '🏛️', col: '#6b7fa8', price: { de: 'ab €1.490', en: 'from €1,490', sq: 'nga €1.490', sv: 'från €1 490' }, name: lang === 'sq' ? 'Vizita Executive' : 'Executive Visit', dur: lang === 'sq' ? '3–5 ditë' : '3–5 days', ideal: lang === 'sq' ? 'Themelim / Investim' : 'Company formation / Investment', inc: lang === 'sq' ? ['Gjithçka nga Business', 'Takim ministrie', 'Darkë partnerësh', 'Këshillim ligjor'] : ['Everything in Business Visit', 'Ministry meeting', 'Partner dinner', 'Initial legal advice'] },
  ]

  return (
    <div>
      {/* ── HERO ── */}
      <div className="conc-hero" style={{ padding: '56px 48px 40px', background: 'linear-gradient(135deg,rgba(61,111,168,0.09),transparent 70%)', borderBottom: `1px solid ${G.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(61,111,168,0.02) 1px,transparent 1px)', backgroundSize: '38px 38px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 660, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(61,111,168,0.1)', border: '1px solid rgba(61,111,168,0.25)', borderRadius: 100, padding: '5px 16px', marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, background: G.teal, borderRadius: '50%', display: 'inline-block' }} className="pg" />
            <span style={{ fontSize: 12, color: G.teal, fontFamily: "'Inter',sans-serif", fontWeight: 500 }}>
              {(2 + (partnerProfiles?.length || 0))} {t.concAvail}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4.5vw,48px)', letterSpacing: '-1.1px', lineHeight: 1.1, marginBottom: 14 }}>
            {CC.hero_title || t.concHeroTitle}<br /><span style={{ color: G.teal }}>
              {lang === 'sq' ? 'Ne organizojmë gjithçka.' : 'We organise everything.'}
            </span>
          </h1>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 15, color: G.muted, lineHeight: 1.82, marginBottom: 26, maxWidth: 520, fontWeight: 300 }}>{CC.hero_sub || t.concHeroSub}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn teal-btn" onClick={() => setBookModal(true)}>{t.concReq}</button>
            <button className="btn ghost">{t.concLearn}</button>
          </div>
        </div>
      </div>

      <div className="conc-content" style={{ padding: '44px 48px 56px', maxWidth: 1200, margin: '0 auto', overflowX: 'hidden' }}>

        {/* ── OFFICIAL PARTNERS ── */}
        <div id="concierge-partners" style={{ marginBottom: 52 }}>
          <h2 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 21, marginBottom: 6 }}>{t.concPartnersTitle}</h2>
          <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22, lineHeight: 1.7 }}>{t.concPartnersSub}</p>
          <div className="conc-partners-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* rootsGTM — General Partner */}
            <div className="conc-partner-card" style={{ background: 'rgba(61,111,168,0.05)', border: '1px solid rgba(61,111,168,0.28)', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
              {/* Cover banner */}
              <div className="gp-cover" style={{ position:'relative', height: P.rootsgtm_cover ? 110 : 60, overflow:'hidden', flexShrink:0 }}>
                {P.rootsgtm_cover
                  ? <img src={P.rootsgtm_cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: P.rootsgtm_cover_focus||'50% 50%' }} />
                  : <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(61,111,168,0.22),rgba(14,20,32,0.9))' }} />}
                {P.rootsgtm_cover && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'50%', background:'linear-gradient(0deg,rgba(14,20,32,0.4) 0%,transparent 100%)' }} />}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#3d7fa8,#2a5585,rgba(201,164,74,0.4),transparent)' }} />
              </div>
              {/* Logo overlapping cover */}
              <div style={{ padding:'0 20px', marginTop:-34, position:'relative', zIndex:1 }}>
                <div className="gp-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:12 }}>
                  <div className="gp-logo" style={{ width:68, height:68, borderRadius:16, overflow:'hidden',
                    border:'3px solid #0a1222',
                    boxShadow:'0 0 0 2px rgba(61,111,168,0.5), 0 4px 18px rgba(0,0,0,0.5)',
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    background:'linear-gradient(135deg,rgba(61,111,168,0.3),rgba(61,111,168,0.1))' }}>
                    {P.rootsgtm_logo
                      ? <img src={P.rootsgtm_logo} alt={P.rootsgtm_name||'rootsGTM'} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      : <span style={{ fontSize:26 }}>🚀</span>}
                  </div>
                  <span className="gp-badge" style={{ fontSize:11, background:'rgba(52,199,89,0.1)', color:G.green, border:'1px solid rgba(52,199,89,0.25)', borderRadius:5, padding:'3px 9px', fontWeight:700, marginBottom:6 }}>✓ Live</span>
                </div>
                <div className="gp-name" style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:20, color:G.teal, marginBottom:2 }}>{P.rootsgtm_name||'rootsGTM'}</div>
                <div className="gp-sub" style={{ fontSize:12, color:G.muted, marginBottom:14 }}>{lang==='sq'?'Partner i Përgjithshëm · Aktiv':'General Partner · Active'}</div>
                <p className="gp-desc" style={{ fontFamily:"'Inter',sans-serif", fontSize:14, color:'rgba(228,221,208,0.75)', lineHeight:1.75, marginBottom:16 }}>
                  {P.rootsgtm_desc||'rootsGTM is our exclusive sales network for EU–Kosova connections.'}
                </p>
                <div className="partner-feat-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                  {(lang==='sq'?['🤝 Kontakt direkt','📅 Organizim takimesh','🎤 Evente & Rrjet','📄 Vijim & Kontrata']:['🤝 Direct client contact','📅 Meeting organisation','🎤 Events & networking','📄 Follow-up & contracts']).map(f=>(
                    <div key={f} className="partner-feat-item" style={{ background:'rgba(61,111,168,0.06)', border:'1px solid rgba(61,111,168,0.15)', borderRadius:8, padding:'10px 12px', fontFamily:"'Inter',sans-serif", fontSize:13, color:'rgba(228,221,208,0.80)' }}>{f}</div>
                  ))}
                </div>
                <button className="btn teal-btn" style={{ width:'100%', padding:'11px', marginBottom:20 }} onClick={()=>setBookModal(true)}>
                  {lang==='sq'?'Kërko me rootsGTM →':'Enquire via rootsGTM →'}
                </button>
              </div>
            </div>

            {/* Government — General Partner */}
            <div className="conc-partner-card" style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
              {/* Cover banner */}
              <div className="gp-cover" style={{ position:'relative', height: P.gov_cover ? 110 : 60, overflow:'hidden', flexShrink:0 }}>
                {P.gov_cover
                  ? <img src={P.gov_cover} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: P.gov_cover_focus||'50% 50%' }} />
                  : <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,rgba(201,164,74,0.22),rgba(14,20,32,0.9))` }} />}
                {P.gov_cover && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'50%', background:'linear-gradient(0deg,rgba(14,20,32,0.4) 0%,transparent 100%)' }} />}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,#c9a44a,#c9a44a,rgba(201,164,74,0.3),transparent)` }} />
              </div>
              {/* Logo overlapping cover */}
              <div style={{ padding:'0 20px', marginTop:-34, position:'relative', zIndex:1 }}>
                <div className="gp-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:12 }}>
                  <div className="gp-logo" style={{ width:68, height:68, borderRadius:16, overflow:'hidden',
                    border:'3px solid #0a1222',
                    boxShadow:`0 0 0 2px ${G.goldBorder}, 0 4px 18px rgba(0,0,0,0.5)`,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    background:'linear-gradient(135deg,rgba(201,164,74,0.3),rgba(201,164,74,0.1))' }}>
                    {P.gov_logo
                      ? <img src={P.gov_logo} alt={P.gov_name||'Kosova Gov'} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      : <span style={{ fontSize:26 }}>🏛️</span>}
                  </div>
                  <span className="gp-badge" style={{ fontSize:11, background:G.goldDim, color:G.gold, border:`1px solid ${G.goldBorder}`, borderRadius:5, padding:'3px 9px', fontWeight:700, marginBottom:6 }}>
                    {lang==='sq'?'⏳ Në negocim':'⏳ In negotiation'}
                  </span>
                </div>
                <div className="gp-name" style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:20, color:G.gold, marginBottom:2 }}>
                  {P.gov_name||(lang==='sq'?'Qeveria e Kosovës':'Kosova Government')}
                </div>
                <div className="gp-sub" style={{ fontSize:12, color:G.muted, marginBottom:14 }}>InvestKosova · {lang==='sq'?'Partner Zyrtar':'Official Partner'}</div>
                <p className="gp-desc" style={{ fontFamily:"'Inter',sans-serif", fontSize:14, color:'rgba(228,221,208,0.75)', lineHeight:1.75, marginBottom:16 }}>
                  {P.gov_desc||(lang==='sq'?'Business Bridge Platform po ndërton partneritet zyrtar me InvestKosova dhe Ministrinë e Ekonomisë.':'Business Bridge Platform is building an official partnership with InvestKosova and the Ministry of Economy.')}
                </p>
                <div className="partner-feat-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                  {(lang==='sq'?['🏛️ Takime InvestKosova','📋 Këshillim themelimi','🤝 Takime ministrie','📊 Mbështetje investimesh']:['🏛️ InvestKosova meetings','📋 Company formation advice','🤝 Ministry appointments','📊 Investment support']).map(f=>(
                    <div key={f} className="partner-feat-item" style={{ background:'rgba(201,164,74,0.07)', border:`1px solid ${G.goldBorder}`, borderRadius:8, padding:'10px 12px', fontFamily:"'Inter',sans-serif", fontSize:13, color:'rgba(228,221,208,0.80)' }}>{f}</div>
                  ))}
                </div>
                <button className="btn gbtn" style={{ width:'100%', padding:'11px', marginBottom:20 }} onClick={()=>setBookModal(true)}>
                  {lang==='sq'?'Kërko takim qeveritar →':'Request government meeting →'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── PACKAGES ── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 21, marginBottom: 6 }}>{t.concPkgTitle}</h2>
          <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22 }}>{t.concPkgSub}</p>
          <div className="conc-pkg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
            {PACKAGES.map((pkg, i) => (
              <div key={i} style={{ background: pkg.highlight ? G.goldDim : G.card, border: `1px solid ${pkg.highlight ? G.goldBorder : G.border}`, borderRadius: 14, padding: '22px 20px', position: 'relative', transition: 'all 0.22s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = '' }}>
                {pkg.highlight && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: G.gold, color: '#050d1b', borderRadius: 100, padding: '3px 14px', fontSize: 10, fontWeight: 700, fontFamily: "'Raleway',sans-serif", whiteSpace: 'nowrap' }}>⭐ POPULAR</div>}
                <div style={{ fontSize: 26, marginBottom: 8 }}>{pkg.ic}</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{pkg.name}</div>
                {/* Price */}
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 26, color: pkg.highlight ? G.gold : pkg.col }}>{pkg.price[lang] || pkg.price.en}</span>
                </div>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 2 }}>⏱ {pkg.dur}</div>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 13, fontStyle: 'italic' }}>{pkg.ideal}</div>
                <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 10, marginBottom: 14 }}>
                  {pkg.inc.map(item => (
                    <div key={item} style={{ display: 'flex', gap: 7, marginBottom: 6, fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(228,221,208,0.75)' }}>
                      <span style={{ color: pkg.col, flexShrink: 0 }}>✓</span>{item}
                    </div>
                  ))}
                </div>
                <button className="btn" style={{ width: '100%', padding: '9px', background: pkg.highlight ? G.gold : 'transparent', color: pkg.highlight ? '#050d1b' : pkg.col, border: `1px solid ${pkg.col}44`, fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 13 }} onClick={() => { setSelectedPkg(pkg.name); setBookModal(true) }}>{t.pkgCta}</button>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: G.muted, marginTop: 12, fontStyle: 'italic' }}>
            {lang === 'sq' ? '* Çmimet janë orientuese. Çmimi final bien dakord bashkërisht.' : '* Prices are indicative. The final price is agreed together based on scope and requirements.'}
          </p>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 21, marginBottom: 6 }}>{t.concHowTitle}</h2>
          <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22 }}>{t.concHowSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 9 }}>
            {t.howSteps.map((s, i) => (
              <div key={i} className="card fu" style={{ padding: 16, textAlign: 'center', animationDelay: `${i * 0.05}s` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G.teal, marginBottom: 6, letterSpacing: '1px' }}>STEP {s.n}</div>
                <div style={{ fontSize: 22, marginBottom: 7 }}>{s.ic}</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.t}</div>
                <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: G.muted, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        <PartnerCards lang={lang} profiles={partnerProfiles} G={G} t={t} onBook={() => setBookModal(true)} />

        {/* ── CTA ── */}
        <div style={{ background: 'linear-gradient(135deg,rgba(61,111,168,0.08),rgba(201,164,74,0.04))', border: '1px solid rgba(61,111,168,0.2)', borderRadius: 14, padding: '30px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>{t.concCtaTitle}</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontFamily: "'Inter',sans-serif", fontSize: 13, color: G.teal }}>
              {t.concCtaFeats.map(f => <span key={f}>{f}</span>)}
            </div>
          </div>
          <button className="btn teal-btn" style={{ flexShrink: 0, padding: '12px 26px', fontSize: 14 }} onClick={() => setBookModal(true)}>{t.concCtaBtn}</button>
        </div>

        {/* ── BECOME A PARTNER (premium, matches home CTA style) ── */}
        <div style={{ position:'relative', overflow:'hidden', background: 'linear-gradient(135deg,rgba(61,111,168,0.09) 0%,rgba(61,111,168,0.04) 40%,rgba(201,164,74,0.05) 100%)', border: '1px solid rgba(61,111,168,0.3)', borderRadius: 16, padding: '32px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* bg glows */}
          <div style={{ position:'absolute', top:'-50%', right:'-5%', width:'30%', paddingBottom:'30%', borderRadius:'50%', background:'radial-gradient(circle,rgba(61,111,168,0.1),transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-50%', left:'5%', width:'20%', paddingBottom:'20%', borderRadius:'50%', background:'radial-gradient(circle,rgba(201,164,74,0.07),transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'relative', maxWidth: 500 }}>
            <div style={{ fontSize:10, color:G.teal, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:8 }}>
              🤝 {lang==='sq'?'Rrjet Global B2B · Oportunitete Partneriteti':'Global B2B Network · Partnership Opportunity'}
            </div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 8, letterSpacing:'-0.1px' }}>{t.concBecomeTitle}</div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: G.muted, lineHeight: 1.75, marginBottom: 12 }}>{t.concBecomeSub}</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {t.concBecomeTypes.map(type => <span key={type} style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: G.teal }}>{type}</span>)}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:9, flexShrink:0, position:'relative' }}>
            <button className="btn teal-btn" style={{ padding:'12px 24px', fontSize:13, fontWeight:700, whiteSpace:'nowrap' }} onClick={() => setPartnerModal(true)}>{t.concBecomeBtn}</button>
            <div style={{ fontSize:11, color:'rgba(61,111,168,0.5)', textAlign:'center', fontFamily:"'Inter',sans-serif" }}>
              {lang==='sq'?'✓ Pa pagesë · Verifikim brenda 48h':'✓ Free · Verified within 48h'}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOOK MODAL ── */}
      {bookModal && !bookDone && (
        <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && setBookModal(false)}>
          <div className="modal su">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 19 }}>{t.bookTitle}</div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>
                  rootsGTM · Business Bridge Platform
                  {selectedPkg && <span style={{ color: G.teal, marginLeft: 6 }}>· {selectedPkg}</span>}
                </div>
              </div>
              <ModalClose onClose={() => setBookModal(false)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 11 }}>
              <div><label className="flabel">{t.bookName}</label><input className="inp" value={bookForm.name} onChange={e=>setBookForm(f=>({...f,name:e.target.value}))} /></div>
              <div><label className="flabel">{t.bookComp}</label><input className="inp" value={bookForm.company} onChange={e=>setBookForm(f=>({...f,company:e.target.value}))} /></div>
            </div>
            <div style={{ marginBottom: 11 }}><label className="flabel">{t.bookEmail}</label><input className="inp" value={bookForm.email} onChange={e=>setBookForm(f=>({...f,email:e.target.value}))} /></div>
            <div style={{ marginBottom: 11 }}><label className="flabel">{t.bookGoal}</label><textarea className="inp" rows={3} style={{ resize: 'vertical' }} value={bookForm.goal} onChange={e=>setBookForm(f=>({...f,goal:e.target.value}))} placeholder={t.bookGoalPH} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div><label className="flabel">{t.bookWhen}</label><input className="inp" value={bookForm.timeframe} onChange={e=>setBookForm(f=>({...f,timeframe:e.target.value}))} /></div>
              <div><label className="flabel">{t.bookPax}</label>
                <select className="inp" value={bookForm.pax} onChange={e=>setBookForm(f=>({...f,pax:e.target.value}))}>{['1', '2', '3', '4', '5+'].map(n => <option key={n}>{n}</option>)}</select>
              </div>
            </div>
            <button className="btn teal-btn" style={{ width: '100%', padding: '11px' }} onClick={() => {
              insertBooking({
                name:         bookForm?.name || '',
                company:      bookForm?.company || '',
                email:        bookForm?.email || '',
                goal:         bookForm?.goal || '',
                timeframe:    bookForm?.timeframe || '',
                participants: bookForm?.pax || '1',
                package_name: selectedPkg || '',
              }).catch(console.error)
              // Send confirmation emails
              if (bookForm.email) {
                sendBookingConfirmation({
                  name:        bookForm.name,
                  email:       bookForm.email,
                  packageName: selectedPkg,
                  goal:        bookForm.goal,
                  timeframe:   bookForm.timeframe,
                  pax:         bookForm.pax,
                }).catch(() => {})
              }
              setBookDone(true)
            }}>{t.bookSend}</button>
          </div>
        </div>
      )}
      {bookDone && (
        <div className="modal-bg fi" onClick={() => { setBookDone(false); setBookModal(false) }}>
          <div className="modal su" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.bookDoneTitle}</div>
            <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}>{t.bookDoneSub}</p>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={() => { setBookDone(false); setBookModal(false) }}>{t.close}</button>
          </div>
        </div>
      )}

      {/* ── PARTNER MODAL — uses same full SmartRegForm as "List Profile → Partner" ── */}
      {partnerModal && !partnerDone && (
        <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && setPartnerModal(false)}>
          <div className="modal su" style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 19 }}>{t.partnerRegTitle}</div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{t.partnerRegSub}</div>
              </div>
              <ModalClose onClose={() => setPartnerModal(false)} />
            </div>
            <SmartRegForm
              lang={lang} t={t} regType={t.regSP}
              onDone={() => setPartnerDone(true)}
            />
          </div>
        </div>
      )}
      {partnerDone && (
        <div className="modal-bg fi" onClick={() => { setPartnerDone(false); setPartnerModal(false) }}>
          <div className="modal su" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.partnerDoneTitle}</div>
            <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}>{t.partnerDoneSub}</p>
            <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 13, marginBottom: 18 }}>
              {lang==='sq' ? '⏳ Profili juaj shfaqet pas miratimit nga admin.' : '⏳ Your profile will appear here after admin approval.'}
            </p>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={() => { setPartnerDone(false); setPartnerModal(false) }}>{t.close}</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── GOV PAGE ─────────────────────────────────────────────────────────────────
function GovPage({ lang, t, content = {} }) {
  const gc = content.gov || {}
  // Defaults fallback to translated strings if no admin content set
  const heroTitle    = gc.heroTitle    || t.govH1
  const heroTitle2   = gc.heroTitle2   || t.govH2
  const heroSub      = gc.heroSub      || t.govSub
  const factsHeading = gc.factsHeading || t.govFactsH
  const badge        = gc.badge        || t.govBadge
  const btns = gc.buttons || [
    { label: 'InvestKosova →', url: 'https://www.investkosova.com', style: 'primary' },
    { label: 'ARBK →',         url: 'https://arbk.rks-gov.net',     style: 'ghost' },
    { label: 'ATK →',          url: 'https://www.atk-ks.org',        style: 'ghost' },
  ]
  return (
    <div style={{ padding: '44px', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'inline-block', background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 6, padding: '4px 12px', fontSize: 11, color: G.gold, marginBottom: 12, letterSpacing: '1px', textTransform: 'uppercase' }}>{badge}</div>
      <h2 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 'clamp(22px,3.5vw,36px)', letterSpacing: '-0.7px', marginBottom: 10 }}>{heroTitle}<br /><span style={{ color: G.gold }}>{heroTitle2}</span></h2>
      <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.8, maxWidth: 560, marginBottom: 36 }}>{heroSub}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 32 }}>
        {(gc.steps || t.govSteps).map((s, i) => (
          <div key={i} className="card fu" style={{ padding: 18, animationDelay: `${i * 0.06}s` }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.ic || s.icon || '📋'}</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontSize: 10, fontWeight: 700, color: G.gold, marginBottom: 4, letterSpacing: '0.5px' }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.t || s.title}</div>
            <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: G.muted, lineHeight: 1.6, marginBottom: 7 }}>{s.d || s.desc}</p>
            <div style={{ fontSize: 11, background: 'rgba(52,199,89,0.08)', color: G.green, border: '1px solid rgba(52,199,89,0.2)', borderRadius: 5, padding: '2px 7px', display: 'inline-block' }}>⏱ {s.time}</div>
          </div>
        ))}
      </div>
      <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 14, padding: '24px 28px' }}>
        <h3 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 18 }}>{factsHeading}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 16, marginBottom: 20 }}>
          {(gc.facts || t.govFacts).map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 22, color: G.gold }}>{v}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: G.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${G.goldBorder}`, paddingTop: 16, display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          {btns.map((btn, i) => btn.style === 'primary'
            ? <button key={i} className="btn gbtn" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => window.open(btn.url, '_blank')}>{btn.label}</button>
            : <button key={i} className="btn ghost" style={{ fontSize: 12 }} onClick={() => window.open(btn.url, '_blank')}>{btn.label}</button>
          )}
        </div>
      </div>
    </div>
  )
}


// ─── FLOATING SIDEBAR ADS — fixed position, never affect page layout ─────────
function FloatingSidebars({ lang }) {
  const [visible, setVisible] = React.useState(false)
  React.useEffect(() => {
    const check = () => setVisible(window.innerWidth >= 1480)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  if (!visible) return null
  return (
    <>
      {/* Left */}
      <div style={{ position: 'fixed', left: 12, top: 120, width: 148, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ pointerEvents: 'auto', opacity: 0.92 }}>
            <AdBanner slot="sidebar" lang={lang} index={i} />
          </div>
        ))}
      </div>
      {/* Right */}
      <div style={{ position: 'fixed', right: 12, top: 120, width: 148, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 10, pointerEvents: 'none' }}>
        {[3,4,5].map(i => (
          <div key={i} style={{ pointerEvents: 'auto', opacity: 0.92 }}>
            <AdBanner slot="sidebar" lang={lang} index={i} />
          </div>
        ))}
      </div>
    </>
  )
}

// ─── AD BANNER COMPONENT ─────────────────────────────────────────────────────
// Usage: <AdBanner slot="sidebar" lang={lang} />  or  <AdBanner slot="banner" lang={lang} />
// Sponsors configure their ads via admin panel (site_content key: "ads")
function AdBanner({ slot = 'banner', lang }) {
  const ads = window.__siteContent?.ads || []
  const slotAds = ads.filter(a => a.slot === slot && a.active)
  if (slotAds.length === 0) {
    // Placeholder shown only in admin preview (hidden in production)
    return (
      <div style={{
        border: '1px dashed rgba(201,164,74,0.25)', borderRadius: 10,
        padding: slot === 'sidebar' ? '18px 14px' : '12px 20px',
        textAlign: 'center', background: 'rgba(201,164,74,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        minHeight: slot === 'sidebar' ? 200 : 64,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(201,164,74,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            📢 {slot === 'sidebar' ? '160×600 Sidebar Ad' : '728×90 Banner Ad'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(201,164,74,0.3)', marginTop: 4 }}>
            {lang === 'sq' ? 'Slot reklamash i disponueshëm' : 'Ad slot available — contact us'}
          </div>
        </div>
      </div>
    )
  }
  // Rotate ads for this slot
  const [idx] = React.useState(() => Math.floor(Math.random() * slotAds.length))
  const ad = slotAds[idx % slotAds.length]
  return (
    <a href={ad.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}
      onClick={() => { /* track click */ }}>
      <div style={{
        borderRadius: 10, overflow: 'hidden', position: 'relative',
        background: ad.bgColor || 'rgba(201,164,74,0.07)',
        border: `1px solid ${ad.borderColor || 'rgba(201,164,74,0.2)'}`,
        minHeight: slot === 'sidebar' ? 200 : 64,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 16px', gap: 12,
      }}>
        {ad.imageUrl && <img src={ad.imageUrl} alt={ad.label} style={{ maxHeight: slot==='sidebar'?120:48, maxWidth: slot==='sidebar'?130:220, objectFit:'contain' }} />}
        <div>
          <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:13, color:ad.textColor||G.text }}>{ad.label}</div>
          {ad.sub && <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{ad.sub}</div>}
          {ad.cta && <div style={{ fontSize:11, color:G.teal, marginTop:4, fontWeight:600 }}>{ad.cta} →</div>}
        </div>
        <div style={{ position:'absolute', top:4, right:6, fontSize:8, color:G.muted, opacity:0.5 }}>AD</div>
      </div>
    </a>
  )
}

// ─── TAG SUGGESTIONS PER CATEGORY ────────────────────────────────────────────
const TAG_SUGGESTIONS = {
  software:   ['React','Vue','Angular','Next.js','TypeScript','JavaScript','Node.js','Python','Django','PHP','Java','DevOps','Kubernetes','AWS','Azure','Docker','Mobile','React Native','Flutter','PostgreSQL','MongoDB','GraphQL','REST API','Microservices','CI/CD'],
  support:    ['Helpdesk','ITIL v4','24/7','Windows','CompTIA A+','ServiceNow','Zendesk','Remote Support','Network','Linux','VPN','Microsoft 365','Active Directory'],
  consulting: ['Agile','Scrum','PMP','SAP','ERP','Change Management','Business Analysis','IT-Strategy','PMO','PRINCE2','Six Sigma'],
  media:      ['Videography','Video Production','Content Creation','Photography','Reels','YouTube','TikTok','Instagram','Social Media','Drone','Podcast','Editing','After Effects','Premiere Pro','Colour Grading','Corporate Video','Brand Story','Copywriting'],
  design:     ['Figma','UI/UX','Branding','Adobe XD','Illustrator','Photoshop','Motion','Webflow','Brand Identity','UX Research','Graphic Design','Logo Design'],
  textile:    ['Knitting','Embroidery','Screen Printing','DTG Print','Workwear','Uniforms','Custom T-Shirts','Private Label','Cut & Sew','Fashion Design','Sportswear','Safety Clothing','Embroidered Logos','Small Runs','White Label'],
  bpo:        ['Inbound','Outbound','CRM','Salesforce','HubSpot','Customer Service','Sales','Lead Generation','GDPR','Multi-language','German','English','Albanian'],
  production: ['CNC','ISO 9001','Lean','CAD','SolidWorks','Quality Control','Injection Moulding','Welding','Sheet Metal','Assembly','3D Printing'],
  logistics:  ['Customs','Freight','EU Corridor','Warehouse','Cold Chain','Tracking','Import/Export','Last Mile','3PL','DHL','FedEx'],
  legal:      ['Commercial Law','Corporate Law','Foreign Investment','Contracts','IP','Compliance','Tax Law','Employment Law','Kosova Law','EU Law'],
}

// ─── SMART REGISTRATION FORM ─────────────────────────────────────────────────
function SmartRegForm({ lang, t, regType, onDone }) {
  const isSP = regType === t.regSP  // Partner — separate form
  const [form, setForm] = React.useState({ name: '', city: '', email: '', website: '', phone: '', employees: '', desc: '', customTag: '', focus: '', eu_langs: '', markets: '', logoColor: '#4a7fa5', coverImage: null, coverFocus: '50% 50%' })
  const [selectedTags, setSelectedTags] = React.useState([])
  const [catChoice, setCatChoice] = React.useState('software')
  const [partnerLogoFile, setPartnerLogoFile] = React.useState(null)
  const [emailError, setEmailError] = React.useState('')
  const [emailChecking, setEmailChecking] = React.useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Real-time duplicate email check
  const checkEmail = React.useCallback(async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError(''); return }
    setEmailChecking(true)
    try {
      const all = await fetchProfiles()
      const allAdmin = await fetchAllProfilesAdmin().catch(() => [])
      const allCombined = [...all, ...allAdmin.filter(p => !p.verified)]
      const exists = allCombined.some(p => p.contact && p.contact.toLowerCase() === email.toLowerCase())
      if (exists) setEmailError(lang === 'sq' ? 'Ky email është tashmë i regjistruar në platformë.' : 'This email is already registered in the platform.')
      else setEmailError('')
    } catch { setEmailError('') }
    finally { setEmailChecking(false) }
  }, [lang])

  const toggleTag = tag => setSelectedTags(p => p.includes(tag) ? p.filter(x => x !== tag) : [...p, tag])

  const addCustomTag = () => {
    const tag = form.customTag.trim()
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags(p => [...p, tag])
      f('customTag', '')
    }
  }

  // Merge hardcoded suggestions with any extra tags from DB profiles
  const dbTags = React.useMemo(() => {
    const src = window.__techgateProfiles?.length > 0 ? window.__techgateProfiles : []
    const set = new Set()
    src.filter(p => p.cat === catChoice).forEach(p => (p.tags||[]).forEach(t => set.add(t)))
    return [...set].filter(t => !(TAG_SUGGESTIONS[catChoice]||[]).includes(t))
  }, [catChoice])
  const suggestions = [...(TAG_SUGGESTIONS[catChoice] || []), ...dbTags]

  const L = {
    en: { cat: 'Sector', name: 'Name / Company *', city: 'City *', email: 'E-mail *', website: 'Website', employees: 'Number of employees', desc: 'Short description', descPH: 'What do you offer? Special experience, client projects, USP…', tagSuggest: 'Suggested skills / tags', tagCustom: 'Add custom tag', tagCustomPH: 'e.g. Cybersecurity', tagAdd: '+ Add', tagSelected: 'Selected tags', availNote: '💬 Availability & capacity communicated directly on request.', send: 'Submit listing ✓', empOpts: ['1–5','6–10','11–20','21–50','51–100','100+'] },
    sq: { cat: 'Sektori', name: 'Emri / Kompania *', city: 'Qyteti *', email: 'E-mail *', website: 'Faqja web', employees: 'Numri i punonjësve', desc: 'Përshkrim i shkurtër', descPH: 'Çfarë ofroni? Eksperiencë, projekte, avantazhet tuaja…', tagSuggest: 'Aftësi / Tags të sugjeruara', tagCustom: 'Shto tag të personalizuar', tagCustomPH: 'p.sh. Cybersecurity', tagAdd: '+ Shto', tagSelected: 'Tags të zgjedhura', availNote: '💬 Disponueshmëria komunikohet drejtpërdrejt me kërkesë.', send: 'Dërgo ✓', empOpts: ['1–5','6–10','11–20','21–50','51–100','100+'] }
  }
  const Lr = L[lang] || L.en
  const isFL = regType === t.regFL

  // ── PARTNER REGISTRATION FORM ─────────────────────────────────────────────
  if (isSP) {
    const PL = {
      en: { nameL:'Name / Organisation *', cityL:'City *', emailL:'E-mail *', phoneL:'Phone', websiteL:'Website', focusL:'Industry focus', focusPH:'e.g. IT, Software, BPO, Production…', langsL:'EU languages', langsPH:'e.g. DE, EN, SV, FR', marketsL:'EU markets', marketsPH:'e.g. Germany, Austria, Switzerland, Sweden…', descL:'About you / your organisation', descPH:'Describe your sales experience, network and why you want to represent Kosova companies.', send:'Apply as partner ✓', note:'💬 Your application will be reviewed. We will contact you within 48h if there is a match.' },
      sq: { nameL:'Emri / Organizata *', cityL:'Qyteti *', emailL:'E-mail *', phoneL:'Telefon', websiteL:'Faqja web', focusL:'Fokusi i industrisë', focusPH:'p.sh. IT, Software, BPO…', langsL:'Gjuhët e BE-së', langsPH:'p.sh. DE, EN, SV', marketsL:'Tregjet e BE-së', marketsPH:'p.sh. Gjermani, Austri, Zvicër…', descL:'Rreth jush / organizatës', descPH:'Përshkruani eksperiencën tuaj të shitjeve dhe rrjetin.', send:'Apliko si partner ✓', note:"💬 Aplikimi juaj do të shqyrtohet. Do t'ju kontaktojmë brenda 48h." }
    }
    const Lp = PL[lang] || PL.en
    return (
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:11 }}>
          <div><label className="flabel">{Lp.nameL}</label><input className="inp" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
          <div><label className="flabel">{Lp.cityL}</label><input className="inp" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="Berlin, Wien, Stockholm…" /></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:11 }}>
          <div>
            <label className="flabel">{Lp.emailL}</label>
            <input className="inp" type="email" value={form.email}
              style={{ borderColor: emailError ? G.red : undefined, boxShadow: emailError ? `0 0 0 3px rgba(255,59,48,0.1)` : undefined }}
              onChange={e=>{setForm(f=>({...f,email:e.target.value}));checkEmail(e.target.value)}}
              onBlur={e=>checkEmail(e.target.value)} />
            {emailChecking && <div style={{fontSize:11,color:G.muted,marginTop:4,display:'flex',alignItems:'center',gap:5}}><div style={{width:8,height:8,borderRadius:'50%',border:'1.5px solid rgba(255,255,255,0.2)',borderTopColor:G.muted,animation:'spin 0.7s linear infinite'}} />Checking…</div>}
            {emailError && <div style={{fontSize:11,color:G.red,marginTop:4,display:'flex',alignItems:'center',gap:5}}>⚠ {emailError}</div>}
          </div>
          <div><label className="flabel">{Lp.phoneL}</label><input className="inp" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:11 }}>
          <div><label className="flabel">{Lp.websiteL}</label><input className="inp" value={form.website} onChange={e=>setForm(f=>({...f,website:e.target.value}))} /></div>
          <div><label className="flabel">{Lp.langsL}</label><input className="inp" value={form.eu_langs} onChange={e=>setForm(f=>({...f,eu_langs:e.target.value}))} placeholder={Lp.langsPH} /></div>
        </div>
        <div style={{ marginBottom:11 }}><label className="flabel">{Lp.focusL}</label><input className="inp" value={form.focus} onChange={e=>setForm(f=>({...f,focus:e.target.value}))} placeholder={Lp.focusPH} /></div>
        <div style={{ marginBottom:11 }}><label className="flabel">{Lp.marketsL}</label><input className="inp" value={form.markets} onChange={e=>setForm(f=>({...f,markets:e.target.value}))} placeholder={Lp.marketsPH} /></div>
        <div style={{ marginBottom:16 }}><label className="flabel">{Lp.descL}</label><textarea className="inp" rows={3} style={{resize:'vertical'}} value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder={Lp.descPH} /></div>

        {/* Logo upload — same as company/freelancer form */}
        <div style={{ marginBottom:14 }}>
          <label className="flabel">{lang==='sq'?'Logo e organizatës (opsionale)':'Organisation logo (optional)'}</label>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginTop:7 }}>
            <div style={{ width:46, height:46, borderRadius:10, overflow:'hidden', flexShrink:0, border:`2px solid ${form.logoColor||'#3d7fa8'}44`, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${form.logoColor||'#3d7fa8'}20,${form.logoColor||'#3d7fa8'}46)` }}>
              {partnerLogoFile
                ? <img src={partnerLogoFile} alt="logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:15, color:form.logoColor||'#3d7fa8' }}>{form.name ? form.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '??'}</span>
              }
            </div>
            <div style={{ flex:1 }}>
              <label style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(180,160,100,0.12)', borderRadius:8, cursor:'pointer', fontSize:12, color:G.text, marginBottom:7, width:'fit-content' }}>
                📷 {lang==='sq'?'Ngarko logo':'Upload logo'}
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
                  const file = e.target.files?.[0]; if (!file) return
                  const img = new Image(); const url = URL.createObjectURL(file)
                  img.onload = () => { const S=88; const c=document.createElement('canvas'); c.width=S; c.height=S; const ctx=c.getContext('2d'); const side=Math.min(img.width,img.height); ctx.drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,S,S); URL.revokeObjectURL(url); setPartnerLogoFile(c.toDataURL('image/webp',0.82)) }
                  img.src = url
                }} />
              </label>
              {partnerLogoFile && <button onClick={() => setPartnerLogoFile(null)} className="btn ghost" style={{ fontSize:11, padding:'3px 9px', marginBottom:7 }}>✕ {lang==='sq'?'Hiq':'Remove'}</button>}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['#3d7fa8','#4a7fa5','#5a8a6e','#8a7070','#c9943a','#6b7fa8','#8a7a4a','#c9a44a'].map(col => (
                  <button key={col} onClick={() => { setForm(f=>({...f,logoColor:col})); setPartnerLogoFile(null) }}
                    style={{ width:24, height:24, borderRadius:'50%', background:col, border:(form.logoColor||'#3d7fa8')===col?'3px solid #fff':'2px solid transparent', cursor:'pointer', boxShadow:(form.logoColor||'#3d7fa8')===col?`0 0 0 2px ${col}`:'none' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background:'rgba(61,111,168,0.06)', border:'1px solid rgba(61,111,168,0.2)', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:12, color:G.muted }}>{Lp.note}</div>
        <button className="btn gbtn" style={{width:'100%'}} disabled={!form.name||!form.email||!!emailError} onClick={async () => {
          const fields = {
            name: form.name, city: form.city,
            email: form.email.toLowerCase(),
            phone: form.phone||null, website: form.website||null,
            languages: form.eu_langs||null,
            type: 'partner', cat: 'partner', tier: 'free', verified: false,
            logo_color: form.logoColor || '#3d7fa8',
            tags: form.focus ? form.focus.split(',').map(s=>s.trim()).filter(Boolean) : [],
            desc_en: form.desc||null, desc_sq: form.desc||null,
            employees: form.markets||null,
            submitted_by: form.email.toLowerCase(),
          }
          if (partnerLogoFile) fields.logo_data = partnerLogoFile
          let err = await insertProfile(fields).catch(e => e)
          if (err && err.message) {
            const m = err.message.toLowerCase()
            if (m.includes('duplicate') || m.includes('unique') || m.includes('email')) {
              setEmailError(lang === 'sq' ? 'Ky email është tashmë i regjistruar.' : 'This email is already registered.')
              return
            }
            const fallback = { ...fields }
            delete fallback.logo_color; delete fallback.logo_data
            err = await insertProfile(fallback).catch(e => e)
          }
          if (err && err.message) {
            const m = err.message.toLowerCase()
            if (m.includes('duplicate') || m.includes('unique') || m.includes('email')) {
              setEmailError(lang === 'sq' ? 'Ky email është tashmë i regjistruar.' : 'This email is already registered.')
            } else {
              setEmailError(lang === 'sq' ? 'Gabim gjatë regjistrimit. Provoni sërish.' : 'Submission failed. Please try again.')
            }
            return
          }
          notifyAdminNewProfile({ name: form.name, email: form.email, cat: 'partner', city: form.city }).catch(()=>{})
          onDone()
        }}>{Lp.send}</button>
      </div>
    )
  }

  const [logoFile, setLogoFile] = React.useState(null)   // compressed data-URL
  const handleLogoUpload = React.useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const SIZE = 88   // render at 2× the 44px logo for retina
      const canvas = document.createElement('canvas')
      canvas.width = SIZE; canvas.height = SIZE
      const ctx = canvas.getContext('2d')
      // Centre-crop square
      const side = Math.min(img.width, img.height)
      const sx = (img.width - side) / 2
      const sy = (img.height - side) / 2
      ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE)
      URL.revokeObjectURL(url)
      setLogoFile(canvas.toDataURL('image/webp', 0.82))
    }
    img.src = url
  }, [])

  return (
    <div>
      {/* Profile logo: upload or color */}
      <div style={{ marginBottom:16 }}>
        <label className="flabel">{lang==='sq' ? 'Logo e profilit' : 'Profile logo'}</label>
        <div style={{ display:'flex', gap:12, alignItems:'flex-start', marginTop:8 }}>

          {/* Preview */}
          <div style={{ width:52, height:52, borderRadius:12, overflow:'hidden', flexShrink:0, border:`2px solid ${form.logoColor||'#4a7fa5'}44`, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${form.logoColor||'#4a7fa5'}20,${form.logoColor||'#4a7fa5'}46)` }}>
            {logoFile
              ? <img src={logoFile} alt="logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <span style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:16, color:form.logoColor||'#4a7fa5' }}>{form.name ? form.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '??'}</span>
            }
          </div>

          <div style={{ flex:1 }}>
            {/* Upload button */}
            <label style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(180,160,100,0.12)', borderRadius:8, cursor:'pointer', fontSize:12, color:G.text, fontFamily:"'Inter',sans-serif", marginBottom:8, width:'fit-content' }}>
              📷 {lang==='sq' ? 'Ngarko logo (opsionale)' : 'Upload logo (optional)'}
              <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleLogoUpload} />
            </label>
            {logoFile && (
              <button onClick={() => setLogoFile(null)} className="btn ghost" style={{ fontSize:11, padding:'3px 9px', marginBottom:8 }}>
                ✕ {lang==='sq' ? 'Hiq foton' : 'Remove photo'}
              </button>
            )}
            <div style={{ fontSize:10, color:G.muted, marginBottom:6 }}>
              {lang==='sq' ? 'Ose zgjidhni ngjyrën e sfondit:' : 'Or pick a background colour:'}
            </div>
            {/* Color swatches */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['#4a7fa5','#5a8a6e','#8a7070','#c9943a','#6b7fa8','#8a7a4a','#3d7fa8','#4a7a6e','#7a5a5a','#c9a44a'].map(col => {
                const isSel = (form.logoColor||'#4a7fa5') === col
                return (
                  <button key={col} onClick={() => { setForm(f=>({...f,logoColor:col})); setLogoFile(null) }}
                    style={{ width:26, height:26, borderRadius:'50%', background:col, border: isSel?'3px solid #fff':'2px solid transparent', cursor:'pointer', boxShadow: isSel?`0 0 0 2px ${col}`:'none', transition:'all 0.15s' }} />
                )
              })}
            </div>
          </div>
        </div>
        <div style={{ fontSize:10, color:G.muted, marginTop:6 }}>
          {lang==='sq' ? '💡 Fotoja kompresohet automatikisht në madhësinë e duhur.' : '💡 Photo is auto-cropped & compressed to fit the logo size.'}
        </div>
      </div>
      {/* Sector for tag suggestions */}
      <div style={{ marginBottom: 14 }}>
        <label className="flabel">{Lr.cat}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
          {CATS.map(c => (
            <button key={c.id} onClick={() => { setCatChoice(c.id); setSelectedTags([]) }} className="btn"
              style={{ padding: '5px 12px', fontSize: 11, fontWeight: 600, borderRadius: 16,
                background: catChoice === c.id ? `${c.color}18` : 'rgba(255,255,255,0.04)',
                color: catChoice === c.id ? c.color : G.muted,
                border: `1px solid ${catChoice === c.id ? `${c.color}40` : 'rgba(255,255,255,0.07)'}` }}>
              {c.icon} {c.labels[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Basic info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 11 }}>
        <div><label className="flabel">{Lr.name}</label><input className="inp" value={form.name} onChange={e => f('name', e.target.value)} /></div>
        <div><label className="flabel">{Lr.city}</label><input className="inp" value={form.city} onChange={e => f('city', e.target.value)} placeholder="Pristina" /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 11 }}>
        <div>
          <label className="flabel">{Lr.email}</label>
          <input className="inp" value={form.email}
            style={{ borderColor: emailError ? G.red : undefined, boxShadow: emailError ? `0 0 0 3px rgba(255,59,48,0.1)` : undefined, transition: 'border-color 0.18s, box-shadow 0.18s' }}
            onChange={e => { f('email', e.target.value); checkEmail(e.target.value) }}
            onBlur={e => checkEmail(e.target.value)} />
          {emailChecking && <div style={{fontSize:11,color:G.muted,marginTop:4,display:'flex',alignItems:'center',gap:5}}><div style={{width:8,height:8,borderRadius:'50%',border:'1.5px solid rgba(255,255,255,0.2)',borderTopColor:G.muted,animation:'spin 0.7s linear infinite'}} />Checking…</div>}
          {emailError && <div style={{fontSize:11,color:G.red,marginTop:4,display:'flex',alignItems:'center',gap:5,fontFamily:"'Inter',sans-serif",fontWeight:500}}>⚠ {emailError}</div>}
        </div>
        <div><label className="flabel">{Lr.website}</label><input className="inp" value={form.website} onChange={e => f('website', e.target.value)} placeholder="techfirma.com" /></div>
      </div>
      {!isFL && (
        <div style={{ marginBottom: 11 }}>
          <label className="flabel">{Lr.employees}</label>
          <select className="inp" value={form.employees} onChange={e => f('employees', e.target.value)}>
            <option value="">—</option>
            {Lr.empOpts.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <label className="flabel">{Lr.desc}</label>
        <textarea className="inp" rows={3} style={{ resize: 'vertical' }} value={form.desc} onChange={e => f('desc', e.target.value)} placeholder={Lr.descPH} />
      </div>

      {/* Tag suggestions */}
      <div style={{ marginBottom: 16 }}>
        <label className="flabel">{Lr.tagSuggest}</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 7, maxHeight: 110, overflowY: 'auto' }}>
          {suggestions.map(tag => {
            const on = selectedTags.includes(tag)
            return (
              <button key={tag} onClick={() => toggleTag(tag)} className="btn" style={{ padding: '4px 11px', fontSize: 11, fontWeight: on ? 700 : 500, borderRadius: 14,
                background: on ? 'rgba(61,111,168,0.15)' : 'rgba(255,255,255,0.04)',
                color: on ? G.teal : G.muted,
                border: `1px solid ${on ? 'rgba(61,111,168,0.4)' : 'rgba(255,255,255,0.07)'}` }}>
                {on ? '✓ ' : ''}{tag}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom tag input */}
      <div style={{ marginBottom: 16 }}>
        <label className="flabel">{Lr.tagCustom}</label>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <input className="inp" style={{ flex: 1 }} value={form.customTag} onChange={e => f('customTag', e.target.value)}
            placeholder={Lr.tagCustomPH}
            onKeyDown={e => e.key === 'Enter' && addCustomTag()} />
          <button className="btn ghost" style={{ whiteSpace: 'nowrap', padding: '9px 14px', fontSize: 12 }} onClick={addCustomTag}>{Lr.tagAdd}</button>
        </div>
      </div>

      {/* Selected tags summary */}
      {selectedTags.length > 0 && (
        <div style={{ marginBottom: 16, background: 'rgba(61,111,168,0.05)', border: '1px solid rgba(61,111,168,0.2)', borderRadius: 9, padding: '10px 14px' }}>
          <div style={{ fontSize: 10, color: G.teal, fontWeight: 700, marginBottom: 7, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{Lr.tagSelected}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {selectedTags.map(tag => (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'rgba(61,111,168,0.15)', color: G.teal, border: '1px solid rgba(61,111,168,0.35)', borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>
                {tag}
                <span style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => toggleTag(tag)}>✕</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability note */}
      <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 9, padding: '10px 14px', marginBottom: 14, fontSize: 13, fontFamily: "'Inter',sans-serif", color: G.muted }}>
        {Lr.availNote}
      </div>

      {/* Tier selector — Free vs Sponsored */}
      <div style={{ marginBottom: form.tier === 'sponsored' ? 14 : 18 }}>
        <div style={{ fontSize: 11, color: G.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 9 }}>
          {lang === 'sq' ? 'Zgjidhni planin:' : 'Choose your plan:'}
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          {[
            { val: 'free', icon: '🆓', label: lang==='sq'?'Pa pagesë':'Free', sub: lang==='sq'?'Listim bazë, i dukshëm në drejtori':'Basic listing, visible in directory', col: G.muted, border: G.border, bg: 'rgba(255,255,255,0.03)' },
            { val: 'sponsored', icon: '🚀', label: lang==='sq'?'Sponsorizuar':'Sponsored', sub: lang==='sq'?'Top 3 · Kryefaqe · Dukshmëri premium':'Top 3 positions · Homepage · Premium visibility', col: G.orange, border: 'rgba(251,146,60,0.4)', bg: 'rgba(251,146,60,0.06)' },
          ].map(opt => {
            const sel = (form.tier || 'free') === opt.val
            return (
              <div key={opt.val} onClick={() => f('tier', opt.val)}
                style={{ flex: 1, padding: '13px 10px', border: `1px solid ${sel ? opt.border : G.border}`, background: sel ? opt.bg : 'rgba(255,255,255,0.02)', borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s', position: 'relative' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = opt.border; e.currentTarget.style.background = opt.bg }}
                onMouseLeave={e => { if (!sel) { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.background = 'rgba(255,255,255,0.02)' } }}>
                {sel && <div style={{ position: 'absolute', top: -1, left: -1, right: -1, height: 2, background: `linear-gradient(90deg,${opt.col},transparent)`, borderRadius: '12px 12px 0 0' }} />}
                <div style={{ fontSize: 20, marginBottom: 5 }}>{opt.icon}</div>
                <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 12, color: sel ? opt.col : G.muted, marginBottom: 3 }}>{opt.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(228,221,208,0.45)', lineHeight: 1.4 }}>{opt.sub}</div>
                {opt.val === 'sponsored' && <div style={{ fontSize: 9, color: G.orange, marginTop: 5, fontWeight: 700 }}>→ {lang==='sq'?'Admin do ju kontaktojë':'Admin will contact you'}</div>}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── PREMIUM SPONSORED FIELDS (shown only when sponsored is selected) ── */}
      {form.tier === 'sponsored' && (
        <div style={{ background: 'linear-gradient(135deg,rgba(251,146,60,0.06),rgba(251,146,60,0.02))', border: '1px solid rgba(251,146,60,0.25)', borderRadius: 14, padding: '18px 18px 14px', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 14 }}>🚀</span>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 13, color: G.orange }}>Premium Profile Fields</div>
            <span style={{ fontSize: 10, color: 'rgba(251,146,60,0.6)', fontFamily: "'Inter',sans-serif" }}>· {lang==='sq'?'Shfaqen në profilin tuaj premium':'Displayed in your premium profile popup'}</span>
          </div>

          {/* Previous companies */}
          <div style={{ marginBottom: 12 }}>
            <label className="flabel" style={{ color: 'rgba(251,146,60,0.6)' }}>{lang==='sq'?'Kompanitë ku keni punuar':'Previous companies worked with'}</label>
            <input className="inp" style={{ borderColor: 'rgba(251,146,60,0.2)' }} value={form.prevCompanies||''} onChange={e=>f('prevCompanies',e.target.value)} placeholder="BMW, Deloitte, SAP…" />
          </div>

          {/* Featured project */}
          <div style={{ marginBottom: 12 }}>
            <label className="flabel" style={{ color: 'rgba(251,146,60,0.6)' }}>{lang==='sq'?'Projekti i fundit / Portfolio':'Featured project / Portfolio'}</label>
            <input className="inp" style={{ borderColor: 'rgba(251,146,60,0.2)' }} value={form.featuredProject||''} onChange={e=>f('featuredProject',e.target.value)} placeholder={lang==='sq'?'Titulli dhe përshkrimi i shkurtër':'Project title and short description'} />
          </div>

          {/* Social links row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label className="flabel" style={{ color: 'rgba(251,146,60,0.6)' }}>LinkedIn</label>
              <input className="inp" style={{ borderColor: 'rgba(251,146,60,0.2)' }} value={form.linkedin||''} onChange={e=>f('linkedin',e.target.value)} placeholder="linkedin.com/in/…" />
            </div>
            <div>
              <label className="flabel" style={{ color: 'rgba(251,146,60,0.6)' }}>GitHub / Portfolio</label>
              <input className="inp" style={{ borderColor: 'rgba(251,146,60,0.2)' }} value={form.github||''} onChange={e=>f('github',e.target.value)} placeholder="github.com/… or portfolio.com" />
            </div>
          </div>

          {/* Certifications */}
          <div style={{ marginBottom: 12 }}>
            <label className="flabel" style={{ color: 'rgba(251,146,60,0.6)' }}>{lang==='sq'?'Çertifikata / Çmime':'Certifications / Awards'}</label>
            <input className="inp" style={{ borderColor: 'rgba(251,146,60,0.2)' }} value={form.certifications||''} onChange={e=>f('certifications',e.target.value)} placeholder="AWS Certified, ISO 9001, etc." />
          </div>

          {/* Availability */}
          {/* Video intro + availability row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
            <div>
              <label className="flabel" style={{ color: 'rgba(251,146,60,0.6)' }}>{lang==='sq'?'Statusi i disponibilitetit':'Availability status'}</label>
              <select className="inp" style={{ borderColor: 'rgba(251,146,60,0.2)' }} value={form.availability||''} onChange={e=>f('availability',e.target.value)}>
                <option value="">{lang==='sq'?'Zgjidhni…':'Select…'}</option>
                <option value="available">{lang==='sq'?'I disponueshëm tani':'Available now'}</option>
                <option value="limited">{lang==='sq'?'Kapacitet i kufizuar':'Limited capacity'}</option>
                <option value="booked">{lang==='sq'?'I zënë, 1–2 muaj':'Booked, 1–2 months'}</option>
              </select>
            </div>
            <div>
              <label className="flabel" style={{ color: 'rgba(251,146,60,0.6)' }}>{lang==='sq'?'Video intro (URL)':'Video intro (URL)'}</label>
              <input className="inp" style={{ borderColor: 'rgba(251,146,60,0.2)' }} value={form.videoUrl||''} onChange={e=>f('videoUrl',e.target.value)} placeholder="youtube.com/…" />
            </div>
          </div>

          {/* Cover image upload with focus picker */}
          <div style={{ marginTop: 12 }}>
            <label className="flabel" style={{ color: 'rgba(251,146,60,0.6)' }}>{lang==='sq'?'Imazhi i kopertinës (banner)':'Cover / Banner Image'}</label>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginTop:6 }}>
              {form.coverImage && (
                <div style={{ width:120, height:54, borderRadius:8, overflow:'hidden', flexShrink:0, border:'1px solid rgba(251,146,60,0.3)' }}>
                  <img src={form.coverImage} alt="cover" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: form.coverFocus||'50% 50%' }} />
                </div>
              )}
              <div>
                <label style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px', background:'rgba(251,146,60,0.06)', border:'1px solid rgba(251,146,60,0.22)', borderRadius:7, cursor:'pointer', fontSize:11, color:'rgba(251,146,60,0.8)', marginBottom:6 }}>
                  🖼 {lang==='sq'?'Ngarko kopertinë':'Upload cover'}
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                    const file=e.target.files?.[0]; if(!file) return
                    const img=new Image(), url=URL.createObjectURL(file)
                    img.onload=()=>{ const W=800,H=240,c=document.createElement('canvas'); c.width=W; c.height=H; const ctx=c.getContext('2d'); const scale=Math.max(W/img.width,H/img.height); const sw=W/scale,sh=H/scale; ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,W,H); URL.revokeObjectURL(url); f('coverImage',c.toDataURL('image/webp',0.88)); f('coverFocus','50% 50%') }
                    img.src=url
                  }} />
                </label>
                {form.coverImage && <button onClick={()=>{f('coverImage',null);f('coverFocus',null)}} className="btn ghost" style={{fontSize:10,padding:'2px 8px'}}>✕ {lang==='sq'?'Hiq':'Remove'}</button>}
                  <div style={{ fontSize:10, color:'rgba(251,146,60,0.45)', lineHeight:1.5, marginTop:4, fontStyle:'italic' }}>
                    💡 Best: landscape image, 3:1 ratio (e.g. 900×300px). Avoid text near edges — only the center shows.
                  </div>
              </div>
            </div>
            <CoverCropPicker image={form.coverImage} onApply={cropped=>f('coverImage',cropped)} accentColor="#c9943a" />
          </div>
        </div>
      )}

      <button className="btn gbtn" style={{ width: '100%' }} disabled={!form.name || !form.email || !!emailError} onClick={async () => {
        const dbFields = formToDb(form, catChoice, selectedTags, regType, t)
        if (regType === t.regFL) dbFields.type = 'freelancer'
        else if (regType === t.regComp) dbFields.type = 'company'
        if (form.tier === 'sponsored') dbFields.tier = 'sponsored'
        if (logoFile) dbFields.logo_data = logoFile

        // Step 1: Insert the base profile
        let insertErr = await insertProfile(dbFields)
        if (insertErr) {
          const msg = (insertErr.message || '').toLowerCase()
          if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('email')) {
            setEmailError(lang === 'sq' ? 'Ky email është tashmë i regjistruar.' : 'This email is already registered.')
            return
          }
          // Retry without logo/color if column issues
          const fallback = { ...dbFields }
          delete fallback.logo_color; delete fallback.logo_data
          insertErr = await insertProfile(fallback)
          if (insertErr) {
            const m2 = (insertErr.message || '').toLowerCase()
            setEmailError(m2.includes('duplicate') || m2.includes('unique')
              ? (lang === 'sq' ? 'Ky email është tashmë i regjistruar.' : 'This email is already registered.')
              : (lang === 'sq' ? 'Gabim gjatë regjistrimit.' : 'Submission failed. Please try again.'))
            return
          }
        }

        // Step 2: If sponsored, immediately update with premium fields via email lookup
        if (form.tier === 'sponsored' && (form.prevCompanies || form.featuredProject || form.linkedin || form.github || form.certifications || form.availability || form.videoUrl)) {
          try {
            // Fetch all unverified to find the just-inserted profile by email
            const allProfiles = await fetchAllProfilesAdmin().catch(() => [])
            const inserted = allProfiles.find(p =>
              (p.contact || p.email || '').toLowerCase() === form.email.toLowerCase() && !p.verified
            )
            if (inserted?.id) {
              const sponsoredFields = {}
              if (form.prevCompanies)   sponsoredFields.prev_companies   = form.prevCompanies
              if (form.featuredProject) sponsoredFields.featured_project = form.featuredProject
              if (form.linkedin)        sponsoredFields.linkedin         = form.linkedin
              if (form.github)          sponsoredFields.github           = form.github
              if (form.certifications)  sponsoredFields.certifications   = form.certifications
              if (form.availability)    sponsoredFields.availability     = form.availability
              if (form.videoUrl)        sponsoredFields.video_url        = form.videoUrl
              await updateProfile(inserted.id, sponsoredFields).catch(e => console.warn('[sponsored fields]', e))
            }
          } catch(e) { console.warn('[sponsored lookup]', e) }
        }

        notifyAdminNewProfile({ name: form.name, email: form.email, cat: catChoice, city: form.city }).catch(() => {})
        onDone()
      }}>
        {Lr.send}
      </button>
    </div>
  )
}

// ─── ADMIN PAGE ──────────────────────────────────────────────────────────────
// Simulated pending queue — in production this lives in Supabase
// ─── SELF-SERVICE PROFILE EDIT MODAL ─────────────────────────────────────────
// Flow: enter email → get 6-digit code → verify → fill changes → submitted for admin approval
function SelfEditModal({ profile, lang, t, onClose }) {
  const [step, setStep] = React.useState('email')   // email → code → form → done
  const [email, setEmail] = React.useState('')
  const [code, setCode] = React.useState('')
  const [codeError, setCodeError] = React.useState(false)
  const DEMO_CODE = '123456' // in production: sent via Supabase email
  const [form, setForm] = React.useState({
    name: profile.name,
    city: profile.city,
    contact: profile.contact || '',
    website: profile.website || '',
    desc: profile.desc?.[lang] || profile.desc?.en || '',
    tags: profile.tags.join(', '),
  })
  const f = (k,v) => setForm(p => ({...p,[k]:v}))

  const L = {
    de: {
      title: 'Profil bearbeiten',
      step1h: 'E-Mail bestätigen',
      step1sub: 'Geben Sie die E-Mail-Adresse Ihres Profils ein. Sie erhalten einen 6-stelligen Code.',
      emailLabel: 'Profil-E-Mail *',
      sendCode: 'Code senden',
      step2h: 'Code eingeben',
      step2sub: 'Code wurde an Ihre E-Mail-Adresse gesendet.',
      step2demo: '(Demo: Code ist 123456)',
      codeLabel: 'Sicherheitscode',
      verifyCode: 'Code bestätigen',
      codeErr: 'Falscher Code. Bitte erneut versuchen.',
      step3h: 'Änderungen eingeben',
      step3sub: 'Ihre Änderungen werden dem Admin zur Genehmigung vorgelegt — erst dann gehen sie live.',
      nameLabel: 'Name / Firma', cityLabel: 'Stadt', contactLabel: 'E-Mail / Kontakt',
      websiteLabel: 'Website', descLabel: 'Beschreibung', tagsLabel: 'Skills / Tags',
      submitBtn: 'Zur Genehmigung einreichen ✓',
      step4h: 'Eingereicht!',
      step4sub: 'Ihre Änderungen werden vom Admin geprüft. Sie werden per E-Mail informiert sobald das Profil aktualisiert wurde.',
      pendingNote: '⏳ Ausstehend — noch nicht live',
      close: 'Schließen',
    },
    en: {
      title: 'Edit profile',
      step1h: 'Confirm your email',
      step1sub: 'Enter the email address of your profile. You\'ll receive a 6-digit code.',
      emailLabel: 'Profile email *',
      sendCode: 'Send code',
      step2h: 'Enter code',
      step2sub: 'A 6-digit code was sent to your email.',
      step2demo: '(Demo: code is 123456)',
      codeLabel: 'Security code',
      verifyCode: 'Confirm code',
      codeErr: 'Wrong code. Please try again.',
      step3h: 'Enter your changes',
      step3sub: 'Your changes will be submitted to the admin for approval — only then will they go live.',
      nameLabel: 'Name / Company', cityLabel: 'City', contactLabel: 'Email / Contact',
      websiteLabel: 'Website', descLabel: 'Description', tagsLabel: 'Skills / Tags',
      submitBtn: 'Submit for approval ✓',
      step4h: 'Submitted!',
      step4sub: 'Your changes are being reviewed by the admin. You\'ll be notified by email once your profile has been updated.',
      pendingNote: '⏳ Pending — not yet live',
      close: 'Close',
    },
    sq: {
      title: 'Ndrysho profilin',
      step1h: 'Konfirmo e-mailin',
      step1sub: 'Shkruaj e-mailin e profilit tënd. Do të marrësh një kod 6-shifror.',
      emailLabel: 'E-mail i profilit *',
      sendCode: 'Dërgo kodin',
      step2h: 'Shkruaj kodin',
      step2sub: 'Kodi u dërgua në adresën tuaj.',
      step2demo: '(Demo: kodi është 123456)',
      codeLabel: 'Kodi i sigurisë',
      verifyCode: 'Konfirmo kodin',
      codeErr: 'Kod i gabuar. Provo përsëri.',
      step3h: 'Shkruaj ndryshimet',
      step3sub: "Ndryshimet tuaja do t'i dërgohen administratorit për miratim — vetëm pas tij do të jenë live.",
      nameLabel: 'Emri / Kompania', cityLabel: 'Qyteti', contactLabel: 'E-mail / Kontakti',
      websiteLabel: 'Faqja web', descLabel: 'Përshkrim', tagsLabel: 'Aftësi / Tags',
      submitBtn: 'Dërgo për miratim ✓',
      step4h: 'U dërgua!',
      step4sub: 'Ndryshimet tuaja po shqyrtohen nga administratori. Do të njoftoheni me e-mail kur profili të azhurnohet.',
      pendingNote: '⏳ Në pritje — ende jo live',
      close: 'Mbyll',
    },
    sv: {
      title: 'Redigera profil',
      step1h: 'Bekräfta e-post',
      step1sub: 'Ange e-postadressen för din profil. Du får en 6-siffrig kod.',
      emailLabel: 'Profil-e-post *',
      sendCode: 'Skicka kod',
      step2h: 'Ange kod',
      step2sub: 'Koden skickades till din e-postadress.',
      step2demo: '(Demo: koden är 123456)',
      codeLabel: 'Säkerhetskod',
      verifyCode: 'Bekräfta kod',
      codeErr: 'Fel kod. Försök igen.',
      step3h: 'Ange dina ändringar',
      step3sub: 'Dina ändringar skickas för godkännande — de aktiveras efter granskning.',
      nameLabel: 'Namn / Företag', cityLabel: 'Stad', contactLabel: 'E-post / Kontakt',
      websiteLabel: 'Webbplats', descLabel: 'Beskrivning', tagsLabel: 'Kompetenser / Taggar',
      submitBtn: 'Skicka för godkännande ✓',
      step4h: 'Inskickad!',
      step4sub: 'Dina ändringar granskas av admins. Du meddelas via e-post när profilen uppdaterats.',
      pendingNote: '⏳ Väntar — inte live ännu',
      close: 'Stäng',
    },
  }
  const Ls = L[lang] || L.en

  // Step indicator
  const STEPS = ['email','code','form','done']
  const stepIdx = STEPS.indexOf(step)

  return (
    <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal su" style={{ maxWidth: 500 }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
          <div>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:19 }}>{Ls.title}: {profile.name}</div>
            <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>Business Bridge Platform</div>
          </div>
          <button onClick={onClose} className="btn ghost" style={{ padding:'5px 10px', fontSize:15, alignSelf:'flex-start' }}>✕</button>
        </div>

        {/* Step progress */}
        {step !== 'done' && (
          <div style={{ display:'flex', gap:6, marginBottom:20 }}>
            {['1','2','3'].map((n,i) => (
              <div key={n} style={{ flex:1, height:3, borderRadius:2, background: i < stepIdx ? G.teal : i === stepIdx ? G.gold : 'rgba(180,160,100,0.10)' }} />
            ))}
          </div>
        )}

        {/* ── STEP 1: Email ─────────────────────────────────────────────── */}
        {step === 'email' && (
          <>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>{Ls.step1h}</div>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:16 }}>{Ls.step1sub}</p>
            <div style={{ marginBottom:18 }}>
              <label className="flabel">{Ls.emailLabel}</label>
              <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                onKeyDown={e => e.key==='Enter' && email && setStep('code')} />
            </div>
            <button className="btn gbtn" style={{ width:'100%' }} disabled={!email} onClick={async () => {
              const code = Math.floor(100000 + Math.random() * 900000).toString()
              // Store ONLY a hash — never the plain code — so it can't be read from window/DOM
              const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
              const hash = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')
              sessionStorage.setItem('__vc_hash', hash)
              sessionStorage.setItem('__vc_exp', String(Date.now() + 15 * 60 * 1000))
              // Try to send real email
              const sent = await sendVerifyCode({ toEmail: email, code, profileName: profile.name }).catch(() => null)
              if (!sent) {
                // Email service not configured yet — show setup hint in console only
                console.info('[BBP] EmailJS not configured. Set EMAILJS_PUBLIC_KEY in emailService.js to enable real email codes.')
              }
              setStep('code')
            }}>
              {Ls.sendCode}
            </button>
          </>
        )}

        {/* ── STEP 2: Code ──────────────────────────────────────────────── */}
        {step === 'code' && (
          <>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>{Ls.step2h}</div>
            <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:18 }}>
              {lang==='sq' ? `Kodi u dërgua te ${email}. Kontrolloni emailin tuaj.` : `Code sent to ${email}. Check your inbox.`}
            </p>
            <div style={{ marginBottom:10 }}>
              <label className="flabel">{Ls.codeLabel}</label>
              <input className="inp" value={code} onChange={e => { setCode(e.target.value); setCodeError(false) }}
                placeholder="123456" maxLength={6} style={{ fontSize:22, letterSpacing:6, textAlign:'center' }}
                onKeyDown={e => e.key==='Enter' && verifyCode()} />
            </div>
            {codeError && <div style={{ fontSize:12, color:G.red, marginBottom:10, fontFamily:"'Inter',sans-serif" }}>⚠️ {Ls.codeErr}</div>}
            <button className="btn gbtn" style={{ width:'100%' }} disabled={code.length < 6}
              onClick={async () => {
                const storedHash = sessionStorage.getItem('__vc_hash')
                const exp = parseInt(sessionStorage.getItem('__vc_exp') || '0')
                if (Date.now() > exp) { setCodeError(true); return }
                const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
                const hash = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('')
                if (hash === storedHash) {
                  sessionStorage.removeItem('__vc_hash')
                  sessionStorage.removeItem('__vc_exp')
                  setStep('form')
                } else setCodeError(true)
              }}>
              {Ls.verifyCode}
            </button>
          </>
        )}

        {/* ── STEP 3: Form ──────────────────────────────────────────────── */}
        {step === 'form' && (
          <>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>{Ls.step3h}</div>
            <div style={{ background:'rgba(61,111,168,0.07)', border:'1px solid rgba(61,111,168,0.22)', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:12, color:G.teal }}>
              🔐 {lang==='sq'?'Kodi u verifikua':'Code verified'}
              <span style={{ color:G.muted, marginLeft:8 }}>— {Ls.step3sub}</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label className="flabel">{Ls.nameLabel}</label><input className="inp" value={form.name} onChange={e => f('name',e.target.value)} /></div>
              <div><label className="flabel">{Ls.cityLabel}</label><input className="inp" value={form.city} onChange={e => f('city',e.target.value)} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label className="flabel">{Ls.contactLabel}</label><input className="inp" value={form.contact} onChange={e => f('contact',e.target.value)} /></div>
              <div><label className="flabel">{Ls.websiteLabel}</label><input className="inp" value={form.website} onChange={e => f('website',e.target.value)} placeholder="firma.com" /></div>
            </div>
            <div style={{ marginBottom:10 }}><label className="flabel">{Ls.descLabel}</label><textarea className="inp" rows={3} style={{ resize:'vertical' }} value={form.desc} onChange={e => f('desc',e.target.value)} /></div>
            <div style={{ marginBottom:18 }}><label className="flabel">{Ls.tagsLabel}</label><input className="inp" value={form.tags} onChange={e => f('tags',e.target.value)} placeholder="React, Node.js, TypeScript…" /></div>
            {/* Pending warning */}
            <div style={{ background:G.goldDim, border:`1px solid ${G.goldBorder}`, borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:12, color:G.muted }}>
              ℹ️ {lang==='sq'?'Ndryshimet tuaja shqyrtohen nga admin — jo menjëherë live.':'Your changes will be reviewed by admin — not immediately live.'}
            </div>
            <button className="btn gbtn" style={{ width:'100%' }} disabled={!form.name} onClick={async () => {
              // Submit pending change to Supabase
              await insertPendingChange({
                profile_id:     profile.id || null,
                profile_name:   profile.name,
                submitter_email: email,
                code_verified:  true,
                status:         'pending',
                changes: {
                  name:    form.name,
                  city:    form.city,
                  email:   form.contact,
                  website: form.website,
                  tags:    form.tags.split(',').map(s => s.trim()).filter(Boolean),
                  desc: {
                    de: form.desc,
                    en: form.desc,
                    sq: form.desc,
                    sv: form.desc,
                  },
                },
                original: {
                  tags: profile.tags,
                  desc: profile.desc,
                },
              }).catch(console.error)
              setStep('done')
            }}>
              {Ls.submitBtn}
            </button>
          </>
        )}

        {/* ── STEP 4: Done ──────────────────────────────────────────────── */}
        {step === 'done' && (
          <div style={{ textAlign:'center', padding:'16px 0' }}>
            <div style={{ fontSize:50, marginBottom:14 }}>📬</div>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:21, marginBottom:10 }}>{Ls.step4h}</div>
            <p style={{ fontFamily:"'Inter',sans-serif", color:G.muted, fontSize:14, lineHeight:1.75, marginBottom:16 }}>{Ls.step4sub}</p>
            <div style={{ background:G.goldDim, border:`1px solid ${G.goldBorder}`, borderRadius:9, padding:'10px 14px', marginBottom:20, fontSize:13, color:G.gold }}>
              {Ls.pendingNote}
            </div>
            <button className="btn gbtn" style={{ width:'100%' }} onClick={onClose}>{Ls.close}</button>
          </div>
        )}
      </div>
    </div>
  )
}

const INITIAL_PENDING = [
  { id:'chg_001', profileId:'c1', profileName:'AlbaCode', submittedAt:'2025-05-14 09:22', codeVerified:true,
    changes:{ tags:['React','Node.js','TypeScript','Cybersecurity','Mobile'], desc:{de:'Full-Stack & Security-Consulting.',en:'Full-stack & security consulting.',sq:'Full-stack dhe konsulencë sigurie.',sv:'Full-stack och säkerhetskonsulting.'} },
    original:{ tags:['React','Node.js','TypeScript','Mobile'], desc:{de:'Full-Stack Entwicklung & Mobile Apps.',en:'Full-stack development & mobile apps.',sq:'Zhvillim full-stack.',sv:'Full-stack och mobilappar.'} } }
]

// ─── ADMIN PARTNERS TAB ───────────────────────────────────────────────────────
function AdminPartnersTab({ profiles, setProfiles, G, partners, setPartners, savePartners, concierge, setConcierge, saveConcierge, saving, settingsSaved }) {
  const gpList = profiles.filter(p => p.type === 'partner')
  const [gpEdit, setGpEdit] = React.useState(null)
  const [gpForm, setGpForm] = React.useState({})
  const [gpLogo, setGpLogo] = React.useState(null)
  const [gpCover, setGpCover] = React.useState(null)
  const [gpSaving, setGpSaving] = React.useState(false)
  const [gpMsg, setGpMsg] = React.useState('')
  const [section, setSection] = React.useState('fixed') // 'fixed' | 'db'
  const logoColors = ['#3d7fa8','#4a7fa5','#5a8a6e','#8a7070','#c9943a','#6b7fa8','#8a7a4a','#c9a44a']

  const openNew = () => {
    setGpForm({ name:'', city:'', email:'', website:'', phone:'', desc:'', tags:'', logoColor:'#3d7fa8', visible:true, featured:false })
    setGpLogo(null); setGpCover(null); setGpEdit('new')
  }
  const openEditGP = (p) => {
    setGpForm({ name:p.name||'', city:p.city||'', email:p.contact||p.email||'', website:p.website||'', phone:p.phone||'', desc:p.desc?.en||'', tags:(p.tags||[]).join(', '), logoColor:p.logoColor||'#3d7fa8', visible:p.verified!==false, featured:p.tier==='sponsored' })
    setGpLogo(p.logoUrl||null); setGpCover(p.coverImage||null); setGpEdit(p)
  }
  const saveGP = async () => {
    setGpSaving(true)
    const fields = {
      name: gpForm.name, city: gpForm.city||null,
      email: gpForm.email||null,
      phone: gpForm.phone||null, website: gpForm.website||null,
      type: 'partner', cat: 'partner',
      tier: gpForm.featured ? 'sponsored' : 'free',
      verified: gpForm.visible,
      logo_color: gpForm.logoColor||'#3d7fa8',
      tags: gpForm.tags ? gpForm.tags.split(',').map(s=>s.trim()).filter(Boolean) : [],
      desc_en: gpForm.desc||null, desc_sq: gpForm.desc||null,
      cover_image: gpCover || null,
      cover_focus: gpForm.coverFocus || null,
    }
    if (gpLogo && gpLogo.startsWith('data:')) fields.logo_data = gpLogo
    if (gpEdit === 'new') { await insertProfile(fields).catch(e => console.error(e)) }
    else { await updateProfile(gpEdit.id, fields).catch(e => console.error(e)) }
    setGpSaving(false); setGpEdit(null); setGpMsg('✓ Saved')
    setTimeout(() => setGpMsg(''), 3000)
    fetchAllProfilesAdmin().then(d => setProfiles(d.map(normaliseProfile))).catch(()=>{})
  }
  const deleteGP = async (id) => {
    if (!window.confirm('Delete this partner permanently?')) return
    await deleteProfile(id).catch(()=>{})
    setProfiles(ps => ps.filter(x => x.id !== id))
  }
  const toggleVisible = async (p) => {
    await updateProfile(p.id, { verified: !p.verified }).catch(()=>{})
    setProfiles(ps => ps.map(x => x.id===p.id ? {...x, verified:!x.verified} : x))
  }
  const toggleFeatured = async (p) => {
    const t2 = p.tier==='sponsored' ? 'free' : 'sponsored'
    await updateProfile(p.id, { tier: t2 }).catch(()=>{})
    setProfiles(ps => ps.map(x => x.id===p.id ? {...x, tier:t2} : x))
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:17 }}>🤝 Partners</div>
          <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>Manage all partner types shown on the platform</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className="btn" style={{ fontSize:11, padding:'5px 12px', background:section==='fixed'?G.goldDim:'rgba(255,255,255,0.04)', color:section==='fixed'?G.gold:G.muted, border:`1px solid ${section==='fixed'?G.goldBorder:'rgba(180,160,100,0.10)'}` }} onClick={()=>{setGpEdit(null);setSection('fixed')}}>General Partner</button>
          <button className="btn" style={{ fontSize:11, padding:'5px 12px', background:section==='db'?'rgba(61,111,168,0.1)':'rgba(255,255,255,0.04)', color:section==='db'?G.teal:G.muted, border:`1px solid ${section==='db'?'rgba(61,111,168,0.3)':'rgba(180,160,100,0.10)'}` }} onClick={()=>{setGpEdit(null);setSection('db')}}>Partner ({gpList.length})</button>
        </div>
      </div>
      {gpMsg && <div style={{ fontSize:13, color:G.green, background:'rgba(52,199,89,0.08)', border:'1px solid rgba(52,199,89,0.2)', borderRadius:8, padding:'8px 14px' }}>{gpMsg}</div>}

      {/* ── SECTION: rootsGTM + Government (editable boxes) ── */}
      {section==='fixed' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* rootsGTM */}
          <div style={{ background:G.surface, border:`1px solid rgba(61,111,168,0.3)`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:15, color:G.teal, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20 }}>🚀</span> rootsGTM — General Partner
            </div>
            {/* Logo row */}
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14, padding:'12px 14px', background:'rgba(61,111,168,0.04)', border:'1px solid rgba(61,111,168,0.15)', borderRadius:10 }}>
              <div style={{ width:64, height:64, borderRadius:14, overflow:'hidden', flexShrink:0, border:'2px solid rgba(61,111,168,0.35)', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,rgba(61,111,168,0.2),rgba(61,111,168,0.05))' }}>
                {partners.rootsgtm_logo
                  ? <img src={partners.rootsgtm_logo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : <span style={{ fontSize:28 }}>🚀</span>}
              </div>
              <div>
                <div style={{ fontSize:12, color:G.muted, marginBottom:6 }}>General Partner logo (displayed larger on Concierge page)</div>
                <label style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(180,160,100,0.12)', borderRadius:7, cursor:'pointer', fontSize:11, color:G.text }}>
                  📷 Upload logo
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                    const file=e.target.files?.[0]; if(!file) return
                    const img=new Image(), url=URL.createObjectURL(file)
                    img.onload=()=>{ const S=128,c=document.createElement('canvas'); c.width=S; c.height=S; const ctx=c.getContext('2d'); const side=Math.min(img.width,img.height); ctx.drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,S,S); URL.revokeObjectURL(url); setPartners(p=>({...p,rootsgtm_logo:c.toDataURL('image/webp',0.85)})) }
                    img.src=url
                  }} />
                </label>
                {partners.rootsgtm_logo && <button onClick={()=>setPartners(p=>({...p,rootsgtm_logo:null}))} className="btn ghost" style={{fontSize:10,padding:'3px 8px',marginLeft:6}}>✕ Remove</button>}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label className="flabel">Organisation name</label><input className="inp" value={partners.rootsgtm_name||''} onChange={e=>setPartners(p=>({...p,rootsgtm_name:e.target.value}))} /></div>
              <div><label className="flabel">Email</label><input className="inp" value={partners.rootsgtm_email||''} onChange={e=>setPartners(p=>({...p,rootsgtm_email:e.target.value}))} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label className="flabel">Phone</label><input className="inp" value={partners.rootsgtm_phone||''} onChange={e=>setPartners(p=>({...p,rootsgtm_phone:e.target.value}))} /></div>
              <div><label className="flabel">Website</label><input className="inp" value={partners.rootsgtm_website||''} onChange={e=>setPartners(p=>({...p,rootsgtm_website:e.target.value}))} /></div>
            </div>
            <div style={{ marginBottom:10 }}><label className="flabel">Description</label><textarea className="inp" rows={3} style={{resize:'vertical'}} value={partners.rootsgtm_desc||''} onChange={e=>setPartners(p=>({...p,rootsgtm_desc:e.target.value}))} /></div>
            {/* Cover image */}
            <div>
              <label className="flabel">Cover / Banner image</label>
              <div style={{ display:'flex', gap:10, alignItems:'center', marginTop:6 }}>
                {partners.rootsgtm_cover && <div style={{ width:100, height:44, borderRadius:7, overflow:'hidden', border:'1px solid rgba(61,111,168,0.3)' }}><img src={partners.rootsgtm_cover} alt="" style={{width:'100%',height:'100%',objectFit:'cover', objectPosition: partners.rootsgtm_cover_focus||'50% 50%'}} /></div>}
                <label style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(180,160,100,0.12)', borderRadius:7, cursor:'pointer', fontSize:11, color:G.text }}>
                  🖼 Upload cover
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                    const file=e.target.files?.[0]; if(!file) return
                    const img=new Image(),url=URL.createObjectURL(file)
                    img.onload=()=>{ const W=800,H=240,c=document.createElement('canvas'); c.width=W; c.height=H; const ctx=c.getContext('2d'); const scale=Math.max(W/img.width,H/img.height); const sw=W/scale,sh=H/scale; ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,W,H); URL.revokeObjectURL(url); setPartners(p=>({...p,rootsgtm_cover:c.toDataURL('image/webp',0.88),rootsgtm_cover_focus:'50% 50%'})) }
                    img.src=url
                  }} />
                </label>
                {partners.rootsgtm_cover && <button onClick={()=>setPartners(p=>({...p,rootsgtm_cover:null,rootsgtm_cover_focus:null}))} className="btn ghost" style={{fontSize:10,padding:'3px 8px'}}>✕ Remove</button>}
                  <div style={{ fontSize:10, color:'rgba(201,164,74,0.32)', lineHeight:1.5, marginTop:4, fontStyle:'italic' }}>
                    💡 Best: landscape image, 3:1 ratio (e.g. 900×300px). Avoid text near edges — only the center shows.
                  </div>
              </div>
              <CoverCropPicker image={partners.rootsgtm_cover} onApply={cropped=>setPartners(p=>({...p,rootsgtm_cover:cropped}))} accentColor="#3d7fa8" />
            </div>
          </div>

          {/* Government */}
          <div style={{ background:G.surface, border:`1px solid ${G.goldBorder}`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:15, color:G.gold, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20 }}>🏛️</span> Kosova Government / InvestKosova — General Partner
            </div>
            {/* Logo row */}
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14, padding:'12px 14px', background:G.goldDim, border:`1px solid ${G.goldBorder}`, borderRadius:10 }}>
              <div style={{ width:64, height:64, borderRadius:14, overflow:'hidden', flexShrink:0, border:`2px solid ${G.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,rgba(201,164,74,0.2),rgba(201,164,74,0.05))' }}>
                {partners.gov_logo
                  ? <img src={partners.gov_logo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : <span style={{ fontSize:28 }}>🏛️</span>}
              </div>
              <div>
                <div style={{ fontSize:12, color:G.muted, marginBottom:6 }}>General Partner logo (displayed larger on Concierge page)</div>
                <label style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(180,160,100,0.12)', borderRadius:7, cursor:'pointer', fontSize:11, color:G.text }}>
                  📷 Upload logo
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                    const file=e.target.files?.[0]; if(!file) return
                    const img=new Image(), url=URL.createObjectURL(file)
                    img.onload=()=>{ const S=128,c=document.createElement('canvas'); c.width=S; c.height=S; const ctx=c.getContext('2d'); const side=Math.min(img.width,img.height); ctx.drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,S,S); URL.revokeObjectURL(url); setPartners(p=>({...p,gov_logo:c.toDataURL('image/webp',0.85)})) }
                    img.src=url
                  }} />
                </label>
                {partners.gov_logo && <button onClick={()=>setPartners(p=>({...p,gov_logo:null}))} className="btn ghost" style={{fontSize:10,padding:'3px 8px',marginLeft:6}}>✕ Remove</button>}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label className="flabel">Organisation name</label><input className="inp" value={partners.gov_name||''} onChange={e=>setPartners(p=>({...p,gov_name:e.target.value}))} /></div>
              <div><label className="flabel">Email</label><input className="inp" value={partners.gov_email||''} onChange={e=>setPartners(p=>({...p,gov_email:e.target.value}))} /></div>
            </div>
            <div style={{ marginBottom:10 }}><label className="flabel">Website</label><input className="inp" value={partners.gov_website||''} onChange={e=>setPartners(p=>({...p,gov_website:e.target.value}))} /></div>
            <div style={{ marginBottom:10 }}><label className="flabel">Description</label><textarea className="inp" rows={3} style={{resize:'vertical'}} value={partners.gov_desc||''} onChange={e=>setPartners(p=>({...p,gov_desc:e.target.value}))} /></div>
            <div>
              <label className="flabel">Cover / Banner image</label>
              <div style={{ display:'flex', gap:10, alignItems:'center', marginTop:6 }}>
                {partners.gov_cover && <div style={{ width:100, height:44, borderRadius:7, overflow:'hidden', border:`1px solid ${G.goldBorder}` }}><img src={partners.gov_cover} alt="" style={{width:'100%',height:'100%',objectFit:'cover', objectPosition: partners.gov_cover_focus||'50% 50%'}} /></div>}
                <label style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(180,160,100,0.12)', borderRadius:7, cursor:'pointer', fontSize:11, color:G.text }}>
                  🖼 Upload cover
                  <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                    const file=e.target.files?.[0]; if(!file) return
                    const img=new Image(),url=URL.createObjectURL(file)
                    img.onload=()=>{ const W=800,H=240,c=document.createElement('canvas'); c.width=W; c.height=H; const ctx=c.getContext('2d'); const scale=Math.max(W/img.width,H/img.height); const sw=W/scale,sh=H/scale; ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,W,H); URL.revokeObjectURL(url); setPartners(p=>({...p,gov_cover:c.toDataURL('image/webp',0.88),gov_cover_focus:'50% 50%'})) }
                    img.src=url
                  }} />
                </label>
                {partners.gov_cover && <button onClick={()=>setPartners(p=>({...p,gov_cover:null,gov_cover_focus:null}))} className="btn ghost" style={{fontSize:10,padding:'3px 8px'}}>✕ Remove</button>}
                  <div style={{ fontSize:10, color:'rgba(201,164,74,0.32)', lineHeight:1.5, marginTop:4, fontStyle:'italic' }}>
                    💡 Best: landscape image, 3:1 ratio (e.g. 900×300px). Avoid text near edges — only the center shows.
                  </div>
              </div>
              <CoverCropPicker image={partners.gov_cover} onApply={cropped=>setPartners(p=>({...p,gov_cover:cropped}))} accentColor="#c9a44a" />
            </div>
          </div>

          {/* ── Concierge page text ── */}
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:14, marginBottom:14 }}>📄 Concierge Page Text</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label className="flabel">Hero Title</label><input className="inp" value={concierge.hero_title||''} onChange={e=>setConcierge(c=>({...c,hero_title:e.target.value}))} placeholder="Kosova Concierge" /></div>
              <div><label className="flabel">Hero Subtitle</label><input className="inp" value={concierge.hero_sub||''} onChange={e=>setConcierge(c=>({...c,hero_sub:e.target.value}))} placeholder="Our partners organise your complete business visit." /></div>
            </div>
            <div style={{ marginBottom:10 }}><label className="flabel">rootsGTM Description</label>
              <textarea className="inp" rows={2} style={{resize:'vertical'}} value={partners.rootsgtm_desc||''} onChange={e=>setPartners(p=>({...p,rootsgtm_desc:e.target.value}))} /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label className="flabel">Government Name</label><input className="inp" value={partners.gov_name||''} onChange={e=>setPartners(p=>({...p,gov_name:e.target.value}))} placeholder="Kosova Government" /></div>
              <div><label className="flabel">Government Subtitle</label><input className="inp" value={partners.gov_sub||''} onChange={e=>setPartners(p=>({...p,gov_sub:e.target.value}))} placeholder="InvestKosova · Official Partner" /></div>
            </div>
            <div><label className="flabel">Government Description</label>
              <textarea className="inp" rows={2} style={{resize:'vertical'}} value={partners.gov_desc||''} onChange={e=>setPartners(p=>({...p,gov_desc:e.target.value}))} /></div>
          </div>

          {settingsSaved==='partners' && <div style={{ fontSize:12, color:G.green }}>✓ Saved to database</div>}
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn gbtn" style={{ alignSelf:'flex-start', padding:'10px 24px' }} onClick={savePartners} disabled={saving}>
              {saving ? 'Saving…' : '💾 Save General Partner Details'}
            </button>
            <button className="btn ghost" style={{ alignSelf:'flex-start', padding:'10px 24px' }} onClick={saveConcierge} disabled={saving}>
              💾 Save Concierge Text
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION: General DB Partners (CRUD) ── */}
      {section==='db' && (
        <>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            {gpEdit===null && <button className="btn gbtn" style={{ padding:'9px 18px', fontSize:13 }} onClick={openNew}>+ Add Partner</button>}
          </div>
          {gpEdit===null && (
            gpList.length===0 ? (
              <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'44px', textAlign:'center', color:G.muted }}>
                <div style={{ fontSize:36, marginBottom:12 }}>🤝</div>
                <div style={{ fontFamily:"'Inter',sans-serif" }}>No general partners yet. Click "+ Add Partner" to create the first one.</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {gpList.map(p => (
                  <div key={p.id} style={{ background:G.surface, border:`1px solid ${p.verified!==false?'rgba(61,111,168,0.25)':G.border}`, borderRadius:14, padding:'14px 18px', display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
                    <Logo text={p.logo} color={p.logoColor||'#3d7fa8'} url={p.logoUrl} size={46} />
                    <div style={{ flex:1, minWidth:160 }}>
                      <div style={{ fontWeight:700, fontSize:14, display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                        {p.name}
                        {p.tier==='sponsored' && <span style={{ fontSize:10, background:'rgba(201,164,74,0.12)', color:G.gold, border:`1px solid ${G.goldBorder}`, borderRadius:5, padding:'1px 7px', fontWeight:700 }}>⭐ Featured</span>}
                        {p.verified===false && <span style={{ fontSize:10, background:'#0a1828', color:G.muted, border:'1px solid rgba(180,160,100,0.10)', borderRadius:5, padding:'1px 7px' }}>Hidden</span>}
                      </div>
                      <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{[p.city, p.website].filter(Boolean).join(' · ')}</div>
                      {(p.tags||[]).length>0 && <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:5 }}>{p.tags.slice(0,4).map(tg=><span key={tg} className="tag" style={{fontSize:10}}>{tg}</span>)}</div>}
                    </div>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'flex-end' }}>
                      <button className="btn" style={{ fontSize:10, padding:'4px 10px', background:'rgba(61,111,168,0.08)', color:G.teal, border:'1px solid rgba(61,111,168,0.2)', borderRadius:6 }} onClick={()=>openEditGP(p)}>✏️ Edit</button>
                      <button className="btn" style={{ fontSize:10, padding:'4px 10px', background:p.verified!==false?'rgba(52,199,89,0.08)':'rgba(255,255,255,0.04)', color:p.verified!==false?G.green:G.muted, border:`1px solid ${p.verified!==false?'rgba(52,199,89,0.2)':'rgba(180,160,100,0.10)'}`, borderRadius:6 }} onClick={()=>toggleVisible(p)}>{p.verified!==false?'👁 Visible':'🚫 Hidden'}</button>
                      <button className="btn" style={{ fontSize:10, padding:'4px 10px', background:p.tier==='sponsored'?G.goldDim:'rgba(255,255,255,0.04)', color:p.tier==='sponsored'?G.gold:G.muted, border:`1px solid ${p.tier==='sponsored'?G.goldBorder:'rgba(180,160,100,0.10)'}`, borderRadius:6 }} onClick={()=>toggleFeatured(p)}>⭐ {p.tier==='sponsored'?'Unfeature':'Feature'}</button>
                      <button className="btn" style={{ fontSize:10, padding:'4px 10px', background:'rgba(255,59,48,0.08)', color:G.red, border:'1px solid rgba(255,59,48,0.2)', borderRadius:6 }} onClick={()=>deleteGP(p.id)}>🗑 Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {gpEdit!==null && (
            <div style={{ background:G.surface, border:`1px solid rgba(61,111,168,0.3)`, borderRadius:16, overflow:'hidden' }}>
              <div style={{ padding:'16px 22px', borderBottom:`1px solid ${G.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(61,111,168,0.04)' }}>
                <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:16, color:G.teal }}>
                  {gpEdit==='new' ? '+ New General Partner' : `✏️ Edit: ${gpEdit.name}`}
                </div>
                <button className="btn ghost" style={{ fontSize:12, padding:'4px 12px' }} onClick={()=>setGpEdit(null)}>✕ Cancel</button>
              </div>
              <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label className="flabel">Logo</label>
                  <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginTop:8 }}>
                    <div style={{ width:64, height:64, borderRadius:14, overflow:'hidden', flexShrink:0, border:`2px solid ${gpForm.logoColor||'#3d7fa8'}55`, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${gpForm.logoColor||'#3d7fa8'}18,${gpForm.logoColor||'#3d7fa8'}38)` }}>
                      {gpLogo
                        ? <img src={gpLogo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        : <span style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:18, color:gpForm.logoColor||'#3d7fa8' }}>{(gpForm.name||'?').split(' ').map(w=>w[0]||'').join('').slice(0,2).toUpperCase()||'?'}</span>}
                    </div>
                    <div style={{ flex:1 }}>
                      <label style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(180,160,100,0.12)', borderRadius:8, cursor:'pointer', fontSize:12, color:G.text, marginBottom:8 }}>
                        📷 Upload logo
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                          const file=e.target.files?.[0]; if(!file) return
                          const img=new Image(), url=URL.createObjectURL(file)
                          img.onload=()=>{ const S=128, c=document.createElement('canvas'); c.width=S; c.height=S; const ctx=c.getContext('2d'); const side=Math.min(img.width,img.height); ctx.drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,S,S); URL.revokeObjectURL(url); setGpLogo(c.toDataURL('image/webp',0.85)) }
                          img.src=url
                        }} />
                      </label>
                      {gpLogo && <button onClick={()=>setGpLogo(null)} className="btn ghost" style={{fontSize:10,padding:'3px 9px',display:'block',marginBottom:8}}>✕ Remove</button>}
                      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        {logoColors.map(col=>(
                          <button key={col} onClick={()=>setGpForm(f=>({...f,logoColor:col}))}
                            style={{ width:22, height:22, borderRadius:'50%', background:col, border:`2px solid ${(gpForm.logoColor||'#3d7fa8')===col?'#fff':'transparent'}`, cursor:'pointer', transition:'transform 0.15s' }}
                            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.2)'}
                            onMouseLeave={e=>e.currentTarget.style.transform=''} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Cover image */}
                <div>
                  <label className="flabel">Cover / Banner Image</label>
                  <div style={{ display:'flex', gap:14, alignItems:'center', marginTop:8 }}>
                    {gpCover && (
                      <div style={{ width:140, height:64, borderRadius:10, overflow:'hidden', flexShrink:0, border:`2px solid ${gpForm.logoColor||'#3d7fa8'}40` }}>
                        <img src={gpCover} alt="" style={{width:'100%',height:'100%',objectFit:'cover', objectPosition: gpForm.coverFocus||'50% 50%'}} />
                      </div>
                    )}
                    <div style={{ flex:1 }}>
                      <label style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 13px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(180,160,100,0.12)', borderRadius:8, cursor:'pointer', fontSize:12, color:G.text, marginBottom:8 }}>
                        🖼 Upload cover
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                          const file=e.target.files?.[0]; if(!file) return
                          const img=new Image(), url=URL.createObjectURL(file)
                          img.onload=()=>{ const W=800,H=240,c=document.createElement('canvas'); c.width=W; c.height=H; const ctx=c.getContext('2d'); const scale=Math.max(W/img.width,H/img.height); const sw=W/scale,sh=H/scale; ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,W,H); URL.revokeObjectURL(url); setGpCover(c.toDataURL('image/webp',0.88)); setGpForm(f=>({...f,coverFocus:'50% 50%'})) }
                          img.src=url
                        }} />
                      </label>
                      {gpCover && <button onClick={()=>{setGpCover(null);setGpForm(f=>({...f,coverFocus:null}))}} className="btn ghost" style={{fontSize:10,padding:'3px 9px',display:'block'}}>✕ Remove</button>}
                  <div style={{ fontSize:10, color:'rgba(201,164,74,0.32)', lineHeight:1.5, marginTop:4, fontStyle:'italic' }}>
                    💡 Best: landscape image, 3:1 ratio (e.g. 900×300px). Avoid text near edges — only the center shows.
                  </div>
                    </div>
                  </div>
                  <CoverCropPicker image={gpCover} onApply={cropped=>setGpCover(cropped)} accentColor={gpForm.logoColor||'#3d7fa8'} />
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div><label className="flabel">Name *</label><input className="inp" value={gpForm.name||''} onChange={e=>setGpForm(f=>({...f,name:e.target.value}))} placeholder="Organisation name" /></div>
                  <div><label className="flabel">City</label><input className="inp" value={gpForm.city||''} onChange={e=>setGpForm(f=>({...f,city:e.target.value}))} placeholder="Pristina, Berlin…" /></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <div><label className="flabel">Email</label><input className="inp" value={gpForm.email||''} onChange={e=>setGpForm(f=>({...f,email:e.target.value}))} /></div>
                  <div><label className="flabel">Phone</label><input className="inp" value={gpForm.phone||''} onChange={e=>setGpForm(f=>({...f,phone:e.target.value}))} /></div>
                </div>
                <div><label className="flabel">Website</label><input className="inp" value={gpForm.website||''} onChange={e=>setGpForm(f=>({...f,website:e.target.value}))} placeholder="partner.com" /></div>
                <div><label className="flabel">Tags (comma separated)</label><input className="inp" value={gpForm.tags||''} onChange={e=>setGpForm(f=>({...f,tags:e.target.value}))} placeholder="IT, BPO, Gov Relations…" /></div>
                <div><label className="flabel">Description</label><textarea className="inp" rows={3} style={{resize:'vertical'}} value={gpForm.desc||''} onChange={e=>setGpForm(f=>({...f,desc:e.target.value}))} /></div>
                <div style={{ display:'flex', gap:18 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:G.text }}>
                    <input type="checkbox" checked={!!gpForm.visible} onChange={e=>setGpForm(f=>({...f,visible:e.target.checked}))} /> Visible
                  </label>
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:G.text }}>
                    <input type="checkbox" checked={!!gpForm.featured} onChange={e=>setGpForm(f=>({...f,featured:e.target.checked}))} /> ⭐ Featured
                  </label>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                  <button className="btn gbtn" style={{ flex:1, padding:'11px', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={saveGP} disabled={gpSaving||!gpForm.name}>
                    {gpSaving ? '⏳ Saving…' : '💾 Save Partner'}
                  </button>
                  <button className="btn ghost" style={{ padding:'11px 20px' }} onClick={()=>setGpEdit(null)} disabled={gpSaving}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── ADMIN PAGE ──────────────────────────────────────────────────────────────
let ADMIN_PASSWORD = 'bbplatform2025admin'

function AdminPage({ onExit, lang, siteContent: initContent = {}, onContentSave }) {
  const [pw, setPw] = React.useState('')
  const [authed, setAuthed] = React.useState(false)
  const [authFail, setAuthFail] = React.useState(false)
  const [tab, setTab] = React.useState('pending_profiles') // pending_profiles | profiles | pending_changes | partners | concierge | settings
  const [profiles, setProfiles] = React.useState([])
  const [pending, setPending] = React.useState([])
  const [loadingP, setLoadingP] = React.useState(false)
  const [loadingC, setLoadingC] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [editProfile, setEditProfile] = React.useState(null)
  const [partners, setPartners] = React.useState({
    rootsgtm_name: 'rootsGTM',
    rootsgtm_email: 'mentor@bbplatform.com',
    rootsgtm_phone: '+383 44 123 456',
    rootsgtm_website: 'rootsgtm.com',
    rootsgtm_desc: 'rootsGTM is our exclusive sales network — specialised in connecting EU companies with Kosova partners.',
    gov_name: 'Kosova Government / InvestKosova',
    gov_email: 'info@invest-ks.com',
    gov_website: 'invest-ks.com',
    gov_desc: 'Official partnership with InvestKosova and the Ministry of Economy.',
  })
  const [concierge, setConcierge] = React.useState({
    hero_title: 'Kosova Concierge',
    hero_sub: 'Our partners organise your complete business visit.',
    avail_note: '2 Active partners',
    pkg_sub: 'Rates and conditions are agreed in a personal conversation.',
    sp_title: 'rootsGTM',
    sp_sub: "rootsGTM's sales team works on the ground in Kosova.",
    cta_title: 'Ready for your Kosova visit?',
    cta_email: 'concierge@bbplatform.com',
  })
  const [settingsSaved, setSettingsSaved] = React.useState('')
  const [govContent, setGovContent] = React.useState({
    badge: '', heroTitle: '', heroTitle2: '', heroSub: '', factsHeading: '',
    buttons: [
      { label: 'InvestKosova →', url: 'https://www.investkosova.com', style: 'primary' },
      { label: 'ARBK →',         url: 'https://arbk.rks-gov.net',     style: 'ghost'   },
      { label: 'ATK →',          url: 'https://www.atk-ks.org',        style: 'ghost'   },
    ]
  })
  const [editForm, setEditForm] = React.useState({})
  const [newPw, setNewPw] = React.useState('')
  const [newPwConfirm, setNewPwConfirm] = React.useState('')
  const [pwChanged, setPwChanged] = React.useState(false)
  const [notifEmail, setNotifEmail] = React.useState(
    typeof localStorage !== 'undefined' ? (localStorage.getItem('tg_admin_email') || '') : ''
  )
  const [notifSaved, setNotifSaved] = React.useState(false)

  const login = async () => {
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true); setAuthFail(false)
      loadData()
      fetchSiteContent().then(content => {
        if (content.partners)  setPartners(prev => ({ ...prev, ...content.partners }))
        if (content.concierge) setConcierge(prev => ({ ...prev, ...content.concierge }))
        if (content.gov)       setGovContent(prev => ({ ...prev, ...content.gov }))
      }).catch(() => {})
      // Auto-refresh pending every 30s
      const interval = setInterval(() => {
        fetchAllProfilesAdmin().then(d => setProfiles(d.map(normaliseProfile))).catch(() => {})
        fetchPendingChanges().then(d => setPending(d)).catch(() => {})
      }, 30000)
      return () => clearInterval(interval)
    } else { setAuthFail(true) }
  }

  const loadData = async () => {
    setLoadingP(true); setLoadingC(true)
    fetchAllProfilesAdmin().then(d => { setProfiles(d.map(normaliseProfile)); setLoadingP(false) }).catch(() => setLoadingP(false))
    fetchPendingChanges().then(d => { setPending(d); setLoadingC(false) }).catch(() => setLoadingC(false))
    fetchSettings('partners').then(d => { if (d) setPartners(p => ({ ...p, ...d })) }).catch(() => {})
    fetchSettings('concierge').then(d => { if (d) setConcierge(cc => ({ ...cc, ...d })) }).catch(() => {})
  }

  const savePartners = async () => {
    setSaving(true)
    await upsertSetting('partners', partners)
    setSaving(false)
    setSettingsSaved('partners')
    setTimeout(() => setSettingsSaved(''), 2500)
  }

  const saveConcierge = async () => {
    setSaving(true)
    await upsertSetting('concierge', concierge)
    setSaving(false)
    setSettingsSaved('concierge')
    setTimeout(() => setSettingsSaved(''), 2500)
  }

  const saveGov = async () => {
    setSaving(true)
    await upsertSetting('gov', govContent)
    // Also push to live window cache
    window.__siteContent = { ...(window.__siteContent||{}), gov: govContent }
    onContentSave && onContentSave('gov', govContent)
    setSaving(false)
    setSettingsSaved('gov')
    setTimeout(() => setSettingsSaved(''), 2500)
  }

  const handleVerify = async (id, val) => {
    const err = await updateProfile(id, { verified: val })
    if (!err) setProfiles(ps => ps.map(x => x.id === id ? { ...x, verified: val } : x))
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this profile? This cannot be undone.')) return
    const err = await deleteProfile(id)
    if (!err) setProfiles(ps => ps.filter(x => x.id !== id))
  }

  const openEdit = p => {
    setEditProfile(p)
    setEditForm({
      name:           p.name || '',
      city:           p.city || '',
      contact:        p.contact || '',
      phone:          p.phone || '',
      website:        p.website || '',
      employees:      p.employees || '',
      languages:      p.languages || '',
      experience:     p.experience || '',
      tier:           p.tier || 'free',
      type:           p.type || 'company',
      cat:            p.cat || 'software',
      tags:           Array.isArray(p.tags) ? p.tags.join(', ') : '',
      logoColor:      p.logoColor || '#4a7fa5',
      logoDataPreview:p.logoUrl || null,
      desc_en:        p.desc?.en || '',
      desc_sq:        p.desc?.sq || p.desc?.en || '',
      // Sponsored premium fields — accept both camelCase (app) and snake_case (raw DB)
      prevCompanies:   p.prevCompanies   || p.prev_companies   || '',
      featuredProject: p.featuredProject || p.featured_project || '',
      linkedin:        p.linkedin        || '',
      github:          p.github          || '',
      certifications:  p.certifications  || '',
      availability:    p.availability    || '',
      videoUrl:        p.videoUrl        || p.video_url        || '',
      coverImage:      p.coverImage      || p.cover_image      || null,
      coverFocus:      p.coverFocus      || p.cover_focus      || '50% 50%',
    })
  }

  const saveEdit = async () => {
    setSaving(true)
    const updates = {
      name:            editForm.name,
      city:            editForm.city,
      email:           editForm.contact,
      phone:           editForm.phone || null,
      website:         editForm.website || null,
      employees:       editForm.employees || null,
      languages:       editForm.languages || null,
      experience:      editForm.experience || null,
      tier:            editForm.tier,
      type:            editForm.type,
      cat:             editForm.cat,
      tags:            typeof editForm.tags === 'string' ? editForm.tags.split(',').map(s=>s.trim()).filter(Boolean) : (editForm.tags||[]),
      logo_color:      editForm.logoColor || '#4a7fa5',
      ...(editForm.logoDataPreview && !editForm.logoDataPreview.startsWith('http') ? { logo_data: editForm.logoDataPreview } : {}),
      desc_en:         editForm.desc_en || null,
      desc_sq:         editForm.desc_sq || editForm.desc_en || null,
    }
    // Sponsored premium fields — always include so they can be cleared too
    if (editForm.tier === 'sponsored') {
      updates.prev_companies   = editForm.prevCompanies || null
      updates.featured_project = editForm.featuredProject || null
      updates.linkedin         = editForm.linkedin || null
      updates.github           = editForm.github || null
      updates.certifications   = editForm.certifications || null
      updates.availability     = editForm.availability || null
      updates.video_url        = editForm.videoUrl || null
    }
    // Cover image — always send (null clears it in DB)
    updates.cover_image = editForm.coverImage || null
    updates.cover_focus = editForm.coverFocus || null

    try {
      await updateProfile(editProfile.id, updates)
    } catch(e) {
      console.error('[saveEdit]', e)
    }

    // Always update local state and close — supabase.js may not return consistent error shapes
    setProfiles(ps => ps.map(x => x.id === editProfile.id ? {
      ...x, ...updates,
      contact: updates.email,
      logoColor: updates.logo_color,
      logoUrl: updates.logo_data ? updates.logo_data : x.logoUrl,
      coverImage: updates.cover_image || x.coverImage,
      prevCompanies:  updates.prev_companies,
      featuredProject: updates.featured_project,
      linkedin: updates.linkedin,
      github:   updates.github,
      certifications: updates.certifications,
      availability: updates.availability,
      videoUrl: updates.video_url,
      desc: { en: updates.desc_en || x.desc?.en, sq: updates.desc_sq || x.desc?.sq }
    } : x))
    setEditProfile(null)
    setSaving(false)
  }

  const handleApprovePending = async (chg) => {
    setSaving(true)
    const dbChanges = {}
    if (chg.changes?.tags)  dbChanges.tags    = chg.changes.tags
    if (chg.changes?.email) dbChanges.email   = chg.changes.email
    if (chg.changes?.name)  dbChanges.name    = chg.changes.name
    if (chg.changes?.city)  dbChanges.city    = chg.changes.city
    if (chg.changes?.website) dbChanges.website = chg.changes.website
    if (chg.changes?.desc) {
      dbChanges.desc_de = chg.changes.desc.de
      dbChanges.desc_en = chg.changes.desc.en
      dbChanges.desc_sq = chg.changes.desc.sq || chg.changes.desc.en
      dbChanges.desc_sv = chg.changes.desc.sv || chg.changes.desc.en
    }
    const profileId = chg.profileId || chg.profile_id
    const err = await approvePendingChange(chg.id, profileId, dbChanges)
    if (!err) {
      setPending(ps => ps.filter(x => x.id !== chg.id))
      setProfiles(ps => ps.map(p => p.id === profileId ? { ...p, ...chg.changes } : p))
    }
    setSaving(false)
  }

  const handleRejectPending = async (id) => {
    const err = await rejectPendingChange(id)
    if (!err) setPending(ps => ps.filter(x => x.id !== id))
  }

  const saveAdminEmail = () => {
    localStorage.setItem('tg_admin_email', notifEmail)
    setNotifSaved(true)
    setTimeout(() => setNotifSaved(false), 2500)
  }

  const changePassword = () => {
    if (newPw.length < 8) return alert('Min. 8 characters')
    if (newPw !== newPwConfirm) return alert('Passwords do not match')
    ADMIN_PASSWORD = newPw
    setNewPw(''); setNewPwConfirm('')
    setPwChanged(true)
    setTimeout(() => setPwChanged(false), 3000)
  }

  const pendingProfiles = profiles.filter(p => !p.verified)
  const allProfiles     = profiles

  // Tab counts
  const tabCount = { pending_profiles: pendingProfiles.length, pending_changes: pending.length }

  if (!authed) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: G.bg }}>
      <div style={{ background: G.surface, border: `1px solid ${G.goldBorder}`, borderRadius: 18, padding: 38, width: 360, textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 14 }}>🔒</div>
        <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Admin</div>
        <div style={{ fontSize: 12, color: G.muted, marginBottom: 22 }}>Business Bridge Platform</div>
        <input className="inp" type="password" value={pw} onChange={e => setPw(e.target.value)}
          placeholder="Password" style={{ marginBottom: 10, textAlign: 'center' }}
          onKeyDown={e => e.key === 'Enter' && login()} />
        {authFail && <div style={{ fontSize: 12, color: G.red, marginBottom: 8 }}>⚠️ Wrong password</div>}
        <button className="btn gbtn" style={{ width: '100%' }} onClick={login}>Login</button>
        <button className="btn ghost" style={{ width: '100%', marginTop: 10 }} onClick={onExit}>← Back</button>
      </div>
    </div>
  )

  const TABS = [
    { id: 'pending_profiles', label: 'New profiles',      labelEn: 'New profiles',         icon: '🆕' },
    { id: 'profiles',         label: 'All profiles',      labelEn: 'All profiles',          icon: '📋' },
    { id: 'pending_changes',  label: 'Change requests',   labelEn: 'Change requests',       icon: '✏️' },
    { id: 'partners',         label: 'Partner',           labelEn: 'Partner',               icon: '🤝' },
    { id: 'government',       label: 'Government Page',   labelEn: 'Government Page',       icon: '🏛️' },
    { id: 'settings',         label: 'Settings',          labelEn: 'Settings',              icon: '⚙️' },
  ]

  const renderLabel = t2 => t2.labelEn

  const renderProfileRow = (p) => (
    <div key={p.id} style={{ background: G.surface, border: `1px solid ${p.verified ? G.border : G.goldBorder}`, borderRadius: 12, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center' }}>
      <Logo text={p.logo} color={p.logoColor} url={p.logoUrl} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
        <div style={{ fontSize: 11, color: G.muted }}>📍 {p.city} · {p.type} · {p.cat}</div>
        <div style={{ fontSize: 11, color: G.blue, marginTop: 1 }}>📧 {p.contact}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 5 }}>
          {(p.tags||[]).slice(0,5).map(t2 => <span key={t2} className="tag">{t2}</span>)}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'flex-end', flexShrink: 0 }}>
        {/* Tier badge */}
        <span style={{ fontSize: 10, background: p.tier==='sponsored'?'rgba(251,146,60,0.1)':'rgba(255,255,255,0.04)', color: p.tier==='sponsored'?G.orange:G.muted, border: `1px solid ${p.tier==='sponsored'?'rgba(251,146,60,0.3)':'rgba(180,160,100,0.10)'}`, borderRadius: 5, padding: '2px 8px' }}>
          {p.tier}
        </span>
        <div style={{ display: 'flex', gap: 5 }}>
          {/* Verify / Un-verify toggle */}
          {!p.verified
            ? <button className="btn" style={{ fontSize: 10, padding: '3px 9px', background: 'rgba(52,199,89,0.1)', color: G.green, border: '1px solid rgba(52,199,89,0.2)', borderRadius: 5 }} onClick={() => handleVerify(p.id, true)}>✓ Verify</button>
            : <button className="btn" style={{ fontSize: 10, padding: '3px 9px', background: 'rgba(255,59,48,0.06)', color: G.red, border: '1px solid rgba(255,59,48,0.2)', borderRadius: 5 }} onClick={() => handleVerify(p.id, false)}>✕ Unverify</button>
          }
          <button className="btn" style={{ fontSize: 10, padding: '3px 9px', background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, borderRadius: 5 }} onClick={() => openEdit(p)}>✏️ Edit</button>
          <button className="btn" style={{ fontSize: 10, padding: '3px 9px', background: 'rgba(255,59,48,0.08)', color: G.red, border: '1px solid rgba(255,59,48,0.2)', borderRadius: 5 }} onClick={() => handleDelete(p.id)}>🗑</button>
        </div>
        {p.verified
          ? <span style={{ fontSize: 10, color: G.green }}>✓ Live</span>
          : <span style={{ fontSize: 10, color: G.gold }}>⏳ Pending review</span>
        }
      </div>
    </div>
  )

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: G.bg, minHeight: '100vh', color: G.text, padding: '28px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`* { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 22 }}>🔧 Admin Panel</div>
          <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>Business Bridge Platform</div>
        </div>
        <div style={{ display: 'flex', gap: 9 }}>
          <button className="btn ghost" style={{ fontSize: 12 }} onClick={loadData}>🔄 Refresh</button>
          <button className="btn ghost" style={{ fontSize: 12 }} onClick={onExit}>← Exit</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          [profiles.length, 'Total profiles', G.blue],
          [profiles.filter(p => p.verified).length, 'Live / Verified', G.green],
          [pendingProfiles.length, 'Awaiting review', G.gold],
          [pending.length, 'Change requests', pending.length > 0 ? G.orange : G.muted],
        ].map(([v, l, col]) => (
          <div key={l} style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 10, padding: '14px 18px' }}>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 28, color: col }}>{v}</div>
            <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 18, flexWrap: 'wrap' }}>
        {TABS.map(t2 => {
          const count = tabCount[t2.id]
          return (
            <button key={t2.id} onClick={() => setTab(t2.id)} className="btn" style={{ padding: '8px 16px', fontSize: 12, fontWeight: 600, background: tab === t2.id ? G.goldDim : 'rgba(255,255,255,0.04)', color: tab === t2.id ? G.gold : G.muted, border: `1px solid ${tab === t2.id ? G.goldBorder : 'rgba(255,255,255,0.07)'}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              {t2.icon} {renderLabel(t2)}
              {count > 0 && <span style={{ background: tab === t2.id ? G.gold : G.orange, color: tab === t2.id ? G.bg : '#fff', borderRadius: 10, padding: '1px 7px', fontSize: 10, fontWeight: 800 }}>{count}</span>}
            </button>
          )
        })}
      </div>

      {/* ── TAB: NEW / PENDING PROFILES ───────────────────────────────────── */}
      {tab === 'pending_profiles' && (() => {
        const pendingFirms    = pendingProfiles.filter(p => p.type !== 'partner')
        const pendingPartners = pendingProfiles.filter(p => p.type === 'partner')
        return (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:13, color:G.muted, fontFamily:"'Inter',sans-serif" }}>
                {pendingProfiles.length} pending · Partners: {pendingPartners.length} · Companies/FL: {pendingFirms.length}
              </div>
              <button className="btn ghost" style={{ fontSize:12, padding:'6px 14px' }} onClick={() => { setLoadingP(true); fetchAllProfilesAdmin().then(d=>{setProfiles(d.map(normaliseProfile));setLoadingP(false)}).catch(()=>setLoadingP(false)) }}>
                🔄 Refresh
              </button>
            </div>
            {loadingP && <div style={{ color: G.muted, padding: 20 }}>Loading…</div>}

            {/* ── Pending Partners ── */}
            {!loadingP && pendingPartners.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:15 }}>🤝 Partner Applications</div>
                  <span style={{ background:'rgba(61,111,168,0.12)', color:G.teal, border:'1px solid rgba(61,111,168,0.3)', borderRadius:10, padding:'1px 8px', fontSize:11, fontWeight:700 }}>{pendingPartners.length}</span>
                </div>
                <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:G.muted, marginBottom:12 }}>
                  Sales partner applications. Verify to make them visible on the Concierge page.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {pendingPartners.map(p => (
                    <div key={p.id} style={{ background: G.surface, border:`1px solid rgba(61,111,168,0.25)`, borderRadius:12, padding:'14px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
                      <Logo text={p.logo} color={p.logoColor} url={p.logoUrl} size={38} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:700, fontSize:14 }}>{p.name}</div>
                        <div style={{ fontSize:11, color:G.muted }}>📍 {p.city} · 🤝 Partner</div>
                        <div style={{ fontSize:11, color:G.blue, marginTop:1 }}>📧 {p.contact}</div>
                        {p.languages && <div style={{ fontSize:11, color:G.muted }}>🗣 {p.languages}</div>}
                        {(p.tags||[]).length>0 && (
                          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:6 }}>
                            {p.tags.map(tg => <span key={tg} className="tag">{tg}</span>)}
                          </div>
                        )}
                        {(p.desc?.en||p.desc?.de) && (
                          <p style={{ fontSize:12, color:G.muted, marginTop:6, lineHeight:1.5 }}>{p.desc.en||p.desc.de}</p>
                        )}
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:5, alignItems:'flex-end', flexShrink:0 }}>
                        <button className="btn" style={{ fontSize:10, padding:'4px 11px', background:'rgba(52,199,89,0.1)', color:G.green, border:'1px solid rgba(52,199,89,0.2)', borderRadius:5, whiteSpace:'nowrap' }}
                          onClick={() => handleVerify(p.id, true)}>✓ Verify → Live on Concierge</button>
                        <button className="btn" style={{ fontSize:10, padding:'4px 11px', background:G.goldDim, color:G.gold, border:`1px solid ${G.goldBorder}`, borderRadius:5 }}
                          onClick={() => openEdit(p)}>✏️ Edit</button>
                        <button className="btn" style={{ fontSize:10, padding:'4px 11px', background:'rgba(255,59,48,0.08)', color:G.red, border:'1px solid rgba(255,59,48,0.2)', borderRadius:5 }}
                          onClick={() => handleDelete(p.id)}>🗑 Reject</button>
                        <span style={{ fontSize:10, color:G.gold }}>⏳ Pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Pending Companies / Freelancers ── */}
            {!loadingP && (
              <div>
                {pendingPartners.length > 0 && (
                  <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:15, marginBottom:12 }}>
                    🏢 Companies & Freelancers
                    <span style={{ marginLeft:8, background:G.goldDim, color:G.gold, border:`1px solid ${G.goldBorder}`, borderRadius:10, padding:'1px 8px', fontSize:11, fontWeight:700 }}>{pendingFirms.length}</span>
                  </div>
                )}
                {pendingFirms.length === 0 && pendingPartners.length === 0 && (
                  <div style={{ textAlign:'center', padding:'48px 20px', color:G.muted }}>
                    <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
                    No pending profiles.
                  </div>
                )}
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {pendingFirms.map(renderProfileRow)}
                </div>
              </div>
            )}
          </div>
        )
      })()}

      {/* ── TAB: ALL PROFILES ─────────────────────────────────────────────── */}
      {tab === 'profiles' && (
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: G.muted, marginBottom: 16 }}>
            All profiles — verified (live) and unverified. Use ✏️ to edit, ✓/✕ to toggle visibility.
          </p>
          {loadingP && <div style={{ color: G.muted, padding: 20 }}>Loading…</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!loadingP && allProfiles.map(renderProfileRow)}
          </div>
        </div>
      )}

      {/* ── TAB: CHANGE REQUESTS ──────────────────────────────────────────── */}
      {tab === 'pending_changes' && (
        <div>
          <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: G.muted, marginBottom: 16 }}>
            Profile change requests from owners. Code was verified by the owner. Review the diff and approve or reject.
          </p>
          {loadingC && <div style={{ color: G.muted, padding: 20 }}>Loading…</div>}
          {!loadingC && pending.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: G.muted }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              No pending change requests.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!loadingC && pending.map(chg => (
              <div key={chg.id} style={{ background: G.surface, border: `1px solid ${G.goldBorder}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: `1px solid ${G.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{chg.profileName || chg.profile_name}</div>
                    <div style={{ fontSize: 11, color: G.muted, marginTop: 3 }}>
                      Submitted: {new Date(chg.created_at || chg.submittedAt).toLocaleDateString()}
                      {' · '}Submitter: {chg.submitter_email || chg.submitterEmail}
                    </div>
                  </div>
                  {(chg.codeVerified || chg.code_verified) && (
                    <span style={{ fontSize: 11, background: 'rgba(61,111,168,0.1)', color: G.teal, border: '1px solid rgba(61,111,168,0.25)', borderRadius: 5, padding: '3px 9px', fontWeight: 600 }}>🔐 Code verified</span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                  <div style={{ padding: '16px 20px', borderRight: `1px solid ${G.border}` }}>
                    <div style={{ fontSize: 11, color: G.muted, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 Current</div>
                    {chg.original?.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {chg.original.tags.map(t2 => <span key={t2} className="tag">{t2}</span>)}
                      </div>
                    )}
                    {chg.original?.desc && <p style={{ fontSize: 12, color: G.muted, lineHeight: 1.6 }}>{chg.original.desc.en || chg.original.desc.de}</p>}
                  </div>
                  <div style={{ padding: '16px 20px', background: 'rgba(61,111,168,0.03)' }}>
                    <div style={{ fontSize: 11, color: G.teal, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✏️ Requested changes</div>
                    {chg.changes?.email && (
                      <div style={{ marginBottom: 10, background: 'rgba(61,111,168,0.08)', border: '1px solid rgba(61,111,168,0.25)', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: G.teal, fontWeight: 700, marginBottom: 3, textTransform:'uppercase', letterSpacing:'0.5px' }}>📧 Email change request</div>
                        <div style={{ fontSize: 12, color: G.text }}><span style={{ color: G.muted }}>From:</span> {chg.original?.email || chg.original?.contact || '—'}</div>
                        <div style={{ fontSize: 12, color: G.teal, fontWeight: 600 }}><span style={{ color: G.muted }}>To:</span> {chg.changes.email}</div>
                      </div>
                    )}
                    {chg.changes?.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {chg.changes.tags.map(t2 => {
                          const isNew = !chg.original?.tags?.includes(t2)
                          return <span key={t2} style={{ fontSize: 11, background: isNew ? 'rgba(61,111,168,0.15)' : 'rgba(74,127,165,0.08)', color: isNew ? G.teal : '#8eb4d4', border: `1px solid ${isNew ? 'rgba(61,111,168,0.35)' : 'rgba(74,127,165,0.15)'}`, borderRadius: 4, padding: '2px 7px', fontWeight: isNew ? 700 : 400 }}>{isNew ? '+ ' : ''}{t2}</span>
                        })}
                        {chg.original?.tags?.filter(t2 => !chg.changes.tags.includes(t2)).map(t2 => (
                          <span key={t2} style={{ fontSize: 11, background: 'rgba(255,59,48,0.1)', color: G.red, border: '1px solid rgba(255,59,48,0.25)', borderRadius: 4, padding: '2px 7px', textDecoration: 'line-through' }}>{t2}</span>
                        ))}
                      </div>
                    )}
                    {chg.changes?.name && chg.changes.name !== chg.original?.name && (
                      <div style={{ fontSize: 12, color: G.muted, marginBottom: 6 }}><b style={{color:G.text}}>Name:</b> {chg.changes.name}</div>
                    )}
                    {chg.changes?.city && chg.changes.city !== chg.original?.city && (
                      <div style={{ fontSize: 12, color: G.muted, marginBottom: 6 }}><b style={{color:G.text}}>City:</b> {chg.changes.city}</div>
                    )}
                    {chg.changes?.website && <div style={{ fontSize: 12, color: G.muted, marginBottom: 6 }}><b style={{color:G.text}}>Website:</b> {chg.changes.website}</div>}
                    {chg.changes?.desc && <p style={{ fontSize: 12, color: 'rgba(228,221,208,0.80)', lineHeight: 1.6 }}>{chg.changes.desc.en || chg.changes.desc.de}</p>}
                  </div>
                </div>
                <div style={{ padding: '14px 20px', borderTop: `1px solid ${G.border}`, display: 'flex', gap: 10 }}>
                  <button className="btn gbtn" style={{ flex: 1, padding: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }} onClick={() => handleApprovePending(chg)} disabled={saving}>
                    {saving ? <><div style={{ width: 11, height: 11, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: G.bg, borderRadius: '50%' }} className="sp" />Saving…</> : '✓ Approve → Go live'}
                  </button>
                  <button className="btn ghost" style={{ color: G.red, borderColor: 'rgba(255,59,48,0.3)', padding: '9px 18px' }} onClick={() => handleRejectPending(chg.id)}>✕ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: PARTNERS ────────────────────────────────────────────────── */}
      {tab === 'partners' && (
        <AdminPartnersTab profiles={profiles} setProfiles={setProfiles} G={G}
          partners={partners} setPartners={setPartners} savePartners={savePartners}
          concierge={concierge} setConcierge={setConcierge} saveConcierge={saveConcierge}
          saving={saving} settingsSaved={settingsSaved} />
      )}

      {/* ── TAB: GOVERNMENT PAGE ──────────────────────────────────────────── */}
      {tab === 'government' && (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:17 }}>🏛️ Government Page Editor</div>
            <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>Edit all text and links on the Government page. Blank fields use the default translated text.</div>
          </div>

          {/* Hero section */}
          <div style={{ background:G.surface, border:`1px solid ${G.goldBorder}`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:14, color:G.gold, marginBottom:14 }}>Hero Section</div>
            <div style={{ marginBottom:10 }}><label className="flabel">Badge text (e.g. "🏛️ For Investors & Governments")</label><input className="inp" value={govContent.badge||''} onChange={e=>setGovContent(g=>({...g,badge:e.target.value}))} placeholder="Leave blank for default" /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label className="flabel">Headline line 1</label><input className="inp" value={govContent.heroTitle||''} onChange={e=>setGovContent(g=>({...g,heroTitle:e.target.value}))} placeholder="Leave blank for default" /></div>
              <div><label className="flabel">Headline line 2 (gold)</label><input className="inp" value={govContent.heroTitle2||''} onChange={e=>setGovContent(g=>({...g,heroTitle2:e.target.value}))} placeholder="Leave blank for default" /></div>
            </div>
            <div><label className="flabel">Subtitle / description</label><textarea className="inp" rows={2} style={{resize:'vertical'}} value={govContent.heroSub||''} onChange={e=>setGovContent(g=>({...g,heroSub:e.target.value}))} placeholder="Leave blank for default" /></div>
          </div>

          {/* Facts section */}
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:14, marginBottom:14 }}>Facts Box Heading</div>
            <div><label className="flabel">Section heading</label><input className="inp" value={govContent.factsHeading||''} onChange={e=>setGovContent(g=>({...g,factsHeading:e.target.value}))} placeholder="Leave blank for default" /></div>
          </div>

          {/* Buttons */}
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:14, marginBottom:4 }}>Action Buttons</div>
            <div style={{ fontSize:12, color:G.muted, marginBottom:14 }}>Edit the links and labels shown at the bottom of the Government page.</div>
            {(govContent.buttons||[]).map((btn, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 2fr auto auto', gap:8, marginBottom:9, alignItems:'center' }}>
                <select className="inp" style={{fontSize:11}} value={btn.style||'ghost'} onChange={e=>{ const b=[...govContent.buttons]; b[i]={...b[i],style:e.target.value}; setGovContent(g=>({...g,buttons:b})) }}>
                  <option value="primary">Primary (gold)</option>
                  <option value="ghost">Ghost</option>
                </select>
                <input className="inp" style={{fontSize:12}} placeholder="Label text" value={btn.label||''} onChange={e=>{ const b=[...govContent.buttons]; b[i]={...b[i],label:e.target.value}; setGovContent(g=>({...g,buttons:b})) }} />
                <input className="inp" style={{fontSize:12,flex:1}} placeholder="https://..." value={btn.url||''} onChange={e=>{ const b=[...govContent.buttons]; b[i]={...b[i],url:e.target.value}; setGovContent(g=>({...g,buttons:b})) }} />
                <button className="btn" style={{fontSize:11,padding:'6px 10px',background:'rgba(255,59,48,0.08)',color:G.red,border:'1px solid rgba(255,59,48,0.2)',borderRadius:6}} onClick={()=>{ const b=govContent.buttons.filter((_,j)=>j!==i); setGovContent(g=>({...g,buttons:b})) }}>✕</button>
              </div>
            ))}
            <button className="btn ghost" style={{fontSize:12,padding:'6px 14px',marginTop:4}} onClick={()=>setGovContent(g=>({...g,buttons:[...(g.buttons||[]),{label:'',url:'',style:'ghost'}]}))}>+ Add button</button>
          </div>

          {settingsSaved==='gov' && <div style={{ fontSize:12, color:G.green, background:'rgba(52,199,89,0.08)', border:'1px solid rgba(52,199,89,0.2)', borderRadius:8, padding:'8px 14px' }}>✓ Government page saved</div>}
          <button className="btn gbtn" style={{ alignSelf:'flex-start', padding:'10px 24px' }} onClick={saveGov} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save Government Page'}
          </button>
        </div>
      )}

      {/* ── TAB: SETTINGS ─────────────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Change password */}
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '22px 24px' }}>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>🔐 Change password</div>
            <div style={{ marginBottom: 10 }}><label className="flabel">New password (min. 8 chars)</label><input className="inp" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} /></div>
            <div style={{ marginBottom: 16 }}><label className="flabel">Confirm new password</label><input className="inp" type="password" value={newPwConfirm} onChange={e => setNewPwConfirm(e.target.value)} /></div>
            {pwChanged && <div style={{ fontSize: 12, color: G.green, marginBottom: 10 }}>✓ Password changed for this session</div>}
            <div style={{ fontSize: 11, color: G.muted, marginBottom: 12 }}>⚠️ This only changes the password for the current session. For permanent change, update ADMIN_PASSWORD in App.jsx before deploying.</div>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={changePassword}>Change password</button>
          </div>

          {/* Notification email */}
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '22px 24px' }}>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>📧 Notification email</div>
            <div style={{ marginBottom: 10 }}><label className="flabel">Your email (for new profile alerts)</label><input className="inp" type="email" value={notifEmail} onChange={e => setNotifEmail(e.target.value)} placeholder="admin@bbplatform.com" /></div>
            {notifSaved && <div style={{ fontSize: 12, color: G.green, marginBottom: 10 }}>✓ Saved locally</div>}
            <div style={{ fontSize: 11, color: G.muted, marginBottom: 12 }}>
              For full email notifications (new registrations, change requests), set up a Supabase Database Webhook:
              <br />Supabase → Database → Webhooks → New webhook on <code>profiles</code> INSERT.
            </div>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={saveAdminEmail}>Save email</button>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL — modern card layout ───────────────────────────── */}
      {editProfile && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e => e.target===e.currentTarget && setEditProfile(null)}>
          <div style={{ background:'#0a1828', border:`1px solid ${G.goldBorder}`, borderRadius:20, width:'100%', maxWidth:680, maxHeight:'92vh', overflowY:'auto', display:'flex', flexDirection:'column' }}>

            {/* Modal header */}
            <div style={{ padding:'22px 28px 18px', borderBottom:`1px solid ${G.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#0a1828', zIndex:1 }}>
              <div>
                <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:20 }}>✏️ Edit Profile</div>
                <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>{editProfile.name} · Changes go live immediately</div>
              </div>
              <button onClick={() => setEditProfile(null)} className="btn ghost" style={{ padding:'6px 12px', fontSize:15 }}>✕</button>
            </div>

            <div style={{ padding:'22px 28px', display:'flex', flexDirection:'column', gap:20 }}>

              {/* ── Basic Info ── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div><label className="flabel">Name *</label><input className="inp" value={editForm.name||''} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} /></div>
                <div><label className="flabel">City *</label><input className="inp" value={editForm.city||''} onChange={e=>setEditForm(f=>({...f,city:e.target.value}))} /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div><label className="flabel">Email *</label><input className="inp" value={editForm.contact||''} onChange={e=>setEditForm(f=>({...f,contact:e.target.value}))} /></div>
                <div><label className="flabel">Phone</label><input className="inp" value={editForm.phone||''} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div><label className="flabel">Website</label><input className="inp" value={editForm.website||''} onChange={e=>setEditForm(f=>({...f,website:e.target.value}))} placeholder="company.com" /></div>
                <div><label className="flabel">Employees</label><input className="inp" value={editForm.employees||''} onChange={e=>setEditForm(f=>({...f,employees:e.target.value}))} placeholder="15–30" /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div><label className="flabel">Languages</label><input className="inp" value={editForm.languages||''} onChange={e=>setEditForm(f=>({...f,languages:e.target.value}))} placeholder="DE, EN, SQ" /></div>
                <div><label className="flabel">Experience (years)</label><input className="inp" value={editForm.experience||''} onChange={e=>setEditForm(f=>({...f,experience:e.target.value}))} placeholder="e.g. 7 years" /></div>
              </div>

              {/* ── Logo upload + color ── */}
              <div style={{ marginBottom:12 }}>
                <label className="flabel">Logo</label>
                <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginTop:6 }}>
                  <div style={{ width:48, height:48, borderRadius:10, overflow:'hidden', flexShrink:0, border:`2px solid ${editForm.logoColor||'#4a7fa5'}44`, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${editForm.logoColor||'#4a7fa5'}20,${editForm.logoColor||'#4a7fa5'}46)` }}>
                    {editForm.logoDataPreview
                      ? <img src={editForm.logoDataPreview} alt="logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <span style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:14, color:editForm.logoColor||'#4a7fa5' }}>{(editForm.name||'??').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(180,160,100,0.12)', borderRadius:7, cursor:'pointer', fontSize:11, color:'rgba(228,221,208,0.80)', marginBottom:7 }}>
                      📷 Upload new logo
                      <input type="file" accept="image/*" style={{ display:'none' }} onChange={e => {
                        const file = e.target.files?.[0]; if(!file) return
                        const img = new Image(); const url = URL.createObjectURL(file)
                        img.onload = () => { const S=88; const c=document.createElement('canvas'); c.width=S; c.height=S; const ctx=c.getContext('2d'); const side=Math.min(img.width,img.height); ctx.drawImage(img,(img.width-side)/2,(img.height-side)/2,side,side,0,0,S,S); URL.revokeObjectURL(url); setEditForm(f=>({...f,logoDataPreview:c.toDataURL('image/webp',0.82)})) }
                        img.src = url
                      }} />
                    </label>
                    {editForm.logoDataPreview && <button onClick={()=>setEditForm(f=>({...f,logoDataPreview:null}))} className="btn ghost" style={{ fontSize:10, padding:'3px 8px', marginBottom:7, display:'block' }}>✕ Remove photo</button>}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {['#4a7fa5','#5a8a6e','#8a7070','#c9943a','#6b7fa8','#8a7a4a','#3d7fa8','#4a7a6e','#7a5a5a','#c9a44a'].map(col => {
                        const isSel = (editForm.logoColor||'#4a7fa5') === col
                        return <button key={col} onClick={()=>setEditForm(f=>({...f,logoColor:col,logoDataPreview:null}))} style={{ width:22, height:22, borderRadius:'50%', background:col, border:`2px solid ${isSel?'#fff':'transparent'}`, cursor:'pointer', boxShadow: isSel?`0 0 0 2px ${col}`:'none' }} />
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Tags + Tier + Type + Cat ── */}
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12, marginBottom:12 }}>
                <div><label className="flabel">Tags / Skills (comma separated)</label><input className="inp" value={editForm.tags||''} onChange={e=>setEditForm(f=>({...f,tags:e.target.value}))} placeholder="React, Node.js, TypeScript…" /></div>
                <div><label className="flabel">Tier</label>
                  <select className="inp" value={editForm.tier||'free'} onChange={e=>setEditForm(f=>({...f,tier:e.target.value}))}>
                    <option value="free">🆓 Free</option>
                    <option value="sponsored">🚀 Sponsored</option>
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div><label className="flabel">Type</label>
                  <select className="inp" value={editForm.type||'company'} onChange={e=>setEditForm(f=>({...f,type:e.target.value}))}>
                    <option value="company">🏢 Company</option>
                    <option value="freelancer">👤 Freelancer</option>
                    <option value="partner">🤝 Partner</option>
                  </select>
                </div>
                <div><label className="flabel">Category</label>
                  <select className="inp" value={editForm.cat||'software'} onChange={e=>setEditForm(f=>({...f,cat:e.target.value}))}>
                    {CATS.map(cat=><option key={cat.id} value={cat.id}>{cat.icon} {cat.labels.en}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Description (shared for all languages) ── */}
              <div style={{ marginBottom:12 }}>
                <label className="flabel">Description <span style={{fontWeight:400,textTransform:'none',fontSize:10,color:G.muted}}>(used for all languages)</span></label>
                <textarea className="inp" rows={3} style={{resize:'vertical'}} value={editForm.desc_en||''} onChange={e=>setEditForm(f=>({...f,desc_en:e.target.value,desc_sq:e.target.value}))} placeholder="Short description of the offer…" />
              </div>

              {/* ── Cover image (for sponsored, partner, general partner) ── */}
              {(editForm.tier === 'sponsored' || editForm.type === 'partner') && (
                <div style={{ marginBottom:12, padding:'14px', background:'rgba(251,146,60,0.04)', border:'1px solid rgba(251,146,60,0.18)', borderRadius:10 }}>
                  <label className="flabel" style={{color:'rgba(251,146,60,0.6)'}}>Cover / Banner Image</label>
                  <div style={{ display:'flex', gap:10, alignItems:'center', marginTop:8 }}>
                    {editForm.coverImage && (
                      <div style={{ width:120, height:56, borderRadius:8, overflow:'hidden', flexShrink:0, border:'1px solid rgba(251,146,60,0.3)' }}>
                        <img src={editForm.coverImage} alt="cover" style={{width:'100%',height:'100%',objectFit:'cover', objectPosition: editForm.coverFocus || '50% 50%'}} />
                      </div>
                    )}
                    <div style={{ flex:1 }}>
                      <label style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(180,160,100,0.12)', borderRadius:7, cursor:'pointer', fontSize:11, color:G.text, marginBottom:6 }}>
                        🖼 Upload cover image
                        <input type="file" accept="image/*" style={{display:'none'}} onChange={e=>{
                          const file=e.target.files?.[0]; if(!file) return
                          const img=new Image(), url=URL.createObjectURL(file)
                          img.onload=()=>{ const W=800,H=240,c=document.createElement('canvas'); c.width=W; c.height=H; const ctx=c.getContext('2d'); const scale=Math.max(W/img.width,H/img.height); const sw=W/scale,sh=H/scale; ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,W,H); URL.revokeObjectURL(url); setEditForm(f=>({...f,coverImage:c.toDataURL('image/webp',0.88),coverFocus:'50% 50%'})) }
                          img.src=url
                        }} />
                      </label>
                      {editForm.coverImage && <button onClick={()=>setEditForm(f=>({...f,coverImage:null,coverFocus:null}))} className="btn ghost" style={{fontSize:10,padding:'3px 8px',display:'block'}}>✕ Remove</button>}
                  <div style={{ fontSize:10, color:'rgba(251,146,60,0.45)', lineHeight:1.5, marginTop:4, fontStyle:'italic' }}>
                    💡 Best: landscape image, 3:1 ratio (e.g. 900×300px). Avoid text near edges — only the center shows.
                  </div>
                    </div>
                  </div>
                  <CoverCropPicker image={editForm.coverImage} onApply={cropped=>setEditForm(f=>({...f,coverImage:cropped}))} accentColor="#c9943a" />
                </div>
              )}

              {/* ── Sponsored premium fields (only when tier = sponsored) ── */}
              {editForm.tier === 'sponsored' && (
                <div style={{ background:'linear-gradient(135deg,rgba(251,146,60,0.06),rgba(251,146,60,0.02))', border:'1px solid rgba(251,146,60,0.22)', borderRadius:12, padding:'16px', marginBottom:12 }}>
                  <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:13, color:G.orange, marginBottom:14, display:'flex', alignItems:'center', gap:7 }}>
                    🚀 Sponsored Premium Fields
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <label className="flabel" style={{color:'rgba(251,146,60,0.55)'}}>Previous companies / clients</label>
                    <input className="inp" style={{borderColor:'rgba(251,146,60,0.2)'}} value={editForm.prevCompanies||''} onChange={e=>setEditForm(f=>({...f,prevCompanies:e.target.value}))} placeholder="BMW, Deloitte, SAP…" />
                  </div>
                  <div style={{ marginBottom:10 }}>
                    <label className="flabel" style={{color:'rgba(251,146,60,0.55)'}}>Featured project / portfolio</label>
                    <input className="inp" style={{borderColor:'rgba(251,146,60,0.2)'}} value={editForm.featuredProject||''} onChange={e=>setEditForm(f=>({...f,featuredProject:e.target.value}))} placeholder="Project title and short description" />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <div>
                      <label className="flabel" style={{color:'rgba(251,146,60,0.55)'}}>LinkedIn URL</label>
                      <input className="inp" style={{borderColor:'rgba(251,146,60,0.2)'}} value={editForm.linkedin||''} onChange={e=>setEditForm(f=>({...f,linkedin:e.target.value}))} placeholder="linkedin.com/in/…" />
                    </div>
                    <div>
                      <label className="flabel" style={{color:'rgba(251,146,60,0.55)'}}>GitHub / Portfolio URL</label>
                      <input className="inp" style={{borderColor:'rgba(251,146,60,0.2)'}} value={editForm.github||''} onChange={e=>setEditForm(f=>({...f,github:e.target.value}))} placeholder="github.com/…" />
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                    <div>
                      <label className="flabel" style={{color:'rgba(251,146,60,0.55)'}}>Certifications / Awards</label>
                      <input className="inp" style={{borderColor:'rgba(251,146,60,0.2)'}} value={editForm.certifications||''} onChange={e=>setEditForm(f=>({...f,certifications:e.target.value}))} placeholder="AWS Certified, ISO 9001…" />
                    </div>
                    <div>
                      <label className="flabel" style={{color:'rgba(251,146,60,0.55)'}}>Availability</label>
                      <select className="inp" style={{borderColor:'rgba(251,146,60,0.2)'}} value={editForm.availability||''} onChange={e=>setEditForm(f=>({...f,availability:e.target.value}))}>
                        <option value="">Select…</option>
                        <option value="available">🟢 Available now</option>
                        <option value="limited">🟡 Limited capacity</option>
                        <option value="booked">🔴 Currently booked</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom:4 }}>
                    <label className="flabel" style={{color:'rgba(251,146,60,0.55)'}}>Video intro URL</label>
                    <input className="inp" style={{borderColor:'rgba(251,146,60,0.2)'}} value={editForm.videoUrl||''} onChange={e=>setEditForm(f=>({...f,videoUrl:e.target.value}))} placeholder="youtube.com/…" />
                  </div>
                </div>
              )}
              </div>

            {/* Sticky footer */}
            <div style={{ padding:'16px 28px', borderTop:`1px solid ${G.border}`, display:'flex', gap:12, position:'sticky', bottom:0, background:'#0a1828' }}>
              <button className="btn gbtn" style={{ flex:1, padding:'12px', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={saveEdit} disabled={saving}>
                {saving ? <><div style={{width:13,height:13,border:'2px solid rgba(0,0,0,0.25)',borderTopColor:G.bg,borderRadius:'50%'}} className="sp" />Saving…</> : '💾 Save changes'}
              </button>
              <button className="btn ghost" style={{ padding:'12px 22px' }} onClick={() => setEditProfile(null)} disabled={saving}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
      
  )
}
      
// ─── ROOT APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState(() => {
    // Auto-detect from browser locale
    // de-DE / de-AT / de-CH → de
    // sv-SE / sv             → sv
    // everything else        → en
    const loc = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase()
    if (loc.startsWith('sq') || loc === 'ks') return 'sq'
    return 'en'
  })
  const [page, setPage] = useState('home')
  const [searchQ, setSearchQ] = useState('')
  const [dirCat, setDirCat] = useState('all')
  const [profileDetail, setProfileDetail] = useState(null)
  const [mobileNav, setMobileNav] = useState(false)
  const [showReg, setShowReg] = useState(false)
  const [regType, setRegType] = useState(null)
  const [regDone, setRegDone] = useState(false)

  const [homeStats, setHomeStats] = React.useState({ companies: 0, freelancers: 0, partners: 2, total: 0 })
  const [siteContent, setSiteContent] = useState({})

  // Pre-load verified profiles + site content
  useEffect(() => {
    fetchProfiles().then(data => {
      const normed = data.map(normaliseProfile)
      if (normed.length > 0) {
        window.__techgateProfiles = normed
        setHomeStats({
          companies:   normed.filter(p => p.type === 'company').length,
          freelancers: normed.filter(p => p.type === 'freelancer').length,
          partners:    2 + normed.filter(p => p.type === 'partner').length,
          total:       normed.length,
        })
      }
    }).catch(() => {})
    // Load editable site content
    fetchSiteContent().then(content => {
      if (content && typeof content === 'object' && Object.keys(content).length > 0) {
        setSiteContent(content)
        window.__siteContent = content
      }
    }).catch(err => {
      console.warn('Site content load failed (table may not exist yet):', err?.message)
    })
  }, [])
  const [showAdmin, setShowAdmin] = useState(
    // Secret admin URL: add ?admin to the URL
    typeof window !== 'undefined' && window.location.search.includes('admin')
  )

  const t = T[lang]
  const FLAGS = { en: '🇬🇧', sq: '🇽🇰' }

  // Show admin panel if triggered
  if (showAdmin) return <AdminPage lang={lang} onExit={() => setShowAdmin(false)} siteContent={siteContent} onContentSave={(key, val) => { saveSiteContent(key, val); setSiteContent(prev => ({...prev, [key]: val})); window.__siteContent = {...(window.__siteContent||{}), [key]: val} }} />

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: G.bg, minHeight: '100vh', color: G.text }}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(5,13,27,0.94)', backdropFilter: 'blur(18px)', borderBottom: `1px solid ${G.border}`, padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setPage('home')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', padding: 0 }}>
          <div style={{ width: 40, height: 27, borderRadius: 4, overflow: 'hidden', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.5)', border: '1px solid rgba(180,160,100,0.10)' }}>
            <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAOTBQADASIAAhEBAxEB/8QAHQABAAICAwEBAAAAAAAAAAAAAAcIBQYDBAkBAv/EAE0QAQABAwIBBwcIBwYFBAEFAAABAgMEBREGBxIWITFB0RNRVGFxgaMIFBUiMmKRoUJSVoKUorEXI0NywdIYM1VjkiRT4fCyJTVzwvH/xAAcAQEAAgMBAQEAAAAAAAAAAAAABQYDBAcCAQj/xAA5EQEAAQIDBQYEBQUAAgMBAAAAAQIDBAUREhMhMVIGFEFRYZFxgaHRIjKxwfAHFRZC4SNTM3Lxkv/aAAwDAQACEQMRAD8AicB1NVQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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" alt="Kosovo flag" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 14, color: G.text, whiteSpace:'nowrap' }}>Kosova <span style={{ color: G.gold }}>Business Hub</span></div>
            <div style={{ fontSize: 9, color: G.muted, letterSpacing: '0.7px', textTransform: 'uppercase' }}>{t.tagline}</div>
          </div>
        </button>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Desktop nav links */}
          <div className="nav-links" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {[['home', t.navHome], ['directory', t.navDir], ['concierge', t.navConcierge], ['gov', t.navGov]].map(([p, l]) => (
              <button key={p} className={`btn navl${page === p ? ' on' : ''}`} onClick={() => setPage(p)}
                style={p === 'concierge' ? { color: page === 'concierge' ? '#c9a44a' : 'rgba(228,221,208,0.88)' } : {}}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 18, background: G.border, margin: '0 6px' }} />
          <div className="nav-lang" style={{ display: 'flex', gap: 2, background: `rgba(255,255,255,0.04)`, border: `1px solid ${G.border}`, borderRadius: 8, padding: 3 }}>
            {['en', 'sq'].map(l => (
              <button key={l} onClick={() => setLang(l)} className="btn" style={{ padding: '4px 9px', fontSize: 11, fontWeight: 700, background: lang === l ? 'rgba(201,164,74,0.18)' : 'transparent', color: lang === l ? G.gold : G.muted, border: `1px solid ${lang === l ? G.goldBorder : 'transparent'}`, borderRadius: 6 }}>
                {FLAGS[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button style={{ marginLeft: 12, padding: '8px 18px', fontSize: 11, fontFamily:"'Raleway',sans-serif", fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', background: 'transparent', border: '1.5px solid #c9a44a', borderRadius: 6, color: '#c9a44a', cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap' }}
            onClick={() => setShowReg(true)}
            onMouseEnter={e => { e.currentTarget.style.background = '#c9a44a'; e.currentTarget.style.color = '#050d1b' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c9a44a' }}>
            {t.registerBtn}
          </button>
          <button className="hamburger" onClick={() => setMobileNav(v => !v)} style={{ display:'none', flexDirection:'column', gap:5, background:'transparent', border:'none', cursor:'pointer', padding:8, marginLeft:4 }}>
            <span style={{ display:'block', width:22, height:2, background:'rgba(228,221,208,0.70)', borderRadius:1, transition:'all 0.2s', transform: mobileNav ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <span style={{ display:'block', width:22, height:2, background:'rgba(228,221,208,0.70)', borderRadius:1, transition:'all 0.2s', opacity: mobileNav ? 0 : 1 }} />
            <span style={{ display:'block', width:22, height:2, background:'rgba(228,221,208,0.70)', borderRadius:1, transition:'all 0.2s', transform: mobileNav ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        </div>
      </nav>
      {mobileNav && (
        <div style={{ position:'fixed', top:64, left:0, right:0, background:'#0a1828', borderBottom:'2px solid rgba(180,160,100,0.14)', zIndex:99, padding:'12px 16px 20px', display:'flex', flexDirection:'column', gap:4, boxShadow:'0 8px 24px rgba(180,160,100,0.12)' }}>
          {[['home',t.navHome,'🏠'],['directory',t.navDir,'🏢'],['concierge',t.navConcierge,'🤝'],['gov',t.navGov,'🏛️']].map(([pg,l,ic]) => (
            <button key={pg} onClick={() => { setPage(pg); setMobileNav(false) }}
              style={{ background: page===pg?'rgba(138,100,16,0.10)':'transparent', color: page===pg?'#8a6410':'rgba(228,221,208,0.80)', border:'none', padding:'12px 14px', borderRadius:10, cursor:'pointer', textAlign:'left', fontFamily:"'Raleway',sans-serif", fontSize:14, fontWeight:600, letterSpacing:'0.4px', textTransform:'uppercase', display:'flex', alignItems:'center', gap:10, width:'100%' }}>
              <span>{ic}</span>{l}
            </button>
          ))}
          <div style={{ borderTop:'1px solid rgba(180,160,100,0.14)', marginTop:8, paddingTop:12, display:'flex', gap:6 }}>
            {['en','sq'].map(l => (
              <button key={l} onClick={() => { setLang(l) }}
                style={{ flex:1, padding:'8px 4px', borderRadius:8, background: lang===l?'rgba(138,100,16,0.12)':'rgba(255,255,255,0.04)', color: lang===l?'#8a6410':'rgba(228,221,208,0.55)', border:'1px solid '+(lang===l?'rgba(201,164,74,0.28)':'rgba(255,255,255,0.10)'), cursor:'pointer', fontWeight:700, fontSize:12 }}>
                {FLAGS[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="btn gbtn" style={{ marginTop:8, width:'100%' }} onClick={() => { setShowReg(true); setMobileNav(false) }}>{t.registerBtn}</button>
        </div>
      )}

            {/* ── PAGES ── */}
      {page === 'home' && (
        <>
      <VideoBackground src="/bg-video-home.mp4" />

          <section style={{ padding: '88px 48px 64px', textAlign: 'center', position: 'relative', overflow: 'visible', background: 'transparent', zIndex: 1 }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
            <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'60%', height:1, background:'linear-gradient(90deg,transparent,rgba(201,164,74,0.28),transparent)' }} />
            <div className="fu" style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 100, padding: '6px 18px', marginBottom: 26 }}>
                <span style={{ width: 7, height: 7, background: G.green, borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 8px ${G.green}` }} />
                <span style={{ fontSize: 12, color: G.gold, fontFamily: "'Inter',sans-serif", fontWeight: 600, letterSpacing:'0.1px' }}>
                  {(window.__techgateProfiles||[]).filter(p => p.verified !== false && p.type !== 'partner').length > 0
                    ? `${(window.__techgateProfiles||[]).filter(p => p.verified !== false && p.type !== 'partner').length} ${lang==='sq' ? 'Regjistrimet e Verifikuara · Live' : 'Verified Listings · Live'}`
                    : (lang==='sq' ? 'Platforma e Biznesit Kosova · Live' : 'Global B2B Network · Live')
                  }
                </span>
              </div>
              <h1 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,5.2vw,60px)', letterSpacing: '-1.8px', lineHeight: 1.06, marginBottom: 20 }}>
                {t.h1a}<br /><span style={{ color: G.gold }}>{t.h1b}</span>
              </h1>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 17, color: G.muted, lineHeight: 1.8, fontWeight: 300, maxWidth: 540, margin: '0 auto 36px' }}>{t.heroSub}</p>
              <div style={{ display: 'flex', gap: 7, maxWidth: 560, margin: '0 auto 36px', background: 'rgba(255,255,255,0.045)', border: `1px solid ${G.goldBorder}`, borderRadius: 14, padding: 6, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                <input className="inp" style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 15 }} placeholder={t.searchPH}
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setPage('directory') } }} />
                <button className="btn gbtn" style={{ flexShrink: 0, borderRadius: 9 }} onClick={() => setPage('directory')}>{t.searchBtn} →</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 36, flexWrap: 'wrap', marginBottom: 24 }}>
                {[[String(homeStats.companies||0), t.stat1], [String(homeStats.freelancers||0), t.stat2], [String(homeStats.partners||0), t.stat3], ['10%', t.stat4]].map(([n, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 24, color: G.gold }}>{n}</div>
                    <div style={{ fontSize: 11, color: G.muted, marginTop: 2, letterSpacing:'0.1px' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
                {[lang==='sq'?'🌐 E dukshme gjithandej':'🌐 Visible Worldwide', lang==='sq'?'✓ Regjistrimet e verifikuara':'✓ Verified Listings', lang==='sq'?'🤝 Rrjet Global B2B':'🤝 Global B2B Network'].map(tag => (
                  <span key={tag} style={{ fontSize:11, color:'rgba(228,221,208,0.40)', background:'#0a1828', border:'1px solid rgba(180,160,100,0.14)', borderRadius:20, padding:'4px 14px', fontFamily:"'Inter',sans-serif" }}>{tag}</span>
                ))}
              </div>
            </div>
          </section>
          {/* ── HOW IT WORKS ── */}
          <section style={{ padding: '44px 48px 0', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 14 }}>{t.howTitle}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 40 }}>
              {[
                [G.blue,  '🔍', t.f1t, t.f1d, 'directory'],
                [G.gold,  '🤝', t.f2t, t.f2d, 'concierge#partners'],
                [G.teal,  '✈️', t.f3t, t.f3d, 'concierge'],
              ].map(([col, ic, title, desc, pg]) => (
                <div key={pg} className="fu" style={{ padding: '18px 16px', cursor: 'pointer', borderRadius: 14, position:'relative', overflow:'hidden',
                  background: col === G.teal ? 'rgba(61,111,168,0.04)' : col === G.gold ? 'rgba(201,164,74,0.04)' : 'rgba(74,127,165,0.04)',
                  border: `1px solid ${col === G.teal ? 'rgba(61,111,168,0.2)' : col === G.gold ? 'rgba(201,164,74,0.2)' : 'rgba(74,127,165,0.2)'}`,
                  transition: 'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 8px 24px ${col}18`}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}
                  onClick={() => {
                    if (pg === 'concierge#partners') { setPage('concierge'); setTimeout(() => { const el = document.getElementById('concierge-partners'); if(el) el.scrollIntoView({behavior:'smooth'}) }, 120) }
                    else setPage(pg)
                  }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${col}90,transparent)` }} />
                  <div style={{ fontSize: 22, marginBottom: 9 }}>{ic}</div>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 13, color: col, marginBottom: 5, lineHeight:1.3 }}>{title}</div>
                  <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: G.muted, lineHeight: 1.65, margin:0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 1. SPONSORED LISTINGS — premium cards with cover image ── */}
          {(() => {
            const sponsored = (window.__techgateProfiles||[]).filter(p => p.tier === 'sponsored' && p.verified !== false && p.type !== 'partner')
            if (sponsored.length === 0) return null
            return (
              <section style={{ padding: '0 48px 52px', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <h2 className="top-listings-title" style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:'clamp(15px,4vw,20px)', margin:0 }}>{t.topTitle}</h2>
                    <span style={{ fontSize:10, background:'rgba(251,146,60,0.14)', color:G.orange, border:'1px solid rgba(251,146,60,0.35)', borderRadius:20, padding:'3px 11px', fontWeight:800, letterSpacing:'0.1px' }}>🚀 SPONSORED</span>
                  </div>
                  <button className="btn ghost" style={{ fontSize:12 }} onClick={() => setPage('directory')}>{t.viewAll}</button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:18 }}>
                  {sponsored.slice(0,6).map(p => {
                    const sColor = CATS.find(c => c.id === p.cat)?.color || p.logoColor || '#c9a44a'
                    return (
                    <div key={p.id} style={{
                      borderRadius:20, overflow:'hidden', position:'relative', cursor:'pointer',
                      background: hexToRgba(sColor, 0.05),
                      border: `1px solid ${hexToRgba(sColor, 0.28)}`,
                      boxShadow:'0 6px 32px rgba(0,0,0,0.28)',
                      transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                    }}
                      onClick={() => setProfileDetail(p)}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-5px)';e.currentTarget.style.background=hexToRgba(sColor,0.09);e.currentTarget.style.boxShadow=`0 18px 52px rgba(0,0,0,0.35), 0 0 32px ${hexToRgba(sColor,0.12)}`;e.currentTarget.style.borderColor=hexToRgba(sColor,0.45)}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.background=hexToRgba(sColor,0.05);e.currentTarget.style.boxShadow='0 6px 32px rgba(0,0,0,0.28)';e.currentTarget.style.borderColor=hexToRgba(sColor,0.28)}}>
                      {/* Cover image — top bar with soft gradient fade */}
                      <div style={{ position:'relative', height: p.coverImage ? 90 : 3, overflow:'hidden', flexShrink:0 }}>
                        {p.coverImage && <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition: p.coverFocus||'50% 50%' }} />}
                        {!p.coverImage && <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${hexToRgba(sColor,0.14)},transparent)` }} />}
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(0deg, rgba(4,8,18,0.9) 0%, rgba(4,8,18,0.4) 45%, rgba(4,8,18,0) 100%)' }} />
                        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${hexToRgba(sColor,0.9)},${hexToRgba(sColor,0.4)},transparent)` }} />
                        <span style={{ position:'absolute', top:9, right:12, fontSize:9, background:`${hexToRgba(sColor,0.18)}`, color:sColor, border:`1px solid ${hexToRgba(sColor,0.40)}`, borderRadius:20, padding:'2px 9px', fontWeight:800, letterSpacing:'0.4px', backdropFilter:'blur(8px)' }}>🚀 SPONSORED</span>
                      </div>
                      <div style={{ padding:'18px 20px 20px', marginTop: p.coverImage ? -12 : 0, position:'relative', zIndex:1 }}>
                        {/* Logo */}
                        <div style={{ display:'flex', alignItems:'flex-end', gap:14, marginBottom:14 }}>
                          <div style={{ width:64, height:64, borderRadius:14, overflow:'hidden', flexShrink:0,
                            border: p.coverImage ? '3px solid rgba(4,8,18,0.9)' : `2px solid ${hexToRgba(sColor,0.40)}`,
                            boxShadow:`0 0 0 1px ${hexToRgba(sColor,0.22)}, 0 4px 18px rgba(0,0,0,0.4)`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            background:`linear-gradient(135deg,${hexToRgba(sColor,0.22)},${hexToRgba(sColor,0.10)})` }}>
                            {p.logoUrl
                              ? <img src={p.logoUrl} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                              : <span style={{ fontFamily:"'Raleway',sans-serif", fontWeight:900, fontSize:20, color:sColor }}>{(p.logo||p.name||'?').slice(0,2)}</span>}
                          </div>
                          <div style={{ paddingBottom:4 }}>
                            <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:16, marginBottom:3, letterSpacing:'-0.1px' }}>{p.name}</div>
                            <div style={{ fontSize:11, color:'rgba(228,221,208,0.50)', display:'flex', gap:8 }}>
                              {p.city && <span>📍 {p.city}</span>}
                              <span>· {catLabel(p.cat, lang)}</span>
                            </div>
                          </div>
                        </div>
                        <p style={{ fontFamily:"'Inter',sans-serif", fontSize:13, color:'rgba(228,221,208,0.65)', lineHeight:1.7, marginBottom:14 }}>{(p.desc?.[lang]||p.desc?.en||'').slice(0,110)}{(p.desc?.[lang]||p.desc?.en||'').length>110?'…':''}</p>
                        {(p.tags||[]).length>0 && (
                          <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:16 }}>
                            {p.tags.slice(0,4).map(tg=><span key={tg} style={{ fontSize:10, background:hexToRgba(sColor,0.10), color:sColor, border:`1px solid ${hexToRgba(sColor,0.22)}`, borderRadius:20, padding:'3px 9px', fontWeight:600 }}>{tg}</span>)}
                          </div>
                        )}
                        <div style={{ display:'flex', gap:9, alignItems:'center' }}>
                          <button className="btn" style={{ flex:1, padding:'10px', fontSize:12, fontWeight:700,
                            background:hexToRgba(sColor,0.12), color:sColor, border:`1px solid ${hexToRgba(sColor,0.32)}`, borderRadius:10, transition:'all 0.18s' }}
                            onMouseEnter={e=>{e.currentTarget.style.background=hexToRgba(sColor,0.22)}}
                            onMouseLeave={e=>{e.currentTarget.style.background=hexToRgba(sColor,0.12)}}
                            onClick={e=>{e.stopPropagation();setProfileDetail(p)}}>
                            View profile →
                          </button>
                          {p.verified && <span style={{ fontSize:10, background:'rgba(52,199,89,0.08)', color:G.green, border:'1px solid rgba(52,199,89,0.22)', borderRadius:20, padding:'4px 10px', fontWeight:700, whiteSpace:'nowrap' }}>✓ Verified</span>}
                        </div>
                      </div>
                    </div>
                    )
                  })}
                </div>
              </section>
            )
          })()}

          {/* ── 2. PARTNER LOGO TICKER ── */}
          {(() => {
            const partners = (window.__techgateProfiles||[]).filter(p => p.verified !== false && p.type === 'partner')
            if (partners.length === 0) return null
            const items = [...partners, ...partners]
            return (
              <section style={{ padding: '0 0 52px', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 3 }}>
                      {lang==='sq' ? '🤝 Partnerët Tanë' : '🤝 Our Partners'}
                    </h2>
                    <div style={{ fontSize: 12, color: G.muted, fontFamily: "'Inter',sans-serif" }}>
                      {lang==='sq' ? 'Organizata të verifikuara — klikoni për të kontaktuar' : 'Verified organisations — click to connect on Concierge'}
                    </div>
                  </div>
                  <button className="btn ghost" style={{ fontSize: 12, flexShrink: 0 }} onClick={() => setPage('concierge')}>{lang==='sq'?'Shiko →':'View all →'}</button>
                </div>
                <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', overflow: 'hidden' }}>
                  <div style={{ position:'absolute', left:0, top:0, bottom:0, width:80, background:`linear-gradient(90deg,#050d1b,transparent)`, zIndex:2, pointerEvents:'none' }} />
                  <div style={{ position:'absolute', right:0, top:0, bottom:0, width:80, background:`linear-gradient(270deg,#050d1b,transparent)`, zIndex:2, pointerEvents:'none' }} />
                  <div style={{ display:'flex', gap:14, animation:'ticker-scroll 28s linear infinite', width:'max-content', padding:'6px 0' }}
                    onMouseEnter={e=>e.currentTarget.style.animationPlayState='paused'}
                    onMouseLeave={e=>e.currentTarget.style.animationPlayState='running'}>
                    {items.map((p, idx) => (
                      <div key={idx} onClick={() => setProfileDetail(p)}
                        style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center',
                          background: hexToRgba(p.logoColor||'#3d7fa8', 0.05),
                          border:`1px solid ${hexToRgba(p.logoColor||'#3d7fa8', 0.28)}`, borderRadius:16, cursor:'pointer',
                          flexShrink:0, transition:'all 0.2s', width:170, overflow:'hidden',
                          boxShadow:'0 4px 20px rgba(0,0,0,0.18)' }}
                        onMouseEnter={e=>{e.currentTarget.style.background=hexToRgba(p.logoColor||'#3d7fa8',0.10);e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 8px 32px rgba(0,0,0,0.28), 0 0 0 1px ${hexToRgba(p.logoColor||'#3d7fa8',0.40)}`}}
                        onMouseLeave={e=>{e.currentTarget.style.background=hexToRgba(p.logoColor||'#3d7fa8',0.05);e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.18)'}}>
                        {/* Cover or gradient top */}
                        <div style={{ position:'relative', height: p.coverImage ? 52 : 32, overflow:'hidden', width:'100%', flexShrink:0 }}>
                          {p.coverImage
                            ? <img src={p.coverImage} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            : <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${p.logoColor||'#3d7fa8'}20,rgba(5,13,24,0.95))` }} />}
                          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${p.logoColor||'#3d7fa8'},transparent)` }} />
                          {p.coverImage && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'60%', background:'linear-gradient(0deg,rgba(5,13,24,0.65) 0%,transparent 100%)' }} />}
                        </div>
                        {/* Centered logo overlapping cover */}
                        <div style={{ marginTop: p.coverImage ? -22 : 8, marginBottom:8, position:'relative', zIndex:1 }}>
                          <div style={{ width:52, height:52, borderRadius:13, overflow:'hidden', border:'2px solid #080d1a',
                            boxShadow:`0 0 0 1.5px ${p.logoColor||'#3d7fa8'}55, 0 4px 14px rgba(0,0,0,0.4)`,
                            background:`linear-gradient(135deg,${p.logoColor||'#3d7fa8'}20,${p.logoColor||'#3d7fa8'}38)`,
                            display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto' }}>
                            {p.logoUrl ? <img src={p.logoUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <Logo text={p.logo} color={p.logoColor||'#3d7fa8'} size={52} />}
                          </div>
                        </div>
                        <div style={{ padding:'0 10px 12px' }}>
                          <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:12, color:'#e4ddd0', lineHeight:1.2, marginBottom:2 }}>{p.name}</div>
                          {p.city && <div style={{ fontSize:10, color:'rgba(228,221,208,0.38)' }}>📍 {p.city}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          })()}

          {/* ── 3. SECTORS ── */}
          <section style={{ padding: '0 48px 0', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 700, fontSize: 20 }}>{t.catsTitle}</h2>
              <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => setPage('directory')}>{t.viewAll}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(128px,1fr))', gap: 7, marginBottom: 44 }}>
              {CATS.map((c, i) => {
                const count = (window.__techgateProfiles||[]).filter(p=>p.cat===c.id&&p.verified!==false&&p.type!=='partner').length
                return (
                  <div key={c.id} onClick={() => { setDirCat(c.id); setPage('directory') }}
                    style={{ padding: '12px 10px', cursor: 'pointer', borderRadius: 12, position:'relative', overflow:'hidden',
                      background: `linear-gradient(135deg,${c.color}09,${c.color}04)`,
                      border: `1px solid ${c.color}30`,
                      transition: 'all 0.2s', animationDelay: `${i * 0.03}s` }}
                    className="fu"
                    onMouseEnter={e=>{e.currentTarget.style.background=`linear-gradient(135deg,${c.color}18,${c.color}08)`;e.currentTarget.style.borderColor=`${c.color}60`;e.currentTarget.style.transform='translateY(-2px)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background=`linear-gradient(135deg,${c.color}09,${c.color}04)`;e.currentTarget.style.borderColor=`${c.color}30`;e.currentTarget.style.transform=''}}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${c.color}80,transparent)`, borderRadius:'12px 12px 0 0' }} />
                    <div style={{ fontSize: 18, marginBottom: 5 }}>{c.icon}</div>
                    <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight: 700, fontSize: 11, marginBottom: 3, letterSpacing:'-0.1px', color:'rgba(228,221,208,0.90)' }}>{c.labels[lang]}</div>
                    {count > 0 && <div style={{ fontSize: 10, color: c.color, fontFamily:"'Inter',sans-serif", fontWeight:600 }}>{count} {lang==='sq'?'regj.':'listed'}</div>}
                  </div>
                )
              })}
            </div>
          </section>

          <section style={{ padding: '0 48px 72px', position: 'relative', zIndex: 1 }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', position:'relative', overflow:'hidden', background: `linear-gradient(135deg, rgba(201,164,74,0.1) 0%, rgba(201,164,74,0.06) 40%, rgba(61,111,168,0.06) 100%)`, border: `1px solid ${G.goldBorder}`, borderRadius: 22, padding: '52px 52px' }}>
              {/* bg glow */}
              <div style={{ position:'absolute', top:'-40%', right:'-5%', width:'40%', paddingBottom:'40%', borderRadius:'50%', background:'radial-gradient(circle,rgba(201,164,74,0.12),transparent 70%)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:'-30%', left:'5%', width:'25%', paddingBottom:'25%', borderRadius:'50%', background:'radial-gradient(circle,rgba(61,111,168,0.07),transparent 70%)', pointerEvents:'none' }} />
              <div style={{ position:'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
                <div style={{ maxWidth: 520 }}>
                  <div style={{ fontSize:11, color:G.gold, fontFamily:"'Inter',sans-serif", fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:10 }}>
                    🌐 {lang==='sq'?'Rrjet Global B2B · Platforma Premium':'Global B2B Network · Premium Executive Platform'}
                  </div>
                  <h2 style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px', marginBottom: 10, lineHeight:1.15 }}>{t.ctaTitle}</h2>
                  <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75 }}>{t.ctaSub}</p>
                  <div style={{ display:'flex', gap:16, marginTop:18, flexWrap:'wrap' }}>
                    {[lang==='sq'?'✓ Pa pagesë':'✓ Always free', lang==='sq'?'✓ Verifikim admin':'✓ Admin verified', lang==='sq'?'✓ I dukshëm ndërkombëtarisht':'✓ Worldwide visibility'].map(item => (
                      <span key={item} style={{ fontSize:12, color:G.teal, fontFamily:"'Inter',sans-serif" }}>{item}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection:'column', gap: 10, flexShrink: 0 }}>
                  <button className="btn gbtn" style={{ fontSize: 15, padding: '14px 28px', fontWeight:700 }} onClick={() => setShowReg(true)}>{t.ctaBtn}</button>
                  <button className="btn ghost" style={{ fontSize:13, textAlign:'center' }} onClick={() => setPage('gov')}>{t.ctaGov}</button>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
      {page === 'directory'  && <DirectoryPage lang={lang} t={t} initialQ={searchQ} onQClear={() => setSearchQ('')} initialCat={dirCat} />}

      {page === 'concierge'  && (
        <div style={{ position:'relative', minHeight:'100vh' }}>
      <VideoBackground src="/bg-video-concierge.mp4" />

          <div style={{ position:'relative', zIndex:1 }}>
            <ConciergePage lang={lang} t={t} content={siteContent} />
          </div>
        </div>
      )}

      {page === 'gov' && (
        <div style={{ position:'relative', minHeight:'100vh' }}>
      <VideoBackground src="/bg-video-home.mp4" />

          <div style={{ position:'relative', zIndex:1 }}>
            <GovPage lang={lang} t={t} content={siteContent} />
          </div>
        </div>
      )}

      {showReg && !regDone && (
        <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && (setShowReg(false), setRegType(null))}>
          <div className="modal su">
            {!regType ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 19 }}>{t.regTitle}</div>
                  <ModalClose onClose={() => setShowReg(false)} />
                </div>
                {/* Kosova-based */}
                <div style={{ fontSize:10, color:G.muted, textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700, marginBottom:8 }}>
                  🇽🇰 {lang==='sq'?'Bazuar në Kosovë':'Kosova-based'}
                </div>
                <div style={{ display:'flex', gap:9, marginBottom:14 }}>
                  {[
                    { regT: t.regComp, icon:'🏢', sub: t.regCompS, col: G.gold, border: G.goldBorder, bg: G.goldDim },
                    { regT: t.regFL,   icon:'👤', sub: t.regFLS,   col: G.teal, border:'rgba(61,111,168,0.35)', bg:'rgba(61,111,168,0.06)' },
                  ].map(opt => (
                    <div key={opt.regT} onClick={() => setRegType(opt.regT)}
                      style={{ flex:1, padding:'16px 10px', border:`1px solid ${opt.border}`, background:opt.bg, borderRadius:12, cursor:'pointer', textAlign:'center', transition:'all 0.18s' }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 4px 16px ${opt.col}22`}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                      <div style={{ fontSize:26, marginBottom:7 }}>{opt.icon}</div>
                      <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:13, color:opt.col, marginBottom:3 }}>{opt.regT}</div>
                      <div style={{ fontSize:11, color:G.muted }}>{opt.sub}</div>
                    </div>
                  ))}
                </div>
                {/* Partner */}
                <div style={{ fontSize:10, color:G.teal, textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700, marginBottom:8 }}>
                  🤝 {lang==='sq'?'Bëhu partner':'Become a partner'}
                </div>
                <div onClick={() => setRegType(t.regSP)}
                  style={{ padding:'14px 12px', border:'1px solid rgba(61,111,168,0.35)', background:'rgba(61,111,168,0.05)', borderRadius:12, cursor:'pointer', textAlign:'center', transition:'all 0.18s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(61,111,168,0.7)';e.currentTarget.style.background='rgba(61,111,168,0.12)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(61,111,168,0.35)';e.currentTarget.style.background='rgba(61,111,168,0.05)'}}>
                  <div style={{ fontFamily:"'Raleway',sans-serif", fontWeight:700, fontSize:13, color:G.teal, marginBottom:3 }}>{t.regSP}</div>
                  <div style={{ fontSize:11, color:'rgba(61,111,168,0.6)' }}>{t.regSPS}</div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 19 }}>{regType}</div>
                    <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{t.regFree}</div>
                  </div>
                  <button onClick={() => setRegType(null)} className="btn ghost" style={{ padding: '5px 10px', fontSize: 15 }}>{t.back}</button>
                </div>
                <SmartRegForm lang={lang} t={t} regType={regType} onDone={() => setRegDone(true)} />
              </>
            )}
          </div>
        </div>
      )}
      {regDone && (
        <div className="modal-bg fi" onClick={() => { setRegDone(false); setShowReg(false); setRegType(null) }}>
          <div className="modal su" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
            <div style={{ fontFamily: "'Raleway',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.regDoneTitle}</div>
            <p style={{ fontFamily: "'Inter',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}>{t.regDoneSub}</p>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={() => { setRegDone(false); setShowReg(false); setRegType(null) }}>{t.close}</button>
          </div>
        </div>
      )}

      {/* ── PROFILE DETAIL MODAL ── */}
      {profileDetail && (
        <ProfileDetailModal
          p={profileDetail} lang={lang} t={t}
          onClose={() => setProfileDetail(null)}
          onContact={p => { setProfileDetail(null); /* contact handled in dir page */ }}
        />
      )}

      {/* ── FOOTER ── */}
      <footer style={{ 
        background: 'rgba(6,11,22,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(180,160,100,0.12)', padding: '22px 44px',
        fontFamily: "'Inter',sans-serif", fontSize: 12, color: 'rgba(228,221,208,0.75)'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:14 }}>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontFamily:"'Raleway',sans-serif", fontWeight:800, fontSize:13, color:'#e4ddd0' }}>Kosova Hub</span>
            <span style={{ fontSize:10, background:'rgba(201,164,74,0.18)', color:G.gold, border:`1px solid ${G.goldBorder}`, borderRadius:20, padding:'1px 8px', fontWeight:600 }}>B2B</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems:'center', color:'rgba(228,221,208,0.72)' }}>
            {t.footLinks.map(l => <span key={l} style={{ cursor: 'pointer', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#fff'} onMouseLeave={e=>e.currentTarget.style.color='rgba(228,221,208,0.72)'}>{l}</span>)}
            <span onClick={() => setShowAdmin(true)} style={{ cursor: 'pointer', opacity: 0, transition: 'opacity 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0'}>⚙</span>
          </div>
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.10)', paddingTop:12, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <div style={{ color:'rgba(228,221,208,0.65)' }}>{t.footer}</div>
          <div style={{ display:'flex', gap:18 }}>
            {[lang==='sq'?'🌐 E dukshme gjithandej':'🌐 Visible Worldwide', lang==='sq'?'🤝 Rrjet Global B2B':'🤝 Global B2B Network', lang==='sq'?'🔐 Verifikim admin':'🔐 Admin Verified'].map(tag => (
              <span key={tag} style={{ fontSize:11, color:'rgba(228,221,208,0.55)' }}>{tag}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
<style>{`
  /* ── MOBILE RESPONSIVE ─────────────────────────────── */

  @media (max-width: 640px){
    nav{padding:0 16px !important;}
    nav .nav-links-desktop{display:none !important;}
    .home-hero{padding:28px 16px 20px !important;}
    .home-section{padding:0 16px 16px !important;}
    .dir-page{padding:16px !important;}
    .match-page{padding:16px !important;}
    .conc-page{padding:0 !important;}
    .conc-section{padding:28px 16px !important;}
    .gov-page{padding:20px 16px !important;}
    .admin-page{padding:16px !important;}
    .admin-stats-grid{grid-template-columns:1fr 1fr !important;}
    .admin-tabs{flex-wrap:wrap !important;}
    .reg-type-row{flex-direction:column !important;}
    .modal{padding:20px 14px !important;border-radius:14px !important;}
    .modal-bg{padding:8px !important;}
    .grid-2{grid-template-columns:1fr !important;}
    .grid-3{grid-template-columns:1fr !important;}
    .grid-4{grid-template-columns:1fr 1fr !important;}
    .hero-h1{font-size:28px !important;letter-spacing:-0.5px !important;}
    .hero-sub{font-size:14px !important;}
    .cat-pills{gap:5px !important;}
    .cat-pill{padding:6px 10px !important;font-size:11px !important;}
    .search-bar{flex-direction:column !important;}
    .stat-grid{grid-template-columns:1fr 1fr !important;}
    .feat-grid{grid-template-columns:1fr !important;}
    .pkg-grid{grid-template-columns:1fr !important;}
    .dir-filters{flex-wrap:wrap !important;}
    .match-pills{gap:5px !important;}
    .footer-row{flex-direction:column !important;gap:8px !important;}
    /* Sector filter: hide pills, show dropdown on mobile */
    .sector-pills-desktop{display:none !important;}
    .sector-pills-mobile{display:block !important;}
    /* Partner cards: 1 col on mobile */
    .partner-cards{grid-template-columns:1fr !important;}
    /* Partner card inner compact mode */
    .partner-cards > div { border-radius: 14px !important; }
    /* Sponsored cards 1 col on mobile */
    section [style*="minmax(340px"]{grid-template-columns:1fr !important;}
    /* Modal full width on mobile */
    .modal-bg > div { border-radius: 14px !important; }
    /* Home how-it-works: 1 col on mobile */
    section [style*="repeat(3,1fr)"]{grid-template-columns:1fr !important;}
    /* Sector boxes: 3 col on mobile */
    section [style*="minmax(128px"]{grid-template-columns:repeat(3,1fr) !important;}
    /* Sponsored section: 1 col on mobile */
    section [style*="minmax(300px"]{grid-template-columns:1fr !important;}
    /* Section padding fix */
    section{padding-left:16px !important;padding-right:16px !important;}
  }

  @media(min-width: 641px) and (max-width: 960px){
    .home-hero{padding:36px 24px !important;}
    .home-section{padding:0 24px !important;}
    .dir-page,.match-page{padding:20px 24px !important;}
    .feat-grid{grid-template-columns:1fr 1fr !important;}
    .pkg-grid{grid-template-columns:1fr 1fr !important;}
    .admin-stats-grid{grid-template-columns:repeat(2,1fr) !important;}
    section [style*="repeat(3,1fr)"]{grid-template-columns:repeat(2,1fr) !important;}
    .partner-cards{grid-template-columns:1fr 1fr !important;}
  }
`}</style>
