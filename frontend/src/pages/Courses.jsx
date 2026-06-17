import { useState, useEffect } from 'react';
import { courseAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch,
    HiOutlineBookOpen, HiOutlineClock, HiOutlineSparkles
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
                toast.success("Kurs yangilandi");
            } else {
                await courseAPI.create(submitData);
                toast.success("Kurs qo'shildi");
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
            toast.success("Kurs o'chirildi");
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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">O'quv kurslari</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1">Markazda mavjud bo'lgan barcha ta'lim yo'nalishlari</p>
                </div>
                <button
                    onClick={openAddModal}
                    className="btn-primary flex items-center gap-2"
                >
                    <HiOutlinePlus className="w-4 h-4" />
                    <span>Yangi kurs qo'shish</span>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 outline-none focus:border-[#0066FF] transition-all text-gray-800 dark:text-white"
                    placeholder="Kerakli kursni qidiring..."
                />
                <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
            </div>

            {/* Dynamic Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.length === 0 ? (
                    <div className="col-span-full py-24 text-center text-zinc-400">
                        <HiOutlineBookOpen className="w-12 h-12 mx-auto mb-3" />
                        <h3 className="text-sm font-medium">Hali kurslar qo'shilmagan</h3>
                    </div>
                ) : (
                    filteredCourses.map((c) => {
                        return (
                            <div
                                key={c._id}
                                className="bg-white dark:bg-[#111111] rounded-xl p-5 border border-gray-100 dark:border-zinc-900/60 flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="w-8 h-8 rounded-lg bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center border border-[#0066FF]/20">
                                            <HiOutlineSparkles className="w-4 h-4" />
                                        </div>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                                            c.holati === 'faol'
                                                ? 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20'
                                                : 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20'
                                        }`}>
                                            {c.holati}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{c.nomi}</h3>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-2 h-8">
                                            {c.tavsif || "Kurs haqida qisqacha ma'lumot kiritilmagan."}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                        <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Oylik to'lov</span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">{formatMoney(c.narx)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-zinc-500">
                                        <span className="flex items-center gap-1.5">
                                            <HiOutlineClock className="w-4 h-4 text-[#0066FF]" />
                                            <span>Davomiyligi: <strong className="text-gray-800 dark:text-zinc-200">{c.davomiyligi || 'Nomalum'}</strong></span>
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => openEditModal(c)}
                                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#0066FF] transition-colors"
                                            >
                                                <HiOutlinePencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => { setDeleteId(c._id); setConfirmOpen(true); }}
                                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-[#FF3B30] transition-colors"
                                            >
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modal */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedCourse ? "Kursni tahrirlash" : "Yangi kurs qo'shish"} size="md">
                <form onSubmit={handleSubmit} className="space-y-6 py-2">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Kurs nomi *</label>
                            <input type="text" value={form.nomi} onChange={e => setForm({ ...form, nomi: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold text-gray-800 dark:text-white" placeholder="Masalan: Graphic Design" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Narxi (so'm) *</label>
                                <input type="number" value={form.narx} onChange={e => setForm({ ...form, narx: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-bold text-gray-800 dark:text-white" placeholder="700000" required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Davomiyligi</label>
                                <input type="text" value={form.davomiyligi} onChange={e => setForm({ ...form, davomiyligi: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold text-gray-800 dark:text-white" placeholder="6 oy" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tavsif</label>
                            <textarea value={form.tavsif} onChange={e => setForm({ ...form, tavsif: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold text-gray-800 dark:text-white resize-none" rows="3" placeholder="Kurs haqida batafsil..." />
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Bekor qilish</button>
                        <button type="submit" className="btn-primary">
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
