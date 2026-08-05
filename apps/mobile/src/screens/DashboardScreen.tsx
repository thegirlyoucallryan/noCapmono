import { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Modal,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { DISPLAY_FONT } from "../constants/Typography";
import { LEGAL_CONTACT_EMAIL } from "../constants/TermsOfService";
import {
  PRIVACY_URL,
  TERMS_URL,
  DELETE_ACCOUNT_URL,
} from "../constants/Legal";
import { SmokyMountains } from "../components/SmokyMountains";
import { RaisedCard } from "../components/RaisedCard";
import { InsetWell } from "../components/InsetWell";
import { GradientCTA } from "../components/GradientCTA";
import { ProgressionChart } from "../components/ProgressionChart";
import { BrandHeader } from "../components/BrandHeader";
import { SavedWorkoutPreviewModal } from "../components/SavedWorkoutPreviewModal";
import { setWorkout, clearFavorites } from "../store/actions";
import {
  getHomeSummary,
  loadSavedWorkoutExercises,
  removeSavedWorkout,
  formatTension,
  // formatVolumeLabel, // used with total lifted
  formatCaloriesEst,
  estimateCaloriesBurned,
  HomeSummary,
  LiftMax,
} from "../../utils/workoutStore";
import { supabase } from "../../utils/supabase";
import { getDisplayName } from "../../utils/workoutApi";
import {
  clearAccountLocalData,
  deleteAccount,
} from "../../utils/accountApi";
import type { SavedWorkout } from "../../utils/workoutApi";

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
  const loadedWorkoutId = useSelector(
    (s: any) => s.favorites.loadedWorkoutId as string | null
  );
  const [summary, setSummary] = useState<HomeSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [focusLift, setFocusLift] = useState<LiftMax | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [previewWorkout, setPreviewWorkout] = useState<SavedWorkout | null>(
    null
  );
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const loadSaved = async (w: SavedWorkout) => {
    const exercises = await loadSavedWorkoutExercises(w.id);
    if (!exercises.length) return;
    dispatch(setWorkout(exercises, w.name, w.id));
    nav.navigate("My Workout");
  };

  const deleteSaved = async (w: SavedWorkout) => {
    await removeSavedWorkout(w.id);
    if (loadedWorkoutId === w.id) {
      dispatch(clearFavorites());
    }
    await load();
  };

  const openExternal = async (url: string) => {
    setSettingsOpen(false);
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Couldn’t open link", url);
    }
  };

  const signOut = async () => {
    setSettingsOpen(false);
    dispatch(clearFavorites());
    await supabase.auth.signOut();
  };

  const runDeleteAccount = async () => {
    if (deletingAccount) return;
    setDeletingAccount(true);
    setSettingsOpen(false);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id ?? null;
      await deleteAccount();
      dispatch(clearFavorites());
      await clearAccountLocalData(userId);
      await supabase.auth.signOut();
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong. Try again.";
      Alert.alert(
        "Couldn’t delete account",
        `${msg}\n\nIf this keeps happening, email ${LEGAL_CONTACT_EMAIL}.`
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const confirmDeleteAccount = () => {
    if (deletingAccount) return;
    setSettingsOpen(false);
    Alert.alert(
      "Delete account?",
      "This permanently deletes your account, workouts, lift logs, and profile. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Continue",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Delete forever?",
              "Your cloud data will be erased. Local app data for this account will be cleared too.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete forever",
                  style: "destructive",
                  onPress: () => {
                    void runDeleteAccount();
                  },
                },
              ]
            );
          },
        },
      ]
    );
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
        <View style={styles.headerRow}>
          <View style={styles.headerMain}>
            <BrandHeader
              userName={userName}
              subtitle="Your stats. Your climb."
            />
          </View>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={styles.settingsBtn}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            disabled={deletingAccount}
          >
            {deletingAccount ? (
              <ActivityIndicator size="small" color={Colors.glowCyan} />
            ) : (
              <Ionicons
                name="settings-outline"
                size={22}
                color={Colors.textSoft}
              />
            )}
          </Pressable>
        </View>

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
                {/* Total lifted — keep for later
                <InsetWell style={styles.statPill}>
                  <Text style={styles.statLabel}>Total lifted</Text>
                  <Text style={styles.statValue}>
                    {last.volumeLoad
                      ? formatVolumeLabel(last.volumeLoad)
                      : "—"}
                  </Text>
                  <Text style={styles.statHint}>weight × reps, added up</Text>
                </InsetWell>
                */}
                <InsetWell style={styles.statPill}>
                  <Text style={styles.statLabel}>Work time</Text>
                  <Text style={styles.statValue}>
                    {last.tensionSeconds
                      ? formatTension(last.tensionSeconds)
                      : "—"}
                  </Text>
                  <Text style={styles.statHint}>exercise timer, not rest</Text>
                </InsetWell>
                <InsetWell style={styles.statPill}>
                  <Text style={styles.statLabel}>Calories (est.)</Text>
                  <Text style={styles.statValue}>
                    {(() => {
                      const cals =
                        last.caloriesEst != null && last.caloriesEst > 0
                          ? last.caloriesEst
                          : estimateCaloriesBurned({
                              tensionSeconds: last.tensionSeconds,
                              volumeLoad: last.volumeLoad,
                            });
                      return cals > 0 ? formatCaloriesEst(cals) : "—";
                    })()}
                  </Text>
                  <Text style={styles.statHint}>
                    From work time · assumes ~170 lb
                  </Text>
                </InsetWell>
              </View>
              {/* calories were a separate row — now in the row above
              {last.caloriesEst != null && last.caloriesEst > 0 ? (
                <InsetWell style={styles.calPill}>
                  <Text style={styles.statLabel}>Calories (est.)</Text>
                  <Text style={styles.statValue}>
                    {formatCaloriesEst(last.caloriesEst)}
                  </Text>
                  <Text style={styles.statHint}>
                    From work time · assumes ~170 lb
                  </Text>
                </InsetWell>
              ) : null}
              */}
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
              <Pressable
                onPress={() => nav.navigate("My Workout")}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.myWorkoutLink,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.myWorkoutLinkText}>My Workout</Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={Colors.glowPurple}
                />
              </Pressable>
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
              onPress={() => setPreviewWorkout(w)}
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

      <SavedWorkoutPreviewModal
        visible={!!previewWorkout}
        workout={previewWorkout}
        onClose={() => setPreviewWorkout(null)}
        onLoad={loadSaved}
        onDelete={deleteSaved}
      />

      <Modal
        visible={settingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSettingsOpen(false)}
      >
        <Pressable
          style={styles.settingsBg}
          onPress={() => setSettingsOpen(false)}
        >
          <Pressable
            style={styles.settingsSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.settingsHeader}>
              <Text style={styles.settingsTitle}>Settings</Text>
              <Pressable
                onPress={() => setSettingsOpen(false)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close settings"
              >
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </Pressable>
            </View>

            <Pressable
              style={styles.settingsRow}
              onPress={() => void signOut()}
            >
              <Ionicons
                name="log-out-outline"
                size={20}
                color={Colors.textSoft}
              />
              <Text style={styles.settingsRowText}>Sign out</Text>
            </Pressable>

            <Pressable
              style={styles.settingsRow}
              onPress={() => void openExternal(PRIVACY_URL)}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={Colors.textSoft}
              />
              <Text style={styles.settingsRowText}>Privacy Policy</Text>
            </Pressable>

            <Pressable
              style={styles.settingsRow}
              onPress={() => void openExternal(TERMS_URL)}
            >
              <Ionicons
                name="document-text-outline"
                size={20}
                color={Colors.textSoft}
              />
              <Text style={styles.settingsRowText}>Terms & Conditions</Text>
            </Pressable>

            <Pressable
              style={styles.settingsRow}
              onPress={() => void openExternal(DELETE_ACCOUNT_URL)}
            >
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={Colors.textSoft}
              />
              <Text style={styles.settingsRowText}>Account deletion help</Text>
            </Pressable>

            <Pressable
              style={[styles.settingsRow, styles.settingsRowDanger]}
              onPress={confirmDeleteAccount}
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={Colors.ctaEnd}
              />
              <Text style={styles.settingsRowDangerText}>Delete account</Text>
            </Pressable>
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
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  headerMain: {
    flex: 1,
    minWidth: 0,
  },
  settingsBtn: {
    marginTop: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.inset,
    borderWidth: 1,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
  },
  settingsBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  settingsSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 36,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderRightColor: Colors.shadowDark,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  settingsTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: 24,
    color: "#fff",
    letterSpacing: 0.6,
  },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.highlight,
  },
  settingsRowText: {
    color: Colors.textSoft,
    fontSize: 16,
    fontWeight: "600",
  },
  settingsRowDanger: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  settingsRowDangerText: {
    color: Colors.ctaEnd,
    fontSize: 16,
    fontWeight: "700",
  },
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
  calPill: {
    marginTop: 10,
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
  myWorkoutLink: {
    marginTop: 14,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  myWorkoutLinkText: {
    color: Colors.glowPurple,
    fontSize: 15,
    fontWeight: "700",
  },
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
