import { Button } from "@/components/ui/button";

export default function FinalCTASection() {
    return (
        <section className="bg-[#5D5FEF] py-16 md:py-20">
            <div className="container mx-auto px-4 text-center space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white text-balance">
                    Ready for a better way to resolve your disputes?
                </h2>
                <a href="/signup" className="block mt-6">
                    <Button size="lg" className="bg-white text-[#5D5FEF] hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-semibold">
                        Sign Up Now For FREE
                    </Button>
                </a>
            </div>
        </section>
    );
}
