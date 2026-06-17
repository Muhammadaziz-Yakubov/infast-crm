import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { groupAPI, curriculumAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft, HiOutlineAcademicCap, HiOutlineCheckCircle,
    HiOutlineBookOpen, HiOutlineClock, HiOutlineChevronDown,
    HiOutlineChevronUp, HiOutlineLightningBolt, HiOutlineCalendar,
    HiOutlineUserGroup, HiOutlineArrowRight
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

    if (loading) return <LoadingSpinner />;
    if (!curriculum) return <div className="text-center py-20 text-zinc-400 font-semibold text-sm">Ma'lumot topilmadi</div>;

    const { guruh, bugunDarsBor, keyingiDarsKuni, joriyDars, keyingiDars, unganDars, joriyDarsRaqam, progressFoiz } = curriculum;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-16">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/groups')}
                    className="p-2 rounded-lg bg-white dark:bg-[#111111] border border-gray-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight truncate">
                        {guruh.nomi}
                    </h1>
                    <p className="text-xs text-zinc-400 mt-1 font-medium">
                        {guruh.kurs?.nomi} • Daraja {guruh.daraja} • {guruh.oqituvchi || 'Ustoz'}
                    </p>
                </div>
            </div>

            {/* Progress Card */}
            <div className="bg-white dark:bg-[#111111] rounded-xl p-6 border border-gray-150 dark:border-zinc-900/60 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center border border-[#0066FF]/20">
                            <HiOutlineLightningBolt className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">O'quv jarayoni</h3>
                            <p className="text-xs text-zinc-400 font-medium">{guruh.darsProgress} / {guruh.jamiDarslar} dars o'tildi</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-[#0066FF]">
                            {progressFoiz}%
                        </span>
                    </div>
                </div>
                
                <div className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    <div
                        className="h-full rounded-full bg-[#0066FF] transition-all duration-500"
                        style={{ width: `${progressFoiz}%` }}
                    />
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-wrap gap-1">
                        {guruh.darsKunlari?.map((kun, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-semibold text-zinc-500 uppercase">
                                {kun}
                            </span>
                        ))}
                    </div>
                    <button
                        onClick={() => setProgressSetting(!progressSetting)}
                        className="px-3 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs font-semibold text-zinc-500 hover:text-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-800"
                    >
                        Sozlash
                    </button>
                </div>

                {/* Manual Progress Setting */}
                {progressSetting && (
                    <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3 animate-fade-in">
                        <p className="text-xs font-semibold text-zinc-550">Guruh progressini qo'lda o'rnatish:</p>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="0"
                                max={guruh.jamiDarslar}
                                value={manualProgress}
                                onChange={e => setManualProgress(parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-750 focus:border-[#0066FF] outline-none text-center font-bold text-sm"
                            />
                            <span className="text-xs text-zinc-400">/ {guruh.jamiDarslar}</span>
                            <button
                                onClick={handleSetProgress}
                                className="px-3.5 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white font-semibold text-xs shadow-sm transition-colors"
                            >
                                Saqlash
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Today's lesson status */}
            {!bugunDarsBor ? (
                <div className="bg-white dark:bg-[#111111] rounded-xl p-8 border border-gray-150 dark:border-zinc-900/60 text-center shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-[#FF9500]/10 border border-[#FF9500]/20 flex items-center justify-center mx-auto mb-3 text-[#FF9500]">
                        <HiOutlineCalendar className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Bugun dars yo'q</h3>
                    <p className="text-xs text-zinc-400 mt-1">
                        Keyingi dars: <span className="font-semibold text-[#FF9500]">{keyingiDarsKuni}</span>
                    </p>
                    {joriyDars && (
                        <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 max-w-md mx-auto">
                            <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mb-2">Dars mavzulari</p>
                            <div className="flex flex-wrap gap-1 justify-center">
                                {joriyDars.mavzular.map((m, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Bugungi dars */}
                    {joriyDars && (
                        <LessonCard
                            title={`${joriyDarsRaqam}-dars • Bugungi dars`}
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
                            title={`${joriyDarsRaqam + 1}-dars • Keyingi dars`}
                            dars={keyingiDars}
                            type="next"
                        />
                    )}

                    {/* Undan keyingi */}
                    {unganDars && (
                        <LessonCard
                            title={`${joriyDarsRaqam + 2}-dars • Rejadagi`}
                            dars={unganDars}
                            type="upcoming"
                        />
                    )}
                </div>
            )}

            {/* Students List */}
            {students.length > 0 && (
                <div className="bg-white dark:bg-[#111111] rounded-xl p-6 border border-gray-150 dark:border-zinc-900/60 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <HiOutlineUserGroup className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Guruh o'quvchilari ({students.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {students.map((s) => (
                            <div key={s._id} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                <div className="w-7 h-7 rounded bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 flex items-center justify-center text-xs font-bold uppercase">
                                    {s.ism?.charAt(0) || '?'}
                                </div>
                                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">{s.ism}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All lessons */}
            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 shadow-sm overflow-hidden">
                <button
                    onClick={fetchAllLessons}
                    className="w-full flex items-center justify-between p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                    <div className="flex items-center gap-2.5">
                        <HiOutlineBookOpen className="w-5 h-5 text-indigo-500" />
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Barcha darslar ro'yxati</h3>
                    </div>
                    {showAllLessons ? <HiOutlineChevronUp className="w-4 h-4 text-zinc-400" /> : <HiOutlineChevronDown className="w-4 h-4 text-zinc-400" />}
                </button>

                {showAllLessons && allLessons && (
                    <div className="px-5 pb-5 space-y-4 animate-fade-in border-t border-gray-150 dark:border-zinc-900/60 pt-4">
                        {allLessons.haftalar.map(hafta => (
                            <div key={hafta.hafta} className="space-y-2">
                                <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest pt-2 pb-1">
                                    {hafta.hafta}-hafta
                                </h4>
                                {hafta.darslar.map(dars => {
                                    const isCompleted = dars.dars_raqam <= (allLessons.darsProgress || 0);
                                    const isCurrent = dars.dars_raqam === (allLessons.darsProgress || 0) + 1;
                                    return (
                                        <div
                                            key={dars.dars_raqam}
                                            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                                isCompleted
                                                    ? 'bg-[#00C853]/5 border-[#00C853]/15'
                                                    : isCurrent
                                                    ? 'bg-[#0066FF]/5 border-[#0066FF]/35 shadow-sm'
                                                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 opacity-60'
                                            }`}
                                        >
                                            <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                                                isCompleted
                                                    ? 'bg-[#00C853] text-white'
                                                    : isCurrent
                                                    ? 'bg-[#0066FF] text-white'
                                                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                                            }`}>
                                                {isCompleted ? '✓' : dars.dars_raqam}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap gap-1">
                                                    {dars.mavzular.map((m, mi) => (
                                                        <span key={mi} className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                                            isCompleted
                                                                ? 'bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853]'
                                                                : isCurrent
                                                                ? 'bg-[#0066FF]/10 border-[#0066FF]/20 text-[#0066FF]'
                                                                : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
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

// Lesson Card component
const LessonCard = ({ title, dars, type, onComplete, onUndo, progress }) => {
    const borders = {
        today: 'border-[#0066FF]/30 bg-[#0066FF]/5',
        next: 'border-[#FF9500]/30 bg-[#FF9500]/5',
        upcoming: 'border-gray-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900'
    };

    const tagColors = {
        today: 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20',
        next: 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20',
        upcoming: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
    };

    return (
        <div className={`rounded-xl p-5 border shadow-sm ${borders[type]}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center">
                        {type === 'today' ? <HiOutlineLightningBolt className="w-4 h-4 text-[#0066FF]" /> :
                         type === 'next' ? <HiOutlineArrowRight className="w-4 h-4 text-[#FF9500]" /> :
                         <HiOutlineClock className="w-4 h-4 text-zinc-400" />}
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">{title}</h3>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{dars.hafta}-hafta • {dars.davomiyligi}</p>
                    </div>
                </div>
                {type === 'today' && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#0066FF] text-white uppercase tracking-wider">
                        Bugun
                    </span>
                )}
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
                {dars.mavzular.map((m, i) => (
                    <span key={i} className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${tagColors[type]}`}>
                        {m}
                    </span>
                ))}
            </div>

            {dars.uy_vazifa && (
                <div className="p-3 rounded-lg bg-white dark:bg-zinc-850 border border-gray-150 dark:border-zinc-800 mb-4">
                    <span className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Uy vazifasi</span>
                    <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-300">{dars.uy_vazifa}</p>
                </div>
            )}

            {type === 'today' && (
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-150/40 dark:border-zinc-800/40">
                    <button
                        onClick={onComplete}
                        disabled={progress >= 1}
                        className="btn-primary flex-1 flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        O'tilgan deb belgilash
                    </button>
                    {progress > 0 && (
                        <button
                            onClick={onUndo}
                            className="px-3.5 py-1.5 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] rounded-lg text-xs font-semibold border border-[#FF3B30]/20 transition-all"
                        >
                            Bekor qilish
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default GroupView;
