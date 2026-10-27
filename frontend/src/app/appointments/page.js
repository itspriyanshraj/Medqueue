"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Breadcrumbs from "../../components/Breadcrumbs";
import AppointmentCalendar from "../../components/appointments/AppointmentCalendar";
import VisitForm from "../../components/appointments/VisitForm";
import VisitHistory, { VisitSummary } from "../../components/appointments/VisitHistory";
import { requestApi } from "../../components/api";
import { getDoctors } from "../../components/doctorHelpers";
import {
  formatDate,
  getDateKey,
  getLocalDateTime,
} from "../../components/appointments/appointmentHelpers";

export default function AppointmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState(getDateKey(new Date()));
  const [initialVisitDate, setInitialVisitDate] = useState(() =>
    getLocalDateTime(Date.now() + 60 * 60 * 1000),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [pageError, setPageError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);
      setPageError("");

      try {
        const account = await requestApi("/auth/me");
        if (!isMounted) return;
        setUser(account.user);

        const [visitData, doctorResponse] = await Promise.all([
          requestApi("/appointments"),
          getDoctors(),
        ]);

        if (!isMounted) return;
        setAppointments(visitData.appointments || []);
        setDoctors(doctorResponse);
      } catch (error) {
        if (!isMounted) return;

        if (/sign in|session has expired|unauthori[sz]ed|not authenticated/i.test(error.message)) {
          setUser(null);
          setAuthRequired(true);
        } else {
          setPageError(error.message);
        }
      } finally {
        if (isMounted) {
          setAuthChecked(true);
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [retryCount]);

  useEffect(() => {
    if (authChecked && authRequired) router.replace("/login");
  }, [authChecked, authRequired, router]);

  useEffect(() => {
    if (!remindersEnabled || !user) return undefined;

    function checkForReminder() {
      const now = Date.now();
      const nextVisit = appointments
        .filter((visit) => visit.status === "planned")
        .sort((first, second) => new Date(first.appointmentDate) - new Date(second.appointmentDate))
        .find((visit) => {
          const timeUntilVisit = new Date(visit.appointmentDate).getTime() - now;
          return timeUntilVisit > 0 && timeUntilVisit <= 24 * 60 * 60 * 1000;
        });

      if (!nextVisit || !("Notification" in window) || Notification.permission !== "granted") {
        return;
      }

      const reminderKey = `medqueue-alert-${nextVisit._id}`;
      if (window.localStorage.getItem(reminderKey)) return;

      new Notification("Appointment coming up", {
        body: `${nextVisit.doctor?.name || "Your doctor"} · ${formatDate(nextVisit.appointmentDate)}`,
      });
      window.localStorage.setItem(reminderKey, "sent");
    }

    checkForReminder();
    const timer = window.setInterval(checkForReminder, 60_000);

    return () => window.clearInterval(timer);
  }, [appointments, remindersEnabled, user]);

  function openVisitForm(date) {
    setFormError("");

    if (date) {
      setInitialVisitDate(`${date}T10:00`);
    } else {
      setInitialVisitDate(getLocalDateTime(Date.now() + 60 * 60 * 1000));
    }

    setShowForm(true);
  }

  function changeMonth(direction) {
    setMonth((currentMonth) =>
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1),
    );
  }

  async function saveVisit(visit) {
    setIsSaving(true);
    setFormError("");

    try {
      const result = await requestApi("/appointments", {
        method: "POST",
        body: JSON.stringify(visit),
      });

      setAppointments((currentVisits) => [...currentVisits, result.appointment]);
      setSelectedDay(getDateKey(result.appointment.appointmentDate));
      setShowForm(false);
    } catch (error) {
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function updateVisitStatus(visit, status) {
    try {
      const result = await requestApi(`/appointments/${visit._id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setAppointments((currentVisits) =>
        currentVisits.map((item) => item._id === visit._id ? result.appointment : item),
      );
    } catch (error) {
      setPageError(error.message);
    }
  }

  async function toggleReminders() {
    if (remindersEnabled) {
      setRemindersEnabled(false);
      setReminderMessage("");
      return;
    }

    if (!("Notification" in window)) {
      setReminderMessage("This browser does not support system notifications.");
      setRemindersEnabled(true);
      return;
    }

    let permission = Notification.permission;
    if (permission === "default") permission = await Notification.requestPermission();

    if (permission === "granted") {
      setReminderMessage("");
      setRemindersEnabled(true);
    } else {
      setReminderMessage("Allow notifications in your browser settings to receive appointment alerts.");
    }
  }

  async function signOut() {
    try {
      await requestApi("/auth/logout", { method: "POST" });
      setUser(null);
      setAppointments([]);
      setAuthRequired(true);
    } catch (error) {
      setPageError(error.message);
    }
  }

  function retryLoading() {
    setPageError("");
    setAuthChecked(false);
    setRetryCount((count) => count + 1);
  }

  return (
    <>
      <Navbar />
      <Breadcrumbs currentPage="My Appointments" />
      <main className="health-dashboard-page">
        <section className="dashboard-heading">
          <div className="container dashboard-heading-inner">
            <div>
              <span className="section-eyebrow">YOUR PRIVATE CARE SPACE</span>
              <h1>My appointments</h1>
              <p>Keep your upcoming visits and past health notes together.</p>
            </div>

            {user && (
              <div className="dashboard-user-actions">
                <button
                  className={`reminder-toggle ${remindersEnabled ? "is-on" : ""}`}
                  onClick={toggleReminders}
                  type="button"
                  aria-pressed={remindersEnabled}
                  aria-label={remindersEnabled ? "Turn off appointment reminders" : "Turn on appointment reminders"}
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>
                  {remindersEnabled ? "Reminders on" : "Remind me"}
                </button>
                <span className="dashboard-user-identity">
                  <span className="dashboard-user-avatar" aria-hidden="true">
                    {(user.name?.trim()?.[0] || "U").toUpperCase()}
                  </span>
                  <span className="dashboard-user-copy">
                    <strong>Hi, {user.name?.split(" ")[0] || "there"}</strong>
                    {user.email && <small>{user.email}</small>}
                  </span>
                </span>
                <button className="dashboard-signout" onClick={signOut} type="button">
                  Sign out
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-content">
          <div className="container">
            {isLoading && (
              <div className="state-panel" role="status">
                <span className="loading-spinner" />
                Opening your private dashboard…
              </div>
            )}

            {!isLoading && authRequired && (
              <div className="state-panel" role="status">
                Redirecting you to sign in…
              </div>
            )}

            {!isLoading && !user && !authRequired && pageError && (
              <div className="dashboard-signed-out">
                <span className="dashboard-lock" aria-hidden="true">!</span>
                <span className="section-eyebrow">DASHBOARD CONNECTION</span>
                <h2>We couldn’t load your appointments</h2>
                <p>{pageError}</p>
                <button className="dashboard-retry" type="button" onClick={retryLoading}>
                  Retry connection
                </button>
              </div>
            )}

            {!isLoading && user && (
              <>
                {pageError && <p className="dashboard-error" role="alert">{pageError}</p>}
                {reminderMessage && <p className="reminder-message" role="status">{reminderMessage}</p>}

                <VisitSummary
                  appointments={appointments}
                  onAddVisit={() => openVisitForm()}
                />

                {remindersEnabled && (
                  <p className="reminder-running-note">
                    Browser alerts are checked while this dashboard is open. Your next planned visit will trigger an alert within 24 hours.
                  </p>
                )}

                <AppointmentCalendar
                  appointments={appointments}
                  month={month}
                  selectedDay={selectedDay}
                  onMonthChange={changeMonth}
                  onSelectDay={setSelectedDay}
                  onAddVisit={openVisitForm}
                />

                <VisitHistory
                  appointments={appointments}
                  onUpdateStatus={updateVisitStatus}
                  onAddVisit={() => openVisitForm()}
                />
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {showForm && (
        <VisitForm
          doctors={doctors}
          initialDate={initialVisitDate}
          saving={isSaving}
          error={formError}
          onSave={saveVisit}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
