import React, { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';

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
        const usersRaw = localStorage.getItem('gescourrier_users');
        let users = usersRaw ? JSON.parse(usersRaw) : [];

        if (users.length === 0) {
          const hashedPassword = await bcrypt.hash('admin123', 10);
          
          const adminUser = {
            id: Date.now().toString(),
            firstName: 'Admin',
            lastName: 'GesCourrier',
            email: 'admin@gescourrier.com',
            role: 'ADMIN',
            password: hashedPassword,
            isActive: true,
            createdAt: new Date().toISOString()
          };
          
          users.push(adminUser);
          localStorage.setItem('gescourrier_users', JSON.stringify(users));
        }

        const storedUser = localStorage.getItem('gescourrier_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          const allUsers = JSON.parse(localStorage.getItem('gescourrier_users') || '[]');
          const userExists = allUsers.find(u => u.id === userData.id);

          if (userExists && userExists.isActive) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('gescourrier_user');
          }
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
      const users = JSON.parse(localStorage.getItem('gescourrier_users') || '[]');
      const userToLogin = users.find(u => u.email === email);
      
      if (!userToLogin) {
        throw new Error('Utilisateur non trouvé');
      }
      
      if (!userToLogin.isActive) {
        throw new Error('Ce compte est désactivé. Veuillez contacter un administrateur.');
      }

      const isValidPassword = await bcrypt.compare(password, userToLogin.password);
      if (!isValidPassword) {
        throw new Error('Mot de passe incorrect');
      }

      const userSession = {
        id: userToLogin.id,
        firstName: userToLogin.firstName,
        lastName: userToLogin.lastName,
        email: userToLogin.email,
        role: userToLogin.role
      };

      setUser(userSession);
      setIsAuthenticated(true);
      localStorage.setItem('gescourrier_user', JSON.stringify(userSession));
      
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
      const users = JSON.parse(localStorage.getItem('gescourrier_users') || '[]');
      
      if (users.find(u => u.email === userData.email)) {
        throw new Error('Un utilisateur avec cet email existe déjà');
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      const newUser = {
        id: Date.now().toString(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        password: hashedPassword,
        isActive: false,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('gescourrier_users', JSON.stringify(users));
      
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
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};