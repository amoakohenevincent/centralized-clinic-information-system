import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { createApi } from "./api";

const dateOnly = (date) => {
  const local = new Date(date);
  return new Date(local.getTime() - local.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const formatDate = (value) => new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
}).format(new Date(value));

function Alert({ type = "error", children }) {
  if (!children) return null;
  const style = type === "success"
    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
    : "border-rose-200 bg-rose-50 text-rose-800";
  return <div role={type === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${style}`}>{children}</div>;
}

function Loading({ label = "Loading..." }) {
  return <div className="flex items-center gap-3 py-10 text-sm text-slate-500" role="status">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-clinic-100 border-t-clinic-600" />{label}
  </div>;
}

function Panel({ title, description, action, children }) {
  return <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft sm:p-7">
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>;
}

function StatusBadge({ status }) {
  const colors = {
    booked: "bg-sky-50 text-sky-700",
    checked_in: "bg-amber-50 text-amber-700",
    in_consultation: "bg-violet-50 text-violet-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-slate-100 text-slate-600",
    no_show: "bg-rose-50 text-rose-700"
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${colors[status] || "bg-slate-100 text-slate-600"}`}>
    {String(status || "unknown").replaceAll("_", " ")}
  </span>;
}

function AppointmentList({ items, onCancel, empty = "No appointments to display." }) {
  if (!items.length) return <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">{empty}</p>;
  return <div className="divide-y divide-slate-100">
    {items.map((item) => <div key={item._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-slate-900">{formatDate(item.startsAt)}</p>
        <p className="mt-1 text-sm text-slate-500">Clinician: {item.doctorId}</p>
        {item.patientId?.legalName && <p className="text-sm text-slate-500">Patient: {item.patientId.preferredName || item.patientId.legalName}</p>}
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge status={item.status} />
        {onCancel && item.status === "booked" && new Date(item.startsAt) > new Date() &&
          <button type="button" className="text-sm font-semibold text-rose-700 hover:underline" onClick={() => onCancel(item._id)}>Cancel</button>}
      </div>
    </div>)}
  </div>;
}

function App({ auth }) {
  const api = useMemo(() => createApi(auth), [auth]);
  const user = auth?.user;
  const isPatient = user?.role === "patient";
  const isReceptionist = user?.role === "receptionist";
  const navItems = isPatient
    ? [["/", "Overview"], ["/register", "Registration"], ["/profile", "My profile"], ["/book", "Book visit"], ["/history", "History"]]
    : isReceptionist
      ? [["/reception", "Reception desk"], ["/schedule", "Daily schedule"], ["/book", "Book visit"]]
      : [];

  if (!user) {
    return <main className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-soft sm:p-10">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-clinic-50 text-xl font-black text-clinic-700">CC</div>
        <p className="text-xs font-bold uppercase tracking-[.2em] text-clinic-600">Campus clinic</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Patient services</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">Sign in using the university clinic’s shared account system to manage your profile and appointments.</p>
        {auth?.loginUrl
          ? <a className="button-primary mt-7" href={auth.loginUrl}>Continue to sign in</a>
          : <p className="mt-7 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Shared login is not connected yet. Ask the CCIS team to provide its authentication adapter.</p>}
      </div>
    </main>;
  }

  return <div className="min-h-screen">
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-clinic-600 text-sm font-black text-white">CC</span>
          <span><span className="block font-bold text-slate-900">Campus Care</span><span className="block text-xs text-slate-500">Patient & appointment services</span></span>
        </Link>
        <nav className="flex flex-wrap gap-1" aria-label="Main navigation">
          {navItems.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) =>
            `rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? "bg-clinic-50 text-clinic-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`
          }>{label}</NavLink>)}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <span className="max-w-40 truncate font-medium text-slate-700">{user.displayName || user.name || user.id}</span>
          {typeof auth?.signOut === "function" && <button className="text-slate-500 hover:text-slate-900" onClick={auth.signOut}>Sign out</button>}
        </div>
      </div>
    </header>
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <Routes>
        {isPatient && <>
          <Route path="/" element={<PatientDashboard api={api} user={user} />} />
          <Route path="/register" element={<PatientRegistration api={api} />} />
          <Route path="/profile" element={<PatientProfile api={api} />} />
          <Route path="/book" element={<BookAppointment api={api} role="patient" />} />
          <Route path="/history" element={<AppointmentHistory api={api} />} />
        </>}
        {isReceptionist && <>
          <Route path="/" element={<NavigateHome to="/reception" />} />
          <Route path="/reception" element={<ReceptionDesk api={api} />} />
          <Route path="/schedule" element={<DailySchedule api={api} />} />
          <Route path="/book" element={<BookAppointment api={api} role="receptionist" />} />
        </>}
        <Route path="*" element={<AccessDenied />} />
      </Routes>
    </main>
    <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-slate-400 sm:px-6">For urgent medical concerns, contact the clinic directly or use local emergency services.</footer>
  </div>;
}

