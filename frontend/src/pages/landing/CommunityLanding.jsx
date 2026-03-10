import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Share2, Award, Heart, Star, Users } from 'lucide-react';
import LandingLayout from './components/LandingLayout';

const CommunityLanding = () => {
    return (
        <LandingLayout>
            <section className="pt-32 pb-20 bg-[#050505]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-8xl font-black mb-10"
                        >
                            BIZNING <span className="text-blue-500">HAMJAMIYAT</span>
                        </motion.h1>
                        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
                            InFast Academy o'quvchilari va bitiruvchilari bir-birlarini qo'llab-quvvatlaydigan va birgalikda rivojlanadigan katta oila.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {[
                            { name: "Doniyor Abdullayev", role: "Frontend Developer (Google)", text: "InFast menga nafaqat kod yozishni, balki loyihani oxirigacha yetkazishni o'rgatdi. Mentorumga minnatdorchilik bildiraman.", stars: 5 },
                            { name: "Malika Rasulova", role: "UI/UX Designer", text: "Kurs davomida o'z portfoliomni yig'dim va kurs tugamasidanoq ishga joylashdim. Muhit juda ajoyib!", stars: 5 },
                            { name: "Sardor Olimov", role: "Fullstack Developer", text: "Backend qismidagi murakkabliklarni oson tushuntirib berishgani menga yoqadi. Hozirda o'z startapim ustida ishlayapman.", stars: 5 },
                        ].map((testi, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10"
                            >
                                <div className="flex gap-1 mb-6">
                                    {[...Array(testi.stars)].map((_, j) => <Star key={j} size={16} className="fill-yellow-500 text-yellow-500" />)}
                                </div>
                                <p className="text-gray-300 italic mb-8 text-lg">"{testi.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
                                        {testi.name[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{testi.name}</h4>
                                        <p className="text-gray-500 text-sm">{testi.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="p-12 md:p-20 rounded-[3rem] bg-blue-600 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Share2 size={300} strokeWidth={1} />
                        </div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                            <div className="max-w-xl">
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Hamjamiyatimizga qo'shiling</h2>
                                <p className="text-blue-100 text-xl">Biz doimiy ravishda meetuplar, hackathonlar va coworking kunlarini tashkil qilamiz.</p>
                            </div>
                            <div className="flex gap-4">
                                <a href="https://t.me/infast_academy" target="_blank" className="px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-gray-100 transition-colors flex items-center gap-3">
                                    <MessageSquare /> Telegram Kanal
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default CommunityLanding;
