import { useState, useEffect } from 'react';
import { groupAPI, attendanceAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineCheck, HiOutlineX, HiOutlineUsers,
    HiOutlineCalendar, HiOutlineSave, HiOutlineInformationCircle,
    HiOutlineCheckCircle, HiOutlineClock
} from 'react-icons/hi';
import { FaTelegramPlane } from 'react-icons/fa';

const Attendance = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchingData, setFetchingData] = useState(false);
    const [saving, setSaving] = useState(false);
    const [sendingReport, setSendingReport] = useState(false);
    const [izoh, setIzoh] = useState('');

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        if (selectedGroup && selectedDate) {
            fetchAttendance();
        } else {
            setAttendanceData(null);
        }
    }, [selectedGroup, selectedDate]);

    const fetchGroups = async () => {
        try {
            const res = await groupAPI.getAll();
            setGroups(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedGroup(res.data.data[0]._id);
            }
        } catch (err) {
            toast.error("Guruhlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendance = async () => {
        try {
            setFetchingData(true);
            const res = await attendanceAPI.get(selectedGroup, selectedDate);
            setAttendanceData(res.data.data);
            setIzoh(res.data.data.izoh || '');
        } catch (err) {
            toast.error("Davomatni yuklashda xatolik");
        } finally {
            setFetchingData(false);
        }
    };

    const saveAttendanceDirectly = async (oquvchilarList, currentIzoh) => {
        try {
            setSaving(true);
            const payload = {
                guruh: selectedGroup,
                sana: selectedDate,
                oquvchilar: oquvchilarList.map(item => ({
                    oquvchi: item.oquvchi._id,
                    keldi: item.keldi,
                    ball: item.keldi ? 100 : 0
                })),
                izoh: currentIzoh
            };
            await attendanceAPI.save(payload);
        } catch (err) {
            toast.error(err.response?.data?.message || "Avtomatik saqlashda xatolik");
        } finally {
            setSaving(false);
        }
    };

    const handleToggle = async (studentId, status) => {
        const updatedOquvchilar = attendanceData.oquvchilar.map(item =>
            item.oquvchi._id === studentId ? { ...item, keldi: status, ball: status ? 100 : 0 } : item
        );

        setAttendanceData(prev => ({
            ...prev,
            oquvchilar: updatedOquvchilar
        }));

        await saveAttendanceDirectly(updatedOquvchilar, izoh);
    };

    const handleMarkAll = async (status) => {
        const updatedOquvchilar = attendanceData.oquvchilar.map(item => ({
            ...item,
            keldi: status,
            ball: status ? 100 : 0
        }));

        setAttendanceData(prev => ({
            ...prev,
            oquvchilar: updatedOquvchilar
        }));

        await saveAttendanceDirectly(updatedOquvchilar, izoh);
        toast.success(status ? "Barcha o'quvchilar belgilandi" : "Barcha o'quvchilar kelmagan deb belgilandi");
    };

    const handleIzohBlur = async () => {
        if (attendanceData) {
            await saveAttendanceDirectly(attendanceData.oquvchilar, izoh);
        }
    };

    const handleSendReport = async () => {
        try {
            setSendingReport(true);
            await attendanceAPI.sendReport(selectedGroup, selectedDate);
            toast.success("Davomat xabari Telegramga yuborildi");
        } catch (err) {
            toast.error(err.response?.data?.message || "Xabar yuborishda xatolik");
        } finally {
            setSendingReport(false);
        }
    };

    const presentCount = attendanceData ? attendanceData.oquvchilar.filter(i => i.keldi).length : 0;
    const totalCount = attendanceData ? attendanceData.oquvchilar.length : 0;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    if (loading && groups.length === 0) return <LoadingSpinner />;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Davomat tizimi</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1 font-medium">O'quvchilarning darslardagi ishtirokini nazorat qiling</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white cursor-pointer"
                        >
                            <option value="">Guruh tanlang...</option>
                            {groups.map(g => (
                                <option key={g._id} value={g._id}>{g.nomi}</option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="pl-3 pr-4 py-2 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {fetchingData ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-8 h-8 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin mb-3" />
                    <p className="text-xs text-zinc-400 font-medium">Yuklanmoqda...</p>
                </div>
            ) : attendanceData ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Sidebar Stats & Controls */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Status Card */}
                        <div className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-100 dark:border-zinc-900/60">
                            <span className="text-xs text-zinc-500 font-medium block mb-2">Davomat holati</span>
                            <div className="flex items-baseline gap-2 mb-4">
                                <h2 className="text-4xl font-bold text-gray-900 dark:text-white">{percentage}%</h2>
                                <span className="text-xs text-zinc-400 font-medium">Ishtirok</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
                                    <span>Kelgan o'quvchilar:</span>
                                    <span className="text-gray-900 dark:text-white font-semibold">{presentCount}</span>
                                </div>
                                <div className="w-full bg-zinc-100 dark:bg-zinc-850 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-[#0066FF] h-full transition-all duration-300"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs font-medium text-zinc-500">
                                    <span>Jami o'quvchilar:</span>
                                    <span className="text-gray-900 dark:text-white font-semibold">{totalCount}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-100 dark:border-zinc-900/60 space-y-3">
                            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tezkor amallar</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleMarkAll(true)}
                                    className="px-3 py-2 text-xs font-medium rounded-lg text-[#00C853] bg-[#00C853]/10 hover:bg-[#00C853]/20 transition-all border border-[#00C853]/20 flex items-center justify-center gap-1.5"
                                >
                                    <HiOutlineCheckCircle className="w-4 h-4" />
                                    <span>Barchasi</span>
                                </button>
                                <button
                                    onClick={() => handleMarkAll(false)}
                                    className="px-3 py-2 text-xs font-medium rounded-lg text-[#FF3B30] bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 transition-all border border-[#FF3B30]/20 flex items-center justify-center gap-1.5"
                                >
                                    <HiOutlineX className="w-4 h-4" />
                                    <span>Hech kim</span>
                                </button>
                            </div>
                        </div>

                        {/* Auto-save Status Indicator */}
                        <div className="bg-white dark:bg-[#111111] rounded-xl p-4 border border-gray-100 dark:border-zinc-900/60 flex items-center justify-center gap-2.5">
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-semibold text-zinc-550 dark:text-zinc-400">Avtomatik saqlanmoqda...</span>
                                </>
                            ) : (
                                <>
                                    <HiOutlineCheckCircle className="w-5 h-5 text-[#00C853]" />
                                    <span className="text-xs font-semibold text-zinc-550 dark:text-zinc-400">O'zgarishlar saqlandi</span>
                                </>
                            )}
                        </div>

                        {/* Telegram Report Button */}
                        <button
                            onClick={handleSendReport}
                            disabled={sendingReport || !attendanceData}
                            className="w-full btn-secondary flex items-center justify-center gap-2 py-2.5 text-[#0066FF] hover:bg-[#0066FF]/5 border-[#0066FF]/20"
                        >
                            {sendingReport ? (
                                <div className="w-4 h-4 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FaTelegramPlane className="w-4 h-4" />
                            )}
                            <span className="text-xs font-semibold">{sendingReport ? 'Yuborilmoqda...' : 'Telegramga xabar yuborish'}</span>
                        </button>
                    </div>

                    {/* Main List Area */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-100 dark:border-zinc-900/60 overflow-hidden">
                            <div className="p-4 border-b border-gray-150 dark:border-zinc-900/60 flex items-center justify-between">
                                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                                    O'quvchilar ro'yxati
                                </h3>
                                <span className="text-xs text-zinc-500 bg-gray-50 dark:bg-zinc-900 px-2 py-1 rounded border border-gray-200 dark:border-zinc-800">
                                    {totalCount} nafar
                                </span>
                            </div>

                            <div className="divide-y divide-gray-50 dark:divide-zinc-900/40">
                                {attendanceData.oquvchilar.map((item) => (
                                    <div
                                        key={item.oquvchi._id}
                                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 transition-colors ${!item.keldi ? 'bg-red-50/5 dark:bg-red-950/5' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm border uppercase ${item.keldi
                                                    ? 'bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853]'
                                                    : 'bg-[#FF3B30]/10 border-[#FF3B30]/20 text-[#FF3B30]'
                                                    }`}>
                                                    {item.oquvchi.ism?.charAt(0)}
                                                </div>
                                                {item.keldi ? (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#00C853] border border-white dark:border-zinc-950 rounded-full flex items-center justify-center shadow-sm">
                                                        <HiOutlineCheck className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                ) : (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#FF3B30] border border-white dark:border-zinc-950 rounded-full flex items-center justify-center shadow-sm">
                                                        <HiOutlineX className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className={`text-sm font-semibold transition-colors ${item.keldi ? 'text-gray-900 dark:text-white' : 'text-zinc-400 line-through decoration-red-500/20'}`}>
                                                    {item.oquvchi.ism}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                                                    <span className={item.keldi ? 'text-[#00C853]' : 'text-[#FF3B30]'}>
                                                        {item.keldi ? '✓' : '✗'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{item.oquvchi.telefon}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4">
                                            <div className="flex items-center p-0.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-850">
                                                <button
                                                    onClick={() => handleToggle(item.oquvchi._id, true)}
                                                    className={`p-2 rounded transition-all ${item.keldi
                                                        ? 'bg-white dark:bg-zinc-800 text-[#00C853] shadow-sm border border-zinc-200 dark:border-zinc-700'
                                                        : 'text-zinc-400 hover:text-[#00C853]'
                                                    }`}
                                                    title="Keldi"
                                                >
                                                    <HiOutlineCheck className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(item.oquvchi._id, false)}
                                                    className={`p-2 rounded transition-all ${!item.keldi
                                                        ? 'bg-white dark:bg-zinc-800 text-[#FF3B30] shadow-sm border border-zinc-200 dark:border-zinc-700'
                                                        : 'text-zinc-400 hover:text-[#FF3B30]'
                                                    }`}
                                                    title="Kelmadi"
                                                >
                                                    <HiOutlineX className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Comment Section */}
                            <div className="p-5 bg-zinc-50 dark:bg-zinc-900/40 border-t border-gray-100 dark:border-zinc-900/60">
                                <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                                    <HiOutlineInformationCircle className="w-4 h-4 text-zinc-400" />
                                    Dars bo'yicha izohlar
                                </label>
                                <textarea
                                    value={izoh}
                                    onChange={(e) => setIzoh(e.target.value)}
                                    onBlur={handleIzohBlur}
                                    className="w-full min-h-[80px] p-3 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-white placeholder-gray-400 focus:border-[#0066FF] transition-all outline-none resize-none text-xs"
                                    placeholder="Darsda o'tilgan mavzular, sababli darsga kelmaganlar yoki boshqa muhim eslatmalar..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-32 text-zinc-400">
                    <HiOutlineUsers className="w-12 h-12 mb-2" />
                    <h3 className="text-sm font-medium">Guruh tanlanmagan</h3>
                    <p className="text-xs text-zinc-500 mt-1 max-w-xs text-center leading-relaxed">
                        Davomat qilishni boshlash uchun yuqoridagi menyudan kerakli guruhni tanlang.
                    </p>
                </div>
            )}
        </div >
    );
};

export default Attendance;
