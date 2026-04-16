import { classNames } from '../../lib/utils'

export default function Input({
  label,
  error,
  hint,
  className = '',
  inputClassName = '',
  icon: Icon,
  ...props
}) {
  return (
    <div className={classNames('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          className={classNames(
            'block w-full rounded-md border text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0',
            error
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300'
              : 'border-gray-300 bg-white focus:border-indigo-400',
            Icon ? 'pl-9' : 'pl-3',
            'pr-3 py-2 placeholder:text-gray-400',
            inputClassName
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

export function Textarea({ label, error, hint, className = '', ...props }) {
  return (
    <div className={classNames('flex flex-col gap-1', className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <textarea
        rows={4}
        className={classNames(
          'block w-full rounded-md border px-3 py-2 text-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 resize-y',
          error
            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-300'
            : 'border-gray-300 bg-white focus:border-indigo-400',
          'placeholder:text-gray-400'
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
