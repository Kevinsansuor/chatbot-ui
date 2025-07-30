import { useState, useEffect } from 'react';
import { User } from '../types';

const ADMIN_HASH = 'admin123'; // In production, use a secure hash

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = (hash: string): boolean => {
    if (hash === ADMIN_HASH) {
      const adminUser: User = {
        id: 'admin-1',
        name: 'Administrator',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150',
        isAdmin: true,
      };
      setUser(adminUser);
      setIsLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const loginAsUser = () => {
    const regularUser: User = {
      id: 'user-1',
      name: 'Anderson F.',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=150',
      isAdmin: false,
    };
    setUser(regularUser);
  };

  const logout = () => {
    setUser(null);
  };

  return {
    user,
    isLoginModalOpen,
    setIsLoginModalOpen,
    login,
    loginAsUser,
    logout,
  };
};