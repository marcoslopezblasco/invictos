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
  /** 4:3 flag ratio (fi = rectangular; fis = square — we avoid fis). */
  const width = size;
  const height = Math.round((width * 3) / 4);

  if (flagSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={flagSrc}
        alt=""
        width={width}
        height={height}
        className={`inline-block shrink-0 rounded-sm object-cover shadow-sm ${className}`}
        role="img"
        aria-label={country}
      />
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
