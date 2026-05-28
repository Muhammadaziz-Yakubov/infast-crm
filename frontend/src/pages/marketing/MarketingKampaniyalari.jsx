import React, { useState } from 'react';
import { useMarketing } from '../../context/MarketingContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlinePlus,
    HiOutlineCalendar,
    HiOutlineCash,
    HiOutlineSpeakerphone,
    HiOutlineTrash,
    HiOutlinePencilAlt,
    HiOutlineX,
    HiOutlineViewGrid,
    HiOutlineViewList,
    HiOutlineChevronRight,
    HiOutlineTag
} from 'react-icons/hi';

const platforms = ['Telegram', 'Instagram', 'TikTok', 'YouTube', 'Website', 'Offline'];
const statuses = ['Rejalashtirilgan', 'Faol', 'Yakunlangan'];

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

const MarketingKampaniyalari = () => {
    const { campaigns, addCampaign, updateCampaign, deleteCampaign } = useMarketing();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [showModal, setShowModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);

    // Form inputs state
    const [formData, setFormData] = useState({
        name: '',
        platform: platforms[0],
        budget: '',
        startDate: '',
        endDate: '',
        status: statuses[0]
    });

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.budget || !formData.startDate || !formData.endDate) {
            alert('Barcha maydonlarni to\'ldirish shart!');
            return;
        }

        const campData = {
            name: formData.name,
            platform: formData.platform,
            budget: Number(formData.budget),
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: formData.status
        };

        if (editingCampaign) {
            updateCampaign(editingCampaign.id, campData);
        } else {
            addCampaign(campData);
        }

        setShowModal(false);
        setEditingCampaign(null);
    };

    const handleEditClick = (campaign) => {
        setEditingCampaign(campaign);
        setFormData({
            name: campaign.name,
            platform: campaign.platform,
            budget: campaign.budget,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            status: campaign.status
        });
        setShowModal(true);
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Haqiqatdan ham ushbu kampaniyani o\'chirib tashlamoqchimisiz?')) {
            deleteCampaign(id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-3xl p-5 shadow-sm">
                <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">Reklama Kampaniyalari</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase">Kampaniyalarni rejalashtirish va boshqarish</p>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="flex bg-gray-50 dark:bg-dark-800 p-1 rounded-2xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-dark-700 text-primary-500 shadow-sm' : 'text-gray-400'}`}
                            title="Karta ko'rinishi"
                        >
                            <HiOutlineViewGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-dark-700 text-primary-500 shadow-sm' : 'text-gray-400'}`}
                            title="Ro'yxat ko'rinishi"
                        >
                            <HiOutlineViewList className="w-5 h-5" />
                        </button>
                    </div>

                    <button
                        onClick={() => {
                            setFormData({
                                name: '',
                                platform: platforms[0],
                                budget: '',
                                startDate: '',
                                endDate: '',
                                status: statuses[0]
                            });
                            setEditingCampaign(null);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        Yangi Kampaniya
                    </button>
                </div>
            </div>

            {/* View container */}
            {viewMode === 'grid' ? (
                /* Cards Grid View */
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                    {campaigns.map((camp) => {
                        let statusColor = 'bg-gray-100 text-gray-700';
                        if (camp.status === 'Faol') statusColor = 'bg-emerald-500/10 text-emerald-500';
                        else if (camp.status === 'Rejalashtirilgan') statusColor = 'bg-blue-500/10 text-blue-500';

                        return (
                            <motion.div
                                key={camp.id}
                                variants={itemVariants}
                                className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative group"
                            >
                                <div className="space-y-4">
                                    {/* Platform Tag and Actions */}
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1 rounded-xl bg-gray-100 dark:bg-white/5 text-[10px] font-black uppercase text-gray-500 dark:text-gray-300">
                                            {camp.platform}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${statusColor}`}>
                                            {camp.status}
                                        </span>
                                    </div>

                                    {/* Campaign details */}
                                    <div className="space-y-2">
                                        <h4 className="text-base font-black text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors line-clamp-1">{camp.name}</h4>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                            <HiOutlineCalendar className="w-4 h-4" />
                                            <span>{camp.startDate} dan {camp.endDate} gacha</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                            <HiOutlineCash className="w-4 h-4" />
                                            <span>Budjet: <strong className="text-gray-800 dark:text-gray-200">{formatMoney(camp.budget)}</strong></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Natijalar</p>
                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{camp.result}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleEditClick(camp)}
                                            className="p-1.5 rounded-xl bg-gray-55 dark:bg-dark-800 text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                                        >
                                            <HiOutlinePencilAlt className="w-4.5 h-4.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(camp.id)}
                                            className="p-1.5 rounded-xl bg-gray-55 dark:bg-dark-800 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                        >
                                            <HiOutlineTrash className="w-4.5 h-4.5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            ) : (
                /* List Table View */
                <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-white/5">
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Kampaniya nomi</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Platforma</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Budjet</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Muddati</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Natijalar</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider">Holat</th>
                                    <th className="pb-4 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {campaigns.map((camp) => {
                                    let statusColor = 'bg-gray-100 text-gray-700';
                                    if (camp.status === 'Faol') statusColor = 'bg-emerald-500/10 text-emerald-500';
                                    else if (camp.status === 'Rejalashtirilgan') statusColor = 'bg-blue-500/10 text-blue-500';

                                    return (
                                        <tr key={camp.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/5 transition-all">
                                            <td className="py-4 text-sm font-black text-gray-900 dark:text-white">{camp.name}</td>
                                            <td className="py-4">
                                                <span className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-white/5 text-[10px] font-black uppercase text-gray-600 dark:text-gray-300">
                                                    {camp.platform}
                                                </span>
                                            </td>
                                            <td className="py-4 text-sm font-bold text-gray-500 dark:text-gray-400">{formatMoney(camp.budget)}</td>
                                            <td className="py-4 text-xs font-bold text-gray-400">{camp.startDate} / {camp.endDate}</td>
                                            <td className="py-4 text-sm font-bold text-gray-700 dark:text-gray-300">{camp.result}</td>
                                            <td className="py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColor}`}>
                                                    {camp.status}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(camp)}
                                                        className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-800 text-gray-400 hover:text-primary-500 hover:bg-primary-500/10 transition-all"
                                                    >
                                                        <HiOutlinePencilAlt className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(camp.id)}
                                                        className="p-1.5 rounded-lg bg-gray-50 dark:bg-dark-800 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                                    >
                                                        <HiOutlineTrash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Campaign Form Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-dark-900 border border-gray-250 dark:border-white/5 rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-2xl"
                        >
                            {/* Header */}
                            <div className="p-6 md:p-8 pb-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {editingCampaign ? 'Kampaniyani Tahrirlash' : 'Yangi Kampaniya Yaratish'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingCampaign(null);
                                    }}
                                    className="p-2 rounded-xl bg-gray-55 dark:bg-dark-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
                                >
                                    <HiOutlineX className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body Form */}
                            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-4">
                                {/* Name */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Kampaniya nomi</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Kampaniya sarlavhasi (masalan, Yozgi Chegirma)"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Platform */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Platforma</label>
                                        <select
                                            value={formData.platform}
                                            onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                                        >
                                            {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>

                                    {/* Budget */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Budjet (so'm)</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder="500 000"
                                            value={formData.budget}
                                            onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Start Date */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Boshlanish sanasi</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.startDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tugash sanasi</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.endDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Holati</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none"
                                    >
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditingCampaign(null);
                                        }}
                                        className="px-5 py-2.5 rounded-2xl bg-gray-55 dark:bg-dark-800 text-gray-500 dark:text-gray-400 font-extrabold text-[10px] uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-dark-700 transition-all"
                                    >
                                        Bekor Qilish
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-2xl bg-primary-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                                    >
                                        Saqlash
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MarketingKampaniyalari;
