"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";
import { requestApi } from "./api";

const links = [
  ["Home", "/#home", "/"],
  ["Find Doctors", "/doctors", "/doctors"],
  ["My Appointments", "/appointments", "/appointments"],
  ["About Us", "/about", "/about"],
];
const subscribeToMount = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const portalReady = useSyncExternalStore(subscribeToMount, getClientSnapshot, getServerSnapshot);
  const [adminSection, setAdminSection] = useState("doctors");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    requestApi("/auth/me")
      .then((result) => {
        if (isCurrent) setAccount(result.user || null);
      })
      .catch(() => {
        if (isCurrent) setAccount(null);
      });

    return () => {
      isCurrent = false;
    };
  }, [pathname]);

  useEffect(() => {
    function closeAccountMenu(event) {
      if (!event.target.closest?.(".nav-account-wrap")) setShowAccountMenu(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setShowAccountMenu(false);
    }

    document.addEventListener("pointerdown", closeAccountMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeAccountMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    function syncAdminSection(event) {
      if (["doctors", "users", "add-doctor"].includes(event.detail)) setAdminSection(event.detail);
    }
    window.addEventListener("medqueue:admin-section", syncAdminSection);
    return () => window.removeEventListener("medqueue:admin-section", syncAdminSection);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError("");
    try {
      await requestApi("/auth/logout", { method: "POST" });
      const wasAdmin = account?.role === "admin";
      setAccount(null);
      setShowAccountMenu(false);
      if (wasAdmin) router.replace("/");
      else window.dispatchEvent(new Event("medqueue:transition"));
    } catch (error) {
      setLogoutError(error.message || "Could not sign out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  }

  const accountBadge = account && (
    <div className="nav-account-wrap">
      <button
        className="nav-account-trigger"
        type="button"
        aria-label="Open account menu"
        aria-haspopup="true"
        aria-expanded={showAccountMenu}
        onClick={() => {
          setLogoutError("");
          setShowAccountMenu((open) => !open);
        }}
      >
        <span className="nav-avatar-wrap">
          <span className="nav-user-avatar" aria-hidden="true">
            {(account.name?.trim()?.[0] || "U").toUpperCase()}
          </span>
          {account.role === "admin" && <span className="nav-user-crown" title="Admin account" aria-label="Admin account">
            <svg viewBox="0 0 24 18" aria-hidden="true" focusable="false">
              <path d="M2 4.5 7.1 9l4.9-7 4.9 7L22 4.5l-2.1 11H4.1L2 4.5Z" />
              <path className="nav-user-crown-band" d="M4 17h16" />
            </svg>
          </span>}
        </span>
      </button>
      <span className="nav-account-email-inline">{account.email}</span>
      {showAccountMenu && (
        <div className="nav-account-popover">
          <span className="nav-account-email">{account.email}</span>
          {account.role === "admin" && <Link className="nav-account-dashboard" href="/admin">Admin dashboard</Link>}
          {logoutError && <span className="nav-account-error" role="alert">{logoutError}</span>}
          <button className="nav-account-logout" type="button" onClick={handleLogout} disabled={loggingOut}>
            {loggingOut ? "Signing out…" : "Log out"}
          </button>
        </div>
      )}
    </div>
  );

  const mobileLinks = [
    ["Home", "/#home", "/", "home"],
    ["Doctors", "/doctors", "/doctors", "search"],
    ["Appointments", "/appointments", "/appointments", "calendar"],
    ["About", "/about", "/about", "info"],
  ];
  const adminLinks = [
    ["Doctors list", "doctors", "search"],
    ["Users list", "users", "user"],
    ["Add doctor", "add-doctor", "plus"],
  ];
  const isAdminDashboard = pathname === "/admin";
  function selectAdminSection(section) {
    setAdminSection(section);
    window.dispatchEvent(new CustomEvent("medqueue:admin-section", { detail: section }));
  }
  const mobileIcon = (name) => {
    const common = { width: 21, height: 21, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
    const paths = {
      home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9M9 20v-6h6v6"/></>,
      search: <><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></>,
      calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-12 4h2m3 0h2m-7 4h2"/></>,
      info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
      user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
      plus: <><circle cx="12" cy="12" r="9"/><path d="M12 8v8m-4-4h8"/></>,
    };
    return <svg {...common}>{paths[name]}</svg>;
  };

  return <>
  <header className="mobile-brand-header">
    <Link className="navbar-brand site-brand" href="/#home" aria-label="MedQueue home">
      <span className="brand-mark" aria-hidden="true">✚</span>
      <span>Med<span>Queue</span></span>
    </Link>
    <div className="mobile-header-actions">
      {account ? accountBadge : <>
        <Link className="login-link" href="/login">Log in</Link>
        <Link className="signup-link" href="/signup">Get started <span aria-hidden="true">→</span></Link>
        <Link className="admin-login-link" href="/admin/login"><span className="mobile-admin-label">Admin</span><span className="desktop-admin-label">Admin login</span></Link>
      </>}
    </div>
  </header>
  <nav className="navbar navbar-expand-lg site-navbar" aria-label="Main navigation">
  <div className="container site-nav-shell">
    <Link className="navbar-brand site-brand" href="/#home">
      <span className="brand-mark" aria-hidden="true">✚</span>
      <span>Med<span>Queue</span></span>
    </Link>
    <div className="navbar-collapse">
      <ul className="navbar-nav mx-auto site-nav-links">
        {isAdminDashboard ? adminLinks.map(([label, section]) => <li className="nav-item" key={section}>
          <button type="button" aria-pressed={adminSection === section} className={`nav-link ${adminSection === section ? "is-current" : ""}`} onClick={() => selectAdminSection(section)}>{label}</button>
        </li>) : links.map(([label, href, path]) => <li className="nav-item" key={label}>
          <Link
            aria-current={pathname === path ? "page" : undefined}
            className={`nav-link ${pathname === path ? "is-current" : ""}`}
            href={href}
          >
            {label}
          </Link>
        </li>)}
      </ul>
      <div className="site-nav-actions">
        {account ? accountBadge : <>
          <Link className="login-link" href="/login">Log in</Link>
          <Link className="signup-link" href="/signup">Get started <span aria-hidden="true">→</span></Link>
          <Link className="admin-login-link" href="/admin/login"><span className="desktop-admin-label">Admin login</span></Link>
        </>}
      </div>
    </div>
  </div>
</nav>
  {portalReady && createPortal(<nav className="mobile-bottom-nav" aria-label="Mobile navigation">
    {isAdminDashboard ? adminLinks.map(([label, section, icon]) => <button
      key={section}
      type="button"
      aria-pressed={adminSection === section}
      className={`mobile-bottom-nav-item ${adminSection === section ? "is-current" : ""}`}
      onClick={() => selectAdminSection(section)}
    >
      {mobileIcon(icon)}
      <span>{label}</span>
    </button>) : mobileLinks.map(([label, href, path, icon]) => <Link
      key={label}
      href={href}
      aria-current={pathname === path ? "page" : undefined}
      className={`mobile-bottom-nav-item ${pathname === path ? "is-current" : ""}`}
    >
      {mobileIcon(icon)}
      <span>{label}</span>
    </Link>)}
  </nav>, document.body)}
  </>;
}
