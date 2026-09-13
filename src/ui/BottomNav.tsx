export type TabId = 'home' | 'teams' | 'team';

const TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'HOME' },
  { id: 'teams', label: 'TEAMS' },
  { id: 'team', label: 'FIELD' },
];

/** Three fat thumb targets pinned to the bottom of the phone. */
export default function BottomNav({
  active,
  onSelect,
  highlight,
}: {
  active: TabId;
  onSelect: (id: TabId) => void;
  highlight?: string | null;
}) {
  return (
    <nav
      className="no-select relative z-20 grid shrink-0 grid-cols-3 border-t-[6px] border-night bg-ink"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {TABS.map((t, i) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          aria-current={active === t.id}
          className={`pix min-h-[56px] px-1 py-3 text-[10px] text-white ${
            active === t.id ? 'bg-steel' : 'bg-ink'
          } ${i < TABS.length - 1 ? 'border-r-4 border-night' : ''} ${
            highlight === `nav:${t.id}` ? 'tut-glow' : ''
          }`}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
