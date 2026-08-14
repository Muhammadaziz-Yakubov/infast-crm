import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Github, Rocket, Cpu, Database } from 'lucide-react';
import LandingLayout from './components/LandingLayout';
import founderImg from '../../muhammadaziz.jpg';

const TeamContent = ({ openEnrollment }) => {
  return (
    <section className="pt-36 pb-24 bg-[#0A0A0A] min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
            InFast Jamoasi
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Bizning Professional <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#FF6A00]">
              Mentoring Jamoamiz
            </span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed font-normal">
            InFast IT-Academy ortida amaliy tajribaga ega senior va lead dasturchilar turibdi.
          </p>
        </div>

        {/* Founder Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-5 relative group"
          >
            <div className="relative aspect-square rounded-3xl bg-[#121214] border border-white/10 overflow-hidden flex items-center justify-center glow-orange">
              <img
                src={founderImg}
                alt="Muhammadaziz Yakubov"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                <span className="text-[#FF6A00] font-mono text-xs font-bold uppercase tracking-widest">
                  FOUNDER & LEAD MENTOR
                </span>
                <h3 className="text-2xl font-bold text-white">Muhammadaziz Yakubov</h3>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 space-y-6"
          >
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Muhammadaziz <span className="text-[#FF6A00]">Yakubov</span>
            </h2>
            <p className="text-sm font-semibold text-[#FF6A00] uppercase tracking-wider">
              Asoschi & Lead Tech Mentor
            </p>

            <div className="space-y-4 text-zinc-400 text-base leading-relaxed">
              <p>
                InFast IT-Academy, InFast AI va raqamli platformalar muallifi. IT sohasida 5 yildan ortiq professional dasturlash va tizimlar arxitekturasi tajribasiga ega.
              </p>
              <p>
                Faoliyati davomida 20 tadan ortiq yirik amaliy va tijoriy loyihalarni muvaffaqiyatli topshirgan hamda yuzlab talabalarga dasturlash va karyera yo'nalishida ustozlik qilgan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="card-apple p-5">
                <h4 className="text-3xl font-extrabold text-white mb-1">5+ Yil</h4>
                <p className="text-xs text-zinc-500 font-medium">Soha Tajribasi</p>
              </div>
              <div className="card-apple p-5">
                <h4 className="text-3xl font-extrabold text-white mb-1">20+</h4>
                <p className="text-xs text-zinc-500 font-medium">Real Loyihalar</p>
              </div>
            </div>

            <div className="pt-4 flex items-center space-x-4">
              <button
                onClick={() => openEnrollment()}
                className="btn-brand-orange text-sm font-semibold px-8 py-3.5"
              >
                Mentorlar bilan muloqot qilish →
              </button>
            </div>
          </motion.div>
        </div>

        {/* Sub-projects / Ecosystem */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "InFast IT-Academy", desc: "Sifatli IT ta'limi va amaliyoti.", icon: <Rocket size={20} className="text-[#FF6A00]" /> },
            { title: "InFast AI", desc: "Sun'iy intellekt va avtomatlashtirish yechimlari.", icon: <Cpu size={20} className="text-[#FF6A00]" /> },
            { title: "Student CRM Hub", desc: "O'quvchilar reytingi va topshiriqlar ekotizimi.", icon: <Database size={20} className="text-[#FF6A00]" /> },
          ].map((item, i) => (
            <div key={i} className="card-apple p-6 hover:border-[#FF6A00]/30 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Team = () => (
  <LandingLayout>
    {({ openEnrollment }) => <TeamContent openEnrollment={openEnrollment} />}
  </LandingLayout>
);

export default Team;
