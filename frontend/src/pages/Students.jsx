import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { studentAPI, courseAPI, groupAPI, paymentAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
    HiOutlineCash, HiOutlineFilter, HiOutlinePhone, HiOutlineCalendar,
    HiOutlineBadgeCheck, HiOutlineUserCircle, HiOutlineX, HiOutlineCheckCircle,
    HiOutlineEye, HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineClock, HiOutlineExclamationCircle,
    HiOutlineDownload
} from 'react-icons/hi';
import * as XLSX from 'xlsx';

const Students = () => {
    const location = useLocation();
    const navigate = useNavigate();
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
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [bulkPayModalOpen, setBulkPayModalOpen] = useState(false);
    const [bulkPayForm, setBulkPayForm] = useState({ tolovTuri: 'naqd', izoh: '', sana: new Date().toISOString().split('T')[0] });
    const [bulkLoading, setBulkLoading] = useState(false);
    const [filterGuruh, setFilterGuruh] = useState('');
    const [moveGroupModalOpen, setMoveGroupModalOpen] = useState(false);
    const [targetGroupId, setTargetGroupId] = useState('');

    const [form, setForm] = useState({
        ism: '', telefon: '', kurs: '', guruh: '', tolovKuni: 1, oylikTolov: '', eslatmalar: '', shuOyTolagan: '', username: '', password: ''
    });

    const [payForm, setPayForm] = useState({ summa: '', tolovTuri: 'naqd', izoh: '', sana: new Date().toISOString().split('T')[0] });

    useEffect(() => {
        fetchAll();

        // Marketing sahifasidan lead kelgan bo'lsa
        if (location.state?.lead) {
            const lead = location.state.lead;
            setForm(prev => ({
                ...prev,
                ism: lead.name,
                telefon: lead.phone,
                eslatmalar: `Marketingdan kelgan: ${lead.course} kursi bo'yicha. Izoh: ${lead.notes || ''}`
            }));
            setModalOpen(true);
        }
    }, [location.state]);

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
        setForm({ ism: '', telefon: '', kurs: '', guruh: '', tolovKuni: 1, oylikTolov: '', eslatmalar: '', shuOyTolagan: '', username: '', password: '' });
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
            oylikTolov: student.oylikTolov || '',
            eslatmalar: student.eslatmalar || '',
            shuOyTolagan: '',
            username: student.username || '',
            password: ''
        });
        setModalOpen(true);
    };

    const openPayModal = (student) => {
        setSelectedStudent(student);
        setPayForm({
            summa: student.oylikTolov || student.kurs?.narx || '',
            tolovTuri: 'naqd',
            izoh: '',
            sana: new Date().toISOString().split('T')[0]
        });
        setPayModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = { ...form };
            
            // Basic validation
            if (!submitData.ism || !submitData.telefon || !submitData.kurs || !submitData.guruh) {
                toast.error("Iltimos, barcha majburiy maydonlarni to'ldiring");
                setLoading(false);
                return;
            }

            if (!selectedStudent && submitData.shuOyTolagan === '') {
                toast.error("Bu o'quvchi shu oy to'lovni amalga oshirdimi?");
                setLoading(false);
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
                toast.success("O'quvchi yangilandi");
            } else {
                await studentAPI.create(submitData);
                toast.success("O'quvchi muvaffaqiyatli qo'shildi");
            }

            setModalOpen(false);
            fetchStudents();
        } catch (err) {
            console.error('Submit Student Error:', err);
            toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (e) => {
        e.preventDefault();
        try {
            await paymentAPI.create({
                oquvchi: selectedStudent._id,
                summa: Number(payForm.summa),
                tolovTuri: payForm.tolovTuri,
                izoh: payForm.izoh,
                sana: payForm.sana
            });
            toast.success("To'lov muvaffaqiyatli amalga oshirildi");
            setPayModalOpen(false);
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const handleToggleBlock = async (id) => {
        try {
            const res = await studentAPI.toggleBlock(id);
            toast.success(res.data.message);
            fetchStudents();
            if (viewingStudent && viewingStudent._id === id) {
                setViewingStudent({ ...viewingStudent, isBlocked: !viewingStudent.isBlocked });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const handleMarkAsDebtor = async (student) => {
        if (!window.confirm(`${student.ism}ni qarzdor deb belgilashni xohlaysizmi?`)) return;
        try {
            await studentAPI.update(student._id, { tolovHolati: 'qarzdor' });
            toast.success(`${student.ism} qarzdor deb belgilandi`);
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
        }
    };

    const viewPaymentHistory = (student) => {
        navigate('/payments', { state: { search: student.ism } });
    };

    const handleDelete = async () => {
        try {
            await studentAPI.delete(deleteId);
            toast.success("O'quvchi o'chirildi");
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
                izoh: bulkPayForm.izoh,
                sana: bulkPayForm.sana
            });
            toast.success(res.data.message);
            setBulkPayModalOpen(false);
            setSelectedIds([]);
            setBulkPayForm({ tolovTuri: 'naqd', izoh: '', sana: new Date().toISOString().split('T')[0] });
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        } finally {
            setBulkLoading(false);
        }
    };

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

    const handleBulkMoveGroup = async (e) => {
        e.preventDefault();
        if (selectedIds.length === 0 || !targetGroupId) return;
        setBulkLoading(true);
        try {
            const res = await studentAPI.bulkMoveGroup(selectedIds, targetGroupId);
            toast.success(res.data.message);
            setMoveGroupModalOpen(false);
            setTargetGroupId('');
            setSelectedIds([]);
            fetchStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        } finally {
            setBulkLoading(false);
        }
    };

    const handleExportExcel = () => {
        if (students.length === 0) {
            toast.error("Eksport qilish uchun ma'lumot yo'q!");
            return;
        }

        const exportData = students.map((s, index) => ({
            "T/R": index + 1,
            "Ism va familiya": s.ism,
            "Telefon raqam": s.telefon,
            "Guruh": s.guruh?.nomi || 'Guruhsiz',
            "Kurs": s.kurs?.nomi || 'Kursiz',
            "Oylik to'lov": s.oylikTolov || s.kurs?.narx || 0,
            "To'lov kuni": s.tolovKuni,
            "To'lov holati": s.tolovHolati === 'tolangan' ? "To'langan" : s.tolovHolati === 'qarzdor' ? "Qarzdor" : "To'lanmagan",
            "Login": s.username,
            "Holati": s.isBlocked ? 'Bloklangan' : 'Aktiv',
            "Eslatma": s.eslatmalar || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "O'quvchilar");
        
        const wscols = [
            {wch: 5},  // T/R
            {wch: 25}, // Ism va familiya
            {wch: 15}, // Telefon raqam
            {wch: 15}, // Guruh
            {wch: 20}, // Kurs
            {wch: 15}, // Oylik to'lov
            {wch: 10}, // To'lov kuni
            {wch: 15}, // To'lov holati
            {wch: 15}, // Login
            {wch: 10}, // Holati
            {wch: 30}  // Eslatma
        ];
        worksheet['!cols'] = wscols;

        XLSX.writeFile(workbook, "O'quvchilar_ruyxati.xlsx");
        toast.success("Excel fayl yuklab olindi");
    };

    const filteredGroups = form.kurs ? groups.filter(g => (g.kurs?._id || g.kurs) === form.kurs) : groups;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'tolangan':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20">To'langan</span>;
            case 'qarzdor':
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20">Qarzdor</span>;
            default:
                return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20">To'lanmagan</span>;
        }
    };

    const calculateDaysUntilPayment = (tolovKuni, tolovHolati) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const today = now.getDate();

        let targetDate = new Date(currentYear, currentMonth, tolovKuni);

        if (today > tolovKuni) {
            targetDate.setMonth(targetDate.getMonth() + 1);
        }

        const diffTime = targetDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const statusText = tolovHolati === 'tolangan' ? " (To'langan)" : "";

        if (today === tolovKuni) {
            return tolovHolati === 'tolangan' ? "Bugun (To'langan)" : "Bugun";
        }

        if (today > tolovKuni && tolovHolati !== 'tolangan') {
            return "Muddati o'tgan";
        }

        return `${diffDays} kun qoldi${statusText}`;
    };

    const openViewModal = (student) => {
        setViewingStudent(student);
        setViewModalOpen(true);
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">O'quvchilar</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1">Barcha ro'yxatdan o'tgan o'quvchilar va ularning holati</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportExcel}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <HiOutlineDownload className="w-4 h-4" />
                        <span>Excel</span>
                    </button>
                    <button
                        onClick={openAddModal}
                        className="btn-primary flex items-center gap-2"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span>Yangi o'quvchi</span>
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white dark:bg-[#111111] rounded-xl p-4 border border-gray-100 dark:border-zinc-900/60 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white"
                        placeholder="Qidirish..."
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-44">
                        <select
                            value={filterHolat}
                            onChange={(e) => setFilterHolat(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 text-sm rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white cursor-pointer"
                        >
                            <option value="">Barcha holatlar</option>
                            <option value="tolangan">To'langan</option>
                            <option value="qarzdor">Qarzdor</option>
                            <option value="tolanmagan">To'lanmagan</option>
                            <option value="blocklangan">Bloklangan</option>
                        </select>
                    </div>
                    <div className="relative flex-1 md:w-52">
                        <select
                            value={filterGuruh}
                            onChange={(e) => setFilterGuruh(e.target.value)}
                            className="w-full pl-3 pr-8 py-2 text-sm rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white cursor-pointer"
                        >
                            <option value="">Barcha guruhlar</option>
                            {groups.map(g => (
                                <option key={g._id} value={g._id}>{g.nomi}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Panel */}
            {selectedIds.length > 0 && (
                <div className="bg-zinc-50 dark:bg-zinc-900/40 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <HiOutlineCheckCircle className="w-5 h-5 text-[#0066FF]" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedIds.length} ta o'quvchi tanlandi</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setBulkPayModalOpen(true)}
                            disabled={bulkLoading}
                            className="px-4 py-2 rounded-lg bg-[#00C853] hover:bg-[#00B04A] text-white text-xs font-medium transition-all disabled:opacity-50"
                        >
                            To'lov qilish
                        </button>
                        <button
                            onClick={() => { setTargetGroupId(''); setMoveGroupModalOpen(true); }}
                            disabled={bulkLoading}
                            className="px-4 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0052CC] text-white text-xs font-medium transition-all disabled:opacity-50"
                        >
                            Guruhga o'tkazish
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            disabled={bulkLoading}
                            className="px-4 py-2 rounded-lg bg-[#FF3B30] hover:bg-[#E03028] text-white text-xs font-medium transition-all disabled:opacity-50"
                        >
                            O'chirish
                        </button>
                        <button
                            onClick={clearSelection}
                            className="px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        >
                            Bekor qilish
                        </button>
                    </div>
                </div>
            )}

            {/* Students Table */}
            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-100 dark:border-zinc-900/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-zinc-900/60 bg-gray-50/50 dark:bg-zinc-900/10">
                                <th className="px-4 py-4 text-center w-12">
                                    <input
                                        type="checkbox"
                                        checked={students.length > 0 && selectedIds.length === students.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#0066FF] focus:ring-[#0066FF] cursor-pointer"
                                    />
                                </th>
                                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">O'quvchi</th>
                                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Aloqa</th>
                                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Kurs / Guruh</th>
                                <th className="px-4 py-4 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Holat</th>
                                <th className="px-4 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-900/40">
                            {students.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-20">
                                        <div className="flex flex-col items-center text-zinc-400 dark:text-zinc-600">
                                            <HiOutlineUserCircle className="w-12 h-12 mb-2" />
                                            <p className="text-sm font-medium">O'quvchilar topilmadi</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                students.map((s) => (
                                    <tr
                                        key={s._id}
                                        className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all ${selectedIds.includes(s._id) ? 'bg-[#0066FF]/5 dark:bg-[#0066FF]/5' : ''}`}
                                    >
                                        <td className="px-4 py-4 text-center w-12">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(s._id)}
                                                onChange={() => toggleSelect(s._id)}
                                                className="w-4 h-4 rounded border-gray-300 dark:border-zinc-700 text-[#0066FF] focus:ring-[#0066FF] cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-100 font-medium text-sm border border-zinc-200 dark:border-zinc-700 uppercase">
                                                    {s.ism?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span onClick={() => openViewModal(s)} className="text-sm font-medium text-gray-900 dark:text-white hover:text-[#0066FF] cursor-pointer transition-colors">{s.ism || "Noma'lum"}</span>
                                                        {s.maxsusNarx && (
                                                            <span className="px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 text-[9px] font-medium border border-amber-500/20">Maxsus</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">ID: {s._id.slice(-6).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm text-gray-700 dark:text-zinc-300 font-medium">{s.telefon}</div>
                                            <div className="text-[11px] text-zinc-400 mt-0.5">To'lov kuni: {s.tolovKuni}-sana</div>
                                        </td>
                                        <td className="px-4 py-4 hidden lg:table-cell">
                                            <div className="text-sm text-gray-900 dark:text-white font-medium">{s.guruh?.nomi || 'Guruhsiz'}</div>
                                            <div className="text-xs text-zinc-400 truncate max-w-[160px]">{s.kurs?.nomi || 'Kursiz'}</div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="inline-flex flex-col gap-1">
                                                {getStatusBadge(s.tolovHolati)}
                                                {s.isBlocked && (
                                                    <span className="inline-flex items-center justify-center px-1.5 py-0.2 rounded text-[10px] bg-red-600/10 text-red-500 border border-red-500/20">Bloklangan</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {s.tolovHolati !== 'tolangan' && (
                                                    <button
                                                        onClick={() => openPayModal(s)}
                                                        className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                                                        title="To'lov qilish"
                                                    >
                                                        <HiOutlineCash className="w-4.5 h-4.5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => viewPaymentHistory(s)}
                                                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                                                    title="Tarix"
                                                >
                                                    <HiOutlineClock className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleMarkAsDebtor(s)}
                                                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                                                    title="Qarzdor qilish"
                                                >
                                                    <HiOutlineExclamationCircle className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => openViewModal(s)}
                                                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-zinc-800 text-[#0066FF] transition-colors"
                                                    title="Batafsil"
                                                >
                                                    <HiOutlineEye className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(s)}
                                                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                                                    title="Tahrirlash"
                                                >
                                                    <HiOutlinePencil className="w-4.5 h-4.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleBlock(s._id)}
                                                    className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                                                    title={s.isBlocked ? "Blokdan chiqarish" : "Bloklash"}
                                                >
                                                    {s.isBlocked ? <HiOutlineLockOpen className="w-4.5 h-4.5" /> : <HiOutlineLockClosed className="w-4.5 h-4.5" />}
                                                </button>
                                                <button
                                                    onClick={() => { setDeleteId(s._id); setConfirmOpen(true); }}
                                                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-[#FF3B30] transition-colors"
                                                    title="O'chirish"
                                                >
                                                    <HiOutlineTrash className="w-4.5 h-4.5" />
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

            {/* Modals & Dialogs */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedStudent ? "Tahrirlash" : "Yangi o'quvchi"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Ism va familiya *</label>
                                <input type="text" value={form.ism} onChange={e => setForm({ ...form, ism: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium"
                                    placeholder="Ism kiriting" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Telefon raqam *</label>
                                <input type="text" value={form.telefon} onChange={e => setForm({ ...form, telefon: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium"
                                    placeholder="+998" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">To'lov kuni (Oylik) *</label>
                                <input type="number" min="1" max="31" value={form.tolovKuni}
                                    onChange={e => setForm({ ...form, tolovKuni: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Maxsus oylik to'lov (ixtiyoriy)</label>
                                <input type="number" value={form.oylikTolov}
                                    onChange={e => setForm({ ...form, oylikTolov: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium" 
                                    placeholder="Bo'sh qolsa kurs narxi olinadi" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Login (Username) *</label>
                                <input type="text" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium"
                                    placeholder="Username" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Parol {selectedStudent ? "(O'zgartirish uchun)" : "*"}</label>
                                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium"
                                    placeholder="******" required={!selectedStudent} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Kurs tanlovi *</label>
                                <select value={form.kurs} onChange={e => setForm({ ...form, kurs: e.target.value, guruh: '' })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium cursor-pointer" required>
                                    <option value="">Kursni tanlang</option>
                                    {courses.map(c => <option key={c._id} value={c._id}>{c.nomi}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Guruh biriktirish *</label>
                                <select value={form.guruh} onChange={e => setForm({ ...form, guruh: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium cursor-pointer" required>
                                    <option value="">Guruhni tanlang</option>
                                    {filteredGroups.map(g => <option key={g._id} value={g._id}>{g.nomi}</option>)}
                                </select>
                            </div>
                            {!selectedStudent && (
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Dastlabki to'lov holati *</label>
                                    <select value={form.shuOyTolagan} onChange={e => setForm({ ...form, shuOyTolagan: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium cursor-pointer" required>
                                        <option value="">Tanlang</option>
                                        <option value="ha">To'lov qilingan</option>
                                        <option value="yoq">To'lov qilinmagan (Qarzdor)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Qo'shimcha eslatmalar</label>
                        <textarea value={form.eslatmalar} onChange={e => setForm({ ...form, eslatmalar: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium resize-none" rows="2" placeholder="Admin eslatmalari..." />
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Bekor qilish</button>
                        <button type="submit" className="btn-primary">
                            {selectedStudent ? 'Saqlash' : "Qabul qilish"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Pay Modal */}
            <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="To'lov qabul qilish" size="sm">
                <form onSubmit={handlePay} className="space-y-4">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{selectedStudent?.ism}</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                            {selectedStudent?.guruh?.nomi} • {selectedStudent?.kurs?.nomi}
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Summa (UZS)</label>
                            <input type="number" value={payForm.summa} onChange={e => setPayForm({ ...payForm, summa: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold" required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">To'lov turi</label>
                            <select value={payForm.tolovTuri} onChange={e => setPayForm({ ...payForm, tolovTuri: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer">
                                <option value="naqd">Naqd pul</option>
                                <option value="karta">Plastik karta</option>
                                <option value="online">Online o'tkazma</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">To'lov sanasi</label>
                            <input type="date" value={payForm.sana} onChange={e => setPayForm({ ...payForm, sana: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium" />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setPayModalOpen(false)} className="btn-secondary">Bekor</button>
                        <button type="submit" className="btn-primary">
                            Tasdiqlash
                        </button>
                    </div>
                </form>
            </Modal>

            {/* View Student Details Modal */}
            <Modal isOpen={viewModalOpen} onClose={() => setViewModalOpen(false)} title="O'quvchi Profili" size="md">
                {viewingStudent && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                            <div className="w-12 h-12 rounded-full bg-zinc-150 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-100 font-semibold text-lg border border-zinc-250 dark:border-zinc-700 uppercase">
                                {viewingStudent.ism?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">{viewingStudent.ism}</h3>
                                <p className="text-xs text-zinc-400 mt-0.5">{viewingStudent.guruh?.nomi || 'Guruhsiz'} • {viewingStudent.kurs?.nomi || 'Kursiz'}</p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-900/60">
                                <span className="text-xs text-zinc-500">O'quvchi ID</span>
                                <span className="text-xs font-semibold text-zinc-900 dark:text-white uppercase">{viewingStudent._id.slice(-8)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-900/60">
                                <span className="text-xs text-zinc-500">Telefon raqam</span>
                                <span className="text-xs font-semibold text-zinc-900 dark:text-white">{viewingStudent.telefon}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-900/60">
                                <span className="text-xs text-zinc-500">Foydalanuvchi nomi</span>
                                <span className="text-xs font-semibold text-zinc-900 dark:text-white">@{viewingStudent.username}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-900/60">
                                <span className="text-xs text-zinc-500">Balans (Coins)</span>
                                <span className="text-xs font-semibold text-amber-500">🪙 {viewingStudent.coins || 0} t</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-900/60">
                                <span className="text-xs text-zinc-500">Oylik to'lov summasi</span>
                                <span className="text-xs font-semibold text-emerald-500">{new Intl.NumberFormat('uz-UZ').format(viewingStudent.oylikTolov || viewingStudent.kurs?.narx)} so'm</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-900/60">
                                <span className="text-xs text-zinc-500">To'lov kuni / Holati</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">Har oy {viewingStudent.tolovKuni}-sana</span>
                                    {getStatusBadge(viewingStudent.tolovHolati)}
                                </div>
                            </div>
                            <div className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-900/60">
                                <span className="text-xs text-zinc-500">To'lovgacha</span>
                                <span className="text-xs font-semibold text-zinc-900 dark:text-white">{calculateDaysUntilPayment(viewingStudent.tolovKuni, viewingStudent.tolovHolati)}</span>
                            </div>
                        </div>

                        {viewingStudent.eslatmalar && (
                            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block mb-1">Eslatma</span>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 italic">"{viewingStudent.eslatmalar}"</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                            <button onClick={() => { setViewModalOpen(false); openEditModal(viewingStudent); }}
                                className="flex-1 btn-secondary flex items-center justify-center gap-2">
                                <HiOutlinePencil className="w-4 h-4" /> Tahrirlash
                            </button>
                            <button onClick={() => { setViewModalOpen(false); openPayModal(viewingStudent); }}
                                className="flex-1 btn-primary flex items-center justify-center gap-2">
                                <HiOutlineCash className="w-4 h-4" /> To'lov
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Bulk Payment Modal */}
            <Modal isOpen={bulkPayModalOpen} onClose={() => setBulkPayModalOpen(false)} title="Ommaviy to'lov" size="sm">
                <form onSubmit={handleBulkPay} className="space-y-4">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{selectedIds.length} ta o'quvchi</h4>
                        <p className="text-xs text-zinc-400 mt-1">
                            Har bir o'quvchi uchun uning oylik to'lov summasida to'lov tasdiqlanadi.
                        </p>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">To'lov turi</label>
                            <select value={bulkPayForm.tolovTuri} onChange={e => setBulkPayForm({ ...bulkPayForm, tolovTuri: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer">
                                <option value="naqd">Naqd pul</option>
                                <option value="karta">Plastik karta</option>
                                <option value="online">Online o'tkazma</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Izoh</label>
                            <input type="text" value={bulkPayForm.izoh} onChange={e => setBulkPayForm({ ...bulkPayForm, izoh: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium"
                                placeholder="Ixtiyoriy izoh" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">To'lov sanasi</label>
                            <input type="date" value={bulkPayForm.sana} onChange={e => setBulkPayForm({ ...bulkPayForm, sana: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium" />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setBulkPayModalOpen(false)} className="btn-secondary">Bekor</button>
                        <button type="submit" disabled={bulkLoading} className="btn-primary">
                            {bulkLoading ? 'Yuklanmoqda...' : 'Tasdiqlash'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="O'quvchini o'chirish"
                message="Haqiqatan ham bu o'quvchini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi."
            />

            {/* Bulk Move Group Modal */}
            <Modal isOpen={moveGroupModalOpen} onClose={() => setMoveGroupModalOpen(false)} title="Guruhga o'tkazish" size="sm">
                <form onSubmit={handleBulkMoveGroup} className="space-y-4">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#0066FF]/10 flex items-center justify-center">
                                <HiOutlineFilter className="w-4 h-4 text-[#0066FF]" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{selectedIds.length} ta o'quvchi tanlangan</h4>
                                <p className="text-xs text-zinc-400 mt-0.5">Ularni boshqa guruhga o'tkazish</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Yangi guruhni tanlang *</label>
                        <select
                            value={targetGroupId}
                            onChange={e => setTargetGroupId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none transition-all text-sm font-medium cursor-pointer"
                            required
                        >
                            <option value="">Guruhni tanlang</option>
                            {groups.map(g => (
                                <option key={g._id} value={g._id}>{g.nomi}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setMoveGroupModalOpen(false)} className="btn-secondary">Bekor</button>
                        <button type="submit" disabled={bulkLoading || !targetGroupId} className="btn-primary disabled:opacity-50">
                            {bulkLoading ? 'Yuklanmoqda...' : "O'tkazish"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Students;
