import { createContext, useContext, useState } from 'react';

const DEFAULT_MOCK_USER = {
  name: 'Amara Perera',
  email: 'amara@malmalee.lk',
  phone: '+94 77 123 4567',
  address: '42 Flower Lane',
  city: 'Colombo 03',
  postalCode: '00300',
  joined: 'January 2024',
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('malmalee_user');
      return saved ? JSON.parse(saved) : DEFAULT_MOCK_USER; // Default to mock user so account pages are previewable immediately
    } catch {
      return DEFAULT_MOCK_USER;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('malmalee_token') || 'demo-token-123');

  function login(userData, authToken = 'demo-token-123') {
    const fullUser = { ...DEFAULT_MOCK_USER, ...userData };
    setUser(fullUser);
    setToken(authToken);
    localStorage.setItem('malmalee_user', JSON.stringify(fullUser));
    localStorage.setItem('malmalee_token', authToken);
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('malmalee_user');
    localStorage.removeItem('malmalee_token');
  }

  function updateUser(updates) {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('malmalee_user', JSON.stringify(updated));
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