function NavigateHome({ to }) {
  const navigate = useNavigate();
  useEffect(() => navigate(to, { replace: true }), [navigate, to]);
  return <Loading />;
}

function AccessDenied() {
  return <Panel title="Page unavailable"><p className="text-sm text-slate-500">Your account does not have access to this page.</p></Panel>;
}

function PatientDashboard({ api, user }) {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const load = useCallback(async () => {
    setState({ loading: true, error: "" });
    try {
      const [profile, visits] = await Promise.all([api.getPatient(), api.getAppointments()]);
      setPatient(profile);
      setAppointments(visits);
      setState({ loading: false, error: "" });
    } catch (error) {
      setState({ loading: false, error: error.status === 404 ? "Complete your patient registration to view your dashboard." : error.message });
    }
  }, [api]);
  useEffect(() => { load(); }, [load]);
  if (state.loading) return <Loading label="Loading your dashboard..." />;
  const upcoming = appointments.filter((item) => item.status === "booked" && new Date(item.startsAt) >= new Date()).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
  const past = appointments.filter((item) => new Date(item.startsAt) < new Date() || ["completed", "cancelled", "no_show"].includes(item.status));
  return <div className="space-y-7">
    <div className="rounded-3xl bg-gradient-to-br from-clinic-900 to-clinic-600 p-7 text-white shadow-soft sm:p-10">
      <p className="text-sm font-semibold text-emerald-100">Patient dashboard</p>
      <h1 className="mt-2 text-3xl font-bold">Welcome{patient?.preferredName || patient?.legalName ? `, ${patient.preferredName || patient.legalName.split(" ")[0]}` : user.displayName ? `, ${user.displayName}` : ""}</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50">Your clinic visits and profile details, all in one place.</p>
      <Link to="/book" className="mt-6 inline-flex rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-clinic-700 hover:bg-emerald-50">Book an appointment</Link>
    </div>
    <Alert>{state.error}</Alert>
    {!patient && <Link className="button-primary" to="/register">Complete patient registration</Link>}
    {patient && <div className="grid gap-5 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft md:col-span-1">
        <p className="text-sm text-slate-500">Patient number</p><p className="mt-2 break-all text-lg font-bold text-slate-900">{patient.patientNumber}</p>
        <p className="mt-5 text-sm text-slate-500">Contact phone</p><p className="mt-1 font-semibold text-slate-800">{patient.phone}</p>
        <Link to="/profile" className="mt-5 inline-block text-sm font-semibold text-clinic-700 hover:underline">View profile</Link>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft md:col-span-2">
        <div className="flex items-center justify-between"><h2 className="font-bold text-slate-900">Next appointment</h2><Link to="/history" className="text-sm font-semibold text-clinic-700">All visits</Link></div>
        {upcoming[0] ? <div className="mt-5 rounded-xl bg-clinic-50 p-4"><p className="font-bold text-clinic-900">{formatDate(upcoming[0].startsAt)}</p><p className="mt-1 text-sm text-clinic-700">Clinician: {upcoming[0].doctorId}</p><div className="mt-3"><StatusBadge status={upcoming[0].status} /></div></div>
          : <p className="mt-5 rounded-xl bg-slate-50 px-4 py-7 text-center text-sm text-slate-500">You have no upcoming appointments.</p>}
      </div>
    </div>}
    {patient && <Panel title="Recent visits" action={<Link to="/history" className="text-sm font-semibold text-clinic-700">View history</Link>}>
      <AppointmentList items={past.slice(0, 3)} empty="Your previous visits will appear here." />
    </Panel>}
    <p className="text-xs text-slate-500">Notification delivery status is shown after booking. A status of “not configured” means no message was sent.</p>
  </div>;
}

