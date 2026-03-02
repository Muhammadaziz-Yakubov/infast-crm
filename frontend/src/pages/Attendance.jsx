import { useState, useEffect } from 'react';
import { groupAPI, attendanceAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineCheck, HiOutlineX, HiOutlineUsers,
    HiOutlineCalendar, HiOutlineSave, HiOutlineInformationCircle,
    HiOutlineCheckCircle, HiOutlineClock
} from 'react-icons/hi';

const Attendance = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchingData, setFetchingData] = useState(false);
    const [saving, setSaving] = useState(false);
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
                item.oquvchi._id === studentId ? { ...item, keldi: status, ball: status ? (item.ball || 0) : 0 } : item
            )
        }));
    };

    const handleBallChange = (studentId, ball) => {
        setAttendanceData(prev => ({
            ...prev,
            oquvchilar: prev.oquvchilar.map(item =>
                item.oquvchi._id === studentId ? { ...item, ball: parseInt(ball) || 0 } : item
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
            toast.success("Davomat muvaffaqiyatli saqlandi! ✨");
            fetchAttendance();
        } catch (err) {
            toast.error(err.response?.data?.message || "Saqlashda xatolik");
        } finally {
            setSaving(false);
        }
    };

    const presentCount = attendanceData ? attendanceData.oquvchilar.filter(i => i.keldi).length : 0;
    const totalCount = attendanceData ? attendanceData.oquvchilar.length : 0;
    const percentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    if (loading && groups.length === 0) return <LoadingSpinner />;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                        Davomat <span className="text-primary-500">Tizimi</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">O'quvchilarning darslardagi ishtirokini nazorat qiling</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative group">
                        <select
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                            className="appearance-none bg-white dark:bg-dark-800 border-2 border-gray-100 dark:border-dark-700 
                                rounded-2xl px-12 py-3.5 pr-10 text-gray-800 dark:text-white font-bold text-sm
                                shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 
                                transition-all cursor-pointer hover:border-gray-200 dark:hover:border-dark-600"
                        >
                            <option value="">Guruh tanlang...</option>
                            {groups.map(g => (
                                <option key={g._id} value={g._id}>{g.nomi}</option>
                            ))}
                        </select>
                        <HiOutlineUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 w-5 h-5 transition-transform group-hover:scale-110" />
                    </div>

                    <div className="relative group">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-white dark:bg-dark-800 border-2 border-gray-100 dark:border-dark-700 
                                rounded-2xl px-12 py-3 text-gray-800 dark:text-white font-bold text-sm
                                shadow-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 
                                transition-all cursor-pointer hover:border-gray-200 dark:hover:border-dark-600"
                        />
                        <HiOutlineCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 w-5 h-5 transition-transform group-hover:scale-110" />
                    </div>
                </div>
            </div>

            {fetchingData ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <LoadingSpinner />
                    <p className="text-gray-400 font-medium italic">Ma'lumotlar yuklanmoqda...</p>
                </div>
            ) : attendanceData ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Sidebar Stats & Controls */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        {/* Status Card */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-purple-700 rounded-3xl p-8 text-white shadow-2xl shadow-primary-500/20">
                            <div className="relative z-10">
                                <p className="text-primary-100 text-sm font-bold uppercase tracking-wider mb-2">Davomat Holati</p>
                                <div className="flex items-end gap-3 mb-6">
                                    <h2 className="text-6xl font-black">{percentage}%</h2>
                                    <p className="text-primary-100 font-medium pb-2">Ishtirok</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-primary-100">Kelgan o'quvchilar:</span>
                                        <span className="font-bold">{presentCount}</span>
                                    </div>
                                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-white h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-primary-100">Jami o'quvchilar:</span>
                                        <span className="font-bold">{totalCount}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Abstract backgrounds */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-3xl" />
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-gray-100 dark:border-dark-700 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest pl-1">Tezkor amallar</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleMarkAll(true)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/10 
                                        text-emerald-600 dark:text-emerald-400 font-bold text-sm border-2 border-emerald-500/10 
                                        hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all active:scale-95"
                                >
                                    <HiOutlineCheckCircle className="w-5 h-5 text-emerald-500" />
                                    Barchasi
                                </button>
                                <button
                                    onClick={() => handleMarkAll(false)}
                                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-50 dark:bg-red-900/10 
                                        text-red-600 dark:text-red-400 font-bold text-sm border-2 border-red-500/10 
                                        hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-95"
                                >
                                    <HiOutlineX className="w-5 h-5 text-red-500" />
                                    Hech kim
                                </button>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="group relative w-full py-5 px-8 rounded-3xl bg-gray-900 dark:bg-primary-600 text-white 
                                font-extrabold shadow-xl shadow-primary-500/20 overflow-hidden transition-all
                                hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
                        >
                            <div className="relative z-10 flex items-center justify-center gap-3">
                                {saving ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <HiOutlineSave className="w-6 h-6 transition-transform group-hover:scale-110" />
                                )}
                                <span className="text-lg">{saving ? 'Saqlanmoqda...' : 'Saqlash va Tasdiqlash'}</span>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>
                    </div>

                    {/* Main List Area */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-dark-700 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50 dark:border-dark-700 flex items-center justify-between bg-gray-50/50 dark:bg-dark-800/50">
                                <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <div className="w-2 h-6 bg-primary-500 rounded-full" />
                                    O'quvchilar Ro'yxati
                                </h3>
                                <span className="text-xs font-bold text-gray-400 px-3 py-1 bg-gray-100 dark:bg-dark-700 rounded-full">
                                    {totalCount} nafar
                                </span>
                            </div>

                            <div className="divide-y divide-gray-50 dark:divide-dark-700/50">
                                {attendanceData.oquvchilar.map((item) => (
                                    <div
                                        key={item.oquvchi._id}
                                        className={`group flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-dark-700/40 transition-colors ${!item.keldi ? 'bg-red-50/5 dark:bg-red-900/5' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Avatar */}
                                            <div className="relative">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary-500/10 transition-transform group-hover:scale-105 ${item.keldi
                                                    ? 'bg-gradient-to-br from-primary-400 to-primary-600'
                                                    : 'bg-gradient-to-br from-gray-400 to-gray-500 grayscale'
                                                    }`}>
                                                    {item.oquvchi.ism?.charAt(0)}
                                                </div>
                                                {item.keldi && (
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-dark-800 rounded-full flex items-center justify-center shadow-lg">
                                                        <HiOutlineCheck className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-0.5">
                                                <h4 className={`font-bold transition-colors ${item.keldi ? 'text-gray-800 dark:text-white' : 'text-gray-400 line-through decoration-red-500/30'
                                                    }`}>
                                                    {item.oquvchi.ism}
                                                </h4>
                                                <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <HiOutlineClock className="w-3.5 h-3.5" />
                                                        {item.keldi ? 'Kelgan' : 'Kelmadi'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{item.oquvchi.telefon}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Toggle and Ball Controls */}
                                        <div className="flex flex-col md:flex-row items-center gap-3">
                                            {item.keldi && (
                                                <div className="flex items-center gap-2 bg-gray-50 dark:bg-dark-900 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-white/5">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Faollik:</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        value={item.ball || 0}
                                                        onChange={(e) => handleBallChange(item.oquvchi._id, e.target.value)}
                                                        className="w-12 bg-transparent text-center font-black text-sm text-primary-500 focus:outline-none"
                                                    />
                                                </div>
                                            )}
                                            <div className="flex items-center p-1 bg-gray-100/80 dark:bg-dark-900/60 rounded-2xl gap-1">
                                                <button
                                                    onClick={() => handleToggle(item.oquvchi._id, true)}
                                                    className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all ${item.keldi
                                                        ? 'bg-white dark:bg-dark-800 text-emerald-600 dark:text-emerald-400 shadow-sm scale-105 ring-2 ring-emerald-500/20'
                                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                                                        }`}
                                                >
                                                    KELDI
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(item.oquvchi._id, false)}
                                                    className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-black transition-all ${!item.keldi
                                                        ? 'bg-white dark:bg-dark-800 text-red-600 dark:text-red-400 shadow-sm scale-105 ring-2 ring-red-500/20'
                                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
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
                            <div className="p-8 bg-gray-50/50 dark:bg-dark-800 border-t border-gray-100 dark:border-dark-700">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-500 mb-3 ml-1 uppercase tracking-widest">
                                    <HiOutlineInformationCircle className="w-5 h-5 text-gray-400" />
                                    Dars bo'yicha izohlar
                                </label>
                                <textarea
                                    value={izoh}
                                    onChange={(e) => setIzoh(e.target.value)}
                                    className="w-full min-h-[120px] p-5 rounded-3xl bg-white dark:bg-dark-900 border-2 border-gray-100 
                                        dark:border-dark-700 text-gray-800 dark:text-white placeholder-gray-400
                                        focus:border-primary-500 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none resize-none shadow-inner"
                                    placeholder="Darsda o'tilgan mavzular, sababli darsga kelmaganlar yoki boshqa muhim eslatmalar..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-40 space-y-6">
                    <div className="w-32 h-32 bg-gray-50 dark:bg-dark-800 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden group">
                        <HiOutlineUsers className="w-16 h-16 text-gray-200 dark:text-dark-700 transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-100/50 dark:from-dark-700/50 to-transparent" />
                    </div>
                    <div className="text-center space-y-2 max-w-sm px-6">
                        <h3 className="text-xl font-extrabold text-gray-600 dark:text-gray-400">Guruh tanlanmagan</h3>
                        <p className="text-gray-400 dark:text-gray-500 font-medium leading-relaxed">
                            Davomat qilishni boshlash uchun yuqoridagi menyudan kerakli guruhni tanlang.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
