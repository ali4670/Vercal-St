import { createFileRoute } from "@tanstack/react-router";
import { Component as Hero } from "@/components/ui/hero";

export const Route = createFileRoute("/hero-demo")({
  component: HeroDemo,
});

function HeroDemo() {
  return (
    <div className="w-full h-full min-h-screen">
      <Hero />
    </div>
  );
}
