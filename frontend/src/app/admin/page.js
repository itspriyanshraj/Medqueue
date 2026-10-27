"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { requestApi } from "../../components/api";

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const emptyDoctor = {
  name: "",
  email: "",
  phone: "",
  specialization: "",
  qualification: "",
  experience: "",
  hospitalName: "",
  address: "",
  city: "",
  consultationFee: "",
  availableDays: [],
  availableTime: "",
  profileImage: "",
  isAvailable: true,
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [currentAdminId, setCurrentAdminId] = useState("");
  const [doctor, setDoctor] = useState(emptyDoctor);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [savingDoctorId, setSavingDoctorId] = useState(null);
  const [doctorActionError, setDoctorActionError] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [userRoleDrafts, setUserRoleDrafts] = useState({});
  const [savingUserId, setSavingUserId] = useState(null);
  const [userActionError, setUserActionError] = useState("");
  const [activeSection, setActiveSection] = useState("doctors");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const result = await requestApi("/auth/me");
        if (!active) return;
        if (result.user?.role !== "admin") {
          window.location.replace("/admin/login");
          return;
        }

        setCurrentAdminId(result.user.id);
        setAuthorized(true);
        setLoadingDoctors(true);
        const doctorResult = await requestApi("/doctors");
        if (active) setDoctors(doctorResult.doctors || []);
      } catch {
        if (active) window.location.replace("/admin/login");
      } finally {
        if (active) {
          setCheckingAccess(false);
          setLoadingDoctors(false);
        }
      }
    }

    checkAccess();
    return () => {
      active = false;
    };
  }, []);

  const openUsers = useCallback(async () => {
    setActiveSection("users");
    if (usersLoaded || loadingUsers) return;

    setLoadingUsers(true);
    setUsersError("");
    try {
      const result = await requestApi("/auth/users");
      setUsers(result.users || []);
      setUsersLoaded(true);
    } catch (reason) {
      setUsersError(reason.message || "Could not load users.");
    } finally {
      setLoadingUsers(false);
    }
  }, [usersLoaded, loadingUsers]);

  useEffect(() => {
    function handleAdminSection(event) {
      const section = event.detail;
      if (section === "users") openUsers();
      else if (section === "doctors" || section === "add-doctor") setActiveSection(section);
    }

    window.addEventListener("medqueue:admin-section", handleAdminSection);
    return () => window.removeEventListener("medqueue:admin-section", handleAdminSection);
  }, [openUsers]);

  function updateDoctor(event) {
    const { name, value, checked, type } = event.target;
    if (name === "availableDays") {
      setDoctor((current) => ({
        ...current,
        availableDays: checked
          ? [...current.availableDays, value]
          : current.availableDays.filter((day) => day !== value),
      }));
      return;
    }

    setDoctor((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function submitDoctor(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const result = await requestApi(editingDoctorId ? `/doctors/${editingDoctorId}` : "/doctors", {
        method: editingDoctorId ? "PATCH" : "POST",
        body: JSON.stringify({
          ...doctor,
          experience: Number(doctor.experience),
          consultationFee: Number(doctor.consultationFee),
        }),
      });
      setDoctors((current) => editingDoctorId
        ? current.map((item) => item._id === editingDoctorId ? result.doctor : item)
        : [result.doctor, ...current]);
      setSuccess(editingDoctorId ? `${result.doctor.name}'s profile has been updated.` : `${result.doctor.name} has been added to the doctor directory.`);
      setDoctor(emptyDoctor);
      setEditingDoctorId(null);
    } catch (reason) {
      setError(reason.message || "Could not save this doctor. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function editDoctorProfile(item) {
    setDoctor({
      ...emptyDoctor,
      ...item,
      experience: String(item.experience ?? ""),
      consultationFee: String(item.consultationFee ?? ""),
      availableDays: Array.isArray(item.availableDays) ? item.availableDays : [],
      isAvailable: item.isAvailable !== false,
    });
    setEditingDoctorId(item._id);
    setError("");
    setSuccess("");
    setActiveSection("add-doctor");
    window.dispatchEvent(new CustomEvent("medqueue:admin-section", { detail: "add-doctor" }));
  }

  async function toggleDoctorAvailability(item) {
    setDoctorActionError("");
    setSavingDoctorId(item._id);
    try {
      const result = await requestApi(`/doctors/${item._id}`, {
        method: "PATCH",
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      setDoctors((current) => current.map((doctorItem) => doctorItem._id === item._id ? result.doctor : doctorItem));
    } catch (reason) {
      setDoctorActionError(reason.message || "Could not update doctor availability.");
    } finally {
      setSavingDoctorId(null);
    }
  }

  async function saveUserRole(item) {
    const role = userRoleDrafts[item._id] ?? item.role;
    if (role === item.role) return;
    setUserActionError("");
    setSavingUserId(item._id);
    try {
      const result = await requestApi(`/auth/users/${item._id}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      setUsers((current) => current.map((user) => user._id === item._id ? { ...user, ...result.user } : user));
      setUserRoleDrafts((current) => ({ ...current, [item._id]: result.user.role }));
    } catch (reason) {
      setUserActionError(reason.message || "Could not update this account role.");
    } finally {
      setSavingUserId(null);
    }
  }

  function cancelDoctorEdit() {
    setDoctor(emptyDoctor);
    setEditingDoctorId(null);
    setError("");
    setSuccess("");
  }

  return <>
    <Navbar />
    <main className="admin-page">
      <div className="container admin-shell">
        {checkingAccess ? (
          <div className="state-panel" role="status"><span className="loading-spinner" />Checking administrator access…</div>
        ) : authorized ? <>
          <header className="admin-heading">
            <div>
              <span className="section-eyebrow">MEDQUEUE ADMINISTRATION</span>
              <h1>Doctor directory</h1>
              <p>Add a verified doctor profile. It will appear in search as soon as you save it.</p>
            </div>
            <Link className="admin-back-link" href="/doctors">View public directory <span aria-hidden="true">→</span></Link>
          </header>

          {activeSection === "add-doctor" && <section className="admin-card" aria-labelledby="add-doctor-heading">
            <div className="admin-card-heading">
              <div>
                <span className="admin-card-kicker">{editingDoctorId ? "EDIT PROFILE" : "NEW PROFILE"}</span>
                <h2 id="add-doctor-heading">{editingDoctorId ? "Edit doctor profile" : "Add a doctor"}</h2>
              </div>
              <span className="admin-doctor-count">{doctors.length} {doctors.length === 1 ? "doctor" : "doctors"}</span>
            </div>

            <form className="admin-doctor-form" onSubmit={submitDoctor}>
              <label>Doctor name<input name="name" value={doctor.name} onChange={updateDoctor} required minLength={2} /></label>
              <label>Email address<input name="email" type="email" value={doctor.email} onChange={updateDoctor} required /></label>
              <label>Phone number<input name="phone" type="tel" value={doctor.phone} onChange={updateDoctor} required /></label>
              <label>Specialization<input name="specialization" value={doctor.specialization} onChange={updateDoctor} required /></label>
              <label>Qualification<input name="qualification" value={doctor.qualification} onChange={updateDoctor} required /></label>
              <label>Years of experience<input name="experience" type="number" min="0" step="1" value={doctor.experience} onChange={updateDoctor} required /></label>
              <label>Hospital name<input name="hospitalName" value={doctor.hospitalName} onChange={updateDoctor} required /></label>
              <label>City<input name="city" value={doctor.city} onChange={updateDoctor} required /></label>
              <label>Consultation fee (₹)<input name="consultationFee" type="number" min="0" step="0.01" value={doctor.consultationFee} onChange={updateDoctor} required /></label>
              <label className="admin-field-wide">Hospital address<input name="address" value={doctor.address} onChange={updateDoctor} required /></label>
              <label>Available hours<input name="availableTime" value={doctor.availableTime} onChange={updateDoctor} placeholder="e.g. 10:00 AM – 2:00 PM" /></label>
              <label>Profile image URL<input name="profileImage" type="url" value={doctor.profileImage} onChange={updateDoctor} placeholder="https://…" /></label>

              <fieldset className="admin-days-field admin-field-wide">
                <legend>Available days</legend>
                <div className="admin-days-list">
                  {daysOfWeek.map((day) => <label key={day}>
                    <input type="checkbox" name="availableDays" value={day} checked={doctor.availableDays.includes(day)} onChange={updateDoctor} />
                    <span>{day.slice(0, 3)}</span>
                  </label>)}
                </div>
              </fieldset>

              <label className="admin-availability-toggle admin-field-wide">
                <input name="isAvailable" type="checkbox" checked={doctor.isAvailable} onChange={updateDoctor} />
                <span>Doctor is currently accepting appointments</span>
              </label>

              {error && <p className="auth-error admin-field-wide" role="alert">{error}</p>}
              {success && <p className="admin-success admin-field-wide" role="status">{success}</p>}
              <div className="admin-form-actions admin-field-wide">
                {editingDoctorId && <button className="admin-cancel-edit" type="button" onClick={cancelDoctorEdit}>Cancel</button>}
                <button className="admin-submit" type="submit" disabled={saving}>
                  {saving ? "Saving doctor…" : editingDoctorId ? "Save changes" : "Save doctor profile"}<span aria-hidden="true">→</span>
                </button>
              </div>
            </form>
          </section>}

          {activeSection === "doctors" && <section className="admin-list-section" aria-labelledby="doctor-list-heading">
            <div className="admin-list-heading">
              <div><span className="admin-card-kicker">DIRECTORY</span><h2 id="doctor-list-heading">Current doctors</h2></div>
              <span>{doctors.length} profiles</span>
            </div>
            {doctorActionError && <p className="auth-error admin-list-error" role="alert">{doctorActionError}</p>}
            {loadingDoctors ? <p className="admin-muted">Loading doctor profiles…</p> : doctors.length ? (
              <div className="admin-doctor-list">
                {doctors.map((item) => <article className="admin-doctor-row" key={item._id}>
                  <span className="admin-list-avatar" aria-hidden="true">{item.name?.trim()?.[0]?.toUpperCase() || "D"}</span>
                  <span className="admin-list-copy"><strong>{item.name}</strong><small>{item.specialization}</small></span>
                  <span className="admin-doctor-location"><strong>{item.hospitalName || "Clinic"}</strong><small>{item.city || item.address || "Location not added"}</small></span>
                  <span className="admin-doctor-fee"><strong>₹{Number(item.consultationFee || 0).toLocaleString("en-IN")}</strong><small>per visit</small></span>
                  <span className={`admin-list-status ${item.isAvailable ? "is-open" : "is-closed"}`}>{item.isAvailable ? "Available" : "Unavailable"}</span>
                  <span className="admin-doctor-actions">
                    <button type="button" onClick={() => editDoctorProfile(item)} aria-label={`Edit ${item.name}`}>Edit</button>
                    <button type="button" onClick={() => toggleDoctorAvailability(item)} disabled={savingDoctorId === item._id}>
                      {savingDoctorId === item._id ? "Saving…" : item.isAvailable ? "Mark unavailable" : "Mark available"}
                    </button>
                  </span>
                </article>)}
              </div>
            ) : <p className="admin-muted">No doctor profiles have been added yet.</p>}
          </section>}

          {activeSection === "users" && <section className="admin-list-section" aria-labelledby="user-list-heading">
            <div className="admin-list-heading">
              <div><span className="admin-card-kicker">ACCOUNTS</span><h2 id="user-list-heading">Registered users</h2></div>
              {usersLoaded && <span>{users.length} accounts</span>}
            </div>
            {loadingUsers ? <p className="admin-muted">Loading user accounts…</p> : usersError ? (
              <div><p className="auth-error" role="alert">{usersError}</p><button className="admin-retry" type="button" onClick={openUsers}>Try again</button></div>
            ) : users.length ? (
              <div className="admin-user-list">
                {userActionError && <p className="auth-error" role="alert">{userActionError}</p>}
                {users.map((item) => <article className="admin-user-row" key={item._id}>
                  <span className="admin-list-avatar" aria-hidden="true">{item.name?.trim()?.[0]?.toUpperCase() || "U"}</span>
                  <span className="admin-list-copy"><strong>{item.name}</strong><small>{item.email}</small></span>
                  <details className="admin-user-profile">
                    <summary>Profile</summary>
                    <span>Age: {item.patientProfile?.age ?? "—"}</span>
                    <span>Gender: {item.patientProfile?.gender || "—"}</span>
                    <span>Phone: {item.patientProfile?.phone || "—"}</span>
                    <span>Blood group: {item.patientProfile?.bloodGroup || "—"}</span>
                  </details>
                  <label className="admin-role-control">
                    <span>Role</span>
                    <select value={userRoleDrafts[item._id] ?? item.role} disabled={item._id === currentAdminId} onChange={(event) => setUserRoleDrafts((current) => ({ ...current, [item._id]: event.target.value }))}>
                      <option value="patient">Patient</option>
                      <option value="admin">Admin</option>
                    </select>
                    {item._id === currentAdminId && <small>You</small>}
                  </label>
                  <button className="admin-role-save" type="button" onClick={() => saveUserRole(item)} disabled={savingUserId === item._id || (userRoleDrafts[item._id] ?? item.role) === item.role}>
                    {savingUserId === item._id ? "Saving…" : "Save role"}
                  </button>
                  <time className="admin-user-date" dateTime={item.createdAt}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}</time>
                </article>)}
              </div>
            ) : <p className="admin-muted">No user accounts found.</p>}
          </section>}
        </> : null}
      </div>
    </main>
    <Footer />
  </>;
}
