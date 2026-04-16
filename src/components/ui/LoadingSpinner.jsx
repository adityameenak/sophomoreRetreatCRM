import { classNames } from '../../lib/utils'

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-[3px]',
}

export default function LoadingSpinner({ size = 'md', className = '' }) {
  return (
    <div
      className={classNames(
        'animate-spin rounded-full border-indigo-600 border-t-transparent',
        sizeMap[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-500">Loading…</p>
    </div>
  )
}
