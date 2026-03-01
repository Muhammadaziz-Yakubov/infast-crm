import { useState, useEffect } from 'react';
import { groupAPI, courseAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
    HiOutlineAcademicCap, HiOutlineClock, HiOutlineUserGroup,
    HiOutlineCalendar, HiOutlineIdentification, HiOutlineChat
} from 'react-icons/hi';
import { FaTelegramPlane } from 'react-icons/fa';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        nomi: '', kurs: '', oqituvchi: '', jadval: { kunlar: '', vaqt: '' }, holati: 'faol', maxOquvchilar: 20, telegramChatId: ''
    });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [groupsRes, coursesRes] = await Promise.all([
                groupAPI.getAll(),
                courseAPI.getAll()
            ]);
            setGroups(groupsRes.data.data);
            setCourses(coursesRes.data.data);
        } catch (err) {
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const fetchGroups = async () => {
        try {
            const res = await groupAPI.getAll();
            setGroups(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const openAddModal = () => {
        setSelectedGroup(null);
        setForm({ nomi: '', kurs: '', oqituvchi: '', jadval: { kunlar: '', vaqt: '' }, holati: 'faol', maxOquvchilar: 20, telegramChatId: '' });
        setModalOpen(true);
    };

    const openEditModal = (group) => {
        setSelectedGroup(group);
        setForm({
            nomi: group.nomi,
            kurs: group.kurs?._id || group.kurs || '',
            oqituvchi: group.oqituvchi || '',
            jadval: {
                kunlar: group.jadval?.kunlar || '',
                vaqt: group.jadval?.vaqt || ''
            },
            holati: group.holati || 'faol',
            maxOquvchilar: group.maxOquvchilar || 20,
            telegramChatId: group.telegramChatId || ''
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedGroup) {
                await groupAPI.update(selectedGroup._id, form);
                toast.success("Guruh yangilandi ✨");
            } else {
                await groupAPI.create(form);
                toast.success("Guruh qo'shildi 🚀");
            }
            setModalOpen(false);
            fetchGroups();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const handleDelete = async () => {
        try {
            await groupAPI.delete(deleteId);
            toast.success("Guruh o'chirildi 👋");
            setConfirmOpen(false);
            fetchGroups();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const handleTelegramReport = async (groupId) => {
        try {
            toast.loading("Hisobot yuborilmoqda...", { id: 'tg-report' });
            await groupAPI.telegramReport(groupId);
            toast.success("Hisobot Telegramga yuborildi 🤖", { id: 'tg-report' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik', { id: 'tg-report' });
        }
    };

    const filteredGroups = groups.filter(g =>
        g.nomi?.toLowerCase().includes(search.toLowerCase()) ||
        g.oqituvchi?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase">
                        O'quv <span className="text-amber-500">Guruhlari</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Barcha faol va nofaol guruhlar statistikasi</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gray-900 dark:bg-amber-600 
                        text-white font-black text-sm shadow-xl shadow-amber-500/20 transition-all hover:-translate-y-1 active:scale-95"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    <span>Yangi guruh</span>
                </button>
            </div>

            {/* Premium Search */}
            <div className="relative group">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-12 py-5 rounded-3xl bg-white dark:bg-dark-800 border-2 border-transparent 
                        focus:border-amber-500 shadow-sm focus:shadow-xl outline-none transition-all font-bold"
                    placeholder="Guruh nomi yoki o'qituvchi bo'yicha qidirish..."
                />
                <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 w-6 h-6" />
            </div>

            {/* Modern Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGroups.length === 0 ? (
                    <div className="col-span-full py-32 text-center opacity-30">
                        <HiOutlineAcademicCap className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-2xl font-black">Guruhlar topilmadi</h3>
                    </div>
                ) : (
                    filteredGroups.map((g, i) => (
                        <div
                            key={g._id}
                            className="group bg-white dark:bg-dark-800 rounded-[2.5rem] p-7 border border-gray-100 dark:border-white/5 
                                shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 
                                            flex items-center justify-center text-white shadow-lg shadow-amber-500/20 transform transition-transform group-hover:rotate-6">
                                            <HiOutlineAcademicCap className="w-8 h-8" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-gray-900 dark:text-white truncate text-lg uppercase italic tracking-tight">{g.nomi}</h3>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{g.kurs?.nomi || "Yo'nalishsiz"}</p>
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${g.holati === 'faol' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                                        }`}>
                                        {g.holati}
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center border border-gray-100 dark:border-white/5">
                                            <HiOutlineIdentification className="w-4 h-4 text-amber-500" />
                                        </div>
                                        <span>Master: <strong className="text-gray-900 dark:text-white">{g.oqituvchi || 'Belgilanmagan'}</strong></span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm font-bold text-gray-600 dark:text-gray-400">
                                        <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center border border-gray-100 dark:border-white/5">
                                            <HiOutlineClock className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <span>{g.jadval?.vaqt || 'Vaqt belgilanmagan'}</span>
                                    </div>
                                    {g.jadval?.kunlar && (
                                        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50 dark:border-dark-700/50 pt-4">
                                            {g.jadval.kunlar.split(',').map((kun, idx) => (
                                                <span key={idx} className="px-3 py-1 rounded-lg bg-gray-50 dark:bg-dark-900 text-[10px] font-black text-gray-500 uppercase tracking-widest border border-gray-100 dark:border-white/5">
                                                    {kun.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50 dark:border-dark-700/50">
                                    <div className="flex items-center gap-2">
                                        <HiOutlineUserGroup className="w-4 h-4 text-primary-500" />
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                            <span className="text-gray-900 dark:text-white">{g.oquvchilarSoni || 0}</span>
                                            <span className="mx-1">/</span>
                                            {g.maxOquvchilar || 20}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        {g.telegramChatId && (
                                            <button onClick={() => handleTelegramReport(g._id)}
                                                className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Telegramga hisobot yuborish">
                                                <FaTelegramPlane className="w-4.5 h-4.5" />
                                            </button>
                                        )}
                                        <button onClick={() => openEditModal(g)}
                                            className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm">
                                            <HiOutlinePencil className="w-4.5 h-4.5" />
                                        </button>
                                        <button onClick={() => { setDeleteId(g._id); setConfirmOpen(true); }}
                                            className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-900 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                            <HiOutlineTrash className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity bg-amber-500" />
                        </div>
                    ))
                )}
            </div>

            {/* Modal - Professional Upgrade */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedGroup ? "Guruh ma'lumotlari" : "Yangi guruh ochish"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Guruh nomi *</label>
                                <input type="text" value={form.nomi} onChange={e => setForm({ ...form, nomi: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-500 outline-none transition-all font-bold" placeholder="Masalan: Frontend Advanced" required />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Kurs tanlovi *</label>
                                <select value={form.kurs} onChange={e => setForm({ ...form, kurs: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-500 outline-none transition-all font-bold cursor-pointer" required>
                                    <option value="">Kursni tanlang</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.nomi}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">O'qituvchi nomi</label>
                                <input type="text" value={form.oqituvchi} onChange={e => setForm({ ...form, oqituvchi: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-500 outline-none transition-all font-bold" placeholder="O'qituvchi F.I.O" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Sig'im (O'quvchi soni)</label>
                                <input type="number" min="1" value={form.maxOquvchilar}
                                    onChange={e => setForm({ ...form, maxOquvchilar: parseInt(e.target.value) || 20 })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-500 outline-none transition-all font-black" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Dars kunlari (Du, Chor, Jum...)</label>
                                <input type="text" value={form.jadval.kunlar}
                                    onChange={e => setForm({ ...form, jadval: { ...form.jadval, kunlar: e.target.value } })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-500 outline-none transition-all font-bold" placeholder="Masalan: Du, Chor, Ju" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Dars vaqti (HH:MM - HH:MM)</label>
                                <input type="text" value={form.jadval.vaqt}
                                    onChange={e => setForm({ ...form, jadval: { ...form.jadval, vaqt: e.target.value } })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-500 outline-none transition-all font-bold" placeholder="Masalan: 18:30 - 20:30" />
                            </div>
                        </div>
                    </div>
                    {selectedGroup && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Telegram Chat ID</label>
                                <input type="text" value={form.telegramChatId} onChange={e => setForm({ ...form, telegramChatId: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-500 outline-none transition-all font-bold" placeholder="Masalan: -100123456789" />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Holati</label>
                                <select value={form.holati} onChange={e => setForm({ ...form, holati: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-500 outline-none transition-all font-bold cursor-pointer">
                                    <option value="faol">🚀 Faol (O'qish davom etmoqda)</option>
                                    <option value="nofaol">🛑 Nofaol (To'xtatilgan)</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {!selectedGroup && (
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Telegram Chat ID</label>
                            <input type="text" value={form.telegramChatId} onChange={e => setForm({ ...form, telegramChatId: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-amber-500 outline-none transition-all font-bold" placeholder="Masalan: -100123456789" />
                        </div>
                    )}
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100 dark:bg-dark-800 transition-all active:scale-95">Bekor qilish</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl font-black text-white bg-amber-600 shadow-xl shadow-amber-500/20 active:scale-95 transition-all">
                            {selectedGroup ? "O'zgarishlarni saqlash" : "Guruhni ochish"}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Guruhni o'chirish"
                message="Haqiqatan ham bu guruhni o'chirmoqchimisiz? Guruh tarkibidagi o'quvchilar guruhsiz qolishi mumkin."
            />
        </div>
    );
};

export default Groups;
