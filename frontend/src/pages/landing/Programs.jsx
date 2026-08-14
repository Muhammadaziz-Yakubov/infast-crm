import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code2, Server, Layout, Database, Smartphone, Palette, ChevronRight, Bookmark } from 'lucide-react';
import LandingLayout from './components/LandingLayout';
import CourseDetailModal from './components/CourseDetailModal';
import { COURSES_DATA } from './data/academyData';

const ProgramsContent = ({ openEnrollment }) => {
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState(null);

  return (
    <section className="pt-36 pb-24 bg-[#0A0A0A] min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00] text-xs font-semibold uppercase tracking-wider">
            <Bookmark size={14} /> Kelajak Kasblari
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            InFast IT-Academy <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#FF6A00]">
              O'quv Dasturlari
            </span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed font-normal">
            InFast IT-Academy darslari Muhammadaziz Yakubov tomonidan tasdiqlangan maxsus amaliy metodika va xalqaro standartlar asosida o'tiladi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COURSES_DATA.map((program, index) => (
            <motion.div
              key={program.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="card-apple flex flex-col justify-between hover:border-[#FF6A00]/40 transition-all duration-300 group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="px-3 py-1 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20 text-xs font-semibold">
                    {program.badge}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">
                    {program.duration}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FF6A00] transition-colors">
                  {program.title}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {program.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {program.tools.map((tool, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-white/5 text-[11px] text-zinc-400 border border-white/5 font-mono">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between gap-4">
                <button
                  onClick={() => setSelectedCourseForDetail(program)}
                  className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Batafsil ma'lumot
                </button>
                <button
                  onClick={() => openEnrollment(program.title)}
                  className="btn-brand-orange text-xs px-4 py-2 font-semibold"
                >
                  Yozilish →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <CourseDetailModal
        isOpen={!!selectedCourseForDetail}
        onClose={() => setSelectedCourseForDetail(null)}
        course={selectedCourseForDetail}
        onEnroll={(cTitle) => openEnrollment(cTitle)}
      />
    </section>
  );
};

const Programs = () => (
  <LandingLayout>
    {({ openEnrollment }) => <ProgramsContent openEnrollment={openEnrollment} />}
  </LandingLayout>
);

export default Programs;
