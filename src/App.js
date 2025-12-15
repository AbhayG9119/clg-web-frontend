import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';

// Lazy load components for code splitting
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Courses = lazy(() => import('./pages/Courses'));
const Eligibility = lazy(() => import('./pages/Eligibility'));
const Faculty = lazy(() => import('./pages/Faculty'));
const FreeCourses = lazy(() => import('./pages/FreeCourses'));
const ComputerBasics = lazy(() => import('./pages/ComputerBasics'));
const EnglishSpeaking = lazy(() => import('./pages/EnglishSpeaking'));
const DigitalMarketing = lazy(() => import('./pages/DigitalMarketing'));
const CareerGuidance = lazy(() => import('./pages/CareerGuidance'));
const PersonalityDevelopment = lazy(() => import('./pages/PersonalityDevelopment'));
const Contact = lazy(() => import('./pages/Contact'));
const NCC = lazy(() => import('./pages/NCC'));
const Scholarship = lazy(() => import('./pages/Scholarship'));
const AdmissionProcess = lazy(() => import('./pages/AdmissionProcess'));
const AdmissionQuery = lazy(() => import('./pages/AdmissionQuery'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const StaffPanel = lazy(() => import('./pages/StaffPanel'));
const StudentPanel = lazy(() => import('./pages/StudentPanel'));
const UploadPhoto = lazy(() => import('./components/Staff Pannel/UploadPhoto'));
const StudentUploadPhoto = lazy(() => import('./components/Student Pannel/UploadPhoto'));

import ProtectedRoute from './components/ProtectedRoute';
import './styles/main.css';
import './styles/footer.css';
import './App.css';


function App() {
  const location = useLocation();

  // Check if current path is an ERP panel page (linked to backend)
  const isERPPage = location.pathname.startsWith('/admin') ||
                    location.pathname.startsWith('/staff') ||
                    location.pathname.startsWith('/student') ||
                    location.pathname.startsWith('/faculty');

  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/eligibility" element={<Eligibility />} />
            <Route path="/admissionprocess" element={<AdmissionProcess />} />
            <Route path="/admissionquery" element={<AdmissionQuery />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/free-courses" element={<FreeCourses />} />
            <Route path="/computer-basics" element={<ComputerBasics />} />
            <Route path="/english-speaking" element={<EnglishSpeaking />} />
            <Route path="/digital-marketing" element={<DigitalMarketing />} />
            <Route path="/career-guidance" element={<CareerGuidance />} />
            <Route path="/personality-development" element={<PersonalityDevelopment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/ncc" element={<NCC />} />
            <Route path="/scholarship" element={<Scholarship />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/staff" element={<ProtectedRoute role="staff"><StaffPanel /></ProtectedRoute>} />
            <Route path="/staff/upload-photo" element={<ProtectedRoute role="staff"><UploadPhoto /></ProtectedRoute>} />
            <Route path="/student" element={<StudentPanel />} />
            <Route path="/student/upload-photo" element={<StudentUploadPhoto />} />
            <Route path="/admin/dashboard" element={<AdminPanel />} />
            <Route path="/faculty/dashboard" element={<StaffPanel />} />
            <Route path="/student/dashboard" element={<StudentPanel />} />
            <Route path="/academic-cell-dashboard" element={<AdminPanel />} />
          </Routes>
        </Suspense>
      </main>
      {!isERPPage && <Footer />}
    </div>
  );
}

function AppWithRouter() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </Router>
  );
}
export default AppWithRouter;
