// Schutzengel logomark — a soft guardian-angel wing in a terracotta squircle.
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      role="img"
      aria-label="Schutzengel"
    >
      <rect width="40" height="40" rx="13" fill="#c15a38" />
      <g stroke="#fff6ec" strokeWidth="2.6" strokeLinecap="round" fill="none">
        <path d="M11.5 27.5 C 16 20.5, 22.5 16.5, 29.5 16" />
        <path d="M13 28.5 C 16.5 23.5, 21 21.5, 27 21.5" />
        <path d="M14.5 29.5 C 17.5 26, 20.5 25, 24.5 25" />
      </g>
    </svg>
  );
}
