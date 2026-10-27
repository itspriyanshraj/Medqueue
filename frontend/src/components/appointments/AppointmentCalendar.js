import { formatDate, getDateKey } from "./appointmentHelpers";

const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

function getCalendarDays(month) {

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const emptyDays = Array(firstDay.getDay()).fill(null);

  return [...emptyDays, ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
}

export default function AppointmentCalendar({
  appointments,
  month,
  selectedDay,
  onMonthChange,
  onSelectDay,
  onAddVisit,
}) {
  const days = getCalendarDays(month);
  const monthName = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(month);

  function hasVisit(day) {
    if (!day) return false;

    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return appointments.some((visit) => getDateKey(visit.appointmentDate) === getDateKey(date));
  }

  function isToday(day) {
    if (!day) return false;

    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return getDateKey(date) === getDateKey(new Date());
  }

  function selectDay(day) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    onSelectDay(getDateKey(date));
  }

  const selectedVisits = appointments.filter(
    (visit) => getDateKey(visit.appointmentDate) === selectedDay,
  );
  const selectedDateLabel = formatDate(`${selectedDay}T12:00:00`, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="dashboard-main-grid">
      <section className="dashboard-calendar-card">
        <div className="dashboard-card-header">
          <div>
            <span className="section-eyebrow">YOUR SCHEDULE</span>
            <h2>{monthName}</h2>
          </div>

          <div className="calendar-nav">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => onMonthChange(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => onMonthChange(1)}
            >
              ›
            </button>
          </div>
        </div>

        <div className="calendar-grid" role="grid" aria-label={monthName}>
          {weekDays.map((day, index) => (
            <span className="calendar-weekday" key={`${day}-${index}`}>
              {day}
            </span>
          ))}

          {days.map((day, index) => {
            if (!day) {
              return <span className="calendar-day is-empty" key={`empty-${index}`} />;
            }

            const date = new Date(month.getFullYear(), month.getMonth(), day);
            const isSelected = selectedDay === getDateKey(date);
            const visitIsSaved = hasVisit(day);
            const today = isToday(day);

            return (
              <button
                className={`calendar-day ${isSelected ? "is-selected" : ""} ${today ? "is-today" : ""} ${visitIsSaved ? "has-visit" : ""}`}
                type="button"
                key={`${month.getMonth()}-${day}`}
                onClick={() => selectDay(day)}
                aria-label={`${formatDate(date, { dateStyle: "full" })}${visitIsSaved ? ", has visit" : ""}`}
              >
                <span>{day}</span>
                {visitIsSaved && <i />}
              </button>
            );
          })}
        </div>

        <div className="calendar-legend">
          <span><i className="legend-today" />Today</span>
          <span><i className="legend-visit" />Visit</span>
        </div>
      </section>

      <section className="dashboard-day-card">
        <div className="dashboard-card-header">
          <div>
            <span className="section-eyebrow">SELECTED DAY</span>
            <h2>{selectedDateLabel}</h2>
          </div>
        </div>

        {selectedVisits.length > 0 ? (
          <div className="selected-visit-list">
            {selectedVisits.map((visit) => (
              <article className="selected-visit" key={visit._id}>
                <span className={`visit-status-dot status-${visit.status}`} />
                <div>
                  <strong>{visit.doctor?.name || "Doctor"}</strong>
                  <span>
                    {formatDate(visit.appointmentDate, { timeStyle: "short" })}
                    {" · "}
                    {visit.doctor?.specialization || "Visit"}
                  </span>
                  <small>
                    {visit.doctor?.hospitalName || visit.doctor?.city || "Clinic details not added"}
                  </small>
                </div>
                <span className={`visit-status-label status-label-${visit.status}`}>
                  {visit.status}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="calendar-empty">
            <span aria-hidden="true">◷</span>
            <p>No visit saved for this day.</p>
            <button type="button" onClick={() => onAddVisit(selectedDay)}>
              Add a visit <span>→</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
