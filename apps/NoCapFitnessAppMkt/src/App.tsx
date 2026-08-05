import focusPlay from "./assets/focusPlay.png";
import img from "./assets/heroImg1.jpg";
import getReady from "./assets/getReady.png";
import homescreen from "./assets/homescreen.png";
import listview from "./assets/listview.png";
import search from "./assets/search.png";
import tools from "./assets/tools.png";
import logo from "./assets/icon.png";
import { TermsPage } from "./TermsPage";
import { PrivacyPage } from "./PrivacyPage";
import { ContactPage } from "./ContactPage";
import { DeleteAccountPage } from "./DeleteAccountPage";
import "./App.css";

const FEATURES = [
  {
    eyebrow: "Home",
    title: "Keep your workouts fresh",
    blurb:
      "Your saved sessions and lift history live here — so you walk in with a plan, not a blank slate.",
    src: homescreen,
    alt: "No Cap home screen with saved workouts and lift maxes",
  },
  {
    eyebrow: "Discover",
    title: "New ideas without starting over",
    blurb:
      "Browse 1300+ exercises by muscle or equipment. Swap what’s stale. Keep what still hits.",
    src: search,
    alt: "Exercise discovery with search, body parts, and equipment",
  },
  {
    eyebrow: "Organize",
    title: "Your routine, ready to go",
    blurb:
      "Line up today’s session, set your weights, and leave the guesswork in the locker room.",
    src: listview,
    alt: "Organized exercise list ready for a workout",
  },
  {
    eyebrow: "Ready",
    title: "Walk in knowing what’s next",
    blurb:
      "See the full run before you start. Cue the vibe. Step onto the floor already locked in.",
    src: getReady,
    alt: "Get ready screen before starting a workout",
  },
  {
    eyebrow: "Play",
    title: "Stay in the set — not the scroll",
    blurb:
      "One move at a time, timer up, music on. Back, skip, next — keep moving without losing your place.",
    src: focusPlay,
    alt: "Focus play mode showing current exercise and timer",
  },
  {
    eyebrow: "Tools",
    title: "Small edges that compound",
    blurb:
      "Estimate a smart next weight, log the set, track steps — keep the details that make you better.",
    src: tools,
    alt: "Tools screen with 1RM estimator and step counter",
  },
] as const;

function HomePage() {
  return (
    <div className="page">
      <section className="hero">
        <div
          className="hero__bg"
          style={{ backgroundImage: `url(${img})` }}
          aria-hidden
        />
        <div className="hero__veil" aria-hidden />
        <div className="hero__content">
          <div className="hero__brand">
            <img className="hero__logo" src={logo} alt="No Cap Gym App" />
            <span className="hero__brand-name">No Cap Gym App</span>
          </div>
          <p className="hero__kicker">Your know how to lift,  We'll help you keep it fresh.</p>
          <h1 className="hero__title">
            Keep your workout
            <span>Revolutionary</span>
          </h1>
          <p className="hero__sub">
            Discover new exercises, keep what works, and never forget your last max.
          </p>
          <div className="hero__cta-row">
            <button type="button" className="hero__btn" title="Download">
              Download on the App Store
            </button>
            <p className="hero__platforms">Also on Android</p>
          </div>
        </div>
      </section>

      <section className="features">
        {/* <div className="features__intro">
          <h2>Not another AI trainer.</h2>
          <p>
            You’re not buying a workout plan. You’re organizing your own
            training — ideas, variety, and a place that remembers what hit.
          </p>
        </div> */}

        {FEATURES.map((f, i) => (
          <article
            key={f.title}
            className={`feature${i % 2 === 1 ? " feature--flip" : ""}`}
          >
            <div className="feature__copy">
              <p className="feature__eyebrow">{f.eyebrow}</p>
              <h3 className="feature__title">{f.title}</h3>
              <p className="feature__blurb">{f.blurb}</p>
            </div>
            <div className="feature__visual">
              <div className="phone">
                <img src={f.src} alt={f.alt} />
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className="site-footer">
        <a href="/terms">Terms & Conditions</a>
        <a href="/privacy">Privacy Policy</a>
        <a href="/delete-account">Delete account</a>
        <a href="/contact">Contact Us</a>
      </footer>
    </div>
  );
}

function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/terms") {
    return <TermsPage />;
  }
  if (path === "/privacy") {
    return <PrivacyPage />;
  }
  if (path === "/delete-account") {
    return <DeleteAccountPage />;
  }
  if (path === "/contact") {
    return <ContactPage />;
  }
  return <HomePage />;
}

export default App;
