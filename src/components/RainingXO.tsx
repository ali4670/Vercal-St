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

const chars = ["X", "O"];

function createCharData(): Character {
  return {
    char: chars[Math.random() < 0.5 ? 0 : 1],
    x: Math.random() * 100,
    y: Math.random() * 100,
    speed: 0.08 + Math.random() * 0.45,
    opacity: 0.2 + Math.random() * 0.5,
  };
}

function isMobile() {
  return window.innerWidth < 768;
}

export const RainingXO = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<Character[]>([]);
  const rafRef = useRef<number>(0);
  const [ready, setReady] = useState(false);

  const charCount = isMobile() ? 80 : 380;

  useEffect(() => {
    const data: Character[] = [];
    for (let i = 0; i < charCount; i++) data.push(createCharData());
    charsRef.current = data;

    const el = containerRef.current;
    if (!el) return;

    el.innerHTML = "";
    const spans: HTMLSpanElement[] = [];
    for (let i = 0; i < charCount; i++) {
      const c = data[i];
      const span = document.createElement("span");
      span.className = "absolute font-mono text-lg font-bold";
      span.textContent = c.char;
      span.style.left = c.x + "%";
      span.style.top = c.y + "%";
      span.style.opacity = String(c.opacity);
      span.style.color =
        c.char === "X" ? "oklch(0.55 0.15 35)" : "oklch(0.55 0.08 150)";
      el.appendChild(span);
      spans.push(span);
    }

    let activeIndices = new Set<number>();

    const updateActive = () => {
      const next = new Set<number>();
      const num = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < num; i++)
        next.add(Math.floor(Math.random() * charCount));
      activeIndices = next;
    };

    const tick = () => {
      const d = charsRef.current;
      for (let i = 0; i < charCount; i++) {
        const c = d[i];
        c.y += c.speed;
        if (c.y >= 100) {
          c.y = -5;
          c.x = Math.random() * 100;
          c.char = chars[Math.random() < 0.5 ? 0 : 1];
        }
        const span = spans[i];
        span.style.top = c.y + "%";
        span.style.left = c.x + "%";
        span.style.opacity = String(
          activeIndices.has(i) ? 1 : c.opacity
        );
        const isX = c.char === "X";
        if (activeIndices.has(i)) {
          span.style.color = isX
            ? "oklch(0.65 0.22 35)"
            : "oklch(0.65 0.15 150)";
          span.style.textShadow = "0 0 12px currentColor";
        } else {
          span.style.color = isX
            ? "oklch(0.55 0.15 35)"
            : "oklch(0.55 0.08 150)";
          span.style.textShadow = "none";
        }
        span.textContent = c.char;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    updateActive();
    const activeInterval = setInterval(updateActive, 80);
    rafRef.current = requestAnimationFrame(tick);
    setReady(true);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearInterval(activeInterval);
    };
  }, [charCount]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    />
  );
};
