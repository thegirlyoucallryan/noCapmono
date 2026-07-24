import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import Colors from "../constants/Colors";
import { DISPLAY_FONT } from "../constants/Typography";
import { SPOTIFY_VIBES, SpotifyVibe } from "../constants/SpotifyVibes";
import { getSavedVibeId, saveVibeId } from "../../utils/spotify";
import {
  getNowPlaying,
  getSpotifyClientId,
  getSpotifyScopes,
  isSpotifyConfigured,
  isSpotifyConnected,
  pausePlayback,
  playPlaylist,
  resumePlayback,
  skipNext,
  skipPrevious,
  spotifyDeviceHint,
  storeTokenResponse,
  clearSpotifyTokens,
  SpotifyTrack,
} from "../../utils/spotifyApi";

WebBrowser.maybeCompleteAuthSession();

const discovery: AuthSession.DiscoveryDocument = {
  authorizationEndpoint: "https://accounts.spotify.com/authorize",
  tokenEndpoint: "https://accounts.spotify.com/api/token",
};

type Props = {
  compact?: boolean;
};

/**
 * In-app Spotify: connect once, pick a vibe, control play/pause/skip here.
 * Uses Spotify Web API (Spotify app must be installed; open it once).
 */
export function SpotifyPlayer({ compact = false }: Props) {
  const clientId = getSpotifyClientId();
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "nocap",
    path: "spotify-callback",
  });

  const [connected, setConnected] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  const [ready, setReady] = useState(false);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId ?? "",
      scopes: getSpotifyScopes().split(" "),
      redirectUri,
      usePKCE: true,
    },
    discovery
  );

  const selected = useMemo(
    () => SPOTIFY_VIBES.find((v) => v.id === selectedId) ?? SPOTIFY_VIBES[0],
    [selectedId]
  );

  useEffect(() => {
    getSavedVibeId().then((id) => {
      setSelectedId(id ?? SPOTIFY_VIBES[0].id);
      setReady(true);
    });
    isSpotifyConnected().then(setConnected);
  }, []);

  useEffect(() => {
    if (response?.type !== "success" || !request) return;
    (async () => {
      setBusy(true);
      try {
        const code = response.params.code;
        const body = new URLSearchParams({
          client_id: clientId!,
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          code_verifier: request.codeVerifier ?? "",
        });
        const tokenRes = await fetch(discovery.tokenEndpoint!, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: body.toString(),
        });
        if (!tokenRes.ok) throw new Error("Token exchange failed");
        const data = await tokenRes.json();
        await storeTokenResponse(data);
        setConnected(true);
      } catch {
        Alert.alert("Spotify", "Could not connect. Try again.");
      } finally {
        setBusy(false);
      }
    })();
  }, [response, request, clientId, redirectUri]);

  useEffect(() => {
    if (!connected) return;
    let alive = true;
    const poll = async () => {
      const now = await getNowPlaying();
      if (alive) setTrack(now);
    };
    poll();
    const id = setInterval(poll, 4000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [connected]);

  const handleApiError = (e: unknown) => {
    const msg = e instanceof Error ? e.message : "";
    if (msg === "NO_ACTIVE_DEVICE") {
      Alert.alert("Open Spotify", spotifyDeviceHint());
      return;
    }
    Alert.alert("Spotify", "Something went wrong. Open Spotify and try again.");
  };

  const connect = async () => {
    if (!clientId) {
      Alert.alert(
        "Spotify not configured",
        "Add EXPO_PUBLIC_SPOTIFY_CLIENT_ID to .env and register nocap://spotify-callback in the Spotify Developer Dashboard."
      );
      return;
    }
    await promptAsync();
  };

  const disconnect = async () => {
    await clearSpotifyTokens();
    setConnected(false);
    setTrack(null);
  };

  const playVibe = async (vibe: SpotifyVibe) => {
    setSelectedId(vibe.id);
    await saveVibeId(vibe.id);
    if (!connected) {
      await connect();
      return;
    }
    setBusy(true);
    try {
      const ok = await playPlaylist(vibe.playlistId);
      if (!ok) throw new Error("NO_ACTIVE_DEVICE");
      setTimeout(() => getNowPlaying().then(setTrack), 800);
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy(false);
    }
  };

  const togglePlay = async () => {
    if (!connected) return;
    setBusy(true);
    try {
      const ok = track?.isPlaying
        ? await pausePlayback()
        : await resumePlayback();
      if (!ok) throw new Error("NO_ACTIVE_DEVICE");
      setTrack((t) => (t ? { ...t, isPlaying: !t.isPlaying } : t));
      setTimeout(() => getNowPlaying().then(setTrack), 500);
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    if (!connected) return;
    setBusy(true);
    try {
      const ok = await skipNext();
      if (!ok) throw new Error("NO_ACTIVE_DEVICE");
      setTimeout(() => getNowPlaying().then(setTrack), 600);
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy(false);
    }
  };

  const prev = async () => {
    if (!connected) return;
    setBusy(true);
    try {
      const ok = await skipPrevious();
      if (!ok) throw new Error("NO_ACTIVE_DEVICE");
      setTimeout(() => getNowPlaying().then(setTrack), 600);
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy(false);
    }
  };

  const renderControls = () => (
    <View style={styles.controls}>
      <Pressable onPress={prev} disabled={busy || !connected} style={styles.ctrlBtn}>
        <Ionicons name="play-skip-back" size={22} color="#fff" />
      </Pressable>
      <Pressable
        onPress={togglePlay}
        disabled={busy || !connected}
        style={styles.ctrlBtnMain}
      >
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Ionicons
            name={track?.isPlaying ? "pause" : "play"}
            size={26}
            color="#fff"
          />
        )}
      </Pressable>
      <Pressable onPress={next} disabled={busy || !connected} style={styles.ctrlBtn}>
        <Ionicons name="play-skip-forward" size={22} color="#fff" />
      </Pressable>
    </View>
  );

  if (!isSpotifyConfigured()) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.hint}>
          Spotify controls need a Client ID in .env — ask dev to wire it up.
        </Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactWrap}>
        <View style={styles.compactNow}>
          <Ionicons name="musical-notes" size={14} color="#1DB954" />
          <Text style={styles.compactTrack} numberOfLines={1}>
            {track?.name ?? selected.label}
          </Text>
        </View>
        {renderControls()}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="musical-notes" size={18} color="#1DB954" />
          <Text style={styles.title}>Music</Text>
        </View>
        {connected ? (
          <Pressable onPress={disconnect} hitSlop={8}>
            <Text style={styles.linkMuted}>Disconnect</Text>
          </Pressable>
        ) : (
          <Pressable onPress={connect} disabled={busy} hitSlop={8}>
            <Text style={styles.link}>
              {busy ? "Connecting…" : "Connect Spotify"}
            </Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.hint}>
        {connected
          ? "Control playback here — no need to leave No-Cap."
          : "Connect once, then play/pause/skip from your workout."}
      </Text>

      {connected && (
        <View style={styles.nowPlaying}>
          <Text style={styles.nowLabel}>Now playing</Text>
          <Text style={styles.nowTrack} numberOfLines={1}>
            {track?.name ?? "—"}
          </Text>
          {track?.artist ? (
            <Text style={styles.nowArtist} numberOfLines={1}>
              {track.artist}
            </Text>
          ) : null}
          {renderControls()}
        </View>
      )}

      <Text style={styles.vibeLabel}>Workout vibes</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {SPOTIFY_VIBES.map((vibe) => {
          const active = vibe.id === selectedId;
          return (
            <Pressable
              key={vibe.id}
              onPress={() => playVibe(vibe)}
              disabled={busy || !ready}
              style={[
                styles.chip,
                active && {
                  borderColor: vibe.tint,
                  backgroundColor: `${vibe.tint}22`,
                },
              ]}
            >
              <View style={[styles.dot, { backgroundColor: vibe.tint }]} />
              <Text
                style={[styles.chipLabel, active && { color: "#fff" }]}
                numberOfLines={1}
              >
                {vibe.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {!connected && (
        <Pressable onPress={connect} style={styles.connectCta} disabled={busy}>
          <Ionicons name="musical-notes" size={20} color="#1DB954" />
          <Text style={styles.connectText}>Connect Spotify to start</Text>
        </Pressable>
      )}
    </View>
  );
}

/** @deprecated use SpotifyPlayer */
export const SpotifyVibePicker = SpotifyPlayer;

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontFamily: DISPLAY_FONT,
    fontSize: 22,
    color: "#fff",
    letterSpacing: 0.5,
  },
  link: {
    color: "#1DB954",
    fontSize: 13,
    fontWeight: "600",
  },
  linkMuted: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  nowPlaying: {
    backgroundColor: Colors.inset,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#1DB95444",
  },
  nowLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nowTrack: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  nowArtist: {
    color: Colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  ctrlBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  ctrlBtnMain: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#1DB954",
    alignItems: "center",
    justifyContent: "center",
  },
  vibeLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    gap: 10,
    paddingVertical: 4,
    paddingRight: 8,
  },
  chip: {
    minWidth: 110,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.highlight,
    padding: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  chipLabel: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: "700",
  },
  connectCta: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.inset,
    borderWidth: 1,
    borderColor: "#1DB95455",
  },
  connectText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  compactWrap: {
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  compactNow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    maxWidth: 260,
  },
  compactTrack: {
    color: Colors.textMuted,
    fontSize: 12,
    flexShrink: 1,
  },
});
