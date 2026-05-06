
import { Routes, Route, useLocation } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import RecruiterLayout from './layouts/RecruiterLayout';
import CandidateLayout from './layouts/CandidateLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SelectRolePage from './pages/auth/SelectRolePage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import HomePage from './pages/HomePage';
import JobListPage from './pages/job/JobListPage';
import JobDetailPage from './pages/job/JobDetailPage';
import CompanyListPage from './pages/company/CompanyListPage';
import CompanyDetailPage from './pages/company/CompanyDetailPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CompanyManagement from './pages/admin/CompanyManagement';
import JobManagement from './pages/admin/JobManagement';
import ResumeManagement from './pages/admin/ResumeManagement';
import ProfilePage from './pages/profile/ProfilePage';
import ProtectedRoute from './routes/ProtectedRoute';
import RegisterCompanyPage from './pages/hr/RegisterCompanyPage';
import CompanyApprovalsPage from './pages/admin/CompanyApprovalsPage';
import HRDashboard from './pages/hr/HRDashboard';
import HRJobManagement from './pages/hr/HRJobManagement';
import HRResumeManagement from './pages/hr/HRResumeManagement';
import HRCompanyManager from './pages/hr/HRCompanyManager';
import HRPricing from './pages/hr/HRPricing';
import HRProfilePage from './pages/hr/HRProfilePage';
import PaymentSuccess from './pages/hr/PaymentSuccess';
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import MyApplicationsPage from './pages/candidate/MyApplicationsPage';

import CandidateProfilePage from './pages/candidate/CandidateProfilePage';
import SavedJobsPage from './pages/candidate/SavedJobsPage';
import ChatbotWidget from './components/Chatbot/ChatbotWidget';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';

function App() {
  const location = useLocation();
  const hideChatbotPaths = ['/login', '/register', '/select-role', '/forgot-password', '/reset-password'];
  const shouldHideChatbot = hideChatbotPaths.includes(location.pathname);

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/select-role" element={<SelectRolePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />

          <Route path="jobs" element={<JobListPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />

          <Route path="companies" element={<CompanyListPage />} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />

          <Route path="profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />

          <Route path="hr/register-company" element={
            <ProtectedRoute roles={['HR']}>
              <RegisterCompanyPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* HR Routes */}
        <Route path="/hr" element={
          <ProtectedRoute roles={['HR']}>
            <RecruiterLayout />
          </ProtectedRoute>
        }>
          <Route index element={<HRDashboard />} />
          <Route path="jobs" element={<HRJobManagement />} />
          <Route path="resumes" element={<HRResumeManagement />} />
          <Route path="company" element={<HRCompanyManager />} />
          <Route path="pricing" element={<HRPricing />} />
          <Route path="profile" element={<HRProfilePage />} />
        </Route>

        <Route path="/hr/payment/return" element={<PaymentSuccess />} />

        {/* Candidate Routes */}
        <Route path="/candidate" element={
          <ProtectedRoute roles={['CANDIDATE']}>
            <CandidateLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CandidateDashboard />} />
          <Route path="applications" element={<MyApplicationsPage />} />
          <Route path="saved-jobs" element={<SavedJobsPage />} />

          <Route path="profile" element={<CandidateProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['SUPER_ADMIN', 'ADMIN', 'MANAGER']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="companies" element={<CompanyManagement />} />
          <Route path="company-approvals" element={<CompanyApprovalsPage />} />
          <Route path="jobs" element={<JobManagement />} />
          <Route path="resumes" element={<ResumeManagement />} />
        </Route>

        <Route path="*" element={<div className="text-center mt-20 text-xl font-bold text-gray-400">404 Not Found</div>} />
      </Routes>
      {!shouldHideChatbot && <ChatbotWidget />}
    </>
  );
}

export default App;
