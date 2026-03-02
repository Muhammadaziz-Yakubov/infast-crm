import { useState, useEffect } from 'react';
import { marketAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineArrowCircleUp, HiOutlineArrowCircleDown, HiOutlineClock } from 'react-icons/hi';

const CoinLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await marketAPI.getCoinLogs();
            setLogs(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('uz-UZ', {
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (loading) return <LoadingSpinner text="Tarix yuklanmoqda..." />;

    return (
        <div className="min-h-screen pb-20 max-w-2xl mx-auto px-4">
            <header className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                        Coin <span className="text-primary-500">Tarixi</span>
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Barcha kirim va chiqimlar</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shadow-lg shadow-primary-500/10">
                    <HiOutlineClock className="w-6 h-6" />
                </div>
            </header>

            {logs.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-dark-900/50 rounded-[2rem] border border-gray-100 dark:border-white/5">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Tarix hali bo'sh</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {logs.map((log) => (
                        <div
                            key={log._id}
                            className="bg-white dark:bg-dark-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5 flex items-center gap-4 transition-all hover:border-primary-200 dark:hover:border-primary-500/30"
                        >
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${log.type === 'plus'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-red-500/10 text-red-500'
                                }`}>
                                {log.type === 'plus'
                                    ? <HiOutlineArrowCircleUp className="w-6 h-6" />
                                    : <HiOutlineArrowCircleDown className="w-6 h-6" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate italic">
                                    {log.reason}
                                </h4>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                    {formatDate(log.sana)}
                                </p>
                            </div>
                            <div className={`text-right ${log.type === 'plus' ? 'text-emerald-500' : 'text-red-500'}`}>
                                <p className="text-lg font-black tracking-tighter leading-none">
                                    {log.type === 'plus' ? '+' : '-'}{log.amount}
                                </p>
                                <p className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-70">Coin</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoinLogs;
