import React, { useState, useEffect } from 'react';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../common/Logo';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20); // Lower threshold for faster reaction
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-300"
        >
            <div
                className={`w-full max-w-7xl rounded-full transition-all duration-500 ease-out flex justify-between items-center py-4 px-6 border shadow-lg
                ${scrolled || !isHome
                        ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-white/10'
                        : 'bg-transparent border-transparent'
                    }`}
            >
                {/* Logo Section */}
                <div className="flex items-center">
                    <Link to="/" className="flex items-center gap-2 group relative z-10">
                        {/* Glow effect behind logo */}
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Logo className="text-2xl text-white group-hover:scale-105 transition-transform" layoutIdPrefix="chaitanya-logo" />
                    </Link>
                </div>

                {/* Desktop Menu - Centered links if we wanted, but keeping right aligned for standard feel */}
                <div className="hidden md:flex items-center gap-8">
                    {['Home', 'Assessment', 'Dashboard'].map((item) => {
                        let path;
                        if (item === 'Home') path = '/';
                        else if (item === 'Assessment') path = '/chat';
                        else path = `/${item.toLowerCase()}`;
                        if (item !== 'Home' && item !== 'Assessment' && item !== 'Dashboard') return null; // Safety

                        // Conditional rendering for auth routes
                        if ((item === 'Assessment' || item === 'Dashboard')) {
                            return (
                                <SignedIn key={item}>
                                    <Link
                                        to={path}
                                        className="relative text-gray-100 hover:text-white font-medium text-sm tracking-wide transition-colors group"
                                    >
                                        {item}
                                        <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-blue-400 transition-all duration-300 group-hover:w-full" />
                                    </Link>
                                </SignedIn>
                            );
                        }

                        return (
                            <Link
                                key={item}
                                to={path}
                                className="relative text-gray-100 hover:text-white font-medium text-sm tracking-wide transition-colors group"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-blue-400 transition-all duration-300 group-hover:w-full" />
                            </Link>
                        );
                    })}

                    <div className="flex items-center gap-4 pl-4 border-l border-white/10">
                        <SignedIn>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 border-2 border-white/10 hover:border-blue-400/50 transition-colors"
                                    }
                                }}
                            />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white hover:text-black transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`
                fixed inset-x-0 top-[64px] md:hidden bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden transition-all duration-300 origin-top
                ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}
            `}>
                <div className="flex flex-col p-4 gap-2">
                    <Link to="/" onClick={() => setIsOpen(false)} className="p-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all hover:pl-6">Home</Link>
                    <SignedIn>
                        <Link to="/chat" onClick={() => setIsOpen(false)} className="p-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all hover:pl-6">Assessment</Link>
                        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="p-3 text-gray-300 hover:bg-white/5 rounded-xl transition-all hover:pl-6">Dashboard</Link>
                        <div className="p-3 border-t border-white/10 mt-2">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </SignedIn>
                    <SignedOut>
                        <div className="p-3">
                            <SignInButton mode="modal">
                                <button className="w-full p-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </div>
                    </SignedOut>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
