/**
 * The decorative backdrop behind the home screen: a pixel sun, three layers of
 * drifting cloud, and the stadium turf along the bottom. Purely cosmetic.
 */

/** Each cloud is a run of white blocks sitting on a shared baseline. */
const CLOUDS: { top: number; opacity: number; seconds: number; parts: [number, number][] }[] = [
  { top: 120, opacity: 1, seconds: 26, parts: [[22, 16], [26, 28], [34, 20], [18, 12]] },
  { top: 196, opacity: 0.85, seconds: 40, parts: [[16, 12], [30, 22], [20, 14]] },
  { top: 262, opacity: 0.7, seconds: 54, parts: [[26, 14], [38, 24], [22, 16]] },
];

export default function Sky() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute animate-bob"
        style={{
          top: 118,
          right: 22,
          width: 46,
          height: 46,
          background: '#ffe452',
          // the four nubs that make a round-ish pixel sun
          boxShadow:
            '-9px 0 0 0 #ffe452, 9px 0 0 0 #ffe452, 0 -9px 0 0 #ffe452, 0 9px 0 0 #ffe452',
        }}
      />

      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="absolute left-0 flex items-end"
          style={{
            top: c.top,
            opacity: c.opacity,
            animation: `drift ${c.seconds}s steps(24,end) infinite`,
          }}
        >
          {c.parts.map(([w, h], j) => (
            <i key={j} className="block bg-white" style={{ width: w, height: h }} />
          ))}
        </div>
      ))}

      {/* turf */}
      <div className="absolute inset-x-0 bottom-0 h-[150px] border-t-[6px] border-turfdark bg-turf" />
      <div
        className="absolute inset-x-0 h-[18px]"
        style={{
          bottom: 132,
          background: 'repeating-linear-gradient(90deg,#9ef07a 0 12px,#7fe86a 12px 24px)',
        }}
      />
    </div>
  );
}
