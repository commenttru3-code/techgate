import React, { useState, useMemo } from 'react'

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  de: {
    tagline: 'Business Bridge Platform',
    navHome: 'Home', navDir: 'Firmen & Freelancer', navMatch: 'KI-Matching',
    navConcierge: 'Concierge', navGov: 'Regierung', registerBtn: '+ Eintragen',
    live: '500+ verifizierte Einträge · Kosovo',
    h1a: 'Ihr Tor zum', h1b: 'Tech-Standort Kosovo',
    heroSub: 'Firmen, Freelancer und Consultants aus Kosovo — für Ihr nächstes Outsourcing- oder Kooperationsprojekt.',
    searchPH: 'z.B. React Entwickler, Call Center, CNC Fertigung…', searchBtn: 'Suchen',
    stat1: 'Firmen', stat2: 'Freelancer', stat3: 'Aktive Partner', stat4: 'Körperschaftsteuer',
    howTitle: 'Wie es funktioniert',
    f1t: 'Firmen & Freelancer finden', f1d: 'Durchsuchen Sie 500+ verifizierte Einträge nach Branche und Skills.',
    f2t: 'KI-Matching', f2d: 'Beschreiben Sie Ihren Bedarf — Claude findet die besten Matches.',
    f3t: 'Kosovo Concierge', f3d: 'rootsGTM organisiert Ihren kompletten Business-Visit vor Ort.',
    catsTitle: 'Branchen', topTitle: '⭐ Top-Einträge', viewAll: 'Alle →',
    ctaTitle: 'Jetzt kostenlos eintragen', ctaSub: '3 Minuten, kostenlos. Sichtbar für EU-Kunden.',
    ctaBtn: 'Eintragen →', ctaGov: 'Über Kosovo',
    rankSub: 'Alle Kontakte öffentlich sichtbar · Konditionen per Gespräch',
    allCats: 'Alle', allTypes: '🌐 Alle', onlyComp: '🏢 Firmen', onlyFL: '👤 Freelancer',
    sortRating: '⭐ Bewertung', sortReviews: '💬 Reviews', sortAZ: 'A–Z',
    noResults: 'Keine Ergebnisse', noResultsSub: 'Andere Begriffe versuchen',
    rateNote: 'Konditionen per Gespräch', verified: '✓ Verifiziert',
    sendReq: 'Anfrage senden', viewProf: 'Profil',
    upgradeBtn: '⭐',
    upgradeTitle: 'Sichtbarkeit erhöhen',
    upgradeSubSp: 'Gesponsert · 1 Slot pro Kategorie',
    upgradeSubPr: 'Premium · max. 3 Slots pro Kategorie',
    upgradeBenSp: ['🥇 Platz 1 in der Kategorie', 'Gesponsert-Label', 'Feature auf der Startseite', 'Newsletter-Erwähnung'],
    upgradeBenPr: ['⭐ Platz 2–4 in der Kategorie', 'Premium-Badge', 'Höhere Sichtbarkeit', 'Profilstatistiken'],
    upgradeNoteSp: 'Nur 1 Sponsor pro Kategorie.',
    upgradeNotePr: 'Maximal 3 Premium-Profile pro Kategorie.',
    upgradeContact: 'Kontakt für Upgrade:', upgradeMail: 'upgrade@techgate-ks.com',
    waitTitle: 'Warteliste beitreten', waitSub: 'Wir benachrichtigen Sie sobald ein Slot frei wird.',
    waitName: 'Ihr Name *', waitEmail: 'Ihre E-Mail *', waitSend: 'Auf Warteliste ✓',
    waitDoneTitle: 'Sie sind auf der Liste!', waitDoneSub: 'Wir melden uns sobald ein Slot frei wird.',
    reqTitle: 'Anfrage an', reqName: 'Ihr Name *', reqEmail: 'Ihre E-Mail *', reqMsg: 'Nachricht',
    reqPH: 'Guten Tag, wir suchen…', reqSend: 'Senden ✓', reqCancel: 'Abbrechen',
    reqDoneTitle: 'Gesendet!', reqDoneSub: 'meldet sich bei Ihnen.',
    close: 'Schließen', back: '← Zurück',
    matchTitle: 'KI-Partner-Matching', matchSub: 'Beschreiben Sie Ihren Bedarf — Claude findet die passenden Einträge.',
    matchWhat: 'Was suchen Sie? *', matchPH: 'z.B. React-Team, 3–4 Entwickler, Remote, Start Mai…',
    matchType: 'Typ', matchBoth: 'Firma & Freelancer', matchFirm: 'Nur Firmen', matchFL: 'Nur Freelancer',
    matchDur: 'Dauer', matchDurOpts: ['–', 'Einmalig', '1–3 Monate', '3–6 Monate', '6–12 Monate', 'Dauerhaft'],
    matchBtn: '🤖 Matching starten', matchRunning: 'Analysiere…',
    matchResults: 'Passende Einträge', matchWhy: 'Warum?', noMatch: 'Kein Match — bitte präzisieren.',
    concHeroTitle: 'Kosovo Concierge',
    concHeroSub: 'Unsere Partner organisieren Ihren kompletten Business-Visit — Meetings, Events, Behördentermine. Alles aus einer Hand.',
    concReq: '🗓 Visit anfragen', concLearn: 'Mehr erfahren',
    concAvail: 'Aktive Partner',
    concPartnersTitle: 'Unsere Partner',
    concPartnersSub: 'rootsGTM und die Kosovo-Regierung sind unsere offiziellen Partner — sie bringen Kunden und öffnen Türen.',
    concPkgTitle: 'Visit-Pakete', concPkgSub: 'Konditionen werden im persönlichen Gespräch vereinbart.',
    pkgCta: 'Anfragen',
    concHowTitle: 'Wie funktioniert es?',
    concHowSub: 'Von der ersten Anfrage bis zum unterzeichneten Vertrag.',
    howSteps: [
      { n: '01', ic: '📋', t: 'Bedarf beschreiben', d: 'Formular ausfüllen oder Erst-Call.' },
      { n: '02', ic: '🤖', t: 'KI-Vorauswahl', d: 'Claude filtert die besten Matches.' },
      { n: '03', ic: '🤝', t: 'Partner plant', d: 'rootsGTM koordiniert alle Meetings.' },
      { n: '04', ic: '✈️', t: 'Sie reisen an', d: 'Alles vorbereitet.' },
      { n: '05', ic: '📄', t: 'Follow-up', d: 'Verträge & nächste Schritte.' },
    ],
    concSpTitle: 'Das rootsGTM Sales-Team', concSpSub: 'Das Sales-Team von rootsGTM arbeitet vor Ort in Kosovo — sie kennen die Geschäftskultur, die besten Ansprechpartner und organisieren alles für Sie.',
    spDeals: 'Deals',
    concCtaTitle: 'Bereit für Ihren Kosovo-Visit?',
    concCtaFeats: ['✓ Antwort in 24h', '✓ Keine Anzahlung', '✓ Kostenloser Erst-Call', '✓ Flexibel buchbar'],
    concCtaBtn: '🗓 Visit anfragen →',
    concBecomeTitle: 'Als Partner bewerben',
    concBecomeSub: 'Sie sind eine Organisation, Handelskammer oder ein Sales-Netzwerk? Bewerben Sie sich als offizieller TechGate-Partner.',
    concBecomeTypes: ['🏛️ Regierung & Institutionen', '📣 Sales-Netzwerke & Agenturen', '🌍 Diaspora-Organisationen', '🤝 Handelskammern'],
    concBecomeBtn: 'Bewerbung einreichen →',
    bookTitle: 'Kosovo Visit anfragen', bookName: 'Name *', bookComp: 'Firma',
    bookEmail: 'E-Mail *', bookGoal: 'Ihr Ziel', bookGoalPH: 'z.B. Software-Team kennenlernen…',
    bookWhen: 'Zeitraum', bookPax: 'Teilnehmer', bookSend: 'Anfrage absenden ✓',
    bookDoneTitle: 'Anfrage gesendet!', bookDoneSub: 'Unser Team meldet sich innerhalb von 24 Stunden.',
    partnerRegTitle: 'Als Partner bewerben', partnerRegSub: 'Kostenlos · Wir melden uns innerhalb 48h',
    partnerOrg: 'Organisation / Name *', partnerType: 'Art der Organisation',
    partnerTypes: ['Regierung / Behörde', 'Sales-Netzwerk / Agentur', 'Handelskammer / Verband', 'Diaspora-Organisation', 'Sonstiges'],
    partnerEmail: 'E-Mail *', partnerDesc: 'Kurze Beschreibung',
    partnerDescPH: 'Was kann Ihre Organisation beitragen?', partnerSend: 'Bewerbung absenden ✓',
    partnerDoneTitle: 'Bewerbung eingereicht!', partnerDoneSub: 'Wir melden uns innerhalb von 48 Stunden.',
    govBadge: 'Offizielles Informationsportal',
    govH1: 'Firmengründung &', govH2: 'Investition in Kosovo',
    govSub: 'Niedrige Steuern, Euro-Währung, EU-Beitrittsperspektive und eine junge Talentbasis.',
    govSteps: [
      { ic: '🖥️', t: 'Online-Registrierung', d: 'ARBK komplett online.', time: '1–3 Tage' },
      { ic: '💶', t: 'Stammkapital', d: 'Mindestkapital: 1 EUR.', time: '1 Tag' },
      { ic: '📋', t: 'Steuernummer', d: 'Automatisch bei ATK.', time: '1–2 Tage' },
      { ic: '🏦', t: 'Bankkonto', d: '10 lizenzierte Banken.', time: '2–5 Tage' },
    ],
    govFactsH: '🇽🇰 Kosovo auf einen Blick',
    govFacts: [['10%', 'Körperschaftsteuer'], ['18%', 'MwSt'], ['1 EUR', 'Mindestkapital'], ['5–10 Tage', 'Gründungsdauer'], ['EUR', 'Währung'], ['1,8 Mio', 'Einwohner'], ['63%', 'Unter 35 J.'], ['2008', 'Unabhängig']],
    govLinks: 'Offizielle Links',
    regTitle: 'Was möchten Sie eintragen?',
    regComp: '🏢 Firma', regCompS: 'Team, GmbH, Agentur',
    regFL: '👤 Freelancer', regFLS: 'Selbstständig, Solo',
    regSP: '🤝 Sales Partner', regSPS: 'Kosovo-basiert',
    regFree: 'Kostenlos · Prüfung in 24–48h',
    regName: 'Name / Firma *', regCity: 'Stadt *', regEmail: 'E-Mail *',
    regDesc: 'Beschreibung', regDescPH: 'Was bieten Sie an?',
    regTags: 'Skills / Tags', regTagsPH: 'React, Node.js…',
    regSend: 'Absenden ✓', regDoneTitle: 'Eingereicht!', regDoneSub: 'Prüfung & Freischaltung in 24–48h.',
    footer: '© 2025 TechGate Kosovo · Business Bridge Platform',
    footLinks: ['Datenschutz', 'AGB', 'Impressum', 'Kontakt'],
  },
  en: {
    tagline: 'Business Bridge Platform',
    navHome: 'Home', navDir: 'Companies & Freelancers', navMatch: 'AI Matching',
    navConcierge: 'Concierge', navGov: 'Government', registerBtn: '+ List Profile',
    live: '500+ verified listings · Kosovo',
    h1a: 'Your Gateway to the', h1b: 'Kosovo Tech Hub',
    heroSub: 'Companies, freelancers and consultants from Kosovo — for your next outsourcing or cooperation project.',
    searchPH: 'e.g. React developer, call centre, CNC manufacturing…', searchBtn: 'Search',
    stat1: 'Companies', stat2: 'Freelancers', stat3: 'Active Partners', stat4: 'Corporate Tax',
    howTitle: 'How it works',
    f1t: 'Find Companies & Freelancers', f1d: 'Browse 500+ verified listings by sector and skills.',
    f2t: 'AI Matching', f2d: 'Describe your needs — Claude finds the best matches.',
    f3t: 'Kosovo Concierge', f3d: 'rootsGTM organises your complete on-site business visit.',
    catsTitle: 'Sectors', topTitle: '⭐ Top Listings', viewAll: 'View all →',
    ctaTitle: 'List your profile for free', ctaSub: '3 minutes, free. Visible to EU clients.',
    ctaBtn: 'Register →', ctaGov: 'About Kosovo',
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
    upgradeContact: 'Contact for upgrade:', upgradeMail: 'upgrade@techgate-ks.com',
    waitTitle: 'Join waitlist', waitSub: 'We\'ll notify you when a slot opens.',
    waitName: 'Your name *', waitEmail: 'Your e-mail *', waitSend: 'Join waitlist ✓',
    waitDoneTitle: 'You\'re on the list!', waitDoneSub: 'We\'ll contact you when a slot opens.',
    reqTitle: 'Enquiry to', reqName: 'Your name *', reqEmail: 'Your e-mail *', reqMsg: 'Message',
    reqPH: 'Hello, we are looking for…', reqSend: 'Send ✓', reqCancel: 'Cancel',
    reqDoneTitle: 'Sent!', reqDoneSub: 'will get back to you.',
    close: 'Close', back: '← Back',
    matchTitle: 'AI Matching', matchSub: 'Describe your requirements — Claude finds the best matches.',
    matchWhat: 'What are you looking for? *', matchPH: 'e.g. React team, 3–4 developers, remote, start May…',
    matchType: 'Type', matchBoth: 'Company & Freelancer', matchFirm: 'Companies only', matchFL: 'Freelancers only',
    matchDur: 'Duration', matchDurOpts: ['–', 'One-time', '1–3 months', '3–6 months', '6–12 months', 'Ongoing'],
    matchBtn: '🤖 Start matching', matchRunning: 'Analysing…',
    matchResults: 'Matching listings', matchWhy: 'Why?', noMatch: 'No match — please refine.',
    concHeroTitle: 'Kosovo Concierge',
    concHeroSub: 'Our partners organise your complete business visit — meetings, events, government appointments. All from one place.',
    concReq: '🗓 Request visit', concLearn: 'Learn more',
    concAvail: 'Active partners',
    concPartnersTitle: 'Our Partners',
    concPartnersSub: 'rootsGTM and the Kosovo Government are our official partners — they bring clients and open doors.',
    concPkgTitle: 'Visit Packages', concPkgSub: 'Rates and conditions are agreed in conversation.',
    pkgCta: 'Enquire',
    concHowTitle: 'How does it work?',
    concHowSub: 'From first enquiry to signed contract.',
    howSteps: [
      { n: '01', ic: '📋', t: 'Describe needs', d: 'Form or initial call.' },
      { n: '02', ic: '🤖', t: 'AI pre-selection', d: 'Claude filters the best matches.' },
      { n: '03', ic: '🤝', t: 'Partner plans', d: 'rootsGTM coordinates all meetings.' },
      { n: '04', ic: '✈️', t: 'You arrive', d: 'Everything prepared.' },
      { n: '05', ic: '📄', t: 'Follow-up', d: 'Contracts & next steps.' },
    ],
    concSpTitle: 'The rootsGTM Sales Team', concSpSub: 'rootsGTM\'s sales team works on the ground in Kosovo — they know the business culture, the best contacts and handle everything for you.',
    spDeals: 'Deals',
    concCtaTitle: 'Ready for your Kosovo visit?',
    concCtaFeats: ['✓ Reply in 24h', '✓ No deposit', '✓ Free initial call', '✓ Flexible booking'],
    concCtaBtn: '🗓 Request visit now →',
    concBecomeTitle: 'Become a Partner',
    concBecomeSub: 'Are you an organisation, chamber of commerce or sales network? Apply as an official TechGate partner.',
    concBecomeTypes: ['🏛️ Government & Institutions', '📣 Sales Networks & Agencies', '🌍 Diaspora Organisations', '🤝 Chambers of Commerce'],
    concBecomeBtn: 'Submit application →',
    bookTitle: 'Request Kosovo visit', bookName: 'Name *', bookComp: 'Company',
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
    govH1: 'Company Formation &', govH2: 'Investment in Kosovo',
    govSub: 'Low taxes, Euro currency, EU accession perspective and a young talent base.',
    govSteps: [
      { ic: '🖥️', t: 'Online Registration', d: 'ARBK fully online.', time: '1–3 days' },
      { ic: '💶', t: 'Share Capital', d: 'Minimum: €1.', time: '1 day' },
      { ic: '📋', t: 'Tax Number', d: 'Automatically assigned.', time: '1–2 days' },
      { ic: '🏦', t: 'Bank Account', d: '10 licensed banks.', time: '2–5 days' },
    ],
    govFactsH: '🇽🇰 Kosovo at a glance',
    govFacts: [['10%', 'Corporate Tax'], ['18%', 'VAT'], ['€1', 'Min. Capital'], ['5–10 days', 'Formation'], ['EUR', 'Currency'], ['1.8M', 'Population'], ['63%', 'Under 35'], ['2008', 'Independence']],
    govLinks: 'Official Links',
    regTitle: 'What would you like to list?',
    regComp: '🏢 Company', regCompS: 'Team, LLC, Agency',
    regFL: '👤 Freelancer', regFLS: 'Self-employed, solo',
    regSP: '🤝 Sales Partner', regSPS: 'Kosovo-based',
    regFree: 'Free · Review within 24–48h',
    regName: 'Name / Company *', regCity: 'City *', regEmail: 'E-mail *',
    regDesc: 'Description', regDescPH: 'What do you offer?',
    regTags: 'Skills / Tags', regTagsPH: 'React, Node.js…',
    regSend: 'Submit ✓', regDoneTitle: 'Submitted!', regDoneSub: 'Review and publish within 24–48h.',
    footer: '© 2025 TechGate Kosovo · Business Bridge Platform',
    footLinks: ['Privacy', 'Terms', 'Imprint', 'Contact'],
  },
  sq: {
    tagline: 'Platforma Urë Biznesi',
    navHome: 'Kreu', navDir: 'Kompani & Freelancerë', navMatch: 'Përputhja AI',
    navConcierge: 'Concierge', navGov: 'Qeveria', registerBtn: '+ Regjistrohu',
    live: '500+ regjistrime të verifikuara · Kosovë',
    h1a: 'Porta Juaj drejt', h1b: 'Qendrës Teknologjike të Kosovës',
    heroSub: 'Kompani, freelancerë dhe konsulentë nga Kosova — për projektin tuaj të ardhshëm.',
    searchPH: 'p.sh. Zhvillues React, qendër thirrjesh…', searchBtn: 'Kërko',
    stat1: 'Kompani', stat2: 'Freelancerë', stat3: 'Partnerë Aktivë', stat4: 'Tatim mbi korp.',
    howTitle: 'Si funksionon',
    f1t: 'Gjej Kompani & Freelancerë', f1d: 'Shfletoni 500+ regjistrime sipas sektorit dhe aftësive.',
    f2t: 'Përputhja AI', f2d: 'Përshkruani nevojën — Claude gjen përputhjet më të mira.',
    f3t: 'Kosovo Concierge', f3d: 'rootsGTM organizon vizitën tuaj të plotë të biznesit.',
    catsTitle: 'Sektorët', topTitle: '⭐ Regjistrimet Kryesore', viewAll: 'Shiko →',
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
    upgradeContact: 'Kontakti:', upgradeMail: 'upgrade@techgate-ks.com',
    waitTitle: 'Lista e pritjes', waitSub: 'Ju njoftojmë kur hapet një slot.',
    waitName: 'Emri *', waitEmail: 'E-mail *', waitSend: 'Bashkohu ✓',
    waitDoneTitle: 'Jeni në listë!', waitDoneSub: 'Ju kontaktojmë kur hapet slot.',
    reqTitle: 'Kërkesë për', reqName: 'Emri *', reqEmail: 'E-mail *', reqMsg: 'Mesazhi',
    reqPH: 'Mirëdita, ne kërkojmë…', reqSend: 'Dërgo ✓', reqCancel: 'Anulo',
    reqDoneTitle: 'U dërgua!', reqDoneSub: 'do t\'ju kontaktojë.',
    close: 'Mbyll', back: '← Kthehu',
    matchTitle: 'Përputhja me AI', matchSub: 'Përshkruani nevojën — Claude gjen përputhjet.',
    matchWhat: 'Çfarë po kërkoni? *', matchPH: 'p.sh. Ekip React, 3–4 zhvillues, remote…',
    matchType: 'Lloji', matchBoth: 'Kompani & Freelancer', matchFirm: 'Vetëm kompani', matchFL: 'Vetëm freelancerë',
    matchDur: 'Kohëzgjatja', matchDurOpts: ['–', 'Njëherë', '1–3 muaj', '3–6 muaj', '6–12 muaj', 'Afatgjatë'],
    matchBtn: '🤖 Fillo', matchRunning: 'Duke analizuar…',
    matchResults: 'Përputhjet', matchWhy: 'Pse?', noMatch: 'Asnjë përputhje — saktësoni.',
    concHeroTitle: 'Kosovo Concierge',
    concHeroSub: 'Partnerët tanë organizojnë vizitën tuaj të plotë — takime, evente, takime qeveritare. Gjithçka nga një burim.',
    concReq: '🗓 Kërko vizitë', concLearn: 'Mëso më shumë',
    concAvail: 'Partnerë aktivë',
    concPartnersTitle: 'Partnerët Tanë',
    concPartnersSub: 'rootsGTM dhe Qeveria e Kosovës janë partnerët tanë zyrtarë.',
    concPkgTitle: 'Paketat e Vizitës', concPkgSub: 'Kushtet bien dakord në bisedë personale.',
    pkgCta: 'Kërko',
    concHowTitle: 'Si funksionon?', concHowSub: 'Nga kërkesa e parë deri te kontrata.',
    howSteps: [
      { n: '01', ic: '📋', t: 'Përshkruani nevojën', d: 'Formular ose thirrje.' },
      { n: '02', ic: '🤖', t: 'Para-zgjedhja AI', d: 'Claude filtron përputhjet.' },
      { n: '03', ic: '🤝', t: 'Partneri planifikon', d: 'rootsGTM koordinon takimet.' },
      { n: '04', ic: '✈️', t: 'Mbërrini', d: 'Gjithçka e përgatitur.' },
      { n: '05', ic: '📄', t: 'Vijim', d: 'Kontrata & hapat e ardhshëm.' },
    ],
    concSpTitle: 'Ekipi i Shitjeve rootsGTM', concSpSub: 'Ekipi i shitjeve i rootsGTM punon në terren në Kosovë — njohin kulturën e biznesit, kontaktet më të mira dhe organizojnë gjithçka për ju.',
    spDeals: 'Marrëveshje',
    concCtaTitle: 'Gati për vizitën tuaj?',
    concCtaFeats: ['✓ Përgjigje 24h', '✓ Pa paradhënie', '✓ Thirrje falas', '✓ Fleksibël'],
    concCtaBtn: '🗓 Kërko vizitë →',
    concBecomeTitle: 'Bëhu Partner',
    concBecomeSub: 'Jeni organizatë, dhomë tregtie apo rrjet shitjesh? Aplikoni si partner zyrtar.',
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
    partnerDoneTitle: 'Aplikimi u dërgua!', partnerDoneSub: 'Do t\'ju kontaktojmë brenda 48 orësh.',
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
    regComp: '🏢 Kompani', regCompS: 'Ekip, SH.P.K.',
    regFL: '👤 Freelancer', regFLS: 'I vetëpunësuar',
    regSP: '🤝 Partner Shitjesh', regSPS: 'Bazuar në Kosovë',
    regFree: 'Falas · 24–48h',
    regName: 'Emri / Kompania *', regCity: 'Qyteti *', regEmail: 'E-mail *',
    regDesc: 'Përshkrim', regDescPH: 'Çfarë ofroni?',
    regTags: 'Aftësi / Tags', regTagsPH: 'React, Node.js…',
    regSend: 'Dërgo ✓', regDoneTitle: 'U dërgua!', regDoneSub: 'Publikohet brenda 24–48h.',
    footer: '© 2025 TechGate Kosovo · Platforma Urë Biznesi',
    footLinks: ['Privatësia', 'Kushtet', 'Imprint', 'Kontakti'],
  },
  sv: {
    tagline: 'Business Bridge Platform',
    navHome: 'Hem', navDir: 'Företag & Frilansare', navMatch: 'AI-Matchning',
    navConcierge: 'Concierge', navGov: 'Myndigheter', registerBtn: '+ Registrera',
    live: '500+ verifierade profiler · Kosovo',
    h1a: 'Din ingång till', h1b: 'Kosovos Tech-hubb',
    heroSub: 'Företag, frilansare och konsulter från Kosovo — för ditt nästa outsourcing- eller samarbetsprojekt.',
    searchPH: 't.ex. React-utvecklare, callcenter, CNC-tillverkning…', searchBtn: 'Sök',
    stat1: 'Företag', stat2: 'Frilansare', stat3: 'Aktiva Partners', stat4: 'Bolagsskatt',
    howTitle: 'Hur det fungerar',
    f1t: 'Hitta Företag & Frilansare', f1d: 'Bläddra bland 500+ verifierade profiler.',
    f2t: 'AI-Matchning', f2d: 'Beskriv ditt behov — Claude hittar de bästa matcherna.',
    f3t: 'Kosovo Concierge', f3d: 'rootsGTM organiserar ditt kompletta affärsbesök.',
    catsTitle: 'Branscher', topTitle: '⭐ Topprofiler', viewAll: 'Visa alla →',
    ctaTitle: 'Registrera dig gratis', ctaSub: '3 minuter, gratis. Synlig för EU-kunder.',
    ctaBtn: 'Registrera →', ctaGov: 'Om Kosovo',
    rankSub: 'Alla kontakter offentliga · Priser per samtal',
    allCats: 'Alla', allTypes: '🌐 Alla', onlyComp: '🏢 Företag', onlyFL: '👤 Frilansare',
    sortRating: '⭐ Betyg', sortReviews: '💬 Recensioner', sortAZ: 'A–Ö',
    noResults: 'Inga resultat', noResultsSub: 'Prova andra sökord',
    rateNote: 'Priser överenskommes', verified: '✓ Verifierad',
    sendReq: 'Skicka förfrågan', viewProf: 'Profil',
    upgradeBtn: '⭐',
    upgradeTitle: 'Öka synligheten',
    upgradeSubSp: 'Sponsrad · 1 slot per kategori',
    upgradeSubPr: 'Premium · max. 3 slots',
    upgradeBenSp: ['🥇 Position 1', 'Sponsrad-etikett', 'Visas på startsidan', 'Nyhetsbrev'],
    upgradeBenPr: ['⭐ Position 2–4', 'Premium-badge', 'Högre synlighet', 'Statistik'],
    upgradeNoteSp: 'Endast 1 sponsor per kategori.',
    upgradeNotePr: 'Maximalt 3 premium per kategori.',
    upgradeContact: 'Kontakt:', upgradeMail: 'upgrade@techgate-ks.com',
    waitTitle: 'Gå med i kö', waitSub: 'Vi meddelar dig när en slot öppnas.',
    waitName: 'Ditt namn *', waitEmail: 'Din e-post *', waitSend: 'Gå med ✓',
    waitDoneTitle: 'Du är i kön!', waitDoneSub: 'Vi kontaktar dig när slot öppnas.',
    reqTitle: 'Förfrågan till', reqName: 'Ditt namn *', reqEmail: 'Din e-post *', reqMsg: 'Meddelande',
    reqPH: 'Hej, vi söker…', reqSend: 'Skicka ✓', reqCancel: 'Avbryt',
    reqDoneTitle: 'Skickat!', reqDoneSub: 'återkommer till dig.',
    close: 'Stäng', back: '← Tillbaka',
    matchTitle: 'AI-Matchning', matchSub: 'Beskriv ditt behov — Claude hittar de bästa matcherna.',
    matchWhat: 'Vad söker du? *', matchPH: 't.ex. React-team, 3–4 utvecklare, distans…',
    matchType: 'Typ', matchBoth: 'Företag & Frilansare', matchFirm: 'Företag', matchFL: 'Frilansare',
    matchDur: 'Varaktighet', matchDurOpts: ['–', 'Engång', '1–3 månader', '3–6 månader', '6–12 månader', 'Löpande'],
    matchBtn: '🤖 Starta matchning', matchRunning: 'Analyserar…',
    matchResults: 'Matchande profiler', matchWhy: 'Varför?', noMatch: 'Inga träffar — precisera.',
    concHeroTitle: 'Kosovo Concierge',
    concHeroSub: 'Våra partners organiserar ditt kompletta affärsbesök — möten, evenemang, myndighetsbesök. Allt på ett ställe.',
    concReq: '🗓 Boka besök', concLearn: 'Läs mer',
    concAvail: 'Aktiva partners',
    concPartnersTitle: 'Våra Partners',
    concPartnersSub: 'rootsGTM och Kosovos regering är våra officiella partners.',
    concPkgTitle: 'Besökspaket', concPkgSub: 'Villkor och priser överenskommes i samtal.',
    pkgCta: 'Förfrågan',
    concHowTitle: 'Hur fungerar det?', concHowSub: 'Från första förfrågan till signerat avtal.',
    howSteps: [
      { n: '01', ic: '📋', t: 'Beskriv behov', d: 'Formulär eller samtal.' },
      { n: '02', ic: '🤖', t: 'AI-förval', d: 'Claude filtrerar matcherna.' },
      { n: '03', ic: '🤝', t: 'Partnern planerar', d: 'rootsGTM koordinerar.' },
      { n: '04', ic: '✈️', t: 'Du anländer', d: 'Allt förberett.' },
      { n: '05', ic: '📄', t: 'Uppföljning', d: 'Avtal & nästa steg.' },
    ],
    concSpTitle: 'rootsGTM:s säljteam', concSpSub: 'rootsGTM:s säljteam arbetar på plats i Kosovo — de känner affärskulturen, de bästa kontakterna och hanterar allt åt dig.',
    spDeals: 'Affärer',
    concCtaTitle: 'Redo för Kosovo-besök?',
    concCtaFeats: ['✓ Svar 24h', '✓ Ingen förskottsbetalning', '✓ Gratis samtal', '✓ Flexibelt'],
    concCtaBtn: '🗓 Boka besök →',
    concBecomeTitle: 'Bli Partner',
    concBecomeSub: 'Är du en organisation, handelskammare eller säljnätverk? Ansök som officiell TechGate-partner.',
    concBecomeTypes: ['🏛️ Myndigheter', '📣 Säljnätverk', '🌍 Diasporaorganisationer', '🤝 Handelskammare'],
    concBecomeBtn: 'Skicka ansökan →',
    bookTitle: 'Boka Kosovo-besök', bookName: 'Namn *', bookComp: 'Företag',
    bookEmail: 'E-post *', bookGoal: 'Ditt mål', bookGoalPH: 't.ex. Träffa mjukvaruteam…',
    bookWhen: 'Datum', bookPax: 'Deltagare', bookSend: 'Skicka ✓',
    bookDoneTitle: 'Förfrågan skickad!', bookDoneSub: 'Vårt team återkommer inom 24 timmar.',
    partnerRegTitle: 'Ansök som Partner', partnerRegSub: 'Gratis · Svar inom 48h',
    partnerOrg: 'Organisation / Namn *', partnerType: 'Typ',
    partnerTypes: ['Myndighet', 'Säljnätverk', 'Handelskammare', 'Diasporaorganisation', 'Annat'],
    partnerEmail: 'E-post *', partnerDesc: 'Kort beskrivning',
    partnerDescPH: 'Vad kan din organisation bidra med?', partnerSend: 'Skicka ansökan ✓',
    partnerDoneTitle: 'Ansökan inskickad!', partnerDoneSub: 'Vi återkommer inom 48 timmar.',
    govBadge: 'Officiell informationsportal',
    govH1: 'Bolagsregistrering &', govH2: 'Investering i Kosovo',
    govSub: 'Låga skatter, euro, EU-anslutning och ung talangtbas.',
    govSteps: [
      { ic: '🖥️', t: 'Online-registrering', d: 'ARBK online.', time: '1–3 dagar' },
      { ic: '💶', t: 'Aktiekapital', d: 'Min. 1 EUR.', time: '1 dag' },
      { ic: '📋', t: 'Skattenummer', d: 'Automatiskt.', time: '1–2 dagar' },
      { ic: '🏦', t: 'Bankkonto', d: '10 banker.', time: '2–5 dagar' },
    ],
    govFactsH: '🇽🇰 Kosovo',
    govFacts: [['10%', 'Bolagsskatt'], ['18%', 'Moms'], ['1 EUR', 'Kapital'], ['5–10 dagar', 'Bildning'], ['EUR', 'Valuta'], ['1,8M', 'Invånare'], ['63%', 'Under 35'], ['2008', 'Självständig']],
    govLinks: 'Officiella länkar',
    regTitle: 'Vad vill du registrera?',
    regComp: '🏢 Företag', regCompS: 'Team, AB, Byrå',
    regFL: '👤 Frilansare', regFLS: 'Egenföretagare',
    regSP: '🤝 Säljpartner', regSPS: 'Kosovo-baserad',
    regFree: 'Gratis · 24–48h',
    regName: 'Namn / Företag *', regCity: 'Stad *', regEmail: 'E-post *',
    regDesc: 'Beskrivning', regDescPH: 'Vad erbjuder du?',
    regTags: 'Kompetenser / Taggar', regTagsPH: 'React, Node.js…',
    regSend: 'Skicka ✓', regDoneTitle: 'Inskickad!', regDoneSub: 'Publiceras inom 24–48h.',
    footer: '© 2025 TechGate Kosovo · Business Bridge Platform',
    footLinks: ['Integritetspolicy', 'Villkor', 'Impressum', 'Kontakt'],
  },
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const SLOTS = { sponsored: 1, premium: 3 }

const CATS = [
  { id: 'software',   icon: '💻', color: '#58a6ff', labels: { de: 'Software & IT',    en: 'Software & IT',    sq: 'Softuer & IT',      sv: 'Mjukvara & IT' },    count: 148 },
  { id: 'support',    icon: '🛠️', color: '#a78bfa', labels: { de: 'Tech Support',     en: 'Tech Support',     sq: 'Mbështetje Tech',   sv: 'Teknisk support' },  count: 93  },
  { id: 'consulting', icon: '📊', color: '#34d399', labels: { de: 'Consulting',        en: 'Consulting',       sq: 'Konsulencë',        sv: 'Konsulting' },       count: 67  },
  { id: 'production', icon: '🏭', color: '#fb923c', labels: { de: 'Produktion',        en: 'Production',       sq: 'Prodhim',           sv: 'Tillverkning' },     count: 41  },
  { id: 'bpo',        icon: '📞', color: '#f472b6', labels: { de: 'BPO / Call Center', en: 'BPO / Call Centre',sq: 'BPO / Call Center', sv: 'BPO / Callcenter' }, count: 55  },
  { id: 'design',     icon: '🎨', color: '#facc15', labels: { de: 'Design & Creative', en: 'Design & Creative',sq: 'Dizajn & Kreativ',  sv: 'Design' },           count: 38  },
  { id: 'logistics',  icon: '🚚', color: '#6ee7b7', labels: { de: 'Logistik',          en: 'Logistics',        sq: 'Logjistikë',        sv: 'Logistik' },         count: 29  },
  { id: 'legal',      icon: '⚖️', color: '#fca5a5', labels: { de: 'Legal & Finanzen',  en: 'Legal & Finance',  sq: 'Ligjor & Financa',  sv: 'Juridik & Finans' }, count: 22  },
]

