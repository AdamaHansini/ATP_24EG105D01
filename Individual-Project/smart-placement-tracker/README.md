# 🎓 Smart Placement Tracker

> A full-stack web portal for college **Training & Placement Offices (TPO)** to manage end-to-end campus recruitment drives — from company listings and student eligibility filtering to multi-round interview tracking and automated email notifications.

**🌐 Live Demo:** [smart-placement-tracker-adamahansinis-projects.vercel.app](https://smart-placement-tracker-adamahansinis-projects.vercel.app)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [User Roles](#-user-roles)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Workflow](#-workflow)
- [Deployment](#-deployment)

---

## 🧭 Overview

Smart Placement Tracker digitalises the entire campus placement process. Three types of users — **Admin**, **TPO**, and **Student** — interact with the platform through role-specific dashboards. TPOs create and manage recruitment drives, Admins approve them, and Students apply and track their progress in real time.

---

## ✨ Features

### 🏢 Company & Drive Management
- TPO can create placement drives with company name, job role, package, eligible branches, minimum CGPA, drive date, location, and description
- Drives go through an **Admin approval workflow** before being visible to students
- TPO can edit or delete their own drives at any time

### 🔍 Student Eligibility Filtering
- Students can filter drives by **branch** and **minimum package**
- The backend automatically enforces CGPA and branch eligibility rules — ineligible students cannot apply
- Applied companies are visually distinguished from unapplied ones

### 📄 Interview Round Tracking (2-Round System)

| Round | Action | Who |
|-------|--------|-----|
| **Round 1** | Student submits resume URL | Student |
| **Round 1 Review** | TPO approves or rejects resume | TPO |
| **Round 2 Invite** | Automatic — triggered on Round 1 approval | System |
| **Round 2** | Student answers 2 HR communication questions | Student |
| **Round 2 Evaluation** | TPO evaluates written answers | TPO |
| **Final Decision** | TPO marks student as Placed or Not Placed | TPO |

### 📧 Automated Email Notifications
- Sent automatically at every status transition (fire-and-forget, non-blocking)
- **Round 1 Approved** → Student notified with Round 2 invitation and HR questions
- **Round 1 Rejected** → Student notified with encouragement message
- **Round 2 Evaluation** → Student notified of result (approved/rejected)
- **Placed** → Student receives congratulatory email with company, role, and package details
- **Not Placed** → Supportive email sent to student

### 📊 Real-Time Dashboard
- Stat cards showing total drives, applications, placed students
- Role-specific views — TPOs see their pipeline, students see their applications
- Application status tracked through colour-coded badges

### 🔐 Authentication & Authorization
- JWT-based authentication with persistent login (localStorage)
- Protected routes enforced on both frontend (React) and backend (Express middleware)
- Role-based access: `admin`, `tpo`, `student`

### 🏅 Placement Result Notifications (Student Portal)
- First-time popup modal when a placement result is available
- Celebratory animation for placed students; motivational message for others
- Notification state tracked in localStorage to avoid repeat popups

### ✅ Admin Drive Approvals
- Admin sees a dedicated approvals page with Pending / Approved / Rejected tabs
- Can approve (publish to students) or reject drives with an optional reason
- Stats cards show count per status at a glance

---

## 👤 User Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | Approve or reject placement drives submitted by TPOs |
| **TPO** | Create drives, review applications, manage interview rounds, make placement decisions |
| **Student** | View eligible drives, apply with resume, answer Round 2 HR questions, track status |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client |
| **React Hot Toast** | Toast notifications |
| **Tailwind CSS v3** | Utility-first styling |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Email delivery via Gmail SMTP |
| **express-validator** | Request validation |

### Deployment
| Service | Role |
|---------|------|
| **Vercel** | Frontend hosting (static) |
| **Render / Railway** | Backend hosting (Node.js server) |
| **MongoDB Atlas** | Cloud database |

---

## 📁 Project Structure

```
smart-placement-tracker/
├── frontend/                        # React + Vite app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login screen
│   │   │   ├── RegisterPage.jsx     # Registration (role selection)
│   │   │   ├── DashboardPage.jsx    # Role-aware stats dashboard
│   │   │   ├── CompaniesPage.jsx    # Browse & filter drives
│   │   │   ├── CompanyDetailPage.jsx# Drive detail + TPO review panel
│   │   │   ├── AddCompanyPage.jsx   # Create new drive (TPO only)
│   │   │   ├── ApplicationsPage.jsx # Student application tracker
│   │   │   ├── StudentsPage.jsx     # Student roster (TPO only)
│   │   │   └── AdminApprovalsPage.jsx # Drive approvals (Admin only)
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top navigation bar
│   │   │   ├── Sidebar.jsx          # Role-based side navigation
│   │   │   ├── ProtectedRoute.jsx   # Auth + role guard wrapper
│   │   │   ├── CompanyCard.jsx      # Drive listing card
│   │   │   ├── StudentRow.jsx       # Student table row
│   │   │   └── RoundBadge.jsx       # Status badge component
│   │   ├── App.jsx                  # Route definitions
│   │   ├── main.jsx                 # React entry point
│   │   └── index.css                # Global styles & design tokens
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # Express.js API
│   ├── config/
│   │   ├── db.js                    # MongoDB connection
│   │   └── nodemailer.js            # Email transporter setup
│   ├── controllers/
│   │   ├── authController.js        # Register & login
│   │   ├── companyController.js     # Drive CRUD + approve/reject
│   │   ├── applicationController.js # Application lifecycle handlers
│   │   └── studentController.js     # Student profile management
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT verify + role guards
│   ├── models/
│   │   ├── User.js                  # User schema (name, email, role)
│   │   ├── Student.js               # Student profile (CGPA, branch, roll)
│   │   ├── Company.js               # Drive schema
│   │   └── Application.js           # Application + round tracking schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── applicationRoutes.js
│   │   └── studentRoutes.js
│   ├── server.js                    # Express entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account (or local MongoDB)
- Gmail account with App Password enabled (for emails)

### 1. Clone the Repository

```bash
git clone https://github.com/AdamaHansini/ATP_24EG105D01.git
cd ATP_24EG105D01/Individual-Project/smart-placement-tracker
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

Create a `.env` file inside `backend/`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/spt
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### 4. Start the Backend Server

```bash
npm run dev      # Development (nodemon)
# or
npm start        # Production
```

Backend runs at: `http://localhost:5000`

### 5. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 6. Configure Frontend Environment

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000
```

### 7. Start the Frontend Dev Server

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 5000) | No |
| `MONGO_URI` | MongoDB Atlas connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for signing JWTs | ✅ Yes |
| `EMAIL_USER` | Gmail address for sending emails | No* |
| `EMAIL_PASS` | Gmail App Password | No* |

> *Email is optional — if credentials are missing, the system skips emails silently and continues functioning.

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login & receive JWT |

### Companies (Drives)
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/companies` | Private | List drives (filtered by role) |
| `POST` | `/api/companies` | TPO | Create new drive |
| `GET` | `/api/companies/:id` | Private | Get drive details |
| `PUT` | `/api/companies/:id` | TPO | Update drive |
| `DELETE` | `/api/companies/:id` | TPO | Delete drive |
| `PUT` | `/api/companies/:id/approve` | Admin | Approve & publish drive |
| `PUT` | `/api/companies/:id/reject` | Admin | Reject drive with reason |

### Applications
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/applications/my` | Student | Get own applications |
| `GET` | `/api/applications/company/:id` | TPO | Get all applicants for a drive |
| `PUT` | `/api/applications/:id/review-round1` | TPO | Approve/reject resume |
| `PUT` | `/api/applications/:id/invite-round2` | TPO | Invite student to Round 2 |
| `POST` | `/api/applications/:id/submit-round2` | Student | Submit HR answers |
| `PUT` | `/api/applications/:id/evaluate-round2` | TPO | Evaluate HR answers |
| `PUT` | `/api/applications/:id/final-decision` | TPO | Mark placed / not placed |

### Students
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/students` | TPO | List all students |
| `GET` | `/api/students/profile` | Student | Get own profile |
| `PUT` | `/api/students/profile` | Student | Update profile |
| `POST` | `/api/students/:id/apply/:companyId` | Student | Apply to a drive |

---

## 🔄 Workflow

```
Admin publishes drive
        ↓
Students browse eligible drives (filtered by CGPA + Branch)
        ↓
Student applies → submits Resume URL  [Round 1 Pending]
        ↓
TPO reviews resume → Approve / Reject
        ├── Rejected → [Round 1 Rejected]  + Email sent
        └── Approved → [Round 1 Approved] → Auto-invite Round 2 + Email sent
                ↓
        Student answers 2 HR questions  [Round 2 Pending → Round 2 Answered]
                ↓
        TPO evaluates answers → Approve / Reject
                ├── Rejected → [Round 2 Rejected] + Email sent
                └── Approved → [Pending Placement] + Email sent
                        ↓
                TPO makes final decision
                        ├── Not Placed → [Rejected] + Email sent
                        └── Placed → [PLACED] 🎉 + Email sent
```

---

## 🚢 Deployment

### Frontend (Vercel)
1. Push `frontend/` to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set root directory to `frontend`
4. Set `VITE_API_URL` as environment variable pointing to your backend URL
5. Deploy — Vercel auto-builds with `npm run build`

### Backend (Render / Railway)
1. Push `backend/` to GitHub
2. Create a new Web Service on [render.com](https://render.com) or [railway.app](https://railway.app)
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all required environment variables
6. Deploy

### Database (MongoDB Atlas)
1. Create a free cluster on [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist all IPs (`0.0.0.0/0`) for cloud deployment
3. Copy the connection string into `MONGO_URI`

---

## 👨‍💻 Author

**Adama Hansini**
- GitHub: [@AdamaHansini](https://github.com/AdamaHansini)
- Project: ATP_24EG105D01 — Individual Project

---

## 📄 License

This project is developed as part of an academic curriculum (ATP Individual Project).