function PatientRegistration({ api }) {
  const [form, setForm] = useState({ legalName: "", dateOfBirth: "", phone: "", address: "" });
  const [state, setState] = useState({ saving: false, error: "", done: false });
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  async function submit(event) {
    event.preventDefault();
    setState({ saving: true, error: "", done: false });
    try {
      await api.createPatient({ ...form, dateOfBirth: new Date(`${form.dateOfBirth}T00:00:00`).toISOString() });
      setState({ saving: false, error: "", done: true });
    } catch (error) {
      setState({ saving: false, error: error.message, done: false });
    }
  }
  return <div className="mx-auto max-w-3xl space-y-5">
    <PageHeading eyebrow="Getting started" title="Patient registration" description="Create your clinic profile using the account you signed in with." />
    <Panel title="Your details" description="Your account is managed by the shared university sign-in system.">
      <Alert>{state.error}</Alert>{state.done && <Alert type="success">Your patient profile was created. Your unique patient number is now available on the dashboard.</Alert>}
      <form className="mt-5 grid gap-5 sm:grid-cols-2" onSubmit={submit}>
        <Field label="Legal name" name="legalName" value={form.legalName} onChange={update} required maxLength={120} />
        <Field label="Date of birth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={update} required max={dateOnly(new Date())} />
        <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={update} required maxLength={30} />
        <Field label="Address (optional)" name="address" value={form.address} onChange={update} maxLength={300} />
        <div className="sm:col-span-2"><button className="button-primary" disabled={state.saving || state.done}>{state.saving ? "Saving..." : state.done ? "Profile created" : "Create patient profile"}</button></div>
      </form>
    </Panel>
  </div>;
}

function PatientProfile({ api }) {
  const [form, setForm] = useState(null);
  const [state, setState] = useState({ loading: true, saving: false, error: "", success: "" });
  useEffect(() => {
    api.getPatient().then((patient) => setForm({
      patientNumber: patient.patientNumber,
      legalName: patient.legalName,
      preferredName: patient.preferredName || "",
      dateOfBirth: dateOnly(patient.dateOfBirth),
      phone: patient.phone,
      address: patient.address || ""
    })).catch((error) => setState({ loading: false, saving: false, error: error.message, success: "" }))
      .finally(() => setState((current) => ({ ...current, loading: false })));
  }, [api]);
  async function save(event) {
    event.preventDefault();
    setState({ loading: false, saving: true, error: "", success: "" });
    try {
      await api.updatePatient({ preferredName: form.preferredName, phone: form.phone, address: form.address });
      setState({ loading: false, saving: false, error: "", success: "Your profile was updated." });
    } catch (error) {
      setState({ loading: false, saving: false, error: error.message, success: "" });
    }
  }
  if (state.loading) return <Loading label="Loading your profile..." />;
  if (!form) return <Alert>{state.error}</Alert>;
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  return <div className="mx-auto max-w-3xl space-y-5">
    <PageHeading eyebrow="Your information" title="Patient profile" description="Update contact details. Name and date of birth are read-only here." />
    <Panel title="Profile details">
      <Alert>{state.error}</Alert><Alert type="success">{state.success}</Alert>
      <form className="mt-5 grid gap-5 sm:grid-cols-2" onSubmit={save}>
        <Field label="Patient number" value={form.patientNumber} readOnly />
        <Field label="Legal name" value={form.legalName} readOnly />
        <Field label="Preferred name" name="preferredName" value={form.preferredName} onChange={update} maxLength={80} />
        <Field label="Date of birth" value={form.dateOfBirth} readOnly />
        <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={update} required maxLength={30} />
        <Field label="Address" name="address" value={form.address} onChange={update} maxLength={300} />
        <div className="sm:col-span-2"><button className="button-primary" disabled={state.saving}>{state.saving ? "Saving..." : "Save changes"}</button></div>
      </form>
    </Panel>
  </div>;
}

