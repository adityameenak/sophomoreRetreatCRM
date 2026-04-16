import { classNames } from '../../lib/utils'

export default function Select({ label, error, hint, className = '', options = [], placeholder, ...props }) {
  return (
    <div className={classNames('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <select
        className={classNames(
          'block w-full rounded-md border px-3 py-2 text-sm transition-colors bg-white',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0',
          error
            ? 'border-red-300 bg-red-50 focus:border-red-500'
            : 'border-gray-300 focus:border-indigo-400',
          !props.value && 'text-gray-400'
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-gray-900">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
