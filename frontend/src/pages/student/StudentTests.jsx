import { useState, useEffect, useRef } from 'react';
import { testAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineClipboardList, HiOutlineClock, HiOutlineChevronRight,
    HiOutlineChevronLeft, HiOutlineCheckCircle, HiOutlinePlay, HiOutlineBookmark
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const StudentTests = () => {
    const [activeTab, setActiveTab] = useState('faol');
    const [loading, setLoading] = useState(true);

    const [faolTests, setFaolTests] = useState([]);
    const [rejalashtirilganTests, setRejalashtirilganTests] = useState([]);
    const [tugatilganTests, setTugatilganTests] = useState([]);

    const [isTakingTest, setIsTakingTest] = useState(false);
    const [takingTestInfo, setTakingTestInfo] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);

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

                const limitSeconds = test.vaqtLimiti * 60;
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

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const selectOption = (questionId, optionIndex) => {
        setAnswers({
            ...answers,
            [questionId]: optionIndex
        });
    };

    const handleTestSubmit = async () => {
        if (window.confirm('Haqiqatdan ham testni yakunlab, natijalarni yubormoqchimisiz?')) {
            submitAnswers();
        }
    };

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

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('uz-UZ', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && !isTakingTest) return <LoadingSpinner />;

    // Test Topshirish UI
    if (isTakingTest && takingTestInfo) {
        const currentQuestion = takingTestInfo.savollar[currentQuestionIndex];
        const isLastQuestion = currentQuestionIndex === takingTestInfo.savollar.length - 1;

        return (
            <div className="min-h-[85vh] flex flex-col md:flex-row gap-6 max-w-5xl mx-auto py-6 px-4 md:px-0 animate-fade-in pb-16">
                {/* Savollar navigatsiyasi */}
                <div className="w-full md:w-64 bg-white dark:bg-[#111111] p-5 rounded-xl border border-gray-200 dark:border-zinc-800 flex flex-col justify-between order-2 md:order-1 h-fit gap-6">
                    <div>
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">Savollar</h3>
                        <div className="grid grid-cols-5 gap-1.5">
                            {takingTestInfo.savollar.map((_, idx) => {
                                const qId = takingTestInfo.savollar[idx]._id;
                                const isAnswered = answers[qId] !== undefined;
                                const isActive = currentQuestionIndex === idx;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`w-9 h-9 rounded-lg font-bold text-xs transition-all flex items-center justify-center border ${
                                            isActive 
                                                ? 'bg-[#0066FF] border-[#0066FF] text-white' 
                                                : isAnswered 
                                                ? 'bg-[#00C853]/10 border-[#00C853]/20 text-[#00C853]' 
                                                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                                        }`}
                                    >
                                        {idx + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleTestSubmit}
                        className="btn-primary w-full flex items-center justify-center gap-1.5"
                    >
                        <HiOutlineCheckCircle className="w-4 h-4" />
                        <span>Testni tugatish</span>
                    </button>
                </div>

                {/* Savol matni va variantlari */}
                <div className="flex-1 bg-white dark:bg-[#111111] p-6 md:p-8 rounded-xl border border-gray-200 dark:border-zinc-800 flex flex-col justify-between order-1 md:order-2 space-y-6">
                    
                    <div className="flex items-center justify-between border-b border-gray-150 dark:border-zinc-800 pb-4">
                        <div>
                            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Joriy test</span>
                            <h2 className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">{takingTestInfo.nomi}</h2>
                        </div>

                        {/* Taymer */}
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm transition-all ${
                            timeLeft < 60 
                                ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                                : 'bg-[#0066FF]/10 text-[#0066FF] border-[#0066FF]/20'
                        }`}>
                            <HiOutlineClock className="w-4 h-4" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>

                    <div className="flex-1 space-y-5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#0066FF]/10 text-[#0066FF] text-[9px] font-semibold border border-[#0066FF]/20 uppercase">
                            Savol: {currentQuestionIndex + 1} / {takingTestInfo.savollar.length}
                        </span>

                        <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed">
                            {currentQuestion.questionText}
                        </h3>

                        {/* Options */}
                        <div className="grid grid-cols-1 gap-3 pt-2">
                            {currentQuestion.options.map((opt, oIdx) => {
                                const isSelected = answers[currentQuestion._id] === oIdx;
                                const charMap = ['A', 'B', 'C', 'D'];

                                return (
                                    <button
                                        key={oIdx}
                                        onClick={() => selectOption(currentQuestion._id, oIdx)}
                                        className={`w-full p-4 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                                            isSelected 
                                                ? 'bg-[#0066FF]/5 border-[#0066FF]/40 text-[#0066FF]' 
                                                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                                        }`}
                                    >
                                        <span className={`w-6 h-6 rounded font-bold text-xs flex items-center justify-center ${
                                            isSelected ? 'bg-[#0066FF] text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                                        }`}>
                                            {charMap[oIdx]}
                                        </span>
                                        <span className="text-xs font-semibold">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Bottom Nav */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-150 dark:border-zinc-800">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-30"
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
                            className="btn-primary px-4 py-1.5 flex items-center gap-1"
                        >
                            {isLastQuestion ? 'Tugatish' : 'Keyingi'} <HiOutlineChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Natija ko'rsatuvchi card
    if (testResult) {
        return (
            <div className="max-w-md mx-auto bg-white dark:bg-[#111111] rounded-xl border border-gray-250 dark:border-zinc-900/60 shadow-xl p-8 text-center animate-scale-up mt-10">
                <div className="w-12 h-12 bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <HiOutlineCheckCircle className="w-6 h-6" />
                </div>
                
                <h2 className="text-lg font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Test topshirildi! 🎉</h2>
                <p className="text-xs text-zinc-400 mt-1">Sizning javoblaringiz qabul qilindi va avtomatik ravishda tekshirildi</p>

                {/* Score panel */}
                <div className="my-6 p-6 rounded-lg bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                    <span className="text-[9px] font-semibold text-zinc-450 uppercase tracking-widest block mb-1">Natijangiz</span>
                    <h3 className="text-4xl font-bold text-[#0066FF] leading-none mb-3">{testResult.percentage}%</h3>
                    <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-300">
                        To'plangan ball: <span className="font-bold text-[#0066FF]">{testResult.score}</span> / {testResult.totalScore} ball
                    </p>
                </div>

                <button
                    onClick={() => {
                        setTestResult(null);
                        fetchStudentTests();
                    }}
                    className="btn-primary w-full py-2.5"
                >
                    Testlar sahifasiga qaytish
                </button>
            </div>
        );
    }

    const tabsList = [
        { id: 'faol', label: 'Faol testlar', count: faolTests.length, color: 'text-[#00C853] bg-[#00C853]/10 border-[#00C853]/20' },
        { id: 'rejalashtirilgan', label: 'Rejalashtirilgan', count: rejalashtirilganTests.length, color: 'text-[#0066FF] bg-[#0066FF]/10 border-[#0066FF]/20' },
        { id: 'tugatilgan', label: 'Tugatilgan', count: tugatilganTests.length, color: 'text-zinc-400 bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' }
    ];

    const activeList = activeTab === 'faol' 
        ? faolTests 
        : activeTab === 'rejalashtirilgan' 
        ? rejalashtirilganTests 
        : tugatilganTests;

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-10">
            <div>
                <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Mening testlarim</h1>
                <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1 font-medium">Bilimingizni tekshiring, test topshiring va o'zlashtirishni nazorat qiling</p>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                {tabsList.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-2 px-3 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                            activeTab === tab.id 
                                ? 'bg-white dark:bg-zinc-800 text-gray-950 dark:text-white shadow-sm border border-zinc-200/50 dark:border-zinc-700' 
                                : 'text-zinc-400 hover:text-zinc-650'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${tab.color}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Tests list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeList.length === 0 ? (
                    <div className="col-span-2 py-16 text-center bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 shadow-sm">
                        <div className="w-10 h-10 bg-zinc-50 dark:bg-zinc-900 rounded-lg flex items-center justify-center mx-auto mb-3 border border-zinc-200 dark:border-zinc-800">
                            <HiOutlineClipboardList className="w-5 h-5 text-zinc-350" />
                        </div>
                        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Testlar yo'q</h3>
                    </div>
                ) : (
                    activeList.map(test => (
                        <div
                            key={test._id}
                            className="bg-white dark:bg-[#111111] p-5 rounded-xl border border-gray-150 dark:border-zinc-900/60 shadow-sm flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="px-2 py-0.5 rounded bg-[#0066FF]/10 border border-[#0066FF]/20 text-[#0066FF] text-[9px] font-semibold uppercase tracking-wider">
                                        {test.kurs?.nomi || 'Kurs nomi'}
                                    </span>
                                    
                                    <div className="flex items-center gap-1 text-[10px] font-semibold text-zinc-400">
                                        <HiOutlineClock className="w-3.5 h-3.5" />
                                        <span>{test.vaqtLimiti} daqiqa</span>
                                    </div>
                                </div>

                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {test.nomi}
                                </h3>

                                <div className="space-y-1 text-[11px] text-zinc-450 pt-2 border-t border-zinc-50 dark:border-zinc-900/50">
                                    <p><span className="text-[#00C853] font-semibold uppercase">Boshlanish:</span> {formatDateTime(test.boshlanishVaqti)}</p>
                                    <p><span className="text-[#FF3B30] font-semibold uppercase">Tugash:</span> {formatDateTime(test.tugashVaqti)}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-4 mt-4 border-t border-gray-50 dark:border-zinc-900/40">
                                {activeTab === 'faol' && (
                                    <button
                                        onClick={() => startTest(test._id)}
                                        className="btn-primary w-full flex items-center justify-center gap-1.5"
                                    >
                                        <HiOutlinePlay className="w-4 h-4" />
                                        <span>Testni boshlash</span>
                                    </button>
                                )}

                                {activeTab === 'rejalashtirilgan' && (
                                    <div className="w-full py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center text-[10px] font-semibold uppercase text-zinc-400 tracking-wider">
                                        Test vaqtini kuting... ⏳
                                    </div>
                                )}

                                {activeTab === 'tugatilgan' && (
                                    test.myResult ? (
                                        <div className="p-3 rounded-lg bg-[#00C853]/5 border border-[#00C853]/15 flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <span className="text-[9px] font-semibold text-[#00C853] uppercase tracking-widest block leading-none">Topshirildi</span>
                                                <p className="text-xs font-semibold text-zinc-650 dark:text-zinc-300">
                                                    Natija: <span className="font-bold text-[#00C853]">{test.myResult.score}</span> / {test.myResult.totalScore} ball
                                                </p>
                                            </div>
                                            <h4 className="text-lg font-bold text-[#00C853]">{test.myResult.percentage}%</h4>
                                        </div>
                                    ) : (
                                        <div className="w-full py-2.5 rounded-lg bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-center text-[10px] font-semibold uppercase text-[#FF3B30] tracking-wider">
                                            Muddati o'tib ketgan ❌
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
