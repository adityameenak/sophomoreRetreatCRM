export const EMAIL_TEMPLATES = [
  {
    id: 'initial_outreach',
    name: 'Initial Outreach',
    subject: 'Sophomore Retreat – Sponsorship Opportunity',
    body: `Hi {{contact_name}},

I hope this message finds you well. My name is {{sender_name}}, and I'm a member of the sophomore class leadership at [University Name]. I'm reaching out on behalf of our annual Sophomore Retreat to explore a potential partnership with {{company_name}}.

Our retreat brings together [X] sophomores for a weekend of professional development, networking, and community building. Each year, we partner with companies to help fund the experience and give sponsors direct access to talented, motivated students.

Sponsorship opportunities range from Bronze to Gold tiers and include benefits such as company branding, speaking opportunities, and a direct line to our sophomore class.

I'd love to send over our sponsorship packet or schedule a brief call to discuss how {{company_name}} might be involved. Would you be open to connecting?

Thank you so much for your time — I look forward to hearing from you.

Best,
{{sender_name}}
Sophomore Retreat Leadership`,
  },
  {
    id: 'follow_up',
    name: 'Follow-Up',
    subject: 'Following Up – Sophomore Retreat Sponsorship',
    body: `Hi {{contact_name}},

I wanted to follow up on my previous email regarding a sponsorship opportunity with our Sophomore Retreat. I understand your schedule is busy, so I'll keep this brief.

We're currently finalizing our sponsor list and would love to include {{company_name}}. If you've had a chance to review the opportunity, I'd be happy to answer any questions or send additional materials.

If this isn't the right fit right now, I completely understand — just let me know and I'll make a note for next cycle.

Thanks again for your time, {{contact_name}}. Hope to hear from you soon.

Best,
{{sender_name}}
Sophomore Retreat Leadership`,
  },
  {
    id: 'thank_you',
    name: 'Thank You / Confirmation',
    subject: 'Thank You – Sophomore Retreat Sponsorship Confirmed',
    body: `Hi {{contact_name}},

Thank you so much for confirming {{company_name}}'s sponsorship of this year's Sophomore Retreat. We're genuinely excited to have you as a partner.

Here's what to expect next:
- We'll be in touch with logistics for any materials or branding assets we need from your side
- We'll confirm the details of your sponsorship tier and associated benefits
- You'll receive a full recap of the retreat after it concludes

If you have any questions or need anything from us in the meantime, please don't hesitate to reach out.

We truly appreciate {{company_name}}'s support — it makes a real difference for our class.

Warm regards,
{{sender_name}}
Sophomore Retreat Leadership`,
  },
  {
    id: 'presentation_invite',
    name: 'Presentation Invitation',
    subject: 'Invitation to Present at Sophomore Retreat',
    body: `Hi {{contact_name}},

I'm reaching out to personally invite {{company_name}} to present at this year's Sophomore Retreat. We're curating a lineup of companies to share insights on careers, company culture, and professional development with our sophomore class.

A presentation slot would give {{company_name}} 15–20 minutes to connect directly with [X] engaged students who are beginning to think seriously about internship and full-time opportunities.

This is entirely separate from our sponsorship tiers — presentations are available as a standalone engagement or bundled as part of a sponsorship package.

Would you be interested in learning more? I'd love to discuss what this could look like for your team.

Best,
{{sender_name}}
Sophomore Retreat Leadership`,
  },
  {
    id: 'team_building',
    name: 'Team-Building / Activity Request',
    subject: 'Team-Building Activity – Sophomore Retreat Partnership',
    body: `Hi {{contact_name}},

I'm reaching out to explore whether {{company_name}} would be interested in hosting or sponsoring a team-building activity at our upcoming Sophomore Retreat.

Each year, we incorporate interactive activities into the retreat schedule to help students build skills and connect with companies in a less formal setting. Past activities have included workshops, case challenges, and company-sponsored events.

This is a great opportunity to engage with students in a fun, memorable way — and it pairs well with our standard sponsorship tiers.

Would {{company_name}} be open to discussing what this might look like? I'm happy to work around your team's availability and capacity.

Looking forward to the possibility of partnering.

Best,
{{sender_name}}
Sophomore Retreat Leadership`,
  },
]

export function generateEmailDraft(template, company, contact, senderName) {
  const replacements = {
    '{{contact_name}}': contact?.name || 'there',
    '{{company_name}}': company?.company_name || '[Company]',
    '{{sender_name}}': senderName || '[Your Name]',
  }

  let subject = template.subject
  let body = template.body

  for (const [key, value] of Object.entries(replacements)) {
    subject = subject.replaceAll(key, value)
    body = body.replaceAll(key, value)
  }

  return { subject, body }
}
