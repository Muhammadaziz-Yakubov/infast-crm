import { useState, useEffect } from 'react';
import { eventAPI } from '../../services/api';
import Modal from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
    HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineUserGroup, 
    HiOutlineClock, HiOutlineChevronRight, HiOutlineInformationCircle,
    HiOutlineLightningBolt, HiOutlineMinusCircle
} from 'react-icons/hi';

const StudentEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [registering, setRegistering] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await eventAPI.getUpcoming();
            setEvents(res.data.data);
        } catch (err) {
            toast.error("Tadbirlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const openDetails = (event) => {
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const handleRegister = async (eventId) => {
        setRegistering(true);
        try {
            await eventAPI.register(eventId);
            toast.success("Siz muvaffaqiyatli yozildingiz! 🎉");
            fetchEvents();
            setModalOpen(false);
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            <div className="space-y-2">
                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase transition-all duration-500">
                    Kutilayotgan <span className="text-primary-500">Tadbirlar</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium italic">O'quv markazimizdagi eng so'nggi va qiziqarli tadbirlar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                    <div 
                        key={event._id} 
                        className="group relative bg-white dark:bg-dark-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                    >
                        <div className="relative h-56 overflow-hidden">
                            {event.bannerUrl ? (
                                <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-900 dark:to-dark-800 flex items-center justify-center">
                                    <HiOutlineCalendar className="w-20 h-20 text-gray-300 dark:text-dark-700" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                                <span className={`px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest border border-white/20`}>
                                    {event.status}
                                </span>
                                {event.isRegistered && (
                                    <span className="px-3 py-1.5 rounded-xl bg-emerald-500 text-[10px] font-black text-white uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                        Yozilgansiz
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-3">
                                <h3 className="font-black text-xl text-gray-900 dark:text-white uppercase leading-tight group-hover:text-primary-500 transition-colors">{event.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium line-clamp-2">{event.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 dark:bg-dark-900 rounded-xl">
                                        <HiOutlineClock className="w-4 h-4 text-primary-500" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 dark:bg-dark-900 rounded-xl">
                                        <HiOutlineUserGroup className="w-4 h-4 text-primary-500" />
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">
                                        {event.registrationsCount || 0} / {event.maxParticipants || '∞'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => openDetails(event)}
                                    className="flex-1 py-4 bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-all active:scale-95 border border-gray-100 dark:border-white/5"
                                >
                                    Batafsil
                                </button>
                                {!event.isRegistered ? (
                                    <button
                                        onClick={() => handleRegister(event._id)}
                                        disabled={event.maxParticipants && event.registrationsCount >= event.maxParticipants}
                                        className="flex-[1.5] py-4 bg-primary-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary-500/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                    >
                                        Yozilish
                                    </button>
                                ) : (
                                    <div className="flex-[1.5] py-4 bg-emerald-500/10 text-emerald-600 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center border border-emerald-500/20">
                                        Siz Ro'yxatdasiz
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {events.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 space-y-6 bg-white dark:bg-dark-800 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-inner">
                    <HiOutlineCalendar className="w-24 h-24 text-gray-200 dark:text-dark-700" />
                    <div className="text-center">
                        <p className="font-black text-xl text-gray-400 dark:text-gray-600 uppercase tracking-widest">Hozircha tadbirlar yo'q</p>
                        <p className="text-gray-400 dark:text-gray-700 font-bold mt-2 italic">Yangi tadbirlarni kuting!</p>
                    </div>
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Tadbir ma'lumotlari" size="xl">
                {selectedEvent && (
                    <div className="space-y-8 py-4">
                        <div className="relative h-64 rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl">
                            {selectedEvent.bannerUrl ? (
                                <img src={selectedEvent.bannerUrl} alt={selectedEvent.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                                    <HiOutlineCalendar className="w-24 h-24 text-white/20" />
                                </div>
                            )}
                            <div className="absolute top-6 right-6">
                                <span className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-xl text-xs font-black text-white border border-white/30 uppercase tracking-widest">
                                    {selectedEvent.status}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">{selectedEvent.title}</h2>
                                    <div className="flex flex-wrap gap-4">
                                        <div className="flex items-center gap-2 text-xs font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 px-4 py-2 rounded-xl">
                                            <HiOutlineLocationMarker /> {selectedEvent.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-4 py-2 rounded-xl">
                                            <HiOutlineCalendar /> {new Date(selectedEvent.startDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-1 w-full bg-gray-50 dark:bg-dark-900 rounded-3xl">
                                    <div className="p-8 bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                                        <p className="text-gray-600 dark:text-gray-400 font-bold leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="p-8 bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/20 blur-[80px]" />
                                    
                                    <div className="space-y-6 relative">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em]">Bonus Tizimi</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400"><HiOutlineLightningBolt /></div>
                                                    <span className="text-sm font-black text-emerald-400">ISHTIROK UCHUN</span>
                                                </div>
                                                <span className="text-xl font-black text-emerald-400">+{selectedEvent.coinReward}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-red-500/20 rounded-xl text-red-500"><HiOutlineMinusCircle /></div>
                                                    <span className="text-sm font-black text-red-500 italic">KELMAGANGA</span>
                                                </div>
                                                <span className="text-xl font-black text-red-500">-{selectedEvent.coinPenalty}</span>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/10 space-y-4">
                                            <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                                                <span>Joylar soni</span>
                                                <span className="text-white">{selectedEvent.maxParticipants || 'Cheksiz'}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                                                <span>Vaqti</span>
                                                <span className="text-white">{new Date(selectedEvent.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>

                                        {selectedEvent.isRegistered ? (
                                            <button disabled className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/20">
                                                SIZ RO'YXATDASIZ
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleRegister(selectedEvent._id)}
                                                disabled={registering || (selectedEvent.maxParticipants && selectedEvent.registrationsCount >= selectedEvent.maxParticipants)}
                                                className="w-full py-5 rounded-2xl bg-primary-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {registering ? 'Yozilmoqda...' : 'HOZIROQ YOZILISH'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6 bg-blue-500/5 rounded-[2rem] border border-blue-500/10 flex items-start gap-4">
                                    <HiOutlineInformationCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                                    <p className="text-[10px] font-bold text-blue-600/70 leading-relaxed uppercase tracking-wider">
                                        Eslatma: Tadbirga yozilib, ishtirok etmaslik profilingizdagi coinlar soni kamayishiga sabab bo'ladi.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default StudentEvents;
