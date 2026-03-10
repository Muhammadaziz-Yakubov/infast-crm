import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Server, Layout, Database, Smartphone, Palette, ChevronRight, CheckCircle2, Bookmark } from 'lucide-react';
import LandingLayout from './components/LandingLayout';
import CourseModal from './components/CourseModal';

const programs = [
    {
        title: "Frontend Development",
        icon: <Layout className="text-blue-500" />,
        duration: "9 oy",
        desc: "Zamonaviy web-interfeyslarni dunyo standartlari darajasida yarating. Foydalanuvchi tajribasini (UX) kodingiz orqali boshqaring.",
        details: [
            "HTML5, CSS3 va Zamonaviy SASS/SCSS",
            "JavaScript (ES6+) chuqur o'rganish",
            "React.js eko-tizimi (Hooks, Context, Redux)",
            "Tailwind CSS va Responsive Design",
            "Real API lar bilan ishlash va Deployment"
        ],
        tools: ["HTML/CSS", "JS", "React", "Next.JS", "Git"],
        price: "900,000 so'm/oy",
        color: "from-blue-600/20 to-blue-400/5"
    },
    {
        title: "Backend (Node.js)",
        icon: <Server className="text-green-500" />,
        duration: "5 oy",
        desc: "Murakkab tizimlar arxitekturasi, ma'lumotlar xavfsizligi va yuqori tezlikdagi server qismini mukammal o'rganing.",
        details: [
            "Node.js va Express.js frameworklari",
            "SQL (PostgreSQL) va NoSQL (MongoDB) bazalar",
            "Real-time ilovalar (Socket.io)",
            "Authentication (JWT, OAuth2)",
            "REST API va GraphQL arxitekturasi"
        ],
        tools: ["Node.js", "Express", "SQL", "Docker", "AWS"],
        price: "600,000 so'm/oy",
        color: "from-green-600/20 to-green-400/5"
    },
    {
        title: "UI/UX Design",
        icon: <Palette className="text-purple-500" />,
        duration: "4 oy",
        desc: "Foydalanuvchilar yoqtiradigan interfeyslar yaratish sirlari. Vizual estetika va funksionallikning uyg'unligi.",
        details: [
            "Figma va Adobe asboblari",
            "User Research va Wireframing",
            "Color Theory va Typography",
            "Interactive Prototyping",
            "Dizayn tizimlari (Design Systems) yaratish"
        ],
        tools: ["Figma", "Photoshop", "Principle", "Mirror"],
        price: "500,000 so'm/oy",
        color: "from-purple-600/20 to-purple-400/5"
    },
    {
        title: "Fullstack Python",
        icon: <Database className="text-yellow-500" />,
        duration: "9 oy",
        desc: "Python tilida murakkab loyihalar, ma'lumotlar tahlili va sun'iy intellekt asoslarini kompleks o'zlashtiring.",
        details: [
            "Python asoslari va OOP",
            "Django frameworki va REST framework",
            "Data Science va NumPy asoslari",
            "AI va Machine Learning boshlang'ichlari",
            "PostgreSQL va Redis bilan ishlash"
        ],
        tools: ["Python", "Django", "NumPy", "AI Basics", "Linux"],
        price: "1,400,000 so'm/oy",
        color: "from-yellow-600/20 to-yellow-400/5"
    }
];

const Programs = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    return (
        <LandingLayout>
            <section className="pt-32 pb-20 bg-black min-h-screen">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mb-32">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black mb-10 tracking-widest uppercase"
                        >
                            <Bookmark size={14} /> Kelajak Kasblari
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-9xl font-black mb-10 leading-[0.9] tracking-tighter"
                        >
                            BIZNING <span className="text-blue-500 italic">KURSlarIMIZ</span>
                        </motion.h1>
                        <p className="text-gray-400 text-xl leading-relaxed max-w-2xl">
                            InFast Academy darslari Muhammadaziz Yakubov tomonidan tasdiqlangan maxsus
                            metodika asosida o'tiladi. Bizning maqsadimiz — sizni ishga tayyor mutaxassis qilish.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {programs.map((program, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`group relative p-[1px] bg-gradient-to-br ${program.color} rounded-[3rem] border border-white/5 overflow-hidden`}
                            >
                                <div className="bg-[#080808] rounded-[2.9rem] p-10 md:p-14 h-full flex flex-col relative z-10 transition-colors group-hover:bg-[#0c0c0c]">
                                    <div className="flex justify-between items-start mb-12">
                                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-500 group-hover:border-blue-500/30">
                                            {program.icon}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1 tracking-widest">Davomiyligi</p>
                                            <span className="px-5 py-2 rounded-full bg-blue-500/10 text-white text-sm font-bold border border-blue-500/20">
                                                {program.duration}
                                            </span>
                                        </div>
                                    </div>

                                    <h3 className="text-4xl font-black text-white mb-6 tracking-tight group-hover:text-blue-500 transition-colors uppercase italic">{program.title}</h3>
                                    <p className="text-gray-400 text-lg mb-10 leading-relaxed flex-grow">{program.desc}</p>

                                    <div className="mb-12">
                                        <div className="flex flex-wrap gap-2">
                                            {program.tools.map((tool, i) => (
                                                <span key={i} className="px-4 py-2 rounded-xl bg-white/5 text-[11px] text-white/50 border border-white/10 font-bold uppercase tracking-widest">
                                                    {tool}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 font-black">
                                        <div>
                                            <p className="text-[10px] text-gray-600 mb-2 leading-none uppercase tracking-widest">Kurs qiymati</p>
                                            <p className="text-2xl text-white italic">{program.price}</p>
                                        </div>
                                        <button
                                            onClick={() => openModal(program)}
                                            className="w-full sm:w-auto px-10 py-5 bg-white text-black font-black rounded-2xl transition-all group/btn flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white"
                                        >
                                            Batafsil
                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <CourseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    course={selectedCourse}
                />
            </section>
        </LandingLayout>
    );
};

export default Programs;
