import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockDoctor } from '../services/mockSharedData';
import { fetchDemoSessionToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('ccis_user');
    return savedUser ? JSON.parse(savedUser) : mockDoctor;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('ccis_token') || '';
  });

  useEffect(() => {
    localStorage.setItem('ccis_user', JSON.stringify(currentUser));
    if (token) {
      localStorage.setItem('ccis_token', token);
      localStorage.setItem('ccis_jwt', token);
    }
  }, [currentUser, token]);

  useEffect(() => {
    if (!token || token.startsWith('mock') || token.split('.').length !== 3) {
      fetchDemoSessionToken(currentUser?.role || 'doctor').then((signedToken) => {
        if (signedToken) {
          setToken(signedToken);
        }
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const switchRole = async (newRole) => {
    const roleProfiles = {
      doctor: { role: 'doctor', title: 'Dr.', firstName: 'Kwabena', lastName: 'Mensah', id: 'clinician-123', specialization: 'Internal Medicine & University Health' },
      nurse: { role: 'nurse', title: 'Nurse', firstName: 'Akua', lastName: 'Mansa', id: 'nurse-456', specialization: 'Triage & Vital Signs' },
      pharmacist: { role: 'pharmacist', title: 'Pharm.', firstName: 'Kweku', lastName: 'Addo', id: 'pharm-789', specialization: 'Dispensing Pharmacy' },
      receptionist: { role: 'receptionist', title: '', firstName: 'Rachel', lastName: 'Quaye', id: 'reception-account-1', specialization: 'Front Desk & Patient Intake' },
      patient: { role: 'patient', title: '', firstName: 'Kofi', lastName: 'Mensah', id: 'patient-account-1', specialization: 'Student / Patient' },
      admin: { role: 'admin', title: '', firstName: 'Emmanuel', lastName: 'Osei-Wusu', id: 'admin-001', specialization: 'Clinic System Administration' },
    };

    const target = roleProfiles[newRole] || { ...currentUser, role: newRole };
    const updatedUser = {
      ...currentUser,
      ...target,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem('ccis_user', JSON.stringify(updatedUser));

    const signedToken = await fetchDemoSessionToken(newRole);
    if (signedToken) {
      setToken(signedToken);
    }
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
