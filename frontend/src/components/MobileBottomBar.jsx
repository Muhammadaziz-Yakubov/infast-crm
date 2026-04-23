import { NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineUserCircle, HiOutlineClipboardList, HiOutlineShoppingBag, HiOutlineFire } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const MobileBottomBar = () => {
    const { user } = useAuth();
    if (user && user.role !== 'student') return null;

    const navItems = [
        { path: '/', icon: HiOutlineHome, label: 'Asosiy' },
        { path: user ? '/tasks' : '/login', icon: HiOutlineClipboardList, label: 'Vazifa' },
        { path: user ? '/challenges' : '/login', icon: HiOutlineFire, label: 'Chellenj' },
        { path: user ? '/market' : '/login', icon: HiOutlineShoppingBag, label: 'Market' },
        { path: user ? '/profile' : '/login', icon: HiOutlineUserCircle, label: user ? 'Profil' : 'Kirish' },
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6">
            <div className="w-full max-w-md bg-gray-900/90 dark:bg-dark-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] px-4 py-3">
                <nav className="flex items-center justify-between relative">
                    {navItems.map((item) => (
                        <NavLink key={item.path} to={item.path}
                            className={({ isActive }) => `relative flex flex-col items-center justify-center flex-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-500 hover:text-gray-400'}`}>
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute inset-0 bg-primary-500/20 rounded-2xl scale-125 blur-lg opacity-40 animate-pulse" />}
                                    <div className={`relative z-10 flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'scale-110 -translate-y-1.5' : 'scale-100'}`}>
                                        <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary-500 shadow-lg shadow-primary-500/30 text-white' : 'bg-transparent'}`}>
                                            <item.icon className="w-6 h-6" />
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest transition-all duration-500 ${isActive ? 'opacity-100 mt-1 leading-none' : 'opacity-0 h-0 hidden'}`}>{item.label}</span>
                                    </div>
                                    {isActive && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-400 shadow-[0_0_12px_rgba(99,102,241,1)]" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </div>
    );
};

export default MobileBottomBar;