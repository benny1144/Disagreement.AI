import { Link } from 'react-router-dom';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/landing/Footer';

export default function CookiePolicyPage() {
    return (
        <div className="min-h-screen bg-white font-sans">
            <PublicHeader />
            <main className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
                <div className="space-y-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">Cookie Policy</h1>
                    <p className="text-sm text-muted-foreground">Last updated: October 17, 2025</p>

                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Disagreement.AI ("us", "we", or "our") uses cookies on our website (the "Service"). By using the Service, you consent to the use of cookies. This Cookie Policy explains what cookies are, how we use them, and your choices regarding cookies.
                    </p>

                    <div className="space-y-4 pt-4">
                        <h2 className="text-2xl font-bold text-foreground">What are cookies?</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            A cookie is a small piece of text sent to your web browser by a website you visit. A cookie file is stored in your web browser and allows the Service or a third-party to recognize you and make your next visit easier and the Service more useful to you.
                        </p>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                        <h2 className="text-2xl font-bold text-foreground">How we use cookies</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            When you use and access the Service, we may place a number of cookie files in your web browser. We use cookies for the following purposes:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>To enable certain functions of the Service.</li>
                            <li>To provide analytics.</li>
                            <li>To store your preferences.</li>
                        </ul>
                         <p className="text-muted-foreground leading-relaxed">
                           We use essential cookies to authenticate users and prevent fraudulent use of user accounts. For analytics, we may use third-party services like Google Analytics to track and report website traffic.
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        <h2 className="text-2xl font-bold text-foreground">Your choices regarding cookies</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser. Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer, you may not be able to store your preferences, and some of our pages might not display properly.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
