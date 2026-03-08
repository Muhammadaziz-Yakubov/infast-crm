import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineStar, HiOutlineFire,
    HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineAcademicCap
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
        if (rank === 1) return { icon: '🥇', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', gradient: 'from-amber-400 to-amber-600' };
        if (rank === 2) return { icon: '🥈', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', gradient: 'from-slate-300 to-slate-500' };
        if (rank === 3) return { icon: '🥉', color: 'text-orange-600', bg: 'bg-orange-600/10', border: 'border-orange-600/20', gradient: 'from-orange-500 to-orange-700' };
        return { icon: null, color: 'text-gray-400', bg: 'bg-white dark:bg-dark-800', border: 'border-gray-100 dark:border-white/5', gradient: 'from-gray-100 to-gray-200' };
    };

    const getScoreBadge = (xp) => {
        if (xp >= 50000) return { label: 'Afsona', icon: HiOutlineSparkles, color: 'text-purple-500' };
        if (xp >= 20000) return { label: 'Ustoz', icon: HiOutlineFire, color: 'text-amber-500' };
        if (xp >= 5000) return { label: 'Yulduz', icon: HiOutlineSparkles, color: 'text-emerald-500' };
        if (xp >= 500) return { label: 'Faol', icon: HiOutlineLightningBolt, color: 'text-blue-500' };
        return { label: 'Boshlang\'ich', icon: HiOutlineStar, color: 'text-gray-400' };
    };

    if (loading) return <LoadingSpinner text="Reyting hisoblanmoqda..." />;

    return (
        <div className="min-h-screen bg-transparent pb-32 lg:pb-10 animate-fade-in max-w-2xl mx-auto px-4">
            {/* Header */}
            <header className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                        Peshqadamlar <span className="text-primary-500">Ligasi</span>
                    </h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Markaz bo'yicha jami XP ballar</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shadow-xl shadow-primary-500/10 border border-primary-500/20">
                    <HiOutlineAcademicCap className="w-7 h-7" />
                </div>
            </header>

            {/* Top 3 Podium Selection */}
            <div className="flex flex-col gap-6 mb-12">
                {ratings.slice(0, 3).map((r) => {
                    const style = getRankStyle(r.rank);
                    const isMe = r._id === (user?.id || user?._id);
                    const badge = getScoreBadge(r.xp);
                    const BadgeIcon = badge.icon;

                    return (
                        <div
                            key={r._id}
                            className={`relative overflow-hidden group rounded-[2.5rem] p-6 border-2 transition-all duration-500 
                                ${style.bg} ${style.border} ${isMe ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-dark-900 shadow-2xl scale-[1.02]' : 'hover:shadow-lg'}`}
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                                <HiOutlineLightningBolt className="w-32 h-32" />
                            </div>

                            <div className="flex items-center gap-6 relative z-10">
                                <div className="relative">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl font-black text-white shadow-2xl bg-gradient-to-br ${style.gradient}`}>
                                        {r.ism?.charAt(0)}
                                    </div>
                                    <div className="absolute -top-4 -left-4 text-4xl transform -rotate-12 drop-shadow-lg">
                                        {style.icon}
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-gray-900 text-white text-[10px] font-black px-2.5 py-1 rounded-full border-2 border-white dark:border-dark-800">
                                        Lvl {r.level}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className={`font-black text-xl uppercase tracking-tighter truncate ${isMe ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                            {r.ism}
                                        </h3>
                                        <BadgeIcon className={`w-4 h-4 ${badge.color}`} />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{r.guruh?.nomi || 'Guruhsiz'}</p>

                                    {/* Progress Bar for Top 3 */}
                                    <div className="mt-4 space-y-1.5">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest italic text-gray-400">
                                            <span>Progress</span>
                                            <span>{r.progress}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${style.gradient} transition-all duration-1000`}
                                                style={{ width: `${r.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right pl-4 border-l border-gray-100 dark:border-white/5">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white leading-none tracking-tighter">{r.xp}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">XP Total</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Others List - Enhanced */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2 mb-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Qolgan Ishtirokchilar</h4>
                    <span className="text-[10px] font-black text-gray-400">{ratings.length > 3 ? ratings.length - 3 : 0} ta o'quvchi</span>
                </div>

                {ratings.slice(3).map((r) => {
                    const isMe = r._id === (user?.id || user?._id);
                    const badge = getScoreBadge(r.xp);
                    const BadgeIcon = badge.icon;

                    return (
                        <div
                            key={r._id}
                            className={`group p-4 rounded-3xl border transition-all active:scale-[0.98] ${isMe
                                ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-500/30 shadow-xl scale-[1.01]'
                                : 'bg-white dark:bg-dark-800 border-gray-100 dark:border-white/5 hover:border-primary-200 shadow-sm'
                                }`}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`text-[12px] font-black w-6 text-center ${isMe ? 'text-primary-500' : 'text-gray-300'}`}>
                                    {r.rank}
                                </div>
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg ${isMe ? 'bg-primary-500' : 'bg-gray-900'
                                    }`}>
                                    {r.ism?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className={`text-sm md:text-base font-black uppercase tracking-tight truncate ${isMe ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                            {r.ism}
                                        </h4>
                                        <span className="bg-gray-100 dark:bg-dark-900 px-2 py-0.5 rounded-md text-[8px] font-black text-gray-500 uppercase">Lvl {r.level}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <BadgeIcon className={`w-3 h-3 ${badge.color}`} />
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${badge.color}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Small Progress for others */}
                                    <div className="mt-3 h-1 w-24 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary-500 transition-all duration-1000"
                                            style={{ width: `${r.progress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-gray-900 dark:text-white leading-none tracking-tighter">{r.xp}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">XP</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Dynamic Footer Section */}
            <div className="mt-12 p-8 rounded-[3rem] bg-gradient-to-br from-gray-900 to-black text-white text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <HiOutlineSparkles className="w-full h-full scale-150 rotate-12" />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2 text-primary-400">
                        <HiOutlineLightningBolt className="w-6 h-6 animate-pulse" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] italic">Natijangizni oshiring!</h4>
                    <p className="text-[10px] text-gray-400 font-medium leading-relaxed max-w-xs mx-auto">
                        Vazifalarni mukammal topshiring va omad g'ildiragida coinlar yutib, XP darajangizni rekord darajaga ko'taring!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StudentRating;
