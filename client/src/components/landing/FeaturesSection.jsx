import { Card } from "@/components/ui/card";
import { Eye, Zap, ShieldCheck } from "lucide-react";

export default function FeaturesSection() {
    return (
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
    );
}
