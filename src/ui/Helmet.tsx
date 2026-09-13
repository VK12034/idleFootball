import type { PlaybookId } from '../game/types';

/**
 * The team helmet, drawn as chunky blocks on a 34x28 grid (the crown pokes two
 * rows above the origin, hence the viewBox). Every team gets its own paint job
 * plus an emblem chosen by its playbook, so a team is recognisable from the
 * helmet alone.
 */
type Block = [x: number, y: number, w: number, h: number];

const SHELL: Block[] = [
  [6, -2, 20, 7],
  [3, 1, 26, 7],
  [1, 4, 30, 9],
  [0, 9, 31, 9],
  [0, 14, 22, 9],
  [1, 19, 15, 8],
];

const PAINT: Block[] = [
  [8, 0, 16, 3],
  [5, 3, 22, 3],
  [3, 6, 26, 5],
  [2, 11, 27, 5],
  [2, 16, 18, 5],
  [3, 21, 11, 4],
];

const MASK_DARK: Block[] = [
  [6, 13, 7, 6],
  [17, 14, 16, 5],
  [18, 20, 15, 5],
  [28, 14, 6, 11],
];

const MASK_BARS: Block[] = [
  [18, 15, 14, 3],
  [19, 21, 13, 3],
  [29, 15, 4, 9],
];

export type EmblemId = 'stripe' | 'patch' | 'wing' | 'bolt' | 'talon';

const EMBLEMS: Record<EmblemId, Block[]> = {
  stripe: [
    [11, 0, 5, 16],
    [18, 3, 3, 13],
  ],
  patch: [
    [19, 3, 4, 2],
    [17, 5, 8, 2],
    [15, 7, 12, 2],
    [17, 9, 8, 2],
    [19, 11, 4, 2],
  ],
  wing: [
    [10, 4, 16, 3],
    [14, 8, 13, 3],
    [19, 12, 8, 3],
  ],
  bolt: [
    [20, 3, 4, 5],
    [15, 8, 9, 4],
    [12, 12, 5, 4],
  ],
  talon: [
    [12, 2, 3, 10],
    [17, 3, 3, 10],
    [22, 4, 3, 10],
  ],
};

/** One emblem per playbook, so identity reads before you read the label. */
export const PLAYBOOK_EMBLEM: Record<PlaybookId, EmblemId> = {
  balanced: 'stripe',
  groundAndPound: 'patch',
  airRaid: 'bolt',
  hurryUp: 'wing',
  defensive: 'talon',
};

const SHELL_INK = '#12184a';
const BAR_WHITE = '#fffdf2';

function blocks(list: Block[], fill: string, key: string) {
  return list.map(([x, y, w, h], i) => (
    <rect key={`${key}${i}`} x={x} y={y} width={w} height={h} fill={fill} />
  ));
}

export default function Helmet({
  primary,
  secondary,
  playbook,
  size = 38,
  className,
}: {
  primary: string;
  secondary: string;
  playbook: PlaybookId;
  /** Rendered width in pixels; the height follows the 34:30 grid. */
  size?: number;
  className?: string;
}) {
  const emblem = EMBLEMS[PLAYBOOK_EMBLEM[playbook]];
  return (
    <svg
      viewBox="0 -2 34 30"
      width={size}
      height={Math.round((size * 30) / 34)}
      shapeRendering="crispEdges"
      className={`shrink-0 ${className ?? ''}`}
      aria-hidden="true"
    >
      {blocks(SHELL, SHELL_INK, 's')}
      {blocks(PAINT, primary, 'p')}
      {blocks(emblem, secondary, 'e')}
      {blocks(MASK_DARK, SHELL_INK, 'm')}
      {blocks(MASK_BARS, BAR_WHITE, 'b')}
    </svg>
  );
}
