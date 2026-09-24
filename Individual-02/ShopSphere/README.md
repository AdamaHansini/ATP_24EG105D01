# 🛍️ ShopSphere

### AI-Enabled Multi-Vendor E-Commerce Marketplace

**ShopSphere** is a full-stack **MERN** marketplace where multiple independent sellers can manage their stores and products while customers can discover, purchase, track, review, and return products through a unified shopping experience.

What makes ShopSphere different from a basic e-commerce application is its focus on **real marketplace problems**:

* 🤖 AI-assisted product classification
* 🏪 Multiple independent sellers
* 🛒 Multi-vendor cart and checkout
* 🔄 Atomic checkout with automatic rollback
* ❤️ Wishlist-based price-drop detection
* 🔔 Real-time application notifications
* 👥 Five separate role-based workspaces
* 🔐 Backend-enforced authentication and authorization
* 📦 Inventory reservation and consistency
* 🎫 Customer support and disputes
* 🚚 Delivery management
* 📊 Seller settlements and marketplace analytics

---

## 🚀 What is ShopSphere?

Imagine a marketplace where:

> **One customer → one cart → multiple sellers → one checkout → multiple seller orders → independent fulfillment**

That is the core idea behind ShopSphere.

A customer can purchase products from several sellers without manually checking out from each store.

Behind the scenes, the backend handles the complexity:

```text
                         CUSTOMER
                            │
                            ▼
                    ┌──────────────┐
                    │  SHOPSPHERE  │
                    │    CART      │
                    └──────┬───────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
         Seller A       Seller B      Seller C
             │             │             │
             ▼             ▼             ▼
        Seller Order   Seller Order   Seller Order
             │             │             │
             └─────────────┼─────────────┘
                           ▼
                    DELIVERY / SUPPORT
```

The customer sees a simple shopping experience.

The backend handles the marketplace complexity.

---

# ✨ Why ShopSphere?

Most academic e-commerce projects stop at:

```text
Login
  ↓
Products
  ↓
Cart
  ↓
Order
```

ShopSphere goes further.

It addresses problems that appear in real marketplace systems:

| Real-World Problem            | ShopSphere Solution                        |
| ----------------------------- | ------------------------------------------ |
| Multiple sellers              | Seller-specific stores and orders          |
| Different seller inventory    | Inventory management and reservation       |
| Multi-vendor checkout failure | Atomic transaction + rollback              |
| Product categorization        | Gemini-powered AI classification           |
| Wishlist price changes        | Automatic price-drop detection             |
| Different responsibilities    | Five-role RBAC                             |
| Customer problems             | Support ticket system                      |
| Seller/customer conflicts     | Dispute management                         |
| Delivery operations           | Dedicated delivery workflow                |
| Marketplace governance        | Admin moderation and audit logs            |
| Sensitive operations          | Backend authorization and ownership checks |

---

# 🎯 Core Marketplace Flow

```text
Seller Registration
        │
        ▼
Admin Approval
        │
        ▼
Store Creation
        │
        ▼
Product Creation
        │
        ▼
AI Product Classification
        │
        ▼
Customer Discovers Product
        │
        ├──────────────► Wishlist
        │
        ▼
      Cart
        │
        ▼
Multi-Vendor Checkout
        │
        ▼
Inventory Reservation
        │
        ▼
Parent Order
        │
        ├── Seller Order A
        ├── Seller Order B
        └── Seller Order C
        │
        ▼
Seller Fulfillment
        │
        ▼
Delivery
        │
        ▼
Customer Review
        │
        ▼
Returns / Support / Disputes
```

---

# 🧠 Three Signature Engineering Features

These are the core technical features that distinguish ShopSphere from a conventional CRUD-based e-commerce application.

---

## 1️⃣ AI Product Tag & Category Predictor

### Problem

Sellers may enter product information in an unstructured way.

For example:

```text
Sony WH-1000XM5 wireless over-ear headphones
with Bluetooth, active noise cancellation and
40-hour battery life.
```

The platform needs structured marketplace information.

### Solution

ShopSphere sends product information from the backend to Gemini and converts the response into structured data.

