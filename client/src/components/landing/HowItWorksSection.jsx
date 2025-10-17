import { Card } from "@/components/ui/card";
import { FileText, Brain, Handshake } from "lucide-react";

export default function HowItWorksSection() {
    return (
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
    );
}
