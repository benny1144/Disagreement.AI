export default function Footer() {
    return (
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
    );
}
