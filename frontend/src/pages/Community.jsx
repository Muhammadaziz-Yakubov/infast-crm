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
        { id: 'general', label: 'Barchasi', icon: HiOutlineChatAlt2 },
        { id: 'vazifa', label: 'Vazifalar', icon: HiOutlineBookmark },
        { id: 'imtihon', label: 'Imtihon', icon: HiOutlineAcademicCap },
        { id: 'imtihon_siri', label: 'Sirlar', icon: HiOutlineFire },
        { id: 'dars_materiali', label: 'Material', icon: HiOutlineSparkles },
        { id: 'fikr', label: 'Fikr', icon: HiOutlineLightningBolt },
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
            case 'imtihon': return 'text-amber-500 bg-amber-500/10';
            case 'imtihon_siri': return 'text-rose-500 bg-rose-500/10';
            case 'vazifa': return 'text-primary-500 bg-primary-500/10';
            case 'dars_materiali': return 'text-emerald-500 bg-emerald-500/10';
            case 'fikr': return 'text-sky-500 bg-sky-500/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    const NoteCard = ({ note, isReply = false, showThread = false, isLast = false }) => {
        const isLiked = user && note.likes?.some(l => l.userId === (user.id || user._id));
        const isAuthor = user && ((note.authorId === (user.id || user._id)) || (note.authorInfo?.id === (user.id || user._id)));
        const isAdmin = user && user.role !== 'student';
        const categoryData = categories.find(c => c.id === note.category) || categories[0];
        const CategoryIcon = categoryData.icon;

        return (
            <div className={`relative group ${isReply ? 'ml-0' : ''}`}>
                {/* Thread Line */}
                {showThread && !isLast && (
                    <div className="absolute left-[18px] top-12 bottom-0 w-[2px] bg-gray-100 dark:bg-dark-800 z-0" />
                )}

                <div className={`bg-white dark:bg-dark-900 ${!isReply && !id ? 'border border-gray-100 dark:border-white/5 shadow-sm rounded-2xl' : ''} p-4 transition-all relative z-10`}>
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-800 flex items-center justify-center border border-gray-100 dark:border-white/5">
                                {note.authorInfo?.profileImage ? (
                                    <img src={note.authorInfo.profileImage} alt={note.authorInfo.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-black text-primary-500 italic">{note.authorInfo?.name?.charAt(0)}</span>
                                )}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <h3 className="text-[14px] font-black text-gray-900 dark:text-white truncate uppercase italic tracking-tight">
                                        {note.authorInfo?.name}
                                    </h3>
                                    <span className="text-gray-300 dark:text-gray-700 font-black text-[10px]">•</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: uz })}
                                    </span>
                                </div>
                                {!isReply && (
                                    <div className={`px-2 py-1 rounded-lg ${getCategoryStyles(note.category)} flex items-center gap-1.5`}>
                                        <CategoryIcon className="w-3 h-3" />
                                        <span className="text-[8px] font-black uppercase tracking-widest hidden sm:block">{categoryData.label}</span>
                                    </div>
                                )}
                            </div>

                            <div
                                onClick={() => !id && navigate(`/community/${note._id}`)}
                                className={`mt-2 text-[14px] font-medium text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap ${!id ? 'cursor-pointer hover:text-gray-600 dark:hover:text-gray-300' : ''}`}
                            >
                                {note.content}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-4">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleLike(note._id); }}
                                    className={`flex items-center gap-1.5 transition-all active:scale-95 text-[12px] font-black italic
                                        ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
                                >
                                    {isLiked ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
                                    {note.likes?.length || 0}
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/community/${note._id}`); }}
                                    className="flex items-center gap-1.5 text-gray-400 hover:text-primary-500 transition-all text-[12px] font-black italic"
                                >
                                    <HiOutlineChatAlt2 className="w-4 h-4" />
                                    {note.repliesCount || 0}
                                </button>

                                <button
                                    onClick={(e) => { e.stopPropagation(); handleShare(note); }}
                                    className="text-gray-400 hover:text-emerald-500 transition-all"
                                    title="Ulashish"
                                >
                                    <HiOutlineShare className="w-4 h-4" />
                                </button>

                                <div className="ml-auto flex items-center gap-2">
                                    {(isAuthor || isAdmin) && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                                            className="p-1 text-gray-300 hover:text-rose-500 transition-colors"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-xl mx-auto pb-24 px-4 md:px-0">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 py-4 mb-6">
                <div className="flex items-center gap-4">
                    {id && (
                        <button
                            onClick={() => navigate('/community')}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-800 transition-all"
                        >
                            <HiOutlineArrowLeft className="w-5 h-5 text-gray-900 dark:text-white" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                            {id ? 'Xabar' : 'Community'}
                        </h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic leading-none mt-1">
                            {id ? 'InFast Thread' : 'InFast Jamiyati'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Input - Only for logged in users */}
            {user && (
                <div className="mb-8">
                    {!isWriting ? (
                        <button
                            onClick={() => setIsWriting(true)}
                            className="w-full bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex items-center gap-4 text-gray-400 hover:text-gray-600 transition-all text-sm font-medium shadow-sm active:scale-95"
                        >
                            <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center">
                                <HiOutlinePlus className="w-4 h-4" />
                            </div>
                            {id ? 'Javob yozish...' : 'Nima yangiliklar?'}
                        </button>
                    ) : (
                        <div className="bg-white dark:bg-dark-900 border-2 border-primary-500/20 rounded-2xl p-5 shadow-2xl animate-scale-in">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest italic">
                                    {id ? 'Javob qoldirish' : 'Yangi eslatma'}
                                </span>
                                <button onClick={() => setIsWriting(false)} className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-800 text-gray-400">
                                    <HiOutlineX className="w-4 h-4" />
                                </button>
                            </div>
                            <textarea
                                autoFocus
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={id ? "Javobingizni kiriting..." : "Nimadir foydali yozing..."}
                                className="w-full h-32 bg-transparent text-gray-900 dark:text-white font-bold text-sm outline-none resize-none placeholder:text-gray-400"
                            />

                            {!id && (
                                <div className="flex overflow-x-auto no-scrollbar gap-2 mb-4 pb-2">
                                    {categories.map((cat) => {
                                        const Icon = cat.icon;
                                        const isActive = category === cat.id;
                                        if (cat.id === 'general') return null;
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
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                <span className="text-[9px] font-bold text-gray-400 italic">{content.length}/1000</span>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !content.trim()}
                                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2 shadow-lg disabled:opacity-50"
                                >
                                    {submitting ? '...' : <HiOutlinePaperAirplane className="w-3.5 h-3.5 rotate-45" />}
                                    {id ? 'Javob bering' : 'Yuborish'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!user && (
                <div className="mb-8 p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl text-center">
                    <p className="text-[11px] font-black text-primary-600 uppercase tracking-widest italic">
                        Fikr bildirish uchun <Link to="/login" className="underline hover:text-primary-700">tizimga kiring</Link>
                    </p>
                </div>
            )}

            {/* Content Section */}
            <div className="space-y-4">
                {id && currentNote ? (
                    <div className="space-y-1">
                        <NoteCard note={currentNote} showThread={replies.length > 0} />
                        <div className="pl-4 sm:pl-8 border-l-2 border-gray-100 dark:border-dark-800 ml-5 mt-2 space-y-4">
                            {replies.map((reply, idx) => (
                                <NoteCard
                                    key={reply._id}
                                    note={reply}
                                    isReply={true}
                                    isLast={idx === replies.length - 1}
                                />
                            ))}
                            {replies.length === 0 && (
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic py-4">
                                    Hali javoblar yo'q
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    notes.map((note, index) => (
                        <NoteCard key={note._id} note={note} />
                    ))
                )}

                {((!id && notes.length === 0) || (id && !currentNote)) && !loading && (
                    <div className="py-20 text-center bg-gray-50 dark:bg-dark-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/5">
                        <HiOutlineChatAlt2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest italic">Hech narsa topilmadi</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
