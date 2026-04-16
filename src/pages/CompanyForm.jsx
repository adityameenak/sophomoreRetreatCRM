import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useCompany } from '../hooks/useCompany'
import { useCompanyMutations } from '../hooks/useCompanies'
import { useProfiles } from '../hooks/useProfiles'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Input, { Textarea } from '../components/ui/Input'
import Select from '../components/ui/Select'
import Card, { CardHeader, SectionDivider } from '../components/ui/Card'
import { PageLoader } from '../components/ui/LoadingSpinner'
import {
  OUTREACH_STATUSES,
  SPONSORSHIP_LEVELS,
  INDUSTRIES,
  DOCUMENTS_OPTIONS,
} from '../lib/constants'

const EMPTY_FORM = {
  company_name: '',
  industry: '',
  website: '',
  internal_owner: '',
  target_sponsorship_level: 'none',
  confirmed_sponsorship_level: 'none',
  outreach_status: 'not_started',
  first_contact_date: '',
  last_contact_date: '',
  next_follow_up_date: '',
  documents_sent: [],
  tags: [],
  notes_preview: '',
  // Primary contact fields (separate table)
  contact_name: '',
  contact_title: '',
  contact_email: '',
  contact_phone: '',
}

function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('')

  function handleKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      const newTag = input.trim().replace(/,$/, '')
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  function removeTag(tag) {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">Tags</label>
      <div className="flex min-h-[38px] flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500 transition-colors">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-indigo-500 hover:text-indigo-700">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? 'Type and press Enter to add tags…' : ''}
          className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>
      <p className="text-xs text-gray-500">Press Enter or comma to add a tag</p>
    </div>
  )
}

