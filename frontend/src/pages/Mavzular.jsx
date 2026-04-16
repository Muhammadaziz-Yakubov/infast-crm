import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Filter, 
    BookOpen, 
    ChevronRight, 
    MoreVertical, 
    Plus, 
    Minus, 
    Save, 
    X,
    Trophy,
    Clock,
    Layout as LayoutIcon,
    Server,
    CheckCircle2
} from 'lucide-react';
import { groupAPI, curriculumAPI } from '../services/api';
import toast from 'react-hot-toast';

const Mavzular = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            setLoading(true);
            const response = await groupAPI.getAll();
            setGroups(response.data.data || []);
        } catch (error) {
            toast.error('Guruhlarni yuklashda xatolik yuz berdi');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const sortedGroups = useMemo(() => {
        return [...groups].sort((a, b) => {
            const progressA = (a.progress?.completedLessons || 0);
            const progressB = (b.progress?.completedLessons || 0);
            return progressB - progressA;
        });
    }, [groups]);

    const topGroupId = useMemo(() => {
        if (sortedGroups.length === 0) return null;
        // Filter out groups with 0 lessons if any, otherwise return the first one from sorted list
        return sortedGroups[0]._id;
    }, [sortedGroups]);

    const filteredGroups = useMemo(() => {
        return sortedGroups.filter(group => {
            const matchesSearch = group.nomi.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = activeFilter === 'All' || 
                                (activeFilter === 'Frontend' && group.courseType === 'frontend') ||
                                (activeFilter === 'Backend' && group.courseType === 'backend');
            return matchesSearch && matchesFilter;
        });
    }, [sortedGroups, searchQuery, activeFilter]);

    const handleEditClick = (group) => {
        setSelectedGroup({
            ...group,
            tempProgress: {
                completedLessons: group.progress?.completedLessons || 0,
                currentTopic: group.progress?.currentTopic || '',
                nextLesson: group.progress?.nextLesson || ''
            }
        });
        setIsModalOpen(true);
    };

    const handleSaveProgress = async (updatedData) => {
        try {
            const response = await groupAPI.updateProgress(selectedGroup._id, updatedData);
            setGroups(prev => prev.map(g => g._id === selectedGroup._id ? { ...g, ...response.data.data } : g));
            toast.success('Progress yangilandi');
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Yangilashda xatolik yuz berdi');
        }
    };

    const handleMarkTaught = async (e, groupId) => {
        e.stopPropagation(); // Prevents opening modal when clicking the button
        try {
            const response = await curriculumAPI.markCompleted(groupId);
            fetchGroups(); // Refresh all to keep stats in sync
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BookOpen className="text-indigo-600" size={32} />
                        Mavzular & Progress
                    </h1>
                    <p className="text-gray-500 mt-1">Guruhlarning o'quv jarayonini kuzatish va boshqarish</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Guruh nomini qidiring..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none w-full sm:w-64 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </header>

            {/* Filters and Stats Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                    {['All', 'Frontend', 'Backend'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                                activeFilter === filter 
                                ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200' 
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {filter === 'All' ? 'Barchasi' : filter}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-6 text-sm">
                    <div className="flex flex-col">
                        <span className="text-gray-400 font-medium">Jami guruhlar</span>
                        <span className="text-lg font-bold text-gray-900">{filteredGroups.length}</span>
                    </div>
                    <div className="h-10 w-[1px] bg-gray-100"></div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 font-medium">O'rtacha progress</span>
                        <span className="text-lg font-bold text-gray-900">
                            {Math.round(filteredGroups.reduce((acc, g) => acc + (g.progress?.completedLessons || 0) / (g.progress?.totalLessons || 1), 0) / (filteredGroups.length || 1) * 100)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Course Timeline Preview (Static Info) */}
            <section className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 text-indigo-100 transition-transform group-hover:scale-110 duration-500">
                        <LayoutIcon size={120} />
                    </div>
                    <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2 mb-4 relative z-10">
                        <LayoutIcon size={20} />
                        Frontend Yo'nalishi
                    </h3>
                    <div className="space-y-3 relative z-10">
                        {[
                            { title: 'HTML/CSS/Bootstrap/GitHub', duration: '5–6 oy' },
                            { title: 'JavaScript', duration: '7 oy' },
                            { title: 'React + Tailwind', duration: '9 oy' }
                        ].map((step, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-indigo-50">
                                <span className="text-gray-700 font-medium">{step.title}</span>
                                <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-indigo-100">{step.duration}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 text-emerald-100 transition-transform group-hover:scale-110 duration-500">
                        <Server size={120} />
                    </div>
                    <h3 className="text-lg font-bold text-emerald-900 flex items-center gap-2 mb-4 relative z-10">
                        <Server size={20} />
                        Backend Yo'nalishi
                    </h3>
                    <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between p-3 bg-white/60 backdrop-blur-sm rounded-xl border border-emerald-50 h-full flex-grow items-center">
                            <span className="text-gray-700 font-medium">To'liq kurs davomiyligi (Node.js/Express/MongoDB)</span>
                            <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-bold ring-1 ring-emerald-100 whitespace-nowrap">6 oy</span>
                        </div>
                        <div className="p-3 text-sm text-emerald-700 bg-emerald-50/50 rounded-xl">
                            Frontend bilan integratsiya, API dizayni va ma'lumotlar bazasi bilan ishlash asoslari.
                        </div>
                    </div>
                </div>
            </section>

            {/* Groups Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredGroups.map((group, index) => (
                        <GroupCard 
                            key={group._id} 
                            group={group} 
                            isTop={group._id === topGroupId} 
                            index={index}
                            onClick={() => handleEditClick(group)}
                            onMarkTaught={(e) => handleMarkTaught(e, group._id)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Progress Modal */}
            <EditProgressModal 
                isOpen={isModalOpen}
                group={selectedGroup}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProgress}
            />
        </div>
    );
};

const GroupCard = ({ group, isTop, index, onClick, onMarkTaught }) => {
    const totalLessons = group.courseType === 'backend' ? 72 : 114;
    const progress = group.progress || { completedLessons: 0, totalLessons: totalLessons, currentTopic: '', nextLesson: '' };
    const percentage = Math.min(Math.round((progress.completedLessons / (progress.totalLessons || totalLessons)) * 100), 100);

    const getProgressBarColor = (pct) => {
        if (pct <= 30) return 'bg-rose-500';
        if (pct <= 70) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    const getProgressBgColor = (pct) => {
        if (pct <= 30) return 'bg-rose-50';
        if (pct <= 70) return 'bg-amber-50';
        return 'bg-emerald-50';
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            onClick={onClick}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group/card overflow-hidden"
        >
            <div className="p-6 space-y-5">
                {/* Card Top */}
                <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                                group.courseType === 'frontend' 
                                ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' 
                                : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200'
                            }`}>
                                {group.courseType === 'frontend' ? 'Frontend' : 'Backend'}
                            </span>
                            {isTop && (
                                <span className="flex items-center gap-1 px-2.5 py-0.5 bg-yellow-400 text-yellow-900 rounded-full text-[10px] uppercase font-black animate-pulse">
                                    <Trophy size={10} />
                                    Top Group
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 group-hover/card:text-indigo-600 transition-colors uppercase">
                            {group.nomi}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onMarkTaught}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all ring-1 ring-emerald-200"
                            title="Bugungi darsni o'tildi deb belgilash"
                        >
                            <CheckCircle2 size={14} />
                            Otildi
                        </button>
                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400 group-hover/card:bg-indigo-50 group-hover/card:text-indigo-600 transition-all">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-2.5">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Progress</span>
                            <span className="text-2xl font-black text-gray-900 leading-none">
                                {percentage}%
                            </span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Darslar</span>
                            <span className="text-sm font-bold text-gray-700">
                                {progress.completedLessons} <span className="text-gray-300">/</span> {progress.totalLessons}
                            </span>
                        </div>
                    </div>
                    
                    <div className={`h-3 w-full ${getProgressBgColor(percentage)} rounded-full overflow-hidden p-0.5 ring-1 ring-black/5`}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${getProgressBarColor(percentage)} shadow-sm relative overflow-hidden`}
                        >
                            <div className="absolute top-0 left-0 w-full h-full bg-white/20 -skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
                        </motion.div>
                    </div>
                </div>

                {/* Topics Footer */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-50">
                    <div className="bg-gray-50/50 p-3 rounded-2xl">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase mb-1">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            Oxirgi o'tilgan
                        </span>
                        <p className="text-xs font-bold text-gray-700 line-clamp-1 italic">
                            {progress.currentTopic || 'Dars boshlanmagan'}
                        </p>
                    </div>
                    <div className="bg-indigo-50/30 p-3 rounded-2xl ring-1 ring-indigo-100">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase mb-1">
                            <Clock size={12} className="animate-pulse" />
                            Bugungi mavzu
                        </span>
                        <p className="text-xs font-bold text-indigo-700 line-clamp-1">
                            {progress.nextLesson || (progress.completedLessons >= (progress.totalLessons || totalLessons) ? 'Kurs tugadi 🎉' : 'Yaqinda...')}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const EditProgressModal = ({ isOpen, group, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        completedLessons: 0,
        currentTopic: '',
        nextLesson: ''
    });

    useEffect(() => {
        if (group) {
            setFormData({
                completedLessons: group.progress?.completedLessons || 0,
                currentTopic: group.progress?.currentTopic || '',
                nextLesson: group.progress?.nextLesson || ''
            });
        }
    }, [group]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const quickAction = (action) => {
        if (action === '+1') setFormData(prev => ({ ...prev, completedLessons: Number(prev.completedLessons) + 1 }));
        if (action === '+5') setFormData(prev => ({ ...prev, completedLessons: Number(prev.completedLessons) + 5 }));
        if (action === 'set70') setFormData(prev => ({ ...prev, completedLessons: 70 }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
            ></motion.div>
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden relative z-10 p-8 border border-white/20"
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">Progressni tahrirlash</h2>
                        <p className="text-gray-500 font-medium">{group.nomi} guruhining joriy holati</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form Body */}
                <div className="space-y-6">
                    {/* Lessons Count */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Bajarilgan darslar soni</label>
                        <div className="flex items-center gap-3">
                            <div className="flex-grow flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                                <button 
                                    onClick={() => setFormData(prev => ({ ...prev, completedLessons: Math.max(0, Number(prev.completedLessons) - 1) }))}
                                    className="p-3 bg-white text-gray-600 rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
                                >
                                    <Minus size={20} />
                                </button>
                                <input 
                                    type="number"
                                    name="completedLessons"
                                    value={formData.completedLessons}
                                    onChange={handleChange}
                                    className="bg-transparent border-none focus:ring-0 text-center text-xl font-bold w-full text-gray-900"
                                />
                                <button 
                                    onClick={() => setFormData(prev => ({ ...prev, completedLessons: Number(prev.completedLessons) + 1 }))}
                                    className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm hover:bg-indigo-50 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Quick Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: '+1 dars', action: '+1' },
                                { label: '+5 dars', action: '+5' },
                                { label: '70 dars', action: 'set70' }
                            ].map(btn => (
                                <button
                                    key={btn.action}
                                    onClick={() => quickAction(btn.action)}
                                    className="py-2.5 bg-gray-50 text-[11px] font-bold text-gray-500 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 uppercase tracking-wider"
                                >
                                    {btn.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Text Inputs */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Joriy mavzu</label>
                            <input 
                                type="text"
                                name="currentTopic"
                                value={formData.currentTopic}
                                onChange={handleChange}
                                placeholder="Mavzu nomini kiriting..."
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-800"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Keyingi dars</label>
                            <input 
                                type="text"
                                name="nextLesson"
                                value={formData.nextLesson}
                                onChange={handleChange}
                                placeholder="Keyingi dars mavzusi..."
                                className="w-full bg-gray-50 border-gray-100 rounded-2xl py-3 px-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-800"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-4 mt-10">
                    <button 
                        onClick={onClose}
                        className="flex-grow py-4 px-6 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all shadow-sm"
                    >
                        Bekor qilish
                    </button>
                    <button 
                        onClick={() => onSave(formData)}
                        className="flex-grow flex items-center justify-center gap-2 py-4 px-6 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-500/30"
                    >
                        <CheckCircle2 size={20} />
                        Saqlash
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Mavzular;
