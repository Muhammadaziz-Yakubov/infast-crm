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

const StudentMarket = React.lazy(() => import('./pages/student/StudentMarket'));
const CoinLogs = React.lazy(() => import('./pages/student/CoinLogs'));
const ScanAttendance = React.lazy(() => import('./pages/student/ScanAttendance'));
const WheelOfFortune = React.lazy(() => import('./pages/student/WheelOfFortune'));
const MarketManager = React.lazy(() => import('./pages/MarketManager'));
const CoinManager = React.lazy(() => import('./pages/CoinManager'));
const Marketing = React.lazy(() => import('./pages/Marketing'));
const LeadForm = React.lazy(() => import('./pages/public/LeadForm'));
const PaymentRequired = React.lazy(() => import('./pages/PaymentRequired'));

// Landing Pages
const LandingHome = React.lazy(() => import('./pages/landing/Home'));
const LandingPrograms = React.lazy(() => import('./pages/landing/Programs'));
const LandingAbout = React.lazy(() => import('./pages/landing/About'));
const LandingTeam = React.lazy(() => import('./pages/landing/Team'));
const LandingContact = React.lazy(() => import('./pages/landing/Contact'));

import { Analytics } from "@vercel/analytics/react";
const Classmates = React.lazy(() => import('./pages/student/Classmates'));
const ClassmateProfile = React.lazy(() => import('./pages/student/ClassmateProfile'));
const Leaderboard = React.lazy(() => import('./pages/student/Leaderboard'));
const Community = React.lazy(() => import('./pages/Community'));
const GroupView = React.lazy(() => import('./pages/GroupView'));
const Homework = React.lazy(() => import('./pages/Homework'));

import { Outlet } from 'react-router-dom';

const ProtectedRoute = ({ children, allowDebtor = false }) => {
    const { user, loading } = useAuth();
    if (loading) return <LoadingSpinner text="Tekshirilmoqda..." />;
    if (!user) return <Navigate to="/login" replace />;

    // Check for debtor status
    if (!allowDebtor && user.role === 'student' && (user.tolovHolati === 'qarzdor' || user.tolovHolati === 'tolanmagan')) {
        return <Navigate to="/payment-required" replace />;
    }

    return children || <Outlet />;
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
    if (user) return <Navigate to="/dashboard" replace />;
    return children;
};

const AppContent = () => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner text="Tizim yuklanmoqda..." />;

    return (
        <Suspense fallback={<LoadingSpinner text="Sahifa yuklanmoqda..." />}>
            <Routes>
                {/* Landing Routes */}
                <Route path="/" element={
                    <PublicRoute><LandingHome /></PublicRoute>
                } />
                <Route path="/programs" element={<LandingPrograms />} />
                <Route path="/about" element={<LandingAbout />} />
                <Route path="/team" element={<LandingTeam />} />
                <Route path="/contact" element={<LandingContact />} />

                <Route path="/login" element={
                    <PublicRoute><Login /></PublicRoute>
                } />
                <Route path="/join/:source" element={<LeadForm />} />
                <Route path="/payment-required" element={
                    <ProtectedRoute allowDebtor={true}>
                        <PaymentRequired />
                    </ProtectedRoute>
                } />
                <Route element={<Layout />}>
                    <Route path="/community" element={<Community />} />
                    <Route path="/community/:id" element={<Community />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<RoleBasedHome />} />
                        <Route path="/home" element={<Navigate to="/dashboard" replace />} />

                        {/* Student routes */}
                        <Route path="/courses" element={user?.role === 'student' ? <StudentCourses /> : <Courses />} />
                        <Route path="/attendance" element={user?.role === 'student' ? <StudentAttendance /> : <Attendance />} />
                        <Route path="/scan" element={<ScanAttendance />} />
                        <Route path="/wheel" element={<WheelOfFortune />} />
                        <Route path="/payments" element={user?.role === 'student' ? <StudentPayments /> : <Payments />} />
                        <Route path="/profile" element={<StudentProfile />} />
                        <Route path="/tasks" element={user?.role === 'student' ? <StudentTasks /> : <Tasks />} />

                        <Route path="/market" element={user?.role === 'student' ? <StudentMarket /> : <MarketManager />} />
                        <Route path="/market/logs" element={<CoinLogs />} />
                        <Route path="/classmates" element={<Classmates />} />
                        <Route path="/classmate-profile/:id" element={<ClassmateProfile />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />

                        {/* Admin only routes */}
                        <Route path="/students" element={<Students />} />
                        <Route path="/groups" element={<Groups />} />
                        <Route path="/groups/:id" element={<GroupView />} />
                        <Route path="/homework" element={<Homework />} />
                        <Route path="/debtors" element={<Debtors />} />
                        <Route path="/market-manager" element={<MarketManager />} />
                        <Route path="/coin-manager" element={<CoinManager />} />
                        <Route path="/marketing" element={<Marketing />} />
                    </Route>
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
