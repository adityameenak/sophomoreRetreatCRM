import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ACTIVITY_TYPES } from '../lib/constants'

export function useCompanies(initialFilters = {}) {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCompanies = useCallback(async (filters = initialFilters) => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('companies')
      .select(`
        *,
        contacts(id, name, email, title, is_primary),
        owner:profiles!companies_internal_owner_fkey(id, full_name)
      `)
      .order('updated_at', { ascending: false })

    if (filters.status) query = query.eq('outreach_status', filters.status)
    if (filters.sponsorship) query = query.eq('target_sponsorship_level', filters.sponsorship)
    if (filters.owner) query = query.eq('internal_owner', filters.owner)
    if (filters.search) query = query.ilike('company_name', `%${filters.search}%`)

    const { data, error: err } = await query

    if (err) {
      setError(err.message)
    } else {
      setCompanies(data || [])
    }
    setLoading(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  return { companies, loading, error, refetch: fetchCompanies }
}

export function useCompanyMutations() {
  const { user } = useAuth()

  async function logActivity(companyId, type, description, metadata = null) {
    await supabase.from('company_activities').insert({
      company_id: companyId,
      type,
      description,
      created_by: user?.id,
      metadata,
    })
  }

  async function createCompany(data) {
    const { data: company, error } = await supabase
      .from('companies')
      .insert(data)
      .select()
      .single()

    if (!error && company) {
      await logActivity(
        company.id,
        ACTIVITY_TYPES.CREATED,
        `${company.company_name} was added to the CRM`
      )
    }

    return { data: company, error }
  }

  async function updateCompany(id, updates, previousData = null) {
    const { data: company, error } = await supabase
      .from('companies')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (!error && company) {
      // Log status change specifically
      if (previousData && updates.outreach_status && updates.outreach_status !== previousData.outreach_status) {
        await logActivity(
          id,
          ACTIVITY_TYPES.STATUS_CHANGED,
          `Status changed from "${previousData.outreach_status}" to "${updates.outreach_status}"`
        )
      } else if (previousData && updates.confirmed_sponsorship_level && updates.confirmed_sponsorship_level !== previousData.confirmed_sponsorship_level) {
        await logActivity(
          id,
          ACTIVITY_TYPES.SPONSORSHIP_UPDATED,
          `Confirmed sponsorship updated to "${updates.confirmed_sponsorship_level}"`
        )
      } else {
        await logActivity(
          id,
          ACTIVITY_TYPES.COMPANY_UPDATED,
          `Company details updated`
        )
      }
    }

    return { data: company, error }
  }

  async function deleteCompany(id) {
    const { error } = await supabase.from('companies').delete().eq('id', id)
    return { error }
  }

  async function logOutreach(companyId, notes) {
    const now = new Date().toISOString().split('T')[0]

    // Update company last_contact_date
    await supabase
      .from('companies')
      .update({ last_contact_date: now, updated_at: new Date().toISOString() })
      .eq('id', companyId)

    await logActivity(
      companyId,
      ACTIVITY_TYPES.OUTREACH_SENT,
      notes || 'Outreach logged'
    )
  }

  async function logFollowUp(companyId, notes, nextFollowUpDate) {
    const updates = {
      updated_at: new Date().toISOString(),
      last_contact_date: new Date().toISOString().split('T')[0],
    }
    if (nextFollowUpDate) updates.next_follow_up_date = nextFollowUpDate

    await supabase.from('companies').update(updates).eq('id', companyId)

    await logActivity(
      companyId,
      ACTIVITY_TYPES.FOLLOW_UP_LOGGED,
      notes || 'Follow-up logged'
    )
  }

  return { createCompany, updateCompany, deleteCompany, logOutreach, logFollowUp }
}
