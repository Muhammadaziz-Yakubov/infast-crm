import { useState, useEffect } from 'react';
import { paymentAPI, studentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';
import {
    HiOutlineUserGroup, HiOutlineExclamationCircle, HiOutlineCash,
    HiOutlineTrendingUp, HiOutlineAcademicCap, HiOutlineBookOpen,
    HiOutlineArrowNarrowRight, HiOutlineQrcode
} from 'react-icons/hi';
import { QRCodeCanvas } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await paymentAPI.getDashboard();
            setData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSyncXP = async () => {
        const loadingToast = toast.loading("XP sinxronizatsiya qilinmoqda... 📀");
        try {
            await studentAPI.syncXP();
            toast.success("Barcha XP ballari tarixiy ma'lumotlar asosida muvaffaqiyatli yangilandi! 🏆", { id: loadingToast });
            fetchDashboard();
        } catch (err) {
            toast.error("Xatolik yuz berdi ❌", { id: loadingToast });
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    if (loading) return <LoadingSpinner text="Dashboard yuklanmoqda..." />;
    if (!data) return (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="w-24 h-24 bg-gray-50 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4">
                <HiOutlineExclamationCircle className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Ma'lumot topilmadi</h3>
        </div>
    );

    const stats = [
        {
            label: "Talabalar",
            value: data.umumiyOquvchilar,
            icon: HiOutlineUserGroup,
            bg: 'bg-blue-500/10',
            textColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            label: 'Qarzdorlar',
            value: data.qarzdorlar,
            icon: HiOutlineExclamationCircle,
            bg: 'bg-red-500/10',
            textColor: 'text-red-600 dark:text-red-400'
        },
        {
            label: 'Tushum',
            value: data.oyliqTushum > 1000000 ? `${(data.oyliqTushum / 1000000).toFixed(1)}M` : formatMoney(data.oyliqTushum),
            icon: HiOutlineCash,
            bg: 'bg-emerald-500/10',
            textColor: 'text-emerald-600 dark:text-emerald-400'
        },
        {
            label: 'Kutilmoqda',
            value: data.kutilayotganTushum > 1000000 ? `${(data.kutilayotganTushum / 1000000).toFixed(1)}M` : formatMoney(data.kutilayotganTushum),
            icon: HiOutlineTrendingUp,
            bg: 'bg-purple-500/10',
            textColor: 'text-purple-600 dark:text-purple-400'
        },
    ];

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Premium Welcome Header */}
            <div className="relative overflow-hidden group">
                <div className="relative z-10 bg-gray-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 transition-transform group-hover:rotate-45 duration-700">
                        <HiOutlineTrendingUp className="w-48 h-48" />
                    </div>
                    <div className="relative z-20 space-y-4 max-w-xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                            System Overview • {new Date().toLocaleDateString('uz', { month: 'long', day: 'numeric' })}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                            Boshqaruv <span className="text-primary-400">Markaziga</span> xush kelibsiz
                        </h1>
                        <p className="text-gray-400 font-medium md:text-lg">Bugungi asosiy ko'rsatkichlar va markazning holati bilan tanishing</p>
                    </div>
                </div>
            </div>

            {/* Mobile Optimized Stats Grid (2 columns on mobile) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-dark-800 rounded-3xl p-5 md:p-8 border border-gray-100 dark:border-white/5 
                        shadow-sm hover:shadow-xl transition-all duration-300 transform active:scale-95"
                    >
                        <div className={`inline-flex p-2.5 md:p-3 rounded-2xl ${stat.bg} mb-4`}>
                            <stat.icon className={`w-5 h-5 md:w-6 md:h-6 ${stat.textColor}`} />
                        </div>
                        <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                        <h3 className="text-lg md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Content: Chart & Activities */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
                {/* Revenue Section */}
                <div className="xl:col-span-8 bg-white dark:bg-dark-800 rounded-[2.5rem] p-6 md:p-10 border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
                        <div className="space-y-1">
                            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">Oylik Statistika</h3>
                            <p className="text-sm font-medium text-gray-500">Tushumlar dinamikasi</p>
                        </div>
                        <div className="flex gap-2 bg-gray-50 dark:bg-dark-900 p-1.5 rounded-2xl">
                            <button className="px-5 py-2 rounded-xl bg-white dark:bg-dark-700 shadow-sm text-xs font-black">UZS</button>
                            <button className="px-5 py-2 text-gray-400 text-xs font-black">USD</button>
                        </div>
                    </div>

                    <div className="h-[280px] md:h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.oylikStatistika} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-5" />
                                <XAxis dataKey="oyNomi" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#9CA3AF' }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(99,102,241,0.05)', radius: [12, 12, 0, 0] }}
                                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', padding: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                                    itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 800 }}
                                    labelStyle={{ display: 'none' }}
                                    formatter={(value) => [formatMoney(value), 'Tushum']}
                                />
                                <Bar dataKey="tushum" radius={[10, 10, 0, 0]} barSize={35}>
                                    {data.oylikStatistika.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === data.oylikStatistika.length - 1 ? '#6366F1' : '#E2E8F0'} className="dark:fill-dark-700 hover:fill-primary-500 transition-colors" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activities Section */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black tracking-tight">So'nggi To'lovlar</h3>
                            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-primary-400">
                                <HiOutlineCash className="w-5 h-5" />
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
                            {data.songgiTolovlar.map((payment, i) => (
                                <div key={i} className="group flex items-center justify-between p-4 rounded-3xl bg-white/5 hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-black text-sm text-primary-400">
                                            {payment.oquvchi?.ism?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-white leading-tight">{payment.oquvchi?.ism}</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{payment.oquvchi?.kurs?.nomi}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-400">+{payment.summa > 1000000 ? `${(payment.summa / 1000000).toFixed(1)}M` : `${payment.summa / 1000}k`}</p>
                                        <p className="text-[10px] font-bold text-gray-600">{new Date(payment.sana).toLocaleDateString('uz', { day: 'numeric', month: 'short' })}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full mt-6 py-4 rounded-2xl bg-primary-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all">
                            Barcha to'lovlar
                        </button>
                    </div>
                </div>
            </div>

            {/* Central QR Code Section for Admin */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-12 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 transition-transform hover:scale-110 duration-700">
                        <HiOutlineQrcode className="w-64 h-64" />
                    </div>

                    <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                        <div className="space-y-6 flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                                Doimiy QR Tizimi
                            </div>
                            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight italic">
                                Markaz uchun <br /> <span className="text-white/80">Doimiy QR Kod</span>
                            </h2>
                            <p className="text-primary-100 font-medium md:text-lg max-w-xl">
                                Ushbu QR kodni chop etib, markaz eshigiga yoki darsxonalarga yopishtiring.
                                O'quvchilar o'z kabinetlari orqali skaner qilib, avtomatik davomatdan o'tadilar va coin yutadilar.
                            </p>

                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                                <button
                                    onClick={() => {
                                        const canvas = document.getElementById("central-qr");
                                        if (canvas) {
                                            const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                                            let downloadLink = document.createElement("a");
                                            downloadLink.href = pngUrl;
                                            downloadLink.download = "InFast_CRM_Central_QR.png";
                                            document.body.appendChild(downloadLink);
                                            downloadLink.click();
                                            document.body.removeChild(downloadLink);
                                        }
                                    }}
                                    className="px-8 py-4 rounded-2xl bg-white text-primary-600 font-black text-xs uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    QR Kodni Yuklab Olish (PNG)
                                </button>
                                <button
                                    onClick={handleSyncXP}
                                    className="px-8 py-4 rounded-2xl bg-white/10 text-white font-black text-xs uppercase tracking-widest border border-white/20 shadow-xl hover:bg-white/20 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <HiOutlineTrendingUp className="w-4 h-4" />
                                    XP Sinxronizatsiya
                                </button>
                                <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tizim Faol</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-4 bg-white/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative bg-white p-8 rounded-[3rem] shadow-3xl transform transition-transform group-hover:scale-105 duration-500">
                                <QRCodeCanvas
                                    id="central-qr"
                                    value={`${window.location.origin}/scan`}
                                    size={220}
                                    level="H"
                                    includeMargin={false}
                                    imageSettings={{
                                        src: "/favicon.ico",
                                        x: undefined,
                                        y: undefined,
                                        height: 40,
                                        width: 40,
                                        excavate: true,
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Dashboard;