function BookAppointment({ api, role }) {
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({ doctorId: "", date: dateOnly(new Date(Date.now() + 86400000)), startsAt: "", patientId: "" });
  const [state, setState] = useState({ loading: true, searching: false, saving: false, error: "", success: "" });
  useEffect(() => {
    api.getDoctors().then((items) => {
      setDoctors(items);
      setForm((current) => ({ ...current, doctorId: items[0]?.id || "" }));
      setState((current) => ({ ...current, loading: false }));
    }).catch((error) => setState((current) => ({ ...current, loading: false, error: error.message })));
  }, [api]);
  async function findSlots(event) {
    event.preventDefault();
    setState((current) => ({ ...current, searching: true, error: "", success: "" }));
    try {
      const start = new Date(`${form.date}T00:00:00`);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      const available = await api.getAvailability(form.doctorId, start.toISOString(), end.toISOString());
      setSlots(available);
      setForm((current) => ({ ...current, startsAt: "" }));
      setState((current) => ({ ...current, searching: false, error: "" }));
    } catch (error) {
      setState((current) => ({ ...current, searching: false, error: error.message }));
    }
  }
  async function book(event) {
    event.preventDefault();
    setState((current) => ({ ...current, saving: true, error: "", success: "" }));
    try {
      const result = await api.bookAppointment({
        doctorId: form.doctorId,
        startsAt: form.startsAt,
        ...(role === "receptionist" ? { patientId: form.patientId.trim() } : {})
      });
      const appointment = result.appointment;
      const notificationText = `Confirmation: ${result.notifications.confirmation}; reminder: ${result.notifications.reminder}.`;
      setState((current) => ({ ...current, saving: false, success: `Appointment confirmed for ${formatDate(appointment.startsAt)}. ${notificationText}` }));
      setSlots((current) => current.filter((slot) => new Date(slot.startsAt).toISOString() !== new Date(appointment.startsAt).toISOString()));
      setForm((current) => ({ ...current, startsAt: "" }));
    } catch (error) {
      setState((current) => ({ ...current, saving: false, error: error.message }));
    }
  }
  return <div className="mx-auto max-w-3xl space-y-5">
    <PageHeading eyebrow="Scheduling" title="Book an appointment" description="Choose a clinician and an available time. A booking is confirmed only after the server accepts it." />
    <Panel title="Appointment details">
      <Alert>{state.error}</Alert><Alert type="success">{state.success}</Alert>
      {state.loading ? <Loading label="Loading clinician directory..." /> : <>
        <form className="grid gap-5 sm:grid-cols-2" onSubmit={findSlots}>
          <label className="label">Clinician
            <select className="field" value={form.doctorId} onChange={(event) => setForm({ ...form, doctorId: event.target.value })} required>
              <option value="">Select a clinician</option>
              {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name || doctor.id}</option>)}
            </select>
          </label>
          <Field label="Date" name="date" type="date" value={form.date} min={dateOnly(new Date())} onChange={(event) => setForm({ ...form, date: event.target.value })} required />
          {role === "receptionist" && <div className="sm:col-span-2"><Field label="Patient ID" name="patientId" value={form.patientId} onChange={(event) => setForm({ ...form, patientId: event.target.value })} placeholder="MongoDB patient ID" required /></div>}
          <div className="sm:col-span-2"><button className="button-secondary" disabled={!form.doctorId || state.searching}>{state.searching ? "Checking availability..." : "Show available times"}</button></div>
        </form>
        {!!slots.length && <form className="mt-7 border-t border-slate-100 pt-6" onSubmit={book}>
          <label className="label">Available appointment time
            <select className="field" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} required>
              <option value="">Select a time</option>
              {slots.map((slot) => <option key={slot.startsAt} value={new Date(slot.startsAt).toISOString()}>{formatDate(slot.startsAt)}</option>)}
            </select>
          </label>
          <button className="button-primary mt-5" disabled={state.saving || !form.startsAt}>{state.saving ? "Booking..." : "Confirm appointment"}</button>
        </form>}
        {!state.loading && !slots.length && !state.searching && <p className="mt-5 text-sm text-slate-500">Select a clinician and date, then check availability.</p>}
      </>}
    </Panel>
  </div>;
}

function AppointmentHistory({ api }) {
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const load = useCallback(() => api.getAppointments().then((items) => {
    setAppointments(items);
    setState({ loading: false, error: "" });
  }).catch((error) => setState({ loading: false, error: error.message })), [api]);
  useEffect(() => { load(); }, [load]);
  async function cancel(id) {
    try {
      await api.cancelAppointment(id);
      await load();
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    }
  }
  if (state.loading) return <Loading label="Loading appointment history..." />;
  return <div className="space-y-5">
    <PageHeading eyebrow="Your visits" title="Appointment history" description="Review past and upcoming appointments. Eligible future bookings can be cancelled." />
    <Panel title="All appointments"><Alert>{state.error}</Alert><AppointmentList items={appointments} onCancel={cancel} /></Panel>
  </div>;
}

