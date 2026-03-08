import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineStar, HiOutlineFire,
    HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineAcademicCap,
    HiOutlineTrendingUp, HiOutlineEmojiHappy
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
        if (rank === 1) return { icon: '🥇', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', gradient: 'from-amber-400 to-amber-600', ring: 'ring-amber-500/30' };
        if (rank === 2) return { icon: '🥈', color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', gradient: 'from-slate-300 to-slate-500', ring: 'ring-slate-400/30' };
        if (rank === 3) return { icon: '🥉', color: 'text-orange-600', bg: 'bg-orange-600/10', border: 'border-orange-600/20', gradient: 'from-orange-500 to-orange-700', ring: 'ring-orange-600/30' };
        return { icon: null, color: 'text-gray-400', bg: 'bg-white/40 dark:bg-dark-900/40', border: 'border-white/20 dark:border-white/5', gradient: 'from-gray-100 to-gray-200', ring: 'ring-transparent' };
    };

    const getScoreBadge = (xp) => {
        if (xp >= 50000) return { label: 'Afsona', icon: HiOutlineSparkles, color: 'text-purple-500' };
        if (xp >= 20000) return { label: 'Ustoz', icon: HiOutlineFire, color: 'text-amber-500' };
        if (xp >= 5000) return { label: 'Yulduz', icon: HiOutlineSparkles, color: 'text-emerald-500' };
        if (xp >= 500) return { label: 'Faol', icon: HiOutlineLightningBolt, color: 'text-primary-500' };
        return { label: 'Boshlang\'ich', icon: HiOutlineStar, color: 'text-gray-400' };
    };

    if (loading) return <LoadingSpinner text="Peshqadamlar aniqlanmoqda..." />;

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 lg:pb-16 px-4 animate-fade-in">

            {/* --- HEADER --- */}
            <header className="relative flex flex-col md:flex-row items-center justify-between gap-6 pt-6 text-center md:text-left">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-orange-500/10 blur-3xl opacity-50 pointer-events-none" />
                <div className="relative space-y-2">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] italic mb-1 block">Raqobat & G'alaba</span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                        Peshqadamlar <span className="text-primary-500">Ligasi</span>
                    </h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest opacity-60 italic">Eng kuchli o'quvchilar reytingi</p>
                </div>
                <div className="relative group">
                    <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-20 h-20 rounded-[2rem] bg-white/40 dark:bg-dark-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 flex items-center justify-center text-primary-500 shadow-2xl">
                        <HiOutlineAcademicCap className="w-10 h-10" />
                    </div>
                </div>
            </header>

            {/* --- MY STATUS CARD --- */}
            {myRank && (
                <div className="bg-gradient-to-r from-primary-600 to-orange-600 rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl overflow-hidden">
                                {myRank.profileImage ? (
                                    <img src={myRank.profileImage} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-black italic">{myRank.ism?.charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-primary-100 uppercase tracking-widest italic leading-none mb-1">Mening o'rnim</p>
                                <h3 className="text-3xl font-black italic uppercase leading-none">{myRank.rank}-o'rin</h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center md:text-right">
                            <div>
                                <p className="text-[9px] font-black text-primary-100 uppercase tracking-widest italic leading-none mb-1">Jami XP</p>
                                <p className="text-2xl font-black italic">{myRank.xp}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-primary-100 uppercase tracking-widest italic leading-none mb-1">Daraja</p>
                                <p className="text-2xl font-black italic">Lvl {myRank.level}</p>
                            </div>
                            <div className="hidden md:block">
                                <p className="text-[9px] font-black text-primary-100 uppercase tracking-widest italic leading-none mb-1">Mening statusim</p>
                                <p className="text-2xl font-black italic uppercase text-amber-300 tracking-tighter">{getScoreBadge(myRank.xp).label}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- LEADERBOARD LIST --- */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic leading-none">Barcha Peshqadamlar</h3>
                </div>

                <div className="space-y-4">
                    {ratings.map((student, index) => {
                        const style = getRankStyle(student.rank);
                        const badge = getScoreBadge(student.xp);
                        const isMe = student._id === (user?.id || user?._id);
                        const BadgeIcon = badge.icon;

                        return (
                            <div
                                key={student._id}
                                className={`group relative flex items-center gap-6 p-6 md:p-8 rounded-[2.5rem] backdrop-blur-xl border transition-all duration-500 animate-slide-up bg-white/40 dark:bg-dark-900/40 border-white/20 dark:border-white/5 
                                    ${isMe ? 'ring-4 ring-primary-500/20 shadow-2xl scale-[1.02] z-10' : 'hover:shadow-xl hover:bg-white/60 dark:hover:bg-dark-900/60'}`}
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                {/* Rank Number / Icon */}
                                <div className="flex-shrink-0 w-12 text-center">
                                    {style.icon ? (
                                        <span className="text-4xl drop-shadow-lg">{style.icon}</span>
                                    ) : (
                                        <span className="text-lg font-black text-gray-400 italic font-mono">{student.rank}</span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <div className="relative">
                                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] flex items-center justify-center text-2xl font-black text-white shadow-xl overflow-hidden relative group-hover:scale-110 transition-transform bg-gradient-to-br ${style.gradient}`}>
                                        {student.profileImage ? (
                                            <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                                        ) : (
                                            student.ism?.charAt(0)
                                        )}
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-gray-900 dark:bg-dark-800 text-white text-[8px] font-black px-2 py-1 rounded-lg border-2 border-white dark:border-dark-900 shadow-lg">
                                        Lvl {student.level}
                                    </div>
                                </div>

                                {/* Name & Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className={`text-lg md:text-xl font-black uppercase italic tracking-tighter truncate ${isMe ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                            {student.ism}
                                        </h4>
                                        {isMe && <HiOutlineEmojiHappy className="w-5 h-5 text-primary-500 animate-bounce" />}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest italic ${badge.color}`}>
                                            <BadgeIcon className="w-3.5 h-3.5" />
                                            {badge.label}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">
                                            {student.guruh?.nomi || 'InFast'}
                                        </div>
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] italic mb-1 leading-none">Jami Ball</p>
                                    <p className={`text-2xl md:text-3xl font-black italic tracking-tighter leading-none ${isMe ? 'text-primary-500' : 'text-gray-900 dark:text-white'}`}>
                                        {student.xp}
                                        <span className="text-xs ml-1 text-gray-400">XP</span>
                                    </p>
                                </div>

                                {isMe && (
                                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-16 bg-primary-500 rounded-full shadow-lg shadow-primary-500/50" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* --- EMPTY STATE --- */}
            {ratings.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center bg-white/20 dark:bg-dark-900/20 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-white/5">
                    <HiOutlineTrendingUp className="w-20 h-20 text-gray-200 mb-6" />
                    <h3 className="text-xl font-black text-gray-400 uppercase italic tracking-widest">Ma'lumotlar mavjud emas</h3>
                </div>
            )}

        </div>
    );
};

export default StudentRating;
