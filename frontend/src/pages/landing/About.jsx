import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap, ShieldCheck, Globe, Cpu } from 'lucide-react';
import LandingLayout from './components/LandingLayout';

const About = () => {
    return (
        <LandingLayout>
            <section className="pt-32 pb-20 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex-1"
                        >
                            <h2 className="text-blue-500 font-bold tracking-widest uppercase mb-4">Bizning Missiya</h2>
                            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                                IT Olamiga <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">TEZKOR</span> YO'L
                            </h1>
                            <p className="text-gray-400 text-xl leading-relaxed mb-8">
                                InFast Academy 2020-yilda IT sohasida sifatli ta'lim berish va yoshlarni dunyo bozoriga olib chiqish maqsadida tashkil etilgan. Bizning ismimiz — "In Fast" (Tez kirish) — shuni anglatadiki, biz sizni minimal vaqt ichida maksimal natijaga olib chiqamiz.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-3xl font-black text-white mb-2">50+</h4>
                                    <p className="text-gray-500 text-sm">Hamkor kompaniyalar</p>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-white mb-2">10+</h4>
                                    <p className="text-gray-500 text-sm">Xalqaro sertifikatlar</p>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="flex-1 relative"
                        >
                            <div className="w-full aspect-square bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-[3rem] border border-white/10 flex items-center justify-center p-12">
                                <Cpu className="w-full h-full text-blue-500/50 animate-pulse" />
                            </div>
                            <div className="absolute -bottom-10 -left-10 p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl max-w-[200px]">
                                <Users className="text-blue-500 mb-4" />
                                <p className="text-sm font-bold text-white">Kuchli hamjamiyat va doimiy qo'llab-quvvatlash.</p>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Sifatli Ta'lim", desc: "Eng so'nggi texnologiyalar asosida tuzilgan darsliklar va metodikalar.", icon: <ShieldCheck /> },
                            { title: "Tezkor Natija", desc: "Vaqtingizni tejagan holda, eng kerakli bilimlarni amaliyotda o'rganing.", icon: <Zap /> },
                            { title: "Global Imkoniyat", desc: "Bizning bitiruvchilar nafaqat O'zbekistonda, balki xalqaro bozorlarda ishlamoqda.", icon: <Globe /> }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.02 }}
                                className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10"
                            >
                                <div className="text-blue-500 mb-6">{item.icon}</div>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default About;
