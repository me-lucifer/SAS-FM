# SAS Fleet Manager (Web)

Fleet Manager module for the **SAS Fleet** system.  
This repo contains the web app used by Fleet Managers to monitor vehicles, review fuel & odometer submissions, manage maintenance work orders, and export reports.

> **Scope of this repo**: Fleet Manager only. The Bowser Operator and Driver apps are separate modules. Mock/demo data is included so you can run this app standalone.

---

## ✨ Features

- **Dashboard**
  - KPIs: Active, In Maintenance, Down, Fuel Today, Cost Today, Odo Δ Today
  - Trend chart: Daily Fuel Consumption
  - Cost by Station (bar)
  - Vehicle Status Distribution (donut)
  - **Alerts panel** linking to Maintenance tickets

- **Vehicles**
  - Fleet-wide table (filters: fleet, status, type)
  - Row actions: View/Edit, Schedule Maintenance, Set as Down, Delete
  - **Vehicle details** with tabs:
    - Overview (summary + recent activity)
    - Fuel (entries table + quick filters)
    - Odometer (readings, Δ km, OCR%)
    - Maintenance (tickets for this vehicle)
    - Documents (registration, insurance, etc.)

- **Drivers**
  - Driver list with assigned vehicle, last submission, flag count
  - **Flags column tooltips** explaining each flag (e.g., *Low OCR*, *Fuel Over Max*, *Odo Δ High*)
  - Row action: View Details (profile, history, notes)

- **Fuel Queue**
  - Tabs: All, Submitted, Flagged, Approved, Rejected
  - Row actions: View, Approve, Reject
  - Right-side **details drawer** with:
    - Vehicle & Driver
    - Odometer snapshot & distance since last fill
    - Pump meter photos (Before/After)
    - Attachments & notes  
    - > **No payment/transaction fields** (intentionally removed)

- **Odometer Submissions**
  - List with Δ km, OCR%, status, flags
  - Action: View (image, extracted reading, geotag, history)

- **Maintenance**
  - Board view: Scheduled, In Progress, Completed, Deferred
  - Calendar view with day tickets
  - Ticket actions: View Details, Edit Ticket
  - Work Order screen (start/complete work, timeline/notes, attachments)
  - Create Work Order modal

- **Reports**
  - Daily Fuel Issue Log (exportable CSV)
  - Vehicle Log & Availability (**placeholder**)
  - Fuel Consumption & Cost (**placeholder**)

- **Profile**
  - User profile, language, password change, logout

---

## 🏗️ Tech Stack

- **Frontend:** React + TypeScript, Vite, React Router
- **UI:** Tailwind CSS, Headless UI, Lucide icons
- **State/Data:** Firebase (Auth, Firestore, Storage), React Query
- **Charts:** Recharts
- **Tooling:** ESLint, Prettier, Husky (pre-commit)

> You can swap Firebase for any backend; the UI uses a thin data layer (`/src/data`) to abstract reads/writes.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm (or pnpm)
- Firebase project (free tier is fine)
- Firebase CLI (`npm i -g firebase-tools`)

### 1) Clone & Install
```bash
git clone https://github.com/<you>/sas-fleet-manager.git
cd sas-fleet-manager
npm install
