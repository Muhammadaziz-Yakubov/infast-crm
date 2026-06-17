import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { groupAPI, courseAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
    HiOutlineAcademicCap, HiOutlineClock, HiOutlineUserGroup,
    HiOutlineIdentification, HiOutlineEye
} from 'react-icons/hi';
import { FaTelegramPlane } from 'react-icons/fa';

const Groups = () => {
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        nomi: '', kurs: '', oqituvchi: '', jadval: { kunlar: '', vaqt: '' }, holati: 'faol', maxOquvchilar: 20, telegramChatId: '', curriculumKalit: 'frontend'
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
        setForm({ nomi: '', kurs: '', oqituvchi: '', jadval: { kunlar: '', vaqt: '' }, holati: 'faol', maxOquvchilar: 20, telegramChatId: '', curriculumKalit: 'frontend' });
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
            telegramChatId: group.telegramChatId || '',
            curriculumKalit: group.curriculumKalit || 'frontend'
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedGroup) {
                await groupAPI.update(selectedGroup._id, form);
                toast.success("Guruh yangilandi");
            } else {
                await groupAPI.create(form);
                toast.success("Guruh qo'shildi");
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
            toast.success("Guruh o'chirildi");
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
            toast.success("Hisobot Telegramga yuborildi", { id: 'tg-report' });
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
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">O'quv guruhlari</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1">Barcha faol va nofaol guruhlar ro'yxati</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn-primary flex items-center gap-2"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span>Yangi guruh</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white"
                    placeholder="Guruh nomi yoki o'qituvchi bo'yicha qidirish..."
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-zinc-400">
                        <HiOutlineAcademicCap className="w-12 h-12 mx-auto mb-2" />
                        <h3 className="text-sm font-medium">Guruhlar topilmadi</h3>
                    </div>
                ) : (
                    filteredGroups.map((g) => (
                        <div
                            key={g._id}
                            className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-100 dark:border-zinc-900/60 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[#0066FF]">
                                            <HiOutlineAcademicCap className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{g.nomi}</h3>
                                            <p className="text-[11px] text-zinc-400 truncate">{g.kurs?.nomi || "Yo'nalishsiz"}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${g.holati === 'faol'
                                        ? 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20'
                                        : 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20'
                                    }`}>
                                        {g.holati === 'faol' ? 'Faol' : 'Nofaol'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                        <span>O'qituvchi:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{g.oqituvchi || 'Belgilanmagan'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                        <span>Dars vaqti:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{g.jadval?.vaqt || 'Vaqt belgilanmagan'}</span>
                                    </div>
                                    {g.jadval?.kunlar && (
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {g.jadval.kunlar.split(',').map((kun, idx) => (
                                                <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800">
                                                    {kun.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-900/40">
                                <div className="flex items-center gap-1.5">
                                    <HiOutlineUserGroup className="w-4 h-4 text-zinc-400" />
                                    <span className="text-xs text-zinc-500">
                                        <span className="font-semibold text-gray-900 dark:text-white">{g.oquvchilarSoni || 0}</span> / {g.maxOquvchilar || 20}
                                    </span>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => navigate(`/groups/${g._id}`)}
                                        className="p-1.5 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 text-[#0066FF] transition-colors"
                                        title="Guruhni ko'rish">
                                        <HiOutlineEye className="w-4.5 h-4.5" />
                                    </button>
                                    {g.telegramChatId && (
                                        <button onClick={() => handleTelegramReport(g._id)}
                                            className="p-1.5 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 text-[#0066FF] transition-colors"
                                            title="Telegram hisobot">
                                            <FaTelegramPlane className="w-4.5 h-4.5" />
                                        </button>
                                    )}
                                    <button onClick={() => openEditModal(g)}
                                        className="p-1.5 rounded hover:bg-gray-50 dark:hover:bg-zinc-800 text-zinc-500 transition-colors">
                                        <HiOutlinePencil className="w-4.5 h-4.5" />
                                    </button>
                                    <button onClick={() => { setDeleteId(g._id); setConfirmOpen(true); }}
                                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-[#FF3B30] transition-colors">
                                        <HiOutlineTrash className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedGroup ? "Tahrirlash" : "Yangi guruh"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Guruh nomi *</label>
                                <input type="text" value={form.nomi} onChange={e => setForm({ ...form, nomi: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium" placeholder="Guruh nomi" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Kurs tanlovi *</label>
                                <select value={form.kurs} onChange={e => setForm({ ...form, kurs: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer" required>
                                    <option value="">Kursni tanlang</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.nomi}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Fan yo'nalishi *</label>
                                <select value={form.curriculumKalit} onChange={e => setForm({ ...form, curriculumKalit: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer" required>
                                    <option value="frontend">Frontend Development</option>
                                    <option value="backend">Backend Development (Node.js)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">O'qituvchi nomi</label>
                                <input type="text" value={form.oqituvchi} onChange={e => setForm({ ...form, oqituvchi: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium" placeholder="F.I.O" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Sig'im (O'quvchi soni)</label>
                                <input type="number" min="1" value={form.maxOquvchilar}
                                    onChange={e => setForm({ ...form, maxOquvchilar: parseInt(e.target.value) || 20 })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Dars kunlari (Du, Chor, Jum...)</label>
                                <input type="text" value={form.jadval.kunlar}
                                    onChange={e => setForm({ ...form, jadval: { ...form.jadval, kunlar: e.target.value } })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium" placeholder="Du, Chor, Ju" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Dars vaqti (HH:MM - HH:MM)</label>
                                <input type="text" value={form.jadval.vaqt}
                                    onChange={e => setForm({ ...form, jadval: { ...form.jadval, vaqt: e.target.value } })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium" placeholder="18:30 - 20:30" />
                            </div>
                        </div>
                    </div>
                    {selectedGroup && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Telegram Chat ID</label>
                                <input type="text" value={form.telegramChatId} onChange={e => setForm({ ...form, telegramChatId: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium" placeholder="-100..." />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Holati</label>
                                <select value={form.holati} onChange={e => setForm({ ...form, holati: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer">
                                    <option value="faol">Faol</option>
                                    <option value="nofaol">Nofaol</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {!selectedGroup && (
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Telegram Chat ID</label>
                            <input type="text" value={form.telegramChatId} onChange={e => setForm({ ...form, telegramChatId: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium" placeholder="-100..." />
                        </div>
                    )}
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Bekor qilish</button>
                        <button type="submit" className="btn-primary">
                            {selectedGroup ? "Saqlash" : "Guruhni ochish"}
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
