import { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5050/api';
const INACTIVITY_LIMIT_MS = 10 * 60 * 1000; // 10 minutes

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved =
        localStorage.getItem('dsoftpack_user') ||
        localStorage.getItem('malmalee_user') ||
        localStorage.getItem('dsoft_user') ||
        sessionStorage.getItem('dsoftpack_user') ||
        sessionStorage.getItem('malmalee_user') ||
        sessionStorage.getItem('dsoft_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() =>
    localStorage.getItem('dsoftpack_token') ||
    localStorage.getItem('malmalee_token') ||
    localStorage.getItem('dsoft_token') ||
    sessionStorage.getItem('dsoftpack_token') ||
    sessionStorage.getItem('malmalee_token') ||
    sessionStorage.getItem('dsoft_token') ||
    null
  );

  const [loading, setLoading] = useState(true);
  const inactivityTimerRef = useRef(null);

  // Helper to save token/user to all keys for seamless compatibility
  function saveAuthData(userData, tokenStr) {
    setUser(userData);
    setToken(tokenStr);
    if (userData) {
      const uJson = JSON.stringify(userData);
      localStorage.setItem('dsoftpack_user', uJson);
      localStorage.setItem('malmalee_user', uJson);
      localStorage.setItem('dsoft_user', uJson);
    }
    if (tokenStr) {
      localStorage.setItem('dsoftpack_token', tokenStr);
      localStorage.setItem('malmalee_token', tokenStr);
      localStorage.setItem('dsoft_token', tokenStr);
    }
  }

  // Helper to clear all auth storage keys on logout
  function clearAllAuthStorage() {
    try {
      ['dsoftpack_user', 'dsoftpack_token', 'malmalee_user', 'malmalee_token', 'dsoft_user', 'dsoft_token'].forEach((k) => {
        sessionStorage.removeItem(k);
        localStorage.removeItem(k);
      });
    } catch (e) {
      console.error('Failed to clear auth storage:', e);
    }
  }

  function logout(showToast = true) {
    const role = user?.role;
    setUser(null);
    setToken(null);
    clearAllAuthStorage();
    if (showToast) {
      if (role === 'ADMIN') {
        toast.success('Signed out of Admin Panel successfully.');
      } else {
        toast('You have been signed out. Come back soon!', { icon: '👋' });
      }
    }
  }

  // Validate token on mount
  useEffect(() => {
    async function verifyToken() {
      const storedToken =
        localStorage.getItem('dsoftpack_token') ||
        localStorage.getItem('malmalee_token') ||
        localStorage.getItem('dsoft_token') ||
        sessionStorage.getItem('dsoftpack_token') ||
        sessionStorage.getItem('malmalee_token') ||
        sessionStorage.getItem('dsoft_token');

      if (storedToken) {
        try {
          const res = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = await res.json();
          if (res.ok && data.user) {
            saveAuthData(data.user, storedToken);
          } else {
            logout(false);
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
      saveAuthData(data.user, data.token);
      return { success: true, user: data.user };
    } catch {
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
      saveAuthData(data.user, data.token);
      return { success: true, user: data.user };
    } catch {
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
      saveAuthData(data.user, token);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async function changePassword({ currentPassword, newPassword }) {
    try {
      if (!token) return { success: false, error: 'Not authenticated' };
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update password' };
      }
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, changePassword, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
