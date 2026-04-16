import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useProfiles() {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase.from('profiles').select('id, full_name, role').order('full_name')
        setProfiles(data || [])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { profiles, loading }
}

export function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('outreach_status, target_sponsorship_level, confirmed_sponsorship_level, next_follow_up_date')

        if (error || !data) return

        const today = new Date().toISOString().split('T')[0]
        const statusCounts = {}
        const sponsorshipCounts = {}
        let upcomingFollowUps = 0
        let overdueFollowUps = 0

        for (const row of data) {
          statusCounts[row.outreach_status] = (statusCounts[row.outreach_status] || 0) + 1
          sponsorshipCounts[row.target_sponsorship_level] =
            (sponsorshipCounts[row.target_sponsorship_level] || 0) + 1

          if (row.next_follow_up_date) {
            if (row.next_follow_up_date <= today) overdueFollowUps++
            else upcomingFollowUps++
          }
        }

        setStats({
          total: data.length,
          statusCounts,
          sponsorshipCounts,
          upcomingFollowUps,
          overdueFollowUps,
        })
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { stats, loading }
}

export function useUpcomingFollowUps(limit = 8) {
  const [followUps, setFollowUps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await supabase
          .from('companies')
          .select('id, company_name, outreach_status, next_follow_up_date')
          .not('next_follow_up_date', 'is', null)
          .lte('next_follow_up_date', new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0])
          .order('next_follow_up_date', { ascending: true })
          .limit(limit)
        setFollowUps(data || [])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [limit])

  return { followUps, loading }
}
