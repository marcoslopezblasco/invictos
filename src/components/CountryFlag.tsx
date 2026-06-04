import { getCountryByName, getFlagCodeForCountry } from "@/lib/data";

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
  const height = Math.round(size * 0.75);

  if (!code) {
    const initials = getCountryByName(country)?.id.slice(0, 2).toUpperCase() ?? "?";
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-sm bg-amber-900/15 text-[9px] font-bold text-amber-900/60 ${className}`}
        style={{ width: size, height }}
        aria-hidden
      >
        {initials}
      </span>
    );
  }

  return (
    <span
      className={`fi fi-${code} fis inline-block shrink-0 overflow-hidden rounded-sm shadow-sm ${className}`}
      style={{ fontSize: size, width: size, height }}
      role="img"
      aria-label={country}
    />
  );
}
