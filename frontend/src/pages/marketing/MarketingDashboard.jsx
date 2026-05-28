import React from 'react';
import { useMarketing, mapStatusFromDB } from '../../context/MarketingContext';
import { motion } from 'framer-motion';
import {
    HiOutlineUserGroup,
    HiOutlineLightningBolt,
    HiOutlineCalendar,
    HiOutlineTrendingUp,
    HiOutlineShare,
    HiOutlineCash,
    HiOutlineArrowNarrowRight
} from 'react-icons/hi';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const MarketingDashboard = () => {
    const { leads, adSources, campaigns, loadingLeads } = useMarketing();

    // 1. Calculate statistics
    const totalLeads = leads.length;

    // Today's leads
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLeadsCount = leads.filter(l => new Date(l.createdAt) >= today).length;

    // Weekly leads (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    const weeklyLeadsCount = leads.filter(l => new Date(l.createdAt) >= sevenDaysAgo).length;

    // Conversion rate
    const convertedLeads = leads.filter(l => mapStatusFromDB(l.status) === 'O‘quvchi bo‘ldi').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

    // Best Source (by volume or conversion, let's find the source with highest leads)
    const bestSource = adSources.reduce((max, source) => source.leadsCount > max.leadsCount ? source : max, adSources[0] || { source: 'Noma\'lum' }).source;

    // Advertising Expenses
    const totalExpenses = adSources.reduce((sum, source) => sum + source.cost, 0);

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    // 2. Prepare Lead Growth Chart Data (Last 7 days)
    const getGrowthData = () => {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dateLabel = date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
            
            // Count leads on this day
            const startOfDay = new Date(date);
            startOfDay.setHours(0,0,0,0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23,59,59,999);

            const count = leads.filter(l => {
                const lDate = new Date(l.createdAt);
                return lDate >= startOfDay && lDate <= endOfDay;
            }).length;

            data.push({
                name: dateLabel,
                'Leadlar soni': count
            });
        }
        return data;
    };

    const growthData = getGrowthData();

    // 3. Prepare Source Performance Chart Data
    const sourceChartData = adSources.map(s => ({
        name: s.source,
        'Leadlar': s.leadsCount,
        'Konversiya (%)': s.conversion
    }));

    // Today's leads list
    const todayLeadsList = leads.filter(l => new Date(l.createdAt) >= today).slice(0, 5);

    const kpiStats = [
        { label: 'Jami Leadlar', value: totalLeads, desc: 'Barcha manbalardan', icon: HiOutlineUserGroup, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Bugungi Leadlar', value: todayLeadsCount, desc: 'Yangi kelib tushgan', icon: HiOutlineLightningBolt, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Haftalik Leadlar', value: weeklyLeadsCount, desc: 'Oxirgi 7 kunda', icon: HiOutlineCalendar, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Konversiya', value: `${conversionRate}%`, desc: 'O\'quvchiga aylangan', icon: HiOutlineTrendingUp, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Eng yaxshi manba', value: bestSource, desc: 'Leadlar hajmi bo\'yicha', icon: HiOutlineShare, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Reklama xarajatlari', value: totalExpenses > 1000000 ? `${(totalExpenses / 1000000).toFixed(1)}M` : formatMoney(totalExpenses), desc: 'Umumiy sarflangan', icon: HiOutlineCash, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' }
    ];

    if (loadingLeads) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-32 bg-gray-200 dark:bg-dark-800 rounded-3xl" />
                ))}
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 md:space-y-10"
        >
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {kpiStats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 transform active:scale-95"
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                <h3 className="text-xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">{stat.value}</h3>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">{stat.desc}</p>
                            </div>
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Growth Chart */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-sm"
                >
                    <div className="space-y-1 mb-6">
                        <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">Leadlar o'sish dinamikasi</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase">Oxirgi 7 kunlik ko'rsatkich</p>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#9CA3AF' }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', padding: '12px' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 800 }}
                                    labelStyle={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 800 }}
                                />
                                <Area type="monotone" dataKey="Leadlar soni" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Source Chart */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-sm"
                >
                    <div className="space-y-1 mb-6">
                        <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">Manbalar samaradorligi</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase">Leadlar hajmi va konversiya foizi</p>
                    </div>
                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sourceChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-5" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', padding: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                                    labelStyle={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 800 }}
                                />
                                <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 800, marginTop: '10px' }} />
                                <Bar dataKey="Leadlar" fill="#6366F1" radius={[8, 8, 0, 0]} barSize={20} />
                                <Bar dataKey="Konversiya (%)" fill="#10B981" radius={[8, 8, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Today's Leads Table Section */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-sm"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                        <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">Bugungi yangi leadlar</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase">Bugun ro'yxatdan o'tgan nomzodlar</p>
                    </div>
                    {todayLeadsCount > 0 && (
                        <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            {todayLeadsCount} ta Yangi
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    {todayLeadsList.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5">
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Ism-familiya</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Telefon</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Kurs</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Manba</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Sana</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Holat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {todayLeadsList.map((lead) => {
                                    const mappedStatus = mapStatusFromDB(lead.status);
                                    let badgeColor = 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400';
                                    if (mappedStatus === 'Yangi') badgeColor = 'bg-blue-500/10 text-blue-500';
                                    else if (mappedStatus === 'Aloqaga chiqilgan') badgeColor = 'bg-amber-500/10 text-amber-500';
                                    else if (mappedStatus === 'Trial dars') badgeColor = 'bg-purple-500/10 text-purple-500';
                                    else if (mappedStatus === 'O‘quvchi bo‘ldi') badgeColor = 'bg-emerald-500/10 text-emerald-500';

                                    return (
                                        <tr key={lead._id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                            <td className="py-4 text-sm font-black text-gray-900 dark:text-white">{lead.name}</td>
                                            <td className="py-4 text-sm font-bold text-gray-500 dark:text-gray-400">{lead.phone}</td>
                                            <td className="py-4 text-sm font-bold text-gray-500 dark:text-gray-400">{lead.course}</td>
                                            <td className="py-4">
                                                <span className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/5 text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">
                                                    {lead.source}
                                                </span>
                                            </td>
                                            <td className="py-4 text-xs font-bold text-gray-400">
                                                {new Date(lead.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                                                    {mappedStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-dark-850 flex items-center justify-center text-gray-300 dark:text-gray-600 mb-3">
                                <HiOutlineUserGroup className="w-8 h-8" />
                            </div>
                            <h4 className="text-sm font-black text-gray-700 dark:text-gray-300">Bugun yangi leadlar kelmadi</h4>
                            <p className="text-xs text-gray-400 mt-1 max-w-[280px]">Sayt yoki ijtimoiy tarmoqlardan yangi kelgan arizalar shu yerda chiqadi.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MarketingDashboard;