```text
Seller Input
     │
     ▼
React Frontend
     │
     ▼
POST /api/ai/predict-product
     │
     ▼
Express Backend
     │
     ▼
Gemini API
     │
     ▼
Structured JSON
     │
     ▼
Validation & Normalization
     │
     ▼
Seller Review
     │
     ▼
MongoDB
```

### Example AI Result

```json
{
  "category": "Electronics",
  "subcategory": "Headphones",
  "tags": [
    "wireless",
    "bluetooth",
    "noise-cancelling",
    "over-ear"
  ],
  "attributes": {
    "connectivity": "Bluetooth",
    "type": "Over-Ear",
    "batteryLife": "40 hours"
  },
  "keywords": [
    "wireless headphones",
    "bluetooth headphones",
    "noise cancelling headphones"
  ],
  "confidence": 0.94
}
```

### Important Design Decision

AI suggestions are **not automatically trusted**.

The seller can:

```text
Generate
   ↓
Review
   ↓
Edit
   ↓
Accept
   ↓
Save
```

The backend validates the result before storing it.

### AI APIs

```http
POST /api/ai/predict-product
POST /api/ai/generate-description
POST /api/ai/generate-tags
```

The Gemini API key remains exclusively on the backend.

---

# 2️⃣ Atomic Multi-Vendor Checkout & Automatic Rollback

This is one of the most important backend workflows in ShopSphere.

Suppose a customer purchases:

```text
Seller A
└── Laptop

Seller B
└── Wireless Mouse

Seller C
└── Headphones
```

The customer sees:

```text
ONE CART
ONE CHECKOUT
```

Internally:

```text
Parent Order
│
├── Seller Order A
├── Seller Order B
└── Seller Order C
```

### Checkout Pipeline

```text
Checkout Request
      │
      ▼
Authenticate Customer
      │
      ▼
Retrieve Current Product Data
      │
      ▼
Validate Stock
      │
      ▼
Validate Variants
      │
      ▼
Recalculate Prices
      │
      ▼
Validate Coupons
      │
      ▼
Reserve Inventory
      │
      ▼
Create Parent Order
      │
      ▼
Create Seller Orders
      │
      ▼
Prepare Payment
      │
      ▼
COMMIT TRANSACTION
```

### What happens if something fails?

Suppose:

```text
Seller A → Success
Seller B → Success
Seller C → Failure
```

ShopSphere does not leave the database in a partially completed state.

Instead:

```text
                 FAILURE
                    │
                    ▼
            ABORT TRANSACTION
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
   Seller A     Seller B     Seller C
    Rollback     Rollback    No Order
        │           │
        └──────┬────┘
               ▼
        Inventory Restored
               │
               ▼
        Cart Remains Recoverable
```

### Why this matters

Without transactional handling, a failed checkout could produce:

```text
❌ Inventory deducted
❌ Partial seller orders
❌ Incorrect stock
❌ Orphaned records
❌ Customer charged for incomplete order
```

ShopSphere is designed to avoid that state.

---

# 3️⃣ Wishlist Price-Drop Notification Engine

Customers can save products to their wishlist.

When a seller changes a product's price:

```text
Old Price
    │
    ▼
New Price
    │
    ▼
newPrice < oldPrice ?
```

Only then is the price-drop workflow triggered.

### Example

```text
Before:
₹29,999

After:
₹26,999
```

Flow:

```text
Seller Updates Product
        │
        ▼
Product Update Service
        │
        ▼
Old Price vs New Price
        │
        ▼
Price Drop Detected
        │
        ▼
Find Wishlist Users
        │
        ▼
Create Notifications
        │
        ▼
Optional Email
```

Example notification:

```text
🔔 Price Drop Alert!

Sony WH-1000XM5 Wireless Headphones

₹29,999 → ₹26,999

You saved this product to your wishlist.

[View Product]
```

A failed optional email must not cause the product price update itself to fail.

---

# 👥 Five Role-Based Workspaces

ShopSphere contains five distinct roles.

