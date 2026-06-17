import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { paymentAPI, studentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineSearch, HiOutlineCash, HiOutlineCalendar,
    HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineFilter,
    HiOutlineClock, HiOutlineCreditCard, HiOutlineDeviceMobile,
    HiOutlineCollection, HiOutlineTrash,
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
            toast.success("To'lov muvaffaqiyatli qabul qilindi");
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
            toast.success(`${student.ism}ga SMS muvaffaqiyatli yuborildi`);
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
            case 'naqd': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20"><HiOutlineCash className="w-3 h-3" /> Naqd</span>;
            case 'karta': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20"><HiOutlineCreditCard className="w-3 h-3" /> Karta</span>;
            case 'online': return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20"><HiOutlineDeviceMobile className="w-3 h-3" /> Online</span>;
            default: return <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">{type}</span>;
        }
    };

    const currentTotal = payments.reduce((sum, p) => sum + (p.summa || 0), 0);

    if (loading && payments.length === 0) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Moliya tarixi</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1">Barcha qabul qilingan to'lovlar va daromadlar nazorati</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setDateFilterOpen(true)}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <HiOutlineCalendar className="w-4 h-4" />
                        <span>Kunlik to'lovlar</span>
                    </button>
                    <button
                        onClick={() => setDeleteAllOpen(true)}
                        className="px-4 py-2 text-xs font-medium rounded-lg text-[#FF3B30] bg-[#FF3B30]/10 hover:bg-[#FF3B30]/25 transition-all border border-[#FF3B30]/20"
                    >
                        Barchasini o'chirish
                    </button>
                    <button
                        onClick={handleResetStudents}
                        className="btn-secondary"
                    >
                        Holatlarni yangilash
                    </button>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-100 dark:border-zinc-900/60">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[#00C853]">
                            <HiOutlineCash className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-zinc-500 font-medium">Sahifadagi tushum</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">{formatMoney(currentTotal)}</h3>
                </div>
                <div className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-100 dark:border-zinc-900/60">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-[#0066FF]">
                            <HiOutlineCalendar className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-zinc-500 font-medium">Hisobot davri</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">{filterOy ? `${oyNomlar[filterOy]} ${filterYil}` : 'Hammasi'}</h3>
                </div>
                <div className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-100 dark:border-zinc-900/60">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-purple-500">
                            <HiOutlineCollection className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-zinc-500 font-medium">Jami operatsiyalar</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">{total} ta transaktsiya</h3>
                </div>
            </div>

            {/* Filter controls */}
            <div className="bg-white dark:bg-[#111111] rounded-xl p-4 border border-gray-100 dark:border-zinc-900/60 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white"
                        placeholder="O'quvchi ismi bilan qidirish..."
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-44">
                        <select
                            value={filterOy}
                            onChange={(e) => { setFilterOy(e.target.value ? parseInt(e.target.value) : ''); setCurrentPage(1); }}
                            className="w-full pl-3 pr-8 py-2 text-sm rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white cursor-pointer"
                        >
                            <option value="">Barcha oylar</option>
                            {oyNomlar.slice(1).map((nom, i) => (
                                <option key={i + 1} value={i + 1}>{nom}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative flex-1 md:w-32">
                        <select
                            value={filterYil}
                            onChange={(e) => { setFilterYil(parseInt(e.target.value)); setCurrentPage(1); }}
                            className="w-full pl-3 pr-8 py-2 text-sm rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white cursor-pointer"
                        >
                            {[2024, 2025, 2026, 2027].map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-100 dark:border-zinc-900/60 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-zinc-900/60 bg-gray-50/50 dark:bg-zinc-900/10">
                                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">O'quvchi</th>
                                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Summa</th>
                                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Guruh / Kurs</th>
                                <th className="px-4 py-4 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider hidden md:table-cell">Turi</th>
                                <th className="px-4 py-4 text-right text-xs font-medium text-zinc-500 uppercase tracking-wider">Sana va vaqt</th>
                                <th className="px-4 py-4 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-zinc-900/40">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-20">
                                        <div className="flex flex-col items-center text-zinc-400 dark:text-zinc-600">
                                            <HiOutlineCash className="w-12 h-12 mb-2" />
                                            <p className="text-sm font-medium">To'lovlar topilmadi</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((p) => (
                                    <tr key={p._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-all">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-100 font-medium text-sm border border-zinc-200 dark:border-zinc-700 uppercase">
                                                    {p.oquvchi?.ism?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white block">{p.oquvchi?.ism || "Noma'lum"}</span>
                                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{p.oquvchi?.telefon || ''}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm font-semibold text-[#00C853] tracking-tight">
                                                +{new Intl.NumberFormat('uz-UZ').format(p.summa)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            <div className="text-sm text-gray-900 dark:text-white font-medium">{p.oquvchi?.guruh?.nomi || '-'}</div>
                                            <div className="text-xs text-zinc-400 truncate max-w-[160px]">{p.oquvchi?.kurs?.nomi || '-'}</div>
                                        </td>
                                        <td className="px-4 py-4 hidden md:table-cell">
                                            {getPaymentTypeBadge(p.tolovTuri)}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="text-xs font-semibold text-gray-900 dark:text-white">{formatDate(p.sana)}</div>
                                            <div className="text-[10px] text-zinc-400 mt-0.5">{new Date(p.sana).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => handleDelete(p._id)}
                                                disabled={deletingId === p._id}
                                                className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-[#FF3B30] transition-colors disabled:opacity-50"
                                                title="O'chirish"
                                            >
                                                <HiOutlineTrash className="w-4.5 h-4.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-[#111111] border-t border-gray-100 dark:border-zinc-900/60">
                        <span className="text-xs text-zinc-500">
                            {currentPage} / {totalPages} sahifa
                        </span>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded border border-gray-200 dark:border-zinc-800 text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                            >
                                <HiOutlineChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded border border-gray-200 dark:border-zinc-800 text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 transition-colors"
                            >
                                <HiOutlineChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirm Dialog */}
            {deleteAllOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-[#111111] rounded-xl p-6 max-w-sm w-full border border-gray-200 dark:border-zinc-800 shadow-xl">
                        <div className="text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-[#FF3B30]/10 flex items-center justify-center mx-auto text-[#FF3B30]">
                                <HiOutlineTrash className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white">To'lovlarni o'chirish</h3>
                                <p className="text-xs text-zinc-500 mt-2">
                                    {oyNomlar[filterOy]} {filterYil} oyidagi barcha to'lovlarni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setDeleteAllOpen(false)}
                                    disabled={deleteAllLoading}
                                    className="flex-1 btn-secondary"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    onClick={handleDeleteAll}
                                    disabled={deleteAllLoading}
                                    className="flex-1 px-4 py-2 rounded-lg text-white bg-[#FF3B30] hover:bg-[#E03028] text-sm font-medium transition-all disabled:opacity-50"
                                >
                                    {deleteAllLoading ? 'O\'chirilmoqda...' : 'O\'chirish'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Daily Payments Modal */}
            <Modal isOpen={dateFilterOpen} onClose={() => setDateFilterOpen(false)} title="Kunlik to'lovlar taqsimoti" size="lg">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-850 flex items-center justify-center text-[#0066FF]">
                                <HiOutlineSparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Sana bo'yicha saralash</h4>
                                <p className="text-[11px] text-zinc-400">Kunlik rejalashtirish paneli</p>
                            </div>
                        </div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none text-sm text-gray-800 dark:text-white"
                        />
                    </div>

                    {!dailyLoading && dailyStudents.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded-lg text-center border border-zinc-200 dark:border-zinc-850">
                                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-1">Jami</p>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{dailyStudents.length} ta</h4>
                            </div>
                            <div className="bg-[#00C853]/5 p-3 rounded-lg text-center border border-[#00C853]/10">
                                <p className="text-[10px] text-[#00C853] font-medium uppercase tracking-wider mb-1">To'langan</p>
                                <h4 className="text-lg font-semibold text-[#00C853]">{dailyStudents.filter(s => s.tolovHolati === 'tolangan').length} ta</h4>
                            </div>
                            <div className="bg-[#FF3B30]/5 p-3 rounded-lg text-center border border-[#FF3B30]/10">
                                <p className="text-[10px] text-[#FF3B30] font-medium uppercase tracking-wider mb-1">To'lanmagan</p>
                                <h4 className="text-lg font-semibold text-[#FF3B30]">{dailyStudents.filter(s => s.tolovHolati !== 'tolangan').length} ta</h4>
                            </div>
                        </div>
                    )}

                    <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3">
                        {dailyLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-8 h-8 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin mb-3" />
                                <p className="text-xs text-zinc-400">Yuklanmoqda...</p>
                            </div>
                        ) : dailyStudents.length === 0 ? (
                            <div className="text-center py-12 text-zinc-400">
                                <HiOutlineEmojiHappy className="w-12 h-12 mx-auto mb-3" />
                                <h4 className="text-sm font-semibold">Ushbu kunda to'lovlar mavjud emas</h4>
                            </div>
                        ) : (
                            dailyStudents.map((student) => {
                                const isPaid = student.tolovHolati === 'tolangan';
                                const isDebt = student.tolovHolati === 'qarzdor';
                                return (
                                    <div
                                        key={student._id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#111111] border border-gray-100 dark:border-zinc-900/60"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-100 font-semibold text-sm border border-zinc-200 dark:border-zinc-700 uppercase">
                                                {student.ism?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{student.ism}</h4>
                                                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-400">
                                                    <span>{student.guruh?.nomi || 'Guruhsiz'}</span>
                                                    <span>•</span>
                                                    <span>{student.telefon}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50 dark:border-zinc-900/40">
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                                    {new Intl.NumberFormat('uz-UZ').format(student.oylikTolov || student.kurs?.narx || 0)} so'm
                                                </p>
                                                <div className="mt-0.5">
                                                    {isPaid ? (
                                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20">To'langan</span>
                                                    ) : isDebt ? (
                                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-[#FF3B30]/10 text-[#FF3B30] border border-[#FF3B30]/20">Qarzdor</span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20">To'lanmagan</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <a
                                                    href={`tel:${student.telefon}`}
                                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                                                    title="Qo'ng'iroq"
                                                >
                                                    <HiOutlinePhone className="w-4.5 h-4.5" />
                                                </a>
                                                {!isPaid && (
                                                    <>
                                                        <button
                                                            onClick={() => handleSendDailySMS(student)}
                                                            disabled={sendingSms === student._id}
                                                            className="p-1.5 rounded hover:bg-gray-150 dark:hover:bg-zinc-800 text-[#0066FF] transition-colors disabled:opacity-50"
                                                            title="Eslatma SMS"
                                                        >
                                                            <HiOutlineChatAlt2 className="w-4.5 h-4.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => openStudentPayModal(student)}
                                                            className="px-3 py-1.5 rounded-lg bg-[#00C853] hover:bg-[#00B04A] text-white text-xs font-medium transition-all"
                                                        >
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
            <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="To'lov qabul qilish" size="sm">
                <form onSubmit={handleStudentPay} className="space-y-6">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block mb-1">O'quvchi</span>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">{selectedStudentForPay?.ism}</h4>
                        <div className="mt-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
                            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Belgilangan to'lov</span>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {new Intl.NumberFormat('uz-UZ').format(selectedStudentForPay?.oylikTolov || selectedStudentForPay?.kurs?.narx || 0)} so'm
                            </h2>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Summa (UZS)</label>
                                <input
                                    type="number"
                                    value={payForm.summa}
                                    onChange={e => setPayForm({ ...payForm, summa: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Turi</label>
                                <select
                                    value={payForm.tolovTuri}
                                    onChange={e => setPayForm({ ...payForm, tolovTuri: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer"
                                >
                                    <option value="naqd">Naqd</option>
                                    <option value="karta">Karta</option>
                                    <option value="online">Online</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Izoh</label>
                            <input
                                type="text"
                                value={payForm.izoh}
                                onChange={e => setPayForm({ ...payForm, izoh: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium"
                                placeholder="Ixtiyoriy izoh..."
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setPayModalOpen(false)} className="btn-secondary">Bekor</button>
                        <button type="submit" className="btn-primary">Tasdiqlash</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Payments;
