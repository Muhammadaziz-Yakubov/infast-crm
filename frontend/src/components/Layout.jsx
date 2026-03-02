import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileBottomBar from './MobileBottomBar';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenuAlt2, HiOutlineQrcode } from 'react-icons/hi';
import { Link } from 'react-router-dom';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();
    const isStudent = user?.role === 'student';

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-dark-950 transition-colors duration-500">
            {/* Sidebar - Hidden for students on mobile, always accessible via toggle on desktop if needed, 
                but we usually want it hidden on mobile for students */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {isStudent && <MobileBottomBar />}


            {/* Main Content Area */}
            <main className={`flex-1 flex flex-col min-h-screen relative overflow-hidden ${!isStudent ? 'lg:ml-72' : 'lg:ml-72'}`}>
                {/* Background Blobs for Premium Feel */}
                <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />


                {/* Mobile Header - Glassmorphism - For Admin show Sidebar toggle, for Student show QR scan */}
                <header className="lg:hidden sticky top-0 z-40 bg-white/60 dark:bg-dark-950/60 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {!isStudent ? (
                                <>
                                    <button
                                        onClick={() => setSidebarOpen(true)}
                                        className="p-2.5 rounded-2xl bg-white dark:bg-dark-800 text-gray-800 dark:text-white shadow-sm border border-gray-100 dark:border-white/5"
                                    >
                                        <HiOutlineMenuAlt2 className="w-6 h-6" />
                                    </button>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black tracking-tight gradient-text leading-none">InFast CRM</span>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Premium Dashboard</span>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black tracking-tight gradient-text leading-none capitalize">{user?.ism || 'O\'quvchi'}</span>
                                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mening Kabinetim</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {isStudent && (
                            <Link
                                to="/scan"
                                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary-500 text-white shadow-lg shadow-primary-500/30 active:scale-95 transition-all"
                            >
                                <HiOutlineQrcode className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest leading-none">Scan</span>
                            </Link>
                        )}
                    </div>
                </header>

                {/* Page Content Container */}
                <section className="flex-1 relative z-10">
                    <div className="container mx-auto px-4 py-6 md:px-8 md:py-10 max-w-7xl">
                        <div className="animate-slide-up">
                            <Outlet />
                        </div>
                    </div>
                </section>

                {/* Footer for desktop (Optional but adds polish) */}
                <footer className="px-8 py-6 text-center border-t border-gray-100 dark:border-white/5 opacity-40">
                    <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">
                        &copy; 2026 InFast CRM &bull; All Rights Reserved Created By: Muhammadaziz Yakubov
                    </p>
                </footer>
            </main>
        </div>
    );
};

export default Layout;
