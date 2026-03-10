import React from 'react';
import { motion } from 'framer-motion';
import { Code, Server, Layout, Database, Smartphone, Palette, ChevronRight, CheckCircle2 } from 'lucide-react';
import LandingLayout from './components/LandingLayout';

const programs = [
    {
        title: "Frontend Development",
        icon: <Layout className="text-blue-500" />,
        duration: "9 oy",
        desc: "Zamonaviy web-interfeyslarni React va dunyoga mashhur texnologiyalar orqali yarating.",
        tools: ["HTML/CSS", "JavaScript", "React.js", "Tailwind CSS"],
        price: "300,000 so'm/oy",
        color: "from-blue-600/20 to-blue-400/5"
    },
    {
        title: "Backend Development",
        icon: <Server className="text-green-500" />,
        duration: "5 oy",
        desc: "Murakkab tizimlar arxitekturasi, ma'lumotlar bazasi va server qismini mukammal o'rganing.",
        tools: ["Node.js", "Express", "PostgreSQL", "MongoDB"],
        price: "600,000 so'm/oy",
        color: "from-green-600/20 to-green-400/5"
    },
    {
        title: "UI/UX Design",
        icon: <Palette className="text-purple-500" />,
        duration: "4 oy",
        desc: "Foydalanuvchilar yoqtiradigan interfeyslar va qulay tajriba (UX) yaratish sirlari.",
        tools: ["Figma", "Adobe XD", "Principle", "User Research"],
        price: "400,000 so'm/oy",
        color: "from-purple-600/20 to-purple-400/5"
    },
    {
        title: "Fullstack Python",
        icon: <Database className="text-yellow-500" />,
        duration: "9 oy",
        desc: "Python tilida murakkab loyihalar va sun'iy intellekt asoslarini o'zlashtiring.",
        tools: ["Python", "Django", "PostgreSQL", "AI Basics"],
        price: "1,400,000 so'm/oy",
        color: "from-yellow-600/20 to-yellow-400/5"
    }
];

const Programs = () => {
    return (
        <LandingLayout>
            <section className="pt-32 pb-20 bg-black">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mb-20 text-center mx-auto">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-black mb-8"
                        >
                            BIZNING <span className="text-blue-500">KURSLAR</span>
                        </motion.h1>
                        <p className="text-gray-400 text-xl">
                            O'zingizga yoqqan yo'nalishni tanlang va professional karyerangizni boshlang.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {programs.map((program, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-1 bg-gradient-to-br ${program.color} rounded-[2rem] border border-white/10 group h-full`}
                            >
                                <div className="bg-[#0a0a0a] rounded-[1.9rem] p-10 h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                                            {program.icon}
                                        </div>
                                        <span className="px-4 py-1 rounded-full bg-white/5 text-xs font-bold border border-white/10 text-gray-400">
                                            Davomiyligi: {program.duration}
                                        </span>
                                    </div>

                                    <h3 className="text-3xl font-bold mb-4">{program.title}</h3>
                                    <p className="text-gray-400 mb-8 flex-grow">{program.desc}</p>

                                    <div className="mb-8">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-tighter mb-4">O'rgatiladi:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {program.tools.map((tool, i) => (
                                                <span key={i} className="px-3 py-1 rounded-lg bg-white/5 text-xs text-blue-400 border border-blue-500/20 font-medium">
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1 leading-none">Kurs narxi</p>
                                            <p className="text-xl font-black text-white">{program.price}</p>
                                        </div>
                                        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all group/btn flex items-center">
                                            Boshlash
                                            <ChevronRight className="ml-1 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default Programs;
