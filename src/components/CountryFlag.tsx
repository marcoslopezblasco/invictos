"use client";

import { useState } from "react";
import { getCountryByName } from "@/lib/data";

export function CountryFlag({
  country,
  size = 20,
  className = "",
}: {
  country: string;
  size?: number;
  className?: string;
}) {
  const meta = getCountryByName(country);
  const code = meta?.flagCode?.trim() || null;
  const flagSrc = meta?.flagSrc;
  const [imgFailed, setImgFailed] = useState(false);
  /** 4:3 for flag-icons; 3:2 for custom flagSrc SVGs/PNGs. */
  const width = size;
  const height = flagSrc
    ? Math.round((width * 2) / 3)
    : Math.round((width * 3) / 4);

  if (flagSrc && !imgFailed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm border border-black/10 bg-white/90 shadow-sm ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={country}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagSrc}
          alt=""
          className="h-full w-full object-contain"
          draggable={false}
          onError={() => setImgFailed(true)}
        />
      </span>
    );
  }

  if (flagSrc && imgFailed) {
    const initials = meta?.id.slice(0, 2).toUpperCase() ?? "?";
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-amber-900/15 text-[9px] font-bold text-amber-900/60 ${className}`}
        style={{ width, height }}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  if (!code) {
    const initials = meta?.id.slice(0, 2).toUpperCase() ?? "?";
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-amber-900/15 text-[9px] font-bold text-amber-900/60 ${className}`}
        style={{ width, height }}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    <span
      className={`fi fi-${code} inline-block shrink-0 overflow-hidden rounded-sm shadow-sm ${className}`}
      style={{ fontSize: height, width, height, lineHeight: `${height}px` }}
      role="img"
      aria-label={country}
    />
  );
}
