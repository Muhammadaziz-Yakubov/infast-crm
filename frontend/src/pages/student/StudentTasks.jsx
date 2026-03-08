import { useState, useEffect } from 'react';
import { taskAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineClipboardList, HiOutlineClock, HiOutlinePhotograph,
    HiOutlineUpload, HiOutlineCheckCircle, HiOutlineExclamationCircle,
    HiOutlineInformationCircle, HiOutlinePlusSm, HiOutlineChatAlt2,
    HiOutlineEye, HiOutlineBadgeCheck, HiOutlineSparkles, HiOutlineX,
    HiOutlineChevronRight
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

    if (loading) return <LoadingSpinner text="Vazifalar tayyorlanmoqda..." />;

    const activeTasks = tasks.filter(t => !t.topshirildi);
    const completedTasks = tasks.filter(t => t.topshirildi);
    const filteredTasks = taskFilter === 'active' ? activeTasks : completedTasks;

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-32 lg:pb-16 px-4 animate-fade-in">

            {/* --- HEADER SECTION --- */}
            <div className="relative group p-1 text-center md:text-left pt-6">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-orange-500/10 blur-3xl opacity-50 pointer-events-none" />
                <div className="relative space-y-2">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] italic mb-1 block">Vazifalar & Maqsadlar</span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                        O'quv <span className="text-primary-500">Vazifalari</span>
                    </h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest opacity-60 italic">Bilimni mustahkamlash va ballar to'plash vaqti</p>
                </div>
            </div>

            {/* --- TABS & STATS ROW --- */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-4 p-2 bg-white/40 dark:bg-dark-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-3xl shadow-xl">
                    <button
                        onClick={() => setTaskFilter('active')}
                        className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center gap-3 ${taskFilter === 'active' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <HiOutlineClock className="w-4 h-4" />
                        Faol ({activeTasks.length})
                    </button>
                    <button
                        onClick={() => setTaskFilter('completed')}
                        className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic flex items-center gap-3 ${taskFilter === 'completed' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <HiOutlineBadgeCheck className="w-4 h-4" />
                        Tugatilgan ({completedTasks.length})
                    </button>
                </div>

                <div className="flex items-center gap-3 px-6 py-4 bg-amber-500/10 text-amber-600 rounded-3xl border border-amber-500/20 italic font-black text-[10px] uppercase tracking-widest shadow-sm">
                    <HiOutlineSparkles className="w-4 h-4" />
                    Har bir vazifa uchun 10-50 XP gacha!
                </div>
            </div>

            {/* --- TASKS GRID --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {filteredTasks.map((task, index) => (
                    <div
                        key={task._id}
                        className="group relative bg-white/40 dark:bg-dark-800/40 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 border border-white/20 dark:border-white/5 shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 animate-slide-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="flex flex-col h-full space-y-6">
                            {/* Task Icon & Badge */}
                            <div className="flex items-center justify-between">
                                <div className={`w-16 h-16 rounded-2.5xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 duration-500 ${task.topshirildi ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary-500/10 text-primary-500'}`}>
                                    <HiOutlineClipboardList className="w-8 h-8" />
                                </div>
                                <div className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest italic border ${task.topshirildi ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                                    {task.topshirildi ? 'Bajarildi' : 'Kutilmoqda'}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 space-y-3">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-tight group-hover:text-primary-500 transition-colors">
                                    {task.sarlavha || task.title}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 line-clamp-2">
                                    {task.tavsif || task.description}
                                </p>
                            </div>

                            {/* Footer / Actions */}
                            <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">Oxirgi muddat</span>
                                    <span className="text-xs font-black text-gray-900 dark:text-white uppercase italic">
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'Cheksiz'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setSelectedTask(task); setIsDetailOpen(true); }}
                                        className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-dark-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-dark-600 flex items-center justify-center transition-all active:scale-90"
                                    >
                                        <HiOutlineEye className="w-5 h-5" />
                                    </button>
                                    {!task.topshirildi && (
                                        <button
                                            onClick={() => { setSelectedTask(task); setIsSubmitOpen(true); }}
                                            className="px-6 py-3 rounded-2xl bg-primary-500 text-white font-black text-[10px] uppercase tracking-widest italic shadow-lg shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            Topshirish <HiOutlineChevronRight className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredTasks.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/20 dark:bg-dark-900/20 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-white/5">
                        <HiOutlineClipboardList className="w-20 h-20 text-gray-200 mb-6" />
                        <h3 className="text-xl font-black text-gray-400 uppercase italic tracking-widest">Hozircha vazifalar yo'q</h3>
                    </div>
                )}
            </div>

            {/* --- TASK DETAIL MODAL --- */}
            {isDetailOpen && selectedTask && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-md animate-fade-in" onClick={() => setIsDetailOpen(false)} />
                    <div className="relative bg-white dark:bg-dark-800 w-full max-w-2xl rounded-[3.5rem] p-10 shadow-3xl overflow-hidden animate-zoom-in">
                        <button
                            onClick={() => setIsDetailOpen(false)}
                            className="absolute top-8 right-8 w-12 h-12 rounded-2xl bg-gray-100 dark:bg-dark-700 text-gray-500 flex items-center justify-center hover:rotate-90 transition-transform"
                        >
                            <HiOutlineX className="w-6 h-6" />
                        </button>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic border ${selectedTask.topshirildi ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-primary-500/10 text-primary-500 border-primary-500/20'}`}>
                                    {selectedTask.topshirildi ? 'Vazifa Bajarilgan' : 'Faol Vazifa'}
                                </span>
                                <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                                    {selectedTask.sarlavha || selectedTask.title}
                                </h2>
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-gray-50 dark:bg-dark-900 border border-transparent shadow-inner">
                                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {selectedTask.tavsif || selectedTask.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-gray-100/50 dark:bg-dark-700/50 border border-white/10 italic">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Berilgan</p>
                                    <p className="font-black text-gray-900 dark:text-white uppercase">{new Date(selectedTask.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-gray-100/50 dark:bg-dark-700/50 border border-white/10 italic">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Muddati</p>
                                    <p className="font-black text-rose-500 uppercase">{selectedTask.deadline ? new Date(selectedTask.deadline).toLocaleDateString() : 'Cheksiz'}</p>
                                </div>
                            </div>

                            {selectedTask.topshirildi && selectedTask.submission && (
                                <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 space-y-4">
                                    <h4 className="text-xs font-black text-emerald-600 uppercase italic tracking-widest">Sizning javobingiz</h4>
                                    {selectedTask.submission.comment && (
                                        <p className="text-sm italic text-gray-500 leading-relaxed bg-white/50 dark:bg-dark-900/50 p-4 rounded-2xl">
                                            "{selectedTask.submission.comment}"
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-2">
                                        {selectedTask.submission.images?.map((img, i) => (
                                            <div key={i} className="w-16 h-16 rounded-xl overflow-hidden shadow-sm">
                                                <img src={img} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!selectedTask.topshirildi && (
                                <button
                                    onClick={() => { setIsDetailOpen(false); setIsSubmitOpen(true); }}
                                    className="w-full py-5 rounded-3xl bg-primary-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary-500/30 active:scale-95 transition-all italic"
                                >
                                    Topshirishni boshlash ✨
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUBMIT MODAL --- */}
            {isSubmitOpen && selectedTask && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-md animate-fade-in" onClick={() => !submitting && setIsSubmitOpen(false)} />
                    <div className="relative bg-white dark:bg-dark-800 w-full max-w-2xl rounded-[3.5rem] p-10 shadow-3xl overflow-hidden animate-slide-up">
                        <div className="space-y-10">
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Vazifani <span className="text-primary-500">Topshirish</span></h3>
                                <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest italic">{selectedTask.sarlavha || selectedTask.title}</p>
                            </div>

                            <form onSubmit={handleSubmitTasks} className="space-y-10">
                                <div className="space-y-6">
                                    {/* Upload Area */}
                                    <div className="relative group/upload">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            accept="image/*"
                                            disabled={submitting}
                                        />
                                        <div className="border-4 border-dashed border-gray-100 dark:border-white/5 rounded-[2.5rem] p-12 text-center group-hover/upload:border-primary-500/50 transition-colors bg-gray-50 dark:bg-dark-900">
                                            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-dark-800 shadow-xl flex items-center justify-center text-primary-500 mx-auto mb-4 group-hover/upload:scale-110 transition-transform duration-500">
                                                <HiOutlineUpload className="w-8 h-8" />
                                            </div>
                                            <p className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tighter mb-1">Rasmlarni yuklang</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">Maksimal 5 ta rasm / PNG, JPG</p>
                                        </div>
                                    </div>

                                    {/* Files Preview */}
                                    {files.length > 0 && (
                                        <div className="flex flex-wrap gap-4">
                                            {files.map((file, i) => (
                                                <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden group/thumb">
                                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(i)}
                                                        className="absolute inset-0 bg-rose-600/60 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-white transition-opacity"
                                                    >
                                                        <HiOutlineX className="w-6 h-6" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Comment field */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 italic">Sharh (ixtiyoriy)</label>
                                        <textarea
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            placeholder="Ustozga qisqacha izoh qoldiring..."
                                            className="w-full px-8 py-5 rounded-[1.8rem] bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500/20 focus:bg-white dark:focus:bg-dark-800 outline-none font-medium text-lg transition-all italic text-gray-900 dark:text-white min-h-[120px]"
                                            disabled={submitting}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsSubmitOpen(false)}
                                        className="flex-1 py-5 rounded-3xl bg-gray-100 dark:bg-dark-700 text-gray-500 font-black text-[10px] uppercase tracking-widest italic"
                                        disabled={submitting}
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-5 rounded-3xl bg-primary-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/30 active:scale-95 transition-all italic flex items-center justify-center gap-3 disabled:opacity-50"
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <>Yuborish ✨</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentTasks;
