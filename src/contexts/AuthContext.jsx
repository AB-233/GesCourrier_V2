import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('gescourrier_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'authentification:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      setIsAuthenticated(true);
      localStorage.setItem('gescourrier_user', JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('gescourrier_user');
  };

  const register = async (userData) => {
    try {
      const res = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Liste des utilisateurs (admin)
  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return { success: true, users: data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Modifier un utilisateur (admin)
  const updateUser = async (id, userData) => {
    try {
      const res = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Supprimer un utilisateur (admin)
  const deleteUser = async (id) => {
    try {
      const res = await fetch(`http://localhost:4000/api/users/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Activer/désactiver un utilisateur (admin)
  const setUserActive = async (id, isActive) => {
    try {
      const res = await fetch(`http://localhost:4000/api/users/${id}/activate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    fetchUsers,
    updateUser,
    deleteUser,
    setUserActive
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};