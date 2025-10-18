export default function ExplainerVideoSection() {
    const VIMEO_VIDEO_ID = "YOUR_VIMEO_VIDEO_ID_HERE"; // This should be updated by the Operator

    return (
        <section className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl mx-auto text-center space-y-4 md:space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Watch How It Works (90 seconds)</h2>
                <div style={{ padding: '56.25% 0 0 0', position: 'relative' }} className="shadow-lg rounded-2xl overflow-hidden">
                    <iframe
                        src={`https://player.vimeo.com/video/${VIMEO_VIDEO_ID}?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479`}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        title="Disagreement.AI Explainer Video"
                    ></iframe>
                </div>
            </div>
        </section>
    );
}
