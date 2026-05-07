🏙️ CityFix
 
CityFix is a full-stack civic issue reporting platform that enables citizens to report urban problems such as potholes, broken streetlights, garbage overflow, and more. Administrators can monitor, manage, and resolve reported issues through a powerful dashboard.
 
---
 
## 🚀 Live Demo
 
### Frontend
https://city-fix.vercel.app
 
### Backend API
https://city-fix-api.onrender.com/api
 
---
 
# ✨ Features
 
## 🔐 Authentication
- User registration with email verification
- JWT-based authentication
- Login & logout
- Forgot/reset password functionality
 
## 👥 Role Management
### Citizen
- Report issues
- Manage personal reports
 
### Admin
- View all reported issues
- Promote/Demote users
- Access analytics dashboard
 
---
 
## 📍 Issue Reporting
- Title & description
- Category & priority
- Date & location
- Interactive map pinning (Leaflet)
- Optional image upload via Cloudinary
 
---
 
## 📊 Admin Dashboard
- KPI cards
- 7-day trend charts
- Category-based analytics
- Average resolution time tracking
- User management
- Issue management table
 
---
 
## 🌙 Additional Features
- Dark mode support
- CSV export
- Responsive design
- Loading skeletons
- Activity logs/status history
 
---
 
# 🛠️ Tech Stack
 
## Frontend
- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Leaflet
- Recharts
- Lucide React
 
## Backend
- Node.js
- Express.js
- PostgreSQL (Neon)
- Prisma ORM
- JWT
- bcryptjs
- Nodemailer (Brevo)
 
## Deployment
- Vercel (Frontend)
- Render (Backend)
- Neon (Database)
- Cloudinary (Image Storage)
 
---
 
# 📁 Project Structure
 
```bash
city-fix/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── Layout.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── .env
│   └── package.json
│
├── backend/
│   ├── prisma/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── README.md
```
 
---
 
# ⚙️ Local Setup
 
## 📌 Prerequisites
- Node.js v18+
- PostgreSQL Database (Neon recommended)
- Cloudinary account
- Brevo account
 
---
 
# 🔧 Backend Setup
 
```bash
cd backend
 
cp .env.example .env
 
npm install
 
npx prisma migrate dev --name init
 
npm run dev
```
 
---
 
# 🎨 Frontend Setup
 
```bash
cd frontend
 
cp .env.example .env
```
 
Add:
 
```env
VITE_API_URL=http://localhost:5000/api
```
 
Then run:
 
```bash
npm install
 
npm run dev
```
 
---
 
# 🌍 Environment Variables
 
## Backend `.env`
 
```env
DATABASE_URL=
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FRONTEND_URL=
```
 
## Frontend `.env`
 
```env
VITE_API_URL=https://city-fix-two.vercel.app/
```
 
---
 
# 🚢 Deployment
 
## Backend (Render)
 
### Build Command
```bash
npm install
```
 
### Start Command
```bash
npm start
```
 
Add all required environment variables in Render dashboard.
 
---
 
## Frontend (Vercel)
 
Set environment variable:
 
```env
VITE_API_URL=https://city-fix-38wq.onrender.com/api
```
 
Deploy frontend from:
```bash
frontend/
```
 
---
 
# 👑 Create First Admin
 
## Option 1 — Prisma Studio
 
```bash
npx prisma studio
```
 
Change user role from:
```txt
citizen → admin
```
 
---
 
## Option 2 — SQL Query
 
```sql
UPDATE "User"
SET role = 'admin'
WHERE email = 'you@example.com';
```
 
---
 
# 📡 API Endpoints
 
## Authentication
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| GET | `/api/auth/verify-email` | Verify email |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |
 
---
 
## Issues
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues` | Get issues |
| POST | `/api/issues` | Create issue |
| PATCH | `/api/issues/:id` | Update issue status |
| DELETE | `/api/issues/:id` | Delete issue |
 
---
 
## Users
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/issues/users` | Get users |
| PATCH | `/api/issues/users/:userId/role` | Change user role |
 
---
 
## Profile
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get profile |
| PUT | `/api/user/profile` | Update profile |
| PUT | `/api/user/change-password` | Change password |
 
---
 
## Admin
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
 
---
 
# 🧪 API Testing
 
Example request:
 
```bash
curl -X POST https://your-backend.onrender.com/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name":"Test","email":"test@example.com","password":"123456"}'
```
 
---
 
# 🔒 Protected Routes
 
All protected endpoints require:
 
```txt
Authorization: Bearer <token>
```
 
---
 
# 📸 Screenshots
 
Add screenshots here:
 
```md
![Home Page](./screenshots/home.png)
```
 
---
 
# 📄 License
 
This project is open-source and free to use for educational purposes.
 
---
 
# 🙌 Acknowledgements
 
- Leaflet & OpenStreetMap
- Cloudinary
- Brevo
- Recharts
- Lucide React
 
---
 
# ❤️ Built For Better Cities
 
CityFix helps bridge the gap between citizens and city authorities through technology.
