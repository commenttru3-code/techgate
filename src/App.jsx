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
    navConcierge: 'Concierge', navGov: 'Government', registerBtn: '+ List Profile',
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
    ctaTitle: 'List your profile for free', ctaSub: '3 minutes, free. Visible to EU clients.',
    ctaBtn: 'Register →', ctaGov: 'About Kosova',
    rankSub: 'All contacts publicly visible · Rates by conversation',
    allCats: 'All', allTypes: '🌐 All', onlyComp: '🏢 Companies', onlyFL: '👤 Freelancers',
    sortRating: '⭐ Rating', sortReviews: '💬 Reviews', sortAZ: 'A–Z',
    noResults: 'No results', noResultsSub: 'Try different search terms',
    rateNote: 'Rates by conversation', verified: '✓ Verified',
    sendReq: 'Send enquiry', viewProf: 'Profile',
    upgradeBtn: '⭐',
    upgradeTitle: 'Increase visibility',
    upgradeSubSp: 'Sponsored · 1 slot per category',
    upgradeSubPr: 'Premium · max. 3 slots per category',
    upgradeBenSp: ['🥇 Position 1 in category', 'Sponsored label', 'Featured on homepage', 'Newsletter mention'],
    upgradeBenPr: ['⭐ Position 2–4 in category', 'Premium badge', 'Higher visibility', 'Profile analytics'],
    upgradeNoteSp: 'Only 1 sponsor per category.',
    upgradeNotePr: 'Maximum 3 premium profiles per category.',
    upgradeContact: 'Contact for upgrade:', upgradeMail: 'upgrade@bbplatform.com',
    waitTitle: 'Join waitlist', waitSub: 'We\'ll notify you when a slot opens.',
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
    navConcierge: 'Concierge', navGov: 'Qeveria', registerBtn: '+ Regjistrohu',
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
    ctaTitle: 'Regjistrohu falas tani', ctaSub: '3 minuta, falas. I dukshëm për klientë europianë.',
    ctaBtn: 'Regjistrohu →', ctaGov: 'Rreth Kosovës',
    rankSub: 'Të gjitha kontaktet publike · Kushtet me bisedë',
    allCats: 'Të gjitha', allTypes: '🌐 Të gjitha', onlyComp: '🏢 Kompani', onlyFL: '👤 Freelancerë',
    sortRating: '⭐ Vlerësim', sortReviews: '💬 Komente', sortAZ: 'A–Z',
    noResults: 'Asnjë rezultat', noResultsSub: 'Provoni terma të tjerë',
    rateNote: 'Kushtet me marrëveshje', verified: '✓ Verifikuar',
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
const SLOTS = { sponsored: 1, premium: 3 }

const CATS = [
  { id: 'software',   icon: '💻', color: '#58a6ff', labels: { en: 'Software & IT',     sq: 'Softuer & IT'      }, count: 0 },
  { id: 'support',    icon: '🛠️', color: '#a78bfa', labels: { en: 'Tech Support',      sq: 'Mbështetje Tech'   }, count: 0 },
  { id: 'consulting', icon: '📊', color: '#34d399', labels: { en: 'Consulting',         sq: 'Konsulencë'       }, count: 0 },
  { id: 'media',      icon: '🎬', color: '#e879f9', labels: { en: 'Media & Content',    sq: 'Media & Content'  }, count: 0 },
  { id: 'production', icon: '🏭', color: '#fb923c', labels: { en: 'Production',         sq: 'Prodhim'          }, count: 0 },
  { id: 'textile',    icon: '🧵', color: '#f9a8d4', labels: { en: 'Textile & Fashion',  sq: 'Tekstil & Modë'   }, count: 0 },
  { id: 'bpo',        icon: '📞', color: '#f472b6', labels: { en: 'BPO / Call Centre',  sq: 'BPO / Call Center'}, count: 0 },
  { id: 'design',     icon: '🎨', color: '#facc15', labels: { en: 'Design & Creative',  sq: 'Dizajn & Kreativ' }, count: 0 },
  { id: 'logistics',  icon: '🚚', color: '#6ee7b7', labels: { en: 'Logistics',          sq: 'Logjistikë'       }, count: 0 },
  { id: 'legal',      icon: '⚖️', color: '#fca5a5', labels: { en: 'Legal & Finance',    sq: 'Ligjor & Financa' }, count: 0 },
]


