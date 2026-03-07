import { useState, useEffect } from 'react';
import { taskAPI, quizAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineClipboardList, HiOutlineClock, HiOutlinePhotograph,
    HiOutlineUpload, HiOutlineCheckCircle, HiOutlineExclamationCircle,
    HiOutlineInformationCircle, HiOutlinePlusSm, HiOutlineChatAlt2,
    HiOutlineEye, HiOutlineBadgeCheck, HiOutlineLightBulb, HiOutlineLightningBolt
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

    // Quiz states
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState([]);
    const [isQuizFinished, setIsQuizFinished] = useState(false);
    const [quizScore, setQuizScore] = useState(null);
    const [reward, setReward] = useState(0);
    const [quizLoading, setQuizLoading] = useState(false);

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

    const startQuiz = async () => {
        setQuizLoading(true);
        try {
            const res = await quizAPI.getRandomQuestions();
            setQuizQuestions(res.data.data);
            setCurrentQuestionIndex(0);
            setQuizAnswers([]);
            setIsQuizOpen(true);
            setIsQuizFinished(false);
            setQuizScore(null);
            setSelectedOption(null);
        } catch (err) {
            toast.error("Testlarni yuklashda xatolik");
        } finally {
            setQuizLoading(false);
        }
    };

    const handleAnswer = () => {
        if (selectedOption === null) return toast.error("Variantni tanlang");

        const currentQuestion = quizQuestions[currentQuestionIndex];
        const isCorrect = selectedOption === currentQuestion.correctOption;

        const newAnswers = [...quizAnswers, {
            question: currentQuestion._id,
            selectedOption,
            isCorrect
        }];
        setQuizAnswers(newAnswers);

        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            submitQuiz(newAnswers);
        }
    };

    const submitQuiz = async (finalAnswers) => {
        setQuizLoading(true);
        const score = finalAnswers.filter(a => a.isCorrect).length;
        try {
            const res = await quizAPI.submit({
                score,
                totalQuestions: quizQuestions.length,
                answers: finalAnswers
            });
            setQuizScore(score);
            setReward(res.data.reward);
            setIsQuizFinished(true);
            toast.success("Test yakunlandi!");
        } catch (err) {
            toast.error("Natijani saqlashda xatolik");
        } finally {
            setQuizLoading(false);
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
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex gap-4 p-2 bg-gray-100/50 dark:bg-dark-900/50 rounded-3xl w-fit">
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

                {/* Quiz Banner */}
                <div
                    onClick={startQuiz}
                    className="group relative overflow-hidden bg-gradient-to-r from-indigo-600 to-primary-600 p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-primary-500/20 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all duration-500 w-full md:w-auto md:min-w-[400px]"
                >
                    <div className="relative z-10 flex items-center justify-between gap-8">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em]">Skill Test</span>
                                <span className="flex items-center gap-1 text-[10px] font-black text-yellow-300 uppercase tracking-widest">
                                    <HiOutlineLightningBolt className="w-3 h-3" />
                                    +100 Coins
                                </span>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">Bilimni <span className="text-yellow-300">Sinash</span></h3>
                            <p className="text-xs text-white/70 font-bold uppercase tracking-widest">5 ta tasodifiy HTML/CSS savollari</p>
                        </div>
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500">
                            <HiOutlineLightBulb className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-400/20 rounded-full blur-3xl" />
                </div>
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
                                    {!task.isSubmitted && task.status !== 'completed' && (
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

            {/* Quiz Modal */}
            {isQuizOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl" />

                    <div className="relative bg-white dark:bg-dark-800 w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl animate-modal-in">
                        {!isQuizFinished ? (
                            <div className="p-10 space-y-8">
                                {/* Quiz Header */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Test <span className="text-primary-500">Savoli</span></h3>
                                        <div className="flex gap-1">
                                            {quizQuestions.map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 rounded-full transition-all duration-500 ${i === currentQuestionIndex ? 'w-8 bg-primary-500' : i < currentQuestionIndex ? 'w-4 bg-emerald-500' : 'w-4 bg-gray-200 dark:bg-dark-700'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Savol</p>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{currentQuestionIndex + 1}/{quizQuestions.length}</p>
                                    </div>
                                </div>

                                {/* Question Content */}
                                <div className="space-y-8">
                                    <div className="p-8 rounded-[2rem] bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                                        <h4 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white leading-relaxed">
                                            {quizQuestions[currentQuestionIndex]?.question}
                                        </h4>
                                    </div>

                                    {/* Options */}
                                    <div className="grid grid-cols-1 gap-4">
                                        {quizQuestions[currentQuestionIndex]?.options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedOption(idx)}
                                                className={`p-6 rounded-2xl text-left font-bold transition-all border-2 flex items-center justify-between group ${selectedOption === idx ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20' : 'bg-white dark:bg-dark-800 border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-300 hover:border-primary-500/50'}`}
                                            >
                                                <span>{option}</span>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedOption === idx ? 'border-white bg-white/20' : 'border-gray-200 dark:border-dark-600'}`}>
                                                    {selectedOption === idx && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsQuizOpen(false)}
                                        className="px-8 py-5 rounded-2xl bg-gray-100 dark:bg-dark-700 text-gray-500 font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-dark-600 transition-all"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        onClick={handleAnswer}
                                        disabled={selectedOption === null || quizLoading}
                                        className="flex-1 py-5 rounded-2xl bg-primary-600 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {quizLoading ? "Saqlanmoqda..." : (currentQuestionIndex === quizQuestions.length - 1 ? "Tugallash" : "Keyingi savol")}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-12 text-center space-y-8">
                                <div className="relative">
                                    <div className="w-32 h-32 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <HiOutlineBadgeCheck className="w-16 h-16 text-emerald-500 animate-bounce" />
                                    </div>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 animate-ping bg-emerald-500/20 rounded-full" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Tabriklaymiz!</h3>
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Siz testni muvaffaqiyatli yakunladingiz</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
                                    <div className="p-6 rounded-3xl bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Natija</p>
                                        <p className="text-4xl font-black text-primary-500">{quizScore}/{quizQuestions.length}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Mukofot</p>
                                        <p className="text-4xl font-black text-yellow-500">+{reward}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsQuizOpen(false)}
                                    className="w-full py-6 rounded-[2rem] bg-gray-900 dark:bg-primary-600 text-white font-black uppercase tracking-[0.3em] shadow-3xl shadow-primary-500/20 active:scale-95 transition-all text-xs italic"
                                >
                                    Asosiy sahifaga qaytish
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentTasks;
