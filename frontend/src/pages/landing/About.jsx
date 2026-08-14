import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Cpu, CheckCircle2, ShieldCheck } from 'lucide-react';
import LandingLayout from './components/LandingLayout';

const AboutContent = ({ openEnrollment }) => {
  return (
    <section className="pt-36 pb-24 bg-[#0A0A0A] min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Hero Section of About */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-28">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00] text-xs font-semibold uppercase tracking-wider">
              <Rocket size={14} /> Biz Haqimizda
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Sifatga va amaliyotga <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#FF6A00]">
                asoslangan IT ta'lim
              </span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed font-normal">
              InFast IT-Academy — bu shunchaki kurslar markazi emas. Bu Muhammadaziz Yakubov hamda senior dasturchilar tomonidan asos solingan amaliy ta'lim ekotizimidir.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="card-apple p-6">
                <h4 className="text-4xl font-extrabold text-[#FF6A00] mb-1">1+</h4>
                <p className="text-xs text-zinc-400 font-medium">Yillik Markaz Tajribasi</p>
              </div>
              <div className="card-apple p-6">
                <h4 className="text-4xl font-extrabold text-[#FF6A00] mb-1">100+</h4>
                <p className="text-xs text-zinc-400 font-medium">Muvaffaqiyatli Talabalar</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-5"
          >
            <div className="card-apple p-8 border border-white/10 relative overflow-hidden bg-gradient-to-b from-[#121214] to-[#0A0A0A]">
              <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider text-[#FF6A00]">
                Bizning Prinsiplarimiz
              </h3>
              <div className="space-y-4">
                {[
                  "Faqat amaliyotga yo'naltirilgan ta'lim",
                  "Senior mentorlar bilan doimiy aloqa",
                  "Real loyihalar va portfolio yaratish",
                  "Soft-skills va HR bilan ishlash",
                  "Zamonaviy IT va AI texnologiyalari"
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3 text-zinc-300 text-sm font-medium">
                    <CheckCircle2 size={18} className="text-[#FF6A00] shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Partners Section */}
        <div className="text-center py-16 border-t border-white/5 space-y-8">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Foydalaniladigan Texnologiyalar & Standartlar
          </h3>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all font-mono font-bold text-xl text-white">
            <span>REACT</span>
            <span>NEXT.JS</span>
            <span>NODE.JS</span>
            <span>PYTHON</span>
            <span>FLUTTER</span>
            <span>TAILWIND</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const About = () => (
  <LandingLayout>
    {({ openEnrollment }) => <AboutContent openEnrollment={openEnrollment} />}
  </LandingLayout>
);

export default About;
