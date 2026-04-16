import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useCompany(id) {
  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function fetchCompany() {
    if (!id) return
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('companies')
      .select(`
        *,
        contacts(*),
        owner:profiles!companies_internal_owner_fkey(id, full_name)
      `)
      .eq('id', id)
      .single()

    if (err) setError(err.message)
    else setCompany(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCompany()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  return { company, loading, error, refetch: fetchCompany }
}

export function useContacts(companyId) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchContacts() {
    if (!companyId) return
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('company_id', companyId)
      .order('is_primary', { ascending: false })
    setContacts(data || [])
    setLoading(false)
  }

  async function addContact(contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .insert({ ...contactData, company_id: companyId })
      .select()
      .single()
    if (!error) await fetchContacts()
    return { data, error }
  }

  async function updateContact(contactId, updates) {
    const { error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', contactId)
    if (!error) await fetchContacts()
    return { error }
  }

  async function deleteContact(contactId) {
    const { error } = await supabase.from('contacts').delete().eq('id', contactId)
    if (!error) await fetchContacts()
    return { error }
  }

  useEffect(() => {
    fetchContacts()
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { contacts, loading, refetch: fetchContacts, addContact, updateContact, deleteContact }
}
