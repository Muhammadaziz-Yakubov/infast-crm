import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineStar, HiOutlineFire,
    HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineTrophy
} from 'react-icons/hi';

const StudentRating = () => {
    const { user } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myRank, setMyRank] = useState(null);

    useEffect(() => {
        fetchRatings();
    }, []);

    const fetchRatings = async () => {
        setLoading(true);
        try {
            const res = await studentAPI.getRating();
            const sortedData = res.data.data;
            setRatings(sortedData);

            // Find my rank
            const me = sortedData.find(r => r._id === (user?.id || user?._id));
            setMyRank(me || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRankStyle = (rank) => {
        if (rank === 1) return { icon: '🥇', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
        if (rank === 2) return { icon: '🥈', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20' };
        if (rank === 3) return { icon: '🥉', color: 'text-orange-600', bg: 'bg-orange-600/10', border: 'border-orange-600/20' };
        return { icon: null, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-dark-800', border: 'border-transparent' };
    };

    const getScoreBadge = (score) => {
        if (score >= 200) return { label: 'Ustoz', icon: HiOutlineFire, color: 'text-amber-500' };
        if (score >= 100) return { label: 'Yulduz', icon: HiOutlineSparkles, color: 'text-emerald-500' };
        if (score >= 50) return { label: 'Faol', icon: HiOutlineLightningBolt, color: 'text-blue-500' };
        return { label: 'Boshlang\'ich', icon: HiOutlineStar, color: 'text-gray-400' };
    };

    if (loading) return <LoadingSpinner text="Reyting hisoblanmoqda..." />;

    return (
        <div className="min-h-screen bg-transparent pb-32 lg:pb-10 animate-fade-in max-w-2xl mx-auto px-4">
            {/* Header */}
            <header className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                        Peshqadamlar <span className="text-primary-500">Reytingi</span>
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">O'quv markazi bo'yicha jami ballar</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shadow-lg shadow-primary-500/10">
                    <HiOutlineTrophy className="w-6 h-6" />
                </div>
            </header>

            {/* Top 3 Podium Cards */}
            <div className="space-y-4 mb-8">
                {ratings.slice(0, 3).map((r, i) => {
                    const style = getRankStyle(r.rank);
                    const isMe = r._id === (user?.id || user?._id);
                    return (
                        <div
                            key={r._id}
                            className={`relative overflow-hidden rounded-[2rem] p-5 border-2 transition-all duration-500 ${style.bg} ${style.border} ${isMe ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-dark-900 shadow-xl' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl ${i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                                            i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                                                'bg-gradient-to-br from-orange-500 to-orange-700'
                                        }`}>
                                        {r.ism?.charAt(0)}
                                    </div>
                                    <div className="absolute -top-3 -left-3 text-2xl transform -rotate-12">
                                        {style.icon}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-black text-base uppercase tracking-tight truncate ${isMe ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                        {r.ism}
                                    </h3>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{r.guruh?.nomi}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{r.totalScore}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.1em] mt-1">Ball</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Others List - Simplified */}
            <div className="space-y-2.5">
                {ratings.slice(3).map((r) => {
                    const isMe = r._id === (user?.id || user?._id);
                    const badge = getScoreBadge(r.totalScore);
                    const BadgeIcon = badge.icon;
                    return (
                        <div
                            key={r._id}
                            className={`group p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${isMe
                                    ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-500/30 shadow-md'
                                    : 'bg-white dark:bg-dark-800 border-gray-100 dark:border-white/5 shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="text-[10px] font-black text-gray-400 w-5 text-center">
                                    {r.rank}
                                </div>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs ${isMe ? 'bg-primary-500' : 'bg-gray-100 dark:bg-dark-700 text-gray-400'
                                    }`}>
                                    {r.ism?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-black uppercase tracking-tight truncate ${isMe ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                        {r.ism}
                                    </h4>
                                    <div className="flex items-center gap-1.5 mt-0.5 opacity-70">
                                        <BadgeIcon className={`w-2.5 h-2.5 ${badge.color}`} />
                                        <span className={`text-[7px] font-black uppercase tracking-widest ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-black text-gray-900 dark:text-white leading-none">{r.totalScore}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Section */}
            <div className="mt-10 p-5 rounded-[2rem] bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5 text-center">
                <HiOutlineLightningBolt className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <h4 className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1.5">Natijangizni oshiring!</h4>
                <p className="text-[9px] text-gray-500 font-medium leading-normal max-w-[200px] mx-auto">
                    Vazifalarni o'z vaqtida topshirib darslarda faol bo'ling!
                </p>
            </div>
        </div>
    );
};

export default StudentRating;
