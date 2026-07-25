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
import "./App.css";

const FEATURES = [
  {
    eyebrow: "Home",
    title: "Your climb at a glance",
    blurb:
      "Pick up where you left off, jump into saved workouts, and watch your maxes stack — stats that actually mean something.",
    src: homescreen,
    alt: "No Cap home screen with saved workouts and lift maxes",
  },
  {
    eyebrow: "Build",
    title: "Make it yours",
    blurb:
      "Search 1300+ moves or filter by body part and equipment. Mix what you want — no cookie-cutter plans.",
    src: search,
    alt: "Workout builder with search, body parts, and equipment",
  },
  {
    eyebrow: "Library",
    title: "Add fast. Stay focused.",
    blurb:
      "Tap through exercises, check what belongs in the session, and keep building without losing your flow.",
    src: listview,
    alt: "Exercise list for band workouts with add controls",
  },
  {
    eyebrow: "Ready",
    title: "Lock in before you lift",
    blurb:
      "See what’s coming, set the vibe, and step into the session when you’re locked — not scrolling mid-set.",
    src: getReady,
    alt: "Get ready screen before starting a workout",
  },
  {
    eyebrow: "Play",
    title: "Focus mode that stays with you",
    blurb:
      "One exercise at a time, timer up, Spotify vibes on. Back, skip, next — run the whole workout without leaving the flow.",
    src: focusPlay,
    alt: "Focus play mode showing current exercise and timer",
  },
  {
    eyebrow: "Tools",
    title: "Estimate. Step. Progress.",
    blurb:
      "Punch in a working set for a smart 1RM read, track steps, and keep the little edges that compound.",
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
            <span className="hero__brand-name">No Cap</span>
          </div>
          <p className="hero__kicker">Gym app</p>
          <h1 className="hero__title">
            Keep your workout
            <span>Revolutionary</span>
          </h1>
          <p className="hero__sub">
            Your goals, your way — build from 1300+ exercises, play the session,
            stack the stats.
          </p>
          <div className="hero__cta-row">
            <button type="button" className="hero__btn" title="Download">
              Download
            </button>
            <p className="hero__platforms">Available on iOS and Android</p>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features__intro">
          <h2>Built for how you train</h2>
          <p>
            From the first build to the last set — every screen is made to stay
            out of your way and keep you moving.
          </p>
        </div>

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
  if (path === "/contact") {
    return <ContactPage />;
  }
  return <HomePage />;
}

export default App;
