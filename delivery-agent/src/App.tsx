import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Loading } from './components/ui/Loading';

// Lazy load pages
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Orders = lazy(() => import('./pages/orders/Orders'));
const OrderDetail = lazy(() => import('./pages/orders/OrderDetail'));
const Profile = lazy(() => import('./pages/profile/Profile'));

function App() {
    return (
        <Provider store={store}>
            <Router>
                <div className="min-h-screen bg-background">
                    <Suspense fallback={<Loading fullScreen />}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/signup" element={<Signup />} />

                            {/* Protected Routes */}
                            <Route path="/dashboard" element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            } />

                            <Route path="/orders" element={
                                <ProtectedRoute>
                                    <Orders />
                                </ProtectedRoute>
                            } />

                            <Route path="/orders/:id" element={
                                <ProtectedRoute>
                                    <OrderDetail />
                                </ProtectedRoute>
                            } />

                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            } />

                            {/* Default redirect */}
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />

                            {/* 404 */}
                            <Route path="*" element={
                                <div className="min-h-screen flex items-center justify-center">
                                    <div className="text-center">
                                        <h1 className="text-4xl font-bold text-secondary-900 mb-4">404</h1>
                                        <p className="text-secondary-600">Page not found</p>
                                    </div>
                                </div>
                            } />
                        </Routes>
                    </Suspense>

                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            className: 'font-medium',
                            success: {
                                className: 'bg-success-50 text-success-700 border border-success-200',
                            },
                            error: {
                                className: 'bg-error-50 text-error-700 border border-error-200',
                            },
                        }}
                    />
                </div>
            </Router>
        </Provider>
    );
}

export default App;
