import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './components/profile/Profile';
import { BlogEditor } from './components/blog/BlogEditor';
import { BlogView } from './components/blog/BlogView';
import { BlogSearch } from './components/search/BlogSearch';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { MessagingPage } from './pages/MessagingPage';
import { UserProfile } from './pages/UserProfile';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { CommunityDetailPage } from './pages/CommunityDetailPage';
import { CreateThreadPage } from './pages/CreateThreadPage';
import { ThreadPage } from './pages/ThreadPage';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<BlogSearch />} />
              <Route path="/profile/:username" element={<UserProfile />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/communities/:id" element={<CommunityDetailPage />} />
              <Route path="/threads/:threadId" element={<ThreadPage />} />

              {/* Protected Routes */}
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
              <Route
                path="/blogs/new"
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
                    <BlogEditor />
                  </ProtectedRoute>
                }
              />
              <Route path="/blogs/:id" element={<BlogView />} />
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
              <Route
                path="/communities/:id/new-thread"
                element={
                  <ProtectedRoute>
                    <CreateThreadPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/playground"
                element={
                  <ProtectedRoute>
                    <CodePlayground />
                  </ProtectedRoute>
                }
              />

              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
