import { useState, useEffect } from 'react';
import { branchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineOfficeBuilding, HiOutlineLocationMarker,
    HiOutlinePhone, HiOutlineCheckCircle, HiOutlineMinusCircle
} from 'react-icons/hi';

const Branches = () => {
    const { user } = useAuth();
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);

    const [form, setForm] = useState({
        name: '',
        address: '',
        phone: ''
    });

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await branchAPI.getAll();
            setBranches(res.data.data || []);
        } catch (err) {
            toast.error("Filiallarni yuklashda xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setSelectedBranch(null);
        setForm({
            name: '',
            address: '',
            phone: ''
        });
        setModalOpen(true);
    };

    const openEditModal = (branch) => {
        setSelectedBranch(branch);
        setForm({
            name: branch.name,
            address: branch.address || '',
            phone: branch.phone || ''
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedBranch) {
                await branchAPI.update(selectedBranch._id, form);
                toast.success("Filial muvaffaqiyatli tahrirlandi");
            } else {
                await branchAPI.create(form);
                toast.success("Yangi filial yaratildi");
            }
            setModalOpen(false);
            fetchBranches();
            // Force reload to update dropdowns in Sidebar etc.
            setTimeout(() => {
                window.location.reload();
            }, 800);
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await branchAPI.toggleStatus(id);
            toast.success("Filial holati o'zgartirildi");
            fetchBranches();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">O'quv markaz filiallari</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1">Markaz filiallari ro'yxati va ularni boshqarish oynasi</p>
                </div>
                {(user?.role === 'superadmin' || user?.role === 'admin') && (
                    <button
                        onClick={openAddModal}
                        className="btn-primary flex items-center gap-2"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span>Filial qo'shish</span>
                    </button>
                )}
            </div>

            {/* Grid of Branches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-[#111111] p-12 text-center rounded-xl border border-gray-100 dark:border-zinc-900/60 text-zinc-400">
                        <HiOutlineOfficeBuilding className="w-12 h-12 mx-auto mb-3 opacity-60 text-blue-500" />
                        <p className="text-sm font-medium">Hozircha hech qanday filial qo'shilmagan.</p>
                    </div>
                ) : (
                    branches.map((branch) => {
                        const isBranchActive = branch.status === 'active';
                        return (
                            <div
                                key={branch._id}
                                className={`p-6 bg-white dark:bg-[#111111] rounded-xl border transition-all duration-300 relative group overflow-hidden ${
                                    isBranchActive
                                        ? 'border-gray-100 dark:border-zinc-900/60 hover:shadow-md hover:border-amber-100 dark:hover:border-amber-950/30'
                                        : 'border-red-100 dark:border-red-950/20 bg-red-50/10 dark:bg-red-950/5 opacity-75'
                                }`}
                            >
                                {/* Decorative Top Accent */}
                                <div className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
                                    isBranchActive ? 'bg-amber-500' : 'bg-red-500'
                                }`} />

                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                                            isBranchActive 
                                                ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400' 
                                                : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400'
                                        }`}>
                                            <HiOutlineOfficeBuilding className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">{branch.name}</h3>
                                            <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                isBranchActive
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-950/35 dark:text-red-400'
                                            }`}>
                                                {isBranchActive ? 'Faol' : 'Muzlatilgan'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6 text-sm text-zinc-650 dark:text-zinc-400 font-medium">
                                    <div className="flex items-start gap-2">
                                        <HiOutlineLocationMarker className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                                        <span>{branch.address || "Manzil ko'rsatilmagan"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <HiOutlinePhone className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                        <span>{branch.phone || "Telefon ko'rsatilmagan"}</span>
                                    </div>
                                </div>

                                {(user?.role === 'superadmin' || user?.role === 'admin') && (
                                    <div className="flex gap-2 pt-4 border-t border-gray-150 dark:border-zinc-900/60">
                                        <button
                                            onClick={() => openEditModal(branch)}
                                            className="flex-1 py-2 px-3 rounded-lg text-xs font-semibold bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
                                        >
                                            <HiOutlinePencil className="w-3.5 h-3.5" />
                                            Tahrirlash
                                        </button>
                                        <button
                                            onClick={() => handleToggleStatus(branch._id)}
                                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 ${
                                                isBranchActive
                                                    ? 'bg-red-50 hover:bg-red-100/85 dark:bg-red-950/15 dark:hover:bg-red-950/25 border-red-100 dark:border-red-950/30 text-red-600 dark:text-red-400'
                                                    : 'bg-emerald-50 hover:bg-emerald-100/85 dark:bg-emerald-950/15 dark:hover:bg-emerald-950/25 border-emerald-100 dark:border-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                                            }`}
                                        >
                                            {isBranchActive ? (
                                                <>
                                                    <HiOutlineMinusCircle className="w-3.5 h-3.5" />
                                                    Muzlatish
                                                </>
                                            ) : (
                                                <>
                                                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                                                    Faollashtirish
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Edit / Add Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={selectedBranch ? "Filialni tahrirlash" : "Yangi filial qo'shish"}
                size="md"
            >
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Filial nomi *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-55 dark:bg-zinc-900 border border-gray-250 dark:border-zinc-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-sm font-semibold text-gray-800 dark:text-white transition-all"
                                placeholder="Masalan: Chilonzor filiali"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Manzili</label>
                            <input
                                type="text"
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-55 dark:bg-zinc-900 border border-gray-250 dark:border-zinc-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-sm font-semibold text-gray-800 dark:text-white transition-all"
                                placeholder="Masalan: Chilonzor metro, 5-uy"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Telefon raqami</label>
                            <input
                                type="text"
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-55 dark:bg-zinc-900 border border-gray-250 dark:border-zinc-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 outline-none text-sm font-semibold text-gray-800 dark:text-white transition-all"
                                placeholder="Masalan: +998901234567"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Bekor qilish</button>
                        <button type="submit" className="btn-primary">
                            {selectedBranch ? 'Saqlash' : "Yaratish"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Branches;
