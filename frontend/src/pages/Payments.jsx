import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { paymentAPI, studentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch, HiOutlineCash, HiOutlineCalendar,
    HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineFilter,
    HiOutlineClock, HiOutlineCreditCard, HiOutlineDeviceMobile,
    HiOutlineCurrencyDollar, HiOutlineCollection, HiOutlineTrash,
    HiOutlinePhone, HiOutlineChatAlt2, HiOutlineExclamationCircle,
    HiOutlineEmojiHappy, HiOutlineCheckCircle, HiOutlineSparkles
} from 'react-icons/hi';
import Modal from '../components/Modal';

const Payments = () => {
    const location = useLocation();
    const [payments, setPayments] = useState([]);
    const [deletingId, setDeletingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(location.state?.search || '');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [deleteAllOpen, setDeleteAllOpen] = useState(false);
    const [deleteAllLoading, setDeleteAllLoading] = useState(false);

    // Daily payments states
    const [dateFilterOpen, setDateFilterOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [dailyStudents, setDailyStudents] = useState([]);
    const [dailyLoading, setDailyLoading] = useState(false);

    // Quick student payment modal states
    const [selectedStudentForPay, setSelectedStudentForPay] = useState(null);
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [payForm, setPayForm] = useState({ summa: '', tolovTuri: 'naqd', izoh: '' });
    const [sendingSms, setSendingSms] = useState(null);

    const now = new Date();
    const [filterOy, setFilterOy] = useState(location.state?.search ? '' : now.getMonth() + 1);
    const [filterYil, setFilterYil] = useState(location.state?.search ? '' : now.getFullYear());

    const oyNomlar = ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
        'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];

    useEffect(() => {
        fetchPayments();
    }, [currentPage, filterOy, filterYil]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1);
            fetchPayments();
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (dateFilterOpen && selectedDate) {
            fetchDailyStudents();
        }
    }, [dateFilterOpen, selectedDate]);

    const fetchDailyStudents = async () => {
        setDailyLoading(true);
        try {
            const dateObj = new Date(selectedDate);
            const day = dateObj.getDate();
            const res = await studentAPI.getAll({ tolovKuni: day, limit: 100, holati: 'faol' });
            setDailyStudents(res.data.data || []);
        } catch (err) {
            toast.error("O'quvchilarni yuklashda xatolik");
        } finally {
            setDailyLoading(false);
        }
    };

    const openStudentPayModal = (student) => {
        setSelectedStudentForPay(student);
        setPayForm({
            summa: student.oylikTolov || student.kurs?.narx || '',
            tolovTuri: 'naqd',
            izoh: ''
        });
        setPayModalOpen(true);
    };

    const handleStudentPay = async (e) => {
        e.preventDefault();
        try {
            await paymentAPI.create({
                oquvchi: selectedStudentForPay._id,
                summa: Number(payForm.summa),
                tolovTuri: payForm.tolovTuri,
                izoh: payForm.izoh
            });
            toast.success("To'lov muvaffaqiyatli qabul qilindi! 💸");
            setPayModalOpen(false);
            fetchPayments();
            fetchDailyStudents();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const handleSendDailySMS = async (student) => {
        try {
            setSendingSms(student._id);
            await studentAPI.sendDebtSMS(student._id);
            toast.success(`${student.ism}ga SMS muvaffaqiyatli yuborildi! 📩`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'SMS yuborishda xatolik');
        } finally {
            setSendingSms(null);
        }
    };

    const fetchPayments = async () => {
        try {
            const params = {
                page: currentPage,
                limit: 20,
                search: search || undefined,
                oy: filterOy || undefined,
                yil: filterYil || undefined
            };
            const res = await paymentAPI.getAll(params);
            setPayments(res.data.data);
            setTotalPages(res.data.totalPages || 1);
            setTotal(res.data.total || 0);
        } catch (err) {
            toast.error("To'lovlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    const handleDelete = async (paymentId) => {
        if (!window.confirm("Bu to'lovni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi!")) return;
        setDeletingId(paymentId);
        try {
            await paymentAPI.delete(paymentId);
            toast.success("To'lov muvaffaqiyatli o'chirildi");
            fetchPayments();
        } catch (err) {
            toast.error(err.response?.data?.message || "To'lovni o'chirishda xatolik");
        } finally {
            setDeletingId(null);
        }
    };

    const handleResetStudents = async () => {
        if (!window.confirm("Barcha faol o'quvchilar holatini 'To'lanmagan' ga o'zgartirishni xohlaysizmi? Bu to'lovlar o'chirib tashlangan holatda ma'lumotlarni sinxronlash uchun kerak.")) return;
        try {
            const res = await studentAPI.resetPaymentsStatus();
            toast.success(res.data.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Holatlarni yangilashda xatolik");
        }
    };

    const handleDeleteAll = async () => {
        const oyNomi = oyNomlar[filterOy] || 'Barcha oylar';
        const yilNomi = filterYil || 'Barcha yillar';
        if (!window.confirm(`⚠️ ${oyNomi} ${filterYil} oyidagi BARCHA to'lovlarni o'chirishni xohlaysizmi?\n\nBu amalni qaytarib bo'lmaydi!`)) return;
        setDeleteAllLoading(true);
        try {
            const res = await paymentAPI.deleteAll({ oy: filterOy, yil: filterYil });
            toast.success(res.data.message);
            setDeleteAllOpen(false);
            fetchPayments();
        } catch (err) {
            toast.error(err.response?.data?.message || "To'lovlarni o'chirishda xatolik");
        } finally {
            setDeleteAllLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('uz-UZ', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentTypeBadge = (type) => {
        switch (type) {
            case 'naqd': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider"><HiOutlineCash className="w-3.5 h-3.5" /> Naqd</span>;
            case 'karta': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider"><HiOutlineCreditCard className="w-3.5 h-3.5" /> Karta</span>;
            case 'online': return <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider"><HiOutlineDeviceMobile className="w-3.5 h-3.5" /> Online</span>;
            default: return <span className="badge">{type}</span>;
        }
    };

    const currentTotal = payments.reduce((sum, p) => sum + (p.summa || 0), 0);

    if (loading && payments.length === 0) return <LoadingSpinner />;

    return (
        <>
            <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">
                        Moliya <span className="text-emerald-500">Tarixi</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Barcha qabul qilingan to'lovlar va daromadlar nazorati</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setDateFilterOpen(true)}
                        className="px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 
                            border-2 border-emerald-500/20 hover:bg-emerald-500 hover:text-white 
                            transition-all font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/10 active:scale-95 flex items-center gap-2"
                    >
                        <HiOutlineCalendar className="w-4 h-4" />
                        Kunlik To'lovlar
                    </button>
                    <button
                        onClick={() => setDeleteAllOpen(true)}
                        className="px-6 py-3 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 
                            border-2 border-red-500/20 hover:bg-red-500 hover:text-white 
                            transition-all font-black text-xs uppercase tracking-wider shadow-lg shadow-red-500/10 active:scale-95"
                    >
                        Barchasini O'chirish
                    </button>
                    <button
                        onClick={handleResetStudents}
                        className="px-6 py-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 
                            border-2 border-amber-500/20 hover:bg-amber-500 hover:text-white 
                            transition-all font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 active:scale-95"
                    >
                        Holatlarni Yangilash
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10">
                            <HiOutlineCurrencyDollar className="w-6 h-6 text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Sahifadagi tushum</p>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{formatMoney(currentTotal)}</h3>
                </div>
                <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-blue-500/10">
                            <HiOutlineCalendar className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Hisobot davri</p>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{filterOy ? `${oyNomlar[filterOy]} ${filterYil}` : 'Hammasi'}</h3>
                </div>
                <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-purple-500/10">
                            <HiOutlineCollection className="w-6 h-6 text-purple-500" />
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Jami operatsiyalar</p>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{total} ta transaktsiya</h3>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent 
                            focus:border-emerald-500 outline-none transition-all font-bold text-sm"
                        placeholder="O'quvchi ismi bilan qidirish..."
                    />
                </div>
                <div className="flex gap-3 w-full lg:w-auto">
                    <div className="relative group flex-1">
                        <select
                            value={filterOy}
                            onChange={(e) => { setFilterOy(parseInt(e.target.value)); setCurrentPage(1); }}
                            className="appearance-none w-full pl-10 pr-10 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold text-sm cursor-pointer"
                        >
                            <option value="">Barcha oylar</option>
                            {oyNomlar.slice(1).map((nom, i) => (
                                <option key={i + 1} value={i + 1}>{nom}</option>
                            ))}
                        </select>
                        <HiOutlineFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                    </div>
                    <div className="relative group md:w-32">
                        <select
                            value={filterYil}
                            onChange={(e) => { setFilterYil(parseInt(e.target.value)); setCurrentPage(1); }}
                            className="appearance-none w-full pl-4 pr-10 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold text-sm cursor-pointer"
                        >
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50 dark:border-dark-700/50 bg-gray-50/50 dark:bg-dark-900/50">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">O'quvchi</th>
                                <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Summa</th>
                                <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">Guruh / Kurs</th>
                                <th className="px-6 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hidden md:table-cell">Turi</th>
                                <th className="px-6 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sana va Vaqt</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-dark-700/50 text-gray-800 dark:text-gray-200">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-24 opacity-30">
                                        <HiOutlineCash className="w-16 h-16 mx-auto mb-4" />
                                        <h3 className="text-xl font-black">To'lovlar mavjud emas</h3>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p, i) => (
                                    <tr key={p._id} className="group hover:bg-gray-50/80 dark:hover:bg-dark-900/30 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 
                                                    flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/10 transform transition-transform group-hover:rotate-6">
                                                    {p.oquvchi?.ism?.charAt(0) || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black truncate uppercase tracking-tight">{p.oquvchi?.ism || "Noma'lum"}</p>
                                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">{p.oquvchi?.telefon || ''}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                                                +{new Intl.NumberFormat('uz-UZ').format(p.summa)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 hidden md:table-cell">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-black text-gray-800 dark:text-gray-200 uppercase tracking-tight">{p.oquvchi?.guruh?.nomi || '-'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{p.oquvchi?.kurs?.nomi || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 hidden md:table-cell">
                                            {getPaymentTypeBadge(p.tolovTuri)}
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white">{formatDate(p.sana)}</span>
                                                <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <HiOutlineClock className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold">{new Date(p.sana).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <button
                                                onClick={() => handleDelete(p._id)}
                                                disabled={deletingId === p._id}
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl 
                                                    bg-red-500/10 text-red-600 dark:text-red-400 
                                                    hover:bg-red-500 hover:text-white 
                                                    transition-all duration-200 text-[10px] font-black uppercase tracking-wider
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                    hover:shadow-lg hover:shadow-red-500/20 active:scale-95"
                                                title="To'lovni o'chirish"
                                            >
                                                <HiOutlineTrash className={`w-3.5 h-3.5 ${deletingId === p._id ? 'animate-spin' : ''}`} />
                                                <span className="hidden lg:inline">O'chirish</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-8 py-6 bg-gray-50/50 dark:bg-dark-900/50 border-t border-gray-100 dark:border-dark-700">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                            {currentPage} / {totalPages} - Sahifa
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-10 h-10 rounded-xl bg-white dark:bg-dark-800 flex items-center justify-center text-gray-500 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-20 shadow-sm border border-gray-200 dark:border-white/5"
                            >
                                <HiOutlineChevronLeft className="w-5 h-5" />
                            </button>
                            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                                let pageNum = currentPage <= 2 ? i + 1 : (currentPage >= totalPages - 1 ? totalPages - 2 + i : currentPage - 1 + i);
                                if (pageNum < 1) pageNum = 1;
                                if (pageNum > totalPages) return null;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-10 h-10 rounded-xl text-xs font-black transition-all
                                            ${currentPage === pageNum
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 active:scale-95'
                                                : 'bg-white dark:bg-dark-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 shadow-sm border border-gray-200 dark:border-white/5 pb-0.5'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-10 h-10 rounded-xl bg-white dark:bg-dark-800 flex items-center justify-center text-gray-500 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-20 shadow-sm border border-gray-200 dark:border-white/5"
                            >
                                <HiOutlineChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

{deleteAllOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-dark-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-red-500/20">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                            <HiOutlineTrash className="w-8 h-8 text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                            To'lovlarni O'chirish
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">
                            {oyNomlar[filterOy]} {filterYil} oyidagi <span className="font-black text-red-500">{total}</span> ta to'lovni 
                            <span className="text-red-500 font-black">o'chirishni</span> xohlaysizmi?
                        </p>
                        <p className="text-xs text-red-500 font-medium mb-6">
                            ⚠️ Bu amalni qaytarib bo'lmaydi!
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteAllOpen(false)}
                                disabled={deleteAllLoading}
                                className="flex-1 px-6 py-3 rounded-2xl bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 
                                    font-black uppercase text-xs tracking-wider active:scale-95 transition-all"
                            >
                                Bekor Qilish
                            </button>
                            <button
                                onClick={handleDeleteAll}
                                disabled={deleteAllLoading}
                                className="flex-1 px-6 py-3 rounded-2xl bg-red-500 text-white font-black uppercase text-xs tracking-wider 
                                    shadow-lg shadow-red-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {deleteAllLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        O'chirilmoqda...
                                    </span>
                                ) : 'Ha, O\'chirish'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

            {/* Daily Payments Modal */}
            <Modal
                isOpen={dateFilterOpen}
                onClose={() => setDateFilterOpen(false)}
                title="Kunlik To'lovlar Taqsimoti"
                size="lg"
            >
                <div className="space-y-6">
                    {/* Date Selector Header */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-6 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-3xl border border-emerald-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                <HiOutlineSparkles className="w-5 h-5 animate-pulse" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">To'lov kuni bo'yicha saralash</h4>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Kunlik rejalashtirish paneli</p>
                            </div>
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-dark-950 border-2 border-emerald-500/30 
                                focus:border-emerald-500 outline-none transition-all font-black text-sm text-gray-800 dark:text-white cursor-pointer w-full sm:w-auto"
                        />
                    </div>

                    {/* Statistics Panel */}
                    {!dailyLoading && dailyStudents.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-gray-50 dark:bg-dark-900/50 p-4 rounded-2xl text-center border border-gray-100 dark:border-white/5">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Kutilmoqda</p>
                                <h4 className="text-xl font-black text-gray-900 dark:text-white">{dailyStudents.length} ta</h4>
                            </div>
                            <div className="bg-emerald-500/5 p-4 rounded-2xl text-center border border-emerald-500/10">
                                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mb-1">To'langan</p>
                                <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                                    {dailyStudents.filter(s => s.tolovHolati === 'tolangan').length} ta
                                </h4>
                            </div>
                            <div className="bg-rose-500/5 p-4 rounded-2xl text-center border border-rose-500/10">
                                <p className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-none mb-1">To'lamagan</p>
                                <h4 className="text-xl font-black text-rose-600 dark:text-rose-400">
                                    {dailyStudents.filter(s => s.tolovHolati !== 'tolangan').length} ta
                                </h4>
                            </div>
                        </div>
                    )}

                    {/* Students List */}
                    <div className="max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                        {dailyLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Ma'lumotlar yuklanmoqda...</p>
                            </div>
                        ) : dailyStudents.length === 0 ? (
                            <div className="text-center py-16 opacity-40">
                                <HiOutlineEmojiHappy className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                                <h4 className="text-lg font-black text-gray-800 dark:text-white">Ushbu kunda to'lovlar mavjud emas</h4>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                                    Bu kunda to'lov muddati belgilangan faol talaba topilmadi
                                </p>
                            </div>
                        ) : (
                            dailyStudents.map((student) => {
                                const isPaid = student.tolovHolati === 'tolangan';
                                const isDebt = student.tolovHolati === 'qarzdor';
                                
                                return (
                                    <div
                                        key={student._id}
                                        className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-dark-900 border border-gray-100 dark:border-white/5 hover:border-emerald-500/20 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg transform transition-transform group-hover:rotate-6
                                                ${isPaid ? 'from-emerald-400 to-emerald-600 bg-gradient-to-br shadow-emerald-500/10' : 
                                                  isDebt ? 'from-red-400 to-rose-600 bg-gradient-to-br shadow-red-500/10' : 
                                                  'from-amber-400 to-amber-600 bg-gradient-to-br shadow-amber-500/10'}`}
                                            >
                                                {student.ism?.charAt(0) || '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm truncate">{student.ism}</h4>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{student.guruh?.nomi || 'Guruhsiz'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{student.telefon}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-gray-50 dark:border-dark-700/50">
                                            <div className="text-right">
                                                <p className="text-sm font-black text-gray-900 dark:text-white tracking-tighter">
                                                    {new Intl.NumberFormat('uz-UZ').format(student.oylikTolov || student.kurs?.narx || 0)} so'm
                                                </p>
                                                <div className="mt-1 flex justify-end">
                                                    {isPaid ? (
                                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider"><HiOutlineCheckCircle className="w-3 h-3" /> To'langan</span>
                                                    ) : isDebt ? (
                                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 text-[9px] font-black uppercase tracking-wider"><HiOutlineExclamationCircle className="w-3 h-3" /> Qarzdor</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9px] font-black uppercase tracking-wider"><HiOutlineExclamationCircle className="w-3 h-3" /> To'lanmagan</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={`tel:${student.telefon}`}
                                                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-dark-800 text-gray-600 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-500 transition-all active:scale-95"
                                                    title="Qo'ng'iroq"
                                                >
                                                    <HiOutlinePhone className="w-4 h-4" />
                                                </a>
                                                {!isPaid && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSendDailySMS(student)}
                                                            disabled={sendingSms === student._id}
                                                            className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-all active:scale-95 disabled:opacity-50"
                                                            title="Eslatma SMS yuborish"
                                                        >
                                                            <HiOutlineChatAlt2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openStudentPayModal(student)}
                                                            className="px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                                                        >
                                                            <HiOutlineCash className="w-3.5 h-3.5" />
                                                            To'lov
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </Modal>

            {/* Quick Student Payment Modal */}
            <Modal
                isOpen={payModalOpen}
                onClose={() => setPayModalOpen(false)}
                title="To'lov Qabul Qilish"
                size="sm"
            >
                <form onSubmit={handleStudentPay} className="space-y-6">
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">O'quvchi</p>
                            <h4 className="text-2xl font-black tracking-tight">{selectedStudentForPay?.ism}</h4>
                            <div className="mt-6 flex flex-col items-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Belgilangan To'lov</p>
                                <h2 className="text-4xl font-black mt-1 tracking-tighter">
                                    {new Intl.NumberFormat('uz-UZ').format(selectedStudentForPay?.oylikTolov || selectedStudentForPay?.kurs?.narx || 0)} so'm
                                </h2>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Summa (UZS)</label>
                                <input
                                    type="number"
                                    value={payForm.summa}
                                    onChange={e => setPayForm({ ...payForm, summa: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-black"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Turi</label>
                                <select
                                    value={payForm.tolovTuri}
                                    onChange={e => setPayForm({ ...payForm, tolovTuri: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold cursor-pointer"
                                >
                                    <option value="naqd">💵 Naqd</option>
                                    <option value="karta">💳 Karta</option>
                                    <option value="online">📱 Online</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Izoh</label>
                            <input
                                type="text"
                                value={payForm.izoh}
                                onChange={e => setPayForm({ ...payForm, izoh: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold"
                                placeholder="Ixtiyoriy izoh..."
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-5 rounded-2xl font-black text-white bg-emerald-500 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-lg"
                    >
                        To'lovni Tasdiqlash
                    </button>
                    <button
                        type="button"
                        onClick={() => setPayModalOpen(false)}
                        className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Bekor qilish
                    </button>
                </form>
            </Modal>
        </>
    );
};

export default Payments;
