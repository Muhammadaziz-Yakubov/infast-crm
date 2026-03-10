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

    const NoteCard = ({ note, isReply = false, isMain = false, isLast = false }) => {
        const isLiked = user && note.likes?.some(l => l.userId === (user.id || user._id));
        const canDelete = user && (user.role !== 'student' || note.authorId === (user.id || user._id) || note.authorInfo?.id === (user.id || user._id));

        return (
            <div className={`
                relative flex gap-3 sm:gap-4
                ${isMain ? 'bg-white dark:bg-dark-900 p-5 rounded-3xl border border-primary-500/10 shadow-xl shadow-primary-500/5' : ''}
                ${isReply ? 'ml-6 sm:ml-12 mt-1 first:mt-6 group' : ''}
                ${!isMain && !isReply ? 'bg-white dark:bg-dark-900 p-4 sm:p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5' : ''}
            `}>
                {/* Visual Connector for Replies */}
                {isReply && (
                    <div className="absolute -left-6 sm:-left-9 top-[-1.5rem] bottom-1/2 w-6 sm:w-9 border-l-2 border-b-2 border-gray-200 dark:border-dark-800 rounded-bl-2xl opacity-60 group-first:top-[-4rem]" />
                )}

                {/* Avatar Section */}
                <div className="flex-shrink-0 relative z-10">
                    <div className={`
                        w-10 h-10 sm:w-12 sm:h-12 rounded-2xl overflow-hidden flex items-center justify-center border-2 shadow-inner transition-transform duration-300
                        ${isMain ? 'border-primary-500/20 scale-110' : 'border-gray-50 dark:border-white/5 hover:scale-105'}
                        ${note.authorInfo?.role === 'student' ? 'bg-primary-50' : 'bg-orange-50'}
                    `}>
                        {note.authorInfo?.profileImage ? (
                            <img src={note.authorInfo.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className={`text-lg font-black ${note.authorInfo?.role === 'student' ? 'text-primary-500' : 'text-orange-500'}`}>
                                {note.authorInfo?.name?.charAt(0)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 min-w-0">
                            <span className={`font-bold text-gray-900 dark:text-white truncate italic ${isMain ? 'text-base sm:text-lg' : 'text-sm sm:text-base'}`}>
                                {note.authorInfo?.name}
                            </span>
                            <div className="flex items-center gap-2">
                                {note.authorInfo?.role !== 'student' && <HiOutlineSparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest opacity-60">
                                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: uz })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => !id && navigate(`/community/${note._id}`)}
                        className={`text-sm sm:text-[15px] text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap mt-2 ${!id ? 'cursor-pointer hover:text-primary-600 dark:hover:text-primary-400' : ''}`}
                    >
                        {note.content}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleLike(note._id); }}
                            className={`flex items-center gap-1.5 transition-all group active:scale-90 ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
                        >
                            <div className={`p-1.5 rounded-xl transition-colors ${isLiked ? 'bg-rose-500/10' : 'group-hover:bg-rose-500/5'}`}>
                                {isLiked ? <HiHeart className="w-4 h-4" /> : <HiOutlineHeart className="w-4 h-4" />}
                            </div>
                            <span className="text-xs font-black italic">{note.likes?.length || 0}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/community/${note._id}`); }}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-primary-500 transition-all group active:scale-90"
                        >
                            <div className="p-1.5 rounded-xl group-hover:bg-primary-500/5 transition-colors">
                                <HiOutlineChatAlt2 className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-black italic">{note.repliesCount || 0}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleShare(note); }}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-emerald-500 transition-all group active:scale-90"
                        >
                            <div className="p-1.5 rounded-xl group-hover:bg-emerald-500/5 transition-colors">
                                <HiOutlineShare className="w-4 h-4" />
                            </div>
                        </button>

                        {canDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                                className="ml-auto p-1.5 rounded-xl text-gray-300 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                            >
                                <HiOutlineTrash className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><LoadingSpinner /></div>;

    return (
        <div className="max-w-3xl mx-auto pb-32 animate-fade-in px-4">
            {/* Elegant Header with Back Arrow Integrated */}
            <div className="py-6 mb-6">
                <div className="flex items-center gap-6">
                    {id ? (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/community')}
                                className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 text-gray-500 shadow-sm hover:shadow-lg hover:-translate-x-1 transition-all flex items-center justify-center"
                            >
                                <HiOutlineArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Muloqot</h1>
                                <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] mt-1 opacity-60">Javoblar tarmog'i</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Community</h1>
                            <p className="text-[11px] font-black text-primary-500 uppercase tracking-[0.4em] mt-1 opacity-60">InFast Talabalari</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Input Section */}
            {user ? (
                <div className={`mb-12 ${id ? 'mt-4' : ''}`}>
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-900 rounded-3xl border border-primary-500/10 p-5 shadow-2xl shadow-primary-500/5 focus-within:shadow-primary-500/10 transition-all border-b-4">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/40 hidden sm:flex items-center justify-center border border-primary-500/10 flex-shrink-0">
                                {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover rounded-2xl" /> : <span className="text-xl font-black text-primary-500">{user.ism?.charAt(0)}</span>}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={id ? "Fikringizni shu yerda qoldiring..." : "Nima yangiliklar bor?"}
                                    className="w-full bg-transparent pt-3 outline-none text-gray-800 dark:text-gray-200 font-bold text-sm sm:text-lg resize-none min-h-[100px]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-white/5">
                            {!id && (
                                <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[50%]">
                                    {categories.filter(c => c.id !== 'general').map(cat => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setCategory(cat.id)}
                                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${category === cat.id ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/30' : 'bg-gray-50 dark:bg-dark-800 text-gray-400 border-transparent hover:border-gray-200'}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <div className={`${id ? 'w-full' : ''} flex items-center justify-between gap-4 ml-auto`}>
                                <span className="text-[10px] font-bold text-gray-400 italic opacity-50">{content.length}/1000</span>
                                <button
                                    type="submit"
                                    disabled={submitting || !content.trim()}
                                    className="px-8 py-3 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest italic flex items-center gap-3 shadow-xl shadow-primary-500/30 active:scale-95 disabled:opacity-50 transition-all hover:bg-primary-700 hover:-translate-y-0.5"
                                >
                                    {submitting ? '...' : <><HiOutlinePaperAirplane className="w-4 h-4 rotate-45" /> {id ? 'Javob' : 'Yuborish'}</>}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="mb-12">
                    <Link to="/login" className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-3xl text-white font-black uppercase tracking-[0.2em] text-[11px] italic shadow-2xl shadow-primary-500/20 hover:scale-[1.01] transition-all">
                        <HiOutlineChatAlt2 className="w-10 h-10 mb-2 opacity-50" />
                        Tizimga kiring va muloqotga qo'shiling
                    </Link>
                </div>
            )}

            {/* Feed Section with Layout Logic */}
            <div className="space-y-6">
                {id && currentNote ? (
                    <div className="relative">
                        {/* Main note with premium border */}
                        <NoteCard note={currentNote} isMain={true} />

                        {/* Replies Section with curved connectors */}
                        <div className="relative pl-2">
                            {replies.map((reply, idx) => (
                                <NoteCard
                                    key={reply._id}
                                    note={reply}
                                    isReply={true}
                                    isLast={idx === replies.length - 1}
                                />
                            ))}

                            {replies.length === 0 && (
                                <div className="mt-12 py-16 bg-gray-50/50 dark:bg-dark-900/30 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 text-center flex flex-col items-center justify-center opacity-40">
                                    <HiOutlineChatAlt2 className="w-12 h-12 mb-3 text-gray-300" />
                                    <p className="text-[10px] font-black uppercase tracking-widest italic">Hali hech kim javob bermadi. Birinchi bo'ling!</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {notes.map(note => (
                            <NoteCard key={note._id} note={note} />
                        ))}
                    </div>
                )}

                {!loading && notes.length === 0 && !currentNote && (
                    <div className="py-32 text-center bg-gray-50/50 dark:bg-dark-900/50 rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5">
                        <HiOutlineChatAlt2 className="w-16 h-16 text-gray-200 mx-auto mb-6 opacity-40 animate-bounce" />
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] italic">Hech qanday xabarlar yo'q</h3>
                        <p className="text-[10px] text-gray-300 font-bold mt-2">Jamiyatimizga birinchi xabarni siz qo'shing!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
