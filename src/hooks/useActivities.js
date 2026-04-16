import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useActivities(companyId) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchActivities() {
    if (!companyId) return
    try {
      const { data } = await supabase
        .from('company_activities')
        .select(`
          *,
          actor:profiles!company_activities_created_by_fkey(id, full_name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
      setActivities(data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [companyId]) // eslint-disable-line react-hooks/exhaustive-deps

  return { activities, loading, refetch: fetchActivities }
}

// Global activity feed for dashboard
export function useRecentActivities(limit = 10) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase
          .from('company_activities')
          .select(`
            *,
            actor:profiles!company_activities_created_by_fkey(id, full_name),
            company:companies(id, company_name)
          `)
          .order('created_at', { ascending: false })
          .limit(limit)
        setActivities(data || [])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [limit])

  return { activities, loading }
}
