import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { OTPVerification } from './components/auth/OTPVerification';
import { ForgotPasswordRequest } from './components/auth/ForgotPasswordRequest';
import { ForgotPasswordOtp } from './components/auth/ForgotPasswordOtp';
import { ResetPasswordForm } from './components/auth/ResetPasswordForm';
import './index.css';

const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })));
const SearchPage = lazy(() => import('./pages/SearchPage').then((module) => ({ default: module.SearchPage })));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage').then((module) => ({ default: module.AIAssistantPage })));
const MessagingPage = lazy(() => import('./pages/MessagingPage').then((module) => ({ default: module.MessagingPage })));
const UserProfile = lazy(() => import('./pages/UserProfile').then((module) => ({ default: module.UserProfile })));
const CommunitiesPage = lazy(() => import('./pages/CommunitiesPage').then((module) => ({ default: module.CommunitiesPage })));
const CommunityDetailPage = lazy(() => import('./pages/CommunityDetailPage').then((module) => ({ default: module.CommunityDetailPage })));
const CreateThreadPage = lazy(() => import('./pages/CreateThreadPage').then((module) => ({ default: module.CreateThreadPage })));
const ThreadPage = lazy(() => import('./pages/ThreadPage').then((module) => ({ default: module.ThreadPage })));
const CodePlayground = lazy(() => import('./components/compiler/CodePlayground').then((module) => ({ default: module.CodePlayground })));
const Profile = lazy(() => import('./components/profile/Profile').then((module) => ({ default: module.Profile })));
const BlogEditor = lazy(() => import('./components/blog/BlogEditor').then((module) => ({ default: module.BlogEditor })));
const BlogView = lazy(() => import('./components/blog/BlogView').then((module) => ({ default: module.BlogView })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then((module) => ({ default: module.NotificationsPage })));
const AnalyticsDashboardPage = lazy(() => import('./pages/AnalyticsDashboardPage').then((module) => ({ default: module.AnalyticsDashboardPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((module) => ({ default: module.AdminDashboardPage })));
const LeaderboardsPage = lazy(() => import('./pages/LeaderboardsPage').then((module) => ({ default: module.LeaderboardsPage })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center">
    <div className="rounded-full border-2 border-cyan-300/20 border-t-cyan-300 p-5 animate-spin" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Layout>
                <Suspense fallback={<RouteLoader />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/verify-otp" element={<OTPVerification />} />
                    <Route path="/forgot-password" element={<ForgotPasswordRequest />} />
                    <Route path="/forgot-password/verify" element={<ForgotPasswordOtp />} />
                    <Route path="/forgot-password/reset" element={<ResetPasswordForm />} />
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/leaderboards" element={<LeaderboardsPage />} />
                    <Route path="/profile/:username" element={<UserProfile />} />
                    <Route path="/communities" element={<CommunitiesPage />} />
                    <Route path="/communities/:id" element={<CommunityDetailPage />} />
                    <Route path="/threads/:threadId" element={<ThreadPage />} />
                    <Route path="/blogs/:id" element={<BlogView />} />

                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/blogs/new" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
                    <Route path="/blogs/:id/edit" element={<ProtectedRoute><BlogEditor /></ProtectedRoute>} />
                    <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                    <Route path="/analytics/dashboard" element={<ProtectedRoute><AnalyticsDashboardPage /></ProtectedRoute>} />
                    <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
                    <Route path="/ai" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
                    <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistantPage /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
                    <Route path="/messages/:conversationId" element={<ProtectedRoute><MessagingPage /></ProtectedRoute>} />
                    <Route path="/communities/:id/new-thread" element={<ProtectedRoute><CreateThreadPage /></ProtectedRoute>} />
                    <Route path="/playground" element={<ProtectedRoute><CodePlayground /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </Layout>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
