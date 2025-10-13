import { Eye, Shield, Scale } from "lucide-react";

export function GuaranteeSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-balance">
          The Trust Protocol: Our Glass Box Guarantee
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Column 1: Visible Transparency */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-4 rounded-full bg-primary/10">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Visible Transparency</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our AI explains its reasoning in real-time. You will never have to wonder why a suggestion was made,
              giving you complete control over the process.
            </p>
          </div>

          {/* Column 2: Guaranteed Privacy */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-4 rounded-full bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Guaranteed Privacy</h3>
            <p className="text-muted-foreground leading-relaxed">
              Your sensitive data is yours. We have a strict, non-negotiable policy to permanently delete all case data
              120 days after resolution.
            </p>
          </div>

          {/* Column 3: Verifiable Fairness */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 p-4 rounded-full bg-primary/10">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Verifiable Fairness</h3>
            <p className="text-muted-foreground leading-relaxed">
              Our models are trained on principles of mediation and fairness, never on other users' private data. This
              ensures our AI remains an impartial third party.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
