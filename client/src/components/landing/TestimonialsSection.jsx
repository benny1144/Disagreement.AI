import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

export default function TestimonialsSection() {
    return (
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
    );
}
