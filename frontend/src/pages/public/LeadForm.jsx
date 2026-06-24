import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { leadAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlinePhone, HiOutlineAcademicCap, HiOutlineCheckCircle } from 'react-icons/hi';
import { ChevronRight, ArrowLeft } from 'lucide-react';

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
                source: source || 'Website Public Form',
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
            <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="max-w-md w-full bg-zinc-950/80 rounded-[3rem] p-12 text-center shadow-2xl border border-white/5 animate-scale-in backdrop-blur-xl relative z-10">
                    <div className="w-24 h-24 bg-gradient-to-tr from-amber-500 to-yellow-600 rounded-3xl flex items-center justify-center text-black mx-auto mb-8 shadow-xl shadow-amber-500/20 animate-bounce-subtle">
                        <HiOutlineCheckCircle className="w-12 h-12" />
                    </div>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Rahmat! ❤️</h1>
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-[11px] leading-relaxed italic mb-8">
                        Murojaatingiz muvaffaqiyatli qabul qilindi. <br /> Tez orada administratorlarimiz siz bilan bog'lanishadi!
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-amber-400 font-black uppercase tracking-wider text-xs hover:text-amber-300 transition-colors"
                    >
                        <ArrowLeft size={16} /> Bosh sahifaga qaytish
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/5 blur-[130px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/5 blur-[130px] rounded-full pointer-events-none"></div>

            <div className="max-w-md w-full bg-zinc-950/80 rounded-[3.5rem] p-10 md:p-14 shadow-2xl border border-white/5 relative overflow-hidden group backdrop-blur-xl z-10">
                {/* Decorative glowing top line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

                <div className="relative z-10 text-center mb-12">
                    <Link to="/" className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl text-black font-black text-2xl mb-6 shadow-xl shadow-amber-500/20 italic">
                        IF
                    </Link>
                    <h1 className="text-3xl font-black text-white uppercase italic tracking-tight mb-2">InFast <span className="text-amber-500">Academy</span></h1>
                    <p className="text-[10px] font-black text-zinc-550 uppercase tracking-[0.2em] italic opacity-85">Kursga yozilish uchun anketani to'ldiring</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    <div className="space-y-4">
                        <div className="relative group/input">
                            <HiOutlineUser className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                required
                                placeholder="TO'LIQ ISMINGIZ"
                                className="w-full bg-zinc-900/60 border border-white/5 focus:border-amber-500 focus:ring-0 rounded-2xl p-5 pl-14 text-sm font-black text-white placeholder-zinc-600 transition-all uppercase italic tracking-tight outline-none"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>

                        <div className="relative group/input">
                            <HiOutlinePhone className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-amber-500 transition-colors" />
                            <input
                                type="tel"
                                required
                                placeholder="TELEFON RAQAMINGIZ"
                                className="w-full bg-zinc-900/60 border border-white/5 focus:border-amber-500 focus:ring-0 rounded-2xl p-5 pl-14 text-sm font-black text-white placeholder-zinc-600 transition-all italic tracking-tight outline-none"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            />
                        </div>

                        <div className="relative group/input">
                            <HiOutlineAcademicCap className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                required
                                placeholder="QAYSI KURS QIZIQTIRADI?"
                                className="w-full bg-zinc-900/60 border border-white/5 focus:border-amber-500 focus:ring-0 rounded-2xl p-5 pl-14 text-sm font-black text-white placeholder-zinc-600 transition-all uppercase italic tracking-tight outline-none"
                                value={form.course}
                                onChange={(e) => setForm({ ...form, course: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-6 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl shadow-amber-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 italic"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                            'MA\'LUMOTNI YUBORISH'
                        )}
                    </button>

                    <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                        <span>Xavfsiz va Ishonchli 🛡️</span>
                        <Link to="/" className="hover:text-white transition-colors">Bosh sahifa</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LeadForm;
