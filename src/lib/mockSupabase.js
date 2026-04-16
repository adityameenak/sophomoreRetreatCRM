// Mock Supabase client for demo mode.
// Intercepts all queries and returns mock data instead of hitting the network.

import {
  MOCK_COMPANIES,
  MOCK_ACTIVITIES,
  MOCK_NOTES,
  MOCK_PROFILES,
  MOCK_USER,
} from './mockData'

// In-memory store so mutations (add/edit/delete) feel real during the session
const store = {
  companies: structuredClone(MOCK_COMPANIES),
  contacts: MOCK_COMPANIES.flatMap((c) => c.contacts || []),
  notes: Object.values(MOCK_NOTES).flat(),
  company_activities: structuredClone(MOCK_ACTIVITIES),
  profiles: structuredClone(MOCK_PROFILES),
}

// Enrich a company with joined data
function enrichCompany(company) {
  return {
    ...company,
    contacts: store.contacts.filter((c) => c.company_id === company.id),
    owner: store.profiles.find((p) => p.id === company.internal_owner) || null,
  }
}

// Enrich an activity with joined data
function enrichActivity(activity) {
  return {
    ...activity,
    actor: store.profiles.find((p) => p.id === activity.created_by) || null,
    company: store.companies.find((c) => c.id === activity.company_id)
      ? { id: activity.company_id, company_name: store.companies.find((c) => c.id === activity.company_id).company_name }
      : null,
  }
}

function enrichNote(note) {
  return {
    ...note,
    author: store.profiles.find((p) => p.id === note.author_id) || null,
  }
}

// Chainable query builder
function createChain(table) {
  let data = null
  let isSingle = false
  let filters = []
  let orderCol = null
  let orderAsc = true
  let limitN = null
  let pendingInsert = null
  let pendingUpdate = null
  let pendingDelete = false

  const applyFilters = (rows) => {
    let result = [...rows]
    for (const { type, col, val } of filters) {
      if (type === 'eq') result = result.filter((r) => r[col] == val)
      if (type === 'ilike') {
        const search = String(val).replace(/%/g, '').toLowerCase()
        result = result.filter((r) => String(r[col] || '').toLowerCase().includes(search))
      }
      if (type === 'not_null') result = result.filter((r) => r[col] !== null && r[col] !== undefined)
      if (type === 'lte') result = result.filter((r) => r[col] != null && r[col] <= val)
      if (type === 'gte') result = result.filter((r) => r[col] != null && r[col] >= val)
    }
    if (orderCol) {
      result = result.sort((a, b) => {
        const av = a[orderCol] ?? ''
        const bv = b[orderCol] ?? ''
        if (av < bv) return orderAsc ? -1 : 1
        if (av > bv) return orderAsc ? 1 : -1
        return 0
      })
    }
    if (limitN !== null) result = result.slice(0, limitN)
    return result
  }

  const resolve = () => {
    if (pendingInsert) {
      const newRow = {
        ...pendingInsert,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      store[table]?.push(newRow)
      return { data: isSingle ? newRow : [newRow], error: null }
    }

    if (pendingUpdate !== null) {
      const rows = store[table] || []
      let updated = null
      for (let i = 0; i < rows.length; i++) {
        const match = filters.every(({ type, col, val }) => type === 'eq' && rows[i][col] == val)
        if (match) {
          rows[i] = { ...rows[i], ...pendingUpdate, updated_at: new Date().toISOString() }
          updated = rows[i]
          break
        }
      }
      return { data: isSingle ? (updated || null) : [updated].filter(Boolean), error: null }
    }

    if (pendingDelete) {
      if (store[table]) {
        const before = store[table].length
        store[table] = store[table].filter((r) => {
          return !filters.every(({ type, col, val }) => type === 'eq' && r[col] == val)
        })
      }
      return { data: null, error: null }
    }

    // SELECT
    let rows = (store[table] || [])
    // Apply joins / enrichment
    if (table === 'companies') rows = rows.map(enrichCompany)
    if (table === 'company_activities') rows = rows.map(enrichActivity)
    if (table === 'notes') rows = rows.map(enrichNote)

    const filtered = applyFilters(rows)
    const result = isSingle ? (filtered[0] || null) : filtered
    return { data: result, error: null }
  }

  const chain = {
    select: () => chain,
    eq: (col, val) => { filters.push({ type: 'eq', col, val }); return chain },
    ilike: (col, val) => { filters.push({ type: 'ilike', col, val }); return chain },
    not: (col, filter) => {
      if (filter === 'is') filters.push({ type: 'not_null', col })
      return chain
    },
    lte: (col, val) => { filters.push({ type: 'lte', col, val }); return chain },
    gte: (col, val) => { filters.push({ type: 'gte', col, val }); return chain },
    order: (col, opts = {}) => { orderCol = col; orderAsc = opts.ascending !== false; return chain },
    limit: (n) => { limitN = n; return chain },
    single: () => { isSingle = true; return chain },
    insert: (rows) => {
      pendingInsert = Array.isArray(rows) ? rows[0] : rows
      isSingle = true
      return chain
    },
    update: (updates) => { pendingUpdate = updates; return chain },
    delete: () => { pendingDelete = true; return chain },
    // Thenable so `await supabase.from(...).select(...)` works
    then: (onFulfilled, onRejected) =>
      Promise.resolve(resolve()).then(onFulfilled, onRejected),
  }

  return chain
}

// Mock auth
let _authListeners = []
let _session = null

const mockAuth = {
  getSession: () =>
    Promise.resolve({ data: { session: _session }, error: null }),

  signInWithPassword: ({ email, password }) => {
    // Any non-empty credentials work in demo mode
    if (!email || !password) {
      return Promise.resolve({ data: null, error: { message: 'Enter any email and password to sign in to demo mode.' } })
    }
    _session = { user: { ...MOCK_USER, email } }
    _authListeners.forEach((fn) => fn('SIGNED_IN', _session))
    return Promise.resolve({ data: { session: _session, user: _session.user }, error: null })
  },

  signOut: () => {
    _session = null
    _authListeners.forEach((fn) => fn('SIGNED_OUT', null))
    return Promise.resolve({ error: null })
  },

  onAuthStateChange: (callback) => {
    _authListeners.push(callback)
    // Fire INITIAL_SESSION immediately, mirroring the real Supabase client behaviour
    setTimeout(() => callback('INITIAL_SESSION', _session), 0)
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            _authListeners = _authListeners.filter((fn) => fn !== callback)
          },
        },
      },
    }
  },
}

export const mockSupabase = {
  auth: mockAuth,
  from: (table) => createChain(table),
}
