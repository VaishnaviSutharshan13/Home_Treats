# Hostel Management System

A full-stack **MERN** (MongoDB, Express, React, Node.js) application for managing hostel operations including students, rooms, fees, and complaints.

---

## Project Structure

```
hostel-management-system/
├── package.json              # Root scripts (concurrently)
├── README.md
│
├── client/                   # React Frontend (Vite + TypeScript + Tailwind)
│   ├── public/
│   ├── src/
│   │   ├── assets/           # Images, icons, static files
│   │   ├── components/
│   │   │   ├── common/       # Navbar, Footer, ProtectedRoute
│   │   │   ├── layout/       # DashboardLayout, Sidebar
│   │   │   └── ui/           # Button, Card, Modal, Input, Badge
│   │   ├── context/          # AuthContext (authentication state)
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/
│   │   │   ├── admin/        # Dashboard, StudentManagement, RoomManagement, etc.
│   │   │   ├── auth/         # Login, Register, ForgotPassword
│   │   │   └── student/      # StudentDashboard, Profile
│   │   ├── services/         # API client & service functions
│   │   ├── styles/           # Global CSS & design system
│   │   └── utils/            # Utility/helper functions
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.cjs
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── server/                   # Node.js + Express Backend (TypeScript)
    ├── src/
    │   ├── config/           # Database connection (database.ts)
    │   ├── controllers/      # Business logic
    │   │   ├── authController.ts
    │   │   ├── studentController.ts
    │   │   ├── roomController.ts
    │   │   ├── feesController.ts
    │   │   ├── complaintController.ts
    │   │   └── adminController.ts
    │   ├── middleware/        # Auth middleware, error handler
    │   ├── models/           # Mongoose schemas
    │   │   ├── Student.ts
    │   │   ├── Room.ts
    │   │   ├── Fee.ts
    │   │   └── Complaint.ts
    │   ├── routes/           # Express route definitions
    │   │   ├── authRoutes.ts
    │   │   ├── studentRoutes.ts
    │   │   ├── roomRoutes.ts
    │   │   ├── feesRoutes.ts
    │   │   ├── complaintRoutes.ts
    │   │   └── adminRoutes.ts
    │   └── index.ts          # Server entry point
    ├── .env
    ├── package.json
    └── tsconfig.json
```

---

## Tech Stack

| Layer      | Technology                               |
| ---------- | ---------------------------------------- |
| Frontend   | React 19, Vite, TypeScript, Tailwind CSS |
| Backend    | Node.js, Express 5, TypeScript           |
| Database   | MongoDB + Mongoose                       |
| Auth       | JWT + bcryptjs                           |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** running locally or a MongoDB Atlas URI

### Installation

```bash
# Install all dependencies (root + client + server)
npm run install-all
```

### Environment Variables

**server/.env**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_management
JWT_SECRET=your_secret_key
NODE_ENV=development
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
```

### Running the App

```bash
# Run both frontend & backend together
npm run dev

# Run only the backend
npm run server

# Run only the frontend
npm run client
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)

---

## Features

### Student Management
- Student registration and profile management
- Room allocation tracking
- Academic records

### Room Management
- Room availability tracking
- Room allocation / vacate system
- Maintenance scheduling

### Fees Management
- Fee structure management
- Payment tracking & history
- Revenue reporting

### Complaint Management
- Complaint submission & tracking
- Priority & category assignment
- Resolution workflow

---

## API Endpoints

| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| POST   | `/api/auth/login`              | Login                  |
| POST   | `/api/auth/register`           | Register               |
| GET    | `/api/students`                | Get all students       |
| POST   | `/api/students`                | Create student         |
| PUT    | `/api/students/:id`            | Update student         |
| DELETE | `/api/students/:id`            | Delete student         |
| GET    | `/api/rooms`                   | Get all rooms          |
| POST   | `/api/rooms`                   | Create room            |
| PUT    | `/api/rooms/:id/allocate`      | Allocate room          |
| GET    | `/api/fees`                    | Get all fees           |
| PUT    | `/api/fees/:id/pay`            | Record payment         |
| GET    | `/api/complaints`              | Get all complaints     |
| PUT    | `/api/complaints/:id/resolve`  | Resolve complaint      |
| GET    | `/api/admin/stats`             | Dashboard statistics   |

---

## Demo Credentials

| Role    | Email              | Password   |
| ------- | ------------------ | ---------- |
| Admin   | admin@hostel.com   | admin123   |
| Student | student@hostel.com | student123 |

---

## License

MIT
