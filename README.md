# DiagnoSync - AI Healthcare System MVP

A fully functional React-based MVP for the 7-Day Interim Presentation of the AI-Based Personalized Treatment Recommendation System.

## 📋 Project Overview

This is a complete, ready-to-run implementation of the core healthcare platform with:
- **10+ Fully Functional Pages**
- **Two User Roles** (Patient & Doctor)
- **Authentication System** (Mock)
- **Responsive Design** (Mobile & Desktop)
- **Mock Data Integration**
- **Professional UI/UX** (Tailwind CSS)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Installation & Setup (3 Steps)

#### Step 1: Clone/Download the Project
```bash
cd healthcare-system-mvp
```

#### Step 2: Install Dependencies
```bash
npm install
```

#### Step 3: Start the Development Server
```bash
npm start
```

The application will automatically open in your browser at `http://localhost:3000`

---

## 🌐 Pages Included

### Public Pages
1. **Landing Page** (`/`)
   - Hero section with CTA
   - Feature showcase
   - How it works section
   - Footer with links

2. **Sign Up** (`/signup`)
   - Form validation
   - Role selection (Patient/Doctor)
   - Password strength check

3. **Sign In** (`/signin`)
   - Email & password login
   - Role-based authentication
   - Demo credentials provided

4. **Password Reset** (`/password-reset`)
   - Email-based password reset
   - Confirmation workflow

### Patient Pages

5. **Patient Dashboard** (`/patient/dashboard`)
   - Quick stats cards
   - Upcoming appointments
   - Quick action buttons
   - Health alerts
   - Patient-specific navbar

6. **Symptom Checker** (`/patient/symptom-checker`)
   - Interactive NLP chatbot
   - Symptom analysis
   - Treatment recommendations
   - Results display

7. **Treatment Recommendations** (`/patient/treatment-recommendations`)
   - Personalized treatment plans
   - Multiple conditions
   - Detailed recommendations
   - Doctor notes

8. **Appointment Booking** (`/patient/appointments`)
   - Doctor selection
   - Calendar date picker
   - Time slot selection
   - Booking confirmation

### Doctor Pages

9. **Doctor Dashboard** (`/doctor/dashboard`)
   - Key performance metrics
   - Today's appointments list
   - Urgent cases widget
   - Quick action buttons

10. **Patient List** (`/doctor/patients`)
    - Search & filter patients
    - Patient cards with details
    - Quick action buttons
    - Contact information

11. **Drug Interaction Checker** (`/doctor/drug-checker`)
    - Drug search with autocomplete
    - Interaction detection
    - Severity levels
    - Alternative suggestions

---

## 📱 Demo Credentials

**Patient Login:**
- Email: `patient@demo.com`
- Password: `password123`

**Doctor Login:**
- Email: `doctor@demo.com`
- Password: `password123`

You can also create new accounts on the Sign Up page.

---

## 🎨 Tech Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Navigation
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts and graphs

### Development
- **Vite** - Fast development server
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

---

## 📂 Project Structure

```
healthcare-system-mvp/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx
│   │   ├── SignUp.jsx
│   │   ├── SignIn.jsx
│   │   ├── PasswordReset.jsx
│   │   ├── PatientDashboard.jsx
│   │   ├── SymptomChecker.jsx
│   │   ├── TreatmentRecommendations.jsx
│   │   ├── AppointmentBooking.jsx
│   │   ├── DoctorDashboard.jsx
│   │   ├── PatientList.jsx
│   │   ├── DrugInteractionChecker.jsx
│   │   └── NotFound.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 🔐 Authentication

The system uses **localStorage** for mock authentication:

```javascript
// Login
localStorage.setItem('isAuthenticated', 'true')
localStorage.setItem('userRole', 'patient') // or 'doctor'
localStorage.setItem('currentUser', JSON.stringify(userData))

