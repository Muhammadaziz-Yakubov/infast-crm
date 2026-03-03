import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { attendanceAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HiOutlineCamera, HiOutlineCheckCircle, HiOutlineArrowLeft } from 'react-icons/hi';

const ScanAttendance = () => {
    const navigate = useNavigate();
    const [isScanned, setIsScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            },
            /* verbose= */ false
        );

        const onScanSuccess = async (decodedText) => {
            // decodedText kelsa, demak QR o'qildi.
            // QR kontenti nima bo'lishidan qat'iy nazar (masalan marka havolasi), 
            // biz shunchaki o'quvchi markazdaligini bilamiz.
            if (isScanned) return;

            scanner.clear();
            handleAttendance();
        };

        const onScanFailure = (error) => {
            // Skanerlash davom etmoqda
        };

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            scanner.clear().catch(err => console.error("Scanner clear error", err));
        };
    }, [isScanned]);

    const handleAttendance = async () => {
        setLoading(true);
        try {
            const res = await attendanceAPI.scan();
            setIsScanned(res.data.message || "Davomat qilindi +50 berildi");
            toast.success(res.data.message || "Davomat qilindi +50 berildi");

            // 1.5 soniyadan keyin asosiy sahifaga qaytish
            setTimeout(() => {
                navigate('/');
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Xatolik yuz berdi");
            // Xatolik bo'lsa, yana skanerlashga ruxsat berish uchun (ixtiyoriy)
            setIsScanned(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-8 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="w-full max-w-md flex items-center justify-between mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 rounded-2xl bg-white dark:bg-dark-800 text-gray-500 shadow-sm border border-gray-100 dark:border-white/5"
                >
                    <HiOutlineArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">
                    QR <span className="text-primary-500">Skaner</span>
                </h1>
                <div className="w-12" /> {/* Spacer */}
            </div>

            <div className="w-full max-w-md bg-white dark:bg-dark-800 rounded-[2.5rem] p-8 shadow-2xl border border-gray-100 dark:border-white/5 text-center space-y-6">
                {!isScanned ? (
                    <>
                        <div className="relative">
                            <div id="reader" className="overflow-hidden rounded-3xl border-4 border-primary-500/20 shadow-inner"></div>
                            <div className="absolute inset-0 pointer-events-none border-2 border-primary-500 rounded-3xl opacity-20 animate-pulse"></div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-lg font-black text-gray-900 dark:text-white">QR Kodni Ko'rsating</h2>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                Markazdagi doimiy QR kodni kamera orqali skaner qiling va davomatingizni avtomatik belgilang.
                            </p>
                        </div>

                        <div className="flex items-center justify-center gap-3 py-4 bg-primary-500/5 rounded-2xl border border-primary-500/10">
                            <HiOutlineCamera className="w-5 h-5 text-primary-500 animate-bounce" />
                            <span className="text-[10px] font-black uppercase text-primary-500 tracking-widest">Kamera Faol</span>
                        </div>
                    </>
                ) : (
                    <div className="py-12 flex flex-col items-center space-y-6 animate-scale-in">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/20">
                            <HiOutlineCheckCircle className="w-16 h-16" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white">{isScanned} ✅</h2>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Asosiy sahifaga qaytilmoqda...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Hint */}
            {!isScanned && (
                <div className="max-w-xs text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] leading-loose">
                        QR Kod orqali davomat o'tish +50 coin mukofotini beradi
                    </p>
                </div>
            )}
        </div>
    );
};

export default ScanAttendance;
