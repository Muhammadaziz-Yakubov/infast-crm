import { useState, useEffect } from 'react';
import { taskAPI, groupAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlineUsers,
    HiOutlinePencil, HiOutlineTrash, HiOutlineCheckCircle,
    HiOutlineX, HiOutlinePhotograph, HiOutlineCalendar,
    HiOutlineBadgeCheck, HiOutlineEye, HiOutlineAnnotation,
    HiOutlineUpload, HiOutlineInformationCircle, HiOutlinePaperAirplane
} from 'react-icons/hi';

const Tasks = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);
    const [taskFilter, setTaskFilter] = useState('active'); // 'active' or 'completed'

    // Form state
    const [form, setForm] = useState({
        title: '',
        description: '',
        maxScore: 100,
        deadline: '',
        groupId: '',
        image: null
    });
    const [creating, setCreating] = useState(false);

    // Student Submit state
    const [submitForm, setSubmitForm] = useState({
        comment: '',
        images: []
    });
    const [submitting, setSubmitting] = useState(false);

    // Grading state
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [scoreValue, setScoreValue] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, groupsRes] = await Promise.all([
                taskAPI.getMyTasks(),
                groupAPI.getAll()
            ]);
            setTasks(tasksRes.data.data);
            setGroups(groupsRes.data.data);
        } catch (err) {
            console.error("Fetch data error:", err);
            toast.error("Ma'lumotlarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setCreating(true);
        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (key === 'image' && form[key]) {
                formData.append('image', form[key]);
            } else if (form[key]) {
                formData.append(key, form[key]);
            }
        });

        try {
            await taskAPI.create(formData);
            toast.success("Vazifa yaratildi");
            setIsCreateOpen(false);
            setForm({ title: '', description: '', maxScore: 100, deadline: '', groupId: '', image: null });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setCreating(false);
        }
    };

    const fetchSubmissions = async (task) => {
        setSelectedTask(task);
        setIsSubmissionsOpen(true);
        setLoadingSubmissions(true);
        try {
            const res = await taskAPI.getSubmissions(task._id);
            setSubmissions(res.data.data);
        } catch (err) {
            toast.error("Topshiriqlarni yuklashda xatolik");
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleGrade = async () => {
        if (!scoreValue) return toast.error("Ballni kiriting");
        try {
            await taskAPI.gradeSubmission(gradingSubmission._id, scoreValue);
            toast.success("Ball qo'yildi");
            setGradingSubmission(null);
            setScoreValue('');
            fetchSubmissions(selectedTask);
        } catch (err) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const handleCompleteTask = async (taskId) => {
        if (!window.confirm("Vazifani tugatishni tasdiqlaysizmi? Bu vazifa arxivga o'tadi.")) return;
        try {
            await taskAPI.complete(taskId);
            toast.success("Vazifa tugatildi");
            fetchData();
        } catch (err) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const handleReopenTask = async (taskId) => {
        if (!window.confirm("Vazifani qayta faollashtirishni tasdiqlaysizmi?")) return;
        try {
            await taskAPI.reopen(taskId);
            toast.success("Vazifa qayta faollashtirildi");
            fetchData();
        } catch (err) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm("Vazifani o'chirishni tasdiqlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.")) return;
        try {
            await taskAPI.delete(taskId);
            toast.success("Vazifa o'chirildi");
            fetchData();
        } catch (err) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const handleSubmitTask = async (e) => {
        e.preventDefault();
        if (submitForm.images.length === 0) return toast.error("Kamida bitta rasm yuklang");
        setSubmitting(true);

        const formData = new FormData();
        formData.append('taskId', selectedTask._id);
        formData.append('comment', submitForm.comment);
        for (let i = 0; i < submitForm.images.length; i++) {
            formData.append('images', submitForm.images[i]);
        }

        try {
            await taskAPI.submit(formData);
            toast.success("Vazifa muvaffaqiyatli topshirildi");
            setIsSubmitOpen(false);
            setSubmitForm({ comment: '', images: [] });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Topshirishda xatolik yuz berdi");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">O'quv vazifalari</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1">{user?.role === 'student' ? 'Guruh va kursingizga oid vazifalar' : 'Guruhlar uchun topshiriqlarni boshqarish'}</p>
                </div>
                {user?.role !== 'student' && (
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span>Yangi vazifa</span>
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 p-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg w-fit border border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setTaskFilter('active')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${taskFilter === 'active' ? 'bg-white dark:bg-zinc-800 text-[#0066FF] shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                    Faol vazifalar
                </button>
                <button
                    onClick={() => setTaskFilter('completed')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${taskFilter === 'completed' ? 'bg-white dark:bg-zinc-800 text-[#00C853] shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                    Arxiv (Tugatilgan)
                </button>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.filter(t => (t.status || 'active') === taskFilter).map((task) => (
                    <div
                        key={task._id}
                        className="bg-white dark:bg-[#111111] rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-900/60 flex flex-col justify-between"
                    >
                        <div>
                            <div className="relative h-40 bg-zinc-100 dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-900/60">
                                {task.image ? (
                                    <img src={task.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                        <HiOutlinePhotograph className="w-10 h-10" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-2.5 py-0.5 rounded text-[10px] font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-zinc-800">
                                    {task.maxScore} Ball
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{task.title}</h3>
                                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                                        <HiOutlineUsers className="w-3.5 h-3.5" />
                                        <span>{task.group?.nomi || 'Guruhsiz'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                                        <HiOutlineCalendar className="w-3.5 h-3.5" />
                                        <span>Muddati: {new Date(task.deadline).toLocaleDateString('uz')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 pt-0">
                            <div className="grid grid-cols-3 gap-2 border-t border-gray-50 dark:border-zinc-900/40 pt-4">
                                {user?.role === 'student' ? (
                                    <>
                                        <button
                                            onClick={() => { setSelectedTask(task); setIsDetailsOpen(true); }}
                                            className="px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <HiOutlineInformationCircle className="w-4 h-4" />
                                            <span>Batafsil</span>
                                        </button>
                                        <button
                                            disabled={task.isSubmitted}
                                            onClick={() => { setSelectedTask(task); setIsSubmitOpen(true); }}
                                            className={`col-span-2 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${task.isSubmitted ? 'bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20 cursor-not-allowed' : 'btn-primary'}`}
                                        >
                                            <HiOutlinePaperAirplane className={`w-4 h-4 ${!task.isSubmitted && 'rotate-45'}`} />
                                            <span>{task.isSubmitted ? 'Topshirilgan' : 'Topshirish'}</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => fetchSubmissions(task)}
                                            className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 text-xs font-medium text-[#0066FF] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <HiOutlineEye className="w-4 h-4" />
                                            <span>Ko'rish</span>
                                        </button>
                                        {task.status !== 'completed' ? (
                                            <button
                                                onClick={() => handleCompleteTask(task._id)}
                                                className="px-2 py-1.5 rounded-lg bg-[#00C853]/15 text-[#00C853] border border-[#00C853]/20 text-xs font-medium hover:bg-[#00C853]/25 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <HiOutlineBadgeCheck className="w-4 h-4" />
                                                <span>Tugatish</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleReopenTask(task._id)}
                                                className="px-2 py-1.5 rounded-lg bg-[#FF9500]/15 text-[#FF9500] border border-[#FF9500]/20 text-xs font-medium hover:bg-[#FF9500]/25 transition-colors flex items-center justify-center gap-1"
                                            >
                                                <HiOutlineX className="w-4 h-4" />
                                                <span>Qaytarish</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteTask(task._id)}
                                            className="px-2 py-1.5 rounded-lg bg-[#FF3B30]/15 text-[#FF3B30] border border-[#FF3B30]/20 text-xs font-medium hover:bg-[#FF3B30]/25 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <HiOutlineTrash className="w-4 h-4" />
                                            <span>O'chirish</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Task Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative bg-white dark:bg-[#111111] w-full max-w-lg rounded-xl p-6 shadow-xl border border-gray-200 dark:border-zinc-800 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Yangi vazifa yaratish</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 border border-gray-205 dark:border-zinc-800">
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Guruh *</label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium cursor-pointer"
                                    value={form.groupId}
                                    onChange={e => setForm({ ...form, groupId: e.target.value })}
                                    required
                                >
                                    <option value="">Guruhni tanlang</option>
                                    {groups.map(g => (
                                        <option key={g._id} value={g._id}>{g.nomi}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Sarlavha *</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Maksimal ball *</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium"
                                        value={form.maxScore}
                                        onChange={e => setForm({ ...form, maxScore: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Deadline (Muddati) *</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium"
                                    value={form.deadline}
                                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tavsif *</label>
                                <textarea
                                    className="w-full h-24 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium resize-none"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Muqova rasmi</label>
                                <div className="relative group/upload">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={e => setForm({ ...form, image: e.target.files[0] })}
                                        accept="image/*"
                                    />
                                    <div className="w-full py-8 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-1 group-hover/upload:border-[#0066FF] transition-colors bg-gray-50 dark:bg-zinc-900/50">
                                        <HiOutlineUpload className="w-8 h-8 text-zinc-400" />
                                        <span className="text-[11px] text-zinc-400 font-medium">Rasm yuklash yoki tashlash</span>
                                        {form.image && <span className="text-xs text-[#00C853] font-semibold mt-2">{form.image.name}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary">Bekor qilish</button>
                                <button type="submit" disabled={creating} className="btn-primary">
                                    {creating ? 'Yaratilmoqda...' : "E'lon qilish"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Submissions Modal */}
            {isSubmissionsOpen && selectedTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSubmissionsOpen(false)} />
                    <div className="relative bg-white dark:bg-[#111111] w-full max-w-3xl rounded-xl p-6 shadow-xl border border-gray-200 dark:border-zinc-800 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Topshiriqlar: {selectedTask.title}</h2>
                                <p className="text-[11px] text-zinc-400 mt-0.5">{submissions.length} ta topshiriq topshirildi</p>
                            </div>
                            <button onClick={() => setIsSubmissionsOpen(false)} className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 border border-gray-205 dark:border-zinc-800">
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        {loadingSubmissions ? (
                            <div className="py-12 flex justify-center"><div className="w-8 h-8 border-2 border-[#0066FF] border-t-transparent rounded-full animate-spin" /></div>
                        ) : submissions.length === 0 ? (
                            <div className="py-12 text-center text-zinc-400">
                                <HiOutlineAnnotation className="w-12 h-12 mx-auto mb-2" />
                                <p className="text-xs font-medium">Hali hech kim topshirmagan</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {submissions.map((sub) => (
                                    <div key={sub._id} className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-850 space-y-4">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-zinc-150 dark:bg-zinc-800 flex items-center justify-center text-zinc-800 dark:text-zinc-100 font-semibold text-sm border border-zinc-250 dark:border-zinc-700 uppercase">
                                                    {sub.student?.ism?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{sub.student?.ism}</h4>
                                                    <p className="text-[10px] text-zinc-400 mt-0.5">{sub.student?.username || sub.student?.telefon}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <span className="text-[10px] text-zinc-400 font-medium block">Ball</span>
                                                    <span className={`text-sm font-semibold ${sub.status === 'graded' ? 'text-[#00C853]' : 'text-[#FF9500]'}`}>
                                                        {sub.status === 'graded' ? `${sub.score} ball` : 'Kutilmoqda'}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => { setGradingSubmission(sub); setScoreValue(sub.score || ''); }}
                                                    className="px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-850 hover:bg-zinc-800 dark:hover:bg-zinc-800 text-white text-xs font-semibold transition-colors border border-zinc-800"
                                                >
                                                    Ball qo'yish
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {sub.images.map((img, i) => (
                                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm aspect-square block">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                        {sub.comment && (
                                            <div className="p-3 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs italic text-zinc-500">
                                                "{sub.comment}"
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Grading Modal */}
            <Modal
                isOpen={!!gradingSubmission}
                onClose={() => setGradingSubmission(null)}
                title="Ball Qo'yish"
                size="sm"
            >
                <div className="space-y-4 py-2">
                    <div className="text-center">
                        <span className="text-xs text-zinc-500 font-medium">Maksimal ball: {selectedTask?.maxScore}</span>
                    </div>
                    <input
                        type="number"
                        className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-xl font-bold text-center"
                        value={scoreValue}
                        onChange={e => setScoreValue(e.target.value)}
                        min="0"
                        max={selectedTask?.maxScore}
                        autoFocus
                    />
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button
                            onClick={() => setGradingSubmission(null)}
                            className="btn-secondary"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={handleGrade}
                            className="btn-primary"
                        >
                            Saqlash
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Task Details Modal (for Student) */}
            {isDetailsOpen && selectedTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDetailsOpen(false)} />
                    <div className="relative bg-white dark:bg-[#111111] w-full max-w-xl rounded-xl p-6 shadow-xl border border-gray-200 dark:border-zinc-800 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Vazifa tafsilotlari</h2>
                            <button onClick={() => setIsDetailsOpen(false)} className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 border border-gray-205 dark:border-zinc-800">
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="relative h-48 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                                {selectedTask.image ? (
                                    <img src={selectedTask.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                        <HiOutlinePhotograph className="w-12 h-12" />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{selectedTask.title}</h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#0066FF]/10 text-[#0066FF] border border-[#0066FF]/20">
                                        {selectedTask.maxScore} ball
                                    </span>
                                </div>

                                <div className="flex gap-4 py-2 border-y border-gray-100 dark:border-zinc-900/60 text-xs text-zinc-500">
                                    <span className="flex items-center gap-1">
                                        <HiOutlineUsers className="w-4 h-4 text-[#0066FF]" />
                                        {selectedTask.group?.nomi || 'Guruhsiz'}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <HiOutlineCalendar className="w-4 h-4 text-[#FF9500]" />
                                        Muddati: {new Date(selectedTask.deadline).toLocaleDateString('uz')}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <span className="text-xs text-zinc-400 font-medium block">Vazifa sharti</span>
                                    <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-850">
                                        {selectedTask.description}
                                    </p>
                                </div>

                                {selectedTask.submission && (
                                    <div className="p-4 rounded-lg bg-[#00C853]/5 border border-[#00C853]/15 space-y-2">
                                        <span className="text-xs text-[#00C853] font-semibold block">Sizning topshirig'ingiz</span>
                                        <div className="flex gap-1.5">
                                            {selectedTask.submission.images?.map((img, i) => (
                                                <a key={i} href={img} target="_blank" rel="noreferrer" className="w-10 h-10 rounded overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm block aspect-square">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                        {selectedTask.submission.score && (
                                            <p className="text-xs font-semibold text-[#00C853] mt-1">Baholandi: {selectedTask.submission.score} ball</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Submit Modal (for Student) */}
            {isSubmitOpen && selectedTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSubmitOpen(false)} />
                    <div className="relative bg-white dark:bg-[#111111] w-full max-w-lg rounded-xl p-6 shadow-xl border border-gray-200 dark:border-zinc-800 overflow-y-auto max-h-[90vh]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Vazifa topshirish</h2>
                            <button onClick={() => setIsSubmitOpen(false)} className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 border border-gray-205 dark:border-zinc-800">
                                <HiOutlineX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitTask} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Rasmlar (Skrinshotlar) *</label>
                                <div className="relative group/upload">
                                    <input
                                        type="file"
                                        multiple
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={e => setSubmitForm({ ...submitForm, images: Array.from(e.target.files) })}
                                        accept="image/*"
                                    />
                                    <div className="w-full py-8 rounded-lg border-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-1.5 group-hover/upload:border-[#0066FF] transition-all bg-gray-50 dark:bg-zinc-900/50">
                                        <HiOutlineUpload className="w-8 h-8 text-zinc-400" />
                                        <span className="text-[11px] text-zinc-400 font-medium">Rasmlarni tanlang</span>
                                        {submitForm.images.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1 px-4">
                                                {submitForm.images.map((img, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-[#00C853]/10 text-[#00C853] rounded text-[9px] font-semibold border border-[#00C853]/20">
                                                        {img.name.length > 15 ? img.name.substring(0, 15) + '...' : img.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Izoh (ixtiyoriy)</label>
                                <textarea
                                    className="w-full h-24 px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-medium resize-none"
                                    placeholder="Vazifa haqida qo'shimcha izoh..."
                                    value={submitForm.comment}
                                    onChange={e => setSubmitForm({ ...submitForm, comment: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                                <button type="button" onClick={() => setIsSubmitOpen(false)} className="btn-secondary">Bekor qilish</button>
                                <button type="submit" disabled={submitting} className="btn-primary">
                                    {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
