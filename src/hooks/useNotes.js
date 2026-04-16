import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { ACTIVITY_TYPES } from '../lib/constants'

export function useNotes(companyId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  async function fetchNotes() {
    if (!companyId) return
    const { data } = await supabase
      .from('notes')
      .select(`
        *,
        author:profiles!notes_author_id_fkey(id, full_name)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }

  async function addNote(content) {
    if (!content.trim()) return { error: { message: 'Note cannot be empty' } }

    const { data, error } = await supabase
      .from('notes')
      .insert({ company_id: companyId, author_id: user?.id, content })
      .select(`*, author:profiles!notes_author_id_fkey(id, full_name)`)
      .single()

    if (!error && data) {
      // Log activity
      await supabase.from('company_activities').insert({
        company_id: companyId,
        type: ACTIVITY_TYPES.NOTE_ADDED,
        description: `Note added`,
        created_by: user?.id,
      })
      await fetchNotes()
    }

    return { data, error }
  }

  async function deleteNote(noteId) {
    const { error } = await supabase.from('notes').delete().eq('id', noteId)
    if (!error) await fetchNotes()
    return { error }
  }

  useEffect(() => {
    fetchNotes()
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { notes, loading, refetch: fetchNotes, addNote, deleteNote }
}
