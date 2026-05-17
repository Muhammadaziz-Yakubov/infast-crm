import { useState, useEffect } from 'react';
import { groupAPI, curriculumAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch, HiOutlineAcademicCap, HiOutlineCheckCircle,
    HiOutlineClock, HiOutlineChevronDown, HiOutlineChevronUp,
    HiOutlineLightningBolt, HiOutlineCalendar, HiOutlineBookOpen,
    HiOutlineRefresh, HiOutlineCheck, HiOutlineAdjustments,
    HiOutlinePlay, HiOutlineArrowRight, HiOutlineUserGroup, HiOutlineLockClosed
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
            
            // Avtomatik birinchi guruhni tanlash
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

            // Barcha haftalarni boshlang'ichda yopiq holda, lekin joriy dars bor haftani ochiq qilish
            const currentLessonNum = (currRes.data.data.guruh.darsProgress || 0) + 1;
            const tempExpanded = {};
            if (lessonsRes.data.data?.haftalar) {
                lessonsRes.data.data.haftalar.forEach(hafta => {
                    // Agar joriy dars shu haftada bo'lsa, uni ochiq qilamiz
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
            
            // Ma'lumotlarni qayta yuklash
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
            
            // Guruhlar ro'yxatidagi progressni ham yangilaymiz
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

    if (loading) return <LoadingSpinner text="Sahifa yuklanmoqda..." />;

    return (
        <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                        O'quv <span className="text-primary-500">Rejasi & Progress</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Guruhlarning dars mavzularini va progressini boshqarish</p>
                </div>
            </div>

            {/* Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Panel: Groups List */}
                <div className="lg:col-span-4 bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm p-6 space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-black text-gray-900 dark:text-white text-lg">Faol Guruhlar</h3>
                        <p className="text-xs text-gray-400">Curriculum progressini sozlash uchun guruhni tanlang</p>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Guruh nomi yoki o'qituvchi..."
                            className="w-full px-5 py-4 pl-12 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent 
                                focus:border-primary-500 shadow-inner outline-none transition-all font-bold text-sm"
                        />
                        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>

                    {/* List */}
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                        {filteredGroups.length === 0 ? (
                            <div className="text-center py-16 opacity-30">
                                <HiOutlineAcademicCap className="w-16 h-16 mx-auto mb-3" />
                                <p className="font-bold text-sm">Guruhlar topilmadi</p>
                            </div>
                        ) : (
                            filteredGroups.map(group => {
                                const isSelected = selectedGroup?._id === group._id;
                                return (
                                    <button
                                        key={group._id}
                                        onClick={() => handleSelectGroup(group)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                                            isSelected
                                                ? 'bg-primary-500 text-white border-transparent shadow-lg shadow-primary-500/25 scale-[1.02]'
                                                : 'bg-gray-50 dark:bg-dark-900/50 hover:bg-gray-100 dark:hover:bg-dark-900 border-gray-100 dark:border-white/5'
                                        }`}
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <HiOutlineAcademicCap className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-white' : 'text-primary-500'}`} />
                                                <h4 className="font-black truncate uppercase text-sm">{group.nomi}</h4>
                                            </div>
                                            <p className={`text-[10px] uppercase font-bold truncate tracking-wider ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                                {group.kurs?.nomi || 'Kurs belgilanmagan'}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${
                                                    isSelected ? 'bg-white/20 text-white' : 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                                }`}>
                                                    {(group.curriculumKalit || 'frontend').toUpperCase()}
                                                </span>
                                                <span className={`text-[10px] font-bold ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                                    Ustoz: {group.oqituvchi || 'Kiritilmagan'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <span className="text-xs font-black block mb-1">
                                                {group.darsProgress || 0}-dars
                                            </span>
                                            <span className={`text-[10px] font-bold ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
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
                        <div className="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 p-20 flex justify-center items-center shadow-sm min-h-[400px]">
                            <LoadingSpinner text="Curriculum yuklanmoqda..." />
                        </div>
                    ) : !selectedGroup || !curriculum ? (
                        <div className="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 p-20 text-center shadow-sm min-h-[400px] flex flex-col justify-center items-center">
                            <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5 flex items-center justify-center mb-6 shadow-inner text-gray-400">
                                <HiOutlineAcademicCap className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Guruh tanlanmagan</h3>
                            <p className="text-gray-400 max-w-sm font-medium text-sm">Progress va dars mavzularini boshqarish uchun chap tomondagi ro'yxatdan guruhni tanlang.</p>
                        </div>
                    ) : (
                        <>
                            {/* Group Card Details */}
                            <div className="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm p-6 md:p-8 space-y-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-primary-500/20 text-white transform rotate-3">
                                            <HiOutlineAcademicCap className="w-9 h-9" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">
                                                {curriculum.guruh.nomi}
                                            </h2>
                                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">
                                                {curriculum.guruh.kurs?.nomi || "Kurs nomi ko'rsatilmagan"} • Daraja {curriculum.guruh.daraja} • {curriculum.guruh.oqituvchi || 'Ustoz'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setManualProgressOpen(!manualProgressOpen)}
                                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-dark-800 transition-colors text-xs font-black text-gray-500 dark:text-gray-400"
                                        >
                                            <HiOutlineAdjustments className="w-4 h-4" />
                                            <span>Manual progress</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Circular/Linear Progress Info */}
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                    <div className="md:col-span-8 space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-wider">O'quv progressi</span>
                                            <span className="font-black text-primary-500">{curriculum.progressFoiz}%</span>
                                        </div>
                                        <div className="w-full h-4 bg-gray-100 dark:bg-dark-900 rounded-full overflow-hidden p-0.5 shadow-inner">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-primary-500 to-indigo-600 transition-all duration-1000 ease-out shadow-lg"
                                                style={{ width: `${curriculum.progressFoiz}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[11px] font-bold text-gray-400">
                                            <span>{curriculum.guruh.darsProgress} dars o'tildi</span>
                                            <span>Jami: {curriculum.guruh.jamiDarslar} dars</span>
                                        </div>
                                    </div>
                                    <div className="md:col-span-4 bg-gray-50 dark:bg-dark-900/50 rounded-2xl p-4 border border-gray-100 dark:border-white/5 text-center">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dars Kunlari</div>
                                        <div className="flex flex-wrap gap-1.5 justify-center">
                                            {curriculum.guruh.darsKunlari?.map((kun, i) => (
                                                <span key={i} className="px-2.5 py-1 rounded-lg bg-white dark:bg-dark-800 text-[10px] font-black text-primary-500 uppercase tracking-wider border border-gray-100 dark:border-white/5">
                                                    {kun}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Manual Progress Settings form */}
                                {manualProgressOpen && (
                                    <form onSubmit={handleSetProgress} className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 space-y-3 animate-slide-up">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-wider">Progressni qo'lda o'rnatish</h4>
                                                <p className="text-[10px] text-gray-400 mt-0.5">Eski guruhlar uchun o'tilgan darslar sonini o'rnatish:</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={curriculum.guruh.jamiDarslar}
                                                    value={manualProgressVal}
                                                    onChange={(e) => setManualProgressVal(parseInt(e.target.value) || 0)}
                                                    className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-dark-900 border-2 border-gray-200 dark:border-dark-700 focus:border-primary-500 outline-none text-center font-black text-sm"
                                                />
                                                <span className="text-xs font-bold text-gray-400">/ {curriculum.guruh.jamiDarslar}</span>
                                                <button
                                                    type="submit"
                                                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 transition-all active:scale-95"
                                                >
                                                    O'rnatish
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>

                            {/* Navigation Tabs (Today's Lesson / Syllabus Timeline) */}
                            <div className="flex border-b border-gray-200 dark:border-white/5">
                                <button
                                    onClick={() => setActiveTab('current')}
                                    className={`px-6 py-4 font-black text-sm uppercase tracking-wider border-b-2 transition-all ${
                                        activeTab === 'current'
                                            ? 'border-primary-500 text-primary-500'
                                            : 'border-transparent text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Bugungi & Navbatdagi Dars
                                </button>
                                <button
                                    onClick={() => setActiveTab('syllabus')}
                                    className={`px-6 py-4 font-black text-sm uppercase tracking-wider border-b-2 transition-all ${
                                        activeTab === 'syllabus'
                                            ? 'border-primary-500 text-primary-500'
                                            : 'border-transparent text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
                                    }`}
                                >
                                    Syllabus / Barcha Darslar ({allLessons?.haftalar?.reduce((sum, h) => sum + h.darslar.length, 0) || 0})
                                </button>
                            </div>

                            {/* Tab 1: Current & Next Lesson */}
                            {activeTab === 'current' && (
                                <div className="space-y-6">
                                    {/* Bugungi dars bormi tekshiruvi */}
                                    {!curriculum.bugunDarsBor && (
                                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-3">
                                            <HiOutlineCalendar className="w-5 h-5 flex-shrink-0 animate-bounce" />
                                            <span>Bugun bu guruh uchun jadval bo'yicha dars kuni emas. Keyingi dars kuni: <strong>{curriculum.keyingiDarsKuni || 'Kiritilmagan'}</strong>. Lekin siz dars progressini baribir boshqarishingiz mumkin.</span>
                                        </div>
                                    )}

                                    {/* Bugungi/Joriy Dars Card */}
                                    {curriculum.joriyDars ? (
                                        <div className="bg-gradient-to-br from-white to-gray-50/30 dark:from-dark-800 dark:to-dark-800/80 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm p-6 md:p-8 space-y-6 relative overflow-hidden group">
                                            {/* Glow Accent */}
                                            <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-10 bg-primary-500 -mr-12 -mt-12 transition-all duration-700 group-hover:scale-125" />

                                            <div className="flex items-start justify-between relative z-10">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 animate-pulse">
                                                        <HiOutlineLightningBolt className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-widest">
                                                            Navbatdagi dars
                                                        </span>
                                                        <h3 className="text-xl font-black text-gray-900 dark:text-white mt-2">
                                                            {curriculum.joriyDarsRaqam}-Dars: {curriculum.joriyDars.darajaNomi || 'Dars Mavzulari'}
                                                        </h3>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                                                            {curriculum.joriyDars.hafta}-hafta • {curriculum.joriyDars.davomiyligi || '1.5 soat'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Topics List */}
                                            <div className="space-y-3 relative z-10">
                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">O'tiladigan mavzular</h4>
                                                <div className="flex flex-wrap gap-2.5">
                                                    {curriculum.joriyDars.mavzular?.map((mavzu, idx) => (
                                                        <span key={idx} className="px-4 py-2.5 rounded-xl bg-white dark:bg-dark-900 text-sm font-bold text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                                            {mavzu}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Home assignment if exists */}
                                            {curriculum.joriyDars.uy_vazifa && (
                                                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5 space-y-2 relative z-10">
                                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Uy vazifasi</div>
                                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
                                                        {curriculum.joriyDars.uy_vazifa}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Control Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-white/5 relative z-10">
                                                <button
                                                    onClick={handleMarkCompleted}
                                                    className="flex-1 py-4 bg-gradient-to-r from-primary-500 to-indigo-600 hover:from-primary-600 hover:to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                                    <span>Dars o'tildi deb belgilash</span>
                                                </button>

                                                {curriculum.guruh.darsProgress > 0 && (
                                                    <button
                                                        onClick={handleUndo}
                                                        className="px-6 py-4 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-200/50 dark:border-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                                        title="Oxirgi o'tilgan darsni bekor qilish"
                                                    >
                                                        <HiOutlineRefresh className="w-4 h-4" />
                                                        <span>Bekor qilish</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 p-12 text-center shadow-sm">
                                            <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
                                                <HiOutlineCheck className="w-8 h-8" />
                                            </div>
                                            <h3 className="text-lg font-black text-gray-900 dark:text-white">Kurs yakunlandi! 🎓</h3>
                                            <p className="text-gray-400 text-sm mt-1 max-w-sm mx-auto">Ushbu guruh curriculumdagi barcha darslarni to'liq tamomladi.</p>
                                        </div>
                                    )}

                                    {/* Next lessons preview list */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Keyingi dars */}
                                        {curriculum.keyingiDars && (
                                            <div className="bg-white dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-white/5 p-6 space-y-4 shadow-sm opacity-80">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest px-2.5 py-1 rounded-lg bg-amber-500/10">
                                                        Keyingi dars ({curriculum.joriyDarsRaqam + 1}-dars)
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold">
                                                        {curriculum.keyingiDars.hafta}-hafta
                                                    </span>
                                                </div>
                                                <h4 className="font-black text-gray-900 dark:text-white text-base">
                                                    {curriculum.keyingiDars.mavzular?.[0] || 'Dars mavzusi'}
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {curriculum.keyingiDars.mavzular?.map((m, idx) => (
                                                        <span key={idx} className="px-2 py-1 rounded-lg bg-gray-50 dark:bg-dark-900 text-[10px] font-bold text-gray-500">
                                                            {m}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Undan keyingi dars */}
                                        {curriculum.unganDars && (
                                            <div className="bg-white dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-white/5 p-6 space-y-4 shadow-sm opacity-60">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-900">
                                                        Undan keyingi ({curriculum.joriyDarsRaqam + 2}-dars)
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 font-bold">
                                                        {curriculum.unganDars.hafta}-hafta
                                                    </span>
                                                </div>
                                                <h4 className="font-black text-gray-900 dark:text-white text-base">
                                                    {curriculum.unganDars.mavzular?.[0] || 'Dars mavzusi'}
                                                </h4>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {curriculum.unganDars.mavzular?.map((m, idx) => (
                                                        <span key={idx} className="px-2 py-1 rounded-lg bg-gray-50 dark:bg-dark-900 text-[10px] font-bold text-gray-500">
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
                                <div className="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm p-6 md:p-8 space-y-6">
                                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
                                        <div>
                                            <h3 className="font-black text-gray-900 dark:text-white text-lg">Kurs Syllabus Tuzilmasi</h3>
                                            <p className="text-xs text-gray-400 mt-0.5">Barcha darslar ketma-ketligi ro'yxati</p>
                                        </div>
                                    </div>

                                    {/* Weeks List */}
                                    <div className="space-y-4">
                                        {allLessons.haftalar?.map((hafta) => {
                                            const isOpen = expandedWeeks[hafta.hafta];
                                            
                                            // Tekshirish: Bu haftada biror dars o'tilganmi yoki o'tilyaptimi?
                                            const completedCount = hafta.darslar.filter(d => d.dars_raqam <= allLessons.darsProgress).length;
                                            const isFullyCompleted = completedCount === hafta.darslar.length;
                                            const hasActiveDars = hafta.darslar.some(d => d.dars_raqam === allLessons.darsProgress + 1);

                                            return (
                                                <div key={hafta.hafta} className="rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-300">
                                                    {/* Week Header */}
                                                    <button
                                                        onClick={() => toggleWeek(hafta.hafta)}
                                                        className={`w-full flex items-center justify-between p-4 text-left transition-colors font-bold ${
                                                            isFullyCompleted
                                                                ? 'bg-emerald-500/5 dark:bg-emerald-500/2 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'
                                                                : hasActiveDars
                                                                ? 'bg-primary-500/5 hover:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                                                                : 'bg-gray-50 dark:bg-dark-900 hover:bg-gray-100 dark:hover:bg-dark-800'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                                                                isFullyCompleted
                                                                    ? 'bg-emerald-500 text-white'
                                                                    : hasActiveDars
                                                                    ? 'bg-primary-500 text-white animate-pulse'
                                                                    : 'bg-gray-200 dark:bg-dark-700 text-gray-500'
                                                            }`}>
                                                                {hafta.hafta}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-black uppercase tracking-wide">
                                                                    {hafta.hafta}-Hafta: {hafta.darajaNomi || 'O\'quv rejasi'}
                                                                </h4>
                                                                <span className="text-[10px] text-gray-400 block font-normal mt-0.5">
                                                                    {completedCount} / {hafta.darslar.length} dars yakunlandi
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {isOpen ? <HiOutlineChevronUp className="w-5 h-5 text-gray-400" /> : <HiOutlineChevronDown className="w-5 h-5 text-gray-400" />}
                                                        </div>
                                                    </button>

                                                    {/* Week Lessons List */}
                                                    {isOpen && (
                                                        <div className="p-4 space-y-3 bg-white dark:bg-dark-800 border-t border-gray-100 dark:border-white/5 animate-slide-up">
                                                            {hafta.darslar.map((dars) => {
                                                                const isCompleted = dars.dars_raqam <= allLessons.darsProgress;
                                                                const isCurrent = dars.dars_raqam === allLessons.darsProgress + 1;

                                                                return (
                                                                    <div
                                                                        key={dars.dars_raqam}
                                                                        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                                                                            isCompleted
                                                                                ? 'bg-emerald-500/5 dark:bg-emerald-500/2 border-emerald-200/40 dark:border-emerald-500/10'
                                                                                : isCurrent
                                                                                ? 'bg-primary-500/5 dark:bg-primary-500/2 border-primary-300 dark:border-primary-500/30 shadow-md shadow-primary-500/5'
                                                                                : 'bg-gray-50 dark:bg-dark-900 border-gray-100 dark:border-white/5 opacity-70'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-start gap-3 flex-1 min-w-0">
                                                                            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black ${
                                                                                isCompleted
                                                                                    ? 'bg-emerald-500 text-white'
                                                                                    : isCurrent
                                                                                    ? 'bg-primary-500 text-white'
                                                                                    : 'bg-gray-200 dark:bg-dark-700 text-gray-500'
                                                                            }`}>
                                                                                {isCompleted ? <HiOutlineCheck className="w-4 h-4" /> : dars.dars_raqam}
                                                                            </div>
                                                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                    {dars.mavzular?.map((m, mi) => (
                                                                                        <span key={mi} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                                                                            isCompleted
                                                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                                                                                : isCurrent
                                                                                                ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-extrabold'
                                                                                                : 'bg-gray-100 dark:bg-dark-800 text-gray-500'
                                                                                        }`}>
                                                                                            {m}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                                {dars.uy_vazifa && (
                                                                                    <p className="text-[11px] text-gray-400 font-medium italic mt-1 line-clamp-1 hover:line-clamp-none transition-all duration-300">
                                                                                        Vazifa: {dars.uy_vazifa}
                                                                                    </p>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-3 self-end md:self-center">
                                                                            <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                                                <HiOutlineClock className="w-3.5 h-3.5" />
                                                                                {dars.davomiyligi || '1.5 soat'}
                                                                            </span>
                                                                            {!isCompleted && !isCurrent && (
                                                                                <button
                                                                                    onClick={() => handleJumpToLesson(dars.dars_raqam)}
                                                                                    className="px-3.5 py-1.5 bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/5 hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-500 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                                                                                    title="Guruh progressini shu darsga o'tkazish"
                                                                                >
                                                                                    Sakrash
                                                                                </button>
                                                                            )}
                                                                            {isCurrent && (
                                                                                <span className="px-3 py-1 bg-primary-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                                                    <HiOutlinePlay className="w-3 h-3" />
                                                                                    Joriy
                                                                                </span>
                                                                            )}
                                                                            {isCompleted && (
                                                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
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
