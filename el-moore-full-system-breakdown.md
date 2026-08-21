# EL-Moore — Full System Breakdown (6-Week Build)

This is no longer MVP-only — everything below is being built within the 6-week timeline. Original scope and wording preserved as-is; new features and the timeline are added at the end of each relevant section.

---

## Core filter (unchanged)
What does EL-Moore need on day one to stop using spreadsheets/WhatsApp?
Get a property listed → record when it's sold (outright or installment) → know who sold it and what they're owed → know staff showed up and did something.

---

## Auth & Users

- Login (JWT), roles: ADMIN, STAFF, MARKETER — but marketers are added by admin, not self-registered yet
- Register/Login
- Fetch my profile
- Basic user

## Properties

- CRUD for property listings (name, location, price, status: available/reserved/sold)
- No public storefront yet — internal only

## Sales

- Record a sale: property + buyer info + type (outright/installment) + salesperson or marketer
- Outright: mark paid, done
- Installment: simple payment schedule + log payments against it (even manually entered, no auto-reminders yet)

## Referrals

- Auto-generate a referral/commission record when a sale has a marketer attached
- Admin marks commission as paid/pending
- Simple list view: marketer → their sales → commission status

## Staff Portal

- Clock in / clock out (button, timestamp — with geolocation yet)
- End-of-day task report: just a text/textarea entry per day, nothing fancier

## Admin Dashboard

- Today's task reports feed
- Properties sold list with buyer + amount + who sold it + commission
- That's it — no charts yet, just tables

## Office Finance

- Skip in Phase 1, or reduce to: manual income/expense entry log, no auto-linking to sales yet. This module has the least dependency on the others, so it's easy to bolt on later without reworking anything.

---

## NEW — Blog

- Blog posts: create, edit, publish, managed by MD/GM
- Simple listing/detail pages, no comments or categories in this build

## NEW — Newsletter

- Bulk sending of emails (via a dedicated email service, not built in-house — see finance/comms note)
- Occasional celebration/notification emails
- Automated Greetings: event-triggered emails for client birthdays and payment reminders
- Automated WhatsApp messages for site inspection follow-ups

## NEW — AI-Human Hybrid Care (Basic AI Chat Bot)

- 24/7 AI assistant handling basic customer inquiries on the site
- Seamless handoff to human staff (Customer Care) for complex negotiations or anything the bot can't resolve
- Basic version only — no deep negotiation handling in this build

---

## Phase 2 — once Phase 1 is in real use

- Marketer self-registration + login (Requires Approval)
- Public storefront (Next.js, SSG'd property pages) with referral links (/refer/:marketerCode)
- Finance transactions linked to sales automatically (a sale creates an income entry)
- Installmental payment reminders for property sales / overdue flags
- Dashboard charts and summaries (sales trends, commission totals, attendance %)

## Phase 3 — polish

- Geolocation/IP restriction on clock-in
- Document uploads for sales (contracts, ID, etc.)
- Customer-facing installment status view
- Notifications (email/SMS for payment due, commission paid)

---

## Timeline Breakdown (6 Weeks)

**Week 1 — Auth & Users, Properties**
- Login, roles, register/login, fetch profile, basic user setup
- Property CRUD (internal only)

**Week 2 — Sales & Referrals**
- Sale recording (outright + installment), payment logging
- Referral/commission auto-generation, marketer commission list view

**Week 3 — Staff Portal, Admin Dashboard, Office Finance**
- Clock in/out, daily task report
- Admin Dashboard: today's reports feed, sold properties list
- Office Finance: manual income/expense log

**Week 4 — Marketer Storefront (from Phase 2)**
- Marketer self-registration with approval flow
- Public storefront pages, referral links (/refer/:marketerCode)
- Finance auto-linking from sales (income entry created automatically)

**Week 5 — Blog, Newsletter, AI Chat Bot**
- Blog: create/edit/publish
- Newsletter: bulk sending, celebration notifications
- Automated Greetings: birthday + payment reminder emails, WhatsApp inspection follow-ups
- Basic AI Chat Bot with Customer Care handoff

**Week 6 — Testing, Fixes, Launch Prep**
- End-to-end testing across all modules
- Bug fixes
- Staff walkthrough/training per role
- Go live

**Rollover rule:** anything not finished at the end of its week carries into the next week's queue rather than blocking the schedule. Week 6 is the only buffer — if more than one feature spills into it, testing time shrinks accordingly.

**Still deferred (Phase 3 — polish, post-launch):**
- Geolocation/IP restriction on clock-in
- Document uploads for sales (contracts, ID, etc.)
- Customer-facing installment status view
- Notifications (email/SMS for payment due, commission paid)
- Installment overdue flags / auto-reminders (unless pulled forward in Week 4)
- Dashboard charts and summaries
