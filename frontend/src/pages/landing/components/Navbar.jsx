import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, Award } from 'lucide-react';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Asosiy', path: '/' },
        { name: 'Kurslar', path: '/programs' },
        { name: 'Jamoa', path: '/team' },
        { name: 'Biz haqimizda', path: '/about' },
        { name: 'Kontakt', path: '/contact' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-black/90 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <span className="text-black font-black text-xl italic">IF</span>
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white">
                        INFAST <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">ACADEMY</span>
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`text-sm font-bold tracking-tight uppercase transition-all hover:text-amber-400 ${isActive(link.path) ? 'text-amber-500' : 'text-zinc-400'}`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link
                        to="/login"
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-black font-black rounded-full transition-all duration-300 flex items-center group shadow-lg shadow-amber-500/10 text-sm tracking-tight"
                    >
                        Kirish
                        <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        className="fixed inset-0 bg-black z-40 md:hidden flex flex-col items-center justify-center p-6"
                    >
                        <button
                            className="absolute top-6 right-6 text-white p-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X size={32} />
                        </button>
                        <div className="flex flex-col space-y-8 text-center w-full max-w-xs">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`text-4xl font-black uppercase tracking-tight ${isActive(link.path) ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500' : 'text-white'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                to="/login"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="w-full py-5 bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-xl font-black rounded-2xl shadow-xl shadow-amber-500/10 uppercase tracking-widest"
                            >
                                Kirish
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
