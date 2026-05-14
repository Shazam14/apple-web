// data.jsx — sample data + helpers

const BORROWERS = [
  {
    id: 'helen', name: 'Helen', initials: 'HL', avatar: '#5B6CFF',
    principal: 751456, than: 4181, collected: 358520, owed: -354339, balance: 397117,
    txCount: 24, overdue: 6, dueToday: 6, multa: 0, status: 'active',
  },
  {
    id: 'apple', name: 'Apple Daily', initials: 'AD', avatar: '#FF8855',
    principal: 388000, than: 6600, collected: 30000, owed: -23400, balance: 370500,
    txCount: 5, overdue: 5, dueToday: 0, multa: 2400, status: 'active',
  },
  {
    id: 'tonet', name: 'Tonet', initials: 'TN', avatar: '#22C55E',
    principal: 20000, than: 3900, collected: 3000, owed: 900, balance: 20900,
    txCount: 3, overdue: 0, dueToday: 0, multa: 0, status: 'paid',
  },
  {
    id: 'pusok', name: 'Pusok', initials: 'PK', avatar: '#A855F7',
    principal: 7000, than: 0, collected: 0, owed: 0, balance: 7000,
    txCount: 1, overdue: 0, dueToday: 0, multa: 0, status: 'idle',
  },
  {
    id: 'marvin', name: 'Marvin P.', initials: 'MP', avatar: '#0EA5E9',
    principal: 2000, than: 300, collected: 0, owed: 300, balance: 2360,
    txCount: 2, overdue: 1, dueToday: 0, multa: 240, status: 'active',
  },
  {
    id: 'mario', name: 'Mario Valdez', initials: 'MV', avatar: '#F59E0B',
    principal: 8000, than: 750, collected: 6870, owed: -6120, balance: 2120,
    txCount: 6, overdue: 5, dueToday: 1, multa: 510, status: 'active',
  },
];

const CAPITAL = {
  puhunan: 500000,
  lentOut: 1169455,
  cashOnHand: 0,
  collected: 426440,
  thanAccrued: 15731,
  owed: -410709,
  multaPending: 3150,
  idle: -669455,
  borrowerCount: 6,
};

// Helen's recent ledger
const HELEN_TX = [
  { d: 'May 14', tag: 'DUE TODAY', who: 'cebu uno',          palod: 4484,   thn: 0, bayad: 0, bal: 397736, status: 'due' },
  { d: 'May 14', tag: 'DUE TODAY', who: 'no...n c.',         palod: 5995,   thn: 0, bayad: 0, bal: 393252, status: 'due' },
  { d: 'May 14', tag: 'DUE TODAY', who: 'roland tapao',      palod: 10700,  thn: 0, bayad: 0, bal: 387257, status: 'due' },
  { d: 'May 14', tag: 'DUE TODAY', who: 'for the month',     palod: 50000,  thn: 0, bayad: 0, bal: 376557, status: 'due' },
  { d: 'May 14', tag: 'DUE TODAY', who: 'wallnut',           palod: 36000,  thn: 0, bayad: 0, bal: 326557, status: 'due' },
  { d: 'May 14', tag: 'DUE TODAY', who: 'jane teh',          palod: 60000,  thn: 0, bayad: 0, bal: 290557, status: 'due' },
  { d: 'May 8',  tag: '+6d overdue', who: 'judy basubas',    palod: 100000, thn: 0, bayad: 0, bal: 230557, status: 'overdue' },
  { d: 'May 8',  tag: '+6d overdue', who: 'o delices',       palod: 1270,   thn: 0, bayad: 0, bal: 130557, status: 'overdue' },
  { d: 'May 8',  tag: '+6d overdue', who: 'white bread',     palod: 1600,   thn: 0, bayad: 0, bal: 129287, status: 'overdue' },
  { d: 'May 3',  tag: '',            who: 'beko',            palod: 120000, thn: 0, bayad: 0, bal: 329479, status: 'past' },
  { d: 'May 3',  tag: '',            who: 'clarisa',         palod: 100000, thn: 0, bayad: 0, bal: 209479, status: 'past' },
];

const fmt = (n) => {
  if (n === 0) return '₱0';
  const abs = Math.abs(n);
  const s = '₱' + abs.toLocaleString('en-PH');
  return n < 0 ? '-' + s : s;
};

const fmtCompact = (n) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1) + 'M';
  if (abs >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toString();
};

Object.assign(window, { BORROWERS, CAPITAL, HELEN_TX, fmt, fmtCompact });