// Check if authenticated
const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
const userRole = localStorage.getItem('userRole')
```

All authentication is **client-side only** for this MVP.

---

## 💾 Data Persistence

The application uses **localStorage** to persist:
- Login status
- User role
- User data
- Form submissions

**Note:** All data resets when localStorage is cleared or browser cache is emptied.

---

## 🎯 User Flows

### Patient Flow
```
Landing → Sign Up → Patient Dashboard → 
  ├─ Symptom Checker → Treatment Recommendations
  ├─ Book Appointment
  └─ View Prescriptions
```

### Doctor Flow
```
Landing → Sign In → Doctor Dashboard →
  ├─ My Patients → Patient List → Patient Details
  ├─ Drug Interaction Checker
  └─ Manage Appointments
```

---

## 🎨 Color Scheme

The application uses a professional healthcare color palette:
- **Primary Blue**: `#0066FF` - Main actions
- **Secondary Cyan**: `#00D4FF` - Accents
- **Success Green**: `#00B341` - Positive actions
- **Warning Orange**: `#FFB700` - Cautions
- **Danger Red**: `#FF3333` - Alerts

---

## 📦 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests (when configured)
npm test

# Eject Webpack config (not recommended)
npm run eject
```

---

## 🚀 Deployment

To deploy this application:

### Option 1: Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages
Update `vite.config.js`:
```javascript
export default {
  base: '/healthcare-system-mvp/',
  // ... rest of config
}
```

Then: `npm run build` and deploy the `dist` folder.

---

## 🐛 Features Included

✅ Responsive design (mobile, tablet, desktop)
✅ Navigation between pages
✅ Form validation
✅ Mock authentication
✅ Data persistence (localStorage)
✅ Professional UI components
✅ Interactive elements
✅ Smooth animations
✅ Icon integration
✅ Error pages

---

## ⚠️ Limitations (MVP)

This is a frontend-only MVP. The following are NOT included:

❌ Real backend API
❌ Real database
❌ Real NLP chatbot (hardcoded responses)
❌ Real ML models
❌ Email notifications
❌ Payment integration
❌ Video conferencing
❌ File uploads

These will be implemented in the full development phase.

---

## 🔧 Customization

### Change Colors
Edit `tailwind.config.js`:
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
1. Create file: `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`
3. Add navigation link

### Modify Layout
- Edit Navbar in each page
- Modify sidebar in components
- Adjust padding/margins in Tailwind classes

---

## 📚 Learning Resources

- **React Docs**: https://react.dev
- **React Router**: https://reactrouter.com
- **Tailwind CSS**: https://tailwindcss.com
- **Vite**: https://vitejs.dev

---

## 🤝 Contributing

This is an MVP for a 7-day presentation. For the full development:

1. Implement real backend (Node.js + Express)
2. Set up database (PostgreSQL)
3. Integrate NLP for chatbot
4. Implement ML models
5. Add payment processing
6. Set up video conferencing
7. Deploy to production

---

## 📝 Notes

- All data is stored in browser localStorage
- No real authentication (for demo purposes)
- No API calls (everything is mocked)
- No database connectivity
- All interactions are client-side only

---

## 🎉 Ready to Present!

This application is fully functional and ready for the 7-day interim presentation. All 10+ core pages are implemented with working navigation, forms, and user flows.

**Happy Presenting!** 🚀

---

## 📞 Support

For issues or questions about the code:
1. Check the code comments
2. Review the project structure
3. Test with demo credentials
4. Check browser console for errors

---

## 📄 License

This is a student project for educational purposes.

---

## 🎯 Next Steps After Presentation

1. **Week 2-3**: Implement backend (Node.js + Express)
2. **Week 4-5**: Set up database (PostgreSQL)
3. **Week 6**: Integrate real APIs
4. **Week 7-8**: Add advanced features
5. **Week 9-10**: Testing and deployment

---

**Version**: 1.0.0 MVP
**Last Updated**: March 2024
**Status**: Ready for 7-Day Presentation ✅
