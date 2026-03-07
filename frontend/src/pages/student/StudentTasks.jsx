import { useState, useEffect } from 'react';
import { taskAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineClipboardList, HiOutlineClock, HiOutlinePhotograph,
    HiOutlineUpload, HiOutlineCheckCircle, HiOutlineExclamationCircle,
    HiOutlineInformationCircle, HiOutlinePlusSm, HiOutlineChatAlt2,
    HiOutlineEye, HiOutlineBadgeCheck
} from 'react-icons/hi';

const StudentTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isSubmitOpen, setIsSubmitOpen] = useState(false);
    const [files, setFiles] = useState([]);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [taskFilter, setTaskFilter] = useState('active'); // 'active' or 'completed'

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await taskAPI.getMyTasks();
            setTasks(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error("Vazifalarni yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            return toast.error("Maksimal 5 ta rasm yuklash mumkin");
        }
        setFiles([...files, ...selectedFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmitTasks = async (e) => {
        e.preventDefault();
        if (files.length === 0) return toast.error("Kamida bitta rasm yuklang");

        setSubmitting(true);
        const formData = new FormData();
        formData.append('taskId', selectedTask._id);
        formData.append('comment', comment);
        files.forEach(file => {
            formData.append('images', file);
        });

        try {
            await taskAPI.submit(formData);
            toast.success("Vazifa muvaffaqiyatli topshirildi ✨");
            setIsSubmitOpen(false);
            setFiles([]);
            setComment('');
            fetchTasks();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-10 animate-fade-in max-w-5xl mx-auto pb-24 lg:pb-10 px-4 md:px-0">
            <div className="space-y-2 text-center md:text-left pt-6">
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">O'quv <span className="text-primary-500">Vazifalari</span></h1>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest opacity-60 italic">Bilimni mustahkamlash va ballar to'plash vaqti</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-4 p-2 bg-gray-100/50 dark:bg-dark-900/50 rounded-3xl w-fit mx-auto md:mx-0">
                <button
                    onClick={() => setTaskFilter('active')}
                    className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${taskFilter === 'active' ? 'bg-white dark:bg-dark-800 text-primary-500 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Faol
                </button>
                <button
                    onClick={() => setTaskFilter('completed')}
                    className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${taskFilter === 'completed' ? 'bg-white dark:bg-dark-800 text-emerald-500 shadow-xl' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Tugatilgan
                </button>
            </div>

            {tasks.filter(t => (t.status || 'active') === taskFilter).length === 0 ? (
                <div className="bg-white dark:bg-dark-800 rounded-[3rem] py-32 text-center border-2 border-dashed border-gray-100 dark:border-dark-700 shadow-inner">
                    <div className="w-24 h-24 bg-gray-50 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HiOutlineClipboardList className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-400 uppercase tracking-[0.2em] italic">Hozircha vazifalar yo'q</h3>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Yangi vazifalar qo'shilganda shu yerda ko'rinadi</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {tasks.filter(t => (t.status || 'active') === taskFilter).map((task) => (
                        <div
                            key={task._id}
                            className="group bg-white dark:bg-dark-800 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                        >
                            {/* Task Cover Image */}
                            <div className="relative h-48 bg-gray-900 overflow-hidden">
                                {task.image ? (
                                    <img src={task.image} alt={task.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:rotate-2 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                        <HiOutlinePhotograph className="w-16 h-16 text-white/10" />
                                    </div>
                                )}
                                <div className="absolute top-4 right-4 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                                    {task.maxScore} Ball
                                </div>
                                {task.isSubmitted && (
                                    <div className="absolute top-4 left-4 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                                        Topshirildi
                                    </div>
                                )}
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic truncate">{task.title}</h3>
                                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                                        <HiOutlineClock className="w-4 h-4 text-primary-500" />
                                        Muddati: {new Date(task.deadline).toLocaleDateString('uz', { day: 'numeric', month: 'long' })}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setSelectedTask(task); setIsDetailOpen(true); }}
                                        className="flex-1 py-4 rounded-2xl bg-gray-100 dark:bg-dark-700 text-gray-900 dark:text-white font-black text-[10px] uppercase tracking-widest transition-all hover:bg-gray-200 dark:hover:bg-dark-600 flex items-center justify-center gap-2"
                                    >
                                        <HiOutlineEye className="w-4 h-4" />
                                        Batafsil
                                    </button>
                                    {!task.isSubmitted && (
                                        <button
                                            onClick={() => { setSelectedTask(task); setIsSubmitOpen(true); }}
                                            className="flex-1 py-4 rounded-2xl bg-primary-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                                        >
                                            <HiOutlineUpload className="w-4 h-4" />
                                            Topshirish
                                        </button>
                                    )}
                                </div>
                                {task.isSubmitted && task.submission?.status === 'graded' && (
                                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">To'plangan ball:</span>
                                        <span className="text-lg font-black text-emerald-600">{task.submission.score}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task Details Modal */}
            {isDetailOpen && selectedTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsDetailOpen(false)} />
                    <div className="relative bg-white dark:bg-dark-800 w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-2xl animate-modal-in scrollbar-hide max-h-[90vh] overflow-y-auto">
                        <div className="relative h-64 bg-gray-900">
                            {selectedTask.image ? (
                                <img src={selectedTask.image} alt={selectedTask.title} className="w-full h-full object-cover opacity-60" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-primary-600 to-indigo-900" />
                            )}
                            <button onClick={() => setIsDetailOpen(false)} className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all">
                                <HiOutlinePlusSm className="w-6 h-6 rotate-45" />
                            </button>
                            <div className="absolute bottom-10 left-10 right-10">
                                <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight leading-tight">{selectedTask.title}</h2>
                            </div>
                        </div>
                        <div className="p-10 space-y-10">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-3xl bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Maksimal Ball</p>
                                    <p className="text-xl font-black text-primary-500">{selectedTask.maxScore}</p>
                                </div>
                                <div className="p-4 rounded-3xl bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Muddat</p>
                                    <p className="text-xl font-black text-amber-500 uppercase tracking-tighter">
                                        {new Date(selectedTask.deadline).toLocaleDateString('uz', { day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                                <div className="p-4 rounded-3xl bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Holati</p>
                                    <p className={`text-xl font-black uppercase tracking-tighter ${selectedTask.isSubmitted ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {selectedTask.isSubmitted ? "Topshirildi" : "Kutilmoqda"}
                                    </p>
                                </div>
                                <div className="p-4 rounded-3xl bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Ball</p>
                                    <p className="text-xl font-black text-indigo-500">
                                        {selectedTask.submission?.score || 0}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                                    Vazifa tavsifi
                                </h4>
                                <div className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium whitespace-pre-wrap text-lg">
                                    {selectedTask.description}
                                </div>
                            </div>

                            {selectedTask.isSubmitted ? (
                                <div className="p-8 rounded-[2rem] bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-lg font-black text-emerald-600 uppercase italic tracking-widest">Sizning javobingiz</h4>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                                            {selectedTask.submission.status === 'graded' ? 'Tekshirildi' : 'Kutilmoqda'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-5 gap-3">
                                        {selectedTask.submission.images.map((img, i) => (
                                            <div key={i} className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                                                <img src={img} alt="homework" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    {selectedTask.submission.comment && (
                                        <div className="p-4 rounded-2xl bg-white dark:bg-dark-900 border border-emerald-500/10 text-sm italic text-gray-500">
                                            "{selectedTask.submission.comment}"
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => { setIsDetailOpen(false); setIsSubmitOpen(true); }}
                                    className="w-full py-6 rounded-[2rem] bg-gray-900 dark:bg-primary-600 text-white font-black uppercase tracking-[0.3em] shadow-3xl shadow-primary-500/20 active:scale-95 transition-all text-xs italic"
                                >
                                    Hozir topshirish
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Modal */}
            {isSubmitOpen && selectedTask && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsSubmitOpen(false)} />
                    <div className="relative bg-white dark:bg-dark-800 w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl animate-modal-in">
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Vazifani topshirish</h2>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{selectedTask.title}</p>
                                </div>
                                <button onClick={() => setIsSubmitOpen(false)} className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-dark-900 flex items-center justify-center text-gray-400">
                                    <HiOutlinePlusSm className="w-6 h-6 rotate-45" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmitTasks} className="space-y-8">
                                {/* Image Upload */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic underline underline-offset-4 decoration-primary-500/30">Rasmlarni yuklang (Maks: 5ta)</label>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                        {files.map((file, i) => (
                                            <div key={i} className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border-2 border-primary-500/20">
                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(i)}
                                                    className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg"
                                                >
                                                    <HiOutlinePlusSm className="w-4 h-4 rotate-45" />
                                                </button>
                                            </div>
                                        ))}
                                        {files.length < 5 && (
                                            <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 dark:border-dark-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-500 transition-colors group">
                                                <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                                                <HiOutlinePlusSm className="w-8 h-8 text-gray-300 group-hover:text-primary-500 transition-colors" />
                                                <span className="text-[10px] font-black text-gray-300 group-hover:text-primary-500 uppercase tracking-widest">Qo'shish</span>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Comment */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2 italic">Qo'shimcha izoh</label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        className="w-full h-32 px-6 py-6 rounded-3xl bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold text-lg transition-all"
                                        placeholder="Vazifa bo'yicha fikr yoki izohingiz..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full py-5 rounded-[2rem] bg-gray-900 dark:bg-primary-600 text-white font-black uppercase tracking-[0.3em] shadow-3xl shadow-primary-500/20 active:scale-95 transition-all text-xs italic flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {submitting ? <LoadingSpinner size="sm" /> : <HiOutlineBadgeCheck className="w-6 h-6 text-emerald-400" />}
                                    {submitting ? "Yuklanmoqda..." : "Tasdiqlash va yuborish"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentTasks;
