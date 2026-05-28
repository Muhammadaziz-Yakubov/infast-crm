import React, { useState } from 'react';
import { useMarketing, mapStatusFromDB } from '../../context/MarketingContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineChatAlt2,
    HiOutlinePlus,
    HiOutlineTrash,
    HiOutlineLightningBolt,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineChevronRight,
    HiOutlineSave,
    HiOutlineCheck,
    HiOutlineAnnotation
} from 'react-icons/hi';

const channels = [
    { key: 'SMS', label: 'SMS Xabarnoma', icon: HiOutlinePhone, color: 'text-amber-500 bg-amber-500/10' },
    { key: 'Telegram', label: 'Telegram Bot', icon: HiOutlineChatAlt2, color: 'text-blue-500 bg-blue-500/10' },
    { key: 'Email', label: 'Email Xat', icon: HiOutlineMail, color: 'text-rose-500 bg-rose-500/10' }
];

const audienceOptions = ['Barchasi', 'Yangi', 'Aloqaga chiqilgan', 'Trial dars', 'Kutilyapti', 'O‘quvchi bo‘ldi', 'Bekor qilingan'];

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

const BroadcastSystem = () => {
    const { leads, templates, broadcastLogs, addTemplate, deleteTemplate, runBroadcast } = useMarketing();

    const [selectedChannel, setSelectedChannel] = useState('SMS');
    const [selectedAudience, setSelectedAudience] = useState('Barchasi');
    const [messageTitle, setMessageTitle] = useState('');
    const [messageContent, setMessageContent] = useState('');
    
    // Template creation state
    const [newTemplateTitle, setNewTemplateTitle] = useState('');
    const [newTemplateContent, setNewTemplateContent] = useState('');
    const [showAddTemplate, setShowAddTemplate] = useState(false);

    // Filtered count based on audience selection
    const getRecipientCount = () => {
        if (selectedAudience === 'Barchasi') return leads.length;
        return leads.filter(l => mapStatusFromDB(l.status) === selectedAudience).length;
    };

    const recipientCount = getRecipientCount();

    // Placeholder inserters
    const insertPlaceholder = (ph) => {
        setMessageContent(prev => prev + ph);
    };

    const handleApplyTemplate = (tpl) => {
        setMessageContent(tpl.content);
        if (!messageTitle) {
            setMessageTitle(tpl.title);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!messageTitle || !messageContent) {
            alert('Sarlavha va Xabar matni kiritilishi shart!');
            return;
        }

        runBroadcast(selectedChannel, selectedAudience, messageTitle, messageContent);

        // Reset composer
        setMessageTitle('');
        setMessageContent('');
    };

    const handleSaveTemplate = (e) => {
        e.preventDefault();
        if (!newTemplateTitle || !newTemplateContent) return;
        addTemplate(newTemplateTitle, newTemplateContent);
        setNewTemplateTitle('');
        setNewTemplateContent('');
        setShowAddTemplate(false);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 xl:grid-cols-12 gap-8"
        >
            {/* Broadcast Composer */}
            <motion.div
                variants={itemVariants}
                className="xl:col-span-7 bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-sm flex flex-col justify-between"
            >
                <form onSubmit={handleSend} className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">Kompaniya yuborish paneli</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase">Auditoriyaga ommaviy xabarnomalar tarqatish</p>
                    </div>

                    {/* Channel Selector */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Tarqatish kanali</label>
                        <div className="grid grid-cols-3 gap-3">
                            {channels.map((chan) => (
                                <button
                                    key={chan.key}
                                    type="button"
                                    onClick={() => setSelectedChannel(chan.key)}
                                    className={`
                                        flex flex-col md:flex-row items-center gap-2 px-4 py-3 rounded-2xl border text-sm font-black transition-all
                                        ${selectedChannel === chan.key
                                            ? 'border-primary-500 bg-primary-500/5 text-primary-500 shadow-sm'
                                            : 'border-gray-150 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-dark-800 text-gray-600 dark:text-gray-400'
                                        }
                                    `}
                                >
                                    <span className={`p-1.5 rounded-xl ${chan.color}`}>
                                        <chan.icon className="w-4.5 h-4.5" />
                                    </span>
                                    <span>{chan.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audience Segment selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider font-extrabold">Auditoriya segmenti</label>
                            <select
                                value={selectedAudience}
                                onChange={(e) => setSelectedAudience(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                            >
                                {audienceOptions.map(aud => <option key={aud} value={aud}>{aud}</option>)}
                            </select>
                        </div>

                        {/* Estimated target size badge */}
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10 mt-5 md:mt-5 self-end">
                            <HiOutlineLightningBolt className="w-5 h-5 text-primary-500" />
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none">Mijozlar soni</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white mt-1">Taxminan {recipientCount} ta raqam</p>
                            </div>
                        </div>
                    </div>

                    {/* Message Composer Details */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Xabar sarlavhasi</label>
                            <input
                                type="text"
                                required
                                placeholder="Masalan, Bepul master-klass taklifnomasi"
                                value={messageTitle}
                                onChange={(e) => setMessageTitle(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-2xl bg-gray-55 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>

                        {/* Content text-area and placeholders tags */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Xabar matni</label>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => insertPlaceholder(' {name} ')}
                                        className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-800 text-[9px] font-black uppercase text-gray-600 dark:text-gray-300 hover:bg-primary-500/10 hover:text-primary-500 transition-colors"
                                    >
                                        + Ism tagi
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => insertPlaceholder(' {course} ')}
                                        className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-dark-800 text-[9px] font-black uppercase text-gray-600 dark:text-gray-300 hover:bg-primary-500/10 hover:text-primary-500 transition-colors"
                                    >
                                        + Kurs tagi
                                    </button>
                                </div>
                            </div>

                            <textarea
                                rows={5}
                                required
                                placeholder="Xabar matnini yozing..."
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl bg-gray-55 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-primary-500 text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <HiOutlineCheck className="w-4 h-4" />
                        Xabarnomani Yuborish
                    </button>
                </form>
            </motion.div>

            {/* Templates and Logs Column */}
            <motion.div
                variants={itemVariants}
                className="xl:col-span-5 space-y-6 flex flex-col"
            >
                {/* Message templates */}
                <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-between max-h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-black text-gray-900 dark:text-white tracking-tight">Shablonlar kutubxonasi</h4>
                        <button
                            onClick={() => setShowAddTemplate(!showAddTemplate)}
                            className="p-1 rounded-lg text-primary-500 bg-primary-500/5 hover:bg-primary-500/10 transition-colors"
                        >
                            <HiOutlinePlus className="w-4.5 h-4.5" />
                        </button>
                    </div>

                    {/* List of templates */}
                    <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
                        {templates.map(tpl => (
                            <div
                                key={tpl.id}
                                className="group flex items-start justify-between p-3 rounded-2xl bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-white/5 hover:border-primary-500/20 transition-all cursor-pointer"
                                onClick={() => handleApplyTemplate(tpl)}
                            >
                                <div className="flex-1 min-w-0 pr-2">
                                    <h5 className="text-xs font-black text-gray-900 dark:text-white line-clamp-1">{tpl.title}</h5>
                                    <p className="text-[10px] text-gray-400 mt-1 line-clamp-1 leading-normal font-medium">{tpl.content}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteTemplate(tpl.id);
                                    }}
                                    className="p-1 rounded bg-gray-200/50 dark:bg-dark-700 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <HiOutlineTrash className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Broadcast Logs */}
                <div className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 shadow-sm flex-1 flex flex-col">
                    <h4 className="text-base font-black text-gray-900 dark:text-white mb-4 tracking-tight">Yuborilgan xabarnomalar tarixi</h4>

                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1 custom-scrollbar">
                        {broadcastLogs.map((log) => (
                            <div key={log.id} className="p-3.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-white/5 flex justify-between items-center">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-lg bg-primary-500/10 text-primary-500 text-[8px] font-black uppercase">
                                            {log.channel}
                                        </span>
                                        <span className="text-[8px] font-bold text-gray-400">
                                            {new Date(log.date).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                    <h5 className="text-xs font-black text-gray-900 dark:text-white line-clamp-1">{log.title}</h5>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Auditoriya: {log.audience}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-black text-emerald-500">+{log.sentCount}</span>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Yuborildi</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Template Creation Modal */}
            <AnimatePresence>
                {showAddTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-dark-900 border border-gray-250 dark:border-white/5 rounded-[2.5rem] max-w-sm w-full overflow-hidden shadow-2xl p-6 md:p-8"
                        >
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5 mb-4">
                                <h4 className="text-base font-black text-gray-900 dark:text-white">Yangi shablon qo'shish</h4>
                                <button
                                    onClick={() => setShowAddTemplate(false)}
                                    className="p-1 rounded bg-gray-55 dark:bg-dark-800 text-gray-400"
                                >
                                    <HiOutlineX className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveTemplate} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Shablon nomi</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Masalan, Master-klass taklifi"
                                        value={newTemplateTitle}
                                        onChange={(e) => setNewTemplateTitle(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Xabar shablon matni</label>
                                    <textarea
                                        rows={4}
                                        required
                                        placeholder="Shablon matnini yozing. Matnda {name} va {course} kalit so'zlarini ishlatsangiz bo'ladi."
                                        value={newTemplateContent}
                                        onChange={(e) => setNewTemplateContent(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-2xl bg-gray-55 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3 rounded-2xl bg-primary-500 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                                >
                                    Shablonni Saqlash
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BroadcastSystem;
