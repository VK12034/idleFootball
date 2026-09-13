// The NAFL: 32 teams, two conferences of four divisions.
// Playbook assignments are fixed by design. Colours are original pairings and
// deliberately avoid the real-world combination for each city.
import type { PlaybookId } from '../game/types';

export type ConferenceId = 'IRON' | 'GOLD';
export type DivisionId = 'EAST' | 'NORTH' | 'SOUTH' | 'WEST';

export interface TeamConfig {
  id: string;
  name: string;
  playbook: PlaybookId;
  conference: ConferenceId;
  division: DivisionId;
  colors: { primary: string; secondary: string };
}

export const NAFL_TEAMS: TeamConfig[] = [
  // ---- IRON EAST ----
  { id: 'buffalo-bruisers', name: 'Buffalo Bruisers', playbook: 'groundAndPound', conference: 'IRON', division: 'EAST', colors: { primary: '#17b8a6', secondary: '#f2e6c9' } },
  { id: 'miami-dorados', name: 'Miami Dorados', playbook: 'airRaid', conference: 'IRON', division: 'EAST', colors: { primary: '#d6379b', secondary: '#ffd23f' } },
  { id: 'new-england-pilgrims', name: 'New England Pilgrims', playbook: 'balanced', conference: 'IRON', division: 'EAST', colors: { primary: '#2f9d5f', secondary: '#f0a63c' } },
  { id: 'new-york-juggernauts', name: 'New York Juggernauts', playbook: 'hurryUp', conference: 'IRON', division: 'EAST', colors: { primary: '#8b4fe0', secondary: '#a3f542' } },

  // ---- IRON NORTH ----
  { id: 'baltimore-reapers', name: 'Baltimore Reapers', playbook: 'defensive', conference: 'IRON', division: 'NORTH', colors: { primary: '#d63f56', secondary: '#f5ecd6' } },
  { id: 'cincinnati-bobcats', name: 'Cincinnati Bobcats', playbook: 'airRaid', conference: 'IRON', division: 'NORTH', colors: { primary: '#3f7ff0', secondary: '#f7f7f7' } },
  { id: 'cleveland-blacksmiths', name: 'Cleveland Blacksmiths', playbook: 'groundAndPound', conference: 'IRON', division: 'NORTH', colors: { primary: '#5b6fc4', secondary: '#ffb43f' } },
  { id: 'pittsburgh-smelters', name: 'Pittsburgh Smelters', playbook: 'groundAndPound', conference: 'IRON', division: 'NORTH', colors: { primary: '#e06b2a', secondary: '#3fd6c4' } },

  // ---- IRON SOUTH ----
  { id: 'houston-thrusters', name: 'Houston Thrusters', playbook: 'hurryUp', conference: 'IRON', division: 'SOUTH', colors: { primary: '#9ef01a', secondary: '#4a5bd6' } },
  { id: 'indianapolis-cyclones', name: 'Indianapolis Cyclones', playbook: 'hurryUp', conference: 'IRON', division: 'SOUTH', colors: { primary: '#a05fe8', secondary: '#ff9a42' } },
  { id: 'jacksonville-jackals', name: 'Jacksonville Jackals', playbook: 'defensive', conference: 'IRON', division: 'SOUTH', colors: { primary: '#c23f6b', secondary: '#6fe0b0' } },
  { id: 'tennessee-thunder', name: 'Tennessee Thunder', playbook: 'airRaid', conference: 'IRON', division: 'SOUTH', colors: { primary: '#ffd23f', secondary: '#2f9d6b' } },

  // ---- IRON WEST ----
  { id: 'denver-bighorns', name: 'Denver Bighorns', playbook: 'defensive', conference: 'IRON', division: 'WEST', colors: { primary: '#45c8f0', secondary: '#fbfbfb' } },
  { id: 'kansas-city-cavalry', name: 'Kansas City Cavalry', playbook: 'airRaid', conference: 'IRON', division: 'WEST', colors: { primary: '#5b52e8', secondary: '#d6dff0' } },
  { id: 'las-vegas-rogues', name: 'Las Vegas Rogues', playbook: 'hurryUp', conference: 'IRON', division: 'WEST', colors: { primary: '#ff4f9b', secondary: '#4a3fa8' } },
  { id: 'los-angeles-current', name: 'Los Angeles Current', playbook: 'airRaid', conference: 'IRON', division: 'WEST', colors: { primary: '#ffe14f', secondary: '#8b3fd6' } },

  // ---- GOLD EAST ----
  { id: 'dallas-cattlemen', name: 'Dallas Cattlemen', playbook: 'groundAndPound', conference: 'GOLD', division: 'EAST', colors: { primary: '#d6542e', secondary: '#f0d9a0' } },
  { id: 'new-york-goliaths', name: 'New York Goliaths', playbook: 'defensive', conference: 'GOLD', division: 'EAST', colors: { primary: '#4f8fd6', secondary: '#ff9a3c' } },
  { id: 'philadelphia-enforcers', name: 'Philadelphia Enforcers', playbook: 'defensive', conference: 'GOLD', division: 'EAST', colors: { primary: '#8b4fd6', secondary: '#f5ead2' } },
  { id: 'washington-cadets', name: 'Washington Cadets', playbook: 'balanced', conference: 'GOLD', division: 'EAST', colors: { primary: '#3f5bc4', secondary: '#4fd167' } },

  // ---- GOLD NORTH ----
  { id: 'chicago-bison', name: 'Chicago Bison', playbook: 'groundAndPound', conference: 'GOLD', division: 'NORTH', colors: { primary: '#2f9d9d', secondary: '#ffc93f' } },
  { id: 'detroit-lynx', name: 'Detroit Lynx', playbook: 'balanced', conference: 'GOLD', division: 'NORTH', colors: { primary: '#ff7a2f', secondary: '#3fd6c4' } },
  { id: 'green-bay-pioneers', name: 'Green Bay Pioneers', playbook: 'groundAndPound', conference: 'GOLD', division: 'NORTH', colors: { primary: '#b07a3c', secondary: '#6fc7f0' } },
  { id: 'minnesota-voyageurs', name: 'Minnesota Voyageurs', playbook: 'balanced', conference: 'GOLD', division: 'NORTH', colors: { primary: '#3f9d52', secondary: '#ff9f2f' } },

  // ---- GOLD SOUTH ----
  { id: 'atlanta-firebirds', name: 'Atlanta Firebirds', playbook: 'airRaid', conference: 'GOLD', division: 'SOUTH', colors: { primary: '#e8429b', secondary: '#ffd23f' } },
  { id: 'carolina-pumas', name: 'Carolina Pumas', playbook: 'balanced', conference: 'GOLD', division: 'SOUTH', colors: { primary: '#9ef01a', secondary: '#8b4fd6' } },
  { id: 'new-orleans-spirits', name: 'New Orleans Spirits', playbook: 'balanced', conference: 'GOLD', division: 'SOUTH', colors: { primary: '#3fd6d6', secondary: '#ff7a6b' } },
  { id: 'tampa-bay-brigands', name: 'Tampa Bay Brigands', playbook: 'defensive', conference: 'GOLD', division: 'SOUTH', colors: { primary: '#4f5bd6', secondary: '#ffcf3f' } },

  // ---- GOLD WEST ----
  { id: 'arizona-condors', name: 'Arizona Condors', playbook: 'balanced', conference: 'GOLD', division: 'WEST', colors: { primary: '#e8bc6b', secondary: '#2fb89e' } },
  { id: 'los-angeles-renegades', name: 'Los Angeles Renegades', playbook: 'balanced', conference: 'GOLD', division: 'WEST', colors: { primary: '#e8455b', secondary: '#a8c4e8' } },
  { id: 'san-francisco-fog', name: 'San Francisco Fog', playbook: 'hurryUp', conference: 'GOLD', division: 'WEST', colors: { primary: '#9fd6f0', secondary: '#4f6bc4' } },
  { id: 'seattle-sockeyes', name: 'Seattle Sockeyes', playbook: 'hurryUp', conference: 'GOLD', division: 'WEST', colors: { primary: '#ff6b5b', secondary: '#2f9d9d' } },
];

export const TEAMS_BY_ID = new Map(NAFL_TEAMS.map((t) => [t.id, t]));

/** The team you inherit at the start of a new save. */
export const STARTER_TEAM_ID = 'detroit-lynx';

export const PLAYBOOK_LABEL: Record<PlaybookId, string> = {
  balanced: 'Balanced',
  groundAndPound: 'Ground & Pound',
  airRaid: 'Air Raid',
  hurryUp: 'Hurry Up',
  defensive: 'Defensive',
};
