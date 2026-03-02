import { useState, useEffect } from 'react';
import { marketAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlinePhotograph, HiOutlineShoppingBag } from 'react-icons/hi';

const MarketManager = () => {
    const [products, setProducts] = useState([]);
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
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await marketAPI.getProducts();
            setProducts(res.data.data);
        } catch (err) {
            toast.error('Mahsulotlarni yuklashda xatolik');
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
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">Market <span className="text-primary-500">Boshqaruvi</span></h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Mahsulotlarni qo'shish va tahrirlash</p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({ nomi: '', tavsif: '', narxi: '', rasm: '', soni: '', holati: 'active' });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                >
                    <HiOutlinePlus className="w-5 h-5" />
                    Yangi mahsulot
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-white text-xs">
                {products.map((product) => (
                    <div key={product._id} className="bg-white dark:bg-dark-800 rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500">
                        <div className="relative aspect-video">
                            <img src={product.rasm} alt={product.nomi} className="w-full h-full object-cover" />
                            <div className="absolute top-3 right-3 flex gap-2">
                                <button onClick={() => openEditModal(product)} className="p-2 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md rounded-xl text-blue-500 hover:scale-110 transition-transform shadow-lg">
                                    <HiOutlinePencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(product._id)} className="p-2 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md rounded-xl text-red-500 hover:scale-110 transition-transform shadow-lg">
                                    <HiOutlineTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-black text-gray-900 dark:text-white uppercase truncate italic">{product.nomi}</h3>
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${product.holati === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                    {product.holati}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase text-gray-400">
                                <span>Narxi: <span className="text-amber-500 italic">🪙 {product.narxi}</span></span>
                                <span>Soni: <span className="text-primary-500 italic">{product.soni} ta</span></span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
