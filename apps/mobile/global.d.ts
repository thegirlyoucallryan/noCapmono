declare module "*.png" {
  const value: import("react-native").ImageSourcePropType;
  export default value;
}

declare module "*.wav" {
  const value: number;
  export default value;
}

declare module "*.ttf" {
  const value: number;
  export default value;
}

declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_KEY?: string; // ExerciseDB / RapidAPI (legacy)
    EXPO_PUBLIC_WORKOUTX_API_KEY?: string;
    EXPO_PUBLIC_SUPABASE_URL?: string;
    EXPO_PUBLIC_SUPABASE_KEY?: string;
    EXPO_PUBLIC_SPOTIFY_CLIENT_ID?: string;
  }
}