| Role                    | Responsibilities                                                      |
| ----------------------- | --------------------------------------------------------------------- |
| 👤 **Customer**         | Shopping, wishlist, cart, checkout, orders, reviews, returns, support |
| 🏪 **Seller**           | Store, products, inventory, orders, AI tools, coupons, analytics      |
| 🛡️ **Platform Admin**  | Users, sellers, products, categories, disputes, moderation, analytics |
| 🎧 **Support Agent**    | Tickets, customer issues, disputes and communication                  |
| 🚚 **Delivery Partner** | Assigned deliveries and shipment status                               |

---

## 👤 Customer

```text
Customer
├── Profile
├── Addresses
├── Browse Products
├── Search / Filter / Sort
├── Product Details
├── Cart
├── Wishlist
├── Price-Drop Alerts
├── Coupons
├── Checkout
├── Orders
├── Tracking
├── Cancellation
├── Returns / Refunds
├── Reviews
├── Notifications
└── Support
```

---

## 🏪 Seller

```text
Seller
├── Seller Profile
├── Store
├── Products
├── Product Variants
├── Inventory
├── AI Product Tools
├── Pricing
├── Orders
├── Coupons
├── Analytics
├── Settlements
└── Support
```

---

## 🛡️ Platform Admin

```text
Admin
├── Dashboard
├── Users
├── Sellers
├── Stores
├── Categories
├── Products
├── Orders
├── Coupons
├── Returns
├── Refunds
├── Disputes
├── Support
├── Analytics
├── Audit Logs
└── Platform Settings
```

---

## 🎧 Support Agent

```text
Support
├── Support Dashboard
├── Tickets
├── Order Issues
├── Payment Issues
├── Delivery Issues
├── Return Issues
├── Disputes
├── Customer Communication
└── Internal Notes
```

---

## 🚚 Delivery Partner

```text
Delivery
├── Assigned Deliveries
├── Shipment Details
├── Pickup
├── In Transit
├── Out for Delivery
├── Delivery Checkpoints
└── Delivered
```

---

# 🌎 Real-World ShopSphere Workflow

The following names demonstrate how the application works.

They are **documentation examples only** and are not intended to be permanent application accounts.

### Example Participants

| Role             | Example                                 |
| ---------------- | --------------------------------------- |
| Customer         | **Ananya Sharma**                       |
| Seller           | **Rahul Mehta**                         |
| Platform Admin   | **Priya Reddy**                         |
| Support Agent    | **Arjun Kumar**                         |
| Delivery Partner | **Vikram Singh**                        |
| Store            | **TechNest Store**                      |
| Product          | **Sony WH-1000XM5 Wireless Headphones** |

---

## Step 1 — Seller Approval

```text
Rahul Mehta
     │
     ▼
Seller Registration
     │
     ▼
Priya Reddy
     │
     ▼
Seller Approval
     │
     ▼
Seller Account Active
```

---

## Step 2 — Store & Product

Rahul creates:

```text
TechNest Store
```

Then creates:

```text
Sony WH-1000XM5 Wireless Headphones
```

AI suggests:

```text
Category:
Electronics

Subcategory:
Headphones

Tags:
Wireless
Bluetooth
Noise Cancelling
Over Ear
```

Rahul reviews the suggestions and saves the product.

---

## Step 3 — Customer Shopping

```text
Ananya Sharma
      │
      ▼
Browse ShopSphere
      │
      ▼
Search Headphones
      │
      ├────────► Add to Wishlist
      │
      ▼
Add to Cart
```

---

## Step 4 — Multi-Vendor Checkout

Ananya adds products from multiple sellers:

```text
Cart

Seller A
├── Laptop
└── Laptop Bag

Seller B
└── Wireless Mouse

Seller C
└── Headphones
```

She performs one checkout.

The backend creates:

```text
Parent Order
├── Seller Order A
├── Seller Order B
└── Seller Order C
```

---

## Step 5 — Seller Fulfillment

Seller updates:

```text
CONFIRMED
   ↓
PROCESSING
   ↓
PACKED
   ↓
SHIPPED
```

---

## Step 6 — Delivery

Vikram receives the assigned shipment:

```text
ASSIGNED
   ↓
PICKED UP
   ↓
IN TRANSIT
   ↓
OUT FOR DELIVERY
   ↓
DELIVERED
```

---

## Step 7 — Customer Review

After delivery:

