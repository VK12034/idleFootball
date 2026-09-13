/** The `< BACK` strip that sits above every screen except home. */
export default function BackBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <button
        onClick={onBack}
        className="pix btn shrink-0 bg-chalk px-2.5 py-2 text-[10px] text-ink"
      >
        &lt; BACK
      </button>
      <div className="pix min-w-0 truncate text-[13px] text-shell">{title}</div>
    </div>
  );
}
