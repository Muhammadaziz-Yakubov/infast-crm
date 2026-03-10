import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const LandingLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500 selection:text-white overflow-x-hidden">
            <Navbar />
            <main>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default LandingLayout;
