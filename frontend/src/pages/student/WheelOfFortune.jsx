import { useState, useEffect, useRef } from 'react';
import { wheelAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineGift, HiOutlineClock, HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineStar } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

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
        { amount: 10, label: "🪙 10", color: "#6366f1" },
        { amount: 50, label: "🪙 50", color: "#8b5cf6" },
        { amount: 100, label: "🪙 100", color: "#a855f7" },
        { amount: 150, label: "🔄 150", color: "#d946ef" },
        { amount: 300, label: "🪙 300", color: "#ec4899" },
        { amount: 500, label: "🔥 500", color: "#f43f5e" },
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

            // Check today's spins from logs to update remaining count locally if needed
            // But better to trust backend response after spin
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
            setRemainingSpins(res.data.remainingSpins);

            // Find index of the prize to determine rotation
            const prizeIndex = segments.findIndex(s => s.amount === selectedPrize.amount);

            // If multiple segments have same value (none here but good practice)
            // we should technically get the exact index from backend or handle randomly

            const extraRotation = 360 * 6; // 6 full circles
            const prizeRotation = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
            const totalRotation = rotation + extraRotation + prizeRotation - (rotation % 360);

            setRotation(totalRotation);

            setTimeout(() => {
                setSpinning(false);
                setPrize(selectedPrize);
                toast.success(res.data.message);
                fetchLogs();
                checkAuth(); // Update balance
            }, 5000);

        } catch (err) {
            setSpinning(false);
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    if (loading) return <LoadingSpinner text="Omad g'ildiragi yuklanmoqda..." />;

    return (
        <div className="min-h-screen pb-20 animate-fade-in max-w-5xl mx-auto px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 py-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white dark:bg-dark-800 text-gray-500 shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-all"
                >
                    <HiOutlineArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter">
                        Omad <span className="text-primary-500">G'ildiragi 3.0</span>
                    </h1>
                    <div className="flex items-center justify-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic">{user?.coins || 0} 🪙</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">1 Spin = 150 🪙</p>
                        </div>
                    </div>
                </div>
                <div className="w-12" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Wheel Section */}
                <div className="flex flex-col items-center space-y-8">
                    <div className="relative">
                        {/* Needle/Indicator */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-6 z-30">
                            <div className="w-10 h-10 bg-white dark:bg-dark-800 rounded-full shadow-2xl flex items-center justify-center border-4 border-primary-500">
                                <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[18px] border-t-primary-500 -mb-5"></div>
                            </div>
                        </div>

                        {/* Outer Glow */}
                        <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-[60px] animate-pulse pointer-events-none" />

                        {/* The Wheel */}
                        <div
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                transition: spinning ? 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
                            }}
                            className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full border-[14px] border-gray-900 dark:border-white/5 shadow-[0_0_50px_rgba(99,102,241,0.3)] relative bg-gray-900 overflow-hidden z-10"
                        >
                            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                                {segments.map((s, i) => {
                                    const startAngle = i * segmentAngle;
                                    const endAngle = (i + 1) * segmentAngle;

                                    const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                                    const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                                    const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                                    const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                                    const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                                    const textAngle = startAngle + segmentAngle / 2;
                                    const tx = 50 + 32 * Math.cos(Math.PI * textAngle / 180);
                                    const ty = 50 + 32 * Math.sin(Math.PI * textAngle / 180);

                                    return (
                                        <g key={i}>
                                            <path
                                                d={pathData}
                                                fill={s.color}
                                                stroke="rgba(255,255,255,0.05)"
                                                strokeWidth="0.5"
                                            />
                                            <text
                                                x={tx}
                                                y={ty}
                                                fill="white"
                                                fontSize="5"
                                                fontWeight="900"
                                                className="italic font-black select-none"
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                                            >
                                                {s.label}
                                            </text>
                                        </g>
                                    );
                                })}
                            </svg>
                            {/* Inner Circle Decoration */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gray-900 rounded-full z-20 flex items-center justify-center border-4 border-white/10 text-white shadow-2xl">
                                <div className="text-center">
                                    <p className="text-[10px] font-black italic text-primary-400">IN</p>
                                    <p className="text-[10px] font-black italic text-white -mt-1 tracking-widest">FAST</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-4 w-full">
                        <button
                            onClick={handleSpin}
                            disabled={spinning}
                            className={`group relative overflow-hidden px-14 py-5 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95
                                ${spinning
                                    ? 'bg-gray-100 dark:bg-dark-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-primary-600 text-white hover:bg-primary-500 hover:shadow-primary-500/40 hover:-translate-y-1'}`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <HiOutlineLightningBolt className={`w-5 h-5 ${spinning ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
                                {spinning ? 'Aylanmoqda...' : 'Omadni sinash'}
                            </span>
                        </button>

                        <div className="flex flex-col items-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic mb-1">Kunlik imkoniyatlar</p>
                            <div className="flex gap-2">
                                {[1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className={`w-3 h-3 rounded-full border-2 transition-all duration-500 
                                            ${i <= (3 - remainingSpins)
                                                ? 'bg-primary-500 border-primary-500 animate-pulse'
                                                : 'bg-transparent border-gray-300 dark:border-dark-600 opacity-30'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {prize && !spinning && (
                        <div className="animate-scale-in text-center p-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20 w-full max-w-sm border border-white/20">
                            <HiOutlineSparkles className="w-8 h-8 mx-auto mb-2 animate-bounce" />
                            <p className="text-xs font-black uppercase tracking-widest mb-1 opacity-80">Tabriklaymiz!</p>
                            <h3 className="text-2xl font-black italic">+{prize.amount} Coin yutdingiz! 🎁</h3>
                            <p className="text-[10px] font-bold mt-2 opacity-60">Balansingizga qo'shildi</p>
                        </div>
                    )}
                </div>

                {/* Logs Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <HiOutlineSparkles className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Omadlilar ro'yxati</h3>
                        </div>

                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 scrollbar-none">
                            {logs.length === 0 ? (
                                <div className="text-center py-12 opacity-30 italic font-bold uppercase text-[10px] tracking-widest">
                                    Hali yutuqlar yo'q
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="group flex items-center justify-between p-4 rounded-3xl bg-gray-50 dark:bg-dark-900/50 border border-transparent hover:border-primary-500/20 transition-all animate-slide-up">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-800 flex items-center justify-center text-primary-500 font-black text-sm shadow-sm border border-gray-100 dark:border-white/5">
                                                {log.student?.ism?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors uppercase">{log.student?.ism}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1 whitespace-nowrap">
                                                    {new Date(log.createdAt).toLocaleDateString()} &bull; {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-black italic ${log.prize >= 500 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                                                +{log.prize} C
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 via-gray-900 to-black rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-5 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-1000">
                            <HiOutlineGift className="w-40 h-40" />
                        </div>
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                    <HiOutlineStar className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest italic">Jackpot: 1000 Coin! 🔥</h4>
                            </div>
                            <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                                Bugun sizning omadingiz chopishi mumkin! Har bir spin o'z ichiga 1000 coinlik Jackpotni oladi. Risq qiling va yutib oling!
                            </p>
                            <div className="pt-2">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-widest text-amber-500 italic">
                                    Chance: 5% for MEGA prizes
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WheelOfFortune;

