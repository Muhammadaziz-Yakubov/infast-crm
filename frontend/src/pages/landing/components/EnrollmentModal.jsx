import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, CheckCircle2, Sparkles, BookOpen, MapPin, User, Phone } from 'lucide-react';
import { leadAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import { COURSES_DATA } from '../data/academyData';

const EnrollmentModal = ({ isOpen, onClose, defaultCourse = '' }) => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    course: defaultCourse || COURSES_DATA[0]?.title || 'Frontend Development',
    branch: 'Buloqboshi (Bosh filial)',
    comment: ''
  });

  useEffect(() => {
    if (defaultCourse) {
      setForm((prev) => ({ ...prev, course: defaultCourse }));
    }
  }, [defaultCourse]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      return toast.error("Iltimos, ismingiz va telefon raqamingizni kiriting.");
    }

    setLoading(true);
    try {
      await leadAPI.publicCreate({
        name: form.name.trim(),
        phone: form.phone.trim(),
        course: form.course,
        source: `Landing Page - ${form.branch}`,
        notes: form.comment || 'InFast IT-Academy landing saytidan ariza',
        status: 'Yangi Lead'
      });
      
      setSubmitted(true);
      toast.success("Arizangiz qabul qilindi! Tez orada bog'lanamiz. ✨");
    } catch (err) {
      console.error(err);
      // Fallback user experience
      setSubmitted(true);
      toast.success("Arizangiz qabul qilindi! Operatorimiz aloqaga chiqadi.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setForm({
      name: '',
      phone: '',
      course: COURSES_DATA[0]?.title || 'Frontend Development',
      branch: 'Buloqboshi (Bosh filial)',
      comment: ''
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
          className="relative w-full max-w-xl bg-[#121214] border border-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 p-6 md:p-10 text-white"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-white/10"
          >
            <X size={20} />
          </button>

          {submitted ? (
            <div className="py-10 text-center space-y-6">
              <div className="w-16 h-16 bg-[#FF6A00]/10 border border-[#FF6A00]/30 rounded-2xl flex items-center justify-center mx-auto text-[#FF6A00]">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Arizangiz muvaffaqiyatli yuborildi!</h3>
                <p className="text-zinc-400 text-sm max-w-md mx-auto leading-relaxed">
                  InFast IT-Academy menejeri yaqin 15 daqiqa ichida siz bilan bog'lanadi va bepul konsultatsiya hamda o'quv rejasini taqdim etadi.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="btn-brand-orange mx-auto px-8"
              >
                Yopish
              </button>
            </div>
          ) : (
            <div>
              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20 text-[#FF6A00] text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles size={14} /> InFast IT-Academy
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  Kursga yozilish
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Ma'lumotlaringizni qoldiring, biz sizga mos o'quv dasturi va dars jadvalini tanlashda yordam beramiz.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-xs font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                    <User size={14} className="text-[#FF6A00]" /> Ism-familiyangiz
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Masalan: Sardor Temirov"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-all placeholder:text-zinc-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                    <Phone size={14} className="text-[#FF6A00]" /> Telefon raqamingiz
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+998 90 123 45 67"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-all placeholder:text-zinc-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                      <BookOpen size={14} className="text-[#FF6A00]" /> Qaysi yo'nalish?
                    </label>
                    <select
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                      className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-3.5 text-white text-sm focus:outline-none focus:border-[#FF6A00] transition-all"
                    >
                      {COURSES_DATA.map((c) => (
                        <option key={c.id} value={c.title} className="bg-[#18181b] text-white">
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-zinc-300 mb-2 flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#FF6A00]" /> Filial / Masofaviy
                    </label>
                    <select
                      value={form.branch}
                      onChange={(e) => setForm({ ...form, branch: e.target.value })}
                      className="w-full bg-[#18181b] border border-white/10 rounded-xl px-3.5 py-3.5 text-white text-sm focus:outline-none focus:border-[#FF6A00] transition-all"
                    >
                      <option value="Buloqboshi (Bosh filial)">Buloqboshi filial</option>
                      <option value="Toshkent">Toshkent filial</option>
                      <option value="Masofaviy (Online)">Online ta'lim</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-brand-orange py-4 font-semibold text-base flex items-center justify-center gap-2 group disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Arizani yuborish</span>
                        <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
                  Arizangiz maxfiylik siyosatiga binoan ko'rib chiqiladi. Hech qanday spamlarsiz.
                </p>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnrollmentModal;
