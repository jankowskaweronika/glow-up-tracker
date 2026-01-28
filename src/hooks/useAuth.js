import { useState, useEffect, useCallback } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState(null);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/session', { credentials: 'include' });
      const data = await res.json();
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    }
    setIsChecking(false);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Błąd logowania');
        return false;
      }
      setIsAuthenticated(true);
      return true;
    } catch {
      setError('Nie można połączyć z serwerem');
      return false;
    }
  };

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isChecking, error, login, logout };
}
