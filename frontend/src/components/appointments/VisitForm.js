import { useState } from "react";

function readMedicines(text) {

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, dosage = "", instructions = ""] = line
        .split("|")
        .map((part) => part.trim());

      return { name, dosage, instructions };
    });
}

export default function VisitForm({
  doctors,
  initialDate,
  saving,
  error,
  onSave,
  onClose,
}) {
  const [doctorId, setDoctorId] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [date, setDate] = useState(initialDate);
  const [status, setStatus] = useState("planned");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicineText, setMedicineText] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const selectedDoctor = doctors.find((doctor) => doctor._id === doctorId);
    const visit = {
      ...(selectedDoctor ? { doctorId: selectedDoctor._id } : { doctor: { name: doctorName.trim() } }),
      appointmentDate: new Date(date).toISOString(),
      status,
      diagnosis,
      notes,
      medicines: readMedicines(medicineText),
      ...(followUpDate ? { followUpDate: new Date(followUpDate).toISOString() } : {}),
    };

    onSave(visit);
  }

  return (
    <div
      className="visit-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="visit-form-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="visit-form-title"
      >
        <div className="visit-form-heading">
          <div>
            <span className="section-eyebrow">YOUR HEALTH RECORD</span>
            <h2 id="visit-form-title">Add a visit</h2>
          </div>
          <button type="button" aria-label="Close form" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Doctor
            <select value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
              <option value="">Enter doctor details manually</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.name} · {doctor.specialization}
                </option>
              ))}
            </select>
          </label>

          {!doctorId && (
            <label>
              Doctor name
              <input
                value={doctorName}
                onChange={(event) => setDoctorName(event.target.value)}
                placeholder="Doctor’s full name"
                required
              />
            </label>
          )}

          <div className="visit-form-two-col">
            <label>
              Date and time
              <input
                type="datetime-local"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
            <label>
              Visit status
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="planned">Upcoming / planned</option>
                <option value="completed">Past / completed</option>
              </select>
            </label>
          </div>

          <label>
            Checkup, diagnosis, or reason
            <textarea
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
              rows={2}
              placeholder="What was the visit for?"
            />
          </label>

          <label>
            Visit notes
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Notes you want to remember"
            />
          </label>

          <label>
            Prescribed medicines
            <textarea
              value={medicineText}
              onChange={(event) => setMedicineText(event.target.value)}
              rows={3}
              placeholder="One per line: medicine | dosage | instructions"
            />
            <small>Example: Medicine name | 1 tablet | After meals</small>
          </label>

          <label>
            Follow-up date (optional)
            <input
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
            />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <div className="visit-form-actions">
            <button className="visit-save" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save to my records"}
            </button>
            <button className="visit-cancel" type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
