import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Eagerly loaded components
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy loaded pages
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const StudentHome = React.lazy(() => import('./pages/student/StudentHome'));
const StudentCourses = React.lazy(() => import('./pages/student/StudentCourses'));
const StudentAttendance = React.lazy(() => import('./pages/student/StudentAttendance'));
const StudentPayments = React.lazy(() => import('./pages/student/StudentPayments'));
const StudentProfile = React.lazy(() => import('./pages/student/StudentProfile'));
const Students = React.lazy(() => import('./pages/Students'));
const Groups = React.lazy(() => import('./pages/Groups'));
const Courses = React.lazy(() => import('./pages/Courses'));
const Payments = React.lazy(() => import('./pages/Payments'));
const Debtors = React.lazy(() => import('./pages/Debtors'));
const Attendance = React.lazy(() => import('./pages/Attendance'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const StudentTasks = React.lazy(() => import('./pages/student/StudentTasks'));
const StudentRating = React.lazy(() => import('./pages/student/StudentRating'));
const StudentMarket = React.lazy(() => import('./pages/student/StudentMarket'));
const CoinLogs = React.lazy(() => import('./pages/student/CoinLogs'));
const ScanAttendance = React.lazy(() => import('./pages/student/ScanAttendance'));
const WheelOfFortune = React.lazy(() => import('./pages/student/WheelOfFortune'));
const MarketManager = React.lazy(() => import('./pages/MarketManager'));
const CoinManager = React.lazy(() => import('./pages/CoinManager'));


import { Analytics } from "@vercel/analytics/react";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner text="Tekshirilmoqda..." />;
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

const RoleBasedHome = () => {
    const { user } = useAuth();
    if (user?.role === 'student') {
        return <StudentHome />;
    }
    return <Dashboard />;
};

const RoleBasedGuard = ({ role, children }) => {
    const { user } = useAuth();
    if (user?.role !== role) return <Navigate to="/" replace />;
    return children;
};

const StudentRoutes = () => (
    <>
        <Route path="/courses" element={<StudentCourses />} />
        <Route path="/attendance" element={<StudentAttendance />} />
        <Route path="/payments" element={<StudentPayments />} />
        <Route path="/profile" element={<StudentProfile />} />
    </>
);

const AdminRoutes = () => (
    <>
        <Route path="/students" element={<Students />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/debtors" element={<Debtors />} />
        <Route path="/attendance" element={<Attendance />} />
    </>
);

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner text="Tekshirilmoqda..." />;
    if (user) return <Navigate to="/" replace />;
    return children;
};

const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner text="Tizim yuklanmoqda..." />;

    return (
        <Suspense fallback={<LoadingSpinner text="Sahifa yuklanmoqda..." />}>
            <Routes>
                <Route path="/login" element={
                    <PublicRoute><Login /></PublicRoute>
                } />
                <Route element={
                    <ProtectedRoute><Layout /></ProtectedRoute>
                }>
                    <Route path="/" element={<RoleBasedHome />} />

                    {/* Student routes */}
                    <Route path="/courses" element={user?.role === 'student' ? <StudentCourses /> : <Courses />} />
                    <Route path="/attendance" element={user?.role === 'student' ? <StudentAttendance /> : <Attendance />} />
                    <Route path="/scan" element={<ScanAttendance />} />
                    <Route path="/wheel" element={<WheelOfFortune />} />
                    <Route path="/payments" element={user?.role === 'student' ? <StudentPayments /> : <Payments />} />
                    <Route path="/profile" element={<StudentProfile />} />
                    <Route path="/tasks" element={user?.role === 'student' ? <StudentTasks /> : <Tasks />} />
                    <Route path="/rating" element={<StudentRating />} />
                    <Route path="/market" element={user?.role === 'student' ? <StudentMarket /> : <MarketManager />} />
                    <Route path="/market/logs" element={<CoinLogs />} />

                    {/* Admin only routes */}
                    <Route path="/students" element={<Students />} />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/debtors" element={<Debtors />} />
                    <Route path="/market-manager" element={<MarketManager />} />
                    <Route path="/coin-manager" element={<CoinManager />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

const App = () => {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ThemeProvider>
                <AuthProvider>
                    <Analytics />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                borderRadius: '12px',
                                padding: '14px 20px',
                                fontSize: '14px',
                            },
                        }}
                    />
                    <AppContent />
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
};



export default App;
