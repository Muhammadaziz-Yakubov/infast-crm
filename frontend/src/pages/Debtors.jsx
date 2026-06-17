import { useState, useEffect } from 'react';
import { studentAPI, paymentAPI } from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineExclamationCircle, HiOutlinePhone, HiOutlineCash,
    HiOutlineDownload, HiOutlineSearch, HiOutlineCollection,
    HiOutlineEmojiHappy, HiOutlineChatAlt2
} from 'react-icons/hi';

const Debtors = () => {
    const [debtors, setDebtors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [payModalOpen, setPayModalOpen] = useState(false);
    const [selectedDebtor, setSelectedDebtor] = useState(null);
    const [search, setSearch] = useState('');
    const [exporting, setExporting] = useState(false);

    const [payForm, setPayForm] = useState({ summa: '', tolovTuri: 'naqd', izoh: '' });
    const [sendingSms, setSendingSms] = useState(null);

    useEffect(() => {
        fetchDebtors();
    }, []);

    const fetchDebtors = async () => {
        try {
            const res = await studentAPI.getDebtors();
            setDebtors(res.data.data);
        } catch (err) {
            toast.error("Qarzdorlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const openPayModal = (debtor) => {
        setSelectedDebtor(debtor);
        setPayForm({
            summa: debtor.oylikTolov || debtor.kurs?.narx || '',
            tolovTuri: 'naqd',
            izoh: ''
        });
        setPayModalOpen(true);
    };

    const handlePay = async (e) => {
        e.preventDefault();
        try {
            await paymentAPI.create({
                oquvchi: selectedDebtor._id,
                summa: Number(payForm.summa),
                tolovTuri: payForm.tolovTuri,
                izoh: payForm.izoh
            });
            toast.success("To'lov muvaffaqiyatli amalga oshirildi");
            setPayModalOpen(false);
            fetchDebtors();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const res = await paymentAPI.exportDebtors();
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'qarzdorlar.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Excel fayl yuklandi');
        } catch (err) {
            toast.error('Export qilishda xatolik');
        } finally {
            setExporting(false);
        }
    };

    const handleSendSMS = async (debtor) => {
        try {
            setSendingSms(debtor._id);
            await studentAPI.sendDebtSMS(debtor._id);
            toast.success(`${debtor.ism}ga SMS muvaffaqiyatli yuborildi`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'SMS yuborishda xatolik');
        } finally {
            setSendingSms(null);
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    const filteredDebtors = debtors.filter(d =>
        d.ism?.toLowerCase().includes(search.toLowerCase()) ||
        d.telefon?.includes(search)
    );

    const totalDebt = filteredDebtors.reduce((sum, d) => sum + (d.oylikTolov || d.kurs?.narx || 0), 0);

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Qarzdorlar ro'yxati</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1">To'lov muddati o'tib ketgan o'quvchilar nazorati</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting || debtors.length === 0}
                    className="btn-secondary flex items-center gap-2"
                >
                    <HiOutlineDownload className="w-4 h-4 text-[#0066FF]" />
                    <span>{exporting ? 'Eksport qilinmoqda...' : 'Excel fayl yuklash'}</span>
                </button>
            </div>

            {/* Premium Warning Card */}
            {debtors.length > 0 && (
                <div className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-red-100 dark:border-red-950/30">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30] border border-[#FF3B30]/20">
                                <HiOutlineExclamationCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Kutilayotgan umumiy qarz</h3>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Jami {debtors.length} ta o'quvchidan</p>
                            </div>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-900/60 px-5 py-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center md:text-right">
                            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block mb-0.5">Umumiy balans</span>
                            <span className="text-xl font-bold text-[#FF3B30] tracking-tight block">{formatMoney(totalDebt)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white"
                    placeholder="Ism yoki telefon bo'yicha tezkor qidiruv..."
                />
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            </div>

            {/* Debtors Content */}
            {filteredDebtors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                    <HiOutlineEmojiHappy className="w-12 h-12 mb-2 text-[#00C853]" />
                    <h3 className="text-sm font-medium">Toza ro'yxat!</h3>
                    <p className="text-xs text-zinc-500 mt-1">Hozirda hech qanday qarzdorliklar mavjud emas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredDebtors.map((d) => (
                        <div
                            key={d._id}
                            className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-100 dark:border-zinc-900/60 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-100 font-semibold text-sm border border-zinc-200 dark:border-zinc-700 uppercase">
                                            {d.ism?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{d.ism}</h3>
                                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-400">
                                                <HiOutlineCollection className="w-3.5 h-3.5" />
                                                <span>{d.guruh?.nomi || 'Guruhsiz'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-semibold text-[#FF3B30] tracking-tight block">
                                            -{new Intl.NumberFormat('uz-UZ').format(d.oylikTolov || d.kurs?.narx || 0)}
                                        </span>
                                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                                            {d.tolovKuni}-sanalik to'lov
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-zinc-900/40 flex flex-col gap-3">
                                {d.eslatmalar && (
                                    <div className="text-[11px] text-zinc-500 italic">
                                        "{d.eslatmalar}"
                                    </div>
                                )}
                                <div className="grid grid-cols-3 gap-2">
                                    <a
                                        href={`tel:${d.telefon}`}
                                        className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <HiOutlinePhone className="w-4 h-4" />
                                        <span>Tel</span>
                                    </a>
                                    <button
                                        onClick={() => handleSendSMS(d)}
                                        disabled={sendingSms === d._id}
                                        className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-[#0066FF] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                    >
                                        <HiOutlineChatAlt2 className="w-4 h-4" />
                                        <span>SMS</span>
                                    </button>
                                    <button
                                        onClick={() => openPayModal(d)}
                                        className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#00C853] hover:bg-[#00B04A] text-white text-xs font-semibold transition-colors"
                                    >
                                        <HiOutlineCash className="w-4 h-4" />
                                        <span>To'lov</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pay Modal */}
            <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="Qarzni yopish" size="sm">
                <form onSubmit={handlePay} className="space-y-6">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center">
                        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block mb-1">To'lovchi</span>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white">{selectedDebtor?.ism}</h4>
                        <div className="mt-4 py-2 border-t border-zinc-200 dark:border-zinc-800">
                            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider block">Qarzdorlik miqdori</span>
                            <h2 className="text-2xl font-bold text-[#FF3B30] mt-1">
                                {formatMoney(selectedDebtor?.oylikTolov || selectedDebtor?.kurs?.narx || 0)}
                            </h2>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Summa (UZS)</label>
                                <input type="number" value={payForm.summa} onChange={e => setPayForm({ ...payForm, summa: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Turi</label>
                                <select value={payForm.tolovTuri} onChange={e => setPayForm({ ...payForm, tolovTuri: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer">
                                    <option value="naqd">💵 Naqd</option>
                                    <option value="karta">💳 Karta</option>
                                    <option value="online">📱 Online</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Izoh</label>
                            <input type="text" value={payForm.izoh} onChange={e => setPayForm({ ...payForm, izoh: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium" placeholder="Ixtiyoriy izoh..." />
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setPayModalOpen(false)} className="btn-secondary">Bekor qilish</button>
                        <button type="submit" className="btn-primary">
                            To'lovni qabul qilish
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Debtors;
