import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { OTPVerification } from './components/auth/OTPVerification';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './components/profile/Profile';
import { BlogList } from './components/blog/BlogList';
import { BlogEditor } from './components/blog/BlogEditor';
import { StandardBlogEditor } from './components/blog/StandardBlogEditor';
import { BlogView } from './components/blog/BlogView';
import { BlogSearch } from './components/search/BlogSearch';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { UserProfile } from './pages/UserProfile';
import { MessagingPage } from './pages/MessagingPage';
import { CodePlayground } from './components/compiler/CodePlayground';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const LayoutWrapper = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Routes with Global Layout */}
              <Route element={<LayoutWrapper />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-otp" element={<OTPVerification />} />
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<BlogSearch />} />

                {/* Protected Routes inside Layout */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
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

                {/* Blog View (Reader Mode) uses Layout */}
                <Route path="/blogs/:id" element={<BlogView />} />

                <Route path="/profile/:username" element={<UserProfile />} />
                <Route
                  path="/ai"
                  element={
                    <ProtectedRoute>
                      <AIAssistantPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <MessagingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages/:conversationId"
                  element={
                    <ProtectedRoute>
                      <MessagingPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Editor Routes - Fullscreen (No Global Layout/Navbar) */}
              <Route path="/playground" element={<CodePlayground />} />

              <Route
                path="/blogs/new"
                element={
                  <ProtectedRoute>
                    <StandardBlogEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blogs/live/new"
                element={
                  <ProtectedRoute>
                    <BlogEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blogs/:id/edit"
                element={
                  <ProtectedRoute>
                    <StandardBlogEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/blogs/:id/live"
                element={
                  <ProtectedRoute>
                    <BlogEditor />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
