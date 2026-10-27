import { formatDate } from "./appointmentHelpers";

function VisitRecord({ visit, onUpdateStatus }) {

  return (
    <article className="history-record">
      <div className="history-date">
        <strong>{formatDate(visit.appointmentDate, { day: "2-digit" })}</strong>
        <span>{formatDate(visit.appointmentDate, { month: "short", year: "numeric" })}</span>
      </div>

      <div className="history-record-main">
        <div className="history-record-top">
          <div>
            <h3>{visit.doctor?.name || "Doctor"}</h3>
            <span>
              {visit.doctor?.specialization || "Medical visit"}
              {visit.doctor?.hospitalName ? ` · ${visit.doctor.hospitalName}` : ""}
            </span>
          </div>
          <span className={`record-status record-${visit.status}`}>{visit.status}</span>
        </div>

        {visit.diagnosis && <p><b>Visit / diagnosis:</b> {visit.diagnosis}</p>}
        {visit.notes && <p><b>Notes:</b> {visit.notes}</p>}

        {visit.medicines?.length > 0 && (
          <div className="medicine-list">
            <b>Prescribed medicines</b>
            <ul>
              {visit.medicines.map((medicine, index) => (
                <li key={`${medicine.name}-${index}`}>
                  <strong>{medicine.name}</strong>
                  {medicine.dosage && ` · ${medicine.dosage}`}
                  {medicine.instructions && ` — ${medicine.instructions}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {visit.followUpDate && (
          <p><b>Follow-up:</b> {formatDate(visit.followUpDate, { dateStyle: "medium" })}</p>
        )}
      </div>

      {visit.status === "planned" && (
        <div className="history-record-actions">
          <button type="button" onClick={() => onUpdateStatus(visit, "completed")}>
            Mark completed
          </button>
          <button type="button" onClick={() => onUpdateStatus(visit, "cancelled")}>
            Cancel
          </button>
        </div>
      )}
    </article>
  );
}

export function VisitSummary({ appointments, onAddVisit }) {
  const sortedVisits = [...appointments].sort(
    (first, second) => new Date(second.appointmentDate) - new Date(first.appointmentDate),
  );
  const completedVisits = sortedVisits.filter((visit) => visit.status === "completed");
  const upcomingVisits = appointments.filter(
    (visit) => visit.status === "planned" && new Date(visit.appointmentDate) >= new Date(),
  );
  const lastCheckup = completedVisits[0];

  return (
    <div className="dashboard-stats">
        <article>
          <span>UPCOMING</span>
          <strong>{upcomingVisits.length}</strong>
          <small>{upcomingVisits.length === 1 ? "planned visit" : "planned visits"}</small>
        </article>
        <article>
          <span>COMPLETED VISITS</span>
          <strong>{completedVisits.length}</strong>
          <small>in your care history</small>
        </article>
        <article>
          <span>LAST CHECKUP</span>
          <strong className="last-checkup-date">
            {lastCheckup ? formatDate(lastCheckup.appointmentDate, { day: "numeric", month: "short", year: "numeric" }) : "—"}
          </strong>
          <small>{lastCheckup?.doctor?.name || "Add a past visit to begin"}</small>
        </article>
        <button className="add-visit-button" type="button" onClick={onAddVisit}>
          ＋ <span>Add a visit</span>
        </button>
    </div>
  );
}

export default function VisitHistory({ appointments, onUpdateStatus, onAddVisit }) {
  const sortedVisits = [...appointments].sort(
    (first, second) => new Date(second.appointmentDate) - new Date(first.appointmentDate),
  );

  return (
    <section className="health-history-section">
        <div className="history-heading">
          <div>
            <span className="section-eyebrow">YOUR HEALTH RECORD</span>
            <h2>Visit history</h2>
            <p>Doctor details, checkup notes, and medicines you’ve recorded.</p>
          </div>
          <span className="history-count">
            {appointments.length} {appointments.length === 1 ? "record" : "records"}
          </span>
        </div>

        {appointments.length === 0 ? (
          <div className="history-empty">
            <span aria-hidden="true">＋</span>
            <div>
              <h3>Your care history starts here</h3>
              <p>Add an upcoming visit or record a past checkup, including the doctor, notes, and prescribed medicines.</p>
            </div>
            <button type="button" onClick={onAddVisit}>Add your first visit</button>
          </div>
        ) : (
          <div className="history-list">
            {sortedVisits.map((visit) => (
              <VisitRecord
                visit={visit}
                onUpdateStatus={onUpdateStatus}
                key={visit._id}
              />
            ))}
          </div>
        )}
    </section>
  );
}
