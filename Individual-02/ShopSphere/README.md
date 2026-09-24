# ShopSphere — Multi-Vendor E-Commerce Marketplace

ShopSphere is a **MERN (MongoDB, Express, React, Node.js)** multi-vendor e-commerce platform. It provides role-based workspaces for customers, independent sellers, platform administrators, support staff, and delivery partners.

All persistent records—including users, credentials, products, multi-vendor orders, inventory balances, and notification events—are managed exclusively through **MongoDB Atlas** as the single source of truth.

---

## Architecture Overview

```
                      +-----------------------------+
                      |       MongoDB Atlas         |
                      |   (Single Source of Truth)  |
                      +--------------+--------------+
                                     |
                                Mongoose Models
                                     |
                      +--------------v--------------+
                      |     Express.js REST API     |
                      |  JWT Authentication / RBAC  |
                      +--------------+--------------+
                                     |
                         Protected REST Endpoints
                                     |
                      +--------------v--------------+
                      |     React 19 Frontend       |
                      |  Vite + Tailwind CSS (v4)   |
                      |  AuthContext / App Router   |
                      +-----------------------------+
```

---

## Role-Based Access Control (RBAC)

ShopSphere enforces strict backend authorization across 5 distinct roles:

| Role | Access Scope | Login Flow |
| :--- | :--- | :--- |
| **Admin** | Platform metrics, seller moderation, user suspension, category/coupon management, audit logs | Staff Portal (Dedicated Admin) |
| **Support** | Ticket lifecycle, dispute mediation, customer communications, internal notes | Staff Portal (Dedicated Support) |
| **Delivery**| Assigned delivery manifests, shipment status transitions, GPS tracking checkpoints | Staff Portal (Dedicated Delivery) |
| **Seller**  | Store management, product cataloging, AI taxonomy assistant, order fulfillment, settlement ledger | Standard Portal (Role: Seller) |
| **Customer**| Product search/filters, multi-vendor cart, wishlist, coupon checkout, order tracking, returns, reviews | Standard Portal (Role: Customer) |

---

## Directory Structure

```
ShopSphere/
|-- .env                     # Shared monorepo environment config
|-- .gitignore               # Excludes secrets, node_modules, build outputs
|-- package.json             # Root monorepo script runner
|-- README.md                # Project documentation
|
|-- backend/
|   |-- .env                 # Server-only credentials & database configuration
|   |-- package.json
|   `-- src/
|       |-- ai/              # Google Gemini AI services & taxonomy prediction
|       |-- config/          # MongoDB Atlas connection & third-party integrations
|       |-- controllers/     # REST route controllers
|       |-- middleware/      # JWT authentication, role verification, error handler
|       |-- models/          # Pure Mongoose schemas & models
|       |-- routes/          # Express route registrations
|       |-- scripts/         # ensurePermanentAccounts.js idempotent initializer
|       |-- services/        # Checkout atomic transactions, inventory, notifications
|       |-- utils/           # Data sanitizers and response formatters
|       |-- app.js           # Express application configuration
|       `-- server.js        # Server bootstrapper & permanent account checker
|
`-- frontend/
    |-- .env                 # Public frontend environment variables
    |-- index.html           # Single-page application entry HTML
    |-- package.json
    |-- vite.config.js       # Vite build configuration with /api proxy to backend
    `-- src/
        |-- components/      # UI views (auth, catalog, cart, checkout, role dashboards)
        |-- context/         # AuthContext, CartContext, WishlistContext, NotificationContext
        |-- services/        # Axios API clients
        |-- App.jsx          # Route definitions & global layout
        |-- index.css        # Tailwind CSS imports & styles
        `-- main.jsx         # React application root
```

---

## Environment Variables

### Backend Configuration (`backend/.env`)

```ini
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_secret
JWT_EXPIRES_IN=7d

# Permanent Staff Credentials (initialized automatically on startup)
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=your_admin_password
SUPPORT_EMAIL=support@gmail.com
SUPPORT_PASSWORD=your_support_password
DELIVERY_EMAIL=delivery@gmail.com
DELIVERY_PASSWORD=your_delivery_password

