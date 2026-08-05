require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

const appJson = require("./app.json");

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  extra: {
    ...appJson.expo.extra,
    // apiKey: process.env.EXPO_PUBLIC_API_KEY, // ExerciseDB / RapidAPI (legacy)
    workoutxApiKey: process.env.EXPO_PUBLIC_WORKOUTX_API_KEY,
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.EXPO_PUBLIC_SUPABASE_KEY,
    spotifyClientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  },
};
