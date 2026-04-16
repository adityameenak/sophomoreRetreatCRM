import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Filter,
  Plus,
  Search,
  Trash2,
  Pencil,
} from 'lucide-react'
import { useCompanies, useCompanyMutations } from '../hooks/useCompanies'
import { useProfiles } from '../hooks/useProfiles'
import { StatusBadge, SponsorshipBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { PageLoader } from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { formatDate, getFollowUpUrgency, debounce, classNames } from '../lib/utils'
import { OUTREACH_STATUSES, SPONSORSHIP_LEVELS } from '../lib/constants'

function SortIcon({ column, sortKey, sortDir }) {
  if (sortKey !== column) return <ChevronDown className="h-3.5 w-3.5 text-gray-300" />
  return sortDir === 'asc'
    ? <ChevronUp className="h-3.5 w-3.5 text-gray-500" />
    : <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
}

export default function Companies() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    sponsorship: '',
    owner: '',
  })
  const [sortKey, setSortKey] = useState('updated_at')
  const [sortDir, setSortDir] = useState('desc')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const { companies, loading, refetch } = useCompanies()
  const { deleteCompany } = useCompanyMutations()
  const { profiles } = useProfiles()

  // Debounced search refetch
  const debouncedSearch = useRef(debounce((q, f) => refetch({ ...f, search: q }), 300))

  useEffect(() => {
    debouncedSearch.current(search, filters)
  }, [search, filters])

  // Sync status filter from URL
  useEffect(() => {
    const urlStatus = searchParams.get('status')
    if (urlStatus) setFilters(f => ({ ...f, status: urlStatus }))
  }, [searchParams])

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  function setFilter(key, value) {
    const next = { ...filters, [key]: value }
    setFilters(next)
    if (key === 'status') setSearchParams(value ? { status: value } : {})
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteCompany(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    refetch({ ...filters, search })
  }

  // Client-side sort
  const sorted = [...companies].sort((a, b) => {
    let aVal = a[sortKey] ?? ''
    let bVal = b[sortKey] ?? ''
    if (typeof aVal === 'string') aVal = aVal.toLowerCase()
    if (typeof bVal === 'string') bVal = bVal.toLowerCase()
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const activeFilters = [filters.status, filters.sponsorship, filters.owner, search].filter(Boolean).length

  const columns = [
    { key: 'company_name', label: 'Company' },
    { key: 'industry', label: 'Industry' },
    { key: 'outreach_status', label: 'Status' },
    { key: 'target_sponsorship_level', label: 'Target' },
    { key: 'last_contact_date', label: 'Last Contact' },
    { key: 'next_follow_up_date', label: 'Follow-Up' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {loading ? '…' : `${companies.length} companies`}
          </p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/companies/new')}>
          Add Company
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute inset-y-0 left-3 h-4 w-4 my-auto text-gray-400" />
          <input
            type="text"
            placeholder="Search companies…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status filter */}
        <select
          value={filters.status}
          onChange={(e) => setFilter('status', e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>
          {OUTREACH_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Sponsorship filter */}
        <select
          value={filters.sponsorship}
          onChange={(e) => setFilter('sponsorship', e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Sponsorship Levels</option>
          {SPONSORSHIP_LEVELS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {/* Owner filter */}
        <select
          value={filters.owner}
          onChange={(e) => setFilter('owner', e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Owners</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>

        {activeFilters > 0 && (
          <button
            onClick={() => { setSearch(''); setFilters({ status: '', sponsorship: '', owner: '' }); setSearchParams({}) }}
            className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            Clear filters ({activeFilters})
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <PageLoader />
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description={activeFilters > 0 ? 'Try adjusting your filters.' : 'Add your first company to get started.'}
          action={
            <Button icon={Plus} onClick={() => navigate('/companies/new')}>
              Add Company
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {columns.map(({ key, label }) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-700 select-none"
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        <SortIcon column={key} sortKey={sortKey} sortDir={sortDir} />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((company) => {
                  const primaryContact = company.contacts?.find((c) => c.is_primary) || company.contacts?.[0]
                  const followUpUrgency = getFollowUpUrgency(company.next_follow_up_date)

                  return (
                    <tr
                      key={company.id}
                      className="group hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/companies/${company.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {company.company_name}
                          </p>
                          {primaryContact && (
                            <p className="text-xs text-gray-500 mt-0.5">{primaryContact.name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{company.industry || '—'}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={company.outreach_status} />
                      </td>
                      <td className="px-4 py-3">
                        <SponsorshipBadge level={company.target_sponsorship_level} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(company.last_contact_date)}
                      </td>
                      <td className="px-4 py-3">
                        {company.next_follow_up_date ? (
                          <span
                            className={classNames(
                              'text-sm',
                              followUpUrgency === 'overdue' && 'font-semibold text-red-600',
                              followUpUrgency === 'today' && 'font-semibold text-amber-600',
                              followUpUrgency === 'tomorrow' && 'text-amber-500',
                              !['overdue', 'today', 'tomorrow'].includes(followUpUrgency) && 'text-gray-600'
                            )}
                          >
                            {formatDate(company.next_follow_up_date)}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            to={`/companies/${company.id}/edit`}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(company)}
                            className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Company"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-900">{deleteTarget?.company_name}</span>?
          This will remove all associated contacts, notes, and activity history. This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
