import { useState, useEffect } from 'react';
import { studentAPI, groupAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineTrendingUp, HiOutlineFilter, HiOutlineStar,
    HiOutlineAcademicCap, HiOutlineCheckCircle, HiOutlineClipboardList,
    HiOutlineChevronUp, HiOutlineChevronDown, HiOutlineMinus,
    HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineFire
} from 'react-icons/hi';

const StudentRating = () => {
    const { user } = useAuth();
    const [ratings, setRatings] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // 'all' or 'group'
    const [selectedGroup, setSelectedGroup] = useState('');
    const [myRank, setMyRank] = useState(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        fetchRatings();
    }, [activeTab, selectedGroup]);

    const fetchGroups = async () => {
        try {
            const res = await groupAPI.getAll();
            setGroups(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRatings = async () => {
        setLoading(true);
        try {
            const params = {};
            if (activeTab === 'group' && selectedGroup) {
                params.guruhId = selectedGroup;
            } else if (activeTab === 'group' && user?.guruh) {
                params.guruhId = user.guruh._id || user.guruh;
                setSelectedGroup(user.guruh._id || user.guruh);
            }
            const res = await studentAPI.getRating(params);
            setRatings(res.data.data);

            // Find my rank
            const me = res.data.data.find(r => r._id === user?.id);
            setMyRank(me || null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (rank) => {
        if (rank === 1) return <span className="text-2xl">🥇</span>;
        if (rank === 2) return <span className="text-2xl">🥈</span>;
        if (rank === 3) return <span className="text-2xl">🥉</span>;
        return <span className="text-lg font-black text-gray-400">#{rank}</span>;
    };

    const getRankBg = (rank) => {
        if (rank === 1) return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/30';
        if (rank === 2) return 'bg-gradient-to-r from-gray-300/20 to-gray-200/10 border-gray-400/30';
        if (rank === 3) return 'bg-gradient-to-r from-amber-700/20 to-orange-600/10 border-amber-700/30';
        return 'bg-white dark:bg-dark-800 border-gray-100 dark:border-white/5';
    };

    const getScoreColor = (score) => {
        if (score >= 200) return 'text-amber-500';
        if (score >= 100) return 'text-emerald-500';
        if (score >= 50) return 'text-blue-500';
        return 'text-gray-500';
    };

    const getScoreBadge = (score) => {
        if (score >= 200) return { label: 'Ustoz', icon: HiOutlineFire, color: 'bg-amber-500/10 text-amber-500' };
        if (score >= 100) return { label: 'Yulduz', icon: HiOutlineSparkles, color: 'bg-emerald-500/10 text-emerald-500' };
        if (score >= 50) return { label: 'Faol', icon: HiOutlineLightningBolt, color: 'bg-blue-500/10 text-blue-500' };
        return { label: 'Boshlang\'ich', icon: HiOutlineStar, color: 'bg-gray-500/10 text-gray-500' };
    };

    const isMe = (id) => id === user?.id;

    return (
        <div className="min-h-screen bg-transparent pb-32 lg:pb-10 animate-fade-in">
            {/* Header */}
            <header className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/30">
                        <HiOutlineTrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                            Reyting <span className="text-amber-500">Jadvali</span>
                        </h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vazifa ballari + Davomat ballari</p>
                    </div>
                </div>
            </header>

            {/* My Rank Card */}
            {myRank && (
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 md:p-10 text-white shadow-2xl mb-8 border border-white/10">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                        <HiOutlineStar className="w-48 h-48" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl font-black shadow-xl shadow-amber-500/30">
                                {myRank.rank <= 3 ? getRankIcon(myRank.rank) : `#${myRank.rank}`}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-1">Sizning o'rningiz</p>
                                <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tight">{myRank.ism}</h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6 md:ml-auto">
                            <div className="flex-1 md:flex-none p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center min-w-[100px]">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Vazifa balli</p>
                                <p className="text-xl font-black text-emerald-400">{myRank.taskScore}</p>
                            </div>
                            <div className="flex-1 md:flex-none p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 text-center min-w-[100px]">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Davomat balli</p>
                                <p className="text-xl font-black text-blue-400">{myRank.attendanceScore}</p>
                            </div>
                            <div className="flex-1 md:flex-none p-4 rounded-2xl bg-amber-500/10 backdrop-blur-md border border-amber-500/20 text-center min-w-[100px]">
                                <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest mb-1">Jami ball</p>
                                <p className="text-2xl font-black text-amber-400">{myRank.totalScore}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
                <div className="flex bg-white dark:bg-dark-800 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-white/5">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'all'
                                ? 'bg-gray-900 dark:bg-primary-600 text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <HiOutlineAcademicCap className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                        Umumiy reyting
                    </button>
                    <button
                        onClick={() => setActiveTab('group')}
                        className={`flex-1 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'group'
                                ? 'bg-gray-900 dark:bg-primary-600 text-white shadow-lg'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        <HiOutlineFilter className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                        Guruh bo'yicha
                    </button>
                </div>

                {activeTab === 'group' && (
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="px-5 py-3.5 rounded-2xl bg-white dark:bg-dark-800 border-2 border-transparent focus:border-amber-500 outline-none 
                            font-bold text-sm cursor-pointer shadow-sm"
                    >
                        <option value="">Guruhni tanlang</option>
                        {groups.map(g => (
                            <option key={g._id} value={g._id}>{g.nomi}</option>
                        ))}
                    </select>
                )}
            </div>

            {/* Score Legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10">
                        <HiOutlineClipboardList className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Vazifa balli</p>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Baholangan ball</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/10">
                        <HiOutlineCheckCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Davomat</p>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Har dars +2 ball</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10">
                        <HiOutlineFire className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">200+ ball</p>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Ustoz daraja</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-800 rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10">
                        <HiOutlineSparkles className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">100+ ball</p>
                        <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Yulduz daraja</p>
                    </div>
                </div>
            </div>

            {/* Ratings List */}
            {loading ? (
                <LoadingSpinner text="Reyting yuklanmoqda..." />
            ) : ratings.length === 0 ? (
                <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-16 text-center border border-gray-100 dark:border-white/5">
                    <HiOutlineStar className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
                    <h3 className="text-xl font-black text-gray-400 uppercase italic">Reyting ma'lumotlari topilmadi</h3>
                    <p className="text-sm text-gray-400 mt-2">Guruhni tanlang yoki ma'lumotlar kiritilishini kuting</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Top 3 Podium */}
                    {ratings.length >= 3 && activeTab === 'all' && (
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            {/* 2nd Place */}
                            <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-6 border border-gray-200/50 dark:border-white/5 shadow-sm text-center mt-8 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-300 to-gray-400"></div>
                                <div className="text-3xl mb-3">🥈</div>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-300 to-gray-500 mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg mb-3">
                                    {ratings[1]?.ism?.charAt(0)}
                                </div>
                                <h4 className={`font-black text-sm uppercase tracking-tight truncate ${isMe(ratings[1]?._id) ? 'text-primary-500' : 'text-gray-900 dark:text-white'}`}>
                                    {ratings[1]?.ism}
                                </h4>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{ratings[1]?.guruh?.nomi}</p>
                                <p className="text-2xl font-black text-gray-500 mt-2">{ratings[1]?.totalScore}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">ball</p>
                            </div>

                            {/* 1st Place */}
                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10 rounded-[2rem] p-6 border-2 border-amber-400/30 shadow-xl text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
                                <div className="text-4xl mb-3">🥇</div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-amber-500/30 mb-3 ring-4 ring-amber-400/20">
                                    {ratings[0]?.ism?.charAt(0)}
                                </div>
                                <h4 className={`font-black text-base uppercase tracking-tight truncate ${isMe(ratings[0]?._id) ? 'text-primary-500' : 'text-gray-900 dark:text-white'}`}>
                                    {ratings[0]?.ism}
                                </h4>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{ratings[0]?.guruh?.nomi}</p>
                                <p className="text-3xl font-black text-amber-500 mt-2">{ratings[0]?.totalScore}</p>
                                <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">ball</p>
                            </div>

                            {/* 3rd Place */}
                            <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-6 border border-gray-200/50 dark:border-white/5 shadow-sm text-center mt-12 relative overflow-hidden">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-700 to-orange-600"></div>
                                <div className="text-3xl mb-3">🥉</div>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-700 to-orange-600 mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg mb-3">
                                    {ratings[2]?.ism?.charAt(0)}
                                </div>
                                <h4 className={`font-black text-sm uppercase tracking-tight truncate ${isMe(ratings[2]?._id) ? 'text-primary-500' : 'text-gray-900 dark:text-white'}`}>
                                    {ratings[2]?.ism}
                                </h4>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{ratings[2]?.guruh?.nomi}</p>
                                <p className="text-2xl font-black text-amber-700 mt-2">{ratings[2]?.totalScore}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">ball</p>
                            </div>
                        </div>
                    )}

                    {/* Full List */}
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-50 dark:border-dark-700/50 bg-gray-50/50 dark:bg-dark-900/50">
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-16">#</th>
                                        <th className="px-4 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">O'quvchi</th>
                                        <th className="px-4 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">Vazifa</th>
                                        <th className="px-4 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">Davomat</th>
                                        <th className="px-4 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Daraja</th>
                                        <th className="px-6 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Jami Ball</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-dark-700/50">
                                    {ratings.map((r) => {
                                        const badge = getScoreBadge(r.totalScore);
                                        const BadgeIcon = badge.icon;
                                        return (
                                            <tr
                                                key={r._id}
                                                className={`transition-all hover:bg-gray-50/80 dark:hover:bg-dark-900/30 ${isMe(r._id)
                                                        ? 'bg-primary-50/50 dark:bg-primary-900/10 ring-2 ring-inset ring-primary-500/20'
                                                        : ''
                                                    } ${r.rank <= 3 ? getRankBg(r.rank) : ''}`}
                                            >
                                                <td className="px-6 py-5 text-center">
                                                    {getRankIcon(r.rank)}
                                                </td>
                                                <td className="px-4 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg ${r.rank === 1 ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/20' :
                                                                r.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                                                                    r.rank === 3 ? 'bg-gradient-to-br from-amber-700 to-orange-600' :
                                                                        'bg-gradient-to-br from-primary-400 to-primary-600 shadow-primary-500/10'
                                                            }`}>
                                                            {r.ism?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className={`font-black text-sm uppercase tracking-tight ${isMe(r._id) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                                                                {r.ism} {isMe(r._id) && <span className="text-[8px] bg-primary-500 text-white px-2 py-0.5 rounded-full ml-1 normal-case tracking-wider not-italic">Siz</span>}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-gray-400">{r.guruh?.nomi} • {r.kurs?.nomi}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-center hidden md:table-cell">
                                                    <div>
                                                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{r.taskScore}</span>
                                                        <p className="text-[9px] font-bold text-gray-400">{r.taskCount} ta vazifa</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-center hidden md:table-cell">
                                                    <div>
                                                        <span className="text-sm font-black text-blue-600 dark:text-blue-400">{r.attendanceScore}</span>
                                                        <p className="text-[9px] font-bold text-gray-400">{r.attendancePercent}% davomat</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-center">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${badge.color}`}>
                                                        <BadgeIcon className="w-3 h-3" />
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className={`text-xl font-black ${getScoreColor(r.totalScore)}`}>{r.totalScore}</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentRating;
