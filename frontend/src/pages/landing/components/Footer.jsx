import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Send, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black pt-20 pb-10 border-t border-white/5 relative z-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl italic">IF</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">
                                INFAST <span className="text-blue-500">ACADEMY</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                            O'zbekistondagi eng innovatsion IT-akademiya. Muhammadaziz Yakubov boshchiligidagi
                            professional jamoa bilan kelajagingizni quring.
                        </p>
                        <div className="flex space-x-4">
                            {[Instagram, Send, Linkedin, Github].map((Icon, i) => (
                                <a key={i} href="#" className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all text-gray-500 border border-white/10">
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Kurslarimiz</h4>
                        <ul className="space-y-4 text-gray-500 font-bold">
                            <li><Link to="/programs" className="hover:text-blue-500 transition-colors">Frontend Architecture</Link></li>
                            <li><Link to="/programs" className="hover:text-blue-500 transition-colors">Backend Engineering</Link></li>
                            <li><Link to="/programs" className="hover:text-blue-500 transition-colors">Product UI/UX Design</Link></li>
                            <li><Link to="/programs" className="hover:text-blue-500 transition-colors">Advanced Python & AI</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Havolalar</h4>
                        <ul className="space-y-4 text-gray-500 font-bold">
                            <li><Link to="/about" className="hover:text-blue-500 transition-colors">Biz haqimizda</Link></li>
                            <li><Link to="/team" className="hover:text-blue-500 transition-colors">Bizning jamoa</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Kontaktlar</Link></li>
                            <li><Link to="/login" className="hover:text-blue-500 transition-colors">Tizimga kirish</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8">Bog'laning</h4>
                        <ul className="space-y-6 text-gray-500 font-bold">
                            <li className="flex items-start space-x-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><MapPin size={18} /></div>
                                <span>Toshkent shahri, Chilonzor tumani</span>
                            </li>
                            <li className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Phone size={18} /></div>
                                <span>+998 90 123 45 67</span>
                            </li>
                            <li className="flex items-center space-x-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500"><Mail size={18} /></div>
                                <span>info@infast.uz</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-gray-600 text-[10px] font-black uppercase tracking-widest">
                    <p>© {new Date().getFullYear()} InFast Academy. Created by M.Yakubov.</p>
                    <div className="flex space-x-8 mt-6 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Maxfiylik siyosati</a>
                        <a href="#" className="hover:text-white transition-colors">Foydalanish shartlari</a>
                        <a href="#" className="hover:text-white transition-colors">Public Offer</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;