# AI & Third-Party Services
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration (`frontend/.env`)

```ini
# Public API base URL. Use /api with the Vite development proxy, or set the deployed API URL.
VITE_API_URL=https://shopsphere-qfs6.onrender.com
```

> **Security Note:** Never expose `MONGODB_URI`, `JWT_SECRET`, or staff passwords in client-side code or repositories. All real `.env` files are ignored by git.

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)
- **MongoDB Atlas** cluster or accessible MongoDB instance

### Installation

Install dependencies for both tiers:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Initializing Permanent Staff Accounts

The three permanent staff accounts (`admin`, `support`, `delivery`) are checked and synchronized idempotently whenever the backend starts. You can also run the initialization script directly:

```bash
cd backend
npm run ensure-accounts
```

The script will:
1. Connect securely to MongoDB Atlas.
2. Verify or create each staff account.
3. Synchronize roles and re-hash passwords with bcrypt.
4. Leave all customer and seller accounts untouched.

---

## Running the Application

### 1. Start the Backend API

```bash
cd backend
npm run dev
```

The API will listen on `http://localhost:5000`.

### 2. Start the Frontend Application

In a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`. Set `VITE_API_URL=/api` for the Vite proxy to a local backend, or keep the deployed API URL to use Render.

### Production deployment environment

- **Vercel:** set `VITE_API_URL=https://shopsphere-qfs6.onrender.com` and redeploy the frontend.
- **Render:** in the backend service's **Environment** settings, configure `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL=https://shopsphere-chi-virid.vercel.app,https://shopsphere-2hjy3wq2k-adamahansinis-projects.vercel.app`, plus any enabled AI, staff-account, or email credentials. `JWT_SECRET` must contain at least 32 characters; generate a strong value locally with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`, then paste it directly into Render without sharing or committing it. Save the settings and redeploy the backend.
- Keep MongoDB, JWT, Gemini, staff-account, and email credentials only in Render/backend environment variables. Do not prefix them with `VITE_`. Changing `JWT_SECRET` invalidates existing login tokens, so users will need to sign in again.

---

## Core Features

### Payments

ShopSphere currently supports Cash on Delivery (COD). Online payment gateways are not implemented. Payment records are separate from checkout and order processing so a future provider can be integrated without redesigning the core order, inventory, or transaction system.

### 1. Customer Shopping & Multi-Vendor Cart
- Responsive product catalog with instant search, category filters, price range sliders, and rating filters.
- Real-time stock availability check backed by MongoDB inventory reservations.
- Persistent Wishlist with price-drop surveillance.
- Multi-vendor cart grouping products by seller with partitioned fulfillment estimates.

### 2. Multi-Vendor Atomic Checkout
- Orders containing items from multiple sellers are atomically verified, stock-reserved, and partitioned into dedicated `SellerOrder` records.
- MongoDB transaction session guarantees that if any vendor constraint fails, all reserved inventory is safely rolled back with zero orphaned stock.

### 3. Seller Management & AI Taxonomy Studio
- Instant seller registration and storefront creation.
- Product cataloging workflow powered by Google Gemini AI to analyze supplied details and predict categories, tags, and search keywords.
- Seller fulfillment pipeline: status updates from `CONFIRMED` to `PACKED` and `SHIPPED`.
- Live earnings ledger calculating platform commission and net settlements.

### 4. Admin Operations & Governance
- Platform analytics: Gross Merchandise Value (GMV), platform commissions, dispute counts, and total user metrics.
- Moderation tools: seller approvals, user account suspensions, dispute resolution, category editing, and coupon creation.
- Detailed audit logs capturing critical administrator and seller actions.

### 5. Support & Delivery Portals
- Dedicated support ticketing system with threaded messaging, priority flags, and internal agent notes.
- Dedicated delivery driver portal for viewing assigned shipments, updating delivery milestones, and recording transit checkpoints.

---

## Production Build

To produce an optimized production bundle of the frontend:

```bash
cd frontend
npm run build
```

The compiled assets will be output to `frontend/dist/`.
