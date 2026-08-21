# EL-Moore — Technical Breakdown: Backend Structure & Database Architecture

Companion document to the non-technical project scope and 6-week timeline. Covers backend folder structure (NestJS) and full database schema/relationships.

---

## 1. Backend Folder Structure (NestJS, modular monolith)

Standard NestJS convention: one module per domain, each self-contained (controller, service, entities, DTOs), wired together in `app.module.ts`. Shared code lives in `common/`.

```
el-moore-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── config/
│   │   ├── configuration.ts          # env-based config factory
│   │   ├── validation.schema.ts      # Joi/Zod env validation
│   │   └── typeorm.config.ts
│   │
│   ├── database/
│   │   ├── data-source.ts            # TypeORM CLI data source (migrations)
│   │   ├── migrations/
│   │   └── seeds/
│   │
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── transform-response.interceptor.ts
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts
│   │   ├── enums/
│   │   │   ├── user-role.enum.ts
│   │   │   ├── sale-type.enum.ts
│   │   │   └── ...
│   │   └── base/
│   │       └── base.entity.ts        # id, createdAt, updatedAt shared columns
│   │
│   └── modules/
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── strategies/
│       │   │   └── jwt.strategy.ts
│       │   └── dto/
│       │       ├── login.dto.ts
│       │       └── register.dto.ts
│       │
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── entities/
│       │   │   └── user.entity.ts
│       │   └── dto/
│       │
│       ├── properties/
│       │   ├── properties.module.ts
│       │   ├── properties.controller.ts
│       │   ├── properties.service.ts
│       │   ├── entities/
│       │   │   └── property.entity.ts
│       │   └── dto/
│       │
│       ├── sales/
│       │   ├── sales.module.ts
│       │   ├── sales.controller.ts
│       │   ├── sales.service.ts
│       │   ├── entities/
│       │   │   ├── sale.entity.ts
│       │   │   ├── installment-plan.entity.ts
│       │   │   ├── installment-payment.entity.ts
│       │   │   └── sale-document.entity.ts
│       │   └── dto/
│       │
│       ├── referrals/
│       │   ├── referrals.module.ts
│       │   ├── referrals.controller.ts
│       │   ├── referrals.service.ts
│       │   ├── entities/
│       │   │   └── referral.entity.ts
│       │   └── dto/
│       │
│       ├── finance/
│       │   ├── finance.module.ts
│       │   ├── finance.controller.ts
│       │   ├── finance.service.ts
│       │   ├── entities/
│       │   │   └── financial-transaction.entity.ts
│       │   └── dto/
│       │
│       ├── attendance/
│       │   ├── attendance.module.ts
│       │   ├── attendance.controller.ts
│       │   ├── attendance.service.ts
│       │   ├── entities/
│       │   │   └── attendance.entity.ts
│       │   └── dto/
│       │
│       ├── daily-reports/
│       │   ├── daily-reports.module.ts
│       │   ├── daily-reports.controller.ts
│       │   ├── daily-reports.service.ts
│       │   ├── entities/
│       │   │   └── daily-task-report.entity.ts
│       │   └── dto/
│       │
│       ├── blog/
│       │   ├── blog.module.ts
│       │   ├── blog.controller.ts
│       │   ├── blog.service.ts
│       │   ├── entities/
│       │   │   └── blog-post.entity.ts
│       │   └── dto/
│       │
│       ├── newsletter/
│       │   ├── newsletter.module.ts
│       │   ├── newsletter.controller.ts
│       │   ├── newsletter.service.ts
│       │   ├── entities/
│       │   │   ├── subscriber.entity.ts
│       │   │   └── campaign.entity.ts
│       │   └── dto/
│       │
│       ├── notifications/
│       │   ├── notifications.module.ts
│       │   ├── notifications.service.ts        # email.service + whatsapp.service live here
│       │   ├── email.service.ts
│       │   ├── whatsapp.service.ts
│       │   ├── entities/
│       │   │   └── notification-log.entity.ts
│       │   ├── jobs/
│       │   │   ├── birthday-reminder.job.ts     # cron
│       │   │   ├── payment-reminder.job.ts      # cron
│       │   │   └── inspection-followup.job.ts   # cron
│       │   └── dto/
│       │
│       └── chatbot/
│           ├── chatbot.module.ts
│           ├── chatbot.controller.ts
│           ├── chatbot.service.ts
│           ├── entities/
│           │   ├── conversation.entity.ts
│           │   └── message.entity.ts
│           └── dto/
│
├── test/
├── .env
├── nest-cli.json
├── package.json
└── tsconfig.json
```

**Notes:**
- `notifications` is its own module rather than living inside `sales`/`users` — every other module just calls `notificationsService.send(...)`, keeping email/WhatsApp provider swaps (Brevo, Twilio, etc.) isolated to one place.
- `chatbot` is separate from `notifications` since it's inbound (customer-initiated) rather than outbound/triggered.
- Cron jobs live inside `notifications/jobs/` since that's what they ultimately do — check the DB, then hand off to `email.service` / `whatsapp.service`.

---

## 2. Database Architecture

### Tables

