import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineCreditCard, HiOutlineCash, HiOutlineCalendar, HiOutlineDocumentText
} from 'react-icons/hi';

const StudentPayments = () => {
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

    if (loading) return <LoadingSpinner />;
    if (!data) return null;

    const { student, payments } = data;

    return (
        <div className="min-h-screen bg-transparent pb-32 animate-fade-in lg:pb-10">
            {/* Native style Header */}
            <header className="sticky top-0 z-[40] bg-gray-50/80 dark:bg-dark-900/80 backdrop-blur-xl pt-4 pb-4 mb-4 lg:static lg:bg-transparent lg:backdrop-blur-none lg:px-0">
                <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] italic">Moliya bo'limi</p>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">O'quv <span className="text-emerald-500 text-shadow-sm">To'lovlarim</span></h1>
            </header>

            <div className="space-y-8">
                {/* Wallet Style Card */}
                <div className={`relative overflow-hidden rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl border border-white/10 group ${student.tolovHolati === 'tolangan'
                    ? 'bg-gray-900'
                    : 'bg-red-600 shadow-red-500/30'
                    }`}>
                    <div className="relative z-10 space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-3xl shadow-xl">
                                <HiOutlineCreditCard className={student.tolovHolati === 'tolangan' ? 'text-emerald-400' : 'text-white'} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest bg-white/10 px-6 py-2 rounded-full border border-white/10 italic">
                                {student.tolovHolati === 'tolangan' ? "Ta'lim Faol" : "To'lov Muddati Keldi"}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic opacity-60">Sizning oylik to'lovingiz</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight italic">
                                {formatMoney(student.oylikTolov || student.kurs?.narx)}
                            </h2>
                        </div>

                        <div className="flex items-center gap-6 max-w-lg">
                            <div className="flex-1 p-5 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">To'lov Holati</p>
                                <p className="text-base font-black uppercase tracking-tight italic text-emerald-400">
                                    {student.tolovHolati === 'tolangan' ? "To'langan" : "Qarzdor"}
                                </p>
                            </div>
                            <div className="flex-1 p-5 rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                                <p className="text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Sana</p>
                                <p className="text-base font-black uppercase tracking-tight italic">Har oy {student.tolovKuni}-sana</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="space-y-6">
                    <h3 className="text-xs lg:text-sm font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2 italic">
                        Barcha amalga oshirilgan to'lovlar
                    </h3>

                    {payments.length === 0 ? (
                        <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] py-20 text-center border-2 border-dashed border-gray-100 dark:border-dark-700">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest italic">To'lovlar topilmadi</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {payments.map((p, i) => (
                                <div key={i} className="group bg-white dark:bg-dark-800 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all hover:shadow-md hover:bg-gray-50 dark:hover:bg-dark-700">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                            <HiOutlineCash className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 dark:text-white tracking-tight text-lg">+{formatMoney(p.summa)}</h4>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{new Date(p.sana).toLocaleDateString('uz')}</p>
                                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest opacity-60 italic">{p.tolovTuri}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/10">Tasdiq</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentPayments;
