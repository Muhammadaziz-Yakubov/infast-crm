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
            toast.success("To'lov muvaffaqiyatli amalga oshirildi! 💸");
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
            toast.success('Excel fayl yuklandi! 📁');
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
            toast.success(`${debtor.ism}ga SMS muvaffaqiyatli yuborildi! 📩`);
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
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                        Qarzdorlar <span className="text-red-500">Ro'yxati</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">To'lov muddati o'tib ketgan o'quvchilar nazorati</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={exporting || debtors.length === 0}
                    className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white dark:bg-dark-800 
                        text-gray-800 dark:text-white font-black text-sm border-2 border-gray-100 dark:border-white/5 
                        shadow-sm hover:border-primary-500 dark:hover:border-primary-500/30 transition-all hover:-translate-y-1 disabled:opacity-50"
                >
                    <HiOutlineDownload className="w-5 h-5 text-primary-500" />
                    <span>{exporting ? 'Eksport qilinmoqda...' : 'Excel ga yuklash'}</span>
                </button>
            </div>

            {/* Premium Warning Card */}
            {debtors.length > 0 && (
                <div className="relative overflow-hidden group">
                    <div className="relative z-10 bg-gradient-to-br from-red-600 via-rose-600 to-red-800 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-red-500/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="p-4 rounded-3xl bg-white/20 backdrop-blur-md shadow-inner">
                                    <HiOutlineExclamationCircle className="w-10 h-10 text-white animate-pulse" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black tracking-tight">Kutilayotgan umumiy qarz</h3>
                                    <p className="text-red-100 font-medium opacity-80 uppercase tracking-widest text-xs">Jami {debtors.length} ta o'quvchidan</p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-10 py-6 rounded-[2rem] border border-white/10 text-center md:text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Umumiy balans</p>
                                <h2 className="text-4xl font-black tracking-tighter">{formatMoney(totalDebt)}</h2>
                            </div>
                        </div>
                    </div>
                    {/* Decorative blobs */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-48 h-48 bg-black/20 rounded-full blur-3xl pointer-events-none" />
                </div>
            )}

            {/* Smart Search */}
            <div className="relative group">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-12 py-5 rounded-3xl bg-white dark:bg-dark-800 border-2 border-transparent 
                        focus:border-primary-500 shadow-sm focus:shadow-xl focus:shadow-primary-500/5 outline-none transition-all 
                        font-bold text-gray-800 dark:text-white"
                    placeholder="Ism yoki telefon bo'yicha tezkor qidiruv..."
                />
                <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 w-6 h-6 transition-colors" />
            </div>

            {/* Debtors Content */}
            {filteredDebtors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-dark-800 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-dark-700">
                    <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mb-6">
                        <HiOutlineEmojiHappy className="w-12 h-12 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-gray-800 dark:text-white">Toza ro'yxat!</h3>
                    <p className="text-gray-400 font-medium mt-2">Hozirda hech qanday qarzdorliklar mavjud emas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
                    {filteredDebtors.map((d, i) => (
                        <div
                            key={d._id}
                            className="group bg-white dark:bg-dark-800 rounded-[2.5rem] p-6 border border-gray-100 dark:border-white/5 
                                shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1.5"
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-rose-600 
                                        flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-red-500/20 transform transition-transform group-hover:rotate-6">
                                        {d.ism?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-black text-gray-900 dark:text-white truncate text-lg group-hover:text-red-600 transition-colors uppercase tracking-tight">
                                            {d.ism}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1 text-xs font-bold text-gray-400">
                                            <HiOutlineCollection className="w-4 h-4" />
                                            {d.guruh?.nomi || 'Guruhsiz'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-red-600 dark:text-red-400 tracking-tighter">
                                        -{new Intl.NumberFormat('uz-UZ').format(d.oylikTolov || d.kurs?.narx || 0)}
                                    </p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                                        {d.tolovKuni}-sanalik to'lov
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-auto">
                                <a
                                    href={`tel:${d.telefon}`}
                                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gray-50 dark:bg-dark-900 
                                        text-gray-600 dark:text-gray-400 font-bold text-xs hover:bg-primary-50 dark:hover:bg-primary-900/10 
                                        hover:text-primary-600 transition-all active:scale-95"
                                >
                                    <HiOutlinePhone className="w-4 h-4" />
                                    Tel
                                </a>
                                <button
                                    onClick={() => handleSendSMS(d)}
                                    disabled={sendingSms === d._id}
                                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-primary-50 dark:bg-primary-900/10 
                                        text-primary-600 font-bold text-xs hover:bg-primary-100 dark:hover:bg-primary-900/20 
                                        transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <HiOutlineChatAlt2 className="w-4 h-4" />
                                    {sendingSms === d._id ? '...' : 'SMS'}
                                </button>
                                <button
                                    onClick={() => openPayModal(d)}
                                    className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 
                                        text-white font-black text-xs shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                >
                                    <HiOutlineCash className="w-4 h-4" />
                                    To'lov
                                </button>
                            </div>


                            {d.eslatmalar && (
                                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-dark-700/50">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 opacity-50">Eslatma</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 italic">"{d.eslatmalar}"</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Pay Modal - Custom for Debtors */}
            <Modal isOpen={payModalOpen} onClose={() => setPayModalOpen(false)} title="Qarzni yopish" size="sm">
                <form onSubmit={handlePay} className="space-y-6">
                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">To'lovchi</p>
                            <h4 className="text-2xl font-black tracking-tight">{selectedDebtor?.ism}</h4>
                            <div className="mt-6 flex flex-col items-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Qarzdorlik miqdori</p>
                                <h2 className="text-4xl font-black mt-1 tracking-tighter">
                                    {formatMoney(selectedDebtor?.oylikTolov || selectedDebtor?.kurs?.narx || 0)}
                                </h2>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Summa (UZS)</label>
                                <input type="number" value={payForm.summa} onChange={e => setPayForm({ ...payForm, summa: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-black" required />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Turi</label>
                                <select value={payForm.tolovTuri} onChange={e => setPayForm({ ...payForm, tolovTuri: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold">
                                    <option value="naqd">💵 Naqd</option>
                                    <option value="karta">💳 Karta</option>
                                    <option value="online">📱 Online</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Izoh</label>
                            <input type="text" value={payForm.izoh} onChange={e => setPayForm({ ...payForm, izoh: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-emerald-500 outline-none transition-all font-bold" placeholder="Ixtiyoriy izoh..." />
                        </div>
                    </div>

                    <button type="submit" className="w-full py-5 rounded-2xl font-black text-white bg-emerald-500 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all text-lg">
                        To'lovni qabul qilish
                    </button>
                    <button type="button" onClick={() => setPayModalOpen(false)} className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">
                        Hozir emas, bekor qilish
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Debtors;
