import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
    HiOutlineUsers, HiOutlineShieldCheck, HiOutlineUser, HiOutlineKey
} from 'react-icons/hi';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        username: '',
        fullName: '',
        password: '',
        role: 'admin'
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await userAPI.getAll();
            setUsers(res.data.data);
        } catch (err) {
            toast.error("Foydalanuvchilarni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setSelectedUser(null);
        setForm({
            username: '',
            fullName: '',
            password: '',
            role: 'admin' // default value as requested
        });
        setModalOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setForm({
            username: user.username,
            fullName: user.fullName || '',
            password: '', // empty by default (only filled if updating)
            role: user.role || 'admin'
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedUser) {
                // If password is not provided, remove it from update payload
                const updateData = { ...form };
                if (!updateData.password) {
                    delete updateData.password;
                }
                await userAPI.update(selectedUser._id, updateData);
                toast.success("Foydalanuvchi ma'lumotlari yangilandi");
            } else {
                if (!form.password || form.password.length < 6) {
                    toast.error("Parol kamida 6 ta belgidan iborat bo'lishi shart");
                    return;
                }
                await userAPI.create(form);
                toast.success("Yangi foydalanuvchi qo'shildi");
            }
            setModalOpen(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const handleDelete = async () => {
        try {
            await userAPI.delete(deleteId);
            toast.success("Foydalanuvchi o'chirildi");
            setConfirmOpen(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case 'superadmin':
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/35 dark:text-purple-300 border-purple-200 dark:border-purple-800/40';
            case 'admin':
                return 'bg-[#0066FF]/10 text-[#0066FF] dark:bg-[#0066FF]/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/40';
            case 'teacher':
                return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40';
            case 'accountant':
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/35 dark:text-amber-300 border-amber-200 dark:border-amber-800/40';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300 border-gray-200 dark:border-zinc-700';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'superadmin': return 'Super Admin';
            case 'admin': return 'Admin';
            case 'teacher': return 'O\'qituvchi';
            case 'accountant': return 'Hisobchi';
            default: return role;
        }
    };

    const filteredUsers = users.filter(u =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.username?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Tizim foydalanuvchilari</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1">CRM tizimidan foydalanuvchi xodimlar va administratorlar ro'yxati</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn-primary flex items-center gap-2"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span>Foydalanuvchi qo'shish</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white"
                    placeholder="Ism yoki foydalanuvchi nomini qidiring..."
                />
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            </div>

            {/* Table / Grid */}
            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-100 dark:border-zinc-900/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-zinc-900 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-gray-50/50 dark:bg-zinc-900/30">
                                <th className="px-6 py-4">Foydalanuvchi</th>
                                <th className="px-6 py-4">Foydalanuvchi nomi</th>
                                <th className="px-6 py-4">Roli</th>
                                <th className="px-6 py-4">Yaratilgan sana</th>
                                <th className="px-6 py-4 text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-zinc-900/60">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-zinc-400">
                                        <HiOutlineUsers className="w-10 h-10 mx-auto mb-3 opacity-60" />
                                        <p className="text-sm">Foydalanuvchilar topilmadi</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-semibold text-[#0066FF]">
                                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{user.fullName || 'Foydalanuvchi'}</h4>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-300 font-medium">
                                            @{user.username}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${getRoleBadgeStyle(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                                            {new Date(user.createdAt).toLocaleDateString('uz-UZ', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#0066FF] transition-colors"
                                                    title="Tahrirlash"
                                                >
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setDeleteId(user._id); setConfirmOpen(true); }}
                                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#FF3B30] transition-colors"
                                                    title="O'chirish"
                                                >
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedUser ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi qo'shish"} size="md">
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Foydalanuvchi to'liq ismi *</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={form.fullName}
                                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold text-gray-800 dark:text-white"
                                    placeholder="Masalan: Sardor Rahimov"
                                    required
                                />
                                <HiOutlineUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4.5 h-4.5" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Foydalanuvchi nomi (Username) *</label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-semibold text-sm">@</span>
                                <input
                                    type="text"
                                    value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                    className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold text-gray-800 dark:text-white"
                                    placeholder="sardor_r"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                                {selectedUser ? "Yangi parol (o'zgartirmaslik uchun bo'sh qoldiring)" : "Parol *"}
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold text-gray-800 dark:text-white"
                                    placeholder={selectedUser ? "••••••••" : "Kamida 6 ta belgi"}
                                    required={!selectedUser}
                                />
                                <HiOutlineKey className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4.5 h-4.5" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tizimdagi roli *</label>
                            <div className="relative">
                                <select
                                    value={form.role}
                                    onChange={e => setForm({ ...form, role: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold text-gray-800 dark:text-white appearance-none"
                                    required
                                >
                                    <option value="admin">Admin</option>
                                    <option value="teacher">O'qituvchi</option>
                                    <option value="accountant">Hisobchi</option>
                                    <option value="superadmin">Super Admin</option>
                                </select>
                                <HiOutlineShieldCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4.5 h-4.5 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Bekor qilish</button>
                        <button type="submit" className="btn-primary">
                            {selectedUser ? 'Saqlash' : "Yaratish"}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Foydalanuvchini o'chirish"
                message="Haqiqatan ham ushbu foydalanuvchini o'chirib tashlamoqchimisiz? Ushbu amal ortga qaytarilmaydi."
            />
        </div>
    );
};

export default Users;
