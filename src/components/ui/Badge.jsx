import { classNames } from '../../lib/utils'
import { STATUS_CONFIG, SPONSORSHIP_CONFIG } from '../../lib/constants'

export function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.not_started
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color
      )}
    >
      <span className={classNames('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  )
}

export function SponsorshipBadge({ level }) {
  const config = SPONSORSHIP_CONFIG[level] || SPONSORSHIP_CONFIG.none
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.color
      )}
    >
      {config.label}
    </span>
  )
}

export function Badge({ children, color = 'gray', className = '' }) {
  const colors = {
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-700',
    purple: 'bg-purple-100 text-purple-700',
    indigo: 'bg-indigo-100 text-indigo-700',
  }
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors[color] || colors.gray,
        className
      )}
    >
      {children}
    </span>
  )
}
