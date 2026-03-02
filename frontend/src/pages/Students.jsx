import { useState, useEffect } from 'react';
import { studentAPI, courseAPI, groupAPI, paymentAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
    HiOutlineCash, HiOutlineFilter, HiOutlinePhone, HiOutlineCalendar,
    HiOutlineBadgeCheck, HiOutlineUserCircle, HiOutlineX, HiOutlineCheckCircle
} from 'react-icons/hi';

const Students = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');
    const [filterHolat, setFilterHolat] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkPayModalOpen, setBulkPayModalOpen] = useState(false);
    const [bulkPayForm, setBulkPayForm] = useState({ tolovTuri: 'naqd', izoh: '' });
    const [bulkLoading, setBulkLoading] = useState(false);
    const [filterGuruh, setFilterGuruh] = useState('');

    const [form, setForm] = useState({
        ism: '', telefon: '', kurs: '', guruh: '', tolovKuni: 1, eslatmalar: '', shuOyTolagan: '', username: '', password: ''
    });

    const [payForm, setPayForm] = useState({ summa: '', tolovTuri: 'naqd', izoh: '' });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        try {
            const [studentsRes, coursesRes, groupsRes] = await Promise.all([
                studentAPI.getAll({ search, holat: filterHolat, guruh: filterGuruh }),
                courseAPI.getAll(),
                groupAPI.getAll()
            ]);
            setStudents(studentsRes.data.data);
            setCourses(coursesRes.data.data);
            setGroups(groupsRes.data.data);
        } catch (err) {
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchStudents();
        }, 300);
        return () => clearTimeout(timer);
    }, [search, filterHolat, filterGuruh]);

    const fetchStudents = async () => {
        try {
            const res = await studentAPI.getAll({ search, holat: filterHolat, guruh: filterGuruh });
            setStudents(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const openAddModal = () => {
        setSelectedStudent(null);
        setForm({ ism: '', telefon: '', kurs: '', guruh: '', tolovKuni: 1, eslatmalar: '', shuOyTolagan: '', username: '', password: '' });
        setModalOpen(true);
    };

    const openEditModal = (student) => {
        setSelectedStudent(student);
        setForm({
            ism: student.ism,
            telefon: student.telefon,
            kurs: student.kurs?._id || student.kurs,
            guruh: student.guruh?._id || student.guruh,
            tolovKuni: student.tolovKuni,
            eslatmalar: student.eslatmalar || '',
            shuOyTolagan: '',
            username: student.username || '',
            password: ''
        });
        setModalOpen(true);
    };

    const openPayModal = (student) => {
        setSelectedStudent(student);
        setPayForm({ summa: student.oylikTolov || student.kurs?.narx || '', tolovTuri: 'naqd', izoh: '' });
        setPayModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = { ...form };
            if (!selectedStudent && submitData.shuOyTolagan === '') {
                toast.error("Bu o'quvchi shu oy to'lovni amalga oshirdimi?");
                return;
            }
            if (submitData.shuOyTolagan === 'ha') submitData.shuOyTolagan = true;
            else if (submitData.shuOyTolagan === 'yoq') submitData.shuOyTolagan = false;

            // Remove password if empty during edit
            if (selectedStudent && !submitData.password) {
                delete submitData.password;
            }

            if (selectedStudent) {
                delete submitData.shuOyTolagan;
                await studentAPI.update(selectedStudent._id, submitData);
                toast.success("O'quvchi yangilandi ✨");
            } else {
                await studentAPI.create(submitData);
                toast.success("O'quvchi qo'shildi 🚀");
            }

            setModalOpen(false);
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const handlePay = async (e) => {
        e.preventDefault();
        try {
            await paymentAPI.create({
                oquvchi: selectedStudent._id,
                summa: Number(payForm.summa),
                tolovTuri: payForm.tolovTuri,
                izoh: payForm.izoh
            });
            toast.success("To'lov muvaffaqiyatli amalga oshirildi! 💵");
            setPayModalOpen(false);
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const handleDelete = async () => {
        try {
            await studentAPI.delete(deleteId);
            toast.success("O'quvchi o'chirildi 👋");
            setConfirmOpen(false);
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    // Tanlash funksiyalari
    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === students.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(students.map(s => s._id));
        }
    };

    const clearSelection = () => setSelectedIds([]);

    // Ommaviy to'lov qilish
    const handleBulkPay = async (e) => {
        e.preventDefault();
        if (selectedIds.length === 0) return;
        setBulkLoading(true);
        try {
            const res = await paymentAPI.bulkCreate({
                studentIds: selectedIds,
                tolovTuri: bulkPayForm.tolovTuri,
                izoh: bulkPayForm.izoh
            });
            toast.success(res.data.message);
            setBulkPayModalOpen(false);
            setSelectedIds([]);
            setBulkPayForm({ tolovTuri: 'naqd', izoh: '' });
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        } finally {
            setBulkLoading(false);
        }
    };

    // Ommaviy o'chirish
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`${selectedIds.length} ta o'quvchini o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi!`)) return;
        setBulkLoading(true);
        try {
            const res = await studentAPI.bulkDelete(selectedIds);
            toast.success(res.data.message);
            setSelectedIds([]);
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        } finally {
            setBulkLoading(false);
        }
    };

    const filteredGroups = form.kurs ? groups.filter(g => (g.kurs?._id || g.kurs) === form.kurs) : groups;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'tolangan': return <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-wider">To'langan</span>;
            case 'qarzdor': return <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-wider">Qarzdor</span>;
            default: return <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-wider">To'lanmagan</span>;
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        O'quvchilar <span className="text-primary-500">Boshqaruvi</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Barcha ro'yxatdan o'tgan o'quvchilar va ularning holati</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="group relative inline-flex items-center justify-center gap-3 bg-gray-900 dark:bg-primary-600 
                        text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-primary-500/20 
                        transition-all hover:-translate-y-1 active:scale-95 overflow-hidden"
                >
                    <HiOutlinePlus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    <span>Yangi o'quvchi</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                </button>
            </div>

            {/* Smart Filters Bar */}
            <div className="bg-white dark:bg-dark-800 rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col xl:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent 
                            focus:border-primary-500 dark:focus:border-primary-500/50 outline-none transition-all font-bold text-sm text-gray-800 dark:text-white"
                        placeholder="O'quvchi ismi yoki telefon raqami..."
                    />
                </div>
                <div className="flex flex-wrap md:flex-nowrap gap-3 w-full xl:w-auto">
                    <div className="relative group flex-1 md:w-48">
                        <select
                            value={filterHolat}
                            onChange={(e) => setFilterHolat(e.target.value)}
                            className="appearance-none w-full pl-10 pr-10 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent 
                                outline-none transition-all font-bold text-sm text-gray-800 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-800"
                        >
                            <option value="">Barcha holatlar</option>
                            <option value="tolangan">To'langan</option>
                            <option value="qarzdor">Qarzdor</option>
                            <option value="tolanmagan">To'lanmagan</option>
                        </select>
                        <HiOutlineFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-500 w-4 h-4" />
                    </div>
                    <div className="relative group flex-1 md:w-56">
                        <select
                            value={filterGuruh}
                            onChange={(e) => setFilterGuruh(e.target.value)}
                            className="appearance-none w-full pl-10 pr-10 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent 
                                outline-none transition-all font-bold text-sm text-gray-800 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-dark-800"
                        >
                            <option value="">Barcha guruhlar</option>
                            {groups.map(g => (
                                <option key={g._id} value={g._id}>{g.nomi}</option>
                            ))}
                        </select>
                        <HiOutlineBadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500 w-4 h-4" />
                    </div>
                </div>
            </div>

            {/* Ommaviy amallar paneli */}
            {selectedIds.length > 0 && (
                <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-3xl p-5 shadow-xl shadow-primary-500/20 animate-fade-in">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                                <HiOutlineCheckCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-black text-sm">{selectedIds.length} ta o'quvchi tanlandi</p>
                                <p className="text-white/60 text-xs font-bold">Ommaviy amal tanlang</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setBulkPayModalOpen(true)}
                                disabled={bulkLoading}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 text-white font-black text-xs uppercase tracking-wider
                                    shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <HiOutlineCash className="w-4 h-4" />
                                To'lov qilish
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                disabled={bulkLoading}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500 text-white font-black text-xs uppercase tracking-wider
                                    shadow-lg shadow-red-500/30 hover:bg-red-400 active:scale-95 transition-all disabled:opacity-50"
                            >
                                <HiOutlineTrash className="w-4 h-4" />
                                O'chirish
                            </button>
                            <button
                                onClick={clearSelection}
                                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/20 text-white font-black text-xs uppercase tracking-wider
                                    hover:bg-white/30 active:scale-95 transition-all"
                            >
                                <HiOutlineX className="w-4 h-4" />
                                Bekor
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Students List Container */}
            <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-dark-700/50 bg-gray-50/50 dark:bg-dark-900/50">
                                <th className="pl-8 pr-2 py-6 text-center w-12">
                                    <input
                                        type="checkbox"
                                        checked={students.length > 0 && selectedIds.length === students.length}
                                        onChange={toggleSelectAll}
                                        className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-primary-600
                                            focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-all
                                            checked:bg-primary-600 checked:border-primary-600"
                                    />
                                </th>
                                <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">O'quvchi</th>
                                <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ma'lumotlar</th>
                                <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden lg:table-cell">Guruh / Kurs</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Holat</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-dark-700/50">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-24">
                                        <div className="flex flex-col items-center opacity-30">
                                            <HiOutlineUserCircle className="w-16 h-16 mb-4" />
                                            <p className="font-black text-lg">O'quvchilar ro'yxati bo'sh</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                students.map((s, i) => (
                                    <tr
                                        key={s._id}
                                        className={`group hover:bg-gray-50/80 dark:hover:bg-dark-900/30 transition-all ${selectedIds.includes(s._id) ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                                        style={{ animationDelay: `${i * 30}ms` }}
                                    >
                                        <td className="pl-8 pr-2 py-6 text-center w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(s._id)}
                                                onChange={() => toggleSelect(s._id)}
                                                className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-primary-600
                                                    focus:ring-primary-500 focus:ring-offset-0 cursor-pointer transition-all
                                                    checked:bg-primary-600 checked:border-primary-600"
                                            />
                                        </td>
                                        <td className="px-4 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 
                                                        flex items-center justify-center text-white font-black text-xl shadow-lg shadow-primary-500/10 group-hover:rotate-6 transition-all">
                                                        {s.ism?.charAt(0)}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-dark-800 
                                                        ${s.tolovHolati === 'tolangan' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="font-black text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors uppercase tracking-tight">{s.ism || "Noma'lum"}</p>
                                                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500">ID: {s._id.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                                                    <HiOutlinePhone className="w-4 h-4 text-primary-500" />
                                                    {s.telefon}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-gray-400">
                                                    <HiOutlineCalendar className="w-4 h-4 text-purple-500" />
                                                    Hamda: {s.tolovKuni}-kun
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 hidden lg:table-cell">
                                            <div className="space-y-1">
                                                <div className="inline-flex px-2 py-1 rounded-lg bg-primary-50 dark:bg-primary-900/10 text-primary-600 text-[10px] font-black uppercase tracking-wider">
                                                    {s.guruh?.nomi || 'Guruhsiz'}
                                                </div>
                                                <p className="text-xs font-bold text-gray-400 truncate max-w-[150px]">{s.kurs?.nomi || 'Kursiz'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            {getStatusBadge(s.tolovHolati)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                                {s.tolovHolati !== 'tolangan' && (
                                                    <button
                                                        onClick={() => openPayModal(s)}
                                                        className="p-3 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:scale-110 active:scale-90 transition-all"
                                                        title="To'lov qilish"
                                                    >
                                                        <HiOutlineCash className="w-5 h-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditModal(s)}
                                                    className="p-3 rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-90 transition-all"
                                                    title="Tahrirlash"
                                                >
                                                    <HiOutlinePencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => { setDeleteId(s._id); setConfirmOpen(true); }}
                                                    className="p-3 rounded-xl bg-white dark:bg-dark-700 text-red-500 border border-red-500/20 shadow-lg hover:bg-red-500 hover:text-white transition-all"
                                                    title="O'chirish"
                                                >
                                                    <HiOutlineTrash className="w-5 h-5" />
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

            {/* Modals are handled separately for cleaner code, but kept integrated for logic flow */}
            {/* Same logic but styled more professionally */}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedStudent ? "Profilni tahrirlash" : "Yangi o'quvchi qo'shish"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-8 py-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Ism va familiya *</label>
                                <input type="text" value={form.ism} onChange={e => setForm({ ...form, ism: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold"
                                    placeholder="Muhammadaziz Yakubov" required />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Telefon raqam *</label>
                                <input type="text" value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold"
                                    placeholder="+998 90 123 45 67" required />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">To'lov kuni (Oylik) *</label>
                                <input type="number" min="1" max="31" value={form.tolovKuni}
                                    onChange={e => setForm({ ...form, tolovKuni: parseInt(e.target.value) })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" required />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Login (Foydalanuvchi nomi) *</label>
                                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold"
                                    placeholder="muhammadaziz01" required />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Parol {selectedStudent ? "(O'zgartirish uchun)" : "*"}</label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold"
                                    placeholder="******" required={!selectedStudent} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Kurs tanlovi *</label>
                                <select value={form.kurs} onChange={e => setForm({ ...form, kurs: e.target.value, guruh: '' })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold cursor-pointer" required>
                                    <option value="">Kursni tanlang</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.nomi}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Guruh biriktirish *</label>
                                <select value={form.guruh} onChange={e => setForm({ ...form, guruh: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold cursor-pointer" required>
                                    <option value="">Guruhni tanlang</option>
                                    {filteredGroups.map(g => <option key={g._id} value={g._id}>{g.nomi}</option>)}
                                </select>
                            </div>
                            {!selectedStudent && (
                                <div>
                                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Dastlabki to'lov holati *</label>
                                    <select value={form.shuOyTolagan} onChange={e => setForm({ ...form, shuOyTolagan: e.target.value })}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold cursor-pointer" required>
                                        <option value="">Tanlang</option>
                                        <option value="ha">✅ To'lov qilingan</option>
                                        <option value="yoq">❌ To'lov qilinmagan (Qarzga)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Qo'shimcha eslatmalar</label>
                        <textarea value={form.eslatmalar} onChange={e => setForm({ ...form, eslatmalar: e.target.value })}
                            className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold resize-none" rows="3" placeholder="Masalan: Eng iqtidorli o'quvchi..." />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100 dark:bg-dark-800 transition-all active:scale-95">Bekor qilish</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl font-black text-white bg-primary-600 shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                            {selectedStudent ? 'Saqlash' : "Qabul qilish"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Pay Modal - Clean and Focused */}
            <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="To'lov qabul qilish" size="sm">
                <form onSubmit={handlePay} className="space-y-6">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">O'quvchi profil</p>
                        <h4 className="text-xl font-black">{selectedStudent?.ism}</h4>
                        <div className="flex items-center gap-2 mt-2 opacity-70 text-xs font-bold">
                            <HiOutlineBadgeCheck className="w-4 h-4" />
                            {selectedStudent?.guruh?.nomi} • {selectedStudent?.kurs?.nomi}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Summa (UZS)</label>
                            <input type="number" value={payForm.summa} onChange={e => setPayForm({ ...payForm, summa: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-black text-lg" required />
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">To'lov turi</label>
                            <select value={payForm.tolovTuri} onChange={e => setPayForm({ ...payForm, tolovTuri: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold cursor-pointer">
                                <option value="naqd">💵 Naqd pul</option>
                                <option value="karta">💳 Plastik karta</option>
                                <option value="online">📱 Online o'tkazma</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" className="w-full py-5 rounded-2xl font-black text-white bg-emerald-500 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                        To'lovni tasdiqlash
                    </button>
                </form>
            </Modal>

            {/* Ommaviy to'lov qilish modali */}
            <Modal isOpen={bulkPayModalOpen} onClose={() => setBulkPayModalOpen(false)} title={`${selectedIds.length} ta o'quvchiga to'lov`} size="sm">
                <form onSubmit={handleBulkPay} className="space-y-6">
                    <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 to-emerald-800 text-white shadow-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Ommaviy to'lov</p>
                        <h4 className="text-xl font-black">{selectedIds.length} ta o'quvchi tanlandi</h4>
                        <p className="text-xs font-bold mt-2 opacity-70">
                            Har bir o'quvchiga ularning kurs narxiga teng to'lov yoziladi
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">To'lov turi</label>
                            <select value={bulkPayForm.tolovTuri} onChange={e => setBulkPayForm({ ...bulkPayForm, tolovTuri: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold cursor-pointer">
                                <option value="naqd">💵 Naqd pul</option>
                                <option value="karta">💳 Plastik karta</option>
                                <option value="online">📱 Online o'tkazma</option>
                            </select>
                        </div>
                        <div>
                            <label className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Izoh (ixtiyoriy)</label>
                            <input type="text" value={bulkPayForm.izoh} onChange={e => setBulkPayForm({ ...bulkPayForm, izoh: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold"
                                placeholder="Masalan: Mart oyi to'lovi" />
                        </div>
                    </div>
                    <button type="submit" disabled={bulkLoading}
                        className="w-full py-5 rounded-2xl font-black text-white bg-emerald-500 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        {bulkLoading ? 'Yuklanmoqda...' : `${selectedIds.length} ta to'lovni tasdiqlash`}
                    </button>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="O'quvchini o'chirish"
                message="Haqiqatan ham bu o'quvchini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
            />
        </div>
    );
};

export default Students;
