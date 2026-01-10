import React, { useEffect, useRef } from 'react';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { Brain, Heart, Shield } from 'lucide-react';

const LandingPage = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let frameId: number;
        const handleMouseMove = (e: MouseEvent) => {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }

            frameId = requestAnimationFrame(() => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                container.style.setProperty('--mouse-x', `${x}px`);
                container.style.setProperty('--mouse-y', `${y}px`);
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="overflow-hidden"
            style={{
                background: `
                    radial-gradient(
                        circle 600px at var(--mouse-x, -100%) var(--mouse-y, -100%), 
                        rgba(93, 173, 226, 0.12), 
                        transparent 80%
                    ),
                    linear-gradient(to bottom, #EBF5FB, var(--white), #f9f9f9)
                `,
                transition: 'background 0.3s ease-out'
            }}
        >
            {/* Hero Section */}
            <section
                className="relative py-20 overflow-hidden"
                style={{
                    minHeight: '80vh',
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <div className="max-w-7xl px-4 relative z-10 text-center">
                    <h1 className="text-5xl" style={{ fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: '1.1', fontSize: 'clamp(2.5rem, 8vw, 4.5rem)' }}>
                        "Babumoshai, zindagi badi honi chahiye, <br />
                        <span style={{ color: 'var(--primary)' }}>
                            lambi nahi
                        </span>"
                    </h1>
                    <p className="max-w-2xl text-xl" style={{ margin: '0 auto 2.5rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        AI-powered dementia screening tailored for Indian communities.
                        Because every moment of a big life deserves to be remembered.
                    </p>

                    <div className="flex justify-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="accessible-button bg-primary text-white shadow-lg" style={{ padding: '1rem 3rem' }}>
                                    Begin Your Journey
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                to="/chat"
                                className="accessible-button bg-primary text-white shadow-lg"
                                style={{ padding: '1rem 3rem' }}
                            >
                                Start Assessment
                            </Link>
                        </SignedIn>
                    </div>
                </div>

                {/* Decorative elements using new palette */}
                <div className="absolute top-0 left-1/2 w-full h-full" style={{ transform: 'translateX(-50%)', zIndex: '0', pointerEvents: 'none' }}>
                    <div className="absolute animate-blob" style={{ top: '10%', left: '10%', width: '16rem', height: '16rem', backgroundColor: 'var(--support)', borderRadius: '50%', filter: 'blur(64px)', opacity: '0.2' }}></div>
                    <div className="absolute animate-blob animation-delay-2000" style={{ top: '0', right: '10%', width: '16rem', height: '16rem', backgroundColor: 'var(--primary)', borderRadius: '50%', filter: 'blur(64px)', opacity: '0.2' }}></div>
                    <div className="absolute animate-blob animation-delay-4000" style={{ bottom: '-10%', left: '20%', width: '16rem', height: '16rem', backgroundColor: 'var(--secondary)', borderRadius: '50%', filter: 'blur(64px)', opacity: '0.2' }}></div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20" style={{ backgroundColor: 'transparent' }}>
                <div className="max-w-7xl px-4">
                    <div className="text-center" style={{ marginBottom: '4rem' }}>
                        <h2 className="text-3xl" style={{ fontWeight: '700' }}>Designed for Every Indian Home</h2>
                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Advanced technology made simple and accessible.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <FeatureCard
                            icon={<Brain style={{ width: '32px', height: '32px', color: 'var(--primary)' }} />}
                            title="Speech Analysis"
                            description="Detects subtle patterns in speech and pauses during natural Hindi/English conversations."
                            accentColor="var(--primary)"
                        />
                        <FeatureCard
                            icon={<Heart style={{ width: '32px', height: '32px', color: 'var(--support)' }} />}
                            title="Culturally Relevant"
                            description="Tailored tasks and games designed specifically for Indian cultural contexts."
                            accentColor="var(--support)"
                        />
                        <FeatureCard
                            icon={<Shield style={{ width: '32px', height: '32px', color: 'var(--secondary)' }} />}
                            title="Secure & Private"
                            description="Your data is encrypted and protected, focused on patient and caregiver privacy."
                            accentColor="var(--secondary)"
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, accentColor }: { icon: React.ReactNode, title: string, description: string, accentColor: string }) => (
    <div
        className="rounded-2xl"
        style={{
            padding: '2.5rem',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            cursor: 'default',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
            e.currentTarget.style.transform = 'translateY(-8px)';
            e.currentTarget.style.boxShadow = `0 20px 25px -5px ${accentColor}15, 0 8px 10px -6px ${accentColor}10`;
            e.currentTarget.style.borderColor = accentColor;
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }}
    >
        <div style={{ width: '4rem', height: '4rem', backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.3)' }}>
            <div className="flex justify-center w-full">{icon}</div>
        </div>
        <h3 className="text-xl" style={{ marginBottom: '1rem', fontWeight: '700' }}>{title}</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '1.05rem' }}>{description}</p>
    </div>
);

export default LandingPage;
