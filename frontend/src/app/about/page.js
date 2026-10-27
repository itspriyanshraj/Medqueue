import Link from "next/link";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Breadcrumbs from "../../components/Breadcrumbs";

export const metadata = {
  title: "About MedQueue | Care starts with confidence",
  description: "Learn how MedQueue helps people discover healthcare professionals and make informed care choices."
};

const values = [
  ["01", "Clarity first", "Useful details about doctors and clinics help you compare your options with confidence."],
  ["02", "People at the centre", "Finding care should feel thoughtful and human, from the first search onward."],
  ["03", "A simpler next step", "We bring doctor discovery into one place so it is easier to decide where to begin."],
];
export default function AboutPage() {
  return <>
  <Navbar />
  <Breadcrumbs currentPage="About Us" />
  <main className="about-page">
    <section className="about-hero">
      <div className="container about-hero-inner">
        <div className="about-hero-copy">
          <span className="section-eyebrow">A BETTER WAY TO FIND CARE</span>
          <h1>Healthcare choices<br />should feel <span>clear.</span></h1>
          <p>MedQueue helps people discover doctors, explore specialties, and take a more confident first step toward care.</p>
          <Link href="/doctors" className="about-primary">Explore doctors <span aria-hidden="true">→</span></Link>
        </div>
        <div className="about-hero-art" aria-hidden="true">
          <div className="about-art-card">
            <span className="about-art-cross">✚</span>
            <span className="about-art-label">CARE, MADE CLOSER</span>
            <strong>Good care<br />starts here.</strong>
            <span className="about-art-line" />
          </div>
          <span className="about-art-dot dot-one" />
          <span className="about-art-dot dot-two" />
          <span className="about-art-dot dot-three" />
        </div>
      </div>
    </section>
    <section className="about-story">
      <div className="container about-story-grid">
        <div>
          <span className="section-eyebrow">WHY MEDQUEUE</span>
          <h2>Finding care is a personal journey.</h2>
        </div>
        <div>
          <p>
            Choosing a doctor can take time. It helps to have the practical details in one place: a doctor’s specialty, experience, clinic, location, and consultation fee.
          </p>
          <p>
            MedQueue is designed to make that first search feel easier. Explore the care you need, understand your options, and reach out to a clinic when you are ready.
          </p>
        </div>
      </div>
    </section>
    <section className="about-values">
      <div className="container">
        <div className="section-heading">
          <div>
            <span className="section-eyebrow">WHAT GUIDES US</span>
            <h2>Thoughtful care, in every detail</h2>
          </div>
          <p>A simple experience should still give you the information and confidence to choose.</p>
        </div>
        <div className="row g-3 g-lg-4">
          {values.map(([number, title, description]) => <div className="col-md-4" key={number}>
            <article className="about-value-card">
              <span>
                {number}
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
    <section className="about-cta">
      <div className="container about-cta-inner">
        <div>
          <span className="section-eyebrow">YOUR NEXT STEP</span>
          <h2>Start with the care you need.</h2>
          <p>Browse doctors and find the information that helps you move forward.</p>
        </div>
        <Link href="/doctors" className="about-primary">Find doctors <span aria-hidden="true">→</span></Link>
      </div>
    </section>
  </main>
  <Footer />
</>;
}
