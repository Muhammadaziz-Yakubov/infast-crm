import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import LandingLayout from './components/LandingLayout';

const Contact = () => {
    return (
        <LandingLayout>
            <section className="pt-32 pb-20">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-20">
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-5xl md:text-8xl font-black mb-10"
                        >
                            BIZ BILAN <span className="text-blue-500">BOG'LANING</span>
                        </motion.h1>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                            Sizda savollar bormi? Professional maslahat olish uchun quyidagi formani to'ldiring yoki biz bilan bog'laning.
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-16">
                        <div className="flex-1 space-y-8">
                            {[
                                { title: "Manzil", val: "Toshkent shahri, Chilonzor tumani, Bunyodkor ko'chasi", icon: <MapPin className="text-blue-500" /> },
                                { title: "Telefon", val: "+998 90 123 45 67", icon: <Phone className="text-blue-500" /> },
                                { title: "Email", val: "info@infast.uz", icon: <Mail className="text-blue-500" /> },
                                { title: "Telegram", val: "@infast_academy", icon: <Send className="text-blue-500" /> },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ x: 10 }}
                                    className="p-8 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-6"
                                >
                                    <div className="p-4 bg-blue-500/10 rounded-2xl">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-gray-500 text-sm font-bold uppercase mb-1 tracking-widest">{item.title}</h4>
                                        <p className="text-white text-xl font-bold">{item.val}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex-1">
                            <form className="p-10 md:p-14 rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/10 backdrop-blur-xl">
                                <h3 className="text-3xl font-black mb-10 text-white">Xabar jo'natish</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-sm font-bold text-gray-400 mb-2 block uppercase tracking-widest">Ismingiz</label>
                                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-blue-500 outline-none transition-all" placeholder="Ismingizni kiriting" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-400 mb-2 block uppercase tracking-widest">Telefon raqamingiz</label>
                                        <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-blue-500 outline-none transition-all" placeholder="+998" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-400 mb-2 block uppercase tracking-widest">Kursni tanlang</label>
                                        <select className="w-full bg-[#111] border border-white/10 rounded-2xl p-5 text-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                            <option>Frontend Development</option>
                                            <option>Backend Development</option>
                                            <option>UI/UX Design</option>
                                            <option>Python & AI</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-400 mb-2 block uppercase tracking-widest">Xabaringiz</label>
                                        <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-blue-500 outline-none transition-all" placeholder="Xabaringizni yozing"></textarea>
                                    </div>
                                    <button className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3">
                                        Ariza jo'natish <MessageCircle />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default Contact;
