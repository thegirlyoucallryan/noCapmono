import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { DISPLAY_FONT } from "../constants/Typography";
import { SmokyMountains } from "../components/SmokyMountains";
import { RaisedCard } from "../components/RaisedCard";
import { InsetWell } from "../components/InsetWell";
import { GradientCTA } from "../components/GradientCTA";
import { ProgressionChart } from "../components/ProgressionChart";
import { BrandHeader } from "../components/BrandHeader";
import { setWorkout, clearFavorites } from "../store/actions";
import {
  getHomeSummary,
  loadSavedWorkoutExercises,
  formatTension,
  formatVolumeLabel,
  HomeSummary,
  LiftMax,
} from "../../utils/workoutStore";
import { supabase } from "../../utils/supabase";
import { getDisplayName } from "../../utils/workoutApi";

function formatWhen(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round(
    (startToday.getTime() - startThat.getTime()) / 86400000
  );

  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (dayDiff === 0) return `Today · ${time}`;
  if (dayDiff === 1) return `Yesterday · ${time}`;
  if (dayDiff < 7) return `${dayDiff} days ago`;
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function shortDay(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    month: "numeric",
    day: "numeric"});
}

export default function DashboardScreen() {
  const nav = useNavigation<any>();
  const dispatch = useDispatch();
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [focusLift, setFocusLift] = useState<LiftMax | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await getHomeSummary();
    setSummary(data);
    try {
      const name = await getDisplayName();
      setUserName(name);
    } catch {
      setUserName(null);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const last = summary?.lastSession;
  const saved = summary?.savedWorkouts ?? [];
  const maxes = summary?.topMaxes ?? [];
  const history = summary?.sessionHistory ?? [];

  const volumePoints = [...history]
    .reverse()
    .filter((s) => (s.volumeLoad ?? 0) > 0)
    .map((s) => ({
      value: Math.round(s.volumeLoad ?? 0),
      label: shortDay(s.at)}));

  const loadSaved = async (id: string, name?: string) => {
    const exercises = await loadSavedWorkoutExercises(id);
    if (!exercises.length) return;
    dispatch(setWorkout(exercises, name ?? null));
    nav.navigate("My Workout");
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.atmosphere} pointerEvents="none">
        <SmokyMountains intensity={0.4} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
      >
        <BrandHeader
          userName={userName}
          subtitle="Your stats. Your climb."
        />
        <Pressable
          onPress={async () => {
            dispatch(clearFavorites());
            await supabase.auth.signOut();
          }}
          style={styles.signOutBtn}
          hitSlop={8}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <RaisedCard style={styles.heroCard}>
          <Text style={styles.sectionEyebrow}>Last session</Text>
          {last ? (
            <>
              <Text style={styles.heroWhen}>{formatWhen(last.at)}</Text>
              <Text style={styles.heroDetail}>
                {last.exerciseCount} move
                {last.exerciseCount === 1 ? "" : "s"} · {last.sets} sets ·{" "}
                {last.type}
              </Text>
              <View style={styles.statRow}>
                <InsetWell style={styles.statPill}>
                  <Text style={styles.statLabel}>Total lifted</Text>
                  <Text style={styles.statValue}>
                    {last.volumeLoad
                      ? formatVolumeLabel(last.volumeLoad)
                      : "—"}
                  </Text>
                  <Text style={styles.statHint}>weight × reps, added up</Text>
                </InsetWell>
                <InsetWell style={styles.statPill}>
                  <Text style={styles.statLabel}>Work time</Text>
                  <Text style={styles.statValue}>
                    {last.tensionSeconds
                      ? formatTension(last.tensionSeconds)
                      : "—"}
                  </Text>
                  <Text style={styles.statHint}>exercise timer, not rest</Text>
                </InsetWell>
              </View>
              {volumePoints.length >= 2 ? (
                <View style={styles.inlineChart}>
                  <ProgressionChart
                    points={volumePoints}
                    tone="mint"
                    unit="lb"
                    height={72}
                    compact
                  />
                </View>
              ) : null}
              <GradientCTA
                title="My Workout"
                icon="barbell-outline"
                onPress={() => nav.navigate("My Workout")}
                style={styles.cta}
              />
            </>
          ) : (
            <>
              <Text style={styles.heroEmpty}>No session yet</Text>
              <Text style={styles.heroDetail}>
                Build a workout, hit Play — it’ll show up here.
              </Text>
              <GradientCTA
                title="Start building"
                icon="hammer-outline"
                onPress={() => nav.navigate("Build")}
                style={styles.cta}
              />
            </>
          )}
        </RaisedCard>

        <Text style={styles.sectionTitle}>Saved workouts</Text>
        {saved.length ? (
          saved.slice(0, 6).map((w) => (
            <Pressable
              key={w.id}
              onPress={() => loadSaved(w.id, w.name)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <RaisedCard style={styles.row}>
                <View style={styles.rowIcon}>
                  <Ionicons name="bookmark" size={18} color={Colors.glowCyan} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {w.name}
                  </Text>
                  <Text style={styles.rowSub}>
                    Saved {formatWhen(w.updated_at || w.created_at)}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textMuted}
                />
              </RaisedCard>
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyHint}>
            Save a workout from My Workout to see it here.
          </Text>
        )}

        <Text style={styles.sectionTitle}>Your maxes</Text>
        <Text style={styles.sectionHint}>Tap a lift for its climb chart</Text>
        {maxes.length ? (
          maxes.map((m) => (
            <Pressable key={m.exercise_id} onPress={() => setFocusLift(m)}>
              <RaisedCard style={styles.maxRow}>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {m.exercise_name.replace(/\(Male\)/i, "")}
                  </Text>
                  <Text style={styles.rowSub}>
                    {formatWhen(m.performed_at)}
                    {m.delta != null && m.delta !== 0
                      ? ` · ${m.delta > 0 ? "+" : ""}${m.delta} lb`
                      : ""}
                  </Text>
                </View>
                <View style={styles.maxRight}>
                  <Text style={styles.maxWeight}>{m.weight} lb</Text>
                  <Ionicons
                    name="stats-chart-outline"
                    size={14}
                    color={Colors.textMuted}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </RaisedCard>
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyHint}>
            Log weight during Play — your best lifts land here.
          </Text>
        )}
      </ScrollView>

      <Modal
        visible={!!focusLift}
        transparent
        animationType="fade"
        onRequestClose={() => setFocusLift(null)}
      >
        <Pressable style={styles.modalBg} onPress={() => setFocusLift(null)}>
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            {focusLift ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {focusLift.exercise_name.replace(/\(Male\)/i, "")}
                  </Text>
                  <Pressable onPress={() => setFocusLift(null)} hitSlop={10}>
                    <Ionicons name="close" size={22} color={Colors.textMuted} />
                  </Pressable>
                </View>
                <ProgressionChart
                  points={focusLift.history.map((h) => ({
                    value: h.weight,
                    label: shortDay(h.at)}))}
                  tone="heat"
                  unit="lb"
                  height={130}
                />
                {focusLift.delta != null && focusLift.delta !== 0 ? (
                  <Text
                    style={[
                      styles.delta,
                      focusLift.delta > 0 ? styles.deltaUp : styles.deltaDown,
                    ]}
                  >
                    {focusLift.delta > 0 ? "↑" : "↓"}{" "}
                    {Math.abs(focusLift.delta)} lb vs prior best
                  </Text>
                ) : null}
              </>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.twentyThree},
  atmosphere: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300},
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 8},
  signOutBtn: {
    alignSelf: "flex-end",
    marginTop: -12,
    marginBottom: 12},
  signOutText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: "600"},
  heroCard: {
    padding: 18,
    marginBottom: 20},
  sectionEyebrow: {
    color: Colors.glowCyan,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6},
  heroWhen: {
    fontFamily: DISPLAY_FONT,
    fontSize: 28,
    color: Colors.glowCyan,
    letterSpacing: 0.5},
  heroEmpty: {
    fontFamily: DISPLAY_FONT,
    fontSize: 28,
    color: "#fff",
    letterSpacing: 0.5},
  heroDetail: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20},
  statRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14},
  statPill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12},
  statLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4},
  statValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  statHint: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 4,
    lineHeight: 13,
  },
  inlineChart: {
    marginTop: 12},
  cta: {
    marginTop: 16},
  sectionTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: 22,
    color: "#fff",
    letterSpacing: 0.8,
    marginBottom: 4,
    marginTop: 4},
  sectionHint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 10},
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    gap: 10},
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.inset,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"},
  rowBody: {
    flex: 1,
    minWidth: 0},
  rowTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize"},
  rowSub: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2},
  maxRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8},
  maxRight: {
    flexDirection: "row",
    alignItems: "center"},
  maxWeight: {
    fontFamily: DISPLAY_FONT,
    fontSize: 26,
    color: Colors.ctaStart,
    letterSpacing: 0.5},
  emptyHint: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16},
  pressed: {
    opacity: 0.85},
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20},
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark},
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
    gap: 12},
  modalTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textTransform: "capitalize"},
  delta: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700"},
  deltaUp: {
    color: Colors.accent},
  deltaDown: {
    color: Colors.accent4}});
