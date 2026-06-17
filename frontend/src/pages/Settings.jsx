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
            toast.success("Parol muvaffaqiyatli o'zgartirildi");
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
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-10">
            <div>
                <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Tizim sozlamalari</h1>
                <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1 font-medium">Xavfsizlik va parollarni boshqarish</p>
            </div>

            <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 overflow-hidden">
                <div className="p-6 border-b border-gray-150 dark:border-zinc-900/60 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center border border-[#0066FF]/20">
                        <HiOutlineShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Xavfsizlik markazi</h2>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Hisobingiz xavfsizlik holati: Yuqori</p>
                    </div>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Joriy parol</label>
                            <div className="relative">
                                <HiOutlineKey className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                                <input
                                    type="password"
                                    required
                                    value={form.currentPassword}
                                    onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                                    placeholder="Eski parolingizni kiriting"
                                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-250 dark:border-zinc-800 outline-none focus:border-[#0066FF] text-gray-950 dark:text-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Yangi parol</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                                    <input
                                        type="password"
                                        required
                                        value={form.newPassword}
                                        onChange={e => setForm({ ...form, newPassword: e.target.value })}
                                        placeholder="Yangi parol"
                                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-250 dark:border-zinc-800 outline-none focus:border-[#0066FF] text-gray-950 dark:text-white transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Parolni tasdiqlash</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                                    <input
                                        type="password"
                                        required
                                        value={form.confirmPassword}
                                        onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                        placeholder="Parolni takrorlang"
                                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-gray-50 dark:bg-zinc-900/60 border border-gray-250 dark:border-zinc-800 outline-none focus:border-[#0066FF] text-gray-950 dark:text-white transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-zinc-900/60 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <HiOutlineShieldCheck className="w-4 h-4" />
                                )}
                                <span>Parolni yangilash</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Hint Box */}
            <div className="p-4 rounded-xl bg-[#FF9500]/5 border border-[#FF9500]/20 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-lg bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center flex-shrink-0 border border-[#FF9500]/20">
                    <HiOutlineLockClosed className="w-4.5 h-4.5" />
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-zinc-300">Xavfsizlik bo'yicha maslahat</h3>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 leading-relaxed">
                        Parolingizni muntazam ravishda o'zgartirib turish hisobingiz xavfsizligini oshiradi. Kuchli paroldan foydalaning (harflar, sonlar va maxsus belgilar aralashmasi).
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;
