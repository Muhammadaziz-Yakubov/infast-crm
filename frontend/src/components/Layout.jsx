import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileBottomBar from './MobileBottomBar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineMenuAlt2, HiOutlineQrcode, HiOutlineGift, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import Logo from '../infastacademy.jpg';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const isStudent = !user || user.role === 'student';
    const isGuest = !user;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-dark-950 transition-colors duration-500">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {isStudent && <MobileBottomBar />}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen relative overflow-hidden lg:ml-[240px]">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-gray-100 dark:border-zinc-950 px-4 h-16 flex items-center">
                    <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            {!isStudent ? (
                                <>
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="p-2 rounded-lg bg-white dark:bg-zinc-900 text-gray-800 dark:text-white shadow-sm border border-gray-100 dark:border-zinc-800 flex-shrink-0"
                                    >
                                        <HiOutlineMenuAlt2 className="w-5 h-5" />
                                    </button>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold tracking-tight text-gray-900 dark:text-white leading-none truncate">InFast CRM</span>
                                        <span className="text-[8px] uppercase font-bold text-[#0066FF] tracking-wider">Admin</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/profile" className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-850 shadow-sm flex-shrink-0 bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">
                                        {user?.profileImage ? (
                                            <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
                                        )}
                                    </Link>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-semibold tracking-tight text-gray-900 dark:text-white leading-tight capitalize truncate">{user?.ism || 'InFast Academy'}</span>
                                        <span className="text-[8px] uppercase font-bold text-[#0066FF] tracking-wider">Student</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {isStudent && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                    onClick={toggleDarkMode}
                                    className="w-9 h-9 rounded-lg bg-gray-55 dark:bg-zinc-900 text-gray-800 dark:text-white border border-gray-150 dark:border-zinc-850 active:scale-95 transition-all flex items-center justify-center"
                                    title="Mavzuni o'zgartirish"
                                >
                                    {darkMode ? <HiOutlineSun className="w-4 h-4" /> : <HiOutlineMoon className="w-4 h-4" />}
                                </button>
                                <Link
                                    to="/wheel"
                                    className="w-9 h-9 rounded-lg bg-amber-500 text-white shadow-sm active:scale-95 transition-all flex items-center justify-center"
                                    title="Omad G'ildiragi"
                                >
                                    <HiOutlineGift className="w-4 h-4" />
                                </Link>
                                <Link
                                    to="/scan"
                                    className="w-9 h-9 rounded-lg bg-[#0066FF] text-white shadow-sm active:scale-95 transition-all flex items-center justify-center"
                                    title="Skaner"
                                >
                                    <HiOutlineQrcode className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content Container */}
                <section className="flex-1 relative z-10">
                    <div className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-7xl">
                        <div className="animate-slide-up">
                            <Outlet />
                        </div>
                    </div>
                </section>

                {/* Footer for desktop (Optional but adds polish) */}
                <footer className="px-8 py-6 text-center border-t border-gray-100 dark:border-zinc-900/50 opacity-40">
                    <p className="text-[10px] font-medium text-gray-500 tracking-widest uppercase">
                        &copy; 2026 InFast CRM &bull; All Rights Reserved Created By: Muhammadaziz Yakubov
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default Layout;
