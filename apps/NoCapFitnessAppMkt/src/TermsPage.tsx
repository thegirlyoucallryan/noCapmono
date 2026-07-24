import {
  LEGAL_CONTACT_EMAIL,
  TERMS_INTRO,
  TERMS_META,
  TERMS_SECTIONS,
} from "./termsContent";

export function TermsPage() {
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
        <span style={{ color: "#7a7a88", fontSize: 14 }}>Terms & Conditions</span>
      </header>

      <main
        style={{
          maxWidth: 760,
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
          {TERMS_META.title}
        </h1>
        <p style={{ color: "#7a7a88", fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
          Effective: {TERMS_META.effectiveDate}
          <br />
          Last updated: {TERMS_META.lastUpdated}
        </p>

        <p
          style={{
            whiteSpace: "pre-wrap",
            lineHeight: 1.7,
            fontSize: 15,
            color: "#c8c8d4",
            marginBottom: 32,
          }}
        >
          {TERMS_INTRO}
        </p>

        {TERMS_SECTIONS.map((section) => (
          <section key={section.title} style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 20,
                color: "#FF6B35",
                margin: "0 0 10px",
              }}
            >
              {section.title}
            </h2>
            <p
              style={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                fontSize: 15,
                color: "#c8c8d4",
                margin: 0,
              }}
            >
              {section.body}
            </p>
          </section>
        ))}

        <a
          href={`mailto:${LEGAL_CONTACT_EMAIL}`}
          style={{
            display: "inline-block",
            marginTop: 12,
            padding: "14px 22px",
            borderRadius: 999,
            background: "#7EE8FF",
            color: "#141418",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {LEGAL_CONTACT_EMAIL}
        </a>
      </main>
    </div>
  );
}
