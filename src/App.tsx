import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './components/AuthLayout/AuthLayout';
import DashboardLayout from './components/DashboardLayout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

// Auth Pages
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import VerifyEmail from './pages/VerifyEmail/VerifyEmail';

// Dashboards
import VentureDashboard from './pages/VentureDashboard/VentureDashboard';
import LearnerDashboard from './pages/LearnerDashboard/LearnerDashboard';
import MentorDashboard from './pages/MentorDashboard/MentorDashboard';
import ManagerDashboard from './pages/ManagerDashboard/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import CMSManager from './modules/cms/pages/CMSManager';
// Other Pages
import MentorDirectory from './pages/MentorDirectory/MentorDirectory';
import CompanyProfile from './pages/CompanyProfile/CompanyProfile';
import VerifyOTP from './pages/VerifyOTP/VerifyOTP';
import LandingPage from './pages/Landing/LandingPage';
import TeamManagement from './pages/TeamManagement/TeamManagement';
import AcceptInvitation from './pages/AcceptInvitation/AcceptInvitation';
function App() {
  return (
    <Routes>

      <Route path="/" element={<LandingPage />} />

      {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
      
       <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
       
      {/* ====== صفحات المصادقة (بدون حماية) ====== */}
      <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
      <Route path="/signup" element={<AuthLayout><Signup /></AuthLayout>} />
      <Route path="/forgot-password" element={<AuthLayout><ForgotPassword /></AuthLayout>} />
      <Route path="/reset-password" element={<AuthLayout><ResetPassword /></AuthLayout>} />
      <Route path="/verify-email" element={<AuthLayout><VerifyEmail /></AuthLayout>} />

      {/* ====== لوحة تحكم المؤسس (Venture) ====== */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['VENTURE', 'INVESTOR']}>
            <DashboardLayout>
              <VentureDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      {/* صفحة تصفح المرشدين (للمؤسس والمتعلم) */}
      <Route 
        path="/mentors" 
        element={
          <ProtectedRoute allowedRoles={['VENTURE', 'LEARNER']}>
            <DashboardLayout>
              <MentorDirectory />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      {/* صفحة تعديل البروفايل */}
      <Route 
        path="/company-profile" 
        element={
          <ProtectedRoute allowedRoles={['VENTURE']}>
            <DashboardLayout>
              <CompanyProfile />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      {/* ====== لوحة تحكم المتعلم (Learner) ====== */}
      <Route 
        path="/learner-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['LEARNER']}>
            <DashboardLayout>
              <LearnerDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      {/* ====== لوحة تحكم المرشد (Mentor) ====== */}
      <Route 
        path="/mentor-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['MENTOR']}>
            <DashboardLayout>
              <MentorDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />

      {/* ====== لوحة تحكم المدير (Manager & Admin) ====== */}
      <Route 
        path="/manager-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <DashboardLayout>
              <ManagerDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cms" 
        element={
          <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
            <DashboardLayout>
              <CMSManager />
            </DashboardLayout>
          </ProtectedRoute>
        } 
/>

      {/* ====== لوحة تحكم الأدمن (Admin) ====== */}
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* صفحة الخطأ (403) */}
      <Route 
        path="/unauthorized" 
        element={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>Access Denied: You do not have permission to view this page.</div>} 
      />

        <Route 
  path="/verify-otp" 
  element={
    <AuthLayout>
      <VerifyOTP />
    </AuthLayout>
  } 
/>


<Route 
  path="/team" 
  element={
    <ProtectedRoute allowedRoles={['VENTURE']}>
      <DashboardLayout>
        <TeamManagement />
      </DashboardLayout>
    </ProtectedRoute>
  } 
/>

<Route 
  path="/accept-invitation" 
  element={<AcceptInvitation />} 
/>
      
    </Routes>
  );
}

export default App;