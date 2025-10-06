import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, FileText, Brain, Handshake, Quote, Eye, Zap, ShieldCheck } from "lucide-react"
import PublicHeader from "@/components/layout/PublicHeader"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicHeader />
            {/* Hero Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6 md:gap-8">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                        Resolve Disagreements in Minutes, Not Months.
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                        <strong>From Conflict To Clarity</strong>. AI-powered dispute resolution that's fair, fast, and transparent. Join the future of conflict resolution.
                    </p>
                    <a href="/register" className="block mt-8 md:mt-12">
                        <Button size="lg" className="bg-[#5D5FEF] hover:bg-[#4D4FDF] text-white rounded-full px-8 py-6 text-lg">
                            Sign Up Now For FREE
                        </Button>
                    </a>
                </div>
            </section>

            {/* Explainer Video Section */}
            <section className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-4xl mx-auto text-center space-y-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">Watch How It Works (90 seconds)</h2>
                    <div className="relative w-full aspect-video bg-gray-100 rounded-2xl flex items-center justify-center shadow-lg">
                        <div className="w-20 h-20 bg-[#5D5FEF] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#4D4FDF] transition-colors">
                            <Play className="w-10 h-10 text-white fill-white ml-1" />
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section (moved under video, no header) */}
            <section id="how-it-works" className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="p-6 space-y-4 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-[#5D5FEF]/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-8 h-8 text-[#5D5FEF]" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">1. Submit Your Case</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Upload your dispute details and relevant documents. Our platform guides you through a simple, structured
                            process.
                        </p>
                    </Card>

                    <Card className="p-6 space-y-4 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-[#5D5FEF]/10 rounded-lg flex items-center justify-center">
                            <Brain className="w-8 h-8 text-[#5D5FEF]" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">2. Detailed AI Analysis</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Our transparent AI reviews both sides, identifies key issues, and applies relevant precedents and
                            principles.
                        </p>
                    </Card>

                    <Card className="p-6 space-y-4 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-14 h-14 bg-[#5D5FEF]/10 rounded-lg flex items-center justify-center">
                            <Handshake className="w-8 h-8 text-[#5D5FEF]" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground">3. Fair Resolution</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            Receive a detailed, unbiased resolution with clear reasoning. Both parties can review and accept the
                            outcome.
                        </p>
                    </Card>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className="bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 opacity-40">
                        <span className="text-xl font-semibold italic text-gray-600">Tech Chronicle</span>
                        <span aria-hidden="true" className="inline-block mx-3 h-5 w-px bg-gray-800"></span>
                        <span className="text-xl font-semibold italic text-gray-600">The Modern Freelancer</span>
                        <span aria-hidden="true" className="inline-block mx-3 h-5 w-px bg-gray-800"></span>
                        <span className="text-xl font-semibold italic text-gray-600">Business Insider</span>
                        <span aria-hidden="true" className="inline-block mx-3 h-5 w-px bg-gray-800"></span>
                        <span className="text-xl font-semibold italic text-gray-600">Digital Today</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-12 md:py-16">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 text-foreground">Features</h2>
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="p-6 space-y-3 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#5D5FEF]/10 text-[#5D5FEF] rounded-md flex items-center justify-center">
                                <Eye className="w-4 h-4" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Transparent AI</h3>
                        </div>
                        <p className="text-muted-foreground">Every decision includes a clear reasoning trail you can review.</p>
                    </Card>
                    <Card className="p-6 space-y-3 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#5D5FEF]/10 text-[#5D5FEF] rounded-md flex items-center justify-center">
                                <Zap className="w-4 h-4" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Fast Resolution</h3>
                        </div>
                        <p className="text-muted-foreground">Settle most disputes in days, not months.</p>
                    </Card>
                    <Card className="p-6 space-y-3 border-gray-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#5D5FEF]/10 text-[#5D5FEF] rounded-md flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground">Built for Trust</h3>
                        </div>
                        <p className="text-muted-foreground">Privacy-first approach with a 120-day data deletion policy.</p>
                    </Card>
                </div>
            </section>

            {/* Glass Box Section */}
            <section className="bg-gray-100 py-14 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="grid gap-10 md:grid-cols-2 items-center">
                        <div className="space-y-5">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Our Glass Box Philosophy</h2>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                Many AI systems operate as 'black boxes,' leaving you to wonder how they reached a conclusion. We do the opposite. Our '<strong>Glass Box</strong>' philosophy means every decision is transparent and explainable. You can see exactly how conclusions are reached, what factors were considered, and why specific outcomes were recommended, giving you complete confidence in the process.
                            </p>
                        </div>
                        <div className="flex items-center justify-center">
                            <img
                                src="/images/glassbox-ai.webp"
                                alt="AI core in a transparent glass box being observed."
                                className="rounded-2xl shadow-lg transform -rotate-6 w-72 h-72 md:w-80 md:h-80 object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Perfect For / Use Cases Section (moved below Glass Box) */}
            <section className="bg-slate-50 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Designed for Any Disagreement</h2>
                        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                            Our platform is built to handle conflicts of all shapes and sizes, providing a fair and structured path to
                            resolution for everyone.
                        </p>
                    </div>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-4">
                        {["Freelancers & Clients","Small Businesses","Landlords & Tenants","Teachers & Students","Coaches & Athletes","Structured Debates","...and countless more."].map((useCase) => (
                            <span
                                key={useCase}
                                className="rounded-full bg-[#5D5FEF]/10 px-4 py-2 text-sm font-semibold leading-6 text-[#5D5FEF]"
                            >
                                {useCase}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="container mx-auto px-4 py-16 md:py-24">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">What Our Users Say...</h2>
                <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
                    <Card className="p-8 space-y-4 border-gray-200 shadow-sm">
                        <Quote className="w-10 h-10 text-[#5D5FEF]" />
                        <p className="text-lg italic text-foreground leading-relaxed">
                            "I was amazed at how quickly we reached a fair resolution. What would have taken months in traditional
                            arbitration was done in days. The transparency gave me confidence in the outcome."
                        </p>
                        <div className="pt-4">
                            <p className="font-bold text-foreground">Sarah J.</p>
                            <p className="text-sm text-muted-foreground">Freelance Developer</p>
                        </div>
                    </Card>

                    <Card className="p-8 space-y-4 border-gray-200 shadow-sm">
                        <Quote className="w-10 h-10 text-[#5D5FEF]" />
                        <p className="text-lg italic text-foreground leading-relaxed">
                            "As a small business owner, I can't afford lengthy legal battles. Disagreement.AI gave me a fair,
                            affordable way to resolve a contract dispute. Highly recommended!"
                        </p>
                        <div className="pt-4">
                            <p className="font-bold text-foreground">Michael Chen</p>
                            <p className="text-sm text-muted-foreground">Small Business Owner</p>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="bg-[#5D5FEF] py-16 md:py-20">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-balance">
                        Ready for a better way to resolve your disputes?
                    </h2>
                    <a href="/register" className="block mt-8 md:mt-12">
                        <Button
                            size="lg"
                            className="bg-white text-[#5D5FEF] hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-semibold"
                        >
                            Sign Up Now For FREE
                        </Button>
                    </a>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid gap-8 md:grid-cols-4">
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-white">DIS<span style={{ color: '#5D5FEF' }}>AGREEMENT</span>.AI</h3>
                            <p className="text-sm leading-relaxed">From Conflict To Clarity. Fair, fast, and transparent dispute resolution powered by AI.</p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Product</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#how-it-works" className="hover:text-white transition-colors">
                                        How It Works
                                    </a>
                                </li>
                                <li>
                                    <a href="/pricing" className="hover:text-white transition-colors">
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a href="/faq" className="hover:text-white transition-colors">
                                        FAQ
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Company</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="/about" className="hover:text-white transition-colors">
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a href="/blog" className="hover:text-white transition-colors">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="/contact" className="hover:text-white transition-colors">
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-white">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="/privacy" className="hover:text-white transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="/terms" className="hover:text-white transition-colors">
                                        Terms of Service
                                    </a>
                                </li>
                                <li>
                                    <a href="/cookies" className="hover:text-white transition-colors">
                                        Cookie Policy
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
                        <p>&copy; 2025 Disagreement.AI - All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
