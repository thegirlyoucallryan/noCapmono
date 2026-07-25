import {
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Alert,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "../constants/Colors";
import { Exercise } from "../types/types";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import CountDown from "../components/CountDown";
import { NeomorphicView } from "../components/NeomorphicView";
import { ExerciseGif } from "../components/ExerciseGif";
import img from "../assets/icon.png";
import NeomorphicStyles from "../constants/NeomorphicStyles";
import { Ionicons } from "@expo/vector-icons";
import NeomorphicButton from "../components/NeomorphicButton";
import { DISPLAY_FONT } from "../constants/Typography";
import { SmokyMountains } from "../components/SmokyMountains";
import { WeightLogger } from "../components/WeightLogger";
import { GradientCTA } from "../components/GradientCTA";
import { SpotifyVibePicker } from "../components/SpotifyVibePicker";
import {
  PlayLayoutToggle,
  PlayLayoutMode,
} from "../components/PlayLayoutToggle";
import { PlayListSession } from "../components/PlayListSession";
import { recordLastSession } from "../../utils/workoutStore";
import { clearPlayStart } from "../store/actions";
import Theme from "../constants/Theme";

const PLAY_LAYOUT_KEY = "@nocap/play_layout_mode";

let SCREEN_WIDTH = Dimensions.get("window").width;

type Phase = "idle" | "ready" | "playing" | "rest" | "done";

const PlayWorkoutScreen = ({ route }: any) => {
  const dispatch = useDispatch();
  const nav = useNavigation<any>();

  const favoritesFromStore = useSelector(
    (s: any) => s.favorites.favoritedExercises as Exercise[]
  );
  const setsFromStore = useSelector((s: any) => s.favorites.sets as number);
  const typeFromStore = useSelector(
    (s: any) => s.favorites.workoutType as string
  );
  const pendingPlayStart = useSelector(
    (s: any) => s.favorites.pendingPlayStart as boolean
  );

  const favorites: Exercise[] =
    route?.params?.favorites ?? favoritesFromStore ?? [];
  const sets: number = route?.params?.sets ?? setsFromStore ?? 4;
  const type = route?.params?.type ?? typeFromStore ?? "Circuit";

  const [phase, setPhase] = useState<Phase>("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [timer, setTimer] = useState(45);
  const [sessionVolume, setSessionVolume] = useState(0);
  const [sessionTension, setSessionTension] = useState(0);
  const [layoutMode, setLayoutMode] = useState<PlayLayoutMode>("tv");

  const finalWorkout = useMemo(() => {
    if (!favorites?.length) return [];
    if (type === "Circuit") {
      return [...Array(sets)].flatMap(() => favorites).filter(Boolean);
    }
    return favorites.flatMap((item) => Array(sets).fill(item)).filter(Boolean);
  }, [favorites, sets, type]);

  useEffect(() => {
    AsyncStorage.getItem(PLAY_LAYOUT_KEY).then((stored) => {
      if (stored === "list" || stored === "tv") {
        setLayoutMode(stored);
      }
    });
  }, []);

  const handleLayoutChange = (mode: PlayLayoutMode) => {
    setLayoutMode(mode);
    AsyncStorage.setItem(PLAY_LAYOUT_KEY, mode).catch(() => {});
  };

  useEffect(() => {
    if (!pendingPlayStart) return;
    if (!favorites.length) {
      dispatch(clearPlayStart());
      return;
    }
    setCurrentIndex(0);
    setTimer(45);
    setIsActive(true);
    setSessionVolume(0);
    setSessionTension(0);
    setPhase("ready");
    dispatch(clearPlayStart());
  }, [pendingPlayStart, favorites.length, dispatch]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (phase === "playing" && isActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
        setSessionTension((t) => t + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [phase, timer, isActive]);

  useEffect(() => {
    if (phase !== "playing" || timer !== 0) return;
    if (currentIndex < finalWorkout.length - 1) {
      setPhase("rest");
    } else {
      setIsActive(false);
      setPhase("done");
    }
  }, [timer, phase, currentIndex, finalWorkout.length]);

  useEffect(() => {
    if (phase !== "done") return;
    const uniqueNames = [
      ...new Set(favorites.map((f) => f.name.replace(/\(Male\)/i, "").trim())),
    ];
    recordLastSession({
      exerciseCount: favorites.length,
      sets,
      type: String(type),
      names: uniqueNames,
      volumeLoad: sessionVolume,
      tensionSeconds: sessionTension,
    }).catch(() => {});
  }, [phase]);

  const beginReady = () => {
    if (!favorites.length) return;
    setCurrentIndex(0);
    setTimer(45);
    setIsActive(true);
    setSessionVolume(0);
    setSessionTension(0);
    setPhase("ready");
  };

  const resetToIdle = () => {
    setIsActive(false);
    setCurrentIndex(0);
    setTimer(45);
    setSessionVolume(0);
    setSessionTension(0);
    setPhase("idle");
  };

  const endSession = () => {
    if (phase === "ready") {
      resetToIdle();
      return;
    }
    Alert.alert("End workout?", "You'll go back to Play — vibes and Start.", [
      { text: "Keep going", style: "cancel" },
      { text: "End", style: "destructive", onPress: resetToIdle },
    ]);
  };

  const handleInitiateWorkout = () => setPhase("playing");

  const handleSkipTimer = () => {
    setTimer(0);
  };

  const handleNext = () => {
    if (currentIndex >= finalWorkout.length - 1) {
      setPhase("done");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setTimer(45);
    setIsActive(true);
    setPhase("playing");
  };

  const handleBack = () => {
    setCurrentIndex((i) => (i > 0 ? i - 1 : 0));
    setTimer(45);
    setIsActive(true);
  };

  const jumpToStep = (index: number) => {
    setCurrentIndex(index);
    setTimer(45);
    setIsActive(true);
    setPhase("playing");
  };

  const handleRest = () => {
    if (currentIndex < finalWorkout.length - 1) {
      setCurrentIndex((i) => i + 1);
      setTimer(45);
      setIsActive(true);
      setPhase("playing");
    } else {
      setPhase("done");
    }
  };

  const totalSteps = finalWorkout.length;
  const currentStep = Math.min(currentIndex + 1, Math.max(totalSteps, 1));
  const timerLabel = String(timer).padStart(2, "0");
  const current = finalWorkout[currentIndex];

  const layoutToggle = (
    <PlayLayoutToggle value={layoutMode} onChange={handleLayoutChange} />
  );

  const idleQueuePreview =
    layoutMode === "list" && favorites.length > 0 ? (
      <View style={styles.queuePreview}>
        <Text style={styles.queueTitle}>Up next</Text>
        <Text style={styles.queueMeta}>
          {favorites.length} exercise{favorites.length === 1 ? "" : "s"} · {sets}{" "}
          sets · {type}
        </Text>
        {favorites.map((item, index) => (
          <View key={item.id} style={styles.queueRow}>
            <Text style={styles.queueStep}>{index + 1}</Text>
            <Text style={styles.queueName} numberOfLines={1}>
              {item.name.replace(/\(Male\)/i, "")}
            </Text>
          </View>
        ))}
      </View>
    ) : null;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.atmosphere} pointerEvents="none">
        <SmokyMountains intensity={0.35} />
      </View>

      {/* List mode must not sit inside ScrollView — FlatList + ScrollView nesting blows up */}
      {phase === "playing" && current && layoutMode === "list" ? (
        <View style={styles.listModeScreen}>
          {layoutToggle}
          <PlayListSession
            steps={finalWorkout}
            currentIndex={currentIndex}
            timer={timer}
            isActive={isActive}
            onEnd={endSession}
            onJumpTo={jumpToStep}
            onTogglePause={() => setIsActive((v) => !v)}
            onResetTimer={() => {
              setIsActive(false);
              setTimer(45);
            }}
            onSkip={handleSkipTimer}
            onBack={handleBack}
            onNext={handleNext}
            onLogged={(vol) => setSessionVolume((v) => v + vol)}
          />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {phase === "idle" && (
            <View style={styles.idle}>
              <Text style={styles.idleTitle}>Play</Text>
              {layoutToggle}
              {favorites.length ? (
                <>
                  <Text style={styles.idleSub}>
                    {favorites.length} exercise
                    {favorites.length === 1 ? "" : "s"} · {sets} sets · {type}
                  </Text>
                  <Text style={styles.idleHint}>
                    {layoutMode === "tv"
                      ? "Focus — big timer and demo front and center."
                      : "List — scroll the queue and tap any step."}
                  </Text>
                  {idleQueuePreview}
                  <SpotifyVibePicker />
                  <GradientCTA
                    title="Start Workout"
                    onPress={beginReady}
                    style={styles.idleCta}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.idleSub}>No exercises yet</Text>
                  <Text style={styles.idleHint}>
                    Build a queue in My Workout, then hit Start.
                  </Text>
                  <SpotifyVibePicker />
                  <GradientCTA
                    title="My Workout"
                    icon="barbell-outline"
                    onPress={() => nav.navigate("My Workout")}
                    style={styles.idleCta}
                  />
                </>
              )}
            </View>
          )}

          {phase === "ready" && (
            <View style={styles.centerBlock}>
              <Pressable
                onPress={endSession}
                style={[styles.endBtn, { top: 8 }]}
                hitSlop={12}
              >
                <Text style={styles.endBtnText}>End</Text>
              </Pressable>
              {layoutToggle}
              <Text style={styles.phaseTitle}>Get Ready!</Text>
              <CountDown time={5} onZero={handleInitiateWorkout} />
            </View>
          )}

          {phase === "rest" && currentIndex + 1 < finalWorkout.length && (
            <View style={styles.centerBlock}>
              <Pressable
                onPress={endSession}
                style={[styles.endBtn, { top: 8 }]}
                hitSlop={12}
              >
                <Text style={styles.endBtnText}>End</Text>
              </Pressable>
              {layoutToggle}
              <Text style={styles.phaseTitle}>Rest...</Text>
              <CountDown time={30} onZero={handleRest} />
              <View style={styles.upNext}>
                <Text style={styles.upNextLabel}>Up next:</Text>
                <Text style={styles.upNextName}>
                  {finalWorkout[currentIndex + 1]?.name}
                </Text>
              </View>
            </View>
          )}

          {phase === "playing" && current && layoutMode === "tv" && (
            <View style={styles.playLayout}>
              {layoutToggle}
              <View style={styles.progressBar}>
                <View style={styles.progressTop}>
                  <Text style={styles.progressText}>
                    {currentStep} / {totalSteps}
                  </Text>
                  <Pressable onPress={endSession} hitSlop={12}>
                    <Text style={styles.endBtnText}>End</Text>
                  </Pressable>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(currentStep / Math.max(totalSteps, 1)) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.card}>
                <ExerciseGif
                  key={current.id}
                  exerciseId={current.id}
                  style={styles.imageFrame}
                />
                <Text style={styles.name}>
                  {current.name.replace(/\(Male\)/i, "")}
                </Text>
              </View>

              <View style={styles.controlsDock}>
                <WeightLogger
                  key={`${current.id}-${currentIndex}`}
                  exerciseId={current.id}
                  exerciseName={current.name}
                  bodyPart={current.bodyPart}
                  equipment={current.equipment}
                  presetWeight={(current as any).targetWeight}
                  presetReps={(current as any).targetReps}
                  onLogged={(vol) => setSessionVolume((v) => v + vol)}
                />
                <SpotifyVibePicker compact />
                <View style={styles.timerRow}>
                  <NeomorphicButton
                    icon={"caret-back-outline"}
                    onPress={handleBack}
                    title="Back"
                    extraButtonStyles={{ marginVertical: 8, padding: 4 }}
                    extraTextStyles={{ color: Colors.primary }}
                  />
                  <View style={{ ...styles.timerBox, ...NeomorphicStyles }}>
                    <View style={styles.buttonContainer}>
                      <Pressable onPress={() => setIsActive((v) => !v)}>
                        <Text style={styles.startBtn}>
                          {isActive ? (
                            <Ionicons size={40} name="pause" />
                          ) : (
                            <Ionicons size={40} name="play" />
                          )}
                        </Text>
                      </Pressable>
                    </View>
                    <View>
                      <Text style={styles.counter}>00:{timerLabel}</Text>
                      <View style={styles.timerActions}>
                        <Pressable
                          onPress={() => {
                            setIsActive(false);
                            setTimer(45);
                          }}
                        >
                          <Text style={styles.pauseBtn}>Reset</Text>
                        </Pressable>
                        <Text style={styles.dot}>·</Text>
                        <Pressable onPress={handleSkipTimer}>
                          <Text style={styles.skipBtn}>Skip</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                  <NeomorphicButton
                    icon={"caret-forward-outline"}
                    onPress={handleNext}
                    title="Next"
                    extraButtonStyles={{ marginVertical: 8, padding: 7 }}
                    extraTextStyles={{ color: Colors.primary }}
                  />
                </View>
              </View>
            </View>
          )}

          {phase === "done" && (
            <View style={styles.doneBlock}>
              <NeomorphicView>
                <Image
                  source={img}
                  style={{ height: 160, width: 160, alignSelf: "center" }}
                />
                <Text style={styles.doneText}>Great job — you got it done!</Text>
                <GradientCTA
                  title="Back to Play"
                  icon="musical-notes"
                  onPress={resetToIdle}
                  style={{ marginTop: 16 }}
                />
              </NeomorphicView>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default PlayWorkoutScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.twentyThree,
  },
  atmosphere: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    zIndex: 0,
  },
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  listModeScreen: {
    flex: 1,
    zIndex: 1,
  },
  idle: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "center",
  },
  idleTitle: {
    fontFamily: DISPLAY_FONT,
    fontSize: 42,
    color: Colors.glowCyan,
    letterSpacing: 1.5,
  },
  idleSub: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  idleHint: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  idleCta: {
    alignSelf: "stretch",
  },
  queuePreview: {
    alignSelf: "stretch",
    ...Theme.raised,
    borderRadius: Theme.radius.lg,
    padding: 14,
    marginBottom: 20,
  },
  queueTitle: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  queueMeta: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  queueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  queueStep: {
    width: 22,
    color: Colors.glowCyan,
    fontWeight: "800",
    fontSize: 13,
  },
  queueName: {
    flex: 1,
    color: "#ddd",
    fontSize: 14,
    textTransform: "capitalize",
  },
  queueMore: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  centerBlock: {
    alignItems: "center",
    paddingTop: "28%",
    paddingHorizontal: 20,
  },
  endBtn: {
    position: "absolute",
    top: 16,
    right: 20,
    zIndex: 2,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  endBtnText: {
    color: Colors.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  phaseTitle: {
    color: Colors.glowCyan,
    fontSize: 32,
    fontFamily: DISPLAY_FONT,
    marginBottom: 8,
  },
  progressTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  upNext: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 24,
    gap: 6,
  },
  upNextLabel: {
    color: Colors.glowPurple,
    fontSize: 20,
  },
  upNextName: {
    color: Colors.glowCyan,
    fontSize: 20,
    textTransform: "capitalize",
  },
  playLayout: {
    flex: 1,
    minHeight: Dimensions.get("window").height - 120,
  },
  controlsDock: {
    paddingBottom: 12,
    paddingTop: 4,
  },
  timerRow: {
    flexDirection: "row",
    maxWidth: "100%",
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    flex: 1,
    width: SCREEN_WIDTH - 10,
    alignSelf: "center",
    marginHorizontal: 5,
    marginBottom: 4,
    maxHeight: SCREEN_WIDTH * 1.05,
    ...Theme.raised,
    borderRadius: Theme.radius.lg,
    backgroundColor: Colors.glowCyanDim,
    borderBottomColor: Colors.glowPurple,
    borderRightColor: Colors.glowCyan,
    ...Theme.glow.cyan,
    overflow: "visible",
    justifyContent: "center",
    paddingVertical: 8,
  },
  imageFrame: {
    alignSelf: "center",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: 22,
    marginBottom: 10,
    marginTop: 4,
  },
  name: {
    color: Colors.glowCyan,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    textTransform: "capitalize",
    fontWeight: "600",
    textAlign: "center",
  },
  timerBox: {
    ...Theme.inset,
    padding: 12,
    alignItems: "center",
    borderRadius: Theme.radius.md,
    margin: 4,
    justifyContent: "center",
    flexDirection: "row",
    ...Theme.glow.cyan,
  },
  counter: {
    color: Colors.glowCyan,
    fontSize: 42,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 16,
  },
  buttonContainer: {
    alignContent: "center",
  },
  startBtn: {
    color: Colors.glowCyan,
    borderColor: Colors.glowCyan,
    borderWidth: 2,
    borderRadius: 200,
    padding: 8,
    paddingRight: 4,
    alignSelf: "center",
  },
  timerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  pauseBtn: {
    fontSize: 16,
    color: Colors.glowCyan,
  },
  skipBtn: {
    fontSize: 16,
    color: Colors.ctaStart,
    fontWeight: "700",
  },
  dot: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  progressBar: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 6,
  },
  progressText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  progressTrack: {
    height: 5,
    backgroundColor: Colors.ringTrack,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.glowCyan,
    borderRadius: 3,
    shadowColor: Colors.glowCyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  doneText: {
    color: Colors.glowCyan,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontFamily: DISPLAY_FONT,
    fontSize: 24,
    textAlign: "center",
  },
  doneBlock: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 24,
  },
});