const PROFILES = [
  { id: 'c1', tier: 'sponsored', type: 'company', name: 'AlbaCode', cat: 'software', city: 'Pristina',
   tags: ['React', 'Node.js', 'TypeScript', 'Mobile'], rating: 4.9, reviews: 34, verified: true,
   employees: '15–30', founded: 2019, logo: 'AC', logoColor: '#58a6ff',
   contact: 'hi@albacode.ks', phone: '+383 44 100 200',
   availFrom: '2025-05-01', availUntil: '2025-10-31', capacity: 4, remote: true, languages: 'DE, EN, SQ',
   skills: ['React', 'Node.js', 'TypeScript', 'React Native', 'PostgreSQL'],
   desc: { de: 'Full-Stack Entwicklung & Mobile Apps für EU-Märkte.', en: 'Full-stack development & mobile apps for EU markets.', sq: 'Zhvillim full-stack dhe aplikacione mobile.', sv: 'Full-stack och mobilappar för EU.' } },
  { id: 'f1', tier: 'premium', type: 'freelancer', name: 'Arton Krasniqi', cat: 'software', city: 'Pristina',
   tags: ['React', 'TypeScript', 'GraphQL'], rating: 4.9, reviews: 28, verified: true,
   availability: 'remote', experience: '7', logo: 'AK', logoColor: '#34d399',
   contact: 'arton.k@dev.ks', phone: '+383 44 200 300',
   availFrom: '2025-06-01', availUntil: '2025-12-31', capacity: 1, remote: true, languages: 'DE, EN, SQ',
   skills: ['React', 'TypeScript', 'GraphQL', 'Next.js', 'Figma'],
   desc: { de: '7 Jahre React-Erfahrung. SaaS-Frontend-Spezialist.', en: '7 years React. SaaS frontend specialist.', sq: '7 vite React. Specialist frontend SaaS.', sv: '7 år React. SaaS-frontendspecialist.' } },
  { id: 'f4', tier: 'premium', type: 'freelancer', name: 'Visar Berisha', cat: 'software', city: 'Ferizaj',
   tags: ['Python', 'Django', 'PostgreSQL'], rating: 4.7, reviews: 15, verified: true,
   availability: 'remote', experience: '6', logo: 'VB', logoColor: '#fb923c',
   contact: 'v.berisha@gmail.com',
   availFrom: '2025-05-15', availUntil: '2025-09-30', capacity: 1, remote: true, languages: 'EN, SQ',
   skills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker'],
   desc: { de: 'Backend & Data Engineer. Python/Django.', en: 'Backend & data engineer. Python/Django.', sq: 'Backend dhe data engineer.', sv: 'Backend och dataingenjör.' } },
  { id: 'c5', tier: 'free', type: 'company', name: 'CloudNest Kosovo', cat: 'software', city: 'Pristina',
   tags: ['DevOps', 'Kubernetes', 'AWS'], rating: 4.6, reviews: 11, verified: true,
   employees: '5–10', founded: 2020, logo: 'CN', logoColor: '#58a6ff',
   contact: 'team@cloudnest.io',
   availFrom: null, availUntil: null, capacity: null, remote: true, languages: 'EN, SQ',
   skills: ['DevOps', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
   desc: { de: 'Managed Cloud & DevOps für EU-Startups.', en: 'Managed cloud & DevOps for EU startups.', sq: 'Cloud i menaxhuar & DevOps.', sv: 'Molntjänst för EU-startups.' } },
  { id: 'c2', tier: 'sponsored', type: 'company', name: 'SupportXPro', cat: 'support', city: 'Gjakova',
   tags: ['24/7', 'Helpdesk', 'ITIL v4', 'DE/EN/SQ'], rating: 4.8, reviews: 58, verified: true,
   employees: '30–50', founded: 2018, logo: 'SX', logoColor: '#a78bfa',
   contact: 'ops@supportxpro.ks', phone: '+383 44 300 400',
   availFrom: '2025-05-01', availUntil: null, capacity: 10, remote: true, languages: 'DE, EN, SQ',
   skills: ['Helpdesk', 'ITIL', 'Windows', 'CRM', 'Ticketing'],
   desc: { de: 'Mehrsprachiger Tech-Support, ITIL v4 zertifiziert.', en: 'Multilingual tech support, ITIL v4 certified.', sq: 'Mbështetje teknike shumëgjuhëshe.', sv: 'Flerspråkig support, ITIL v4.' } },
  { id: 'f5', tier: 'premium', type: 'freelancer', name: 'Flori Hyseni', cat: 'support', city: 'Gjakova',
   tags: ['IT-Support', 'Windows', 'CompTIA'], rating: 4.6, reviews: 12, verified: true,
   availability: 'remote', experience: '4', logo: 'FH', logoColor: '#a78bfa',
   contact: 'flori@support.ks',
   availFrom: '2025-07-01', availUntil: '2025-12-31', capacity: 1, remote: true, languages: 'DE, EN, SQ',
   skills: ['IT-Support', 'Windows', 'CompTIA A+', 'Netzwerk', 'Remote Desktop'],
   desc: { de: 'Deutschsprachiger IT-Support. CompTIA A+.', en: 'German-speaking IT support. CompTIA A+.', sq: 'IT support gjermanisht. CompTIA A+.', sv: 'Tysktalande IT-support.' } },
  { id: 'f3', tier: 'premium', type: 'freelancer', name: 'Rina Morina', cat: 'consulting', city: 'Pristina',
   tags: ['Projektmanagement', 'Agile', 'PMP'], rating: 4.9, reviews: 23, verified: true,
   availability: 'remote', experience: '8', logo: 'RM', logoColor: '#34d399',
   contact: 'rina.m@pm.ks', phone: '+383 44 400 500',
   availFrom: '2025-05-01', availUntil: '2025-08-31', capacity: 1, remote: true, languages: 'DE, EN, SQ, IT',
   skills: ['PMP', 'Agile', 'Scrum', 'JIRA', 'Confluence', 'MS Project'],
   desc: { de: 'Zertifizierte PMP-Projektmanagerin.', en: 'Certified PMP project manager.', sq: 'Menaxhere projektesh PMP.', sv: 'Certifierad PMP-projektledare.' } },
  { id: 'c6', tier: 'free', type: 'company', name: 'TechBridge Kosovo', cat: 'consulting', city: 'Prizren',
   tags: ['ERP', 'SAP', 'Digitalisierung'], rating: 4.7, reviews: 21, verified: true,
   employees: '10–20', founded: 2020, logo: 'TB', logoColor: '#34d399',
   contact: 'info@techbridge-ks.com',
   availFrom: null, availUntil: null, capacity: null, remote: false, languages: 'DE, EN, SQ',
   skills: ['SAP', 'ERP', 'Digitalisierung', 'Change Management'],
   desc: { de: 'IT-Beratung & Digitaltransformation.', en: 'IT consulting & digital transformation.', sq: 'Konsulencë IT & transformim.', sv: 'IT-konsulting.' } },
  { id: 'c3', tier: 'sponsored', type: 'company', name: 'NexCall Solutions', cat: 'bpo', city: 'Pristina',
   tags: ['Inbound', 'Outbound', 'CRM', '6 Sprachen'], rating: 4.5, reviews: 44, verified: true,
   employees: '40–80', founded: 2017, logo: 'NC', logoColor: '#f472b6',
   contact: 'start@nexcall.ks',
   availFrom: null, availUntil: null, capacity: null, remote: true, languages: 'DE, EN, SQ, IT, TR, FR',
   skills: ['Call Center', 'CRM', 'Inbound', 'Outbound', 'Customer Service'],
   desc: { de: 'Call-Center für DACH-Kunden. 6 Sprachen.', en: 'Call centre for DACH. 6 languages.', sq: 'Qendër thirrjesh DACH. 6 gjuhë.', sv: 'Callcenter för DACH. 6 språk.' } },
  { id: 'f6', tier: 'premium', type: 'freelancer', name: 'Dea Berisha', cat: 'bpo', city: 'Pristina',
   tags: ['Kundenservice', 'DE/EN', 'CRM'], rating: 4.7, reviews: 31, verified: true,
   availability: 'remote', experience: '3', logo: 'DB', logoColor: '#f472b6',
   contact: 'dea.va@outlook.com',
   availFrom: null, availUntil: null, capacity: null, remote: true, languages: 'DE, EN, SQ',
   skills: ['Kundenservice', 'CRM', 'E-Mail Management', 'Deutsch native'],
   desc: { de: 'Native-Level Deutsch. Kundenbetreuung & CRM.', en: 'Native German. Customer service & CRM.', sq: 'Gjermanisht native. CRM.', sv: 'Infödd tyska. Kundservice.' } },
  { id: 'f2', tier: 'premium', type: 'freelancer', name: 'Blerta Gashi', cat: 'design', city: 'Prizren',
   tags: ['Figma', 'UI/UX', 'Branding'], rating: 4.8, reviews: 19, verified: true,
   availability: 'remote', experience: '5', logo: 'BG', logoColor: '#facc15',
   contact: 'blerta.design@outlook.com',
   availFrom: null, availUntil: null, capacity: null, remote: true, languages: 'DE, EN, SQ',
   skills: ['Figma', 'UI/UX', 'Branding', 'Prototyping', 'Adobe XD'],
   desc: { de: 'UX-Designerin, Figma-Expertin.', en: 'UX designer, Figma expert.', sq: 'Dizajnere UX, eksperte Figma.', sv: 'UX-designer, Figma-expert.' } },
  { id: 'c4', tier: 'free', type: 'company', name: 'PixelDrin Studio', cat: 'design', city: 'Peja',
   tags: ['Branding', 'Motion', 'Video'], rating: 4.9, reviews: 29, verified: true,
   employees: '5–15', founded: 2021, logo: 'PD', logoColor: '#facc15',
   contact: 'hello@pixeldrin.studio',
   availFrom: null, availUntil: null, capacity: null, remote: true, languages: 'EN, SQ',
   skills: ['Branding', 'Motion Design', 'Video', 'After Effects'],
   desc: { de: 'Kreativagentur für Brand Identity.', en: 'Creative agency for brand identity.', sq: 'Agjensi kreative.', sv: 'Kreativbyrå.' } },
]

const SALES_PEOPLE = [
  { id: 'sp1', name: 'Mentor Gashi', city: 'Pristina', languages: 'DE, EN, SQ', logo: 'MG', logoColor: '#2dd4bf', rating: 4.9, reviews: 47, deals: 124, experience: '8', title: { de: 'Senior Sales Spezialist', en: 'Senior Sales Specialist', sq: 'Specialist i Lartë Shitjesh', sv: 'Senior säljspecialist' }, specialties: { de: ['IT-Outsourcing', 'Firmengründung', 'Tech-Events'], en: ['IT Outsourcing', 'Company formation', 'Tech events'], sq: ['IT Outsourcing', 'Themelim', 'Evente'], sv: ['IT-outsourcing', 'Bolagsbildning', 'Event'] }, bio: { de: 'Ehemaliger BD-Manager bei deutschem IT-Konzern. 124 erfolgreiche EU-Kosovo-Kooperationen.', en: 'Former BD manager at German IT company. 124 successful deals.', sq: 'Ish-menaxher BD. 124 bashkëpunime të suksesshme.', sv: 'Tidigare BD-chef. 124 framgångsrika affärer.' }, contact: 'mentor@bbplatform.com', phone: '+383 44 123 456' },
  { id: 'sp2', name: 'Fjolla Kelmendi', city: 'Prizren', languages: 'DE, EN, SQ, IT', logo: 'FK', logoColor: '#a78bfa', rating: 4.8, reviews: 31, deals: 67, experience: '5', title: { de: 'Sales Spezialistin · Süd-Kosovo', en: 'Sales Specialist · South Kosovo', sq: 'Specialiste · Jug-Kosovë', sv: 'Säljspecialist · Södra Kosovo' }, specialties: { de: ['Produktion', 'Design', 'E-Commerce'], en: ['Production', 'Design', 'E-Commerce'], sq: ['Prodhim', 'Dizajn', 'E-Commerce'], sv: ['Tillverkning', 'Design', 'E-handel'] }, bio: { de: 'MBA. Fokus auf Produktionsbetriebe. Handelskammer Prizren.', en: 'MBA. Focus on production. Prizren Chamber of Commerce.', sq: 'MBA. Fokus prodhimi. Dhoma Tregtie Prizren.', sv: 'MBA. Tillverkning. Handelskammare Prizren.' }, contact: 'fjolla@bbplatform.com', phone: '+383 45 234 567' },
  { id: 'sp3', name: 'Besnik Rama', city: 'Pristina', languages: 'EN, SQ, DE', logo: 'BR', logoColor: '#fb923c', rating: 4.7, reviews: 22, deals: 44, experience: '4', title: { de: 'Sales Spezialist · Startups', en: 'Sales Specialist · Startups', sq: 'Specialist · Startup', sv: 'Säljspecialist · Startups' }, specialties: { de: ['Startups', 'Software-Teams', 'Investoren'], en: ['Startups', 'Software teams', 'Investors'], sq: ['Startup', 'Ekipe software', 'Investitorë'], sv: ['Startups', 'Mjukvaruteam', 'Investerare'] }, bio: { de: 'Serial Entrepreneur, 2 Exits. Kennt die kosovarische Startup-Szene.', en: 'Serial entrepreneur, 2 exits. Kosova startup expert.', sq: 'Sipërmarrës serial, 2 exits. Ekspert startup.', sv: 'Serieentreprenör, 2 exiter.' }, contact: 'besnik@bbplatform.com', phone: '+383 46 345 678' },
]

// ─── THEME ────────────────────────────────────────────────────────────────────
const G = {
  bg: '#080c14', surface: '#0e1420', card: 'rgba(255,255,255,0.025)',
  border: 'rgba(255,255,255,0.07)', gold: '#d4a843', goldDim: 'rgba(212,168,67,0.10)',
  goldBorder: 'rgba(212,168,67,0.22)', text: '#e8e4d9', muted: 'rgba(232,228,217,0.45)',
  green: '#34c759', red: '#ff3b30', blue: '#58a6ff', purple: '#a78bfa',
  teal: '#2dd4bf', orange: '#fb923c',
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#080c14;margin:0;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a3040;border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes glow{0%,100%{box-shadow:0 0 0 rgba(212,168,67,0);}50%{box-shadow:0 0 20px rgba(212,168,67,0.22);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
.fu{animation:fadeUp 0.4s ease both;}
.fi{animation:fadeIn 0.28s ease both;}
.su{animation:slideUp 0.32s ease both;}
.sp{animation:spin 0.7s linear infinite;}
.glow{animation:glow 3s ease infinite;}
.pg{animation:pulse 2s ease infinite;}
.btn{border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.17s;border-radius:8px;}
.gbtn{background:#d4a843;color:#080c14;padding:10px 22px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.3px;}
.gbtn:hover{background:#e5ba55;transform:translateY(-1px);box-shadow:0 6px 20px rgba(212,168,67,0.3);}
.gbtn:disabled{opacity:0.4;cursor:not-allowed;transform:none;box-shadow:none;}
.ghost{background:transparent;color:rgba(232,228,217,0.5);padding:9px 16px;font-size:13px;border:1px solid rgba(255,255,255,0.08);font-weight:500;}
.ghost:hover{color:#e8e4d9;border-color:rgba(212,168,67,0.3);}
.teal-btn{background:linear-gradient(135deg,#2dd4bf,#0d9488);color:white;padding:10px 22px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;}
.teal-btn:hover{opacity:0.88;transform:translateY(-1px);}
.card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:14px;transition:all 0.24s;}
.card:hover{background:rgba(255,255,255,0.04);border-color:rgba(212,168,67,0.18);transform:translateY(-2px);box-shadow:0 12px 36px rgba(0,0,0,0.3);}
.inp{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9px;padding:10px 13px;color:#e8e4d9;font-size:14px;outline:none;width:100%;font-family:'DM Sans',sans-serif;transition:border-color 0.18s;}
.inp:focus{border-color:#d4a843;box-shadow:0 0 0 3px rgba(212,168,67,0.07);}
.inp::placeholder{color:rgba(232,228,217,0.28);}
.navl{background:transparent;color:rgba(232,228,217,0.5);padding:7px 11px;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;border:none;cursor:pointer;border-radius:7px;transition:all 0.16s;}
.navl:hover{color:#e8e4d9;background:rgba(255,255,255,0.04);}
.navl.on{color:#d4a843;background:rgba(212,168,67,0.09);}
.tag{display:inline-block;background:rgba(88,166,255,0.08);color:#8eb4d4;border:1px solid rgba(88,166,255,0.15);border-radius:5px;padding:2px 7px;font-size:11px;}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.84);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(10px);}
.modal{background:#0e1420;border:1px solid rgba(212,168,67,0.22);border-radius:18px;padding:28px 24px;max-width:500px;width:100%;max-height:92vh;overflow-y:auto;}
.flabel{display:block;font-family:'Syne',sans-serif;font-size:11px;font-weight:600;color:rgba(232,228,217,0.46);margin-bottom:5px;letter-spacing:0.8px;text-transform:uppercase;}
.sp-bar{height:3px;border-radius:14px 14px 0 0;background:linear-gradient(90deg,#fb923c,#fdba74);}
.pr-bar{height:3px;border-radius:14px 14px 0 0;background:linear-gradient(90deg,#d4a843,#fde68a);}
.rank-badge{position:absolute;top:10px;right:10px;}

@media(max-width:640px){
  .nav-links{display:none !important;}
  .nav-lang{display:none !important;}
  .nav-reg-btn{display:none !important;}
  .hamburger{display:flex !important;}
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
  /* Match filter bar */
  .match-filter-bar{padding:10px 13px !important;}
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
`
// ─── HELPERS ─────────────────────────────────────────────────────────────────
const catLabel = (id, lang) => CATS.find(c => c.id === id)?.labels[lang] || id
const catColor  = id => CATS.find(c => c.id === id)?.color || G.gold
const catIcon   = id => CATS.find(c => c.id === id)?.icon || '🏢'

function Stars({ r }) {
  return (
    <span style={{ color: G.gold, fontSize: 12 }}>
      {'★'.repeat(Math.round(r))}
      <span style={{ color: 'rgba(232,228,217,0.14)' }}>{'★'.repeat(5 - Math.round(r))}</span>
    </span>
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
    <div style={{ width: size, height: size, borderRadius: 10, background: `linear-gradient(135deg,${color}20,${color}46)`, border: `1px solid ${color}32`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: size > 36 ? 13 : 11, color, flexShrink: 0 }}>
      {text}
    </div>
  )
}

function Avatar({ text, color, size = 46 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `linear-gradient(135deg,${color}28,${color}56)`, border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color, flexShrink: 0 }}>
      {text}
    </div>
  )
}

function Spin() {
  return <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'white', borderRadius: '50%', flexShrink: 0 }} className="sp" />
}


function ModalClose({ onClose }) {
  return <button onClick={onClose} className="btn ghost" style={{ padding: '5px 10px', fontSize: 15, alignSelf: 'flex-start' }}>✕</button>
}

// ─── UPGRADE MODAL ────────────────────────────────────────────────────────────
function UpgradeModal({ catId, t, lang, onClose }) {
  const [waitDone, setWaitDone] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })

  const used = useMemo(() => {
    const src = window.__techgateProfiles?.length > 0 ? window.__techgateProfiles : PROFILES
    const sp = src.filter(p => p.cat === catId && p.tier === 'sponsored').length
    const pr = src.filter(p => p.cat === catId && p.tier === 'premium').length
    return { sp, pr }
  }, [catId])

  const spFree = SLOTS.sponsored - used.sp
  const prFree = SLOTS.premium - used.pr
  const catName = catLabel(catId, lang)

  return (
    <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal su">
        {!waitDone ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19, marginBottom: 3 }}>{t.upgradeTitle}</div>
                <div style={{ fontSize: 12, color: G.muted }}>{catName}</div>
              </div>
              <ModalClose onClose={onClose} />
            </div>

            {/* Slot visual */}
            <div style={{ marginBottom: 20 }}>
              {/* Sponsored */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: G.orange, marginBottom: 8, fontFamily: "'Syne',sans-serif" }}>🚀 {t.upgradeSubSp}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Array.from({ length: SLOTS.sponsored }).map((_, i) => {
                    const taken = i < used.sp
                    return (
                      <div key={i} style={{ flex: 1, height: 32, borderRadius: 8, background: taken ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${taken ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: taken ? G.orange : G.green, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
                        {taken ? '🔒 Belegt' : '✓ Frei'}
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Premium */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: G.gold, marginBottom: 8, fontFamily: "'Syne',sans-serif" }}>⭐ {t.upgradeSubPr}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Array.from({ length: SLOTS.premium }).map((_, i) => {
                    const taken = i < used.pr
                    return (
                      <div key={i} style={{ flex: 1, height: 32, borderRadius: 8, background: taken ? G.goldDim : 'rgba(255,255,255,0.04)', border: `1px solid ${taken ? G.goldBorder : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: taken ? G.gold : G.green, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
                        {taken ? '🔒 Belegt' : '✓ Frei'}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {spFree > 0 || prFree > 0 ? (
              <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, marginBottom: 4 }}>{t.upgradeContact}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: G.gold }}>{t.upgradeMail}</div>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{t.waitTitle}</div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, marginBottom: 16 }}>{t.waitSub}</p>
                <div style={{ marginBottom: 12 }}><label className="flabel">{t.waitName}</label><input className="inp" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div style={{ marginBottom: 16 }}><label className="flabel">{t.waitEmail}</label><input className="inp" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                <button className="btn gbtn" style={{ width: '100%' }} disabled={!form.name || !form.email} onClick={() => setWaitDone(true)}>{t.waitSend}</button>
              </>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.waitDoneTitle}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 20 }}>{t.waitDoneSub}</p>
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
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19 }}>{t.reqTitle}: {profile.name}</div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>Business Bridge Platform</div>
              </div>
              <ModalClose onClose={onClose} />
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`, borderRadius: 9, padding: '11px 14px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: G.muted, marginBottom: 4, letterSpacing: '0.5px', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>Kontakt</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.blue }}>📧 {profile.contact}</div>
              {profile.phone && <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.blue, marginTop: 3 }}>📞 {profile.phone}</div>}
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
                // Forward enquiry to the company/freelancer
                if (profile.contact) {
                  sendEnquiry({
                    toEmail:     profile.contact,
                    companyName: profile.name,
                    fromName:    form.name,
                    fromEmail:   form.email,
                    message:     form.msg,
                  }).catch(() => {})
                }
                setSent(true)
              }}>{t.reqSend}</button>
              <button className="btn ghost" onClick={onClose}>{t.reqCancel}</button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '18px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.reqDoneTitle}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 20 }}><strong>{profile.name}</strong> {t.reqDoneSub}</p>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={onClose}>{t.close}</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── PROFILE CARD ─────────────────────────────────────────────────────────────
function ProfileCard({ p, lang, t, rank, onContact, onUpgrade, onTagClick, onSelfEdit, matchScore, matchHits }) {
  const isFL = p.type === 'freelancer'
  const isSp = p.tier === 'sponsored'
  const isPr = p.tier === 'premium'
  return (
    <div className={`card fu${isSp ? ' glow' : ''}`} style={{ padding: 0, overflow: 'hidden', position: 'relative', borderColor: isSp ? 'rgba(251,146,60,0.4)' : isPr ? 'rgba(212,168,67,0.3)' : G.border, background: isSp ? 'rgba(251,146,60,0.03)' : isPr ? 'rgba(212,168,67,0.025)' : G.card }}>
      {isSp && <div className="sp-bar" />}
      {isPr && <div className="pr-bar" />}
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Logo text={p.logo} color={p.logoColor} url={p.logoUrl} />
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: G.muted }}>📍 {p.city} · {catLabel(p.cat, lang)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            {isSp && <span style={{ fontSize: 10, background: 'rgba(251,146,60,0.14)', color: G.orange, border: '1px solid rgba(251,146,60,0.3)', borderRadius: 5, padding: '2px 9px', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>🚀 {lang==='sq'?'Sponsorizuar':'Sponsored'}</span>}
            {isPr && <span style={{ fontSize: 10, background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, borderRadius: 5, padding: '2px 9px', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>⭐ Premium</span>}
            {!isSp && !isPr && <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', color: G.muted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '2px 9px', fontFamily: "'Syne',sans-serif" }}>Free</span>}
              {matchScore !== null && matchScore !== undefined && (
                <span style={{ display:'inline-flex', flexDirection:'column', gap:3, verticalAlign:'middle', minWidth:52 }}>
                  <span style={{ fontSize:11, fontWeight:800, fontFamily:"'Syne',sans-serif", color: matchScore>=80?G.green:matchScore>=50?G.gold:G.muted }}>{matchScore}%</span>
                  <span style={{ display:'block', width:52, height:4, background:'rgba(255,255,255,0.08)', borderRadius:3, overflow:'hidden' }}>
                    <span style={{ display:'block', height:'100%', width:`${matchScore}%`, background: matchScore>=80?`linear-gradient(90deg,${G.green},#4ade80)`:matchScore>=50?`linear-gradient(90deg,${G.gold},#fde68a)`:`linear-gradient(90deg,${G.muted},rgba(255,255,255,0.2))`, borderRadius:3, transition:'width 0.5s ease' }} />
                  </span>
                </span>
              )}
            {p.verified && <span style={{ fontSize: 10, background: 'rgba(52,199,89,0.1)', color: G.green, border: '1px solid rgba(52,199,89,0.2)', borderRadius: 5, padding: '2px 7px' }}>{t.verified}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 9, fontSize: 12, color: G.muted, fontFamily: "'DM Sans',sans-serif" }}>

          {isFL ? <span>🗣 {p.languages}</span> : <span>👥 {p.employees}</span>}
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, lineHeight: 1.62, marginBottom: 11 }}>{p.desc[lang] || p.desc.en}</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {p.tags.map(tag => (
            <span key={tag} className="tag" onClick={e => { e.stopPropagation(); onTagClick && onTagClick(tag) }}
              style={{ cursor: onTagClick ? 'pointer' : 'default', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (onTagClick) { e.currentTarget.style.background='rgba(45,212,191,0.15)'; e.currentTarget.style.color=G.teal; e.currentTarget.style.borderColor='rgba(45,212,191,0.3)' }}}
              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color=''; e.currentTarget.style.borderColor='' }}>
              {tag}
            </span>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.teal, fontWeight: 500 }}>💬 {t.rateNote}</div>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button className="btn gbtn" style={{ flex: 1, padding: '8px', fontSize: 12 }} onClick={() => onContact(p)}>{t.sendReq}</button>
          <button className="btn ghost" style={{ padding: '8px 12px', fontSize: 13 }} title="Sichtbarkeit erhöhen" onClick={() => onUpgrade(p.cat)}>⭐</button>
          <button className="btn ghost" style={{ padding: '8px 12px', fontSize: 12 }} title={lang==='sq'?'Ndrysho profilin tim':'Edit my profile'} onClick={() => onSelfEdit && onSelfEdit(p)}>✏️</button>
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
    <div style={{ background:'rgba(45,212,191,0.05)', border:'1px solid rgba(45,212,191,0.2)', borderRadius:12, padding:'14px 16px', marginBottom:18 }}>
      <div style={{ fontSize:11, color:G.teal, fontWeight:700, letterSpacing:'0.6px', textTransform:'uppercase', marginBottom:10 }}>
        {lang==='sq'?'Zgjidh aftësitë':'Select skills'}
        {cat !== 'all' && <span style={{ color:G.muted, fontWeight:400, marginLeft:6, textTransform:'none' }}>· {(CATS.find(c2=>c2.id===cat)||{}).labels[lang]}</span>}
      </div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:5, maxHeight:120, overflowY:'auto' }}>
        {skillList.map(s => (
          <button key={s} onClick={() => toggleSkill(s)} className="btn"
            style={{ padding:'5px 12px', fontSize:11, fontWeight:matchSkills.includes(s)?700:500, borderRadius:14,
              background:matchSkills.includes(s)?'rgba(45,212,191,0.15)':'rgba(255,255,255,0.04)',
              color:matchSkills.includes(s)?G.teal:G.muted,
              border:'1px solid '+(matchSkills.includes(s)?'rgba(45,212,191,0.4)':'rgba(255,255,255,0.07)') }}>
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

function DirectoryPage({ lang, t, externalTag, onClearTag, initialQ, onQClear }) {
  const [q, setQ] = useState(initialQ || '')
  // Sync initialQ when coming from home search
  React.useEffect(() => { if (initialQ) { setQ(initialQ) } }, [initialQ])
  const [typeF, setTypeF] = useState('all')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('az')
  const [contact, setContact] = useState(null)
  const [upgrade, setUpgrade] = useState(null)
  const [tagFilter, setTagFilter] = useState(externalTag || null)
  const [selfEdit, setSelfEdit] = useState(null)
  const [dbProfiles, setDbProfiles] = useState([])
  const [dbLoading, setDbLoading] = useState(true)
  // Skill matching integrated into directory
  const [matchSkills, setMatchSkills] = useState([])
  const [matchMode, setMatchMode] = useState(false) // toggle match panel

  // Load verified profiles from Supabase
  useEffect(() => {
    fetchProfiles()
      .then(data => { setDbProfiles(data); setDbLoading(false) })
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
      if (!byCat[p.cat]) byCat[p.cat] = { sponsored: [], premium: [], free: [] }
      byCat[p.cat][p.tier === 'sponsored' ? 'sponsored' : p.tier === 'premium' ? 'premium' : 'free'].push(p)
    })
    const result = []
    Object.entries(byCat).forEach(([, groups]) => {
      groups.sponsored.forEach(p => result.push({ ...p, _rank: 1 }))
      groups.premium.forEach((p, i) => result.push({ ...p, _rank: i + 2 }))
      groups.free.forEach(p => result.push({ ...p, _rank: null }))
    })
    return result
  }, [allProfiles])

  const filtered = ranked.filter(p => {
    const s = q.toLowerCase()
    const desc = p.desc[lang] || p.desc.en || ''
    const catMatch = cat === 'all' || p.cat === cat
    const skillMatch = matchMode && matchSkills.length > 0
      ? matchSkills.some(sk => p.tags.some(tg => tg.toLowerCase().includes(sk.toLowerCase())))
      : true
    return (
      (!q || p.name.toLowerCase().includes(s) || desc.toLowerCase().includes(s) || p.tags.some(tg => tg.toLowerCase().includes(s))) &&
      (typeF === 'all' || p.type === typeF) &&
      catMatch && skillMatch &&
      (!tagFilter || p.tags.some(tg => tg.toLowerCase() === tagFilter.toLowerCase()))
    )
  }).map(p => {
    if (!matchMode || matchSkills.length === 0) return { ...p, _matchScore: null }
    const hits = matchSkills.filter(sk => p.tags.some(tg => tg.toLowerCase().includes(sk.toLowerCase())))
    return { ...p, _matchScore: Math.round((hits.length / matchSkills.length) * 100), _matchHits: hits }
  }).sort((a, b) => {
    if (matchMode && matchSkills.length > 0 && a._matchScore !== b._matchScore) return (b._matchScore||0) - (a._matchScore||0)
    return 0
  })

  const catList = cat === 'all' ? CATS : CATS.filter(c => c.id === cat)

  return (
    <div style={{ padding: '28px 44px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.muted }}>{t.rankSub}</div>
      <div style={{ display: 'flex', gap: 9, marginBottom: 16 }}>
        <input className="inp" style={{ flex: 1, fontSize: 15 }} placeholder={t.searchPH} value={q} onChange={e => setQ(e.target.value)} />
        <select className="inp" style={{ width: 148, fontSize: 12 }} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="name">{t.sortAZ}</option>
        </select>
      </div>

      {/* ── ROW 1: Type filter ── */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 10, color: G.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, fontFamily:"'Syne',sans-serif" }}>
          {lang==='sq' ? '👥 Lloji i profilit' : '👥 Profile type'}
        </div>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', alignItems: 'center' }}>
          {[['all', t.allTypes], ['company', t.onlyComp], ['freelancer', t.onlyFL]].map(([v, l]) => (
            <button key={v} onClick={() => setTypeF(v)} className="btn" style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, background: typeF === v ? G.goldDim : 'rgba(255,255,255,0.04)', color: typeF === v ? G.gold : G.muted, border: `1px solid ${typeF === v ? G.goldBorder : 'rgba(255,255,255,0.07)'}` }}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ height: 1, background: G.border, margin: '12px 0' }} />

      {/* ── ROW 2: Sector filter ── */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: G.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6, fontFamily:"'Syne',sans-serif" }}>
          {lang==='sq' ? '🏭 Sektori' : '🏭 Sector'}
        </div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          <button onClick={() => setCat('all')} className="btn" style={{ padding: '6px 13px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', background: cat === 'all' ? G.goldDim : 'rgba(255,255,255,0.04)', color: cat === 'all' ? G.gold : G.muted, border: `1px solid ${cat === 'all' ? G.goldBorder : 'rgba(255,255,255,0.07)'}` }}>{t.allCats}</button>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} className="btn" style={{ padding: '6px 13px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', background: cat === c.id ? `${c.color}18` : 'rgba(255,255,255,0.04)', color: cat === c.id ? c.color : G.muted, border: `1px solid ${cat === c.id ? `${c.color}40` : 'rgba(255,255,255,0.07)'}` }}>
              {c.icon} {c.labels[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{ height: 1, background: G.border, marginBottom: 12 }} />

      {/* ── ROW 3: MATCH FILTER FULL-WIDTH BAR (last) ── */}
      <div onClick={() => { setMatchMode(v => !v); setMatchSkills([]) }}
        className="match-filter-bar"
        style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '13px 18px',
          background: matchMode ? 'linear-gradient(90deg,rgba(45,212,191,0.14),rgba(45,212,191,0.06))' : 'rgba(45,212,191,0.04)',
          border: `1px solid ${matchMode ? 'rgba(45,212,191,0.5)' : 'rgba(45,212,191,0.2)'}`,
          borderRadius: 12, cursor: 'pointer', marginBottom: 4,
          boxShadow: matchMode ? '0 0 0 2px rgba(45,212,191,0.15), 0 4px 20px rgba(45,212,191,0.1)' : 'none',
          transition: 'all 0.22s',
        }}>
        <div style={{ width: 32, height: 32, borderRadius: 8,
          background: matchMode ? 'linear-gradient(135deg,#2dd4bf,#0d9488)' : 'rgba(45,212,191,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {matchMode ? '✓' : '🔎'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: matchMode ? G.teal : G.text, letterSpacing: '0.2px' }}>
            {lang==='sq' ? 'Filtri i Përputhjes — Kërko sipas aftësive' : 'Match Filter — Search by skills & expertise'}
          </div>
          <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>
            {matchMode
              ? (matchSkills.length > 0 ? `${matchSkills.length} skill${matchSkills.length > 1 ? 's' : ''} selected · ${lang==='sq'?'Kliko për të hequr':'Click to clear'}` : (lang==='sq'?'Zgjidhni aftësi më poshtë':'Select skills below to filter results'))
              : (lang==='sq' ? 'Aktivizo për të filtruar sipas aftësive specifike' : 'Activate to filter listings by specific skills')
            }
          </div>
        </div>
        {matchMode && matchSkills.length > 0 && (
          <div style={{ background: G.teal, color: '#080c14', borderRadius: 12, padding: '3px 10px', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
            {matchSkills.length} {lang==='sq'?'aftësi':'skills'}
          </div>
        )}
        <div style={{ color: matchMode ? G.teal : G.muted, fontSize: 18, fontWeight: 300, flexShrink: 0 }}>{matchMode ? '▲' : '▼'}</div>
      </div>

      {/* ── SKILL MATCH PANEL ── */}
      {matchMode && <SkillMatchPanel
        lang={lang} cat={cat} G={G}
        dbProfiles={dbProfiles}
        matchSkills={matchSkills}
        setMatchSkills={setMatchSkills}
        resultCount={filtered.length}
      />}

      {/* Active tag filter banner */}
      {tagFilter && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: 9, padding: '9px 14px' }}>
          <span style={{ fontSize: 13, color: G.teal, fontFamily: "'DM Sans',sans-serif" }}>
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
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>{catObj.icon}</span>
              <span style={{ color: catObj.color }}>{catObj.labels[lang]}</span>
              <span style={{ fontSize: 13, color: G.muted, fontWeight: 400 }}>({catProfiles.length})</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
              {catProfiles.map(p => (
                <ProfileCard key={p.id} p={p} lang={lang} t={t} rank={p._rank} onContact={setContact} onUpgrade={setUpgrade} onTagClick={tag => setTagFilter(tag)} onSelfEdit={setSelfEdit} matchScore={p._matchScore} matchHits={p._matchHits} />
              ))}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 20px', color: G.muted }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontFamily: "'DM Sans',sans-serif" }}>{t.noResults} "{q}"</div>
          <div style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginTop: 6 }}>{t.noResultsSub}</div>
        </div>
      )}

      {contact && <ContactModal profile={contact} t={t} onClose={() => setContact(null)} />}
      {upgrade && <UpgradeModal catId={upgrade} t={t} lang={lang} onClose={() => setUpgrade(null)} />}
      {selfEdit && <SelfEditModal profile={selfEdit} lang={lang} t={t} onClose={() => setSelfEdit(null)} />}
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
      setDbProfiles(data)
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

        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(22px,3.5vw,36px)', letterSpacing: '-0.6px', marginBottom: 8 }}>{Lm.title}</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 15, lineHeight: 1.75 }}>{Lm.sub}</p>
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
            <div style={{ fontSize: 13, color: G.muted, fontFamily: "'DM Sans',sans-serif", marginTop: 8, fontStyle: 'italic' }}>
              {Lm.noSkillNote}
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 8 }}>
                {currentSkills.map(s => {
                  const on = skills.includes(s)
                  return (
                    <button key={s} onClick={() => toggleSkill(s)} className="btn" style={{ padding: '6px 13px', fontSize: 12, fontWeight: on ? 700 : 500, borderRadius: 18, background: on ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)', color: on ? G.teal : G.muted, border: `1px solid ${on ? 'rgba(45,212,191,0.45)' : 'rgba(255,255,255,0.07)'}` }}>
                      {on && '✓ '}{s}
                    </button>
                  )
                })}
              </div>
              {skills.length > 0 && (
                <div style={{ marginTop: 8, fontSize: 12, color: G.teal, fontFamily: "'DM Sans',sans-serif" }}>
                  ✓ {skills.length} {Lm.allSkills}: {skills.join(', ')}
                </div>
              )}
              <div style={{ fontSize: 11, color: G.muted, marginTop: 6, fontFamily: "'DM Sans',sans-serif" }}>{Lm.skillHint}</div>
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
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 16 }}>
            {Lm.resultsTitle}
            <span style={{ color: G.gold, marginLeft: 8 }}>({results.length})</span>
          </h3>

          {results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: G.muted, fontFamily: "'DM Sans',sans-serif" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              {Lm.noResults}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
            {results.map((p, i) => {
              const isFL  = p.type === 'freelancer'
              const isSp  = p.tier === 'sponsored'
              const isPr  = p.tier === 'premium'
              const sc    = scoreLabel(p._score)

              return (
                <div key={p.id} className={`card fu${isSp ? ' glow' : ''}`}
                  style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.04}s`,
                    borderColor: isSp ? 'rgba(251,146,60,0.4)' : isPr ? 'rgba(212,168,67,0.3)' : G.border,
                    background: isSp ? 'rgba(251,146,60,0.03)' : isPr ? 'rgba(212,168,67,0.025)' : G.card }}>
                  {isSp && <div className="sp-bar" />}
                  {isPr && <div className="pr-bar" />}
                  <div style={{ padding: 20 }}>

                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <Logo text={p.logo} color={p.logoColor} url={p.logoUrl} />
                        <div>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>📍 {p.city} · {catLabel(p.cat, lang)}</div>
                          {isFL && <div style={{ fontSize: 11, color: G.muted }}>🗣 {p.languages}</div>}
                        </div>
                      </div>

                      {/* Score badge — only when skills selected */}
                      {sc !== null && (
                        <div style={{ textAlign: 'center', flexShrink: 0, marginLeft: 8 }}>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: scoreColor(sc), lineHeight: 1 }}>{sc}%</div>
                          <div style={{ fontSize: 9, color: G.muted, marginTop: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{Lm.scoreLabel}</div>
                        </div>
                      )}
                    </div>

                    {/* Match score bar */}
                    {sc !== null && (
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, marginBottom: 10 }}>
                        <div style={{ height: '100%', width: `${sc}%`, background: `linear-gradient(90deg,${scoreColor(sc)},${scoreColor(sc)}80)`, borderRadius: 2, transition: 'width 0.6s ease' }} />
                      </div>
                    )}

                    {/* Matched skills highlight */}
                    {p._matched && p._matched.length > 0 && (
                      <div style={{ marginBottom: 10, padding: '7px 11px', background: 'rgba(45,212,191,0.07)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 8 }}>
                        <div style={{ fontSize: 10, color: G.teal, fontWeight: 700, marginBottom: 5, letterSpacing: '0.3px' }}>✓ {Lm.matchedSkills}</div>
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                          {p._matched.map(s => (
                            <span key={s} style={{ fontSize: 11, background: 'rgba(45,212,191,0.15)', color: G.teal, border: '1px solid rgba(45,212,191,0.35)', borderRadius: 5, padding: '2px 8px', fontWeight: 700 }}>{s}</span>
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
                        {isSp && <span style={{ fontSize: 10, background: 'rgba(251,146,60,0.14)', color: G.orange, border: '1px solid rgba(251,146,60,0.3)', borderRadius: 5, padding: '2px 8px', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>🚀 {lang==='sq'?'Sponsorizuar':'Sponsored'}</span>}
                        {isPr && <span style={{ fontSize: 10, background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, borderRadius: 5, padding: '2px 8px', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>⭐ Premium</span>}
                        {p.verified && <span style={{ fontSize: 10, background: 'rgba(52,199,89,0.1)', color: G.green, border: '1px solid rgba(52,199,89,0.2)', borderRadius: 5, padding: '2px 7px' }}>{t.verified}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12, color: G.muted, fontFamily: "'DM Sans',sans-serif" }}>

                      </div>
                    </div>

                    {/* Rate note + CTA */}
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="btn gbtn" style={{ flex: 1, padding: '9px', fontSize: 12 }} onClick={() => setContact(p)}>
                        {t.sendReq}
                      </button>
                      <span style={{ fontSize: 11, color: G.teal, fontFamily: "'DM Sans',sans-serif", flexShrink: 0 }}>
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
  if (!profiles || profiles.length === 0) return null
  const dividerLabel = lang === 'sq' ? 'Partnerë' : 'Partners'
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,67,0.22))' }} />
        <span style={{ fontSize: 11, color: '#d4a843', fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', background: 'rgba(212,168,67,0.10)', border: '1px solid rgba(212,168,67,0.22)', borderRadius: 20, padding: '4px 16px' }}>
          {dividerLabel}
        </span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(212,168,67,0.22),transparent)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 13 }}>
        {profiles.map(function(sp, i) {
          return (
            <div key={sp.id} className="card fu" style={{ padding: 20, animationDelay: (i * 0.05) + 's' }}>
              <div style={{ display: 'flex', gap: 11, marginBottom: 11 }}>
                <Logo text={sp.logo} color={sp.logoColor} url={sp.logoUrl} />
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>{sp.name}</div>
                  <div style={{ fontSize: 11, color: '#2dd4bf' }}>Partner</div>
                  <div style={{ fontSize: 11, color: 'rgba(232,228,217,0.45)', marginTop: 1 }}>
                    {sp.city}{sp.languages ? (' · ' + sp.languages) : ''}
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(232,228,217,0.45)', lineHeight: 1.62, marginBottom: 10 }}>
                {(sp.desc && (sp.desc[lang] || sp.desc.en)) || ''}
              </p>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                {(sp.tags || []).map(function(s) {
                  return (
                    <span key={s} style={{ background: 'rgba(45,212,191,0.08)', color: '#2dd4bf', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 5, padding: '2px 7px', fontSize: 11 }}>{s}</span>
                  )
                })}
              </div>
              <button className="btn teal-btn" style={{ width: '100%', padding: '8px', fontSize: 12 }} onClick={onBook}>{t.concReq}</button>
            </div>
          )
        })}
      </div>
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
      fetchProfiles().then(data => setPartnerProfiles(data.filter(p => p.type === 'partner'))).catch(() => {})
    }
  }, [])
  const [bookDone, setBookDone] = useState(false)
  const [partnerModal, setPartnerModal] = useState(false)
  const [partnerDone, setPartnerDone] = useState(false)

  const PACKAGES = [
    { ic: '🔍', col: '#58a6ff', price: { de: 'ab €390', en: 'from €390', sq: 'nga €390', sv: 'från €390' }, name: lang === 'sq' ? 'Vizita Discovery' : 'Discovery Visit', dur: lang === 'sq' ? '1–2 ditë' : '1–2 days', ideal: lang === 'sq' ? 'Eksplorimi i parë' : 'First exploration', inc: lang === 'sq' ? ['Analizë nevojash', '2–3 takime', 'Briefing & raport'] : ['Needs analysis call', '2–3 meetings', 'Briefing & report'] },
    { ic: '🤝', col: G.gold, highlight: true, price: { de: 'ab €790', en: 'from €790', sq: 'nga €790', sv: 'från €790' }, name: lang === 'sq' ? 'Vizita Biznesi' : 'Business Visit', dur: lang === 'sq' ? '2–3 ditë' : '2–3 days', ideal: lang === 'sq' ? 'Projekt konkret' : 'Concrete project', inc: lang === 'sq' ? ['Gjithçka nga Discovery', '4–6 takime', 'Hotel & transport', 'Mbrëmje rrjetëzimi'] : ['Everything in Discovery', '4–6 meetings', 'Hotel & transfer', 'Networking evening'] },
    { ic: '🏛️', col: '#a78bfa', price: { de: 'ab €1.490', en: 'from €1,490', sq: 'nga €1.490', sv: 'från €1 490' }, name: lang === 'sq' ? 'Vizita Executive' : 'Executive Visit', dur: lang === 'sq' ? '3–5 ditë' : '3–5 days', ideal: lang === 'sq' ? 'Themelim / Investim' : 'Company formation / Investment', inc: lang === 'sq' ? ['Gjithçka nga Business', 'Takim ministrie', 'Darkë partnerësh', 'Këshillim ligjor'] : ['Everything in Business Visit', 'Ministry meeting', 'Partner dinner', 'Initial legal advice'] },
  ]

  return (
    <div>
      {/* ── HERO ── */}
      <div className="conc-hero" style={{ padding: '56px 48px 40px', background: 'linear-gradient(135deg,rgba(45,212,191,0.09),transparent 70%)', borderBottom: `1px solid ${G.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(45,212,191,0.02) 1px,transparent 1px)', backgroundSize: '38px 38px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 660, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: 100, padding: '5px 16px', marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, background: G.teal, borderRadius: '50%', display: 'inline-block' }} className="pg" />
            <span style={{ fontSize: 12, color: G.teal, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
              {(2 + (partnerProfiles?.length || 0))} {t.concAvail}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4.5vw,48px)', letterSpacing: '-1.1px', lineHeight: 1.1, marginBottom: 14 }}>
            {CC.hero_title || t.concHeroTitle}<br /><span style={{ color: G.teal }}>
              {lang === 'sq' ? 'Ne organizojmë gjithçka.' : 'We organise everything.'}
            </span>
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: G.muted, lineHeight: 1.82, marginBottom: 26, maxWidth: 520, fontWeight: 300 }}>{CC.hero_sub || t.concHeroSub}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn teal-btn" onClick={() => setBookModal(true)}>{t.concReq}</button>
            <button className="btn ghost">{t.concLearn}</button>
          </div>
        </div>
      </div>

      <div className="conc-content" style={{ padding: '44px 48px 56px', maxWidth: 1200, margin: '0 auto', overflowX: 'hidden' }}>

        {/* ── OFFICIAL PARTNERS ── */}
        <div style={{ marginBottom: 52 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 21, marginBottom: 6 }}>{t.concPartnersTitle}</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22, lineHeight: 1.7 }}>{t.concPartnersSub}</p>
          <div className="conc-partners-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* rootsGTM */}
            <div style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.28)', borderRadius: 16, padding: '28px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,rgba(45,212,191,0.3),rgba(45,212,191,0.1))', border: '1px solid rgba(45,212,191,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🚀</div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: G.teal }}>{P.rootsgtm_name || 'rootsGTM'}</div>
                  <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>
                    {lang === 'sq' ? 'Partner Ekskluziv · Aktiv' : 'Exclusive Partner · Active'}
                  </div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(52,199,89,0.1)', color: G.green, border: '1px solid rgba(52,199,89,0.25)', borderRadius: 5, padding: '3px 9px', fontWeight: 700, flexShrink: 0 }}>✓ Live</span>
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(232,228,217,0.75)', lineHeight: 1.75, marginBottom: 18 }}>
                {P.rootsgtm_desc || 'rootsGTM is our exclusive sales network for EU–Kosova connections.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                {(lang === 'sq' ? ['🤝 Kontakt direkt', '📅 Organizim takimesh', '🎤 Evente & Rrjet', '📄 Vijim & Kontrata'] : ['🤝 Direct client contact', '📅 Meeting organisation', '🎤 Events & networking', '📄 Follow-up & contracts']).map(f => (
                  <div key={f} style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 8, padding: '10px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(232,228,217,0.8)' }}>{f}</div>
                ))}
              </div>
              <button className="btn teal-btn" style={{ width: '100%', padding: '11px' }} onClick={() => setBookModal(true)}>
                {lang === 'sq' ? 'Kërko me rootsGTM →' : 'Enquire via rootsGTM →'}
              </button>
            </div>

            {/* Regierung Kosovo */}
            <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 16, padding: '28px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,rgba(212,168,67,0.3),rgba(212,168,67,0.1))', border: `1px solid ${G.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏛️</div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: G.gold }}>
                    {lang === 'sq' ? 'Qeveria e Kosovës' : 'Kosova Government'}
                  </div>
                  <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>InvestKosova · {lang === 'sq' ? 'Partner Zyrtar' : 'Official Partner'}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, borderRadius: 5, padding: '3px 9px', fontWeight: 700, flexShrink: 0 }}>
                  {lang === 'sq' ? '⏳ Në negocim' : '⏳ In negotiation'}
                </span>
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(232,228,217,0.75)', lineHeight: 1.75, marginBottom: 18 }}>
                {lang === 'sq' ? 'Business Bridge Platform po ndërton partneritet zyrtar me InvestKosova dhe Ministrinë e Ekonomisë. Qëllimi: takime qeveritare, këshillim themelimi dhe mbështetje investimesh direkt nëpërmjet platformës.' : 'Business Bridge Platform is building an official partnership with InvestKosova and the Ministry of Economy. Goal: government appointments, company formation advice and investment support directly through the platform.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                {(lang === 'sq' ? ['🏛️ Takime InvestKosova', '📋 Këshillim themelimi', '🤝 Takime ministrie', '📊 Mbështetje investimesh'] : ['🏛️ InvestKosova meetings', '📋 Company formation advice', '🤝 Ministry appointments', '📊 Investment support']).map(f => (
                  <div key={f} style={{ background: 'rgba(212,168,67,0.07)', border: `1px solid ${G.goldBorder}`, borderRadius: 8, padding: '10px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(232,228,217,0.8)' }}>{f}</div>
                ))}
              </div>
              <button className="btn gbtn" style={{ width: '100%', padding: '11px' }} onClick={() => setBookModal(true)}>
                {lang === 'sq' ? 'Kërko takim qeveritar →' : 'Request government meeting →'}
              </button>
            </div>
          </div>
        </div>

        {/* ── PACKAGES ── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 21, marginBottom: 6 }}>{t.concPkgTitle}</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22 }}>{t.concPkgSub}</p>
          <div className="conc-pkg-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
            {PACKAGES.map((pkg, i) => (
              <div key={i} style={{ background: pkg.highlight ? G.goldDim : G.card, border: `1px solid ${pkg.highlight ? G.goldBorder : G.border}`, borderRadius: 14, padding: '22px 20px', position: 'relative', transition: 'all 0.22s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = '' }}>
                {pkg.highlight && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: G.gold, color: '#080c14', borderRadius: 100, padding: '3px 14px', fontSize: 10, fontWeight: 700, fontFamily: "'Syne',sans-serif", whiteSpace: 'nowrap' }}>⭐ POPULAR</div>}
                <div style={{ fontSize: 26, marginBottom: 8 }}>{pkg.ic}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{pkg.name}</div>
                {/* Price */}
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: pkg.highlight ? G.gold : pkg.col }}>{pkg.price[lang] || pkg.price.en}</span>
                </div>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 2 }}>⏱ {pkg.dur}</div>
                <div style={{ fontSize: 11, color: G.muted, marginBottom: 13, fontStyle: 'italic' }}>{pkg.ideal}</div>
                <div style={{ borderTop: `1px solid ${G.border}`, paddingTop: 10, marginBottom: 14 }}>
                  {pkg.inc.map(item => (
                    <div key={item} style={{ display: 'flex', gap: 7, marginBottom: 6, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: 'rgba(232,228,217,0.75)' }}>
                      <span style={{ color: pkg.col, flexShrink: 0 }}>✓</span>{item}
                    </div>
                  ))}
                </div>
                <button className="btn" style={{ width: '100%', padding: '9px', background: pkg.highlight ? G.gold : 'transparent', color: pkg.highlight ? '#080c14' : pkg.col, border: `1px solid ${pkg.col}44`, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13 }} onClick={() => { setSelectedPkg(pkg.name); setBookModal(true) }}>{t.pkgCta}</button>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.muted, marginTop: 12, fontStyle: 'italic' }}>
            {lang === 'sq' ? '* Çmimet janë orientuese. Çmimi final bien dakord bashkërisht.' : '* Prices are indicative. The final price is agreed together based on scope and requirements.'}
          </p>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 21, marginBottom: 6 }}>{t.concHowTitle}</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22 }}>{t.concHowSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 9 }}>
            {t.howSteps.map((s, i) => (
              <div key={i} className="card fu" style={{ padding: 16, textAlign: 'center', animationDelay: `${i * 0.05}s` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: G.teal, marginBottom: 6, letterSpacing: '1px' }}>STEP {s.n}</div>
                <div style={{ fontSize: 22, marginBottom: 7 }}>{s.ic}</div>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.t}</div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: G.muted, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        <PartnerCards lang={lang} profiles={partnerProfiles} G={G} t={t} onBook={() => setBookModal(true)} />

        {/* ── CTA ── */}
        <div style={{ background: 'linear-gradient(135deg,rgba(45,212,191,0.08),rgba(212,168,67,0.04))', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 14, padding: '30px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 32 }}>
          <div>
            <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 8 }}>{t.concCtaTitle}</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.teal }}>
              {t.concCtaFeats.map(f => <span key={f}>{f}</span>)}
            </div>
          </div>
          <button className="btn teal-btn" style={{ flexShrink: 0, padding: '12px 26px', fontSize: 14 }} onClick={() => setBookModal(true)}>{t.concCtaBtn}</button>
        </div>

        {/* ── BECOME A PARTNER (subtle, at bottom) ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${G.border}`, borderRadius: 12, padding: '22px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{t.concBecomeTitle}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, lineHeight: 1.7, maxWidth: 480 }}>{t.concBecomeSub}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 10 }}>
              {t.concBecomeTypes.map(type => <span key={type} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.muted }}>{type}</span>)}
            </div>
          </div>
          <button className="btn ghost" style={{ flexShrink: 0, whiteSpace: 'nowrap' }} onClick={() => setPartnerModal(true)}>{t.concBecomeBtn}</button>
        </div>
      </div>

      {/* ── BOOK MODAL ── */}
      {bookModal && !bookDone && (
        <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && setBookModal(false)}>
          <div className="modal su">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19 }}>{t.bookTitle}</div>
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
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.bookDoneTitle}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}>{t.bookDoneSub}</p>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={() => { setBookDone(false); setBookModal(false) }}>{t.close}</button>
          </div>
        </div>
      )}

      {/* ── PARTNER MODAL ── */}
      {partnerModal && !partnerDone && (
        <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && setPartnerModal(false)}>
          <div className="modal su">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19 }}>{t.partnerRegTitle}</div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>{t.partnerRegSub}</div>
              </div>
              <ModalClose onClose={() => setPartnerModal(false)} />
            </div>
            <div style={{ marginBottom: 12 }}><label className="flabel">{t.partnerOrg}</label><input className="inp" placeholder="" /></div>
            <div style={{ marginBottom: 12 }}><label className="flabel">{t.partnerType}</label>
              <select className="inp">{t.partnerTypes.map(pt => <option key={pt}>{pt}</option>)}</select>
            </div>
            <div style={{ marginBottom: 12 }}><label className="flabel">{t.partnerEmail}</label><input className="inp" /></div>
            <div style={{ marginBottom: 18 }}><label className="flabel">{t.partnerDesc}</label><textarea className="inp" rows={3} style={{ resize: 'vertical' }} placeholder={t.partnerDescPH} /></div>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={() => setPartnerDone(true)}>{t.partnerSend}</button>
          </div>
        </div>
      )}
      {partnerDone && (
        <div className="modal-bg fi" onClick={() => { setPartnerDone(false); setPartnerModal(false) }}>
          <div className="modal su" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.partnerDoneTitle}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}>{t.partnerDoneSub}</p>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={() => { setPartnerDone(false); setPartnerModal(false) }}>{t.close}</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── GOV PAGE ─────────────────────────────────────────────────────────────────
function GovPage({ lang, t, content = {} }) {
  const gc = (window.__siteContent?.gov_content) || {}
  return (
    <div style={{ padding: '44px', maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'inline-block', background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 6, padding: '4px 12px', fontSize: 11, color: G.gold, marginBottom: 12, letterSpacing: '1px', textTransform: 'uppercase' }}>{t.govBadge}</div>
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(22px,3.5vw,36px)', letterSpacing: '-0.7px', marginBottom: 10 }}>{t.govH1}<br /><span style={{ color: G.gold }}>{t.govH2}</span></h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.8, maxWidth: 560, marginBottom: 36 }}>{t.govSub}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 32 }}>
        {t.govSteps.map((s, i) => (
          <div key={i} className="card fu" style={{ padding: 18, animationDelay: `${i * 0.06}s` }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.ic}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 700, color: G.gold, marginBottom: 4, letterSpacing: '0.5px' }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.t}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.muted, lineHeight: 1.6, marginBottom: 7 }}>{s.d}</p>
            <div style={{ fontSize: 11, background: 'rgba(52,199,89,0.08)', color: G.green, border: '1px solid rgba(52,199,89,0.2)', borderRadius: 5, padding: '2px 7px', display: 'inline-block' }}>⏱ {s.time}</div>
          </div>
        ))}
      </div>
      <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 14, padding: '24px 28px' }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 18 }}>{t.govFactsH}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 16, marginBottom: 20 }}>
          {t.govFacts.map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: G.gold }}>{v}</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: G.muted, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${G.goldBorder}`, paddingTop: 16, display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button className="btn gbtn" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => window.open('https://www.investkosova.com','_blank')}>InvestKosova →</button>
          <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => window.open('https://arbk.rks-gov.net','_blank')}>ARBK →</button>
          <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => window.open('https://www.atk-ks.org','_blank')}>ATK →</button>
        </div>
      </div>
    </div>
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
        border: '1px dashed rgba(212,168,67,0.25)', borderRadius: 10,
        padding: slot === 'sidebar' ? '18px 14px' : '12px 20px',
        textAlign: 'center', background: 'rgba(212,168,67,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        minHeight: slot === 'sidebar' ? 200 : 64,
      }}>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(212,168,67,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
            📢 {slot === 'sidebar' ? '160×600 Sidebar Ad' : '728×90 Banner Ad'}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(212,168,67,0.3)', marginTop: 4 }}>
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
        background: ad.bgColor || 'rgba(212,168,67,0.07)',
        border: `1px solid ${ad.borderColor || 'rgba(212,168,67,0.2)'}`,
        minHeight: slot === 'sidebar' ? 200 : 64,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 16px', gap: 12,
      }}>
        {ad.imageUrl && <img src={ad.imageUrl} alt={ad.label} style={{ maxHeight: slot==='sidebar'?120:48, maxWidth: slot==='sidebar'?130:220, objectFit:'contain' }} />}
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:ad.textColor||G.text }}>{ad.label}</div>
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
  const [form, setForm] = React.useState({ name: '', city: '', email: '', website: '', phone: '', employees: '', desc: '', customTag: '', focus: '', eu_langs: '', markets: '', logoColor: '#58a6ff' })
  const [selectedTags, setSelectedTags] = React.useState([])
  const [catChoice, setCatChoice] = React.useState('software')
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

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
    de: { cat: 'Branche', name: 'Name / Firma *', city: 'Stadt *', email: 'E-Mail *', website: 'Website', employees: 'Mitarbeiteranzahl', desc: 'Kurzbeschreibung', descPH: 'Was bieten Sie an? Besondere Erfahrungen, Kundenprojekte, USP…', tagSuggest: 'Vorgeschlagene Skills / Tags', tagCustom: 'Eigenen Tag hinzufügen', tagCustomPH: 'z.B. Cybersecurity', tagAdd: '+ Hinzufügen', tagSelected: 'Ausgewählte Tags', availNote: '💬 Verfügbarkeit & Kapazität werden direkt per Anfrage kommuniziert.', send: 'Eintrag absenden ✓', empOpts: ['1–5','6–10','11–20','21–50','51–100','100+'] },
    en: { cat: 'Sector', name: 'Name / Company *', city: 'City *', email: 'E-mail *', website: 'Website', employees: 'Number of employees', desc: 'Short description', descPH: 'What do you offer? Special experience, client projects, USP…', tagSuggest: 'Suggested skills / tags', tagCustom: 'Add custom tag', tagCustomPH: 'e.g. Cybersecurity', tagAdd: '+ Add', tagSelected: 'Selected tags', availNote: '💬 Availability & capacity communicated directly on request.', send: 'Submit listing ✓', empOpts: ['1–5','6–10','11–20','21–50','51–100','100+'] },
    sq: { cat: 'Sektori', name: 'Emri / Kompania *', city: 'Qyteti *', email: 'E-mail *', website: 'Faqja web', employees: 'Numri i punonjësve', desc: 'Përshkrim i shkurtër', descPH: 'Çfarë ofroni? Eksperiencë, projekte, avantazhet tuaja…', tagSuggest: 'Aftësi / Tags të sugjeruara', tagCustom: 'Shto tag të personalizuar', tagCustomPH: 'p.sh. Cybersecurity', tagAdd: '+ Shto', tagSelected: 'Tags të zgjedhura', availNote: '💬 Disponueshmëria komunikohet drejtpërdrejt me kërkesë.', send: 'Dërgo ✓', empOpts: ['1–5','6–10','11–20','21–50','51–100','100+'] },
    sv: { cat: 'Bransch', name: 'Namn / Företag *', city: 'Stad *', email: 'E-post *', website: 'Webbplats', employees: 'Antal anställda', desc: 'Kort beskrivning', descPH: 'Vad erbjuder du? Erfarenhet, projekt, USP…', tagSuggest: 'Föreslagna kompetenser / taggar', tagCustom: 'Lägg till egen tagg', tagCustomPH: 't.ex. Cybersecurity', tagAdd: '+ Lägg till', tagSelected: 'Valda taggar', availNote: '💬 Tillgänglighet kommuniceras direkt på förfrågan.', send: 'Skicka ✓', empOpts: ['1–5','6–10','11–20','21–50','100+'] },
  }
  const Lr = L[lang] || L.en
  const isFL = regType === t.regFL

  // ── PARTNER REGISTRATION FORM ─────────────────────────────────────────────
  if (isSP) {
    const PL = {
      de: { nameL:'Name / Organisation *', cityL:'Stadt *', emailL:'E-Mail *', phoneL:'Telefon', websiteL:'Website', focusL:'Branchen-Fokus', focusPH:'z.B. IT, Software, BPO, Produktion…', langsL:'EU-Sprachen', langsPH:'z.B. DE, EN, SV, FR', marketsL:'EU-Märkte', marketsPH:'z.B. Deutschland, Österreich, Schweiz, Schweden…', descL:'Über Sie / Ihre Organisation', descPH:'Beschreiben Sie Ihre Vertriebserfahrung, Netzwerk und warum Sie Kosovo-Unternehmen vermarkten möchten.', send:'Als Partner bewerben ✓', note:'💬 Ihr Antrag wird geprüft. Bei Eignung melden wir uns innerhalb von 48h.' },
      en: { nameL:'Name / Organisation *', cityL:'City *', emailL:'E-mail *', phoneL:'Phone', websiteL:'Website', focusL:'Industry focus', focusPH:'e.g. IT, Software, BPO, Production…', langsL:'EU languages', langsPH:'e.g. DE, EN, SV, FR', marketsL:'EU markets', marketsPH:'e.g. Germany, Austria, Switzerland, Sweden…', descL:'About you / your organisation', descPH:'Describe your sales experience, network and why you want to represent Kosova companies.', send:'Apply as partner ✓', note:'💬 Your application will be reviewed. We will contact you within 48h if there is a match.' },
      sq: { nameL:'Emri / Organizata *', cityL:'Qyteti *', emailL:'E-mail *', phoneL:'Telefon', websiteL:'Faqja web', focusL:'Fokusi i industrisë', focusPH:'p.sh. IT, Software, BPO…', langsL:'Gjuhët e BE-së', langsPH:'p.sh. DE, EN, SV', marketsL:'Tregjet e BE-së', marketsPH:'p.sh. Gjermani, Austri, Zvicër…', descL:'Rreth jush / organizatës', descPH:'Përshkruani eksperiencën tuaj të shitjeve dhe rrjetin.', send:'Apliko si partner ✓', note:"💬 Aplikimi juaj do të shqyrtohet. Do t'ju kontaktojmë brenda 48h." },
      sv: { nameL:'Namn / Organisation *', cityL:'Stad *', emailL:'E-post *', phoneL:'Telefon', websiteL:'Webbplats', focusL:'Branschfokus', focusPH:'t.ex. IT, Mjukvara, BPO…', langsL:'EU-språk', langsPH:'t.ex. DE, EN, SV, FR', marketsL:'EU-marknader', marketsPH:'t.ex. Tyskland, Österrike, Sverige…', descL:'Om dig / din organisation', descPH:'Beskriv din säljfarenhet, nätverk och varför du vill representera Kosovo-företag.', send:'Ansök som partner ✓', note:'💬 Din ansökan granskas. Vi återkommer inom 48h om det finns en matchning.' },
    }
    const Lp = PL[lang] || PL.en
    return (
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:11 }}>
          <div><label className="flabel">{Lp.nameL}</label><input className="inp" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
          <div><label className="flabel">{Lp.cityL}</label><input className="inp" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="Berlin, Wien, Stockholm…" /></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:11 }}>
          <div><label className="flabel">{Lp.emailL}</label><input className="inp" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
          <div><label className="flabel">{Lp.phoneL}</label><input className="inp" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} /></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:11 }}>
          <div><label className="flabel">{Lp.websiteL}</label><input className="inp" value={form.website} onChange={e=>setForm(f=>({...f,website:e.target.value}))} /></div>
          <div><label className="flabel">{Lp.langsL}</label><input className="inp" value={form.eu_langs} onChange={e=>setForm(f=>({...f,eu_langs:e.target.value}))} placeholder={Lp.langsPH} /></div>
        </div>
        <div style={{ marginBottom:11 }}><label className="flabel">{Lp.focusL}</label><input className="inp" value={form.focus} onChange={e=>setForm(f=>({...f,focus:e.target.value}))} placeholder={Lp.focusPH} /></div>
        <div style={{ marginBottom:11 }}><label className="flabel">{Lp.marketsL}</label><input className="inp" value={form.markets} onChange={e=>setForm(f=>({...f,markets:e.target.value}))} placeholder={Lp.marketsPH} /></div>
        <div style={{ marginBottom:16 }}><label className="flabel">{Lp.descL}</label><textarea className="inp" rows={3} style={{resize:'vertical'}} value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder={Lp.descPH} /></div>
        {/* Logo color */}
        <div style={{ marginBottom:14 }}>
          <label className="flabel">{lang==='sq'?'Ngjyra e profilit':'Profile color'}</label>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:6 }}>
            {['#58a6ff','#34d399','#f472b6','#fb923c','#a78bfa','#facc15','#2dd4bf','#6ee7b7','#fca5a5','#d4a843'].map(col=>(
              <button key={col} onClick={()=>setForm(f=>({...f,logoColor:col}))} style={{ width:28, height:28, borderRadius:'50%', background:col, border:'2px solid '+((form.logoColor||'#58a6ff')===col?'#fff':'transparent'), cursor:'pointer' }} />
            ))}
          </div>
        </div>
        <div style={{ background:'rgba(45,212,191,0.06)', border:'1px solid rgba(45,212,191,0.2)', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:12, color:G.muted }}>{Lp.note}</div>
        <button className="btn gbtn" style={{width:'100%'}} disabled={!form.name||!form.email} onClick={async () => {
          await insertProfile({
            name: form.name, city: form.city, email: form.email.toLowerCase(),
            phone: form.phone||null, website: form.website||null,
            languages: form.eu_langs||null,
            type: 'partner', cat: 'consulting', tier: 'free', verified: false,
            tags: form.focus ? form.focus.split(',').map(s=>s.trim()).filter(Boolean) : [],
            desc_de: form.desc||null, desc_en: form.desc||null, desc_sq: form.desc||null, desc_sv: form.desc||null,
            employees: form.markets||null,
            submitted_by: form.email.toLowerCase(),
          }).catch(console.error)
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
          <div style={{ width:52, height:52, borderRadius:12, overflow:'hidden', flexShrink:0, border:`2px solid ${form.logoColor||'#58a6ff'}44`, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${form.logoColor||'#58a6ff'}20,${form.logoColor||'#58a6ff'}46)` }}>
            {logoFile
              ? <img src={logoFile} alt="logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:form.logoColor||'#58a6ff' }}>{form.name ? form.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '??'}</span>
            }
          </div>

          <div style={{ flex:1 }}>
            {/* Upload button */}
            <label style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 13px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, cursor:'pointer', fontSize:12, color:G.text, fontFamily:"'DM Sans',sans-serif", marginBottom:8, width:'fit-content' }}>
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
              {['#58a6ff','#34d399','#f472b6','#fb923c','#a78bfa','#facc15','#2dd4bf','#6ee7b7','#fca5a5','#d4a843'].map(col => {
                const isSel = (form.logoColor||'#58a6ff') === col
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
        <div><label className="flabel">{Lr.email}</label><input className="inp" value={form.email} onChange={e => f('email', e.target.value)} /></div>
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
                background: on ? 'rgba(45,212,191,0.15)' : 'rgba(255,255,255,0.04)',
                color: on ? G.teal : G.muted,
                border: `1px solid ${on ? 'rgba(45,212,191,0.4)' : 'rgba(255,255,255,0.07)'}` }}>
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
        <div style={{ marginBottom: 16, background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 9, padding: '10px 14px' }}>
          <div style={{ fontSize: 10, color: G.teal, fontWeight: 700, marginBottom: 7, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{Lr.tagSelected}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {selectedTags.map(tag => (
              <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: 'rgba(45,212,191,0.15)', color: G.teal, border: '1px solid rgba(45,212,191,0.35)', borderRadius: 5, padding: '2px 8px', fontWeight: 600 }}>
                {tag}
                <span style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => toggleTag(tag)}>✕</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Availability note */}
      <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 9, padding: '10px 14px', marginBottom: 18, fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: G.muted }}>
        {Lr.availNote}
      </div>

      <button className="btn gbtn" style={{ width: '100%' }} disabled={!form.name || !form.email} onClick={async () => {
        const dbFields = formToDb(form, catChoice, selectedTags, regType, null)
        if (logoFile) dbFields.logo_data = logoFile
        const err = await insertProfile(dbFields)
        if (err) {
          const fallback = { ...dbFields }
          delete fallback.logo_color; delete fallback.logo_data
          const err2 = await insertProfile(fallback)
          if (err2) { alert('Submission failed: ' + (err2.message || JSON.stringify(err2))); return }
        }
        // Email admin about new pending profile
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
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:19 }}>{Ls.title}: {profile.name}</div>
            <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>Business Bridge Platform</div>
          </div>
          <button onClick={onClose} className="btn ghost" style={{ padding:'5px 10px', fontSize:15, alignSelf:'flex-start' }}>✕</button>
        </div>

        {/* Step progress */}
        {step !== 'done' && (
          <div style={{ display:'flex', gap:6, marginBottom:20 }}>
            {['1','2','3'].map((n,i) => (
              <div key={n} style={{ flex:1, height:3, borderRadius:2, background: i < stepIdx ? G.teal : i === stepIdx ? G.gold : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
        )}

        {/* ── STEP 1: Email ─────────────────────────────────────────────── */}
        {step === 'email' && (
          <>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>{Ls.step1h}</div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:16 }}>{Ls.step1sub}</p>
            <div style={{ marginBottom:18 }}>
              <label className="flabel">{Ls.emailLabel}</label>
              <input className="inp" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={profile.contact || 'name@firma.com'}
                onKeyDown={e => e.key==='Enter' && email && setStep('code')} />
            </div>
            <button className="btn gbtn" style={{ width:'100%' }} disabled={!email} onClick={async () => {
              const demoCode = Math.floor(100000 + Math.random() * 900000).toString()
              window.__selfEditCode = demoCode
              // Send real email with code
              const sent = await sendVerifyCode({ toEmail: email, code: demoCode, profileName: profile.name }).catch(() => null)
              if (!sent) {
                // Fallback: show code in UI if email fails
                console.log('Verification code (email failed):', demoCode)
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
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>{Ls.step2h}</div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:6 }}>{Ls.step2sub}</p>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:G.gold, marginBottom:18 }}>
              {Ls.step2demo}
              {window.__selfEditCode && <strong style={{ marginLeft:6 }}>→ {window.__selfEditCode}</strong>}
            </p>
            <div style={{ marginBottom:10 }}>
              <label className="flabel">{Ls.codeLabel}</label>
              <input className="inp" value={code} onChange={e => { setCode(e.target.value); setCodeError(false) }}
                placeholder="123456" maxLength={6} style={{ fontSize:22, letterSpacing:6, textAlign:'center' }}
                onKeyDown={e => e.key==='Enter' && verifyCode()} />
            </div>
            {codeError && <div style={{ fontSize:12, color:G.red, marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>⚠️ {Ls.codeErr}</div>}
            <button className="btn gbtn" style={{ width:'100%' }} disabled={code.length < 6}
              onClick={() => {
                const expected = window.__selfEditCode || DEMO_CODE
                if (code === expected) { window.__selfEditCode = null; setStep('form') }
                else setCodeError(true)
              }}>
              {Ls.verifyCode}
            </button>
          </>
        )}

        {/* ── STEP 3: Form ──────────────────────────────────────────────── */}
        {step === 'form' && (
          <>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>{Ls.step3h}</div>
            <div style={{ background:'rgba(45,212,191,0.07)', border:'1px solid rgba(45,212,191,0.22)', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:12, color:G.teal }}>
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
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:21, marginBottom:10 }}>{Ls.step4h}</div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", color:G.muted, fontSize:14, lineHeight:1.75, marginBottom:16 }}>{Ls.step4sub}</p>
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
    sp_sub: "rootsGTM's sales team works on the ground in Kosovo.",
    cta_title: 'Ready for your Kosova visit?',
    cta_email: 'concierge@bbplatform.com',
  })
  const [settingsSaved, setSettingsSaved] = React.useState('')
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
      }).catch(() => {})
      // Auto-refresh pending every 30s
      const interval = setInterval(() => {
        fetchAllProfilesAdmin().then(d => setProfiles(d)).catch(() => {})
        fetchPendingChanges().then(d => setPending(d)).catch(() => {})
      }, 30000)
      return () => clearInterval(interval)
    } else { setAuthFail(true) }
  }

  const loadData = async () => {
    setLoadingP(true); setLoadingC(true)
    fetchAllProfilesAdmin().then(d => { setProfiles(d); setLoadingP(false) }).catch(() => setLoadingP(false))
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
      name:      p.name || '',
      city:      p.city || '',
      contact:   p.contact || '',
      phone:     p.phone || '',
      website:   p.website || '',
      employees: p.employees || '',
      languages: p.languages || '',
      experience:p.experience || '',
      tier:      p.tier || 'free',
      type:      p.type || 'company',
      cat:       p.cat || 'software',
      tags:      Array.isArray(p.tags) ? p.tags.join(', ') : '',
      logoColor: p.logoColor || '#58a6ff',
      desc_de:   p.desc?.de || p.desc?.en || '',
      desc_en:   p.desc?.en || p.desc?.de || '',
      desc_sq:   p.desc?.sq || p.desc?.en || '',
      desc_sv:   p.desc?.sv || p.desc?.en || '',
    })
  }

  const saveEdit = async () => {
    setSaving(true)
    const updates = {
      name:       editForm.name,
      city:       editForm.city,
      email:      editForm.contact,
      phone:      editForm.phone || null,
      website:    editForm.website || null,
      employees:  editForm.employees || null,
      languages:  editForm.languages || null,
      experience: editForm.experience || null,
      tier:       editForm.tier,
      type:       editForm.type,
      cat:        editForm.cat,
      tags:       typeof editForm.tags === 'string' ? editForm.tags.split(',').map(s=>s.trim()).filter(Boolean) : (editForm.tags||[]),
      logo_color: editForm.logoColor || '#58a6ff',
      desc_de:    editForm.desc_de || editForm.desc_en || null,
      desc_en:    editForm.desc_en || editForm.desc_de || null,
      desc_sq:    editForm.desc_sq || editForm.desc_en || null,
      desc_sv:    editForm.desc_sv || editForm.desc_en || null,
    }
    const err = await updateProfile(editProfile.id, updates)
    if (!err) {
      setProfiles(ps => ps.map(x => x.id === editProfile.id ? {
        ...x, ...updates, contact: updates.email,
        desc: { de: updates.desc_de, en: updates.desc_en, sq: updates.desc_sq, sv: updates.desc_sv }
      } : x))
      setEditProfile(null)
    }
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
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, marginBottom: 6 }}>Admin</div>
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
    { id: 'pending_profiles', label: 'Neue Profile',     labelEn: 'New profiles',         icon: '🆕' },
    { id: 'profiles',         label: 'Alle Profile',     labelEn: 'All profiles',          icon: '📋' },
    { id: 'pending_changes',  label: 'Änderungen',       labelEn: 'Change requests',       icon: '✏️' },
    { id: 'partners',         label: 'Partner',          labelEn: 'Partners',              icon: '🤝' },
    { id: 'concierge',        label: 'Concierge',        labelEn: 'Concierge',             icon: '🗓' },
    { id: 'settings',         label: 'Einstellungen',    labelEn: 'Settings',              icon: '⚙️' },
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
        <span style={{ fontSize: 10, background: p.tier==='sponsored'?'rgba(251,146,60,0.1)':p.tier==='premium'?G.goldDim:'rgba(255,255,255,0.04)', color: p.tier==='sponsored'?G.orange:p.tier==='premium'?G.gold:G.muted, border: `1px solid ${p.tier==='sponsored'?'rgba(251,146,60,0.3)':p.tier==='premium'?G.goldBorder:'rgba(255,255,255,0.1)'}`, borderRadius: 5, padding: '2px 8px' }}>
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
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: G.bg, minHeight: '100vh', color: G.text, padding: '28px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`* { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22 }}>🔧 Admin Panel</div>
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
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 28, color: col }}>{v}</div>
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
            {loadingP && <div style={{ color: G.muted, padding: 20 }}>Loading…</div>}

            {/* ── Pending Partners ── */}
            {!loadingP && pendingPartners.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>🤝 Partner Applications</div>
                  <span style={{ background:'rgba(45,212,191,0.12)', color:G.teal, border:'1px solid rgba(45,212,191,0.3)', borderRadius:10, padding:'1px 8px', fontSize:11, fontWeight:700 }}>{pendingPartners.length}</span>
                </div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:G.muted, marginBottom:12 }}>
                  Sales partner applications. Verify to make them visible on the Concierge page.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {pendingPartners.map(p => (
                    <div key={p.id} style={{ background: G.surface, border:`1px solid rgba(45,212,191,0.25)`, borderRadius:12, padding:'14px 18px', display:'flex', gap:12, alignItems:'flex-start' }}>
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
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:12 }}>
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
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, marginBottom: 16 }}>
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
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, marginBottom: 16 }}>
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
                    <span style={{ fontSize: 11, background: 'rgba(45,212,191,0.1)', color: G.teal, border: '1px solid rgba(45,212,191,0.25)', borderRadius: 5, padding: '3px 9px', fontWeight: 600 }}>🔐 Code verified</span>
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
                  <div style={{ padding: '16px 20px', background: 'rgba(45,212,191,0.03)' }}>
                    <div style={{ fontSize: 11, color: G.teal, fontWeight: 700, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>✏️ Requested changes</div>
                    {chg.changes?.tags && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                        {chg.changes.tags.map(t2 => {
                          const isNew = !chg.original?.tags?.includes(t2)
                          return <span key={t2} style={{ fontSize: 11, background: isNew ? 'rgba(45,212,191,0.15)' : 'rgba(88,166,255,0.08)', color: isNew ? G.teal : '#8eb4d4', border: `1px solid ${isNew ? 'rgba(45,212,191,0.35)' : 'rgba(88,166,255,0.15)'}`, borderRadius: 4, padding: '2px 7px', fontWeight: isNew ? 700 : 400 }}>{isNew ? '+ ' : ''}{t2}</span>
                        })}
                        {chg.original?.tags?.filter(t2 => !chg.changes.tags.includes(t2)).map(t2 => (
                          <span key={t2} style={{ fontSize: 11, background: 'rgba(255,59,48,0.1)', color: G.red, border: '1px solid rgba(255,59,48,0.25)', borderRadius: 4, padding: '2px 7px', textDecoration: 'line-through' }}>{t2}</span>
                        ))}
                      </div>
                    )}
                    {chg.changes?.desc && <p style={{ fontSize: 12, color: 'rgba(232,228,217,0.8)', lineHeight: 1.6 }}>{chg.changes.desc.en || chg.changes.desc.de}</p>}
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
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:G.muted }}>
            Edit the partner details shown on the Concierge page. Changes are saved to the database.
          </p>

          {/* rootsGTM */}
          <div style={{ background:G.surface, border:`1px solid rgba(45,212,191,0.3)`, borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:G.teal, marginBottom:16 }}>🚀 rootsGTM — Exklusiver Partner</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div><label className="flabel">Organisation name</label><input className="inp" value={partners.rootsgtm_name||''} onChange={e=>setPartners(p=>({...p,rootsgtm_name:e.target.value}))} /></div>
              <div><label className="flabel">Email</label><input className="inp" value={partners.rootsgtm_email||''} onChange={e=>setPartners(p=>({...p,rootsgtm_email:e.target.value}))} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div><label className="flabel">Phone</label><input className="inp" value={partners.rootsgtm_phone||''} onChange={e=>setPartners(p=>({...p,rootsgtm_phone:e.target.value}))} /></div>
              <div><label className="flabel">Website</label><input className="inp" value={partners.rootsgtm_website||''} onChange={e=>setPartners(p=>({...p,rootsgtm_website:e.target.value}))} placeholder="rootsgtm.com" /></div>
            </div>
            <div><label className="flabel">Description (shown on Concierge page)</label><textarea className="inp" rows={3} style={{resize:'vertical'}} value={partners.rootsgtm_desc||''} onChange={e=>setPartners(p=>({...p,rootsgtm_desc:e.target.value}))} /></div>
          </div>

          {/* Kosova Government */}
          <div style={{ background:G.surface, border:`1px solid ${G.goldBorder}`, borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:G.gold, marginBottom:16 }}>🏛️ Kosova Government / InvestKosova</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
              <div><label className="flabel">Organisation name</label><input className="inp" value={partners.gov_name||''} onChange={e=>setPartners(p=>({...p,gov_name:e.target.value}))} /></div>
              <div><label className="flabel">Email</label><input className="inp" value={partners.gov_email||''} onChange={e=>setPartners(p=>({...p,gov_email:e.target.value}))} /></div>
            </div>
            <div style={{ marginBottom:12 }}><label className="flabel">Website</label><input className="inp" value={partners.gov_website||''} onChange={e=>setPartners(p=>({...p,gov_website:e.target.value}))} placeholder="invest-ks.com" /></div>
            <div><label className="flabel">Description</label><textarea className="inp" rows={3} style={{resize:'vertical'}} value={partners.gov_desc||''} onChange={e=>setPartners(p=>({...p,gov_desc:e.target.value}))} /></div>
          </div>

          {settingsSaved === 'partners' && <div style={{ fontSize:12, color:G.green }}>✓ Partners saved to database</div>}
          <button className="btn gbtn" style={{ alignSelf:'flex-start', padding:'11px 28px' }} onClick={savePartners} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save partners'}
          </button>
        </div>
      )}

      {/* ── TAB: CONCIERGE ────────────────────────────────────────────────── */}
      {tab === 'concierge' && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:G.muted }}>
            Edit the text content on the Concierge page.
          </p>
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:16 }}>Hero section</div>
            <div style={{ marginBottom:12 }}><label className="flabel">Hero title</label><input className="inp" value={concierge.hero_title||''} onChange={e=>setConcierge(cc=>({...cc,hero_title:e.target.value}))} /></div>
            <div style={{ marginBottom:12 }}><label className="flabel">Hero subtitle</label><textarea className="inp" rows={2} style={{resize:'vertical'}} value={concierge.hero_sub||''} onChange={e=>setConcierge(cc=>({...cc,hero_sub:e.target.value}))} /></div>
            <div><label className="flabel">Active partners note (e.g. "2 Active partners")</label><input className="inp" value={concierge.avail_note||''} onChange={e=>setConcierge(cc=>({...cc,avail_note:e.target.value}))} /></div>
          </div>
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:16 }}>Packages + Team</div>
            <div style={{ marginBottom:12 }}><label className="flabel">Packages subtitle</label><textarea className="inp" rows={2} style={{resize:'vertical'}} value={concierge.pkg_sub||''} onChange={e=>setConcierge(cc=>({...cc,pkg_sub:e.target.value}))} /></div>
            <div style={{ marginBottom:12 }}><label className="flabel">Sales team title</label><input className="inp" value={concierge.sp_title||''} onChange={e=>setConcierge(cc=>({...cc,sp_title:e.target.value}))} /></div>
            <div><label className="flabel">Sales team subtitle</label><textarea className="inp" rows={2} style={{resize:'vertical'}} value={concierge.sp_sub||''} onChange={e=>setConcierge(cc=>({...cc,sp_sub:e.target.value}))} /></div>
          </div>
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'22px 24px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, marginBottom:16 }}>CTA Banner</div>
            <div style={{ marginBottom:12 }}><label className="flabel">CTA title</label><input className="inp" value={concierge.cta_title||''} onChange={e=>setConcierge(cc=>({...cc,cta_title:e.target.value}))} /></div>
            <div><label className="flabel">Contact email (shown in booking modal)</label><input className="inp" value={concierge.cta_email||''} onChange={e=>setConcierge(cc=>({...cc,cta_email:e.target.value}))} /></div>
          </div>
          {settingsSaved === 'concierge' && <div style={{ fontSize:12, color:G.green }}>✓ Concierge content saved to database</div>}
          <button className="btn gbtn" style={{ alignSelf:'flex-start', padding:'11px 28px' }} onClick={saveConcierge} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save concierge content'}
          </button>
        </div>
      )}

      {/* ── TAB: SETTINGS ─────────────────────────────────────────────────── */}
      {tab === 'settings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Change password */}
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '22px 24px' }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>🔐 Change password</div>
            <div style={{ marginBottom: 10 }}><label className="flabel">New password (min. 8 chars)</label><input className="inp" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} /></div>
            <div style={{ marginBottom: 16 }}><label className="flabel">Confirm new password</label><input className="inp" type="password" value={newPwConfirm} onChange={e => setNewPwConfirm(e.target.value)} /></div>
            {pwChanged && <div style={{ fontSize: 12, color: G.green, marginBottom: 10 }}>✓ Password changed for this session</div>}
            <div style={{ fontSize: 11, color: G.muted, marginBottom: 12 }}>⚠️ This only changes the password for the current session. For permanent change, update ADMIN_PASSWORD in App.jsx before deploying.</div>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={changePassword}>Change password</button>
          </div>

          {/* Notification email */}
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '22px 24px' }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>📧 Notification email</div>
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
          <div style={{ background:'#0e1420', border:`1px solid ${G.goldBorder}`, borderRadius:20, width:'100%', maxWidth:680, maxHeight:'92vh', overflowY:'auto', display:'flex', flexDirection:'column' }}>

            {/* Modal header */}
            <div style={{ padding:'22px 28px 18px', borderBottom:`1px solid ${G.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'#0e1420', zIndex:1 }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20 }}>✏️ Edit Profile</div>
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
                <div><label className="flabel">Website</label><input className="inp" value={editForm.website||''} onChange={e=>setEditForm(f=>({...f,website:e.target.value}))} placeholder="firma.com" /></div>
                <div><label className="flabel">Employees</label><input className="inp" value={editForm.employees||''} onChange={e=>setEditForm(f=>({...f,employees:e.target.value}))} placeholder="15–30" /></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div><label className="flabel">Languages</label><input className="inp" value={editForm.languages||''} onChange={e=>setEditForm(f=>({...f,languages:e.target.value}))} placeholder="DE, EN, SQ" /></div>
                <div><label className="flabel">Experience (Freelancer)</label><input className="inp" value={editForm.experience||''} onChange={e=>setEditForm(f=>({...f,experience:e.target.value}))} placeholder="7 Jahre" /></div>
              </div>

              {/* ── Logo color ── */}
              <div style={{ marginBottom:12 }}>
                <label className="flabel">Profil-Farbe (Logo-Hintergrund)</label>
                <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:6 }}>
                  <div style={{ width:40, height:40, borderRadius:9, background:editForm.logoColor||'#58a6ff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:'#fff', flexShrink:0 }}>
                    {(editForm.name||'??').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {['#58a6ff','#34d399','#f472b6','#fb923c','#a78bfa','#facc15','#2dd4bf','#6ee7b7','#fca5a5','#d4a843'].map(col=>{
                      const isSelected = (editForm.logoColor||'#58a6ff') === col
                      return <button key={col} onClick={()=>setEditForm(f=>({...f,logoColor:col}))} style={{ width:26, height:26, borderRadius:'50%', background:col, border:'2px solid '+(isSelected?'#fff':'transparent'), cursor:'pointer' }} />
                    })}
                  </div>
                </div>
              </div>

              {/* ── Tags + Tier + Type + Cat ── */}
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12, marginBottom:12 }}>
                <div><label className="flabel">Tags / Skills (Komma-getrennt)</label><input className="inp" value={editForm.tags||''} onChange={e=>setEditForm(f=>({...f,tags:e.target.value}))} placeholder="React, Node.js, TypeScript…" /></div>
                <div><label className="flabel">Tier</label>
                  <select className="inp" value={editForm.tier||'free'} onChange={e=>setEditForm(f=>({...f,tier:e.target.value}))}>
                    <option value="free">🆓 Free</option>
                    <option value="premium">⭐ Premium</option>
                    <option value="sponsored">🚀 Sponsored</option>
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <div><label className="flabel">Typ</label>
                  <select className="inp" value={editForm.type||'company'} onChange={e=>setEditForm(f=>({...f,type:e.target.value}))}>
                    <option value="company">🏢 Firma</option>
                    <option value="freelancer">👤 Freelancer</option>
                    <option value="partner">🤝 Partner</option>
                  </select>
                </div>
                <div><label className="flabel">Kategorie</label>
                  <select className="inp" value={editForm.cat||'software'} onChange={e=>setEditForm(f=>({...f,cat:e.target.value}))}>
                    {CATS.map(cat=><option key={cat.id} value={cat.id}>{cat.icon} {cat.labels.en}</option>)}
                  </select>
                </div>
              </div>

              {/* ── Description (shared for all languages) ── */}
              <div style={{ marginBottom:12 }}>
                <label className="flabel">Beschreibung <span style={{fontWeight:400,textTransform:'none',fontSize:10,color:G.muted}}>(gilt für alle Sprachen)</span></label>
                <textarea className="inp" rows={3} style={{resize:'vertical'}} value={editForm.desc_en||editForm.desc_de||''} onChange={e=>setEditForm(f=>({...f,desc_en:e.target.value,desc_de:e.target.value,desc_sq:e.target.value,desc_sv:e.target.value}))} placeholder="Kurzbeschreibung des Angebots…" />
              </div>
              </div>

            {/* Sticky footer */}
            <div style={{ padding:'16px 28px', borderTop:`1px solid ${G.border}`, display:'flex', gap:12, position:'sticky', bottom:0, background:'#0e1420' }}>
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
    // sq / sq-AL / sq-XK    → sq  (Kosovo Albanian)
    // everything else        → en
    const loc = (navigator.language || navigator.languages?.[0] || 'en').toLowerCase()
    if (loc.startsWith('sq') || loc === 'ks') return 'sq'
    return 'en'
  })
  const [page, setPage] = useState('home')
  const [searchQ, setSearchQ] = useState('')
  const [mobileNav, setMobileNav] = useState(false)
  const [showReg, setShowReg] = useState(false)
  const [regType, setRegType] = useState(null)
  const [regDone, setRegDone] = useState(false)

  const [homeStats, setHomeStats] = React.useState({ companies: 0, freelancers: 0, partners: 2, total: 0 })
  const [siteContent, setSiteContent] = useState({})

  // Pre-load verified profiles + site content
  useEffect(() => {
    fetchProfiles().then(data => {
      if (data.length > 0) {
        window.__techgateProfiles = data
        setHomeStats({
          companies:   data.filter(p => p.type === 'company').length,
          freelancers: data.filter(p => p.type === 'freelancer').length,
          partners:    2 + data.filter(p => p.type === 'partner').length, // 2 = rootsGTM + Kosovo Gov
          total:       data.length,
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
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: G.bg, minHeight: '100vh', color: G.text }}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: `${G.bg}f2`, backdropFilter: 'blur(18px)', borderBottom: `1px solid ${G.border}`, padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setPage('home')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', padding: 0 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#d4a843,#b8892e)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🇽🇰</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: G.text }}>Kosova <span style={{ color: G.gold }}>Business Hub</span></div>
            <div style={{ fontSize: 9, color: G.muted, letterSpacing: '0.7px', textTransform: 'uppercase' }}>{t.tagline}</div>
          </div>
        </button>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Desktop nav links */}
          <div className="nav-links" style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {[['home', t.navHome], ['directory', t.navDir], ['concierge', t.navConcierge], ['gov', t.navGov]].map(([p, l]) => (
              <button key={p} className={`btn navl${page === p ? ' on' : ''}`} onClick={() => setPage(p)}
                style={p === 'concierge' ? { color: page === 'concierge' ? G.teal : 'rgba(45,212,191,0.45)' } : {}}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ width: 1, height: 18, background: G.border, margin: '0 6px' }} />
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.border}`, borderRadius: 8, padding: 3 }}>
            {['en', 'sq'].map(l => (
              <button key={l} onClick={() => setLang(l)} className="btn" style={{ padding: '4px 9px', fontSize: 11, fontWeight: 700, background: lang === l ? 'rgba(212,168,67,0.18)' : 'transparent', color: lang === l ? G.gold : G.muted, border: `1px solid ${lang === l ? G.goldBorder : 'transparent'}`, borderRadius: 6 }}>
                {FLAGS[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="btn gbtn nav-reg-btn" style={{ marginLeft: 8, padding: '8px 16px', fontSize: 12 }} onClick={() => setShowReg(true)}>{t.registerBtn}</button>
          <button className="hamburger" onClick={() => setMobileNav(v => !v)} style={{ display:'none', flexDirection:'column', gap:5, background:'transparent', border:'none', cursor:'pointer', padding:8, marginLeft:4 }}>
            <span style={{ display:'block', width:22, height:2, background:'rgba(232,228,217,0.7)', borderRadius:1, transition:'all 0.2s', transform: mobileNav ? 'rotate(45deg) translate(5px,5px)' : 'none' }} />
            <span style={{ display:'block', width:22, height:2, background:'rgba(232,228,217,0.7)', borderRadius:1, transition:'all 0.2s', opacity: mobileNav ? 0 : 1 }} />
            <span style={{ display:'block', width:22, height:2, background:'rgba(232,228,217,0.7)', borderRadius:1, transition:'all 0.2s', transform: mobileNav ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }} />
          </button>
        </div>
      </nav>
      {mobileNav && (
        <div style={{ position:'fixed', top:64, left:0, right:0, background:'#0e1420', borderBottom:'1px solid rgba(255,255,255,0.07)', zIndex:99, padding:'12px 16px 20px', display:'flex', flexDirection:'column', gap:4 }}>
          {[['home',t.navHome,'🏠'],['directory',t.navDir,'🏢'],['concierge',t.navConcierge,'🤝'],['gov',t.navGov,'🏛️']].map(([pg,l,ic]) => (
            <button key={pg} onClick={() => { setPage(pg); setMobileNav(false) }}
              style={{ background: page===pg?'rgba(212,168,67,0.1)':'transparent', color: page===pg?'#d4a843':'rgba(232,228,217,0.75)', border:'none', padding:'12px 14px', borderRadius:10, cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans',sans-serif", fontSize:15, fontWeight:500, display:'flex', alignItems:'center', gap:10, width:'100%' }}>
              <span>{ic}</span>{l}
            </button>
          ))}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.07)', marginTop:8, paddingTop:12, display:'flex', gap:6 }}>
            {['en','sq'].map(l => (
              <button key={l} onClick={() => { setLang(l) }}
                style={{ flex:1, padding:'8px 4px', borderRadius:8, background: lang===l?'rgba(212,168,67,0.15)':'rgba(255,255,255,0.04)', color: lang===l?'#d4a843':'rgba(232,228,217,0.45)', border:'1px solid '+(lang===l?'rgba(212,168,67,0.22)':'rgba(255,255,255,0.07)'), cursor:'pointer', fontWeight:700, fontSize:12 }}>
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
          <section style={{ padding: '80px 48px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: `radial-gradient(ellipse 70% 50% at 50% -5%,rgba(212,168,67,0.12) 0%,transparent 65%),${G.bg}` }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.016) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
            <div className="fu" style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 100, padding: '5px 16px', marginBottom: 22 }}>
                <span style={{ width: 7, height: 7, background: G.green, borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 8px ${G.green}` }} />
                <span style={{ fontSize: 12, color: G.gold, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>
                  {(window.__techgateProfiles||[]).filter(p => p.verified !== false).length > 0
                    ? `${(window.__techgateProfiles||[]).filter(p => p.verified !== false).length} ${lang==='sq' ? 'Regjistrimet e Verifikuara · Live' : 'Verified Listings · Live'}`
                    : (lang==='sq' ? 'Platforma e Biznesit Kosova · Live' : 'Business Bridge Platform · Live')
                  }
                </span>
              </div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,5vw,56px)', letterSpacing: '-1.5px', lineHeight: 1.08, marginBottom: 16 }}>
                {t.h1a}<br /><span style={{ color: G.gold }}>{t.h1b}</span>
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, color: G.muted, lineHeight: 1.82, fontWeight: 300, maxWidth: 520, margin: '0 auto 32px' }}>{t.heroSub}</p>
              <div style={{ display: 'flex', gap: 7, maxWidth: 540, margin: '0 auto 32px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.goldBorder}`, borderRadius: 12, padding: 5 }}>
                <input className="inp" style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 15 }} placeholder={t.searchPH}
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setPage('directory') } }} />
                <button className="btn gbtn" style={{ flexShrink: 0 }} onClick={() => setPage('directory')}>{t.searchBtn} →</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 30, flexWrap: 'wrap' }}>
                {[[String(homeStats.companies||0), t.stat1], [String(homeStats.freelancers||0), t.stat2], [String(homeStats.partners||0), t.stat3], [homeStats.total > 0 ? String(homeStats.total) : (homeStats.companies+homeStats.freelancers+homeStats.partners > 0 ? String(homeStats.companies+homeStats.freelancers+homeStats.partners) : '…'), lang==='sq'?'Gjithsej':'Total listings']].map(([n, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: G.gold }}>{n}</div>
                    <div style={{ fontSize: 11, color: G.muted, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section style={{ padding: '44px 48px 0', maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 18 }}>{t.howTitle}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 44 }}>
              {[[G.blue, '🔍', t.f1t, t.f1d, 'directory'], [G.teal, '🤝', t.f3t, t.f3d, 'concierge']].map(([col, ic, title, desc, pg]) => (
                <div key={pg} className="card fu" style={{ padding: 24, cursor: 'pointer', background: col === G.teal ? 'rgba(45,212,191,0.04)' : G.card, border: `1px solid ${col === G.teal ? 'rgba(45,212,191,0.2)' : G.border}` }} onClick={() => setPage(pg)}>
                  <div style={{ fontSize: 26, marginBottom: 11 }}>{ic}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: col, marginBottom: 7 }}>{title}</div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, lineHeight: 1.7 }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section style={{ padding: '0 48px 0', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20 }}>{t.catsTitle}</h2>
              <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => setPage('directory')}>{t.viewAll}</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(165px,1fr))', gap: 9, marginBottom: 44 }}>
              {CATS.map((c, i) => (
                <div key={c.id} className="card fu" style={{ padding: '14px 13px', cursor: 'pointer', animationDelay: `${i * 0.04}s` }} onClick={() => setPage('directory')}>
                  <div style={{ fontSize: 21, marginBottom: 6 }}>{c.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{c.labels[lang]}</div>
                  <div style={{ fontSize: 11, color: c.color }}>{(window.__techgateProfiles||[]).filter(p=>p.cat===c.id&&p.verified!==false).length || ''}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── TOP VERIFIED LISTINGS ── */}
          {(window.__techgateProfiles||[]).filter(p => p.verified !== false).length > 0 && (
            <section style={{ padding: '0 48px 44px', maxWidth: 1200, margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 3 }}>{t.topTitle}</h2>
                  <div style={{ fontSize: 12, color: G.muted, fontFamily: "'DM Sans',sans-serif" }}>{t.rankSub}</div>
                </div>
                <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => setPage('directory')}>{t.viewAll}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 12 }}>
                {(window.__techgateProfiles||[])
                  .filter(p => p.verified !== false)
                  .sort((a,b) => (b.tier==='sponsored'?2:b.tier==='premium'?1:0)-(a.tier==='sponsored'?2:a.tier==='premium'?1:0))
                  .slice(0, 6)
                  .map(p => {
                    const isSp = p.tier === 'sponsored'
                    const isPr = p.tier === 'premium'
                    const desc = p.desc?.[lang] || p.desc?.en || ''
                    return (
                      <div key={p.id} className="card fu" style={{ padding: 0, overflow: 'hidden',
                        borderColor: isSp ? 'rgba(251,146,60,0.4)' : isPr ? 'rgba(212,168,67,0.3)' : G.border,
                        background: isSp ? 'rgba(251,146,60,0.03)' : isPr ? 'rgba(212,168,67,0.025)' : G.card }}>
                        {isSp && <div className="sp-bar" />}
                        {isPr && <div className="pr-bar" />}
                        <div style={{ padding: 16 }}>
                          <div style={{ display: 'flex', gap: 10, marginBottom: 9 }}>
                            <Logo text={p.logo} color={p.logoColor} url={p.logoUrl} size={40} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily:"'Syne',sans-serif", fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                              <div style={{ fontSize: 11, color: G.muted }}>📍 {p.city} · {catLabel(p.cat, lang)}</div>
                            </div>
                            {p.verified && <span style={{ fontSize: 10, background: 'rgba(52,199,89,0.1)', color: G.green, border: '1px solid rgba(52,199,89,0.2)', borderRadius: 5, padding: '2px 7px', alignSelf: 'flex-start', flexShrink: 0 }}>{t.verified}</span>}
                          </div>
                          {desc && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize: 12, color: 'rgba(232,228,217,0.65)', lineHeight: 1.6, marginBottom: 9 }}>{desc.slice(0, 90)}{desc.length > 90 ? '…' : ''}</p>}
                          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 11 }}>
                            {(p.tags||[]).slice(0,4).map(tag => <span key={tag} className="tag">{tag}</span>)}
                          </div>
                          <button className="btn gbtn" style={{ width:'100%', padding:'8px', fontSize:12 }} onClick={() => setPage('directory')}>{t.sendReq}</button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </section>
          )}
          {/* ── AD BANNER STRIP ── */}
          <section style={{ padding: '0 48px 16px', maxWidth: 1200, margin: '0 auto' }}>
            <AdBanner slot="banner" lang={lang} />
          </section>

          <section style={{ padding: '0 48px 60px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 18, padding: '40px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, letterSpacing: '-0.3px', marginBottom: 7 }}>{t.ctaTitle}</h2>
                <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.7, maxWidth: 400 }}>{t.ctaSub}</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <button className="btn gbtn" style={{ fontSize: 14, padding: '12px 24px' }} onClick={() => setShowReg(true)}>{t.ctaBtn}</button>
                <button className="btn ghost" onClick={() => setPage('gov')}>{t.ctaGov}</button>
              </div>
            </div>
          </section>
        </>
      )}
      {page === 'directory'  && <DirectoryPage lang={lang} t={t} initialQ={searchQ} onQClear={() => setSearchQ('')} />}
      {page === 'concierge'  && <ConciergePage lang={lang} t={t} content={siteContent} />}
      {page === 'gov'        && <GovPage lang={lang} t={t} content={siteContent} />}

      {/* ── REGISTER ── */}
      {showReg && !regDone && (
        <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && (setShowReg(false), setRegType(null))}>
          <div className="modal su">
            {!regType ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19 }}>{t.regTitle}</div>
                  <ModalClose onClose={() => setShowReg(false)} />
                </div>
                {/* Kosovo-based: Firma & Freelancer */}
                <div style={{ fontSize:10, color:G.muted, textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700, marginBottom:7 }}>
                  🇽🇰 {lang==='sq'?'Bazuar në Kosovë':'Kosova-based'}
                </div>
                <div style={{ display: 'flex', gap: 9, marginBottom:12 }}>
                  {[[t.regComp, t.regCompS], [t.regFL, t.regFLS]].map(([l, sub], i) => (
                    <div key={i} onClick={() => setRegType(l)}
                      style={{ flex:1, padding:'15px 9px', border:`1px solid ${G.border}`, borderRadius:12, cursor:'pointer', textAlign:'center', transition:'all 0.18s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor=G.goldBorder; e.currentTarget.style.background=G.goldDim }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor=G.border; e.currentTarget.style.background='transparent' }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:4 }}>{l}</div>
                      <div style={{ fontSize:11, color:G.muted }}>{sub}</div>
                    </div>
                  ))}
                </div>
                {/* Partner */}
                <div style={{ fontSize:10, color:G.teal, textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700, marginBottom:7 }}>
                  🤝 {lang==='sq'?'Bëhu partner':'Become a partner'}
                </div>
                <div style={{ display: 'flex', gap: 9 }}>
                  {[[t.regSP, t.regSPS, true]].map(([l, sub, isPartner], i) => (                    <div key={i} onClick={() => setRegType(l)}
                      style={{ flex:1, padding:'15px 9px',
                        border:`1px solid rgba(45,212,191,0.35)`,
                        background:'rgba(45,212,191,0.05)',
                        borderRadius:12, cursor:'pointer', textAlign:'center', transition:'all 0.18s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(45,212,191,0.7)'; e.currentTarget.style.background='rgba(45,212,191,0.12)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(45,212,191,0.35)'; e.currentTarget.style.background='rgba(45,212,191,0.05)' }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:4, color:G.teal }}>{l}</div>
                      <div style={{ fontSize:11, color:'rgba(45,212,191,0.6)' }}>{sub}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19 }}>{regType}</div>
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
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.regDoneTitle}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}>{t.regDoneSub}</p>
            <button className="btn gbtn" style={{ width: '100%' }} onClick={() => { setRegDone(false); setShowReg(false); setRegType(null) }}>{t.close}</button>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${G.border}`, padding: '16px 44px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.muted, flexWrap: 'wrap', gap: 8 }}>
        <div>{t.footer}</div>
        <div style={{ display: 'flex', gap: 16 }}>
          {t.footLinks.map(l => <span key={l} style={{ cursor: 'pointer' }}>{l}</span>)}
          {/* Admin entry — invisible until hovered */}
          <span onClick={() => setShowAdmin(true)} style={{ cursor: 'pointer', opacity: 0, transition: 'opacity 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0'}>⚙</span>
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
    .partner-cards-grid{grid-template-columns:1fr !important;}
    .match-pills{gap:5px !important;}
    .footer-row{flex-direction:column !important;gap:8px !important;}
  }

  @media(min-width: 641px) and (max-width: 960px){
    .home-hero{padding:36px 24px !important;}
    .home-section{padding:0 24px !important;}
    .dir-page,.match-page{padding:20px 24px !important;}
    .feat-grid{grid-template-columns:1fr 1fr !important;}
    .pkg-grid{grid-template-columns:1fr 1fr !important;}
    .admin-stats-grid{grid-template-columns:repeat(2,1fr) !important;}
  }
`}</style>
