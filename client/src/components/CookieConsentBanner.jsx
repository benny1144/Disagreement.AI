import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function CookieConsentBanner() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if the user has already given consent.
        const consent = localStorage.getItem('cookie_consent_given');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        // Store consent in local storage and hide the banner.
        localStorage.setItem('cookie_consent_given', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 z-50">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-center md:text-left">
                    We use cookies to ensure you get the best experience on our website. By continuing to use our site, you agree to our use of cookies. See our{' '}
                    <Link to="/cookies" className="underline hover:text-gray-200">Cookie Policy</Link>.
                </p>
                <Button 
                    onClick={handleAccept}
                    className="bg-white text-gray-900 hover:bg-gray-200"
                >
                    Accept
                </Button>
            </div>
        </div>
    );
}
