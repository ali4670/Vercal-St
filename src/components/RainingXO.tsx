import { useState, useEffect, useCallback, useRef } from "react";

interface Character {
  char: string;
  x: number;
  y: number;
  speed: number;
  opacity: number;
}

class TextScramble {
  el: HTMLElement;
  chars: string;
  queue: Array<{
    from: string;
    to: string;
    start: number;
    end: number;
    char?: string;
  }>;
  frame: number;
  frameRequest: number;
  resolve: (value: void | PromiseLike<void>) => void;

  constructor(el: HTMLElement) {
    this.el = el;
    this.chars = "!<>-_\\/[]{}—=+*^?#XO";
    this.queue = [];
    this.frame = 0;
    this.frameRequest = 0;
    this.resolve = () => {};
    this.update = this.update.bind(this);
  }

  setText(newText: string) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise<void>((resolve) => (this.resolve = resolve));
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || "";
      const to = newText[i] || "";
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }

  update() {
    let output = "";
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      const { from, to, start, end } = this.queue[i];
      let { char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)];
          this.queue[i].char = char;
        }
        output += `<span class="opacity-60">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

export const ScrambledText = ({
  phrases,
  className,
}: {
  phrases: string[];
  className?: string;
}) => {
  const elementRef = useRef<HTMLSpanElement>(null);
  const scramblerRef = useRef<TextScramble | null>(null);

  useEffect(() => {
    if (!elementRef.current) return;
    scramblerRef.current = new TextScramble(elementRef.current);
    let counter = 0;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      if (!scramblerRef.current || cancelled) return;
      scramblerRef.current.setText(phrases[counter]).then(() => {
        if (cancelled) return;
        timer = setTimeout(next, 2200);
      });
      counter = (counter + 1) % phrases.length;
    };
    next();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phrases]);

  return <span ref={elementRef} className={className} />;
};

export const RainingXO = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set());

  const createCharacters = useCallback(() => {
    const charCount = 380;
    const newCharacters: Character[] = [];
    for (let i = 0; i < charCount; i++) {
      newCharacters.push({
        char: Math.random() > 0.5 ? "X" : "O",
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.08 + Math.random() * 0.45,
        opacity: 0.2 + Math.random() * 0.5,
      });
    }
    return newCharacters;
  }, []);

  useEffect(() => {
    setCharacters(createCharacters());
  }, [createCharacters]);

  useEffect(() => {
    const updateActive = () => {
      const next = new Set<number>();
      const num = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < num; i++) {
        next.add(Math.floor(Math.random() * characters.length));
      }
      setActiveIndices(next);
    };
    const id = setInterval(updateActive, 80);
    return () => clearInterval(id);
  }, [characters.length]);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      setCharacters((prev) =>
        prev.map((c) => ({
          ...c,
          y: c.y + c.speed,
          ...(c.y >= 100 && {
            y: -5,
            x: Math.random() * 100,
            char: Math.random() > 0.5 ? "X" : "O",
          }),
        })),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {characters.map((c, i) => {
        const active = activeIndices.has(i);
        const isX = c.char === "X";
        return (
          <span
            key={i}
            className="absolute font-mono text-lg font-bold transition-colors duration-100"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              opacity: active ? 1 : c.opacity,
              color: active
                ? isX
                  ? "oklch(0.65 0.22 35)"
                  : "oklch(0.65 0.15 150)"
                : isX
                  ? "oklch(0.55 0.15 35)"
                  : "oklch(0.55 0.08 150)",
              textShadow: active ? "0 0 12px currentColor" : "none",
            }}
          >
            {c.char}
          </span>
        );
      })}
    </div>
  );
};
