import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const PRESET_USERS = {
  doctor: {
    id: '654c00011b4e2d001a23ba01',
    name: 'Dr. John Mensah, MD',
    role: 'doctor',
    email: 'jmensah@universityclinic.edu.gh',
    licenseNumber: 'MDC-GH-99412',
    department: 'General Outpatient Clinic'
  },
  pharmacist: {
    id: '654c00021b4e2d001a23ba02',
    name: 'Pharm. Sarah Boateng, B.Pharm',
    role: 'pharmacist',
    email: 'sboateng@universityclinic.edu.gh',
    licenseNumber: 'PC-GH-33821',
    department: 'Main University Pharmacy'
  },
  nurse: {
    id: '654c00031b4e2d001a23ba03',
    name: 'Grace Osei, RN',
    role: 'nurse',
    email: 'gosei@universityclinic.edu.gh',
    licenseNumber: 'NMC-GH-55102',
    department: 'Triage & Inpatient Care'
  }
};

export const AuthProvider = ({ children }) => {
  const [activeRole, setActiveRole] = useState('doctor');
  const [currentUser, setCurrentUser] = useState(PRESET_USERS.doctor);
  const [token, setToken] = useState('mock-jwt-token-ccis-doctor');

  const switchRole = (newRole) => {
    if (PRESET_USERS[newRole]) {
      setActiveRole(newRole);
      setCurrentUser(PRESET_USERS[newRole]);
      setToken(`mock-jwt-token-ccis-${newRole}`);
      localStorage.setItem('ccis_active_role', newRole);
    }
  };

  useEffect(() => {
    const savedRole = localStorage.getItem('ccis_active_role');
    if (savedRole && PRESET_USERS[savedRole]) {
      setActiveRole(savedRole);
      setCurrentUser(PRESET_USERS[savedRole]);
      setToken(`mock-jwt-token-ccis-${savedRole}`);
    }
  }, []);

  const isDoctor = activeRole === 'doctor';
  const isPharmacist = activeRole === 'pharmacist';
  const isNurse = activeRole === 'nurse';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        activeRole,
        token,
        switchRole,
        isDoctor,
        isPharmacist,
        isNurse
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
