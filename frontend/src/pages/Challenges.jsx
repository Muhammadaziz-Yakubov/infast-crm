import { useState, useEffect } from 'react';
import { challengeAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
    HiOutlinePlus, HiOutlineTrash, HiOutlineCalendar, 
    HiOutlineChevronRight, HiOutlinePhotograph, HiOutlineClock,
    HiOutlineUserGroup, HiOutlineViewGrid, HiOutlineBookOpen
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Challenges = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    
    const [form, setForm] = useState({
        title: '',
        description: '',
        duration: 30,
        days: []
    });

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        try {
            const res = await challengeAPI.getAll();
            setChallenges(res.data.data);
        } catch (err) {
            toast.error("Chellenjlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleDurationChange = (val) => {
        const num = parseInt(val) || 0;
        const newDays = Array.from({ length: num }, (_, i) => ({
            dayNumber: i + 1,
            task: form.days[i]?.task || ''
        }));
        setForm({ ...form, duration: num, days: newDays });
    };

    const handleTaskChange = (index, task) => {
        const newDays = [...form.days];
        newDays[index].task = task;
        setForm({ ...form, days: newDays });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.days.some(d => !d.task)) {
            return toast.error("Barcha kunlar uchun topshiriq kiritilishi shart");
        }

        try {
            await challengeAPI.create(form);
            toast.success("Chellenj muvaffaqiyatli yaratildi 🚀");
            setModalOpen(false);
            fetchChallenges();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const handleDelete = async () => {
        try {
            await challengeAPI.delete(deleteId);
            toast.success("Chellenj o'chirildi 👋");
            setConfirmOpen(false);
            fetchChallenges();
        } catch (err) {
            toast.error("O'chirishda xatolik");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                        Chellenjlar <span className="text-primary-500">Tizimi</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Bilimingizni amalda sinab ko'ring!</p>
                </div>
                {(user.role === 'admin' || user.role === 'superadmin') && (
                    <button
                        onClick={() => {
                            setForm({ title: '', description: '', duration: 30, days: Array.from({ length: 30 }, (_, i) => ({ dayNumber: i + 1, task: '' })) });
                            setModalOpen(true);
                        }}
                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gray-900 dark:bg-primary-600 
                            text-white font-black text-sm shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-1 active:scale-95"
                    >
                        <HiOutlinePlus className="w-5 h-5" />
                        <span>Yangi chellenj</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                    <div 
                        key={challenge._id} 
                        onClick={() => navigate(`/challenges/${challenge._id}`)}
                        className="group cursor-pointer bg-white dark:bg-dark-800 rounded-[2.5rem] p-7 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all"
                    >
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                    <HiOutlineBookOpen className="w-8 h-8" />
                                </div>
                                <div className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-dark-900 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {challenge.duration} Kun
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase group-hover:text-primary-500 transition-colors">
                                    {challenge.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {challenge.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-dark-700">
                                <div className="flex items-center gap-2">
                                    <div className="flex -space-x-2">
                                        {challenge.participants?.slice(0, 3).map((p, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-dark-800 bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                                                {i + 1}
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {challenge.participants?.length || 0} qatnashchi
                                    </span>
                                </div>
                                
                                <div className="flex gap-2">
                                    {(user.role === 'admin' || user.role === 'superadmin') && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteId(challenge._id);
                                                setConfirmOpen(true);
                                            }}
                                            className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                        </button>
                                    )}
                                    <div className="p-3 rounded-xl bg-primary-500 text-white shadow-lg shadow-primary-500/20">
                                        <HiOutlineChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {challenges.length === 0 && (
                <div className="text-center py-20 bg-gray-50 dark:bg-dark-900/50 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/5">
                    <HiOutlineCalendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">Hali chellenjlar yo'q</h3>
                    <p className="text-gray-500 mt-2">Yangi chellenj yaratish uchun yuqoridagi tugmani bosing</p>
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yangi chellenj yaratish" size="xl">
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Chellenj nomi *</label>
                                <input 
                                    type="text" 
                                    value={form.title} 
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                    placeholder="Masalan: 100 HTML CSS Projects"
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Davomiyligi (kun) *</label>
                                <input 
                                    type="number" 
                                    value={form.duration} 
                                    onChange={e => handleDurationChange(e.target.value)}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Tavsif *</label>
                                <textarea 
                                    value={form.description} 
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold min-h-[120px]" 
                                    required 
                                />
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1 sticky top-0 bg-white dark:bg-dark-800 py-2">Kunlik topshiriqlar</label>
                            {form.days.map((day, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gray-100 dark:bg-dark-900 flex items-center justify-center font-black text-xs text-gray-400">
                                        {day.dayNumber}
                                    </div>
                                    <input 
                                        type="text" 
                                        value={day.task} 
                                        onChange={e => handleTaskChange(index, e.target.value)}
                                        placeholder={`Kun ${day.dayNumber} topshirig'i...`}
                                        className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all text-sm font-medium"
                                        required
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100 dark:bg-dark-800 transition-all active:scale-95">Bekor qilish</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl font-black text-white bg-primary-600 shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                            Chellenjni yaratish
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Chellenjni o'chirish"
                message="Haqiqatan ham bu chellenjni o'chirmoqchimisiz? Barcha topshiriqlar ham o'chib ketadi."
            />
        </div>
    );
};

export default Challenges;
