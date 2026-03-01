import { NavLink } from 'react-router-dom';
import {
    HiOutlineHome, HiOutlineAcademicCap, HiOutlineCalendar,
    HiOutlineCreditCard, HiOutlineUserCircle, HiOutlineClipboardList
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const MobileBottomBar = () => {
    const { user } = useAuth();

    // Bottom bar is primarily for students
    if (!user || user.role !== 'student') return null;

    const navItems = [
        { path: '/', icon: HiOutlineHome, label: 'Asosiy' },
        { path: '/tasks', icon: HiOutlineClipboardList, label: 'Vazifalar' },
        { path: '/attendance', icon: HiOutlineCalendar, label: 'Davomat' },
        { path: '/payments', icon: HiOutlineCreditCard, label: 'To\'lov' },
        { path: '/profile', icon: HiOutlineUserCircle, label: 'Profil' },
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
            <div className="bg-gray-900/95 dark:bg-dark-900/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] px-4 py-2">
                <nav className="flex items-center justify-between h-16">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                relative flex flex-col items-center justify-center flex-1 h-full transition-all duration-500
                                ${isActive ? 'text-primary-400' : 'text-gray-500 hover:text-gray-400'}
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className={`
                                        flex flex-col items-center gap-1 transition-all duration-300
                                        ${isActive ? 'scale-110 -translate-y-1' : ''}
                                    `}>
                                        <item.icon className={`w-6 h-6 transition-all ${isActive ? 'drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]' : ''}`} />
                                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    {isActive && (
                                        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(99,102,241,1)]" />
                                    )}
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
