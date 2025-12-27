import React from 'react';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Brain, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <Brain className="h-8 w-8 text-indigo-600" />
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                Chaitanya
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-600 hover:text-indigo-600 transition-colors">Home</Link>
                        <Link to="/chat" className="text-gray-600 hover:text-indigo-600 transition-colors">Assessment</Link>
                        <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">Dashboard</Link>

                        <SignedIn>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-sm">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-indigo-600 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top duration-300">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block px-3 py-2 text-gray-600 hover:text-indigo-600">Home</Link>
                        <Link to="/chat" className="block px-3 py-2 text-gray-600 hover:text-indigo-600">Assessment</Link>
                        <Link to="/dashboard" className="block px-3 py-2 text-gray-600 hover:text-indigo-600">Dashboard</Link>
                        <div className="px-3 py-2">
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main className="pt-16">
                {children}
            </main>
            <footer className="bg-gray-50 border-t border-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
                    <p>© 2025 Chaitanya AI. Tailored for Indian Communities.</p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
