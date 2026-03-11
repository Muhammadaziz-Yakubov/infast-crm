import { useState, useEffect } from 'react';
import { groupAPI, homeworkAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineLightningBolt, HiOutlineAcademicCap, HiOutlineClipboardCheck,
    HiOutlineRefresh, HiOutlineCheck, HiOutlineChevronDown, HiOutlineBookOpen,
    HiOutlineStar, HiOutlineClock, HiOutlineCalendar
} from 'react-icons/hi';

const Homework = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [homework, setHomework] = useState(null);
    const [deadline, setDeadline] = useState('');
    const [maxScore, setMaxScore] = useState(100);

    useEffect(() => {
        fetchGroups();
        // Default deadline: 7 kun keyin
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        setDeadline(nextWeek.toISOString().split('T')[0]);
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await groupAPI.getAll();
            setGroups(res.data.data.filter(g => g.holati === 'faol'));
        } catch (err) {
            toast.error("Guruhlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedGroup) {
            toast.error("Avval guruhni tanlang");
            return;
        }
        try {
            setGenerating(true);
            setHomework(null);
            const res = await homeworkAPI.generate(selectedGroup);
            setHomework(res.data.data);
            toast.success("Vazifa muvaffaqiyatli generatsiya qilindi! 🎯");
        } catch (err) {
            toast.error(err.response?.data?.message || 'Generatsiya xatosi');
        } finally {
            setGenerating(false);
        }
    };

    const handleRegenerate = async () => {
        await handleGenerate();
    };

    const handleAssign = async () => {
        if (!homework || !selectedGroup) {
            toast.error("Avval vazifa generatsiya qiling");
            return;
        }

        try {
            setAssigning(true);
            const res = await homeworkAPI.assign({
                groupId: selectedGroup,
                title: homework.title,
                description: homework.fullText,
                maxScore,
                deadline: new Date(deadline)
            });
            toast.success(res.data.message);
            setHomework(null);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Tayinlashda xatolik');
        } finally {
            setAssigning(false);
        }
    };

    const selectedGroupData = groups.find(g => g._id === selectedGroup);

    if (loading) return <LoadingSpinner text="Yuklanmoqda..." />;

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="space-y-1">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                    AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">Homework</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Sun'iy intellekt yordamida professional uy vazifalari yarating
                </p>
            </div>

            {/* Guruh tanlash */}
            <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 block">
                    📋 Guruhni tanlang
                </label>
                <div className="relative">
                    <select
                        value={selectedGroup}
                        onChange={e => { setSelectedGroup(e.target.value); setHomework(null); }}
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent 
                            focus:border-purple-500 outline-none transition-all font-bold appearance-none cursor-pointer text-gray-700 dark:text-gray-200"
                    >
                        <option value="">Guruhni tanlang...</option>
                        {groups.map(g => (
                            <option key={g._id} value={g._id}>
                                {g.nomi} — {g.kurs?.nomi || "Kurs yo'q"} ({g.oqituvchi || 'Ustoz'})
                            </option>
                        ))}
                    </select>
                    <HiOutlineChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>

                {selectedGroupData && (
                    <div className="mt-4 flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <HiOutlineAcademicCap className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-gray-900 dark:text-white truncate">{selectedGroupData.nomi}</p>
                            <p className="text-[10px] font-bold text-gray-400">{selectedGroupData.kurs?.nomi} • {selectedGroupData.jadval?.kunlar || 'Jadval belgilanmagan'}</p>
                        </div>
                    </div>
                )}

                {/* AI Homework Button */}
                <button
                    onClick={handleGenerate}
                    disabled={!selectedGroup || generating}
                    className={`mt-5 w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-base shadow-xl 
                        transition-all active:scale-95 hover:-translate-y-0.5
                        ${!selectedGroup || generating
                            ? 'bg-gray-200 dark:bg-dark-700 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/20 hover:shadow-2xl'
                        }`}
                >
                    {generating ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Generatsiya qilinmoqda...</span>
                        </>
                    ) : (
                        <>
                            <HiOutlineLightningBolt className="w-6 h-6" />
                            <span>🤖 AI Homework Yaratish</span>
                        </>
                    )}
                </button>
            </div>

            {/* Generated Homework Preview */}
            {homework && (
                <div className="space-y-4 animate-fade-in">
                    {/* Main Card */}
                    <div className="bg-white dark:bg-dark-800 rounded-[2rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-lg">
                        {/* Gradient Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                                    {homework.kurs}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                                    Daraja: {homework.daraja}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest">
                                    {homework.darsRaqam}-Dars
                                </span>
                            </div>
                            <h2 className="text-xl font-black text-white">{homework.title}</h2>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Mavzular */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <HiOutlineBookOpen className="w-4 h-4" />
                                    Mavzular
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {homework.mavzular.map((m, i) => (
                                        <span key={i} className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold">
                                            {m}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Tavsif */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">📝 Tavsif</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{homework.description}</p>
                            </div>

                            {/* Talablar */}
                            <div>
                                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">✅ Talablar</h4>
                                <div className="space-y-2">
                                    {homework.requirements.map((req, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5">
                                            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <span className="text-white text-[10px] font-black">{i + 1}</span>
                                            </div>
                                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{req}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bonus */}
                            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border border-amber-200/30 dark:border-amber-500/10">
                                <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <HiOutlineStar className="w-4 h-4" />
                                    Bonus vazifa
                                </h4>
                                <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">{homework.bonus}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tayinlash sozlamalari */}
                    <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h3 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <HiOutlineClipboardCheck className="w-5 h-5 text-emerald-500" />
                            Tayinlash sozlamalari
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                                    <HiOutlineCalendar className="w-3.5 h-3.5 inline mr-1" />
                                    Deadline
                                </label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={e => setDeadline(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none font-bold"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                                    <HiOutlineStar className="w-3.5 h-3.5 inline mr-1" />
                                    Maksimal ball
                                </label>
                                <input
                                    type="number"
                                    min="10"
                                    max="1000"
                                    value={maxScore}
                                    onChange={e => setMaxScore(parseInt(e.target.value) || 100)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none font-black"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={handleRegenerate}
                                disabled={generating}
                                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gray-100 dark:bg-dark-900 text-gray-600 dark:text-gray-300 
                                    font-bold text-sm hover:bg-gray-200 dark:hover:bg-dark-700 transition-all active:scale-95"
                            >
                                <HiOutlineRefresh className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                                Qayta generatsiya
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={assigning}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 text-white 
                                    font-black text-sm shadow-xl shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-95 transition-all"
                            >
                                {assigning ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <HiOutlineCheck className="w-5 h-5" />
                                )}
                                {assigning ? "Tayinlanmoqda..." : "Vazifani tayinlash 🎯"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!homework && !generating && selectedGroup && (
                <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-12 border border-gray-100 dark:border-white/5 shadow-sm text-center">
                    <div className="w-24 h-24 rounded-3xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                        <HiOutlineLightningBolt className="w-12 h-12 text-purple-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">AI Homework tayyor</h3>
                    <p className="text-gray-400 font-medium mb-1">Yuqoridagi tugmani bosib vazifa generatsiya qiling</p>
                    <p className="text-xs text-gray-400">Vazifa guruhning joriy dars mavzulariga mos yaratiladi</p>
                </div>
            )}
        </div>
    );
};

export default Homework;
