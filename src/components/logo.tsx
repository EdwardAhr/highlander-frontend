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
        viewBox="0 0 48 24"
        aria-hidden
        className="logo-rock"
        style={{ width: size * 1.9, height: size * 0.95 }}
      >
        <defs>
          <linearGradient id="elbrus-logo-grad" x1="0" y1="0" x2="0" y2="1">
            <stop className="rgTop" offset="0" />
            <stop className="rgBase" offset="1" />
          </linearGradient>
        </defs>
        <path
          className="rock-outline"
          d="M1.0 18.4 Q2.4 18.0 3.5 17.4 Q4.6 16.8 7.8 14.3 Q11.1 11.7 12.9 9.3 Q14.7 6.8 15.2 6.3 Q15.7 5.9 16.3 5.8 Q16.8 5.8 17.6 6.2 Q18.3 6.5 19.1 7.3 Q20.0 8.0 21.1 9.3 Q22.2 10.5 22.9 10.8 Q23.6 11.1 25.3 10.1 Q26.9 9.2 29.8 5.9 Q32.6 2.6 33.7 2.0 Q34.8 1.4 35.8 1.8 Q36.9 2.1 39.1 3.7 Q41.3 5.3 43.3 7.3 Q45.2 9.4 46.1 9.8 L47.0 10.2 L47 24 L1 24 Z"
        />
        <path
          className="rock-fill"
          d="M1.0 18.4 Q2.4 18.0 3.5 17.4 Q4.6 16.8 7.8 14.3 Q11.1 11.7 12.9 9.3 Q14.7 6.8 15.2 6.3 Q15.7 5.9 16.3 5.8 Q16.8 5.8 17.6 6.2 Q18.3 6.5 19.1 7.3 Q20.0 8.0 21.1 9.3 Q22.2 10.5 22.9 10.8 Q23.6 11.1 25.3 10.1 Q26.9 9.2 29.8 5.9 Q32.6 2.6 33.7 2.0 Q34.8 1.4 35.8 1.8 Q36.9 2.1 39.1 3.7 Q41.3 5.3 43.3 7.3 Q45.2 9.4 46.1 9.8 L47.0 10.2 L47 24 L1 24 Z"
        />
        <path
          className="snow"
          d="M11.1 11.7 L14.7 6.8 L15.7 5.9 L16.8 5.8 L18.3 6.5 L20 8 L22.2 10.5 L22.2 12.4 L20 11.1 L18.3 8.4 L16.8 8.9 L15.7 7.8 L14.7 9.9 L11.1 13.6 Z"
        />
        <path
          className="snow"
          d="M26.9 9.2 L32.6 2.6 L34.8 1.4 L36.9 2.1 L41.3 5.3 L45.2 9.4 L45.2 12.5 L41.3 7.2 L36.9 5.2 L34.8 3.3 L32.6 5.7 L26.9 11.1 Z"
        />
      </svg>
      <span
        className="tracking-tight text-foreground"
        style={{ fontFamily: "var(--font-prata)", fontSize: size * 0.72, lineHeight: 1 }}
      >
        High<span className="text-accent">lander</span>
      </span>
    </span>
  );
}
