import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { eventAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { 
    HiOutlineChevronLeft, HiOutlineCheckCircle, HiOutlineXCircle, 
    HiOutlineSave, HiOutlineUserGroup, HiOutlineCash
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
            const [eventRes, regRes, statsRes] = await Promise.all([
                api.get(`/events/${id}`),
                api.get(`/events/${id}/registrations`),
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
            toast.success("Yo'qlama saqlandi va coinlar yangilandi");
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
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/events')} className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-zinc-500 hover:text-[#0066FF] transition-colors">
                    <HiOutlineChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white truncate">{event?.title}</h1>
                    <p className="text-xs text-zinc-400 mt-0.5">Yo'qlama va Coin boshqaruvi</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary flex items-center gap-2"
                >
                    <HiOutlineSave className="w-4 h-4" />
                    <span>Saqlash</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Jami registratsiya</span>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#0066FF]/10 rounded text-[#0066FF] border border-[#0066FF]/20"><HiOutlineUserGroup className="w-4 h-4" /></div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">{stats?.total || 0}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Kelganlar</span>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#00C853]/10 rounded text-[#00C853] border border-[#00C853]/20"><HiOutlineCheckCircle className="w-4 h-4" /></div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">{stats?.attended || 0}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Kelmaganlar</span>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#FF3B30]/10 rounded text-[#FF3B30] border border-[#FF3B30]/20"><HiOutlineXCircle className="w-4 h-4" /></div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">{stats?.absent || 0}</span>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#111111] p-4 rounded-xl border border-gray-150 dark:border-zinc-900/60">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">Reward Coins</span>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#FF9500]/10 rounded text-[#FF9500] border border-[#FF9500]/20"><HiOutlineCash className="w-4 h-4" /></div>
                        <span className="text-base font-bold text-gray-900 dark:text-white">+{stats?.rewardedCoins || 0}</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 overflow-hidden">
                <div className="p-4 border-b border-gray-150 dark:border-zinc-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Studentlar ro'yxati</h3>
                    <div className="flex gap-2">
                        <button onClick={markAllAttended} className="px-3 py-1.5 rounded-lg bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20 text-xs font-semibold hover:bg-[#00C853]/20 transition-colors">Hammasini keldi qilish</button>
                        <button onClick={markAllAbsent} className="px-3 py-1.5 rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20 text-xs font-semibold hover:bg-[#FF3B30]/20 transition-colors">Hammasini kelmadi qilish</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-150 dark:border-zinc-900/60">
                                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Guruh</th>
                                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Holati</th>
                                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Amal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 dark:divide-zinc-900/60">
                            {registrations.map((reg) => (
                                <tr key={reg._id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-zinc-800 dark:text-zinc-200 font-semibold text-xs uppercase border border-zinc-250 dark:border-zinc-750">
                                                {reg.student.ism?.[0] || 'S'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{reg.student.ism}</p>
                                                <p className="text-xs text-zinc-400">{reg.student.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                            {reg.student.guruh?.nomi || 'Guruhsiz'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold border
                                            ${reg.status === 'ATTENDED' ? 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20' : 
                                              reg.status === 'ABSENT' ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20' : 
                                              'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20'}`}>
                                            {reg.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5">
                                            <button
                                                onClick={() => updateStatus(reg.student._id, 'ATTENDED')}
                                                className={`p-1.5 rounded transition-all border ${reg.status === 'ATTENDED' ? 'bg-[#00C853] border-[#00C853] text-white' : 'bg-transparent border-gray-200 dark:border-zinc-800 text-zinc-400 hover:text-[#00C853]'}`}
                                            >
                                                <HiOutlineCheckCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => updateStatus(reg.student._id, 'ABSENT')}
                                                className={`p-1.5 rounded transition-all border ${reg.status === 'ABSENT' ? 'bg-[#FF3B30] border-[#FF3B30] text-white' : 'bg-transparent border-gray-200 dark:border-zinc-800 text-zinc-400 hover:text-[#FF3B30]'}`}
                                            >
                                                <HiOutlineXCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {registrations.length === 0 && (
                        <div className="py-16 text-center text-zinc-400">
                            <HiOutlineUserGroup className="w-10 h-10 mx-auto mb-2" />
                            <p className="text-xs font-semibold">Hali hech kim yozilmagan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventAttendance;
