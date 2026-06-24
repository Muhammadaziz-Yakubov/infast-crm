import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Code, Users, Rocket, Award, Zap, Shield, HelpCircle, CheckCircle2, MapPin, Smartphone, ArrowRight, Laptop } from 'lucide-react';
import { Link } from 'react-router-dom';
import LandingLayout from './components/LandingLayout';

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 pb-20">
            {/* Background Animations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[130px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 blur-[130px] rounded-full"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:40px_40px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold mb-8 backdrop-blur-md uppercase tracking-wider"
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <span>O'zbekistondagi Eng Zamonaviy IT Akademiyasi</span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-5xl md:text-8xl lg:text-9xl font-black mb-8 leading-[0.9] tracking-tighter"
                >
                    KASBGA YO'NALTIRILGAN <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 uppercase">
                        IT TA'LIM TIZIMI
                    </span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-zinc-400 text-lg md:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed font-medium"
                >
                    InFast Academy — bu shunchaki kurs emas, balki shaxsiy raqamli platforma, individual mentorlik va real loyihalarga asoslangan to‘liq IT ekotizimdir.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-6"
                >
                    <Link
                        to="/contact"
                        className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-black text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-[0_20px_50px_rgba(234,179,8,0.25)] flex items-center justify-center group"
                    >
                        Birinchi bepul darsga yozilish
                        <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                    <Link
                        to="/programs"
                        className="w-full sm:w-auto px-12 py-5 bg-white/5 hover:bg-white/10 text-white font-black text-lg rounded-2xl transition-all duration-300 backdrop-blur-md border border-white/10 flex items-center justify-center hover:border-amber-500/30"
                    >
                        Kurslar bilan tanishish
                    </Link>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-24 pt-10 border-t border-white/5 flex flex-wrap justify-center items-center gap-8 md:gap-16 grayscale opacity-40"
                >
                    <span className="text-white font-black text-2xl italic tracking-tighter hover:opacity-100 transition-opacity">InFast AI</span>
                    <span className="text-white font-black text-2xl italic tracking-tighter hover:opacity-100 transition-opacity">Lumo AI</span>
                    <span className="text-white font-black text-2xl italic tracking-tighter hover:opacity-100 transition-opacity">EPAM Partner</span>
                    <span className="text-white font-black text-2xl italic tracking-tighter hover:opacity-100 transition-opacity">Buloqboshi Technopark</span>
                </motion.div>
            </div>
        </section>
    );
};

const StatsSection = () => {
    const stats = [
        { val: '2,500+', label: 'Faol Talabalar' },
        { val: '4', label: 'Zamonaviy Filiallar' },
        { val: '15+', label: 'Senior Mentorlar' },
        { val: '92%', label: 'Ishga Joylashish' },
    ];

    return (
        <section className="py-20 bg-zinc-950/40 border-y border-white/5 relative">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((s, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-zinc-900/50 border border-white/5 hover:border-amber-500/20 transition-all duration-300 text-center group">
                            <h4 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 mb-2 group-hover:scale-105 transition-transform duration-300">{s.val}</h4>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[11px]">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const Benefits = () => {
    const benefits = [
        {
            title: "Student App Raqamli Platforma",
            desc: "Dars o'zlashtirishi, vazifalar topshirish, to'lovlar monitoringi va davomatni nazorat qiluvchi maxsus shaxsiy kabinet tizimi.",
            icon: <Smartphone size={28} className="text-amber-500" />,
            badge: "Innovatsiya"
        },
        {
            title: "Individual Academic Support",
            desc: "Har bir guruh uchun asosiy mentordan tashqari bepul qo'shimcha tutor biriktiriladi va savollar 24/7 hal etiladi.",
            icon: <Users size={28} className="text-amber-500" />,
            badge: "Yordam"
        },
        {
            title: "InFast Coin & Market Tizimi",
            desc: "Darslarda faol qatnashib virtual coinlar yutib oling va ularni noutbuk, kitoblar hamda ajoyib sovg'alarga almashtiring.",
            icon: <Award size={28} className="text-amber-500" />,
            badge: "Motivatsiya"
        },
        {
            title: "Real Loyihalar Portfolio",
            desc: "Mentorimiz Muhammadaziz Yakubov boshchiligidagi startaplar va real ishlab chiqarish loyihalarida bevosita ishtirok eting.",
            icon: <Code size={28} className="text-amber-500" />,
            badge: "Tajriba"
        }
    ];

    return (
        <section className="py-32 bg-black relative">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-7xl font-black mb-6 uppercase tracking-tight">
                        BIZNING <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">AFZALLIKLARIMIZ</span>
                    </h2>
                    <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">Oddiy kurslardan farqli ravishda biz har bir talabaning natijasi uchun to'liq mas'uliyatni zimmamizga olamiz.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {benefits.map((b, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-8 md:p-12 rounded-[2.5rem] bg-gradient-to-br from-zinc-900/80 to-zinc-950/20 border border-white/5 hover:border-amber-500/30 hover:shadow-[0_20px_50px_rgba(234,179,8,0.05)] transition-all duration-500 group relative overflow-hidden"
                        >
                            <div className="absolute top-6 right-8 text-[10px] font-black uppercase tracking-widest text-amber-500/50 bg-amber-500/10 px-3 py-1 rounded-full">{b.badge}</div>
                            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 transition-all duration-300 group-hover:border-amber-500/40">
                                {b.icon}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-black mb-4 uppercase tracking-tight text-white">{b.title}</h3>
                            <p className="text-zinc-400 leading-relaxed font-medium text-base md:text-lg">{b.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const PlatformShowcase = () => {
    return (
        <section className="py-32 bg-gradient-to-b from-black to-zinc-950 overflow-hidden relative border-t border-white/5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="flex-1 space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black uppercase tracking-wider">
                            <Laptop size={14} /> Student App Ekotizimi
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black leading-none uppercase tracking-tight text-white">
                            O'QISHINGIZNI <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                                FULL RAQAMLASHTIRAMIZ
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                            Har bir InFast Academy talabasi shaxsiy profilingizga ega bo'ladi. Bu orqali siz:
                        </p>
                        <div className="space-y-4">
                            {[
                                "Dars jadvali, davomat va reytingingizni kuzatasiz",
                                "Vazifalarni yuklab, topshirasiz va baholarni ko'rasiz",
                                "InFast Coinlaringiz balansini tekshirasiz",
                                "Coin do'konidan noutbuk yoki kitoblarga buyurtma berasiz",
                                "To'lovlar tarixini va oylik kvitansiyalarni olasiz"
                            ].map((text, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-zinc-300 font-bold text-base">
                                    <CheckCircle2 className="text-amber-500 flex-shrink-0" size={20} />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4">
                            <Link to="/login" className="inline-flex items-center gap-2 text-amber-400 font-black uppercase tracking-wider text-sm group hover:text-amber-300 transition-colors">
                                Shaxsiy kabinetga kirish
                                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 relative w-full">
                        <div className="relative mx-auto max-w-[500px] p-[2px] bg-gradient-to-tr from-amber-500/30 via-zinc-800 to-zinc-900 rounded-[3rem] shadow-2xl">
                            {/* Dummy Student Dashboard Mockup */}
                            <div className="bg-[#0b0b0c] rounded-[2.9rem] p-8 md:p-10 border border-white/5 text-white">
                                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 text-amber-500 font-black">
                                            ST
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm tracking-tight">Sardor Temirov</h4>
                                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Frontend talaba</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25 rounded-full text-amber-400 text-xs font-black">
                                        🪙 450 Coins
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                                            <span>Kurs o'zlashtirishi</span>
                                            <span className="text-amber-400">88%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" style={{ width: '88%' }}></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
                                            <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Davomat</p>
                                            <p className="text-xl font-black text-white italic">96% <span className="text-xs text-emerald-500 font-bold font-sans">A'lo</span></p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5">
                                            <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Guruhdagi o'rni</p>
                                            <p className="text-xl font-black text-white italic">#3 <span className="text-[10px] text-zinc-400 font-bold font-sans">/ 18 ta</span></p>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></div>
                                            <span className="text-xs font-bold text-zinc-300">Yangi uy vazifasi mavjud</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">Topshirish</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

