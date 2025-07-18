import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { GateNavigationPage } from './pages/GateNavigationPage';
import { BaggageStatusPage } from './pages/BaggageStatusPage';
import FlightUpdatesPage from './pages/FlightUpdatesPage';
import { EmergencyAssistancePage } from './pages/EmergencyAssistancePage';
import { SlotBookingPage } from './pages/SlotBookingPage';
import { ArtGuidePage } from './pages/ArtGuidePage';
import LoginPage from './pages/LoginPage';
import { RegisterUser } from './pages/registeruser';
import { VerifyEmail } from './pages/VerifyEmail';
import { AuthCallback } from './pages/AuthCallback';
import GoogleCallback from './pages/GoogleCallback';
import OtpVerificationPage from './pages/OtpVerificationPage';
import OtpSuccessPage from './pages/OtpSuccessPage';
import { ProfilePage } from './pages/ProfilePage';
import { sendLocation, queryFlights } from './services/api';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function AppContent() {
  const location = useLocation();
  const isAuthPage = [
    '/login',
    '/register',
    '/verify-email',
    '/auth/callback',
    '/otp-verify',
    '/otp-success',
    '/forgot-password',
    '/reset-password'
  ].includes(location.pathname);

  useEffect(() => {
    const LOCATION_FLAG = 'locationSent';
    const LAST_LOCATION = 'lastLocation';
    // If locationSent is set but lastLocation is missing, re-run location logic
    if (localStorage.getItem(LOCATION_FLAG) && !localStorage.getItem(LAST_LOCATION)) {
      localStorage.removeItem(LOCATION_FLAG);
    }
    if (localStorage.getItem(LOCATION_FLAG)) return;

    const sendGeoLocation = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      const locationData = { latitude, longitude, accuracy, location_method: 'geolocation' };
      sendLocation(locationData)
        .then(() => {
          localStorage.setItem(LOCATION_FLAG, '1');
          localStorage.setItem(LAST_LOCATION, JSON.stringify(locationData));
          queryFlights(locationData).then(console.log);
        })
        .catch((error) => {
          console.warn('Location API error:', error);
          // Don't block the app if location fails
        });
    };
    const fallbackToIP = async () => {
      try {
        const res = await fetch('https://ip-api.com/json');
        const data = await res.json();
        const locationData = { country: data.countryCode || data.country, region: data.regionName, ip: data.query, location_method: 'ip' };
        await sendLocation(locationData);
        localStorage.setItem(LOCATION_FLAG, '1');
        localStorage.setItem(LAST_LOCATION, JSON.stringify(locationData));
        queryFlights(locationData).then(console.log);
      } catch (e) {
        console.warn('IP-based location API error:', e);
        // Don't block the app if location fails
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(sendGeoLocation, fallbackToIP, { enableHighAccuracy: true, timeout: 10000 });
    } else {
      fallbackToIP();
    }
  }, []);

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/otp-verify" element={<OtpVerificationPage />} />
        <Route path="/otp-success" element={<OtpSuccessPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth/callback" element={<GoogleCallback />} />
        </Routes>
      </main>
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