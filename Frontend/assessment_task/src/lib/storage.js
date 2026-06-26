// Lightweight localStorage helpers
const KEYS = {
  USERS: 'amx_users',
  TOKEN: 'amx_token',
  CURRENT: 'amx_current_user',
  CATEGORIES: 'amx_categories',
  ASSESSMENTS: 'amx_assessments',
  RESPONSES: 'amx_responses',
};

const read = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const storage = {
  getUsers: () => read(KEYS.USERS, []),
  setUsers: (u) => write(KEYS.USERS, u),

  getToken: () => localStorage.getItem(KEYS.TOKEN),
  setToken: (t) => localStorage.setItem(KEYS.TOKEN, t),
  clearToken: () => localStorage.removeItem(KEYS.TOKEN),

  getCurrentUser: () => read(KEYS.CURRENT, null),
  setCurrentUser: (u) => write(KEYS.CURRENT, u),
  clearCurrentUser: () => localStorage.removeItem(KEYS.CURRENT),

  getCategoriesLib: () => read(KEYS.CATEGORIES, []),
  setCategoriesLib: (c) => write(KEYS.CATEGORIES, c),

  getAssessments: () => read(KEYS.ASSESSMENTS, []),
  setAssessments: (a) => write(KEYS.ASSESSMENTS, a),

  getResponses: () => read(KEYS.RESPONSES, []),
  setResponses: (r) => write(KEYS.RESPONSES, r),
};

// Build a fake JWT-like token
export const makeToken = (payload) => {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = btoa(JSON.stringify({ ...payload, iat: Date.now() }));
  const sig = btoa('local-signature');

  return `${header}.${body}.${sig}`;
};

export const uid = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
