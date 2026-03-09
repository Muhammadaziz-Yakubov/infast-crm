import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { attendanceAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineCamera, HiOutlineCheckCircle, HiOutlineArrowLeft, HiOutlineLightningBolt, HiOutlineRefresh } from 'react-icons/hi';

const ScanAttendance = () => {
    const navigate = useNavigate();
    const [isScanned, setIsScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        startScanner();

        return () => {
            stopScanner();
        };
    }, []);

    const startScanner = async () => {
        setCameraError(null);
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        const qrCodeSuccessCallback = (decodedText) => {
            // Check if it's the correct application QR code
            const currentOrigin = window.location.origin;
            if (!decodedText || (!decodedText.includes(currentOrigin) && !decodedText.includes('/scan'))) {
                toast.error("Noto'g'ri QR Kod! Iltimos, faqat markazdagi QR kodni skanerlang.");
                setTimeout(() => window.location.reload(), 2000);
                return;
            }

            // QR o'qildi.
            stopScanner().then(() => {
                handleAttendance();
            });
        };

        const config = {
            fps: 15,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        try {
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                qrCodeSuccessCallback
            );
        } catch (err) {
            console.error("Kamerani boshlashda xatolik:", err);
            setCameraError("Kameraga ruxsat berilmagan yoki kamera topilmadi.");
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.error("Scannerni to'xtatishda xatolik:", err);
            }
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setLoading(true);
            await stopScanner();

            const html5QrCode = new Html5Qrcode("reader");
            const decodedText = await html5QrCode.scanFile(file, true);

            const currentOrigin = window.location.origin;
            if (!decodedText || (!decodedText.includes(currentOrigin) && !decodedText.includes('/scan'))) {
                toast.error("Noto'g'ri QR Kod! Iltimos, faqat markazdagi QR kodni skanerlang.");
                setTimeout(() => window.location.reload(), 2000);
                return;
            }

            handleAttendance();
        } catch (err) {
            console.error("Fayldan o'qishda xatolik:", err);
            toast.error("QR kod topilmadi. Sifatliroq rasm yuklang!");

            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleAttendance = async () => {
        setLoading(true);
        try {
            const res = await attendanceAPI.scan();
            setIsScanned(res.data.message || "Davomat qilindi +50 berildi");
            toast.success(res.data.message || "Davomat qilindi +50 berildi");

            // 1.5 soniyadan keyin asosiy sahifaga qaytish
            setTimeout(() => {
                navigate('/');
            }, 1800);
        } catch (error) {
            toast.error(error.response?.data?.message || "Xatolik yuz berdi");
            // Xatolik bo'lsa, yana skanerlashga ruxsat berish uchun qayta yuklash
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 sm:p-8 space-y-8 animate-fade-in max-w-lg mx-auto">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white dark:bg-dark-800 text-gray-500 shadow-sm border border-gray-100 dark:border-white/5 active:scale-95 transition-all outline-none"
                >
                    <HiOutlineArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                        QR <span className="text-primary-500">Skaner</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">InFast Academy</p>
                </div>
                <div className="w-12" />
            </div>

            <div className="w-full bg-white dark:bg-dark-800 rounded-[3rem] p-8 shadow-2xl border border-gray-100 dark:border-white/5 text-center space-y-8 relative overflow-hidden group">
                {/* Decorative background logo */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] -mr-10 -mt-10 group-hover:rotate-12 transition-transform duration-1000">
                    <HiOutlineLightningBolt className="w-40 h-40" />
                </div>

                {!isScanned ? (
                    <>
                        <div className="relative">
                            <div id="reader" className="overflow-hidden rounded-[2.5rem] border-4 border-primary-500/10 shadow-inner bg-gray-50 dark:bg-dark-900 min-h-[300px] flex items-center justify-center">
                                {cameraError && (
                                    <div className="p-8 space-y-4">
                                        <HiOutlineCamera className="w-12 h-12 text-gray-300 mx-auto" />
                                        <p className="text-sm font-bold text-gray-500">{cameraError}</p>
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="px-6 py-2 bg-primary-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
                                            >
                                                Qayta urinish
                                            </button>
                                            <p className="text-xs text-gray-400 mt-2">Pastdagi yashil tugmadan rasmga oling</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Scanning Animation Overlays */}
                            {!cameraError && (
                                <>
                                    <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-1 bg-primary-500/50 blur-sm animate-scan-line z-20"></div>
                                    <div className="absolute inset-10 border-2 border-primary-500/20 rounded-3xl pointer-events-none z-10"></div>
                                </>
                            )}
                        </div>

                        <div className="space-y-3 relative z-10">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">QR Kodni Ko'rsating</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed px-4">
                                Markazdagi QR kodni kamera markaziga qarating yoki rasmga olib yuklang
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 relative z-10 w-full px-4">
                            <label className="flex items-center justify-center gap-3 py-4 bg-emerald-500 text-white rounded-[1.5rem] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer border border-emerald-400">
                                <HiOutlineCamera className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest">Rasmga olish (Muqobil)</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </label>

                            <div className="flex items-center justify-center gap-3 py-3 bg-primary-500/5 rounded-[1.5rem] border border-primary-500/10">
                                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase text-primary-500 tracking-[0.2em] italic">Jonli Kamera {cameraError ? "Xatolik" : "Faol"}</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-16 flex flex-col items-center space-y-8 animate-scale-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse"></div>
                            <div className="relative w-28 h-28 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/10 border-2 border-emerald-500/20">
                                <HiOutlineCheckCircle className="w-16 h-16" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">{isScanned}</h2>
                            <div className="flex items-center justify-center gap-2">
                                <HiOutlineRefresh className="w-4 h-4 text-emerald-500 animate-spin" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] italic">Asosiy sahifaga qaytilmoqda...</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Reward Badge */}
            {!isScanned && (
                <div className="bg-gradient-to-br from-gray-900 to-black p-6 rounded-[2rem] w-full shadow-2xl relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <HiOutlineLightningBolt className="w-16 h-16" />
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-400 border border-primary-500/20">
                            <HiOutlineLightningBolt className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest leading-none mb-1 shadow-primary-500/20">Tezkor Mukofot</p>
                            <p className="text-xs font-black text-white uppercase tracking-tighter">Davomat uchun +50 Coin!</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScanAttendance;

