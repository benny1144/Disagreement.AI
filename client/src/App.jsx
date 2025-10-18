import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Component, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import PublicLayout from '@/components/layout/PublicLayout';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import CookieConsentBanner from './components/CookieConsentBanner.jsx';

// --- (Step 1: Update the HomePage import to point to the new .tsx file) ---
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const InviteAcceptPage = lazy(() => import('./pages/InviteAcceptPage'));
const UserAccountPage = lazy(() => import('./pages/UserAccountPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CookiePolicyPage = lazy(() => import('./pages/CookiePolicyPage'));
const InAppContactPage = lazy(() => import('./pages/InAppContactPage'));

class ErrorBoundary extends Component {
    // ... (No changes needed in the ErrorBoundary component)
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        console.error('App crashed with error:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 24, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif' }}>
                    <h2 style={{ color: '#b00020' }}>Something went wrong.</h2>
                    <p style={{ color: '#444' }}>
                        A runtime error occurred in the application. Try a hard refresh. If the issue persists, run
                        <code style={{ background: '#f4f4f4', padding: '2px 6px', marginLeft: 6, marginRight: 6 }}>npm run start:fresh</code>
                        in the client folder to clear Vite's cache and restart the dev server.
                    </p>
                    <pre style={{ whiteSpace: 'pre-wrap', background: '#f9f9f9', padding: 12, borderRadius: 8, border: '1px solid #eee' }}>
            {String(this.state.error)}
          </pre>
                </div>
            );
        }
        return this.props.children;
    }
}


function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <Router>
                        {/* --- (Step 2: Replace Chakra spinner with a simple div for the loading fallback) --- */}
                        <Suspense fallback={
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
                                <p>Loading...</p>
                            </div>
                        }>
                            <Routes>
                              {/* Public routes wrapped with PublicLayout */}
                              <Route element={<PublicLayout />}>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<SignUpPage />} />
                                <Route path="/invite/:token" element={<InviteAcceptPage />} />
                                <Route path="/contact" element={<ContactPage />} />
                                <Route path="/privacy" element={<PrivacyPage />} />
                                <Route path="/terms" element={<TermsPage />} />
                                <Route path="/cookies" element={<CookiePolicyPage />} />
                              </Route>
                              {/* App/protected routes with existing Layout */}
                              <Route element={<Layout />}>
                                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                                <Route path="/profile" element={<ProtectedRoute><UserAccountPage /></ProtectedRoute>} />
                                <Route path="/app/contact" element={<ProtectedRoute><InAppContactPage /></ProtectedRoute>} />
                                <Route path="/disagreement/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                              </Route>
                            </Routes>
                        </Suspense>
                <CookieConsentBanner />
                </Router>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;