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
    const roleProfiles = {
      doctor: { role: 'doctor', title: 'Dr.', firstName: 'Sarah', lastName: 'Jenkins', id: 'clinician-123', specialization: 'Internal Medicine' },
      nurse: { role: 'nurse', title: 'Nurse', firstName: 'Emily', lastName: 'Taylor', id: 'nurse-456', specialization: 'Triage & Vitals' },
      pharmacist: { role: 'pharmacist', title: 'Pharm.', firstName: 'John', lastName: 'Mensah', id: 'pharm-789', specialization: 'Dispensing Pharmacy' },
      receptionist: { role: 'receptionist', title: '', firstName: 'Rachel', lastName: 'Desk', id: 'reception-account-1', specialization: 'Front Desk & Registration' },
      patient: { role: 'patient', title: '', firstName: 'Jordan', lastName: 'Example', id: 'patient-account-1', specialization: 'Student / Patient' },
      admin: { role: 'admin', title: '', firstName: 'James', lastName: 'Wilson', id: 'admin-001', specialization: 'System Administration' },
    };

    const target = roleProfiles[newRole] || { ...currentUser, role: newRole };
    const updatedUser = {
      ...currentUser,
      ...target,
    };
    setCurrentUser(updatedUser);
  };

  const isDoctor = currentUser?.role === 'doctor';
  const isNurse = currentUser?.role === 'nurse';
  const isAdmin = currentUser?.role === 'admin';
  const isPharmacist = currentUser?.role === 'pharmacist';
  const isReceptionist = currentUser?.role === 'receptionist';
  const isPatient = currentUser?.role === 'patient';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        user: currentUser, // alias for unified navbar
        setCurrentUser,
        token,
        setToken,
        isDoctor,
        isNurse,
        isAdmin,
        isPharmacist,
        isReceptionist,
        isPatient,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
