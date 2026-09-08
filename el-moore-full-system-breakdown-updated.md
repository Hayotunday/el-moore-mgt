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
- Property images/gallery, with a designated cover photo
- No public storefront yet — internal only

## Sales

- Record a sale: property + buyer info + type (outright/installment) + salesperson or marketer
- Buyer info stored as a proper customer record (linked across multiple purchases, powers birthday greetings and Customer Care lookups)
- Outright: mark paid, done
- Installment: simple payment schedule + log payments against it (even manually entered, no auto-reminders yet)
- Document uploads for sales (contracts, ID, etc.)
- Installment overdue flags / auto-reminders
- Site inspection scheduling per customer/property, feeding the automated follow-up message
- Customer lifecycle tracking: Prospect (info + interest captured) → Lead (site inspection completed) → Client (first purchase) → Customer (second+ purchase), automatically upgraded as each milestone happens

## Referrals

- Auto-generate a referral/commission record when a sale has an **external** marketer attached (internal marketers are salaried staff and never generate a referral/commission record)
- Admin marks commission as paid/pending
- Simple list view: affiliate marketer → their sales → commission status

## Staff Portal

- Clock in / clock out (button, timestamp — with geolocation yet)
- End-of-day task report: just a text/textarea entry per day, nothing fancier
- Geolocation/IP restriction on clock-in

## Admin Dashboard

- Today's task reports feed
- Properties sold list with buyer + amount + who sold it + commission
- That's it — no charts yet, just tables
- Dashboard charts and summaries (sales trends, commission totals, attendance %)

## Office Finance

- Skip in Phase 1, or reduce to: manual income/expense entry log, no auto-linking to sales yet. This module has the least dependency on the others, so it's easy to bolt on later without reworking anything.

---

## NEW — Blog

- Blog posts: create, edit, publish, managed by MD, GM
- Simple listing/detail pages, no comments or categories in this build

## NEW — Newsletter

- Bulk sending of emails (via a dedicated email service, not built in-house — see finance/comms note)
- Occasional celebration/notification emails
- Automated Greetings: event-triggered email + SMS for client birthdays and payment reminders (sent together, not either/or — reduces the chance a client misses the message)
- Automated WhatsApp messages for site inspection follow-ups
- Notifications (email + SMS for payment due, commission paid)

## NEW — AI-Human Hybrid Care (Basic AI Chat Bot)

- 24/7 AI assistant handling basic customer inquiries on the site
- Seamless handoff to human staff (Customer Care) for complex negotiations or anything the bot can't resolve
- Basic version only — no deep negotiation handling in this build

---

## Phase 2 — once Phase 1 is in real use

- External marketer self-registration + login (Requires Approval) — internal marketers are created directly by MD, GM like any other staff member, never via self-registration
- Public storefront (Next.js, SSG'd property pages) with referral links (/refer/:marketerCode) — links only exist for affiliate marketers
- Finance transactions linked to sales automatically (a sale creates an income entry)
- Customer-facing installment status view

## Phase 3 — polish

- Geolocation/IP restriction on clock-in
- Document uploads for sales (contracts, ID, etc.)
- Customer-facing installment status view
- Notifications (email/SMS for payment due, commission paid)

---

## Timeline Breakdown (6 Weeks)

**✅ Week 1 — Auth & Users, Properties — COMPLETE**
- Login, roles (incl. `USER` default on self sign-up), register/login, fetch profile, basic user setup
- Property CRUD (internal only)
- Property images/gallery upload

**✅ Week 2 — Sales & Referrals — COMPLETE**
- Customer record creation/lookup (replaces flat buyer fields on sales)
- Sale recording (outright + installment), payment logging
- Document uploads for sales (contracts, ID, etc.)
- Installment overdue flags / auto-reminders
- Site inspection scheduling
- Referral/commission auto-generation, marketer commission list view

**⚠️ Week 3 — Staff Portal, Admin Dashboard, Office Finance — BUILT, NOT YET TESTED**
- Clock in/out, daily task report
- Geolocation soft-flag on clock-in (logs + flags out-of-zone clock-ins, doesn't hard-block)
- Admin Dashboard: today's reports feed, sold properties list, commission
- Dashboard charts and summaries (sales trends, commission totals, attendance %)
- Office Finance: manual income/expense log

**⚠️ Week 4 — Affiliate Marketer Storefront — BUILT, NOT YET TESTED**
- Affiliate marketer self-registration with approval flow (internal marketers already exist as staff, created in Week 1)
- Public storefront pages, referral links (/refer/:marketerCode)
- Finance auto-linking from sales (income entry created automatically)
- Customer-facing installment status view (quick, no-login, signed-link check)
- Customer accounts: register, or claim an existing record from a past sale via email verification, then login
- Customer self-service profile: their purchased properties, sale documents/agreements, favorited properties

**Post-Week-4 additions (built alongside/after core Week 4 scope):**
- SMS added as a second notification channel alongside email (birthday, payment reminder, commission paid — sent together, not either/or)
- Customer lifecycle tracking: Prospect → Lead → Client → Customer, auto-upgraded on site inspection completion and sale creation, with manual override
- Affiliate Marketer role renamed from External Marketer (naming only, no behavior change)
- Sale voiding changed from hard delete to a soft `status: VOIDED` flag (record preserved for finance/referral history)
- Email provider consolidated onto Brevo (was briefly split across Resend + Brevo)
- Leftover `buyerName` field removed from `sales` (superseded by `customer_id`)
- Name fields split into `first_name` / `middle_name` / `last_name` across `users` and `customers` (was a single combined field)

**🔲 Week 5 — Blog, Newsletter, AI Chat Bot — NOT STARTED**
- Blog: create/edit/publish, cover images, inline content images
- Newsletter: bulk sending, celebration notifications, cover images
- Automated Greetings: birthday + payment reminder email + SMS (sent together), WhatsApp inspection follow-ups (triggered off Week 2's site inspection records)
- Notifications (email + SMS for payment due, commission paid)
- Basic AI Chat Bot with Customer Care handoff — **needs an AI/LLM provider decision before work starts, not yet chosen**

**🔲 Week 6 — Testing, Fixes, Launch Prep — NOT STARTED**
- End-to-end testing across all modules
- Bug fixes
- Staff walkthrough/training per role
- Go live

**Rollover rule:** anything not finished at the end of its week carries into the next week's queue rather than blocking the schedule. Week 6 is the only buffer — if more than one feature spills into it, testing time shrinks accordingly.

**Where things actually stand:** Weeks 1–2 are complete and confirmed. Weeks 3 and 4 are built — including a meaningful amount of extra scope layered on after Week 4 (SMS, customer lifecycle stages, provider consolidation, data cleanup) — but **not yet tested end-to-end**, so treat them as functionally done, not verified done. Worth running through Week 3 and 4 test coverage before starting Week 5, so any bugs found there don't get buried under new Week 5 code on top of them.
