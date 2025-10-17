export default function GlassBoxSection() {
    return (
        <section className="bg-gray-100 py-14 md:py-20">
            <div className="container mx-auto px-4">
                <div className="grid gap-10 md:grid-cols-2 items-center">
                    <div className="space-y-5">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Our Glass Box Philosophy</h2>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            Many AI systems operate as 'black boxes,' leaving you to wonder how they reached a conclusion. We do the opposite. Our '<strong>Glass Box</strong>' philosophy means every decision is transparent and explainable. You can see exactly how conclusions are reached, what factors were considered, and why specific outcomes were recommended, giving you complete confidence in the process.
                        </p>
                    </div>
                    <div className="flex items-center justify-center">
                        <img
                            src="/images/glassbox-ai.webp"
                            alt="AI core in a transparent glass box being observed."
                            className="rounded-2xl shadow-lg transform -rotate-6 w-72 h-72 md:w-80 md:h-80 object-cover"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
