export const EMAIL_TEMPLATES = [
  {
    id: 'initial_outreach',
    name: 'Initial Outreach',
    subject: '2026 AIChE Sophomore Retreat Sponsorship Opportunity',
    body: `Howdy {{contact_name}},

My name is [Fill Name Here], and I am the [Fill Role Here] for the 2026 AIChE Sophomore Retreat at Texas A&M University. We are currently looking for companies to sponsor our upcoming retreat, which runs from Wednesday, August 19th, to Saturday, August 22nd, 2026. This retreat will give {{company_name}} the opportunity to interact directly with incoming sophomore chemical engineers at Texas A&M.

I have attached a letter with more information regarding our 2026 retreat, as well as a sponsorship form.

If you are no longer the point of contact between your company and the TAMU chapter of AIChE, please forward this email to the appropriate person.

Please feel free to email me or call me at [Fill Phone Number Here] if you have any questions regarding the Sophomore Retreat or sponsorship opportunities.

Best regards,

[Fill Name Here]
[Fill Role Here] | TAMU AIChE Sophomore Retreat
directorchemecamp@gmail.com
[Fill Phone Number Here]`,
  },
  {
    id: 'follow_up',
    name: 'Follow-Up',
    subject: 'Following Up – 2026 AIChE Sophomore Retreat Sponsorship',
    body: `Howdy {{contact_name}},

I wanted to follow up on my previous email regarding a sponsorship opportunity for the 2026 AIChE Sophomore Retreat at Texas A&M University. I understand your schedule is busy, so I'll keep this brief.

We're currently finalizing our sponsor list and would love to include {{company_name}}. If you've had a chance to review the opportunity, I'd be happy to answer any questions or send additional materials.

If this isn't the right fit right now, I completely understand — just let me know and I'll make a note for next cycle.

Please feel free to email me or call me at [Fill Phone Number Here] if you have any questions.

Best regards,

[Fill Name Here]
[Fill Role Here] | TAMU AIChE Sophomore Retreat
directorchemecamp@gmail.com
[Fill Phone Number Here]`,
  },
  {
    id: 'thank_you',
    name: 'Thank You / Confirmation',
    subject: 'Thank You – 2026 AIChE Sophomore Retreat Sponsorship Confirmed',
    body: `Howdy {{contact_name}},

Thank you so much for confirming {{company_name}}'s sponsorship of the 2026 AIChE Sophomore Retreat. We're genuinely excited to have you as a partner.

Here's what to expect next:
- We'll be in touch with logistics for any materials or branding assets we need from your side
- We'll confirm the details of your sponsorship tier and associated benefits
- You'll receive a full recap of the retreat after it concludes

If you have any questions or need anything from us in the meantime, please feel free to email me or call me at [Fill Phone Number Here].

We truly appreciate {{company_name}}'s support — it makes a real difference for our class.

Best regards,

[Fill Name Here]
[Fill Role Here] | TAMU AIChE Sophomore Retreat
directorchemecamp@gmail.com
[Fill Phone Number Here]`,
  },
  {
    id: 'presentation_invite',
    name: 'Presentation Invitation',
    subject: 'Invitation to Present at the 2026 AIChE Sophomore Retreat',
    body: `Howdy {{contact_name}},

I'm reaching out to personally invite {{company_name}} to present at the 2026 AIChE Sophomore Retreat at Texas A&M University. We're curating a lineup of companies to share insights on careers, company culture, and professional development with our incoming sophomore chemical engineers.

A presentation slot would give {{company_name}} direct access to motivated students who are beginning to think seriously about internship and full-time opportunities.

This is entirely separate from our sponsorship tiers — presentations are available as a standalone engagement or bundled as part of a sponsorship package.

Please feel free to email me or call me at [Fill Phone Number Here] if you'd like to discuss what this could look like for your team.

Best regards,

[Fill Name Here]
[Fill Role Here] | TAMU AIChE Sophomore Retreat
directorchemecamp@gmail.com
[Fill Phone Number Here]`,
  },
  {
    id: 'team_building',
    name: 'Team-Building / Activity Request',
    subject: 'Team-Building Activity – 2026 AIChE Sophomore Retreat Partnership',
    body: `Howdy {{contact_name}},

I'm reaching out to explore whether {{company_name}} would be interested in hosting or sponsoring a team-building activity at the 2026 AIChE Sophomore Retreat at Texas A&M University.

Each year, we incorporate interactive activities into the retreat schedule to help students build skills and connect with companies in a less formal setting. Past activities have included workshops, case challenges, and company-sponsored events.

This is a great opportunity to engage with students in a fun, memorable way — and it pairs well with our standard sponsorship tiers.

Please feel free to email me or call me at [Fill Phone Number Here] if you'd like to discuss what this might look like.

Best regards,

[Fill Name Here]
[Fill Role Here] | TAMU AIChE Sophomore Retreat
directorchemecamp@gmail.com
[Fill Phone Number Here]`,
  },
]

export function generateEmailDraft(template, company, contact) {
  const replacements = {
    '{{contact_name}}': contact?.name || 'there',
    '{{company_name}}': company?.company_name || '[Company]',
  }

  let subject = template.subject
  let body = template.body

  for (const [key, value] of Object.entries(replacements)) {
    subject = subject.replaceAll(key, value)
    body = body.replaceAll(key, value)
  }

  return { subject, body }
}
