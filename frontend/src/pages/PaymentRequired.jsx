import React from 'react';
import { useAuth } from '../context/AuthContext';
import { HiOutlineLockClosed, HiOutlineCreditCard, HiOutlineRefresh, HiOutlineLogout } from 'react-icons/hi';
import toast from 'react-hot-toast';
import clickLogo from '../clickup.png';

const PaymentRequired = () => {
    const { user, logout } = useAuth();

    const paymentDetails = {
        cardNumber: "8600314132449820",
        cardName: "N.Yakubov"
    };

    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[35%] h-[35%] bg-[#0066FF]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-md animate-fade-in space-y-6">
                <div className="bg-[#111111] rounded-xl p-8 border border-zinc-800/80 shadow-2xl text-center space-y-6">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center text-red-500">
                            <HiOutlineLockClosed className="w-6 h-6" />
                        </div>
                        <div className="space-y-1.5">
                            <h2 className="text-lg font-semibold text-[#F5F5F5] tracking-tight">Kechirasiz, {user?.fullName}!</h2>
                            <p className="text-xs text-zinc-405 leading-relaxed font-medium">
                                Sizning hisobingiz to'lov amalga oshirilmaganligi sababli vaqtincha bloklangan. Tizimdan foydalanishni davom ettirish uchun to'lovni amalga oshiring.
                            </p>
                        </div>
                    </div>

                    {/* Credit Card Graphic */}
                    <div className="p-5 rounded-lg bg-zinc-900 border border-zinc-800 text-left relative overflow-hidden group">
                        <div className="relative z-10 space-y-5">
                            <div className="flex justify-between items-start">
                                <HiOutlineCreditCard className="w-6 h-6 text-zinc-500" />
                                <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest">Karta orqali to'lov</span>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest block">Karta raqami</span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(paymentDetails.cardNumber);
                                        toast.success("Karta raqami nusxalandi");
                                    }}
                                    className="text-lg font-bold text-white tracking-widest hover:text-[#0066FF] transition-colors text-left w-full"
                                >
                                    {paymentDetails.cardNumber.replace(/(.{4})/g, '$1 ')}
                                </button>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest block">Karta egasi</span>
                                    <p className="text-xs font-semibold text-[#F5F5F5] uppercase tracking-wide">{paymentDetails.cardName}</p>
                                </div>
                                <span className="text-[9px] font-medium text-zinc-500 italic">Chekni adminga yuboring</span>
                            </div>
                        </div>
                    </div>

                    {/* Click Payment Option */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-[1px] bg-zinc-800"></div>
                            <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest">Yoki</span>
                            <div className="flex-1 h-[1px] bg-zinc-800"></div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/60 border border-zinc-800/60 opacity-60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-zinc-800 rounded flex items-center justify-center p-1.5">
                                    <img src={clickLogo} alt="Click" className="w-full h-full object-contain grayscale" />
                                </div>
                                <div className="text-left space-y-0.5">
                                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest">Click orqali to'lov</span>
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm font-bold text-zinc-400">{(user?.oylikTolov || user?.kurs?.narx || 0).toLocaleString()} UZS</p>
                                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[8px] font-semibold text-zinc-400 uppercase tracking-widest">Tez kunda</span>
                                    </div>
                                </div>
                            </div>
                            <HiOutlineLockClosed className="w-5 h-5 text-zinc-650" />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={handleRefresh}
                            className="py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-zinc-700/60"
                        >
                            <HiOutlineRefresh className="w-4 h-4" />
                            <span>Yangilash</span>
                        </button>
                        <button
                            onClick={logout}
                            className="py-2.5 rounded-lg bg-red-650/15 hover:bg-red-650/25 text-red-500 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-red-500/20"
                        >
                            <HiOutlineLogout className="w-4 h-4" />
                            <span>Chiqish</span>
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-widest">
                        InFast CRM &bull; 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentRequired;
