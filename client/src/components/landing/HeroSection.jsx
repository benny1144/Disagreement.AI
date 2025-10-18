import { Button } from "@/components/ui/button";

export default function HeroSection() {
    return (
        <section className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-6">
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight text-balance">
                    Resolve Disagreements in Minutes, Not Months.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed md:text-left">
                    <strong>From Conflict To Clarity</strong>. AI-powered dispute resolution that's fair, fast, and transparent. Join the future of conflict resolution.
                </p>
                <a href="/register" className="block mt-6">
                    <Button size="lg" className="bg-[#5D5FEF] hover:bg-[#4D4FDF] text-white rounded-full px-8 py-6 text-lg">
                        Sign Up Now For FREE
                    </Button>
                </a>
            </div>
        </section>
    );
}
