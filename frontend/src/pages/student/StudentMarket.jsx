import { useState, useEffect } from 'react';
import { marketAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineShoppingBag, HiOutlineClock, HiOutlineTrendingUp, HiOutlineLightningBolt } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const StudentMarket = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(null);

    useEffect(() => {
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
            toast.success('Muvaffaqiyatli sotib olindi!');
            fetchProducts();
            // User contextni yangilash kerak yoki sahifani reload qilish
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Xarid amalga oshmadi');
        } finally {
            setBuying(null);
        }
    };

    if (loading) return <LoadingSpinner text="Market yuklanmoqda..." />;

    return (
        <div className="min-h-screen pb-20 lg:pb-10 max-w-7xl mx-auto px-4 lg:px-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-[2rem] p-8 mb-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                    <HiOutlineShoppingBag className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight mb-2 italic">InFast <span className="text-primary-200 uppercase">Market</span></h1>
                        <p className="text-primary-100 text-sm font-medium opacity-90 max-w-md uppercase tracking-wider">Coinlaringiz evaziga ajoyib sovg'alar va mahsulotlarni sotib oling!</p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-400/30">
                                <span className="text-2xl font-black">🪙</span>
                            </div>
                            <div className="text-right">
                                <p className="text-primary-100 text-[10px] font-black uppercase tracking-widest">Sizning balansingiz</p>
                                <p className="text-2xl font-black tracking-tight">{user?.coins || 0}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/market/logs')}
                            className="text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/10 flex items-center gap-2"
                        >
                            <HiOutlineClock className="w-3.5 h-3.5" />
                            Coin Tarixi
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-dark-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-white/5">
                    <HiOutlineShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Hozircha mahsulotlar yo'q</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                <img
                                    src={product.rasm}
                                    alt={product.nomi}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-4 right-4 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md px-4 py-1.5 rounded-xl border border-white/20 shadow-xl">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">🪙</span>
                                        <span className="font-black text-gray-900 dark:text-white tracking-tight italic">{product.narxi}</span>
                                    </div>
                                </div>
                                {product.soni < 5 && (
                                    <div className="absolute top-4 left-4 bg-red-500 text-white text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-red-500/20">
                                        Tugamoqda: {product.soni} ta
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex flex-col flex-1">
                                <div className="mb-4 flex-1">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight italic mb-2 line-clamp-1">{product.nomi}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed line-clamp-2 uppercase tracking-wide opacity-80">{product.tavsif}</p>
                                </div>
                                <button
                                    onClick={() => handleBuy(product)}
                                    disabled={buying === product._id || product.soni <= 0 || (user?.coins || 0) < product.narxi}
                                    className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-3 transition-all active:scale-95 ${(user?.coins || 0) >= product.narxi && product.soni > 0
                                            ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20 hover:bg-primary-600'
                                            : 'bg-gray-100 dark:bg-dark-700 text-gray-400 cursor-not-allowed'
                                        }`}
                                >
                                    {buying === product._id ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (user?.coins || 0) < product.narxi ? (
                                        'Coin yetarli emas'
                                    ) : product.soni <= 0 ? (
                                        'Tugagan'
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

            {/* Coin Tips */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-dark-900/50 p-8 rounded-[3rem] border border-gray-100 dark:border-white/5">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0 shadow-lg shadow-emerald-500/10">
                        <HiOutlineTrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight italic text-sm mb-1">Coinlarni ko'paytiring</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed uppercase tracking-wider italic opacity-80">
                            Vazifalarni o'z vaqtida topshirib darslarga dars qoldirmasdan kelsangiz coinlaringiz avtomatik ko'payib boradi.
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 shadow-lg shadow-amber-500/10">
                        <HiOutlineLightningBolt className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight italic text-sm mb-1">Jazolardan ehtiyot bo'ling</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-relaxed uppercase tracking-wider italic opacity-80">
                            Darsga kelmaslik yoki vazifa topshirmaslik coinlaringiz ayirilishiga sabab bo'ladi. Intizomli bo'ling!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentMarket;
