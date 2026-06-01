import { useState, useEffect, useRef } from 'react';
import { testAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineClipboardList, HiOutlineClock, HiOutlineChevronRight,
    HiOutlineChevronLeft, HiOutlineCheckCircle, HiOutlinePlay, HiOutlineBookmark
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const StudentTests = () => {
    // Tabs: 'faol' | 'rejalashtirilgan' | 'tugatilgan'
    const [activeTab, setActiveTab] = useState('faol');
    const [loading, setLoading] = useState(true);

    const [faolTests, setFaolTests] = useState([]);
    const [rejalashtirilganTests, setRejalashtirilganTests] = useState([]);
    const [tugatilganTests, setTugatilganTests] = useState([]);

    // Test Topsihirish jarayoni
    const [isTakingTest, setIsTakingTest] = useState(false);
    const [takingTestInfo, setTakingTestInfo] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionId: selectedOptionIndex }
    const [timeLeft, setTimeLeft] = useState(0); // soniyalarda

    // Test natijasi ko'rsatilishi
    const [testResult, setTestResult] = useState(null);

    const timerRef = useRef(null);

    useEffect(() => {
        fetchStudentTests();
    }, []);

    const fetchStudentTests = async () => {
        try {
            setLoading(true);
            const res = await testAPI.getMyTests();
            const { faol, rejalashtirilgan, tugatilgan } = res.data.data;
            setFaolTests(faol);
            setRejalashtirilganTests(rejalashtirilgan);
            setTugatilganTests(tugatilgan);
        } catch (err) {
            toast.error('Testlarni yuklashda xatolik yuz berdi');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Testni topshirishni boshlash
    const startTest = async (testId) => {
        if (window.confirm('Testni topshirishni boshlamoqchimisiz? Vaqt taymeri darhol ishga tushadi!')) {
            try {
                setLoading(true);
                const res = await testAPI.getTestForTaking(testId);
                const test = res.data.data;
                setTakingTestInfo(test);
                setAnswers({});
                setCurrentQuestionIndex(0);
                setTestResult(null);

                // Vaqt limitini soniyalarda belgilash
                const limitSeconds = test.vaqtLimiti * 60;
                
                // Test tugash vaqtiga qancha vaqt qolganligini tekshirish va uni limit bilan taqqoslash (xavfsizlik uchun)
                const now = new Date();
                const end = new Date(test.tugashVaqti);
                const timeRemainingSeconds = Math.max(0, Math.floor((end - now) / 1000));
                
                const finalSeconds = Math.min(limitSeconds, timeRemainingSeconds);
                setTimeLeft(finalSeconds);

                setIsTakingTest(true);
                startTimer();
            } catch (err) {
                toast.error(err.response?.data?.message || 'Testni boshlashda xatolik yuz berdi');
            } finally {
                setLoading(false);
            }
        }
    };

    // Taymerni ishga tushirish
    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    autoSubmitTest();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Taymer vaqtini formatlash (mm:ss)
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Variant tanlanganda
    const selectOption = (questionId, optionIndex) => {
        setAnswers({
            ...answers,
            [questionId]: optionIndex
        });
    };

    // Testni topshirish (Manual)
    const handleTestSubmit = async () => {
        if (window.confirm('Haqiqatdan ham testni yakunlab, natijalarni yubormoqchimisiz?')) {
            submitAnswers();
        }
    };

    // Avtomatik topshirish (vaqt tugaganda)
    const autoSubmitTest = () => {
        toast.error('Vaqt tugadi! Test avtomatik ravishda topshirilmoqda...', { duration: 5000 });
        submitAnswers(true);
    };

    const submitAnswers = async (isAuto = false) => {
        if (timerRef.current) clearInterval(timerRef.current);
        
        try {
            setLoading(true);
            const formattedAnswers = Object.entries(answers).map(([qId, oIdx]) => ({
                questionId: qId,
                selectedOption: oIdx
            }));

            const res = await testAPI.submitTest(takingTestInfo._id, { answers: formattedAnswers });
            setTestResult(res.data.data);
            setIsTakingTest(false);
            fetchStudentTests();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Javoblarni yuborishda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    // Sana vaqtni formatlash
    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('uz-UZ', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && !isTakingTest) return <LoadingSpinner text="Testlar yuklanmoqda..." />;

    // Agar o'quvchi test topshirayotgan bo'lsa
    if (isTakingTest && takingTestInfo) {
        const currentQuestion = takingTestInfo.savollar[currentQuestionIndex];
        const isLastQuestion = currentQuestionIndex === takingTestInfo.savollar.length - 1;

        return (
            <div className="min-h-[80vh] flex flex-col md:flex-row gap-6 max-w-5xl mx-auto py-6 px-4 md:px-0 animate-fade-in pb-24 md:pb-10">
                {/* Savollar navigatsiyasi (Chap panel) */}
                <div className="w-full md:w-80 bg-white dark:bg-dark-800 p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between order-2 md:order-1 h-fit gap-6">
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest italic mb-4">Savollar ro'yxati</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {takingTestInfo.savollar.map((_, idx) => {
                                const qId = takingTestInfo.savollar[idx]._id;
                                const isAnswered = answers[qId] !== undefined;
                                const isActive = currentQuestionIndex === idx;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all flex items-center justify-center ${isActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20 scale-105' : isAnswered ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-gray-50 dark:bg-dark-900 border border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-400'}`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleTestSubmit}
                        className="w-full py-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all italic flex items-center justify-center gap-1.5"
                    >
                        <HiOutlineCheckCircle className="w-4 h-4" /> Testni Yakunlash
                    </button>
                </div>

                {/* Savol matni va variantlari (O'rta panel) */}
                <div className="flex-1 bg-white dark:bg-dark-800 p-6 md:p-10 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between order-1 md:order-2 space-y-8">
                    
                    {/* Top panel (Timer & Progress) */}
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-6">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic leading-none">Joriy test</span>
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase italic leading-none">{takingTestInfo.nomi}</h2>
                        </div>

                        {/* Taymer */}
                        <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border font-mono font-black text-lg transition-all ${timeLeft < 60 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' : 'bg-primary-500/10 text-primary-500 border-primary-500/20'}`}>
                            <HiOutlineClock className="w-5 h-5 animate-spin" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-black uppercase tracking-wider italic">
                            <HiOutlineBookmark className="w-3.5 h-3.5" /> Savol: {currentQuestionIndex + 1} / {takingTestInfo.savollar.length}
                        </div>

                        <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white leading-relaxed">
                            {currentQuestion.questionText}
                        </h3>

                        {/* Options List */}
                        <div className="grid grid-cols-1 gap-4 pt-4">
                            {currentQuestion.options.map((opt, oIdx) => {
                                const isSelected = answers[currentQuestion._id] === oIdx;
                                const charMap = ['A', 'B', 'C', 'D'];

                                return (
                                    <button
                                        key={oIdx}
                                        onClick={() => selectOption(currentQuestion._id, oIdx)}
                                        className={`w-full p-5 rounded-2xl border text-left flex items-center gap-4 transition-all hover:scale-[1.01] active:scale-95 ${isSelected ? 'bg-primary-500 text-white border-primary-500 shadow-lg shadow-primary-500/20' : 'bg-gray-50 dark:bg-dark-900/50 border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-900'}`}
                                    >
                                        <span className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-dark-800 text-gray-600 dark:text-gray-400'}`}>
                                            {charMap[oIdx]}
                                        </span>
                                        <span className="text-sm font-bold">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Nav Buttons */}
                    <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-white/5">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="px-5 py-3 rounded-xl border border-gray-200 dark:border-white/5 text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-900 text-xs font-black uppercase tracking-wider italic flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:pointer-events-none"
                        >
                            <HiOutlineChevronLeft className="w-4 h-4" /> Oldingi
                        </button>

                        <button
                            onClick={() => {
                                if (isLastQuestion) {
                                    handleTestSubmit();
                                } else {
                                    setCurrentQuestionIndex(prev => prev + 1);
                                }
                            }}
                            className={`px-5 py-3 rounded-xl text-white text-xs font-black uppercase tracking-wider italic flex items-center gap-1.5 transition-all ${isLastQuestion ? 'bg-rose-500 hover:bg-rose-600' : 'bg-primary-500 hover:bg-primary-600'}`}
                        >
                            {isLastQuestion ? 'Tugatish' : 'Keyingi'} <HiOutlineChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Agar o'quvchi testni muvaffaqiyatli topshirgan va natija ekranda ko'rsatilishi kerak bo'lsa
    if (testResult) {
        return (
            <div className="max-w-xl mx-auto bg-white dark:bg-dark-800 rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl p-8 md:p-12 text-center animate-scale-up pb-24 md:pb-12">
                <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <HiOutlineCheckCircle className="w-12 h-12" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Test Muvaffaqiyatli topshirildi! 🎉</h2>
                <p className="text-sm font-medium text-gray-500 mt-2">Sizning javoblaringiz qabul qilindi va avtomatik tekshirildi</p>

                {/* Score panel */}
                <div className="my-8 p-8 rounded-[2rem] bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-2">Sizning natijangiz</p>
                    <h3 className="text-5xl font-black text-primary-500 leading-none mb-4">{testResult.percentage}%</h3>
                    <p className="text-md font-bold text-gray-800 dark:text-gray-200">
                        To'plangan ball: <span className="font-black text-primary-500">{testResult.score}</span> / {testResult.totalScore} ball
                    </p>
                </div>

                <button
                    onClick={() => {
                        setTestResult(null);
                        fetchStudentTests();
                    }}
                    className="w-full py-4.5 rounded-xl bg-gray-900 dark:bg-primary-600 text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all italic"
                >
                    Testlar sahifasiga qaytish
                </button>
            </div>
        );
    }

    // Default testlar ro'yxati
    const tabsList = [
        { id: 'faol', label: 'Faol testlar', count: faolTests.length, color: 'text-emerald-500 bg-emerald-500/10' },
        { id: 'rejalashtirilgan', label: 'Rejalashtirilgan', count: rejalashtirilganTests.length, color: 'text-blue-500 bg-blue-500/10' },
        { id: 'tugatilgan', label: 'Tugatilgan', count: tugatilganTests.length, color: 'text-gray-400 bg-gray-100 dark:bg-dark-900/50' }
    ];

    const getActiveList = () => {
        if (activeTab === 'faol') return faolTests;
        if (activeTab === 'rejalashtirilgan') return rejalashtirilganTests;
        return tugatilganTests;
    };

    const activeList = getActiveList();

    return (
        <div className="space-y-6 md:space-y-10 animate-fade-in max-w-5xl mx-auto pb-24 lg:pb-10 px-4 md:px-0">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">
                    📝 Mening <span className="text-primary-500">Testlarim</span>
                </h1>
                <p className="text-sm font-medium text-gray-500">Testlarni o'z vaqtida topshiring, bilimingizni tekshiring va markazda reytingingizni oshiring!</p>
            </div>

            {/* Premium Tabs */}
            <div className="flex p-1.5 bg-gray-100 dark:bg-dark-900/50 rounded-2xl border border-gray-200 dark:border-white/5">
                {tabsList.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all italic flex items-center justify-center gap-2 ${activeTab === tab.id ? 'bg-white dark:bg-dark-800 text-gray-900 dark:text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${tab.color}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tests list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeList.length === 0 ? (
                    <div className="col-span-2 py-24 text-center bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-dark-900 rounded-full flex items-center justify-center mx-auto mb-4">
                            <HiOutlineClipboardList className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-md font-black text-gray-400 uppercase tracking-widest italic">Ushbu bo'limda testlar yo'q</h3>
                    </div>
                ) : (
                    activeList.map(test => (
                        <div
                            key={test._id}
                            className="bg-white dark:bg-dark-800 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="px-3 py-1 rounded-full bg-primary-500/10 text-primary-500 text-[9px] font-black uppercase tracking-wider italic">
                                        {test.kurs?.nomi || 'Mening Kursim'}
                                    </span>
                                    
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                                        <HiOutlineClock className="w-3.5 h-3.5" />
                                        {test.vaqtLimiti} daqiqa
                                    </div>
                                </div>

                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tight group-hover:text-primary-500 transition-colors">
                                    {test.nomi}
                                </h3>

                                <div className="space-y-2 text-xs font-bold text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-50 dark:border-white/5">
                                    <p><span className="text-emerald-500 font-extrabold uppercase">Boshlanish:</span> {formatDateTime(test.boshlanishVaqti)}</p>
                                    <p><span className="text-rose-500 font-extrabold uppercase">Tugash:</span> {formatDateTime(test.tugashVaqti)}</p>
                                </div>
                            </div>

                            {/* Actions or result information */}
                            <div className="pt-6 mt-6 border-t border-gray-100 dark:border-white/5">
                                {activeTab === 'faol' && (
                                    <button
                                        onClick={() => startTest(test._id)}
                                        className="w-full py-3.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 italic"
                                    >
                                        <HiOutlinePlay className="w-4 h-4" /> Topsirishni Boshlash
                                    </button>
                                )}

                                {activeTab === 'rejalashtirilgan' && (
                                    <div className="w-full py-3 px-4 rounded-xl bg-gray-50 dark:bg-dark-900 border border-gray-200 dark:border-white/5 text-center text-[10px] font-black uppercase text-gray-400 tracking-wider italic">
                                        Test vaqtini kuting... ⏳
                                    </div>
                                )}

                                {activeTab === 'tugatilgan' && (
                                    test.myResult ? (
                                        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest italic leading-none">Topshirdingiz</p>
                                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                                    Natija: <span className="font-black text-emerald-500">{test.myResult.score}</span> / {test.myResult.totalScore} ball
                                                </p>
                                            </div>
                                            <h4 className="text-xl font-black text-emerald-500">{test.myResult.percentage}%</h4>
                                        </div>
                                    ) : (
                                        <div className="w-full py-3 px-4 rounded-xl bg-rose-500/10 text-center text-[10px] font-black uppercase text-rose-500 tracking-wider italic">
                                            Topshirish muddati o'tib ketgan ❌
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentTests;
