import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Loading } from './components/ui/Loading';

// Lazy load pages
const Login = lazy(() => import('./pages/auth/Login'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const Establishments = lazy(() => import('./pages/establishments/Establishments'));
const EstablishmentDetail = lazy(() => import('./pages/establishments/EstablishmentDetail'));
const DeliveryAgents = lazy(() => import('./pages/deliveryAgents/DeliveryAgents.tsx'));
const DeliveryAgentDetail = lazy(() => import('./pages/deliveryAgents/DeliveryAgentDetail.tsx'));
const Users = lazy(() => import('./pages/users/Users'));
const UserDetail = lazy(() => import('./pages/users/UserDetail'));
const Orders = lazy(() => import('./pages/orders/Orders'));
const ComingSoon = lazy(() => import('./pages/common/ComingSoon'));
const Settings = lazy(() => import('./pages/settings/Settings'));
// const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
    return (
        <Router>
            <div className="bg-background">
                <Suspense fallback={<Loading fullScreen/>}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<Login/>}/>
                        <Route path="/signup" element={<SignUp/>}/>

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute>
                                <Dashboard/>
                            </ProtectedRoute>
                        }/>

                        <Route path="/establishments" element={
                            <ProtectedRoute>
                                <Establishments/>
                            </ProtectedRoute>
                        }/>

                        <Route path="/establishments/:id" element={
                            <ProtectedRoute>
                                <EstablishmentDetail/>
                            </ProtectedRoute>
                        }/>

                        <Route path="/delivery-agents" element={
                            <ProtectedRoute>
                                <DeliveryAgents/>
                            </ProtectedRoute>
                        }/>
                        <Route path="/delivery-agents/:id" element={
                            <ProtectedRoute>
                                <DeliveryAgentDetail/>
                            </ProtectedRoute>
                        }/>

                        <Route path="/users" element={
                            <ProtectedRoute>
                                <Users />
                            </ProtectedRoute>
                        } />

                        <Route path="/users/:id" element={
                            <ProtectedRoute>
                                <UserDetail />
                            </ProtectedRoute>
                        } />

                        <Route path="/orders" element={
                            <ProtectedRoute>
                                <Orders />
                            </ProtectedRoute>
                        } />

                        <Route path="/analytics" element={
                            <ProtectedRoute>
                                <ComingSoon title="Analytics" description="Analytics and reporting features are coming soon." />
                            </ProtectedRoute>
                        } />

                        <Route path="/settings" element={
                            <ProtectedRoute>
                                <Settings />
                            </ProtectedRoute>
                        } />

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" replace/>}/>

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
