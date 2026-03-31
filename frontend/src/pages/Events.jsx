import { useState, useEffect } from 'react';
import { eventAPI, studentAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCalendar, 
    HiOutlineLocationMarker, HiOutlineUserGroup, HiOutlineClock,
    HiOutlineBadgeCheck, HiOutlinePresentationChartBar
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const Events = () => {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [form, setForm] = useState({
        title: '', description: '', bannerUrl: '', location: '', 
        startDate: '', endDate: '', maxParticipants: '', 
        coinReward: 500, coinPenalty: 500, status: 'UPCOMING', isActive: true
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await eventAPI.getAll();
            setEvents(res.data.data);
        } catch (err) {
            toast.error("Tadbirlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setSelectedEvent(null);
        setForm({
            title: '', description: '', bannerUrl: '', location: '', 
            startDate: '', endDate: '', maxParticipants: '', 
            coinReward: 500, coinPenalty: 500, status: 'UPCOMING', isActive: true
        });
        setModalOpen(true);
    };

    const openEditModal = (event) => {
        setSelectedEvent(event);
        setForm({
            title: event.title,
            description: event.description,
            bannerUrl: event.bannerUrl || '',
            location: event.location,
            startDate: new Date(event.startDate).toISOString().slice(0, 16),
            endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
            maxParticipants: event.maxParticipants || '',
            coinReward: event.coinReward,
            coinPenalty: event.coinPenalty,
            status: event.status,
            isActive: event.isActive
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedEvent) {
                await eventAPI.update(selectedEvent._id, form);
                toast.success("Tadbir yangilandi ✨");
            } else {
                await eventAPI.create(form);
                toast.success("Tadbir yaratildi 🚀");
            }
            setModalOpen(false);
            fetchEvents();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik");
        }
    };

    const handleDelete = async () => {
        try {
            await eventAPI.delete(deleteId);
            toast.success("Tadbir o'chirildi 👋");
            setConfirmOpen(false);
            fetchEvents();
        } catch (err) {
            toast.error("O'chirishda xatolik");
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'UPCOMING': 'bg-blue-500/10 text-blue-600',
            'ONGOING': 'bg-amber-500/10 text-amber-600',
            'COMPLETED': 'bg-emerald-500/10 text-emerald-600',
            'CANCELLED': 'bg-red-500/10 text-red-600'
        };
        return <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[status]}`}>{status}</span>;
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                        Tadbirlar <span className="text-primary-500">Boshqaruvi</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Barcha o'quv markazi tadbirlari nazorati</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gray-900 dark:bg-primary-600 
                        text-white font-black text-sm shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-1 active:scale-95"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    <span>Yangi tadbir</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event._id} className="group bg-white dark:bg-dark-800 rounded-[2.5rem] p-7 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all">
                        <div className="space-y-6">
                            <div className="relative h-40 rounded-3xl overflow-hidden bg-gray-100 dark:bg-dark-900">
                                {event.bannerUrl ? (
                                    <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <HiOutlineCalendar className="w-16 h-16" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4">
                                    {getStatusBadge(event.status)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase truncate">{event.title}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                    <HiOutlineLocationMarker className="text-primary-500" />
                                    <span>{event.location}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50 dark:border-dark-700">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sana</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                                        {new Date(event.startDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Registratsiya</p>
                                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                                        {event.registrationsCount || 0} / {event.maxParticipants || '∞'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(event)}
                                        className="p-3 rounded-xl bg-gray-50 dark:bg-dark-900 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                        title="Tahrirlash"
                                    >
                                        <HiOutlinePencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { setDeleteId(event._id); setConfirmOpen(true); }}
                                        className="p-3 rounded-xl bg-gray-50 dark:bg-dark-900 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="O'chirish"
                                    >
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => navigate(`/events/${event._id}/attendance`)}
                                    className="px-5 py-3 rounded-xl bg-primary-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Yo'qlama
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedEvent ? "Tadbirni tahrirlash" : "Yangi tadbir"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Tadbir nomi *</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" required />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Manzil *</label>
                                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Boshlanish vaqti *</label>
                                    <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" required />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Tugash vaqti</label>
                                    <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Banner URL (Rasm)</label>
                                <input type="text" value={form.bannerUrl} onChange={e => setForm({ ...form, bannerUrl: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Max qatnashchilar</label>
                                    <input type="number" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Status</label>
                                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold">
                                        <option value="UPCOMING">Upcoming</option>
                                        <option value="ONGOING">Ongoing</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Kelganiga coin (+)</label>
                                    <input type="number" value={form.coinReward} onChange={e => setForm({ ...form, coinReward: parseInt(e.target.value) })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold text-emerald-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Kelmaganiga coin (-)</label>
                                    <input type="number" value={form.coinPenalty} onChange={e => setForm({ ...form, coinPenalty: parseInt(e.target.value) })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-red-500 outline-none transition-all font-bold text-red-500" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Tavsif *</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold min-h-[100px]" required />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100 dark:bg-dark-800 transition-all active:scale-95">Bekor qilish</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl font-black text-white bg-primary-600 shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                            {selectedEvent ? 'Saqlash' : "Yaratish"}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Tadbirni o'chirish"
                message="Haqiqatan ham bu tadbirni arxivlamoqchimisiz? U studentlar ro'yxatidan yo'qoladi."
            />
        </div>
    );
};

export default Events;
