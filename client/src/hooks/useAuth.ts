import { useState, useCallback } from 'react';
import { api, setToken, getToken } from '../services/api';

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUser] = useState<{ userId: string; email: string; role: string } | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  return { token, user, login, logout };
}
