import { FormEvent, useState, type CSSProperties } from "react";

const CONTACT_EMAIL = "hartleybuildsapps@gmail.com";

const fieldStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "14px 16px",
  borderRadius: 12,
  border: "1px solid #2a2a32",
  background: "#16161a",
  color: "#e8e8ef",
  fontSize: 15,
  outline: "none",
};

const labelStyle: CSSProperties = {
  display: "block",
  color: "#98F2E7",
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 8,
};

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sentHint, setSentHint] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim() || "No-Cap contact";
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      alert("Please fill in your name, email, and message.");
      return;
    }

    const body = [
      `Name: ${trimmedName}`,
      `Reply-to: ${trimmedEmail}`,
      "",
      trimmedMessage,
    ].join("\n");

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      `[No-Cap] ${trimmedSubject}`
    )}&body=${encodeURIComponent(body)}`;

    setSentHint(true);
    window.location.href = mailto;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0b0d",
        color: "#e8e8ef",
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 24px",
          background: "rgba(11,11,13,0.92)",
          borderBottom: "1px solid #2a2a32",
          backdropFilter: "blur(8px)",
        }}
      >
        <a
          href="/"
          style={{ color: "#7EE8FF", textDecoration: "none", fontWeight: 600 }}
        >
          ← No-Cap
        </a>
        <span style={{ color: "#7a7a88", fontSize: 14 }}>Contact Us</span>
      </header>

      <main
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
            lineHeight: 1.15,
            margin: "0 0 12px",
            color: "#7EE8FF",
          }}
        >
          Get in touch
        </h1>
        <p
          style={{
            color: "#7a7a88",
            fontSize: 15,
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          Questions about No-Cap, privacy, or support? Send a message and it
          will open in your email app addressed to{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            style={{ color: "#98F2E7" }}
          >
            {CONTACT_EMAIL}
          </a>
          .
        </p>

        <form
          onSubmit={onSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          <div>
            <label htmlFor="contact-name" style={labelStyle}>
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={fieldStyle}
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label htmlFor="contact-email" style={labelStyle}>
              Your email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={fieldStyle}
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="contact-subject" style={labelStyle}>
              Subject
            </label>
            <input
              id="contact-subject"
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={fieldStyle}
              placeholder="What’s this about?"
            />
          </div>

          <div>
            <label htmlFor="contact-message" style={labelStyle}>
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ ...fieldStyle, minHeight: 160, resize: "vertical" }}
              placeholder="How can we help?"
              required
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "14px 22px",
              borderRadius: 999,
              border: "none",
              background: "#7EE8FF",
              color: "#141418",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Send message
          </button>
        </form>

        {sentHint ? (
          <p
            style={{
              marginTop: 20,
              color: "#98F2E7",
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Opening your email app… If nothing opens, email us directly at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: "#7EE8FF" }}>
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        ) : null}
      </main>
    </div>
  );
}
