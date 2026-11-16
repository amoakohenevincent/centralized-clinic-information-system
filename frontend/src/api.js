export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function createApi(auth, baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api") {
  async function request(path, options = {}) {
    const token = typeof auth?.getAccessToken === "function"
      ? await auth.getAccessToken()
      : auth?.accessToken;
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new ApiError("The server returned an unreadable response.", response.status, "INVALID_RESPONSE");
    }
    if (!response.ok) {
      const error = payload?.error || {};
      throw new ApiError(error.message || "The request could not be completed.", response.status, error.code, error.details);
    }
    return payload.data;
  }

  return {
    request,
    getPatient: () => request("/patients/me"),
    createPatient: (profile) => request("/patients/me", { method: "POST", body: profile }),
    updatePatient: (profile) => request("/patients/me", { method: "PATCH", body: profile }),
    getAppointments: () => request("/appointments/mine"),
    getDoctors: () => request("/appointments/doctors"),
    getAvailability: (doctorId, from, to) => request(
      `/appointments/availability?doctorId=${encodeURIComponent(doctorId)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    ),
    bookAppointment: (booking) => request("/appointments", { method: "POST", body: booking }),
    cancelAppointment: (id, reason) => request(`/appointments/${id}/cancel`, {
      method: "PATCH",
      body: { reason }
    }),
    createWalkIn: (profile) => request("/patients", { method: "POST", body: profile }),
    searchPatients: (search) => request(`/patients?search=${encodeURIComponent(search)}`),
    getSchedule: (from, to, doctorId) => {
      const params = new URLSearchParams({ from, to });
      if (doctorId) params.set("doctorId", doctorId);
      return request(`/appointments/schedule?${params}`);
    },
    updateAppointmentStatus: (id, status) => request(`/appointments/${id}/status`, {
      method: "PATCH",
      body: { status }
    })
  };
}
