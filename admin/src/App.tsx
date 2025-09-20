import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Loading } from './components/ui/Loading';

// Lazy load pages
const Login = lazy(() => import('./pages/auth/Login'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Restaurants = lazy(() => import('./pages/restaurants/Restaurants'));
// const RestaurantDetail = lazy(() => import('./pages/restaurants/RestaurantDetail'));
// const Users = lazy(() => import('./pages/users/Users'));
// const UserDetail = lazy(() => import('./pages/users/UserDetail'));
// const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background">
                <Suspense fallback={<Loading fullScreen />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/restaurants" element={
                            <ProtectedRoute>
                                <Restaurants />
                            </ProtectedRoute>
                        } />

                        {/*<Route path="/restaurants/:id" element={
                            <ProtectedRoute>
                                <RestaurantDetail />
                            </ProtectedRoute>
                        } />*/}

                        {/*<Route path="/users" element={
                            <ProtectedRoute>
                                <Users />
                            </ProtectedRoute>
                        } />*/}

                        {/*<Route path="/users/:id" element={
                            <ProtectedRoute>
                                <UserDetail />
                            </ProtectedRoute>
                        } />*/}

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />

                        {/* 404 */}
                        {/*<Route path="*" element={<NotFound />} />*/}
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
    );
}

export default App;
