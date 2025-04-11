# BitSlow – Hashed Crypto Marketplace

BitSlow is a fully functional, modern cryptocurrency marketplace built with **React**, **TypeScript**, **Bun**, and **SQLite**, where users can **generate**, **buy**, **sell**, and **track ownership** of unique digital coins — all within a clean, performant single-page application.

At its core, BitSlow is built around a unique hashing mechanism: each coin is generated using a combination of **three unique integers between 1 and 10**, hashed using **MD5**, resulting in a total of **up to 1000 unique BitSlow coins**. Users can generate new coins via a modal interface, and each coin can only exist once in the system.

The platform provides:
- A **Market** where users can browse and buy available BitSlow coins.
- A **Dashboard** for tracking all platform transactions with robust filtering and pagination.
- A **Profile** page showing each user's personal coin holdings, value, and transaction history.

Ownership transfers are recorded automatically as **transactions**, and every historical owner of a coin is visible through a modal view powered by a `coin_history` table.

---

## ✅ Features Implemented

### 1. Full Auth System (Register/Login)
- Password validation (format, length, character checks).
- JWT-based authentication stored via HTTP-only cookies.
- Automatic token validation on load and protected route access.
- `check-token` endpoint is called to verify user session:
    - On login page load.
    - On protected route access (`/profile`, `/dashboard`, `/market`).
- Includes a secure logout endpoint that clears the token and ends the session.
- Protected routes use `ProtectedRoute.tsx` to ensure secure routing.
- Clear user feedback for login/registration errors.

### 2. User Dashboard
- Displays all transactions on the platform with rich filtering options:
  - By buyer/seller name, date range, or value range.
- Custom pagination: 15, 30, or 50 records per page.
- Column sorting support.
- Prefetching and caching of next pages for seamless UX.
- Fallback UI for loading, empty, and error states.
- Every new coin purchase generates a transaction, instantly reflected in the dashboard.

### 3. Profile Page
- Displays:
  - Total BitSlow currency owned.
  - Total number of coins owned.
  - All transactions the user has participated in (as buyer or seller).
  - Editable profile data.
- Infinite scrolling for both coins and transaction history:
  - Loads 10 items per chunk.
  - Prefetches next chunk when 3 items remain unseen.
- Optimized for performance with scroll-based loaders and visual skeletons.
- Errors and empty states handled with dedicated UI components.

### 4. BitSlow Market
- Explore all available coins for purchase.
- Paginated list of all available BitSlows (15/30/50 per page).
- Buy BitSlow: triggers transaction creation and ownership transfer.
- Generate BitSlow:
  - Creates a new coin with an unused 3-number combination (MD5 hashed).
  - Button disappears after max combinations are used.
- Historical ownership can be accessed via a modal view powered by the `coin_history` table.
- Unlist feature prevents users from buying their own coins.
- Each coin card displays:
  - Its value, hash, bit combination, owner, and action buttons.
- Smart caching and abort logic avoids redundant fetches.
- Uses `MarketSkeleton` while loading, and `ErrorMessage` or `EmptyState` when needed.

---

### Seeded Test User for Quick Access
A default user is seeded automatically for testing purposes:
```
Email: test@test.ts
Password: AAAAA1
```
This user owns coins and is involved in both buying and selling transactions.

---

## ⚙️ Tech Stack

| Area         | Tech                     |
|--------------|--------------------------|
| Frontend     | React + TypeScript       |
| Backend      | Bun + SQLite             |
| Styling      | Tailwind (utility-based) |
| Auth         | JWT + bcrypt             |
| State Mgmt   | Custom Hooks             |
| Persistence  | `sessionStorage`         |
| Caching      | In-memory map (per hook) |

---

## 🗂️ Project Structure

```txt
src/
├── App.tsx                  # Routing
├── index.tsx                # Bun backend (API + SQLite)
├── seed.ts                  # Faker-powered seeder
├── frontend.tsx             # React app bootstrap
│
├── pages/                   # Main routes
├── components/              # UI parts
│   ├── market/              # Generate, Buy, History modal
│   ├── profile/             # Stats and coin display
│   ├── dashboard/           # Filters and skeletons
├── hooks/                   # API/data logic
├── types/                   # d.ts for all entities
```
---

## Setup

Before running the project, configure your `.env` file with the following variables:

```env
JWT_SECRET=Super!Secret!Key123
BUN_PUBLIC_ENDPOINT_URL=http://localhost:3000/
```

## Extra Implementation Details

### BitSlow Coin Generation
Each BitSlow coin is generated using a unique combination of three numbers (1–10), hashed via MD5. This allows up to **1000 unique coins**. Coin creation automatically stops once all combinations are exhausted.

---

### Database Schema and Seeding
Tables: `clients`, `coins`, `transactions`, `coin_history`

All tables are created programmatically using **Bun's SQLite integration**.

On startup, the database is seeded with:
- 30 random clients
- 20 BitSlow coins
- 50 transactions

---

### Coin Ownership History
Every time a coin is purchased, a new entry is added to the `coin_history` table. This allows complete tracking of ownership across the platform and is used to display the full owner history in the **market modal**.

---

### Indexed Fields for Performance
Indexes are created on key fields to improve filtering, sorting, and overall database performance:
- `buyer_id`
- `seller_id`
- `transaction_date`
- `hash`

---

### Network and State Efficiency
- Fetch requests are managed using `AbortController` to cancel unnecessary or outdated requests.
- Results are cached in memory per hook to reduce redundant API calls.
- Page, filter, and sort preferences are preserved using `sessionStorage` to maintain state across reloads.

---

### Data Simulation with Faker
The app uses the `@faker-js/faker` library to generate realistic fake data during database seeding, including:
- Client names and contact information
- Random BitSlow values
- Transaction history

---

### Typed System with TypeScript
TypeScript interfaces and types are used throughout both the frontend and backend to ensure:
- Strict type safety
- API contract consistency
- Improved developer experience through autocompletion and validation

---

### Responsive Design and Mobile Interface
The website is fully responsive and adapts seamlessly across different screen sizes, including tablets and smartphones.

- The layout adjusts for smaller viewports to preserve readability and usability.
- The navigation bar transforms into a **hamburger menu** on mobile, which toggles a dropdown navigation list.
- All views—including the profile, dashboard, and market—are fully functional and styled for mobile users.
- Touch-friendly spacing, vertical stacking, and font scaling are applied using utility-first CSS (Tailwind).


