"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(target: number, duration: number, started: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!started) return;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return count;
}

interface Stat {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

const stats: Stat[] = [
  { target: 2, suffix: " min", label: "to set up" },
  { target: 1500, prefix: "$", label: "saved per year on average" },
  { target: 100, suffix: "%", label: "free to start, no card needed" },
];

export default function CounterStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const counts = [
    useCountUp(stats[0].target, 800, started),
    useCountUp(stats[1].target, 2000, started),
    useCountUp(stats[2].target, 1200, started),
  ];

  return (
    <div
      ref={ref}
      className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-0 text-center"
    >
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col sm:flex-row items-center sm:gap-0">
          <span className="text-sm text-(--color-text-muted)">
            <strong className="text-(--color-text-primary) font-semibold text-base">
              {stat.prefix ?? ""}
              {counts[i].toLocaleString()}
              {stat.suffix ?? ""}
            </strong>{" "}
            {stat.label}
          </span>
          {i < stats.length - 1 && (
            <span className="hidden sm:block text-(--color-border) sm:px-8">·</span>
          )}
        </div>
      ))}
    </div>
  );
}
