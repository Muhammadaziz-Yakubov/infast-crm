import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    HiOutlineHome, HiOutlineUserGroup, HiOutlineAcademicCap, HiOutlineBookOpen,
    HiOutlineCreditCard, HiOutlineExclamationCircle, HiOutlineLogout,
    HiOutlineMoon, HiOutlineSun, HiOutlineX, HiOutlineCalendar, HiOutlineUserCircle,
    HiOutlineClipboardList, HiOutlineTrendingUp, HiOutlineShoppingBag,
    HiOutlineDatabase, HiOutlineShieldCheck, HiOutlineFire, HiOutlineCollection,
    HiOutlineSpeakerphone, HiOutlineUsers
} from 'react-icons/hi';


import Logo from '../infastacademy.jpg';

const adminMenu = [
    { path: '/', label: 'Bosh sahifa', icon: HiOutlineHome },
    { path: '/students', label: "O'quvchilar", icon: HiOutlineUserGroup },
    { path: '/users', label: 'Foydalanuvchilar', icon: HiOutlineUsers },
    { path: '/groups', label: 'Guruhlar', icon: HiOutlineAcademicCap },
    { path: '/courses', label: 'Kurslar', icon: HiOutlineBookOpen },
    { path: '/marketing', label: 'Marketing', icon: HiOutlineSpeakerphone },
    { path: '/payments', label: "To'lovlar", icon: HiOutlineCreditCard },
    { path: '/debtors', label: 'Qarzdorlar', icon: HiOutlineExclamationCircle },
    { path: '/attendance', label: 'Davomat', icon: HiOutlineCalendar },
    { path: '/curriculum', label: "O'quv rejasi", icon: HiOutlineCollection },
    { path: '/tasks', label: 'Vazifalar', icon: HiOutlineClipboardList },
    { path: '/tests', label: 'Testlar', icon: HiOutlineClipboardList },
    { path: '/events', label: 'Tadbirlar', icon: HiOutlineCalendar },
    { path: '/market-manager', label: 'Market', icon: HiOutlineShoppingBag },
    { path: '/coin-manager', label: 'Coin Boshqaruvi', icon: HiOutlineDatabase },
    { path: '/leaderboard', label: 'Reyting', icon: HiOutlineTrendingUp },

    { path: '/settings', label: 'Sozlamalar', icon: HiOutlineShieldCheck },

];

const studentMenu = [
    { path: '/', label: 'Asosiy sahifa', icon: HiOutlineHome },
    { path: '/courses', label: 'Mening kurslarim', icon: HiOutlineAcademicCap },
    { path: '/attendance', label: 'Davomat tarixi', icon: HiOutlineCalendar },
    { path: '/payments', label: "To'lovlar tarixi", icon: HiOutlineCreditCard },
    { path: '/tasks', label: 'Vazifalar', icon: HiOutlineClipboardList },
    { path: '/tests', label: 'Testlar', icon: HiOutlineClipboardList },
    { path: '/events', label: 'Tadbirlar', icon: HiOutlineCalendar },
    { path: '/market', label: 'Market', icon: HiOutlineShoppingBag },

    { path: '/leaderboard', label: 'Reyting', icon: HiOutlineTrendingUp },
    { path: '/profile', label: 'Mening profilim', icon: HiOutlineUserCircle },

];

const publicMenu = [
    { path: '/', label: 'Bosh sahifa', icon: HiOutlineHome },
    { path: '/login', label: 'Kirish', icon: HiOutlineLogout },
];

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();

    let menuItems = publicMenu;
    if (user) {
        menuItems = user.role === 'student' ? studentMenu : adminMenu;
    }

    return (
        <>
            {isOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
            <aside className={`fixed top-0 left-0 h-full w-[240px] bg-white/80 dark:bg-[#111111]/80 backdrop-blur-xl border-r border-gray-100 dark:border-zinc-900/80 z-50 transition-transform duration-200 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="p-6 pb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-gray-100 dark:border-zinc-800 transition-transform duration-300">
                            <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-none tracking-tight">InFast</h1>
                            <span className="text-[9px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">Academy</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-400">
                        <HiOutlineX className="w-5 h-5" />
                    </button>
                </div>
                <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-none">
                    {menuItems.map((item) => (
                        <NavLink key={item.path} to={item.path} onClick={onClose}
                            className={({ isActive }) => `flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-150 font-medium text-sm ${isActive ? 'bg-[#0066FF] text-white' : 'text-zinc-500 dark:text-zinc-400 hover:bg-gray-100/50 dark:hover:bg-zinc-800/50'}`}>
                            <item.icon className="w-4.5 h-4.5 flex-shrink-0 opacity-80" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-100 dark:border-zinc-900/80">
                    <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 mb-3 hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-colors">
                        <span className="text-xs font-medium text-zinc-500">{darkMode ? 'Yorug\' rejim' : 'Tungi rejim'}</span>
                        {darkMode ? <HiOutlineSun className="w-4 h-4 text-amber-500" /> : <HiOutlineMoon className="w-4 h-4 text-[#0066FF]" />}
                    </button>
                    {user ? (
                        <div className="flex items-center gap-2.5 px-1">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-semibold text-[#0066FF] text-sm">
                                {user?.fullName?.charAt(0) || user?.ism?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate dark:text-white leading-tight">{user?.fullName || user?.ism || 'Admin'}</p>
                                <p className="text-[9px] text-zinc-400 uppercase tracking-wider leading-none mt-0.5">{user?.role || 'Moderator'}</p>
                            </div>
                            <button onClick={logout} className="text-zinc-400 hover:text-red-500 transition-colors p-1">
                                <HiOutlineLogout className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <NavLink to="/login" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#0066FF] text-white font-medium text-xs hover:bg-[#0052cc] transition-all">
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