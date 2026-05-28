import React, { useState } from 'react';
import { useMarketing } from '../../context/MarketingContext';
import { motion } from 'framer-motion';
import {
    HiOutlineCog,
    HiOutlineChatAlt,
    HiOutlineMail,
    HiOutlineLockClosed,
    HiOutlineCheck,
    HiOutlineInformationCircle
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

const MarketingSettings = () => {
    const { settings, updateSettings } = useMarketing();

    // Local form states
    const [botToken, setBotToken] = useState(settings.botToken || '');
    const [botUsername, setBotUsername] = useState(settings.botUsername || '');
    const [smsProvider, setSmsProvider] = useState(settings.smsProvider || 'playmobile');
    const [smsSenderId, setSmsSenderId] = useState(settings.smsSenderId || '');
    const [smsApiKey, setSmsApiKey] = useState(settings.smsApiKey || '');
    const [autoFollowUp, setAutoFollowUp] = useState(settings.autoFollowUp !== false);
    const [followUpDays, setFollowUpDays] = useState(settings.followUpDays || 2);

    const handleSubmit = (e) => {
        e.preventDefault();
        updateSettings({
            botToken,
            botUsername,
            smsProvider,
            smsSenderId,
            smsApiKey,
            autoFollowUp,
            followUpDays: Number(followUpDays)
        });
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="max-w-2xl mx-auto"
        >
            <motion.div
                variants={itemVariants}
                className="bg-white dark:bg-dark-900 border border-gray-150 dark:border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-sm"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tight">Marketing Sozlamalari</h3>
                        <p className="text-xs text-gray-500 font-bold uppercase">Uchinchi tomon API xizmatlari va integratsiyalar</p>
                    </div>

                    {/* Section 1: Telegram Bot Integration */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <h4 className="text-sm font-black uppercase tracking-wider text-primary-500 flex items-center gap-2">
                            <HiOutlineChatAlt className="w-5 h-5" />
                            Telegram Bot Sozlamalari
                        </h4>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Bot Token API</label>
                                <input
                                    type="password"
                                    placeholder="123456789:AAF..."
                                    value={botToken}
                                    onChange={(e) => setBotToken(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-55 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Bot Username (Link)</label>
                                <input
                                    type="text"
                                    placeholder="@infast_crm_leads_bot"
                                    value={botUsername}
                                    onChange={(e) => setBotUsername(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-55 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: SMS Gateway Integration */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <h4 className="text-sm font-black uppercase tracking-wider text-primary-500 flex items-center gap-2">
                            <HiOutlineMail className="w-5 h-5" />
                            SMS Provayder Integratsiyasi
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">SMS Gateway provayderi</label>
                                <select
                                    value={smsProvider}
                                    onChange={(e) => setSmsProvider(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-dark-800 border-none text-sm text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                                >
                                    <option value="playmobile">PlayMobile (Mobiuz)</option>
                                    <option value="eskiz">Eskiz.uz</option>
                                    <option value="twilio">Twilio API</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Sender ID (Sarlavha)</label>
                                <input
                                    type="text"
                                    placeholder="INFAST_ACAD"
                                    value={smsSenderId}
                                    onChange={(e) => setSmsSenderId(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-55 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Gateway Maxfiy API kaliti (Key)</label>
                            <input
                                type="password"
                                placeholder="api_key_xxxxxxxxxxxxxxxxxxx"
                                value={smsApiKey}
                                onChange={(e) => setSmsApiKey(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-2xl bg-gray-55 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Section 3: Follow-Up Settings */}
                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-white/5">
                        <h4 className="text-sm font-black uppercase tracking-wider text-primary-500 flex items-center gap-2">
                            <HiOutlineCog className="w-5 h-5" />
                            Avtomatik Follow-Up va Eslatmalar
                        </h4>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-dark-800">
                            <div className="space-y-1 pr-2">
                                <p className="text-xs font-black text-gray-800 dark:text-white">Avtomatik follow-up dars taklifnomalari</p>
                                <p className="text-[10px] text-gray-400 font-bold leading-normal">Yangi arizalarga ma'lum vaqtdan so'ng avtomatik dars taklifi matnini yuborish.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={autoFollowUp}
                                onChange={(e) => setAutoFollowUp(e.target.checked)}
                                className="w-5 h-5 rounded-lg text-primary-500 focus:ring-primary-500 cursor-pointer"
                            />
                        </div>

                        {autoFollowUp && (
                            <div className="space-y-1 max-w-xs">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Kutish vaqti (Kun hisobida)</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={followUpDays}
                                    onChange={(e) => setFollowUpDays(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-2xl bg-gray-55 dark:bg-dark-800 border-none text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-primary-500 text-white font-extrabold text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <HiOutlineCheck className="w-4 h-4" />
                        Sozlamalarni Saqlash
                    </button>
                </form>

                <div className="mt-8 flex items-start gap-2.5 p-4 rounded-2xl bg-blue-500/5 text-blue-600 dark:text-blue-400 border border-blue-500/10 text-xs">
                    <HiOutlineInformationCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-extrabold uppercase tracking-wide leading-tight">Integratsiya yo'riqnomasi:</p>
                        <p className="font-bold opacity-80 mt-0.5">Ushbu token va parollar faqat tizim sozlamalarini boshqarish uchun lokal ravishda saqlanadi. Haqiqiy kanallarga ulashda backend muhit (.env) fayllari ham mos ravishda to'ldirilishi lozim.</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default MarketingSettings;
