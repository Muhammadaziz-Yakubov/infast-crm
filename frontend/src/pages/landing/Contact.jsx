import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle, Globe, Instagram, Linkedin, Github } from 'lucide-react';
import LandingLayout from './components/LandingLayout';

const Contact = () => {
    return (
        <LandingLayout>
            <section className="pt-32 pb-40 min-h-screen bg-black overflow-hidden relative">
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-600/5 blur-[150px] -z-10"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center mb-32">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black mb-10 tracking-[0.2em] uppercase"
                        >
                            <Send size={14} /> Aloqa Markazi
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-6xl md:text-9xl font-black mb-10 leading-[0.8] tracking-tighter uppercase italic"
                        >
                            BIZ BILAN <br /><span className="text-blue-500">BOG'LANING</span>
                        </motion.h1>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto italic">
                            Savollaringiz bormi yoki professional maslahat kerakmi?
                            Bizning mutaxassislarimiz sizga yordam berishga tayyor.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-24 items-start">
                        {/* Info Column */}
                        <div className="w-full lg:w-[40%] space-y-12">
                            <div className="space-y-10">
                                {[
                                    { title: "Shtab-kvartira", val: "Toshkent shahri, Chilonzor tumani, Bunyodkor ko'chasi, 23A", icon: <MapPin /> },
                                    { title: "Aloqa liniyasi", val: "+998 90 123 45 67", icon: <Phone /> },
                                    { title: "Elektron pochta", val: "info@infast.uz", icon: <Mail /> },
                                    { title: "Telegram", val: "@infast_academy", icon: <Send /> },
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ x: 10 }}
                                        className="flex items-start gap-8 group"
                                    >
                                        <div className="w-16 h-16 rounded-[1.2rem] bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-gray-500 text-[10px] font-black uppercase mb-2 tracking-[0.3em]">{item.title}</h4>
                                            <p className="text-white text-2xl font-black tracking-tight leading-tight">{item.val}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="pt-12 border-t border-white/5">
                                <h4 className="text-gray-500 text-[10px] font-black uppercase mb-8 tracking-[0.3em]">Ijtimoiy tarmoqlarimiz</h4>
                                <div className="flex gap-6">
                                    {[Instagram, Linkedin, Github, Globe].map((Icon, i) => (
                                        <a key={i} href="#" className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:text-blue-500 transition-all">
                                            <Icon size={24} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form Column */}
                        <div className="flex-1 w-full">
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="p-12 md:p-20 rounded-[4rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-3xl backdrop-blur-3xl relative"
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                                <h3 className="text-4xl font-black mb-12 text-white uppercase italic tracking-tighter">Xabar <span className="text-blue-500">Yuborish</span></h3>
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Sizning Ismingiz</label>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-gray-700" placeholder="Ism-sharifingizni kiriting" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Telefon Raqamingiz</label>
                                            <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-gray-700" placeholder="+998" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Qiziqqan Yo'nalishingiz</label>
                                        <select className="w-full bg-[#111] border border-white/10 rounded-2xl p-6 text-white font-bold outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer">
                                            <option>Frontend Engineering</option>
                                            <option>Backend Development</option>
                                            <option>UI/UX Product Design</option>
                                            <option>Fullstack Python & AI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-500 uppercase mb-3 block tracking-[0.2em]">Xabar Yoki Savolingiz</label>
                                        <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-gray-700" placeholder="Savollaringizni shu yerda qoldiring..."></textarea>
                                    </div>
                                    <button className="w-full py-7 bg-blue-600 hover:bg-blue-700 text-white font-black text-2xl rounded-[2rem] transition-all shadow-[0_25px_60px_-15px_rgba(37,99,235,0.4)] flex items-center justify-center gap-4 group">
                                        Ariza Yuborish
                                        <MessageCircle className="group-hover:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default Contact;