```text
Ananya
  ↓
Product Review
  ↓
Rating
  ↓
Verified Purchase Review
```

---

# 🎧 Support Workflow

Suppose Ananya has an issue with her order.

```text
Ananya
  │
  ▼
Create Support Ticket
  │
  ▼
Arjun Kumar
  │
  ▼
Investigates Issue
  │
  ▼
Communicates with Customer
  │
  ▼
Resolves Issue
  │
  ▼
Ticket Closed
```

---

# 💰 Price-Drop Example

Ananya adds:

```text
Sony WH-1000XM5
₹29,999
```

to her wishlist.

Later:

```text
₹29,999
    ↓
₹26,999
```

ShopSphere detects the decrease.

```text
Price Change
     ↓
Price-Drop Service
     ↓
Wishlist Matcher
     ↓
Notification
     ↓
Ananya
```

---

# 🔄 Rollback Example

During a multi-vendor checkout:

```text
Seller A → Laptop       ✓
Seller B → Mouse        ✓
Seller C → Headphones   ✗
```

The transaction is aborted.

Final state:

```text
Seller A → Rolled Back
Seller B → Rolled Back
Seller C → Not Created

Inventory → Restored
Parent Order → Not Committed
Cart → Recoverable
```

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │       USERS           │
                         │ Customer / Seller /   │
                         │ Admin / Support /     │
                         │ Delivery              │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   React Frontend      │
                         │   Vite + Tailwind     │
                         │   Context API         │
                         └───────────┬───────────┘
                                     │
                                  Axios
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   Express Backend     │
                         │   REST API            │
                         │   JWT + RBAC          │
                         └───────────┬───────────┘
                                     │
                 ┌───────────────────┼───────────────────┐
                 │                   │                   │
                 ▼                   ▼                   ▼
        ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
        │ MongoDB Atlas  │  │   Gemini API   │  │   Cloudinary   │
        │ Marketplace DB │  │ AI Processing  │  │ Image Storage  │
        └────────────────┘  └────────────────┘  └────────────────┘
                                     │
                                     ▼
                              Email Service
```

---

# 🧩 Application Architecture

## Frontend

The frontend is responsible for:

* User interface
* Navigation
* Forms
* Client-side state
* API communication
* Protected route handling
* Role-specific layouts
* Responsive design

---

## Backend

The backend is responsible for:

* Authentication
* Authorization
* Business logic
* Database operations
* Inventory validation
* Transactions
* AI integration
* Notifications
* Order processing
* Security
* Error handling

---

## Database

MongoDB stores:

```text
Users
Sellers
Stores
Products
Categories
Variants
Inventory
Carts
Wishlists
Orders
Seller Orders
Payments
Coupons
Reviews
Returns
Refunds
Tickets
Disputes
Notifications
Deliveries
Settlements
Audit Logs
Browsing History
```

---

# 📁 Project Structure

```text
ShopSphere/
│
├── frontend/
│   │
│   ├── public/
│   │
│   ├── src/
│   │   ├── assets/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── product/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── wishlist/
│   │   │   ├── notification/
│   │   │   ├── seller/
│   │   │   └── admin/
│   │   │
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   ├── CustomerLayout.jsx
│   │   │   ├── SellerLayout.jsx
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── SupportLayout.jsx
│   │   │   └── DeliveryLayout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   ├── customer/
│   │   │   ├── seller/
│   │   │   ├── admin/
│   │   │   ├── support/
│   │   │   └── delivery/
│   │   │
│   │   ├── routes/
│   │   │
│   │   ├── hooks/
│   │   │
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   ├── CartContext.jsx
│   │   │   ├── WishlistContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── cartService.js
│   │   │   ├── wishlistService.js
│   │   │   ├── orderService.js
│   │   │   ├── paymentService.js
│   │   │   ├── aiService.js
│   │   │   └── notificationService.js
│   │   │
│   │   ├── utils/
│   │   ├── constants/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── backend/
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   ├── cloudinary.js
│   │   │   └── mail.js
│   │   │
│   │   ├── controllers/
│   │   │
│   │   ├── routes/
│   │   │
│   │   ├── models/
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── uploadMiddleware.js
│   │   │
│   │   ├── services/
│   │   │   ├── checkoutService.js
│   │   │   ├── inventoryService.js
│   │   │   ├── orderService.js
│   │   │   ├── wishlistService.js
│   │   │   ├── notificationService.js
│   │   │   ├── priceDropService.js
│   │   │   ├── paymentService.js
│   │   │   └── settlementService.js
│   │   │
│   │   ├── ai/
│   │   │   ├── aiClient.js
│   │   │   ├── productClassifier.js
│   │   │   ├── productDescriptionGenerator.js
│   │   │   └── recommendationService.js
│   │   │
│   │   ├── validators/
│   │   ├── seeds/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── .env
├── .env.example
├── package.json
├── .gitignore
└── README.md
```

---

# 🛠️ Technology Stack

### Frontend

| Technology   | Purpose                   |
| ------------ | ------------------------- |
| React.js     | UI                        |
| Vite         | Development/build tooling |
| JavaScript   | Application language      |
| JSX          | UI components             |
| Tailwind CSS | Styling                   |
| React Router | Routing                   |
| Axios        | API communication         |
| Context API  | Application state         |

### Backend

| Technology    | Purpose                    |
| ------------- | -------------------------- |
| Node.js       | Runtime                    |
| Express.js    | REST API                   |
| Mongoose      | MongoDB ODM                |
| JWT           | Authentication             |
| bcryptjs      | Password hashing           |
| dotenv        | Environment configuration  |
| cookie-parser | Cookie handling            |
| CORS          | Cross-origin communication |

### AI & Services

| Technology    | Purpose                |
| ------------- | ---------------------- |
| Google Gemini | Product intelligence   |
| Cloudinary    | Image storage          |
| Email service | Optional notifications |
| MongoDB Atlas | Database               |

---

# 🔐 Security Architecture

Security is enforced at the backend rather than relying only on the frontend.

### Authentication

```text
Login
  ↓
