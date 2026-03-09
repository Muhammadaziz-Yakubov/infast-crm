import { useState, useEffect } from 'react';
import { coinAPI, groupAPI, studentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
    HiOutlineCash,
    HiOutlineUsers,
    HiOutlineUserGroup,
    HiOutlineClock,
    HiOutlinePlusCircle,
    HiOutlineMinusCircle,
    HiOutlineCheckCircle,
    HiOutlineX
} from 'react-icons/hi';

const CoinManager = () => {
    const [groups, setGroups] = useState([]);
    const [students, setStudents] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    // UI States
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [targetType, setTargetType] = useState('all'); // 'all', 'group', 'students'

    const [formData, setFormData] = useState({
        targetId: '',
        targetIds: [],
        amount: '',
        reason: '',
        action: 'plus' // 'plus', 'minus'
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [groupsRes, studentsRes, logsRes] = await Promise.all([
                groupAPI.getAll(),
                studentAPI.getAll({ limit: 1000 }),
                coinAPI.getGlobalLogs()
            ]);
            setGroups(groupsRes.data.data);
            setStudents(studentsRes.data.data);
            setLogs(logsRes.data.data);
        } catch (error) {
            toast.error('Ma\'lumotlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (type) => {
        setTargetType(type);
        setFormData({
            targetId: '',
            targetIds: [],
            amount: '',
            reason: '',
            action: 'plus'
        });
        setIsUpdateModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitLoading(true);
        try {
            const amount = formData.action === 'plus' ? Math.abs(formData.amount) : -Math.abs(formData.amount);

            const payload = {
                targetType,
                targetId: targetType === 'group' ? formData.targetId : (targetType === 'students' ? formData.targetIds : null),
                amount,
                reason: formData.reason
            };

            await coinAPI.manualUpdate(payload);
            toast.success('Muvaffaqiyatli bajarildi');
            setIsUpdateModalOpen(false);
            fetchInitialData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setSubmitLoading(false);
        }
    };



    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                        Coin <span className="text-primary-500 italic">Boshqaruvi</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">
                        O'quvchilarga mukofot yoki jarima coinlarini bering
                    </p>
                </div>
                <div className="flex items-center gap-3">
                </div>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <button
                    onClick={() => handleOpenModal('all')}
                    className="group relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-500/20 hover:-translate-y-2 transition-all overflow-hidden"
                >
                    <HiOutlineUsers className="w-12 h-12 md:w-16 md:h-16 opacity-10 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-125 transition-transform" />
                    <div className="relative z-10 flex flex-col items-start text-left">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 md:mb-6">
                            <HiOutlineUsers className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <h3 className="text-sm md:text-xl font-black uppercase tracking-tight italic">Barchaga</h3>
                        <p className="text-indigo-100/70 text-[10px] md:text-sm font-medium mt-2">Barcha o'quvchilarga</p>
                    </div>
                </button>

                <button
                    onClick={() => handleOpenModal('group')}
                    className="group relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-xl shadow-purple-500/20 hover:-translate-y-2 transition-all overflow-hidden"
                >
                    <HiOutlineUserGroup className="w-12 h-12 md:w-16 md:h-16 opacity-10 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-125 transition-transform" />
                    <div className="relative z-10 flex flex-col items-start text-left">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 md:mb-6">
                            <HiOutlineUserGroup className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <h3 className="text-sm md:text-xl font-black uppercase tracking-tight italic">Guruhga</h3>
                        <p className="text-purple-100/70 text-[10px] md:text-sm font-medium mt-2">Guruh o'quvchilariga</p>
                    </div>
                </button>

                <button
                    onClick={() => handleOpenModal('students')}
                    className="group relative p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-xl shadow-emerald-500/20 hover:-translate-y-2 transition-all overflow-hidden"
                >
                    <HiOutlineCash className="w-12 h-12 md:w-16 md:h-16 opacity-10 absolute -right-4 -bottom-4 rotate-12 group-hover:scale-125 transition-transform" />
                    <div className="relative z-10 flex flex-col items-start text-left">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4 md:mb-6">
                            <HiOutlinePlusCircle className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <h3 className="text-sm md:text-xl font-black uppercase tracking-tight italic">Tanlangan</h3>
                        <p className="text-emerald-100/70 text-[10px] md:text-sm font-medium mt-2">Ma'lum o'quvchilarga</p>
                    </div>
                </button>


            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-primary-500">
                            <HiOutlineClock className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Oxirgi Amallar</h3>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 dark:bg-dark-900 px-3 py-1.5 rounded-lg">Real-time</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-dark-900/50">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">O'quvchi</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amal</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Coin</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sabab</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sana</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-700/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-gray-900 dark:text-white">{log.student?.ism}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{log.student?.phone}</div>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {log.type === 'plus' ? (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                                                <HiOutlinePlusCircle className="w-3.5 h-3.5" /> Berildi
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase">
                                                <HiOutlineMinusCircle className="w-3.5 h-3.5" /> Olindi
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`text-sm font-black ${log.type === 'plus' ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {log.type === 'plus' ? '+' : '-'}{log.amount} 🪙
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-bold text-gray-600 dark:text-gray-300 max-w-xs">{log.reason}</div>
                                    </td>
                                    <td className="px-8 py-5 text-[10px] text-gray-400 font-black">
                                        {new Date(log.sana).toLocaleString('uz-UZ', {
                                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Manage Modal */}
            <Modal
                isOpen={isUpdateModalOpen}
                onClose={() => setIsUpdateModalOpen(false)}
                title={`Coinlarni Boshqarish: ${targetType === 'all' ? 'Hamma' : (targetType === 'group' ? 'Guruh' : 'Tanlanganlar')}`}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Action Selector */}
                    <div className="flex p-1 bg-gray-100 dark:bg-dark-900 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, action: 'plus' })}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-xs uppercase
                                ${formData.action === 'plus' ? 'bg-white dark:bg-dark-800 text-emerald-500 shadow-sm' : 'text-gray-400'}`}
                        >
                            <HiOutlinePlusCircle className="w-5 h-5" /> Qo'shish
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, action: 'minus' })}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-black text-xs uppercase
                                ${formData.action === 'minus' ? 'bg-white dark:bg-dark-800 text-red-500 shadow-sm' : 'text-gray-400'}`}
                        >
                            <HiOutlineMinusCircle className="w-5 h-5" /> Ayirish
                        </button>
                    </div>

                    {/* Target Specific View */}
                    {targetType === 'group' && (
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Guruhni tanlang</label>
                            <select
                                required
                                value={formData.targetId}
                                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all"
                            >
                                <option value="">Tanlang...</option>
                                {groups.map(g => (
                                    <option key={g._id} value={g._id}>{g.nomi}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {targetType === 'students' && (
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">O'quvchilarni tanlang (Multi-select)</label>
                            <select
                                multiple
                                required
                                value={formData.targetIds}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    targetIds: Array.from(e.target.selectedOptions, option => option.value)
                                })}
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all min-h-[150px]"
                            >
                                {students.map(s => (
                                    <option key={s._id} value={s._id}>{s.ism}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-gray-400 mt-2 italic px-1">* Bir nechta tanlash uchun Ctrl (Windows) yoki Command (Mac) bosing</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Coin Miqdori</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-xl font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all text-center"
                                placeholder="Masalan: 50"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Sabab/Izoh</label>
                            <input
                                type="text"
                                required
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all"
                                placeholder="Masalan: Faol qatnashgani uchun"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitLoading}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs text-white shadow-xl transition-all active:scale-95 disabled:opacity-50
                            ${formData.action === 'plus' ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-red-500 shadow-red-500/20'}`}
                    >
                        {submitLoading ? 'Bajarilmoqda...' : (formData.action === 'plus' ? 'Coin Berish' : 'Coin Olib Tashlash')}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default CoinManager;
