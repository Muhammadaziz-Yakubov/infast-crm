import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineInformationCircle
} from 'react-icons/hi';

const StudentAttendance = () => {
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

    const { attendance } = data;

    return (
        <div className="min-h-screen bg-transparent pb-32 animate-fade-in lg:pb-10">
            {/* Native style Header */}
            <header className="sticky top-0 z-[40] bg-gray-50/80 dark:bg-dark-900/80 backdrop-blur-xl pt-4 pb-4 mb-6 lg:static lg:bg-transparent lg:backdrop-blur-none lg:px-0">
                <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] italic">Yutuqlar sari</p>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Dars <span className="text-emerald-500 text-shadow-sm">Davomati</span></h1>
            </header>

            <div className="space-y-8">
                {/* Attendance Summary Bar */}
                <div className="flex items-center gap-4 bg-white dark:bg-dark-800 p-4 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm max-w-2xl">
                    <div className="flex-1 flex flex-col items-center gap-1 py-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/10">
                        <span className="text-3xl font-black text-emerald-600 tracking-tighter">{attendance.filter(a => a.keldi).length}</span>
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Kelgan darslar</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center gap-1 py-4 bg-red-500/10 rounded-3xl border border-red-500/10">
                        <span className="text-3xl font-black text-red-600 tracking-tighter">{attendance.filter(a => !a.keldi).length}</span>
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Kelmagan darslar</span>
                    </div>
                </div>

                {attendance.length === 0 ? (
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] py-24 text-center border-2 border-dashed border-gray-100 dark:border-dark-700">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-6">
                            <HiOutlineInformationCircle className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest italic">Hali davomat qilinmagan</h3>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2 italic">
                            O'quv yili bo'yicha tarix
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {attendance.map((a, i) => (
                                <div
                                    key={i}
                                    className={`group bg-white dark:bg-dark-800 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm 
                                        flex items-center justify-between active:scale-[0.98] transition-all hover:shadow-md
                                        ${!a.keldi ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-emerald-500'}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${a.keldi
                                            ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                            : 'bg-red-500 text-white shadow-red-500/20'
                                            }`}>
                                            <HiOutlineCalendar />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-base">
                                                {new Date(a.sana).toLocaleDateString('uz', { day: 'numeric', month: 'long' })}
                                            </h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{new Date(a.sana).toLocaleDateString('uz', { weekday: 'long' })}</p>
                                        </div>
                                    </div>

                                    <div className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${a.keldi
                                        ? 'bg-emerald-500/10 text-emerald-600'
                                        : 'bg-red-500/10 text-red-600'
                                        }`}>
                                        {a.keldi ? 'Kelgan' : 'Siz Yoʻqsiz'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;