Credentials Verified
  ↓
Password Hash Checked
  ↓
JWT Issued
  ↓
Protected Request
  ↓
JWT Verified
```

### Authorization

```text
Authenticated?
      ↓
Role Allowed?
      ↓
Resource Owned?
      ↓
Permission Granted
```

The backend must reject unauthorized operations even if a user manually calls the API.

### Protected Against

* Unauthorized dashboard access
* Role manipulation
* Direct API abuse
* Seller-to-seller resource access
* User ID manipulation
* Client-controlled pricing
* Client-controlled stock
* Client-controlled order totals
* Exposed API secrets
* Invalid state transitions

---

# 🌱 Environment Configuration

## Root `.env`

```env
NODE_ENV=development
PROJECT_NAME=ShopSphere
API_PREFIX=/api
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5000
```

## Backend `.env`

```env
NODE_ENV=development
PORT=5000

MONGODB_URI=

JWT_SECRET=
JWT_EXPIRES_IN=7d

GEMINI_API_KEY=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

FRONTEND_URL=http://localhost:5173
```

## Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=ShopSphere
```

### Never commit

```text
.env
backend/.env
frontend/.env
```

Commit:

```text
.env.example
backend/.env.example
frontend/.env.example
```

---

# 📦 Installation

## Prerequisites

Install:

* Node.js
* npm
* MongoDB Atlas account
* Gemini API key
* Cloudinary account if image upload is enabled
* Git

---

## Clone

```bash
git clone <repository-url>
cd ShopSphere
```

---

## Backend

```bash
cd backend
npm install
```

---

## Frontend

```bash
cd ../frontend
npm install
```

---

# ▶️ Running ShopSphere

## Terminal 1 — Backend

```powershell
cd backend
npm run dev
```

Backend:

```text
http://localhost:5000
```

The backend entry point is:

```text
backend/src/server.js
```

---

## Terminal 2 — Frontend

