import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Building2, CheckCircle, Clock, Copy, ExternalLink,
  Mail, Pencil, Phone, Plus, Send, Trash2,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany, useContacts } from '../hooks/useCompany'
import { useActivities } from '../hooks/useActivities'
import { useNotes } from '../hooks/useNotes'
import { useCompanyMutations } from '../hooks/useCompanies'
import { useAuth } from '../contexts/AuthContext'
import { StatusBadge, SponsorshipBadge } from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Card, { CardHeader } from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { Textarea } from '../components/ui/Input'
import { formatDate, formatRelativeDate, classNames, getInitials } from '../lib/utils'
import { ACTIVITY_TYPES, DOCUMENTS_OPTIONS } from '../lib/constants'
import { EMAIL_TEMPLATES, generateEmailDraft } from '../lib/emailTemplates'

const TABS = ['Overview', 'Contacts', 'Activity', 'Notes', 'Email Drafts']

// --- Activity item ---
function ActivityRow({ activity }) {
  const TYPE_LABELS = {
    created: 'Company created',
    status_changed: 'Status changed',
    outreach_sent: 'Outreach sent',
    follow_up_logged: 'Follow-up logged',
    note_added: 'Note added',
    sponsorship_updated: 'Sponsorship updated',
    company_updated: 'Details updated',
    contact_added: 'Contact added',
  }

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="mt-1 h-2 w-2 rounded-full bg-indigo-400 shrink-0 mt-2" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-800">{activity.description}</p>
        <p className="mt-0.5 text-xs text-gray-400">
          {activity.actor?.full_name && `${activity.actor.full_name} · `}
          {formatRelativeDate(activity.created_at)}
        </p>
      </div>
    </div>
  )
}

