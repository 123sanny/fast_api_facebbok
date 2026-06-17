import { Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
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
import ProtectedRoute from "./components/ProtectedRoute";
import EditProfile from "./components/EditProfile";


import "bootstrap-icons/font/bootstrap-icons.css";

function App() {
  return (
    <Routes>

      {/* Public Routes */}
      <Route path="/" element={<Signup />} />
      <Route path="/login" element={<Login />} />

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
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
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
    </Routes>
  );
}

export default App;