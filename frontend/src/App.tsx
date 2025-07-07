import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { FloatingActionButton } from './components/FloatingActionButton';
import { HomePage } from './pages/HomePage';
import { GateNavigationPage } from './pages/GateNavigationPage';
import { BaggageStatusPage } from './pages/BaggageStatusPage';
import { FlightUpdatesPage } from './pages/FlightUpdatesPage';
import { EmergencyAssistancePage } from './pages/EmergencyAssistancePage';
import { SlotBookingPage } from './pages/SlotBookingPage';
import { ArtGuidePage } from './pages/ArtGuidePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterUser } from './pages/registeruser';
import { VerifyEmail } from './pages/VerifyEmail';
import { AuthCallback } from './pages/AuthCallback';
import GoogleCallback from './pages/GoogleCallback';
import OtpVerificationPage from './pages/OtpVerificationPage';
import OtpSuccessPage from './pages/OtpSuccessPage';
import Footer from './components/Footer';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify-email' || location.pathname === '/auth/callback' || location.pathname === '/otp-verify' || location.pathname === '/otp-success';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/otp-verify" element={<OtpVerificationPage />} />
        <Route path="/otp-success" element={<OtpSuccessPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/navigation" element={<GateNavigationPage />} />
          <Route path="/baggage" element={<BaggageStatusPage />} />
          <Route path="/flights" element={<FlightUpdatesPage />} />
          <Route path="/emergency" element={<EmergencyAssistancePage />} />
          <Route path="/booking" element={<SlotBookingPage />} />
          <Route path="/art" element={<ArtGuidePage />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
        </Routes>
      </main>
      <FloatingActionButton />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;