import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Spinner } from '@chakra-ui/react';
import { Component, lazy, Suspense } from 'react';

// --- (Step 1: Import the new HomePage component) ---
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));

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
        // eslint-disable-next-line no-console
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

// --- (Step 2: The HomeRedirect function is no longer needed and has been removed) ---

function App() {
    return (
        <ErrorBoundary>
            <Router>
                <div className="container">
                    <Suspense fallback={
                        <Box display="flex" alignItems="center" justifyContent="center" minH="50vh">
                            <Spinner size="lg" thickness="3px" color="blue.500" />
                        </Box>
                    }>
                        <Routes>
                            {/* --- (Step 3: The root path now renders HomePage) --- */}
                            <Route path='/' element={<HomePage />} />

                            <Route path='/login' element={<LoginPage />} />
                            <Route path='/register' element={<RegisterPage />} />
                            <Route path='/dashboard' element={<DashboardPage />} />
                            <Route path='/disagreement/:id' element={<ChatPage />} />
                        </Routes>
                    </Suspense>
                </div>
            </Router>
        </ErrorBoundary>
    );
}

export default App;