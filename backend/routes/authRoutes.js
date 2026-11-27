const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/shared/User');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'ccis_shared_jwt_secret_university_clinic_2026';

const DEMO_PROFILES = {
  doctor: {
    id: 'clinician-123',
    username: 'dr_kmensah',
    role: 'doctor',
    title: 'Dr.',
    firstName: 'Kwabena',
    lastName: 'Mensah',
    name: 'Dr. Kwabena Mensah',
    email: 'kwabena.mensah@clinic.ug.edu.gh',
    specialization: 'Internal Medicine & University Health',
    medicalLicenseNumber: 'MDC/RN/2014/88319',
  },
  nurse: {
    id: 'nurse-456',
    username: 'nurse_amansa',
    role: 'nurse',
    title: 'Nurse',
    firstName: 'Akua',
    lastName: 'Mansa',
    name: 'Nurse Akua Mansa',
    email: 'a.mansa@clinic.ug.edu.gh',
    specialization: 'Triage & Vital Signs (NMC-GH-4412)',
  },
  pharmacist: {
    id: 'pharm-789',
    username: 'pharm_kaddo',
    role: 'pharmacist',
    title: 'Pharm.',
    firstName: 'Kweku',
    lastName: 'Addo',
    name: 'Pharm. Kweku Addo',
    email: 'k.addo@clinic.ug.edu.gh',
    specialization: 'Dispensing & Clinical Pharmacy (PCG-8910)',
  },
  receptionist: {
    id: 'reception-account-1',
    username: 'rachel_quaye',
    role: 'receptionist',
    title: '',
    firstName: 'Rachel',
    lastName: 'Quaye',
    name: 'Rachel Quaye',
    email: 'r.quaye@clinic.ug.edu.gh',
    specialization: 'Front Desk & Patient Intake',
  },
  patient: {
    id: 'patient-account-1',
    username: 'kofi_mensah',
    role: 'patient',
    title: '',
    firstName: 'Kofi',
    lastName: 'Mensah',
    name: 'Kofi Mensah',
    email: 'k.mensah@st.ug.edu.gh',
    specialization: 'Level 300 Student - Commonwealth Hall',
  },
  admin: {
    id: 'admin-001',
    username: 'admin_eoseiwusu',
    role: 'admin',
    title: '',
    firstName: 'Emmanuel',
    lastName: 'Osei-Wusu',
    name: 'Emmanuel Osei-Wusu',
    email: 'admin@clinic.ug.edu.gh',
    specialization: 'UG Directorate of ICT & Systems',
  },
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user via credentials stored in MongoDB
 */
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username or email and password are required.',
      });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database offline. Use demo session endpoint in development mode.',
      });
    }

    const query = email ? { email: email.toLowerCase() } : { username };
    const user = await User.findOne(query);
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const payload = {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      title: user.title,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      name: user.fullName,
      specialization: user.specialization,
      medicalLicenseNumber: user.medicalLicenseNumber,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '12h' });
    return res.status(200).json({ success: true, token, user: payload });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * @route   POST /api/auth/demo-session
 * @desc    Issues a signed JWT for role switching in development/demo environments only
 */
router.post('/demo-session', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Demo role switching is disabled in production.',
    });
  }

  const requestedRole = String(req.body?.role || 'doctor').toLowerCase();
  const profile = DEMO_PROFILES[requestedRole];

  if (!profile) {
    return res.status(400).json({
      success: false,
      message: `Unsupported clinic role: ${requestedRole}`,
    });
  }

  const token = jwt.sign(profile, JWT_SECRET, { expiresIn: '12h' });
  return res.status(200).json({
    success: true,
    token,
    user: profile,
  });
});

module.exports = router;

