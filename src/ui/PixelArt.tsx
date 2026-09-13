import type { CSSProperties, ReactElement } from 'react';

/**
 * Tiny sprite renderer: each character in `rows` is one pixel, looked up in
 * `palette`. '.' is transparent. Rendered as crisp <rect>s so it scales
 * without blurring.
 */
export interface Sprite {
  palette: Record<string, string>;
  rows: string[];
}

export function PixelArt({
  sprite,
  className,
  style,
  stretch,
}: {
  sprite: Sprite;
  className?: string;
  style?: CSSProperties;
  /** Let the sprite fill its box instead of keeping square pixels. */
  stretch?: boolean;
}) {
  const h = sprite.rows.length;
  const w = sprite.rows[0].length;
  const cells: ReactElement[] = [];
  for (let y = 0; y < h; y++) {
    const row = sprite.rows[y];
    for (let x = 0; x < w; x++) {
      const fill = sprite.palette[row[x]];
      if (!fill) continue;
      cells.push(<rect key={`${x}:${y}`} x={x} y={y} width={1} height={1} fill={fill} />);
    }
  }
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      preserveAspectRatio={stretch ? 'none' : undefined}
      className={className}
      style={style}
      aria-hidden="true"
    >
      {cells}
    </svg>
  );
}

export const FOOTBALL: Sprite = {
  palette: { K: '#2b1608', L: '#a8552a', H: '#c97a45', W: '#f7f3e4' },
  rows: [
    '....KKKKK....',
    '..KKHHHHHKK..',
    '.KHLLLLLLLHK.',
    'KHLLLWWWLLLHK',
    'KHLLWWWWWLLHK',
    'KHLLLWWWLLLHK',
    '.KHLLLLLLLHK.',
    '..KKHHHHHKK..',
    '....KKKKK....',
  ],
};

export const COACH: Sprite = {
  palette: {
    K: '#12184a',
    C: '#ffd23f',
    B: '#e8a400',
    S: '#ffd9a8',
    D: '#c98b5e',
    E: '#12184a',
    M: '#c98b5e',
    R: '#3fd8ff',
    W: '#fffdf2',
    Y: '#ffe452',
  },
  rows: [
    '....KKKKKK....',
    '..KKCCCCCCKK..',
    '.KCCCCCCCCCCK.',
    '.KCCCCCCCCCCK.',
    'KBBBBBBBBBBBBK',
    '.KSSSSSSSSSSK.',
    '.KSEESSSSEESK.',
    '.KSSSSSSSSSSK.',
    '.KSSDMMMMDSSK.',
    '..KSSSSSSSSK..',
    '..KKSSSSSSKK..',
    '.KRRRWYYWRRRK.',
    'KRRRRRWWRRRRRK',
    'KRRRRRRRRRRRRK',
    'KRRRRRRRRRRRRK',
    '.KKKK....KKKK.',
  ],
};
