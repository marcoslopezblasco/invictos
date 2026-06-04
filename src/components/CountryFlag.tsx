"use client";

import { useState } from "react";
import { getCountryByName, getFlagCodeForCountry } from "@/lib/data";

const FLAG_CDN = "https://flagcdn.com";

export function CountryFlag({
  country,
  size = 20,
  className = "",
}: {
  country: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const code = getFlagCodeForCountry(country);
  const emoji = getCountryByName(country)?.flag;

  if (!code || failed) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center leading-none ${className}`}
        style={{ fontSize: size * 0.85 }}
        aria-hidden
      >
        {emoji ?? "🏳️"}
      </span>
    );
  }

  const height = Math.round(size * 0.75);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external CDN flags; emoji fallback on error
    <img
      src={`${FLAG_CDN}/w${size}/${code}.png`}
      srcSet={`${FLAG_CDN}/w${size * 2}/${code}.png 2x`}
      width={size}
      height={height}
      alt=""
      className={`inline-block shrink-0 rounded-sm object-cover shadow-sm ${className}`}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
