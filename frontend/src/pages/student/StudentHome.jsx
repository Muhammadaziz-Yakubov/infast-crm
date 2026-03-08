import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineCreditCard,
    HiOutlineInformationCircle, HiOutlineCheckCircle, HiOutlineXCircle,
    HiOutlineClock, HiOutlineGift, HiOutlineShoppingBag, HiOutlineLightningBolt,
    HiOutlineSparkles, HiOutlineStar, HiOutlineLibrary, HiOutlineUserGroup
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
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <HiOutlineInformationCircle className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Ma'lumot topilmadi</h3>
        </div>
    );

    const { student, payments, attendance } = data;

    return (
        <div className="min-h-screen bg-transparent pb-32 lg:pb-10">
            <div className="space-y-6">

                {/* 1. Header & Status Section */}
                <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Salom, {student.ism?.split(' ')[0]}! 👋
                            </h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">InFast Academy talabasi</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${student.tolovHolati === 'tolangan' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-100 text-red-600 dark:bg-red-500/10'}`}>
                            {student.tolovHolati === 'tolangan' ? 'Faol O\'quvchi' : 'Tizim Cheklangan'}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 rounded-[1.5rem] bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <HiOutlineLibrary className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Guruh</p>
                                <p className="text-xs font-black text-gray-900 dark:text-white truncate">{student.guruh?.nomi || 'Nomalum'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-[1.5rem] bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
                                <HiOutlineClock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-1">Dars Vaqti</p>
                                <p className="text-xs font-black text-gray-900 dark:text-white">{student.guruh?.jadval?.vaqt || '--:--'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Rewards & Progress Section */}
                <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-orange-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                        <HiOutlineSparkles className="w-32 h-32" />
                    </div>

                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">
                                    lvl {student.level || 1}
                                </div>
                                <div className="text-primary-100 text-[10px] font-bold uppercase tracking-widest">
                                    {student.xp || 0} XP
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-end">
                                    <p className="text-xs font-bold uppercase tracking-widest text-primary-100 italic">O'zlashtirish</p>
                                    <span className="text-xs font-black">{student.progress || 0}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000"
                                        style={{ width: `${student.progress || 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-px h-16 bg-white/10 mx-2" />

                        <div className="text-right">
                            <p className="text-[9px] font-bold text-primary-100 uppercase tracking-widest mb-1 italic">Mening Balansim</p>
                            <p className="text-3xl font-black text-amber-400 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">{student.coins || 0} 🪙</p>
                        </div>
                    </div>
                </div>

                {/* 3. Navigation Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <Link to="/tasks" className="p-5 rounded-[2rem] bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-2 group active:scale-95 transition-all shadow-sm hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-500/20 text-primary-600 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                            <HiOutlineCalendar className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Vazifalar</p>
                    </Link>
                    <Link to="/attendance" className="p-5 rounded-[2rem] bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-2 group active:scale-95 transition-all shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:-rotate-6">
                            <HiOutlineCheckCircle className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Davomat</p>
                    </Link>
                    <Link to="/market" className="p-5 rounded-[2rem] bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-2 group active:scale-95 transition-all shadow-sm hover:shadow-xl hover:shadow-rose-500/5 hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                            <HiOutlineShoppingBag className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Market</p>
                    </Link>
                    <Link to="/wheel" className="p-5 rounded-[2rem] bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-2 group active:scale-95 transition-all shadow-sm hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all transform group-hover:-rotate-6">
                            <HiOutlineGift className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Sovg'a</p>
                    </Link>
                    <Link to="/classmates" className="p-5 rounded-[2rem] bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-2 group active:scale-95 transition-all shadow-sm hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-500/20 text-primary-600 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:rotate-6">
                            <HiOutlineUserGroup className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">Guruhdoshlar</p>
                    </Link>
                </div>

                {/* 4. Attendance Summary */}
                <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Oylik Davomat</h3>
                        <div className="text-right">
                            <p className="text-lg font-black text-emerald-500 leading-none">
                                {Math.round((attendance.filter(a => a.keldi).length / (attendance.length || 1)) * 100)}%
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {attendance.slice(0, 8).map((a, i) => (
                            <div key={i} className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${a.keldi ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                {a.keldi ? <HiOutlineCheckCircle className="w-6 h-6" /> : <HiOutlineXCircle className="w-6 h-6" />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 5. Recent Payments Section */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic">So'nggi To'lovlar</h3>
                        <Link to="/payments" className="text-[10px] font-black text-primary-500 uppercase">Hammasi</Link>
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded-[2rem] divide-y divide-gray-100 dark:divide-white/5 border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                        {payments.slice(0, 2).map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-dark-900/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-emerald-500">
                                        <HiOutlineCreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-900 dark:text-white">{formatMoney(p.summa)}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(p.sana).toLocaleDateString('uz')}</p>
                                    </div>
                                </div>
                                <span className="text-[8px] font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full uppercase italic font-black">Tasdiqlangan</span>
                            </div>
                        ))}
                        {payments.length === 0 && (
                            <div className="p-8 text-center">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Hali to'lovlar mavjud emas</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default StudentHome;