const PROFILES = [
  { id: 'c1', tier: 'sponsored', type: 'company', name: 'AlbaCode GmbH', cat: 'software', city: 'Pristina', tags: ['React', 'Node.js', 'TypeScript', 'Mobile'], rating: 4.9, reviews: 34, verified: true, employees: '15–30', founded: 2019, logo: 'AC', logoColor: '#58a6ff', contact: 'hi@albacode.ks', phone: '+383 44 100 200', desc: { de: 'Full-Stack Entwicklung & Mobile Apps für EU-Märkte.', en: 'Full-stack development & mobile apps for EU markets.', sq: 'Zhvillim full-stack dhe aplikacione mobile.', sv: 'Full-stack och mobilappar för EU.' } },
  { id: 'f1', tier: 'premium',   type: 'freelancer', name: 'Arton Krasniqi', cat: 'software', city: 'Pristina', tags: ['React', 'TypeScript', 'GraphQL'], rating: 4.9, reviews: 28, verified: true, availability: 'remote', experience: '7', languages: 'DE, EN, SQ', logo: 'AK', logoColor: '#34d399', contact: 'arton.k@dev.ks', phone: '+383 44 200 300', desc: { de: '7 Jahre React-Erfahrung. SaaS-Frontend-Spezialist.', en: '7 years React. SaaS frontend specialist.', sq: '7 vite React. Specialist frontend SaaS.', sv: '7 år React. SaaS-frontendspecialist.' } },
  { id: 'f4', tier: 'premium',   type: 'freelancer', name: 'Visar Berisha', cat: 'software', city: 'Ferizaj', tags: ['Python', 'Django', 'PostgreSQL'], rating: 4.7, reviews: 15, verified: true, availability: 'remote', experience: '6', languages: 'EN, SQ', logo: 'VB', logoColor: '#fb923c', contact: 'v.berisha@gmail.com', desc: { de: 'Backend & Data Engineer. Python/Django.', en: 'Backend & data engineer. Python/Django.', sq: 'Backend dhe data engineer.', sv: 'Backend och dataingenjör.' } },
  { id: 'c5', tier: 'free',      type: 'company', name: 'CloudNest Kosovo', cat: 'software', city: 'Pristina', tags: ['DevOps', 'Kubernetes', 'AWS'], rating: 4.6, reviews: 11, verified: true, employees: '5–10', founded: 2020, logo: 'CN', logoColor: '#58a6ff', contact: 'team@cloudnest.io', desc: { de: 'Managed Cloud & DevOps für EU-Startups.', en: 'Managed cloud & DevOps for EU startups.', sq: 'Cloud i menaxhuar & DevOps.', sv: 'Molntjänst för EU-startups.' } },
  { id: 'c2', tier: 'sponsored', type: 'company', name: 'SupportXPro', cat: 'support', city: 'Gjakova', tags: ['24/7', 'Helpdesk', 'ITIL v4', 'DE/EN/SQ'], rating: 4.8, reviews: 58, verified: true, employees: '30–50', founded: 2018, logo: 'SX', logoColor: '#a78bfa', contact: 'ops@supportxpro.ks', phone: '+383 44 300 400', desc: { de: 'Mehrsprachiger Tech-Support, ITIL v4 zertifiziert.', en: 'Multilingual tech support, ITIL v4 certified.', sq: 'Mbështetje teknike shumëgjuhëshe.', sv: 'Flerspråkig support, ITIL v4.' } },
  { id: 'f5', tier: 'premium',   type: 'freelancer', name: 'Flori Hyseni', cat: 'support', city: 'Gjakova', tags: ['IT-Support', 'Windows', 'CompTIA'], rating: 4.6, reviews: 12, verified: true, availability: 'remote', experience: '4', languages: 'DE, EN, SQ', logo: 'FH', logoColor: '#a78bfa', contact: 'flori@support.ks', desc: { de: 'Deutschsprachiger IT-Support. CompTIA A+.', en: 'German-speaking IT support. CompTIA A+.', sq: 'IT support gjermanisht. CompTIA A+.', sv: 'Tysktalande IT-support.' } },
  { id: 'f3', tier: 'premium',   type: 'freelancer', name: 'Rina Morina', cat: 'consulting', city: 'Pristina', tags: ['Projektmanagement', 'Agile', 'PMP'], rating: 4.9, reviews: 23, verified: true, availability: 'remote', experience: '8', languages: 'DE, EN, SQ, IT', logo: 'RM', logoColor: '#34d399', contact: 'rina.m@pm.ks', phone: '+383 44 400 500', desc: { de: 'Zertifizierte PMP-Projektmanagerin.', en: 'Certified PMP project manager.', sq: 'Menaxhere projektesh PMP.', sv: 'Certifierad PMP-projektledare.' } },
  { id: 'c6', tier: 'free',      type: 'company', name: 'TechBridge Kosovo', cat: 'consulting', city: 'Prizren', tags: ['ERP', 'SAP', 'Digitalisierung'], rating: 4.7, reviews: 21, verified: true, employees: '10–20', founded: 2020, logo: 'TB', logoColor: '#34d399', contact: 'info@techbridge-ks.com', desc: { de: 'IT-Beratung & Digitaltransformation.', en: 'IT consulting & digital transformation.', sq: 'Konsulencë IT & transformim.', sv: 'IT-konsulting.' } },
  { id: 'c3', tier: 'sponsored', type: 'company', name: 'NexCall Solutions', cat: 'bpo', city: 'Pristina', tags: ['Inbound', 'Outbound', 'CRM', '6 Sprachen'], rating: 4.5, reviews: 44, verified: true, employees: '40–80', founded: 2017, logo: 'NC', logoColor: '#f472b6', contact: 'start@nexcall.ks', desc: { de: 'Call-Center für DACH-Kunden. 6 Sprachen.', en: 'Call centre for DACH. 6 languages.', sq: 'Qendër thirrjesh DACH. 6 gjuhë.', sv: 'Callcenter för DACH. 6 språk.' } },
  { id: 'f6', tier: 'premium',   type: 'freelancer', name: 'Dea Berisha', cat: 'bpo', city: 'Pristina', tags: ['Kundenservice', 'DE/EN', 'CRM'], rating: 4.7, reviews: 31, verified: true, availability: 'remote', experience: '3', languages: 'DE, EN, SQ', logo: 'DB', logoColor: '#f472b6', contact: 'dea.va@outlook.com', desc: { de: 'Native-Level Deutsch. Kundenbetreuung & CRM.', en: 'Native German. Customer service & CRM.', sq: 'Gjermanisht native. CRM.', sv: 'Infödd tyska. Kundservice.' } },
  { id: 'f2', tier: 'premium',   type: 'freelancer', name: 'Blerta Gashi', cat: 'design', city: 'Prizren', tags: ['Figma', 'UI/UX', 'Branding'], rating: 4.8, reviews: 19, verified: true, availability: 'remote', experience: '5', languages: 'DE, EN, SQ', logo: 'BG', logoColor: '#facc15', contact: 'blerta.design@outlook.com', desc: { de: 'UX-Designerin, Figma-Expertin.', en: 'UX designer, Figma expert.', sq: 'Dizajnere UX, eksperte Figma.', sv: 'UX-designer, Figma-expert.' } },
  { id: 'c4', tier: 'free',      type: 'company', name: 'PixelDrin Studio', cat: 'design', city: 'Peja', tags: ['Branding', 'Motion', 'Video'], rating: 4.9, reviews: 29, verified: true, employees: '5–15', founded: 2021, logo: 'PD', logoColor: '#facc15', contact: 'hello@pixeldrin.studio', desc: { de: 'Kreativagentur für Brand Identity.', en: 'Creative agency for brand identity.', sq: 'Agjensi kreative.', sv: 'Kreativbyrå.' } },
]

