# UniNest Hostel Management System

This document outlines the technical implementation plan for building a full-stack hostel management web application using React + Tailwind CSS + Supabase.

## User Review Required

> [!IMPORTANT]
> **Supabase Setup**: Since Supabase requires an active project, you will need to create a free Supabase project at [supabase.com](https://supabase.com). 
> Once created, you will need to provide the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to connect the frontend to the database, and execute the SQL schema provided below in your Supabase SQL Editor.

> [!NOTE]
> Please review the architecture and design choices below. Let me know if you approve so I can begin execution.

## Proposed Architecture & Stack
- **Frontend Framework**: React 18 with Vite for fast bundling.
- **Routing**: `react-router-dom` for navigation between Landing Page, Auth Login, and Admin Dashboard.
- **Styling**: Tailwind CSS with custom fonts (`Playfair Display`, `DM Sans`), and a dark navy/blue color scheme.
- **Icons**: `lucide-react` for modern, scalable SVG icons.
- **Database & Auth**: Supabase handling PostgreSQL storage and Admin authentication.

## Proposed Changes

---

### Initialize Project & Scaffolding
- Initialize the application using Vite.
- Install dependencies: `tailwindcss`, `react-router-dom`, `@supabase/supabase-js`, `lucide-react`, `recharts` (for dashboard charts), and Tailwind configuration.
- Add Google Fonts imports to `index.css`.
- Configure `tailwind.config.js` with the custom color palette ( navy and blue variants) and font families.

---

### Supabase Integration
#### [NEW] `src/lib/supabase.js`
Create the Supabase client wrapper using environment variables to connect to the cloud database.

#### SQL Schema (For manual execution in Supabase)
I will provide the exact SQL snippet to create the required tables:
- `rooms` (id, room_number, type, capacity, price, status, created_at)
- `students` (id, name, cnic, phone, room_id, checkin_date, payment_status)
- `budget` (id, type, category, description, amount, date)
- `inquiries` (id, name, phone, email, preferred_room, message, created_at)
- `pricing` (id, room_type, monthly_price, security_deposit)

> *Note: I added `capacity` to `rooms` based on the requested dashboard fields.*

---

### Shared Components
#### [NEW] `src/components/layout/Navbar.jsx`
Responsive navigation, sticky at the top, adapting links based on whether user is on landing page or logging in.

#### [NEW] `src/components/layout/Footer.jsx`
Standard footer with contact info.

#### [NEW] `src/components/ui/...`
Reusable UI components like buttons, modals, and stat cards.

---

### Public Landing Page
#### [NEW] `src/pages/public/LandingPage.jsx`
Will aggregate the following sections:
- **Hero Section**: Distinct typography, impactful tagline, twin calls-to-action.
- **Features Section**: Grid of 8 cards with icons (WiFi, Meals, Security, etc.).
- **Rooms Showcase**: 3 Room types with pricing and amenities.
- **Pricing Comparison**: A clean data table contrasting room capacities against features.
- **Testimonials**: Student reviews in a masonry or flex layout.
- **Contact/Inquiry Form**: Form with Supabase ingestion.

---

### Admin Login & Auth Protection
#### [NEW] `src/pages/auth/Login.jsx`
Stylized login screen hooking into `supabase.auth.signInWithPassword()`.

#### [NEW] `src/components/auth/ProtectedRoute.jsx`
A wrapper component intercepting unauthenticated users from entering the `/admin` path and route.

---

### Admin Dashboard Pages
#### [NEW] `src/components/admin/AdminSidebar.jsx`
A vertical sidebar with navigation between dashboard modules.

#### [NEW] `src/pages/admin/Dashboard.jsx`
Overview comprising dynamic stats and visual occupancy bar charts using Recharts.

#### [NEW] `src/pages/admin/RoomManagement.jsx`
CRUD table for managing rooms, tracking availability, and updating rental attributes.

#### [NEW] `src/pages/admin/Students.jsx`
Directory for hostel occupants linked via foreign keys to rooms.

#### [NEW] `src/pages/admin/BudgetTracker.jsx`
Income/Expense ledger calculating total net balance over time.

#### [NEW] `src/pages/admin/PricingConfig.jsx`
UI to dynamically adjust real-time prices displayed to the public landing page via database pulls.

---
## Open Questions
1. Do you want me to set up the Vite + React boilerplate right away and start building the UI components while you set up the Supabase project?
2. Do you have a preference for any specific charting library other than `recharts` for the occupancy charts?
3. Should the admin portal registration be entirely manual (i.e. only your known email is allowed), or do you need a signup page? (Currently assuming just a hardcoded/manually created Supabase admin user).

## Verification Plan
1. **Automated Tests**: Basic linting checks and Vite build success checking.
2. **Manual Verification**: We will launch the Vite dev server, render all components locally, navigate through the public interface. After Supabase keys are provided, we will verify form submissions to "inquiries" and CRUD operations across the "admin" interface.