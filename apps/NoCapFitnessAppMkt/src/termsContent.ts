/** In-app Terms of Service — bump TERMS_VERSION in Legal.ts when this changes. */

export const LEGAL_CONTACT_EMAIL = "hartleybuildsapps@gmail.com";

export type TermsSection = {
  title: string;
  body: string;
};

export const TERMS_META = {
  title: "No-Cap Terms of Service and Liability Waiver",
  effectiveDate: "July 20, 2026",
  lastUpdated: "July 20, 2026",
};

export const TERMS_INTRO = `These Terms of Service and Liability Waiver (the "Terms") form a legally binding agreement between you ("you," "user") and the operator of the No-Cap application ("No-Cap," "we," "us," or "our").

By creating an account, signing in, tapping "I agree," or using No-Cap in any way, you acknowledge that you have read, understood, and agree to be bound by these Terms, including the Assumption of Risk, Release, and Liability Waiver in Section 6. If you do not agree, do not use the App.`;

export const TERMS_SECTIONS: TermsSection[] = [
  {
    title: "1. The Service",
    body: `No-Cap is a mobile fitness application for iOS and Android that may allow you to:

• browse exercise information and media;
• build, save, edit, and delete workouts;
• run guided workout sessions and log sets, reps, and weights;
• view training stats and progress-related displays;
• use training calculators (including estimated one-rep max / load tools);
• access device motion / pedometer features where permitted;
• connect optional third-party services (including Spotify); and
• authenticate via email/password, Sign in with Apple, and/or Google Sign-In.

We may add, change, suspend, or remove features at any time.`,
  },
  {
    title: "2. Eligibility",
    body: `You must be at least 13 years old (or the minimum digital-consent age in your jurisdiction, if higher) to use No-Cap. If you are under 18, you represent that a parent or legal guardian has reviewed and agreed to these Terms on your behalf. You may not use the App if you are legally prohibited from doing so.`,
  },
  {
    title: "3. Accounts and Security",
    body: `You are responsible for:

• providing accurate account information;
• maintaining the confidentiality of your credentials and devices; and
• all activity under your account.

Notify us promptly at ${LEGAL_CONTACT_EMAIL} if you suspect unauthorized access. We may suspend or terminate accounts that violate these Terms, create risk, or appear compromised.

Third-party sign-in (Apple, Google) is also governed by those providers' terms and privacy policies.`,
  },
  {
    title: "4. License to Use the App",
    body: `Subject to these Terms, we grant you a limited, personal, non-exclusive, non-transferable, revocable license to install and use No-Cap for your own non-commercial fitness purposes.

You may not: reverse engineer the App (except to the extent permitted by law); copy, rent, sell, or sublicense it; bypass security or usage limits; scrape or harvest data at scale; interfere with the Service; or use the App to build a competing product using our content or non-public materials.

All rights not expressly granted are reserved by us and our licensors.`,
  },
  {
    title: "5. Health, Medical, and Fitness Disclaimers",
    body: `No-Cap is not a medical device, and we are not your doctor, trainer, physical therapist, dietitian, or other licensed health professional.

Content in the App—including exercises, GIFs/media, workout structures, timers, calculators, estimated maxes, progression displays, and step counts—is for general informational and entertainment purposes only. It is not medical advice, diagnosis, treatment, or a substitute for professional care.

Before starting or changing any exercise program, consult a qualified physician, especially if you have any medical condition, injury, disability, are pregnant, take medication, have cardiovascular risk factors, or have been inactive.

Stop immediately and seek medical help if you experience chest pain, dizziness, unusual shortness of breath, fainting, severe pain, or any other warning sign during activity.

You alone decide whether any exercise, load, volume, or program is appropriate for you. Calculators and estimates (including 1RM tools) are approximations only and may be inaccurate.`,
  },
  {
    title: "6. Assumption of Risk; Release; Liability Waiver",
    body: `Physical exercise is inherently dangerous. Risks include, without limitation: muscle strains, sprains, tears; joint, bone, and soft-tissue injury; overuse injuries; falls; equipment-related injury; cardiovascular events (including heart attack and stroke); rhabdomyolysis; and in rare cases disability or death.

You voluntarily assume all risks arising from your use of No-Cap and from any exercise, training, or activity you undertake in connection with the App, whether or not such risks were foreseeable.

TO THE MAXIMUM EXTENT PERMITTED BY LAW, YOU HEREBY RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE No-Cap, its owners, officers, directors, employees, contractors, agents, affiliates, licensors, and successors (the "Released Parties") from any and all claims, demands, damages, losses, costs, and liabilities of every kind—whether based in contract, tort (including negligence), statute, or otherwise—arising out of or related to:

• your use of or inability to use the App;
• reliance on any App content, recommendation, calculation, or display;
• any workout, exercise, or physical activity you perform;
• injuries, illness, or death related to training; and
• interactions with third-party services linked or integrated with the App.

This waiver is intended to be as broad as permitted by applicable law. Some jurisdictions do not allow certain releases of negligence or consequential damages; in those jurisdictions, our liability is limited to the fullest extent allowed.

If any portion of this Section is held unenforceable, the remainder shall continue in full force.`,
  },
  {
    title: "7. User Content and Workout Data",
    body: `You may create or store content such as workout names, exercise selections, sets/reps/weights, notes, preferences, and related logs ("User Content").

You retain ownership of your User Content. You grant us a worldwide, non-exclusive, royalty-free license to host, store, process, back up, display, and otherwise use User Content solely as needed to operate, maintain, secure, and improve the Service and as described in our Privacy Policy.

You represent that you have the rights to submit User Content and that it does not violate law or third-party rights. We may remove content that appears unlawful, abusive, or harmful.`,
  },
  {
    title: "8. Third-Party Services and Content",
    body: `No-Cap may integrate or rely on third parties, including:

• Supabase (authentication and cloud data);
• Apple and Google (identity);
• Spotify (optional music connection and playback controls);
• Exercise / media data providers (exercise information and imagery).

Your use of those services is subject to their terms and privacy policies. We do not control and are not responsible for third-party services, outages, data practices, or content accuracy. Spotify connection is optional; disconnect or revoke access in Spotify's settings and/or the App when available.

Exercise descriptions and media may be incomplete, outdated, or unsuitable for you. Always use proper form and, when needed, professional instruction.`,
  },
  {
    title: "9. Device Permissions and Sensors",
    body: `With your permission, No-Cap may access motion/fitness-related device APIs (for example, pedometer / step data) and other permissions required for core features. You may revoke permissions in device settings, which may limit functionality. Sensor data can be inaccurate; do not rely on it for medical or safety-critical purposes.`,
  },
  {
    title: "10. Acceptable Use",
    body: `You agree not to:

• use the App for any unlawful purpose;
• harass, abuse, or harm others;
• upload malware or attempt to disrupt the Service;
• misrepresent your identity;
• attempt unauthorized access to accounts, systems, or data; or
• use the App in any way that could endanger yourself or others (including exercising in unsafe environments or ignoring medical advice).`,
  },
  {
    title: "11. Intellectual Property",
    body: `The No-Cap name, logos, UI, software, and original content are owned by us or our licensors and are protected by intellectual property laws. Third-party marks (including Apple, Google, and Spotify) belong to their respective owners and imply no affiliation beyond stated integrations.`,
  },
  {
    title: "12. Privacy",
    body: `Our collection and use of personal information is described in our Privacy Policy (as linked in the App). By using No-Cap, you also acknowledge that Policy. Fitness and account data may be stored locally on your device and/or on our cloud providers.`,
  },
  {
    title: "13. No Fees Today; Future Changes",
    body: `No-Cap does not currently charge users for in-app purchases or subscriptions. We may introduce paid features later. If we do, we will disclose pricing and terms before you are charged, and additional payment terms (including app store rules) may apply.`,
  },
  {
    title: "14. Disclaimers of Warranties",
    body: `THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE." TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, AND NON-INFRINGEMENT.

WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR THAT CONTENT, CALCULATIONS, STATS, OR STEP COUNTS WILL BE ACCURATE OR RELIABLE.`,
  },
  {
    title: "15. Limitation of Liability",
    body: `TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE RELEASED PARTIES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING FROM OR RELATED TO YOUR USE OF THE APP.

TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE APP OR THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) USD $50 OR (B) THE AMOUNTS YOU PAID US FOR THE APP IN THE 12 MONTHS BEFORE THE CLAIM (CURRENTLY $0 FOR MOST USERS).

THESE LIMITATIONS APPLY EVEN IF ANY REMEDY FAILS OF ITS ESSENTIAL PURPOSE.`,
  },
  {
    title: "16. Indemnification",
    body: `You agree to defend, indemnify, and hold harmless the Released Parties from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to: your use of the App; your workouts or physical activities; your User Content; your violation of these Terms; or your violation of any law or third-party right.`,
  },
  {
    title: "17. Termination",
    body: `You may stop using the App at any time. You may permanently delete your account in the App from Home → Settings → Delete account, or by contacting us if you no longer have the App. We may suspend or terminate access at any time for any reason, including violation of these Terms. Sections that by their nature should survive (including Sections 5–8 and 11–18) will survive termination.`,
  },
  {
    title: "18. Changes to the Terms",
    body: `We may update these Terms from time to time. The "Last Updated" date will change, and we may require re-acceptance in-app when material changes occur (including version bumps tied to your profile). Continued use after the effective date of updated Terms constitutes acceptance, except where applicable law requires a different process.`,
  },
  {
    title: "19. Governing Law; Disputes",
    body: `These Terms are governed by the laws of the applicable United States jurisdiction where No-Cap operates, excluding conflict-of-law rules.

Informal resolution first: before filing a claim, you agree to contact us at ${LEGAL_CONTACT_EMAIL} and attempt to resolve the dispute informally for 30 days.

Except where prohibited, disputes shall be resolved in a court of competent jurisdiction, and you consent to personal jurisdiction there.`,
  },
  {
    title: "20. Apple-Specific Terms (iOS)",
    body: `If you obtain the App from the Apple App Store, you acknowledge that: these Terms are between you and us, not Apple; Apple has no obligation to provide maintenance or support; Apple is not responsible for product warranties or claims relating to the App (including product liability, legal/regulatory compliance, or consumer protection claims) to the extent permitted by law; and Apple and Apple's subsidiaries are third-party beneficiaries of these Terms with the right to enforce them against you. Your use must also comply with Apple's App Store Terms of Use / Licensed Application End User License Agreement.`,
  },
  {
    title: "21. Miscellaneous",
    body: `These Terms, together with the Privacy Policy and any in-app disclosures you accept, are the entire agreement regarding the App. If any provision is unenforceable, the rest remains in effect. Our failure to enforce a provision is not a waiver. You may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition, or sale of assets. Headings are for convenience only.`,
  },
  {
    title: "22. Contact",
    body: `No-Cap
Email: ${LEGAL_CONTACT_EMAIL}

For legal notices, use the same email with subject line: Legal Notice – No-Cap.`,
  },
];
