import { Link } from 'react-router-dom'
import { Building2, CheckCircle, Clock, TrendingUp, Users, XCircle, AlertTriangle, CalendarClock } from 'lucide-react'
import { useDashboardStats, useUpcomingFollowUps } from '../hooks/useProfiles'
import { useRecentActivities } from '../hooks/useActivities'
import { StatusBadge, SponsorshipBadge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/LoadingSpinner'
import Card, { CardHeader } from '../components/ui/Card'
import { formatDate, formatRelativeDate, getFollowUpUrgency, classNames } from '../lib/utils'
import { STATUS_CONFIG, OUTREACH_STATUSES } from '../lib/constants'

const ACTIVITY_ICONS = {
  created: { icon: Building2, color: 'text-indigo-500 bg-indigo-50' },
  status_changed: { icon: TrendingUp, color: 'text-blue-500 bg-blue-50' },
  outreach_sent: { icon: Users, color: 'text-green-500 bg-green-50' },
  follow_up_logged: { icon: Clock, color: 'text-amber-500 bg-amber-50' },
  note_added: { icon: CheckCircle, color: 'text-purple-500 bg-purple-50' },
  sponsorship_updated: { icon: TrendingUp, color: 'text-yellow-600 bg-yellow-50' },
  company_updated: { icon: Building2, color: 'text-gray-500 bg-gray-100' },
}

const STATUS_METRICS = [
  { key: 'not_started', label: 'Not Contacted', icon: Building2, iconColor: 'text-gray-400', bg: 'bg-gray-50' },
  { key: 'contacted', label: 'Contacted', icon: Users, iconColor: 'text-indigo-500', bg: 'bg-indigo-50' },
  { key: 'follow_up_sent', label: 'Follow-Up Sent', icon: Clock, iconColor: 'text-amber-500', bg: 'bg-amber-50' },
  { key: 'interested', label: 'Interested', icon: TrendingUp, iconColor: 'text-green-500', bg: 'bg-green-50' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, iconColor: 'text-emerald-500', bg: 'bg-emerald-50' },
  { key: 'declined', label: 'Declined', icon: XCircle, iconColor: 'text-red-400', bg: 'bg-red-50' },
]

function MetricCard({ label, value, icon: Icon, iconColor, bg, to, highlight }) {
  const content = (
    <div
      className={classNames(
        'rounded-lg border bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
        highlight ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-gray-200'
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value ?? '—'}</p>
        </div>
        <div className={classNames('flex h-10 w-10 items-center justify-center rounded-lg', bg)}>
          <Icon className={classNames('h-5 w-5', iconColor)} />
        </div>
      </div>
    </div>
  )

  if (to) return <Link to={to}>{content}</Link>
  return content
}

function FollowUpRow({ company }) {
  const urgency = getFollowUpUrgency(company.next_follow_up_date)

  const urgencyStyle = {
    overdue: 'text-red-600 font-semibold',
    today: 'text-amber-600 font-semibold',
    tomorrow: 'text-amber-500',
    upcoming: 'text-gray-600',
  }

  const urgencyLabel = {
    overdue: 'Overdue',
    today: 'Today',
    tomorrow: 'Tomorrow',
    upcoming: formatDate(company.next_follow_up_date),
  }

  return (
    <Link
      to={`/companies/${company.id}`}
      className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-gray-50 transition-colors group"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
          {company.company_name}
        </p>
        <StatusBadge status={company.outreach_status} />
      </div>
      <div className="ml-4 shrink-0 text-right">
        <span className={classNames('text-xs', urgencyStyle[urgency])}>
          {urgency === 'overdue' && <AlertTriangle className="inline h-3 w-3 mr-1" />}
          {urgencyLabel[urgency]}
        </span>
      </div>
    </Link>
  )
}

function ActivityItem({ activity }) {
  const config = ACTIVITY_ICONS[activity.type] || ACTIVITY_ICONS.company_updated
  const Icon = config.icon

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={classNames('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full', config.color)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm text-gray-800">
            {activity.company && (
              <Link
                to={`/companies/${activity.company.id}`}
                className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
              >
                {activity.company.company_name}
              </Link>
            )}
            {' '}
            <span className="text-gray-600">{activity.description}</span>
          </p>
        </div>
        <p className="mt-0.5 text-xs text-gray-400">
          {activity.actor?.full_name && `${activity.actor.full_name} · `}
          {formatRelativeDate(activity.created_at)}
        </p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { stats, loading: statsLoading } = useDashboardStats()
  const { followUps, loading: followUpsLoading } = useUpcomingFollowUps()
  const { activities, loading: activitiesLoading } = useRecentActivities(12)

  if (statsLoading) return <PageLoader />

  const totalActive = stats
    ? (stats.total || 0) - (stats.statusCounts?.declined || 0) - (stats.statusCounts?.not_started || 0)
    : 0

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sophomore Retreat sponsor outreach overview
        </p>
      </div>

      {/* Top metric row */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <MetricCard
          label="Total Companies"
          value={stats?.total}
          icon={Building2}
          iconColor="text-indigo-500"
          bg="bg-indigo-50"
          to="/companies"
        />
        <MetricCard
          label="In Pipeline"
          value={totalActive}
          icon={TrendingUp}
          iconColor="text-blue-500"
          bg="bg-blue-50"
        />
        <MetricCard
          label="Confirmed"
          value={stats?.statusCounts?.confirmed || 0}
          icon={CheckCircle}
          iconColor="text-emerald-500"
          bg="bg-emerald-50"
          highlight
        />
        <MetricCard
          label="Overdue Follow-Ups"
          value={stats?.overdueFollowUps || 0}
          icon={AlertTriangle}
          iconColor="text-red-500"
          bg="bg-red-50"
        />
      </div>

      {/* Status breakdown */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {STATUS_METRICS.map(({ key, label, icon, iconColor, bg }) => (
          <Link
            key={key}
            to={`/companies?status=${key}`}
            className="rounded-lg border border-gray-200 bg-white p-3 text-center shadow-sm hover:shadow-md transition-shadow hover:border-indigo-200"
          >
            <div className={classNames('mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg', bg)}>
              {(() => { const Icon = icon; return <Icon className={classNames('h-4 w-4', iconColor)} /> })()}
            </div>
            <p className="text-lg font-bold text-gray-900">{stats?.statusCounts?.[key] || 0}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </Link>
        ))}
      </div>

      {/* Main two-column section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming follow-ups */}
        <Card padding={false}>
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Upcoming Follow-Ups</h3>
                <p className="text-xs text-gray-500">Next 14 days</p>
              </div>
              <CalendarClock className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          <div className="px-2 py-2">
            {followUpsLoading ? (
              <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
            ) : followUps.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">No upcoming follow-ups scheduled</p>
            ) : (
              followUps.map((c) => <FollowUpRow key={c.id} company={c} />)
            )}
          </div>
        </Card>

        {/* Recent activity */}
        <Card padding={false}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-50 px-5">
            {activitiesLoading ? (
              <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
            ) : activities.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">No activity yet</p>
            ) : (
              activities.map((a) => <ActivityItem key={a.id} activity={a} />)
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
