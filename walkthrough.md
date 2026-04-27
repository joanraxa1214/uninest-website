# UniNest Hostel Management System — Walkthrough

## ✅ What Was Built

A full-stack hostel management web app for a Pakistani university with:

- **Public Landing Page** — 7 sections with Playfair Display / DM Sans typography
- **Admin Dashboard** — 5 feature-rich tabs, protected by Supabase Auth
- **Supabase Backend** — 5 tables with RLS policies

---

## 🖼️ Screenshots

### Landing Page — Hero
![Hero Section](C:/Users/Joan/.gemini/antigravity/brain/6e2701ef-7fe4-4c7c-9e5a-fa79acf3a08d/hero_section_retry_1776614709631.png)

### Admin Login
![Admin Login](C:/Users/Joan/.gemini/antigravity/brain/6e2701ef-7fe4-4c7c-9e5a-fa79acf3a08d/admin_login_page_1776614737418.png)

---

## 📁 Project Structure

```
d:\Hostel Management System\
├── src/
│   ├── context/AuthContext.jsx       # Supabase auth state
│   ├── lib/supabase.js               # Supabase client
│   ├── components/
│   │   ├── auth/ProtectedRoute.jsx   # Route guard
│   │   ├── admin/AdminLayout.jsx     # Sidebar layout
│   │   └── layout/Navbar.jsx / Footer.jsx
│   ├── pages/
│   │   ├── public/LandingPage.jsx    # Full public site
│   │   ├── auth/Login.jsx            # Admin login
│   │   └── admin/
│   │       ├── Dashboard.jsx
│   │       ├── RoomManagement.jsx
│   │       ├── Students.jsx
│   │       ├── BudgetTracker.jsx
│   │       └── PricingConfig.jsx
│   ├── App.jsx                       # Router
│   └── main.jsx
├── supabase_schema.sql               # Full DB schema + RLS
├── .env.example                      # Credentials template
├── tailwind.config.js
└── vite.config.js
```

---

## 🔧 Setup Instructions (Step-by-Step)

### Step 1 — Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Copy your **Project URL** and **anon/public key** from Settings → API

### Step 2 — Create the `.env` file
Rename `.env.example` to `.env` and fill in your values:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3 — Run the SQL Schema
Go to your Supabase project → **SQL Editor** → paste the contents of `supabase_schema.sql` → **Run**

This creates all 5 tables with RLS policies and seeds default pricing data.

### Step 4 — Create Admin Users
Go to **Authentication → Users → Add User** and create:

| Username   | Email (you choose)    | Password  |
|------------|-----------------------|-----------|
| joanraza   | joanraza@uninest.pk   | joan1214  |
| dogar      | dogar@uninest.pk      | dogar1214 |

> [!IMPORTANT]
> Use these exact passwords when logging in. If you want different emails, just make sure to update them consistently.

### Step 5 — Start the App
```bash
cd "d:\Hostel Management System"
npm run dev
```

→ Open http://localhost:5173/

---

## 🎛️ Admin Dashboard Features

| Tab | Features |
|-----|----------|
| **Dashboard** | Stat cards, occupancy bar chart, donut chart, recent inquiries |
| **Room Management** | Add/edit/delete rooms with number, type, capacity, price, status |
| **Students** | Add/edit/delete with CNIC auto-format, room assignment, payment status |
| **Budget Tracker** | Income/expense log, filter tabs, total income/expense/balance cards |
| **Pricing Config** | Edit monthly price & security deposit per room type, saves to DB |

---

## 🌐 Public Landing Page Sections

1. Fixed Navbar with logo, links, Admin Login button
2. Hero — "Your Home, Away From Home", 3 stat counters
3. Features — 8 amenity cards (WiFi, Meals, Security, Study Room, Laundry, AC, Bathrooms, Transport)
4. Rooms — 3 room type cards with pricing (Single Rs.8k, Double Rs.5.5k, Triple Rs.4k)
5. Pricing — Comparison table with all features vs room types
6. Testimonials — 3 student reviews with star ratings
7. Contact — Inquiry form (saves directly to Supabase `inquiries` table)
8. Footer — Address, phone, email, social links

