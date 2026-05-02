// Central API client — all backend calls go through here
const BASE_URL = 'http://localhost:5000/api';

// Stored token from login
function getToken(): string | null {
  return localStorage.getItem('aethera_token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: authHeaders(),
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'API error');
  return json;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Transaction {
  _id: string;
  txId: number;
  sender: string;
  receiver: string;
  amount: number;
  timestamp: number;
  blockchainHash: string;
  blockNumber: number;
  flagResult: {
    status: 'clean' | 'suspicious' | 'unknown';
    reason: string;
    source?: 'python' | 'fallback';
  };
  createdAt: string;
}

export interface Analytics {
  monthlyTotals: { month: string; total: number; count: number }[];
  topReceivers: { name: string; total: number; count: number }[];
  flaggedCount: number;
  totalTransactions: number;
  totalVolume: number;
}

export interface HealthStatus {
  blockchain: 'ok' | 'down';
  mongodb: 'ok' | 'down';
  python: 'ok' | 'down';
}

export interface User {
  email: string;
  role: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const api = {
  // Health
  health: () =>
    request<{ success: boolean; data: HealthStatus }>('/health'),

  // Transactions
  getTransactions: (flagged?: boolean) =>
    request<{ success: boolean; count: number; data: Transaction[] }>(
      flagged ? '/transactions?flagged=true' : '/transactions'
    ),

  getTransaction: (id: number | string) =>
    request<{ success: boolean; data: Transaction }>(`/transactions/${id}`),

  verifyTransaction: (id: number | string) =>
    request<{ success: boolean; data: Transaction }>(`/transactions/verify/${id}`),

  createTransaction: (body: {
    sender: string;
    receiver: string;
    amount: number;
    timestamp?: number;
  }) =>
    request<{ success: boolean; data: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // Analytics
  getAnalytics: () =>
    request<{ success: boolean; data: Analytics }>('/analytics'),

  // Auth
  login: (email: string, password: string) =>
    request<{ success: boolean; data: AuthResponse }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getUsers: () =>
    request<{ success: boolean; data: User[] }>('/users'),
};

// Auth helpers
export function saveAuth(data: AuthResponse) {
  localStorage.setItem('aethera_token', data.token);
  localStorage.setItem('aethera_user', JSON.stringify(data.user));
}

export function getUser(): User | null {
  const raw = localStorage.getItem('aethera_user');
  return raw ? JSON.parse(raw) : null;
}

export function clearAuth() {
  localStorage.removeItem('aethera_token');
  localStorage.removeItem('aethera_user');
}

// Format ₹ (Indian Rupee) — override for backend amounts
export function formatINR(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

// Unix timestamp → readable date
export function formatTimestamp(ts: number) {
  return new Date(ts * 1000).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
