import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Code, Users, Rocket, Target, Award, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingLayout from './components/LandingLayout';
import Scene3D from './components/Scene3D';

const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <Scene3D />

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold mb-6 backdrop-blur-sm"
                >
                    🚀 O'zbekistondagi Eng Kuchli IT-Akademiya
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-5xl md:text-8xl font-black mb-6 leading-tight"
                >
                    KELAJAKNI <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                        BIZ BILAN QURING
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    InFast Academy — bu shunchaki o'quv markazi emas. Bu sizning IT olamidagi
                    professional faoliyatingizni boshlash uchun eng ishonchli parvoz maydoningizdir.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-6"
                >
                    <Link
                        to="/programs"
                        className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl shadow-blue-500/25 flex items-center group"
                    >
                        Kurslarni ko'rish
                        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        to="/contact"
                        className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all duration-300 backdrop-blur-md border border-white/10"
                    >
                        Maslahat olish
                    </Link>
                </motion.div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
                <div className="w-1 h-12 rounded-full bg-gradient-to-b from-blue-500 to-transparent"></div>
            </div>
        </section>
    );
};

const Stats = () => {
    const stats = [
        { label: 'Bitiruvchilar', value: '2,000+', icon: <Users className="text-blue-500" /> },
        { label: 'Mavjud Kurslar', value: '12+', icon: <Code className="text-purple-500" /> },
        { label: 'Ishga Kirganlar', value: '95%', icon: <Award className="text-pink-500" /> },
        { label: 'Yillik Tajriba', value: '5+', icon: <Target className="text-blue-400" /> },
    ];

    return (
        <section className="py-20 relative border-y border-white/5 bg-black/50 backdrop-blur-sm">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="text-center"
                        >
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                {stat.icon}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</h3>
                            <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Features = () => {
    const features = [
        {
            title: "Professional Mentorlar",
            desc: "Sizga sohadagi eng kuchli developerlar va dizaynerlar dars berishadi.",
            icon: <Star className="text-yellow-500" />
        },
        {
            title: "Real Loyihalar",
            desc: "Darslar faqat nazariya emas, balki real buyurtmalar ustida ishlash orqali o'tiladi.",
            icon: <Rocket className="text-blue-500" />
        },
        {
            title: "Ish Bilan Ta'minlash",
            desc: "Eng yaxshi o'quvchilarimizni hamkor kompaniyalarga ishga tavsiya qilamiz.",
            icon: <Award className="text-green-500" />
        }
    ];

    return (
        <section className="py-32 bg-black">
            <div className="container mx-auto px-6">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">Nima uchun <span className="text-blue-500">InFast Academy</span>?</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">Biz o'quvchilarimizga faqatgina bilim emas, balki kelajakda kerak bo'ladigan barcha tajribani ham beramiz.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -10 }}
                            className="p-10 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 hover:border-blue-500/30 transition-all duration-300"
                        >
                            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8">
                                {f.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    return (
        <LandingLayout>
            <Hero />
            <Stats />
            <Features />
        </LandingLayout>
    );
};

export default Home;
