// Import script — loads Google Sheets sponsor data into Supabase
// Run with: node scripts/import.js

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://sfhuifkvebpgwnilvlug.supabase.co',
  'YOUR_SERVICE_ROLE_KEY_HERE' // do not commit this key
)

// Raw data from Google Sheets
// columns: notes, company, representative, emails, paidLast, contacted, responded, committed, paid, paymentConfirmed
const RAW = [
  { notes: 'returning', company: 'Oxy',               industry: 'Energy',          rep: 'Candice Ortiz & Brigette Biagas', emails: ['Candice_Ortiz@oxy.com', 'Brigette_Biagas@oxy.com'],                            paidLast: true,  contacted: true,  responded: true,  committed: true,  paid: true,  paymentConfirmed: true  },
  { notes: 'returning', company: 'Phillips 66',        industry: 'Energy',          rep: 'Allison Hartmann & Bri Hibdon',   emails: ['Allison.M.Hartmann@p66.com'],                                                   paidLast: true,  contacted: true,  responded: true,  committed: true,  paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Motiva',             industry: 'Energy',          rep: 'Taylor Whipple',                  emails: ['Tayler.haynes@motiva.com'],                                                      paidLast: true,  contacted: true,  responded: true,  committed: true,  paid: true,  paymentConfirmed: false },
  { notes: 'returning', company: 'Air Liquide',        industry: 'Manufacturing',   rep: 'Vomelreet Khroud',                emails: ['vomelreet.khroud@airliquide.com'],                                               paidLast: true,  contacted: true,  responded: true,  committed: true,  paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'INEOS',              industry: 'Manufacturing',   rep: 'Anupriya Gupta',                  emails: ['anupriya.gupta@ineos.com'],                                                      paidLast: true,  contacted: true,  responded: true,  committed: true,  paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'LyondellBasell',     industry: 'Manufacturing',   rep: 'Christopher Gilspin',             emails: ['christopher.glispin@lyondellbasell.com'],                                        paidLast: true,  contacted: true,  responded: true,  committed: true,  paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Marathon',           industry: 'Energy',          rep: 'Heather Vail',                    emails: ['hvail@marathonpetroleum.com'],                                                   paidLast: true,  contacted: true,  responded: true,  committed: true,  paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'PepsiCo',            industry: 'Consumer Goods',  rep: 'Ryan Barnes & Kimberly Krenek',   emails: ['Ryan.Barnes@pepsico.com', 'Kimberly.Krenek@pepsico.com'],                        paidLast: true,  contacted: true,  responded: false, committed: false, paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Samsung',            industry: 'Technology',      rep: 'Eric Hartsfield',                 emails: ['e.hartsfield@samsung.com'],                                                      paidLast: true,  contacted: true,  responded: true,  committed: true,  paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Garver',             industry: 'Consulting',      rep: 'Abigail Barone',                  emails: ['AMBarone@garverusa.com'],                                                        paidLast: false, contacted: true,  responded: false, committed: false, paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Covestro',           industry: 'Manufacturing',   rep: 'Nicholas Sims',                   emails: ['nicholas.sims@covestro.com'],                                                    paidLast: false, contacted: true,  responded: false, committed: false, paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Enterprise',         industry: 'Energy',          rep: 'Mason McManus',                   emails: ['mamcmanus@eprod.com'],                                                           paidLast: true,  contacted: true,  responded: false, committed: false, paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Ascend',             industry: 'Manufacturing',   rep: 'Karen Carr',                      emails: ['kcarr@ascendmaterials.com'],                                                     paidLast: false, contacted: true,  responded: false, committed: false, paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Air Products',       industry: 'Manufacturing',   rep: 'Natalie Griffith',                emails: ['GRIFFIN5@airproducts.com'],                                                      paidLast: true,  contacted: true,  responded: false, committed: false, paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Texas Instruments',  industry: 'Technology',      rep: 'Marwan Elzarka',                  emails: ['m-elzarka@ti.com'],                                                              paidLast: false, contacted: true,  responded: false, committed: false, paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Syensqo',            industry: 'Manufacturing',   rep: 'Chet Sparks',                     emails: ['Chet.sparks@syensqo.com'],                                                       paidLast: true,  contacted: true,  responded: true,  committed: false, paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'BASF',               industry: 'Manufacturing',   rep: 'Cami Alvarez',                    emails: ['naidely.alvarez@basf.com'],                                                      paidLast: true,  contacted: true,  responded: false, committed: false, paid: false, paymentConfirmed: false },
  { notes: 'returning', company: 'Eastman',            industry: 'Manufacturing',   rep: 'Melissa Hein',                    emails: ['melissa.hein@eastman.com'],                                                      paidLast: false, contacted: true,  responded: true,  committed: false, paid: false, paymentConfirmed: false },
]

// Map sheet columns → outreach_status
function getStatus(row) {
  if (!row.contacted)  return 'not_started'
  if (row.committed)   return 'confirmed'
  if (row.responded)   return 'interested'
  return 'contacted'
}

// Map sheet columns → confirmed_sponsorship_level
function getSponsorshipLevel(row) {
  if (row.paymentConfirmed) return 'custom'
  if (row.paid)             return 'custom'
  if (row.committed)        return 'in_discussion'
  return 'none'
}

// Build notes string from what we know
function buildNotes(row) {
  const parts = []
  if (row.paidLast)           parts.push('Paid for last retreat.')
  if (row.committed && !row.paid) parts.push('Committed but payment not yet received.')
  if (row.paymentConfirmed)   parts.push('Payment confirmed.')
  if (row.responded && !row.committed) parts.push('Responded to outreach — follow up to close.')
  return parts.join(' ') || ''
}

// Parse representative names (handle "A & B" and "A && B")
function parseReps(repStr, emails) {
  const names = repStr.split(/&&|&/).map(s => s.trim()).filter(Boolean)
  return names.map((name, i) => ({
    name,
    email: emails[i] || emails[0] || null,
    is_primary: i === 0,
  }))
}

async function run() {
  console.log(`\n🚀 Starting import of ${RAW.length} companies...\n`)

  let successCount = 0
  let errorCount = 0

  for (const row of RAW) {
    try {
      // Insert company
      const { data: company, error: companyErr } = await supabase
        .from('companies')
        .insert({
          company_name:                row.company,
          industry:                    row.industry,
          target_sponsorship_level:    'custom',
          confirmed_sponsorship_level: getSponsorshipLevel(row),
          outreach_status:             getStatus(row),
          tags:                        ['returning', ...(row.paidLast ? ['paid-last-year'] : [])],
          notes_preview:               buildNotes(row),
        })
        .select()
        .single()

      if (companyErr) {
        console.error(`  ✗ ${row.company}: ${companyErr.message}`)
        errorCount++
        continue
      }

      // Insert contacts
      const contacts = parseReps(row.rep, row.emails)
      for (const contact of contacts) {
        const { error: contactErr } = await supabase
          .from('contacts')
          .insert({ company_id: company.id, ...contact })

        if (contactErr) {
          console.warn(`    ⚠ Contact "${contact.name}" failed: ${contactErr.message}`)
        }
      }

      // Log an activity
      await supabase.from('company_activities').insert({
        company_id:  company.id,
        type:        'created',
        description: `Imported from previous year's spreadsheet (${getStatus(row).replace('_', ' ')})`,
      })

      console.log(`  ✓ ${row.company} — ${getStatus(row)} — ${contacts.length} contact(s)`)
      successCount++

    } catch (err) {
      console.error(`  ✗ ${row.company}: unexpected error — ${err.message}`)
      errorCount++
    }
  }

  console.log(`\n✅ Done: ${successCount} imported, ${errorCount} failed.\n`)
}

run()
