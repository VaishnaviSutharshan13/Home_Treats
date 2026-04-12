# Server

Express + TypeScript API for the HostelMng application.

## Development

1. Copy `.env.example` to `.env` and populate `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies: `npm install`.
3. Run `npm run dev` to start the server with auto‑reload.

Default base URL: `http://localhost:5000`. JSON APIs are under `/api`.

**Postman:** Import [`postman/Home_Treats_API.postman_collection.json`](postman/Home_Treats_API.postman_collection.json). Collection variables include `baseUrl`, `hostUrl`, and `token` (filled automatically after a successful **Auth → Login** request). To regenerate the file after API changes, run `node postman/generate-collection.mjs`.

## Authentication

Most routes expect a header:

`Authorization: Bearer <jwt_token>`

Omit the header only on routes marked **Public** below. Role expectations:

- **Admin** — `role: admin` in the token.
- **Student** — `role: student`, account approved (not pending/rejected), per middleware.
- **Any user** — valid JWT; controller may enforce extra rules.

---

## Models and seed data

**Seeding:** This repository does not include a database seed JSON file or seed script. If you import data manually (e.g. from MongoDB Compass or a JSON dump), align field shapes and enums with the Mongoose schemas in `src/models/`.

**Complexity and overlap (common sources of import / runtime issues):**

| Area | Note |
|------|------|
| **User vs Student** | `User` is used for auth (login, JWT). `Student` is a separate collection for hostel records. Registration and admin flows keep them in sync, but raw JSON imports can easily reference the wrong collection or miss one side. |
| **Emergency contact** | `User` uses a flat string `emergencyContact`. `Student` uses a nested object `{ name, phone, relationship }`. The same logical field has different shapes — do not assume one JSON fits both. |
| **Status fields** | `User` has both `status` and `approvalStatus` with overlapping enums. `Fee` has both `status` and `paymentStatus` with overlapping enums. Imports should set these consistently. |
| **Room capacity** | Create-room validation allows capacity 1–10; update-room validation allows 1–6. Very high capacities in seed data may fail on update. |
| **Strict enums** | `Room` (`block`, `floor`, `type`, `facilities`), `Student` (`course`, `year`), `Fee` (`feeType`, `paymentMethod`), `Complaint` (`category`, …), and `Payment` (`bankName`) only accept listed enum values — typos in JSON cause validation errors. |
| **Notifications** | Route validation allows `recipientType` values like `selected_students`; stored documents use model enums such as `single_student` / `all_students`. The controller maps requests — use the API or match controller logic when seeding. |

None of the above is a “TypeScript complexity” bug by itself; problems usually appear when **seed JSON does not match schema enums and shapes**, or when **User and Student documents are out of sync**.

---

## API endpoints

All paths are relative to `/api` unless noted. **Public** means no JWT required.

### Health

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/health` | Public | API health check |

### Auth — `/api/auth`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/auth/login` | Public | Login (`email` / `studentId` / `identifier` + `password`) |
| POST | `/api/auth/register` | Public | Student self-registration |
| GET | `/api/auth/verify` | Any user\* | Validate JWT; returns user payload (`Authorization` required) |
| POST | `/api/auth/refresh` | Any user\* | Refresh JWT |
| POST | `/api/auth/logout` | Public | Logout (client clears token) |
| POST | `/api/auth/forgot-password` | Public | Request password reset |
| POST | `/api/auth/reset-password` | Public | Reset password with token |
| GET | `/api/auth/profile` | Any user | Profile (legacy shape; raw `User` document) |
| PUT | `/api/auth/profile` | Any user | Update profile (legacy fields) |

\*`verify` / `refresh` expect `Authorization: Bearer …`.

### Profile — `/api/profile`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/profile` | Any user | Current user profile (enriched: booking, student fields) |
| PUT | `/api/profile` | Any user | Update name, phone, gender, address, password |
| PUT | `/api/profile/image` | Any user | Upload profile image (`multipart/form-data`, field `profileImage`) |

### Students — `/api/students`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/students` | Admin | List students |
| GET | `/api/students/pending` | Admin | Pending approvals |
| GET | `/api/students/approvals` | Admin | Same as pending (alias) |
| GET | `/api/students/search/:query` | Admin | Search |
| PUT | `/api/students/:id/approve` | Admin | Approve |
| PUT | `/api/students/:id/reject` | Admin | Reject |
| PUT | `/api/students/:id/inactivate` | Admin | Inactivate |
| PUT | `/api/students/:id/activate` | Admin | Activate |
| GET | `/api/students/:id` | Any user | Student by MongoDB id (middleware: auth only) |
| POST | `/api/students` | Admin | Create student |
| PUT | `/api/students/:id` | Admin | Update student |

