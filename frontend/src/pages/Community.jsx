import { useState, useEffect } from 'react';
import { noteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineChatAlt2, HiOutlineHeart, HiOutlineTrash,
    HiOutlinePaperAirplane, HiOutlineBookmark, HiOutlineAcademicCap,
    HiOutlineFire, HiOutlineLightningBolt, HiOutlineSparkles,
    HiHeart, HiOutlinePlus, HiOutlineX
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
    const [isWriting, setIsWriting] = useState(false);

    const categories = [
        { id: 'general', label: 'Barchasi', icon: HiOutlineChatAlt2 },
        { id: 'vazifa', label: 'Vazifalar', icon: HiOutlineBookmark },
        { id: 'imtihon', label: 'Imtihon', icon: HiOutlineAcademicCap },
        { id: 'imtihon_siri', label: 'Sirlar', icon: HiOutlineFire },
        { id: 'dars_materiali', label: 'Material', icon: HiOutlineSparkles },
        { id: 'fikr', label: 'Fikr', icon: HiOutlineLightningBolt },
    ];

    useEffect(() => {
        fetchNotes();
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
        if (!content.trim()) return toast.error("Kontent bo'sh");

        setSubmitting(true);
        try {
            await noteAPI.create({ content, category });
            setContent('');
            setCategory('general');
            setIsWriting(false);
            toast.success("Yuborildi! 🚀");
            fetchNotes();
        } catch (err) {
            toast.error("Xatolik");
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

    const handleTogglePin = async (id) => {
        try {
            await noteAPI.togglePin(id);
            fetchNotes(); // Reload to update sort order
            toast.success("Eslatma holati o'zgardi");
        } catch (err) {
            toast.error("Xatolik");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("O'chirilsinmi?")) return;
        try {
            await noteAPI.delete(id);
            setNotes(notes.filter(n => n._id !== id));
            toast.success("O'chirildi");
        } catch (err) {
            toast.error("Xatolik");
        }
    };

    const getCategoryStyles = (cat) => {
        switch (cat) {
            case 'imtihon': return 'text-amber-500 bg-amber-500/10';
            case 'imtihon_siri': return 'text-rose-500 bg-rose-500/10';
            case 'vazifa': return 'text-primary-500 bg-primary-500/10';
            case 'dars_materiali': return 'text-emerald-500 bg-emerald-500/10';
            case 'fikr': return 'text-sky-500 bg-sky-500/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24 px-4 md:px-0">

            {/* --- COMPACT HEADER --- */}
            <div className="flex items-center justify-between pt-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight leading-none">Community</h1>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic leading-none mt-1">InFast Jamiyati</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic">Live</span>
                </div>
            </div>

            {/* --- COLLAPSIBLE INPUT --- */}
            <div className="relative">
                {!isWriting ? (
                    <button
                        onClick={() => setIsWriting(true)}
                        className="w-full bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 text-gray-400 hover:text-gray-600 transition-all text-sm font-medium shadow-sm active:scale-95"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center">
                            <HiOutlinePlus className="w-5 h-5" />
                        </div>
                        Fikringizni yozing...
                    </button>
                ) : (
                    <div className="bg-white dark:bg-dark-900 border-2 border-primary-500/20 rounded-2xl p-5 shadow-2xl animate-scale-in">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest italic">Yangi eslatma</span>
                            <button onClick={() => setIsWriting(false)} className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-800 text-gray-400">
                                <HiOutlineX className="w-4 h-4" />
                            </button>
                        </div>
                        <textarea
                            autoFocus
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Nimadir foydali yozing..."
                            className="w-full h-32 bg-transparent text-gray-900 dark:text-white font-bold text-sm outline-none resize-none placeholder:text-gray-400"
                        />

                        {/* Categories Scroller */}
                        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-4 pb-2">
                            {categories.map((cat) => {
                                const Icon = cat.icon;
                                const isActive = category === cat.id;
                                if (cat.id === 'general') return null; // Avoid "All" in creation
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setCategory(cat.id)}
                                        className={`px-3 py-1.5 rounded-xl flex items-center gap-2 border transition-all flex-shrink-0
                                            ${isActive
                                                ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                                                : 'bg-gray-50 dark:bg-dark-800 text-gray-500 border-transparent hover:border-gray-200'}`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                            <span className="text-[9px] font-bold text-gray-400 italic">{content.length}/1000</span>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !content.trim()}
                                className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2 shadow-lg disabled:opacity-50"
                            >
                                {submitting ? '...' : <HiOutlinePaperAirplane className="w-3.5 h-3.5 rotate-45" />}
                                Yuborish
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* --- FEED --- */}
            <div className="space-y-4">
                {notes.map((note, index) => {
                    const isLiked = note.likes.some(l => l.userId === (user.id || user._id));
                    const isAuthor = (note.authorId === (user.id || user._id)) || (note.authorInfo?.id === (user.id || user._id));
                    const isAdmin = user.role !== 'student';
                    const categoryData = categories.find(c => c.id === note.category) || categories[0];
                    const CategoryIcon = categoryData.icon;

                    return (
                        <div
                            key={note._id}
                            className={`group bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all animate-slide-up
                            ${note.isPinned ? 'border-amber-500/30 bg-amber-500/5' : ''}`}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-100 dark:bg-dark-800 flex items-center justify-center border border-gray-100 dark:border-white/5">
                                        {note.authorInfo?.profileImage ? (
                                            <img src={note.authorInfo.profileImage} alt={note.authorInfo.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-black text-primary-500 italic">{note.authorInfo?.name?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-[13px] font-black text-gray-900 dark:text-white uppercase italic tracking-tight leading-none">
                                            {note.authorInfo?.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-[8px] font-bold text-primary-500 uppercase tracking-widest">
                                                {note.authorInfo?.role === 'student' ? 'Talaba' : note.authorInfo?.role}
                                            </span>
                                            <span className="text-gray-300 dark:text-gray-800 font-black leading-none">•</span>
                                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: uz })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-1.5 rounded-lg ${getCategoryStyles(note.category)}`}>
                                    <CategoryIcon className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            <p className="text-[13px] font-medium text-gray-700 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                                {note.content}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                                <button
                                    onClick={() => handleLike(note._id)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all active:scale-95
                                        ${isLiked ? 'bg-rose-500/10 text-rose-500' : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-800'}`}
                                >
                                    {isLiked ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
                                    <span className="text-[11px] font-black italic">{note.likes?.length || 0}</span>
                                </button>

                                <div className="flex items-center gap-2">
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleTogglePin(note._id)}
                                            className={`p-1.5 transition-colors ${note.isPinned ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
                                            title={note.isPinned ? "Unpin" : "Pin"}
                                        >
                                            <HiOutlineFire className="w-4 h-4" />
                                        </button>
                                    )}
                                    {(isAuthor || isAdmin) && (
                                        <button
                                            onClick={() => handleDelete(note._id)}
                                            className="p-1.5 text-gray-300 hover:text-rose-500 transition-colors"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {notes.length === 0 && (
                    <div className="py-20 text-center bg-gray-50 dark:bg-dark-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5">
                        <HiOutlineChatAlt2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Hali xabarlar yo'q</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
