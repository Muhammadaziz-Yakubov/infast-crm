import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Login = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error('Barcha maydonlarni to\'ldiring');
            return;
        }
        setLoading(true);
        try {
            await login(username, password);
            toast.success('Muvaffaqiyatli kirildi!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse-soft" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse-soft" />

            <div className="relative w-full max-w-lg animate-fade-in">
                {/* Branding */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary-500 to-indigo-600 
            shadow-2xl shadow-primary-500/20 mb-6 transform hover:rotate-6 transition-transform">
                        <span className="text-white font-black text-3xl tracking-tighter">IF</span>
                    </div>
                    <h1 className="text-5xl font-black text-white mb-3 tracking-tighter italic">InFast <span className="text-primary-500">CRM</span></h1>
                    <p className="text-gray-500 font-bold uppercase tracking-[0.3em] text-[10px]">Education Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-10 md:p-14 border border-white/10 shadow-3xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Tizimga kirish</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Foydalanuvchi nomi</label>
                                <input
                                    id="login-username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full px-6 py-5 rounded-2xl bg-white/5 border-2 border-transparent text-white 
                    placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:bg-white/10
                    transition-all duration-300 font-bold text-lg"
                                    placeholder="Username"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Parol</label>
                                <div className="relative">
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-6 py-5 rounded-2xl bg-white/5 border-2 border-transparent text-white 
                      placeholder-gray-600 focus:outline-none focus:border-primary-500/50 focus:bg-white/10
                      transition-all duration-300 font-bold text-lg pr-14"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <HiOutlineEyeOff className="w-6 h-6" /> : <HiOutlineEye className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    id="login-submit"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 rounded-[1.5rem] bg-primary-600 text-white 
                    font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary-600/30 hover:shadow-primary-600/50 
                    transition-all duration-300 hover:-translate-y-1 active:scale-95
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                            Kirilmoqda...
                                        </span>
                                    ) : 'Kirish Tizimiga'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-12 text-center opacity-30">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em]">
                        Reserved &bull; InFast CRM &bull; 2026
                    </p>
                </div>
            </div>
        </div>

    );
};

export default Login;
