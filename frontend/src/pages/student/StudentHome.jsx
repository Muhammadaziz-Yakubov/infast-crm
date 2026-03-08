import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineCreditCard,
    HiOutlinePhone, HiOutlineUserCircle, HiOutlineInformationCircle,
    HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowRight,
    HiOutlineClock, HiOutlineGift, HiOutlineShoppingBag, HiOutlineLightningBolt,
    HiOutlineUserGroup, HiOutlineShieldCheck, HiOutlineSparkles
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

    if (loading) return <LoadingSpinner text="Ma'lumotlar yuklanmoqda..." />;
    if (!data) return (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in text-center">
            <HiOutlineInformationCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Ma'lumot topilmadi</h3>
        </div>
    );

    const { student, payments, attendance } = data;

    return (
        <div className="min-h-screen bg-transparent pb-32 animate-fade-in lg:pb-10 -mt-2">
            <div className="space-y-6">

                {/* Greeting & Quick Stats */}
                <div className="flex items-center justify-between px-1">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                            Salom, {student.ism?.split(' ')[0]}! <span className="animate-bounce">👋</span>
                        </h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest italic">O'qishlaringiz qanday ketmoqda?</p>
                    </div>
                </div>

                {/* Main Card - Membership Style */}
                <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 md:p-10 text-white shadow-2xl border border-white/10">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                        <HiOutlineAcademicCap className="w-48 h-48" />
                    </div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] pointer-events-none" />

                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest italic">
                                    <HiOutlineShieldCheck className="w-3.5 h-3.5 text-primary-400" />
                                    {student.guruh?.nomi}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Sizning holatingiz</p>
                                    <h3 className="text-3xl font-black uppercase italic tracking-tight flex items-center gap-3">
                                        {student.tolovHolati === 'tolangan' ? "Faol" : "Cheklangan"}
                                        <div className={`w-3 h-3 rounded-full ${student.tolovHolati === 'tolangan' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                    </h3>
                                </div>
                            </div>
                            <div className="w-16 h-16 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-2 flex items-center justify-center">
                                <div className="text-center">
                                    <p className="text-[8px] font-black uppercase text-gray-400 italic leading-none mb-1">LVL</p>
                                    <p className="text-2xl font-black leading-none">{student.level || 1}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5 space-y-2">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Keyingi dars</p>
                                <div className="flex items-center gap-2 text-primary-400">
                                    <HiOutlineClock className="w-4 h-4" />
                                    <p className="text-sm font-black">{student.guruh?.jadval?.vaqt}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-3xl bg-amber-500/10 backdrop-blur-md border border-amber-500/20 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic">Tajriba</p>
                                    <p className="text-[9px] font-black text-amber-500/60">{student.xp || 0} XP</p>
                                </div>
                                <div className="h-2 w-full bg-amber-500/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${student.progress || 0}%` }}
                                    />
                                </div>
                                <p className="text-[7px] font-black text-amber-500/50 uppercase text-right">{student.progress || 0}% progress</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Action Grid */}
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { to: '/tasks', icon: HiOutlineCalendar, label: 'Vazifalar', color: 'bg-indigo-500' },
                        { to: '/attendance', icon: HiOutlineCheckCircle, label: 'Davomat', color: 'bg-emerald-500' },
                        { to: '/market', icon: HiOutlineShoppingBag, label: 'Market', color: 'bg-rose-500' },
                        { to: '/wheel', icon: HiOutlineGift, label: 'Sovg\'a', color: 'bg-amber-500' },
                    ].map((item, idx) => (
                        <Link
                            key={idx}
                            to={item.to}
                            className="flex flex-col items-center gap-2 group active:scale-95 transition-all"
                        >
                            <div className={`w-14 h-14 rounded-2xl ${item.color} text-white shadow-lg flex items-center justify-center group-hover:-translate-y-1 transition-transform`}>
                                <item.icon className="w-7 h-7" />
                            </div>
                            <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider text-center">{item.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Second Row Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Attendance Analysis */}
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <HiOutlineSparkles className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Oylik Davomat</h3>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xl font-black text-emerald-500 italic">
                                    {Math.round((attendance.filter(a => a.keldi).length / (attendance.length || 1)) * 100)}%
                                </span>
                                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest italic">Muvaffaqiyat</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                            {attendance.slice(0, 10).map((a, i) => (
                                <div
                                    key={i}
                                    className={`flex-shrink-0 w-10 h-14 rounded-2xl flex flex-col items-center justify-center transition-all ${a.keldi ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-red-500/10 text-red-500'}`}
                                >
                                    <span className="text-[7px] font-black mb-1 opacity-60 uppercase">{i + 1}</span>
                                    {a.keldi ? <HiOutlineCheckCircle className="w-5 h-5" /> : <HiOutlineXCircle className="w-5 h-5" />}
                                </div>
                            ))}
                            {attendance.length === 0 && (
                                <p className="text-[10px] font-black text-gray-400 uppercase italic py-4">Hali ma'lumot yo'q</p>
                            )}
                        </div>
                    </div>

                    {/* Finance Mini List */}
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <HiOutlineCreditCard className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Hamyon</h3>
                            </div>
                            <Link to="/payments" className="text-[9px] font-black text-primary-500 uppercase tracking-tighter hover:underline">Tarix</Link>
                        </div>

                        <div className="space-y-3">
                            {payments.slice(0, 2).map((p, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-dark-900 border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-800 flex items-center justify-center text-emerald-500">
                                            <HiOutlineCheckCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-gray-900 dark:text-white">{formatMoney(p.summa)}</p>
                                            <p className="text-[8px] font-black text-gray-400 uppercase">{new Date(p.sana).toLocaleDateString('uz')}</p>
                                        </div>
                                    </div>
                                    <span className="text-[7px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase italic">Tasdiq</span>
                                </div>
                            ))}
                            {payments.length === 0 && (
                                <div className="text-center py-4 space-y-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase italic">To'lovlar topilmadi</p>
                                    <button className="text-[8px] font-black bg-primary-500 text-white px-4 py-2 rounded-full uppercase tracking-widest">To'lov qilish</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Extra Stats / Motivation */}
                <div className="p-6 rounded-[2.5rem] bg-indigo-600 text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
                        <HiOutlineLightningBolt className="w-24 h-24" />
                    </div>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                            <HiOutlineSparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-indigo-200 tracking-[0.2em] mb-0.5">Motivatsiya</p>
                            <p className="text-xs font-bold leading-relaxed">Har kuni 1% yaxshiroq bo'lish, bir yilda 37 barobar kuchliroq bo'lish demakdir! 🚀</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentHome;

