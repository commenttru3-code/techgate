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
body{background:#080c14;margin:0;-webkit-font-smoothing:antialiased;}
::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-thumb{background:#2a3040;border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideUp{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:translateY(0);}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes glow{0%,100%{box-shadow:0 0 0 rgba(212,168,67,0);}50%{box-shadow:0 0 24px rgba(212,168,67,0.24);}}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
@keyframes ticker-scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
.fu{animation:fadeUp 0.38s cubic-bezier(0.4,0,0.2,1) both;}
.fi{animation:fadeIn 0.26s ease both;}
.su{animation:slideUp 0.3s cubic-bezier(0.4,0,0.2,1) both;}
.sp{animation:spin 0.7s linear infinite;}
.glow{animation:glow 3s ease infinite;}
.pg{animation:pulse 2s ease infinite;}
.btn{border:none;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.18s cubic-bezier(0.4,0,0.2,1);border-radius:8px;-webkit-tap-highlight-color:transparent;}
.btn:active{transform:scale(0.97) !important;}
.gbtn{background:#d4a843;color:#080c14;padding:10px 22px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;letter-spacing:0.3px;}
.gbtn:hover{background:#e5ba55;transform:translateY(-2px);box-shadow:0 8px 24px rgba(212,168,67,0.32);}
.gbtn:disabled{opacity:0.38;cursor:not-allowed;transform:none !important;box-shadow:none;}
.ghost{background:transparent;color:rgba(232,228,217,0.5);padding:9px 16px;font-size:13px;border:1px solid rgba(255,255,255,0.09);font-weight:500;}
.ghost:hover{color:#e8e4d9;border-color:rgba(212,168,67,0.35);background:rgba(212,168,67,0.04);}
.teal-btn{background:linear-gradient(135deg,#2dd4bf,#0d9488);color:white;padding:10px 22px;font-family:'Syne',sans-serif;font-weight:700;font-size:13px;}
.teal-btn:hover{opacity:0.9;transform:translateY(-2px);box-shadow:0 8px 24px rgba(45,212,191,0.28);}
.card{background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.07);border-radius:14px;transition:all 0.24s cubic-bezier(0.4,0,0.2,1);}
.card:hover{background:rgba(255,255,255,0.04);border-color:rgba(212,168,67,0.22);transform:translateY(-2px);box-shadow:0 16px 40px rgba(0,0,0,0.32);}
.inp{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:9px;padding:10px 13px;color:#e8e4d9;font-size:14px;outline:none;width:100%;font-family:'DM Sans',sans-serif;transition:border-color 0.18s,box-shadow 0.18s,background 0.18s;}
.inp:focus{border-color:#d4a843;box-shadow:0 0 0 3px rgba(212,168,67,0.09);background:rgba(255,255,255,0.07);}
.inp::placeholder{color:rgba(232,228,217,0.26);}
.inp:hover:not(:focus){border-color:rgba(255,255,255,0.18);}
select.inp{cursor:pointer;}
textarea.inp{line-height:1.6;}
.navl{background:transparent;color:rgba(232,228,217,0.5);padding:7px 11px;font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;border:none;cursor:pointer;border-radius:7px;transition:all 0.16s;}
.navl:hover{color:#e8e4d9;background:rgba(255,255,255,0.05);}
.navl.on{color:#d4a843;background:rgba(212,168,67,0.1);}
.tag{display:inline-block;background:rgba(88,166,255,0.08);color:#8eb4d4;border:1px solid rgba(88,166,255,0.15);border-radius:5px;padding:2px 7px;font-size:11px;transition:all 0.16s;}
.modal-bg{position:fixed;inset:0;background:rgba(4,8,20,0.88);z-index:200;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(12px);}
.modal{background:#0e1420;border:1px solid rgba(212,168,67,0.22);border-radius:18px;padding:28px 24px;max-width:500px;width:100%;max-height:92vh;overflow-y:auto;}
.flabel{display:block;font-family:'Syne',sans-serif;font-size:11px;font-weight:600;color:rgba(232,228,217,0.42);margin-bottom:5px;letter-spacing:0.8px;text-transform:uppercase;}
.sp-bar{height:3px;border-radius:14px 14px 0 0;background:linear-gradient(90deg,#fb923c,#fdba74,rgba(251,146,60,0.3));}
.pr-bar{height:3px;border-radius:14px 14px 0 0;background:linear-gradient(90deg,#d4a843,#fde68a);}
.sector-pills-mobile{display:none;}
.sector-pills-desktop{display:flex;}
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
  .conc-partner-card{padding:14px 13px !important;}
  .conc-partner-card .partner-feat-grid{grid-template-columns:1fr 1fr !important;gap:6px !important;}
  .conc-partner-card h-name{font-size:16px !important;}
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

// ─── PROFILE DETAIL MODAL ────────────────────────────────────────────────────
function ProfileDetailModal({ p, lang, t, onClose, onContact }) {
  if (!p) return null
  const isFL = p.type === 'freelancer'
  const isPartner = p.type === 'partner'
  const isSp = p.tier === 'sponsored'
  const website = p.website ? p.website.replace(/^https?:\/\//,'') : null
  const accentColor = isPartner ? '#2dd4bf' : isSp ? '#fb923c' : '#d4a843'

  if (isSp && !isPartner) {
    // ── PREMIUM SPONSORED MODAL ──────────────────────────────────────────────
    return (
      <div className="modal-bg fi" onClick={e => e.target===e.currentTarget && onClose()}>
        <div style={{ background:'#0e1420', border:'1px solid rgba(251,146,60,0.45)', borderRadius:24, width:'100%', maxWidth:660, maxHeight:'92vh', overflowY:'auto', position:'relative', boxShadow:'0 24px 80px rgba(0,0,0,0.6),0 0 60px rgba(251,146,60,0.08)' }}>
          {/* Hero header */}
          <div style={{ position:'relative', minHeight:160, background:`linear-gradient(135deg,${p.logoColor||'#fb923c'}22 0%,rgba(251,146,60,0.08) 50%,rgba(212,168,67,0.06) 100%)`, borderRadius:'24px 24px 0 0', overflow:'hidden', padding:'28px 28px 20px' }}>
            <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 80% 30%,rgba(251,146,60,0.15),transparent 55%),radial-gradient(circle at 20% 80%,rgba(212,168,67,0.1),transparent 50%)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#fb923c,#f59e0b,rgba(251,146,60,0.4),transparent)' }} />
            {/* Close */}
            <button onClick={onClose} style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:G.text, fontSize:16, zIndex:2 }}>✕</button>
            <div style={{ display:'flex', gap:18, alignItems:'flex-end', position:'relative' }}>
              {/* Large logo */}
              <div style={{ width:88, height:88, borderRadius:20, overflow:'hidden', flexShrink:0, border:'3px solid rgba(251,146,60,0.5)', boxShadow:'0 0 32px rgba(251,146,60,0.25)', display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${p.logoColor||'#fb923c'}22,${p.logoColor||'#fb923c'}44)` }}>
                {p.logoUrl ? <img src={p.logoUrl} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:28, color:p.logoColor||'#fb923c' }}>{(p.logo||p.name||'?').slice(0,2)}</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', gap:7, marginBottom:7, flexWrap:'wrap' }}>
                  <span style={{ fontSize:10, background:'rgba(251,146,60,0.18)', color:'#fb923c', border:'1px solid rgba(251,146,60,0.4)', borderRadius:20, padding:'3px 11px', fontWeight:800, letterSpacing:'0.3px' }}>🚀 SPONSORED</span>
                  {p.verified && <span style={{ fontSize:10, background:'rgba(52,199,89,0.12)', color:G.green, border:'1px solid rgba(52,199,89,0.25)', borderRadius:20, padding:'3px 11px', fontWeight:700 }}>✓ VERIFIED</span>}
                </div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, letterSpacing:'-0.5px', marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:12, color:'rgba(232,228,217,0.6)', display:'flex', gap:10, flexWrap:'wrap' }}>
                  {p.city && <span>📍 {p.city}</span>}
                  {p.cat && <span>· {catLabel(p.cat, lang)}</span>}
                  {isFL && p.languages && <span>· 🗣 {p.languages}</span>}
                  {!isFL && p.employees && <span>· 👥 {p.employees}</span>}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding:'24px 28px 28px' }}>
            {/* Description */}
            {(p.desc?.[lang]||p.desc?.en) && (
              <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:15, color:'rgba(232,228,217,0.85)', lineHeight:1.8, marginBottom:20 }}>
                {p.desc[lang]||p.desc.en}
              </p>
            )}

            {/* Availability badge */}
            {p.availability && (
              <div style={{ marginBottom:18 }}>
                <span style={{ fontSize:12, fontWeight:700, padding:'5px 14px', borderRadius:20, fontFamily:"'DM Sans',sans-serif",
                  background: p.availability==='available'?'rgba(52,199,89,0.12)':p.availability==='limited'?'rgba(251,146,60,0.12)':'rgba(255,255,255,0.06)',
                  color: p.availability==='available'?G.green:p.availability==='limited'?G.orange:G.muted,
                  border: `1px solid ${p.availability==='available'?'rgba(52,199,89,0.3)':p.availability==='limited'?'rgba(251,146,60,0.3)':'rgba(255,255,255,0.1)'}` }}>
                  {p.availability==='available'?'🟢 Available now':p.availability==='limited'?'🟡 Limited capacity':'🔴 Currently booked'}
                </span>
              </div>
            )}

            {/* Tags */}
            {(p.tags||[]).length>0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontSize:11, color:'rgba(251,146,60,0.7)', marginBottom:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Expertise & Services</div>
                <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
                  {p.tags.map(tg=><span key={tg} style={{ fontSize:12, background:'rgba(251,146,60,0.1)', color:'#fb923c', border:'1px solid rgba(251,146,60,0.25)', borderRadius:20, padding:'5px 14px', fontWeight:600 }}>{tg}</span>)}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {p.markets && <div style={{ background:'rgba(251,146,60,0.05)', border:'1px solid rgba(251,146,60,0.15)', borderRadius:10, padding:'10px 14px' }}>
                <div style={{ fontSize:10, color:'rgba(251,146,60,0.6)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.5px' }}>Markets</div>
                <div style={{ fontSize:13, fontWeight:600 }}>🌍 {p.markets}</div>
              </div>}
              <div style={{ background:'rgba(251,146,60,0.05)', border:'1px solid rgba(251,146,60,0.15)', borderRadius:10, padding:'10px 14px' }}>
                <div style={{ fontSize:10, color:'rgba(251,146,60,0.6)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.5px' }}>Engagement</div>
                <div style={{ fontSize:13, fontWeight:600 }}>💼 {t.rateNote}</div>
              </div>
            </div>

            {/* Premium sections */}
            {p.prevCompanies && (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:11, color:'rgba(251,146,60,0.7)', marginBottom:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Previous clients & companies</div>
                <div style={{ background:'rgba(251,146,60,0.04)', border:'1px solid rgba(251,146,60,0.15)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'rgba(232,228,217,0.8)' }}>🏢 {p.prevCompanies}</div>
              </div>
            )}

            {p.featuredProject && (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:11, color:'rgba(251,146,60,0.7)', marginBottom:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Featured project</div>
                <div style={{ background:'rgba(251,146,60,0.04)', border:'1px solid rgba(251,146,60,0.15)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'rgba(232,228,217,0.8)' }}>🎯 {p.featuredProject}</div>
              </div>
            )}

            {p.certifications && (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:11, color:'rgba(251,146,60,0.7)', marginBottom:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Certifications & Awards</div>
                <div style={{ background:'rgba(251,146,60,0.04)', border:'1px solid rgba(251,146,60,0.15)', borderRadius:10, padding:'12px 14px', fontSize:13, color:'rgba(232,228,217,0.8)' }}>🏅 {p.certifications}</div>
              </div>
            )}

            {p.testimonial && (
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:11, color:'rgba(251,146,60,0.7)', marginBottom:8, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.8px' }}>Client testimonial</div>
                <blockquote style={{ background:'rgba(251,146,60,0.04)', border:'1px solid rgba(251,146,60,0.2)', borderLeft:'3px solid rgba(251,146,60,0.5)', borderRadius:'0 10px 10px 0', padding:'12px 16px', fontSize:13, color:'rgba(232,228,217,0.85)', fontStyle:'italic', lineHeight:1.7, margin:0 }}>💬 {p.testimonial}</blockquote>
              </div>
            )}

            {/* Social links */}
            {(p.linkedin || p.github) && (
              <div style={{ display:'flex', gap:9, marginBottom:18, flexWrap:'wrap' }}>
                {p.linkedin && <a href={`https://${p.linkedin.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'rgba(251,146,60,0.06)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:9, color:'#fb923c', textDecoration:'none', fontSize:12, fontWeight:600 }}>in LinkedIn ↗</a>}
                {p.github && <a href={`https://${p.github.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'rgba(251,146,60,0.06)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:9, color:'#fb923c', textDecoration:'none', fontSize:12, fontWeight:600 }}>⬡ Portfolio ↗</a>}
              </div>
            )}

            {/* Video intro */}
            {p.videoUrl && (
              <div style={{ marginBottom:18 }}>
                <a href={p.videoUrl.startsWith('http')?p.videoUrl:`https://${p.videoUrl}`} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', background:'rgba(251,146,60,0.06)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:12, textDecoration:'none' }}>
                  <span style={{ width:36, height:36, borderRadius:8, background:'rgba(251,146,60,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>▶</span>
                  <div><div style={{ fontSize:13, fontWeight:700, color:'#fb923c' }}>Watch intro video</div><div style={{ fontSize:11, color:'rgba(251,146,60,0.6)', marginTop:1 }}>{p.videoUrl.replace(/^https?:\/\//,'').slice(0,40)}</div></div>
                </a>
              </div>
            )}

            {/* Social / website */}
            {website && (
              <div style={{ background:'rgba(251,146,60,0.06)', border:'1px solid rgba(251,146,60,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:18 }}>🌐</span>
                <a href={`https://${website}`} target="_blank" rel="noopener noreferrer" style={{ color:'#fb923c', textDecoration:'none', fontWeight:600, fontSize:14 }}>{website} ↗</a>
              </div>
            )}

            {/* CTAs */}
            <div style={{ display:'flex', gap:10 }}>
              {p.contact && (
                <button className="btn" style={{ flex:1, padding:'13px', fontSize:14, fontWeight:700, background:'linear-gradient(135deg,#fb923c,#f59e0b)', color:'#0e1420', border:'none', borderRadius:12, cursor:'pointer' }}
                  onClick={()=>{ onContact(p); onClose() }}>
                  ✉️ {lang==='sq'?'Kontakto':'Contact Now'}
                </button>
              )}
              {website && (
                <a href={`https://${website}`} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'13px 20px', background:'rgba(251,146,60,0.1)', border:'1px solid rgba(251,146,60,0.3)', borderRadius:12, color:'#fb923c', textDecoration:'none', fontSize:13, fontWeight:600 }}>
                  🌐 {lang==='sq'?'Vizito':'Visit'}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── STANDARD MODAL (free / partner) ──────────────────────────────────────────
  return (
    <div className="modal-bg fi" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:560, maxHeight:'90vh', overflowY:'auto', padding:0, borderRadius:20, border:`1px solid ${accentColor}40` }}>
        <div style={{ height:3, background:`linear-gradient(90deg,${accentColor},${accentColor}88,transparent)`, borderRadius:'20px 20px 0 0' }} />
        <div style={{ padding:'24px 26px 22px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18 }}>
            <div style={{ display:'flex', gap:14, alignItems:'center' }}>
              <div style={{ width:60, height:60, borderRadius:14, overflow:'hidden', flexShrink:0, border:`2px solid ${accentColor}44`, boxShadow:`0 0 16px ${accentColor}14`, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${p.logoColor||accentColor}18,${p.logoColor||accentColor}36)` }}>
                {p.logoUrl ? <img src={p.logoUrl} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:p.logoColor||accentColor }}>{(p.logo||p.name||'?').slice(0,2)}</span>}
              </div>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, marginBottom:4 }}>{p.name}</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                  {isPartner && <span style={{ fontSize:10, background:'rgba(45,212,191,0.12)', color:'#2dd4bf', border:'1px solid rgba(45,212,191,0.3)', borderRadius:20, padding:'2px 9px', fontWeight:700 }}>✓ Official Partner</span>}
                  {p.verified && <span style={{ fontSize:10, background:'rgba(52,199,89,0.1)', color:G.green, border:'1px solid rgba(52,199,89,0.2)', borderRadius:20, padding:'2px 9px' }}>✓ Verified</span>}
                  {p.city && <span style={{ fontSize:11, color:G.muted }}>📍 {p.city}</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:`1px solid ${G.border}`, borderRadius:8, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:G.text, fontSize:16, flexShrink:0 }}>✕</button>
          </div>
          {(p.desc?.[lang]||p.desc?.en) && <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:'rgba(232,228,217,0.78)', lineHeight:1.75, marginBottom:16 }}>{p.desc[lang]||p.desc.en}</p>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:16 }}>
            {p.cat && !isPartner && <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${G.border}`, borderRadius:9, padding:'9px 13px' }}><div style={{ fontSize:10, color:G.muted, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Sector</div><div style={{ fontSize:12, fontWeight:600 }}>{catLabel(p.cat,lang)}</div></div>}
            {isFL && p.languages && <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${G.border}`, borderRadius:9, padding:'9px 13px' }}><div style={{ fontSize:10, color:G.muted, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Languages</div><div style={{ fontSize:12, fontWeight:600 }}>🗣 {p.languages}</div></div>}
            {!isFL && p.employees && <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${G.border}`, borderRadius:9, padding:'9px 13px' }}><div style={{ fontSize:10, color:G.muted, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Team</div><div style={{ fontSize:12, fontWeight:600 }}>👥 {p.employees}</div></div>}
            {p.markets && <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${G.border}`, borderRadius:9, padding:'9px 13px' }}><div style={{ fontSize:10, color:G.muted, marginBottom:2, textTransform:'uppercase', letterSpacing:'0.5px' }}>Markets</div><div style={{ fontSize:12, fontWeight:600 }}>🌍 {p.markets}</div></div>}
          </div>
          {(p.tags||[]).length>0 && <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:16 }}>{p.tags.map(tg=><span key={tg} style={{ fontSize:11, background:`${accentColor}10`, color:accentColor, border:`1px solid ${accentColor}28`, borderRadius:20, padding:'3px 11px' }}>{tg}</span>)}</div>}
          {!isPartner && <div style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${G.border}`, borderRadius:9, padding:'9px 13px', marginBottom:16 }}><div style={{ fontSize:12, color:accentColor }}>💼 {t.rateNote}</div></div>}
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
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19, marginBottom: 3 }}>{t.upgradeTitle}</div>
                <div style={{ fontSize: 12, color: G.muted }}>{catName}</div>
              </div>
              <ModalClose onClose={onClose} />
            </div>

            {/* Slot visual */}
            <div style={{ marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: G.orange, marginBottom: 8, fontFamily: "'Syne',sans-serif" }}>🚀 {t.upgradeSubSp}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {Array.from({ length: SLOTS.sponsored }).map((_, i) => {
                    const taken = i < used.sp
                    return (
                      <div key={i} style={{ flex: 1, height: 32, borderRadius: 8, background: taken ? 'rgba(251,146,60,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${taken ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: taken ? G.orange : G.green, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>
                        {taken ? (lang==='sq'?'🔒 Zënë':'🔒 Taken') : (lang==='sq'?'✓ Lirë':'✓ Available')}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {spFree > 0 ? (
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
function ProfileCard({ p, lang, t, rank, onContact, onUpgrade, onTagClick, onSelfEdit, matchScore, matchHits, onCardClick }) {
  const isFL = p.type === 'freelancer'
  const isSp = p.tier === 'sponsored'
  const [hov, setHov] = React.useState(false)
  return (
    <div
      className={`card fu${isSp ? ' glow' : ''}`}
      style={{
        padding: 0, overflow: 'hidden', position: 'relative',
        borderColor: isSp ? (hov ? 'rgba(251,146,60,0.7)' : 'rgba(251,146,60,0.4)') : hov ? 'rgba(212,168,67,0.28)' : G.border,
        background: isSp ? (hov ? 'rgba(251,146,60,0.05)' : 'rgba(251,146,60,0.03)') : G.card,
        cursor: onCardClick ? 'pointer' : 'default',
        transform: hov && onCardClick ? 'translateY(-3px)' : 'none',
        boxShadow: hov && onCardClick ? (isSp ? '0 16px 40px rgba(0,0,0,0.35),0 0 24px rgba(251,146,60,0.08)' : '0 16px 40px rgba(0,0,0,0.3),0 0 20px rgba(212,168,67,0.06)') : '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onCardClick ? (e) => { if (!e.target.closest('button,a')) onCardClick(p) } : undefined}
    >
      {isSp && <div className="sp-bar" />}
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 11 }}>
          <div style={{ display: 'flex', gap: 10, minWidth: 0, flex: 1 }}>
            <Logo text={p.logo} color={p.logoColor} url={p.logoUrl} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 2, color: isSp ? G.orange : hov ? G.gold : G.text, transition: 'color 0.18s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
              <div style={{ fontSize: 11, color: G.muted }}>📍 {p.city} · {catLabel(p.cat, lang)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', flexShrink: 0, marginLeft: 8 }}>
            {isSp && <span style={{ fontSize: 10, background: 'rgba(251,146,60,0.14)', color: G.orange, border: '1px solid rgba(251,146,60,0.3)', borderRadius: 5, padding: '2px 9px', fontWeight: 700, fontFamily: "'Syne',sans-serif", whiteSpace: 'nowrap' }}>🚀 {lang==='sq'?'Sponsorizuar':'Sponsored'}</span>}
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
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, lineHeight: 1.62, marginBottom: 11 }}>{(p.desc?.[lang] || p.desc?.en || '').slice(0,120)}{((p.desc?.[lang]||p.desc?.en||'').length>120)?'…':''}</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {p.tags.slice(0,5).map(tag => (
            <span key={tag} className="tag" onClick={e => { e.stopPropagation(); onTagClick && onTagClick(tag) }}
              style={{ cursor: onTagClick ? 'pointer' : 'default', transition: 'all 0.15s' }}
              onMouseEnter={e => { if (onTagClick) { e.currentTarget.style.background='rgba(45,212,191,0.15)'; e.currentTarget.style.color=G.teal; e.currentTarget.style.borderColor='rgba(45,212,191,0.3)' }}}
              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color=''; e.currentTarget.style.borderColor='' }}>
              {tag}
            </span>
          ))}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.teal, fontWeight: 500 }}>💼 {t.rateNote}</div>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button className="btn gbtn" style={{ flex: 1, padding: '8px', fontSize: 12 }} onClick={e => { e.stopPropagation(); onContact(p) }}>{t.sendReq}</button>
          <button className="btn ghost" style={{ padding: '8px 12px', fontSize: 13 }} title={t.upgradeTitle} onClick={e => { e.stopPropagation(); onUpgrade(p.cat) }}>⭐</button>
          <button className="btn ghost" style={{ padding: '8px 12px', fontSize: 12 }} title={lang==='sq'?'Ndrysho profilin tim':'Edit my profile'} onClick={e => { e.stopPropagation(); onSelfEdit && onSelfEdit(p) }}>✏️</button>
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
        {/* Desktop: pills row */}
        <div className="sector-pills-desktop" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={() => setCat('all')} className="btn" style={{ padding: '6px 13px', fontSize: 12, fontWeight: 600, background: cat === 'all' ? G.goldDim : 'rgba(255,255,255,0.04)', color: cat === 'all' ? G.gold : G.muted, border: `1px solid ${cat === 'all' ? G.goldBorder : 'rgba(255,255,255,0.07)'}` }}>{t.allCats}</button>
          {CATS.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} className="btn" style={{ padding: '6px 13px', fontSize: 12, fontWeight: 600, background: cat === c.id ? `${c.color}18` : 'rgba(255,255,255,0.04)', color: cat === c.id ? c.color : G.muted, border: `1px solid ${cat === c.id ? `${c.color}40` : 'rgba(255,255,255,0.07)'}` }}>
              {c.icon} {c.labels[lang]}
            </button>
          ))}
        </div>
        {/* Mobile: dropdown — hidden by default, shown via CSS media query */}
        <select className="sector-pills-mobile inp" value={cat} onChange={e => setCat(e.target.value)}
          style={{ width: '100%', fontSize: 13, padding: '9px 12px' }}>
          <option value="all">{t.allCats}</option>
          {CATS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.labels[lang]}</option>)}
        </select>
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
                <ProfileCard key={p.id} p={p} lang={lang} t={t} rank={p._rank} onContact={setContact} onUpgrade={setUpgrade} onTagClick={tag => setTagFilter(tag)} onSelfEdit={setSelfEdit} matchScore={p._matchScore} matchHits={p._matchHits} onCardClick={setDirDetail} />
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
              const sc    = scoreLabel(p._score)

              return (
                <div key={p.id} className={`card fu${isSp ? ' glow' : ''}`}
                  style={{ padding: 0, overflow: 'hidden', animationDelay: `${i * 0.04}s`,
                    borderColor: isSp ? 'rgba(251,146,60,0.4)' : G.border,
                    background: isSp ? 'rgba(251,146,60,0.03)' : G.card }}>
                  {isSp && <div className="sp-bar" />}
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
  const [enquiryPartner, setEnquiryPartner] = React.useState(null)
  const [enquirySent, setEnquirySent] = React.useState(false)
  const [eForm, setEForm] = React.useState({ name:'', email:'', msg:'' })
  const [detailPartner, setDetailPartner] = React.useState(null)
  if (!profiles || profiles.length === 0) return null
  const dividerLabel = lang === 'sq' ? 'Partnerë' : 'Partners'
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,transparent,rgba(212,168,67,0.22))' }} />
        <span style={{ fontSize: 11, color: '#d4a843', fontFamily: "'Syne',sans-serif", fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', background: 'rgba(212,168,67,0.10)', border: '1px solid rgba(212,168,67,0.22)', borderRadius: 20, padding: '4px 16px' }}>{dividerLabel}</span>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(212,168,67,0.22),transparent)' }} />
      </div>
      <div className="partner-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
        {profiles.map((sp, i) => {
          const website = sp.website ? sp.website.replace(/^https?:\/\//, '') : null
          return (
            <div key={sp.id} style={{
              background: 'linear-gradient(160deg,rgba(45,212,191,0.07),rgba(45,212,191,0.02),rgba(212,168,67,0.03))',
              border: '1px solid rgba(45,212,191,0.28)',
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 6px 32px rgba(0,0,0,0.3)',
              transition: 'transform 0.25s, box-shadow 0.25s',
              position: 'relative', cursor: 'pointer',
            }}
              onClick={() => setDetailPartner(sp)}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 48px rgba(0,0,0,0.35), 0 0 32px rgba(45,212,191,0.10)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 6px 32px rgba(0,0,0,0.3)'}}>
              {/* Top accent */}
              <div style={{ height: 3, background: 'linear-gradient(90deg,#2dd4bf,#0d9488,rgba(212,168,67,0.6),transparent)' }} />

              <div style={{ padding: '28px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                {/* Large logo */}
                <div style={{ marginBottom: 16, position: 'relative' }}>
                  <div style={{ width: 72, height: 72, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(45,212,191,0.35)', boxShadow: '0 0 20px rgba(45,212,191,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg,${sp.logoColor||'#2dd4bf'}18,${sp.logoColor||'#2dd4bf'}38)` }}>
                    {sp.logoUrl
                      ? <img src={sp.logoUrl} alt={sp.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:sp.logoColor||G.teal }}>{(sp.logo||sp.name||'?').slice(0,2)}</span>
                    }
                  </div>
                </div>

                {/* Name + badge */}
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, marginBottom:6, letterSpacing:'-0.2px' }}>{sp.name}</div>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom: sp.city ? 4 : 0, flexWrap:'wrap', justifyContent:'center' }}>
                  <span style={{ fontSize:10, background:'rgba(45,212,191,0.12)', color:G.teal, border:'1px solid rgba(45,212,191,0.3)', borderRadius:20, padding:'3px 10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.5px' }}>✓ Official Partner</span>
                </div>
                {sp.city && <div style={{ fontSize:12, color:G.muted, marginBottom:12 }}>📍 {sp.city}</div>}

                {/* Tags */}
                {(sp.tags||[]).length > 0 && (
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center', marginBottom:16 }}>
                    {sp.tags.slice(0,4).map(s=><span key={s} style={{ background:'rgba(45,212,191,0.08)', color:G.teal, border:'1px solid rgba(45,212,191,0.18)', borderRadius:20, padding:'3px 10px', fontSize:11 }}>{s}</span>)}
                  </div>
                )}

                {/* CTA buttons */}
                <div style={{ display:'flex', gap:9, width:'100%', marginTop: 4 }}>
                  <button className="btn teal-btn" style={{ flex:1, padding:'11px', fontSize:13, fontWeight:700, borderRadius:10 }}
                    onClick={()=>{ setEnquiryPartner(sp); setEnquirySent(false); setEForm({name:'',email:'',msg:''}) }}>
                    ✉️ {lang==='sq'?'Dërgoni kërkesë':'Send Enquiry'}
                  </button>
                  {website && (
                    <a href={`https://${website}`} target="_blank" rel="noopener noreferrer"
                      style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'11px 16px', background:'rgba(45,212,191,0.07)', border:'1px solid rgba(45,212,191,0.25)', borderRadius:10, color:G.teal, textDecoration:'none', fontSize:13, fontWeight:600, whiteSpace:'nowrap' }}>
                      🌐 {lang==='sq'?'Faqja':'Website'}
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
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:19 }}>{lang==='sq'?'Kërkesë për':'Enquiry to'}: {enquiryPartner.name}</div>
                  {enquiryPartner.website && <a href={`https://${enquiryPartner.website.replace(/^https?:\/\//,'')}`} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:G.teal, textDecoration:'none' }}>{enquiryPartner.website.replace(/^https?:\/\//,'')} ↗</a>}
                </div>
                <ModalClose onClose={()=>setEnquiryPartner(null)} />
              </div>
              <div style={{ background:'rgba(45,212,191,0.05)', border:'1px solid rgba(45,212,191,0.2)', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:12, color:G.teal }}>
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
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:21, marginBottom:9 }}>{t.reqDoneTitle}</div>
                <p style={{ fontFamily:"'DM Sans',sans-serif", color:G.muted, fontSize:14, lineHeight:1.75, marginBottom:18 }}><strong>{enquiryPartner.name}</strong> {t.reqDoneSub}</p>
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
        <div id="concierge-partners" style={{ marginBottom: 52 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 21, marginBottom: 6 }}>{t.concPartnersTitle}</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22, lineHeight: 1.7 }}>{t.concPartnersSub}</p>
          <div className="conc-partners-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* rootsGTM — General Partner */}
            <div className="conc-partner-card" style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.28)', borderRadius: 16, padding: '22px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 68, height: 68, borderRadius: 16, overflow:'hidden', background: 'linear-gradient(135deg,rgba(45,212,191,0.3),rgba(45,212,191,0.1))', border: '2px solid rgba(45,212,191,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow:'0 0 20px rgba(45,212,191,0.15)' }}>
                  {P.rootsgtm_logo
                    ? <img src={P.rootsgtm_logo} alt={P.rootsgtm_name||'rootsGTM'} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    : <span style={{ fontSize:28 }}>🚀</span>}
                </div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: G.teal }}>{P.rootsgtm_name || 'rootsGTM'}</div>
                  <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>
                    {lang === 'sq' ? 'Partner i Përgjithshëm · Aktiv' : 'General Partner · Active'}
                  </div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(52,199,89,0.1)', color: G.green, border: '1px solid rgba(52,199,89,0.25)', borderRadius: 5, padding: '3px 9px', fontWeight: 700, flexShrink: 0 }}>✓ Live</span>
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(232,228,217,0.75)', lineHeight: 1.75, marginBottom: 18 }}>
                {P.rootsgtm_desc || 'rootsGTM is our exclusive sales network for EU–Kosova connections.'}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 18 }}>
                {(lang === 'sq' ? ['🤝 Kontakt direkt', '📅 Organizim takimesh', '🎤 Evente & Rrjet', '📄 Vijim & Kontrata'] : ['🤝 Direct client contact', '📅 Meeting organisation', '🎤 Events & networking', '📄 Follow-up & contracts']).map(f => (
                  <div key={f} style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 8, padding: '10px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(232,228,217,0.8)' }}>{f}</div>
                ))}
              </div>
              <button className="btn teal-btn" style={{ width: '100%', padding: '11px' }} onClick={() => setBookModal(true)}>
                {lang === 'sq' ? 'Kërko me rootsGTM →' : 'Enquire via rootsGTM →'}
              </button>
            </div>

            {/* Government — General Partner */}
            <div className="conc-partner-card" style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 16, padding: '22px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 68, height: 68, borderRadius: 16, overflow:'hidden', background: 'linear-gradient(135deg,rgba(212,168,67,0.3),rgba(212,168,67,0.1))', border: `2px solid ${G.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow:`0 0 20px rgba(212,168,67,0.15)` }}>
                  {P.gov_logo
                    ? <img src={P.gov_logo} alt={P.gov_name||'Kosova Gov'} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                    : <span style={{ fontSize:28 }}>🏛️</span>}
                </div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: G.gold }}>
                    {P.gov_name || (lang === 'sq' ? 'Qeveria e Kosovës' : 'Kosova Government')}
                  </div>
                  <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>InvestKosova · {lang === 'sq' ? 'Partner Zyrtar' : 'Official Partner'}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, borderRadius: 5, padding: '3px 9px', fontWeight: 700, flexShrink: 0 }}>
                  {lang === 'sq' ? '⏳ Në negocim' : '⏳ In negotiation'}
                </span>
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(232,228,217,0.75)', lineHeight: 1.75, marginBottom: 18 }}>
                {P.gov_desc || (lang === 'sq' ? 'Business Bridge Platform po ndërton partneritet zyrtar me InvestKosova dhe Ministrinë e Ekonomisë.' : 'Business Bridge Platform is building an official partnership with InvestKosova and the Ministry of Economy.')}
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

        {/* ── BECOME A PARTNER (premium, matches home CTA style) ── */}
        <div style={{ position:'relative', overflow:'hidden', background: 'linear-gradient(135deg,rgba(45,212,191,0.09) 0%,rgba(45,212,191,0.04) 40%,rgba(212,168,67,0.05) 100%)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 16, padding: '32px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          {/* bg glows */}
          <div style={{ position:'absolute', top:'-50%', right:'-5%', width:'30%', paddingBottom:'30%', borderRadius:'50%', background:'radial-gradient(circle,rgba(45,212,191,0.1),transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-50%', left:'5%', width:'20%', paddingBottom:'20%', borderRadius:'50%', background:'radial-gradient(circle,rgba(212,168,67,0.07),transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'relative', maxWidth: 500 }}>
            <div style={{ fontSize:10, color:G.teal, fontFamily:"'DM Sans',sans-serif", fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:8 }}>
              🤝 {lang==='sq'?'Rrjet Global B2B · Oportunitete Partneriteti':'Global B2B Network · Partnership Opportunity'}
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 8, letterSpacing:'-0.3px' }}>{t.concBecomeTitle}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, lineHeight: 1.75, marginBottom: 12 }}>{t.concBecomeSub}</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {t.concBecomeTypes.map(type => <span key={type} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.teal }}>{type}</span>)}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:9, flexShrink:0, position:'relative' }}>
            <button className="btn teal-btn" style={{ padding:'12px 24px', fontSize:13, fontWeight:700, whiteSpace:'nowrap' }} onClick={() => setPartnerModal(true)}>{t.concBecomeBtn}</button>
            <div style={{ fontSize:11, color:'rgba(45,212,191,0.5)', textAlign:'center', fontFamily:"'DM Sans',sans-serif" }}>
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

      {/* ── PARTNER MODAL — uses same full SmartRegForm as "List Profile → Partner" ── */}
      {partnerModal && !partnerDone && (
        <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && setPartnerModal(false)}>
          <div className="modal su" style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19 }}>{t.partnerRegTitle}</div>
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
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 21, marginBottom: 9 }}>{t.partnerDoneTitle}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75, marginBottom: 18 }}>{t.partnerDoneSub}</p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 13, marginBottom: 18 }}>
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
      <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(22px,3.5vw,36px)', letterSpacing: '-0.7px', marginBottom: 10 }}>{heroTitle}<br /><span style={{ color: G.gold }}>{heroTitle2}</span></h2>
      <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.8, maxWidth: 560, marginBottom: 36 }}>{heroSub}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 32 }}>
        {(gc.steps || t.govSteps).map((s, i) => (
          <div key={i} className="card fu" style={{ padding: 18, animationDelay: `${i * 0.06}s` }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.ic || s.icon || '📋'}</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 10, fontWeight: 700, color: G.gold, marginBottom: 4, letterSpacing: '0.5px' }}>{String(i + 1).padStart(2, '0')}</div>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{s.t || s.title}</div>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.muted, lineHeight: 1.6, marginBottom: 7 }}>{s.d || s.desc}</p>
            <div style={{ fontSize: 11, background: 'rgba(52,199,89,0.08)', color: G.green, border: '1px solid rgba(52,199,89,0.2)', borderRadius: 5, padding: '2px 7px', display: 'inline-block' }}>⏱ {s.time}</div>
          </div>
        ))}
      </div>
      <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 14, padding: '24px 28px' }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 18 }}>{factsHeading}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 16, marginBottom: 20 }}>
          {(gc.facts || t.govFacts).map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: G.gold }}>{v}</div>
              <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: G.muted, marginTop: 2 }}>{l}</div>
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
            <div style={{ width:46, height:46, borderRadius:10, overflow:'hidden', flexShrink:0, border:`2px solid ${form.logoColor||'#2dd4bf'}44`, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${form.logoColor||'#2dd4bf'}20,${form.logoColor||'#2dd4bf'}46)` }}>
              {partnerLogoFile
                ? <img src={partnerLogoFile} alt="logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:15, color:form.logoColor||'#2dd4bf' }}>{form.name ? form.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() : '??'}</span>
              }
            </div>
            <div style={{ flex:1 }}>
              <label style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 13px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, cursor:'pointer', fontSize:12, color:G.text, marginBottom:7, width:'fit-content' }}>
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
                {['#2dd4bf','#58a6ff','#34d399','#f472b6','#fb923c','#a78bfa','#facc15','#d4a843'].map(col => (
                  <button key={col} onClick={() => { setForm(f=>({...f,logoColor:col})); setPartnerLogoFile(null) }}
                    style={{ width:24, height:24, borderRadius:'50%', background:col, border:(form.logoColor||'#2dd4bf')===col?'3px solid #fff':'2px solid transparent', cursor:'pointer', boxShadow:(form.logoColor||'#2dd4bf')===col?`0 0 0 2px ${col}`:'none' }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ background:'rgba(45,212,191,0.06)', border:'1px solid rgba(45,212,191,0.2)', borderRadius:9, padding:'10px 14px', marginBottom:16, fontSize:12, color:G.muted }}>{Lp.note}</div>
        <button className="btn gbtn" style={{width:'100%'}} disabled={!form.name||!form.email||!!emailError} onClick={async () => {
          const fields = {
            name: form.name, city: form.city,
            email: form.email.toLowerCase(),
            phone: form.phone||null, website: form.website||null,
            languages: form.eu_langs||null,
            type: 'partner', cat: 'partner', tier: 'free', verified: false,
            logo_color: form.logoColor || '#2dd4bf',
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
        <div>
          <label className="flabel">{Lr.email}</label>
          <input className="inp" value={form.email}
            style={{ borderColor: emailError ? G.red : undefined, boxShadow: emailError ? `0 0 0 3px rgba(255,59,48,0.1)` : undefined, transition: 'border-color 0.18s, box-shadow 0.18s' }}
            onChange={e => { f('email', e.target.value); checkEmail(e.target.value) }}
            onBlur={e => checkEmail(e.target.value)} />
          {emailChecking && <div style={{fontSize:11,color:G.muted,marginTop:4,display:'flex',alignItems:'center',gap:5}}><div style={{width:8,height:8,borderRadius:'50%',border:'1.5px solid rgba(255,255,255,0.2)',borderTopColor:G.muted,animation:'spin 0.7s linear infinite'}} />Checking…</div>}
          {emailError && <div style={{fontSize:11,color:G.red,marginTop:4,display:'flex',alignItems:'center',gap:5,fontFamily:"'DM Sans',sans-serif",fontWeight:500}}>⚠ {emailError}</div>}
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
      <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 9, padding: '10px 14px', marginBottom: 14, fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: G.muted }}>
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
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: sel ? opt.col : G.muted, marginBottom: 3 }}>{opt.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(232,228,217,0.45)', lineHeight: 1.4 }}>{opt.sub}</div>
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
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: G.orange }}>Premium Profile Fields</div>
            <span style={{ fontSize: 10, color: 'rgba(251,146,60,0.6)', fontFamily: "'DM Sans',sans-serif" }}>· {lang==='sq'?'Shfaqen në profilin tuaj premium':'Displayed in your premium profile popup'}</span>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
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

          {/* Testimonial */}
          <div style={{ marginBottom: 4 }}>
            <label className="flabel" style={{ color: 'rgba(251,146,60,0.6)' }}>{lang==='sq'?'Referencë / Dëshmi klienti':'Client testimonial / Reference'}</label>
            <textarea className="inp" rows={2} style={{ resize: 'vertical', borderColor: 'rgba(251,146,60,0.2)' }} value={form.testimonial||''} onChange={e=>f('testimonial',e.target.value)} placeholder={lang==='sq'?'"Bashkëpunimi ishte shumë profesional…" – Emri, Kompania':'\"Working with them was exceptional…\" – Name, Company'} />
          </div>
        </div>
      )}

      <button className="btn gbtn" style={{ width: '100%' }} disabled={!form.name || !form.email || !!emailError} onClick={async () => {
        const dbFields = formToDb(form, catChoice, selectedTags, regType, null)
        if (regType === t.regFL) dbFields.type = 'freelancer'
        else if (regType === t.regComp) dbFields.type = 'company'
        if (form.tier === 'sponsored') dbFields.tier = 'sponsored'
        if (logoFile) dbFields.logo_data = logoFile
        const err = await insertProfile(dbFields)
        if (err) {
          const msg = (err.message || '').toLowerCase()
          if (msg.includes('duplicate') || msg.includes('unique') || msg.includes('email')) {
            setEmailError(lang === 'sq' ? 'Ky email është tashmë i regjistruar.' : 'This email is already registered.')
            return
          }
          const fallback = { ...dbFields }
          delete fallback.logo_color; delete fallback.logo_data
          const err2 = await insertProfile(fallback)
          if (err2) {
            const msg2 = (err2.message || '').toLowerCase()
            if (msg2.includes('duplicate') || msg2.includes('unique') || msg2.includes('email')) {
              setEmailError(lang === 'sq' ? 'Ky email është tashmë i regjistruar.' : 'This email is already registered.')
            } else {
              setEmailError(lang === 'sq' ? 'Gabim gjatë regjistrimit. Provoni sërish.' : 'Submission failed. Please try again.')
            }
            return
          }
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
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, marginBottom:6 }}>{Ls.step2h}</div>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:13, color:G.muted, lineHeight:1.65, marginBottom:18 }}>
              {lang==='sq' ? `Kodi u dërgua te ${email}. Kontrolloni emailin tuaj.` : `Code sent to ${email}. Check your inbox.`}
            </p>
            <div style={{ marginBottom:10 }}>
              <label className="flabel">{Ls.codeLabel}</label>
              <input className="inp" value={code} onChange={e => { setCode(e.target.value); setCodeError(false) }}
                placeholder="123456" maxLength={6} style={{ fontSize:22, letterSpacing:6, textAlign:'center' }}
                onKeyDown={e => e.key==='Enter' && verifyCode()} />
            </div>
            {codeError && <div style={{ fontSize:12, color:G.red, marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>⚠️ {Ls.codeErr}</div>}
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

// ─── ADMIN PARTNERS TAB ───────────────────────────────────────────────────────
function AdminPartnersTab({ profiles, setProfiles, G, partners, setPartners, savePartners, saving, settingsSaved }) {
  const gpList = profiles.filter(p => p.type === 'partner')
  const [gpEdit, setGpEdit] = React.useState(null)
  const [gpForm, setGpForm] = React.useState({})
  const [gpLogo, setGpLogo] = React.useState(null)
  const [gpSaving, setGpSaving] = React.useState(false)
  const [gpMsg, setGpMsg] = React.useState('')
  const [section, setSection] = React.useState('fixed') // 'fixed' | 'db'
  const logoColors = ['#2dd4bf','#58a6ff','#34d399','#f472b6','#fb923c','#a78bfa','#facc15','#d4a843']

  const openNew = () => {
    setGpForm({ name:'', city:'', email:'', website:'', phone:'', desc:'', tags:'', logoColor:'#2dd4bf', visible:true, featured:false })
    setGpLogo(null); setGpEdit('new')
  }
  const openEditGP = (p) => {
    setGpForm({ name:p.name||'', city:p.city||'', email:p.contact||p.email||'', website:p.website||'', phone:p.phone||'', desc:p.desc?.en||'', tags:(p.tags||[]).join(', '), logoColor:p.logoColor||'#2dd4bf', visible:p.verified!==false, featured:p.tier==='sponsored' })
    setGpLogo(p.logoUrl||null); setGpEdit(p)
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
      logo_color: gpForm.logoColor||'#2dd4bf',
      tags: gpForm.tags ? gpForm.tags.split(',').map(s=>s.trim()).filter(Boolean) : [],
      desc_en: gpForm.desc||null, desc_sq: gpForm.desc||null,
    }
    if (gpLogo && gpLogo.startsWith('data:')) fields.logo_data = gpLogo
    if (gpEdit === 'new') { await insertProfile(fields).catch(e => console.error(e)) }
    else { await updateProfile(gpEdit.id, fields).catch(e => console.error(e)) }
    setGpSaving(false); setGpEdit(null); setGpMsg('✓ Saved')
    setTimeout(() => setGpMsg(''), 3000)
    fetchAllProfilesAdmin().then(d => setProfiles(d)).catch(()=>{})
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
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17 }}>🤝 Partners</div>
          <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>Manage all partner types shown on the platform</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button className="btn" style={{ fontSize:11, padding:'5px 12px', background:section==='fixed'?G.goldDim:'rgba(255,255,255,0.04)', color:section==='fixed'?G.gold:G.muted, border:`1px solid ${section==='fixed'?G.goldBorder:'rgba(255,255,255,0.1)'}` }} onClick={()=>{setGpEdit(null);setSection('fixed')}}>rootsGTM & Gov</button>
          <button className="btn" style={{ fontSize:11, padding:'5px 12px', background:section==='db'?'rgba(45,212,191,0.1)':'rgba(255,255,255,0.04)', color:section==='db'?G.teal:G.muted, border:`1px solid ${section==='db'?'rgba(45,212,191,0.3)':'rgba(255,255,255,0.1)'}` }} onClick={()=>{setGpEdit(null);setSection('db')}}>General Partners ({gpList.length})</button>
        </div>
      </div>
      {gpMsg && <div style={{ fontSize:13, color:G.green, background:'rgba(52,199,89,0.08)', border:'1px solid rgba(52,199,89,0.2)', borderRadius:8, padding:'8px 14px' }}>{gpMsg}</div>}

      {/* ── SECTION: rootsGTM + Government (editable boxes) ── */}
      {section==='fixed' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* rootsGTM */}
          <div style={{ background:G.surface, border:`1px solid rgba(45,212,191,0.3)`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:G.teal, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20 }}>🚀</span> rootsGTM — General Partner
            </div>
            {/* Logo row */}
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14, padding:'12px 14px', background:'rgba(45,212,191,0.04)', border:'1px solid rgba(45,212,191,0.15)', borderRadius:10 }}>
              <div style={{ width:64, height:64, borderRadius:14, overflow:'hidden', flexShrink:0, border:'2px solid rgba(45,212,191,0.35)', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,rgba(45,212,191,0.2),rgba(45,212,191,0.05))' }}>
                {partners.rootsgtm_logo
                  ? <img src={partners.rootsgtm_logo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : <span style={{ fontSize:28 }}>🚀</span>}
              </div>
              <div>
                <div style={{ fontSize:12, color:G.muted, marginBottom:6 }}>General Partner logo (displayed larger on Concierge page)</div>
                <label style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:7, cursor:'pointer', fontSize:11, color:G.text }}>
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
            <div><label className="flabel">Description</label><textarea className="inp" rows={3} style={{resize:'vertical'}} value={partners.rootsgtm_desc||''} onChange={e=>setPartners(p=>({...p,rootsgtm_desc:e.target.value}))} /></div>
          </div>

          {/* Government */}
          <div style={{ background:G.surface, border:`1px solid ${G.goldBorder}`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15, color:G.gold, marginBottom:14, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:20 }}>🏛️</span> Kosova Government / InvestKosova — General Partner
            </div>
            {/* Logo row */}
            <div style={{ display:'flex', gap:12, alignItems:'center', marginBottom:14, padding:'12px 14px', background:G.goldDim, border:`1px solid ${G.goldBorder}`, borderRadius:10 }}>
              <div style={{ width:64, height:64, borderRadius:14, overflow:'hidden', flexShrink:0, border:`2px solid ${G.goldBorder}`, display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,rgba(212,168,67,0.2),rgba(212,168,67,0.05))' }}>
                {partners.gov_logo
                  ? <img src={partners.gov_logo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                  : <span style={{ fontSize:28 }}>🏛️</span>}
              </div>
              <div>
                <div style={{ fontSize:12, color:G.muted, marginBottom:6 }}>General Partner logo (displayed larger on Concierge page)</div>
                <label style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'6px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:7, cursor:'pointer', fontSize:11, color:G.text }}>
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
            <div><label className="flabel">Description</label><textarea className="inp" rows={3} style={{resize:'vertical'}} value={partners.gov_desc||''} onChange={e=>setPartners(p=>({...p,gov_desc:e.target.value}))} /></div>
          </div>

          {settingsSaved==='partners' && <div style={{ fontSize:12, color:G.green }}>✓ Saved to database</div>}
          <button className="btn gbtn" style={{ alignSelf:'flex-start', padding:'10px 24px' }} onClick={savePartners} disabled={saving}>
            {saving ? 'Saving…' : '💾 Save General Partner Details'}
          </button>
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
                <div style={{ fontFamily:"'DM Sans',sans-serif" }}>No general partners yet. Click "+ Add Partner" to create the first one.</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                {gpList.map(p => (
                  <div key={p.id} style={{ background:G.surface, border:`1px solid ${p.verified!==false?'rgba(45,212,191,0.25)':G.border}`, borderRadius:14, padding:'14px 18px', display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
                    <Logo text={p.logo} color={p.logoColor||'#2dd4bf'} url={p.logoUrl} size={46} />
                    <div style={{ flex:1, minWidth:160 }}>
                      <div style={{ fontWeight:700, fontSize:14, display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                        {p.name}
                        {p.tier==='sponsored' && <span style={{ fontSize:10, background:'rgba(212,168,67,0.12)', color:G.gold, border:`1px solid ${G.goldBorder}`, borderRadius:5, padding:'1px 7px', fontWeight:700 }}>⭐ Featured</span>}
                        {p.verified===false && <span style={{ fontSize:10, background:'rgba(255,255,255,0.04)', color:G.muted, border:'1px solid rgba(255,255,255,0.1)', borderRadius:5, padding:'1px 7px' }}>Hidden</span>}
                      </div>
                      <div style={{ fontSize:11, color:G.muted, marginTop:2 }}>{[p.city, p.website].filter(Boolean).join(' · ')}</div>
                      {(p.tags||[]).length>0 && <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:5 }}>{p.tags.slice(0,4).map(tg=><span key={tg} className="tag" style={{fontSize:10}}>{tg}</span>)}</div>}
                    </div>
                    <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'flex-end' }}>
                      <button className="btn" style={{ fontSize:10, padding:'4px 10px', background:'rgba(45,212,191,0.08)', color:G.teal, border:'1px solid rgba(45,212,191,0.2)', borderRadius:6 }} onClick={()=>openEditGP(p)}>✏️ Edit</button>
                      <button className="btn" style={{ fontSize:10, padding:'4px 10px', background:p.verified!==false?'rgba(52,199,89,0.08)':'rgba(255,255,255,0.04)', color:p.verified!==false?G.green:G.muted, border:`1px solid ${p.verified!==false?'rgba(52,199,89,0.2)':'rgba(255,255,255,0.1)'}`, borderRadius:6 }} onClick={()=>toggleVisible(p)}>{p.verified!==false?'👁 Visible':'🚫 Hidden'}</button>
                      <button className="btn" style={{ fontSize:10, padding:'4px 10px', background:p.tier==='sponsored'?G.goldDim:'rgba(255,255,255,0.04)', color:p.tier==='sponsored'?G.gold:G.muted, border:`1px solid ${p.tier==='sponsored'?G.goldBorder:'rgba(255,255,255,0.1)'}`, borderRadius:6 }} onClick={()=>toggleFeatured(p)}>⭐ {p.tier==='sponsored'?'Unfeature':'Feature'}</button>
                      <button className="btn" style={{ fontSize:10, padding:'4px 10px', background:'rgba(255,59,48,0.08)', color:G.red, border:'1px solid rgba(255,59,48,0.2)', borderRadius:6 }} onClick={()=>deleteGP(p.id)}>🗑 Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {gpEdit!==null && (
            <div style={{ background:G.surface, border:`1px solid rgba(45,212,191,0.3)`, borderRadius:16, overflow:'hidden' }}>
              <div style={{ padding:'16px 22px', borderBottom:`1px solid ${G.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(45,212,191,0.04)' }}>
                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:G.teal }}>
                  {gpEdit==='new' ? '+ New General Partner' : `✏️ Edit: ${gpEdit.name}`}
                </div>
                <button className="btn ghost" style={{ fontSize:12, padding:'4px 12px' }} onClick={()=>setGpEdit(null)}>✕ Cancel</button>
              </div>
              <div style={{ padding:'20px 22px', display:'flex', flexDirection:'column', gap:14 }}>
                <div>
                  <label className="flabel">Logo</label>
                  <div style={{ display:'flex', gap:14, alignItems:'flex-start', marginTop:8 }}>
                    <div style={{ width:64, height:64, borderRadius:14, overflow:'hidden', flexShrink:0, border:`2px solid ${gpForm.logoColor||'#2dd4bf'}55`, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${gpForm.logoColor||'#2dd4bf'}18,${gpForm.logoColor||'#2dd4bf'}38)` }}>
                      {gpLogo
                        ? <img src={gpLogo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                        : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, color:gpForm.logoColor||'#2dd4bf' }}>{(gpForm.name||'?').split(' ').map(w=>w[0]||'').join('').slice(0,2).toUpperCase()||'?'}</span>}
                    </div>
                    <div style={{ flex:1 }}>
                      <label style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 13px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, cursor:'pointer', fontSize:12, color:G.text, marginBottom:8 }}>
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
                            style={{ width:22, height:22, borderRadius:'50%', background:col, border:`2px solid ${(gpForm.logoColor||'#2dd4bf')===col?'#fff':'transparent'}`, cursor:'pointer', transition:'transform 0.15s' }}
                            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.2)'}
                            onMouseLeave={e=>e.currentTarget.style.transform=''} />
                        ))}
                      </div>
                    </div>
                  </div>
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
    sp_sub: "rootsGTM's sales team works on the ground in Kosovo.",
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
      logoDataPreview: p.logoUrl || null,
      desc_en:   p.desc?.en || '',
      desc_sq:   p.desc?.sq || p.desc?.en || '',
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
      ...(editForm.logoDataPreview ? { logo_data: editForm.logoDataPreview } : {}),
      desc_en:    editForm.desc_en || null,
      desc_sq:    editForm.desc_sq || editForm.desc_en || null,
    }
    const err = await updateProfile(editProfile.id, updates)
    if (!err) {
      setProfiles(ps => ps.map(x => x.id === editProfile.id ? {
        ...x, ...updates, contact: updates.email,
        logoUrl: updates.logo_data || x.logoUrl,
        desc: { en: updates.desc_en, sq: updates.desc_sq }
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
    { id: 'pending_profiles', label: 'New profiles',      labelEn: 'New profiles',         icon: '🆕' },
    { id: 'profiles',         label: 'All profiles',      labelEn: 'All profiles',          icon: '📋' },
    { id: 'pending_changes',  label: 'Change requests',   labelEn: 'Change requests',       icon: '✏️' },
    { id: 'partners',         label: 'Partners',          labelEn: 'Partners',              icon: '🤝' },
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
        <span style={{ fontSize: 10, background: p.tier==='sponsored'?'rgba(251,146,60,0.1)':'rgba(255,255,255,0.04)', color: p.tier==='sponsored'?G.orange:G.muted, border: `1px solid ${p.tier==='sponsored'?'rgba(251,146,60,0.3)':'rgba(255,255,255,0.1)'}`, borderRadius: 5, padding: '2px 8px' }}>
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
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div style={{ fontSize:13, color:G.muted, fontFamily:"'DM Sans',sans-serif" }}>
                {pendingProfiles.length} pending · Partners: {pendingPartners.length} · Companies/FL: {pendingFirms.length}
              </div>
              <button className="btn ghost" style={{ fontSize:12, padding:'6px 14px' }} onClick={() => { setLoadingP(true); fetchAllProfilesAdmin().then(d=>{setProfiles(d);setLoadingP(false)}).catch(()=>setLoadingP(false)) }}>
                🔄 Refresh
              </button>
            </div>
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
                    {chg.changes?.email && (
                      <div style={{ marginBottom: 10, background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ fontSize: 10, color: G.teal, fontWeight: 700, marginBottom: 3, textTransform:'uppercase', letterSpacing:'0.5px' }}>📧 Email change request</div>
                        <div style={{ fontSize: 12, color: G.text }}><span style={{ color: G.muted }}>From:</span> {chg.original?.email || chg.original?.contact || '—'}</div>
                        <div style={{ fontSize: 12, color: G.teal, fontWeight: 600 }}><span style={{ color: G.muted }}>To:</span> {chg.changes.email}</div>
                      </div>
                    )}
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
                    {chg.changes?.name && chg.changes.name !== chg.original?.name && (
                      <div style={{ fontSize: 12, color: G.muted, marginBottom: 6 }}><b style={{color:G.text}}>Name:</b> {chg.changes.name}</div>
                    )}
                    {chg.changes?.city && chg.changes.city !== chg.original?.city && (
                      <div style={{ fontSize: 12, color: G.muted, marginBottom: 6 }}><b style={{color:G.text}}>City:</b> {chg.changes.city}</div>
                    )}
                    {chg.changes?.website && <div style={{ fontSize: 12, color: G.muted, marginBottom: 6 }}><b style={{color:G.text}}>Website:</b> {chg.changes.website}</div>}
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
        <AdminPartnersTab profiles={profiles} setProfiles={setProfiles} G={G}
          partners={partners} setPartners={setPartners} savePartners={savePartners}
          saving={saving} settingsSaved={settingsSaved} />
      )}

      {/* ── TAB: GOVERNMENT PAGE ──────────────────────────────────────────── */}
      {tab === 'government' && (
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:17 }}>🏛️ Government Page Editor</div>
            <div style={{ fontSize:12, color:G.muted, marginTop:2 }}>Edit all text and links on the Government page. Blank fields use the default translated text.</div>
          </div>

          {/* Hero section */}
          <div style={{ background:G.surface, border:`1px solid ${G.goldBorder}`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:G.gold, marginBottom:14 }}>Hero Section</div>
            <div style={{ marginBottom:10 }}><label className="flabel">Badge text (e.g. "🏛️ For Investors & Governments")</label><input className="inp" value={govContent.badge||''} onChange={e=>setGovContent(g=>({...g,badge:e.target.value}))} placeholder="Leave blank for default" /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
              <div><label className="flabel">Headline line 1</label><input className="inp" value={govContent.heroTitle||''} onChange={e=>setGovContent(g=>({...g,heroTitle:e.target.value}))} placeholder="Leave blank for default" /></div>
              <div><label className="flabel">Headline line 2 (gold)</label><input className="inp" value={govContent.heroTitle2||''} onChange={e=>setGovContent(g=>({...g,heroTitle2:e.target.value}))} placeholder="Leave blank for default" /></div>
            </div>
            <div><label className="flabel">Subtitle / description</label><textarea className="inp" rows={2} style={{resize:'vertical'}} value={govContent.heroSub||''} onChange={e=>setGovContent(g=>({...g,heroSub:e.target.value}))} placeholder="Leave blank for default" /></div>
          </div>

          {/* Facts section */}
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:14 }}>Facts Box Heading</div>
            <div><label className="flabel">Section heading</label><input className="inp" value={govContent.factsHeading||''} onChange={e=>setGovContent(g=>({...g,factsHeading:e.target.value}))} placeholder="Leave blank for default" /></div>
          </div>

          {/* Buttons */}
          <div style={{ background:G.surface, border:`1px solid ${G.border}`, borderRadius:14, padding:'20px 22px' }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:4 }}>Action Buttons</div>
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
                  <div style={{ width:48, height:48, borderRadius:10, overflow:'hidden', flexShrink:0, border:`2px solid ${editForm.logoColor||'#58a6ff'}44`, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${editForm.logoColor||'#58a6ff'}20,${editForm.logoColor||'#58a6ff'}46)` }}>
                    {editForm.logoDataPreview
                      ? <img src={editForm.logoDataPreview} alt="logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:14, color:editForm.logoColor||'#58a6ff' }}>{(editForm.name||'??').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ flex:1 }}>
                    <label style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 12px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:7, cursor:'pointer', fontSize:11, color:'rgba(232,228,217,0.8)', marginBottom:7 }}>
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
                      {['#58a6ff','#34d399','#f472b6','#fb923c','#a78bfa','#facc15','#2dd4bf','#6ee7b7','#fca5a5','#d4a843'].map(col => {
                        const isSel = (editForm.logoColor||'#58a6ff') === col
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
          <section style={{ padding: '88px 48px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: `radial-gradient(ellipse 80% 55% at 50% -10%,rgba(212,168,67,0.14) 0%,transparent 60%),radial-gradient(ellipse 40% 30% at 80% 80%,rgba(45,212,191,0.06) 0%,transparent 60%),${G.bg}` }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.014) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
            <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:'60%', height:1, background:'linear-gradient(90deg,transparent,rgba(212,168,67,0.35),transparent)' }} />
            <div className="fu" style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 100, padding: '6px 18px', marginBottom: 26 }}>
                <span style={{ width: 7, height: 7, background: G.green, borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 8px ${G.green}` }} />
                <span style={{ fontSize: 12, color: G.gold, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, letterSpacing:'0.3px' }}>
                  {(window.__techgateProfiles||[]).filter(p => p.verified !== false && p.type !== 'partner').length > 0
                    ? `${(window.__techgateProfiles||[]).filter(p => p.verified !== false && p.type !== 'partner').length} ${lang==='sq' ? 'Regjistrimet e Verifikuara · Live' : 'Verified Listings · Live'}`
                    : (lang==='sq' ? 'Platforma e Biznesit Kosova · Live' : 'Global B2B Network · Live')
                  }
                </span>
              </div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,5.2vw,60px)', letterSpacing: '-1.8px', lineHeight: 1.06, marginBottom: 20 }}>
                {t.h1a}<br /><span style={{ color: G.gold }}>{t.h1b}</span>
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 17, color: G.muted, lineHeight: 1.8, fontWeight: 300, maxWidth: 540, margin: '0 auto 36px' }}>{t.heroSub}</p>
              <div style={{ display: 'flex', gap: 7, maxWidth: 560, margin: '0 auto 36px', background: 'rgba(255,255,255,0.045)', border: `1px solid ${G.goldBorder}`, borderRadius: 14, padding: 6, boxShadow: '0 4px 24px rgba(0,0,0,0.2)' }}>
                <input className="inp" style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 15 }} placeholder={t.searchPH}
                  value={searchQ} onChange={e => setSearchQ(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { setPage('directory') } }} />
                <button className="btn gbtn" style={{ flexShrink: 0, borderRadius: 9 }} onClick={() => setPage('directory')}>{t.searchBtn} →</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 36, flexWrap: 'wrap', marginBottom: 24 }}>
                {[[String(homeStats.companies||0), t.stat1], [String(homeStats.freelancers||0), t.stat2], [String(homeStats.partners||0), t.stat3], ['10%', t.stat4]].map(([n, l]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 24, color: G.gold }}>{n}</div>
                    <div style={{ fontSize: 11, color: G.muted, marginTop: 2, letterSpacing:'0.3px' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
                {[lang==='sq'?'🌐 E dukshme gjithandej':'🌐 Visible Worldwide', lang==='sq'?'✓ Regjistrimet e verifikuara':'✓ Verified Listings', lang==='sq'?'🤝 Rrjet Global B2B':'🤝 Global B2B Network'].map(tag => (
                  <span key={tag} style={{ fontSize:11, color:'rgba(232,228,217,0.4)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'4px 14px', fontFamily:"'DM Sans',sans-serif" }}>{tag}</span>
                ))}
              </div>
            </div>
          </section>
          <section style={{ padding: '44px 48px 0', maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, marginBottom: 14 }}>{t.howTitle}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 40 }}>
              {[
                [G.blue,  '🔍', t.f1t, t.f1d, 'directory'],
                [G.gold,  '🤝', t.f2t, t.f2d, 'concierge#partners'],
                [G.teal,  '✈️', t.f3t, t.f3d, 'concierge'],
              ].map(([col, ic, title, desc, pg]) => (
                <div key={pg} className="fu" style={{ padding: '18px 16px', cursor: 'pointer', borderRadius: 14, position:'relative', overflow:'hidden',
                  background: col === G.teal ? 'rgba(45,212,191,0.04)' : col === G.gold ? 'rgba(212,168,67,0.04)' : 'rgba(88,166,255,0.04)',
                  border: `1px solid ${col === G.teal ? 'rgba(45,212,191,0.2)' : col === G.gold ? 'rgba(212,168,67,0.2)' : 'rgba(88,166,255,0.2)'}`,
                  transition: 'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 8px 24px ${col}18`}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}
                  onClick={() => {
                    if (pg === 'concierge#partners') { setPage('concierge'); setTimeout(() => { const el = document.getElementById('concierge-partners'); if(el) el.scrollIntoView({behavior:'smooth'}) }, 120) }
                    else setPage(pg)
                  }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${col}90,transparent)` }} />
                  <div style={{ fontSize: 22, marginBottom: 9 }}>{ic}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: col, marginBottom: 5, lineHeight:1.3 }}>{title}</div>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.muted, lineHeight: 1.65, margin:0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </section>
          <section style={{ padding: '0 48px 0', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20 }}>{t.catsTitle}</h2>
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
                    {/* Top accent line */}
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${c.color}80,transparent)`, borderRadius:'12px 12px 0 0' }} />
                    <div style={{ fontSize: 18, marginBottom: 5 }}>{c.icon}</div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontWeight: 700, fontSize: 11, marginBottom: 3, letterSpacing:'-0.1px', color:'rgba(232,228,217,0.9)' }}>{c.labels[lang]}</div>
                    {count > 0 && <div style={{ fontSize: 10, color: c.color, fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{count} {lang==='sq'?'regj.':'listed'}</div>}
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── SPONSORED LISTINGS ── */}
          {(() => {
            const sponsored = (window.__techgateProfiles||[]).filter(p => p.tier === 'sponsored' && p.verified !== false && p.type !== 'partner')
            if (sponsored.length === 0) return null
            return (
              <section style={{ padding: '0 48px 44px', maxWidth: 1200, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, margin:0 }}>{t.topTitle}</h2>
                    <span style={{ fontSize:10, background:'rgba(251,146,60,0.12)', color:G.orange, border:'1px solid rgba(251,146,60,0.28)', borderRadius:20, padding:'2px 9px', fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>🚀 Sponsored</span>
                  </div>
                  <button className="btn ghost" style={{ fontSize: 12 }} onClick={() => setPage('directory')}>{t.viewAll}</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 14 }}>
                  {sponsored.slice(0,6).map(p => {
                    const isFL = p.type === 'freelancer'
                    return (
                      <div key={p.id} style={{
                        borderRadius: 16, overflow: 'hidden', position:'relative',
                        background: 'linear-gradient(145deg,rgba(251,146,60,0.06),rgba(251,146,60,0.02),rgba(212,168,67,0.03))',
                        border: '1px solid rgba(251,146,60,0.38)',
                        boxShadow: '0 4px 28px rgba(0,0,0,0.3), 0 0 0 0 rgba(251,146,60,0)',
                        transition: 'transform 0.22s, box-shadow 0.22s', cursor: 'pointer',
                      }}
                        onClick={() => setProfileDetail(p)}
                        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 48px rgba(0,0,0,0.35),0 0 28px rgba(251,146,60,0.1)'}}
                        onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 28px rgba(0,0,0,0.3)'}}>
                        {/* Top sponsor bar */}
                        <div style={{ height: 3, background: 'linear-gradient(90deg,#fb923c,#f59e0b,rgba(251,146,60,0.3),transparent)' }} />
                        <div style={{ padding: '18px 20px 16px' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:11 }}>
                            <div style={{ display:'flex', gap:11, alignItems:'center' }}>
                              {/* Larger logo for sponsored */}
                              <div style={{ width:54, height:54, borderRadius:12, overflow:'hidden', flexShrink:0, border:'2px solid rgba(251,146,60,0.35)', boxShadow:'0 0 16px rgba(251,146,60,0.12)', display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${p.logoColor||'#fb923c'}18,${p.logoColor||'#fb923c'}36)` }}>
                                {p.logoUrl
                                  ? <img src={p.logoUrl} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                                  : <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:p.logoColor||G.orange }}>{(p.logo||p.name||'?').slice(0,2)}</span>
                                }
                              </div>
                              <div>
                                <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, marginBottom:2 }}>{p.name}</div>
                                <div style={{ fontSize:11, color:G.muted }}>📍 {p.city} · {catLabel(p.cat, lang)}</div>
                              </div>
                            </div>
                            <span style={{ fontSize:10, background:'rgba(251,146,60,0.14)', color:G.orange, border:'1px solid rgba(251,146,60,0.3)', borderRadius:5, padding:'2px 9px', fontWeight:700, fontFamily:"'Syne',sans-serif", flexShrink:0 }}>🚀 Sponsored</span>
                          </div>
                          <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:12, color:G.muted, lineHeight:1.65, marginBottom:11 }}>{(p.desc?.[lang] || p.desc?.en || '').slice(0,100)}{(p.desc?.[lang]||p.desc?.en||'').length > 100 ? '…' : ''}</p>
                          {(p.tags||[]).length > 0 && (
                            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:13 }}>
                              {p.tags.slice(0,4).map(tg => <span key={tg} style={{ fontSize:10, background:'rgba(251,146,60,0.07)', color:G.orange, border:'1px solid rgba(251,146,60,0.18)', borderRadius:4, padding:'2px 7px' }}>{tg}</span>)}
                            </div>
                          )}
                          <div style={{ display:'flex', gap:8 }}>
                            <button className="btn" style={{ flex:1, padding:'8px 12px', fontSize:12, fontWeight:700, background:'rgba(251,146,60,0.1)', color:G.orange, border:'1px solid rgba(251,146,60,0.3)', borderRadius:8 }}
                              onClick={() => setPage('directory')}>View profile →</button>
                            {p.verified && <span style={{ fontSize:10, background:'rgba(52,199,89,0.1)', color:G.green, border:'1px solid rgba(52,199,89,0.2)', borderRadius:5, padding:'0 8px', display:'flex', alignItems:'center' }}>✓ Verified</span>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })()}

          {/* ── PARTNER LOGO TICKER ── */}
          {(() => {
            const partners = (window.__techgateProfiles||[]).filter(p => p.verified !== false && p.type === 'partner')
            if (partners.length === 0) return null
            // Duplicate for seamless loop
            const items = [...partners, ...partners]
            return (
              <section style={{ padding: '0 0 44px', overflow: 'hidden' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 20, marginBottom: 3 }}>
                      {lang==='sq' ? '🤝 Partnerët Tanë' : '🤝 Our Partners'}
                    </h2>
                    <div style={{ fontSize: 12, color: G.muted, fontFamily: "'DM Sans',sans-serif" }}>
                      {lang==='sq' ? 'Organizata të verifikuara — klikoni për të kontaktuar' : 'Verified organisations — click to connect on Concierge'}
                    </div>
                  </div>
                  <button className="btn ghost" style={{ fontSize: 12, flexShrink: 0 }} onClick={() => setPage('concierge')}>{lang==='sq'?'Shiko →':'View all →'}</button>
                </div>
                <div style={{ position: 'relative' }}>
                  {/* Fade edges */}
                  <div style={{ position:'absolute', left:0, top:0, bottom:0, width:80, background:'linear-gradient(90deg,#080c14,transparent)', zIndex:2, pointerEvents:'none' }} />
                  <div style={{ position:'absolute', right:0, top:0, bottom:0, width:80, background:'linear-gradient(270deg,#080c14,transparent)', zIndex:2, pointerEvents:'none' }} />
                  <div style={{ display:'flex', gap:14, animation:'ticker-scroll 28s linear infinite', width:'max-content', padding:'6px 0' }}
                    onMouseEnter={e=>e.currentTarget.style.animationPlayState='paused'}
                    onMouseLeave={e=>e.currentTarget.style.animationPlayState='running'}>
                    {items.map((p, idx) => (
                      <div key={idx} onClick={() => setPage('concierge')}
                        style={{ display:'flex', alignItems:'center', gap:11, padding:'12px 20px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, cursor:'pointer', flexShrink:0, transition:'all 0.2s',
                          minWidth: 200 }}
                        onMouseEnter={e=>{e.currentTarget.style.background='rgba(45,212,191,0.06)';e.currentTarget.style.borderColor='rgba(45,212,191,0.25)'}}
                        onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.03)';e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'}}>
                        <Logo text={p.logo} color={p.logoColor||'#2dd4bf'} url={p.logoUrl} size={40} />
                        <div>
                          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13 }}>{p.name}</div>
                          <div style={{ fontSize:11, color:G.teal }}>✓ Partner · {p.city||''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )
          })()}

          <section style={{ padding: '0 48px 72px' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', position:'relative', overflow:'hidden', background: `linear-gradient(135deg, rgba(212,168,67,0.1) 0%, rgba(212,168,67,0.06) 40%, rgba(45,212,191,0.06) 100%)`, border: `1px solid ${G.goldBorder}`, borderRadius: 22, padding: '52px 52px' }}>
              {/* bg glow */}
              <div style={{ position:'absolute', top:'-40%', right:'-5%', width:'40%', paddingBottom:'40%', borderRadius:'50%', background:'radial-gradient(circle,rgba(212,168,67,0.12),transparent 70%)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:'-30%', left:'5%', width:'25%', paddingBottom:'25%', borderRadius:'50%', background:'radial-gradient(circle,rgba(45,212,191,0.07),transparent 70%)', pointerEvents:'none' }} />
              <div style={{ position:'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
                <div style={{ maxWidth: 520 }}>
                  <div style={{ fontSize:11, color:G.gold, fontFamily:"'DM Sans',sans-serif", fontWeight:700, letterSpacing:'1.5px', textTransform:'uppercase', marginBottom:10 }}>
                    🌐 {lang==='sq'?'Rrjet Global B2B · Platforma Premium':'Global B2B Network · Premium Executive Platform'}
                  </div>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, letterSpacing: '-0.5px', marginBottom: 10, lineHeight:1.15 }}>{t.ctaTitle}</h2>
                  <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, lineHeight: 1.75 }}>{t.ctaSub}</p>
                  <div style={{ display:'flex', gap:16, marginTop:18, flexWrap:'wrap' }}>
                    {[lang==='sq'?'✓ Pa pagesë':'✓ Always free', lang==='sq'?'✓ Verifikim admin':'✓ Admin verified', lang==='sq'?'✓ I dukshëm ndërkombëtarisht':'✓ Worldwide visibility'].map(item => (
                      <span key={item} style={{ fontSize:12, color:G.teal, fontFamily:"'DM Sans',sans-serif" }}>{item}</span>
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
        <>
          <ConciergePage lang={lang} t={t} content={siteContent} />
        </>
      )}
      {page === 'gov'        && <GovPage lang={lang} t={t} content={siteContent} />}

      {showReg && !regDone && (
        <div className="modal-bg fi" onClick={e => e.target === e.currentTarget && (setShowReg(false), setRegType(null))}>
          <div className="modal su">
            {!regType ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 19 }}>{t.regTitle}</div>
                  <ModalClose onClose={() => setShowReg(false)} />
                </div>
                {/* Kosova-based */}
                <div style={{ fontSize:10, color:G.muted, textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700, marginBottom:8 }}>
                  🇽🇰 {lang==='sq'?'Bazuar në Kosovë':'Kosova-based'}
                </div>
                <div style={{ display:'flex', gap:9, marginBottom:14 }}>
                  {[
                    { regT: t.regComp, icon:'🏢', sub: t.regCompS, col: G.gold, border: G.goldBorder, bg: G.goldDim },
                    { regT: t.regFL,   icon:'👤', sub: t.regFLS,   col: G.teal, border:'rgba(45,212,191,0.35)', bg:'rgba(45,212,191,0.06)' },
                  ].map(opt => (
                    <div key={opt.regT} onClick={() => setRegType(opt.regT)}
                      style={{ flex:1, padding:'16px 10px', border:`1px solid ${opt.border}`, background:opt.bg, borderRadius:12, cursor:'pointer', textAlign:'center', transition:'all 0.18s' }}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 4px 16px ${opt.col}22`}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                      <div style={{ fontSize:26, marginBottom:7 }}>{opt.icon}</div>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:opt.col, marginBottom:3 }}>{opt.regT}</div>
                      <div style={{ fontSize:11, color:G.muted }}>{opt.sub}</div>
                    </div>
                  ))}
                </div>
                {/* Partner */}
                <div style={{ fontSize:10, color:G.teal, textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:700, marginBottom:8 }}>
                  🤝 {lang==='sq'?'Bëhu partner':'Become a partner'}
                </div>
                <div onClick={() => setRegType(t.regSP)}
                  style={{ padding:'14px 12px', border:'1px solid rgba(45,212,191,0.35)', background:'rgba(45,212,191,0.05)', borderRadius:12, cursor:'pointer', textAlign:'center', transition:'all 0.18s' }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='rgba(45,212,191,0.7)';e.currentTarget.style.background='rgba(45,212,191,0.12)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(45,212,191,0.35)';e.currentTarget.style.background='rgba(45,212,191,0.05)'}}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, color:G.teal, marginBottom:3 }}>{t.regSP}</div>
                  <div style={{ fontSize:11, color:'rgba(45,212,191,0.6)' }}>{t.regSPS}</div>
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

      {/* ── PROFILE DETAIL MODAL ── */}
      {profileDetail && (
        <ProfileDetailModal
          p={profileDetail} lang={lang} t={t}
          onClose={() => setProfileDetail(null)}
          onContact={p => { setProfileDetail(null); /* contact handled in dir page */ }}
        />
      )}

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${G.border}`, padding: '22px 44px', fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.muted }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12, marginBottom:14 }}>
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:13, color:G.text }}>Kosova Hub</span>
            <span style={{ fontSize:10, background:G.goldDim, color:G.gold, border:`1px solid ${G.goldBorder}`, borderRadius:20, padding:'1px 8px', fontWeight:600 }}>B2B</span>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems:'center' }}>
            {t.footLinks.map(l => <span key={l} style={{ cursor: 'pointer' }}>{l}</span>)}
            <span onClick={() => setShowAdmin(true)} style={{ cursor: 'pointer', opacity: 0, transition: 'opacity 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '1'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0'}>⚙</span>
          </div>
        </div>
        <div style={{ borderTop:`1px solid ${G.border}`, paddingTop:12, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
          <div>{t.footer}</div>
          <div style={{ display:'flex', gap:18 }}>
            {[lang==='sq'?'🌐 E dukshme gjithandej':'🌐 Visible Worldwide', lang==='sq'?'🤝 Rrjet Global B2B':'🤝 Global B2B Network', lang==='sq'?'🔐 Verifikim admin':'🔐 Admin Verified'].map(tag => (
              <span key={tag} style={{ fontSize:11, color:'rgba(232,228,217,0.3)' }}>{tag}</span>
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
