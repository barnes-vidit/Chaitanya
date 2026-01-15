

const Footer = () => {
    return (
        <footer className="py-12 bg-[#050505]/80 backdrop-blur-md border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-gray-400 text-sm">
                    © 2025 Chaitanya AI. Empowering minds with care and technology.
                </p>
                <div className="mt-4 flex justify-center items-center gap-2 text-xs text-gray-600 uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full" />
                    Tailored for Indian Communities
                    <span className="w-1.5 h-1.5 bg-blue-900 rounded-full" />
                </div>
            </div>
        </footer>
    );
};

export default Footer;
