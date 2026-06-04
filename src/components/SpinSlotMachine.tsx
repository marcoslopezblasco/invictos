"use client";

import { useEffect, useRef, useState } from "react";
import type { Spin } from "@/types/game";
import { stableHash } from "@/lib/hash";
import { CountryFlag } from "./CountryFlag";

const SPIN_MS = 1900;
const MIN_TICK_MS = 48;
const MAX_TICK_MS = 260;

function pickFromPool(pool: Spin[], seed: string): Spin {
  return pool[stableHash(seed) % pool.length] ?? pool[0]!;
}

export function SpinSlotMachine({
  target,
  pool,
  active,
  onComplete,
}: {
  target: Spin;
  pool: Spin[];
  active: boolean;
  onComplete?: () => void;
}) {
  const [display, setDisplay] = useState<Spin>(target);
  const [landed, setLanded] = useState(!active);
  const doneRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setDisplay(target);
    setLanded(!active);
  }, [target, active]);

  useEffect(() => {
    if (!active) return;

    doneRef.current = false;
    setLanded(false);
    const start = performance.now();
    let tick = 0;
    let raf = 0;

    const frame = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / SPIN_MS);
      const eased = 1 - (1 - progress) ** 3;
      const interval = MIN_TICK_MS + (MAX_TICK_MS - MIN_TICK_MS) * eased;

      if (elapsed >= SPIN_MS) {
        setDisplay(target);
        setLanded(true);
        if (!doneRef.current) {
          doneRef.current = true;
          onCompleteRef.current?.();
        }
        return;
      }

      if (elapsed - tick * interval >= interval || tick === 0) {
        setDisplay(pickFromPool(pool, `spin-${tick}-${Math.floor(elapsed)}`));
        tick++;
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [active, target, pool]);

  return (
    <div
      className={`paper-texture rounded-2xl border-2 p-4 text-center transition-all duration-300 ${
        landed
          ? "border-amber-500/70 shadow-md shadow-amber-900/20"
          : "border-amber-700/40 shadow-inner"
      }`}
    >
      <div
        className={`mx-auto flex max-w-xs justify-center gap-6 ${!landed ? "animate-pulse" : ""}`}
      >
        <div className="min-w-0 flex-1 text-center">
          <div className="flex justify-center">
            <CountryFlag country={display.country} size={48} />
          </div>
          <div
            className={`mt-2 truncate text-lg font-black text-amber-950 transition-opacity ${
              landed ? "opacity-100" : "opacity-80"
            }`}
          >
            {display.country}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-center justify-center">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-900/50">
            WC
          </div>
          <div
            className={`min-w-[4.5rem] text-4xl font-black tabular-nums text-amber-900 ${
              !landed ? "blur-[0.4px]" : ""
            }`}
          >
            {display.worldCup}
          </div>
        </div>
      </div>
    </div>
  );
}
