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
        if (!user) return toast.error("Tizimga kiring");
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            await noteAPI.create({
                content,
                category: id ? currentNote.category : category,
                parentId: id || null
            });
            setContent('');
            toast.success(id ? "Javobingiz qo'shildi" : "Xabar yuborildi");
            fetchNotes();
        } catch (err) {
            toast.error("Xatolik yuz berdi");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (noteId) => {
        if (!user) return toast.error("Tizimga kiring");
        try {
            const res = await noteAPI.toggleLike(noteId);
            const update = (n) => n._id === noteId ? {
                ...n,
                likesCount: res.data.likesCount,
                likes: res.data.liked
                    ? [...(n.likes || []), { userId: user.id || user._id }]
                    : (n.likes || []).filter(l => l.userId !== (user.id || user._id))
            } : n;

            if (currentNote?._id === noteId) setCurrentNote(update(currentNote));
            else if (id) setReplies(replies.map(update));
            else setNotes(notes.map(update));
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (noteId) => {
        if (!window.confirm("O'chirilsinmi?")) return;
        try {
            await noteAPI.delete(noteId);
            if (id && noteId === id) navigate('/community');
            else if (id) setReplies(replies.filter(n => n._id !== noteId));
            else setNotes(notes.filter(n => n._id !== noteId));
            toast.success("O'chirildi");
        } catch (err) { toast.error("Xatolik"); }
    };

    const handleShare = (note) => {
        const url = `${window.location.origin}/community/${note._id}`;
        if (navigator.share) {
            navigator.share({ title: 'InFast Community', url }).catch(() => { });
        } else {
            navigator.clipboard.writeText(url);
            toast.success("Havola nusxalandi");
        }
    };

    const NoteCard = ({ note, isReply = false, isMain = false }) => {
        const isLiked = user && note.likes?.some(l => l.userId === (user.id || user._id));
        const canDelete = user && (user.role !== 'student' || note.authorId === (user.id || user._id) || note.authorInfo?.id === (user.id || user._id));

        return (
            <div className={`
                bg-white dark:bg-dark-900 
                ${isMain ? 'rounded-b-none' : 'rounded-3xl shadow-sm border border-gray-100 dark:border-white/5'}
                ${isReply ? 'ml-6 sm:ml-12 mt-2 bg-gray-50/50 dark:bg-dark-800/20' : ''}
                p-4 sm:p-5 transition-all
            `}>
                <div className="flex gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary-500/10 dark:bg-primary-500/20 overflow-hidden flex items-center justify-center border border-primary-500/10">
                            {note.authorInfo?.profileImage ? (
                                <img src={note.authorInfo.profileImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-lg font-black text-primary-500">{note.authorInfo?.name?.charAt(0)}</span>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base italic">
                                    {note.authorInfo?.name}
                                </span>
                                {note.authorInfo?.role !== 'student' && <HiOutlineSparkles className="w-4 h-4 text-amber-500 flex-shrink-0" title="Admin/Teacher" />}
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider whitespace-nowrap opacity-60">
                                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: uz })}
                                </span>
                            </div>
                        </div>

                        <div
                            onClick={() => !id && navigate(`/community/${note._id}`)}
                            className={`text-sm sm:text-[15px] text-gray-700 dark:text-gray-200 leading-relaxed font-medium whitespace-pre-wrap mt-2 ${!id ? 'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400' : ''}`}
                        >
                            {note.content}
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center gap-6 mt-5">
                            <button
                                onClick={(e) => { e.stopPropagation(); handleLike(note._id); }}
                                className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
                            >
                                {isLiked ? <HiHeart className="w-4 h-4 sm:w-5 sm:h-5" /> : <HiOutlineHeart className="w-4 h-4 sm:w-5 sm:h-5" />}
                                <span className="text-xs font-black italic">{note.likes?.length || 0}</span>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); navigate(`/community/${note._id}`); }}
                                className="flex items-center gap-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                            >
                                <HiOutlineChatAlt2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="text-xs font-black italic">{note.repliesCount || 0}</span>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleShare(note); }}
                                className="text-gray-400 hover:text-emerald-500 transition-colors"
                            >
                                <HiOutlineShare className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>

                            {canDelete && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                                    className="ml-auto text-gray-300 hover:text-rose-500 transition-colors"
                                >
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="max-w-3xl mx-auto pb-32 animate-fade-in">
            {/* Minimal Header */}
            <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-4">
                    {id && (
                        <button onClick={() => navigate('/community')} className="p-2.5 rounded-2xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 text-gray-500">
                            <HiOutlineArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                            {id ? 'Muloqot' : 'Community'}
                        </h1>
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em] leading-none mt-1">
                            {id ? 'Javoblar tarmog\'i' : 'InFast Talabalari'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Simple Floating Input */}
            {user ? (
                <div className={`mb-10 ${id ? 'px-0' : 'px-2'}`}>
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-900 rounded-[2rem] border border-gray-100 dark:border-white/5 p-4 shadow-sm focus-within:shadow-xl focus-within:border-primary-500/30 transition-all">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={id ? "Javobingizni yozing..." : "Fikringizni qoldiring..."}
                            className="w-full bg-transparent p-3 outline-none text-gray-800 dark:text-gray-200 font-bold text-sm sm:text-base resize-none min-h-[80px]"
                        />
                        <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50 dark:border-white/5">
                            {/* Categories for main feed */}
                            {!id && (
                                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 max-w-[60%] sm:max-w-none">
                                    {categories.filter(c => c.id !== 'general').map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex-shrink-0 border ${category === cat.id ? 'bg-primary-500 text-white border-primary-500' : 'bg-gray-50 dark:bg-dark-800 text-gray-400 border-transparent hover:border-gray-200'}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className={id ? 'w-full flex justify-between items-center' : 'ml-auto flex items-center gap-3'}>
                                {id && <span className="text-[10px] font-bold text-gray-400 italic px-2">{content.length}/1000</span>}
                                <button
                                    type="submit"
                                    disabled={submitting || !content.trim()}
                                    className="px-6 py-2.5 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest italic flex items-center gap-2 shadow-lg shadow-primary-500/20 active:scale-95 disabled:opacity-50 transition-all"
                                >
                                    {submitting ? '...' : <><HiOutlinePaperAirplane className="w-3.5 h-3.5 rotate-45" /> {id ? 'Javob' : 'Yuborish'}</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="px-2 mb-8">
                    <Link to="/login" className="flex items-center justify-center p-6 bg-primary-500/5 border-2 border-dashed border-primary-500/20 rounded-[2rem] text-primary-600 font-black uppercase tracking-widest text-[10px] italic hover:bg-primary-500/10 transition-colors">
                        Xabarlarga qo'shilish uchun tizimga kiring
                    </Link>
                </div>
            )}

            {/* Feed Section */}
            <div className="space-y-4 px-2">
                {id && currentNote ? (
                    <div className="space-y-4">
                        <div className="border-t-4 border-primary-500/20 rounded-t-3xl">
                            <NoteCard note={currentNote} isMain={true} />
                        </div>
                        <div className="space-y-4">
                            {replies.map(reply => (
                                <NoteCard key={reply._id} note={reply} isReply={true} />
                            ))}
                            {replies.length === 0 && (
                                <div className="py-12 text-center opacity-30 italic font-bold uppercase text-[10px] tracking-widest">
                                    Hali hech kim javob yozmadi
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {notes.map(note => (
                            <NoteCard key={note._id} note={note} />
                        ))}
                    </div>
                )}

                {!loading && notes.length === 0 && !currentNote && (
                    <div className="py-24 text-center bg-gray-50/50 dark:bg-dark-900/50 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-white/5">
                        <HiOutlineChatAlt2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] italic">Hozircha xabarlar yo'q</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
