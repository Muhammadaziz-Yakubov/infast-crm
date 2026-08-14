import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Instagram, Linkedin, Github } from 'lucide-react';
import LandingLayout from './components/LandingLayout';
import { leadAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ContactContent = ({ openEnrollment }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    course: 'Frontend Development',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      return toast.error('Iltimos ismingiz va telefon raqamingizni kiriting.');
    }

    setLoading(true);
    try {
      await leadAPI.publicCreate({
        name: form.name.trim(),
        phone: form.phone.trim(),
        course: form.course,
        notes: form.message || 'Contact sahifasidan murojaat',
        source: 'Landing - Contact Page',
        status: 'Yangi Lead'
      });
      toast.success('Murojaatingiz qabul qilindi! Tez orada bog'lanamiz. ✨');
      setForm({
        name: '',
        phone: '',
        course: 'Frontend Development',
        message: ''
      });
    } catch (err) {
      toast.success('Murojaatingiz qabul qilindi! Operatorimiz aloqaga chiqadi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pt-36 pb-24 bg-[#0A0A0A] min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <span className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider px-3 py-1 rounded-full bg-[#FF6A00]/10 border border-[#FF6A00]/20">
            Aloqa
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Biz bilan bog'laning <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-[#FF6A00]">
              InFast IT-Academy
            </span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed font-normal">
            Savollaringiz bormi yoki professional maslahat kerakmi? Bizning mutaxassislarimiz yordam berishga tayyor.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Info Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-6">
              {[
                { title: "Bosh filial manzili", val: "Andijon viloyati Buloqboshi tumani, Yangi hokimiyat binosi 3-qavat", icon: <MapPin size={20} className="text-[#FF6A00]" /> },
                { title: "Aloqa telefon raqami", val: "+998 90 271 00 27", icon: <Phone size={20} className="text-[#FF6A00]" /> },
                { title: "Telegram kanal & admin", val: "@infast_academy", icon: <Send size={20} className="text-[#FF6A00]" /> },
                { title: "Elektron pochta", val: "info@infast.uz", icon: <Mail size={20} className="text-[#FF6A00]" /> },
              ].map((item, i) => (
                <div key={i} className="card-apple p-5 flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FF6A00]/10 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{item.title}</h4>
                    <p className="text-sm font-bold text-white leading-snug">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Ijtimoiy Tarmoqlar</h4>
              <div className="flex items-center space-x-3">
                <a href="https://instagram.com/infast_academy" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-[#FF6A00] transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="https://t.me/infast_academy" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-[#FF6A00] transition-colors">
                  <Send size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="card-apple p-8 md:p-10 border border-white/10 bg-[#121214]">
              <h3 className="text-2xl font-bold text-white mb-6">
                Xabar yoki Ariza yuborish
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-300 mb-2 block">Ismingiz</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Sardor Temirov"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#FF6A00] transition-all placeholder:text-zinc-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-300 mb-2 block">Telefon raqamingiz</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+998 90 123 45 67"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#FF6A00] transition-all placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 mb-2 block">Qiziqqan yo'nalishingiz</label>
                  <select
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                    className="w-full bg-[#18181b] border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-[#FF6A00] transition-all"
                  >
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Full-Stack Development">Full-Stack Development</option>
                    <option value="Computer Literacy">Computer Literacy</option>
                    <option value="AI / Artificial Intelligence">AI / Artificial Intelligence</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 mb-2 block">Xabaringiz (ixtiyoriy)</label>
                  <textarea
                    rows="4"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Qanday savolingiz bor?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-[#FF6A00] transition-all placeholder:text-zinc-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-brand-orange py-4 font-semibold text-base flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Arizani yuborish</span>
                      <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Contact = () => (
  <LandingLayout>
    {({ openEnrollment }) => <ContactContent openEnrollment={openEnrollment} />}
  </LandingLayout>
);

export default Contact;
