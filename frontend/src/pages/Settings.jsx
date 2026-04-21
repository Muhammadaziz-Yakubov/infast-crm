import { useState } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlineKey } from 'react-icons/hi';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (form.newPassword !== form.confirmPassword) {
            return toast.error("Yangi parollar bir-biriga mos kelmadi");
        }
        
        if (form.newPassword.length < 6) {
            return toast.error("Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak");
        }

        setLoading(true);
        try {
            await authAPI.updatePassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword
            });
            toast.success("Parol muvaffaqiyatli o'zgartirildi ✨");
            setForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-10 animate-fade-in pb-24 lg:pb-10">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                    Tizim <span className="text-primary-500">Sozlamalari</span>
                </h1>
                <p className="text-sm font-medium text-gray-500">Xavfsizlik va parollarni boshqarish</p>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl group transition-all duration-500 hover:shadow-primary-500/10">
                <div className="bg-gray-900 p-10 md:p-14 relative overflow-hidden flex flex-col items-center">
                    <div className="relative z-10 w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center text-white shadow-3xl transform group-hover:scale-110 transition-transform duration-500">
                        <HiOutlineShieldCheck className="w-12 h-12" />
                    </div>
                    
                    <div className="mt-6 text-center z-10">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Xavfsizlik Markazi</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1 opacity-60">Account Security Status: High</p>
                    </div>

                    {/* Decorative gradients */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary-900/40 rounded-full blur-[100px] pointer-events-none" />
                </div>

                <div className="p-8 md:p-12">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 italic">Joriy Parol</label>
                                <div className="relative group/input">
                                    <HiOutlineKey className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary-500 transition-colors w-5 h-5" />
                                    <input
                                        type="password"
                                        required
                                        value={form.currentPassword}
                                        onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                                        placeholder="Eski parolingizni kiriting"
                                        className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold text-gray-900 dark:text-white transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 italic">Yangi Parol</label>
                                    <div className="relative group/input">
                                        <HiOutlineLockClosed className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary-500 transition-colors w-5 h-5" />
                                        <input
                                            type="password"
                                            required
                                            value={form.newPassword}
                                            onChange={e => setForm({ ...form, newPassword: e.target.value })}
                                            placeholder="Yangi parol"
                                            className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold text-gray-900 dark:text-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 italic">Tasdiqlash</label>
                                    <div className="relative group/input">
                                        <HiOutlineLockClosed className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary-500 transition-colors w-5 h-5" />
                                        <input
                                            type="password"
                                            required
                                            value={form.confirmPassword}
                                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                            placeholder="Parolni takrorlang"
                                            className="w-full pl-16 pr-8 py-5 rounded-[1.5rem] bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold text-gray-900 dark:text-white transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-5 rounded-[1.5rem] bg-gray-900 dark:bg-primary-600 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-primary-500/20 italic ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : (
                                <HiOutlineShieldCheck className="w-5 h-5" />
                            )}
                            Parolni yangilash
                        </button>
                    </form>
                </div>
            </div>

            {/* Hint Box */}
            <div className="p-8 rounded-[2rem] bg-amber-500/10 border border-amber-500/20 flex gap-6 items-start">
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                    <HiOutlineLockClosed className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-amber-900 dark:text-amber-400 font-black uppercase text-xs tracking-wider italic">Xavfsizlik bo'yicha maslahat</h3>
                    <p className="text-amber-800/70 dark:text-amber-400/60 text-[10px] font-medium leading-relaxed">
                        Parolingizni muntazam ravishda o'zgartirib turish hisobingiz xavfsizligini oshiradi. Kuchli paroldan foydalaning (harflar, sonlar va maxsus belgilar aralashmasi).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
