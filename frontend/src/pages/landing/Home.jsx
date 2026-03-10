import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Code, Users, Rocket, Target, Award, Star, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingLayout from './components/LandingLayout';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-8 backdrop-blur-md"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span>IT Dunyosiga Qisqa Yo'l</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-6xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tighter"
                >
                    ORZUDAGI <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500">
                        KARYERA
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-gray-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed"
                >
                    InFast Academy — bu shunchaki kurs emas. Bu Muhammadaziz Yakubov boshchiligidagi
                    tajribali jamoa tomonidan qurilgan professional IT ekotizimdir.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link
                        to="/programs"
                        className="w-full sm:w-auto px-12 py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-[0_20px_50px_rgba(37,99,235,0.3)] flex items-center justify-center group"
                    >
                        O'qishni boshlash
                        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        to="/contact"
                        className="w-full sm:w-auto px-12 py-5 bg-white/5 hover:bg-white/10 text-white font-black text-lg rounded-2xl transition-all duration-300 backdrop-blur-md border border-white/10 flex items-center justify-center"
                    >
                        Maslahat olish
                    </Link>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-center gap-8 md:gap-16 grayscale opacity-50"
                >
                    <span className="text-white font-black text-2xl italic tracking-tighter">InFast AI</span>
                    <span className="text-white font-black text-2xl italic tracking-tighter">Lumo AI</span>
                    <span className="text-white font-black text-2xl italic tracking-tighter">Google Dev</span>
                    <span className="text-white font-black text-2xl italic tracking-tighter">Meta Tech</span>
                </motion.div>
            </div>
        </section>
    );
};

const Features = () => {
    const features = [
        {
            title: "Individual Yondashuv",
            desc: "Har bir o'quvchining o'zlashtirish qobiliyatiga qarab maxsus metodika.",
            icon: <Users size={32} className="text-blue-500" />
        },
        {
            title: "Real Case-Studies",
            desc: "5+ yillik tajribaga ega Muhammadaziz Yakubovning real loyihalari ustida ishlash.",
            icon: <Code size={32} className="text-purple-500" />
        },
        {
            title: "Shaxsiy Brend",
            desc: "Dasturchi sifatida o'zingizni bozorda qanday sotishni o'rgatamiz.",
            icon: <Award size={32} className="text-orange-500" />
        },
        {
            title: "Tezkor Yordam",
            desc: "Mentorlarimiz 24/7 davomida barcha savollaringizga javob berishadi.",
            icon: <Zap size={32} className="text-yellow-500" />
        }
    ];

    return (
        <section className="py-32 relative bg-black">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-7xl font-black mb-6">NEGA AYAN <span className="text-blue-500">BIZ</span>?</h2>
                    <p className="text-gray-500 text-xl max-w-2xl mx-auto">Sizga shunchaki kod yozishni emas, muhandislik fikrlashini o'rgatamiz.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="p-10 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-blue-500/30 transition-all duration-500 group"
                        >
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                            <p className="text-gray-500 leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Results = () => {
    return (
        <section className="py-32 bg-[#080808] border-y border-white/5">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1">
                        <h2 className="text-5xl md:text-7xl font-black mb-8">RAQAMLARDA <br /><span className="text-blue-500">NATIJALAR</span></h2>
                        <div className="grid grid-cols-2 gap-8">
                            {[
                                { val: '20+', label: 'Real Loyihalar' },
                                { val: '5+', label: 'Yillik Tajriba' },
                                { val: '500+', label: 'Talabalar' },
                                { val: '95%', label: 'Ishga Joylashish' },
                            ].map((s, i) => (
                                <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10">
                                    <h4 className="text-4xl font-black text-white mb-2">{s.val}</h4>
                                    <p className="text-gray-500 font-bold uppercase tracking-tighter text-sm">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 relative">
                        <div className="p-12 rounded-[3.5rem] bg-blue-600 shadow-[0_0_100px_rgba(37,99,235,0.2)]">
                            <h3 className="text-3xl font-black text-white mb-6">Bitiruvchilarimiz qayerda ishlaydi?</h3>
                            <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                                Bizning bitiruvchilar nafaqat mahalliy, balki AQSH, Yevropa va Janubiy Koreya bozorlaridagi top kompaniyalarda faoliyat yuritishmoqda.
                            </p>
                            <div className="space-y-4">
                                {['EPAM Systems', 'Exadel', 'Payme', 'Uzum', 'Click'].map((company) => (
                                    <div key={company} className="flex items-center gap-3 text-white font-bold">
                                        <CheckCircle2 size={20} className="text-blue-200" />
                                        {company}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    return (
        <LandingLayout>
            <Hero />
            <Features />
            <Results />

            {/* CTA Section */}
            <section className="py-32 text-center">
                <div className="container mx-auto px-6">
                    <div className="p-16 md:p-32 rounded-[4rem] bg-gradient-to-t from-blue-600/20 to-transparent border border-white/5 relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-8xl font-black mb-10 leading-none">KELAJAKNI <br />BUGUNDAN BOSHLA</h2>
                            <Link to="/programs" className="inline-flex px-12 py-6 bg-white text-black font-black text-2xl rounded-2xl hover:bg-blue-600 hover:text-white transition-all transform hover:scale-105">
                                Hoziroq Ro'yxatdan O'tish
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default Home;