const BranchesSection = () => {
    const branches = [
        { name: "Andijon Bosh Filiali", loc: "Buloqboshi tumani, Yangi hokimiyat binosi 3-qavat", tel: "+998 90 271 00 27", status: "Faol" },
        { name: "Toshkent Filiali", loc: "Yunusobod tumani, Minor metro yaqinida, 12-bino", tel: "+998 90 271 00 28", status: "Yaqinda" },
        { name: "Farg'ona Filiali", loc: "Marg'ilon shahar, Mustaqillik ko'chasi 45-uy", tel: "+998 90 271 00 29", status: "Yaqinda" },
        { name: "Online Filial (Masofaviy)", loc: "Dunyoning istalgan nuqtasidan zoom & platforma orqali", tel: "+998 90 271 00 27", status: "Faol" }
    ];

    return (
        <section className="py-32 bg-black border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-7xl font-black mb-6 uppercase tracking-tight">
                        BIZNING <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">FILIALLARIMIZ</span>
                    </h2>
                    <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">InFast endilikda butun O'zbekiston bo'ylab o'z tarmog'ini kengaytirmoqda.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {branches.map((b, i) => (
                        <div key={i} className="p-8 rounded-[2rem] bg-zinc-900/40 border border-white/5 hover:border-amber-500/20 transition-all duration-300 flex flex-col justify-between group">
                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-zinc-900 rounded-xl border border-white/10 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-all text-amber-500">
                                        <MapPin size={22} />
                                    </div>
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${b.status === 'Faol' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'}`}>
                                        {b.status}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-tight group-hover:text-amber-400 transition-colors">{b.name}</h3>
                                <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-medium">{b.loc}</p>
                            </div>
                            <div className="pt-4 border-t border-white/5 text-zinc-400 font-bold text-xs">
                                Tel: {b.tel}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

const FAQ = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const questions = [
        {
            q: "IT sohasini o'rganishni noldan boshlasam bo'ladimi?",
            a: "Albatta! Bizning barcha o'quv dasturlarimiz aynan noldan boshlovchilar uchun mo'ljallangan. Professional mentorlarimiz va individual akademik yordam tizimimiz sizni dasturlash tushunchalarini oson o'zlashtirishingizni ta'minlaydi."
        },
        {
            q: "Student App nima va u qanday yordam beradi?",
            a: "Student App — bu InFast o'quvchilarining shaxsiy yordamchi platformasidir. Unda siz davomatingizni, reytingingizni, to'lovlar tarixini va vazifalarni ko'rasiz. Shuningdek darsda faollik uchun olgan coinlaringiz orqali real sovg'alar buyurtma qilasiz."
        },
        {
            q: "InFast Coinlar nima va ularni qanday olish mumkin?",
            a: "InFast Coins — o'quv markazimizning ichki virtual valyutasidir. Uni darsda faol qatnashish, uy vazifalarini a'lo darajada va o'z vaqtida topshirish hamda haftalik imtihonlarda yuqori natija ko'rsatish orqali yutib olasiz."
        },
        {
            q: "Kursni tugatgandan so'ng sertifikat beriladimi?",
            a: "Ha, barcha bosqichlarni muvaffaqiyatli yakunlagan va yakuniy imtihondan o'tgan o'quvchilarga InFast Academy hamda hamkorlarimiz tomonidan tasdiqlangan professional bitiruv sertifikati va portfolio tavsiyanomasi topshiriladi."
        }
    ];

    const toggleIndex = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <section className="py-32 bg-zinc-950/20 border-t border-white/5 relative">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-7xl font-black mb-6 uppercase tracking-tight">
                        SAVOLLARGA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">JAVOBLAR</span>
                    </h2>
                    <p className="text-zinc-500 text-lg font-medium">Sizda paydo bo'lishi mumkin bo'lgan eng muhim savollarga oydinlik kiritamiz.</p>
                </div>

                <div className="space-y-4">
                    {questions.map((q, idx) => {
                        const isOpen = activeIndex === idx;
                        return (
                            <div key={idx} className="rounded-3xl border border-white/5 bg-zinc-900/20 overflow-hidden transition-all duration-300">
                                <button
                                    onClick={() => toggleIndex(idx)}
                                    className="w-full p-6 md:p-8 flex justify-between items-center text-left hover:bg-white/5 transition-all outline-none"
                                >
                                    <span className="text-lg md:text-xl font-bold text-white tracking-tight leading-tight">{q.q}</span>
                                    <div className={`w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-amber-500 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-amber-500/10' : ''}`}>
                                        <ChevronRight size={18} />
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="p-6 md:p-8 pt-0 text-zinc-400 leading-relaxed font-medium text-base border-t border-white/5 bg-zinc-950/20">
                                                {q.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

const Home = () => {
    return (
        <LandingLayout>
            <Hero />
            <StatsSection />
            <Benefits />
            <PlatformShowcase />
            <BranchesSection />
            <FAQ />

            {/* CTA Section */}
            <section className="py-32 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none"></div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="p-16 md:p-28 rounded-[4rem] bg-gradient-to-t from-amber-500/10 via-zinc-900/60 to-transparent border border-white/5 relative overflow-hidden">
                        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
                            <h2 className="text-4xl md:text-8xl font-black mb-6 leading-[0.95] tracking-tighter uppercase">
                                KELAJAK KASBINI <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500">
                                    BUGUNDAN O'RGANING
                                </span>
                            </h2>
                            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-xl mx-auto">
                                Biz bilan kelajagingizni kafolatlang. Birinchi bepul darsda qatnashing va o'zingiz baho bering!
                            </p>
                            <div>
                                <Link to="/contact" className="inline-flex px-12 py-6 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-black text-2xl rounded-2xl hover:scale-105 transition-all shadow-[0_20px_50px_rgba(234,179,8,0.25)]">
                                    Hoziroq Ro'yxatdan O'tish
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </LandingLayout>
    );
};

export default Home;
