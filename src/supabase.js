import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://zagvxovacaxejvkmtvev.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_j00SlYMGML57sf24EXKBaA_nRyKVb82'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function fetchProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('verified', true)
    .order('tier', { ascending: false })
  if (error) { console.error('fetchProfiles:', error.message); return [] }
  return (data || []).map(dbToProfile)
}

export async function fetchAllProfilesAdmin() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchAllProfilesAdmin:', error.message); return [] }
  return (data || []).map(dbToProfile)
}

export async function insertProfile(fields) {
  const { error } = await supabase.from('profiles').insert(fields)
  if (error) console.error('insertProfile:', error.message)
  return error
}

export async function updateProfile(id, fields) {
  const { error } = await supabase.from('profiles').update(fields).eq('id', id)
  if (error) console.error('updateProfile:', error.message)
  return error
}

export async function deleteProfile(id) {
  const { error } = await supabase.from('profiles').delete().eq('id', id)
  if (error) console.error('deleteProfile:', error.message)
  return error
}

export async function verifyProfile(id) {
  const { error } = await supabase.from('profiles').update({ verified: true }).eq('id', id)
  if (error) console.error('verifyProfile:', error.message)
  return error
}

export async function fetchPendingChanges() {
  const { data, error } = await supabase
    .from('pending_changes')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) { console.error('fetchPendingChanges:', error.message); return [] }
  return data || []
}

export async function insertPendingChange(fields) {
  const { error } = await supabase.from('pending_changes').insert(fields)
  if (error) console.error('insertPendingChange:', error.message)
  return error
}

export async function approvePendingChange(changeId, profileId, changes) {
  const err1 = await updateProfile(profileId, changes)
  if (err1) return err1
  const { error } = await supabase.from('pending_changes').update({ status: 'approved' }).eq('id', changeId)
  if (error) console.error('approvePendingChange:', error.message)
  return error
}

export async function rejectPendingChange(changeId) {
  const { error } = await supabase.from('pending_changes').update({ status: 'rejected' }).eq('id', changeId)
  if (error) console.error('rejectPendingChange:', error.message)
  return error
}

export async function insertContactLead(fields) {
  const { error } = await supabase.from('contact_leads').insert(fields)
  if (error) console.error('insertContactLead:', error.message)
  return error
}

export async function insertBooking(fields) {
  const { error } = await supabase.from('concierge_bookings').insert(fields)
  if (error) console.error('insertBooking:', error.message)
  return error
}

function dbToProfile(row) {
  const initials = (row.name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return {
    id:         row.id,
    tier:       row.tier || 'free',
    type:       row.type || 'company',
    name:       row.name || '',
    cat:        row.cat || 'software',
    city:       row.city || '',
    tags:       Array.isArray(row.tags) ? row.tags : [],
    rating:     parseFloat(row.rating) || 0,
    reviews:    parseInt(row.reviews) || 0,
    verified:   row.verified || false,
    employees:  row.employees || '',
    founded:    row.founded || null,
    logo:       row.logo_text || initials,
    logoColor:  row.logo_color || '#58a6ff',
    contact:    row.email || '',
    phone:      row.phone || '',
    website:    row.website || '',
    languages:  row.languages || '',
    experience: row.experience || '',
    desc: {
      de: row.desc_de || row.desc_en || '',
      en: row.desc_en || row.desc_de || '',
      sq: row.desc_sq || row.desc_en || '',
      sv: row.desc_sv || row.desc_en || '',
    },
  }
}

export function formToDb(form, catChoice, selectedTags, regType, tObj) {
  const isFL = regType === tObj?.regFL
  return {
    name:         form.name?.trim(),
    city:         form.city?.trim(),
    email:        form.email?.trim().toLowerCase(),
    website:      form.website?.trim() || null,
    employees:    isFL ? null : (form.employees || null),
    experience:   isFL ? (form.experience || null) : null,
    languages:    form.languages?.trim() || null,
    type:         isFL ? 'freelancer' : 'company',
    cat:          catChoice || 'software',
    tags:         selectedTags || [],
    desc_de:      form.desc?.trim() || null,
    desc_en:      form.desc?.trim() || null,
    desc_sq:      form.desc?.trim() || null,
    desc_sv:      form.desc?.trim() || null,
    verified:     false,
    submitted_by: form.email?.trim().toLowerCase(),
  }
}
