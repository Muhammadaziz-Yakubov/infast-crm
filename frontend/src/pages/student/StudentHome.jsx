import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineCreditCard,
    HiOutlineInformationCircle, HiOutlineCheckCircle, HiOutlineXCircle,
    HiOutlineClock, HiOutlineGift, HiOutlineShoppingBag, HiOutlineLightningBolt,
    HiOutlineSparkles, HiOutlineStar, HiOutlineLibrary, HiOutlineUserGroup,
    HiOutlineTrendingUp, HiOutlineArrowRight, HiOutlineChatAlt2, HiOutlineClipboardList
} from 'react-icons/hi';
import { Link } from 'react-router-dom';

const StudentHome = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await studentAPI.getMyDashboard();
            setData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    if (loading) return <LoadingSpinner text="Dashboard yuklanmoqda..." />;
    if (!data) return (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <HiOutlineInformationCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest italic">Ma'lumot topilmadi</h3>
        </div>
    );

    const { student, payments, attendance } = data;

    // Mini components for layout
    const NavCard = ({ to, icon: Icon, title, color }) => (
        <Link
            to={to}
            className={`p-6 rounded-[2.5rem] bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-3 group active:scale-95 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-1`}
        >
            <div className={`w-14 h-14 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <Icon className="w-7 h-7" />
            </div>
            <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-[0.2em] italic">{title}</p>
        </Link>
    );

    return (
        <div className="min-h-screen bg-transparent pb-32 lg:pb-10 max-w-4xl mx-auto px-1">
            <div className="space-y-8 animate-fade-in">

                {/* --- 1. PREMIUM HEADER SECTION --- */}
                <div className="relative pt-6 px-2">
                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] italic mb-1 block">Xush kelibsiz!</span>
                            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                                Salom, {student.ism?.split(' ')[0]}!👋
                            </h2>
                        </div>
                        <Link to="/profile" className="relative group">
                            <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-primary-500 to-orange-600 p-1 shadow-2xl transition-transform duration-500 group-hover:scale-110 rotate-3 group-hover:rotate-0">
                                <div className="w-full h-full rounded-[1.6rem] overflow-hidden bg-gray-900 flex items-center justify-center">
                                    {student.profileImage ? (
                                        <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-black text-white italic">{student.ism?.charAt(0)}</span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-gray-50 dark:border-dark-950 rounded-full shadow-lg"></div>
                        </Link>
                    </div>
                </div>

                {/* --- 2. STATS & PROGRESS DASHBOARD (Integrated Cards) --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* XP & Level Card */}
                    <div className="bg-gradient-to-br from-gray-900 to-primary-950 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                            <HiOutlineTrendingUp className="w-40 h-40" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="px-5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                                    <span className="text-xs font-black uppercase tracking-widest italic">{student.level || 1} Daraja</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest italic mb-0.5">Tajriba XP</p>
                                    <p className="text-2xl font-black italic">{student.xp || 0}<span className="text-xs text-primary-400 ml-1">XP</span></p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-200">Daraja Rivoji</p>
                                    <span className="text-xs font-black italic">{student.progress || 0}%</span>
                                </div>
                                <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-400 to-orange-400 rounded-full shadow-[0_0_15px_rgba(251,146,60,0.4)] transition-all duration-1000 ease-out relative"
                                        style={{ width: `${student.progress || 0}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-widest italic">
                                    <span>LVL {student.level}</span>
                                    <span>KEYINGI: {student.nextXP} XP</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Balance & Quick Info Group */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Coins Card */}
                        <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <HiOutlineSparkles className="w-6 h-6" />
                            </div>
                            <div className="pt-4">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic mb-1">Mening Balansim</p>
                                <p className="text-3xl font-black text-gray-900 dark:text-white leading-none">{student.coins || 0}<span className="text-lg ml-1">🪙</span></p>
                            </div>
                        </div>
                        {/* Attendance Card */}
                        <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-6 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:-rotate-12 transition-transform">
                                <HiOutlineTrendingUp className="w-6 h-6" />
                            </div>
                            <div className="pt-4">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic mb-1">Davomat Reytingi</p>
                                <p className="text-3xl font-black text-emerald-500 leading-none">
                                    {Math.round((attendance.filter(a => a.keldi).length / (attendance.length || 1)) * 100)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. CLASS & GROUP INFO (Horizontal Scroll or Compact Grid) --- */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 shadow-sm group hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-500/10 text-primary-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                            <HiOutlineLibrary className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1 tracking-widest italic">Mening Guruhim</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white truncate uppercase italic">{student.guruh?.nomi || 'InFast'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 shadow-sm group hover:bg-gray-50 dark:hover:bg-dark-900 transition-colors">
                        <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                            <HiOutlineClock className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1 tracking-widest italic">Dars Vaqti</p>
                            <p className="text-sm font-black text-gray-900 dark:text-white truncate italic">{student.guruh?.jadval?.vaqt || '00:00'}</p>
                        </div>
                    </div>
                </div>

                {/* --- 4. NAVIGATION UNIVERSE --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic mb-1 block">Asosiy Bo'limlar</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        <NavCard
                            to="/tasks"
                            icon={HiOutlineClipboardList}
                            title="Vazifalar"
                            color={{ bg: 'bg-primary-100 dark:bg-primary-500/20', text: 'text-primary-600' }}
                        />
                        <NavCard
                            to="/attendance"
                            icon={HiOutlineCheckCircle}
                            title="Davomat"
                            color={{ bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-600' }}
                        />
                        <NavCard
                            to="/market"
                            icon={HiOutlineShoppingBag}
                            title="Market"
                            color={{ bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-600' }}
                        />
                        <NavCard
                            to="/wheel"
                            icon={HiOutlineGift}
                            title="Omad"
                            color={{ bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-600' }}
                        />
                        <NavCard
                            to="/community"
                            icon={HiOutlineChatAlt2}
                            title="Jamiyat"
                            color={{ bg: 'bg-indigo-100 dark:bg-indigo-500/20', text: 'text-indigo-600' }}
                        />
                        <NavCard
                            to="/classmates"
                            icon={HiOutlineUserGroup}
                            title="Do'stlar"
                            color={{ bg: 'bg-sky-100 dark:bg-sky-500/20', text: 'text-sky-600' }}
                        />
                    </div>
                </div>

                {/* --- 5. ACTIVITY FEED & RECENT PAYMENTS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Attendance Activity */}
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-white/5 group">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase italic tracking-widest">Aktivlik Logi</h3>
                            <div className="text-[8px] font-black bg-emerald-500/10 text-emerald-600 px-3 py-1 rounded-full uppercase italic">Oxirgi 10 dars</div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {attendance.slice(0, 10).map((a, i) => (
                                <div
                                    key={i}
                                    className={`relative group/item cursor-help`}
                                    title={new Date(a.sana).toLocaleDateString()}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${a.keldi ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-red-100 dark:bg-red-500/10 text-red-500'}`}>
                                        {a.keldi ? <HiOutlineCheckCircle className="w-6 h-6" /> : <HiOutlineXCircle className="w-6 h-6" />}
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white dark:bg-dark-800 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        <div className={`w-1.5 h-1.5 rounded-full ${a.keldi ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                    </div>
                                </div>
                            ))}
                            {attendance.length === 0 && (
                                <div className="w-full text-center py-4 border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl">
                                    <p className="text-[10px] font-black text-gray-400 uppercase italic">Hali davomat mavjud emas</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Payments Recap */}
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between mb-8 text-center md:text-left">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase italic tracking-widest">To'lov Tarixi</h3>
                            <Link to="/payments" className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-gray-400 hover:bg-primary-500 hover:text-white transition-all shadow-inner">
                                <HiOutlineArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {payments.slice(0, 2).map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-dark-900/50 border border-transparent hover:border-emerald-500/20 transition-all group/p">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-800 text-emerald-500 flex items-center justify-center shadow-sm group-hover/p:scale-110 transition-transform">
                                            <HiOutlineCreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-white">{formatMoney(p.summa)}</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest italic">{new Date(p.sana).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                </div>
                            ))}
                            {payments.length === 0 && (
                                <div className="text-center py-6 bg-gray-50/50 dark:bg-dark-900/50 rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">To'lovlar topilmadi</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- 6. BANNER / AD SECTION (Optional) --- */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-2xl shadow-emerald-500/20">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[8px] font-black uppercase tracking-widest backdrop-blur-sm">
                                <HiOutlineStar className="w-3 h-3 text-amber-300" />
                                Yangi Omad G'ildiragi
                            </div>
                            <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Omadingizni hoziroq sinab ko'ring!</h4>
                            <p className="text-emerald-100 text-[10px] font-bold uppercase tracking-widest italic">Bugun 3 marotaba aylantirish huquqingiz bor</p>
                        </div>
                        <Link to="/wheel" className="px-8 py-4 bg-white text-emerald-700 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all italic">
                            Aylantirish 🎡
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentHome;