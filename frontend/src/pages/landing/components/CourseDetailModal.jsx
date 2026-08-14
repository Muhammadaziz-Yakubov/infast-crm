import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, Calendar, ArrowRight, ShieldCheck, Wrench } from 'lucide-react';

const CourseDetailModal = ({ isOpen, onClose, course, onEnroll }) => {
  if (!isOpen || !course) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-[#121214] rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10 p-6 md:p-10 text-white"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-white/10"
          >
            <X size={20} />
          </button>

          {/* Badge & Title */}
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00] text-xs font-semibold uppercase tracking-wider mb-3">
              {course.badge}
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {course.title}
            </h2>
            <p className="text-zinc-400 text-sm md:text-base mt-2 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Meta Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-xs text-zinc-500 block mb-1">Davomiyligi</span>
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Clock size={16} className="text-[#FF6A00]" /> {course.duration}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <span className="text-xs text-zinc-500 block mb-1">Daraja</span>
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#FF6A00]" /> {course.difficulty}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 col-span-2 md:col-span-1">
              <span className="text-xs text-zinc-500 block mb-1">Dars formati</span>
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Calendar size={16} className="text-[#FF6A00]" /> Amaliy (Offline / Online)
              </span>
            </div>
          </div>

          {/* Curriculum Details */}
          <div className="space-y-4 mb-8">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
              Dasturda nimani o'rganasiz?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {course.details?.map((detail, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-sm text-zinc-300">
                  <CheckCircle2 size={18} className="text-[#FF6A00] shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          {course.tools && course.tools.length > 0 && (
            <div className="mb-8">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Wrench size={14} className="text-[#FF6A00]" /> Ishlatiladigan instrumentlar:
              </h4>
              <div className="flex flex-wrap gap-2">
                {course.tools.map((t, i) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-white/5 text-xs font-mono text-zinc-300 border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA Bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-500 block">Sinfdagi o'rinlar cheklangan</span>
              <span className="text-sm font-medium text-zinc-300">Birinchi dars — bepul sinov darsi</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onEnroll(course.title);
              }}
              className="w-full sm:w-auto btn-brand-orange py-3 px-8 text-sm font-semibold flex items-center justify-center gap-2 group"
            >
              <span>Ushbu kursga yozilish</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CourseDetailModal;