```powershell
cd frontend
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# ⚠️ If Port 5000 Is Already in Use

Windows:

```powershell
netstat -ano | findstr :5000
```

Find the PID and terminate the unnecessary process:

```powershell
taskkill /PID <PID> /F
```

Then:

```powershell
npm run dev
```

---

# 💾 Database Configuration

ShopSphere is designed to use **MongoDB Atlas as the persistent production database**.

Set:

```env
MONGODB_URI=your_mongodb_atlas_connection_string
```

The application should not expose this connection string to the frontend.

> **Local runtime note:** if the backend reports an in-memory MongoDB-compatible store during development, verify the active database configuration before treating local data as persistent. MongoDB Atlas is the intended persistent database configuration.

---

# 🤖 Gemini Setup

Create a Gemini API key and configure:

```env
GEMINI_API_KEY=your_key
```

inside:

```text
backend/.env
```

Never use:

```env
VITE_GEMINI_API_KEY=
```

The frontend communicates with the ShopSphere backend, not directly with Gemini.

---

# 🖼️ Cloudinary

Cloudinary is intended for:

* Product images
* Store logos
* Profile images
* Review images

Configure:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Large images should not be stored directly inside MongoDB documents.

---

# 💳 Payment Architecture

### Current implementation

ShopSphere currently uses a **development payment abstraction** rather than an active Razorpay integration.

The architecture supports:

```text
Payment Pending
Payment Successful
Payment Failed
```

This keeps payment logic separated from:

* Checkout
* Orders
* Inventory
* Seller orders

A production payment provider can be introduced later without redesigning the complete checkout architecture.

---

# 🔔 Notification System

Notifications can be generated for events such as:

* Price drops
* Order confirmation
* Order status updates
* Delivery updates
* Returns
* Refunds
* Support updates

Example:

```json
{
  "type": "PRICE_DROP",
  "title": "Price Drop Alert!",
  "message": "Wireless Headphones dropped from ₹2999 to ₹2299.",
  "isRead": false
}
```

---

# 📊 Order Lifecycle

```text
PENDING
   ↓
CONFIRMED
   ↓
PROCESSING
   ↓
PACKED
   ↓
SHIPPED
   ↓
OUT_FOR_DELIVERY
   ↓
DELIVERED
```

Other supported states include:

```text
CANCELLED
RETURN_REQUESTED
RETURNED
REFUNDED
```

The backend validates allowed status transitions.

---

# 🔁 Return & Refund Lifecycle

```text
Return Requested
       ↓
Return Approved
       ↓
Pickup Scheduled
       ↓
Returned
       ↓
Refund Processing
       ↓
Refunded
```

---

# 🚚 Delivery Lifecycle

```text
Assigned
   ↓
Picked Up
   ↓
In Transit
   ↓
Out for Delivery
   ↓
Delivered
```

---

# 🎫 Support Lifecycle

```text
OPEN
 ↓
IN_PROGRESS
 ↓
WAITING_FOR_CUSTOMER
 ↓
RESOLVED
 ↓
CLOSED
```

Supported categories:

* Order
* Payment
* Delivery
* Return
* Product
* Other

---

# 🧾 Coupons

Coupons support business rules such as:

* Coupon code
* Discount type
* Discount value
* Minimum order value
* Maximum discount
* Validity period
* Usage limits
* Per-user limits
* Applicable sellers
* Applicable categories
* Active/inactive state

The backend recalculates and validates the final discount.

---

# ⭐ Reviews

Customers can review products after purchase.

Supported information includes:

* Rating
* Comment
* Optional images
* Verified purchase status

Reviews can be moderated by authorized platform administrators.

---

# 🧪 Testing Strategy

ShopSphere should be tested as a real application rather than only checking whether pages render.

### Authentication

* Registration
* Login
* Logout
* Invalid credentials
* Protected routes
* Expired/invalid authentication
* Role restrictions

### Customer

* Browse
* Search
* Filter
* Sort
* Product details
* Cart
* Wishlist
* Price-drop notification
* Checkout
* Orders
* Cancellation
* Returns
* Reviews
* Support

### Seller

* Seller registration
* Seller approval
* Store creation
* Product CRUD
* AI tools
* Inventory
* Price changes
* Orders
* Coupons
* Analytics

### Admin

* User management
* Seller approval
* Product moderation
* Categories
* Coupons
* Orders
* Returns
* Refunds
* Disputes
* Analytics
* Audit logs

### Support

* Ticket creation
* Ticket assignment
* Status updates
* Customer communication
* Dispute handling

### Delivery

* Assigned orders
* Pickup
* Transit
* Out-for-delivery
* Delivery completion

---

# 🧪 Signature Feature Test Cases

## AI

```text
✓ Valid product
✓ Invalid product input
✓ Gemini failure
✓ Malformed AI response
✓ Unknown category
✓ Seller edits AI result
✓ Seller accepts AI result
✓ Correct MongoDB storage
```

## Checkout Rollback

```text
✓ Single-vendor checkout
✓ Multi-vendor checkout
✓ Insufficient stock
✓ Invalid quantity
✓ Changed product price
✓ Invalid coupon
✓ Payment failure
✓ Simulated mid-transaction failure
✓ Inventory restoration
✓ Seller-order rollback
✓ Parent-order rollback
✓ Recoverable cart
```

## Price Drop

```text
✓ Add product to wishlist
✓ Price decreases
✓ Price increases
✓ Same price
✓ Multiple wishlist users
✓ Notification creation
✓ Notification read state
✓ Product navigation
✓ Optional email
✓ Email failure isolation
```

---

# 📱 Responsive Design

ShopSphere is designed for:

```text
Desktop
   │
   ├── Dashboard
   ├── Marketplace
   └── Management Views

