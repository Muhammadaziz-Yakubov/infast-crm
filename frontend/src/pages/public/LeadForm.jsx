import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { leadAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlinePhone, HiOutlineAcademicCap, HiOutlineCheckCircle } from 'react-icons/hi';

const LeadForm = () => {
    const { source } = useParams();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '',
        phone: '',
        course: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await leadAPI.publicCreate({
                ...form,
                source: source || 'Website',
                status: 'Yangi Lead'
            });
            setSubmitted(true);
            toast.success('Murojaatingiz qabul qilindi! ✨');
        } catch (err) {
            toast.error('Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-[3rem] p-12 text-center shadow-2xl border border-gray-100 dark:border-white/5 animate-scale-in">
                    <div className="w-24 h-24 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-500/20 animate-bounce-subtle">
                        <HiOutlineCheckCircle className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-4 tracking-tighter">Rahmat! ❤️</h1>
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed italic">
                        Murojaatingiz muvaffaqiyatli qabul qilindi. <br /> Tez orada administratorlarimiz siz bilan bog'lanishadi!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white dark:bg-dark-800 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10 text-center mb-10">
                    <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-xl shadow-primary-500/30 italic">IF</div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight mb-2">InFast <span className="text-primary-500">Education</span></h1>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em] italic opacity-80">Kursga yozilish uchun formani to'ldiring</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-4">
                        <div className="relative group">
                            <HiOutlineUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                required
                                placeholder="TO'LIQ ISMINGIZ"
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 pl-14 text-sm font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase italic tracking-tight"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="relative group">
                            <HiOutlinePhone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="tel"
                                required
                                placeholder="TELEFON RAQAMINGIZ"
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 pl-14 text-sm font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all italic tracking-tight"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>

                        <div className="relative group">
                            <HiOutlineAcademicCap className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                required
                                placeholder="QAYSI KURS QIZIQTIRADI?"
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 pl-14 text-sm font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase italic tracking-tight"
                                value={form.course}
                                onChange={(e) => setForm({ ...form, course: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 italic"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            'MA\'LUMOTNI YUBORISH'
                        )}
                    </button>

                    <p className="text-[8px] text-center font-bold text-gray-400 uppercase tracking-widest italic opacity-60">Xavfsiz va Ishonchli 🛡️</p>
                </form>
            </div>
        </div>
    );
};

export default LeadForm;
