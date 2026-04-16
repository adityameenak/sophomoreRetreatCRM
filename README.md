# Sophomore Retreat Sponsor CRM

A private, internal CRM for sophomore retreat leadership to manage company outreach, sponsorships, follow-ups, and institutional handoff.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Auth + DB | Supabase |
| Routing | React Router v6 |
| Icons | Lucide React |
| Dates | date-fns |
| Hosting | Vercel (ready) |

---

## Local Setup

### 1. Clone and install

```bash
cd sophomore-retreat-crm
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, run the entire contents of `supabase/schema.sql`
3. Copy your project URL and anon key from **Settings → API**

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Create your user accounts

1. In Supabase Dashboard → **Authentication → Users**, click **Invite user**
2. Add Aditya's email, then Shepard's email
3. Each user receives a magic link / invite email to set their password

### 5. Set admin roles (optional but recommended)

After both users have signed up, run in the Supabase SQL editor:

```sql
-- Set Aditya as admin
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'aditya@youremail.com');

-- Set Shepard as co-admin
update public.profiles
set role = 'co_admin'
where id = (select id from auth.users where email = 'shepard@youremail.com');
```

### 6. Run locally

```bash
npm run dev
```

Visit `http://localhost:5173`

---

## Deploying to Vercel

```bash
npm install -g vercel
vercel
```

When prompted, add your environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Or set them in the Vercel dashboard under **Settings → Environment Variables**.

---

## Features

### Dashboard
- Pipeline metrics by status (not started, contacted, follow-up, interested, confirmed, declined)
- Upcoming follow-ups (next 14 days) with urgency indicators
- Recent activity feed across all companies

### Companies
- Table view with sort, search, and multi-filter (status, sponsorship level, owner)
- Status and sponsorship badges
- Overdue follow-up highlighting (red)
- Quick edit / delete actions

### Company Detail
- **Overview tab**: all company details, primary contact, documents sent, tags, latest note
- **Contacts tab**: full contact list with add/edit/delete
- **Activity tab**: full timeline of all actions logged
- **Notes tab**: append-only note feed for team collaboration
- **Email Drafts tab**: generate outreach emails from 5 templates with one-click copy

### Email Generator
Templates included:
- Initial outreach
- Follow-up
- Thank you / confirmation
- Presentation invitation
- Team-building activity request

Variables auto-filled: contact name, company name, sender name.

### Outreach Tracking
- Log outreach events with notes
- Log follow-ups with optional next follow-up date scheduling
- All events appear in the activity timeline

---

## Project Structure

```
src/
├── components/
│   ├── layout/      # Sidebar, AppLayout
│   └── ui/          # Button, Badge, Card, Modal, Input, Select, etc.
├── contexts/        # AuthContext
├── hooks/           # useCompanies, useCompany, useActivities, useNotes, useProfiles
├── lib/             # supabase client, constants, utils, emailTemplates
└── pages/           # Login, Dashboard, Companies, CompanyDetail, CompanyForm

supabase/
└── schema.sql       # Full DB schema + RLS policies
```

---

## Adding New Users

Only users who exist in Supabase Auth can log in. To add a new user:

1. Supabase Dashboard → Authentication → Invite user (enter their email)
2. They receive an invite link to set a password
3. Optionally update their role in the `profiles` table

---

## Notes for Future Leadership

- The `company_activities` table auto-logs every major action (status changes, notes, outreach, etc.)
- The `notes` table is append-only and shows who wrote each note
- The `next_follow_up_date` field drives the dashboard's follow-up tracker
- Export: for now, use Supabase's built-in table export (CSV) for data handoff
