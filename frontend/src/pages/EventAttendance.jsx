import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, studentAPI, api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
    HiOutlineChevronLeft, HiOutlineCheckCircle, HiOutlineXCircle, 
    HiOutlineSave, HiOutlineUserGroup, HiOutlineTrendingUp,
    HiOutlineCash
} from 'react-icons/hi';

const EventAttendance = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            // In a real app, I'd have a specific route for registrations, 
            // but for now I'll use a generic one or assume the backend has it.
            // Based on my controller, I need an endpoint for registrations.
            // Let's assume /api/events/:id/registrations exists in backend (I should add it).
            const [eventRes, regRes, statsRes] = await Promise.all([
                api.get(`/events/${id}`),
                api.get(`/events/${id}/registrations`), // Need to implement this in backend
                eventAPI.getAnalytics(id)
            ]);

            setEvent(eventRes.data.data);
            setRegistrations(regRes.data.data);
            setStats(statsRes.data.data);
        } catch (err) {
            toast.error("Ma'lumotlarni yuklashda xatolik");
            navigate('/events');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = (studentId, status) => {
        setRegistrations(prev => prev.map(reg => 
            reg.student._id === studentId ? { ...reg, status } : reg
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const attendanceData = registrations.map(reg => ({
                studentId: reg.student._id,
                status: reg.status
            }));
            await eventAPI.saveAttendance(id, attendanceData);
            toast.success("Yo'qlama saqlandi va coinlar yangilandi ✨");
            fetchData();
        } catch (err) {
            toast.error("Saqlashda xatolik");
        } finally {
            setSaving(false);
        }
    };

    const markAllAttended = () => {
        setRegistrations(prev => prev.map(reg => ({ ...reg, status: 'ATTENDED' })));
    };

    const markAllAbsent = () => {
        setRegistrations(prev => prev.map(reg => ({ ...reg, status: 'ABSENT' })));
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            <div className="flex items-center justify-between gap-4">
                <button onClick={() => navigate('/events')} className="p-3 rounded-2xl bg-white dark:bg-dark-800 shadow-sm hover:bg-gray-50 transition-all border border-gray-100 dark:border-white/5">
                    <HiOutlineChevronLeft className="w-6 h-6 text-gray-500" />
                </button>
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase truncate px-4">{event?.title}</h1>
                    <p className="text-xs font-black text-primary-500 uppercase tracking-widest px-4 mt-1">Yo'qlama va Coin boshqaruvi</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-500/20 hover:-translate-y-1 transition-all disabled:opacity-50"
                >
                    <HiOutlineSave className="w-5 h-5" />
                    <span className="hidden md:inline">Saqlash</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jami registratsiya</p>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><HiOutlineUserGroup className="text-blue-500" /></div>
                        <span className="text-xl font-black text-gray-900 dark:text-white">{stats?.total || 0}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Kelganlar</p>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><HiOutlineCheckCircle className="text-emerald-500" /></div>
                        <span className="text-xl font-black text-gray-900 dark:text-white">{stats?.attended || 0}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Kelmaganlar</p>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg"><HiOutlineXCircle className="text-red-500" /></div>
                        <span className="text-xl font-black text-gray-900 dark:text-white">{stats?.absent || 0}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Reward Coins</p>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg"><HiOutlineCash className="text-amber-500" /></div>
                        <span className="text-xl font-black text-gray-900 dark:text-white">+{stats?.rewardedCoins || 0}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">Studentlar ro'yxati</h3>
                    <div className="flex gap-2">
                        <button onClick={markAllAttended} className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all">Hammasini Keldi qilish</button>
                        <button onClick={markAllAbsent} className="px-4 py-2 rounded-xl bg-red-500/10 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Hammasini Kelmadi qilish</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-dark-900 border-b border-gray-100 dark:border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Guruh</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Holati</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-dark-700">
                            {registrations.map((reg) => (
                                <tr key={reg._id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-sm uppercase">
                                                {reg.student.ism?.[0] || 'S'}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 dark:text-white uppercase text-sm">{reg.student.ism}</p>
                                                <p className="text-xs text-gray-500 font-medium">{reg.student.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase bg-gray-100 dark:bg-dark-900 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/5">
                                            {reg.student.guruh?.nomi || 'Guruhsiz'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                            ${reg.status === 'ATTENDED' ? 'bg-emerald-500/10 text-emerald-600' : 
                                              reg.status === 'ABSENT' ? 'bg-red-500/10 text-red-600' : 
                                              'bg-blue-500/10 text-blue-600'}`}>
                                            {reg.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => updateStatus(reg.student._id, 'ATTENDED')}
                                                className={`p-3 rounded-xl transition-all shadow-sm ${reg.status === 'ATTENDED' ? 'bg-emerald-500 text-white' : 'bg-gray-50 dark:bg-dark-900 text-gray-400 hover:text-emerald-500'}`}
                                            >
                                                <HiOutlineCheckCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(reg.student._id, 'ABSENT')}
                                                className={`p-3 rounded-xl transition-all shadow-sm ${reg.status === 'ABSENT' ? 'bg-red-500 text-white' : 'bg-gray-50 dark:bg-dark-900 text-gray-400 hover:text-red-500'}`}
                                            >
                                                <HiOutlineXCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {registrations.length === 0 && (
                        <div className="p-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto">
                                <HiOutlineUserGroup className="w-10 h-10 text-gray-300" />
                            </div>
                            <p className="font-black text-gray-400 uppercase tracking-widest text-sm text-center">Hali hech kim yozilmagan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventAttendance;
