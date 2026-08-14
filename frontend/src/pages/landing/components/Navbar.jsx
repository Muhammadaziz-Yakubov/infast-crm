import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, ChevronRight } from 'lucide-react';

const Navbar = ({ onOpenEnrollment }) => {
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
    { name: 'Kurslar', href: '#courses' },
    { name: 'Akademiya', href: '#academy' },
    { name: 'Natijalar', href: '#results' },
    { name: 'Ustozlar', href: '#mentors' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleNavClick = (e, href) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 py-3.5 shadow-2xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#FF6A00] flex items-center justify-center font-black text-black text-sm tracking-tighter shadow-md shadow-[#FF6A00]/20 group-hover:scale-105 transition-transform">
            IF
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-extrabold tracking-tight text-white">
              INFAST
            </span>
            <span className="text-[10px] font-semibold tracking-widest text-[#FF6A00] uppercase px-1.5 py-0.5 rounded bg-[#FF6A00]/10 border border-[#FF6A00]/20">
              ACADEMY
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Desktop Right CTA */}
        <div className="hidden md:flex items-center space-x-5">
          <Link
            to="/login"
            className="text-sm font-medium text-zinc-300 hover:text-white transition-colors py-2 px-3"
          >
            Kirish
          </Link>
          <button
            onClick={() => onOpenEnrollment()}
            className="btn-brand-orange text-sm font-medium px-5 py-2.5 rounded-full flex items-center gap-1.5 group"
          >
            <span>Kursga yozilish</span>
            <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-zinc-300 hover:text-white p-2"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-[65px] bg-[#0A0A0A]/95 backdrop-blur-2xl border-b border-white/10 p-6 shadow-2xl flex flex-col space-y-5"
          >
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-lg font-medium text-zinc-300 hover:text-[#FF6A00] transition-colors py-1"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-3 text-zinc-300 font-medium hover:text-white rounded-xl bg-white/5 border border-white/10"
              >
                Kirish (Kabinet)
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenEnrollment();
                }}
                className="w-full btn-brand-orange py-3.5 font-medium text-center justify-center"
              >
                Kursga yozilish →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
