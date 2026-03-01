import { useState, useEffect } from 'react';
import { courseAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
    HiOutlineBookOpen, HiOutlineCurrencyDollar, HiOutlineClock,
    HiOutlineSparkles
} from 'react-icons/hi';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({
        nomi: '', narx: '', davomiyligi: '', tavsif: '', holati: 'faol'
    });

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const res = await courseAPI.getAll();
            setCourses(res.data.data);
        } catch (err) {
            toast.error("Kurslarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setSelectedCourse(null);
        setForm({ nomi: '', narx: '', davomiyligi: '', tavsif: '', holati: 'faol' });
        setModalOpen(true);
    };

    const openEditModal = (course) => {
        setSelectedCourse(course);
        setForm({
            nomi: course.nomi,
            narx: course.narx || '',
            davomiyligi: course.davomiyligi || '',
            tavsif: course.tavsif || '',
            holati: course.holati || 'faol'
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = { ...form, narx: Number(form.narx) };
            if (selectedCourse) {
                await courseAPI.update(selectedCourse._id, submitData);
                toast.success("Kurs yangilandi ✨");
            } else {
                await courseAPI.create(submitData);
                toast.success("Kurs qo'shildi 🚀");
            }
            setModalOpen(false);
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const handleDelete = async () => {
        try {
            await courseAPI.delete(deleteId);
            toast.success("Kurs o'chirildi 👋");
            setConfirmOpen(false);
            fetchCourses();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik');
        }
    };

    const formatMoney = (amount) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    const filteredCourses = courses.filter(c =>
        c.nomi?.toLowerCase().includes(search.toLowerCase())
    );

    const cardColors = [
        { gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20', bg: 'bg-blue-50/50 dark:bg-blue-900/10' },
        { gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-50/50 dark:bg-emerald-900/10' },
        { gradient: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/20', bg: 'bg-purple-50/50 dark:bg-purple-900/10' },
        { gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/20', bg: 'bg-amber-50/50 dark:bg-amber-900/10' },
    ];

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white uppercase italic">
                        O'quv <span className="text-primary-500">Kurslari</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">Markazda mavjud bo'lgan barcha ta'lim yo'nalishlari</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gray-900 dark:bg-primary-600 
                        text-white font-black text-sm shadow-xl shadow-primary-500/20 transition-all hover:-translate-y-1 active:scale-95"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    <span>Yangi kurs qo'shish</span>
                </button>
            </div>

            {/* Premium Search */}
            <div className="relative group">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-12 py-5 rounded-3xl bg-white dark:bg-dark-800 border-2 border-transparent 
                        focus:border-primary-500 shadow-sm focus:shadow-xl outline-none transition-all font-bold"
                    placeholder="Kerakli kursni qidiring..."
                />
                <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 w-6 h-6" />
            </div>

            {/* Dynamic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.length === 0 ? (
                    <div className="col-span-full py-32 text-center opacity-30">
                        <HiOutlineBookOpen className="w-20 h-20 mx-auto mb-4" />
                        <h3 className="text-2xl font-black">Hali kurslar yo'q</h3>
                    </div>
                ) : (
                    filteredCourses.map((c, index) => {
                        const style = cardColors[index % cardColors.length];
                        return (
                            <div
                                key={c._id}
                                className="group relative bg-white dark:bg-dark-800 rounded-[2.5rem] p-7 border border-gray-100 dark:border-white/5 
                                    shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
                            >
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${style.gradient} 
                                            flex items-center justify-center text-white shadow-lg ${style.shadow} group-hover:rotate-6 transition-transform`}>
                                            <HiOutlineSparkles className="w-8 h-8" />
                                        </div>
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${c.holati === 'faol' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                                            }`}>
                                            {c.holati}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-tight uppercase italic">{c.nomi}</h3>
                                    <p className="text-sm text-gray-400 font-medium mb-8 line-clamp-2 h-10">{c.tavsif || "Kurs haqida qisqacha ma'lumot kiritilmagan."}</p>

                                    <div className="space-y-3 mt-auto">
                                        <div className={`flex items-center justify-between p-4 rounded-2xl ${style.bg}`}>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Oylik to'lov</span>
                                            <span className="font-black text-gray-900 dark:text-white">{formatMoney(c.narx)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs font-black text-gray-500 px-2 uppercase tracking-tight">
                                            <HiOutlineClock className="w-4 h-4 text-primary-500" />
                                            Davomiyligi: <span className="text-gray-900 dark:text-white">{c.davomiyligi || 'Nomalum'}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-2 mt-8 pt-6 border-t border-gray-50 dark:border-dark-700/50 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                        <button
                                            onClick={() => openEditModal(c)}
                                            className="p-3 rounded-xl bg-gray-50 dark:bg-dark-900 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <HiOutlinePencil className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => { setDeleteId(c._id); setConfirmOpen(true); }}
                                            className="p-3 rounded-xl bg-gray-50 dark:bg-dark-900 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        >
                                            <HiOutlineTrash className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${style.gradient}`} />
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal - Modernized */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedCourse ? "Kursni yangilash" : "Yangi kurs"} size="md">
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Kurs nomi *</label>
                            <input type="text" value={form.nomi} onChange={e => setForm({ ...form, nomi: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" placeholder="Masalan: Graphic Design" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Narxi (so'm) *</label>
                                <input type="number" value={form.narx} onChange={e => setForm({ ...form, narx: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-black" placeholder="700000" required />
                            </div>
                            <div>
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Davomiyligi</label>
                                <input type="text" value={form.davomiyligi} onChange={e => setForm({ ...form, davomiyligi: e.target.value })}
                                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold" placeholder="6 oy" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Tavsif</label>
                            <textarea value={form.tavsif} onChange={e => setForm({ ...form, tavsif: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none transition-all font-bold resize-none" rows="3" placeholder="Kurs haqida batafsil..." />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-4 rounded-2xl font-black text-gray-500 bg-gray-100 transition-active active:scale-95">Bekor qilish</button>
                        <button type="submit" className="flex-1 py-4 rounded-2xl font-black text-white bg-primary-600 shadow-xl active:scale-95 transition-all">
                            {selectedCourse ? 'Saqlash' : "Yaratish"}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Kursni o'chirish"
                message="Haqiqatan ham bu kursni o'chirmoqchimisiz? Kurs bilan bog'liq barcha guruhlar faoliyati to'xtatilishi mumkin."
            />
        </div>
    );
};

export default Courses;
