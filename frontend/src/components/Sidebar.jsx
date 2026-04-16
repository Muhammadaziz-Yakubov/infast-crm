import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    HiOutlineHome,
    HiOutlineUserGroup,
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlineCreditCard,
    HiOutlineExclamationCircle,
    HiOutlineLogout,
    HiOutlineMoon,
    HiOutlineSun,
    HiOutlineX,
    HiOutlineMenu,
    HiOutlineCalendar,
    HiOutlineUserCircle,
    HiOutlineClipboardList,
    HiOutlineTrendingUp,
    HiOutlineShoppingBag,
    HiOutlineDatabase,
    HiOutlinePresentationChartLine,
    HiOutlineChatAlt2,
    HiOutlineSparkles
} from 'react-icons/hi';

import Logo from '../infastacademy.jpg';

const adminMenu = [
    { path: '/', label: 'Bosh sahifa', icon: HiOutlineHome },
    { path: '/marketing', label: 'Marketing', icon: HiOutlinePresentationChartLine },
    { path: '/students', label: "O'quvchilar", icon: HiOutlineUserGroup },
    { path: '/groups', label: 'Guruhlar', icon: HiOutlineAcademicCap },
    { path: '/mavzular', label: 'Mavzular & Progress', icon: HiOutlineTrendingUp },
    { path: '/courses', label: 'Kurslar', icon: HiOutlineBookOpen },
    { path: '/payments', label: "To'lovlar", icon: HiOutlineCreditCard },
    { path: '/debtors', label: 'Qarzdorlar', icon: HiOutlineExclamationCircle },
    { path: '/attendance', label: 'Davomat', icon: HiOutlineCalendar },
    { path: '/tasks', label: 'Vazifalar', icon: HiOutlineClipboardList },
    { path: '/homework', label: 'AI Homework', icon: HiOutlineSparkles },
    { path: '/events', label: 'Tadbirlar', icon: HiOutlineCalendar },

    { path: '/market-manager', label: 'Market', icon: HiOutlineShoppingBag },
    { path: '/coin-manager', label: 'Coin Boshqaruvi', icon: HiOutlineDatabase },
    { path: '/leaderboard', label: 'Reyting', icon: HiOutlineTrendingUp },
    { path: '/community', label: 'Community', icon: HiOutlineChatAlt2 },
];

const studentMenu = [
    { path: '/', label: 'Asosiy sahifa', icon: HiOutlineHome },
    { path: '/courses', label: 'Mening kurslarim', icon: HiOutlineAcademicCap },
    { path: '/attendance', label: 'Davomat tarixi', icon: HiOutlineCalendar },
    { path: '/payments', label: "To'lovlar tarixi", icon: HiOutlineCreditCard },
    { path: '/tasks', label: 'Vazifalar', icon: HiOutlineClipboardList },
    { path: '/events', label: 'Tadbirlar', icon: HiOutlineCalendar },

    { path: '/market', label: 'Market', icon: HiOutlineShoppingBag },
    { path: '/leaderboard', label: 'Reyting', icon: HiOutlineTrendingUp },
    { path: '/community', label: 'Community', icon: HiOutlineChatAlt2 },
    { path: '/profile', label: 'Mening profilim', icon: HiOutlineUserCircle },
];

const publicMenu = [
    { path: '/', label: 'Bosh sahifa', icon: HiOutlineHome },
    { path: '/community', label: 'Community', icon: HiOutlineChatAlt2 },
    { path: '/login', label: 'Kirish', icon: HiOutlineLogout },
];

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const location = useLocation();

    let menuItems = publicMenu;
    if (user) {
        menuItems = user.role === 'student' ? studentMenu : adminMenu;
    }

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-dark-900 border-r 
                    border-gray-200 dark:border-white/5 z-50 transition-transform duration-300
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="p-8 pb-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-2xl shadow-primary-500/20 rotate-3 hover:rotate-0 transition-transform duration-500 border-2 border-primary-500/20">
                            <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">
                                In<span className="text-primary-500">Fast</span>
                            </h1>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Academy</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2.5 rounded-xl bg-gray-50 dark:bg-dark-800 text-gray-400">
                        <HiOutlineX className="w-6 h-6" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-bold text-sm
                                ${isActive
                                    ? 'bg-primary-500 text-white shadow-lg'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'}`
                            }
                        >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User & Mode */}
                <div className="p-6 border-t border-gray-100 dark:border-white/5">
                    <button
                        onClick={toggleDarkMode}
                        className="w-full flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-dark-800 mb-4"
                    >
                        <span className="text-xs font-bold text-gray-500">{darkMode ? 'Yorug rejim' : 'Tungi rejim'}</span>
                        {darkMode ? <HiOutlineSun className="w-5 h-5 text-amber-500" /> : <HiOutlineMoon className="w-5 h-5 text-primary-500" />}
                    </button>

                    {user ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-700 flex items-center justify-center font-bold text-primary-500">
                                {user?.fullName?.charAt(0) || user?.ism?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate dark:text-white">{user?.fullName || user?.ism || 'Admin'}</p>
                                <p className="text-[10px] text-gray-400 uppercase">{user?.role || 'Moderator'}</p>
                            </div>
                            <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
                                <HiOutlineLogout className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <NavLink
                            to="/login"
                            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl bg-primary-500 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                        >
                            <HiOutlineLogout className="w-4 h-4" />
                            Kirish
                        </NavLink>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
