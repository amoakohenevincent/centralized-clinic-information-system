const Appointment = require('../models/shared/Appointment');
const Patient = require('../models/shared/Patient');
const Consultation = require('../models/Consultation');

/**
 * Get aggregated statistics for Doctor Dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const doctorId = req.user._id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Filter appointments for today
    const [
      todayAppointmentsCount,
      upcomingAppointmentsCount,
      awaitingConsultationCount,
      todayCompletedConsultationsCount,
      totalDoctorConsultationsCount,
    ] = await Promise.all([
      // 1. Today's appointments
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfToday, $lte: endOfToday },
      }),
      // 2. Upcoming appointments beyond today
      Appointment.countDocuments({
        appointmentDate: { $gt: endOfToday },
        status: { $in: ['scheduled', 'checked-in'] },
      }),
      // 3. Patients awaiting consultation right now (checked-in triage queue)
      Appointment.countDocuments({
        appointmentDate: { $gte: startOfToday, $lte: endOfToday },
        status: 'checked-in',
      }),
      // 4. Consultations completed today
      Consultation.countDocuments({
        consultationDate: { $gte: startOfToday, $lte: endOfToday },
        status: { $in: ['completed', 'amended'] },
      }),
      // 5. Total consultations conducted by this doctor
      Consultation.countDocuments({
        doctorId,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        todayAppointments: todayAppointmentsCount,
        upcomingAppointments: upcomingAppointmentsCount,
        awaitingConsultation: awaitingConsultationCount,
        completedToday: todayCompletedConsultationsCount,
        totalConsultations: totalDoctorConsultationsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get triage appointment queue for Doctor Dashboard
 */
const getAppointmentQueue = async (req, res, next) => {
  try {
    const { status, date } = req.query;

    let targetDateStart = new Date();
    targetDateStart.setHours(0, 0, 0, 0);

    let targetDateEnd = new Date();
    targetDateEnd.setHours(23, 59, 59, 999);

    if (date) {
      targetDateStart = new Date(date);
      targetDateStart.setHours(0, 0, 0, 0);
      targetDateEnd = new Date(date);
      targetDateEnd.setHours(23, 59, 59, 999);
    }

    const query = {
      appointmentDate: { $gte: targetDateStart, $lte: targetDateEnd },
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('patientId', 'patientId universityId firstName lastName gender dateOfBirth bloodGroup phoneNumber department patientType')
      .populate('doctorId', 'title firstName lastName specialization')
      .sort({ queueNumber: 1, appointmentTime: 1 })
      .lean();

    // Map each appointment to check if consultation is completed or existing
    const appointmentIds = appointments.map((a) => a._id);
    const existingConsultations = await Consultation.find({
      appointmentId: { $in: appointmentIds },
    })
      .select('_id appointmentId status consultationNumber')
      .lean();

    const consultationMap = new Map();
    existingConsultations.forEach((c) => {
      consultationMap.set(c.appointmentId.toString(), c);
    });

    const enrichedQueue = appointments.map((appt) => ({
      ...appt,
      consultation: consultationMap.get(appt._id.toString()) || null,
    }));

    return res.status(200).json({
      success: true,
      data: enrichedQueue,
      count: enrichedQueue.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Patient Search Controller
 * Searches registered patients by Patient ID, Name, or Student/Staff University ID
 */
const searchPatients = async (req, res, next) => {
  try {
    const { query = '', page = 1, limit = 20 } = req.query;

    const trimmedQuery = query.trim();
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    let searchFilter = {};

    if (trimmedQuery.length > 0) {
      const regex = new RegExp(trimmedQuery, 'i');
      searchFilter = {
        $or: [
          { patientId: regex },
          { universityId: regex },
          { firstName: regex },
          { lastName: regex },
          { email: regex },
        ],
      };
    }

    const [patients, total] = await Promise.all([
      Patient.find(searchFilter).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Patient.countDocuments(searchFilter),
    ]);

    // Check last consultation date for each patient
    const patientIds = patients.map((p) => p._id);
    const recentConsultations = await Consultation.aggregate([
      { $match: { patientId: { $in: patientIds } } },
      { $sort: { consultationDate: -1 } },
      {
        $group: {
          _id: '$patientId',
          lastConsultationDate: { $first: '$consultationDate' },
          totalConsultations: { $sum: 1 },
          lastDiagnosis: { $first: '$diagnoses' },
        },
      },
    ]);

    const statsMap = new Map();
    recentConsultations.forEach((item) => {
      statsMap.set(item._id.toString(), item);
    });

    const results = patients.map((patient) => {
      const clinicalStats = statsMap.get(patient._id.toString()) || {
        totalConsultations: 0,
        lastConsultationDate: null,
        lastDiagnosis: [],
      };

      return {
        _id: patient._id,
        patientId: patient.patientId,
        universityId: patient.universityId,
        patientType: patient.patientType,
        fullName: `${patient.firstName} ${patient.lastName}`,
        firstName: patient.firstName,
        lastName: patient.lastName,
        gender: patient.gender,
        dateOfBirth: patient.dateOfBirth,
        bloodGroup: patient.bloodGroup,
        department: patient.department,
        phoneNumber: patient.phoneNumber,
        email: patient.email,
        totalConsultations: clinicalStats.totalConsultations,
        lastConsultationDate: clinicalStats.lastConsultationDate,
        lastPrimaryDiagnosis:
          clinicalStats.lastDiagnosis && clinicalStats.lastDiagnosis.length > 0
            ? clinicalStats.lastDiagnosis[0].diagnosisName
            : null,
      };
    });

    return res.status(200).json({
      success: true,
      data: results,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAppointmentQueue,
  searchPatients,
};