export default function CompanyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const { company, loading } = useCompany(id)
  const { createCompany, updateCompany } = useCompanyMutations()
  const { profiles } = useProfiles()
  const { user } = useAuth()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && company) {
      const primaryContact = company.contacts?.find((c) => c.is_primary) || company.contacts?.[0]
      setForm({
        company_name: company.company_name || '',
        industry: company.industry || '',
        website: company.website || '',
        internal_owner: company.internal_owner || '',
        target_sponsorship_level: company.target_sponsorship_level || 'none',
        confirmed_sponsorship_level: company.confirmed_sponsorship_level || 'none',
        outreach_status: company.outreach_status || 'not_started',
        first_contact_date: company.first_contact_date || '',
        last_contact_date: company.last_contact_date || '',
        next_follow_up_date: company.next_follow_up_date || '',
        documents_sent: company.documents_sent || [],
        tags: company.tags || [],
        notes_preview: company.notes_preview || '',
        contact_name: primaryContact?.name || '',
        contact_title: primaryContact?.title || '',
        contact_email: primaryContact?.email || '',
        contact_phone: primaryContact?.phone || '',
      })
    }
  }, [isEdit, company])

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function toggleDocument(doc) {
    const current = form.documents_sent
    if (current.includes(doc)) {
      update('documents_sent', current.filter((d) => d !== doc))
    } else {
      update('documents_sent', [...current, doc])
    }
  }

  function validate() {
    const errs = {}
    if (!form.company_name.trim()) errs.company_name = 'Company name is required'
    if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      errs.contact_email = 'Enter a valid email address'
    }
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setSaving(true)

    const companyData = {
      company_name: form.company_name.trim(),
      industry: form.industry || null,
      website: form.website || null,
      internal_owner: form.internal_owner || user?.id || null,
      target_sponsorship_level: form.target_sponsorship_level,
      confirmed_sponsorship_level: form.confirmed_sponsorship_level,
      outreach_status: form.outreach_status,
      first_contact_date: form.first_contact_date || null,
      last_contact_date: form.last_contact_date || null,
      next_follow_up_date: form.next_follow_up_date || null,
      documents_sent: form.documents_sent,
      tags: form.tags,
      notes_preview: form.notes_preview || null,
    }

    if (isEdit) {
      const { error } = await updateCompany(id, companyData, company)
      if (error) {
        setErrors({ submit: error.message })
        setSaving(false)
        return
      }

      // Update primary contact if provided
      if (form.contact_name.trim()) {
        // supabase imported at top
        const primaryContact = company.contacts?.find((c) => c.is_primary) || company.contacts?.[0]
        const contactData = {
          name: form.contact_name,
          title: form.contact_title || null,
          email: form.contact_email || null,
          phone: form.contact_phone || null,
          is_primary: true,
        }
        if (primaryContact) {
          await supabase.from('contacts').update(contactData).eq('id', primaryContact.id)
        } else {
          await supabase.from('contacts').insert({ ...contactData, company_id: id })
        }
      }

      navigate(`/companies/${id}`)
    } else {
      const { data: newCompany, error } = await createCompany(companyData)
      if (error) {
        setErrors({ submit: error.message })
        setSaving(false)
        return
      }

      // Create primary contact if provided
      if (form.contact_name.trim() && newCompany?.id) {
        // supabase imported at top
        await supabase.from('contacts').insert({
          company_id: newCompany.id,
          name: form.contact_name,
          title: form.contact_title || null,
          email: form.contact_email || null,
          phone: form.contact_phone || null,
          is_primary: true,
        })
      }

      navigate(`/companies/${newCompany?.id}`)
    }

    setSaving(false)
  }

  if (isEdit && loading) return <PageLoader />

  const industryOptions = INDUSTRIES.map((i) => ({ value: i, label: i }))
  const ownerOptions = profiles.map((p) => ({ value: p.id, label: p.full_name }))

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        to={isEdit ? `/companies/${id}` : '/companies'}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {isEdit ? 'Back to Company' : 'Back to Companies'}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? `Edit ${company?.company_name || 'Company'}` : 'Add Company'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit ? 'Update the company record.' : 'Add a new sponsor prospect to the CRM.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errors.submit}
          </div>
        )}

        {/* Company info */}
        <Card>
          <CardHeader title="Company Information" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Company Name"
              required
              value={form.company_name}
              onChange={(e) => update('company_name', e.target.value)}
              error={errors.company_name}
              placeholder="Acme Corp"
              className="sm:col-span-2"
            />
            <Select
              label="Industry"
              options={industryOptions}
              value={form.industry}
              onChange={(e) => update('industry', e.target.value)}
              placeholder="Select industry…"
            />
            <Input
              label="Website"
              type="url"
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
              placeholder="https://acme.com"
            />
          </div>
        </Card>

        {/* Primary contact */}
        <Card>
          <CardHeader title="Primary Contact" subtitle="Main point of contact at this company" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Contact Name"
              value={form.contact_name}
              onChange={(e) => update('contact_name', e.target.value)}
              placeholder="Jane Smith"
            />
            <Input
              label="Title"
              value={form.contact_title}
              onChange={(e) => update('contact_title', e.target.value)}
              placeholder="Director of Recruiting"
            />
            <Input
              label="Email"
              type="email"
              value={form.contact_email}
              onChange={(e) => update('contact_email', e.target.value)}
              error={errors.contact_email}
              placeholder="jane@acme.com"
            />
            <Input
              label="Phone"
              type="tel"
              value={form.contact_phone}
              onChange={(e) => update('contact_phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
        </Card>

        {/* Sponsorship & pipeline */}
        <Card>
          <CardHeader title="Sponsorship & Pipeline" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Outreach Status"
              options={OUTREACH_STATUSES}
              value={form.outreach_status}
              onChange={(e) => update('outreach_status', e.target.value)}
            />
            <Select
              label="Internal Owner"
              options={ownerOptions}
              value={form.internal_owner}
              onChange={(e) => update('internal_owner', e.target.value)}
              placeholder="Assign to…"
            />
            <Select
              label="Target Sponsorship Level"
              options={SPONSORSHIP_LEVELS}
              value={form.target_sponsorship_level}
              onChange={(e) => update('target_sponsorship_level', e.target.value)}
            />
            <Select
              label="Confirmed Sponsorship Level"
              options={SPONSORSHIP_LEVELS}
              value={form.confirmed_sponsorship_level}
              onChange={(e) => update('confirmed_sponsorship_level', e.target.value)}
            />
          </div>
        </Card>

        {/* Dates */}
        <Card>
          <CardHeader title="Outreach Dates" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="First Contact Date"
              type="date"
              value={form.first_contact_date}
              onChange={(e) => update('first_contact_date', e.target.value)}
            />
            <Input
              label="Last Contact Date"
              type="date"
              value={form.last_contact_date}
              onChange={(e) => update('last_contact_date', e.target.value)}
            />
            <Input
              label="Next Follow-Up Date"
              type="date"
              value={form.next_follow_up_date}
              onChange={(e) => update('next_follow_up_date', e.target.value)}
            />
          </div>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader title="Documents Sent" />
          <div className="flex flex-wrap gap-2">
            {DOCUMENTS_OPTIONS.map((doc) => (
              <button
                key={doc}
                type="button"
                onClick={() => toggleDocument(doc)}
                className={classNames(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors border',
                  form.documents_sent.includes(doc)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                )}
              >
                {doc}
              </button>
            ))}
          </div>
        </Card>

        {/* Tags */}
        <Card>
          <TagInput tags={form.tags} onChange={(tags) => update('tags', tags)} />
        </Card>

        {/* Notes */}
        <Card>
          <Textarea
            label="Notes"
            value={form.notes_preview}
            onChange={(e) => update('notes_preview', e.target.value)}
            placeholder="Any initial context, background, or important details about this company…"
            rows={4}
          />
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Link to={isEdit ? `/companies/${id}` : '/companies'}>
            <Button variant="secondary" type="button">Cancel</Button>
          </Link>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save Changes' : 'Add Company'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
