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
import { LoginPage } from './pages/login';
import { RegisterUser } from './pages/registeruser';
import { VerifyEmail } from './pages/VerifyEmail';
import { AuthCallback } from './pages/AuthCallback';
import GoogleCallback from './pages/GoogleCallback';

function AppContent() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/verify-email' || location.pathname === '/auth/callback';

  if (isAuthPage) {
    return (
      <>
        <Navigation />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterUser />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Routes>
      </>
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