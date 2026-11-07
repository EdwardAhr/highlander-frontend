export function Logo({
  className = "",
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        aria-hidden
        fill="currentColor"
        className="text-foreground"
      >
        <path d="M2 22 L9 8 L13 15 L16 4 L23 18 L26 12 L26 22 Z" />
      </svg>
      <span
        className="text-foreground tracking-tight"
        style={{ fontFamily: "var(--font-unbounded)" }}
      >
        High<span className="text-accent">lander</span>
      </span>
    </span>
  );
}
