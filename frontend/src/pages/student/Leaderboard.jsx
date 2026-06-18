import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineChevronRight, HiOutlineTrendingUp } from 'react-icons/hi';

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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen pb-16 animate-fade-in max-w-xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg bg-white dark:bg-[#111111] border border-gray-200 dark:border-zinc-800 text-zinc-550 hover:text-zinc-750 transition-colors"
                >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        Top reyting
                    </h1>
                    <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mt-0.5">Haftalik faoliyat</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 flex items-center justify-center">
                    <HiOutlineTrendingUp className="w-5 h-5" />
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-2.5">
                {leaderboard.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Ma'lumot topilmadi</p>
                    </div>
                ) : (
                    leaderboard.map((student, index) => (
                        <Link
                            key={student._id}
                            to={`/classmate-profile/${student._id}`}
                            className="group flex items-center justify-between p-4 bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
                        >
                            <div className="flex items-center gap-3.5">
                                {/* Rank Badge */}
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                                    index === 0 ? 'bg-[#FF9500]/10 border-[#FF9500]/20 text-[#FF9500]' :
                                    index === 1 ? 'bg-zinc-300/20 border-zinc-350 text-zinc-500' :
                                    index === 2 ? 'bg-orange-700/10 border-orange-700/20 text-orange-700' :
                                    'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400'
                                }`}>
                                    {index + 1}
                                </div>

                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full border border-gray-150 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                                        {student.profileImage ? (
                                            <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-bold text-zinc-400 uppercase">{student.ism?.charAt(0)}</span>
                                        )}
                                    </div>
                                    {index < 3 && (
                                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#00C853] border-2 border-white dark:border-[#111111] rounded-full shadow-sm"></div>
                                    )}
                                </div>

                                {/* Names */}
                                <div className="min-w-0">
                                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                                        {student.ism}
                                    </h3>
                                    <p className="text-[9px] text-zinc-400 mt-0.5">{student.guruh?.nomi || 'InFast Talaba'}</p>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-[#0066FF] leading-none">{student.totalScore || 0}</p>
                                    <p className="text-[8px] font-semibold text-zinc-400 uppercase tracking-widest mt-1">ball</p>
                                </div>
                                <HiOutlineChevronRight className="w-4 h-4 text-zinc-300" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
