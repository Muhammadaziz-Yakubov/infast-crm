import { useState, useEffect } from 'react';
import { groupAPI, curriculumAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch, HiOutlineAcademicCap, HiOutlineCheckCircle,
    HiOutlineClock, HiOutlineChevronDown, HiOutlineChevronUp,
    HiOutlineLightningBolt, HiOutlineCalendar,
    HiOutlineRefresh, HiOutlineCheck, HiOutlineAdjustments,
    HiOutlinePlay
} from 'react-icons/hi';

const CurriculumManager = () => {
    const [groups, setGroups] = useState([]);
    const [filteredGroups, setFilteredGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [curriculumLoading, setCurriculumLoading] = useState(false);
    const [curriculum, setCurriculum] = useState(null);
    const [allLessons, setAllLessons] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('current'); // 'current' or 'syllabus'
    const [manualProgressOpen, setManualProgressOpen] = useState(false);
    const [manualProgressVal, setManualProgressVal] = useState(0);
    const [expandedWeeks, setExpandedWeeks] = useState({});

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (groups.length > 0) {
            const filtered = groups.filter(g =>
                g.nomi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.oqituvchi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                g.kurs?.nomi?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setFilteredGroups(filtered);
        }
    }, [searchQuery, groups]);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const res = await groupAPI.getAll();
            const activeGroups = res.data.data.filter(g => g.holati === 'faol');
            setGroups(activeGroups);
            setFilteredGroups(activeGroups);
            
            if (activeGroups.length > 0) {
                handleSelectGroup(activeGroups[0]);
            }
        } catch (err) {
            toast.error("Guruhlarni yuklashda xatolik yuz berdi");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectGroup = async (group) => {
        setSelectedGroup(group);
        setCurriculumLoading(true);
        setManualProgressOpen(false);
        try {
            const [currRes, lessonsRes] = await Promise.all([
                curriculumAPI.getGroupCurriculum(group._id),
                curriculumAPI.getGroupAllLessons(group._id)
            ]);
            setCurriculum(currRes.data.data);
            setAllLessons(lessonsRes.data.data);
            setManualProgressVal(currRes.data.data.guruh.darsProgress || 0);

            const currentLessonNum = (currRes.data.data.guruh.darsProgress || 0) + 1;
            const tempExpanded = {};
            if (lessonsRes.data.data?.haftalar) {
                lessonsRes.data.data.haftalar.forEach(hafta => {
                    const hasCurrentLesson = hafta.darslar.some(d => d.dars_raqam === currentLessonNum);
                    tempExpanded[hafta.hafta] = hasCurrentLesson;
                });
            }
            setExpandedWeeks(tempExpanded);
        } catch (err) {
            toast.error("Curriculum ma'lumotlarini yuklashda xatolik");
            console.error(err);
        } finally {
            setCurriculumLoading(false);
        }
    };

    const handleMarkCompleted = async () => {
        if (!selectedGroup) return;
        try {
            toast.loading("Progress saqlanmoqda...", { id: 'curriculum-action' });
            const res = await curriculumAPI.markCompleted(selectedGroup._id);
            toast.success(res.data.message || "Dars muvaffaqiyatli o'tildi deb belgilandi! ✅", { id: 'curriculum-action' });
            await refreshCurriculumData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi", { id: 'curriculum-action' });
        }
    };

    const handleUndo = async () => {
        if (!selectedGroup) return;
        try {
            toast.loading("Amal bekor qilinmoqda...", { id: 'curriculum-action' });
            const res = await curriculumAPI.undoCompleted(selectedGroup._id);
            toast.success(res.data.message || "Dars qaytarildi ↩️", { id: 'curriculum-action' });
            await refreshCurriculumData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi", { id: 'curriculum-action' });
        }
    };

    const handleSetProgress = async (e) => {
        e.preventDefault();
        if (!selectedGroup) return;
        try {
            toast.loading("Progress o'rnatilmoqda...", { id: 'curriculum-action' });
            const res = await curriculumAPI.setProgress(selectedGroup._id, manualProgressVal);
            toast.success(res.data.message || "Progress muvaffaqiyatli o'rnatildi ⚡", { id: 'curriculum-action' });
            setManualProgressOpen(false);
            await refreshCurriculumData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi", { id: 'curriculum-action' });
        }
    };

    const handleJumpToLesson = async (lessonNum) => {
        if (!selectedGroup) return;
        if (window.confirm(`Guruh progressini ${lessonNum}-darsga o'tkazmoqchimisiz?`)) {
            try {
                toast.loading("Progress yangilanmoqda...", { id: 'curriculum-action' });
                const res = await curriculumAPI.setProgress(selectedGroup._id, lessonNum - 1);
                toast.success(res.data.message || "Progress yangilandi! ⚡", { id: 'curriculum-action' });
                await refreshCurriculumData();
            } catch (err) {
                toast.error(err.response?.data?.message || "Xatolik yuz berdi", { id: 'curriculum-action' });
            }
        }
    };

    const refreshCurriculumData = async () => {
        if (!selectedGroup) return;
        try {
            const [currRes, lessonsRes] = await Promise.all([
                curriculumAPI.getGroupCurriculum(selectedGroup._id),
                curriculumAPI.getGroupAllLessons(selectedGroup._id)
            ]);
            setCurriculum(currRes.data.data);
            setAllLessons(lessonsRes.data.data);
            setManualProgressVal(currRes.data.data.guruh.darsProgress || 0);
            
            const updatedGroups = groups.map(g => {
                if (g._id === selectedGroup._id) {
                    return { ...g, darsProgress: currRes.data.data.guruh.darsProgress };
                }
                return g;
            });
            setGroups(updatedGroups);
        } catch (err) {
            console.error("Yangilashda xatolik:", err);
        }
    };

    const toggleWeek = (weekNum) => {
        setExpandedWeeks(prev => ({
            ...prev,
            [weekNum]: !prev[weekNum]
        }));
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">O'quv rejasi</h1>
                <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1 font-medium">Guruhlarning dars mavzularini va progressini boshqarish</p>
            </div>

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Panel: Groups List */}
                <div className="lg:col-span-4 bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 p-4 space-y-4">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Faol guruhlar</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">Syllabus va darslarni boshqarish uchun guruhni tanlang</p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Guruh nomi yoki o'qituvchi..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold"
                        />
                        <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                    </div>

                    {/* List */}
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                        {filteredGroups.length === 0 ? (
                            <div className="text-center py-10 text-zinc-400">
                                <HiOutlineAcademicCap className="w-10 h-10 mx-auto mb-2" />
                                <p className="text-xs font-semibold">Guruhlar topilmadi</p>
                            </div>
                        ) : (
                            filteredGroups.map(group => {
                                const isSelected = selectedGroup?._id === group._id;
                                return (
                                    <button
                                        key={group._id}
                                        onClick={() => handleSelectGroup(group)}
                                        className={`w-full text-left p-3.5 rounded-lg border transition-all flex items-center justify-between gap-4 ${
                                            isSelected
                                                ? 'bg-[#0066FF]/5 text-[#0066FF] border-[#0066FF]/30'
                                                : 'bg-transparent border-gray-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{group.nomi}</h4>
                                            </div>
                                            <p className="text-xs text-zinc-400 truncate">
                                                {group.kurs?.nomi || 'Kurs belgilanmagan'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                                                    isSelected ? 'bg-[#0066FF]/10 border-[#0066FF]/20 text-[#0066FF]' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                                                }`}>
                                                    {(group.curriculumKalit || 'frontend').toUpperCase()}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 truncate">
                                                    Ustoz: {group.oqituvchi || 'Kiritilmagan'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-xs font-bold text-gray-900 dark:text-white block">
                                                {group.darsProgress || 0}-dars
                                            </span>
                                            <span className="text-[10px] text-zinc-400 block mt-0.5">
                                                Progress
                                            </span>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Panel: Detailed Curriculum Boshqaruvi */}
                <div className="lg:col-span-8 space-y-6">
                    {curriculumLoading ? (
                        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 p-20 flex justify-center items-center">
                            <LoadingSpinner />
                        </div>
                    ) : !selectedGroup || !curriculum ? (
                        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 p-16 text-center flex flex-col justify-center items-center">
                            <div className="w-12 h-12 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 text-zinc-400">
                                <HiOutlineAcademicCap className="w-6 h-6" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Guruh tanlanmagan</h3>
                            <p className="text-zinc-400 max-w-sm text-xs">Progress va dars mavzularini boshqarish uchun chap tomondagi ro'yxatdan guruhni tanlang.</p>
                        </div>
                    ) : (
                        <>
                            {/* Group Card Details */}
                            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 p-6 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-150 dark:border-zinc-900/60">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 flex items-center justify-center">
                                            <HiOutlineAcademicCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                                                {curriculum.guruh.nomi}
                                            </h2>
                                            <p className="text-xs text-zinc-400 mt-0.5">
                                                {curriculum.guruh.kurs?.nomi || "Kurs nomi ko'rsatilmagan"} • Daraja {curriculum.guruh.daraja} • {curriculum.guruh.oqituvchi || 'Ustoz'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setManualProgressOpen(!manualProgressOpen)}
                                            className="px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-xs font-semibold text-zinc-500 hover:text-zinc-700 transition-colors flex items-center gap-1.5"
                                        >
                                            <HiOutlineAdjustments className="w-4 h-4" />
                                            <span>Manual progress</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Progress Info */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                    <div className="md:col-span-8 space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-semibold text-zinc-400 uppercase tracking-wider">O'quv progressi</span>
                                            <span className="font-bold text-[#0066FF]">{curriculum.progressFoiz}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800">
                                            <div
                                                className="h-full rounded-full bg-[#0066FF] transition-all duration-500"
                                                style={{ width: `${curriculum.progressFoiz}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                                            <span>{curriculum.guruh.darsProgress} dars o'tildi</span>
                                            <span>Jami: {curriculum.guruh.jamiDarslar} dars</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg p-4 border border-zinc-200 dark:border-zinc-800 text-center">
                                        <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-2">Dars kunlari</span>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {curriculum.guruh.darsKunlari?.map((kun, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-zinc-800 text-[10px] font-bold text-[#0066FF] uppercase border border-zinc-200 dark:border-zinc-700">
                                                    {kun}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Manual Progress Form */}
                                {manualProgressOpen && (
                                    <form onSubmit={handleSetProgress} className="p-4 rounded-lg bg-[#0066FF]/5 border border-[#0066FF]/20 space-y-3">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-xs font-semibold text-[#0066FF] uppercase tracking-wider">Progressni qo'lda sozlash</h4>
                                                <p className="text-[10px] text-zinc-400 mt-0.5">O'tilgan darslar sonini o'zgartirish:</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={curriculum.guruh.jamiDarslar}
                                                    value={manualProgressVal}
                                                    onChange={(e) => setManualProgressVal(parseInt(e.target.value) || 0)}
                                                    className="w-16 px-2 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-center font-bold text-sm"
                                                />
                                                <span className="text-xs text-zinc-400">/ {curriculum.guruh.jamiDarslar}</span>
                                                <button
                                                    type="submit"
                                                    className="px-3 py-1.5 bg-[#0066FF] hover:bg-[#0052cc] text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                                                >
                                                    O'rnatish
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex border-b border-gray-150 dark:border-zinc-900/60">
                                <button
                                    onClick={() => setActiveTab('current')}
                                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                                        activeTab === 'current'
                                            ? 'border-[#0066FF] text-[#0066FF]'
                                            : 'border-transparent text-zinc-400 hover:text-zinc-650'
                                    }`}
                                >
                                    Bugungi & navbatdagi dars
                                </button>
                                <button
                                    onClick={() => setActiveTab('syllabus')}
                                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                                        activeTab === 'syllabus'
                                            ? 'border-[#0066FF] text-[#0066FF]'
                                            : 'border-transparent text-zinc-400 hover:text-zinc-650'
                                    }`}
                                >
                                    Syllabus ({allLessons?.haftalar?.reduce((sum, h) => sum + h.darslar.length, 0) || 0} ta dars)
                                </button>
                            </div>

                            {/* Tab 1: Current & Next Lesson */}
                            {activeTab === 'current' && (
                                <div className="space-y-6">
                                    {!curriculum.bugunDarsBor && (
                                        <div className="p-4 rounded-lg bg-[#FF9500]/10 border border-[#FF9500]/20 text-[#FF9500] font-semibold text-xs flex items-center gap-2">
                                            <HiOutlineCalendar className="w-4 h-4 flex-shrink-0" />
                                            <span>Bugun bu guruh uchun jadval bo'yicha dars kuni emas. Keyingi dars kuni: <strong>{curriculum.keyingiDarsKuni || 'Kiritilmagan'}</strong>.</span>
                                        </div>
                                    )}

                                    {/* Bugungi/Joriy Dars Card */}
                                    {curriculum.joriyDars ? (
                                        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 p-6 space-y-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center border border-[#0066FF]/20">
                                                        <HiOutlineLightningBolt className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20 uppercase">
                                                            Navbatdagi dars
                                                        </span>
                                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                                                            {curriculum.joriyDarsRaqam}-dars: {curriculum.joriyDars.darajaNomi || 'Mavzu nomi'}
                                                        </h3>
                                                        <p className="text-[10px] text-zinc-400 mt-0.5">
                                                            {curriculum.joriyDars.hafta}-hafta • {curriculum.joriyDars.davomiyligi || '1.5 soat'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Topics List */}
                                            <div className="space-y-2">
                                                <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">O'tiladigan mavzular</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {curriculum.joriyDars.mavzular?.map((mavzu, idx) => (
                                                        <span key={idx} className="px-3 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />
                                                            {mavzu}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Home assignment if exists */}
                                            {curriculum.joriyDars.uy_vazifa && (
                                                <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                                                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Uy vazifasi</span>
                                                    <p className="text-xs text-zinc-600 dark:text-zinc-350 leading-relaxed font-semibold">
                                                        {curriculum.joriyDars.uy_vazifa}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Control Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-50 dark:border-zinc-900/40">
                                                <button
                                                    onClick={handleMarkCompleted}
                                                    className="btn-primary flex items-center justify-center gap-2 flex-1"
                                                >
                                                    <HiOutlineCheckCircle className="w-4 h-4" />
                                                    <span>Dars o'tildi deb belgilash</span>
                                                </button>

                                                {curriculum.guruh.darsProgress > 0 && (
                                                    <button
                                                        onClick={handleUndo}
                                                        className="px-4 py-2 bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 text-[#FF3B30] rounded-lg text-xs font-semibold border border-[#FF3B30]/20 transition-all flex items-center justify-center gap-1.5"
                                                        title="Oxirgi o'tilgan darsni bekor qilish"
                                                    >
                                                        <HiOutlineRefresh className="w-4 h-4" />
                                                        <span>Bekor qilish</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 p-12 text-center">
                                            <div className="w-10 h-10 rounded-lg bg-[#00C853]/10 text-[#00C853] flex items-center justify-center mx-auto mb-3 border border-[#00C853]/20">
                                                <HiOutlineCheck className="w-6 h-6" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Kurs yakunlandi! 🎓</h3>
                                            <p className="text-zinc-400 text-xs mt-1 max-w-sm mx-auto">Ushbu guruh syllabusdagi barcha darslarni to'liq tamomladi.</p>
                                        </div>
                                    )}

                                    {/* Next lessons preview list */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {curriculum.keyingiDars && (
                                            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 p-4 space-y-3 opacity-90">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-semibold text-[#FF9500] px-2 py-0.5 rounded border border-[#FF9500]/20 bg-[#FF9500]/10 uppercase">
                                                        Keyingi ({curriculum.joriyDarsRaqam + 1}-dars)
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 font-semibold">
                                                        {curriculum.keyingiDars.hafta}-hafta
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    {curriculum.keyingiDars.mavzular?.[0] || 'Mavzu nomi'}
                                                </h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {curriculum.keyingiDars.mavzular?.map((m, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-medium text-zinc-500">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {curriculum.unganDars && (
                                            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 p-4 space-y-3 opacity-70">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-semibold text-zinc-400 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 uppercase">
                                                        Undan keyingi ({curriculum.joriyDarsRaqam + 2}-dars)
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 font-semibold">
                                                        {curriculum.unganDars.hafta}-hafta
                                                    </span>
                                                </div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                                                    {curriculum.unganDars.mavzular?.[0] || 'Mavzu nomi'}
                                                </h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {curriculum.unganDars.mavzular?.map((m, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-medium text-zinc-500">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Syllabus / Full Timeline */}
                            {activeTab === 'syllabus' && allLessons && (
                                <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 p-4 md:p-6 space-y-4">
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Kurs syllabus tuzilmasi</h3>
                                        <p className="text-xs text-zinc-400 mt-0.5">Barcha haftalar va darslar ketma-ketligi</p>
                                    </div>

                                    {/* Weeks List */}
                                    <div className="space-y-3">
                                        {allLessons.haftalar?.map((hafta) => {
                                            const isOpen = expandedWeeks[hafta.hafta];
                                            const completedCount = hafta.darslar.filter(d => d.dars_raqam <= allLessons.darsProgress).length;
                                            const isFullyCompleted = completedCount === hafta.darslar.length;
                                            const hasActiveDars = hafta.darslar.some(d => d.dars_raqam === allLessons.darsProgress + 1);

                                            return (
                                                <div key={hafta.hafta} className="rounded-lg border border-gray-150 dark:border-zinc-900/60 overflow-hidden">
                                                    {/* Week Header */}
                                                    <button
                                                        onClick={() => toggleWeek(hafta.hafta)}
                                                        className={`w-full flex items-center justify-between p-3.5 text-left transition-colors font-semibold ${
                                                            isFullyCompleted
                                                                ? 'bg-[#00C853]/5 hover:bg-[#00C853]/10 text-[#00C853]'
                                                                : hasActiveDars
                                                                ? 'bg-[#0066FF]/5 hover:bg-[#0066FF]/10 text-[#0066FF]'
                                                                : 'bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-bold ${
                                                                isFullyCompleted
                                                                    ? 'bg-[#00C853] text-white'
                                                                    : hasActiveDars
                                                                    ? 'bg-[#0066FF] text-white'
                                                                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                                                            }`}>
                                                                {hafta.hafta}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-semibold uppercase tracking-wider">
                                                                    {hafta.hafta}-hafta: {hafta.darajaNomi || 'O\'quv rejasi'}
                                                                </h4>
                                                                <span className="text-[10px] text-zinc-400 block font-normal mt-0.5">
                                                                    {completedCount} / {hafta.darslar.length} dars tugatildi
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            {isOpen ? <HiOutlineChevronUp className="w-4 h-4 text-zinc-400" /> : <HiOutlineChevronDown className="w-4 h-4 text-zinc-400" />}
                                                        </div>
                                                    </button>

                                                    {/* Week Lessons List */}
                                                    {isOpen && (
                                                        <div className="p-3 space-y-2 bg-white dark:bg-[#111111] border-t border-gray-150 dark:border-zinc-900/60">
                                                            {hafta.darslar.map((dars) => {
                                                                const isCompleted = dars.dars_raqam <= allLessons.darsProgress;
                                                                const isCurrent = dars.dars_raqam === allLessons.darsProgress + 1;

                                                                return (
                                                                    <div
                                                                        key={dars.dars_raqam}
                                                                        className={`p-3 rounded border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                                                                            isCompleted
                                                                                ? 'bg-[#00C853]/5 border-[#00C853]/15'
                                                                                : isCurrent
                                                                                ? 'bg-[#0066FF]/5 border-[#0066FF]/30'
                                                                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-150 dark:border-zinc-850 opacity-70'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                                                            <div className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-bold ${
                                                                                isCompleted
                                                                                    ? 'bg-[#00C853] text-white'
                                                                                    : isCurrent
                                                                                    ? 'bg-[#0066FF] text-white'
                                                                                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                                                                            }`}>
                                                                                {isCompleted ? <HiOutlineCheck className="w-3.5 h-3.5" /> : dars.dars_raqam}
                                                                            </div>
                                                                            <div className="space-y-1 flex-1 min-w-0">
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {dars.mavzular?.map((m, mi) => (
                                                                                        <span key={mi} className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                                                                            isCompleted
                                                                                                ? 'bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853]'
                                                                                                : isCurrent
                                                                                                ? 'bg-[#0066FF]/10 border-[#0066FF]/20 text-[#0066FF]'
                                                                                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                                                                                        }`}>
                                                                                            {m}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                                {dars.uy_vazifa && (
                                                                                    <p className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                                                                                        Vazifa: {dars.uy_vazifa}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-3 self-end sm:self-center">
                                                                            <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1">
                                                                                <HiOutlineClock className="w-3.5 h-3.5" />
                                                                                {dars.davomiyligi || '1.5 soat'}
                                                                            </span>
                                                                            {!isCompleted && !isCurrent && (
                                                                                <button
                                                                                    onClick={() => handleJumpToLesson(dars.dars_raqam)}
                                                                                    className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-semibold rounded hover:border-[#0066FF] hover:text-[#0066FF] transition-all shadow-sm"
                                                                                    title="Guruh progressini shu darsga o'tkazish"
                                                                                >
                                                                                    Sakrash
                                                                                </button>
                                                                            )}
                                                                            {isCurrent && (
                                                                                <span className="px-2 py-0.5 bg-[#0066FF] text-white rounded text-[9px] font-semibold flex items-center gap-1 uppercase">
                                                                                    <HiOutlinePlay className="w-3 h-3" />
                                                                                    Joriy
                                                                                </span>
                                                                            )}
                                                                            {isCompleted && (
                                                                                <span className="px-2 py-0.5 bg-[#00C853]/10 text-[#00C853] rounded text-[9px] font-semibold border border-[#00C853]/20 uppercase">
                                                                                    O'tildi
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CurriculumManager;
