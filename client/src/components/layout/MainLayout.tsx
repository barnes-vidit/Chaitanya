import React from 'react';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Brain, Menu, X } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white" style={{ top: 0, left: 0, backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(12px)' }}>
            <div className="max-w-7xl px-4" style={{ margin: '0 auto' }}>
                <div className="flex justify-between items-center" style={{ height: '64px' }}>
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <Brain style={{ height: '32px', width: '32px', color: 'var(--primary)' }} />
                            <span className="text-xl" style={{ fontWeight: '800', background: 'linear-gradient(to right, var(--primary), #8E44AD)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Chaitanya
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="flex items-center gap-8" style={{ display: 'none' }} id="desktop-menu">
                        <Link to="/" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Home</Link>

                        <SignedIn>
                            <Link to="/chat" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Assessment</Link>
                            <Link to="/dashboard" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Dashboard</Link>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="accessible-button bg-primary text-white" style={{ padding: '0.5rem 1.25rem', fontSize: '1rem' }}>
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                    </div>
                    <style dangerouslySetInnerHTML={{
                        __html: `
            @media (min-width: 768px) {
              #desktop-menu { display: flex !important; }
              #mobile-toggle { display: none !important; }
            }
          ` }} />

                    {/* Mobile menu button */}
                    <div id="mobile-toggle" className="flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                            {isOpen ? <X style={{ height: '24px', width: '24px' }} /> : <Menu style={{ height: '24px', width: '24px' }} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="bg-white border-b" style={{ padding: '0.5rem 1rem' }}>
                    <div className="flex flex-col gap-2">
                        <div style={{ padding: '0.75rem' }}>
                            <SignedIn>
                                <div className="flex flex-col gap-2">
                                    <Link to="/chat" style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Assessment</Link>
                                    <Link to="/dashboard" style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>Dashboard</Link>
                                    <div style={{ padding: '0.75rem' }}>
                                        <UserButton afterSignOutUrl="/" />
                                    </div>
                                </div>
                            </SignedIn>
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="accessible-button bg-primary text-white w-full">
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: '1', paddingTop: '64px' }}>
                {children}
            </main>
            <footer style={{ backgroundColor: 'rgba(250, 250, 250, 0.5)', padding: '3rem 1rem', backdropFilter: 'blur(8px)' }}>
                <div className="max-w-7xl text-center" style={{ margin: '0 auto' }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        © 2025 Chaitanya AI. Empowering minds with care and technology.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Tailored for Indian Communities.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
