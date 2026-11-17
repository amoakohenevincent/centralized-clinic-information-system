import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDoctor } from '../services/mockSharedData';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('ccis_user');
    return savedUser ? JSON.parse(savedUser) : mockDoctor;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('ccis_token') || 'mock_jwt_token_doctor';
  });

  useEffect(() => {
    localStorage.setItem('ccis_user', JSON.stringify(currentUser));
    localStorage.setItem('ccis_token', token);
  }, [currentUser, token]);

  const switchRole = (newRole) => {
    const updatedUser = {
      ...currentUser,
      role: newRole,
      title: newRole === 'doctor' ? 'Dr.' : newRole === 'nurse' ? 'Nurse' : 'Admin',
      firstName: newRole === 'doctor' ? 'Sarah' : newRole === 'nurse' ? 'Emily' : 'James',
      lastName: newRole === 'doctor' ? 'Jenkins' : newRole === 'nurse' ? 'Taylor' : 'Wilson',
    };
    setCurrentUser(updatedUser);
  };

  const isDoctor = currentUser?.role === 'doctor';
  const isNurse = currentUser?.role === 'nurse';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        token,
        setToken,
        isDoctor,
        isNurse,
        isAdmin,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

