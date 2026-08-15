import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AdminPage } from './pages/AdminPage';
import { FamilyTreePage } from './pages/FamilyTreePage';
import { PersonProfilePage } from './pages/PersonProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { FamilyMapPage } from './pages/FamilyMapPage';
import { ProtectedRoute } from './router/ProtectedRoute';
import { CustomToastContainer } from './components/ui/CustomToast';
import { TopLoadingBar } from './components/layout/TopLoadingBar';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF9]">
      <TopLoadingBar />
      <CustomToastContainer />
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/dashboard" element={<AdminPage />} />
            <Route path="/map" element={<FamilyMapPage />} />
            <Route path="/families/:familyId/map" element={<FamilyMapPage />} />
            <Route path="/families/:familyId/tree" element={<FamilyTreePage />} />
            <Route path="/people/:id" element={<PersonProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
