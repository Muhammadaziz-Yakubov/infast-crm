import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineArrowLeft, HiOutlineLightningBolt, HiOutlineSparkles, HiOutlineStar, HiOutlineAcademicCap, HiOutlineInformationCircle } from 'react-icons/hi';

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
    if (!student) return <div className="text-center py-20 font-black uppercase tracking-widest text-gray-400 italic">O'quvchi topilmadi</div>;

    return (
        <div className="min-h-screen pb-20 animate-fade-in max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 py-4 px-2">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white dark:bg-dark-800 text-gray-500 shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-all outline-none"
                >
                    <HiOutlineArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                        O'quvchi <span className="text-primary-500">Profili</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">@ {student.username || 'InFast'}</p>
                </div>
                <div className="w-12" />
            </div>

            <div className="space-y-6">
                {/* Profile Header Card */}
                <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-8 shadow-2xl border border-gray-100 dark:border-white/5 text-center relative overflow-hidden group">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 rotate-3">
                        <HiOutlineAcademicCap className="w-48 h-48" />
                    </div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-primary-500/10 shadow-2xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-1">
                                {student.profileImage ? (
                                    <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover rounded-[2.2rem]" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary-500/10 text-primary-500 font-black text-4xl italic">
                                        {student.ism?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-primary-500 to-orange-600 text-white px-4 py-1.5 rounded-2xl shadow-lg border-2 border-white dark:border-dark-800 flex items-center gap-1.5 animate-bounce-subtle">
                                <HiOutlineLightningBolt className="w-4 h-4" />
                                <span className="text-xs font-black italic tracking-widest">{student.level || 1} LVL</span>
                            </div>
                        </div>

                        <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-1 select-none">
                            {student.ism}
                        </h2>
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{student.guruh?.nomi || 'InFast Academy'}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <div className="bg-amber-500/5 rounded-3xl p-6 border border-amber-500/10 text-center group/card transition-all hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/5">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic mb-2">Jami Balance</p>
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-2xl">🪙</span>
                                    <h4 className="text-2xl font-black text-gray-900 dark:text-white group-hover/card:scale-110 transition-transform">{student.coins || 0}</h4>
                                </div>
                            </div>
                            <div className="bg-primary-500/5 rounded-3xl p-6 border border-primary-500/10 text-center group/card transition-all hover:bg-primary-500/10 hover:shadow-lg hover:shadow-primary-500/5">
                                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest italic mb-2">Tajriba XP</p>
                                <div className="flex items-center justify-center gap-2">
                                    <HiOutlineSparkles className="w-6 h-6 text-primary-500 group-hover/card:rotate-12 transition-transform" />
                                    <h4 className="text-2xl font-black text-gray-900 dark:text-white group-hover/card:scale-110 transition-transform">{student.xp || 0}</h4>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Coming Soon Section - Yutuqlar & Sertifikatlar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:rotate-12 transition-transform duration-500">
                                <HiOutlineStar className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Yutuqlar</h3>
                        </div>
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 dark:bg-dark-900/50 rounded-[1.5rem] border border-dashed border-gray-200 dark:border-white/5">
                            <HiOutlineInformationCircle className="w-10 h-10 text-gray-300 dark:text-white/10 mb-2 animate-pulse" />
                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest italic">Tez Kunda</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Yutuqlar hisoblanmoqda</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-sm border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:rotate-12 transition-transform duration-500">
                                <HiOutlineAcademicCap className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Sertifikatlar</h3>
                        </div>
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-gray-50/50 dark:bg-dark-900/50 rounded-[1.5rem] border border-dashed border-gray-200 dark:border-white/5">
                            <HiOutlineInformationCircle className="w-10 h-10 text-gray-300 dark:text-white/10 mb-2 animate-pulse" />
                            <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest italic">Tez Kunda</p>
                            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Hujjatlar tayyorlanmoqda</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ClassmateProfile;
