import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { MobileLayout } from './components/layout/MobileLayout';
import { Loading } from './components/ui/Loading';

// Lazy load pages
const Login = lazy(() => import('./pages/auth/Login'));
const Signup = lazy(() => import('./pages/auth/Signup'));
const LocationSetup = lazy(() => import('./pages/auth/LocationSetup'));
const Home = lazy(() => import('./pages/home/Home'));
const Search = lazy(() => import('./pages/search/Search'));
const Restaurant = lazy(() => import('./pages/restaurant/Restaurant'));
const Cart = lazy(() => import('./pages/cart/Cart'));
const Checkout = lazy(() => import('./pages/checkout/Checkout'));
const OrderTracking = lazy(() => import('./pages/orders/OrderTracking'));
const OrderHistory = lazy(() => import('./pages/orders/OrderHistory'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Addresses = lazy(() => import('./pages/profile/Addresses'));
const AddAddress = lazy(() => import('./pages/profile/AddAddress'));
const OrderRating = lazy(() => import('./pages/orders/OrderRating'));

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
                            <Route path="/location-setup" element={<LocationSetup />} />

                            {/* Protected Routes with Mobile Layout */}
                            <Route path="/home" element={
                                <ProtectedRoute>
                                    <MobileLayout>
                                        <Home />
                                    </MobileLayout>
                                </ProtectedRoute>
                            } />

                            <Route path="/search" element={
                                <ProtectedRoute>
                                    <MobileLayout>
                                        <Search />
                                    </MobileLayout>
                                </ProtectedRoute>
                            } />

                            <Route path="/restaurant/:id" element={
                                <ProtectedRoute>
                                    <Restaurant />
                                </ProtectedRoute>
                            } />

                            <Route path="/cart" element={
                                <ProtectedRoute>
                                    <MobileLayout>
                                        <Cart />
                                    </MobileLayout>
                                </ProtectedRoute>
                            } />

                            <Route path="/checkout" element={
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            } />

                            <Route path="/order-tracking/:id" element={
                                <ProtectedRoute>
                                    <OrderTracking />
                                </ProtectedRoute>
                            } />

                            <Route path="/orders" element={
                                <ProtectedRoute>
                                    <MobileLayout>
                                        <OrderHistory />
                                    </MobileLayout>
                                </ProtectedRoute>
                            } />

                            <Route path="/orders/:id" element={
                                <ProtectedRoute>
                                    <OrderTracking />
                                </ProtectedRoute>
                            } />

                            <Route path="/profile" element={
                                <ProtectedRoute>
                                    <MobileLayout>
                                        <Profile />
                                    </MobileLayout>
                                </ProtectedRoute>
                            } />

                            <Route path="/addresses" element={
                                <ProtectedRoute>
                                    <Addresses />
                                </ProtectedRoute>
                            } />

                            <Route path="/add-address" element={
                                <ProtectedRoute>
                                    <AddAddress />
                                </ProtectedRoute>
                            } />

                            <Route path="/rate-order/:id" element={
                                <ProtectedRoute>
                                    <OrderRating />
                                </ProtectedRoute>
                            } />

                            {/* Default redirect */}
                            <Route path="/" element={<Navigate to="/home" replace />} />

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
                        position="top-center"
                        toastOptions={{
                            duration: 3000,
                            className: 'font-medium text-sm',
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
