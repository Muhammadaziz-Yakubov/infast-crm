const LoadingSpinner = ({ size = 'md', text = "Ma'lumotlar yuklanmoqda..." }) => {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center p-20 gap-6 animate-fade-in">
            <div className="relative group">
                {/* Outer Ring */}
                <div className={`${sizes[size]} rounded-[1.5rem] border-4 border-primary-500/10 dark:border-primary-500/5 rotate-45 group-hover:rotate-90 transition-transform duration-700`} />

                {/* Spinning Rings */}
                <div className={`${sizes[size]} rounded-[1.5rem] border-4 border-transparent border-t-primary-500 border-r-primary-500/30 
                    animate-spin absolute inset-0 shadow-xl shadow-primary-500/20`}
                />

                {/* Core Dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                </div>
            </div>

            {text && (
                <div className="flex flex-col items-center gap-1">
                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-[0.3em] italic">{text}</p>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-primary-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 rounded-full bg-primary-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 rounded-full bg-primary-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                </div>
            )}
        </div>
    );
};


export default LoadingSpinner;
