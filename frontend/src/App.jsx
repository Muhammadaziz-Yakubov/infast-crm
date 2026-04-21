import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

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
const StudentMarket = React.lazy(() => import('./pages/student/StudentMarket'));
const CoinLogs = React.lazy(() => import('./pages/student/CoinLogs'));
const ScanAttendance = React.lazy(() => import('./pages/student/ScanAttendance'));
const WheelOfFortune = React.lazy(() => import('./pages/student/WheelOfFortune'));
const MarketManager = React.lazy(() => import('./pages/MarketManager'));
const CoinManager = React.lazy(() => import('./pages/CoinManager'));
const LeadForm = React.lazy(() => import('./pages/public/LeadForm'));
const PaymentRequired = React.lazy(() => import('./pages/PaymentRequired'));
const Settings = React.lazy(() => import('./pages/Settings'));
const LandingHome = React.lazy(() => import('./pages/landing/Home'));
const LandingPrograms = React.lazy(() => import('./pages/landing/Programs'));
const LandingAbout = React.lazy(() => import('./pages/landing/About'));
const LandingTeam = React.lazy(() => import('./pages/landing/Team'));
const LandingContact = React.lazy(() => import('./pages/landing/Contact'));
const Classmates = React.lazy(() => import('./pages/student/Classmates'));
const ClassmateProfile = React.lazy(() => import('./pages/student/ClassmateProfile'));
const Leaderboard = React.lazy(() => import('./pages/student/Leaderboard'));
const GroupView = React.lazy(() => import('./pages/GroupView'));
const Events = React.lazy(() => import('./pages/Events'));
const EventAttendance = React.lazy(() => import('./pages/EventAttendance'));
const StudentEvents = React.lazy(() => import('./pages/student/StudentEvents'));

import { Analytics } from "@vercel/analytics/react";

const ProtectedRoute = ({ children, allowDebtor = false }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner text="Tekshirilmoqda..." />;
    if (!user) return <Navigate to="/login" replace />;
    if (!allowDebtor && user.role === 'student' && (user.tolovHolati === 'qarzdor' || user.tolovHolati === 'tolanmagan')) {
        return <Navigate to="/payment-required" replace />;
    }
    return children ? children : <Outlet />;
};

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner text="Tekshirilmoqda..." />;
    if (user) return <Navigate to="/dashboard" replace />;
    return children ? children : <Outlet />;
};

const RoleBasedHome = () => {
    const { user } = useAuth();
    if (user?.role === 'student') return <StudentHome />;
    return <Dashboard />;
};

const AppContent = () => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner text="Tizim yuklanmoqda..." />;

    return (
        <Suspense fallback={<LoadingSpinner text="Sahifa yuklanmoqda..." />}>
            <Routes>
                <Route path="/" element={<PublicRoute><LandingHome /></PublicRoute>} />
                <Route path="/programs" element={<LandingPrograms />} />
                <Route path="/about" element={<LandingAbout />} />
                <Route path="/team" element={<LandingTeam />} />
                <Route path="/contact" element={<LandingContact />} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/join/:source" element={<LeadForm />} />
                <Route path="/payment-required" element={<ProtectedRoute allowDebtor={true}><PaymentRequired /></ProtectedRoute>} />
                <Route element={<Layout />}>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<RoleBasedHome />} />
                        <Route path="/home" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/courses" element={user?.role === 'student' ? <StudentCourses /> : <Courses />} />
                        <Route path="/attendance" element={user?.role === 'student' ? <StudentAttendance /> : <Attendance />} />
                        <Route path="/scan" element={<ScanAttendance />} />
                        <Route path="/wheel" element={<WheelOfFortune />} />
                        <Route path="/payments" element={user?.role === 'student' ? <StudentPayments /> : <Payments />} />
                        <Route path="/profile" element={<StudentProfile />} />
                        <Route path="/tasks" element={user?.role === 'student' ? <Tasks /> : <Tasks />} />
                        <Route path="/market" element={user?.role === 'student' ? <StudentMarket /> : <MarketManager />} />
                        <Route path="/market/logs" element={<CoinLogs />} />
                        <Route path="/classmates" element={<Classmates />} />
                        <Route path="/classmate-profile/:id" element={<ClassmateProfile />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/students" element={<Students />} />
                        <Route path="/groups" element={<Groups />} />
                        <Route path="/groups/:id" element={<GroupView />} />
                        <Route path="/debtors" element={<Debtors />} />
                        <Route path="/market-manager" element={<MarketManager />} />
                        <Route path="/coin-manager" element={<CoinManager />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/events" element={user?.role === 'student' ? <StudentEvents /> : <Events />} />
                        <Route path="/events/:id/attendance" element={<EventAttendance />} />
                    </Route>
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

const App = () => (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider>
            <AuthProvider>
                <Analytics />
                <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', padding: '14px 20px', fontSize: '14px' } }} />
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    </BrowserRouter>
);

export default App;