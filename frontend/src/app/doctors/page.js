"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Breadcrumbs from "../../components/Breadcrumbs";
import { getDoctors, matchesDoctor } from "../../components/doctorHelpers";

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");
  const [city, setCity] = useState("");
  const [specialty, setSpecialty] = useState("All specialties");
  useEffect(() => {
    const controller = new AbortController();
    async function loadDoctors() {
      try {
        const records = await getDoctors(controller.signal);
        setDoctors(records);
      } catch (reason) {
        if (reason.name !== "AbortError") setError(reason.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadDoctors();
    return () => controller.abort();
  }, []);
  const specialties = [
    "All specialties",
    ...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean)),
  ];
  const visibleDoctors = doctors.filter((doctor) => {
    const matchesSpecialty = specialty === "All specialties" || doctor.specialization === specialty;

    return matchesDoctor(doctor, term, city) && matchesSpecialty;
  });
  return <>
  <Navbar />
  <Breadcrumbs currentPage="Find Doctors" />
  <main className="directory-page">
    <section className="directory-hero">
      <div className="container directory-hero-inner">
        <div>
          <span className="section-eyebrow">A BETTER WAY TO FIND CARE</span>
          <h1>Meet your next<br /><span>trusted doctor.</span></h1>
          <p>Explore local specialists, compare the details that matter, and find a care team that feels right for you.</p>
        </div>
        <div className="directory-hero-note">
          <span className="directory-note-icon">✚</span>
          <div>
            <strong>Care starts with a good match.</strong>
            <p>Search by name, specialty, or city to get started.</p>
          </div>
        </div>
      </div>
    </section>
    <section className="directory-content">
      <div className="container">
        <form className="directory-search" onSubmit={event => event.preventDefault()}>
          <label>
            <span>Doctor or specialty</span>
            <input value={term} onChange={event => setTerm(event.target.value)} placeholder="e.g. cardiologist" />
          </label>
          <label>
            <span>City</span>
            <input value={city} onChange={event => setCity(event.target.value)} placeholder="e.g. Mumbai" />
          </label>
          <button className="search-button" type="submit">Search doctors <span aria-hidden="true">→</span></button>
        </form>
        <div className="directory-toolbar">
          <div>
            <span className="section-eyebrow">YOUR CARE OPTIONS</span>
            <h2>Doctors near you</h2>
          </div>
          <label className="specialty-filter">
            <span>Specialty</span>
            <select value={specialty} onChange={event => setSpecialty(event.target.value)}>
              {specialties.map(item => <option key={item}>
                {item}
              </option>)}
            </select>
          </label>
        </div>
        {loading && (
          <div className="state-panel" role="status">
            <span className="loading-spinner" />
            Loading doctor profiles…
          </div>
        )}

        {!loading && error && (
          <div className="state-panel state-error" role="alert">
            <span className="state-symbol">!</span>
            <div>
              <h3>We couldn’t load the directory</h3>
              <p>{error} Please try again when the doctor service is available.</p>
            </div>
          </div>
        )}

        {!loading && !error && visibleDoctors.length === 0 && (
          <div className="state-panel">
            <span className="state-symbol">⌕</span>
            <div>
              <h3>
                {doctors.length ? "No doctors match those filters" : "No doctor profiles to show yet"}
              </h3>
              <p>
                {doctors.length
                  ? "Try another name, city, or specialty."
                  : "Profiles will appear here as doctors join MedQueue."}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && visibleDoctors.length > 0 && (
          <div className="row g-3 g-lg-4">
            {visibleDoctors.map((doctor, index) => {
              const image = doctor.profileImage;
              const doctorKey = doctor._id || doctor.id || `${doctor.name}-${index}`;
              const fee = Number.isFinite(Number(doctor.consultationFee))
                ? Number(doctor.consultationFee).toLocaleString("en-IN")
                : "—";

              return (
                <div className="col-md-6 col-lg-4" key={doctorKey}>
                  <article className="directory-doctor-card">
              <div className="directory-doctor-photo">
                {image ? (
                  <img
                    src={image}
                    alt={doctor.name ? `${doctor.name}, doctor` : "Doctor profile"}
                    loading="lazy"
                  />
                ) : (
                  <span aria-hidden="true">✚</span>
                )}
                <span className={`availability-pill ${doctor.isAvailable ? "" : "is-unavailable"}`}>
                  <i />
                  {doctor.isAvailable ? "Available" : "Currently unavailable"}
                </span>
              </div>
              <div className="directory-doctor-body">
                <span className="doctor-specialty">
                  {doctor.specialization || "Medical specialist"}
                </span>
                <h3>
                  {doctor.name || "Doctor"}
                </h3>
                <p className="doctor-qualification">
                  {doctor.qualification || "Qualification not listed"}
                </p>
                <div className="directory-doctor-facts">
                  <span>⌖ {doctor.city || "Location not listed"}</span>
                  <span>＋ {doctor.hospitalName || "Practice not listed"}</span>
                  <span>◷ {doctor.experience ?? "—"} years experience</span>
                </div>
                <div className="directory-doctor-bottom">
                  <strong>
                    ₹{fee}
                    <small> / visit</small>
                  </strong>
                  <a href={doctor.phone ? `tel:${doctor.phone}` : "mailto:support@medqueue.com"}>
                    Contact clinic <span aria-hidden="true">↗</span>
                  </a>
                </div>
              </div>
            </article>
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && visibleDoctors.length > 0 && (
          <p className="directory-count">
            Showing {visibleDoctors.length} {visibleDoctors.length === 1 ? "doctor" : "doctors"}
          </p>
        )}
      </div>
    </section>
    <section className="directory-help">
      <div className="container directory-help-inner">
        <div>
          <span className="section-eyebrow">NEED A PLACE TO START?</span>
          <h2>Not sure which specialist to choose?</h2>
          <p>Start with your symptoms or browse common specialties. Your next step can be simple.</p>
        </div>
        <Link href="/#specialties" className="text-link">Browse specialties <span>→</span></Link>
      </div>
    </section>
  </main>
  <Footer />
</>;
}
