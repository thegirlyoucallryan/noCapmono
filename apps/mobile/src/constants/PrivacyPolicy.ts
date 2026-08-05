/** In-app Privacy Policy — bump PRIVACY_VERSION in Legal.ts when this changes. */

import { LEGAL_CONTACT_EMAIL } from "./TermsOfService";

export type PrivacySection = {
  title: string;
  body: string;
};

export const PRIVACY_META = {
  title: "No-Cap Privacy Policy",
  effectiveDate: "July 20, 2026",
  lastUpdated: "August 5, 2026",
};

export const PRIVACY_INTRO = `This Privacy Policy explains how No-Cap ("No-Cap," "we," "us," or "our") collects, uses, stores, shares, and protects information when you use the No-Cap mobile application and related websites or pages (the "Service").

By creating an account, signing in, accepting this Policy in-app, or using the Service, you acknowledge this Privacy Policy. If you do not agree, do not use the Service.

This Policy is designed for a fitness app that stores workout data, uses optional device sensors, and may connect to third-party services such as Apple, Google, Spotify, and our cloud provider.`;

export const PRIVACY_SECTIONS: PrivacySection[] = [
  {
    title: "1. Who We Are / Contact",
    body: `No-Cap is operated by the No-Cap team.

Privacy / data requests:
Email: ${LEGAL_CONTACT_EMAIL}
Subject line suggestion: Privacy Request – No-Cap

If we designate a different privacy contact later, we will update this Policy.`,
  },
  {
    title: "2. Information We Collect",
    body: `We collect information in three main ways: (A) you provide it, (B) the App generates or stores it through your use, and (C) third-party services provide it when you connect them.

A. Account and identity information
• Email address and password (if you use email sign-in)
• Display name / profile details you choose to provide
• Sign-in identifiers from Apple or Google when you use those providers
• Records that you accepted Terms / Privacy (including version and timestamp)

B. Fitness and workout information
• Workouts you create (names, exercise selections, structure, order)
• Exercise logs (sets, reps, weights, session history)
• Training stats and related progress displays derived from your logs
• Calculator inputs/outputs you choose to run in Tools
• Favorites or similar preferences stored in the App

C. Device, sensor, and technical information
• With your permission: motion / pedometer / step-related data from your device
• Device type, OS version, app version, crash/diagnostic data (as provided by the OS, Expo, or store tooling)
• Approximate network/technical logs needed to operate auth and cloud sync

D. Optional third-party connections
• Spotify: if you connect Spotify, we may store tokens/session data locally to enable vibe selection and playback controls you request
• We do not sell your Spotify listening history

E. Information we do not intentionally collect
• We do not require government ID, payment card numbers, or precise continuous GPS tracking for core features
• We do not provide medical diagnosis and do not intend the App to be a medical record system`,
  },
  {
    title: "3. How We Use Information",
    body: `We use information to:
• create and secure your account;
• sync and display your workouts, logs, and stats;
• provide calculators, timers, and training tools;
• enable optional pedometer / step features you turn on;
• enable optional Spotify features you connect;
• remember your legal acceptance and preferences;
• operate, maintain, debug, and improve the Service;
• communicate about the Service (including security and important notices);
• protect against abuse, fraud, and unauthorized access; and
• comply with law and enforce our Terms.

We do not use your workout data to provide medical advice.`,
  },
  {
    title: "4. Legal Bases (Where Applicable)",
    body: `Depending on where you live, we may rely on one or more of the following:
• Contract: to provide the Service you request
• Consent: for optional permissions (e.g., motion/sensors) and certain marketing or connections (where required)
• Legitimate interests: to secure, improve, and operate the Service in ways that do not override your rights
• Legal obligation: when the law requires us to process or retain information

You may withdraw consent for optional permissions in your device settings; some features may stop working.`,
  },
  {
    title: "5. How We Share Information",
    body: `We do not sell your personal information.

We share information only as needed to run the Service:

A. Service providers / processors
• Supabase (authentication and cloud database hosting)
• Apple and Google (if you choose their sign-in)
• Spotify (if you connect it)
• Infrastructure, analytics, crash, or build tooling that helps us ship and maintain the App
• Exercise/media data providers used to power exercise browsing (these providers supply catalog content; your personal account data is not sold to them)

B. Legal and safety
We may disclose information if we believe in good faith that disclosure is required by law, legal process, or to protect the rights, safety, or security of No-Cap, our users, or the public.

C. Business transfers
If No-Cap is involved in a merger, acquisition, financing, or sale of assets, information may be transferred as part of that transaction, subject to this Policy or a successor policy with notice where required.

D. With your direction
We may share information when you ask us to (for example, contacting support).`,
  },
  {
    title: "6. Local Storage on Your Device",
    body: `The App may store certain data on your device (for example via AsyncStorage), including:
• auth session material;
• legal acceptance backup;
• workout/log caches or offline-friendly copies;
• Spotify tokens/preferences if connected;
• UI preferences.

Uninstalling the App typically deletes local storage on that device, but cloud account data may remain until you request deletion.`,
  },
  {
    title: "7. Sensors and Permissions",
    body: `No-Cap may request permission to access motion / fitness-related APIs to provide step counting and related Tools features.

• Permission is optional where the OS allows
• You can revoke access in system settings
• Sensor data can be inaccurate and is not for medical use
• We use sensor data to provide the feature you enabled, not to build advertising profiles`,
  },
  {
    title: "8. Data Retention",
    body: `We keep information for as long as your account is active and as needed to provide the Service.

We may retain certain records longer when necessary to:
• resolve disputes;
• enforce agreements;
• meet legal, tax, or accounting requirements; or
• maintain security logs for a reasonable period.

When you delete your account (or we delete it at your request), we will delete or de-identify personal data we control within a reasonable period, except where retention is required or permitted by law (for example, fraud prevention or legal claims).`,
  },
  {
    title: "9. Security",
    body: `We use commercially reasonable administrative, technical, and organizational safeguards designed to protect personal information (including encrypted transport to our cloud provider and access controls).

No method of transmission or storage is 100% secure. You are responsible for protecting your device, account credentials, and email inbox used for account recovery.`,
  },
  {
    title: "10. Children's Privacy",
    body: `No-Cap is not directed to children under 13 (or the minimum age required in your jurisdiction). We do not knowingly collect personal information from children under 13.

If you believe a child under 13 has provided personal information, contact ${LEGAL_CONTACT_EMAIL} and we will take appropriate steps to delete it.`,
  },
  {
    title: "11. Your Privacy Rights and Choices",
    body: `Depending on your location, you may have rights to:
• access the personal information we hold about you;
• correct inaccurate information;
• delete your account / personal information;
• export a copy of certain data;
• withdraw consent for optional processing;
• object to or restrict certain processing; and
• appeal a denial of a privacy request where required by law.

How to exercise rights:
• Delete your account in the App: open Home, tap the settings gear, then Delete account. This permanently deletes your account and associated cloud data (workouts, logs, profile) within a reasonable period, except where retention is required or permitted by law.
• For other privacy requests (access, correction, export, etc.), email ${LEGAL_CONTACT_EMAIL} with the subject "Privacy Request – No-Cap" and tell us what you need. We may verify your identity before fulfilling requests.
• If you no longer have the App installed, email ${LEGAL_CONTACT_EMAIL} with the subject "Account Deletion – No-Cap" and we will process deletion after verifying your identity.

Account controls:
• Delete account permanently from Home → Settings in the App
• Update profile details in the App where available
• Disconnect Spotify in Spotify/account settings and/or the App
• Revoke sensor permissions in device settings
• Sign out on shared devices

California / U.S. state privacy notices (summary):
We do not sell personal information as "sell" is commonly defined under CCPA/CPRA. We also do not knowingly share personal information for cross-context behavioral advertising. If that changes, we will update this Policy and provide required opt-outs.

You may designate an authorized agent where the law allows; we may still need to verify your identity.`,
  },
  {
    title: "12. International Data Transfers",
    body: `We may process and store information in the United States and other countries where we or our providers operate. Those locations may have different data-protection laws than your home country.

Where required, we use appropriate safeguards with providers (such as contractual protections) for cross-border transfers.`,
  },
  {
    title: "13. Third-Party Links and Services",
    body: `The Service may link to or integrate third-party services (Apple, Google, Spotify, exercise content providers, etc.). Their privacy practices are governed by their own policies. We are not responsible for third-party practices.

Please review:
• Apple Privacy Policy / Sign in with Apple disclosures
• Google Privacy Policy / Sign in with Google disclosures
• Spotify Privacy Policy (if you connect Spotify)
• Supabase / hosting provider practices as applicable to our backend`,
  },
  {
    title: "14. Do Not Track / Analytics",
    body: `Some browsers offer "Do Not Track" signals. There is no uniform standard for responding to them. We currently do not respond to DNT signals in a special way beyond the practices described here.

If we add analytics tools, we will update this Policy to describe categories of data collected and choices available to you.`,
  },
  {
    title: "15. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. When we make material changes, we will update the "Last Updated" date and may ask you to re-accept the Policy in-app (including privacy version bumps saved to your profile).

Continued use after the effective date of an updated Policy means you acknowledge the update, except where applicable law requires a different process.`,
  },
  {
    title: "16. Health-Related Disclaimer (Privacy Context)",
    body: `Workout logs, estimated lifts, step counts, and similar fitness data can reveal sensitive aspects of your activity. Treat your account like sensitive personal data: use a strong password, enable device lock, and avoid shared-device sign-in when possible.

No-Cap is not a HIPAA-covered entity and the App is not intended to be used as protected health information (PHI) storage for healthcare providers.`,
  },
  {
    title: "17. Contact",
    body: `Questions about privacy, data access, or deletion:

No-Cap
Email: ${LEGAL_CONTACT_EMAIL}

We aim to respond to verifiable privacy requests within the timeframes required by applicable law.`,
  },
];
