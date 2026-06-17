import { useState, useEffect } from 'react';
import { paymentAPI, testAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    HiOutlineUserGroup, HiOutlineExclamationCircle, HiOutlineCash,
    HiOutlineLightningBolt, HiOutlineUserAdd, HiOutlineFire,
    HiOutlineClipboardList, HiOutlineCalendar, HiOutlineXCircle
} from 'react-icons/hi';
import { QRCodeCanvas } from 'qrcode.react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

const COLORS = ['#0066FF', '#00C853', '#FF9500', '#FF3B30', '#8E8E93', '#AF52DE'];

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [testWidgets, setTestWidgets] = useState(null);

    useEffect(() => {
        fetchDashboard();
        fetchTestWidgets();
    }, []);

    const fetchTestWidgets = async () => {
        try {
            const res = await testAPI.getDashboardWidgets();
            setTestWidgets(res.data.data);
        } catch (err) {
            console.error('Test widgetlarini yuklashda xatolik:', err);
        }
    };

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

    const formatMoney = (amount) => {
        if (!amount) return "0 so'm";
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    if (loading) return <LoadingSpinner text="Dashboard yuklanmoqda..." />;
    if (!data) return (
        <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
            <div className="w-16 h-16 bg-gray-55 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                <HiOutlineExclamationCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Ma'lumot topilmadi</h3>
        </div>
    );

    const stats = [
        {
            label: "Talabalar",
            value: data.umumiyOquvchilar,
            icon: HiOutlineUserGroup,
        },
        {
            label: 'Bugun Tushum',
            value: formatMoney(data.bugunTushum || 0),
            detail: `${data.bugunTolovlarSoni || 0} ta to'lov`,
            icon: HiOutlineLightningBolt,
        },
        {
            label: 'Oyliq Tushum',
            value: data.oyliqTushum > 1000000 ? `${(data.oyliqTushum / 1000000).toFixed(1)}M` : formatMoney(data.oyliqTushum),
            icon: HiOutlineCash,
        },
        {
            label: 'Yangi Leadlar',
            value: data.yangiLeadlar || 0,
            icon: HiOutlineUserAdd,
        },
    ];

    const leadChartData = data.leadStats?.map(item => ({
        name: item._id,
        value: item.count
    })) || [];

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Boshqaruv paneli</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1">Markaz ko'rsatkichlari va oylik statistika tahlili</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60 transition-all duration-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[11px] font-medium text-[#6B6B6B] dark:text-[#8A8A8A] uppercase tracking-wider">{stat.label}</span>
                            <stat.icon className="w-5 h-5 text-zinc-400" />
                        </div>
                        <h3 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">{stat.value}</h3>
                        {stat.detail && (
                            <p className="text-[11px] text-zinc-400 mt-1 uppercase tracking-tight">{stat.detail}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Test Tizimi Widgetlari */}
            {testWidgets && (
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-[#6B6B6B] dark:text-[#8A8A8A] uppercase tracking-wider">Test Tizimi Ko'rsatkichlari</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[11px] font-medium text-[#6B6B6B] dark:text-[#8A8A8A] uppercase tracking-wider">Bugungi testlar</span>
                                <HiOutlineClipboardList className="w-5 h-5 text-zinc-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">{testWidgets.bugungiTestlar || 0} ta</h3>
                            <p className="text-xs text-zinc-400 mt-1">Bugun faol yoki boshlanadigan</p>
                        </div>

                        <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[11px] font-medium text-[#6B6B6B] dark:text-[#8A8A8A] uppercase tracking-wider">Shu haftadagi testlar</span>
                                <HiOutlineCalendar className="w-5 h-5 text-zinc-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">{testWidgets.haftalikTestlar || 0} ta</h3>
                            <p className="text-xs text-zinc-400 mt-1">Joriy haftalik reja</p>
                        </div>

                        <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[11px] font-medium text-[#6B6B6B] dark:text-[#8A8A8A] uppercase tracking-wider">O'rtacha natija</span>
                                <HiOutlineFire className="w-5 h-5 text-[#0066FF]" />
                            </div>
                            <h3 className="text-2xl font-semibold text-[#0066FF] tracking-tight">{testWidgets.ortachaNatija || 0}%</h3>
                            <p className="text-xs text-zinc-400 mt-1">Barcha topshirilgan natijalar</p>
                        </div>

                        <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[11px] font-medium text-[#6B6B6B] dark:text-[#8A8A8A] uppercase tracking-wider">Topshirmaganlar soni</span>
                                <HiOutlineXCircle className="w-5 h-5 text-[#FF3B30]" />
                            </div>
                            <h3 className="text-2xl font-semibold text-[#FF3B30] tracking-tight">{testWidgets.topshirmaganlarSoni || 0} ta</h3>
                            <p className="text-xs text-zinc-400 mt-1">Faol testlar bo'yicha</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content: Chart & Activities */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Revenue Section */}
                <div className="xl:col-span-8 bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60">
                    <div className="mb-6">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Oylik statistika</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">Tushumlar dinamikasi (6 oylik)</p>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.oylikStatistika} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                                <XAxis dataKey="oyNomi" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,102,255,0.02)' }}
                                    contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 500 }}
                                    labelStyle={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}
                                    formatter={(value) => [formatMoney(value), 'Tushum']}
                                />
                                <Bar dataKey="tushum" radius={[6, 6, 0, 0]} barSize={28}>
                                    {data.oylikStatistika.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === data.oylikStatistika.length - 1 ? '#0066FF' : 'rgba(0, 102, 255, 0.15)'} className="hover:fill-[#0066FF] transition-colors" />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Payments Section */}
                <div className="xl:col-span-4 bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60 flex flex-col justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">So'nggi to'lovlar</h3>
                        <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1 scrollbar-none">
                            {data.songgiTolovlar.map((payment, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-zinc-900/40 last:border-b-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-medium text-xs text-[#0066FF] uppercase">
                                            {payment.oquvchi?.ism?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{payment.oquvchi?.ism}</p>
                                            <p className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wider truncate max-w-[120px]">{payment.oquvchi?.kurs?.nomi}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-[#00C853]">+{payment.summa > 1000000 ? `${(payment.summa / 1000000).toFixed(1)}M` : `${payment.summa / 1000}k`}</p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">{new Date(payment.sana).toLocaleDateString('uz')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Secondary Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Lead Status Chart */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Leadlar holati</h3>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={leadChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={75}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {leadChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Course Popularity Chart */}
                <div className="bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Kurslar mashhurligi</h3>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.kursStatistika} layout="vertical" margin={{ left: 20, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.06)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="nomi" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#888' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '13px' }}
                                />
                                <Bar dataKey="count" fill="#0066FF" radius={[0, 6, 6, 0]} barSize={14} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Leaders and QR Section */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Top Students Card */}
                <div className="xl:col-span-5 bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <HiOutlineFire className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Top talabalar</h3>
                    </div>

                    <div className="space-y-4 flex-1">
                        {data.topTalabalar?.slice(0, 5).map((student, i) => (
                            <div key={i} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-zinc-900/60 bg-gray-50/50 dark:bg-zinc-900/20">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white font-medium text-sm border border-gray-200 dark:border-zinc-700">
                                            {student.ism?.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{student.ism}</p>
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-wider">Reyting #{i + 1}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-amber-500">{student.coins} t</p>
                                    <p className="text-[10px] text-zinc-400 uppercase">Coins</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Central QR Code Card */}
                <div className="xl:col-span-7 bg-white dark:bg-[#111111] rounded-2xl p-6 border border-gray-100 dark:border-zinc-900/60 relative overflow-hidden flex flex-col justify-center">
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="space-y-4 flex-1 text-center md:text-left">
                            <h2 className="text-lg font-semibold tracking-tight text-gray-950 dark:text-white">
                                Markaz doimiy QR kodi
                            </h2>
                            <p className="text-sm text-zinc-500 max-w-sm">
                                O'quvchilar ushbu kodni skanerlash orqali darsda davomat qilishlari va tangalar to'plashlari mumkin.
                            </p>

                            <button
                                onClick={() => {
                                    const canvas = document.getElementById("central-qr");
                                    if (canvas) {
                                        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                                        let downloadLink = document.createElement("a");
                                        downloadLink.href = pngUrl;
                                        downloadLink.download = "InFast_CRM_QR.png";
                                        document.body.appendChild(downloadLink);
                                        downloadLink.click();
                                        document.body.removeChild(downloadLink);
                                    }
                                }}
                                className="btn-secondary"
                            >
                                QR Yuklab olish
                            </button>
                        </div>

                        <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white">
                            <QRCodeCanvas
                                id="central-qr"
                                value={`${window.location.origin}/scan`}
                                size={140}
                                level="H"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
