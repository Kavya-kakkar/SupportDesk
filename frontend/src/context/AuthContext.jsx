import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('supportdesk_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('supportdesk_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('supportdesk_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.data && res.data.data.user) {
          const verifiedUser = res.data.data.user;
          setUser(verifiedUser);
          localStorage.setItem('supportdesk_user', JSON.stringify(verifiedUser));
        }
      } catch (err) {
        console.warn('Session expired or invalid token');
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, user: receivedUser } = res.data.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('supportdesk_token', receivedToken);
    localStorage.setItem('supportdesk_user', JSON.stringify(receivedUser));

    return receivedUser;
  };

  const register = async ({ name, email, password, organization }) => {
    const res = await api.post('/auth/register', { name, email, password, organization });
    const { token: receivedToken, user: receivedUser } = res.data.data;

    setToken(receivedToken);
    setUser(receivedUser);
    localStorage.setItem('supportdesk_token', receivedToken);
    localStorage.setItem('supportdesk_user', JSON.stringify(receivedUser));

    return receivedUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('supportdesk_token');
    localStorage.removeItem('supportdesk_user');
  };

  const loginAsDemo = async (role) => {
    if (role === 'admin') {
      return login('admin@company.com', 'Password123!');
    }
    return login('user@company.com', 'Password123!');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