### Rooms — `/api/rooms`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/rooms` | Admin or approved student | List rooms |
| GET | `/api/rooms/:id` | Admin or approved student | Room by id |
| POST | `/api/rooms` | Admin | Create (`multipart/form-data`, optional `image`) |
| PUT | `/api/rooms/:id` | Admin | Update (optional `image`) |
| DELETE | `/api/rooms/:id` | Admin | Delete room |
| PUT | `/api/rooms/:id/allocate` | Admin | Allocate to student |
| PUT | `/api/rooms/:id/vacate` | Admin | Vacate room |

### Complaints — `/api/complaints`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/complaints` | Admin | All complaints |
| GET | `/api/complaints/user` | Admin or approved student | Current user’s complaints |
| GET | `/api/complaints/student/:studentId` | Admin or approved student | By student id string |
| GET | `/api/complaints/:id` | Any user | Single complaint (access rules in controller) |
| POST | `/api/complaints` | Approved student | Create complaint |
| PUT | `/api/complaints/:id` | Admin or approved student | Update |
| DELETE | `/api/complaints/:id` | Admin or approved student | Delete |
| PUT | `/api/complaints/:id/assign` | Admin | Assign |
| PUT | `/api/complaints/:id/resolve` | Admin | Resolve / reject |
| POST | `/api/complaints/:id/comment` | Any user | Add comment |

### Fees — `/api/fees`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/fees` | Admin | All fees |
| GET | `/api/fees/revenue` | Admin | Revenue report |
| GET | `/api/fees/unpaid` | Admin | Unpaid students |
| GET | `/api/fees/report/:year/:month` | Admin | Monthly report |
| GET | `/api/fees/my-fees` | Approved student | Current student’s fees |
| GET | `/api/fees/student/:studentId` | Admin or approved student | Fees by student id |
| GET | `/api/fees/:id/receipt` | Any user | Receipt for paid/partial fee |
| GET | `/api/fees/:id` | Any user | Fee by id |
| POST | `/api/fees/create` | Admin | Create fee |
| POST | `/api/fees` | Admin | Create fee (alias) |
| PUT | `/api/fees/:id` | Admin | Update fee |
| DELETE | `/api/fees/:id` | Admin | Delete fee |
| PUT | `/api/fees/:id/pay` | Admin | Mark paid / payment fields |

### Bookings — `/api/bookings`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/bookings/confirm` | Student | Confirm / create booking |
| GET | `/api/bookings/my-booking` | Student | Current student’s booking |
| GET | `/api/bookings/admin` | Admin | All bookings |
| PUT | `/api/bookings/:id/status` | Admin | Set status `Confirmed` / `Cancelled` |

### Payments — `/api/payments`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/payments` | Approved student | Submit payment (`multipart/form-data`, field `slip`) |
| GET | `/api/payments/student` | Approved student | Student’s payments |
| GET | `/api/payments/admin` | Admin | All payments |
| PUT | `/api/payments/:id` | Admin | Update status |
| DELETE | `/api/payments/:id` | Admin | Delete payment |

### Notifications — `/api/notifications`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| POST | `/api/notifications` | Admin | Create / broadcast notifications |
| GET | `/api/notifications` | Any user | List (query params supported in controller) |
| GET | `/api/notifications/unread-count` | Any user | Unread count |
| PUT | `/api/notifications/mark-all-read` | Any user | Mark all read |
| PUT | `/api/notifications/:id/read` | Any user | Mark one read |
| DELETE | `/api/notifications/clear` | Any user | Clear all (for current user scope) |
| DELETE | `/api/notifications/:id` | Any user | Hide single notification |

### Admin dashboard — `/api/admin`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/admin/stats` | Admin | Dashboard stats |
| GET | `/api/admin/activities` | Admin | Activities |
| GET | `/api/admin/revenue-monthly` | Admin | Monthly revenue |
| GET | `/api/admin/room-occupancy` | Admin | Occupancy |
| GET | `/api/admin/recent-students` | Admin | Recent students |
| GET | `/api/admin/health` | Admin | Admin health check |
| POST | `/api/admin/backup` | Admin | Backup trigger |

### Admin activity logs — `/api/admin-logs`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/admin-logs` | Admin | Paginated admin logs |

### Settings — `/api/settings`

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/settings/hero-image` | Public | Current hero image URL |
| POST | `/api/settings/hero-image` | Admin | Upload hero image (`multipart/form-data`, field `heroImage`) |

### Static files

| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/uploads/...` | Public | Uploaded assets (profile images, room images, payment slips, etc.) |

---

## Structure

```
server/src/
  config/        # db, other configuration
  controllers/   # request handlers
  models/        # Mongoose schemas
  routes/        # express routers
  middleware/    # custom middleware functions
  utils/         # helper utilities
  index.ts       # entry point
```

## Production

```bash
npm run build
npm start
```

Runs `node dist/index.js` on `PORT` from `.env` (default `5000`).
