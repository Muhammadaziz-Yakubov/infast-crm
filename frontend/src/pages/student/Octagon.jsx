import { useState, useEffect, useCallback } from 'react';
import { battleAPI, studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
    HiOutlineLightningBolt, HiOutlineUserGroup, HiOutlineShieldCheck, 
    HiOutlineClock, HiOutlineTrophy, HiOutlineX, HiOutlineCheckCircle,
    HiOutlineArrowRight, HiOutlineTicket, HiOutlineSparkles
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Octagon = () => {
    const [step, setStep] = useState('select'); // select, waiting, battle, result
    const [betAmount, setBetAmount] = useState(200);
    const [isRandom, setIsRandom] = useState(true);
    const [battle, setBattle] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [answers, setAnswers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [studentCoins, setStudentCoins] = useState(0);
    const [inviteCodeInput, setInviteCodeInput] = useState('');
    const [pollingInterval, setPollingInterval] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchStudentData();
        // Prevent back button during battle
        const handleBeforeUnload = (e) => {
            if (step === 'battle') {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [step]);

    // Anti-cheat measures
    useEffect(() => {
        if (step === 'battle') {
            const preventAction = (e) => {
                e.preventDefault();
                toast.error("Nusxa ko'chirish taqiqlangan! 🛡️");
            };

            const handleBlur = () => {
                toast.error("Diqqat! Sahifadan chiqish taqiqlangan! 🛡️", { duration: 5000 });
            };
            
            document.addEventListener('contextmenu', preventAction);
            document.addEventListener('copy', preventAction);
            window.addEventListener('blur', handleBlur);
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 's')) {
                    preventAction(e);
                }
            });

            return () => {
                document.removeEventListener('contextmenu', preventAction);
                document.removeEventListener('copy', preventAction);
                window.removeEventListener('blur', handleBlur);
            };
        }
    }, [step]);

    const fetchStudentData = async () => {
        try {
            const res = await studentAPI.getMyDashboard();
            setStudentCoins(res.data.data.student.coins);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateBattle = async () => {
        if (studentCoins < betAmount) {
            toast.error("Mablag' yetarli emas!");
            return;
        }

        setLoading(true);
        try {
            const res = await battleAPI.create({ betAmount, isRandom });
            setBattle(res.data.data);
            setStep('waiting');
            
            // Start polling for player2
            const interval = setInterval(async () => {
                const checkRes = await battleAPI.getOne(res.data.data._id);
                if (checkRes.data.data.status === 'ongoing') {
                    setBattle(checkRes.data.data);
                    setStep('battle');
                    clearInterval(interval);
                }
            }, 3000);
            setPollingInterval(interval);
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinBattle = async () => {
        if (!inviteCodeInput && isRandom) {
            // Try to find random battle
            setLoading(true);
            try {
                const findRes = await battleAPI.getRandom(betAmount);
                if (findRes.data.data) {
                    const joinRes = await battleAPI.join({ battleId: findRes.data.data._id });
                    setBattle(joinRes.data.data);
                    setStep('battle');
                } else {
                    toast.error("Hozircha bo'sh battlelar yo'q. O'zingiz yarating!");
                }
            } catch (err) {
                toast.error(err.response?.data?.message || "Xatolik yuz berdi");
            } finally {
                setLoading(false);
            }
        } else {
            // Join via invite code
            setLoading(true);
            try {
                const joinRes = await battleAPI.join({ inviteCode: inviteCodeInput.toUpperCase() });
                setBattle(joinRes.data.data);
                setStep('battle');
            } catch (err) {
                toast.error(err.response?.data?.message || "Kod noto'g'ri yoki battle to'la");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAnswer = (optionIndex) => {
        const isCorrect = optionIndex === battle.questions[currentQuestionIndex].correctOption;
        if (isCorrect) setScore(prev => prev + 1);
        
        setAnswers([...answers, { questionId: battle.questions[currentQuestionIndex]._id, isCorrect }]);
        
        if (currentQuestionIndex < 9) {
            setCurrentQuestionIndex(prev => prev + 1);
            setTimeLeft(15);
        } else {
            finishBattle(score + (isCorrect ? 1 : 0));
        }
    };

    const finishBattle = async (finalScore) => {
        setStep('waiting_result');
        try {
            const res = await battleAPI.submitScore({ battleId: battle._id, score: finalScore });
            setBattle(res.data.data);
            
            // Poll for other player completion
            const interval = setInterval(async () => {
                const checkRes = await battleAPI.getOne(battle._id);
                if (checkRes.data.data.status === 'completed') {
                    setBattle(checkRes.data.data);
                    setStep('result');
                    clearInterval(interval);
                }
            }, 3000);
            setPollingInterval(interval);
        } catch (err) {
            toast.error("Natijani yuborishda xatolik");
        }
    };

    useEffect(() => {
        if (step === 'battle' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (step === 'battle' && timeLeft === 0) {
            handleAnswer(-1); // Timeout
        }
    }, [timeLeft, step]);

    // Cleanup polling
    useEffect(() => {
        return () => {
            if (pollingInterval) clearInterval(pollingInterval);
        };
    }, [pollingInterval]);

    if (loading) return <LoadingSpinner text="Yuklanmoqda..." />;

    return (
        <div className="min-h-screen bg-transparent pb-32 pt-8 px-4 max-w-4xl mx-auto">
            {step === 'select' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-black uppercase tracking-[0.3em] italic">
                            <HiOutlineLightningBolt className="w-4 h-4 animate-pulse" />
                            Octagon Arena
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                            Bilimlar <span className="gradient-text">Jangi</span>
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em]">Raqibingizni mag'lub eting va coinlarni qo'lga kiriting!</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bet Selection */}
                        <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-8 border border-gray-100 dark:border-white/5 shadow-2xl space-y-8">
                            <div>
                                <h3 className="text-xs font-black text-gray-400 uppercase italic tracking-widest mb-6">Tikish miqdorini tanlang</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    {[200, 400, 600].map(amount => (
                                        <button
                                            key={amount}
                                            onClick={() => setBetAmount(amount)}
                                            className={`p-6 rounded-[2rem] border-2 transition-all duration-300 flex flex-col items-center gap-2 group ${betAmount === amount ? 'border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/10' : 'border-gray-100 dark:border-white/5 hover:border-orange-300'}`}
                                        >
                                            <span className={`text-2xl group-hover:scale-125 transition-transform ${betAmount === amount ? 'scale-110' : ''}`}>🪙</span>
                                            <span className="font-black text-lg text-gray-900 dark:text-white">{amount}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCreateBattle}
                                className="w-full py-6 rounded-3xl bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black uppercase italic tracking-widest shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1 active:scale-95 transition-all"
                            >
                                Battle Yaratish ⚔️
                            </button>
                        </div>

                        {/* Join Section */}
                        <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-8 border border-gray-100 dark:border-white/5 shadow-2xl space-y-8 flex flex-col justify-between">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-gray-400 uppercase italic tracking-widest">Battlega qo'shilish</h3>
                                
                                <div className="relative group">
                                    <input
                                        type="text"
                                        placeholder="INVITE CODE"
                                        value={inviteCodeInput}
                                        onChange={(e) => setInviteCodeInput(e.target.value.toUpperCase())}
                                        className="w-full bg-gray-50 dark:bg-dark-900/50 border-2 border-gray-100 dark:border-white/5 rounded-2xl px-6 py-4 font-black tracking-[0.5em] text-center text-gray-900 dark:text-white focus:border-orange-500 transition-all outline-none"
                                    />
                                    <HiOutlineTicket className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-orange-500" />
                                </div>

                                <div className="flex items-center gap-4 text-center">
                                    <div className="flex-1 h-px bg-gray-100 dark:bg-white/5"></div>
                                    <span className="text-[10px] font-black text-gray-300 uppercase italic">yoki</span>
                                    <div className="flex-1 h-px bg-gray-100 dark:bg-white/5"></div>
                                </div>

                                <button
                                    onClick={() => { setIsRandom(true); handleJoinBattle(); }}
                                    className="w-full py-6 rounded-3xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black uppercase italic tracking-widest shadow-xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"
                                >
                                    <HiOutlineUserGroup className="w-6 h-6" />
                                    Tasodifiy Raqib 🎲
                                </button>
                            </div>

                            {inviteCodeInput && (
                                <button
                                    onClick={handleJoinBattle}
                                    className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black uppercase italic tracking-widest shadow-lg animate-bounce"
                                >
                                    Kodni tekshirish ✅
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {step === 'waiting' && (
                <div className="flex flex-col items-center justify-center py-20 space-y-12 animate-fade-in text-center">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin"></div>
                        <HiOutlineLightningBolt className="absolute inset-0 m-auto w-12 h-12 text-orange-500 animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Raqib kutilmoqda...</h2>
                        {battle?.inviteCode && (
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Invite Code:</p>
                                <div className="text-5xl font-black tracking-[0.5em] text-orange-500 italic bg-orange-500/5 px-8 py-4 rounded-3xl border-2 border-orange-500/20">
                                    {battle.inviteCode}
                                </div>
                                <p className="text-xs font-bold text-gray-500 italic mt-4">Do'stingizga ushbu kodni yuboring!</p>
                            </div>
                        )}
                        {!battle?.inviteCode && (
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Global qidiruv orqali raqib qidirilmoqda</p>
                        )}
                    </div>
                    <button 
                        onClick={() => { clearInterval(pollingInterval); setStep('select'); }}
                        className="text-gray-400 hover:text-red-500 font-black uppercase text-[10px] tracking-widest italic flex items-center gap-2"
                    >
                        <HiOutlineX className="w-4 h-4" /> Bekor qilish
                    </button>
                </div>
            )}

            {step === 'battle' && battle && (
                <div className="space-y-8 animate-fade-in">
                    {/* Battle Header */}
                    <div className="flex items-center justify-between bg-white dark:bg-dark-800 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black italic">
                                {score}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase italic leading-none mb-1">Mening Ballarim</p>
                                <p className="text-lg font-black text-gray-900 dark:text-white uppercase italic leading-none">{currentQuestionIndex + 1}/10</p>
                            </div>
                        </div>

                        <div className="relative w-20 h-20 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle 
                                    cx="40" cy="40" r="35" 
                                    className="stroke-gray-100 dark:stroke-white/5" 
                                    strokeWidth="6" fill="none" 
                                />
                                <circle 
                                    cx="40" cy="40" r="35" 
                                    className="stroke-orange-500 transition-all duration-1000" 
                                    strokeWidth="6" fill="none" 
                                    strokeDasharray="220"
                                    strokeDashoffset={220 - (timeLeft / 15) * 220}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span className="absolute text-2xl font-black italic text-gray-900 dark:text-white">{timeLeft}</span>
                        </div>

                        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-gray-50 dark:bg-dark-900/50">
                            <HiOutlineShieldCheck className="w-5 h-5 text-emerald-500" />
                            <span className="text-[10px] font-black text-gray-500 uppercase italic tracking-widest">Anti-Cheat Faol</span>
                        </div>
                    </div>

                    {/* Question Card */}
                    <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-10 border border-gray-100 dark:border-white/5 shadow-2xl space-y-10">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white text-center leading-tight italic">
                            {battle.questions[currentQuestionIndex].question}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {battle.questions[currentQuestionIndex].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(idx)}
                                    className="p-6 rounded-[2rem] bg-gray-50 dark:bg-dark-900/50 border-2 border-transparent hover:border-orange-500 hover:bg-white dark:hover:bg-dark-800 text-gray-700 dark:text-gray-200 font-bold text-lg transition-all duration-300 text-left flex items-center justify-between group shadow-sm hover:shadow-xl"
                                >
                                    <span>{option}</span>
                                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-dark-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                        <HiOutlineArrowRight className="w-4 h-4 text-orange-500" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {step === 'waiting_result' && (
                <div className="flex flex-col items-center justify-center py-24 space-y-8 text-center animate-fade-in">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                        <HiOutlineCheckCircle className="absolute inset-0 m-auto w-10 h-10 text-emerald-500" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Siz tugatdingiz!</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-widest">Raqibingiz natijasi kutilmoqda...</p>
                        <div className="text-6xl font-black gradient-text italic">{score}/10</div>
                    </div>
                </div>
            )}

            {step === 'result' && battle && (
                <div className="space-y-8 animate-fade-in">
                    <div className="text-center space-y-4">
                        {battle.winner === studentAPI.me?._id || (battle.winner?._id === studentAPI.me?._id) ? (
                            <div className="space-y-4">
                                <div className="w-32 h-32 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                                    <HiOutlineTrophy className="w-16 h-16 text-emerald-500 animate-bounce" />
                                </div>
                                <h1 className="text-6xl font-black text-emerald-500 uppercase italic tracking-tighter">G'alaba! 🏆</h1>
                                <p className="text-xl font-bold text-gray-500 dark:text-gray-400 italic">Siz +{battle.betAmount} coin yutib oldingiz!</p>
                            </div>
                        ) : battle.winner === null ? (
                            <div className="space-y-4">
                                <div className="w-32 h-32 mx-auto rounded-full bg-gray-500/10 flex items-center justify-center">
                                    <HiOutlineSparkles className="w-16 h-16 text-gray-500" />
                                </div>
                                <h1 className="text-6xl font-black text-gray-500 uppercase italic tracking-tighter">Durang! 🤝</h1>
                                <p className="text-xl font-bold text-gray-500 dark:text-gray-400 italic">Coinlaringiz qaytarildi</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="w-32 h-32 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center">
                                    <HiOutlineX className="w-16 h-16 text-rose-500" />
                                </div>
                                <h1 className="text-6xl font-black text-rose-500 uppercase italic tracking-tighter">Mag'lubiyat 😔</h1>
                                <p className="text-xl font-bold text-gray-500 dark:text-gray-400 italic">Keyingi safar albatta omadingiz keladi!</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-8 border-2 border-orange-500 shadow-2xl text-center space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Mening Ballarim</p>
                            <p className="text-5xl font-black text-gray-900 dark:text-white italic">{battle.player1.toString() === studentAPI.me?._id ? battle.player1Score : battle.player2Score}</p>
                        </div>
                        <div className="bg-white dark:bg-dark-800 rounded-[3rem] p-8 border border-gray-100 dark:border-white/5 shadow-2xl text-center space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">Raqib Ballari</p>
                            <p className="text-5xl font-black text-gray-900 dark:text-white italic">{battle.player1.toString() === studentAPI.me?._id ? battle.player2Score : battle.player1Score}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-6 rounded-3xl bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-black uppercase italic tracking-widest shadow-xl hover:-translate-y-1 active:scale-95 transition-all"
                    >
                        Asosiy Sahifaga Qaytish 🏠
                    </button>
                </div>
            )}
        </div>
    );
};

export default Octagon;
