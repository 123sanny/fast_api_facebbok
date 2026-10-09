import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";
import Home from "./components/Home";
import Profile from "./components/Profile";
import Friends from "./components/Friends";
import Market from "./components/Market";
import Reels from "./components/Reels";
import Notifications from "./components/Notifications";
import SupportPage from './components/SupportPage';
import TermsPolicies from './components/TermsPolicies';
import SettingsPage from './components/SettingsPage';
import PrivacyCentre from './components/PrivacyCentre';
import TimeManagement from './components/TimeManagement';
import DeviceLogin from './components/DeviceLogin';
import AdActivity from './components/AdActivity';
import OrdersPayments from './components/OrdersPayments';
import DarkModePage from './components/DarkModePage';
import LanguagePage from './components/LanguagePage';
import BlockingPage from './components/BlockingPage';
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";
import SecurityShield from "./components/SecurityShield";
import SearchPage from "./components/SearchPage";
import AdminPanel from "./components/admin/AdminPanel";
import SavedPage from "./components/SavedPage";
import MemoriesPage from "./components/MemoriesPage";
import PagesHub from "./components/PagesHub";
import EventsHub from "./components/EventsHub";
import FeedsHub from "./components/FeedsHub";
import { initTheme } from "./utils/theme";
import { trackPlatformVisitApi } from "./services/adminApi";

import "bootstrap/dist/css/bootstrap.min.css";
import "./theme.css";
import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  const location = useLocation();

  useEffect(() => {
    initTheme();
  }, []);

  // Real-time Platform Visitor Telemetry Tracker across user panel
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      const userObj = userStr ? JSON.parse(userStr) : null;
      const userId = userObj?.id || null;
      // Do not track visits inside /admin routes to avoid polluting user traffic stats
      if (!location.pathname.startsWith("/admin")) {
        trackPlatformVisitApi(location.pathname, userId);
      }
    } catch (e) {
      if (!location.pathname.startsWith("/admin")) {
        trackPlatformVisitApi(location.pathname, null);
      }
    }
  }, [location.pathname]);

  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <Friends />
          </ProtectedRoute>
        }
      />

      <Route
        path="/market"
        element={
          <ProtectedRoute>
            <Market />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reels"
        element={
          <ProtectedRoute>
            <Reels />
          </ProtectedRoute>
        }
      />

      <Route
        path="/watch"
        element={
          <ProtectedRoute>
            <Reels defaultTab="watch" />
          </ProtectedRoute>
        }
      />

      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/saved"
        element={
          <ProtectedRoute>
            <SavedPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/memories"
        element={
          <ProtectedRoute>
            <MemoriesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pages"
        element={
          <ProtectedRoute>
            <PagesHub />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedRoute>
            <EventsHub />
          </ProtectedRoute>
        }
      />

      <Route
        path="/feeds"
        element={
          <ProtectedRoute>
            <FeedsHub />
          </ProtectedRoute>
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/terms_policies"
        element={
          <ProtectedRoute>
            <TermsPolicies />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/blocking"
        element={
          <ProtectedRoute>
            <BlockingPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/privacy"
        element={
          <ProtectedRoute>
            <PrivacyCentre />
          </ProtectedRoute>
        }
      />

      <Route
        path="/time-management"
        element={
          <ProtectedRoute>
            <TimeManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/device-login"
        element={
          <ProtectedRoute>
            <DeviceLogin />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ad-activity"
        element={
          <ProtectedRoute>
            <AdActivity />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders-payments"
        element={
          <ProtectedRoute>
            <OrdersPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders_payments"
        element={
          <ProtectedRoute>
            <OrdersPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <OrdersPayments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPayments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/security"
        element={
          <ProtectedRoute>
            <SecurityShield />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security-shield"
        element={
          <ProtectedRoute>
            <SecurityShield />
          </ProtectedRoute>
        }
      />
      <Route
        path="/security_shield"
        element={
          <ProtectedRoute>
            <SecurityShield />
          </ProtectedRoute>
        }
      />

      <Route
        path="/darkmodepage"
        element={
          <ProtectedRoute>
            <DarkModePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/languagepage"
        element={
          <ProtectedRoute>
            <LanguagePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={<EditProfile />}
      />

      {/* Super Admin Control Center */}
      <Route
        path="/admin"
        element={<AdminPanel />}
      />
      <Route
        path="/admin/*"
        element={<AdminPanel />}
      />
    </Routes>
  );
}

export default App;