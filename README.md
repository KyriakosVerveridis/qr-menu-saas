# QR Menu SaaS

A multi-tenant SaaS platform that lets restaurant, cafe, and bar owners create a digital, multilingual QR-code menu in minutes — no design or coding skills required.

**Live demo:** https://qr-menu-saas-pi.vercel.app
**Backend API:** https://qr-menu-saas-l9pj.onrender.com *(API-only, no UI at root — try `/admin/` or any `/api/...` endpoint)*

> ⚠️ This project is under active development. Some features are still being polished.

---

## What it does

- Restaurant owners sign up, pick their business type (cafe, pizzeria, taverna, beach bar, etc.), and get a curated set of relevant menu categories to start from
- They add products with photos, prices, and translations (Greek/English), organized into categories
- The app generates a QR code linking to a public, mobile-first menu page for that restaurant
- Customers scan the QR code and see a fast, translated, dark-mode-capable menu — no app download, no login

## Tech stack

**Backend**
- Django + Django REST Framework
- PostgreSQL (Neon, serverless)
- JWT authentication (`djangorestframework-simplejwt`)
- Cloudinary for image upload/optimization
- SendGrid (Web API) for transactional email
- Gunicorn + WhiteNoise for production serving

**Frontend**
- React + Vite
- React Router
- Tailwind CSS
- Axios

**Infrastructure**
- Render (backend hosting)
- Vercel (frontend hosting)
- Neon (managed Postgres, separate dev/production projects)

## Key architecture decisions

- **Multi-tenant ownership model**: every restaurant belongs to an owner; API permissions enforce that owners can only manage their own data
- **Internationalization built on real models, not hardcoded strings**: a `Language` model plus per-entity `Translation` models (for categories and menu items) mean adding a new language is a data change, not a code change
- **Business type → category filtering**: a `BusinessType` ↔ `MasterCategory` join table lets the category picker show only relevant options depending on what kind of venue the owner runs, instead of one long undifferentiated list
- **Public menu page is grouped server-side**: the public API returns categories with their items pre-grouped and fully translated, so the frontend does no guesswork
- **SendGrid via Web API, not SMTP**: SMTP (port 587) hung indefinitely on Render's free tier and crashed the worker process; switching to SendGrid's HTTPS-based Web API fixed it — a good example of a hosting-environment constraint that only shows up in production

## Features

- JWT-based auth: register, login, password reset (with real email delivery)
- Dedicated onboarding flow for first-time users
- Dashboard with store switcher, category/product management, QR code viewer
- Image upload with automatic compression (Cloudinary)
- Full category + product translation (Greek/English, extensible)
- Public, mobile-first, multilingual menu page with dark mode
- Business-type-aware category suggestions
- Production deployment with a separate seeded production database

## Project structure

qr-menu-saas/
├── backend/ # Django project
│ └── apps/
│ ├── accounts/ # Auth, registration, password reset
│ ├── restaurants/ # Restaurant model, ownership, QR generation
│ ├── categories/ # MasterCategory + per-restaurant Category
│ ├── menus/ # MenuItem + translations, public menu endpoint
│ ├── languages/ # Language model
│ └── business_types/ # BusinessType + category mapping
└── frontend-React/
└── frontend-react/ # React + Vite app
└── src/components/
├── Onboarding/
├── Dashboard/Layout/
├── Products/, Category/
├── PasswordReset/
└── MenuPage.jsx # public-facing menu

## Running locally

**Backend**
```bash
cd backend
python -m venv venv
source venv/Scripts/activate   # or venv/bin/activate on macOS/Linux
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend**
```bash
cd frontend-React/frontend-react
npm install
npm run dev
```

Both need a `.env` file (not committed) with database, Cloudinary, and SendGrid credentials.

## Roadmap

- [ ] Email verification on signup
- [ ] Stripe billing / subscriptions
- [ ] Owner-defined custom categories (beyond the curated list)
- [ ] Search within the public menu
- [ ] Separate staging vs. production environments + custom domain
- [ ] Error monitoring/alerting (Sentry)

## About this project

Built as a hands-on way to learn production-grade full-stack development — from data modeling and API design through to real deployment, debugging, and infrastructure quirks (CORS, static file serving, SMTP port restrictions, etc.). Developed with Python/Django backend training and 10+ years of prior web development experience (WordPress → custom sites), using AI-assisted pair programming for architecture guidance and debugging.