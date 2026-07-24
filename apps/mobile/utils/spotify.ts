import { Alert, Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getVibeById, SpotifyVibe, SPOTIFY_VIBES } from "../src/constants/SpotifyVibes";

const VIBE_KEY = "@nocap/spotify_vibe";

export async function getSavedVibeId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(VIBE_KEY);
  } catch {
    return null;
  }
}

export async function saveVibeId(id: string): Promise<void> {
  try {
    await AsyncStorage.setItem(VIBE_KEY, id);
  } catch {
    /* ignore */
  }
}

export async function getSavedVibe(): Promise<SpotifyVibe | undefined> {
  const id = await getSavedVibeId();
  return getVibeById(id) ?? SPOTIFY_VIBES[0];
}

function playlistAppUri(playlistId: string) {
  return `spotify:playlist:${playlistId}`;
}

function playlistWebUrl(playlistId: string) {
  return `https://open.spotify.com/playlist/${playlistId}`;
}

/** Prefer native app URI; fall back to open.spotify.com. */
export async function openSpotifyPlaylist(playlistId: string): Promise<boolean> {
  const appUri = playlistAppUri(playlistId);
  const webUrl = playlistWebUrl(playlistId);

  try {
    if (Platform.OS !== "web") {
      const can = await Linking.canOpenURL(appUri);
      if (can) {
        await Linking.openURL(appUri);
        return true;
      }
    }
  } catch {
    /* fall through */
  }

  try {
    await Linking.openURL(webUrl);
    return true;
  } catch {
    Alert.alert(
      "Can't open Spotify",
      "Install Spotify or open open.spotify.com in your browser."
    );
    return false;
  }
}

export async function openVibe(vibe: SpotifyVibe): Promise<boolean> {
  await saveVibeId(vibe.id);
  return openSpotifyPlaylist(vibe.playlistId);
}

/** Open Spotify app home, or web if missing. */
export async function openSpotifyApp(): Promise<boolean> {
  try {
    if (await Linking.canOpenURL("spotify:")) {
      await Linking.openURL("spotify:");
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    await Linking.openURL("https://open.spotify.com");
    return true;
  } catch {
    return false;
  }
}
