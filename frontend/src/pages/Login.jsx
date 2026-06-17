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
        <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] p-4 relative overflow-hidden">
            {/* Subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#0066FF]/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative w-full max-w-md animate-fade-in">
                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 mb-4">
                        <span className="text-white font-semibold text-lg tracking-tight">IF</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">InFast CRM</h1>
                    <p className="text-zinc-500 text-xs mt-1">Education Management System</p>
                </div>

                {/* Login Card */}
                <div className="bg-[#111111]/80 backdrop-blur-xl rounded-2xl p-8 border border-zinc-900 shadow-sm relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">Foydalanuvchi nomi</label>
                            <input
                                id="login-username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-[#0066FF]/10 transition-all duration-200 text-sm h-[42px]"
                                placeholder="Username"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">Parol</label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-[#0066FF] focus:ring-4 focus:ring-[#0066FF]/10 transition-all duration-200 text-sm h-[42px] pr-10"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <HiOutlineEyeOff className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 rounded-xl bg-[#0066FF] text-white font-medium text-sm hover:bg-[#0052cc] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#0066FF]"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Kirilmoqda...
                                    </span>
                                ) : 'Tizimga kirish'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 text-center opacity-30">
                    <p className="text-[10px] text-zinc-500 tracking-wider">
                        InFast CRM &bull; 2026
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
