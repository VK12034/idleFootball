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
    K: '#1b1226',
    C: '#d4462c',
    B: '#8f2a18',
    S: '#e7b189',
    D: '#c98f68',
    E: '#241a2e',
    M: '#93463c',
    R: '#2f6fb5',
    W: '#f4f1e4',
    Y: '#ffc23c',
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

/**
 * A seeded speckle of heads in the stands. Deterministic so it never
 * reshuffles between renders.
 */
export const CROWD: Sprite = (() => {
  const palette: Record<string, string> = {
    a: '#e8b489',
    b: '#c9885a',
    c: '#8a5a3b',
    d: '#6b4630',
    e: '#ff5d3a',
    f: '#48c8ff',
    g: '#ffc23c',
    h: '#7ee787',
    i: '#f4f1e4',
  };
  // skin tones dominate, jerseys sprinkle through
  const bag = 'aaaaabbbbbccccddeeffgghhii'.split('');
  let seed = 20240917;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const rows: string[] = [];
  for (let y = 0; y < 10; y++) {
    let row = '';
    for (let x = 0; x < 84; x++) {
      const seat = (x + (y % 2)) % 2 === 0;
      row += seat && rnd() > 0.14 ? bag[Math.floor(rnd() * bag.length)] : '.';
    }
    rows.push(row);
  }
  return { palette, rows };
})();

export const GOALPOST: Sprite = {
  palette: { Y: '#ffd447', K: '#8a6a12' },
  rows: [
    'Y.....Y',
    'Y.....Y',
    'Y.....Y',
    'YYYYYYY',
    'K..Y..K',
    '...Y...',
    '...Y...',
    '..YYY..',
  ],
};

export const DUMBBELL: Sprite = {
  palette: { K: '#160e46', S: '#d6dff0', G: '#8fa0c4' },
  rows: [
    '.KK......KK.',
    'KSSK....KSSK',
    'KSSKKKKKKSSK',
    'KSSKGGGGKSSK',
    'KSSK....KSSK',
    '.KK......KK.',
  ],
};

export const CLIPBOARD: Sprite = {
  palette: { K: '#160e46', B: '#c9954a', P: '#fffdf2', L: '#8b93b8' },
  rows: [
    '..KKKK..',
    'KKBBBBKK',
    'KPPPPPPK',
    'KPLLLLPK',
    'KPPPPPPK',
    'KPLLLLPK',
    'KPPPPPPK',
    'KPLLPPPK',
    'KPPPPPPK',
    '.KKKKKK.',
  ],
};

export const STADIUM: Sprite = {
  palette: { K: '#160e46', W: '#ffd23f', S: '#8fd6ff', G: '#4fd167' },
  rows: [
    '.W......W.',
    'KWK....KWK',
    'KSKKKKKKSK',
    'KSSSSSSSSK',
    'KSGGGGGGSK',
    'KSGGGGGGSK',
    'KSSSSSSSSK',
    '.KKKKKKKK.',
  ],
};

export const WHISTLE: Sprite = {
  palette: { K: '#1b1226', Y: '#ffc23c', W: '#f4f1e4' },
  rows: [
    '..KKKK..',
    '.KYYYYK.',
    'KYYWWYYK',
    'KYYWWYYK',
    '.KYYYYK.',
    '..KKKK..',
  ],
};

/** Team helmet in the team's own colours. */
export function helmet(primary: string, secondary: string): Sprite {
  return {
    palette: { K: '#1b1226', P: primary, S: secondary, W: '#f4f1e4' },
    rows: [
      '..KKKKKK..',
      '.KPPPPPPK.',
      'KPSSSSSPPK',
      'KPSSSSSPPK',
      'KPPPPPPPPK',
      'KPPPKWWWWK',
      '.KKKKWKKWK',
      '....KWWWWK',
    ],
  };
}
