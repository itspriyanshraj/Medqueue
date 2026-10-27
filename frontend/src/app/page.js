"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getDoctors, matchesDoctor } from "../components/doctorHelpers";

const specialties = [
  ["❤️", "Cardiology", "Heart and cardiovascular care"],
  ["✨", "Dermatology", "Healthy skin, hair and nails"],
  ["🧠", "Neurology", "Brain and nervous system care"],
  ["🦴", "Orthopedics", "Bone, joint and mobility care"],
  ["💉", "Pediatrics", "Care for growing families"],
  ["🩺", "General Physician", "Everyday health, made simpler"],
];

const steps = [
  ["01", "Search for a doctor", "Browse trusted specialists by name, specialty, or city."],
  ["02", "Choose a time", "Compare availability and find an appointment that works for you."],
  ["03", "Book with confidence", "Confirm your visit and get on your way to better care."],
];

const benefits = [
  ["Verified professionals", "Find qualified doctors with clear credentials and experience."],
  ["Simple appointment search", "See relevant specialists and practical details in one place."],
  ["Care on your schedule", "Explore availability and consultation fees before you decide."],
];

function doctorImage(doctor) {
  return doctor.profileImage || "";
}

function DoctorCard({
  doctor
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = doctorImage(doctor);
  const days = Array.isArray(doctor.availableDays) ? doctor.availableDays.join(", ") : "";
  return <article className="doctor-card h-100">
  <div className="doctor-card-top">
    {image && !imageFailed ?
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="doctor-photo"
        src={image}
        alt={doctor.name ? `${doctor.name}` : "Doctor profile"}
        onError={() => setImageFailed(true)}
      /> : <div className="doctor-photo doctor-photo-fallback" aria-label="Doctor profile image unavailable">
      <span aria-hidden="true">✚</span>
    </div>}
    <span className={`availability-pill ${doctor.isAvailable ? "is-available" : "is-unavailable"}`}>
      <i />
      {doctor.isAvailable ? "Available" : "Currently unavailable"}
    </span>
  </div>
  <div className="doctor-card-body">
    <p className="doctor-specialty">
      {doctor.specialization || "Medical specialist"}
    </p>
    <h3>
      {doctor.name || "Doctor"}
    </h3>
    <p className="doctor-qualification">
      {doctor.qualification || "Qualification not listed"}
    </p>
    <div className="doctor-facts">
      <span>⌖ {Number.isFinite(Number(doctor.experience)) ? `${doctor.experience} years experience` : "Experience not listed"}</span>
      <span>＋ {doctor.hospitalName || "Hospital not listed"}</span>
      <span>⌂ {doctor.city || "City not listed"}</span>
    </div>
    <div className="doctor-card-bottom">
      <span className="doctor-fee">
        ₹{Number.isFinite(Number(doctor.consultationFee)) ? Number(doctor.consultationFee).toLocaleString("en-IN") : "—"}
        <small> / consultation</small>
      </span>
      <span className="doctor-days">
        {days || doctor.availableTime || "Check availability"}
      </span>
    </div>
  </div>
</article>;
}
export default function Home() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState({
    query: "",
    city: ""
  });
  useEffect(() => {
    const controller = new AbortController();
    async function loadDoctors() {
      try {
        const records = await getDoctors(controller.signal);
        setDoctors(records);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message || "Unable to connect to the doctor service.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    loadDoctors();
    return () => controller.abort();
  }, []);
  const visibleDoctors = doctors.filter((doctor) =>
    matchesDoctor(doctor, submittedSearch.query, submittedSearch.city),
  );
  function handleSearch(event) {
    event.preventDefault();
    setSubmittedSearch({
      query,
      city
    });
    document.getElementById("featured-doctors")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
  return <>
  <Navbar />
  <main>
    <section className="hero-section" id="home">
      <div className="container hero-inner">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-mark">✦</span> BETTER CARE STARTS HERE</span>
          <h1>Find the Right Doctor.<br /><span>Book with Confidence.</span></h1>
          <p className="hero-description">
            Discover trusted specialists, compare your options, and book the care you need—all in one simple place.
          </p>
          <form className="doctor-search-form" onSubmit={handleSearch}>
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <span className="visually-hidden">Doctor or specialty</span>
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Doctor or specialty" />
            </label>
            <label className="search-field city-field">
              <span aria-hidden="true">⌖</span>
              <span className="visually-hidden">City</span>
              <input value={city} onChange={event => setCity(event.target.value)} placeholder="City" />
            </label>
            <button className="search-button" type="submit">Search doctors <span aria-hidden="true">→</span></button>
          </form>
          <div className="hero-proof">
            <span className="proof-avatars" aria-hidden="true">
              <i>✚</i>
              <i>✚</i>
              <i>✚</i>
            </span>
            <span>Trusted care, a little closer.</span>
            <span className="proof-divider" />
            <span><b>Simple.</b> Secure. Human.</span>
          </div>
        </div>
        <div className="hero-visual" role="img" aria-label="Aerial view of a white modern hospital building surrounded by greenery">
          <div className="hero-image-overlay" />
          <div className="floating-note">
            <span className="note-icon">✓</span>
            <span>
              <b>Care you can count on</b>
              <small>Find your next appointment</small>
            </span>
          </div>
          <div className="hero-image-caption">
            <span>GOOD CARE STARTS</span>
            <strong>with feeling heard.</strong>
          </div>
        </div>
        <div className="hero-bottom-line">
          <span>YOUR HEALTH, MADE SIMPLER</span>
          <span>Scroll to explore <b>↓</b></span>
        </div>
      </div>
    </section>
    <section className="section-block specialties-section" id="specialties">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">CARE FOR EVERY NEED</span>
            <h2>Find care by specialty</h2>
          </div>
          <p>From everyday checkups to specialist care, start with what you need.</p>
        </div>
        <div className="row g-3 g-lg-4">
          {specialties.map(([icon, name, description], index) => <div className="col-6 col-md-4 col-lg-2" key={name}>
            <a href="#featured-doctors" className="specialty-card">
              <span className="specialty-index">0{index + 1}</span>
              <span className="specialty-icon" aria-hidden="true">
                {icon}
              </span>
              <h3>
                {name}
              </h3>
              <p>
                {description}
              </p>
              <span className="specialty-arrow" aria-hidden="true">↗</span>
            </a>
          </div>)}
        </div>
      </div>
    </section>
    <section className="section-block doctors-section" id="featured-doctors">
      <div className="container">
        <div className="section-heading doctors-heading">
          <div>
            <span className="section-eyebrow">YOUR NEXT STEP TO FEELING BETTER</span>
            <h2>Featured doctors</h2>
          </div>
          <p>Real profiles from our doctor directory, with the details that help you choose.</p>
        </div>
        {loading && (
          <div className="state-panel" role="status">
            <span className="loading-spinner" />
            Finding doctors for you…
          </div>
        )}

        {!loading && error && (
          <div className="state-panel state-error" role="alert">
            <span className="state-symbol">!</span>
            <div>
              <h3>Doctors are temporarily unavailable</h3>
              <p>{error} Make sure the MedQueue API is running and try refreshing the page.</p>
            </div>
          </div>
        )}

        {!loading && !error && visibleDoctors.length === 0 && (
          <div className="state-panel">
            <span className="state-symbol">⌕</span>
            <div>
              <h3>
                {doctors.length ? "No doctors match your search yet" : "No doctor profiles to show yet"}
              </h3>
              <p>
                {doctors.length
                  ? "Try a different doctor, specialty, or city."
                  : "Doctor profiles will appear here as soon as they are available."}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && visibleDoctors.length > 0 && (
          <div className="row g-3 g-lg-4">
            {visibleDoctors.slice(0, 6).map((doctor, index) => (
              <div
                className="col-md-6 col-lg-4"
                key={doctor._id || doctor.id || `${doctor.name}-${index}`}
              >
                <DoctorCard doctor={doctor} />
              </div>
            ))}
          </div>
        )}
        {!loading && !error && visibleDoctors.length > 6 && (
          <div className="results-note">Showing 6 of {visibleDoctors.length} doctors</div>
        )}
      </div>
    </section>
    <section className="how-section" id="how-it-works">
      <div className="container how-inner">
        <div className="how-intro">
          <span className="section-eyebrow">THOUGHTFUL CARE, MADE SIMPLE</span>
          <h2>Three small steps<br />to better care.</h2>
          <p>Getting started should feel easy. We keep your search clear from the first click to your appointment.</p>
          <a href="#featured-doctors" className="text-link">Start finding care <span>→</span></a>
        </div>
        <div className="steps-list">
          {steps.map(([number, title, description]) => <article className="step-item" key={number}>
            <span className="step-number">
              {number}
            </span>
            <div>
              <h3>
                {title}
              </h3>
              <p>
                {description}
              </p>
            </div>
            <span className="step-arrow" aria-hidden="true">↗</span>
          </article>)}
        </div>
      </div>
    </section>
    <section className="section-block why-section" id="about">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">A BETTER WAY TO FIND CARE</span>
            <h2>Care starts with confidence</h2>
          </div>
          <p>Useful information, thoughtful choices, and a calmer way to plan your next visit.</p>
        </div>
        <div className="row g-3 g-lg-4">
          {benefits.map(([title, description], index) => <div className="col-md-4" key={title}>
            <article className="benefit-card">
              <span className="benefit-index">0{index + 1}</span>
              <span className="benefit-icon" aria-hidden="true">
                {["✚", "⌕", "♡"][index]}
              </span>
              <h3>
                {title}
              </h3>
              <p>
                {description}
              </p>
            </article>
          </div>)}
        </div>
      </div>
    </section>
    <section className="closing-cta">
      <div className="container closing-inner">
        <div>
          <span>ONE GOOD STEP CAN MAKE A DIFFERENCE</span>
          <h2>Let’s find the care that feels right.</h2>
        </div>
        <a href="#featured-doctors" className="closing-button">Find a doctor <span>→</span></a>
      </div>
    </section>
  </main>
  <Footer />
</>;
}
