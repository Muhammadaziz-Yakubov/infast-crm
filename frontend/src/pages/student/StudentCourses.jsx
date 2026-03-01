import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineAcademicCap, HiOutlineCalendar, HiOutlineUserCircle, HiOutlineClock
} from 'react-icons/hi';

const StudentCourses = () => {
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

    if (loading) return <LoadingSpinner />;
    if (!data) return null;

    const { student } = data;

    return (
        <div className="min-h-screen bg-transparent pb-32 animate-fade-in lg:pb-10">
            {/* Native style Header */}
            <header className="sticky top-0 z-[40] bg-gray-50/80 dark:bg-dark-900/80 backdrop-blur-xl pt-4 pb-4 mb-8 lg:static lg:bg-transparent lg:backdrop-blur-none lg:px-0">
                <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] italic">O'quv kursi</p>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Kurs & <span className="text-primary-500 text-shadow-sm">Guruh</span></h1>
            </header>

            <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Course Main Card */}
                    <div className="lg:col-span-12 xl:col-span-8 bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 md:p-12 border border-gray-100 dark:border-white/5 shadow-2xl space-y-8 overflow-hidden relative">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-[2rem] bg-primary-500 flex items-center justify-center text-white shadow-xl shadow-primary-500/20">
                                <HiOutlineAcademicCap className="w-10 h-10" />
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 px-4 py-1.5 rounded-full">{student.guruh?.nomi}</span>
                                <h2 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight mt-2">{student.kurs?.nomi}</h2>
                            </div>
                        </div>

                        <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed italic text-lg lg:text-xl border-l-4 border-gray-100 dark:border-dark-700 pl-6 max-w-3xl">
                            {student.kurs?.tavsif || "Ushbu kurs sizga zamonaviy bilimlar va amaliy ko'nikmalar berish uchun mo'ljallangan."}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                            <div className="p-6 lg:p-8 rounded-[2.5rem] bg-gray-50 dark:bg-dark-900/50 flex flex-col gap-4 border border-transparent hover:border-indigo-500/10 transition-colors">
                                <HiOutlineUserCircle className="w-8 h-8 text-indigo-500" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Kurs Ustozingiz</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white truncate">{student.guruh?.oqituvchi || "Ma'lum emas"}</p>
                                </div>
                            </div>
                            <div className="p-6 lg:p-8 rounded-[2.5rem] bg-gray-50 dark:bg-dark-900/50 flex flex-col gap-4 border border-transparent hover:border-amber-500/10 transition-colors">
                                <HiOutlineClock className="w-8 h-8 text-amber-500" />
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Kurs Davomiyligi</p>
                                    <p className="text-lg font-black text-gray-900 dark:text-white">{student.kurs?.davomiyligi} oy</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Section */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                        <h3 className="text-lg lg:text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-widest ml-4 flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-pulse" />
                            Dars Jadvali
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
                            <div className="relative overflow-hidden p-8 lg:p-10 rounded-[2.5rem] bg-gray-900 text-white shadow-xl transform active:scale-[0.98] lg:hover:scale-[1.02] transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                                        <HiOutlineCalendar className="w-9 h-9 text-primary-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Haftaning kunlari</p>
                                        <h4 className="text-2xl font-black italic tracking-tight">{student.guruh?.jadval?.kunlar}</h4>
                                    </div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden p-8 lg:p-10 rounded-[2.5rem] bg-primary-600 text-white shadow-xl transform active:scale-[0.98] lg:hover:scale-[1.02] transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                                        <HiOutlineClock className="w-9 h-9 text-amber-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">Dars boshlanishi</p>
                                        <h4 className="text-3xl font-black italic font-mono">{student.guruh?.jadval?.vaqt}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentCourses;