const SALES_PEOPLE = [
  { id: 'sp1', name: 'Mentor Gashi', city: 'Pristina', languages: 'DE, EN, SQ', logo: 'MG', logoColor: '#2dd4bf', rating: 4.9, reviews: 47, deals: 124, experience: '8', title: { de: 'Senior Sales Spezialist', en: 'Senior Sales Specialist', sq: 'Specialist i Lartë Shitjesh', sv: 'Senior säljspecialist' }, specialties: { de: ['IT-Outsourcing', 'Firmengründung', 'Tech-Events'], en: ['IT Outsourcing', 'Company formation', 'Tech events'], sq: ['IT Outsourcing', 'Themelim', 'Evente'], sv: ['IT-outsourcing', 'Bolagsbildning', 'Event'] }, bio: { de: 'Ehemaliger BD-Manager bei deutschem IT-Konzern. 124 erfolgreiche EU-Kosovo-Kooperationen.', en: 'Former BD manager at German IT company. 124 successful deals.', sq: 'Ish-menaxher BD. 124 bashkëpunime të suksesshme.', sv: 'Tidigare BD-chef. 124 framgångsrika affärer.' }, contact: 'mentor@techgate-ks.com', phone: '+383 44 123 456' },
  { id: 'sp2', name: 'Fjolla Kelmendi', city: 'Prizren', languages: 'DE, EN, SQ, IT', logo: 'FK', logoColor: '#a78bfa', rating: 4.8, reviews: 31, deals: 67, experience: '5', title: { de: 'Sales Spezialistin · Süd-Kosovo', en: 'Sales Specialist · South Kosovo', sq: 'Specialiste · Jug-Kosovë', sv: 'Säljspecialist · Södra Kosovo' }, specialties: { de: ['Produktion', 'Design', 'E-Commerce'], en: ['Production', 'Design', 'E-Commerce'], sq: ['Prodhim', 'Dizajn', 'E-Commerce'], sv: ['Tillverkning', 'Design', 'E-handel'] }, bio: { de: 'MBA. Fokus auf Produktionsbetriebe. Handelskammer Prizren.', en: 'MBA. Focus on production. Prizren Chamber of Commerce.', sq: 'MBA. Fokus prodhimi. Dhoma Tregtie Prizren.', sv: 'MBA. Tillverkning. Handelskammare Prizren.' }, contact: 'fjolla@techgate-ks.com', phone: '+383 45 234 567' },
  { id: 'sp3', name: 'Besnik Rama', city: 'Pristina', languages: 'EN, SQ, DE', logo: 'BR', logoColor: '#fb923c', rating: 4.7, reviews: 22, deals: 44, experience: '4', title: { de: 'Sales Spezialist · Startups', en: 'Sales Specialist · Startups', sq: 'Specialist · Startup', sv: 'Säljspecialist · Startups' }, specialties: { de: ['Startups', 'Software-Teams', 'Investoren'], en: ['Startups', 'Software teams', 'Investors'], sq: ['Startup', 'Ekipe software', 'Investitorë'], sv: ['Startups', 'Mjukvaruteam', 'Investerare'] }, bio: { de: 'Serial Entrepreneur, 2 Exits. Kennt die kosovarische Startup-Szene.', en: 'Serial entrepreneur, 2 exits. Kosovo startup expert.', sq: 'Sipërmarrës serial, 2 exits. Ekspert startup.', sv: 'Serieentreprenör, 2 exiter.' }, contact: 'besnik@techgate-ks.com', phone: '+383 46 345 678' },
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
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.84);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(10px);}
.modal{background:#0e1420;border:1px solid rgba(212,168,67,0.22);border-radius:18px;padding:32px;max-width:500px;width:100%;max-height:90vh;overflow-y:auto;}
.flabel{display:block;font-family:'Syne',sans-serif;font-size:11px;font-weight:600;color:rgba(232,228,217,0.46);margin-bottom:5px;letter-spacing:0.8px;text-transform:uppercase;}
.sp-bar{height:3px;border-radius:14px 14px 0 0;background:linear-gradient(90deg,#fb923c,#fdba74);}
.pr-bar{height:3px;border-radius:14px 14px 0 0;background:linear-gradient(90deg,#d4a843,#fde68a);}
.rank-badge{position:absolute;top:10px;right:10px;}
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

function Logo({ text, color, size = 44 }) {
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
    const sp = PROFILES.filter(p => p.cat === catId && p.tier === 'sponsored').length
    const pr = PROFILES.filter(p => p.cat === catId && p.tier === 'premium').length
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
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>TechGate Kosovo</div>
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
              <button className="btn gbtn" style={{ flex: 1 }} disabled={!form.name || !form.email} onClick={() => setSent(true)}>{t.reqSend}</button>
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
function ProfileCard({ p, lang, t, rank, onContact, onUpgrade }) {
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
            <Logo text={p.logo} color={p.logoColor} />
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: G.muted }}>📍 {p.city} · {catLabel(p.cat, lang)}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
            {isSp && <span style={{ fontSize: 10, background: 'rgba(251,146,60,0.14)', color: G.orange, border: '1px solid rgba(251,146,60,0.3)', borderRadius: 5, padding: '2px 9px', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>🚀 Gesponsert</span>}
            {isPr && <span style={{ fontSize: 10, background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, borderRadius: 5, padding: '2px 9px', fontWeight: 700, fontFamily: "'Syne',sans-serif" }}>⭐ Premium</span>}
            {!isSp && !isPr && <span style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', color: G.muted, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 5, padding: '2px 9px', fontFamily: "'Syne',sans-serif" }}>Free</span>}
            {p.verified && <span style={{ fontSize: 10, background: 'rgba(52,199,89,0.1)', color: G.green, border: '1px solid rgba(52,199,89,0.2)', borderRadius: 5, padding: '2px 7px' }}>{t.verified}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 9, fontSize: 12, color: G.muted, fontFamily: "'DM Sans',sans-serif" }}>
          <span><Stars r={p.rating} /> {p.rating} ({p.reviews})</span>
          {isFL ? <span>🗣 {p.languages}</span> : <span>👥 {p.employees}</span>}
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, lineHeight: 1.62, marginBottom: 11 }}>{p.desc[lang] || p.desc.en}</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>{p.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.teal, fontWeight: 500 }}>💬 {t.rateNote}</div>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          <button className="btn gbtn" style={{ flex: 1, padding: '8px', fontSize: 12 }} onClick={() => onContact(p)}>{t.sendReq}</button>
          <button className="btn ghost" style={{ padding: '8px 12px', fontSize: 13 }} title="Sichtbarkeit erhöhen" onClick={() => onUpgrade(p.cat)}>⭐</button>
        </div>
      </div>
    </div>
  )
}

// ─── DIRECTORY PAGE ───────────────────────────────────────────────────────────
function DirectoryPage({ lang, t }) {
  const [q, setQ] = useState('')
  const [typeF, setTypeF] = useState('all')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('rating')
  const [contact, setContact] = useState(null)
  const [upgrade, setUpgrade] = useState(null)

  const ranked = useMemo(() => {
    const byCat = {}
    PROFILES.forEach(p => {
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
  }, [])

  const filtered = ranked.filter(p => {
    const s = q.toLowerCase()
    const desc = p.desc[lang] || p.desc.en || ''
    return (
      (!q || p.name.toLowerCase().includes(s) || desc.toLowerCase().includes(s) || p.tags.some(tg => tg.toLowerCase().includes(s))) &&
      (typeF === 'all' || p.type === typeF) &&
      (cat === 'all' || p.cat === cat)
    )
  })

  const catList = cat === 'all' ? CATS : CATS.filter(c => c.id === cat)

  return (
    <div style={{ padding: '28px 44px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 16, fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.muted }}>{t.rankSub}</div>
      <div style={{ display: 'flex', gap: 9, marginBottom: 12 }}>
        <input className="inp" style={{ flex: 1, fontSize: 15 }} placeholder={t.searchPH} value={q} onChange={e => setQ(e.target.value)} />
        <select className="inp" style={{ width: 148, fontSize: 12 }} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="rating">{t.sortRating}</option>
          <option value="reviews">{t.sortReviews}</option>
          <option value="name">{t.sortAZ}</option>
        </select>
      </div>
      <div style={{ display: 'flex', gap: 7, marginBottom: 11, flexWrap: 'wrap' }}>
        {[['all', t.allTypes], ['company', t.onlyComp], ['freelancer', t.onlyFL]].map(([v, l]) => (
          <button key={v} onClick={() => setTypeF(v)} className="btn" style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600, background: typeF === v ? G.goldDim : 'rgba(255,255,255,0.04)', color: typeF === v ? G.gold : G.muted, border: `1px solid ${typeF === v ? G.goldBorder : 'rgba(255,255,255,0.07)'}` }}>{l}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6, marginBottom: 22, scrollbarWidth: 'none' }}>
        <button onClick={() => setCat('all')} className="btn" style={{ padding: '6px 13px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', background: cat === 'all' ? G.goldDim : 'rgba(255,255,255,0.04)', color: cat === 'all' ? G.gold : G.muted, border: `1px solid ${cat === 'all' ? G.goldBorder : 'rgba(255,255,255,0.07)'}` }}>{t.allCats}</button>
        {CATS.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} className="btn" style={{ padding: '6px 13px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', background: cat === c.id ? `${c.color}18` : 'rgba(255,255,255,0.04)', color: cat === c.id ? c.color : G.muted, border: `1px solid ${cat === c.id ? `${c.color}40` : 'rgba(255,255,255,0.07)'}` }}>
            {c.icon} {c.labels[lang]}
          </button>
        ))}
      </div>

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
                <ProfileCard key={p.id} p={p} lang={lang} t={t} rank={p._rank} onContact={setContact} onUpgrade={setUpgrade} />
              ))}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 20px', color: G.muted }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontFamily: "'DM Sans',sans-serif" }}>{t.noResults} „{q}"</div>
          <div style={{ fontSize: 13, fontFamily: "'DM Sans',sans-serif", marginTop: 6 }}>{t.noResultsSub}</div>
        </div>
      )}

      {contact && <ContactModal profile={contact} t={t} onClose={() => setContact(null)} />}
      {upgrade && <UpgradeModal catId={upgrade} t={t} lang={lang} onClose={() => setUpgrade(null)} />}
    </div>
  )
}

