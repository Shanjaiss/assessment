import { createContext, useContext, useEffect, useState } from 'react';
import { storage, makeToken } from '../lib/storage';

const AuthCtx = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = storage.getToken();
    const u = storage.getCurrentUser();
    if (token && u) setUser(u);
    setLoading(false);
  }, []);

  const register = ({ name, email, password }) => {
    const users = storage.getUsers();
    const exists = users.find((x) => x.email === email.toLowerCase());
    if (exists) return { ok: false, error: 'Email already registered' };
    const newUser = {
      id: `u_${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password, // demo-only; never do this in prod
      createdAt: new Date().toISOString(),
    };
    storage.setUsers([...users, newUser]);
    const safe = { id: newUser.id, name: newUser.name, email: newUser.email };
    storage.setToken(makeToken({ sub: newUser.id, email: newUser.email }));
    storage.setCurrentUser(safe);
    setUser(safe);
    return { ok: true };
  };

  const login = ({ email, password }) => {
    const users = storage.getUsers();
    const found = users.find(
      (x) => x.email === email.toLowerCase() && x.password === password
    );
    if (!found) return { ok: false, error: 'Invalid email or password' };
    const safe = { id: found.id, name: found.name, email: found.email };
    storage.setToken(makeToken({ sub: found.id, email: found.email }));
    storage.setCurrentUser(safe);
    setUser(safe);
    return { ok: true };
  };

  const logout = () => {
    storage.clearToken();
    storage.clearCurrentUser();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
