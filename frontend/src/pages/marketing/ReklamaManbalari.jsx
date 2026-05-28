import React from 'react';
import { useMarketing } from '../../context/MarketingContext';
import { motion } from 'framer-motion';
import {
    HiOutlineShare,
    HiOutlineTrendingUp,
    HiOutlineCash,
    HiOutlineInformationCircle,
    HiOutlineExternalLink
} from 'react-icons/hi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const ReklamaManbalari = () => {
    const { adSources } = useMarketing();

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    // Calculate overall summaries
    const totalExpenses = adSources.reduce((sum, s) => sum + s.cost, 0);
    const totalLeads = adSources.reduce((sum, s) => sum + s.leadsCount, 0);
    const averageROI = Math.round(adSources.reduce((sum, s) => sum + s.roi, 0) / adSources.length);

    // Chart data mapping
    const chartData = adSources.map(s => ({
        name: s.source,
        'Sarflangan Xarajat (k)': Math.round(s.cost / 1000),
        'ROI (%)': s.roi
    }));

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 md:space-y-8"
        >
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div variants={itemVariants} className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Umumiy reklama budjeti</p>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{formatMoney(totalExpenses)}</h3>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-500">
                        <HiOutlineCash className="w-6 h-6" />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Jami jalb qilingan leadlar</p>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">{totalLeads} ta</h3>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500">
                        <HiOutlineShare className="w-6 h-6" />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">O'rtacha ROI samaradorligi</p>
                        <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">+{averageROI}%</h3>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
                        <HiOutlineTrendingUp className="w-6 h-6" />
                    </div>
                </motion.div>
            </div>

            {/* Main ROI Comparison Graph */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-sm"
            >
                <div className="space-y-1 mb-6">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">Xarajatlar va ROI tahlili</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase">Sarflangan mablag'ga nisbatan daromad samaradorligi</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-5" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#9CA3AF' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#9CA3AF' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', padding: '12px' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 800 }}
                                labelStyle={{ color: '#9CA3AF', fontSize: '10px', fontWeight: 800 }}
                            />
                            <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 800, marginTop: '10px' }} />
                            <Bar dataKey="Sarflangan Xarajat (k)" fill="#EF4444" radius={[8, 8, 0, 0]} barSize={20} name="Xarajat (ming so'm)" />
                            <Bar dataKey="ROI (%)" fill="#10B981" radius={[8, 8, 0, 0]} barSize={20} name="ROI (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Sources Table */}
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-sm"
            >
                <div className="space-y-1 mb-6">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">Manbalar bo'yicha batafsil hisobot</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase">Har bir reklama kanali statistik ko'rsatkichlari</p>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5">
                                <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Reklama kanali</th>
                                <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Leadlar soni</th>
                                <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Konversiya</th>
                                <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Sarflangan mablag'</th>
                                <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Mijoz narxi (CPL)</th>
                                <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">ROI ko'rsatkich</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {adSources.map((source) => {
                                const cpl = source.leadsCount > 0 ? Math.round(source.cost / source.leadsCount) : 0;
                                let roiColor = 'bg-gray-150 text-gray-800 dark:bg-white/5 dark:text-gray-300';
                                if (source.roi >= 200) roiColor = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                                else if (source.roi >= 100) roiColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                                else if (source.roi < 100 && source.roi > 0) roiColor = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
                                else if (source.roi <= 0) roiColor = 'bg-red-500/10 text-red-600 dark:text-red-400';

                                return (
                                    <tr key={source.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-primary-500" />
                                                <span className="text-sm font-black text-gray-900 dark:text-white">{source.source}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm font-bold text-gray-900 dark:text-white">{source.leadsCount} ta</td>
                                        <td className="py-4 text-sm font-bold text-gray-500 dark:text-gray-400">{source.conversion}%</td>
                                        <td className="py-4 text-sm font-bold text-gray-500 dark:text-gray-400">{formatMoney(source.cost)}</td>
                                        <td className="py-4 text-sm font-bold text-gray-500 dark:text-gray-400">{formatMoney(cpl)}</td>
                                        <td className="py-4">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${roiColor}`}>
                                                {source.roi === 999 ? 'N/A' : `+${source.roi}%`}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex items-start gap-2.5 p-4 rounded-2xl bg-amber-500/5 text-amber-600 border border-amber-500/10 text-xs">
                    <HiOutlineInformationCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-extrabold uppercase tracking-wide leading-tight">Menejerlar diqqatiga:</p>
                        <p className="font-bold opacity-80 mt-0.5">ROI (Return on Investment) har bir talabaning markazda o'rtacha 800,000 so'm oylik to'lov amalga oshirishi va manba konversiyasi asosida hisoblangan.</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ReklamaManbalari;
