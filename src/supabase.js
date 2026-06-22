import { createClient } from '@supabase/supabase-js'

// ⚠️ For production: move these to Vercel Environment Variables
// VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
const SUPABASE_URL = 'https://zagvxovacaxejvkmtvev.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_j00SlYMGML57sf24EXKBaA_nRyKVb82'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// ─── PROFILES ────────────────────────────────────────────────────────────────

export async function fetchProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('verified', true)
    .order('tier', { ascending: false })
  if (error) { console.error('fetchProfiles:', error); return [] }
  return (data || []).map(dbToProfile)
}

export async function fetchAllProfilesAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchAllProfilesAdmin:', error); return [] }
  return (data || []).map(dbToProfile)
}

export async function insertProfile(fields) {
  const { error } = await supabase.from('profiles').insert(fields)
  return error
}

export async function updateProfile(id, fields) {
  const { error } = await supabase.from('profiles').update(fields).eq('id', id)
  return error
}

export async function deleteProfile(id) {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  return error
}

export async function verifyProfile(id) {
  const { error } = await supabase
    .from('profiles')
    .update({ verified: true })
    .eq('id', id)
  return error
}

// ─── PENDING CHANGES ─────────────────────────────────────────────────────────

export async function fetchPendingChanges() {
  const { data, error } = await supabase
    .from('pending_changes')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchPendingChanges:', error); return [] }
  return data || []
}

export async function insertPendingChange(fields) {
  const { error } = await supabase.from('pending_changes').insert(fields)
  return error
}

export async function approvePendingChange(changeId, profileId, changes) {
  // 1. Update the profile
  const err1 = await updateProfile(profileId, changes)
  if (err1) return err1
  // 2. Mark change as approved
  const { error } = await supabase
    .from('pending_changes')
    .update({ status: 'approved' })
    .eq('id', changeId)
  return error
}

export async function rejectPendingChange(changeId) {
  const { error } = await supabase
    .from('pending_changes')
    .update({ status: 'rejected' })
    .eq('id', changeId)
  return error
}

// ─── CONTACT LEADS ────────────────────────────────────────────────────────────

export async function insertContactLead(fields) {
  const { error } = await supabase.from('contact_leads').insert(fields)
  return error
}

// ─── CONCIERGE BOOKINGS ───────────────────────────────────────────────────────

export async function insertBooking(fields) {
  const { error } = await supabase.from('concierge_bookings').insert(fields)
  return error
}

// ─── MAPPER: DB row → app profile object ─────────────────────────────────────
// NOTE: ensure your Supabase `profiles` table has these columns:
//   logo_color  text  default '#58a6ff'
//   logo_data   text  (stores compressed WebP data-URL, ~5–15 KB per image)
// Run in Supabase SQL editor:
//   alter table profiles add column if not exists logo_color text default '#58a6ff';
//   alter table profiles add column if not exists logo_data  text;
function dbToProfile(row) {
  return {
    id:              row.id,
    tier:            row.tier || 'free',
    type:            row.type,
    name:            row.name,
    cat:             row.cat,
    city:            row.city,
    tags:            row.tags || [],
    rating:          parseFloat(row.rating) || 0,
    reviews:         row.reviews || 0,
    verified:        row.verified || false,
    employees:       row.employees || '',
    founded:         row.founded || null,
    logo:            row.logo_text || row.name?.slice(0,2).toUpperCase() || '??',
    logoColor:       row.logo_color || '#58a6ff',
    logoUrl:         row.logo_data || null,
    contact:         row.email,
    phone:           row.phone || '',
    website:         row.website || '',
    languages:       row.languages || '',
    experience:      row.experience || '',
    markets:         row.markets   || '',
    desc: {
      en: row.desc_en || '',
      sq: row.desc_sq || row.desc_en || '',
    },
    // Sponsored premium fields — mapped from DB snake_case columns
    prevCompanies:   row.prev_companies   || null,
    featuredProject: row.featured_project || null,
    linkedin:        row.linkedin         || null,
    github:          row.github           || null,
    certifications:  row.certifications   || null,
    availability:    row.availability     || null,
    videoUrl:        row.video_url        || null,
    coverImage:      row.cover_image      || null,
    coverFocus:      row.cover_focus      || '50% 50%',
  }
}

// ─── MAPPER: app form → DB insert fields ─────────────────────────────────────
export function formToDb(form, catChoice, selectedTags, regType, tObj) {
  const isFL = regType === tObj?.regFL
  return {
    name:         form.name,
    city:         form.city,
    email:        form.email,
    website:      form.website || null,
    employees:    isFL ? null : (form.employees || null),
    experience:   isFL ? (form.experience || null) : null,
    languages:    form.languages || null,
    markets:      form.markets   || null,
    type:         isFL ? 'freelancer' : 'company',
    cat:          catChoice,
    tags:         selectedTags,
    logo_color:   form.logoColor || '#58a6ff',
    logo_data:    form.logo_data || null,
    desc_en:      form.desc || null,
    desc_sq:      form.desc || null,
    verified:     false,
    submitted_by: form.email,
    // Sponsored premium fields
    ...(form.prevCompanies   ? { prev_companies:   form.prevCompanies   } : {}),
    ...(form.featuredProject ? { featured_project: form.featuredProject } : {}),
    ...(form.linkedin        ? { linkedin:         form.linkedin        } : {}),
    ...(form.github          ? { github:           form.github          } : {}),
    ...(form.certifications  ? { certifications:   form.certifications  } : {}),
    ...(form.availability    ? { availability:     form.availability    } : {}),
    ...(form.videoUrl        ? { video_url:        form.videoUrl        } : {}),
    ...(form.coverImage      ? { cover_image:      form.coverImage      } : {}),
    ...(form.coverFocus      ? { cover_focus:      form.coverFocus      } : {}),
  }
}

// ─── SITE SETTINGS (partners, concierge content) ─────────────────────────────


export async function fetchSiteContent() {
  const { data, error } = await supabase
    .from('site_content')
    .select('key, value')
  if (error) { console.error('fetchSiteContent:', error.message); return {} }
  const map = {}
  ;(data || []).forEach(row => { map[row.key] = row.value })
  return map
}

export async function saveSiteContent(key, value) {
  const { error } = await supabase
    .from('site_content')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) console.error('saveSiteContent:', error.message)
  return error
}

// ─── ALIASES for AdminPage content editing ────────────────────────────────────

/** Fetch a single content block by key */
export async function fetchSettings(key) {
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  if (error) { console.error('fetchSettings:', error.message); return null }
  return data?.value || null
}

/** Save / update a single content block */
export async function upsertSetting(key, value) {
  const { error } = await supabase
    .from('site_content')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })
  if (error) console.error('upsertSetting:', error.message)
  return error
}
