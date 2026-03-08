import { useState, useEffect } from 'react';
import { marketAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
    HiOutlineShoppingBag, HiOutlineClock, HiOutlineTrendingUp,
    HiOutlineLightningBolt, HiOutlineSparkles, HiOutlineTicket
} from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const StudentMarket = () => {
    const { user, checkAuth } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(null);

    useEffect(() => {
        checkAuth();
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await marketAPI.getProducts();
            setProducts(res.data.data.filter(p => p.holati === 'active'));
        } catch (err) {
            toast.error('Mahsulotlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (product) => {
        if (!window.confirm(`${product.nomi} mahsulotini ${product.narxi} coin evaziga sotib olmoqchimisiz?`)) return;

        setBuying(product._id);
        try {
            await marketAPI.buyProduct(product._id);
            toast.success('Muvaffaqiyatli sotib olindi! ✨');
            fetchProducts();
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xarid amalga oshmadi');
        } finally {
            setBuying(null);
        }
    };

    if (loading) return <LoadingSpinner text="Market tayyorlanmoqda..." />;

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-32 lg:pb-16 px-4 animate-fade-in">

            {/* --- HEADER --- */}
            <header className="relative flex flex-col md:flex-row items-center justify-between gap-8 pt-6 text-center md:text-left">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-orange-500/10 blur-3xl opacity-50 pointer-events-none" />
                <div className="relative space-y-2">
                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] italic mb-1 block">InFast do'koni</span>
                    <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white uppercase italic tracking-tighter leading-none">
                        Academy <span className="text-primary-500">Market</span>
                    </h1>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest opacity-60 italic">Bilim evaziga to'plangan coinlaringizni ishlating</p>
                </div>

                <div className="relative group">
                    <div className="absolute inset-0 bg-amber-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="relative bg-white/40 dark:bg-dark-900/40 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[2.5rem] p-6 flex flex-col items-center md:items-end gap-3 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest italic leading-none mb-1">Mening balansim</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white italic tracking-tighter leading-none">{user?.coins || 0} COIN</p>
                            </div>
                            <div className="w-16 h-16 rounded-2.5xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 group-hover:rotate-12 transition-transform duration-500">
                                <span className="text-3xl">🪙</span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/market/logs')}
                            className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-dark-800 text-[9px] font-black uppercase tracking-widest italic text-gray-400 hover:text-primary-500 hover:bg-white dark:hover:bg-dark-700 transition-all border border-transparent hover:border-primary-500/20 flex items-center justify-center gap-2"
                        >
                            <HiOutlineClock className="w-3.5 h-3.5" />
                            Coinlar Tarixi
                        </button>
                    </div>
                </div>
            </header>

            {/* --- PRODUCTS GRID --- */}
            {products.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center bg-white/20 dark:bg-dark-900/20 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-gray-100 dark:border-white/5">
                    <HiOutlineShoppingBag className="w-20 h-20 text-gray-200 mb-6" />
                    <h3 className="text-xl font-black text-gray-400 uppercase italic tracking-widest">Hozircha mahsulotlar yo'q</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map((product, index) => (
                        <div
                            key={product._id}
                            className="group relative flex flex-col bg-white/40 dark:bg-dark-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-xl hover:shadow-primary-500/10 transition-all duration-700 animate-slide-up"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            {/* Image Part */}
                            <div className="relative aspect-[16/11] overflow-hidden">
                                <img
                                    src={product.rasm}
                                    alt={product.nomi}
                                    className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/40 via-transparent to-transparent opacity-60" />

                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 shadow-xl flex items-center gap-2">
                                    <span className="text-xs">🪙</span>
                                    <span className="font-black text-gray-900 dark:text-white italic tracking-tighter">{product.narxi}</span>
                                </div>

                                {product.soni < 5 && (
                                    <div className="absolute top-4 left-4 bg-rose-500 text-white text-[8px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-rose-500/20 animate-pulse">
                                        Faqat {product.soni} ta qoldi
                                    </div>
                                )}
                            </div>

                            {/* Content Part */}
                            <div className="p-8 flex flex-col flex-1 space-y-4">
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight leading-none line-clamp-1 group-hover:text-primary-500 transition-colors">
                                        {product.nomi}
                                    </h3>
                                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-relaxed uppercase tracking-wide opacity-70 line-clamp-2">
                                        {product.tavsif}
                                    </p>
                                </div>

                                <button
                                    onClick={() => handleBuy(product)}
                                    disabled={buying === product._id || product.soni <= 0 || (user?.coins || 0) < product.narxi}
                                    className={`w-full py-4 rounded-2.5xl font-black uppercase tracking-[0.2em] text-[10px] italic flex items-center justify-center gap-3 transition-all active:scale-95 ${(user?.coins || 0) >= product.narxi && product.soni > 0
                                        ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/30 hover:bg-primary-600'
                                        : 'bg-gray-100 dark:bg-dark-800 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {buying === product._id ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (user?.coins || 0) < product.narxi ? (
                                        'Coin yetarli emas ❌'
                                    ) : product.soni <= 0 ? (
                                        'Zaxira tugagan ❌'
                                    ) : (
                                        <>
                                            <HiOutlineShoppingBag className="w-4 h-4" />
                                            Sotib olish
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- INFO / TIPS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
                <div className="relative group p-8 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-emerald-500/10 group-hover:rotate-12 transition-transform duration-700">
                        <HiOutlineTrendingUp className="w-32 h-32" />
                    </div>
                    <div className="relative space-y-4">
                        <div className="w-14 h-14 rounded-2.5xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/10">
                            <HiOutlineTrendingUp className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Ko'proq Coin to'plang</h4>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest italic opacity-70 leading-relaxed">
                                Darslarga o'z vaqtida kelish va vazifalarni a'lo darajada topshirish sizga muntazam coinlar olib keladi.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative group p-8 rounded-[3rem] bg-amber-500/5 border border-amber-500/10 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 text-amber-500/10 group-hover:rotate-12 transition-transform duration-700">
                        <HiOutlineTicket className="w-32 h-32" />
                    </div>
                    <div className="relative space-y-4">
                        <div className="w-14 h-14 rounded-2.5xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-lg shadow-amber-500/10">
                            <HiOutlineSparkles className="w-7 h-7" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Eksklyuziv sovg'alar</h4>
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest italic opacity-70 leading-relaxed">
                                Marketga muntazam yangi mahsulotlar va cheklangan sovg'alar qo'shib boriladi. Ularni o'tkazib yubormang!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default StudentMarket;
