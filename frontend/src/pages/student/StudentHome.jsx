import { useState, useEffect } from 'react';
import { studentAPI, eventAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineCalendar, HiOutlineCreditCard,
    HiOutlineInformationCircle, HiOutlineCheckCircle, HiOutlineXCircle,
    HiOutlineClock, HiOutlineShoppingBag, HiOutlineLightningBolt,
    HiOutlineSparkles, HiOutlineLibrary, HiOutlineUserGroup,
    HiOutlineTrendingUp, HiOutlineArrowRight, HiOutlineLocationMarker
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const StudentHome = () => {
    const [data, setData] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const [dashRes, eventRes] = await Promise.all([
                studentAPI.getMyDashboard(),
                eventAPI.getUpcoming()
            ]);
            setData(dashRes.data.data);
            setUpcomingEvents(eventRes.data.data.slice(0, 3));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    if (loading) return <LoadingSpinner />;
    if (!data) return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <HiOutlineInformationCircle className="w-12 h-12 text-zinc-400 mb-3" />
            <h3 className="text-sm font-semibold text-zinc-550">Ma'lumot topilmadi</h3>
        </div>
    );

    const { student, payments, attendance } = data;

    // Mini components for layout
    const NavCard = ({ to, icon: Icon, title, color }) => (
        <Link
            to={to}
            className="p-5 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center space-y-2.5 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
        >
            <div className={`w-10 h-10 rounded-lg ${color.bg} ${color.text} flex items-center justify-center border border-zinc-200 dark:border-zinc-800`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-semibold text-gray-950 dark:text-zinc-300 uppercase tracking-widest">{title}</p>
        </Link>
    );

    return (
        <div className="min-h-screen bg-transparent pb-16 max-w-4xl mx-auto px-4 md:px-0">
            <div className="space-y-6 animate-fade-in">

                {/* --- 1. PREMIUM HEADER SECTION --- */}
                <div className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0066FF]/10 border border-[#0066FF]/20 text-[9px] font-semibold text-[#0066FF] uppercase tracking-wider">
                                Xush kelibsiz
                            </span>
                            <h2 className="text-2xl md:text-3xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">
                                Salom, {student.ism?.split(' ')[0]}! 👋
                            </h2>
                        </div>
                        <Link to="/profile">
                            <div className="w-12 h-12 rounded-full border border-gray-200 dark:border-zinc-800 overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                {student.profileImage ? (
                                    <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-base font-bold text-[#0066FF]">{student.ism?.charAt(0)}</span>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>

                {/* --- 2. STATS & BALANCE --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Coins Card */}
                    <div className="bg-white dark:bg-[#111111] rounded-xl p-6 border border-gray-200 dark:border-zinc-800 flex items-center justify-between shadow-sm">
                        <div className="space-y-1.5">
                            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest block">Mening balansim</span>
                            <div className="flex items-baseline gap-1.5">
                                <h3 className="text-4xl font-bold text-[#FF9500] tracking-tight">
                                    {student.coins || 0}
                                </h3>
                                <span className="text-lg">🪙</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                            <HiOutlineShoppingBag className="w-5 h-5 text-zinc-400" />
                        </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
                            <div className="w-8 h-8 rounded bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20 flex items-center justify-center">
                                <HiOutlineCheckCircle className="w-4 h-4" />
                            </div>
                            <div className="mt-4">
                                <span className="text-[9px] font-semibold text-zinc-450 uppercase tracking-widest block">Davomat foizi</span>
                                <p className="text-xl font-bold text-[#00C853] leading-none mt-1">
                                    {Math.round((attendance.filter(a => a.keldi).length / (attendance.length || 1)) * 100)}%
                                </p>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-200 dark:border-zinc-800 flex flex-col justify-between shadow-sm">
                            <div className="w-8 h-8 rounded bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 flex items-center justify-center">
                                <HiOutlineClipboardList className="w-4 h-4" />
                            </div>
                            <div className="mt-4">
                                <span className="text-[9px] font-semibold text-zinc-450 uppercase tracking-widest block">To'lovlar soni</span>
                                <p className="text-xl font-bold text-[#0066FF] leading-none mt-1">{payments.length} ta</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. UPCOMING EVENTS SECTION --- */}
                {upcomingEvents.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Kutilayotgan tadbirlar</h3>
                            <Link to="/events" className="text-[10px] font-semibold text-[#0066FF] hover:underline">Hammasi</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {upcomingEvents.map((event) => (
                                <Link 
                                    to="/events" 
                                    key={event._id} 
                                    className="group relative h-40 rounded-xl overflow-hidden bg-white dark:bg-[#111111] border border-gray-200 dark:border-zinc-800 shadow-sm block"
                                >
                                    {event.bannerUrl ? (
                                        <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
                                    ) : (
                                        <div className="w-full h-full bg-[#111111]" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                    
                                    <div className="absolute inset-0 p-5 flex flex-col justify-end space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="px-2 py-0.5 rounded bg-white/10 backdrop-blur-md text-[8px] font-semibold text-white uppercase tracking-wider border border-white/20">
                                                {new Date(event.startDate).toLocaleDateString()}
                                            </span>
                                            {event.isRegistered && (
                                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                            )}
                                        </div>
                                        <h4 className="font-semibold text-base text-white truncate">
                                            {event.title}
                                        </h4>
                                        <div className="flex items-center justify-between text-xs text-zinc-300">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <HiOutlineLocationMarker className="w-3.5 h-3.5 text-[#0066FF]" />
                                                <span className="truncate max-w-[120px]">{event.location}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <HiOutlineLightningBolt className="w-3.5 h-3.5 text-[#FF9500]" />
                                                <span>+{event.coinReward}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- 4. CLASS & GROUP INFO --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-5 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center border border-[#0066FF]/20">
                            <HiOutlineLibrary className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest block mb-0.5">Mening guruhim</span>
                            <p className="text-sm font-semibold text-gray-905 truncate">{student.guruh?.nomi || 'InFast Center'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center border border-[#FF9500]/20">
                            <HiOutlineClock className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest block mb-0.5">Dars vaqti</span>
                            <p className="text-sm font-semibold text-gray-905 truncate">{student.guruh?.jadval?.vaqt || 'Jadval yo\'q'}</p>
                        </div>
                    </div>
                </div>

                {/* --- 5. NAVIGATION UNIVERSE --- */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">Asosiy bo'limlar</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <NavCard
                            to="/market"
                            icon={HiOutlineShoppingBag}
                            title="Market"
                            color={{ bg: 'bg-[#FF3B30]/5 text-[#FF3B30]', text: 'text-[#FF3B30]' }}
                        />
                        <NavCard
                            to="/classmates"
                            icon={HiOutlineUserGroup}
                            title="Do'stlar"
                            color={{ bg: 'bg-[#0066FF]/5 text-[#0066FF]', text: 'text-[#0066FF]' }}
                        />
                        <NavCard
                            to="/leaderboard"
                            icon={HiOutlineTrendingUp}
                            title="Reyting"
                            color={{ bg: 'bg-[#00C853]/5 text-[#00C853]', text: 'text-[#00C853]' }}
                        />
                    </div>
                </div>

                {/* --- 6. ACTIVITY FEED & RECENT PAYMENTS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Attendance Activity */}
                    <div className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">Aktivlik logi</h3>
                            <span className="text-[9px] font-semibold bg-[#00C853]/10 text-[#00C853] px-2 py-0.5 rounded uppercase tracking-wider border border-[#00C853]/20">Oxirgi 10 dars</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {attendance.slice(0, 10).map((a, i) => (
                                <div
                                    key={i}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900"
                                    title={new Date(a.sana).toLocaleDateString()}
                                >
                                    {a.keldi ? <HiOutlineCheckCircle className="w-5 h-5 text-[#00C853]" /> : <HiOutlineXCircle className="w-5 h-5 text-[#FF3B30]" />}
                                </div>
                            ))}
                            {attendance.length === 0 && (
                                <div className="w-full text-center py-4 border border-dashed border-zinc-250 dark:border-zinc-800 rounded-lg">
                                    <p className="text-[10px] text-zinc-400 font-semibold uppercase">Hali davomat mavjud emas</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Payments Recap */}
                    <div className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-200 dark:border-zinc-800 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">To'lov tarixi</h3>
                            <Link to="/payments" className="w-7 h-7 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-[#0066FF] transition-all">
                                <HiOutlineArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-2">
                            {payments.slice(0, 2).map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-white dark:bg-zinc-800 text-[#00C853] flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                                            <HiOutlineCreditCard className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white">{formatMoney(p.summa)}</p>
                                            <p className="text-[9px] text-zinc-400 font-semibold">{new Date(p.sana).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="w-2 h-2 rounded-full bg-[#00C853]" />
                                </div>
                            ))}
                            {payments.length === 0 && (
                                <div className="text-center py-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-250 dark:border-zinc-850">
                                    <p className="text-[10px] text-zinc-400 font-semibold uppercase">To'lovlar topilmadi</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentHome;