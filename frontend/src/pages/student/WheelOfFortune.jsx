import { useState, useEffect, useRef } from 'react';
import { wheelAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
    HiOutlineArrowLeft, HiOutlineGift, HiOutlineClock,
    HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineStar,
    HiOutlineX, HiOutlineTrendingUp, HiOutlineCheckCircle
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Logo from '../../infastacademy.jpg';

const WheelOfFortune = () => {
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [spinning, setSpinning] = useState(false);
    const [prize, setPrize] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rotation, setRotation] = useState(0);
    const [remainingSpins, setRemainingSpins] = useState(3);
    const wheelRef = useRef(null);

    const segments = [
        { amount: 0, label: "😢 0", color: "#4b5563" },
        { amount: 10, label: "🪙 10", color: "#f97316" },
        { amount: 50, label: "🪙 50", color: "#ea580c" },
        { amount: 100, label: "🪙 100", color: "#c2410c" },
        { amount: 150, label: "🔄 150", color: "#9a3412" },
        { amount: 300, label: "🪙 300", color: "#7c2d12" },
        { amount: 500, label: "🔥 500", color: "#431407" },
        { amount: 1000, label: "💎 1000", color: "#fbbf24" },
    ];

    const segmentAngle = 360 / segments.length;

    useEffect(() => {
        const init = async () => {
            await checkAuth();
            await fetchLogs();
        };
        init();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await wheelAPI.getLogs();
            setLogs(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSpin = async () => {
        if (spinning) return;
        if ((user?.coins || 0) < 150) {
            toast.error("Balansda yetarli coin yo'q! (150 kerak)");
            return;
        }

        setSpinning(true);
        setPrize(null);

        try {
            const res = await wheelAPI.spin();
            const selectedPrize = res.data.prize;
            setRemainingSpins(res.data.remainingSpins || 3);

            // Find index of the prize to determine rotation
            const prizeIndex = segments.findIndex(s => s.amount === selectedPrize.amount);

            const extraRotation = 360 * 8; // 8 full circles
            const prizeRotation = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
            const totalRotation = rotation + extraRotation + (prizeRotation - (rotation % 360));

            setRotation(totalRotation);

            setTimeout(() => {
                setSpinning(false);
                setPrize(selectedPrize);
                toast.success(res.data.message);
                fetchLogs();
                checkAuth();
            }, 5000);

        } catch (err) {
            setSpinning(false);
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    if (loading) return <LoadingSpinner text="Omad g'ildiragi tayyorlanmoqda..." />;

    return (
        <div className="max-w-6xl mx-auto pb-32 lg:pb-16 px-4 animate-fade-in space-y-12">

            {/* --- HEADER --- */}
            <header className="relative flex flex-col md:flex-row items-center justify-between gap-8 pt-6 text-center md:text-left">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-orange-500/10 blur-3xl opacity-50 pointer-events-none" />
                <div className="relative space-y-2">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] italic mb-1 block">Omad Mashinasi</span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                        G'ildirakni <span className="text-primary-500">Aylantir</span>
                    </h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest opacity-60 italic">Katta mukofotlar va coinlar sizni kutmoqda</p>
                </div>

                <div className="relative group">
                    <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-white/40 dark:bg-dark-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-6 flex items-center gap-4 shadow-2xl">
                        <div className="text-right">
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic leading-none mb-1">Mening balansim</p>
                            <p className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter leading-none">{user?.coins || 0} COIN</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-amber-400 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 group-hover:rotate-12 transition-transform duration-500">
                            <span className="text-2xl">🪙</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-16">
                {/* --- WHEEL SECTION --- */}
                <div className="relative flex-shrink-0">
                    <div className="absolute -inset-10 bg-primary-500/20 blur-[100px] opacity-50 animate-pulse pointer-events-none" />

                    {/* Wheel Frame */}
                    <div className="relative w-[340px] h-[340px] md:w-[500px] md:h-[500px] rounded-full border-[12px] md:border-[20px] border-white dark:border-dark-800 shadow-[0_0_80px_rgba(249,115,22,0.3)] bg-gray-900 overflow-hidden">
                        <div
                            className="absolute inset-0 transition-transform duration-[5000ms] cubic-bezier(0.15, 0, 0.15, 1)"
                            style={{ transform: `rotate(${rotation}deg)` }}
                        >
                            {segments.map((s, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 left-1/2 -ml-[1px] h-1/2 origin-bottom flex flex-col items-center justify-start py-6 md:py-10"
                                    style={{
                                        width: '2px',
                                        transform: `rotate(${i * segmentAngle}deg)`,
                                    }}
                                >
                                    <div
                                        className="absolute top-0 left-[-80px] md:left-[-120px] w-[160px] md:w-[240px] h-full"
                                        style={{
                                            clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                                            backgroundColor: s.color,
                                            transform: `rotate(${segmentAngle / 2}deg)`
                                        }}
                                    />
                                    <span
                                        className="relative z-10 text-white font-black text-xs md:text-xl uppercase italic tracking-tighter rotate-180 mb-2 md:mb-4"
                                        style={{ writingMode: 'vertical-rl' }}
                                    >
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Center Logo */}
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <div className="w-16 h-16 md:w-28 md:h-28 rounded-full border-4 md:border-8 border-white dark:border-dark-800 bg-white shadow-2xl overflow-hidden animate-spin-slow">
                                <img src={Logo} alt="Logo" className="w-full h-full object-cover" />
                            </div>
                        </div>

                        {/* Ticker / Arrow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 text-white drop-shadow-2xl">
                            <div className="w-10 h-10 md:w-16 md:h-16 bg-white dark:bg-dark-800 rounded-2.5xl rotate-45 flex items-center justify-center shadow-2xl border-4 border-primary-500">
                                <HiOutlineStar className="w-6 h-6 md:w-10 md:h-10 text-primary-500 -rotate-45" />
                            </div>
                        </div>
                    </div>

                    {/* Spin Button */}
                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center">
                        <button
                            onClick={handleSpin}
                            disabled={spinning || (user?.coins || 0) < 150}
                            className={`px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] italic shadow-2xl transition-all active:scale-95 group overflow-hidden relative
                                ${spinning || (user?.coins || 0) < 150
                                    ? 'bg-gray-100 dark:bg-dark-800 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary-600 text-white shadow-primary-500/30 hover:bg-primary-500 hover:scale-110'}`}
                        >
                            {spinning ? 'Aylanmoqda...' : 'Omadni sinash (150🪙)'}
                        </button>
                    </div>
                </div>

                {/* --- STATS & LOGS --- */}
                <div className="w-full max-w-xl space-y-8 pt-12 lg:pt-0">
                    {/* Rules Card */}
                    <div className="p-8 rounded-[3rem] bg-amber-500/5 border border-amber-500/20 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2.5xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-xl shadow-amber-500/10">
                                <HiOutlineGift className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">Qoidalar</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mt-1">G'alaba qozonish sirlari</p>
                            </div>
                        </div>
                        <ul className="space-y-3">
                            {[
                                "Bitta aylantirish narxi: 150 coin",
                                "Siz 1000 coin gacha yutib olishingiz mumkin!",
                                "Kuniga maksimum 3 marta aylantirish mumkin",
                                "Yutuqlar avtomatik balansingizga qo'shiladi"
                            ].map((text, i) => (
                                <li key={i} className="flex gap-3 text-xs font-bold text-gray-600 dark:text-gray-400 uppercase italic opacity-80 leading-relaxed">
                                    <HiOutlineCheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Logs Card */}
                    <div className="p-8 rounded-[3.5rem] bg-white/40 dark:bg-dark-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 space-y-8 shadow-2xl">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic text-center">Yutuqlar Tarixi</h4>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                            {logs.map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-gray-50 dark:bg-dark-800/50 border border-transparent hover:border-primary-500/20 transition-all group animate-slide-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 ${log.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {log.amount > 0 ? <HiOutlineTrendingUp className="w-5 h-5" /> : <HiOutlineX className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase italic leading-none mb-1">
                                                {log.amount > 0 ? "Mukofot yutildi" : "Yutuq chiqmadi"}
                                            </p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(log.createdAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className={`text-xl font-black italic tracking-tighter ${log.amount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {log.amount > 0 ? `+${log.amount}` : log.amount} <span className="text-[10px]">XP</span>
                                    </div>
                                </div>
                            ))}

                            {logs.length === 0 && (
                                <div className="text-center py-10 opacity-30 italic">
                                    Hozircha yutuqlar yo'q
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- WINNER MODAL --- */}
            {prize && !spinning && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-xl animate-fade-in" onClick={() => setPrize(null)} />
                    <div className="relative bg-white dark:bg-dark-800 w-full max-w-md rounded-[4rem] p-12 text-center shadow-[0_0_100px_rgba(249,115,22,0.4)] animate-zoom-in overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 via-orange-500 to-amber-500" />
                        <div className="space-y-8 relative">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-amber-400 flex items-center justify-center text-5xl shadow-2xl shadow-amber-400/50 mx-auto animate-bounce">
                                🎁
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">Tabriklaymiz!</h2>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest italic leading-none">Sizning bugungi omadingiz:</p>
                            </div>
                            <div className="py-6 px-10 rounded-[2.5rem] bg-gray-50 dark:bg-dark-900 border-2 border-primary-500/10 shadow-inner">
                                <p className="text-6xl font-black text-primary-500 italic tracking-tighter">
                                    {prize.amount}
                                </p>
                                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em] mt-2 italic">Coin Mukofoti</p>
                            </div>
                            {prize.amount >= 300 && <HiOutlineSparkles className="absolute -top-10 -right-10 w-32 h-32 text-amber-500/10" />}
                            <button
                                onClick={() => setPrize(null)}
                                className="w-full py-5 rounded-[2rem] bg-gray-900 dark:bg-primary-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all italic"
                            >
                                Davom etish
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default WheelOfFortune;
