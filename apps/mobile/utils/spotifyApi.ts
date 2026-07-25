import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const TOKEN_KEY = "@nocap/spotify_tokens";

export type SpotifyTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type SpotifyTrack = {
  name: string;
  artist: string;
  isPlaying: boolean;
};

const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ");

export function getSpotifyClientId(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ||
    (Constants.expoConfig?.extra?.spotifyClientId as string | undefined)
  );
}

export function isSpotifyConfigured(): boolean {
  return Boolean(getSpotifyClientId());
}

export function getSpotifyScopes(): string {
  return SCOPES;
}

export async function saveSpotifyTokens(tokens: SpotifyTokens): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export async function loadSpotifyTokens(): Promise<SpotifyTokens | null> {
  try {
    const raw = await AsyncStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SpotifyTokens;
  } catch {
    return null;
  }
}

export async function clearSpotifyTokens(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function isSpotifyConnected(): Promise<boolean> {
  const tokens = await loadSpotifyTokens();
  return tokens != null;
}

export async function storeTokenResponse(data: {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}): Promise<void> {
  const existing = await loadSpotifyTokens();
  await saveSpotifyTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? existing?.refreshToken ?? "",
    expiresAt: Date.now() + data.expires_in * 1000 - 60_000,
  });
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  const clientId = getSpotifyClientId();
  if (!clientId) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    await clearSpotifyTokens();
    return null;
  }

  const data = await res.json();
  await storeTokenResponse(data);
  return data.access_token as string;
}

export async function getValidAccessToken(): Promise<string | null> {
  const tokens = await loadSpotifyTokens();
  if (!tokens?.accessToken) return null;
  if (Date.now() < tokens.expiresAt) return tokens.accessToken;
  if (!tokens.refreshToken) return null;
  return refreshAccessToken(tokens.refreshToken);
}

async function spotifyFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getValidAccessToken();
  if (!token) throw new Error("NOT_CONNECTED");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (init?.body) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`https://api.spotify.com/v1${path}`, {
    ...init,
    headers,
  });
}

async function playbackCommand(
  path: string,
  method = "PUT",
  body?: object
): Promise<boolean> {
  try {
    const res = await spotifyFetch(path, {
      method,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 204 || res.ok) return true;
    if (res.status === 404) {
      throw new Error("NO_ACTIVE_DEVICE");
    }
    if (res.status === 403) {
      throw new Error("PREMIUM_REQUIRED");
    }
    return false;
  } catch (e: any) {
    if (
      e?.message === "NOT_CONNECTED" ||
      e?.message === "NO_ACTIVE_DEVICE" ||
      e?.message === "PREMIUM_REQUIRED"
    ) {
      throw e;
    }
    return false;
  }
}

type SpotifyDevice = {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
};

async function listDevices(): Promise<SpotifyDevice[]> {
  try {
    const res = await spotifyFetch("/me/player/devices");
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.devices ?? []).filter((d: SpotifyDevice) => d?.id);
  } catch {
    return [];
  }
}

/** Spotify must have a device in its player list — open alone isn't enough. */
async function ensurePlaybackDevice(): Promise<string | null> {
  const devices = await listDevices();
  if (!devices.length) return null;

  const active = devices.find((d) => d.is_active);
  if (active) return active.id;

  // Prefer phone, then any available device
  const preferred =
    devices.find((d) => /smartphone|tablet/i.test(d.type)) ?? devices[0];

  const transfer = await spotifyFetch("/me/player", {
    method: "PUT",
    body: JSON.stringify({
      device_ids: [preferred.id],
      play: false,
    }),
  });

  // 204 = transferred; 404 = still no player — caller should surface hint
  if (transfer.status === 204 || transfer.ok) {
    await new Promise((r) => setTimeout(r, 400));
    return preferred.id;
  }
  return preferred.id;
}

export async function playPlaylist(playlistId: string): Promise<boolean> {
  const deviceId = await ensurePlaybackDevice();
  if (!deviceId) throw new Error("NO_ACTIVE_DEVICE");

  const qs = `?device_id=${encodeURIComponent(deviceId)}`;
  return playbackCommand(`/me/player/play${qs}`, "PUT", {
    context_uri: `spotify:playlist:${playlistId}`,
  });
}

export async function pausePlayback(): Promise<boolean> {
  const deviceId = await ensurePlaybackDevice();
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  return playbackCommand(`/me/player/pause${qs}`, "PUT");
}

export async function resumePlayback(): Promise<boolean> {
  const deviceId = await ensurePlaybackDevice();
  if (!deviceId) throw new Error("NO_ACTIVE_DEVICE");
  const qs = `?device_id=${encodeURIComponent(deviceId)}`;
  return playbackCommand(`/me/player/play${qs}`, "PUT");
}

export async function skipNext(): Promise<boolean> {
  const deviceId = await ensurePlaybackDevice();
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  return playbackCommand(`/me/player/next${qs}`, "POST");
}

export async function skipPrevious(): Promise<boolean> {
  const deviceId = await ensurePlaybackDevice();
  const qs = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  return playbackCommand(`/me/player/previous${qs}`, "POST");
}

export async function getNowPlaying(): Promise<SpotifyTrack | null> {
  try {
    const res = await spotifyFetch("/me/player");
    if (res.status === 204 || !res.ok) return null;
    const data = await res.json();
    const item = data?.item;
    if (!item) return null;
    const artists = (item.artists ?? [])
      .map((a: { name: string }) => a.name)
      .join(", ");
    return {
      name: item.name ?? "Unknown",
      artist: artists || "Unknown artist",
      isPlaying: data.is_playing === true,
    };
  } catch {
    return null;
  }
}

export function spotifyDeviceHint(): string {
  return "In Spotify, tap Play on any song once (Premium required), then come back and try again — Spotify must register this phone as a player.";
}

