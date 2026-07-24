/**
 * Curated workout vibes → Spotify editorial / popular playlists.
 * Deep-link only — no Spotify API / OAuth required.
 */
export type SpotifyVibe = {
  id: string;
  label: string;
  blurb: string;
  /** Spotify playlist id */
  playlistId: string;
  /** Accent for the chip (hex) */
  tint: string;
};

export const SPOTIFY_VIBES: SpotifyVibe[] = [
  {
    id: "beast",
    label: "Beast Mode",
    blurb: "Heavy lifts. Louder.",
    playlistId: "37i9dQZF1DX76Wlfdnj7AP",
    tint: "#E8453C",
  },
  {
    id: "cardio",
    label: "Cardio",
    blurb: "BPM that matches the burn.",
    playlistId: "37i9dQZF1DWSJHnPb1f0X3",
    tint: "#98F2E7",
  },
  {
    id: "rap",
    label: "Rap Fuel",
    blurb: "Bars for the last set.",
    playlistId: "37i9dQZF1DX0XUsuxWHRQd",
    tint: "#A8615F",
  },
  {
    id: "rock",
    label: "Rock Hard",
    blurb: "Guitars. Grit. Gains.",
    playlistId: "37i9dQZF1DXcF6B6QPhFDv",
    tint: "#FF6B35",
  },
  {
    id: "dance",
    label: "Dance Hits",
    blurb: "Move like the drop.",
    playlistId: "37i9dQZF1DX8tZsk68tuDw",
    tint: "#E6C0AA",
  },
  {
    id: "latin",
    label: "Latin Cardio",
    blurb: "Heat for every rep.",
    playlistId: "37i9dQZF1DX0HRj9P7NxeE",
    tint: "#FF6B35",
  },
  {
    id: "focus",
    label: "Deep Focus",
    blurb: "Quiet grind energy.",
    playlistId: "37i9dQZF1DWZeKCadgRdKQ",
    tint: "#A68F97",
  },
];

export function getVibeById(id: string | null | undefined): SpotifyVibe | undefined {
  if (!id) return undefined;
  return SPOTIFY_VIBES.find((v) => v.id === id);
}
