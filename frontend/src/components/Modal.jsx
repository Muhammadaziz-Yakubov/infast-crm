import { HiOutlineX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 modal-overlay" onClick={onClose} />

            {/* Modal */}
            <div className={`relative w-full ${sizes[size]} bg-white dark:bg-dark-800 rounded-[2.5rem] 
        shadow-2xl modal-content max-h-[90vh] flex flex-col border border-white/10 overflow-hidden`}>
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-white/5">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-2xl hover:bg-gray-200 dark:hover:bg-dark-700 transition-all hover:scale-110 active:scale-95"
                    >
                        <HiOutlineX className="w-5 h-5 text-gray-500 font-black" />
                    </button>
                </div>


                {/* Body */}
                <div className="px-6 py-5 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