function ReceptionDesk({ api }) {
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState([]);
  const [state, setState] = useState({ loading: false, error: "", success: "" });
  const [form, setForm] = useState({ legalName: "", dateOfBirth: "", phone: "" });
  async function searchPatients(event) {
    event.preventDefault();
    setState({ loading: true, error: "", success: "" });
    try {
      setPatients(await api.searchPatients(search));
      setState({ loading: false, error: "", success: "" });
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  }
  async function createWalkIn(event) {
    event.preventDefault();
    setState({ loading: true, error: "", success: "" });
    try {
      const patient = await api.createWalkIn({ ...form, dateOfBirth: new Date(`${form.dateOfBirth}T00:00:00`).toISOString() });
      setState({ loading: false, error: "", success: `Walk-in patient created: ${patient.patientNumber}` });
      setForm({ legalName: "", dateOfBirth: "", phone: "" });
    } catch (error) {
      setState({ loading: false, error: error.message, success: "" });
    }
  }
  return <div className="space-y-7">
    <PageHeading eyebrow="Front desk" title="Reception dashboard" description="Search for existing patient records or register a walk-in patient." />
    <Alert>{state.error}</Alert><Alert type="success">{state.success}</Alert>
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Find a patient" description="Search by name, patient number, or phone.">
        <form className="flex gap-2" onSubmit={searchPatients}><input className="field mt-0" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients..." required /><button className="button-primary" disabled={state.loading}>Search</button></form>
        {state.loading ? <Loading /> : <div className="mt-4 divide-y divide-slate-100">{patients.map((patient) => <div key={patient._id} className="py-3"><p className="font-semibold text-slate-800">{patient.preferredName || patient.legalName}</p><p className="text-xs text-slate-500">{patient.patientNumber} · {patient.phone}</p></div>)}{patients.length === 0 && <p className="py-5 text-sm text-slate-500">Search results will appear here.</p>}</div>}
      </Panel>
      <Panel title="Register a walk-in" description="This creates a patient profile without creating a separate login account.">
        <form className="space-y-4" onSubmit={createWalkIn}>
          <Field label="Legal name" value={form.legalName} onChange={(event) => setForm({ ...form, legalName: event.target.value })} required maxLength={120} />
          <Field label="Date of birth" type="date" value={form.dateOfBirth} max={dateOnly(new Date())} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} required />
          <Field label="Phone number" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required maxLength={30} />
          <button className="button-primary" disabled={state.loading}>{state.loading ? "Saving..." : "Create walk-in profile"}</button>
        </form>
      </Panel>
    </div>
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Search before creating a walk-in record. A name match is only a possible duplicate and should be verified by staff.</div>
  </div>;
}

function DailySchedule({ api }) {
  const [date, setDate] = useState(dateOnly(new Date()));
  const [appointments, setAppointments] = useState([]);
  const [state, setState] = useState({ loading: true, error: "" });
  const load = useCallback(async () => {
    setState({ loading: true, error: "" });
    try {
      const from = new Date(`${date}T00:00:00`);
      const to = new Date(from);
      to.setDate(to.getDate() + 1);
      setAppointments(await api.getSchedule(from.toISOString(), to.toISOString()));
      setState({ loading: false, error: "" });
    } catch (error) {
      setState({ loading: false, error: error.message });
    }
  }, [api, date]);
  useEffect(() => { load(); }, [load]);
  async function changeStatus(id, status) {
    try {
      await api.updateAppointmentStatus(id, status);
      await load();
    } catch (error) {
      setState((current) => ({ ...current, error: error.message }));
    }
  }
  return <div className="space-y-5">
    <PageHeading eyebrow="Clinic operations" title="Daily appointment schedule" description="Review today’s appointments and update their status." />
    <Panel title="Schedule" action={<label className="text-sm font-semibold text-slate-600">Date <input className="field mt-1 w-auto" type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>}>
      <Alert>{state.error}</Alert>
      {state.loading ? <Loading label="Loading daily schedule..." /> : appointments.length === 0
        ? <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">No appointments are scheduled for this date.</p>
        : <div className="divide-y divide-slate-100">{appointments.map((item) => <div key={item._id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="font-semibold text-slate-900">{formatDate(item.startsAt)}</p><p className="mt-1 text-sm text-slate-600">{item.patientId?.preferredName || item.patientId?.legalName || "Patient"} · {item.patientId?.patientNumber || "No patient number"}</p><p className="text-xs text-slate-500">Clinician: {item.doctorId}</p></div>
          <div className="flex flex-wrap items-center gap-3"><StatusBadge status={item.status} />
            {item.status === "booked" && <button className="button-secondary" onClick={() => changeStatus(item._id, "checked_in")}>Check in</button>}
            {item.status === "checked_in" && <button className="button-secondary" onClick={() => changeStatus(item._id, "in_consultation")}>Start visit</button>}
            {item.status === "in_consultation" && <button className="button-secondary" onClick={() => changeStatus(item._id, "completed")}>Complete</button>}
          </div>
        </div>)}</div>}
    </Panel>
  </div>;
}

function PageHeading({ eyebrow, title, description }) {
  return <div className="mb-2"><p className="text-xs font-bold uppercase tracking-[.18em] text-clinic-600">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p></div>;
}

function Field({ label, name, value, onChange, type = "text", ...props }) {
  return <label className="label">{label}<input className="field" name={name} type={type} value={value ?? ""} onChange={onChange} {...props} /></label>;
}

export default App;
