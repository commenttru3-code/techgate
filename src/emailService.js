// ─── EMAIL SERVICE — Business Bridge Platform ─────────────────────────────────
// Uses EmailJS (free tier: 200 emails/month, no backend needed)
//
// ── SETUP (one-time) ──────────────────────────────────────────────────────────
// 1. Sign up at https://www.emailjs.com (free)
// 2. Add Email Service (Gmail / Outlook / SMTP) → note your SERVICE_ID
// 3. Create 4 templates (copy the template bodies below) → note each TEMPLATE_ID
// 4. Go to Account → API Keys → copy your PUBLIC_KEY
// 5. Fill in the 3 config values below:
// ─────────────────────────────────────────────────────────────────────────────

const EMAILJS_PUBLIC_KEY  = 'P1yZrIRP4_fv6BQXb'   // from emailjs.com → Account
const EMAILJS_SERVICE_ID  = 'service_kosovahub'   // e.g. 'service_abc123'
const EMAILJS_INITIALIZED = { done: false }

// ── Template IDs — create these in your EmailJS dashboard ────────────────────
const TEMPLATES = {
  new_profile:    'tmpl_new_profile',    // admin notified of new submission
  verify_code:    'tmpl_verify_code',    // 6-digit code for self-edit
  booking:        'tmpl_booking',        // concierge visit request confirmation
  enquiry:        'tmpl_enquiry',        // contact enquiry to a listed company
}

// ── Admin email (receives new profile + change notifications) ─────────────────
export const ADMIN_EMAIL = 'comment.tru3@gmail.com'   // ← change this

// ─────────────────────────────────────────────────────────────────────────────

function init() {
  if (EMAILJS_INITIALIZED.done) return
  if (typeof window === 'undefined') return
  // Lazy-load the EmailJS SDK
  if (!window.emailjs) {
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
    s.onload = () => { window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); EMAILJS_INITIALIZED.done = true }
    document.head.appendChild(s)
  } else {
    window.emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY })
    EMAILJS_INITIALIZED.done = true
  }
}

async function send(templateId, params) {
  init()
  // Wait up to 3s for SDK to load
  for (let i = 0; i < 30; i++) {
    if (window.emailjs && EMAILJS_INITIALIZED.done) break
    await new Promise(r => setTimeout(r, 100))
  }
  if (!window.emailjs) { console.warn('EmailJS not loaded'); return null }
  try {
    const res = await window.emailjs.send(EMAILJS_SERVICE_ID, templateId, params)
    return res
  } catch (err) {
    console.error('EmailJS send error:', err)
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Notify admin when a new profile is submitted
//    EmailJS template variables: {{company_name}}, {{contact_email}}, {{sector}},
//    {{city}}, {{submitted_at}}, {{admin_url}}
// ─────────────────────────────────────────────────────────────────────────────
export async function notifyAdminNewProfile({ name, email, cat, city }) {
  return send(TEMPLATES.new_profile, {
    to_email:      ADMIN_EMAIL,
    company_name:  name,
    contact_email: email,
    sector:        cat,
    city:          city,
    submitted_at:  new Date().toLocaleString('en-GB'),
    admin_url:     window.location.origin + '?admin',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Send 6-digit verification code for self-service profile edits
//    EmailJS template variables: {{to_email}}, {{code}}, {{profile_name}}
// ─────────────────────────────────────────────────────────────────────────────
export async function sendVerifyCode({ toEmail, code, profileName }) {
  return send(TEMPLATES.verify_code, {
    to_email:     emailLabel,
    code,
    profile_name: profileName,
    expires_note: 'This code expires in 15 minutes.',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Concierge visit booking confirmation (to client + admin)
//    EmailJS template variables: {{to_email}}, {{client_name}}, {{package_name}},
//    {{goal}}, {{timeframe}}, {{pax}}
// ─────────────────────────────────────────────────────────────────────────────
export async function sendBookingConfirmation({ name, email, packageName, goal, timeframe, pax }) {
  // Confirmation to the client
  await send(TEMPLATES.booking, {
    to_email:     email,
    client_name:  name,
    package_name: packageName || 'Kosova Business Visit',
    goal:         goal || '—',
    timeframe:    timeframe || '—',
    pax,
    reply_to:     ADMIN_EMAIL,
  })
  // Notification to admin
  return send(TEMPLATES.booking, {
    to_email:     ADMIN_EMAIL,
    client_name:  name + ' (new booking)',
    package_name: packageName || 'Kosova Business Visit',
    goal:         goal || '—',
    timeframe:    timeframe || '—',
    pax,
    reply_to:     email,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Forward enquiry to listed company
//    EmailJS template variables: {{to_email}}, {{company_name}}, {{from_name}},
//    {{from_email}}, {{message}}
// ─────────────────────────────────────────────────────────────────────────────
export async function sendEnquiry({ toEmail, companyName, fromName, fromEmail, message }) {
  return send(TEMPLATES.enquiry, {
    to_email:     toEmail,
    company_name: companyName,
    from_name:    fromName,
    from_email:   fromEmail,
    message:      message || '—',
    reply_to:     fromEmail,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// ── EMAILJS TEMPLATE BODIES (paste these into emailjs.com dashboard) ─────────
//
// TEMPLATE 1 — new_profile (Subject: "New profile pending review: {{company_name}}")
// Hello Admin,
// A new profile has been submitted and is waiting for review.
// Company/Name: {{company_name}}
// Email: {{contact_email}}
// Sector: {{sector}} | City: {{city}}
// Submitted: {{submitted_at}}
// → Review in admin panel: {{admin_url}}
//
// TEMPLATE 2 — verify_code (Subject: "Your verification code: {{code}}")
// Hello,
// You requested to edit the profile "{{profile_name}}" on Business Bridge Platform.
// Your verification code is: {{code}}
// {{expires_note}}
// If you did not request this, please ignore this email.
//
// TEMPLATE 3 — booking (Subject: "Kosova Visit Request — {{package_name}}")
// Hello {{client_name}},
// Thank you for your visit request.
// Package: {{package_name}}
// Goal: {{goal}}
// Preferred dates: {{timeframe}} | Participants: {{pax}}
// Our team will reply within 24 hours.
// — Business Bridge Platform / rootsGTM
//
// TEMPLATE 4 — enquiry (Subject: "Enquiry for {{company_name}} via Business Bridge")
// Hello {{company_name}},
// You received a new enquiry via Business Bridge Platform.
// From: {{from_name}} ({{from_email}})
// Message: {{message}}
// Reply directly to {{from_name}} at: {{from_email}}
// ─────────────────────────────────────────────────────────────────────────────
