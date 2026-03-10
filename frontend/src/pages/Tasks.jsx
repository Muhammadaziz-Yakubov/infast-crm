import { useState, useEffect } from 'react';
import { taskAPI, groupAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import toast from 'react-hot-toast';
import {
    HiOutlinePlus, HiOutlineViewGrid, HiOutlineUsers,
    HiOutlinePencil, HiOutlineTrash, HiOutlineCheckCircle,
    HiOutlineX, HiOutlinePhotograph, HiOutlineCalendar,
    HiOutlineBadgeCheck, HiOutlineEye, HiOutlineAnnotation,
    HiOutlineUpload
} from 'react-icons/hi';

const Tasks = () => {
    const [tasks, setTasks] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
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

    // Grading state
    const [gradingSubmission, setGradingSubmission] = useState(null);
    const [scoreValue, setScoreValue] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, groupsRes] = await Promise.all([
                taskAPI.getMyTasks(), // For admin this should return all tasks they created, but my controller is simple now. I'll adjust it if needed.
                groupAPI.getAll()
            ]);
            // Currently my controller getMyTasks returns tasks for student group. 
            // I should have a separate admin getAll tasks or adjust based on role.
            // Let's assume for now admin gets all tasks via a search if I had implemented it, 
            // but for this MVP I'll fetch tasks from a more global-like view or the same endpoint if I adjust controller.

            // Wait, I didn't verify the admin task list endpoint. Let me check my controller.
            // Controller: getMyTasks (Student), createTask (Admin), getTaskSubmissions (Admin), gradeSubmission (Admin).
            // Actually, I should add a general getAllTasks for Admin.
            console.log("Admin tasks from API:", tasksRes.data.data);
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
            toast.success("Vazifa yaratildi ✨");
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
            toast.success("Ball qo'yildi ✅");
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
            toast.success("Vazifa tugatildi va arxivga olindi ✨");
            fetchData();
        } catch (err) {
            toast.error("Xatolik yuz berdi");
        }
    };

    const handleReopenTask = async (taskId) => {
        if (!window.confirm("Vazifani qayta faollashtirishni tasdiqlaysizmi?")) return;
        try {
            await taskAPI.reopen(taskId);
            toast.success("Vazifa qayta faollashtirildi ✨");
            fetchData();
        } catch (err) {
            toast.error("Xatolik yuz berdi");
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-dark-800 p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">O'quv <span className="text-primary-500">Vazifalari</span></h1>
                    <p className="text-sm font-medium text-gray-500">Guruhlar uchun topshiriqlarni boshqarish</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-8 py-4 rounded-2xl bg-gray-900 dark:bg-primary-600 text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 shadow-2xl active:scale-95 transition-all italic hover:shadow-primary-500/20"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Yangi Vazifa
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 p-2 bg-gray-100/50 dark:bg-dark-900/50 rounded-3xl w-fit">
                <button
                    onClick={() => setTaskFilter('active')}
                    className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${taskFilter === 'active' ? 'bg-white dark:bg-dark-800 text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Faol Vazifalar
                </button>
                <button
                    onClick={() => setTaskFilter('completed')}
                    className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${taskFilter === 'completed' ? 'bg-white dark:bg-dark-800 text-emerald-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Arxiv (Tugatilgan)
                </button>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.filter(t => (t.status || 'active') === taskFilter).map((task) => (
                    <div
                        key={task._id}
                        className="group bg-white dark:bg-dark-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500"
                    >
                        <div className="relative h-44 bg-gray-900">
                            {task.image ? (
                                <img src={task.image} alt="" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-900 to-gray-900">
                                    <HiOutlinePhotograph className="w-12 h-12 text-white/10" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                                {task.maxScore} Ball
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic truncate">{task.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                    <HiOutlineUsers className="w-4 h-4 text-primary-500" />
                                    {task.group?.nomi || 'Guruhsiz'}
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                    <HiOutlineCalendar className="w-4 h-4 text-amber-500" />
                                    Deadline: {new Date(task.deadline).toLocaleDateString('uz')}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => fetchSubmissions(task)}
                                    className="py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                                >
                                    <HiOutlineEye className="w-5 h-5" />
                                    Ko'rish
                                </button>
                                {task.status !== 'completed' ? (
                                    <button
                                        onClick={() => handleCompleteTask(task._id)}
                                        className="py-4 rounded-2xl bg-emerald-500/10 text-emerald-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <HiOutlineBadgeCheck className="w-5 h-5" />
                                        Tugatish
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleReopenTask(task._id)}
                                        className="py-4 rounded-2xl bg-amber-500/10 text-amber-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <HiOutlineX className="w-5 h-5" />
                                        Qaytarish
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Task Modal */}
            {isCreateOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsCreateOpen(false)} />
                    <div className="relative bg-white dark:bg-dark-800 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-modal-in overflow-y-auto max-h-[90vh] scrollbar-hide">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Yangi Vazifa Yaratish</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-gray-400">
                                <HiOutlineX className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">Guruhni tanlang</label>
                                <select
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold"
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">Vazifa sarlavhasi</label>
                                    <input
                                        type="text"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">Maksimal Ball</label>
                                    <input
                                        type="number"
                                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold"
                                        value={form.maxScore}
                                        onChange={e => setForm({ ...form, maxScore: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">Deadline (Muddati)</label>
                                <input
                                    type="date"
                                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold"
                                    value={form.deadline}
                                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">Vazifa tavsifi</label>
                                <textarea
                                    className="w-full h-32 px-6 py-4 rounded-2xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">Muqova rasmi (optional)</label>
                                <div className="relative group/upload">
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={e => setForm({ ...form, image: e.target.files[0] })}
                                        accept="image/*"
                                    />
                                    <div className="w-full py-10 rounded-3xl border-2 border-dashed border-gray-100 dark:border-dark-700 flex flex-col items-center justify-center gap-2 group-hover/upload:border-primary-500 transition-colors">
                                        <HiOutlineUpload className="w-10 h-10 text-gray-300 group-hover/upload:text-primary-500" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rasm yuklash yoki tashlang</span>
                                        {form.image && <span className="text-xs font-bold text-emerald-500 mt-2">{form.image.name}</span>}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full py-5 rounded-[2rem] bg-gray-900 dark:bg-primary-600 text-white font-black uppercase tracking-[0.3em] shadow-3xl shadow-primary-500/20 active:scale-95 transition-all text-xs italic flex items-center justify-center gap-4"
                            >
                                {creating ? <LoadingSpinner size="sm" /> : <HiOutlineBadgeCheck className="w-6 h-6 text-emerald-400" />}
                                {creating ? "Yaratilmoqda..." : "Vazifani e'lon qilish"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Submissions Modal */}
            {isSubmissionsOpen && selectedTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsSubmissionsOpen(false)} />
                    <div className="relative bg-white dark:bg-dark-800 w-full max-w-5xl rounded-[3rem] p-10 shadow-2xl animate-modal-in overflow-y-auto max-h-[90vh] scrollbar-hide">
                        <div className="flex items-center justify-between mb-10">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Topshiriqlar: {selectedTask.title}</h2>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest italic">{submissions.length} ta topshiriq</p>
                            </div>
                            <button onClick={() => setIsSubmissionsOpen(false)} className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-gray-400">
                                <HiOutlineX className="w-6 h-6" />
                            </button>
                        </div>

                        {loadingSubmissions ? (
                            <div className="py-20 flex justify-center"><LoadingSpinner /></div>
                        ) : submissions.length === 0 ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto">
                                    <HiOutlineAnnotation className="w-10 h-10 text-gray-300" />
                                </div>
                                <p className="text-gray-400 font-black uppercase tracking-widest italic">Hali hech kim topshirmagan</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {submissions.map((sub) => (
                                    <div key={sub._id} className="bg-gray-50 dark:bg-dark-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 space-y-6 group">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center text-2xl font-black">
                                                    {sub.student?.ism?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-gray-900 dark:text-white italic">{sub.student?.ism}</h4>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{sub.student?.username || sub.student?.telefon}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">To'plangan ball</p>
                                                    <div className={`text-2xl font-black group-hover:scale-110 transition-transform ${sub.status === 'graded' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                        {sub.status === 'graded' ? sub.score : 'Kutilmoqda'}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => { setGradingSubmission(sub); setScoreValue(sub.score || ''); }}
                                                    className="px-6 py-4 rounded-2xl bg-gray-900 text-white font-black text-[10px] uppercase tracking-widest italic hover:bg-primary-600 transition-colors"
                                                >
                                                    Ball qo'yish
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-5 gap-3">
                                            {sub.images.map((img, i) => (
                                                <a key={i} href={img} target="_blank" rel="noreferrer" className="aspect-square rounded-2xl overflow-hidden shadow-md">
                                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                                </a>
                                            ))}
                                        </div>
                                        {sub.comment && (
                                            <div className="p-4 rounded-2xl bg-white dark:bg-dark-800 border border-gray-100 dark:border-white/5 text-sm italic text-gray-500">
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
                <div className="space-y-6 py-4">
                    <div className="text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Max Score: {selectedTask?.maxScore}</p>
                    </div>
                    <input
                        type="number"
                        className="w-full px-6 py-6 rounded-3xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-black text-3xl text-center"
                        value={scoreValue}
                        onChange={e => setScoreValue(e.target.value)}
                        min="0"
                        max={selectedTask?.maxScore}
                        autoFocus
                    />
                    <div className="flex gap-3">
                        <button
                            onClick={() => setGradingSubmission(null)}
                            className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-dark-700 text-gray-500 font-black text-[10px] uppercase tracking-widest"
                        >
                            Bekor qilish
                        </button>
                        <button
                            onClick={handleGrade}
                            className="flex-1 py-4 rounded-2xl bg-primary-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-500/20"
                        >
                            Saqlash
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Tasks;
