import { useState, useEffect } from 'react';
import { noteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineChatAlt2, HiOutlineHeart, HiOutlineTrash,
    HiOutlinePaperAirplane, HiOutlineBookmark, HiOutlineAcademicCap,
    HiOutlineFire, HiOutlineLightningBolt, HiOutlineSparkles,
    HiHeart
} from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';

const Community = () => {
    const { user } = useAuth();
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [submitting, setSubmitting] = useState(false);

    const categories = [
        { id: 'general', label: 'Umumiy', icon: HiOutlineChatAlt2 },
        { id: 'vazifa', label: 'Vazifalar', icon: HiOutlineBookmark },
        { id: 'imtihon', label: 'Imtihon', icon: HiOutlineAcademicCap },
        { id: 'imtihon_siri', label: 'Imtihon Siri', icon: HiOutlineFire },
        { id: 'dars_materiali', label: 'Material', icon: HiOutlineSparkles },
        { id: 'fikr', label: 'Fikr', icon: HiOutlineLightningBolt },
    ];

    useEffect(() => {
        fetchNotes();
        // Simple "real-time" polling every 30 seconds
        const interval = setInterval(fetchNotes, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await noteAPI.getAll();
            setNotes(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return toast.error("Eslatma bo'sh bo'lishi mumkin emas");

        setSubmitting(true);
        try {
            await noteAPI.create({ content, category });
            setContent('');
            setCategory('general');
            toast.success("Eslatma qo'shildi! 🚀");
            fetchNotes();
        } catch (err) {
            toast.error("Xatolik yuz berdi");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (id) => {
        try {
            const res = await noteAPI.toggleLike(id);
            setNotes(notes.map(n => n._id === id ? {
                ...n,
                likes: res.data.liked
                    ? [...n.likes, { userId: user.id || user._id }]
                    : n.likes.filter(l => l.userId !== (user.id || user._id))
            } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Ushbu eslatmani o'chirmoqchimisiz?")) return;
        try {
            await noteAPI.delete(id);
            setNotes(notes.filter(n => n._id !== id));
            toast.success("O'chirildi");
        } catch (err) {
            toast.error("O'chirishda xatolik");
        }
    };

    const getCategoryStyles = (cat) => {
        switch (cat) {
            case 'imtihon': return 'bg-amber-100 dark:bg-amber-500/20 text-amber-600';
            case 'imtihon_siri': return 'bg-rose-100 dark:bg-rose-500/20 text-rose-600';
            case 'vazifa': return 'bg-primary-100 dark:bg-primary-500/20 text-primary-600';
            case 'dars_materiali': return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600';
            case 'fikr': return 'bg-sky-100 dark:bg-sky-500/20 text-sky-600';
            default: return 'bg-gray-100 dark:bg-dark-800 text-gray-500';
        }
    };

    if (loading) return <LoadingSpinner text="Community yuklanmoqda..." />;

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 lg:pb-16 px-4 animate-fade-in">

            {/* --- HEADER --- */}
            <header className="relative flex flex-col md:flex-row items-center justify-between gap-6 pt-6 text-center md:text-left">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-orange-500/10 blur-3xl opacity-50 pointer-events-none" />
                <div className="relative space-y-1">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] italic mb-1 block">InFast Community</span>
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                        Bilimlar <span className="text-primary-500">Almashinuvi</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">Fikrlar, sirlar va foydali eslatmalar markazi</p>
                </div>
                <div className="relative group hidden md:block">
                    <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative w-16 h-16 rounded-2.5xl bg-white/40 dark:bg-dark-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 flex items-center justify-center text-primary-500 shadow-2xl">
                        <HiOutlineChatAlt2 className="w-8 h-8" />
                    </div>
                </div>
            </header>

            {/* --- CREATE NOTE --- */}
            <div className="bg-white/40 dark:bg-dark-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[3rem] p-8 shadow-2xl space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Bugun nima o'rgandingiz? Imtihon uchun foydali maslahatingiz bormi?..."
                            className="w-full h-32 md:h-40 bg-white/50 dark:bg-dark-950/50 border-2 border-transparent focus:border-primary-500/30 rounded-[2rem] p-6 text-gray-900 dark:text-white font-bold text-sm outline-none transition-all placeholder:text-gray-400"
                        />
                        <div className="absolute bottom-6 right-6 flex items-center gap-2">
                            <span className={`text-[10px] font-black uppercase italic ${content.length > 900 ? 'text-rose-500' : 'text-gray-400'}`}>
                                {content.length} / 1000
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = category === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 border transition-all active:scale-95
                                            ${isActive
                                                ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20'
                                                : 'bg-white dark:bg-dark-800 text-gray-500 border-transparent hover:border-gray-200 dark:hover:border-white/10'}`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !content.trim()}
                            className="w-full md:w-auto px-10 py-4 bg-gray-900 dark:bg-primary-600 text-white rounded-2.5xl font-black text-xs uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Yuborilmoqda...' : (
                                <>
                                    <span>Yuborish</span>
                                    <HiOutlinePaperAirplane className="w-4 h-4 rotate-45" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* --- FEED --- */}
            <div className="space-y-8">
                {notes.map((note, index) => {
                    const isLiked = note.likes.some(l => l.userId === (user.id || user._id));
                    const isAuthor = note.authorId === (user.id || user._id);
                    const isAdmin = user.role !== 'student';
                    const categoryData = categories.find(c => c.id === note.category) || categories[0];
                    const CategoryIcon = categoryData.icon;

                    return (
                        <div
                            key={note._id}
                            className={`group relative bg-white/40 dark:bg-dark-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[3rem] p-8 shadow-xl transition-all duration-500 hover:shadow-2xl animate-slide-up
                            ${note.isPinned ? 'ring-2 ring-amber-500/50 lg:scale-[1.02] shadow-amber-500/10' : ''}`}
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {note.isPinned && (
                                <div className="absolute -top-3 left-10 px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center gap-2 shadow-lg">
                                    <HiOutlineFire className="w-3 h-3 text-white" />
                                    <span className="text-[9px] font-black text-white uppercase tracking-widest italic leading-none">Muhim Eslatma</span>
                                </div>
                            )}

                            <div className="flex items-start justify-between gap-6 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-primary-500/10 shadow-lg bg-gray-100 dark:bg-dark-950 flex items-center justify-center">
                                        {note.authorInfo?.profileImage ? (
                                            <img src={note.authorInfo.profileImage} alt={note.authorInfo.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-500/10 text-primary-500 font-bold text-xl italic">
                                                {note.authorInfo?.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none group-hover:text-primary-500 transition-colors">
                                            {note.authorInfo?.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                {note.authorInfo?.role === 'student' ? 'Talaba' : (note.authorInfo?.role || 'Admin')}
                                            </span>
                                            <div className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: uz })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 font-black text-[9px] uppercase tracking-widest italic ${getCategoryStyles(note.category)}`}>
                                    <CategoryIcon className="w-3.5 h-3.5" />
                                    {categoryData.label}
                                </div>
                            </div>

                            <p className="text-sm md:text-base font-bold text-gray-600 dark:text-gray-300 leading-relaxed italic mb-8 whitespace-pre-wrap">
                                {note.content}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                                <div className="flex items-center gap-6">
                                    <button
                                        onClick={() => handleLike(note._id)}
                                        className={`flex items-center gap-2 transition-all active:scale-90
                                            ${isLiked ? 'text-rose-500 scale-110' : 'text-gray-400 hover:text-rose-500'}`}
                                    >
                                        {isLiked ? <HiHeart className="w-6 h-6" /> : <HiOutlineHeart className="w-6 h-6" />}
                                        <span className="text-sm font-black italic">{note.likes?.length || 0}</span>
                                    </button>
                                </div>

                                {(isAuthor || isAdmin) && (
                                    <button
                                        onClick={() => handleDelete(note._id)}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <HiOutlineTrash className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {notes.length === 0 && (
                    <div className="py-24 flex flex-col items-center justify-center bg-white/20 dark:bg-dark-900/20 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-white/5">
                        <HiOutlineChatAlt2 className="w-20 h-20 text-gray-200 mb-6" />
                        <h3 className="text-xl font-black text-gray-400 uppercase italic tracking-widest">Hali hech kim yozmadi</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">Birinchi bo'lib boshlang!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
