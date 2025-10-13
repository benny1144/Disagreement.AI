export function ProofOfConceptSection() {
  return (
    <section className="py-20 px-6">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-balance">Initial Focus: The Team Harmonizer</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To perfect our platform, we are launching with a specialized vertical for a challenge that demands high
              performance and cohesion: competitive sports. Our 'Team Harmonizer' is being developed with coaches and
              players to help resolve the on-court frictions that impact team chemistry. This real-world pilot program
              is the first step in our mission to build a trusted resolution tool for any disagreement.
            </p>
          </div>

          {/* Right Column - Basketball Court Illustration */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              {/* Court background */}
              <rect width="400" height="400" fill="oklch(0.97 0 0)" />

              {/* Court outline */}
              <rect x="40" y="20" width="320" height="360" fill="none" stroke="oklch(0.556 0 0)" strokeWidth="3" />

              {/* Center circle */}
              <circle cx="200" cy="200" r="60" fill="none" stroke="oklch(0.556 0 0)" strokeWidth="3" />

              {/* Center line */}
              <line x1="40" y1="200" x2="360" y2="200" stroke="oklch(0.556 0 0)" strokeWidth="3" />

              {/* Top key */}
              <rect x="140" y="20" width="120" height="100" fill="none" stroke="oklch(0.556 0 0)" strokeWidth="3" />

              {/* Bottom key */}
              <rect x="140" y="280" width="120" height="100" fill="none" stroke="oklch(0.556 0 0)" strokeWidth="3" />

              {/* Top hoop */}
              <circle cx="200" cy="70" r="8" fill="none" stroke="oklch(0.646 0.222 41.116)" strokeWidth="3" />

              {/* Bottom hoop */}
              <circle cx="200" cy="330" r="8" fill="none" stroke="oklch(0.646 0.222 41.116)" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
