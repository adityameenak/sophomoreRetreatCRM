import { format, formatDistanceToNow, isPast, isToday, isTomorrow, parseISO } from 'date-fns'

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  try {
    return format(parseISO(dateStr), 'MMM d, yyyy')
  } catch {
    return '—'
  }
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return null
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true })
  } catch {
    return null
  }
}

export function getFollowUpUrgency(dateStr) {
  if (!dateStr) return null
  try {
    const date = parseISO(dateStr)
    if (isPast(date) && !isToday(date)) return 'overdue'
    if (isToday(date)) return 'today'
    if (isTomorrow(date)) return 'tomorrow'
    return 'upcoming'
  } catch {
    return null
  }
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Truncate text to a given length
export function truncate(str, length = 80) {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '…' : str
}

// Get initials from a name
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Group array by a key
export function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const group = item[key] ?? 'unknown'
    acc[group] = acc[group] ?? []
    acc[group].push(item)
    return acc
  }, {})
}

// Debounce function
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
