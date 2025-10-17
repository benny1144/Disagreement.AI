import { Play } from "lucide-react";

export default function ExplainerVideoSection() {
    return (
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
    );
}
