import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Instagram, Linkedin, Send, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black pt-20 pb-10 border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-6">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl italic">IF</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">
                                INFAST <span className="text-blue-500">ACADEMY</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            O'zbekistondagi eng innovatsion IT-akademiya. Biz bilan kelajagingizni bugundan quring.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Send size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Kurslar</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/programs" className="hover:text-blue-500 transition-colors">Frontend Development</Link></li>
                            <li><Link to="/programs" className="hover:text-blue-500 transition-colors">Backend Development</Link></li>
                            <li><Link to="/programs" className="hover:text-blue-500 transition-colors">UI/UX Design</Link></li>
                            <li><Link to="/programs" className="hover:text-blue-500 transition-colors">Python & AI</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Sahifalar</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/about" className="hover:text-blue-500 transition-colors">Biz haqimizda</Link></li>
                            <li><Link to="/community-landing" className="hover:text-blue-500 transition-colors">Hamjamiyat</Link></li>
                            <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Kontaktlar</Link></li>
                            <li><Link to="/login" className="hover:text-blue-500 transition-colors">Tizimga kirish</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Kontakt</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li className="flex items-start space-x-3">
                                <MapPin className="text-blue-500 mt-1 flex-shrink-0" size={18} />
                                <span>Toshkent shahri, Chilonzor tumani</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Phone className="text-blue-500 flex-shrink-0" size={18} />
                                <span>+998 90 123 45 67</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <Mail className="text-blue-500 flex-shrink-0" size={18} />
                                <span>info@infast.uz</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} InFast Academy. Barcha huquqlar himoyalangan.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Maxfiylik siyosati</a>
                        <a href="#" className="hover:text-white transition-colors">Foydalanish shartlari</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;