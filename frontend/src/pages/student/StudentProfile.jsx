import { useState, useEffect, useRef } from 'react';
import { studentAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
    HiOutlineUser, HiOutlinePhone, HiOutlineLockClosed, HiOutlinePencilAlt, HiOutlineShieldCheck, HiOutlineCamera
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

        // Validatsiya
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

    if (loading) return <LoadingSpinner />;
    if (!student) return null;

    return (
        <div className="space-y-10 animate-fade-in max-w-2xl mx-auto pb-24 lg:pb-10 px-4 md:px-0">
            <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Shaxsiy <span className="text-primary-500">Profil</span></h1>
                <p className="text-sm font-medium text-gray-500">Ma'lumotlaringizni xavfsiz boshqaring</p>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-[3rem] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl group transition-all duration-500 hover:shadow-primary-500/10">
                {/* Premium Profile Header */}
                <div className="bg-gray-900 p-10 md:p-14 relative overflow-hidden flex flex-col items-center">

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                    />

                    <div className="relative mb-6 group/avatar">
                        <div
                            onClick={() => !uploading && fileInputRef.current.click()}
                            className={`relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-orange-600 flex items-center justify-center text-5xl md:text-6xl font-black text-white shadow-3xl transform group-hover:scale-110 transition-transform duration-500 cursor-pointer overflow-hidden border-4 border-white/10 ${uploading ? 'opacity-50' : ''}`}
                        >
                            {student.profileImage ? (
                                <img src={student.profileImage} alt={student.ism} className="w-full h-full object-cover" />
                            ) : (
                                student.ism?.charAt(0)
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                <HiOutlineCamera className="w-8 h-8 text-white" />
                            </div>

                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>

                        {/* Status Dot */}
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-emerald-500 border-4 border-gray-900 rounded-full z-20 shadow-lg"></div>
                    </div>

                    <div className="relative z-10 text-center space-y-2">
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tight">{student.ism}</h2>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] italic">
                            Student ID: {student.username}
                        </div>
                    </div>

                    {/* Decorative gradients */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary-900/40 rounded-full blur-[100px] pointer-events-none" />
                </div>

                <div className="p-8 md:p-12">
                    {!isEditing ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-gray-50 dark:bg-dark-900/50 border border-transparent hover:border-primary-500/10 transition-all group/item">
                                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center transition-transform group-hover/item:rotate-12">
                                    <HiOutlineUser className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">To'liq ism</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white group-hover/item:text-primary-500 transition-colors">{student.ism}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-gray-50 dark:bg-dark-900/50 border border-transparent hover:border-amber-500/10 transition-all group/item">
                                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center transition-transform group-hover/item:rotate-12">
                                    <HiOutlinePhone className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Telefon raqam</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white group-hover/item:text-amber-500 transition-colors uppercase font-mono">{student.telefon}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-gray-50 dark:bg-dark-900/50 border border-transparent hover:border-emerald-500/10 transition-all group/item">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center transition-transform group-hover/item:rotate-12">
                                    <HiOutlineShieldCheck className="w-7 h-7" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">Xavfsizlik</p>
                                    <p className="text-xl font-black text-gray-900 dark:text-white group-hover/item:text-emerald-500 transition-colors">Faol Himoya</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-5 rounded-[1.5rem] bg-gray-900 dark:bg-primary-600 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-primary-500/20 italic"
                            >
                                <HiOutlinePencilAlt className="w-5 h-5" />
                                Ma'lumotlarni Tahrirlash
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdate} className="space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 italic">To'liq ismingiz</label>
                                    <input
                                        type="text"
                                        value={form.ism}
                                        onChange={e => setForm({ ...form, ism: e.target.value })}
                                        className="w-full px-8 py-5 rounded-[1.5rem] bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-black text-lg transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 italic">Telefon raqam</label>
                                    <input
                                        type="text"
                                        value={form.telefon}
                                        onChange={e => setForm({ ...form, telefon: e.target.value })}
                                        className="w-full px-8 py-5 rounded-[1.5rem] bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-black text-lg transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-white/5 space-y-6">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] italic text-center">Xavfsizlikni yangilash</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <HiOutlineLockClosed className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="Yangi parol"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className="w-full pl-16 pr-6 py-5 rounded-[1.5rem] bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold"
                                        />
                                    </div>
                                    <div className="relative">
                                        <HiOutlineLockClosed className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="password"
                                            placeholder="Parolni tasdiqlang"
                                            value={form.confirmPassword}
                                            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                                            className="w-full pl-16 pr-6 py-5 rounded-[1.5rem] bg-gray-50 dark:bg-dark-900 border-2 border-transparent focus:border-primary-500 outline-none font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-5 rounded-[1.5rem] bg-gray-100 dark:bg-dark-700 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] active:scale-95 transition-all italic"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-5 rounded-[1.5rem] bg-primary-600 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary-500/20 active:scale-95 transition-all italic"
                                >
                                    O'zgarishlarni saqlash
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>

    );
};

export default StudentProfile;
