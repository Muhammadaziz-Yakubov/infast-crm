import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlinePhotograph, HiOutlineShoppingBag, HiOutlineClipboardList } from 'react-icons/hi';

const MarketManager = () => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('products'); // 'products' or 'orders'
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        nomi: '',
        tavsif: '',
        narxi: '',
        rasm: '',
        soni: '',
        holati: 'active'
    });

    useEffect(() => {
        if (activeTab === 'products') {
            fetchProducts();
        } else {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await marketAPI.getProducts();
            setProducts(res.data.data);
        } catch (err) {
            toast.error('Mahsulotlarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await marketAPI.getOrders();
            setOrders(res.data.data);
        } catch (err) {
            toast.error('Buyurtmalarni yuklashda xatolik');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                await marketAPI.updateProduct(editingProduct._id, formData);
                toast.success('Mahsulot yangilandi');
            } else {
                await marketAPI.createProduct(formData);
                toast.success('Yangi mahsulot qo\'shildi');
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            setFormData({ nomi: '', tavsif: '', narxi: '', rasm: '', soni: '', holati: 'active' });
            fetchProducts();
        } catch (err) {
            toast.error('Xatolik yuz berdi');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Haqiqatan ham bu mahsulotni o\'chirmoqchimisiz?')) return;
        try {
            await marketAPI.deleteProduct(id);
            toast.success('Mahsulot o\'chirildi');
            fetchProducts();
        } catch (err) {
            toast.error('O\'chirishda xatolik');
        }
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            nomi: product.nomi,
            tavsif: product.tavsif,
            narxi: product.narxi,
            rasm: product.rasm,
            soni: product.soni,
            holati: product.holati
        });
        setIsModalOpen(true);
    };

    if (loading) return <LoadingSpinner text="Mahsulotlar yuklanmoqda..." />;

    return (
        <div className="p-4 lg:p-8 max-w-7xl mx-auto min-h-screen animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <h1 className="text-3xl lg:text-4xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Market <span className="text-primary-500">Boshqaruvi</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Mahsulotlarni va buyurtmalarni nazorat qilish</p>
                </div>

                {activeTab === 'products' && (
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setFormData({ nomi: '', tavsif: '', narxi: '', rasm: '', soni: '', holati: 'active' });
                            setIsModalOpen(true);
                        }}
                        className="group relative flex items-center justify-center gap-3 bg-primary-500 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95 overflow-hidden"
                    >
                        <HiOutlinePlus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        <span>Yangi mahsulot</span>
                    </button>
                )}
            </div>

            {/* Premium Tabs */}
            <div className="flex p-1.5 bg-gray-100 dark:bg-dark-900 rounded-[2rem] mb-10 w-full max-w-md mx-auto sm:mx-0">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'products' ? 'bg-white dark:bg-dark-800 text-primary-500 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <HiOutlineShoppingBag className="w-4 h-4" />
                    Mahsulotlar
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-white dark:bg-dark-800 text-primary-500 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <HiOutlineClipboardList className="w-4 h-4" />
                    Buyurtmalar
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-30">
                    <LoadingSpinner />
                </div>
            ) : (
                <>
                    {activeTab === 'products' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.length === 0 ? (
                                <div className="col-span-full py-20 text-center opacity-30">
                                    <HiOutlineShoppingBag className="w-20 h-20 mx-auto mb-4" />
                                    <h3 className="text-xl font-black uppercase tracking-widest">Mahsulotlar yo'q</h3>
                                </div>
                            ) : (
                                products.map((product) => (
                                    <div key={product._id} className="bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden group shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                        <div className="relative aspect-video">
                                            <img src={product.rasm} alt={product.nomi} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                                            <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => openEditModal(product)} className="p-3 bg-white dark:bg-dark-900 rounded-[1.2rem] text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-xl">
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(product._id)} className="p-3 bg-white dark:bg-dark-900 rounded-[1.2rem] text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-xl">
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase truncate italic tracking-tight">{product.nomi}</h3>
                                                <span className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${product.holati === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                    {product.holati}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-white/5">
                                                <div className="space-y-1">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Narxi</p>
                                                    <p className="text-lg font-black text-amber-500 tracking-tighter italic">🪙 {product.narxi}</p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Zaxirada</p>
                                                    <p className={`text-lg font-black tracking-tighter italic ${product.soni < 5 ? 'text-red-500' : 'text-primary-500'}`}>{product.soni} ta</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-dark-800 rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-white/5">
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">O'quvchi</th>
                                            <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mahsulot</th>
                                            <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Narxi</th>
                                            <th className="px-6 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sana</th>
                                            <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Holat</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                        {orders.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-20 text-center opacity-30">
                                                    <HiOutlineClipboardList className="w-16 h-16 mx-auto mb-4" />
                                                    <h3 className="text-xl font-black uppercase tracking-widest italic">Buyurtmalar mavjud emas</h3>
                                                </td>
                                            </tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order._id} className="group hover:bg-gray-50 dark:hover:bg-dark-900/50 transition-all">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center font-black text-sm border border-primary-500/20">
                                                                {order.student?.ism?.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight italic">{order.student?.ism}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 italic">{order.student?.telefon}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6">
                                                        <div className="flex items-center gap-3">
                                                            <img src={order.product?.rasm} className="w-10 h-10 rounded-lg object-cover ring-2 ring-gray-100 dark:ring-white/5 shadow-md" alt="" />
                                                            <span className="font-black text-gray-800 dark:text-gray-200 uppercase text-xs tracking-tight italic">{order.product?.nomi}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-6 font-black text-amber-500 italic text-sm">🪙 {order.narxi}</td>
                                                    <td className="px-6 py-6">
                                                        <p className="text-xs font-black text-gray-900 dark:text-white uppercase italic">{new Date(order.createdAt).toLocaleDateString('uz')}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 italic">{new Date(order.createdAt).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm">
                                                            Muvaffaqiyatli
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mahsulot nomi</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all uppercase tracking-tight"
                            value={formData.nomi}
                            onChange={(e) => setFormData({ ...formData, nomi: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Narxi (Coin)</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all italic"
                                value={formData.narxi}
                                onChange={(e) => setFormData({ ...formData, narxi: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Soni (Omborda)</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all italic"
                                value={formData.soni}
                                onChange={(e) => setFormData({ ...formData, soni: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Rasm URL</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all"
                            placeholder="https://example.com/image.jpg"
                            value={formData.rasm}
                            onChange={(e) => setFormData({ ...formData, rasm: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Tavsif</label>
                        <textarea
                            className="w-full bg-gray-50 dark:bg-dark-900/50 border-none rounded-2xl p-4 text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all min-h-[100px]"
                            value={formData.tavsif}
                            onChange={(e) => setFormData({ ...formData, tavsif: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-4 bg-gray-100 dark:bg-dark-900 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-4 bg-primary-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20"
                        >
                            Saqlash
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MarketManager;
