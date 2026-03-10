import React from 'react';
import { motion } from 'framer-motion';
import { Code, Globe, Linkedin, MessageCircle, Github, Award, Rocket, Database, Cpu } from 'lucide-react';
import LandingLayout from './components/LandingLayout';
import founderImg from '../../muhammadaziz.jpg';

const Team = () => {
    return (
        <LandingLayout>
            <section className="pt-32 pb-20 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-32">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-6xl md:text-9xl font-black mb-10 tracking-tighter"
                        >
                            BIZNING <span className="text-blue-500">JAMOA</span>
                        </motion.h1>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                            InFast Academy ortida turgan, sohani ichidan biladigan professional mutaxassislar.
                        </p>
                    </div>

                    {/* Founder Section */}
                    <div className="flex flex-col lg:flex-row gap-20 items-center mb-40">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="flex-1 relative group"
                        >
                            <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                            <div className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-white/10 to-transparent border border-white/20 overflow-hidden flex items-center justify-center">
                                <img
                                    src={founderImg}
                                    alt="Muhammadaziz Yakubov"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-bottom p-10 justify-end flex-col">
                                    <h4 className="text-white text-4xl font-black italic tracking-tighter">FOUNDER</h4>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="flex-1"
                        >
                            <h2 className="text-5xl md:text-7xl font-black mb-6">Muhammadaziz <br /><span className="text-blue-500">Yakubov</span></h2>
                            <p className="text-blue-400 font-bold uppercase tracking-widest mb-8">Asoschi & Bosh Mentor</p>

                            <div className="space-y-6 text-gray-400 text-lg leading-relaxed mb-10">
                                <p>
                                    InFast IT-Academy, InFast AI va Lumo AI platformalari asoschisi. IT sohasida 5 yildan ortiq professional tajribaga ega.
                                </p>
                                <p>
                                    Faoliyati davomida 20 tadan ortiq murakkab real loyihalarni muvaffaqiyatli yakunlagan va minglab soha vakillariga mentorlik qilgan.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-12">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h4 className="text-white font-black text-2xl mb-1">5+ Yil</h4>
                                    <p className="text-gray-500 text-sm">Tajriba</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                    <h4 className="text-white font-black text-2xl mb-1">20+</h4>
                                    <p className="text-gray-500 text-sm">Real Loyihalar</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <a href="#" className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all border border-white/10">
                                    <Linkedin size={24} />
                                </a>
                                <a href="#" className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-all border border-white/10">
                                    <Github size={24} />
                                </a>
                                <a href="#" className="px-8 h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white hover:bg-blue-700 transition-all">
                                    Bog'lanish
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Expertise Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-40">
                        {[
                            { title: "InFast IT-Academy", desc: "Sifatli IT ta'limi va professional kadrlar tayyorlash markazi.", icon: <Rocket className="text-blue-500" /> },
                            { title: "InFast AI", desc: "Sun'iy intellektga asoslangan biznes yechimlar va innovatsiyalar.", icon: <Cpu className="text-purple-500" /> },
                            { title: "Lumo AI", desc: "Kelajak texnologiyalari va avtomatlashtirilgan tizimlar platformasi.", icon: <Database className="text-indigo-500" /> },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all"
                            >
                                <div className="mb-8">{item.icon}</div>
                                <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default Team;
