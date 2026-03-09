import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineChevronRight, HiOutlineTrendingUp, HiOutlineAward, HiOutlineFire } from 'react-icons/hi';

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
        <div className="min-h-screen pb-20 animate-fade-in max-w-2xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 py-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white dark:bg-dark-800 text-gray-500 shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-all outline-none"
                >
                    <HiOutlineArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                        O'quvchilar <span className="text-primary-500">Reytingi</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Top 100 o'quvchi</p>
                </div>
                <div className="w-12" />
            </div>

            {/* Top 3 Podium (Optional but looks cool) */}
            {leaderboard.length >= 3 && (
                <div className="flex items-end justify-center gap-2 mb-10 mt-4 h-48">
                    {/* Rank 2 */}
                    <div className="flex flex-col items-center flex-1 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="relative mb-2">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-300 shadow-lg bg-white dark:bg-dark-800">
                                {leaderboard[1].profileImage ? (
                                    <img src={leaderboard[1].profileImage} alt={leaderboard[1].ism} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-black text-xl italic">
                                        {leaderboard[1].ism?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white dark:border-dark-900">2</div>
                        </div>
                        <div className="h-20 w-full bg-gray-300/20 dark:bg-gray-300/5 rounded-t-2xl flex flex-col items-center justify-center">
                            <p className="text-[10px] font-black uppercase italic truncate px-2 w-full text-center">{leaderboard[1].ism.split(' ')[0]}</p>
                            <p className="text-xs font-black text-primary-500">{leaderboard[1].coins} 🪙</p>
                        </div>
                    </div>

                    {/* Rank 1 */}
                    <div className="flex flex-col items-center flex-1 z-10 animate-slide-up" style={{ animationDelay: '0ms' }}>
                        <div className="relative mb-2 scale-110">
                            <HiOutlineAward className="absolute -top-7 left-1/2 -translate-x-1/2 w-8 h-8 text-amber-500 drop-shadow-lg animate-bounce" />
                            <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-amber-400 shadow-xl bg-white dark:bg-dark-800 ring-4 ring-amber-400/20">
                                {leaderboard[0].profileImage ? (
                                    <img src={leaderboard[0].profileImage} alt={leaderboard[0].ism} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-amber-50 text-amber-500 font-black text-2xl italic">
                                        {leaderboard[0].ism?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -top-3 -right-3 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white dark:border-dark-900 shadow-lg shadow-amber-400/30">1</div>
                        </div>
                        <div className="h-28 w-full bg-amber-400/20 dark:bg-amber-400/5 rounded-t-3xl flex flex-col items-center justify-center border-t-2 border-amber-400/30">
                            <p className="text-xs font-black uppercase italic truncate px-2 w-full text-center">{leaderboard[0].ism.split(' ')[0]}</p>
                            <p className="text-sm font-black text-primary-500">{leaderboard[0].coins} 🪙</p>
                        </div>
                    </div>

                    {/* Rank 3 */}
                    <div className="flex flex-col items-center flex-1 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <div className="relative mb-2">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-700/30 shadow-lg bg-white dark:bg-dark-800">
                                {leaderboard[2].profileImage ? (
                                    <img src={leaderboard[2].profileImage} alt={leaderboard[2].ism} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-800/40 font-black text-xl italic">
                                        {leaderboard[2].ism?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-700/60 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white dark:border-dark-900">3</div>
                        </div>
                        <div className="h-16 w-full bg-amber-700/10 dark:bg-amber-700/5 rounded-t-2xl flex flex-col items-center justify-center">
                            <p className="text-[10px] font-black uppercase italic truncate px-2 w-full text-center">{leaderboard[2].ism.split(' ')[0]}</p>
                            <p className="text-xs font-black text-primary-500">{leaderboard[2].coins} 🪙</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {leaderboard.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic text-[10px]">Ma'lumot topilmadi</p>
                    </div>
                ) : (
                    leaderboard.map((student, index) => (
                        <Link
                            key={student._id}
                            to={`/classmate-profile/${student._id}`}
                            className="group flex items-center justify-between p-4 bg-white dark:bg-dark-800 rounded-[1.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-0.5 transition-all duration-300 animate-slide-up"
                            style={{ animationDelay: `${index * 30}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center w-6 text-sm font-black italic text-gray-400">
                                    {index + 1}
                                </div>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
                                        {student.profileImage ? (
                                            <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-500/10 text-primary-500 font-black text-lg italic">
                                                {student.ism?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white truncate uppercase italic tracking-tight group-hover:text-primary-500 transition-colors">
                                        {student.ism}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">{student.guruh?.nomi || 'Nomsiz guruh'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-black text-gray-900 dark:text-white italic">{student.coins || 0}</span>
                                        <span className="text-[10px]">🪙</span>
                                    </div>
                                </div>
                                <HiOutlineChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
