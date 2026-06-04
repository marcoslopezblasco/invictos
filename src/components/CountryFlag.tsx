import { getFlagCodeForCountry } from "@/lib/data";

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
  const code = getFlagCodeForCountry(country);
  if (!code) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-amber-900/15 text-[10px] font-bold uppercase text-amber-900/50 ${className}`}
        style={{ width: size, height: Math.round(size * 0.75) }}
        aria-hidden
      >
        ?
      </span>
    );
  }

  const height = Math.round(size * 0.75);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- external CDN flags; reliable on Windows
    <img
      src={`${FLAG_CDN}/w${size}/${code}.png`}
      srcSet={`${FLAG_CDN}/w${size * 2}/${code}.png 2x`}
      width={size}
      height={height}
      alt=""
      className={`inline-block shrink-0 rounded-sm object-cover shadow-sm ${className}`}
      loading="lazy"
      decoding="async"
    />
  );
}
