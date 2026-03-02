import { HiOutlineX } from 'react-icons/hi';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    // Modal ochiqligida body scrollini to'xtatish
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
            {/* Fon (Overlay) - Butun ekranni qoplaydi */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className={`
                relative w-full ${sizes[size]} 
                bg-white dark:bg-dark-800 rounded-[2rem] md:rounded-[2.5rem]
                shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] 
                flex flex-col 
                max-h-[85vh] sm:max-h-[90vh]
                border border-white/10
                animate-scale-in
                z-[10000]
            `}>
                {/* Header - Qotib turadi (Shrink-0) */}
                <div className="flex items-center justify-between px-6 py-5 md:px-8 md:py-6 bg-gray-50/50 dark:bg-dark-900/50 border-b border-gray-100 dark:border-white/5 shrink-0">
                    <h2 className="text-lg md:text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight italic truncate">
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-all hover:scale-110 active:scale-95 text-gray-500 shrink-0"
                    >
                        <HiOutlineX className="w-5 h-5 font-black" />
                    </button>
                </div>

                {/* Body - Scroll bo'ladigan qism */}
                <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.getElementById('modal-root'));
};

export default Modal;
