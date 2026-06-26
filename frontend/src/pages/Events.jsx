import { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCalendar, 
    HiOutlineLocationMarker
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const toTashkentDatetimeValue = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    // Tashkent is UTC+5, so we add 5 hours to UTC time
    const tashkentTime = new Date(d.getTime() + (5 * 60 * 60 * 1000));
    return tashkentTime.toISOString().slice(0, 16);
};

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
        
        const now = new Date();
        const start = toTashkentDatetimeValue(now);
        const end = toTashkentDatetimeValue(new Date(now.getTime() + 24 * 60 * 60 * 1000)); // Default to 24 hours later

        setForm({
            title: '', description: '', bannerUrl: '', location: '', 
            startDate: start, endDate: end, maxParticipants: '', 
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
            startDate: toTashkentDatetimeValue(event.startDate),
            endDate: event.endDate ? toTashkentDatetimeValue(event.endDate) : '',
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
        
        const submitData = {
            ...form,
            startDate: form.startDate ? new Date(form.startDate + "+05:00").toISOString() : '',
            endDate: form.endDate ? new Date(form.endDate + "+05:00").toISOString() : ''
        };

        try {
            if (selectedEvent) {
                await eventAPI.update(selectedEvent._id, submitData);
                toast.success("Tadbir yangilandi");
            } else {
                await eventAPI.create(submitData);
                toast.success("Tadbir yaratildi");
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
            toast.success("Tadbir o'chirildi");
            setConfirmOpen(false);
            fetchEvents();
        } catch (err) {
            toast.error("O'chirishda xatolik");
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'UPCOMING': 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20',
            'ONGOING': 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20',
            'COMPLETED': 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20',
            'CANCELLED': 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20'
        };
        return <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${styles[status]}`}>{status}</span>;
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Tadbirlar boshqaruvi</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1 font-medium">Barcha o'quv markazi tadbirlari nazorati</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn-primary flex items-center gap-2"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span>Yangi tadbir yaratish</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                    <div key={event._id} className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-100 dark:border-zinc-900/60 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="relative h-40 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                {event.bannerUrl ? (
                                    <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                        <HiOutlineCalendar className="w-10 h-10" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    {getStatusBadge(event.status)}
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-base text-gray-900 dark:text-white truncate">{event.title}</h3>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
                                    <HiOutlineLocationMarker className="w-4 h-4 text-[#0066FF]" />
                                    <span className="truncate">{event.location}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-50 dark:border-zinc-900/40 space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Sana</span>
                                    <span className="font-semibold text-gray-900 dark:text-white block mt-0.5">
                                        {new Date(event.startDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Registratsiya</span>
                                    <span className="font-semibold text-gray-900 dark:text-white block mt-0.5">
                                        {event.registrationsCount || 0} / {event.maxParticipants || '∞'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => openEditModal(event)}
                                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#0066FF] transition-colors"
                                        title="Tahrirlash"
                                    >
                                        <HiOutlinePencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => { setDeleteId(event._id); setConfirmOpen(true); }}
                                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#FF3B30] transition-colors"
                                        title="O'chirish"
                                    >
                                        <HiOutlineTrash className="w-4 h-4" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => navigate(`/events/${event._id}/attendance`)}
                                    className="px-3 py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-semibold transition-colors"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tadbir nomi *</label>
                                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Manzil *</label>
                                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold" required />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Boshlanish vaqti *</label>
                                    <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-xs font-semibold" required />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tugash vaqti</label>
                                    <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                                        className="w-full px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-xs font-semibold" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Banner URL (Rasm)</label>
                                <input type="text" value={form.bannerUrl} onChange={e => setForm({ ...form, bannerUrl: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Max ishtirokchilar</label>
                                    <input type="number" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Status</label>
                                    <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer">
                                        <option value="UPCOMING">Upcoming</option>
                                        <option value="ONGOING">Ongoing</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Kelganiga coin (+)</label>
                                    <input type="number" value={form.coinReward} onChange={e => setForm({ ...form, coinReward: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-bold text-[#00C853]" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Kelmaganiga coin (-)</label>
                                    <input type="number" value={form.coinPenalty} onChange={e => setForm({ ...form, coinPenalty: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-bold text-[#FF3B30]" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tavsif *</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold min-h-[80px]" required />
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Bekor qilish</button>
                        <button type="submit" className="btn-primary">
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
