// client/src/components/landing/HowItWorksSection.tsx

export function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "State Your Case",
      description: "Confidentially describe your side of the story in our secure, chat-based environment.",
    },
    {
      number: "2",
      title: "AI-Assisted Mediation",
      description: "Our neutral AI mediator asks clarifying questions, identifies key issues, and helps you find common ground.",
    },
    {
      number: "3",
      title: "Reach Agreement",
      description: "Finalize your resolution. The platform generates a simple, clear agreement report for your records.",
    },
  ];

  return (
    <section className="w-full py-20 px-4 md:py-32 bg-slate-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-800">
          A Clear Path to Resolution
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center text-center">
              <div className="mb-4">
                <span className="flex items-center justify-center w-20 h-20 rounded-full bg-slate-200 border-2 border-slate-300">
                  <span className="text-3xl font-bold text-slate-600">{step.number}</span>
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-slate-800">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
