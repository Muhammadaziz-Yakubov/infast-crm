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
    HiOutlineMinusCircle
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
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Coin boshqaruvi</h1>
                <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1 font-medium">O'quvchilarga mukofot yoki jarima coinlarini taqsimlash</p>
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                    onClick={() => handleOpenModal('all')}
                    className="p-6 rounded-xl bg-white dark:bg-[#111111] border border-gray-150 dark:border-zinc-900/60 hover:border-[#0066FF]/30 transition-all text-left flex flex-col justify-between h-40"
                >
                    <div className="w-10 h-10 rounded-lg bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center border border-[#0066FF]/20">
                        <HiOutlineUsers className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Barchaga coin berish</h3>
                        <p className="text-xs text-zinc-400 mt-1">Markazdagi barcha faol o'quvchilarga ommaviy coin yozish</p>
                    </div>
                </button>

                <button
                    onClick={() => handleOpenModal('group')}
                    className="p-6 rounded-xl bg-white dark:bg-[#111111] border border-gray-150 dark:border-zinc-900/60 hover:border-[#00C853]/30 transition-all text-left flex flex-col justify-between h-40"
                >
                    <div className="w-10 h-10 rounded-lg bg-[#00C853]/10 text-[#00C853] flex items-center justify-center border border-[#00C853]/20">
                        <HiOutlineUserGroup className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Guruhga coin berish</h3>
                        <p className="text-xs text-zinc-400 mt-1">Tanlangan guruh tarkibidagi barcha o'quvchilarga coin yozish</p>
                    </div>
                </button>

                <button
                    onClick={() => handleOpenModal('students')}
                    className="p-6 rounded-xl bg-white dark:bg-[#111111] border border-gray-150 dark:border-zinc-900/60 hover:border-[#FF9500]/30 transition-all text-left flex flex-col justify-between h-40"
                >
                    <div className="w-10 h-10 rounded-lg bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center border border-[#FF9500]/20">
                        <HiOutlineCash className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">O'quvchilarga coin berish</h3>
                        <p className="text-xs text-zinc-400 mt-1">Ro'yxatdan bir yoki bir nechta o'quvchilarni tanlab coin yozish</p>
                    </div>
                </button>
            </div>

            {/* History Table */}
            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 overflow-hidden">
                <div className="p-4 border-b border-gray-150 dark:border-zinc-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[#0066FF]">
                            <HiOutlineClock className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Oxirgi amallar</h3>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-semibold bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">Real-time</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-150 dark:border-zinc-900/60">
                                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">O'quvchi</th>
                                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-center">Amal</th>
                                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Coin</th>
                                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Sabab</th>
                                <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Sana</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-150 dark:divide-zinc-900/60">
                            {logs.map((log) => (
                                <tr key={log._id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{log.student?.ism}</div>
                                        <div className="text-[10px] text-zinc-400 mt-0.5">{log.student?.telefon || log.student?.username}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {log.type === 'plus' ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20">
                                                Berildi
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20">
                                                Olindi
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-semibold ${log.type === 'plus' ? 'text-[#00C853]' : 'text-[#FF3B30]'}`}>
                                            {log.type === 'plus' ? '+' : '-'}{log.amount} 🪙
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-zinc-600 dark:text-zinc-300">{log.reason}</span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-zinc-400">
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
                title={`Coinlarni boshqarish: ${targetType === 'all' ? 'Barchaga' : (targetType === 'group' ? 'Guruhga' : 'Tanlanganlarga')}`}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Action Selector */}
                    <div className="flex p-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, action: 'plus' })}
                            className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all
                                ${formData.action === 'plus' ? 'bg-white dark:bg-zinc-800 text-[#00C853] shadow-sm' : 'text-zinc-500'}`}
                        >
                            Qo'shish
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, action: 'minus' })}
                            className={`flex-1 py-1.5 rounded text-xs font-semibold transition-all
                                ${formData.action === 'minus' ? 'bg-white dark:bg-zinc-800 text-[#FF3B30] shadow-sm' : 'text-zinc-500'}`}
                        >
                            Ayirish
                        </button>
                    </div>

                    {/* Target Specific View */}
                    {targetType === 'group' && (
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Guruhni tanlang</label>
                            <select
                                required
                                value={formData.targetId}
                                onChange={(e) => setFormData({ ...formData, targetId: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer"
                            >
                                <option value="">Guruhni tanlang</option>
                                {groups.map(g => (
                                    <option key={g._id} value={g._id}>{g.nomi}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {targetType === 'students' && (
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">O'quvchilarni tanlang (Multi-select)</label>
                            <select
                                multiple
                                required
                                value={formData.targetIds}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    targetIds: Array.from(e.target.selectedOptions, option => option.value)
                                })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium min-h-[120px] cursor-pointer"
                            >
                                {students.map(s => (
                                    <option key={s._id} value={s._id}>{s.ism}</option>
                                ))}
                            </select>
                            <span className="block text-[10px] text-zinc-400 mt-2 italic px-1">* Bir nechta tanlash uchun Ctrl (Windows) yoki Command (Mac) bosing</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Coin miqdori</label>
                            <input
                                type="number"
                                required
                                min="1"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-bold"
                                placeholder="Masalan: 50"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Sabab/Izoh</label>
                            <input
                                type="text"
                                required
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold"
                                placeholder="Masalan: Faol qatnashgani uchun"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="btn-secondary">Bekor qilish</button>
                        <button
                            type="submit"
                            disabled={submitLoading}
                            className={`btn-primary ${formData.action === 'plus' ? 'bg-[#00C853] hover:bg-[#00B04A]' : 'bg-[#FF3B30] hover:bg-[#E03026]'}`}
                        >
                            {submitLoading ? 'Bajarilmoqda...' : (formData.action === 'plus' ? 'Coin Berish' : 'Coin Olib Tashlash')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CoinManager;