Tablet
   │
   ├── Responsive Navigation
   ├── Adaptive Cards
   └── Responsive Tables

Mobile
   │
   ├── Compact Navigation
   ├── Stacked Content
   ├── Mobile Forms
   └── Responsive Checkout
```

Every important page should be verified at:

* Desktop
* Tablet
* Mobile

---

# 🧹 Test Account & Development Cleanup

Testing accounts are temporary.

The intended testing workflow is:

```text
Create Test Account
       ↓
Test Role
       ↓
Verify Workflows
       ↓
Remove Test Account
       ↓
Remove Test Data
```

The final application should not contain:

* Test login buttons
* Role switchers
* Fake tokens
* Hardcoded user IDs
* Authentication bypasses
* Direct dashboard shortcuts
* Development-only access routes

The production header should show only the navigation relevant to the currently authenticated user.

---

# 🌐 API Reference

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Products

```http
POST   /api/products
GET    /api/products
GET    /api/products/:id
PATCH  /api/products/:id
DELETE /api/products/:id
```

### AI

```http
POST /api/ai/predict-product
POST /api/ai/generate-description
POST /api/ai/generate-tags
```

### Wishlist

```http
GET    /api/wishlist
POST   /api/wishlist
DELETE /api/wishlist/:productId
```

### Cart

```http
GET    /api/cart
POST   /api/cart/items
PATCH  /api/cart/items/:id
DELETE /api/cart/items/:id
POST   /api/cart/reserve
```

### Checkout

```http
POST /api/orders/checkout
```

### Payments

```http
POST /api/payments/create
POST /api/payments/verify
```

### Orders

```http
GET   /api/orders
GET   /api/orders/:id
PATCH /api/orders/:id/status
POST  /api/orders/:id/cancel
```

### Notifications

```http
GET   /api/notifications
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

Additional APIs cover:

```text
Sellers
Stores
Categories
Inventory
Reviews
Returns
Refunds
Coupons
Support
Disputes
Delivery
Settlements
Admin Operations
```

---

# 🏭 Production Build

## Frontend

```bash
cd frontend
npm run build
```

Output:

```text
frontend/dist/
```

## Backend

```bash
cd backend
npm start
```

---

# ☁️ Deployment

## Frontend

Recommended:

**Vercel**

Production environment:

```env
VITE_API_URL=https://your-backend-domain/api
```

---

## Backend

Recommended:

**Render** or **Railway**

Configure production environment variables securely.

---

## Database

**MongoDB Atlas**

---

## Media

**Cloudinary**

---

# 📸 Screenshots

Add project screenshots here before publishing the final repository.

Recommended screenshots:

```text
01-homepage.png
02-product-details.png
03-customer-dashboard.png
04-seller-dashboard.png
05-ai-product-classifier.png
06-multi-vendor-cart.png
07-checkout.png
08-price-drop-notification.png
09-admin-dashboard.png
10-support-dashboard.png
11-delivery-dashboard.png
```

