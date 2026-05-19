# DiagnoSync - AI Based Individualized Health Management System

AI-Based Personalized Treatment Recommendation System.

## Project Overview

This is the complete frontend implementation of the DiagnoSync healthcare platform. It provides a state-of-the-art cinematic UI, role-based dashboards, and interactive health widgets. The client application connects directly to the Node.js Express backend to deliver secure and responsive healthcare workflows.

### Core Architecture Features
- Three User Roles: Patient, Doctor, and Administrator.
- Authentication System: JSON Web Token (JWT) based authentication with role-based protected routes.
- Responsive Layouts: Fully responsive design across mobile, tablet, and desktop viewports.
- Real-Time Integration: Direct connection to MongoDB Atlas database API services.
- Clean Modern UI: Styled with Tailwind CSS, custom components, and smooth page transitions.

---

## Quick Start

### Prerequisites
- Node.js 14 or higher installed
- npm or yarn package manager

### Installation and Setup

#### Step 1: Clone/Download the Project
Go into the project folder:
```bash
cd DiagnoSync_Project
```

#### Step 2: Install Dependencies
Install all required Node packages:
```bash
npm install
```

#### Step 3: Start the Development Server
Run the local Vite server:
```bash
npm start
```

The application will automatically start and open in your default browser at http://localhost:3000

---

## Pages Included

### Public Pages
1. **Landing Page** (/)
   - Interactive hero introduction section
   - Features showcase
   - Multi-role platform workflow explanation
2. **Sign Up** (/signup)
   - Account creation forms
   - Live password strength validation
   - Role selection for Patients and Doctors
3. **Sign In** (/signin)
   - Email and password verification
   - Secure login generating JWT authentication
4. **Password Reset** (/password-reset)
   - Request reset links via registered email address
   - Verification token confirmation workflow

### Patient Dashboard and Management
5. **Patient Dashboard** (/patient/dashboard)
   - Calculated health score overview and breakdown
   - Quick access tabs for scheduling and chatbot
   - Upcoming appointments alerts
6. **Patient Profile** (/patient/profile)
   - View current personal physical profiles
   - Edit medical history, lifestyle factors, and emergency contacts
7. **Patient Onboarding** (/patient/registration)
   - Interactive wizard to input initial health profiles
8. **Symptom Checker** (/patient/symptom-checker)
   - AI-powered chat session to log current health complaints
9. **Treatment Recommendations** (/patient/treatment-recommendations)
   - View recommended therapies, medications, and self-care plans
10. **Appointment Booking** (/patient/appointments)
    - Browse available verified doctors, select dates, and choose open slots
11. **My Appointments** (/patient/my-appointments)
    - Consolidated history of past visits and future bookings
12. **Prescription Page** (/patient/prescriptions)
    - View active and historical medication sheets issued by clinicians
13. **Medical Reports** (/patient/reports)
    - Upload and categorize PDF/image laboratory records
14. **Payment Page** (/patient/payment/:appointmentId)
    - Complete booking process with secure invoice review

### Doctor Workspace
15. **Doctor Dashboard** (/doctor/dashboard)
    - Active slots counter, consultation count, and average rating
    - Urgent patient alert widgets
16. **Doctor Profile** (/doctor/profile)
    - Edit consultation fees, languages, and biography
17. **Doctor Registration** (/doctor/registration)
    - Multi-step credential verify form with medical license and diploma document upload
18. **Patient List** (/doctor/patients)
    - View, search, and audit patient medical history and metrics
19. **Doctor Appointments** (/doctor/appointments)
    - Daily appointment list, check-in controls, and treatment planner
20. **Drug Interaction Checker** (/doctor/drug-checker)
    - Auto-complete search to identify adverse risks and contraindications between drug groups
21. **Doctor Analytics** (/doctor/analytics)
    - Practice performance insights and metrics charts

### Administrator Portal
22. **Admin Dashboard** (/admin/dashboard)
    - High-level platform stats (Total Users, Registered Doctors, Active Sessions)
23. **User Management** (/admin/users)
    - Search, audit, and activate/deactivate accounts
24. **Doctor Verification** (/admin/doctors/verify)
    - Approve or reject pending physician credentials
25. **Appointment Management** (/admin/appointments)
    - View and cancel scheduled visits globally
26. **Admin Analytics** (/admin/analytics)
    - System response speeds and live API logs monitor

---

## Tech Stack

### Client Framework
- React 18 (UI framework)
- React Router v6 (Client-side routing)
- Tailwind CSS (CSS utility framework)
- Lucide React (SVG illustration shapes)
- Recharts (Data analytics visualization)

### Build Tools
- Vite (Asset compiler and dev server)
- PostCSS and Autoprefixer (Styling optimization)

---

## User Flows

### Patient Flow
```
Landing -> Sign Up -> Patient Onboarding -> Patient Dashboard
  ├─ Symptom Checker -> AI Recommendation Engine
  ├─ Doctor Listing -> Schedule -> Book Appointment -> Payment
  ├─ Upload Lab Report -> Medical Reports
  └─ View Prescriptions
```

### Doctor Flow
```
Landing -> Sign Up -> Doctor Onboarding -> Admin Verification (Pending) -> Approved
  └─ Doctor Dashboard
       ├─ Patient List -> View Patient Profile & Vitals
       ├─ Appointment Schedule -> Consult -> Write Prescription
       └─ Drug Interaction Checker
```

### Admin Flow
```
Sign In -> Admin Dashboard
  ├─ User Management -> Deactivate/Activate User Accounts
  ├─ Doctor Verification -> Review Uploaded Licenses -> Verify Doctor Profile
  ├─ Appointment Auditing
  └─ System Logs & Analytics Monitor
```

---

## Available Scripts

In the project directory, you can run:

```bash
# Start development server
npm start

# Build for production deployment
npm run build

# Run unit and integration tests
npm test
```

---

## Features Included

- Page-to-page navigation using client-side router
- Inline form validation and strength assessment
- Session persistence matching backend JWT lifespans
- Highly professional dark-mode glassmorphic styling
- Multi-step stepper wizards for onboarding and registration
- Chart integrations for statistics and analytics

---

## Customization

### Change Colors
Edit the tailwind.config.js file:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#YourColor',
      // ...
    }
  }
}
```

### Add New Pages
1. Create a page component under src/pages/YourPage.jsx
2. Mount the route path under Routes in src/App.jsx
3. Add the navigation links inside your navigation menus

---

## Learning Resources

- React Documentation: https://react.dev
- React Router Documentation: https://reactrouter.com
- Tailwind CSS Documentation: https://tailwindcss.com
- Vite Documentation: https://vitejs.dev

---

## License

This is a student project for educational purposes.

Version: 2.0.0
Last Updated: May 2026