**users**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| name | varchar | |
| email | varchar, unique | |
| password_hash | varchar | |
| role | enum | MD_GM, OFFICE_ADMIN, SITE_COORDINATOR, TEAM_LEAD, ACCOUNTANT, CUSTOMER_CARE, MARKETER |
| team_lead_id | uuid, FK → users.id | nullable, self-referencing |
| marketer_status | enum | nullable — PENDING / APPROVED / REJECTED (Phase 2 self-registration) |
| created_at, updated_at | timestamp | |

**properties**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| title | varchar | |
| location | varchar | |
| price | decimal | |
| status | enum | AVAILABLE, RESERVED, SOLD |
| created_at, updated_at | timestamp | |

**sales**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| property_id | uuid, FK → properties.id | |
| buyer_name, buyer_phone, buyer_email | varchar | |
| sale_type | enum | OUTRIGHT, INSTALLMENT |
| total_amount | decimal | |
| sold_by_id | uuid, FK → users.id | nullable — internal staff |
| marketer_id | uuid, FK → users.id | nullable — external referral |
| created_at | timestamp | |

**installment_plans**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| sale_id | uuid, FK → sales.id | unique (1:1 with sale) |
| number_of_installments | int | |
| start_date | date | |
| overdue | boolean | default false, flips via cron check |

**installment_payments**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| installment_plan_id | uuid, FK → installment_plans.id | |
| amount_paid | decimal | |
| paid_at | date | |
| note | text | nullable |

**sale_documents**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| sale_id | uuid, FK → sales.id | |
| file_url | varchar | points to S3/Spaces object |
| document_type | enum | CONTRACT, ID, OTHER |
| uploaded_at | timestamp | |

**referrals**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| marketer_id | uuid, FK → users.id | |
| sale_id | uuid, FK → sales.id | |
| commission_amount | decimal | |
| status | enum | PENDING, PAID |
| paid_at | timestamp | nullable |

**financial_transactions**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| type | enum | INCOME, EXPENSE |
| category | varchar | |
| amount | decimal | |
| date | date | |
| sale_id | uuid, FK → sales.id | nullable — auto-linked when a sale creates income |
| note | text | nullable |
| recorded_by_id | uuid, FK → users.id | |

**attendance**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| staff_id | uuid, FK → users.id | |
| clock_in | timestamp | |
| clock_out | timestamp | nullable |
| clock_in_location | varchar | nullable, Phase 3 geolocation |
| date | date | |

**daily_task_reports**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| staff_id | uuid, FK → users.id | |
| date | date | |
| content | text | |

**blog_posts**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| title | varchar | |
| slug | varchar, unique | |
| content | text | |
| author_id | uuid, FK → users.id | |
| published | boolean | default false |
| published_at | timestamp | nullable |

**newsletter_subscribers**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| email | varchar, unique | |
| subscribed_at | timestamp | |
| unsubscribed | boolean | default false |

**newsletter_campaigns**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| subject | varchar | |
| body | text | |
| sent_at | timestamp | nullable |
| created_by_id | uuid, FK → users.id | |

**notification_log**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| channel | enum | EMAIL, WHATSAPP |
| trigger_type | enum | BIRTHDAY, PAYMENT_REMINDER, INSPECTION_FOLLOWUP, COMMISSION_PAID |
| recipient | varchar | |
| related_sale_id | uuid, FK → sales.id | nullable |
| related_referral_id | uuid, FK → referrals.id | nullable |
| status | enum | SENT, FAILED |
| sent_at | timestamp | |

**chatbot_conversations**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| customer_identifier | varchar | phone/email/session id, no login required |
| status | enum | OPEN, HANDED_OFF, CLOSED |
| assigned_to_id | uuid, FK → users.id | nullable — Customer Care once handed off |
| created_at | timestamp | |

**chatbot_messages**
| Column | Type | Notes |
|---|---|---|
| id | uuid, PK | |
| conversation_id | uuid, FK → chatbot_conversations.id | |
| sender | enum | CUSTOMER, BOT, STAFF |
| content | text | |
| sent_at | timestamp | |

---

## 3. Relationships

```
users (1) ──< (M) sales                [sold_by_id]
users (1) ──< (M) sales                [marketer_id]
users (1) ──< (M) referrals            [marketer_id]
users (1) ──< (M) financial_transactions [recorded_by_id]
users (1) ──< (M) attendance           [staff_id]
users (1) ──< (M) daily_task_reports   [staff_id]
users (1) ──< (M) blog_posts           [author_id]
users (1) ──< (M) newsletter_campaigns [created_by_id]
users (1) ──< (M) chatbot_conversations [assigned_to_id]
users (1) ──< (M) users                [team_lead_id, self-referencing]

properties (1) ──< (M) sales

sales (1) ──1── (1) installment_plans
sales (1) ──< (M) sale_documents
sales (1) ──< (M) referrals
sales (1) ──< (M) financial_transactions
sales (1) ──< (M) notification_log

installment_plans (1) ──< (M) installment_payments

referrals (1) ──< (M) notification_log

chatbot_conversations (1) ──< (M) chatbot_messages
```

**Why `sales` is the hub:** it's the single table referenced by installments, referrals, finance, and notifications. Every downstream feature (commission tracking, income logging, payment reminders) reads from or writes to `sales` — which is why it was built in Week 2, right after auth and properties, before anything that depends on it.

**Independent tables** (no dependency on `sales`, safe to build in parallel): `attendance`, `daily_task_reports`, `blog_posts`, `newsletter_subscribers`, `chatbot_conversations`/`chatbot_messages`.