Example:

```markdown
![ShopSphere Homepage](./docs/screenshots/01-homepage.png)
```

---

# 🎥 Demo

Add your deployed application here:

```text
Live Demo:
<YOUR_DEPLOYED_FRONTEND_URL>

Backend API:
<YOUR_DEPLOYED_BACKEND_URL>

Repository:
<YOUR_GITHUB_REPOSITORY_URL>
```

---

# 📌 Project Highlights

### Full-Stack

```text
React + Node.js + Express + MongoDB
```

### Authentication

```text
JWT + bcrypt + RBAC + Protected Routes
```

### AI

```text
Gemini API + Structured Product Classification
```

### Database

```text
MongoDB + Mongoose + Transactions
```

### Marketplace

```text
Multi-Seller + Parent Orders + Seller Orders
```

### Reliability

```text
Inventory Reservation + Automatic Rollback
```

### Notifications

```text
Wishlist Monitoring + Price-Drop Detection
```

### Operations

```text
Admin + Support + Delivery + Seller Workspaces
```

---

# 💼 Resume-Worthy Technical Highlights

ShopSphere demonstrates practical implementation of:

* Full-stack MERN architecture
* REST API design
* JWT authentication
* Role-based authorization
* Resource ownership validation
* MongoDB schema design
* Mongoose transactions
* Multi-vendor order splitting
* Inventory reservation
* Transaction rollback
* AI API integration
* Structured AI response validation
* Event-style notification workflows
* Price-change detection
* Wishlist matching
* Cloud image management
* Customer support workflows
* Return/refund workflows
* Delivery workflows
* Seller settlements
* Audit logging
* Responsive UI design
* Production deployment architecture

---

# 🧠 Engineering Decisions

## Why separate Frontend and Backend?

Keeping them independent makes it easier to:

* Develop independently
* Deploy independently
* Secure backend secrets
* Scale API services
* Maintain clear responsibilities

---

## Why keep AI behind the Backend?

The Gemini API key must never be exposed to browsers.

Therefore:

```text
Frontend
   ↓
ShopSphere Backend
   ↓
Gemini
```

instead of:

```text
Frontend
   ↓
Gemini
```

---

## Why use a Parent Order?

A customer experiences:

```text
ONE CHECKOUT
```

while sellers require:

```text
SEPARATE FULFILLMENT
```

The Parent Order + Seller Order architecture supports both requirements.

---

## Why use transactions?

A multi-vendor checkout can perform several dependent database operations.

If one operation fails, the previous operations must not remain partially committed.

Transactions provide the required atomic behavior.

---

## Why compare old and new prices?

A notification should represent an actual price reduction.

Therefore:

```text
newPrice < oldPrice
```

is the trigger condition.

Price increases and unchanged prices do not create price-drop notifications.

---

# 🔮 Future Enhancements

Potential future improvements include:

* Production payment gateway
* Real-time order tracking
* WebSocket notifications
* Advanced recommendation engine
* Personalized product ranking
* Fraud detection
* Seller payout automation
* Advanced analytics
* Mobile application
* Delivery route optimization
* Intelligent customer support
* Search ranking improvements

---

# 👩‍💻 Author

## Adama Hansini

**B.Tech — Computer Science and Engineering**

Interested in:

* Software Development
* Full-Stack Development
* Web Technologies
* Artificial Intelligence
* Backend Engineering

---

# 📄 License

This project is developed for **academic, portfolio, learning, and demonstration purposes**.

---

# ⭐ Final Note

ShopSphere is not designed merely as a product-listing application.

It demonstrates how a multi-vendor marketplace can handle:

```text
Users
  ↓
Authentication
  ↓
Role-Based Access
  ↓
Stores
  ↓
Products
  ↓
AI Classification
  ↓
Inventory
  ↓
Multi-Vendor Cart
  ↓
Atomic Checkout
  ↓
Rollback
  ↓
Orders
  ↓
Delivery
  ↓
Reviews
  ↓
Returns
  ↓
Support
  ↓
Marketplace Governance
```

**ShopSphere — One Marketplace. Multiple Sellers. One Seamless Shopping Experience.**
