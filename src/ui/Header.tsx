export default function Header({
  bank,
  pointsPerMin,
}: {
  bank: number;
  pointsPerMin: number;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-end justify-between gap-6 px-4 py-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            point bank
          </div>
          <div className="text-2xl font-semibold tabular-nums leading-tight">
            {Math.floor(bank).toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            points / min
          </div>
          <div className="text-lg font-medium tabular-nums leading-tight text-emerald-300">
            {pointsPerMin.toFixed(2)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-500">
            league
          </div>
          <div className="text-lg font-medium leading-tight text-neutral-300">High School</div>
        </div>
      </div>
    </header>
  );
}