// ─── MATCH PAGE ───────────────────────────────────────────────────────────────
function MatchPage({ lang, t }) {
  const [req, setReq] = useState('')
  const [typeF, setTypeF] = useState('all')
  const [dur, setDur] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [contact, setContact] = useState(null)

  const run = async () => {
    if (!req.trim()) return
    setLoading(true)
    setResults(null)
    try {
      const pool = PROFILES.filter(p => typeF === 'all' || p.type === typeF)
      const list = pool.map(p => `ID:${p.id} Type:${p.type} Name:"${p.name}" Cat:${p.cat} City:${p.city} Tags:${p.tags.join(',')} Rating:${p.rating}${p.type === 'freelancer' ? ` Langs:${p.languages}` : ` Employees:${p.employees}`}`).join('\n')
      const ln = { de: 'German', en: 'English', sq: 'Albanian (Shqip)', sv: 'Swedish' }[lang]
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 900,
          system: `TechGate Kosovo matching engine. Respond ONLY in ${ln} with raw JSON array, no markdown.`,
          messages: [{ role: 'user', content: `Client: "${req}"\nDuration: ${dur || 'n/a'}\nProfiles:\n${list}\nReturn top 3: [{"id":"...","matchScore":0-100,"reason":"2 sentences in ${ln}"}]` }],
        }),
      })
      const d = await res.json()
      const arr = JSON.parse(d.content?.map(c => c.text || '').join('').replace(/```json|```/g, '').trim() || '[]')
      setResults(arr.map(r => ({ ...r, profile: PROFILES.find(p => p.id === r.id) })).filter(r => r.profile))
    } catch { setResults([]) }
    setLoading(false)
  }

  const sc = s => s >= 80 ? G.green : s >= 50 ? G.gold : G.red

  return (
    <div style={{ padding: '36px 44px', maxWidth: 820, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'inline-block', background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 6, padding: '3px 12px', fontSize: 11, color: G.gold, marginBottom: 12, letterSpacing: '1px', textTransform: 'uppercase' }}>Claude Sonnet</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(22px,3.5vw,36px)', letterSpacing: '-0.6px', marginBottom: 8 }}>{t.matchTitle}</h2>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 15, lineHeight: 1.75 }}>{t.matchSub}</p>
      </div>
      <div className="card" style={{ padding: 22, marginBottom: 20 }}>
        <div style={{ marginBottom: 13 }}><label className="flabel">{t.matchWhat}</label><textarea className="inp" rows={4} value={req} onChange={e => setReq(e.target.value)} style={{ resize: 'vertical' }} placeholder={t.matchPH} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginBottom: 16 }}>
          <div><label className="flabel">{t.matchType}</label>
            <select className="inp" value={typeF} onChange={e => setTypeF(e.target.value)}>
              <option value="all">{t.matchBoth}</option>
              <option value="company">{t.matchFirm}</option>
              <option value="freelancer">{t.matchFL}</option>
            </select>
          </div>
          <div><label className="flabel">{t.matchDur}</label>
            <select className="inp" value={dur} onChange={e => setDur(e.target.value)}>
              {t.matchDurOpts.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <button className="btn gbtn" disabled={loading || !req.trim()} onClick={run} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: !req.trim() ? 0.5 : 1 }}>
          {loading ? <><Spin />{t.matchRunning}</> : t.matchBtn}
        </button>
      </div>
      {results !== null && (
        <div className="fi">
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 17, marginBottom: 13 }}>{t.matchResults} <span style={{ color: G.gold }}>({results.length})</span></h3>
          {results.length === 0 && <div style={{ color: G.muted, fontSize: 14, padding: 20, textAlign: 'center' }}>{t.noMatch}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {results.map((r, i) => {
              const p = r.profile
              const isFL = p.type === 'freelancer'
              return (
                <div key={p.id} className="card fi" style={{ padding: 18, animationDelay: `${i * 0.06}s` }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: i === 0 ? G.goldDim : 'rgba(255,255,255,0.05)', border: `1px solid ${i === 0 ? G.goldBorder : G.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13, color: i === 0 ? G.gold : G.muted, flexShrink: 0 }}>#{i + 1}</div>
                    <Logo text={p.logo} color={p.logoColor} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: G.muted, marginTop: 1 }}>📍 {p.city}{isFL ? ` · 🗣 ${p.languages}` : ''}</div>
                        </div>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: sc(r.matchScore), flexShrink: 0, marginLeft: 10 }}>{r.matchScore}%</div>
                      </div>
                      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, margin: '7px 0' }}>
                        <div style={{ height: '100%', width: `${r.matchScore}%`, background: `linear-gradient(90deg,${sc(r.matchScore)},${sc(r.matchScore)}80)`, borderRadius: 2 }} />
                      </div>
                      <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 8, padding: '8px 12px', marginBottom: 8 }}>
                        <div style={{ fontSize: 10, color: G.gold, fontWeight: 700, marginBottom: 2 }}>✨ {t.matchWhy}</div>
                        <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(232,228,217,0.72)', lineHeight: 1.6 }}>{r.reason}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>{p.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div>
                      <button className="btn gbtn" style={{ padding: '7px 14px', fontSize: 12 }} onClick={() => setContact(p)}>{t.sendReq}</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {contact && <ContactModal profile={contact} t={t} onClose={() => setContact(null)} />}
    </div>
  )
}

// ─── CONCIERGE PAGE ───────────────────────────────────────────────────────────
function ConciergePage({ lang, t }) {
  const [bookModal, setBookModal] = useState(false)
  const [bookDone, setBookDone] = useState(false)
  const [partnerModal, setPartnerModal] = useState(false)
  const [partnerDone, setPartnerDone] = useState(false)

  const PACKAGES = [
    { ic: '🔍', col: '#58a6ff', price: 'ab €390', name: lang === 'de' ? 'Discovery Visit' : lang === 'sv' ? 'Discovery-besök' : lang === 'sq' ? 'Vizita Discovery' : 'Discovery Visit', dur: lang === 'de' ? '1–2 Tage' : lang === 'sv' ? '1–2 dagar' : lang === 'sq' ? '1–2 ditë' : '1–2 days', ideal: lang === 'de' ? 'Erste Erkundung' : lang === 'sv' ? 'Första utforskning' : lang === 'sq' ? 'Eksplorimi i parë' : 'First exploration', inc: lang === 'de' ? ['Bedarfsanalyse (Call)', '2–3 Meetings', 'Briefing & Nachbericht'] : lang === 'sv' ? ['Behovsanalys', '2–3 möten', 'Briefing & rapport'] : lang === 'sq' ? ['Analizë nevojash', '2–3 takime', 'Briefing & raport'] : ['Needs analysis call', '2–3 meetings', 'Briefing & report'] },
    { ic: '🤝', col: G.gold, highlight: true, price: 'ab €790', name: lang === 'de' ? 'Business Visit' : lang === 'sv' ? 'Business-besök' : lang === 'sq' ? 'Vizita Biznesi' : 'Business Visit', dur: lang === 'de' ? '2–3 Tage' : lang === 'sv' ? '2–3 dagar' : lang === 'sq' ? '2–3 ditë' : '2–3 days', ideal: lang === 'de' ? 'Konkretes Projekt' : lang === 'sv' ? 'Konkret projekt' : lang === 'sq' ? 'Projekt konkret' : 'Concrete project', inc: lang === 'de' ? ['Alles aus Discovery', '4–6 Meetings', 'Hotel & Transfer', 'Networking-Abend'] : lang === 'sv' ? ['Allt i Discovery', '4–6 möten', 'Hotell & transfer', 'Nätverkskväll'] : lang === 'sq' ? ['Gjithçka nga Discovery', '4–6 takime', 'Hotel & transport', 'Mbrëmje rrjetëzimi'] : ['Everything in Discovery', '4–6 meetings', 'Hotel & transfer', 'Networking evening'] },
    { ic: '🏛️', col: '#a78bfa', price: 'ab €1.490', name: lang === 'de' ? 'Executive Visit' : lang === 'sv' ? 'Executive-besök' : lang === 'sq' ? 'Vizita Executive' : 'Executive Visit', dur: lang === 'de' ? '3–5 Tage' : lang === 'sv' ? '3–5 dagar' : lang === 'sq' ? '3–5 ditë' : '3–5 days', ideal: lang === 'de' ? 'Firmengründung / Investition' : lang === 'sv' ? 'Bolagsbildning / Investering' : lang === 'sq' ? 'Themelim / Investim' : 'Company formation / Investment', inc: lang === 'de' ? ['Alles aus Business Visit', 'Ministeriumstermin', 'Partner-Dinner', 'Rechtliche Erstberatung'] : lang === 'sv' ? ['Allt i Business-besök', 'Myndighetsmöte', 'Partner-middag', 'Juridisk rådgivning'] : lang === 'sq' ? ['Gjithçka nga Business', 'Takim ministrie', 'Darkë partnerësh', 'Këshillim ligjor'] : ['Everything in Business Visit', 'Ministry meeting', 'Partner dinner', 'Initial legal advice'] },
  ]

  return (
    <div>
      {/* ── HERO ── */}
      <div style={{ padding: '56px 48px 40px', background: 'linear-gradient(135deg,rgba(45,212,191,0.09),transparent 70%)', borderBottom: `1px solid ${G.border}`, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(45,212,191,0.02) 1px,transparent 1px)', backgroundSize: '38px 38px', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 660, position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.25)', borderRadius: 100, padding: '5px 16px', marginBottom: 18 }}>
            <span style={{ width: 7, height: 7, background: G.teal, borderRadius: '50%', display: 'inline-block' }} className="pg" />
            <span style={{ fontSize: 12, color: G.teal, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>2 {t.concAvail}</span>
          </div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(28px,4.5vw,48px)', letterSpacing: '-1.1px', lineHeight: 1.1, marginBottom: 14 }}>
            {t.concHeroTitle}<br /><span style={{ color: G.teal }}>
              {lang === 'de' ? 'Wir organisieren alles.' : lang === 'sv' ? 'Vi ordnar allt.' : lang === 'sq' ? 'Ne organizojmë gjithçka.' : 'We organise everything.'}
            </span>
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 15, color: G.muted, lineHeight: 1.82, marginBottom: 26, maxWidth: 520, fontWeight: 300 }}>{t.concHeroSub}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn teal-btn" onClick={() => setBookModal(true)}>{t.concReq}</button>
            <button className="btn ghost">{t.concLearn}</button>
          </div>
        </div>
      </div>

      <div style={{ padding: '44px 48px 56px', maxWidth: 1200, margin: '0 auto' }}>

        {/* ── OFFICIAL PARTNERS ── */}
        <div style={{ marginBottom: 52 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 21, marginBottom: 6 }}>{t.concPartnersTitle}</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22, lineHeight: 1.7 }}>{t.concPartnersSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* rootsGTM */}
            <div style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.28)', borderRadius: 16, padding: '28px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,rgba(45,212,191,0.3),rgba(45,212,191,0.1))', border: '1px solid rgba(45,212,191,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🚀</div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: G.teal }}>rootsGTM</div>
                  <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>
                    {lang === 'de' ? 'Offizieller Sales Partner · Aktiv' : lang === 'sv' ? 'Officiell säljpartner · Aktiv' : lang === 'sq' ? 'Partner Zyrtar i Shitjeve · Aktiv' : 'Official Sales Partner · Active'}
                  </div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, background: 'rgba(52,199,89,0.1)', color: G.green, border: '1px solid rgba(52,199,89,0.25)', borderRadius: 5, padding: '3px 9px', fontWeight: 700, flexShrink: 0 }}>✓ Live</span>
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(232,228,217,0.75)', lineHeight: 1.75, marginBottom: 18 }}>
                {lang === 'de' ? 'rootsGTM ist unser exklusives Sales-Netzwerk — spezialisiert auf die Vermittlung zwischen EU-Unternehmen und Kosovo-Partnern. Sie übernehmen den direkten Kundenkontakt, organisieren Meetings und Follow-ups.' : lang === 'sv' ? 'rootsGTM är vårt exklusiva säljnätverk — specialiserat på att förmedla kontakter mellan EU-företag och Kosovo-partners. De hanterar direktkontakt med kunder, organiserar möten och uppföljning.' : lang === 'sq' ? 'rootsGTM është rrjeti ynë ekskluziv i shitjeve — i specializuar në ndërmjetësimin mes kompanive të BE-së dhe partnerëve të Kosovës. Ata trajtojnë kontaktet direkte me klientë dhe organizojnë takime.' : 'rootsGTM is our exclusive sales network — specialised in connecting EU companies with Kosovo partners. They handle direct client contact, meeting organisation and follow-ups.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                {(lang === 'de' ? ['🤝 Direkter Kundenkontakt', '📅 Meeting-Organisation', '🎤 Events & Networking', '📄 Follow-up & Verträge'] : lang === 'sv' ? ['🤝 Direktkontakt', '📅 Mötesorganisation', '🎤 Event & Nätverk', '📄 Uppföljning & Avtal'] : lang === 'sq' ? ['🤝 Kontakt direkt', '📅 Organizim takimesh', '🎤 Evente & Rrjet', '📄 Vijim & Kontrata'] : ['🤝 Direct client contact', '📅 Meeting organisation', '🎤 Events & networking', '📄 Follow-up & contracts']).map(f => (
                  <div key={f} style={{ background: 'rgba(45,212,191,0.06)', border: '1px solid rgba(45,212,191,0.15)', borderRadius: 8, padding: '10px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(232,228,217,0.8)' }}>{f}</div>
                ))}
              </div>
              <button className="btn teal-btn" style={{ width: '100%', padding: '11px' }} onClick={() => setBookModal(true)}>
                {lang === 'de' ? 'Mit rootsGTM anfragen →' : lang === 'sv' ? 'Förfrågan via rootsGTM →' : lang === 'sq' ? 'Kërko me rootsGTM →' : 'Enquire via rootsGTM →'}
              </button>
            </div>

            {/* Regierung Kosovo */}
            <div style={{ background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 16, padding: '28px 26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,rgba(212,168,67,0.3),rgba(212,168,67,0.1))', border: `1px solid ${G.goldBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🏛️</div>
                <div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: G.gold }}>
                    {lang === 'de' ? 'Regierung Kosovo' : lang === 'sv' ? 'Kosovos regering' : lang === 'sq' ? 'Qeveria e Kosovës' : 'Kosovo Government'}
                  </div>
                  <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>InvestKosova · {lang === 'de' ? 'Offizieller Partner' : lang === 'sv' ? 'Officiell partner' : lang === 'sq' ? 'Partner Zyrtar' : 'Official Partner'}</div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: 11, background: G.goldDim, color: G.gold, border: `1px solid ${G.goldBorder}`, borderRadius: 5, padding: '3px 9px', fontWeight: 700, flexShrink: 0 }}>
                  {lang === 'de' ? '⏳ In Verhandlung' : lang === 'sv' ? '⏳ Under förhandling' : lang === 'sq' ? '⏳ Në negocim' : '⏳ In negotiation'}
                </span>
              </div>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, color: 'rgba(232,228,217,0.75)', lineHeight: 1.75, marginBottom: 18 }}>
                {lang === 'de' ? 'TechGate Kosovo baut eine offizielle Partnerschaft mit InvestKosova und dem Ministerium für Wirtschaft auf. Ziel: Behördentermine, Firmengründungsberatung und offizielle Investitionsförderung direkt über die Plattform.' : lang === 'sv' ? 'TechGate Kosovo håller på att etablera ett officiellt partnerskap med InvestKosova och Ekonomiministeriet. Mål: myndighetsmöten, bolagsrådgivning och investeringsstöd direkt via plattformen.' : lang === 'sq' ? 'TechGate Kosovo po ndërton partneritet zyrtar me InvestKosova dhe Ministrinë e Ekonomisë. Qëllimi: takime qeveritare, këshillim themelimi dhe mbështetje investimesh direkt nëpërmjet platformës.' : 'TechGate Kosovo is building an official partnership with InvestKosova and the Ministry of Economy. Goal: government appointments, company formation advice and investment support directly through the platform.'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
                {(lang === 'de' ? ['🏛️ InvestKosova-Termine', '📋 Firmengründungsberatung', '🤝 Ministeriumstermine', '📊 Investitionsförderung'] : lang === 'sv' ? ['🏛️ InvestKosova-möten', '📋 Bolagsrådgivning', '🤝 Ministeriumsmöten', '📊 Investeringsstöd'] : lang === 'sq' ? ['🏛️ Takime InvestKosova', '📋 Këshillim themelimi', '🤝 Takime ministrie', '📊 Mbështetje investimesh'] : ['🏛️ InvestKosova meetings', '📋 Company formation advice', '🤝 Ministry appointments', '📊 Investment support']).map(f => (
                  <div key={f} style={{ background: 'rgba(212,168,67,0.07)', border: `1px solid ${G.goldBorder}`, borderRadius: 8, padding: '10px 12px', fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: 'rgba(232,228,217,0.8)' }}>{f}</div>
                ))}
              </div>
              <button className="btn gbtn" style={{ width: '100%', padding: '11px' }} onClick={() => setBookModal(true)}>
                {lang === 'de' ? 'Regierungstermin anfragen →' : lang === 'sv' ? 'Begär myndighetsmöte →' : lang === 'sq' ? 'Kërko takim qeveritar →' : 'Request government meeting →'}
              </button>
            </div>
          </div>
        </div>

        {/* ── PACKAGES ── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 21, marginBottom: 6 }}>{t.concPkgTitle}</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22 }}>{t.concPkgSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 13 }}>
            {PACKAGES.map((pkg, i) => (
              <div key={i} style={{ background: pkg.highlight ? G.goldDim : G.card, border: `1px solid ${pkg.highlight ? G.goldBorder : G.border}`, borderRadius: 14, padding: '22px 20px', position: 'relative', transition: 'all 0.22s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = '' }}>
                {pkg.highlight && <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: G.gold, color: '#080c14', borderRadius: 100, padding: '3px 14px', fontSize: 10, fontWeight: 700, fontFamily: "'Syne',sans-serif", whiteSpace: 'nowrap' }}>⭐ POPULAR</div>}
                <div style={{ fontSize: 26, marginBottom: 8 }}>{pkg.ic}</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{pkg.name}</div>
                {/* Price */}
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 26, color: pkg.highlight ? G.gold : pkg.col }}>{pkg.price}</span>
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
                <button className="btn" style={{ width: '100%', padding: '9px', background: pkg.highlight ? G.gold : 'transparent', color: pkg.highlight ? '#080c14' : pkg.col, border: `1px solid ${pkg.col}44`, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13 }} onClick={() => setBookModal(true)}>{t.pkgCta}</button>
              </div>
            ))}
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: G.muted, marginTop: 12, fontStyle: 'italic' }}>
            {lang === 'de' ? '* Preise sind Richtwerte. Der finale Preis wird gemeinsam vereinbart — abhängig von Umfang, Teilnehmern und gewünschten Leistungen.' : lang === 'sv' ? '* Priser är riktpriser. Det slutliga priset överenskommes gemensamt.' : lang === 'sq' ? '* Çmimet janë orientuese. Çmimi final bien dakord bashkërisht.' : '* Prices are indicative. The final price is agreed together based on scope and requirements.'}
          </p>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 21, marginBottom: 6 }}>{t.concHowTitle}</h2>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22 }}>{t.concHowSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 9 }}>
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

        {/* ── SALES TEAM ── */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 21 }}>{t.concSpTitle}</h2>
            <span style={{ background: 'rgba(45,212,191,0.1)', border: '1px solid rgba(45,212,191,0.28)', borderRadius: 6, padding: '3px 10px', fontSize: 12, color: G.teal, fontFamily: "'Syne',sans-serif", fontWeight: 700 }}>rootsGTM</span>
          </div>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: G.muted, fontSize: 14, marginBottom: 22 }}>{t.concSpSub}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(290px,1fr))', gap: 13 }}>
            {SALES_PEOPLE.map((sp, i) => (
              <div key={sp.id} className="card fu" style={{ padding: 20, animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', gap: 11, marginBottom: 11 }}>
                  <Avatar text={sp.logo} color={sp.logoColor} />
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14 }}>{sp.name}</div>
                    <div style={{ fontSize: 11, color: G.teal }}>{sp.title[lang] || sp.title.en}</div>
                    <div style={{ fontSize: 11, color: G.muted, marginTop: 1 }}>📍 {sp.city} · 🗣 {sp.languages}</div>
                  </div>
                </div>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: G.muted, lineHeight: 1.62, marginBottom: 10 }}>{sp.bio[lang] || sp.bio.en}</p>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 12, color: G.muted, fontFamily: "'DM Sans',sans-serif" }}>
                  <span>⭐ {sp.rating}</span><span>🤝 {sp.deals}+ {t.spDeals}</span><span>📅 {sp.experience}y</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                  {(sp.specialties[lang] || sp.specialties.en).map(s => <span key={s} style={{ background: 'rgba(45,212,191,0.08)', color: G.teal, border: '1px solid rgba(45,212,191,0.2)', borderRadius: 5, padding: '2px 7px', fontSize: 11 }}>{s}</span>)}
                </div>
                <button className="btn teal-btn" style={{ width: '100%', padding: '8px', fontSize: 12 }} onClick={() => setBookModal(true)}>{t.concReq}</button>
              </div>
            ))}
          </div>
        </div>

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
                <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>rootsGTM · TechGate Kosovo</div>
              </div>
              <ModalClose onClose={() => setBookModal(false)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 11 }}>
              <div><label className="flabel">{t.bookName}</label><input className="inp" /></div>
              <div><label className="flabel">{t.bookComp}</label><input className="inp" /></div>
            </div>
            <div style={{ marginBottom: 11 }}><label className="flabel">{t.bookEmail}</label><input className="inp" /></div>
            <div style={{ marginBottom: 11 }}><label className="flabel">{t.bookGoal}</label><textarea className="inp" rows={3} style={{ resize: 'vertical' }} placeholder={t.bookGoalPH} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div><label className="flabel">{t.bookWhen}</label><input className="inp" /></div>
              <div><label className="flabel">{t.bookPax}</label>
                <select className="inp">{['1', '2', '3', '4', '5+'].map(n => <option key={n}>{n}</option>)}</select>
              </div>
            </div>
            <button className="btn teal-btn" style={{ width: '100%', padding: '11px' }} onClick={() => setBookDone(true)}>{t.bookSend}</button>
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
function GovPage({ lang, t }) {
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
          <button className="btn gbtn" style={{ padding: '8px 16px', fontSize: 12 }}>InvestKosova →</button>
          <button className="btn ghost" style={{ fontSize: 12 }}>ARBK</button>
          <button className="btn ghost" style={{ fontSize: 12 }}>ATK</button>
        </div>
      </div>
    </div>
  )
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState('de')
  const [page, setPage] = useState('home')
  const [showReg, setShowReg] = useState(false)
  const [regType, setRegType] = useState(null)
  const [regDone, setRegDone] = useState(false)

  const t = T[lang]
  const FLAGS = { de: '🇩🇪', en: '🇬🇧', sq: '🇽🇰', sv: '🇸🇪' }

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: G.bg, minHeight: '100vh', color: G.text }}>
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: `${G.bg}f2`, backdropFilter: 'blur(18px)', borderBottom: `1px solid ${G.border}`, padding: '0 28px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setPage('home')} className="btn" style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'transparent', border: 'none', padding: 0 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#d4a843,#b8892e)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🇽🇰</div>
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, color: G.text }}>TechGate <span style={{ color: G.gold }}>Kosovo</span></div>
            <div style={{ fontSize: 9, color: G.muted, letterSpacing: '0.7px', textTransform: 'uppercase' }}>{t.tagline}</div>
          </div>
        </button>
        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {[['home', t.navHome], ['directory', t.navDir], ['match', t.navMatch], ['concierge', t.navConcierge], ['gov', t.navGov]].map(([p, l]) => (
            <button key={p} className={`btn navl${page === p ? ' on' : ''}`} onClick={() => setPage(p)}
              style={p === 'concierge' ? { color: page === 'concierge' ? G.teal : 'rgba(45,212,191,0.45)' } : {}}>
              {l}
            </button>
          ))}
          <div style={{ width: 1, height: 18, background: G.border, margin: '0 6px' }} />
          <div style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.border}`, borderRadius: 8, padding: 3 }}>
            {['de', 'en', 'sq', 'sv'].map(l => (
              <button key={l} onClick={() => setLang(l)} className="btn" style={{ padding: '4px 9px', fontSize: 11, fontWeight: 700, background: lang === l ? 'rgba(212,168,67,0.18)' : 'transparent', color: lang === l ? G.gold : G.muted, border: `1px solid ${lang === l ? G.goldBorder : 'transparent'}`, borderRadius: 6 }}>
                {FLAGS[l]} {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="btn gbtn" style={{ marginLeft: 8, padding: '8px 16px', fontSize: 12 }} onClick={() => setShowReg(true)}>{t.registerBtn}</button>
        </div>
      </nav>

      {/* ── PAGES ── */}
      {page === 'home' && (
        <>
          <section style={{ padding: '80px 48px 56px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: `radial-gradient(ellipse 70% 50% at 50% -5%,rgba(212,168,67,0.12) 0%,transparent 65%),${G.bg}` }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.016) 1px,transparent 1px)', backgroundSize: '44px 44px', pointerEvents: 'none' }} />
            <div className="fu" style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: G.goldDim, border: `1px solid ${G.goldBorder}`, borderRadius: 100, padding: '5px 16px', marginBottom: 22 }}>
                <span style={{ width: 7, height: 7, background: G.green, borderRadius: '50%', display: 'inline-block', boxShadow: `0 0 8px ${G.green}` }} />
                <span style={{ fontSize: 12, color: G.gold, fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{t.live}</span>
              </div>
              <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 'clamp(32px,5vw,56px)', letterSpacing: '-1.5px', lineHeight: 1.08, marginBottom: 16 }}>
                {t.h1a}<br /><span style={{ color: G.gold }}>{t.h1b}</span>
              </h1>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 16, color: G.muted, lineHeight: 1.82, fontWeight: 300, maxWidth: 520, margin: '0 auto 32px' }}>{t.heroSub}</p>
              <div style={{ display: 'flex', gap: 7, maxWidth: 540, margin: '0 auto 32px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${G.goldBorder}`, borderRadius: 12, padding: 5 }}>
                <input className="inp" style={{ flex: 1, background: 'transparent', border: 'none', fontSize: 15 }} placeholder={t.searchPH} onKeyDown={e => e.key === 'Enter' && setPage('directory')} />
                <button className="btn gbtn" style={{ flexShrink: 0 }} onClick={() => setPage('directory')}>{t.searchBtn} →</button>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 30, flexWrap: 'wrap' }}>
                {[['347', t.stat1], ['153', t.stat2], ['2', t.stat3], ['10%', t.stat4]].map(([n, l]) => (
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
              {[[G.blue, '🔍', t.f1t, t.f1d, 'directory'], [G.gold, '🤖', t.f2t, t.f2d, 'match'], [G.teal, '🤝', t.f3t, t.f3d, 'concierge']].map(([col, ic, title, desc, pg]) => (
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
                  <div style={{ fontSize: 11, color: c.color }}>{c.count}</div>
                </div>
              ))}
            </div>
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
      {page === 'directory'  && <DirectoryPage lang={lang} t={t} />}
      {page === 'match'      && <MatchPage lang={lang} t={t} />}
      {page === 'concierge'  && <ConciergePage lang={lang} t={t} />}
      {page === 'gov'        && <GovPage lang={lang} t={t} />}

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
                <div style={{ display: 'flex', gap: 9 }}>
                  {[[t.regComp, t.regCompS], [t.regFL, t.regFLS], [t.regSP, t.regSPS]].map(([l, sub], i) => (
                    <div key={i} onClick={() => setRegType(l)} style={{ flex: 1, padding: '15px 9px', border: `1px solid ${G.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = G.goldBorder; e.currentTarget.style.background = G.goldDim }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = G.border; e.currentTarget.style.background = 'transparent' }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{l}</div>
                      <div style={{ fontSize: 11, color: G.muted }}>{sub}</div>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 11 }}>
                  <div><label className="flabel">{t.regName}</label><input className="inp" /></div>
                  <div><label className="flabel">{t.regCity}</label><input className="inp" placeholder="Pristina" /></div>
                </div>
                <div style={{ marginBottom: 11 }}><label className="flabel">{t.regEmail}</label><input className="inp" /></div>
                <div style={{ marginBottom: 11 }}><label className="flabel">{t.regDesc}</label><textarea className="inp" rows={3} style={{ resize: 'vertical' }} placeholder={t.regDescPH} /></div>
                <div style={{ marginBottom: 18 }}><label className="flabel">{t.regTags}</label><input className="inp" placeholder={t.regTagsPH} /></div>
                <button className="btn gbtn" style={{ width: '100%' }} onClick={() => setRegDone(true)}>{t.regSend}</button>
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
        <div style={{ display: 'flex', gap: 16 }}>{t.footLinks.map(l => <span key={l} style={{ cursor: 'pointer' }}>{l}</span>)}</div>
      </footer>
    </div>
  )
}
