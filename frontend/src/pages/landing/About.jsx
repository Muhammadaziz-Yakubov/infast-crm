import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap, ShieldCheck, Globe, Cpu, Award, Rocket, CheckCircle2 } from 'lucide-react';
import LandingLayout from './components/LandingLayout';

const About = () => {
    return (
        <LandingLayout>
            <section className="pt-32 pb-20 overflow-hidden bg-black min-h-screen">
                <div className="container mx-auto px-6">
                    {/* Hero Section of About */}
                    <div className="flex flex-col lg:flex-row items-center gap-20 mb-40">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex-1"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black mb-10 tracking-widest uppercase">
                                <Rocket size={14} /> Biz Haqimizda
                            </div>
                            <h1 className="text-6xl md:text-9xl font-black mb-10 leading-[0.9] tracking-tighter uppercase italic">
                                Sifatga <span className="text-blue-500">asoslangan</span> ta'lim
                            </h1>
                            <p className="text-gray-400 text-xl leading-relaxed mb-10 max-w-xl">
                                InFast Academy — bu shunchaki o'quv markazi emas. Bu Muhammadaziz Yakubov tomonidan
                                asos solingan innovatsion IT markaz bo'lib, o'quvchilarga professional faoliyatda
                                kerak bo'ladigan barcha real ko'nikmalarni berishni maqsad qilgan.
                            </p>

                            <div className="grid grid-cols-2 gap-10">
                                <div>
                                    <h4 className="text-5xl font-black text-white mb-2">5+</h4>
                                    <p className="text-gray-500 font-bold uppercase tracking-tighter text-sm">Yillik Markaz Tajribasi</p>
                                </div>
                                <div>
                                    <h4 className="text-5xl font-black text-white mb-2">1000+</h4>
                                    <p className="text-gray-500 font-bold uppercase tracking-tighter text-sm">Muvaffaqiyatli Bitiruvchilar</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex-1 relative"
                        >
                            <div className="p-1 text-transparent bg-clip-border bg-gradient-to-br from-blue-500 to-purple-600 rounded-[4rem]">
                                <div className="bg-[#080808] rounded-[3.9rem] p-16 border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Cpu size={300} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-8 relative z-10">BIZNING PRINSIPLARIMIZ</h3>
                                    <div className="space-y-6 relative z-10">
                                        {[
                                            "Faqat amaliyotga yo'naltirilgan ta'lim",
                                            "Mentorlar bilan doimiy feedback",
                                            "Real loyihalar ustida ishlash",
                                            "Soft-skills va karyera maslahatlari",
                                            "Dunyo bozoriga chiqish imkoniyati"
                                        ].map((p, i) => (
                                            <div key={i} className="flex items-center gap-4 text-gray-400 font-bold">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Timeline / History */}
                    <div className="mb-40">
                        <h2 className="text-5xl md:text-7xl font-black text-center mb-24">BIZNING <span className="text-blue-500 italic">YO'LIMIZ</span></h2>
                        <div className="space-y-12 max-w-4xl mx-auto">
                            {[
                                {
                                    year: '2020', title: 'Tashkil topish', desc: 'InFast Academy kichik jamoa bilan IT sohasiga ilk qadamlarini qoydi' },
                                {
                                        year: '2021', title: 'Loyiha Kopayishi', desc: 'Muhammadaziz Yakubov boshchiligida 10 dan ortiq real loyihalar muvaffaqiyatli topshirildi.' },
                                { year: '2023', title: 'AI Davri', desc: 'InFast AI va Lumo AI platformalari tashkil etildi, oquvchilarga AI texnologiyalari orgatila boshlandi.' },
                                { year: '2024+', title: 'Global Kengayish', desc: 'Bitiruvchilarimiz xalqaro bozorlarga chiqishdi va dunyo kompaniyalarida ish boshladilar.' },
                            ].map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="flex gap-10 items-start"
                                >
                                    <div className="text-4xl font-black text-blue-500 whitespace-nowrap pt-1 italic">{step.year}</div>
                                    <div className="p-10 rounded-[2.5rem] bg-white/5 border border-white/10 flex-grow hover:border-blue-500/30 transition-all">
                                        <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{step.title}</h4>
                                        <p className="text-gray-500 text-lg">{step.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Certifications / Partners */}
                    <div className="text-center py-20 border-t border-white/5">
                        <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] mb-12">Ishonchli Hamkorlarimiz</h3>
                        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all">
                            <span className="text-4xl font-black text-white italic">CISCO</span>
                            <span className="text-4xl font-black text-white italic">REDHAT</span>
                            <span className="text-4xl font-black text-white italic">AZURE</span>
                            <span className="text-4xl font-black text-white italic">AWS</span>
                            <span className="text-4xl font-black text-white italic">JETBRAINS</span>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default About;
