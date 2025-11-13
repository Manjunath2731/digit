import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import HomePage from './pages/HomePage/HomePage';
import CommunityDevelopment from './pages/CommunityDevelopment/CommunityDevelopment';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOtp from './pages/auth/VerifyOtp';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import ProfileCompletion from './pages/auth/ProfileCompletion';
import UserManagement from './pages/UserManagement';
import SecondaryUserManagement from './pages/SecondaryUserManagement';
import UserDetails from './pages/UserDetails';
import Cities from './pages/Cities';
import Orders from './pages/Orders';
import PlanSettings from './pages/PlanSettings';
import Dashboard from './pages/Dashboard';
import DashboardUser from './pages/DashboardUser';
import ElectricalParameters from './pages/ElectricalParameters';
import WaterLevel from './pages/WaterLevel';
import WaterOutflow from './pages/WaterOutflow';
import WaterYield from './pages/WaterYield';
import DeviceMap from './pages/DeviceMap';
import Statistics from './pages/Statistics';
import NiSensu from './pages/NiSensu';
import NiTheFlowMeter from './pages/NiTheFlowMeter';
import Membership from './pages/Membership';
import TankManagement from './pages/TankManagement';
import ComplaintForm from './pages/ComplaintForm';
import EditProfile from './pages/EditProfile';
import ServiceEngineers from './pages/ServiceEngineers';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './styles/global.css';
import './components/chatbot/FontOverride.css';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>

          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
         
            
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/profile-completion" element={<ProfileCompletion />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard-user" 
              element={
                <ProtectedRoute>
                  <DashboardUser />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <UserManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/users/:userId" 
              element={
                <ProtectedRoute>
                  <UserDetails />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/secondary-user" 
              element={
                <ProtectedRoute>
                  <SecondaryUserManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/cities" 
              element={
                <ProtectedRoute>
                  <Cities />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/orders" 
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/plan-settings" 
              element={
                <ProtectedRoute>
                  <PlanSettings />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/electrical-parameters" 
              element={
                <ProtectedRoute>
                  <ElectricalParameters />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/water-level" 
              element={
                <ProtectedRoute>
                  <WaterLevel />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/water-outflow" 
              element={
                <ProtectedRoute>
                  <WaterOutflow />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/water-yield" 
              element={
                <ProtectedRoute>
                  <WaterYield />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/device-map" 
              element={
                <ProtectedRoute>
                  <DeviceMap />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/statistics" 
              element={
                <ProtectedRoute>
                  <Statistics />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/manage-ni-sensu" 
              element={
                <ProtectedRoute>
                  <NiSensu />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/manage-flow-meter" 
              element={
                <ProtectedRoute>
                  <NiTheFlowMeter />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/membership" 
              element={
                <ProtectedRoute>
                  <Membership />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/tanks" 
              element={
                <ProtectedRoute>
                  <TankManagement />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/complaint-form" 
              element={
                <ProtectedRoute>
                  <ComplaintForm />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/edit-profile" 
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/service-engineers" 
              element={
                <ProtectedRoute>
                  <ServiceEngineers />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<div className="container py-5"><h1>Page Not Found</h1></div>} />
          </Routes>

      </Router>
    </Provider>
  );
};

export default App;
