import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Clock, Calendar, Bookmark, Send } from 'lucide-react';
import { leadAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const CourseModal = ({ isOpen, onClose, course }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        phone: ''
    });

    if (!isOpen || !course) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.phone) {
            return toast.error('Iltimos barcha maydonlarni to\'ldiring');
        }

        setLoading(true);
        try {
            await leadAPI.publicCreate({
                ...form,
                course: course.title,
                source: 'Landing - Course Modal',
                status: 'Yangi Lead'
            });
            toast.success('Arizangiz qabul qilindi! ✨');
            setForm({ name: '', phone: '' });
            onClose();
        } catch (err) {
            toast.error('Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden z-10"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white"
                    >
                        <X size={24} />
                    </button>

                    <div className="flex flex-col md:flex-row h-full">
                        {/* Course Info */}
                        <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-6">
                                <Bookmark size={14} /> {course.title}
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-none uppercase tracking-tighter italic">
                                {course.title} <span className="text-blue-500">KURSIDAN</span> NIMANI KUTASIZ?
                            </h2>
                            <p className="text-gray-400 text-lg mb-8 italic">
                                "{course.desc}"
                            </p>

                            <div className="space-y-4 mb-10">
                                {course.details?.map((detail, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                                        <span className="text-gray-300 font-medium">{detail}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                                    <Clock size={20} className="text-blue-500" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black">Davomiyligi</p>
                                        <p className="text-white font-bold">{course.duration}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                                    <Calendar size={20} className="text-blue-500" />
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black">Haftada</p>
                                        <p className="text-white font-bold">3 kun / 2 soat</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Registration Form */}
                        <div className="w-full md:w-[40%] p-8 md:p-12 bg-blue-600/5">
                            <h3 className="text-2xl font-black text-white mb-8 uppercase italic tracking-tighter underline decoration-blue-500 decoration-4">Ro'yxatdan o'tish</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Ismingiz</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-gray-700"
                                        placeholder="Ism"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase mb-2 block tracking-widest">Telefon raqam</label>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-gray-700"
                                        placeholder="+998"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            Xabar qoldirish
                                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-gray-500 text-center leading-relaxed font-bold italic">
                                    Ariza topshirish orqali siz maxfiylik siyosatiga rozilik bildirasiz. <br />Adminlarimiz yaqin vaqt ichida bog'lanishadi.
                                </p>
                            </form>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CourseModal;
