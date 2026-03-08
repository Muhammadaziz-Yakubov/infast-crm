import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineArrowLeft, HiOutlineLightningBolt, HiOutlineSparkles,
    HiOutlineStar, HiOutlineAcademicCap, HiOutlineInformationCircle,
    HiOutlineGift, HiOutlineBadgeCheck
} from 'react-icons/hi';

const ClassmateProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            const res = await studentAPI.getPublicProfile(id);
            setStudent(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner text="Profil yuklanmoqda..." />;
    if (!student) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-6">
            <div className="w-32 h-32 rounded-[3rem] bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-gray-200">
                <HiOutlineInformationCircle className="w-16 h-16" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">O'quvchi topilmadi</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bunday profil mavjud emas yoki o'chirilgan</p>
            </div>
            <button onClick={() => navigate(-1)} className="px-10 py-4 bg-primary-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest italic shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                Orqaga qaytish
            </button>
        </div>
    );

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
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] italic mb-1 block leading-none">Guruhdosh profili</span>
                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                            O'quvchi <span className="text-primary-500">Profili</span>
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">@ {student.username || 'InFast'}</p>
                    </div>
                </div>
                <div className="relative group hidden md:block">
                    <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-2.5xl bg-white/40 dark:bg-dark-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 flex items-center justify-center text-primary-500 shadow-2xl">
                        <HiOutlineAcademicCap className="w-8 h-8" />
                    </div>
                </div>
            </header>

            {/* --- PROFILE HEADER CARD --- */}
            <div className="relative bg-white/40 dark:bg-dark-800/40 backdrop-blur-2xl rounded-[4rem] p-10 md:p-16 border border-white/20 dark:border-white/5 shadow-3xl text-center flex flex-col items-center group overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:rotate-45 transition-transform duration-[2000ms] text-primary-500">
                    <HiOutlineSparkles className="w-96 h-96" />
                </div>

                <div className="relative mb-10">
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-[4rem] overflow-hidden border-8 border-white dark:border-dark-900 shadow-2xl bg-gray-50 dark:bg-dark-900 group-hover:scale-105 group-hover:rotate-2 transition-all duration-700">
                        {student.profileImage ? (
                            <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 to-orange-500/10 text-primary-500 font-black text-6xl italic">
                                {student.ism?.charAt(0)}
                            </div>
                        )}
                    </div>
                    {/* Level Badge Overlay */}
                    <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-primary-600 to-orange-600 text-white px-8 py-3 rounded-[2rem] shadow-2xl border-4 border-white dark:border-dark-800 flex items-center gap-3 animate-bounce-subtle">
                        <HiOutlineLightningBolt className="w-5 h-5" />
                        <span className="text-base font-black italic uppercase tracking-widest">{student.level || 1} level</span>
                    </div>
                </div>

                <div className="space-y-4 mb-12">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                        {student.ism}
                    </h2>
                    <div className="flex items-center justify-center gap-3 px-6 py-2.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 italic font-black text-[10px] uppercase tracking-widest mx-auto w-fit">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {student.guruh?.nomi || 'InFast Academy'}
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                    <div className="relative group/stat p-10 rounded-[3rem] bg-amber-400/5 dark:bg-amber-400/10 border border-amber-500/10 transition-all hover:bg-amber-400/20 shadow-xl shadow-amber-500/5">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/stat:rotate-45 transition-transform duration-700">
                            <span className="text-6xl">🪙</span>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em] italic mb-1 leading-none">Jami Balans</p>
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">🪙</span>
                                <h4 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white italic tracking-tighter group-hover/stat:scale-110 transition-transform">
                                    {student.coins || 0}
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="relative group/stat p-10 rounded-[3rem] bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/10 transition-all hover:bg-primary-500/20 shadow-xl shadow-primary-500/5">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/stat:rotate-45 transition-transform duration-700">
                            <HiOutlineSparkles className="w-20 h-20 text-primary-500" />
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em] italic mb-1 leading-none">Tajriba XP</p>
                            <div className="flex items-center gap-4">
                                <HiOutlineSparkles className="w-10 h-10 text-primary-500" />
                                <h4 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white italic tracking-tighter group-hover/stat:scale-110 transition-transform">
                                    {student.xp || 0}
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECONDARY INFO GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Yutuqlar Section */}
                <div className="p-10 rounded-[3.5rem] bg-white/40 dark:bg-dark-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-primary-500/5 group-hover:rotate-12 transition-transform duration-1000">
                        <HiOutlineStar className="w-40 h-40" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 shadow-xl">
                            <HiOutlineStar className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">Yutuqlar</h3>
                    </div>
                    <div className="py-16 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-dark-950/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/5">
                        <div className="w-16 h-16 rounded-2.5xl bg-white dark:bg-dark-800 shadow-2xl flex items-center justify-center text-gray-200 mb-6">
                            <HiOutlineGift className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] italic mb-1">Tez Kunda</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest opacity-60">Yutuqlar va medallar tizimi</p>
                    </div>
                </div>

                {/* Sertifikatlar Section */}
                <div className="p-10 rounded-[3.5rem] bg-white/40 dark:bg-dark-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 space-y-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 text-orange-500/5 group-hover:rotate-12 transition-transform duration-1000">
                        <HiOutlineAcademicCap className="w-40 h-40" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-xl">
                            <HiOutlineAcademicCap className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">Sertifikatlar</h3>
                    </div>
                    <div className="py-16 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-dark-950/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-white/5">
                        <div className="w-16 h-16 rounded-2.5xl bg-white dark:bg-dark-800 shadow-2xl flex items-center justify-center text-gray-200 mb-6">
                            <HiOutlineBadgeCheck className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.4em] italic mb-1">Tez Kunda</p>
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest opacity-60">O'quv kursi sertifikatlari</p>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ClassmateProfile;
