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
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px] animate-pulse-soft" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[120px] animate-pulse-soft" />

            <div className="relative w-full max-w-lg animate-fade-in">
                {/* Card */}
                <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 md:p-14 border border-white/10 shadow-3xl text-center space-y-8">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                            <HiOutlineLockClosed className="w-10 h-10 text-red-500 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Kechirasiz, {user?.fullName}!</h2>
                            <p className="text-sm font-bold text-gray-500 italic leading-relaxed">
                                Sizning hisobingiz to'lov amalga oshirilmaganligi sababli vaqtincha blocklangan.
                                Iltimos, to'lovni amalga oshirib, tizimdan to'liq foydalanish imkonini tiklang.
                            </p>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-gray-900 to-indigo-900 shadow-2xl relative overflow-hidden group text-left">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                        <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-start">
                                <HiOutlineCreditCard className="w-10 h-10 text-white/40" />
                                <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Kartaga tolov qilib chekni adminga tashlang</div>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest italic ml-1">Karta raqami</p>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(paymentDetails.cardNumber);
                                        toast.success("Karta raqami nusxalandi! ✨");
                                    }}
                                    className="text-2xl font-black text-white tracking-[0.1em] hover:text-primary-400 transition-colors text-left w-full"
                                >
                                    {paymentDetails.cardNumber.replace(/(.{4})/g, '$1 ')}
                                </button>
                            </div>

                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest italic ml-1">Karta egasi</p>
                                    <p className="text-lg font-black text-white uppercase italic">{paymentDetails.cardName}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center">
                                    <div className="w-6 h-4 bg-orange-500 rounded-sm opacity-50" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Click Payment Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-[1px] bg-white/10"></div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Yoki Click orqali</span>
                            <div className="flex-1 h-[1px] bg-white/10"></div>
                        </div>

                        <div
                            className="group relative flex items-center justify-between p-5 rounded-[2rem] bg-white/5 text-white/30 font-black overflow-hidden transition-all border border-white/5 cursor-not-allowed"
                        >
                            <div className="relative z-10 flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center p-2 grayscale opacity-50">
                                    <img src={clickLogo} alt="Click" className="w-full h-full object-contain" />
                                </div>
                                <div className="text-left">
                                    <p className="text-[10px] uppercase tracking-[0.2em] opacity-40">Click orqali to'lov</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xl font-black italic tracking-tight">{(user?.oylikTolov || user?.kurs?.narx || 0).toLocaleString()} UZS</p>
                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[8px] uppercase tracking-widest border border-amber-500/30">Soon</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex flex-col items-end">
                                <HiOutlineLockClosed className="w-8 h-8 opacity-20" />
                            </div>
                        </div>
                        
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic px-4">
                            Click orqali to'lov qilinganda hisobingiz avtomatik tarzda faollashadi.
                        </p>
                    </div>

                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic px-4">
                        Boshqa to'lov turlari uchun chekni administratorga yuboring.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleRefresh}
                            className="py-5 rounded-2xl bg-white/10 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-white/20 transition-all flex items-center justify-center gap-3"
                        >
                            <HiOutlineRefresh className="w-5 h-5 animate-spin-slow" />
                            Yangilash
                        </button>
                        <button
                            onClick={logout}
                            className="py-5 rounded-2xl bg-red-600/10 text-red-500 font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600/20 transition-all flex items-center justify-center gap-3"
                        >
                            <HiOutlineLogout className="w-5 h-5" />
                            Chiqish
                        </button>
                    </div>
                </div>

                <div className="mt-12 text-center opacity-30">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
                        Reserved &bull; InFast CRM &bull; 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentRequired;
