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

    const handleToggle = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            oquvchilar: prev.oquvchilar.map(item =>
                item.oquvchi._id === studentId ? { ...item, keldi: status, ball: status ? (item.ball || 100) : 0 } : item
            )
        }));
    };

    const handleBallChange = (studentId, ball) => {
        const value = Math.min(100, Math.max(0, Number(ball)));
        setAttendanceData(prev => ({
            ...prev,
            oquvchilar: prev.oquvchilar.map(item =>
                item.oquvchi._id === studentId ? { ...item, ball: value } : item
            )
        }));
    };

    const handleMarkAll = (status) => {
        setAttendanceData(prev => ({
            ...prev,
            oquvchilar: prev.oquvchilar.map(item => ({ ...item, keldi: status }))
        }));
        toast.success(status ? "Barcha o'quvchilar 'Keldi' deb belgilandi" : "Barcha o'quvchilar 'Kelmadi' deb belgilandi");
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                guruh: selectedGroup,
                sana: selectedDate,
                oquvchilar: attendanceData.oquvchilar.map(item => ({
                    oquvchi: item.oquvchi._id,
                    keldi: item.keldi,
                    ball: item.ball || 0
                })),
                izoh
            };
            await attendanceAPI.save(payload);
            toast.success("Davomat saqlandi");
            fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || "Saqlashda xatolik");
        } finally {
            setSaving(false);
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

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-3"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <HiOutlineSave className="w-5 h-5" />
                            )}
                            <span className="text-sm font-semibold">{saving ? 'Saqlanmoqda...' : 'Saqlash va Tasdiqlash'}</span>
                        </button>

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
                                                    ? 'bg-[#0066FF] border-[#0066FF]/20'
                                                    : 'bg-zinc-400 border-zinc-500 grayscale'
                                                    }`}>
                                                    {item.oquvchi.ism?.charAt(0)}
                                                </div>
                                                {item.keldi && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#00C853] border border-white dark:border-zinc-950 rounded-full flex items-center justify-center shadow-sm">
                                                        <HiOutlineCheck className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className={`text-sm font-semibold transition-colors ${item.keldi ? 'text-gray-900 dark:text-white' : 'text-zinc-400 line-through decoration-red-500/20'}`}>
                                                    {item.oquvchi.ism}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                                                    <span>{item.keldi ? 'Kelgan' : 'Kelmadi'}</span>
                                                    <span>•</span>
                                                    <span>{item.oquvchi.telefon}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4">
                                            {item.keldi && (
                                                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-850">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[9px] text-zinc-400 font-medium">BALL</span>
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white leading-none mt-0.5">{item.ball || 0}</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={item.ball || ''}
                                                        onChange={(e) => handleBallChange(item.oquvchi._id, e.target.value)}
                                                        placeholder="0"
                                                        className="w-12 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 outline-none rounded px-1.5 py-1 text-center font-semibold text-xs focus:border-[#0066FF] transition-all"
                                                        max="100"
                                                        min="0"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center p-0.5 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-850">
                                                <button
                                                    onClick={() => handleToggle(item.oquvchi._id, true)}
                                                    className={`px-3 py-1.5 rounded text-[10px] font-semibold transition-all ${item.keldi
                                                        ? 'bg-white dark:bg-zinc-800 text-[#00C853] shadow-sm border border-zinc-200 dark:border-zinc-700'
                                                        : 'text-zinc-400 hover:text-zinc-600'
                                                    }`}
                                                >
                                                    KELDI
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(item.oquvchi._id, false)}
                                                    className={`px-3 py-1.5 rounded text-[10px] font-semibold transition-all ${!item.keldi
                                                        ? 'bg-white dark:bg-zinc-800 text-[#FF3B30] shadow-sm border border-zinc-200 dark:border-zinc-700'
                                                        : 'text-zinc-400 hover:text-zinc-600'
                                                    }`}
                                                >
                                                    KELMADI
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
