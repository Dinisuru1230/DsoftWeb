import { createContext, useContext, useState, useEffect, useRef } from 'react';

const API_BASE_URL = 'http://localhost:5050/api';
const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutes

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('malmalee_user') || sessionStorage.getItem('malmalee_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('malmalee_token') || sessionStorage.getItem('malmalee_token') || null);
  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  // Helper to clear both sessionStorage and localStorage on logout
  function clearAllAuthStorage() {
    try {
      sessionStorage.removeItem('malmalee_user');
      sessionStorage.removeItem('malmalee_token');
      localStorage.removeItem('malmalee_user');
      localStorage.removeItem('malmalee_token');
    } catch (e) {
      console.error('Failed to clear auth storage:', e);
    }
  }

  function logout() {
    setUser(null);
    setToken(null);
    clearAllAuthStorage();
  }

  // Validate token on mount
  useEffect(() => {
    async function verifyToken() {
      const storedToken = localStorage.getItem('malmalee_token') || sessionStorage.getItem('malmalee_token');
      if (storedToken) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = await res.json();
          if (res.ok && data.user) {
            setUser(data.user);
            setToken(storedToken);
            localStorage.setItem('malmalee_user', JSON.stringify(data.user));
            localStorage.setItem('malmalee_token', storedToken);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to verify token:', err);
        }
      } else {
        clearAllAuthStorage();
      }
      setLoading(false);
    }
    verifyToken();
  }, []);

  // 10-Minute Inactivity Auto-Logout Hook
  useEffect(() => {
    if (!user) return;

    function resetInactivityTimer() {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        console.warn('User inactive for 10 minutes. Logging out automatically.');
        logout();
      }, INACTIVITY_LIMIT_MS);
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => window.addEventListener(evt, resetInactivityTimer));

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach((evt) => window.removeEventListener(evt, resetInactivityTimer));
    };
  }, [user]);

  async function login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('malmalee_user', JSON.stringify(data.user));
      localStorage.setItem('malmalee_token', data.token);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network error. Could not connect to backend server.' };
    }
  }

  async function register(registerData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('malmalee_user', JSON.stringify(data.user));
      localStorage.setItem('malmalee_token', data.token);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: 'Network error. Could not connect to backend server.' };
    }
  }

  async function updateUser(updates) {
    try {
      if (!token) return { success: false, error: 'Not authenticated' };
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }
      setUser(data.user);
      localStorage.setItem('malmalee_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
