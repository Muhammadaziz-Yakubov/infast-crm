import React from 'react';
import { useMarketing } from '../../context/MarketingContext';
import { motion } from 'framer-motion';
import {
    HiOutlineFilter,
    HiOutlineTrendingUp,
    HiOutlineArrowNarrowDown,
    HiOutlineThumbUp,
    HiOutlineExclamation,
    HiOutlineLightBulb
} from 'react-icons/hi';

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

const FunnelAnalytics = () => {
    const { funnelData } = useMarketing();
    const { impressions, leads, trials, students } = funnelData;

    // Calculate conversion rates
    const adToLead = ((leads / impressions) * 100).toFixed(1);
    const leadToTrial = ((trials / leads) * 100).toFixed(1);
    const trialToStudent = ((students / trials) * 100).toFixed(1);
    const overallConversion = ((students / impressions) * 100).toFixed(2);

    const funnelStages = [
        { name: '1. Reklama Namoyishi', count: impressions, pct: 100, label: 'Barcha auditoriya ko\'rishi', color: 'from-blue-600 to-blue-500', width: 'w-full' },
        { name: '2. Qabul Qilingan Leadlar', count: leads, pct: adToLead, label: `Ko'rishlardan leadga: ${adToLead}%`, color: 'from-indigo-600 to-indigo-500', width: 'w-[80%]' },
        { name: '3. Sinov Darsiga Kelganlar', count: trials, pct: ((trials / impressions) * 100).toFixed(1), label: `Leadlardan sinov darsiga: ${leadToTrial}%`, color: 'from-purple-600 to-purple-500', width: 'w-[60%]' },
        { name: '4. O\'quvchi Bo\'lganlar', count: students, pct: ((students / impressions) * 100).toFixed(1), label: `Sinov darsidan o'quvchiga: ${trialToStudent}%`, color: 'from-emerald-600 to-emerald-500', width: 'w-[40%]' }
    ];

    // Auto generated analysis recommendations
    const getRecommendations = () => {
        const list = [];
        if (Number(adToLead) < 8) {
            list.push({
                type: 'critical',
                title: 'Reklama klik koeffitsiyenti (CTR) past',
                text: 'Reklama kreativlari yoki maqsadli auditoriya sozlamalarini qayta ko\'rib chiqing. Telegram va Instagram uchun taklif matnini jozibadorroq qiling.'
            });
        } else {
            list.push({
                type: 'success',
                title: 'Reklama qiziqishi juda yaxshi!',
                text: 'Hozirgi kreativlar va auditoriya kombinatsiyasi to\'g\'ri ishlamoqda, budjetni oshirish tavsiya etiladi.'
            });
        }

        if (Number(leadToTrial) < 30) {
            list.push({
                type: 'warning',
                title: 'Leadlar bilan aloqa sifati sust',
                text: 'Menejerlarning leadlarga telefon qilish tezligini oshiring (maksimal 15 daqiqa). Auto follow-up SMS shablonlarini faollashtiring.'
            });
        }

        if (Number(trialToStudent) < 45) {
            list.push({
                type: 'warning',
                title: 'Sinov darsidan o\'quvchiga aylanish past',
                text: 'Sinov darsi metodologiyasini takomillashtiring. O\'qituvchilarning dars o\'tish mahorati va taqdimot sifatini nazorat qiling.'
            });
        } else {
            list.push({
                type: 'success',
                title: 'Ajoyib sotuv va ta\'lim sifati!',
                text: 'Sinov darsiga kelgan deyarli har 2 kishidan biri kursni sotib olmoqda. Guruhlar sonini kengaytirishga tayyorlaning.'
            });
        }

        return list;
    };

    const recommendations = getRecommendations();

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
        >
            {/* Visual Funnel Column */}
            <motion.div
                variants={itemVariants}
                className="xl:col-span-7 bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col justify-between"
            >
                <div className="space-y-1 mb-8">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">Savdo voronkasi (Sales Funnel)</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase">Mijozlar aylanish bosqichlari</p>
                </div>

                {/* Funnel chart stacking wrapper */}
                <div className="space-y-5 flex flex-col items-center py-6 w-full">
                    {funnelStages.map((stage, idx) => (
                        <React.Fragment key={idx}>
                            {/* Funnel Stage block */}
                            <div className={`${stage.width} flex flex-col items-center transition-all duration-500 hover:scale-[1.02]`}>
                                <div className={`w-full bg-gradient-to-r ${stage.color} p-4 rounded-2xl md:rounded-3xl text-white shadow-lg text-center relative overflow-hidden group`}>
                                    {/* Subtle background glow */}
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    
                                    <div className="flex items-center justify-between px-2 md:px-6 relative z-10">
                                        <div className="text-left">
                                            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-wider opacity-90">{stage.name}</h4>
                                            <p className="text-xs font-bold opacity-75 mt-0.5">{stage.label}</p>
                                        </div>
                                        <div className="text-right">
                                            <h5 className="text-sm md:text-xl font-black">{stage.count.toLocaleString('uz-UZ')}</h5>
                                            <p className="text-[9px] font-black uppercase tracking-widest opacity-85">{idx === 0 ? 'Boshlang\'ich' : `${stage.pct}%`}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Down Arrow separator (except last step) */}
                            {idx < funnelStages.length - 1 && (
                                <div className="flex flex-col items-center text-gray-300 dark:text-dark-750">
                                    <HiOutlineArrowNarrowDown className="w-5 h-5 animate-bounce" />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400">
                    <span>Umumiy voronka konversiyasi:</span>
                    <span className="text-emerald-500 font-black text-sm">{overallConversion}%</span>
                </div>
            </motion.div>

            {/* Recommendations & Detailed stats Column */}
            <motion.div
                variants={itemVariants}
                className="xl:col-span-5 space-y-6 flex flex-col"
            >
                {/* Stage Rates Cards */}
                <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 shadow-sm">
                    <h4 className="text-base font-black text-gray-900 dark:text-white mb-4 tracking-tight">Bosqichlararo Konversiya Foizlari</h4>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reklama → Lead</p>
                                <p className="text-sm font-black text-gray-800 dark:text-white mt-0.5">Namoyishlardan klik</p>
                            </div>
                            <span className="text-lg font-black text-blue-500">{adToLead}%</span>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead → Trial</p>
                                <p className="text-sm font-black text-gray-800 dark:text-white mt-0.5">Darsga kelganlar</p>
                            </div>
                            <span className="text-lg font-black text-indigo-500">{leadToTrial}%</span>
                        </div>

                        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trial → Talaba</p>
                                <p className="text-sm font-black text-gray-800 dark:text-white mt-0.5">Sotib olganlar</p>
                            </div>
                            <span className="text-lg font-black text-emerald-500">{trialToStudent}%</span>
                        </div>
                    </div>
                </div>

                {/* AI & Analytics recommendations list */}
                <div className="bg-gray-900 text-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl flex-1 flex flex-col justify-between">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 text-primary-400 rounded-xl">
                                <HiOutlineLightBulb className="w-5 h-5" />
                            </div>
                            <h4 className="text-base font-black tracking-tight">Tizim tavsiyalari va xulosasi</h4>
                        </div>

                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                            {recommendations.map((rec, i) => {
                                let badgeIcon = <HiOutlineThumbUp className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />;
                                if (rec.type === 'critical') badgeIcon = <HiOutlineExclamation className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />;
                                else if (rec.type === 'warning') badgeIcon = <HiOutlineExclamation className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />;

                                return (
                                    <div key={i} className="flex gap-3 items-start p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                                        {badgeIcon}
                                        <div>
                                            <h5 className="text-xs font-black leading-tight text-white">{rec.title}</h5>
                                            <p className="text-[10px] font-bold text-gray-400 mt-1 leading-normal">{rec.text}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                        InFast CRM AI Analytics Engine
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FunnelAnalytics;
