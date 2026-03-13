/**
 * Supabase compatibility shim — replaces Base44 SDK.
 * Exports the same `db` interface so existing components work unchanged.
 *
 * db.auth.*             — Supabase Auth
 * db.entities.<Name>.*  — Supabase table CRUD
 * db.integrations.*     — Supabase Storage
 */
import { supabase } from '@/lib/supabase'

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Parse a Base44-style sort string ("-created_at", "name") into Supabase order options.
 * Base44 used "created_date"; our tables use "created_at".
 */
function parseSort(sort) {
  if (!sort) return null
  const desc = sort.startsWith('-')
  const col = sort.replace(/^-/, '').replace('created_date', 'created_at')
  return { col, ascending: !desc }
}

/**
 * Build a Supabase query from a Base44 filter object.
 * Supports exact-match { key: value } pairs and array-column contains { tags: ['ai'] }.
 */
function applyFilters(query, filters = {}) {
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      // e.g. { tags: ['ai', 'productivity'] } → overlaps
      query = query.overlaps(key, value)
    } else {
      query = query.eq(key, value)
    }
  }
  return query
}

/**
 * Factory — creates a CRUD object for a given Supabase table name.
 */
function makeEntity(tableName) {
  return {
    /** filter(filters, sort, limit) — matches Base44 .filter() signature */
    async filter(filters = {}, sort = null, limit = 200) {
      let q = supabase.from(tableName).select('*')
      q = applyFilters(q, filters)
      const s = parseSort(sort)
      if (s) q = q.order(s.col, { ascending: s.ascending })
      q = q.limit(limit)
      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },

    /** list(sort, limit) — all rows, no filter */
    async list(sort = null, limit = 200) {
      let q = supabase.from(tableName).select('*')
      const s = parseSort(sort)
      if (s) q = q.order(s.col, { ascending: s.ascending })
      q = q.limit(limit)
      const { data, error } = await q
      if (error) throw error
      return data ?? []
    },

    /** get(id) — single row by primary key */
    async get(id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },

    /** create(payload) — insert one row, return inserted row */
    async create(payload) {
      const { data: { user } } = await supabase.auth.getUser()
      // Auto-attach creator_id / user_id / created_by from the authenticated session
      const enriched = { ...payload }
      if (user) {
        if ('creator_id' in payload === false && tableName === 'tools') enriched.creator_id = user.id
        if ('user_id' in payload === false && tableName !== 'tools') enriched.user_id = user.id
        // created_by (email) kept for backward-compat with Base44 filter patterns
        if ('created_by' in payload === false) enriched.created_by = user.email
      }
      const { data, error } = await supabase
        .from(tableName)
        .insert(enriched)
        .select()
        .single()
      if (error) throw error
      return data
    },

    /** update(id, updates) — patch a row */
    async update(id, updates) {
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },

    /** delete(id) — remove a row */
    async delete(id) {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)
      if (error) throw error
      return {}
    },
  }
}

// ─── db object ───────────────────────────────────────────────────────────────

export const db = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    async isAuthenticated() {
      const { data: { user } } = await supabase.auth.getUser()
      return !!user
    },

    async me() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      return {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? '',
        avatar_url: user.user_metadata?.avatar_url ?? '',
        role: user.user_metadata?.role ?? 'user',
        ...user.user_metadata,
      }
    },

    redirectToLogin(returnUrl) {
      const redirect = returnUrl ?? window.location.href
      window.location.href = `/Login?redirect=${encodeURIComponent(redirect)}`
    },

    async logout(returnUrl) {
      await supabase.auth.signOut()
      window.location.href = returnUrl ?? '/'
    },
  },

  // ── Entities ──────────────────────────────────────────────────────────────
  entities: {
    Tool:            makeEntity('tools'),
    CreatorProfile:  makeEntity('creator_profiles'),
    SavedTool:       makeEntity('saved_tools'),
    Upvote:          makeEntity('upvotes'),
    Review:          makeEntity('reviews'),
    ToolQA:          makeEntity('tool_qa'),
    Subscription:    makeEntity('subscriptions'),
    Collection:      makeEntity('collections'),

    // User — read-only list of auth users via creator_profiles
    User: {
      async list(_sort, limit = 200) {
        const { data, error } = await supabase
          .from('creator_profiles')
          .select('*, user_id')
          .limit(limit)
        if (error) throw error
        return (data ?? []).map(p => ({
          id: p.user_id,
          email: p.email ?? '',
          role: p.role ?? 'user',
          ...p,
        }))
      },
      async filter(filters = {}, sort = null, limit = 200) {
        return this.list(sort, limit)
      },
    },
  },

  // ── Integrations ──────────────────────────────────────────────────────────
  integrations: {
    Core: {
      async UploadFile({ file }) {
        const ext = file.name.split('.').pop()
        const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error } = await supabase.storage
          .from('tool-images')
          .upload(path, file, { upsert: false })
        if (error) throw error
        const { data } = supabase.storage.from('tool-images').getPublicUrl(path)
        return { file_url: data.publicUrl }
      },
    },
  },
}

export const base44 = db
export default db
