import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineChevronRight, HiOutlineTrendingUp, HiOutlineStar, HiOutlineSparkles } from 'react-icons/hi';

const Leaderboard = () => {
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const res = await studentAPI.getLeaderboard();
            setLeaderboard(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner text="Reyting yuklanmoqda..." />;

    return (
        <div className="min-h-screen pb-36 animate-fade-in max-w-2xl mx-auto px-4 md:px-0">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-gray-50/80 dark:bg-dark-950/80 backdrop-blur-xl -mx-4 px-4 py-6 mb-4 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white dark:bg-dark-800 text-gray-500 shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-all outline-none"
                >
                    <HiOutlineArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                        O'quvchilar <span className="gradient-text">Reytingi</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Top 100 Faol Talaba</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                    <HiOutlineTrendingUp className="w-6 h-6" />
                </div>
            </div>

            {/* Top 3 Podium - Revamped */}
            {leaderboard.length >= 3 && (
                <div className="flex items-end justify-center gap-2 mb-12 mt-8 h-64 px-2">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center flex-1 animate-slide-up" style={{ animationDelay: '150ms' }}>
                        <div className="relative mb-3">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] overflow-hidden border-2 border-slate-300 shadow-2xl bg-white dark:bg-dark-800 p-1">
                                <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-slate-100">
                                    {leaderboard[1].profileImage ? (
                                        <img src={leaderboard[1].profileImage} alt={leaderboard[1].ism} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-xl italic uppercase">
                                            {leaderboard[1].ism?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-slate-300 rounded-full flex items-center justify-center text-white font-black text-xs border-4 border-gray-50 dark:border-dark-950 shadow-xl">2</div>
                        </div>
                        <div className="h-28 w-full bg-slate-200/50 dark:bg-white/5 rounded-t-[2.5rem] flex flex-col items-center justify-center px-2 space-y-1 border-t border-slate-300/30">
                            <p className="text-[10px] md:text-xs font-black uppercase italic truncate w-full text-center text-slate-600 dark:text-slate-400">{leaderboard[1].ism.split(' ')[0]}</p>
                            <p className="text-xs md:text-sm font-black text-primary-600 italic tracking-tighter">{leaderboard[1].totalScore || 0} pts</p>
                        </div>
                    </div>

                    {/* Rank 1 - The Champion */}
                    <div className="flex flex-col items-center flex-1 z-10 animate-slide-up" style={{ animationDelay: '0ms' }}>
                        <div className="relative mb-4 scale-110">
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-12 h-12 flex items-center justify-center drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                                <HiOutlineStar className="w-10 h-10 text-amber-500 animate-pulse" />
                            </div>
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2.2rem] overflow-hidden border-4 border-amber-400 shadow-[0_20px_50px_-10px_rgba(245,158,11,0.5)] bg-white dark:bg-dark-800 p-1 ring-4 ring-amber-400/20">
                                <div className="w-full h-full rounded-[1.9rem] overflow-hidden bg-amber-50">
                                    {leaderboard[0].profileImage ? (
                                        <img src={leaderboard[0].profileImage} alt={leaderboard[0].ism} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-amber-500 font-black text-3xl italic uppercase">
                                            {leaderboard[0].ism?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -top-4 -right-4 w-11 h-11 bg-amber-400 rounded-full flex items-center justify-center text-white font-black text-base border-4 border-gray-50 dark:border-dark-950 shadow-2xl">1</div>
                        </div>
                        <div className="h-36 w-full bg-gradient-to-b from-amber-400/40 to-transparent dark:from-amber-400/10 rounded-t-[3rem] flex flex-col items-center justify-center px-2 space-y-1 border-t-2 border-amber-400/50">
                            <p className="text-xs md:text-sm font-black uppercase italic truncate w-full text-center text-amber-700 dark:text-amber-500">{leaderboard[0].ism.split(' ')[0]}</p>
                            <p className="text-sm md:text-base font-black text-primary-600 italic tracking-tighter">{leaderboard[0].totalScore || 0} pts</p>
                        </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center flex-1 animate-slide-up" style={{ animationDelay: '300ms' }}>
                        <div className="relative mb-3">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.8rem] overflow-hidden border-2 border-orange-700/30 shadow-2xl bg-white dark:bg-dark-800 p-1">
                                <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-orange-50">
                                    {leaderboard[2].profileImage ? (
                                        <img src={leaderboard[2].profileImage} alt={leaderboard[2].ism} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-orange-800/40 font-black text-xl italic uppercase">
                                            {leaderboard[2].ism?.charAt(0)}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -top-3 -right-3 w-9 h-9 bg-orange-800/60 rounded-full flex items-center justify-center text-white font-black text-xs border-4 border-gray-50 dark:border-dark-950 shadow-xl">3</div>
                        </div>
                        <div className="h-20 w-full bg-orange-700/10 dark:bg-white/5 rounded-t-[2.5rem] flex flex-col items-center justify-center px-2 space-y-1 border-t border-orange-700/20">
                            <p className="text-[10px] md:text-xs font-black uppercase italic truncate w-full text-center text-orange-800/60 dark:text-orange-700/40">{leaderboard[2].ism.split(' ')[0]}</p>
                            <p className="text-xs md:text-sm font-black text-primary-600 italic tracking-tighter">{leaderboard[2].totalScore || 0} pts</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {leaderboard.length === 0 ? (
                    <div className="text-center py-20 card">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Ma'lumot topilmadi</p>
                    </div>
                ) : (
                    leaderboard.map((student, index) => (
                        <Link
                            key={student._id}
                            to={`/classmate-profile/${student._id}`}
                            className={`group flex items-center justify-between p-4 rounded-[2rem] transition-all duration-500 animate-slide-up border ${index === 0 ? 'bg-amber-50/50 border-amber-200 dark:bg-amber-500/5 dark:border-amber-500/20 shadow-lg' :
                                    index === 1 ? 'bg-slate-50/50 border-slate-200 dark:bg-slate-500/5 dark:border-slate-500/10' :
                                        index === 2 ? 'bg-orange-50/50 border-orange-200 dark:bg-orange-500/5 dark:border-orange-500/10' :
                                            'bg-white dark:bg-dark-800 border-gray-100 dark:border-white/5 shadow-sm'
                                } hover:shadow-2xl hover:shadow-primary-500/10 hover:-translate-y-1`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-5">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black italic ${index === 0 ? 'bg-amber-400 text-white' :
                                        index === 1 ? 'bg-slate-300 text-white' :
                                            index === 2 ? 'bg-orange-800/40 text-white' :
                                                'text-gray-400'
                                    }`}>
                                    {index + 1}
                                </div>
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border shadow-inner bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-0.5 border-transparent group-hover:border-primary-500/30 transition-all duration-500">
                                        <div className="w-full h-full rounded-[0.9rem] overflow-hidden">
                                            {student.profileImage ? (
                                                <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-primary-500/10 text-primary-500 font-black text-xl italic uppercase">
                                                    {student.ism?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {index < 3 && (
                                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-dark-900 rounded-full shadow-lg"></div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white truncate uppercase italic tracking-tight group-hover:text-primary-500 transition-colors">
                                        {student.ism}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest italic ${index < 3 ? 'bg-primary-500/10 text-primary-500' : 'bg-gray-100 dark:bg-dark-900 text-gray-400'
                                            }`}>
                                            {student.guruh?.nomi || 'Talaba'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-lg font-black text-primary-600 italic tracking-tighter leading-none">{student.totalScore || 0}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Pts</p>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-gray-300 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                    <HiOutlineChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
