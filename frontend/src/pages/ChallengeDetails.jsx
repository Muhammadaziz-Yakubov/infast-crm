import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { challengeAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { 
    HiOutlineCalendar, HiOutlineClock, HiOutlineUserGroup, 
    HiOutlineUpload, HiOutlinePhotograph, HiOutlineChatAlt,
    HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineGlobe
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const ChallengeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [challenge, setChallenge] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedDay, setSelectedDay] = useState(1);
    const [isJoined, setIsJoined] = useState(false);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [note, setNote] = useState('');
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (user) {
            fetchChallengeDetails();
        }
    }, [id, user]);


    useEffect(() => {
        if (challenge) {
            fetchSubmissions(selectedDay);
        }
    }, [challenge, selectedDay]);

    const fetchChallengeDetails = async () => {
        try {
            const res = await challengeAPI.getOne(id);
            setChallenge(res.data.data);
            const currentUserId = user?._id || user?.id;
            setIsJoined(res.data.data.participants.some(p => p.participantId.toString() === currentUserId?.toString()));

            
            // Calculate current day based on join date? 
            // Or just let user select day. For now, let user select.
        } catch (err) {
            console.error('Challenge details fetch error:', err);
            toast.error(err.response?.data?.message || "Ma'lumotlarni yuklashda xatolik");
            navigate('/challenges');
        } finally {

            setLoading(false);
        }
    };

    const fetchSubmissions = async (day) => {
        try {
            const res = await challengeAPI.getSubmissions(id, day);
            setSubmissions(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleJoin = async () => {
        try {
            await challengeAPI.join(id);
            toast.success("Chellenjga qo'shildingiz! Omad yor bo'lsin 🚀");
            setIsJoined(true);
            fetchChallengeDetails();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return toast.error("Rasm tanlang");

        setSubmitting(true);
        const formData = new FormData();
        formData.append('image', file);
        formData.append('dayNumber', selectedDay);
        formData.append('note', note);

        try {
            await challengeAPI.submit(id, formData);
            toast.success("Loyihangiz muvaffaqiyatli yuklandi! ✨");
            setUploadModalOpen(false);
            setFile(null);
            setPreview(null);
            setNote('');
            fetchSubmissions(selectedDay);
        } catch (err) {
            toast.error(err.response?.data?.message || "Yuklashda xatolik");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!challenge) return null;

    const currentTask = challenge.days.find(d => d.dayNumber === selectedDay)?.task;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                <div className="space-y-4 w-full md:w-2/3">
                    <button 
                        onClick={() => navigate('/challenges')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary-500 transition-colors font-bold uppercase text-[10px] tracking-widest"
                    >
                        <HiOutlineArrowLeft /> Ortga qaytish
                    </button>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white uppercase leading-tight">
                            {challenge.title}
                        </h1>
                        <p className="text-lg text-gray-500 dark:text-gray-400 font-medium">
                            {challenge.description}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-900 text-gray-600 dark:text-gray-400 text-xs font-black uppercase tracking-widest">
                            <HiOutlineClock className="w-4 h-4 text-primary-500" />
                            {challenge.duration} Kun
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-dark-900 text-gray-600 dark:text-gray-400 text-xs font-black uppercase tracking-widest">
                            <HiOutlineUserGroup className="w-4 h-4 text-primary-500" />
                            {challenge.participants?.length || 0} Qatnashchi
                        </div>
                    </div>
                </div>

                {!isJoined ? (
                    <button 
                        onClick={handleJoin}
                        className="w-full md:w-auto px-10 py-5 rounded-[2rem] bg-primary-600 text-white font-black text-sm shadow-2xl shadow-primary-500/30 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-widest"
                    >
                        Chellenjga qo'shilish
                    </button>
                ) : (
                    <div className="flex items-center gap-3 px-6 py-4 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-black text-xs uppercase tracking-widest">
                        <HiOutlineCheckCircle className="w-5 h-5" />
                        Siz qatnashyapsiz
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Day Selector and Task */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <HiOutlineCalendar className="text-primary-500" />
                            Kunni tanlang
                        </h3>
                        <div className="grid grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {challenge.days.map((day) => {
                                const isSelected = selectedDay === day.dayNumber;
                                return (
                                    <button
                                        key={day.dayNumber}
                                        onClick={() => setSelectedDay(day.dayNumber)}
                                        className={`h-12 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                                            isSelected 
                                                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' 
                                                : 'bg-gray-50 dark:bg-dark-900 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700'
                                        }`}
                                    >
                                        {day.dayNumber}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-primary-500 rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary-500/20 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Bugungi vazifa</span>
                            <span className="text-2xl font-black">Day {selectedDay}</span>
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight leading-relaxed">
                            {currentTask}
                        </h2>
                        {isJoined && (
                            <button 
                                onClick={() => setUploadModalOpen(true)}
                                className="w-full mt-4 py-4 rounded-2xl bg-white text-primary-600 font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
                            >
                                Loyihani yuklash
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Submissions Feed */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase flex items-center gap-3">
                            <HiOutlineGlobe className="text-primary-500" />
                            Qatnashchilar ishlari
                        </h3>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-100 dark:bg-dark-900 px-3 py-1 rounded-lg">
                            {submissions.length} ta loyiha
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {submissions.map((sub) => (
                            <div key={sub._id} className="bg-white dark:bg-dark-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all group">
                                <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-dark-900">
                                    <img 
                                        src={sub.image} 
                                        alt="Project" 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                                        <p className="text-white text-xs font-medium line-clamp-2">{sub.note}</p>
                                    </div>
                                </div>
                                <div className="p-6 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 border border-primary-500/20 overflow-hidden">
                                        {sub.userImage ? (
                                            <img src={sub.userImage} alt={sub.userName} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-black text-xs">{sub.userName?.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{sub.userName}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(sub.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-dark-900 text-primary-500">
                                        <HiOutlineChatAlt className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {submissions.length === 0 && (
                        <div className="text-center py-20 bg-gray-50 dark:bg-dark-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/5">
                            <HiOutlinePhotograph className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Hali ishlar yo'q</h3>
                            <p className="text-gray-500 mt-2">Ushbu kun uchun hali hech kim loyiha yuklamagan</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title={`Kun ${selectedDay} loyihasini yuklash`}>
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="space-y-4">
                        <div 
                            onClick={() => document.getElementById('project-image').click()}
                            className="relative aspect-video rounded-3xl border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-all bg-gray-50 dark:bg-dark-900 overflow-hidden group"
                        >
                            {preview ? (
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <HiOutlineUpload className="w-12 h-12 text-gray-300 group-hover:text-primary-500 mb-2 transition-colors" />
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loyiha rasmini tanlang</p>
                                </>
                            )}
                            <input id="project-image" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </div>

                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Izoh (ixtiyoriy)</label>
                            <textarea 
                                value={note}
                                onChange={e => setNote(e.target.value)}
                                placeholder="Loyiha haqida qisqacha..."
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold min-h-[100px]"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setUploadModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100 dark:bg-dark-800 transition-all active:scale-95">Bekor qilish</button>
                        <button 
                            type="submit" 
                            disabled={submitting || !file}
                            className="flex-1 py-4 rounded-2xl font-black text-white bg-primary-600 shadow-xl shadow-primary-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Yuklanmoqda...' : 'Yuklash'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ChallengeDetails;
