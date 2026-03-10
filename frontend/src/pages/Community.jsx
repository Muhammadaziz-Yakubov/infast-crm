import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { noteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineChatAlt2, HiOutlineHeart, HiOutlineTrash,
    HiOutlinePaperAirplane, HiOutlineBookmark, HiOutlineAcademicCap,
    HiOutlineFire, HiOutlineLightningBolt, HiOutlineSparkles,
    HiHeart, HiOutlinePlus, HiOutlineX, HiOutlineShare, HiOutlineArrowLeft
} from 'react-icons/hi';
import { formatDistanceToNow } from 'date-fns';
import { uz } from 'date-fns/locale';

const Community = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [notes, setNotes] = useState([]);
    const [currentNote, setCurrentNote] = useState(null);
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(true);

    const [content, setContent] = useState('');
    const [category, setCategory] = useState('general');
    const [submitting, setSubmitting] = useState(false);
    const [isWriting, setIsWriting] = useState(false);

    const categories = [
        { id: 'general', label: 'Barchasi', icon: HiOutlineChatAlt2, color: 'text-gray-500' },
        { id: 'vazifa', label: 'Vazifalar', icon: HiOutlineBookmark, color: 'text-primary-500' },
        { id: 'imtihon', label: 'Imtihon', icon: HiOutlineAcademicCap, color: 'text-amber-500' },
        { id: 'imtihon_siri', label: 'Sirlar', icon: HiOutlineFire, color: 'text-rose-500' },
        { id: 'dars_materiali', label: 'Material', icon: HiOutlineSparkles, color: 'text-emerald-500' },
        { id: 'fikr', label: 'Fikr', icon: HiOutlineLightningBolt, color: 'text-sky-500' },
    ];

    const fetchNotes = useCallback(async () => {
        try {
            if (id) {
                const res = await noteAPI.getOne(id);
                setCurrentNote(res.data.data);
                setReplies(res.data.data.replies || []);
            } else {
                const res = await noteAPI.getAll();
                setNotes(res.data.data);
                setCurrentNote(null);
                setReplies([]);
            }
        } catch (err) {
            console.error(err);
            if (id) navigate('/community');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        setLoading(true);
        fetchNotes();
        const interval = setInterval(fetchNotes, 30000);
        return () => clearInterval(interval);
    }, [fetchNotes]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return toast.error("Oldin tizimga kiring");
        if (!content.trim()) return toast.error("Kontent bo'sh");

        setSubmitting(true);
        try {
            await noteAPI.create({
                content,
                category: id ? currentNote.category : category,
                parentId: id || null
            });
            setContent('');
            setIsWriting(false);
            toast.success(id ? "Javob yuborildi! 💬" : "Yuborildi! 🚀");
            fetchNotes();
        } catch (err) {
            toast.error("Xatolik");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (noteId) => {
        if (!user) return toast.error("Oldin tizimga kiring");
        try {
            const res = await noteAPI.toggleLike(noteId);

            const updateNote = (n) => n._id === noteId ? {
                ...n,
                likes: res.data.liked
                    ? [...(n.likes || []), { userId: user.id || user._id }]
                    : (n.likes || []).filter(l => l.userId !== (user.id || user._id))
            } : n;

            if (currentNote?._id === noteId) {
                setCurrentNote(updateNote(currentNote));
            } else if (id) {
                setReplies(replies.map(updateNote));
            } else {
                setNotes(notes.map(updateNote));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm("O'chirilsinmi?")) return;
        try {
            await noteAPI.delete(noteId);
            if (id && noteId === id) {
                navigate('/community');
            } else if (id) {
                setReplies(replies.filter(n => n._id !== noteId));
            } else {
                setNotes(notes.filter(n => n._id !== noteId));
            }
            toast.success("O'chirildi");
        } catch (err) {
            toast.error("Xatolik");
        }
    };

    const handleShare = (note) => {
        const shareUrl = `${window.location.origin}/community/${note._id}`;
        const shareText = `${note.authorInfo?.name}: "${note.content}"\n\nInFast Community orqali ulashildi.`;

        if (navigator.share) {
            navigator.share({
                title: 'InFast Community',
                text: shareText,
                url: shareUrl
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
            toast.success("Havola nusxalandi! 📋");
        }
    };

    const getCategoryStyles = (cat) => {
        switch (cat) {
            case 'imtihon': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'imtihon_siri': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
            case 'vazifa': return 'text-primary-500 bg-primary-500/10 border-primary-500/20';
            case 'dars_materiali': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'fikr': return 'text-sky-500 bg-sky-500/10 border-sky-500/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    const NoteCard = ({ note, isReply = false, showThread = false, isLast = false, isMain = false }) => {
        const isLiked = user && note.likes?.some(l => l.userId === (user.id || user._id));
        const isAuthor = user && ((note.authorId === (user.id || user._id)) || (note.authorInfo?.id === (user.id || user._id)));
        const isAdmin = user && user.role !== 'student';
        const categoryData = categories.find(c => c.id === note.category) || categories[0];
        const CategoryIcon = categoryData.icon;

        return (
            <div className={`relative group ${isMain ? 'mb-2' : ''}`}>
                {/* Thread Line */}
                {showThread && !isLast && (
                    <div className="absolute left-[24px] top-14 bottom-0 w-[2px] bg-gray-100 dark:bg-dark-800 z-0 opacity-50" />
                )}

                <div
                    className={`
                        p-5 transition-all duration-300 relative z-10
                        ${isMain ? 'bg-white/40 dark:bg-dark-900/40' : 'hover:bg-gray-50/80 dark:hover:bg-dark-800/40'}
                        ${!isReply && !id ? 'bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1' : ''}
                    `}
                >
                    <div className="flex items-start gap-4">
                        {/* Avatar Wrapper with Gradient Ring */}
                        <div className="flex-shrink-0 relative">
                            <div className={`
                                w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr 
                                ${note.authorInfo?.role === 'student' ? 'from-primary-500 to-sky-500' : 'from-orange-500 to-amber-500'}
                                shadow-lg shadow-primary-500/10
                            `}>
                                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-dark-950 flex items-center justify-center">
                                    {note.authorInfo?.profileImage ? (
                                        <img src={note.authorInfo.profileImage} alt={note.authorInfo.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className={`text-base font-black italic ${note.authorInfo?.role === 'student' ? 'text-primary-500' : 'text-orange-500'}`}>
                                            {note.authorInfo?.name?.charAt(0)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-[15px] font-black text-gray-900 dark:text-white truncate uppercase italic tracking-tight">
                                            {note.authorInfo?.name}
                                        </h3>
                                        {note.authorInfo?.role !== 'student' && (
                                            <div className="w-3.5 h-3.5 bg-primary-500 rounded-full flex items-center justify-center">
                                                <HiOutlineSparkles className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] leading-none mt-0.5">
                                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: uz })}
                                    </span>
                                </div>
                                {!isReply && (
                                    <div className={`px-2.5 py-1 rounded-full border ${getCategoryStyles(note.category)} flex items-center gap-2 backdrop-blur-md`}>
                                        <CategoryIcon className="w-3.5 h-3.5" />
                                        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:block">{categoryData.label}</span>
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => !id && navigate(`/community/${note._id}`)}
                                className={`
                                    mt-4 text-[15px] font-semibold text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap
                                    ${!id ? 'cursor-pointer' : ''}
                                `}
                            >
                                {note.content}
                            </div>

                            {/* Interactions - Glass Styled */}
                            <div className="flex items-center gap-5 mt-6">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleLike(note._id); }}
                                    className={`
                                        group flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md transition-all active:scale-90
                                        ${isLiked
                                            ? 'bg-rose-500/10 text-rose-500 shadow-sm shadow-rose-500/10'
                                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-800'}
                                    `}
                                >
                                    <div className={`transition-transform duration-300 ${isLiked ? 'scale-110' : 'group-hover:scale-110'}`}>
                                        {isLiked ? <HiHeart className="w-5 h-5" /> : <HiOutlineHeart className="w-5 h-5" />}
                                    </div>
                                    <span className="text-[12px] font-black italic">{note.likes?.length || 0}</span>
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/community/${note._id}`); }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-400 hover:bg-primary-500/10 hover:text-primary-500 transition-all active:scale-90"
                                >
                                    <HiOutlineChatAlt2 className="w-5 h-5" />
                                    <span className="text-[12px] font-black italic">{note.repliesCount || 0}</span>
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleShare(note); }}
                                    className="p-2 rounded-full text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all active:scale-90"
                                    title="Ulashish"
                                >
                                    <HiOutlineShare className="w-5 h-5" />
                                </button>

                                <div className="ml-auto flex items-center gap-2">
                                    {(isAuthor || isAdmin) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                                            className="p-2 rounded-full text-gray-300 hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90"
                                        >
                                            <HiOutlineTrash className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="max-w-2xl mx-auto pb-32">

            {/* Header Area - Glass Background */}
            <div className="sticky top-0 z-40 bg-gray-50/80 dark:bg-dark-950/80 backdrop-blur-2xl px-4 py-6 mb-8 border-b border-gray-100 dark:border-white/5 lg:-mx-4 lg:px-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {id && (
                            <button
                                onClick={() => navigate('/community')}
                                className="w-10 h-10 rounded-2xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 flex items-center justify-center shadow-sm hover:shadow-md active:scale-90 transition-all"
                            >
                                <HiOutlineArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none flex items-center gap-2">
                                Community
                                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                            </h1>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic leading-none mt-1.5 opacity-60">
                                {id ? 'Thread View' : 'Social Space'}
                            </p>
                        </div>
                    </div>

                    {!id && (
                        <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-dark-900 p-1.5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Active</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Input Section */}
            {user ? (
                <div className="px-4 mb-10">
                    {!isWriting ? (
                        <button
                            onClick={() => setIsWriting(true)}
                            className="w-full group bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-[2rem] p-5 flex items-center gap-5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-xl shadow-primary-500/5 hover:shadow-primary-500/10 active:scale-[0.98]"
                        >
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:rotate-12 transition-transform">
                                <HiOutlinePlus className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold opacity-60">{id ? 'Javob qoldirasizmi?' : 'Bugungi darslar qanday o\'tdi?'}</span>
                        </button>
                    ) : (
                        <div className="bg-white dark:bg-dark-900 border-2 border-primary-500/30 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-scale-in">
                            {/* Decorative background circle */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] italic">Yangi xabar</span>
                                    </div>
                                    <button onClick={() => setIsWriting(false)} className="p-2 rounded-xl bg-gray-50 dark:bg-dark-800 text-gray-400 hover:text-rose-500 transition-colors">
                                        <HiOutlineX className="w-5 h-5" />
                                    </button>
                                </div>
                                <textarea
                                    autoFocus
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={id ? "Javobingizni shu yerda qoldiring..." : "Foydali kontent yoki savol bormi?"}
                                    className="w-full h-40 bg-transparent text-gray-900 dark:text-white font-bold text-lg outline-none resize-none placeholder:text-gray-400/50"
                                />

                                {!id && (
                                    <div className="flex overflow-x-auto no-scrollbar gap-3 mb-6 pb-2">
                                        {categories.map((cat) => {
                                            const Icon = cat.icon;
                                            const isActive = category === cat.id;
                                            if (cat.id === 'general') return null;
                                            return (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategory(cat.id)}
                                                    className={`
                                                        px-4 py-2.5 rounded-2xl flex items-center gap-3 border-2 transition-all flex-shrink-0
                                                        ${isActive
                                                            ? 'bg-primary-500 text-white border-primary-400 shadow-xl shadow-primary-500/30 scale-105'
                                                            : 'bg-gray-50 dark:bg-dark-800 text-gray-500 border-transparent hover:border-gray-200'}
                                                    `}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">{cat.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">{content.length} / 1000</span>
                                        {content.length > 900 && <span className="text-[8px] text-rose-500 font-bold uppercase">Limit yaqin</span>}
                                    </div>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting || !content.trim()}
                                        className="px-8 py-3.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest italic flex items-center gap-3 shadow-[0_15px_30px_-5px_rgba(79,70,229,0.4)] hover:shadow-primary-500/50 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                                    >
                                        {submitting ? '...' : <HiOutlinePaperAirplane className="w-4 h-4 rotate-45" />}
                                        {id ? 'Javob berish' : "E'lon qilish"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="px-4 mb-10">
                    <Link to="/login" className="block p-6 bg-gradient-to-r from-primary-500/10 to-indigo-500/10 border-2 border-dashed border-primary-500/20 rounded-[2.5rem] text-center hover:scale-[1.02] transition-transform group">
                        <p className="text-xs font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] italic">
                            💬 Xabar yozish uchun <span className="underline decoration-2 underline-offset-4 group-hover:text-primary-700">Profilingizga kiring</span>
                        </p>
                    </Link>
                </div>
            )}

            {/* Feed Section */}
            <div className="px-4 space-y-6">
                {id && currentNote ? (
                    <div className="space-y-4">
                        <NoteCard note={currentNote} isMain={true} showThread={replies.length > 0} />

                        <div className="flex items-center gap-4 py-4">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-dark-800 to-transparent" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Javoblar {replies.length > 0 ? `(${replies.length})` : ''}</span>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gray-200 dark:via-dark-800 to-transparent" />
                        </div>

                        <div className="space-y-1">
                            {replies.map((reply, idx) => (
                                <NoteCard
                                    key={reply._id}
                                    note={reply}
                                    isReply={true}
                                    showThread={idx !== replies.length - 1}
                                    isLast={idx === replies.length - 1}
                                />
                            ))}
                            {replies.length === 0 && (
                                <div className="text-center py-10 opacity-40">
                                    <HiOutlineChatAlt2 className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">Hali javoblar yo'q</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {notes.map((note, index) => (
                            <NoteCard key={note._id} note={note} />
                        ))}
                    </div>
                )}

                {((!id && notes.length === 0) || (id && !currentNote)) && !loading && (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-dark-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-gray-100 dark:border-white/5 opacity-50">
                            <HiOutlineChatAlt2 className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-black text-gray-400 uppercase tracking-widest italic">Hali hech narsa yo'q</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
