const API_BASE = import.meta.env.VITE_API_URL || '/api';

let authToken: string | null = localStorage.getItem('devzone_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('devzone_token', token);
  else localStorage.removeItem('devzone_token');
}

export function getToken(): string | null {
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok || !json.success) {
    if (res.status === 401) {
      setToken(null);
      window.location.reload();
    }
    throw new Error(json.error || 'Request failed');
  }
  return json.data;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { userId: string; email: string; role: string } }>('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }),
  getCards: (source?: 'live' | 'drafts') =>
    request<any[]>(`/cards${source ? `?source=${source}` : ''}`),
  getCard: (id: string) => request<any>(`/cards/${id}`),
  createCard: (card: any) => request<any>('/cards', { method: 'POST', body: JSON.stringify(card) }),
  updateCard: (id: string, card: any) => request<any>(`/cards/${id}`, { method: 'PUT', body: JSON.stringify(card) }),
  deleteCard: (id: string) => request<void>(`/cards/${id}`, { method: 'DELETE' }),
  getSynergies: (source?: 'live' | 'drafts') =>
    request<any[]>(`/synergies${source ? `?source=${source}` : ''}`),
  updateSynergy: (tribe: string, synergy: any) =>
    request<any>(`/synergies/${tribe}`, { method: 'PUT', body: JSON.stringify(synergy) }),
  getConfig: (source?: 'live' | 'drafts') =>
    request<any>(`/config${source ? `?source=${source}` : ''}`),
  updateConfig: (config: any) =>
    request<any>('/config', { method: 'PUT', body: JSON.stringify(config) }),
  getTheme: (source?: 'live' | 'drafts') =>
    request<any>(`/theme${source ? `?source=${source}` : ''}`),
  updateTheme: (theme: any) =>
    request<any>('/theme', { method: 'PUT', body: JSON.stringify(theme) }),
  uploadImage: async (file: File, name?: string) => {
    const form = new FormData();
    form.append('image', file);
    if (name) form.append('name', name);
    const headers: Record<string, string> = {};
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
    const res = await fetch(`${API_BASE}/images/upload`, { method: 'POST', headers, body: form });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data as { url: string; key: string };
  },
  getVersions: () => request<any[]>('/versions'),
  createVersion: (description: string) =>
    request<{ versionId: string }>('/versions', { method: 'POST', body: JSON.stringify({ description }) }),
  publishVersion: (id: string) =>
    request<void>(`/versions/${id}/publish`, { method: 'POST' }),
  rollbackVersion: (id: string) =>
    request<void>(`/versions/${id}/rollback`, { method: 'POST' }),
  getVersionDiff: (id: string) => request<any>(`/versions/${id}/diff`),
  publish: () => request<{ invalidationId: string; publishedAt: string }>('/deploy/publish', { method: 'POST' }),
  getDeployStatus: (invalidationId: string) =>
    request<{ status: string; createTime: string }>(`/deploy/status?invalidationId=${invalidationId}`),
};
