import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineShoppingBag, HiOutlineClipboardList } from 'react-icons/hi';

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

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] tracking-tight">Market boshqaruvi</h1>
                    <p className="text-sm text-[#6B6B6B] dark:text-[#8A8A8A] mt-1 font-medium">Mahsulotlarni va buyurtmalarni nazorat qilish</p>
                </div>

                {activeTab === 'products' && (
                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setFormData({ nomi: '', tavsif: '', narxi: '', rasm: '', soni: '', holati: 'active' });
                            setIsModalOpen(true);
                        }}
                        className="btn-primary flex items-center gap-2"
                    >
                        <HiOutlinePlus className="w-4 h-4" />
                        <span>Yangi mahsulot</span>
                    </button>
                )}
            </div>

            {/* Premium Tabs */}
            <div className="flex gap-2 p-1 bg-zinc-50 dark:bg-zinc-900 rounded-lg w-fit border border-zinc-200 dark:border-zinc-800">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'products' ? 'bg-white dark:bg-zinc-800 text-[#0066FF] shadow-sm' : 'text-zinc-500 hover:text-zinc-750'}`}
                >
                    <HiOutlineShoppingBag className="w-4 h-4" />
                    <span>Mahsulotlar</span>
                </button>
                <button
                    onClick={() => setActiveTab('orders')}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'orders' ? 'bg-white dark:bg-zinc-800 text-[#0066FF] shadow-sm' : 'text-zinc-500 hover:text-zinc-750'}`}
                >
                    <HiOutlineClipboardList className="w-4 h-4" />
                    <span>Buyurtmalar</span>
                </button>
            </div>

            {activeTab === 'products' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-zinc-400">
                            <HiOutlineShoppingBag className="w-12 h-12 mx-auto mb-2" />
                            <h3 className="text-sm font-semibold">Mahsulotlar mavjud emas</h3>
                        </div>
                    ) : (
                        products.map((product) => (
                            <div key={product._id} className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 overflow-hidden flex flex-col justify-between">
                                <div>
                                    <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-900">
                                        <img src={product.rasm} alt={product.nomi} className="w-full h-full object-cover" />
                                        <div className="absolute top-3 right-3 flex gap-1.5">
                                            <button onClick={() => openEditModal(product)} className="p-1.5 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-850 rounded text-zinc-500 hover:text-[#0066FF] transition-all shadow-sm">
                                                <HiOutlinePencil className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(product._id)} className="p-1.5 bg-white/95 dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-850 rounded text-zinc-500 hover:text-[#FF3B30] transition-all shadow-sm">
                                                <HiOutlineTrash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.nomi}</h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${product.holati === 'active' ? 'bg-[#00C853]/10 text-[#00C853] border-[#00C853]/20' : 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20'}`}>
                                                {product.holati}
                                            </span>
                                        </div>
                                        {product.tavsif && (
                                            <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{product.tavsif}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="p-5 pt-0">
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-900/40">
                                        <div>
                                            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Narxi</span>
                                            <span className="text-sm font-bold text-[#FF9500] block mt-0.5">🪙 {product.narxi}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Zaxirada</span>
                                            <span className={`text-sm font-bold block mt-0.5 ${product.soni < 5 ? 'text-[#FF3B30]' : 'text-gray-900 dark:text-white'}`}>{product.soni} ta</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-[#111111] rounded-xl border border-gray-150 dark:border-zinc-900/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-150 dark:border-zinc-900/60">
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">O'quvchi</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Mahsulot</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Narxi</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider">Sana</th>
                                    <th className="px-6 py-4 text-xs font-medium text-zinc-400 uppercase tracking-wider text-right">Holat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-150 dark:divide-zinc-900/60">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center text-zinc-400">
                                            <HiOutlineClipboardList className="w-10 h-10 mx-auto mb-2" />
                                            <p className="text-xs font-semibold">Buyurtmalar mavjud emas</p>
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50/30 dark:hover:bg-zinc-900/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-zinc-150 dark:bg-zinc-800 flex items-center justify-center font-semibold text-xs text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 uppercase">
                                                        {order.student?.ism?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.student?.ism}</p>
                                                        <p className="text-xs text-zinc-400">{order.student?.telefon}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {order.product?.rasm && (
                                                        <img src={order.product?.rasm} className="w-8 h-8 rounded object-cover border border-zinc-200 dark:border-zinc-850" alt="" />
                                                    )}
                                                    <span className="text-xs font-semibold text-gray-800 dark:text-zinc-200">{order.product?.nomi}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-[#FF9500]">🪙 {order.narxi}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-xs text-gray-900 dark:text-white font-semibold">{new Date(order.createdAt).toLocaleDateString('uz')}</p>
                                                <p className="text-[10px] text-zinc-400 mt-0.5">{new Date(order.createdAt).toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#00C853]/10 text-[#00C853] border border-[#00C853]/20">
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

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Mahsulot nomi</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold"
                            value={formData.nomi}
                            onChange={(e) => setFormData({ ...formData, nomi: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Narxi (Coin)</label>
                            <input
                                type="number"
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-bold"
                                value={formData.narxi}
                                onChange={(e) => setFormData({ ...formData, narxi: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Soni (Omborda)</label>
                            <input
                                type="number"
                                required
                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-bold"
                                value={formData.soni}
                                onChange={(e) => setFormData({ ...formData, soni: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Rasm URL</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold"
                            placeholder="https://example.com/image.jpg"
                            value={formData.rasm}
                            onChange={(e) => setFormData({ ...formData, rasm: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tavsif</label>
                        <textarea
                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 focus:border-[#0066FF] outline-none text-sm font-semibold min-h-[80px]"
                            value={formData.tavsif}
                            onChange={(e) => setFormData({ ...formData, tavsif: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-zinc-900/60">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Bekor qilish</button>
                        <button type="submit" className="btn-primary">Saqlash</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MarketManager;
