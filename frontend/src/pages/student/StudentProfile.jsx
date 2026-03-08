import { useState, useEffect, useRef } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineUser, HiOutlinePhone, HiOutlineLockClosed, HiOutlinePencilAlt,
    HiOutlineShieldCheck, HiOutlineCamera, HiOutlineBadgeCheck,
    HiOutlineTrendingUp, HiOutlineSparkles, HiOutlineLogout
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const StudentProfile = () => {
    const fileInputRef = useRef(null);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        ism: '',
        telefon: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await studentAPI.getMyDashboard();
            const s = res.data.data.student;
            setStudent(s);
            setForm({
                ism: s.ism,
                telefon: s.telefon,
                password: '',
                confirmPassword: ''
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (form.password && form.password !== form.confirmPassword) {
            return toast.error("Parollar bir-biriga mos kelmadi");
        }

        try {
            const updateData = {
                ism: form.ism,
                telefon: form.telefon
            };
            if (form.password) updateData.password = form.password;

            await studentAPI.updateMe(updateData);
            toast.success("Profil yangilandi ✨");
            setIsEditing(false);
            fetchProfile();
        } catch (err) {
            toast.error(err.response?.data?.message || "Xatolik yuz berdi");
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            return toast.error("Faqat rasm yuklash mumkin");
        }
        if (file.size > 5 * 1024 * 1024) {
            return toast.error("Rasm hajmi 5MB dan oshmasligi kerak");
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const res = await studentAPI.updateProfileImage(formData);
            toast.success("Profil rasmi yangilandi ✨");
            setStudent({ ...student, profileImage: res.data.data.profileImage });
        } catch (err) {
            toast.error(err.response?.data?.message || "Rasm yuklashda xatolik");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <LoadingSpinner text="Profilingiz yuklanmoqda..." />;
    if (!student) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-32 lg:pb-16 px-4 animate-fade-in">

            {/* --- TOP HEADER: PROFILE BRANDING --- */}
            <div className="relative group p-1">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-orange-500/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative flex flex-col md:flex-row items-center gap-10 md:gap-14 bg-white/40 dark:bg-dark-900/40 backdrop-blur-2xl p-10 md:p-14 rounded-[4rem] border border-white/20 dark:border-white/5 shadow-3xl overflow-hidden">

                    {/* AVATAR SECTION */}
                    <div className="relative z-10 flex-shrink-0">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <div
                            onClick={() => !uploading && fileInputRef.current.click()}
                            className={`w-40 h-40 md:w-52 md:h-52 rounded-[3.5rem] bg-gradient-to-br from-primary-500 via-orange-500 to-rose-600 p-1.5 shadow-2xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all duration-500 cursor-pointer group/avatar overflow-hidden relative ${uploading ? 'opacity-50' : ''}`}
                        >
                            <div className="w-full h-full rounded-[3.2rem] overflow-hidden bg-gray-900 flex items-center justify-center text-7xl font-black text-white italic relative">
                                {student.profileImage ? (
                                    <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700" />
                                ) : (
                                    student.ism?.charAt(0)
                                )}

                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300">
                                    <div className="flex flex-col items-center gap-2">
                                        <HiOutlineCamera className="w-10 h-10 text-white" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Yangilash</span>
                                    </div>
                                </div>

                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Status badge */}
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 p-3 rounded-2xl shadow-xl border-4 border-white dark:border-dark-950 text-white z-30 animate-bounce">
                            <HiOutlineBadgeCheck className="w-6 h-6" />
                        </div>
                    </div>

                    {/* NAME & GENERAL INFO SECTION */}
                    <div className="relative z-10 flex-1 text-center md:text-left space-y-4">
                        <div className="space-y-1">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-tight drop-shadow-sm">
                                {student.ism}
                            </h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <span className="px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] italic border border-primary-500/20">
                                    Student ID: {student.username}
                                </span>
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] italic border ${student.tolovHolati === 'tolangan' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                    {student.tolovHolati === 'tolangan' ? 'Faol O\'quvchi' : 'Cheklangan'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="p-4 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Guruh</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white uppercase truncate">{student.guruh?.nomi || 'Nomalum'}</p>
                            </div>
                            <div className="p-4 rounded-3xl bg-white/50 dark:bg-white/5 border border-white/20">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Jadval</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white truncate">{student.guruh?.jadval?.vaqt || '--:--'}</p>
                            </div>
                        </div>
                    </div>

                    {/* BG ACCENTS */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
                </div>
            </div>

            {/* --- TWO COLUMN LAYOUT: STATS & FORM --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* LEFT: PROGRESS & STATS (4 columns) */}
                <div className="lg:col-span-5 space-y-8 animate-slide-up">
                    <div className="bg-gradient-to-br from-gray-900 via-dark-900 to-primary-950 rounded-[3.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                            <HiOutlineTrendingUp className="w-52 h-52" />
                        </div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] italic">Joriy Daraja</p>
                                    <h3 className="text-4xl font-black italic uppercase leading-none">{student.level || 1} <span className="text-base text-primary-500">Lvl</span></h3>
                                </div>
                                <div className="w-16 h-16 rounded-2.5xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                                    <HiOutlineSparkles className="w-8 h-8 text-amber-400" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end px-2">
                                    <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest italic">Rivojlanish</p>
                                    <span className="text-xl font-black italic">{student.progress || 0}%</span>
                                </div>
                                <div className="h-6 w-full bg-white/5 rounded-full p-1.5 border border-white/10 overflow-hidden relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-rose-500 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.3)] transition-all duration-1000 relative"
                                        style={{ width: `${student.progress || 0}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[9px] font-black text-white/40 uppercase tracking-widest italic px-2">
                                    <span>Lvl {student.level}</span>
                                    <span>Keyingi: {student.nextXP} XP</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                                    <p className="text-[9px] font-black text-primary-400 uppercase tracking-widest italic leading-none">Jami XP</p>
                                    <p className="text-2xl font-black italic">{student.xp || 0}</p>
                                </div>
                                <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-1 text-right">
                                    <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest italic leading-none">Coins</p>
                                    <p className="text-2xl font-black italic">{student.coins || 0}🪙</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: EDITABLE DATA (8 columns) */}
                <div className="lg:col-span-7 space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="bg-white dark:bg-dark-800 rounded-[3.5rem] p-8 md:p-12 shadow-sm border border-gray-100 dark:border-white/5">

                        <div className="flex items-center justify-between mb-12">
                            <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase italic tracking-widest">Profilingizni sozlang</h3>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${isEditing ? 'bg-gray-900 text-white dark:bg-dark-700' : 'bg-primary-500 text-white shadow-primary-500/20 hover:rotate-12'}`}
                            >
                                <HiOutlinePencilAlt className="w-6 h-6" />
                            </button>
                        </div>

                        {!isEditing ? (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-gray-50 dark:bg-dark-900/50 border border-transparent hover:border-primary-500/10 transition-all group/info">
                                    <div className="w-16 h-16 rounded-2.5xl bg-white dark:bg-dark-800 shadow-sm flex items-center justify-center text-primary-500 group-hover/info:scale-110 transition-transform">
                                        <HiOutlineUser className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-1 leading-none">Foydalanuvchi ismi</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white italic">{student.ism}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-gray-50 dark:bg-dark-900/50 border border-transparent hover:border-emerald-500/10 transition-all group/info">
                                    <div className="w-16 h-16 rounded-2.5xl bg-white dark:bg-dark-800 shadow-sm flex items-center justify-center text-emerald-500 group-hover/info:scale-110 transition-transform">
                                        <HiOutlinePhone className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-1 leading-none">Bog'lanish raqami</p>
                                        <p className="text-xl font-black text-gray-900 dark:text-white italic font-mono uppercase tracking-tight">{student.telefon}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center pt-8 opacity-40">
                                    <HiOutlineShieldCheck className="w-10 h-10 text-gray-400" />
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] ml-3 italic">Hisobingiz xavfsiz holatda</span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-10">
                                <div className="space-y-6">
                                    <div className="relative group/input">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block italic">Ismingizni yangilang</label>
                                        <div className="relative">
                                            <HiOutlineUser className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={form.ism}
                                                onChange={e => setForm({ ...form, ism: e.target.value })}
                                                className="w-full pl-16 pr-8 py-5 rounded-[1.8rem] bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500/30 dark:focus:border-primary-500/20 focus:bg-white dark:focus:bg-dark-800 outline-none font-black text-lg transition-all italic text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="relative group/input">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2 block italic">Telefon raqamni yangilang</label>
                                        <div className="relative">
                                            <HiOutlinePhone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={form.telefon}
                                                onChange={e => setForm({ ...form, telefon: e.target.value })}
                                                className="w-full pl-16 pr-8 py-5 rounded-[1.8rem] bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500/30 dark:focus:border-primary-500/20 focus:bg-white dark:focus:bg-dark-800 outline-none font-black text-lg transition-all italic text-gray-900 dark:text-white"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-10 border-t border-gray-100 dark:border-white/5">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] italic text-center">Xavfsizlik & Parol</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative group/input">
                                            <HiOutlineLockClosed className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary-500 transition-colors" />
                                            <input
                                                type="password"
                                                placeholder="Yangi parol"
                                                value={form.password}
                                                onChange={e => setForm({ ...form, password: e.target.value })}
                                                className="w-full pl-16 pr-6 py-5 rounded-[1.8rem] bg-gray-100 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500/20 outline-none font-bold italic"
                                            />
                                        </div>
                                        <div className="relative group/input">
                                            <HiOutlineLockClosed className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-primary-500 transition-colors" />
                                            <input
                                                type="password"
                                                placeholder="Parolni tasdiqlang"
                                                value={form.confirmPassword}
                                                onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                                className="w-full pl-16 pr-6 py-5 rounded-[1.8rem] bg-gray-100 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500/20 outline-none font-bold italic"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-center text-gray-400 font-bold italic">*Parolni o'zgartirishni xohlamasangiz, bo'sh qoldiring</p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-5 rounded-[1.8rem] bg-gray-100 dark:bg-dark-700 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] italic active:scale-95 transition-all"
                                    >
                                        Bekor qilish
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-5 rounded-[1.8rem] bg-primary-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary-500/30 hover:shadow-primary-500/40 active:scale-95 transition-all italic"
                                    >
                                        Saqlash ✨
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* --- BOTTOM SECTION: ACCOUNT ACTIONS --- */}
            <div className="flex justify-center pt-8">
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                    }}
                    className="flex items-center gap-3 px-10 py-5 rounded-[2rem] bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all duration-300 font-black text-[10px] uppercase tracking-[0.3em] italic group"
                >
                    <HiOutlineLogout className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Tizimdan chiqish
                </button>
            </div>

        </div>
    );
};

export default StudentProfile;
