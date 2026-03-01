import { HiOutlineExclamationCircle } from 'react-icons/hi';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "O'chirish", type = 'danger' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm modal-overlay" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white dark:bg-dark-800 rounded-[2.5rem] shadow-3xl modal-content p-8 md:p-10 border border-white/10">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transform rotate-12 ${type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                        <HiOutlineExclamationCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">{title}</h3>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed px-4">{message}</p>
                    <div className="flex flex-col gap-3 w-full">
                        <button onClick={onConfirm} className={`w-full font-black py-4 px-6 rounded-2xl transition-all uppercase tracking-widest text-xs shadow-xl
              ${type === 'danger' ? 'bg-red-500 text-white shadow-red-500/20' : 'bg-primary-500 text-white shadow-primary-500/20'} active:scale-95`}>
                            {confirmText}
                        </button>
                        <button onClick={onClose} className="w-full py-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors">
                            Bekor qilish
                        </button>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default ConfirmDialog;
