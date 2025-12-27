import { Brain, Heart, Shield } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="overflow-hidden">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-indigo-50/50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
                            Empowering Minds, <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                Preserving Memories
                            </span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10">
                            AI-powered dementia screening tailored for Indian communities.
                            Simple conversations for early detection and better care.
                        </p>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-0">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-0 right-10 w-64 h-64 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Designed for Every Indian Home</h2>
                        <p className="mt-4 text-gray-600">Advanced technology made simple and accessible.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Brain className="w-8 h-8 text-indigo-600" />}
                            title="Speech Analysis"
                            description="Detects subtle patterns in speech and pauses during natural Hindi/English conversations."
                        />
                        <FeatureCard
                            icon={<Heart className="w-8 h-8 text-pink-600" />}
                            title="Culturally Relevant"
                            description="Tailored tasks and games designed specifically for Indian cultural contexts."
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-green-600" />}
                            title="Secure & Private"
                            description="Your data is encrypted and protected, focused on patient and caregiver privacy."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="p-8 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all group">
        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

export default LandingPage;
