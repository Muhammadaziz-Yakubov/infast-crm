import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI, curriculumAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft, HiOutlineAcademicCap, HiOutlineCheckCircle,
    HiOutlineBookOpen, HiOutlineClock, HiOutlineChevronDown,
    HiOutlineChevronUp, HiOutlineLightningBolt, HiOutlineCalendar,
    HiOutlineRewind, HiOutlineUserGroup, HiOutlineArrowRight
} from 'react-icons/hi';

const GroupView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [group, setGroup] = useState(null);
    const [curriculum, setCurriculum] = useState(null);
    const [allLessons, setAllLessons] = useState(null);
    const [showAllLessons, setShowAllLessons] = useState(false);
    const [progressSetting, setProgressSetting] = useState(false);
    const [manualProgress, setManualProgress] = useState(0);
    const [students, setStudents] = useState([]);

    

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [groupRes, currRes] = await Promise.all([
                groupAPI.getOne(id),
                curriculumAPI.getGroupCurriculum(id)
            ]);
            setGroup(groupRes.data.data);
            setCurriculum(currRes.data.data);
            setStudents(groupRes.data.data.oquvchilar || []);
            setManualProgress(currRes.data.data.guruh.darsProgress || 0);
        } catch (err) {
            toast.error("Ma'lumotlarni yuklashda xatolik");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkCompleted = async () => {
        try {
            const res = await curriculumAPI.markCompleted(id);
            toast.success(res.data.message);
            
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
        }
    };

    const handleUndo = async () => {
        try {
            const res = await curriculumAPI.undoCompleted(id);
            toast.success(res.data.message);

            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const handleSetProgress = async () => {
        try {
            const res = await curriculumAPI.setProgress(id, manualProgress);
            toast.success(res.data.message);
            setProgressSetting(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const fetchAllLessons = async () => {
        if (allLessons) {
            setShowAllLessons(!showAllLessons);
            return;
        }
        try {
            const res = await curriculumAPI.getGroupAllLessons(id);
            setAllLessons(res.data.data);
            setShowAllLessons(true);
        } catch (err) {
            toast.error('Darslarni yuklashda xatolik');
        }
    };

    if (loading) return <LoadingSpinner text="Guruh yuklanmoqda..." />;
    if (!curriculum) return <div className="text-center py-20 text-gray-400">Ma'lumot topilmadi</div>;

    const { guruh, bugunDarsBor, keyingiDarsKuni, joriyDars, keyingiDars, unganDars, joriyDarsRaqam, progressFoiz } = curriculum;

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-32">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/groups')}
                    className="p-3 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 
                        shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-95"
                >
                    <HiOutlineArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase truncate">
                        {guruh.nomi}
                    </h1>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                        {guruh.kurs?.nomi} • Daraja {guruh.daraja} • {guruh.oqituvchi || 'Ustoz'}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <HiOutlineLightningBolt className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white">O'quv jarayoni</h3>
                            <p className="text-xs text-gray-400 font-bold">{guruh.darsProgress} / {guruh.jamiDarslar} dars o'tildi</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
                            {progressFoiz}%
                        </span>
                    </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-dark-900 rounded-full h-4 overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-1000 ease-out shadow-lg shadow-purple-500/30"
                        style={{ width: `${progressFoiz}%` }}
                    />
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-wrap gap-2">
                        {guruh.darsKunlari?.map((kun, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-dark-900 text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-100 dark:border-white/5">
                                {kun}
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setProgressSetting(!progressSetting)}
                            className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-900 text-xs font-black text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            ⚙️ Manual
                        </button>
                    </div>
                </div>

                {/* Manual Progress Setting */}
                {progressSetting && (
                    <div className="mt-4 p-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5 space-y-3 animate-fade-in">
                        <p className="text-xs font-bold text-gray-500">Eski guruhlar uchun progressni qo'lda o'rnating:</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="0"
                                max={guruh.jamiDarslar}
                                value={manualProgress}
                                onChange={e => setManualProgress(parseInt(e.target.value) || 0)}
                                className="w-24 px-4 py-3 rounded-xl bg-white dark:bg-dark-800 border-2 border-transparent focus:border-purple-500 outline-none font-black text-center"
                            />
                            <span className="text-sm font-bold text-gray-400">/ {guruh.jamiDarslar}</span>
                            <button
                                onClick={handleSetProgress}
                                className="px-5 py-3 rounded-xl bg-purple-500 text-white font-black text-sm shadow-lg shadow-purple-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                            >
                                O'rnatish
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bugungi dars holati */}
            {!bugunDarsBor ? (
                <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm text-center">
                    <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                        <HiOutlineCalendar className="w-10 h-10 text-amber-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Bugun dars yo'q 📅</h3>
                    <p className="text-gray-400 font-medium">
                        Keyingi dars: <span className="font-black text-amber-500">{keyingiDarsKuni}</span>
                    </p>
                    {joriyDars && (
                        <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/30 dark:border-amber-500/10">
                            <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2">Keyingi dars mavzulari</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {joriyDars.mavzular.map((m, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/20 text-xs font-bold text-amber-700 dark:text-amber-400">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // Bugun dars bor - 3 ta kartani ko'rsatish
                <div className="space-y-4">
                    {/* Bugungi dars */}
                    {joriyDars && (
                        <LessonCard
                            title={`${joriyDarsRaqam}-Dars • Bugungi dars`}
                            dars={joriyDars}
                            type="today"
                            onComplete={handleMarkCompleted}
                            onUndo={handleUndo}
                            progress={guruh.darsProgress}
                        />
                    )}

                    {/* Keyingi dars */}
                    {keyingiDars && (
                        <LessonCard
                            title={`${joriyDarsRaqam + 1}-Dars • Keyingi dars`}
                            dars={keyingiDars}
                            type="next"
                        />
                    )}

                    {/* Undan keyingi */}
                    {unganDars && (
                        <LessonCard
                            title={`${joriyDarsRaqam + 2}-Dars • Rejadagi`}
                            dars={unganDars}
                            type="upcoming"
                        />
                    )}
                </div>
            )}

            {/* O'quvchilar */}
            {students.length > 0 && (
                <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <HiOutlineUserGroup className="w-5 h-5 text-emerald-500" />
                        <h3 className="font-black text-gray-900 dark:text-white">O'quvchilar ({students.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {students.map((s, i) => (
                            <div key={s._id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-black">
                                    {s.ism?.charAt(0) || '?'}
                                </div>
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300 truncate">{s.ism}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Barcha darslar */}
            <div className="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <button
                    onClick={fetchAllLessons}
                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-dark-900/50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <HiOutlineBookOpen className="w-5 h-5 text-indigo-500" />
                        <h3 className="font-black text-gray-900 dark:text-white">Barcha darslar ro'yxati</h3>
                    </div>
                    {showAllLessons ? <HiOutlineChevronUp className="w-5 h-5 text-gray-400" /> : <HiOutlineChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {showAllLessons && allLessons && (
                    <div className="px-6 pb-6 space-y-4 animate-fade-in">
                        {allLessons.haftalar.map(hafta => (
                            <div key={hafta.hafta} className="space-y-2">
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest pt-2 pb-1 border-b border-gray-100 dark:border-white/5">
                                    📖 {hafta.hafta}-Hafta
                                </h4>
                                {hafta.darslar.map(dars => {
                                    const isCompleted = dars.dars_raqam <= (allLessons.darsProgress || 0);
                                    const isCurrent = dars.dars_raqam === (allLessons.darsProgress || 0) + 1;
                                    return (
                                        <div
                                            key={dars.dars_raqam}
                                            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                                                isCompleted
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200/30 dark:border-emerald-500/10'
                                                    : isCurrent
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/10 border-2 border-indigo-300 dark:border-indigo-500/30 shadow-lg shadow-indigo-500/5'
                                                    : 'bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5 opacity-60'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                                                isCompleted
                                                    ? 'bg-emerald-500 text-white'
                                                    : isCurrent
                                                    ? 'bg-indigo-500 text-white animate-pulse'
                                                    : 'bg-gray-200 dark:bg-dark-700 text-gray-500'
                                            }`}>
                                                {isCompleted ? '✓' : dars.dars_raqam}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {dars.mavzular.map((m, mi) => (
                                                        <span key={mi} className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                                                            isCompleted
                                                                ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                                                : isCurrent
                                                                ? 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                                                                : 'bg-gray-100 dark:bg-dark-700 text-gray-500'
                                                        }`}>
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Lesson Card komponenti
const LessonCard = ({ title, dars, type, onComplete, onUndo, progress }) => {
    const gradients = {
        today: 'from-indigo-500 to-purple-600',
        next: 'from-amber-400 to-orange-500',
        upcoming: 'from-gray-400 to-gray-500'
    };

    const bgColors = {
        today: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200/30 dark:border-indigo-500/20',
        next: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200/30 dark:border-amber-500/20',
        upcoming: 'bg-gray-50 dark:bg-gray-800 border-gray-200/30 dark:border-white/5'
    };

    const tagColors = {
        today: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
        next: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
        upcoming: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
    };

    return (
        <div className={`rounded-[2rem] p-6 border shadow-sm ${bgColors[type]}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradients[type]} flex items-center justify-center shadow-lg`}>
                        {type === 'today' ? <HiOutlineLightningBolt className="w-5 h-5 text-white" /> :
                         type === 'next' ? <HiOutlineArrowRight className="w-5 h-5 text-white" /> :
                         <HiOutlineClock className="w-5 h-5 text-white" />}
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-tight">{title}</h3>
                        <p className="text-[10px] font-bold text-gray-400">{dars.hafta}-hafta • {dars.davomiyligi}</p>
                    </div>
                </div>
                {type === 'today' && (
                    <span className="px-3 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 animate-pulse">
                        Bugun
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {dars.mavzular.map((m, i) => (
                    <span key={i} className={`px-3 py-1.5 rounded-xl text-xs font-bold ${tagColors[type]}`}>
                        📚 {m}
                    </span>
                ))}
            </div>

{dars.uy_vazifa && (
                <div className="p-4 rounded-2xl bg-white/50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5 mb-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Uy Vazifa</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{dars.uy_vazifa}</p>
                </div>
            )}

            {type === 'today' && (
                <div className="flex flex-col gap-3 pt-2">
                    <button
                        onClick={onComplete}
                        disabled={progress >= 1}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        O'pilgan Deb Belgilash
                    </button>
                    {progress > 0 && (
                        <button
                            onClick={onUndo}
                            className="w-full py-4 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-black text-xs border border-red-200 dark:border-red-500/30 active:scale-95 transition-all"
                        >
                            Bekor Qilish
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroupView;
