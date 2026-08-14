import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Send, Instagram, MapPin, ArrowUpRight } from 'lucide-react';

const Footer = ({ onOpenEnrollment }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#050505] text-zinc-400 border-t border-white/5 pt-20 pb-12 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#FF6A00]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF6A00] flex items-center justify-center font-black text-black text-sm tracking-tighter">
                IF
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                INFAST <span className="text-[#FF6A00]">ACADEMY</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm">
              InFast IT-Academy — zamonaviy IT kasblarini amaliyot va real loyihalar orqali o‘rgatadigan zamonaviy ta'lim akademiyasi.
            </p>
          </div>

          {/* Nav Links Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Navigatsiya</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#courses" className="hover:text-white transition-colors">Kurslar</a>
              </li>
              <li>
                <a href="#academy" className="hover:text-white transition-colors">Akademiya</a>
              </li>
              <li>
                <a href="#results" className="hover:text-white transition-colors">Natijalar</a>
              </li>
              <li>
                <a href="#mentors" className="hover:text-white transition-colors">Ustozlar</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Bog'lanish</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2 text-zinc-300">
                <Phone size={16} className="text-[#FF6A00]" />
                <span>+998 90 271 00 27</span>
              </li>
              <li className="flex items-center gap-2">
                <Send size={16} className="text-[#FF6A00]" />
                <a href="https://t.me/infast_academy" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  @infast_academy
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Instagram size={16} className="text-[#FF6A00]" />
                <a href="https://instagram.com/infast_academy" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  @infast.academy
                </a>
              </li>
              <li className="flex items-start gap-2 text-xs leading-relaxed text-zinc-500 pt-1">
                <MapPin size={16} className="text-[#FF6A00] shrink-0 mt-0.5" />
                <span>Andijon viloyati, Buloqboshi tumani, Yangi hokimiyat binosi 3-qavat</span>
              </li>
            </ul>
          </div>

          {/* Quick CTA Col */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">IT Sohasini Boshlang</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Bepul sinov darsida qatnashing va o'zingizga mos dasturlash yo'nalishini tanlang.
            </p>
            <button
              onClick={() => onOpenEnrollment && onOpenEnrollment()}
              className="btn-brand-orange text-xs font-semibold px-5 py-3 w-full justify-center"
            >
              Kursga yozilish →
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-600 gap-4">
          <p>© {currentYear} InFast IT-Academy. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center space-x-6">
            <Link to="/login" className="hover:text-zinc-400 transition-colors">Talabalar kabineti</Link>
            <span>•</span>
            <span className="text-zinc-600">Uzbekistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;