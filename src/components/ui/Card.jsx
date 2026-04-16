import { classNames } from '../../lib/utils'

export default function Card({ children, className = '', padding = true, ...props }) {
  return (
    <div
      className={classNames(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        padding && 'p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={classNames('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function SectionDivider({ label }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200" />
      </div>
      {label && (
        <div className="relative flex justify-start">
          <span className="bg-white pr-3 text-xs font-medium uppercase tracking-wider text-gray-400">
            {label}
          </span>
        </div>
      )}
    </div>
  )
}
