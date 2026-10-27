import Link from "next/link";

const exploreLinks = [
  ["Find doctors", "/doctors"],
  ["Specialties", "/#specialties"],
  ["How it works", "/#how-it-works"],
  ["About MedQueue", "/about"],
];

const supportLinks = [
  ["Login", "/login"],
  ["Sign up", "/signup"],
  ["Admin sign in", "/admin/login"],
  ["Contact support", "mailto:support@medqueue.com"],
];
export default function Footer() {
  return <footer className="site-footer" id="footer">
  <div className="container">
    <div className="row gy-4 footer-main">
      <div className="col-lg-5 col-md-12 footer-about">
        <Link className="footer-brand" href="/#home">
          <span className="brand-mark" aria-hidden="true">✚</span>
          <span>Med<span>Queue</span></span>
        </Link>
        <p>Making quality healthcare easier to find. Your journey to better care starts with a trusted connection.</p>
        <div className="footer-promise"><span aria-hidden="true">♡</span> Thoughtful care, a little closer.</div>
      </div>
      <div className="col-6 col-lg-3 col-md-6 footer-links">
        <h2>Explore</h2>
        {exploreLinks.map(([label, href]) => <Link href={href} key={label}>
          {label}
        </Link>)}
      </div>
      <div className="col-6 col-lg-3 col-md-6 footer-links">
        <h2>We&apos;re here to help</h2>
        <Link href="/appointments">My appointments</Link>
        {supportLinks.map(([label, href]) => <a href={href} key={label}>
          {label}
        </a>)}
      </div>
    </div>
    <div className="footer-bottom">
      <span>© {new Date().getFullYear()} MedQueue. All rights reserved.</span>
      <span>Care made a little more human.</span>
    </div>
  </div>
</footer>;
}
