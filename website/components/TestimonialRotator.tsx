"use client";

import { useEffect, useState } from "react";

const testimonials = [
  {
    quote:
      "I used to throw away vegetables every week. Now I actually check Larder before I shop. Game changer.",
    name: "Sarah K.",
    role: "Home cook, Chicago",
    emoji: "👩",
  },
  {
    quote:
      "Bought blueberries three weeks in a row before I started using this. Not anymore.",
    name: "Marcus T.",
    role: "Busy parent, Austin",
    emoji: "👨",
  },
  {
    quote:
      "I meal prep every Sunday. Larder tells me exactly what I already have so I don't overbuy. Saves me $50 a week easily.",
    name: "Priya M.",
    role: "Meal prepper, New York",
    emoji: "👩‍🍳",
  },
  {
    quote:
      "The freshness bars are genius. I never thought I needed a pantry app but now I can't imagine grocery shopping without it.",
    name: "James L.",
    role: "Home chef, Seattle",
    emoji: "🧑‍🍳",
  },
];

export default function TestimonialRotator() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive((prev) => (prev + 1) % testimonials.length);
        setFading(false);
      }, 350);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[active];

  return (
    <div className="max-w-xl mx-auto text-center">
      <div
        style={{
          opacity: fading ? 0 : 1,
          transform: fading ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.35s ease, transform 0.35s ease",
        }}
      >
        <p className="text-(--color-text-muted) text-base leading-relaxed mb-5 italic">
          &ldquo;{t.quote}&rdquo;
        </p>
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-(--color-brand-xlight) border border-(--color-border) flex items-center justify-center text-lg">
            {t.emoji}
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-(--color-text-primary)">{t.name}</div>
            <div className="text-xs text-(--color-text-faint)">{t.role}</div>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => { setFading(true); setTimeout(() => { setActive(i); setFading(false); }, 350); }}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === active
                ? "bg-(--color-brand) w-4"
                : "bg-(--color-border) hover:bg-(--color-text-faint)"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
