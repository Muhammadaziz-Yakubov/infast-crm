import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    HiOutlineHome, HiOutlineUserGroup, HiOutlineAcademicCap,
    HiOutlineBookOpen, HiOutlineCreditCard, HiOutlineExclamationCircle,
    HiOutlineLogout, HiOutlineMoon, HiOutlineSun, HiOutlineX,
    HiOutlineMenu, HiOutlineCalendar, HiOutlineUserCircle, HiOutlineClipboardList,
    HiOutlineTrendingUp, HiOutlineShoppingBag
} from 'react-icons/hi';

const adminMenu = [
    { path: '/', label: 'Bosh sahifa', icon: HiOutlineHome },
    { path: '/students', label: "O'quvchilar", icon: HiOutlineUserGroup },
    { path: '/groups', label: 'Guruhlar', icon: HiOutlineAcademicCap },
    { path: '/courses', label: 'Kurslar', icon: HiOutlineBookOpen },
    { path: '/payments', label: "To'lovlar", icon: HiOutlineCreditCard },
    { path: '/debtors', label: 'Qarzdorlar', icon: HiOutlineExclamationCircle },
    { path: '/attendance', label: 'Davomat', icon: HiOutlineCalendar },
    { path: '/tasks', label: 'Vazifalar', icon: HiOutlineClipboardList },
    { path: '/rating', label: 'Reyting', icon: HiOutlineTrendingUp },
    { path: '/market-manager', label: 'Market', icon: HiOutlineShoppingBag },
];

const studentMenu = [
    { path: '/', label: 'Asosiy sahifa', icon: HiOutlineHome },
    { path: '/courses', label: 'Mening kurslarim', icon: HiOutlineAcademicCap },
    { path: '/attendance', label: 'Davomat tarixi', icon: HiOutlineCalendar },
    { path: '/payments', label: "To'lovlar tarixi", icon: HiOutlineCreditCard },
    { path: '/tasks', label: 'Vazifalar', icon: HiOutlineClipboardList },
    { path: '/rating', label: 'Reyting', icon: HiOutlineTrendingUp },
    { path: '/market', label: 'Market', icon: HiOutlineShoppingBag },
    { path: '/profile', label: 'Mening profilim', icon: HiOutlineUserCircle },
];


const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const location = useLocation();

    const menuItems = user?.role === 'student' ? studentMenu : adminMenu;


    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-r 
        border-gray-200/50 dark:border-white/5 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo Section */}
                <div className="p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 group">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 
                flex items-center justify-center shadow-xl shadow-primary-500/30 transform transition-transform group-hover:rotate-6">
                                <span className="text-white font-black text-xl tracking-tighter">IF</span>
                            </div>
                            <div className="leading-tight">
                                <h1 className="font-black text-xl tracking-tight gradient-text">InFast CRM</h1>
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-gray-500">Premium System</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="lg:hidden p-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-gray-500">
                            <HiOutlineX className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group font-bold text-sm
                                ${isActive
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800 hover:text-gray-900 dark:hover:text-white'}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary-500'}`} />
                                    <span>{item.label}</span>
                                    {item.path === '/debtors' && !isActive && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse" />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="p-4 mt-auto">
                    <div className="bg-gray-50/50 dark:bg-dark-800/50 rounded-3xl p-2 space-y-1 border border-gray-100 dark:border-white/5">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-600 dark:text-gray-400
                                hover:bg-white dark:hover:bg-dark-700 hover:shadow-sm transition-all duration-300 group"
                        >
                            <div className={`p-2 rounded-xl transition-colors ${darkMode ? 'bg-amber-500/10' : 'bg-primary-500/10'}`}>
                                {darkMode ? (
                                    <HiOutlineSun className="w-4 h-4 text-amber-500 animate-spin-slow" />
                                ) : (
                                    <HiOutlineMoon className="w-4 h-4 text-primary-500" />
                                )}
                            </div>
                            <span className="text-sm font-bold">
                                {darkMode ? 'Yorug rejim' : 'Tungi rejim'}
                            </span>
                        </button>

                        {/* User Profile */}
                        <div className="p-1">
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-dark-800 shadow-sm border border-gray-50 dark:border-white/5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-700 dark:to-dark-600 
                                    flex items-center justify-center text-primary-600 dark:text-primary-400 font-black text-sm shadow-inner">
                                    {user?.fullName?.charAt(0) || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                                        {user?.fullName || 'Administrator'}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Admin</p>
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 
                                        text-gray-400 hover:text-red-500 transition-all duration-300 hover:rotate-90"
                                    title="Chiqish"
                                >
                                    <HiOutlineLogout className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
