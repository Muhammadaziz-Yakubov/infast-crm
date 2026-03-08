import { useState, useEffect } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Link, useNavigate } from 'react-router-dom';
import {
    HiOutlineUserGroup, HiOutlineArrowLeft, HiOutlineChevronRight,
    HiOutlineLightningBolt, HiOutlineSparkles, HiOutlineStatusOnline,
    HiOutlineUserCircle
} from 'react-icons/ai'; // Using AI icons for consistency if needed, but HI is fine
import {
    HiOutlineClipboardList, HiOutlineAcademicCap
} from 'react-icons/hi';

const Classmates = () => {
    const navigate = useNavigate();
    const [classmates, setClassmates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchClassmates();
    }, []);

    const fetchClassmates = async () => {
        try {
            const res = await studentAPI.getClassmates();
            setClassmates(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner text="Guruhdoshlar yuklanmoqda..." />;

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 lg:pb-16 px-4 animate-fade-in">

            {/* --- HEADER --- */}
            <header className="relative flex flex-col md:flex-row items-center justify-between gap-6 pt-6 text-center md:text-left">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-orange-500/10 blur-3xl opacity-50 pointer-events-none" />
                <div className="relative flex items-center gap-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-dark-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 flex items-center justify-center text-gray-500 hover:text-primary-500 transition-all active:scale-90 shadow-xl"
                    >
                        <HiOutlineArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] italic mb-1 block leading-none">Mening guruhim</span>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                            <span className="text-primary-500">Guruhdoshlarim</span>
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">{classmates.length} ta o'quvchi</p>
                    </div>
                </div>
                <div className="relative group hidden md:block">
                    <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-2.5xl bg-white/40 dark:bg-dark-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 flex items-center justify-center text-primary-500 shadow-2xl">
                        <HiOutlineUserGroup className="w-8 h-8" />
                    </div>
                </div>
            </header>

            {/* --- CLASSMATES LIST --- */}
            <div className="space-y-4">
                {classmates.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center bg-white/20 dark:bg-dark-900/20 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-white/5">
                        <HiOutlineUserGroup className="w-20 h-20 text-gray-200 mb-6" />
                        <h3 className="text-xl font-black text-gray-400 uppercase italic tracking-widest">Guruhdoshlar topilmadi</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {classmates.map((student, index) => (
                            <Link
                                key={student._id}
                                to={`/classmate-profile/${student._id}`}
                                className="group relative flex items-center gap-5 p-6 bg-white/40 dark:bg-dark-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 transition-all duration-500 animate-slide-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-primary-500/10 shadow-2xl group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700 bg-gray-50 dark:bg-dark-950 flex items-center justify-center">
                                        {student.profileImage ? (
                                            <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-orange-500/10 text-primary-500 font-black text-3xl italic">
                                                {student.ism?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-dark-800 px-2 py-1 rounded-xl border border-gray-100 dark:border-white/5 shadow-xl flex items-center gap-1">
                                        <HiOutlineLightningBolt className="w-3.5 h-3.5 text-primary-500" />
                                        <span className="text-[9px] font-black text-gray-900 dark:text-white uppercase">Lvl {student.level || 1}</span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white truncate uppercase italic tracking-tighter group-hover:text-primary-500 transition-colors leading-none mb-2">
                                        {student.ism}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/10">
                                            <span className="text-xs">🪙</span>
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">{student.coins || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/5 border border-primary-500/10">
                                            <HiOutlineSparkles className="w-3 h-3 text-primary-500" />
                                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">{student.xp || 0} XP</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Link Indicator */}
                                <div className="w-12 h-12 rounded-2xl bg-gray-50/50 dark:bg-dark-800/50 flex items-center justify-center text-gray-300 group-hover:bg-primary-500 group-hover:text-white transition-all transform group-hover:translate-x-1 shadow-inner shrink-0">
                                    <HiOutlineChevronRight className="w-6 h-6" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )
                }
            </div>

            {/* --- AD / TIP --- */}
            <div className="relative group p-10 rounded-[3.5rem] bg-gradient-to-br from-primary-600 to-orange-600 text-white overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <div className="absolute -top-10 -right-10 p-20 opacity-10 group-hover:rotate-45 transition-transform duration-1000">
                    <HiOutlineSparkles className="w-64 h-64" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter leading-none">Guruh bilan rivojlaning! 🚀</h3>
                        <p className="text-sm font-bold text-primary-100 uppercase tracking-widest italic opacity-90">Guruhdoshlaringiz bilan xp ballar yig'ishda raqobat qiling</p>
                    </div>
                    <Link to="/ranking" className="px-8 py-4 bg-white text-primary-600 rounded-[1.5rem] font-black text-xs uppercase tracking-widest italic shadow-xl hover:scale-105 active:scale-95 transition-all">
                        Reytingni ko'rish
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Classmates;
