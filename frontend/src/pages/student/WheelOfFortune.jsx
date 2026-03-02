import { useState, useEffect, useRef } from 'react';
import { wheelAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineGift, HiOutlineClock, HiOutlineSparkles } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';

const WheelOfFortune = () => {
    const navigate = useNavigate();
    const [spinning, setSpinning] = useState(false);
    const [prize, setPrize] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rotation, setRotation] = useState(0);
    const wheelRef = useRef(null);

    const segments = [
        { amount: 10, label: "10", color: "#6366f1" },
        { amount: 20, label: "20", color: "#8b5cf6" },
        { amount: 50, label: "50", color: "#a855f7" },
        { amount: 100, label: "100", color: "#d946ef" },
        { amount: 200, label: "200", color: "#ec4899" },
        { amount: 500, label: "500", color: "#f43f5e" },
        { amount: 10, label: "10", color: "#6366f1" },
        { amount: 20, label: "20", color: "#8b5cf6" },
    ];

    const segmentAngle = 360 / segments.length;

    useEffect(() => {
        fetchLogs();
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

        setSpinning(true);
        try {
            const res = await wheelAPI.spin();
            const selectedPrize = res.data.prize;

            // Find index of the prize to determine rotation
            // Note: In real production, we might want to ensure the wheel matches the backend
            const prizeIndex = segments.findIndex(s => s.amount === selectedPrize.amount);

            // Calculate rotation: 5 full circles + angle to the prize
            // We subtract the angle because the wheel rotates clockwise or counter-clockwise based on CSS
            // 0 degree is the first segment (10). 
            // We want the indicator at the top to point to the segment.
            const extraRotation = 360 * 5; // 5 full spins
            const prizeRotation = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
            const totalRotation = rotation + extraRotation + prizeRotation - (rotation % 360);

            setRotation(totalRotation);

            setTimeout(() => {
                setSpinning(false);
                setPrize(selectedPrize);
                toast.success(res.data.message);
                fetchLogs();
            }, 5000); // Match CSS transition duration

        } catch (err) {
            setSpinning(false);
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    if (loading) return <LoadingSpinner text="Omad g'ildiragi yuklanmoqda..." />;

    return (
        <div className="min-h-screen pb-20 animate-fade-in max-w-4xl mx-auto px-4">
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
                        Omad <span className="text-primary-500">G'ildiragi</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 italic">Har kuni 1 marta imkoniyat</p>
                </div>
                <div className="w-12" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Wheel Section */}
                <div className="flex flex-col items-center space-y-8">
                    <div className="relative">
                        {/* Needle/Indicator */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-4 z-20">
                            <div className="w-8 h-8 bg-white dark:bg-dark-800 rounded-full shadow-xl flex items-center justify-center border-4 border-primary-500">
                                <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-primary-500 -mb-4"></div>
                            </div>
                        </div>

                        {/* The Wheel */}
                        <div
                            ref={wheelRef}
                            style={{
                                transform: `rotate(${rotation}deg)`,
                                transition: spinning ? 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
                            }}
                            className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full border-[12px] border-white dark:border-dark-800 shadow-2xl relative overflow-hidden bg-white dark:bg-dark-900"
                        >
                            {segments.map((s, i) => (
                                <div
                                    key={i}
                                    style={{
                                        backgroundColor: s.color,
                                        transform: `rotate(${i * segmentAngle}deg) skewY(${segmentAngle - 90}deg)`,
                                        transformOrigin: '100% 100%',
                                        width: '50%',
                                        height: '50%',
                                        position: 'absolute',
                                        top: '0',
                                        left: '0'
                                    }}
                                    className="border border-white/10"
                                >
                                    <div
                                        style={{
                                            transform: `skewY(${-(segmentAngle - 90)}deg) rotate(${segmentAngle / 2}deg)`,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: '900',
                                            fontSize: '18px',
                                            paddingRight: '60px'
                                        }}
                                        className="text-shadow-sm font-black italic tracking-tighter"
                                    >
                                        {s.label}
                                    </div>
                                </div>
                            ))}
                            {/* Center Point */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white dark:bg-dark-800 rounded-full shadow-2xl z-10 flex items-center justify-center border-4 border-gray-100 dark:border-white/5">
                                <span className="font-black text-primary-500 text-xs italic">IF</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleSpin}
                        disabled={spinning}
                        className={`px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95
                            ${spinning
                                ? 'bg-gray-100 dark:bg-dark-700 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-br from-primary-500 to-purple-600 text-white shadow-primary-500/30 hover:-translate-y-1'}`}
                    >
                        {spinning ? 'Aylanmoqda...' : 'Aylantirish'}
                    </button>

                    {prize && !spinning && (
                        <div className="animate-scale-in text-center p-6 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 w-full max-w-xs">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Muborak bo'lsin!</p>
                            <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 italic">+{prize.label} yutdingiz 🎁</h3>
                        </div>
                    )}
                </div>

                {/* Logs Section */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <HiOutlineSparkles className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tight">So'nggi Yutuqlar</h3>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {logs.length === 0 ? (
                                <div className="text-center py-12 opacity-30 italic font-bold uppercase text-[10px] tracking-widest">
                                    Hali yutuqlar yo'q
                                </div>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 rounded-3xl bg-gray-50 dark:bg-dark-900/50 border border-gray-100 dark:border-white/5 animate-slide-up">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-800 flex items-center justify-center text-primary-500 font-black text-xs shadow-sm">
                                                {log.student?.ism?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-gray-900 dark:text-white">{log.student?.ism}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">
                                                    {new Date(log.createdAt).toLocaleTimeString('uz')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-emerald-500 italic">+{log.prize} C</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-6 text-white text-center space-y-3 shadow-xl">
                        <HiOutlineGift className="w-8 h-8 text-amber-500 mx-auto animate-bounce" />
                        <h4 className="text-xs font-black uppercase tracking-widest italic">Jackpot: 500 Coin</h4>
                        <p className="text-[10px] text-gray-500 font-bold leading-relaxed">Har kuni tizimga kiring va o'z omadingizni sinab ko'ring. Balki bugun sizning kuningizdir!</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WheelOfFortune;
