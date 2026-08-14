import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code2,
  Server,
  Smartphone,
  Layers,
  Laptop,
  Cpu,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Users,
  Award,
  BookOpen,
  Terminal,
  Zap,
  Star,
  ExternalLink,
  ChevronDown,
  PlayCircle
} from 'lucide-react';
import LandingLayout from './components/LandingLayout';
import CourseDetailModal from './components/CourseDetailModal';
import {
  STATS_DATA,
  COURSES_DATA,
  WHY_INFAST_FEATURES,
  TIMELINE_STEPS,
  MENTORS_DATA,
  STUDENT_RESULTS,
  TESTIMONIALS_DATA,
  FAQ_DATA
} from './data/academyData';

// Map icon strings to Lucide components
const getCourseIcon = (iconName) => {
  switch (iconName) {
    case 'Code2': return <Code2 size={24} className="text-[#FF6A00]" />;
    case 'Server': return <Server size={24} className="text-[#FF6A00]" />;
    case 'Smartphone': return <Smartphone size={24} className="text-[#FF6A00]" />;
    case 'Layers': return <Layers size={24} className="text-[#FF6A00]" />;
    case 'Laptop': return <Laptop size={24} className="text-[#FF6A00]" />;
    case 'Cpu': return <Cpu size={24} className="text-[#FF6A00]" />;
    default: return <Code2 size={24} className="text-[#FF6A00]" />;
  }
};

// Counter Hook Component
const AnimatedCounter = ({ value, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = Math.abs(Math.floor(duration / value));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      }
    }, stepTime || 20);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}{suffix}</span>;
};

