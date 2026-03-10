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
            toast.success("Yuborildi");
            fetchNotes();
        } catch (err) {
            toast.error("Xatolik");
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

    const NoteCard = ({ note, isReply = false, isMain = false }) => {
        const isLiked = user && note.likes?.some(l => l.userId === (user.id || user._id));
        const canDelete = user && (user.role !== 'student' || note.authorId === (user.id || user._id) || note.authorInfo?.id === (user.id || user._id));

        return (
            <div className={`
                relative flex gap-3 sm:gap-4 group bg-white dark:bg-dark-900 
                ${isMain ? 'p-4 sm:p-6 border-b border-gray-100 dark:border-white/5' : 'p-4 border-b border-gray-50 dark:border-white/5 last:border-none'}
                ${isReply ? 'ml-10 sm:ml-14 bg-gray-50/30 dark:bg-dark-800/20' : ''}
            `}>
                {/* Subtle Connector Thread */}
                {isReply && (
                    <div className="absolute -left-8 sm:-left-10 top-[-1.5rem] bottom-[1.5rem] w-8 sm:w-10 border-l-2 border-b-2 border-gray-100 dark:border-dark-800 rounded-bl-xl opacity-50" />
                )}

                {/* Avatar */}
                <div className="flex-shrink-0 relative z-10">
                    <div className={`
                        w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden flex items-center justify-center border border-gray-100 dark:border-dark-700
                        ${note.authorInfo?.role === 'student' ? 'bg-primary-50 text-primary-600' : 'bg-orange-50 text-orange-600'}
                    `}>
                        {note.authorInfo?.profileImage ? (
                            <img src={note.authorInfo.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-bold uppercase">{note.authorInfo?.name?.charAt(0)}</span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 dark:text-white truncate text-sm sm:text-base">
                            {note.authorInfo?.name}
                        </span>
                        {note.authorInfo?.role !== 'student' && <HiOutlineSparkles className="w-3.5 h-3.5 text-amber-500" title="Admin" />}
                        <span className="text-xs text-gray-400 font-medium">·</span>
                        <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: uz })}
                        </span>
                    </div>

                    <div
                        onClick={() => !id && navigate(`/community/${note._id}`)}
                        className={`text-[14px] sm:text-[15px] text-gray-800 dark:text-gray-200 leading-normal whitespace-pre-wrap ${!id ? 'cursor-pointer hover:underline decoration-primary-500/30' : ''}`}
                    >
                        {note.content}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-6 mt-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleLike(note._id); }}
                            className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-rose-500'}`}
                        >
                            {isLiked ? <HiHeart className="w-4.5 h-4.5" /> : <HiOutlineHeart className="w-4.5 h-4.5" />}
                            <span className="text-xs font-medium">{note.likes?.length || 0}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/community/${note._id}`); }}
                            className="flex items-center gap-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                        >
                            <HiOutlineChatAlt2 className="w-4.5 h-4.5" />
                            <span className="text-xs font-medium">{note.repliesCount || 0}</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleShare(note); }}
                            className="text-gray-400 hover:text-emerald-500 transition-colors"
                        >
                            <HiOutlineShare className="w-4.5 h-4.5" />
                        </button>

                        {canDelete && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }}
                                className="ml-auto text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
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
        <div className="max-w-2xl mx-auto pb-32 min-h-screen bg-gray-50/30 dark:bg-dark-950/20">
            {/* Simple Header */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5 p-4">
                <div className="flex items-center gap-4">
                    {id && (
                        <button onClick={() => navigate('/community')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 text-gray-500 transition-colors">
                            <HiOutlineArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                        {id ? 'Muloqot' : 'Community'}
                    </h1>
                </div>
            </div>

            {/* Simple Input - Integrated into the top of the feed */}
            {user && (
                <div className="bg-white dark:bg-dark-900 border-b border-gray-100 dark:border-white/5 p-4">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gray-100 dark:bg-dark-800 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <span className="font-bold text-primary-500">{user.ism?.charAt(0)}</span>}
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder={id ? "Javobingizni qoldiring..." : "Nima yangiliklar bor?"}
                                className="w-full bg-transparent pt-2 outline-none text-gray-800 dark:text-gray-100 text-[15px] sm:text-[17px] resize-none min-h-[50px]"
                                rows={2}
                            />

                            {/* Categories Selection */}
                            {!id && (
                                <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 mt-2">
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setCategory(cat.id)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${category === cat.id ? 'bg-primary-500 text-white border-primary-500' : 'bg-gray-50 dark:bg-dark-800 text-gray-500 border-transparent hover:border-gray-200'}`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4">
                                <span className={`text-[11px] font-medium ${content.length > 900 ? 'text-rose-500' : 'text-gray-400'}`}>
                                    {content.length > 0 ? `${content.length}/1000` : ''}
                                </span>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || !content.trim()}
                                    className="px-6 py-2 bg-primary-500 text-white rounded-full font-bold text-sm shadow-md shadow-primary-500/20 active:scale-95 disabled:opacity-50 hover:bg-primary-600 transition-all"
                                >
                                    {submitting ? '...' : id ? 'Javob' : 'Yozish'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!user && (
                <div className="p-8 text-center border-b border-gray-100 dark:border-white/5 bg-white dark:bg-dark-900">
                    <Link to="/login" className="px-6 py-2.5 bg-primary-500 text-white rounded-full font-bold text-sm hover:bg-primary-600 shadow-lg shadow-primary-500/20 transition-all inline-block">
                        Kirish va muloqot qilish
                    </Link>
                </div>
            )}

            {/* Feed Section - Simple List */}
            <div className="bg-white dark:bg-dark-900">
                {id && currentNote ? (
                    <div>
                        <NoteCard note={currentNote} isMain={true} />
                        <div className="bg-gray-50/50 dark:bg-dark-800/20">
                            {replies.map(reply => (
                                <NoteCard key={reply._id} note={reply} isReply={true} />
                            ))}
                            {replies.length === 0 && (
                                <div className="p-10 text-center text-gray-400 text-sm italic">Hali javoblar yo'q</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        {notes.filter(n => category === 'general' || n.category === category).map(note => (
                            <NoteCard key={note._id} note={note} />
                        ))}
                    </div>
                )}

                {!loading && notes.length === 0 && !currentNote && (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 text-[15px]">Hali xabarlar yo'q</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