// --- Contact card ---
function ContactCard({ contact, onEdit, onDelete }) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600">
          {getInitials(contact.name)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{contact.name}</p>
            {contact.is_primary && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Primary</span>
            )}
          </div>
          {contact.title && <p className="text-sm text-gray-500">{contact.title}</p>}
          <div className="mt-2 flex flex-wrap gap-3">
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 transition-colors">
                <Mail className="h-3.5 w-3.5" />{contact.email}
              </a>
            )}
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-indigo-600 transition-colors">
                <Phone className="h-3.5 w-3.5" />{contact.phone}
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => onEdit(contact)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onDelete(contact.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// --- Note card ---
function NoteCard({ note, onDelete, currentUserId }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
            {getInitials(note.author?.full_name || '?')}
          </div>
          <div>
            <span className="text-xs font-medium text-gray-700">{note.author?.full_name || 'Unknown'}</span>
            <span className="mx-1.5 text-gray-300">·</span>
            <span className="text-xs text-gray-400">{formatRelativeDate(note.created_at)}</span>
          </div>
        </div>
        {note.author_id === currentUserId && (
          <button onClick={() => onDelete(note.id)} className="rounded p-1 text-gray-300 hover:text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">{note.content}</p>
    </div>
  )
}

// --- Email draft modal ---
function EmailDraftModal({ open, onClose, company, contacts, senderName }) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(EMAIL_TEMPLATES[0].id)
  const [copied, setCopied] = useState(false)

  const primaryContact = contacts?.find((c) => c.is_primary) || contacts?.[0]
  const template = EMAIL_TEMPLATES.find((t) => t.id === selectedTemplateId)
  const draft = template ? generateEmailDraft(template, company, primaryContact, senderName) : null

  async function handleCopy() {
    if (!draft) return
    const text = `Subject: ${draft.subject}\n\n${draft.body}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Modal open={open} onClose={onClose} title="Email Draft Generator" size="lg">
      <div className="space-y-4">
        {/* Template selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Email Template</label>
          <div className="flex flex-wrap gap-2">
            {EMAIL_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplateId(t.id)}
                className={classNames(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  selectedTemplateId === t.id
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {draft && (
          <>
            {/* Subject */}
            <div className="rounded-lg bg-gray-50 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">Subject</p>
              <p className="text-sm font-medium text-gray-900">{draft.subject}</p>
            </div>

            {/* Body */}
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-4 py-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Body</p>
                <button
                  onClick={handleCopy}
                  className={classNames(
                    'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    copied
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                  )}
                >
                  {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied!' : 'Copy all'}
                </button>
              </div>
              <pre className="whitespace-pre-wrap px-4 py-3 text-sm text-gray-800 font-sans leading-relaxed">
                {draft.body}
              </pre>
            </div>

            <p className="text-xs text-gray-400">
              Tip: Copy the email and paste it into your email client. Placeholders like [University Name] should be filled in manually.
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}

// --- Contact modal ---
function ContactModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(initial || { name: '', title: '', email: '', phone: '', is_primary: false })
  const [saving, setSaving] = useState(false)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial?.id ? 'Edit Contact' : 'Add Contact'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>Save Contact</Button>
        </>
      }
    >
      <div className="space-y-3">
        {['name', 'title', 'email', 'phone'].map((field) => (
          <div key={field}>
            <label className="mb-1 block text-sm font-medium capitalize text-gray-700">{field}</label>
            <input
              type={field === 'email' ? 'email' : 'text'}
              value={form[field] || ''}
              onChange={(e) => update(field, e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_primary}
            onChange={(e) => update('is_primary', e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Primary contact
        </label>
      </div>
    </Modal>
  )
}

// --- Outreach log modal ---
function LogOutreachModal({ open, onClose, onSave, type = 'outreach' }) {
  const [notes, setNotes] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave({ notes, followUpDate })
    setSaving(false)
    setNotes('')
    setFollowUpDate('')
    onClose()
  }

  const isFollowUp = type === 'followup'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isFollowUp ? 'Log Follow-Up' : 'Log Outreach'}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={saving} onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Textarea
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What happened? Any key details from the conversation…"
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {isFollowUp ? 'Next Follow-Up Date' : 'Schedule Follow-Up'}
          </label>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </Modal>
  )
}

export default function CompanyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const { company, loading, refetch: refetchCompany } = useCompany(id)
  const { contacts, refetch: refetchContacts, addContact, updateContact, deleteContact } = useContacts(id)
  const { activities, refetch: refetchActivities } = useActivities(id)
  const { notes, addNote, deleteNote } = useNotes(id)
  const { logOutreach, logFollowUp } = useCompanyMutations()

  const [activeTab, setActiveTab] = useState('Overview')
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [outreachModalOpen, setOutreachModalOpen] = useState(false)
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)

  if (loading) return <PageLoader />
  if (!company) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-20">
      <p className="text-gray-500">Company not found.</p>
      <Link to="/companies" className="text-indigo-600 hover:underline text-sm">Back to Companies</Link>
    </div>
  )

  const primaryContact = contacts?.find((c) => c.is_primary) || contacts?.[0]
  const senderName = profile?.full_name || user?.email?.split('@')[0] || 'Retreat Leadership'

  async function handleContactSave(form) {
    if (editingContact?.id) {
      await updateContact(editingContact.id, form)
    } else {
      await addContact(form)
    }
    setEditingContact(null)
  }

  async function handleDeleteContact(contactId) {
    if (!confirm('Delete this contact?')) return
    await deleteContact(contactId)
  }

  async function handleLogOutreach({ notes: n, followUpDate }) {
    await logOutreach(id, n)
    if (followUpDate) {
      await supabaseUpdateFollowUp(id, followUpDate)
    }
    refetchCompany()
    refetchActivities()
  }

  async function supabaseUpdateFollowUp(companyId, date) {
    await supabase.from('companies').update({ next_follow_up_date: date, updated_at: new Date().toISOString() }).eq('id', companyId)
  }

  async function handleLogFollowUp({ notes: n, followUpDate }) {
    await logFollowUp(id, n, followUpDate)
    refetchCompany()
    refetchActivities()
  }

  async function handleAddNote() {
    if (!newNote.trim()) return
    setAddingNote(true)
    await addNote(newNote)
    setNewNote('')
    setAddingNote(false)
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Back */}
      <Link
        to="/companies"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Companies
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
              <Building2 className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.company_name}</h1>
              {company.industry && <p className="text-sm text-gray-500">{company.industry}</p>}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={company.outreach_status} />
            <SponsorshipBadge level={company.target_sponsorship_level} />
            {company.confirmed_sponsorship_level && company.confirmed_sponsorship_level !== 'none' && (
              <span className="text-xs text-gray-500">Confirmed: <SponsorshipBadge level={company.confirmed_sponsorship_level} /></span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={Send} onClick={() => setOutreachModalOpen(true)}>Log Outreach</Button>
          <Button variant="secondary" icon={Clock} onClick={() => setFollowUpModalOpen(true)}>Log Follow-Up</Button>
          <Button variant="secondary" icon={Mail} onClick={() => setEmailModalOpen(true)}>Email Draft</Button>
          <Button icon={Pencil} onClick={() => navigate(`/companies/${id}/edit`)}>Edit</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={classNames(
                'pb-3 text-sm font-medium transition-colors border-b-2',
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: details */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader title="Company Details" />
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                {[
                  { label: 'Industry', value: company.industry },
                  { label: 'Website', value: company.website, isLink: true },
                  { label: 'Internal Owner', value: company.owner?.full_name },
                  { label: 'Target Sponsorship', value: null, badge: <SponsorshipBadge level={company.target_sponsorship_level} /> },
                  { label: 'Confirmed Sponsorship', value: null, badge: <SponsorshipBadge level={company.confirmed_sponsorship_level} /> },
                  { label: 'Outreach Status', value: null, badge: <StatusBadge status={company.outreach_status} /> },
                  { label: 'First Contact', value: formatDate(company.first_contact_date) },
                  { label: 'Last Contact', value: formatDate(company.last_contact_date) },
                  { label: 'Next Follow-Up', value: formatDate(company.next_follow_up_date) },
                ].map(({ label, value, isLink, badge }) => (
                  <div key={label}>
                    <dt className="font-medium text-gray-500">{label}</dt>
                    <dd className="mt-0.5 text-gray-900">
                      {badge || (isLink && value ? (
                        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline">
                          {value} <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (value || '—'))}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>

            {/* Documents sent */}
            {company.documents_sent?.length > 0 && (
              <Card>
                <CardHeader title="Documents Sent" />
                <ul className="space-y-1">
                  {company.documents_sent.map((doc) => (
                    <li key={doc} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                      {doc}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Tags */}
            {company.tags?.length > 0 && (
              <Card>
                <CardHeader title="Tags" />
                <div className="flex flex-wrap gap-2">
                  {company.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right: primary contact + quick notes */}
          <div className="space-y-4">
            {primaryContact && (
              <Card>
                <CardHeader title="Primary Contact" />
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{primaryContact.name}</p>
                  {primaryContact.title && <p className="text-sm text-gray-500">{primaryContact.title}</p>}
                  {primaryContact.email && (
                    <a href={`mailto:${primaryContact.email}`} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline">
                      <Mail className="h-4 w-4" />{primaryContact.email}
                    </a>
                  )}
                  {primaryContact.phone && (
                    <a href={`tel:${primaryContact.phone}`} className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors">
                      <Phone className="h-4 w-4" />{primaryContact.phone}
                    </a>
                  )}
                </div>
              </Card>
            )}

            {/* Recent note */}
            {notes[0] && (
              <Card>
                <CardHeader title="Latest Note" action={<button onClick={() => setActiveTab('Notes')} className="text-xs text-indigo-600 hover:underline">View all</button>} />
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-4">{notes[0].content}</p>
                <p className="mt-2 text-xs text-gray-400">{formatRelativeDate(notes[0].created_at)}</p>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Contacts' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button icon={Plus} size="sm" onClick={() => { setEditingContact(null); setContactModalOpen(true) }}>
              Add Contact
            </Button>
          </div>
          {contacts.length === 0 ? (
            <p className="py-10 text-center text-sm text-gray-400">No contacts yet. Add the first one above.</p>
          ) : (
            contacts.map((c) => (
              <ContactCard
                key={c.id}
                contact={c}
                onEdit={(c) => { setEditingContact(c); setContactModalOpen(true) }}
                onDelete={handleDeleteContact}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'Activity' && (
        <Card>
          <CardHeader title="Activity Timeline" />
          <div className="divide-y divide-gray-50">
            {activities.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">No activity logged yet.</p>
            ) : (
              activities.map((a) => <ActivityRow key={a.id} activity={a} />)
            )}
          </div>
        </Card>
      )}

      {activeTab === 'Notes' && (
        <div className="space-y-4">
          {/* Add note */}
          <Card>
            <Textarea
              label="Add a note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Spoke with Sarah, she wants updated deck by Thursday. Interested in Gold tier…"
              rows={3}
            />
            <div className="mt-3 flex justify-end">
              <Button
                size="sm"
                loading={addingNote}
                disabled={!newNote.trim()}
                onClick={handleAddNote}
              >
                Add Note
              </Button>
            </div>
          </Card>

          {/* Notes list */}
          {notes.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No notes yet.</p>
          ) : (
            notes.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                onDelete={deleteNote}
                currentUserId={user?.id}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'Email Drafts' && (
        <div className="text-center py-12">
          <Mail className="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">Email Draft Generator</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Generate ready-to-send outreach emails with company details prefilled.</p>
          <Button icon={Mail} onClick={() => setEmailModalOpen(true)}>Open Email Generator</Button>
        </div>
      )}

      {/* Modals */}
      <EmailDraftModal
        open={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        company={company}
        contacts={contacts}
        senderName={senderName}
      />

      <ContactModal
        open={contactModalOpen}
        onClose={() => { setContactModalOpen(false); setEditingContact(null) }}
        onSave={handleContactSave}
        initial={editingContact}
      />

      <LogOutreachModal
        open={outreachModalOpen}
        onClose={() => setOutreachModalOpen(false)}
        onSave={handleLogOutreach}
        type="outreach"
      />

      <LogOutreachModal
        open={followUpModalOpen}
        onClose={() => setFollowUpModalOpen(false)}
        onSave={handleLogFollowUp}
        type="followup"
      />
    </div>
  )
}
