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
        <div className="min-h-screen pb-32 animate-fade-in max-w-2xl mx-auto px-4">
            {/* Clean Header */}
            <div className="flex items-center justify-between py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-800 text-gray-400 flex items-center justify-center shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-all"
                >
                    <HiOutlineArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                        Top <span className="text-primary-500">Reyting</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Haftalik Faoliyat</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                    <HiOutlineTrendingUp className="w-6 h-6" />
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-3">
                {leaderboard.length === 0 ? (
                    <div className="text-center py-20 card">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Ma'lumot topilmadi</p>
                    </div>
                ) : (
                    leaderboard.map((student, index) => (
                        <Link
                            key={student._id}
                            to={`/classmate-profile/${student._id}`}
                            className="group flex items-center justify-between p-4 bg-white dark:bg-dark-800 rounded-[1.5rem] border border-gray-100 dark:border-white/5 shadow-sm active:scale-[0.98] transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                {/* Rank Badge */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black italic shadow-inner ${index === 0 ? 'bg-amber-400 text-white' :
                                    index === 1 ? 'bg-slate-300 text-white' :
                                        index === 2 ? 'bg-orange-700/40 text-white' :
                                            'text-gray-300 bg-gray-50 dark:bg-dark-900'
                                    }`}>
                                    {index + 1}
                                </div>

                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-50 dark:border-white/5 bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
                                        {student.profileImage ? (
                                            <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-lg font-black text-gray-400 italic uppercase">{student.ism?.charAt(0)}</span>
                                        )}
                                    </div>
                                    {index < 3 && (
                                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-dark-800 rounded-full shadow-lg"></div>
                                    )}
                                </div>

                                {/* Names */}
                                <div className="min-w-0">
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white truncate uppercase italic tracking-tight group-hover:text-primary-500 transition-colors">
                                        {student.ism}
                                    </h3>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{student.guruh?.nomi || 'InFast Talaba'}</p>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-base font-black text-primary-500 italic leading-none">{student.totalScore || 0}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">ball</p>
                                </div>
                                <HiOutlineChevronRight className="w-4 h-4 text-gray-200" />
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
