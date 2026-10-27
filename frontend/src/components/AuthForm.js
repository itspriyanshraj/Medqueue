"use client";

import { useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { requestApi } from "./api";

export default function AuthForm({
  mode
}) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const isAdminLogin = mode === "admin-login";
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [patientProfile, setPatientProfile] = useState({
    age: "",
    gender: "",
    phone: "",
    bloodGroup: "",
  });
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setEmailError("");
    setBusy(true);
    try {
      const authPath = isSignup ? "register" : isAdminLogin ? "admin/login" : "login";
      await requestApi(`/auth/${authPath}`, {
        method: "POST",
        body: JSON.stringify({
          ...(isSignup ? {
            name,
            patientProfile: {
              ...patientProfile,
              age: patientProfile.age ? Number(patientProfile.age) : null,
            },
          } : {}),
          email,
          password
        })
      });
      router.push(isSignup ? "/login" : isAdminLogin ? "/admin" : "/");
    } catch (reason) {
      const message = reason.message || "Could not connect to MedQueue. Please try again.";
      if (isSignup && /already exists|already registered/i.test(message)) {
        setEmailError("Email already registered. Use a different email.");
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }
  return <>
  <Navbar />
  <main className="auth-page">
    <div className="container auth-shell">
      <aside className="auth-showcase">
        <span className="auth-showcase-eyebrow"><i /> CARE, MADE A LITTLE CLOSER</span>
        <div className="auth-showcase-art" aria-hidden="true">
          <span className="auth-art-ring auth-art-ring-one" />
          <span className="auth-art-ring auth-art-ring-two" />
          <span className="auth-art-plus">✚</span>
          <span className="auth-art-card auth-art-card-top">✓ <b>Care that fits your day</b></span>
          <span className="auth-art-card auth-art-card-bottom"><i /> Private health records</span>
        </div>
        <h2>Your care journey,<br /><span>all in one place.</span></h2>
        <p>Find trusted doctors, keep track of appointments, and stay connected to the details that matter.</p>
        <div className="auth-trust-row"><span>✦</span> Simple to use <i /> Secure by design <i /> Made for you</div>
      </aside>

      <section className="auth-card">
        <div className="auth-card-heading">
          <span className="auth-symbol" aria-hidden="true">✚</span>
          <span className="section-eyebrow">{isAdminLogin ? "SECURE ADMIN ACCESS" : "YOUR CARE, IN ONE PLACE"}</span>
          <h1>{isSignup ? "Create your account" : isAdminLogin ? "Admin sign in" : "Welcome back"}</h1>
          <p className="auth-intro">
            {isSignup
              ? "Save your appointments and keep your visit notes together."
              : isAdminLogin
                ? "Sign in with your authorized MedQueue administrator account."
                : "Sign in to view your appointments and medical history."}
          </p>
        </div>
        <form onSubmit={submit} className="auth-form">
          {isSignup && (
            <label>
              Full name
              <input
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                minLength={2}
                maxLength={100}
                placeholder="Your name"
              />
            </label>
          )}
          <label>
            Email address
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError("");
              }}
              aria-invalid={emailError ? "true" : undefined}
              aria-describedby={emailError ? "auth-email-error" : undefined}
              required
              placeholder="you@example.com"
            />
            {emailError && <span className="auth-field-error" id="auth-email-error" role="alert">{emailError}</span>}
          </label>
          <div className="auth-password-group">
            <label htmlFor="auth-password">Password</label>
            <span className="auth-password-field">
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={isSignup ? 10 : 1}
                placeholder={isSignup ? "At least 10 characters" : "Your password"}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </div>
          {isSignup && (
            <fieldset className="auth-patient-profile">
              <legend>Patient details <span>Optional</span></legend>
              <p>These details can help doctors prepare for your visit.</p>
              <div className="auth-profile-grid">
                <label>
                  Age
                  <input
                    type="number"
                    min="0"
                    max="120"
                    inputMode="numeric"
                    value={patientProfile.age}
                    onChange={(event) => setPatientProfile((current) => ({ ...current, age: event.target.value }))}
                    placeholder="Age in years"
                  />
                </label>
                <label>
                  Gender
                  <select value={patientProfile.gender} onChange={(event) => setPatientProfile((current) => ({ ...current, gender: event.target.value }))}>
                    <option value="">Choose (optional)</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  Phone number
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={patientProfile.phone}
                    onChange={(event) => setPatientProfile((current) => ({ ...current, phone: event.target.value }))}
                    placeholder="Your contact number"
                  />
                </label>
                <label>
                  Blood group
                  <select value={patientProfile.bloodGroup} onChange={(event) => setPatientProfile((current) => ({ ...current, bloodGroup: event.target.value }))}>
                    <option value="">Choose (optional)</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"].map((group) => <option value={group} key={group}>{group}</option>)}
                  </select>
                </label>
              </div>
            </fieldset>
          )}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Please wait…" : isSignup ? "Create account" : "Sign in securely"}
            <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="auth-switch">
          {isAdminLogin ? "Patient account?" : isSignup ? "Already have an account?" : "New to MedQueue?"}
          <Link href={isAdminLogin ? "/login" : isSignup ? "/login" : "/signup"}>
            {isAdminLogin ? "Patient sign in" : isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
        {!isAdminLogin && <p className="auth-privacy"><span aria-hidden="true">▣</span> Your health notes stay private to your account.</p>}
      </section>
    </div>
  </main>
  <Footer />
</>;
}
