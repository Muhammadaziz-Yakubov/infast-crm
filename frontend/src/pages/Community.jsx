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
        { id: 'general', label: 'Barchasi', icon: HiOutlineChatAlt2, color: 'text-primary-500' },
        { id: 'vazifa', label: 'Vazifalar', icon: HiOutlineBookmark, color: 'text-emerald-500' },
        { id: 'imtihon', label: 'Imtihon', icon: HiOutlineAcademicCap, color: 'text-amber-500' },
        { id: 'imtihon_siri', label: 'Sirlar', icon: HiOutlineFire, color: 'text-rose-500' },
        { id: 'dars_materiali', label: 'Material', icon: HiOutlineSparkles, color: 'text-sky-500' },
        { id: 'fikr', label: 'Fikr', icon: HiOutlineLightningBolt, color: 'text-indigo-500' },
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
        const categoryData = categories.find(c => c.id === note.category) || categories[0];

        return (
            <div className={`
                relative flex gap-3 sm:gap-4 group
                ${isMain ? 'bg-white dark:bg-dark-900 p-6 rounded-[2.5rem] border border-primary-500/10 shadow-2xl shadow-primary-500/5' : ''}
                ${isReply ? 'ml-8 sm:ml-16 mt-2' : ''}
                ${!isMain && !isReply ? 'bg-white dark:bg-dark-900 p-5 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300' : ''}
            `}>
                {/* Visual Connector for Replies */}
                {isReply && (
                    <div className="absolute -left-8 sm:-left-12 top-[-2rem] bottom-1/2 w-8 sm:w-12 border-l-2 border-b-2 border-gray-200 dark:border-dark-800 rounded-bl-3xl opacity-40 group-first:top-[-5rem]" />
                )}

                {/* Avatar Section */}
                <div className="flex-shrink-0 relative z-10">
                    <div className={`
                        w-11 h-11 sm:w-13 sm:h-13 rounded-3xl overflow-hidden flex items-center justify-center border-2 transition-all duration-500 group-hover:rotate-6
                        ${isMain ? 'border-primary-500/30 scale-110' : 'border-gray-50 dark:border-white/5 shadow-lg'}
                        ${note.authorInfo?.role === 'student' ? 'bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-950/20 dark:to-indigo-950/20' : 'bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20'}
                    `}>
                        {note.authorInfo?.profileImage ? (
                            <img src={note.authorInfo.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className={`text-xl font-black ${note.authorInfo?.role === 'student' ? 'text-primary-500' : 'text-orange-500'}`}>
                                {note.authorInfo?.name?.charAt(0)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`font-black text-gray-900 dark:text-white truncate italic tracking-tight ${isMain ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
                                    {note.authorInfo?.name}
                                </span>
                                {note.authorInfo?.role !== 'student' && <HiOutlineSparkles className="w-4 h-4 text-amber-500" />}
                            </div>
                            <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.25em] opacity-60">
                                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: uz })}
                            </span>
                        </div>

                        {!isReply && (
                            <div className={`px-2.5 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-dark-800 ${categoryData.color} flex items-center gap-1.5`}>
                                <categoryData.icon className="w-3 h-3" />
                                <span className="hidden xs:block">{categoryData.label}</span>
                            </div>
                        )}
                    </div>

                    <div
                        onClick={() => !id && navigate(`/community/${note._id}`)}
                        className={`text-sm sm:text-[16px] text-gray-700 dark:text-gray-200 leading-relaxed font-bold italic whitespace-pre-wrap ${!id ? 'cursor-pointer' : ''}`}
                    >
                        {note.content}
                    </div>

                    {/* Actions Bar */}
                    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-50 dark:border-white/5">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleLike(note._id); }}
                            className={`flex items-center gap-2 transition-all active:scale-95 group/btn ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
                        >
                            <div className={`p-2 rounded-2xl transition-all ${isLiked ? 'bg-rose-500/10 shadow-lg shadow-rose-500/10 scale-110' : 'bg-gray-50 dark:bg-dark-800 group-hover/btn:bg-rose-500/5'}`}>
                                {isLiked ? <HiHeart className="w-4.5 h-4.5" /> : <HiOutlineHeart className="w-4.5 h-4.5" />}
                            </div>
                            <span className="text-xs font-black italic">{note.likes?.length || 0}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/community/${note._id}`); }}
                            className="flex items-center gap-2 text-gray-400 hover:text-primary-500 transition-all active:scale-95 group/btn"
                        >
                            <div className="p-2 rounded-2xl bg-gray-50 dark:bg-dark-800 group-hover/btn:bg-primary-500/5 transition-all">
                                <HiOutlineChatAlt2 className="w-4.5 h-4.5" />
                            </div>
                            <span className="text-xs font-black italic">{note.repliesCount || 0}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleShare(note); }}
                            className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 transition-all active:scale-95 group/btn"
                        >
                            <div className="p-2 rounded-2xl bg-gray-50 dark:bg-dark-800 group-hover/btn:bg-emerald-500/5 transition-all">
                                <HiOutlineShare className="w-4.5 h-4.5" />
                            </div>
                        </button>

                        {canDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                                className="ml-auto p-2 rounded-2xl text-gray-300 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
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
            {/* Dynamic Header */}
            <div className={`pt-8 ${id ? 'mb-8' : 'mb-12'}`}>
                <div className="flex items-center gap-6">
                    {id ? (
                        <div className="flex items-center gap-5">
                            <button
                                onClick={() => navigate('/community')}
                                className="w-13 h-13 rounded-3xl bg-white dark:bg-dark-900 border-2 border-gray-100 dark:border-white/5 text-gray-500 shadow-xl hover:shadow-primary-500/10 hover:-translate-x-1.5 transition-all flex items-center justify-center flex-shrink-0 active:scale-90"
                            >
                                <HiOutlineArrowLeft className="w-7 h-7" />
                            </button>
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">Thread</h1>
                                <p className="text-[11px] font-black text-primary-500 uppercase tracking-[0.5em] mt-2 opacity-70">Javoblar tarmog'i</p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full">
                            <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                                Community
                            </h1>
                            <div className="flex items-center gap-3 mt-3">
                                <div className="h-[2px] w-12 bg-primary-500 rounded-full" />
                                <p className="text-[12px] font-black text-primary-500 uppercase tracking-[0.6em] opacity-80">
                                    Talking Space
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Multi-category Navigation (Only in Feed) */}
            {!id && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-10 pb-2 px-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={`
                                px-5 py-3 rounded-2xl flex items-center gap-3 transition-all flex-shrink-0 font-black uppercase text-[10px] tracking-widest border-2
                                ${category === cat.id
                                    ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-500/20 scale-105'
                                    : 'bg-white dark:bg-dark-900 text-gray-400 border-gray-50 dark:border-white/5 hover:border-primary-500/30'
                                }
                            `}
                        >
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Premium Input Section */}
            {user ? (
                <div className="mb-14">
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-900 rounded-[2.5rem] border-2 border-primary-500/10 p-6 shadow-2xl shadow-primary-500/5 focus-within:shadow-primary-500/10 focus-within:border-primary-500/20 transition-all">
                        <div className="flex gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 hidden sm:flex items-center justify-center shadow-lg shadow-primary-500/20 flex-shrink-0 overflow-hidden">
                                {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <span className="text-xl font-black text-white italic">{user.ism?.charAt(0)}</span>}
                            </div>
                            <div className="flex-1">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder={id ? "Fikringizni qoldiring..." : "Darslar qanday o'tmoqda?"}
                                    className="w-full bg-transparent pt-3 outline-none text-gray-900 dark:text-white font-black text-lg sm:text-xl italic resize-none min-h-[120px] placeholder:text-gray-300"
                                />

                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50 dark:border-white/5">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{content.length}/1000</span>
                                        {content.length > 900 && <span className="text-[8px] text-rose-500 font-bold uppercase">Xabar tugab qoldi</span>}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submitting || !content.trim()}
                                        className="px-10 py-4 bg-primary-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] italic flex items-center gap-3 shadow-2xl shadow-primary-500/30 active:scale-95 disabled:opacity-50 transition-all hover:bg-primary-700 hover:-translate-y-1"
                                    >
                                        {submitting ? '...' : <><HiOutlinePaperAirplane className="w-5 h-5 rotate-45" /> {id ? 'Javob' : 'E\'lon qilish'}</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="mb-14">
                    <Link to="/login" className="group relative block p-10 bg-gradient-to-r from-primary-600 to-indigo-600 rounded-[2.5rem] shadow-2xl shadow-primary-500/30 overflow-hidden text-center hover:scale-[1.01] transition-all">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity" />
                        <HiOutlineChatAlt2 className="w-12 h-12 mx-auto mb-4 text-white opacity-40 group-hover:animate-bounce" />
                        <h3 className="text-xl font-black text-white uppercase italic tracking-widest mb-2">Su'hbatga qo'shiling</h3>
                        <p className="text-[10px] text-primary-100 font-bold uppercase tracking-[0.3em] opacity-80">Profilga kiring va fikir bildiring</p>
                    </Link>
                </div>
            )}

            {/* Feed Section */}
            <div className="space-y-8 pl-1">
                {id && currentNote ? (
                    <div className="relative">
                        <NoteCard note={currentNote} isMain={true} />

                        <div className="relative mt-8">
                            {replies.map((reply, idx) => (
                                <NoteCard
                                    key={reply._id}
                                    note={reply}
                                    isReply={true}
                                    isLast={idx === replies.length - 1}
                                />
                            ))}

                            {replies.length === 0 && (
                                <div className="mt-16 py-24 bg-gray-50/50 dark:bg-dark-900/40 rounded-[2.5rem] border-4 border-dashed border-gray-100 dark:border-white/5 text-center flex flex-col items-center justify-center opacity-30">
                                    <HiOutlineChatAlt2 className="w-16 h-16 mb-4 text-gray-300" />
                                    <p className="text-xs font-black uppercase tracking-[0.3em] italic">Hozircha javoblar yo'q</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {notes.filter(n => category === 'general' || n.category === category).map(note => (
                            <NoteCard key={note._id} note={note} />
                        ))}
                    </div>
                )}

                {!loading && notes.length === 0 && !currentNote && (
                    <div className="py-40 text-center bg-gray-50/50 dark:bg-dark-900/50 rounded-[3rem] border-4 border-dashed border-gray-100 dark:border-white/5 mx-2">
                        <HiOutlineChatAlt2 className="w-20 h-20 text-gray-200 mx-auto mb-8 opacity-40 animate-pulse" />
                        <h3 className="text-xl font-black text-gray-400 uppercase tracking-[0.5em] italic">Xona bo'sh</h3>
                        <p className="text-[12px] text-gray-300 font-bold mt-4 uppercase tracking-widest">Aynan shu kategoriyada hali hech narsa yo'q</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
