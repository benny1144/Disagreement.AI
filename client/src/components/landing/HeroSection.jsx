import { Button } from "@/components/ui/button";

const VIMEO_VIDEO_ID = "YOUR_VIMEO_VIDEO_ID_HERE"; // Replace with actual ID when available

export default function HeroSection() {
    return (
        <section className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
                {/* 1. Headline */}
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance">
                    From Conflict To Clarity
                </h1>
                {/* 2. Tagline */}
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed md:text-left">
                    Settle disagreements without the bias. Our AI is fast, transparent, and fundamentally fair. Join the resolution revolution.
                </p>
                {/* 3. Responsive Vimeo video */}
                <div style={{ padding: '56.25% 0 0 0', position: 'relative' }} className="w-full rounded-2xl overflow-hidden shadow">
                    <iframe
                        src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?badge=0&autopause=0&player_id=0&app_id=58479`}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        title="Disagreement.AI Explainer Video"
                    ></iframe>
                </div>
                {/* 4. Primary CTA */}
                <a href="/register" className="block mt-2 md:mt-4">
                    <Button size="lg" className="bg-[#5D5FEF] hover:bg-[#4D4FDF] text-white rounded-full px-8 py-6 text-lg">
                        Sign Up Now For FREE
                    </Button>
                </a>
            </div>
        </section>
    );
}
