export const OUTREACH_STATUSES = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'ready_to_contact', label: 'Ready to Contact' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'follow_up_sent', label: 'Follow-Up Sent' },
  { value: 'interested', label: 'Interested' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined', label: 'Declined' },
  { value: 'on_hold', label: 'On Hold' },
]

export const SPONSORSHIP_LEVELS = [
  { value: 'none', label: 'None Yet' },
  { value: 'in_discussion', label: 'In Discussion' },
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
  { value: 'custom', label: 'Custom' },
]

export const INDUSTRIES = [
  'Technology',
  'Finance / Banking',
  'Consulting',
  'Healthcare',
  'Consumer Goods',
  'Media & Entertainment',
  'Real Estate',
  'Legal',
  'Energy',
  'Retail',
  'Manufacturing',
  'Education',
  'Nonprofit',
  'Government',
  'Other',
]

export const ACTIVITY_TYPES = {
  CREATED: 'created',
  STATUS_CHANGED: 'status_changed',
  OUTREACH_SENT: 'outreach_sent',
  FOLLOW_UP_LOGGED: 'follow_up_logged',
  NOTE_ADDED: 'note_added',
  SPONSORSHIP_UPDATED: 'sponsorship_updated',
  CONTACT_ADDED: 'contact_added',
  COMPANY_UPDATED: 'company_updated',
}

export const STATUS_CONFIG = {
  not_started: {
    label: 'Not Started',
    color: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
  },
  ready_to_contact: {
    label: 'Ready to Contact',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
  },
  contacted: {
    label: 'Contacted',
    color: 'bg-indigo-100 text-indigo-700',
    dot: 'bg-indigo-500',
  },
  follow_up_sent: {
    label: 'Follow-Up Sent',
    color: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-500',
  },
  interested: {
    label: 'Interested',
    color: 'bg-green-100 text-green-700',
    dot: 'bg-green-500',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
  },
  declined: {
    label: 'Declined',
    color: 'bg-red-100 text-red-700',
    dot: 'bg-red-400',
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-400',
  },
}

export const SPONSORSHIP_CONFIG = {
  none: { label: 'None Yet', color: 'bg-gray-100 text-gray-500' },
  in_discussion: { label: 'In Discussion', color: 'bg-blue-100 text-blue-700' },
  bronze: { label: 'Bronze', color: 'bg-orange-100 text-orange-700' },
  silver: { label: 'Silver', color: 'bg-slate-100 text-slate-700' },
  gold: { label: 'Gold', color: 'bg-yellow-100 text-yellow-700' },
  custom: { label: 'Custom', color: 'bg-purple-100 text-purple-700' },
}

export const DOCUMENTS_OPTIONS = [
  'Sponsorship Packet',
  'Budget Breakdown',
  'Past Retreat Summary',
  'Company Deck',
  'Follow-Up One-Pager',
  'Thank You Letter',
]
