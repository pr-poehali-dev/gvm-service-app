const AUTH_URL = 'https://functions.poehali.dev/27eddd57-6730-4dd0-818d-611b261115d3';
const DATA_URL = 'https://functions.poehali.dev/3fa83d31-5367-4da3-ac0b-dfea2b8ccc40';
const NOTIFY_URL = 'https://functions.poehali.dev/bfe57001-222f-4953-83a9-0446fa09ca51';

function getToken(): string | null {
  return localStorage.getItem('gvm_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'X-Auth-Token': token } : {}),
  };
}

async function request(baseUrl: string, path: string, method = 'GET', body?: unknown) {
  const res = await fetch(baseUrl, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
    ...(method !== 'GET' ? {} : {}),
  });
  // We pass path in body for routing — but these are cloud functions routed by path in event
  // Actually functions receive path from the proxy. Let's do path-based routing via URL path appended
  return res;
}

async function authRequest(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(AUTH_URL + path, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

async function dataRequest(path: string, method = 'GET', body?: unknown) {
  const res = await fetch(DATA_URL + path, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

async function notifyRequest(path: string, method = 'POST', body?: unknown) {
  const res = await fetch(NOTIFY_URL + path, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

export const api = {
  // Auth
  register: (username: string, password: string) =>
    authRequest('/register', 'POST', { username, password }),
  login: (username: string, password: string) =>
    authRequest('/login', 'POST', { username, password }),
  logout: () => authRequest('/logout', 'POST'),
  me: () => authRequest('/me', 'GET'),
  updateSettings: (data: Record<string, unknown>) =>
    authRequest('/settings', 'PUT', data),
  changePassword: (old_password: string, new_password: string) =>
    authRequest('/change-password', 'PUT', { old_password, new_password }),

  // Car
  getCar: () => dataRequest('/car', 'GET'),
  saveCar: (data: Record<string, unknown>) => dataRequest('/car', 'PUT', data),

  // Trips
  getTrips: (limit = 50, offset = 0) => dataRequest(`/trips?limit=${limit}&offset=${offset}`, 'GET'),
  addTrip: (data: Record<string, unknown>) => dataRequest('/trips', 'POST', data),
  updateTrip: (id: number, data: Record<string, unknown>) => dataRequest(`/trips/${id}`, 'PUT', data),

  // Finances
  getFinances: (limit = 100) => dataRequest(`/finances?limit=${limit}`, 'GET'),
  addFinance: (data: Record<string, unknown>) => dataRequest('/finances', 'POST', data),
  updateFinance: (id: number, data: Record<string, unknown>) => dataRequest(`/finances/${id}`, 'PUT', data),

  // Intervals
  getIntervals: () => dataRequest('/intervals', 'GET'),
  addInterval: (data: Record<string, unknown>) => dataRequest('/intervals', 'POST', data),
  updateInterval: (id: number, data: Record<string, unknown>) => dataRequest(`/intervals/${id}`, 'PUT', data),

  // Parts
  getParts: () => dataRequest('/parts', 'GET'),
  addPart: (data: Record<string, unknown>) => dataRequest('/parts', 'POST', data),
  updatePart: (id: number, data: Record<string, unknown>) => dataRequest(`/parts/${id}`, 'PUT', data),

  // Documents
  getDocuments: () => dataRequest('/documents', 'GET'),
  saveDocument: (data: Record<string, unknown>) => dataRequest('/documents', 'POST', data),

  // Owners
  getOwners: () => dataRequest('/owners', 'GET'),
  addOwner: (data: Record<string, unknown>) => dataRequest('/owners', 'POST', data),
  updateOwner: (id: number, data: Record<string, unknown>) => dataRequest(`/owners/${id}`, 'PUT', data),

  // Stats
  getStats: () => dataRequest('/stats', 'GET'),

  // Notify
  testNotify: (telegram_bot_token?: string, telegram_chat_id?: string) =>
    notifyRequest('/test', 'POST', { telegram_bot_token, telegram_chat_id }),
  sendSummary: () => notifyRequest('/summary', 'POST'),
};
