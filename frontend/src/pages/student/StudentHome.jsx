import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineCreditCard,
    HiOutlinePhone, HiOutlineUserCircle, HiOutlineInformationCircle,
    HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowRight,
    HiOutlineClock, HiOutlineGift, HiOutlineShoppingBag
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
        <div className="min-h-screen bg-transparent pb-32 animate-fade-in lg:pb-10">
            <div className="space-y-8">
                {/* Featured Status Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 relative group overflow-hidden rounded-[2.5rem] bg-gray-900 p-8 md:p-12 text-white shadow-2xl border border-white/5">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                            <HiOutlineAcademicCap className="w-48 h-48 lg:w-64 lg:h-64" />
                        </div>
                        <div className="relative z-10 space-y-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[8px] lg:text-[10px] font-black uppercase tracking-widest italic">
                                {student.guruh?.nomi} • {student.guruh?.jadval?.vaqt}
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs lg:text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">O'quv holati</p>
                                <h3 className="text-3xl lg:text-5xl font-black uppercase italic tracking-tight">
                                    {student.tolovHolati === 'tolangan' ? "Ta'lim Faol ✅" : "Tizim Cheklangan ⚠️"}
                                </h3>
                            </div>
                            <div className="flex items-center gap-3 lg:gap-4 max-w-xl">
                                <div className="flex-1 p-3 lg:p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5">
                                    <p className="text-[8px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">To'lov kuni</p>
                                    <p className="text-base lg:text-xl font-black">{student.tolovKuni}-sana</p>
                                </div>
                                <div className="flex-1 p-3 lg:p-4 rounded-3xl bg-white/5 backdrop-blur-md border border-white/5">
                                    <p className="text-[8px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Guruhdoshlar</p>
                                    <p className="text-base lg:text-xl font-black">12+</p>
                                </div>
                                <div className="flex-1 p-3 lg:p-4 rounded-3xl bg-amber-500/10 backdrop-blur-md border border-amber-500/20">
                                    <p className="text-[8px] lg:text-[10px] font-black text-amber-500/80 uppercase tracking-widest mb-1 italic">Ballarim</p>
                                    <p className="text-base lg:text-xl font-black text-amber-500">{student.ball || 0}</p>
                                </div>
                                <div className="flex-1 p-3 lg:p-4 rounded-3xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20">
                                    <p className="text-[8px] lg:text-[10px] font-black text-emerald-500/80 uppercase tracking-widest mb-1 italic">Coinlarim</p>
                                    <p className="text-base lg:text-xl font-black text-emerald-500">{student.coins || 0} 🪙</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Sidebar */}
                    <div className="lg:col-span-4">
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 h-full">
                            <Link to="/tasks" className="p-6 md:p-8 rounded-[2rem] bg-indigo-500 text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all space-y-4 flex flex-col justify-end">
                                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/20 flex items-center justify-center">
                                    <HiOutlineCalendar className="w-6 h-6 lg:w-8 lg:h-8" />
                                </div>
                                <p className="text-sm lg:text-lg font-black uppercase tracking-widest italic">Vazifalar</p>
                            </Link>
                            <Link to="/attendance" className="p-6 md:p-8 rounded-[2rem] bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 active:scale-95 transition-all space-y-4 flex flex-col justify-end">
                                <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/20 flex items-center justify-center">
                                    <HiOutlineCheckCircle className="w-6 h-6 lg:w-8 lg:h-8" />
                                </div>
                                <p className="text-sm lg:text-lg font-black uppercase tracking-widest italic">Davomat</p>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Progress (Davomat) Section */}
                    <div className="lg:col-span-8 bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 md:p-10 border border-gray-100 dark:border-white/5 shadow-sm space-y-8 flex flex-col justify-center">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg lg:text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Oylik Davomat</h3>
                            <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                                {Math.round((attendance.filter(a => a.keldi).length / (attendance.length || 1)) * 100)}%
                            </span>
                        </div>
                        <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                            {attendance.slice(0, 12).map((a, i) => (
                                <div key={i} className={`flex-1 min-w-[40px] h-12 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all ${a.keldi ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-red-500/20 text-red-500'}`}>
                                    {a.keldi ? <HiOutlineCheckCircle className="w-5 h-5 lg:w-7 lg:h-7" /> : <HiOutlineXCircle className="w-5 h-5 lg:w-7 lg:h-7" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                        <Link to="/wheel" className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl shadow-amber-500/20 active:scale-95 transition-all space-y-3 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <HiOutlineGift className="w-7 h-7" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest italic leading-none">Omad G'ildiragi</p>
                        </Link>
                        <Link to="/market" className="p-6 rounded-[2rem] bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-xl shadow-rose-500/20 active:scale-95 transition-all space-y-3 flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                                <HiOutlineShoppingBag className="w-7 h-7" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest italic leading-none">Coin Market</p>
                        </Link>
                    </div>
                </div>

                {/* Finance Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-lg lg:text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight underline-offset-8 decoration-primary-500/30 underline">So'nggi To'lovlar</h3>
                        <Link to="/payments" className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Hammasi</Link>
                    </div>
                    {payments.length === 0 ? (
                        <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-10 text-center border-2 border-dashed border-gray-100 dark:border-dark-700">
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Ma'lumotlar yo'q</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {payments.slice(0, 3).map((p, i) => (
                                <div key={i} className="bg-white dark:bg-dark-800 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm active:scale-[0.98] transition-all flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-dark-700">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-emerald-500">
                                            <HiOutlineCreditCard className="w-6 h-6 lg:w-7 lg:h-7" />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 dark:text-white tracking-tight lg:text-lg">{formatMoney(p.summa)}</p>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{new Date(p.sana).toLocaleDateString('uz')}</p>
                                        </div>
                                    </div>
                                    <span className="text-[8px] lg:text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full uppercase tracking-widest">Tasdiqlangan</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentHome;
