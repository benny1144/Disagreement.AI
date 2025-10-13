import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="flex items-center justify-center px-4 py-24 md:py-32">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
          From Conflict to Clarity.
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
          Disagreement.AI is the world's first AI mediation platform built on a "Glass Box" guarantee of transparency
          and fairness. We provide a neutral, secure, and effective space to resolve disputes, from the simple to the
          complex.
        </p>

        <Button size="lg" className="mt-8 bg-[#2667FF] text-white hover:bg-[#2667FF]/90 px-8 py-6 text-lg">
            <a href="#waitlist-form">Get Early Access To Initial Test Product</a>
        </Button>
      </div>
    </section>
  );
}