const HomeContent = ({ openEnrollment }) => {
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState(null);
  const [activeFaqIndex, setActiveFaqIndex] = useState(null);
  const [activeCodeTab, setActiveCodeTab] = useState('react');

  const toggleFaq = (idx) => {
    setActiveFaqIndex(activeFaqIndex === idx ? null : idx);
  };

  return (
    <div className="bg-[#0A0A0A] text-white space-y-32 pb-24">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-36 md:pt-44 pb-16 px-6 overflow-hidden">
        {/* Subtle Ambient Orange Glow Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-[#FF6A00]/10 blur-[160px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-[300px] h-[300px] bg-[#FF6A00]/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[#FF6A00] text-xs font-medium tracking-wide backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse" />
            <span>InFast IT-Academy — Zamonaviy IT Ta'lim Ekotizimi</span>
          </motion.div>

          {/* Large Apple Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-white max-w-5xl mx-auto"
          >
            Kelajakdagi kasbingni <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#FF6A00]">
              bugundan boshla.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-zinc-400 text-lg md:text-2xl font-normal max-w-3xl mx-auto leading-relaxed"
          >
            InFast IT-Academy — zamonaviy IT kasblarini amaliyot va real loyihalar orqali o‘rgatadigan akademiya.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <a
              href="#courses"
              className="w-full sm:w-auto btn-brand-orange text-base font-semibold px-8 py-4 rounded-full flex items-center justify-center gap-2 group"
            >
              <span>Kurslarni ko‘rish</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#academy"
              className="w-full sm:w-auto btn-secondary-dark text-base font-medium px-8 py-4 rounded-full flex items-center justify-center gap-2"
            >
              <span>Akademiya haqida</span>
            </a>
          </motion.div>

          {/* Visual Composition: Sleek Laptop / Interactive Dashboard Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="pt-12 relative max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl bg-[#121214] border border-white/10 shadow-2xl p-4 md:p-6 overflow-hidden glow-orange">
              {/* Window Bar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-zinc-500 ml-3 font-mono">infast-student-hub.app</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-[#FF6A00] bg-[#FF6A00]/10 px-2.5 py-1 rounded-full border border-[#FF6A00]/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00] animate-ping" /> Live Classroom
                  </span>
                </div>
              </div>

              {/* Code & IDE Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 text-left">
                {/* Left IDE Sidebar / Code snippet */}
                <div className="md:col-span-7 bg-[#0A0A0A] rounded-2xl p-5 border border-white/5 font-mono text-xs text-zinc-300 space-y-3">
                  <div className="flex items-center justify-between text-zinc-500 border-b border-white/5 pb-2 text-[11px]">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setActiveCodeTab('react')}
                        className={`pb-1 ${activeCodeTab === 'react' ? 'text-[#FF6A00] border-b border-[#FF6A00]' : 'text-zinc-500'}`}
                      >
                        App.jsx
                      </button>
                      <button
                        onClick={() => setActiveCodeTab('backend')}
                        className={`pb-1 ${activeCodeTab === 'backend' ? 'text-[#FF6A00] border-b border-[#FF6A00]' : 'text-zinc-500'}`}
                      >
                        server.js
                      </button>
                    </div>
                    <span>UTF-8</span>
                  </div>

                  {activeCodeTab === 'react' ? (
                    <div className="space-y-1.5 overflow-x-auto">
                      <p><span className="text-purple-400">import</span> React, &#123; useState &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">'react'</span>;</p>
                      <p><span className="text-purple-400">import</span> &#123; InFastAcademy &#125; <span className="text-purple-400">from</span> <span className="text-emerald-400">'@infast/core'</span>;</p>
                      <br />
                      <p><span className="text-blue-400">export default function</span> <span className="text-yellow-300">FutureDeveloper</span>() &#123;</p>
                      <p className="pl-4"><span className="text-purple-400">const</span> [skillLevel, setSkillLevel] = <span className="text-blue-300">useState</span>(<span className="text-emerald-400">'Junior → Senior'</span>);</p>
                      <p className="pl-4"><span className="text-purple-400">const</span> [practicalProjects, setProjects] = <span className="text-blue-300">useState</span>([<span className="text-emerald-400">'E-Commerce'</span>, <span className="text-emerald-400">'CRM'</span>, <span className="text-emerald-400">'AI Bot'</span>]);</p>
                      <br />
                      <p className="pl-4"><span className="text-purple-400">return</span> (</p>
                      <p className="pl-8">&lt;<span className="text-red-400">InFastAcademy</span> <span className="text-orange-300">mentor</span>=<span className="text-emerald-400">"Senior Engineers"</span> <span className="text-orange-300">practical</span>=&#123;<span className="text-purple-300">true</span>&#125;&gt;</p>
                      <p className="pl-12">&lt;<span className="text-red-400">BuildYourCareer</span> <span className="text-orange-300">status</span>=&#123;skillLevel&#125; /&gt;</p>
                      <p className="pl-8">&lt;/<span className="text-red-400">InFastAcademy</span>&gt;</p>
                      <p className="pl-4">);</p>
                      <p>&#125;</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 overflow-x-auto">
                      <p><span className="text-purple-400">const</span> express = <span className="text-blue-300">require</span>(<span className="text-emerald-400">'express'</span>);</p>
                      <p><span className="text-purple-400">const</span> app = <span className="text-blue-300">express</span>();</p>
                      <br />
                      <p>app.<span className="text-blue-300">post</span>(<span className="text-emerald-400">'/api/v1/students/enroll'</span>, <span className="text-purple-400">async</span> (req, res) =&gt; &#123;</p>
                      <p className="pl-4"><span className="text-purple-400">const</span> newStudent = <span className="text-purple-400">await</span> Student.<span className="text-blue-300">create</span>(req.body);</p>
                      <p className="pl-4">res.<span className="text-blue-300">status</span>(<span className="text-orange-300">201</span>).<span className="text-blue-300">json</span>(&#123; success: <span className="text-purple-300">true</span>, student: newStudent &#125;);</p>
                      <p>&#125;);</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <CheckCircle2 size={12} /> Compiled in 0.4s
                    </span>
                    <span>Line 18, Col 2</span>
                  </div>
                </div>

                {/* Right Student Ecosystem Status & Floating Cards */}
                <div className="md:col-span-5 flex flex-col justify-between space-y-4">
                  <div className="bg-[#0A0A0A] rounded-2xl p-5 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">O'quv ko'rsatkichlari</h4>
                      <span className="text-xs text-[#FF6A00] font-bold">98% A'lo</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Amaliy loyihalar bajarilishi</span>
                          <span className="text-white font-medium">12 / 12</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FF6A00] rounded-full w-full" />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-zinc-400 mb-1">
                          <span>Mentor feedback tezligi</span>
                          <span className="text-white font-medium">&lt; 15 min</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[90%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Badges */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-[#FF6A00]/10 border border-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00]">
                        <Code2 size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Frontend & AI</p>
                        <p className="text-[10px] text-zinc-500">Amaliyot asosida</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Award size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Sertifikat</p>
                        <p className="text-[10px] text-zinc-500">Xalqaro daraja</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SOCIAL PROOF / TRUST STATS */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">
            Biz bilan kelajagini qurayotganlar
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {STATS_DATA.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card-apple text-center hover:border-[#FF6A00]/30 transition-all duration-300 group"
            >
              <h3 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight group-hover:text-[#FF6A00] transition-colors">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </h3>
              <p className="text-xs md:text-sm font-medium text-zinc-400 mt-2">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. COURSES SECTION */}
      {/* ========================================================================= */}
      <section id="courses" className="max-w-6xl mx-auto px-6 pt-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
            Yo'nalishlar
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            IT olamiga kirish uchun <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#FF6A00]">
              o‘zingga mos yo‘nalishni tanla.
            </span>
          </h2>
          <p className="text-zinc-400 text-base md:text-lg">
            Har bir kurs zamonaviy mehnat bozori talablariga 100% moslashtirilgan bo'lib, chuqurlashtirilgan amaliyotdan iborat.
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES_DATA.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="card-apple flex flex-col justify-between group hover:-translate-y-1.5 hover:border-[#FF6A00]/40 transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle hover accent background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6A00]/5 rounded-bl-full pointer-events-none group-hover:bg-[#FF6A00]/10 transition-colors" />

              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-[#FF6A00]/40 transition-colors">
                    {getCourseIcon(course.iconName)}
                  </div>
                  <span className="text-[11px] font-medium text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    {course.duration}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#FF6A00] transition-colors">
                  {course.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {course.description}
                </p>
              </div>

              <div>
                {/* Tools chips */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {course.tools.slice(0, 4).map((tool, i) => (
                    <span key={i} className="text-[10px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      {tool}
                    </span>
                  ))}
                  {course.tools.length > 4 && (
                    <span className="text-[10px] font-mono text-zinc-500 px-1 py-0.5">
                      +{course.tools.length - 4}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setSelectedCourseForDetail(course)}
                    className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Batafsil
                  </button>
                  <button
                    onClick={() => openEnrollment(course.title)}
                    className="text-xs font-semibold text-[#FF6A00] hover:text-[#E05D00] flex items-center gap-1 group/btn"
                  >
                    <span>Yozilish</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. WHY INFAST */}
      {/* ========================================================================= */}
      <section id="why" className="max-w-6xl mx-auto px-6 pt-12">
        <div className="mb-16 space-y-3">
          <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
            Nega InFast?
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Oddiy kurs emas. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#FF6A00]">
              Haqiqiy tajriba.
            </span>
          </h2>
        </div>

        {/* 4 Editorial Feature Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {WHY_INFAST_FEATURES.map((feat, idx) => (
            <motion.div
              key={feat.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card-apple group hover:border-[#FF6A00]/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <span className="text-5xl font-black text-zinc-700 group-hover:text-[#FF6A00] transition-colors font-mono">
                  {feat.number}
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {feat.title}
                </h3>
                <p className="text-zinc-400 text-base leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ACADEMY EXPERIENCE */}
      {/* ========================================================================= */}
      <section id="academy" className="max-w-6xl mx-auto px-6 pt-12">
        <div className="card-apple p-8 md:p-14 relative overflow-hidden bg-gradient-to-b from-[#121214] to-[#0A0A0A]">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF6A00]/10 blur-[150px] rounded-full pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Headline */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
                Akademiya Muhiti
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-none text-white">
                Bu yerda <br />
                <span className="text-[#FF6A00]">o‘rganishadi.</span> <br />
                Bu yerda <br />
                <span className="text-white">yaratishadi.</span>
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed">
                InFast IT-Academy — bu shunchaki sinfxona emas. Bu yerda talabalar zamonaviy kompyuterlar, yuqori tezlikdagi internet va individual tutorlar ko'magida 24/7 amaliyot qilishadi.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => openEnrollment()}
                  className="btn-brand-orange text-sm px-6 py-3 font-semibold"
                >
                  Sinfxonamizga tashrif buyuring →
                </button>
              </div>
            </div>

            {/* Right Showcase Display */}
            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-white/10 overflow-hidden bg-[#0A0A0A] p-2">
                <img
                  src="/src/infastacademy.jpg"
                  alt="InFast IT-Academy Environment"
                  className="rounded-xl w-full h-auto object-cover max-h-[350px] filter brightness-95 hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    // Fallback visual if image file path resolves differently
                    e.target.style.display = 'none';
                  }}
                />
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-white">
                    <span>Buloqboshi Bosh Filial Sinfxonasi</span>
                    <span className="text-[#FF6A00]">Zamonaviy IT Muhit</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Keng, yorug' va qulay o'quv xonalari, iMac & PC stansiyalari hamda doimiy mentorlik qo'llab-quvvatlovi.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. LEARNING PROCESS TIMELINE */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-6 pt-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
            Ta'lim Bosqichlari
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Noldan ishga joylashishgacha bo'lgan yo'lingiz
          </h2>
          <p className="text-zinc-400 text-base">
            6 ta aniq va ketma-ket bosqich orqali siz IT mutaxassisi bo'lasiz.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {TIMELINE_STEPS.map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="card-apple hover:border-[#FF6A00]/30 transition-all duration-300 space-y-4 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-[#FF6A00] font-mono">
                  {item.step}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white transition-colors">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white">
                {item.title}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. STUDENT RESULTS / BENTO SHOWCASE */}
      {/* ========================================================================= */}
      <section id="results" className="max-w-6xl mx-auto px-6 pt-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
            Natijalar
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Natija — biz uchun eng muhim ko‘rsatkich.
          </h2>
          <p className="text-zinc-400 text-base">
            O'quvchilarimiz yaratgan real loyihalar, portfolio va amaliy yutuqlar.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STUDENT_RESULTS.map((res, idx) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card-apple hover:border-[#FF6A00]/30 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#FF6A00] bg-[#FF6A00]/10 px-2.5 py-1 rounded-full border border-[#FF6A00]/20">
                    {res.tag}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {res.metrics}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white group-hover:text-[#FF6A00] transition-colors">
                  {res.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                <span>Muallif: <strong className="text-zinc-300 font-semibold">{res.student}</strong></span>
                <span className="text-zinc-400 font-medium">{res.category}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. MENTORS SECTION */}
      {/* ========================================================================= */}
      <section id="mentors" className="max-w-6xl mx-auto px-6 pt-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
            Jamoamiz
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ustozlardan o‘rgan. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#FF6A00]">
              Tajribadan foydalan.
            </span>
          </h2>
          <p className="text-zinc-400 text-base">
            Amaliyotchi senior dasturchilar va soha mutaxassislari bilan birga rivojlaning.
          </p>
        </div>

        {/* Mentors Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MENTORS_DATA.map((mentor, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="card-apple p-6 hover:border-[#FF6A00]/30 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Photo / Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-zinc-800 border border-white/10 overflow-hidden mx-auto flex items-center justify-center text-zinc-400 font-bold text-xl relative group-hover:border-[#FF6A00]/40 transition-colors">
                  {mentor.image ? (
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  <span className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-[#FF6A00] font-bold text-lg pointer-events-none -z-0">
                    {mentor.fallbackText}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-[#FF6A00] transition-colors">
                    {mentor.name}
                  </h3>
                  <p className="text-xs font-medium text-[#FF6A00]">
                    {mentor.role}
                  </p>
                  <p className="text-[11px] text-zinc-500 font-mono">
                    {mentor.spec}
                  </p>
                </div>

                <p className="text-xs text-zinc-400 text-center leading-relaxed">
                  {mentor.bio}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. STUDENT STORIES / TESTIMONIALS */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-6 pt-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
            Fikrlar
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            O'quvchilarimiz tajribasi
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS_DATA.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-apple hover:border-[#FF6A00]/30 transition-all duration-300 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-1 text-[#FF6A00]">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={14} fill="#FF6A00" />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed italic">
                  "{t.review}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h4 className="text-sm font-bold text-white">{t.name}</h4>
                <p className="text-xs text-zinc-500">{t.course}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. FAQ SECTION */}
      {/* ========================================================================= */}
      <section id="faq" className="max-w-4xl mx-auto px-6 pt-12">
        <div className="text-center mb-16 space-y-4">
          <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Eng ko'p beriladigan savollar
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = activeFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/5 bg-[#121214] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors outline-none"
                >
                  <span className="text-base md:text-lg font-bold text-white pr-4">
                    {item.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-[#FF6A00] transition-transform duration-300 shrink-0 ${
                      isOpen ? 'rotate-180 bg-[#FF6A00]/10' : ''
                    }`}
                  >
                    <ChevronDown size={18} />
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
                      <div className="p-6 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-white/5 bg-[#0A0A0A]/50">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. FINAL CTA SECTION */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-6 pt-12">
        <div className="card-apple p-10 md:p-20 text-center relative overflow-hidden bg-gradient-to-b from-[#121214] via-[#0A0A0A] to-[#0A0A0A] border border-white/10 glow-orange">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#FF6A00]/15 blur-[160px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-tight">
              Kelajakni kutma. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#FF6A00] to-[#FF6A00]">
                Uni o‘zing qur.
              </span>
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl font-normal max-w-xl mx-auto">
              InFast IT-Academy bilan IT yo‘lingni bugun boshlagin. Bepul konsultatsiya va sinov darsi uchun ariza qoldiring.
            </p>
            <div className="pt-4">
              <button
                onClick={() => openEnrollment()}
                className="btn-brand-orange text-lg font-bold px-10 py-5 rounded-full inline-flex items-center gap-2 group shadow-2xl shadow-[#FF6A00]/30"
              >
                <span>Kursga yozilish</span>
                <ArrowRight size={20} className="group-hover:translate-x-1.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Course Detail Modal */}
      <CourseDetailModal
        isOpen={!!selectedCourseForDetail}
        onClose={() => setSelectedCourseForDetail(null)}
        course={selectedCourseForDetail}
        onEnroll={(cTitle) => openEnrollment(cTitle)}
      />
    </div>
  );
};

const Home = () => {
  return (
    <LandingLayout>
      {({ openEnrollment }) => <HomeContent openEnrollment={openEnrollment} />}
    </LandingLayout>
  );
};

export default Home;
