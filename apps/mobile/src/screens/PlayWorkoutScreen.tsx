import {
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
  View,
  AppState,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import Colors from "../constants/Colors";
import { Exercise } from "../types/types";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
// import { SpotifyVibePicker } from "../components/SpotifyVibePicker"; // Spotify paused
import {
  PlayLayoutToggle,
  PlayLayoutMode,
} from "../components/PlayLayoutToggle";
import { PlayListSession } from "../components/PlayListSession";
import {
  recordLastSession,
  saveActivePlaySession,
  loadActivePlaySession,
  clearActivePlaySession,
  estimateCaloriesBurned,
  formatTension,
  // formatVolumeLabel, // used with total lifted on done screen
  formatCaloriesEst,
} from "../../utils/workoutStore";
import { clearPlayStart, setWorkout, setSessionSettings } from "../store/actions";
import Theme from "../constants/Theme";
import { useLayout } from "../constants/layout";

const PLAY_LAYOUT_KEY = "@nocap/play_layout_mode";
const KEEP_AWAKE_TAG = "nocap-play";

type Phase = "idle" | "ready" | "playing" | "rest" | "done";

const PlayWorkoutScreen = ({ route }: any) => {
  const dispatch = useDispatch();
  const nav = useNavigation<any>();
  const layout = useLayout();

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
  const resumePrompted = useRef(false);
  /** True after a final commit (complete / End) — blocks further writes. */
  const sessionCommittedRef = useRef(false);
  /** True after any mid-session Home snapshot — next save replaces that row. */
  const earlySavedRef = useRef(false);

  const finalWorkout = useMemo(() => {
    if (!favorites?.length) return [];
    if (type === "Circuit") {
      return [...Array(sets)].flatMap(() => favorites).filter(Boolean);
    }
    return favorites.flatMap((item) => Array(sets).fill(item)).filter(Boolean);
  }, [favorites, sets, type]);

  const phaseRef = useRef(phase);
  const currentIndexRef = useRef(currentIndex);
  const sessionVolumeRef = useRef(sessionVolume);
  const sessionTensionRef = useRef(sessionTension);
  const favoritesRef = useRef(favorites);
  const finalWorkoutRef = useRef(finalWorkout);
  const setsRef = useRef(sets);
  const typeRef = useRef(type);

  useEffect(() => {
    phaseRef.current = phase;
    currentIndexRef.current = currentIndex;
    sessionVolumeRef.current = sessionVolume;
    sessionTensionRef.current = sessionTension;
    favoritesRef.current = favorites;
    finalWorkoutRef.current = finalWorkout;
    setsRef.current = sets;
    typeRef.current = type;
  }, [
    phase,
    currentIndex,
    sessionVolume,
    sessionTension,
    favorites,
    finalWorkout,
    sets,
    type,
  ]);

  const saveSessionToHome = async (mode: "complete" | "early") => {
    const favs = favoritesRef.current;
    if (!favs.length || sessionCommittedRef.current) return;

    const p = phaseRef.current;
    const didWork =
      mode === "complete" ||
      p === "done" ||
      sessionTensionRef.current > 0 ||
      sessionVolumeRef.current > 0 ||
      currentIndexRef.current > 0 ||
      p === "playing" ||
      p === "rest";

    if (!didWork) return;

    const workout = finalWorkoutRef.current;
    const stepsDone =
      mode === "complete"
        ? workout.length
        : Math.min(currentIndexRef.current + 1, workout.length || 1);
    const slice = workout.slice(0, Math.max(stepsDone, 1));
    const uniqueNames = [
      ...new Set(
        (slice.length ? slice : favs).map((f) =>
          f.name.replace(/\(Male\)/i, "").trim()
        )
      ),
    ];

    if (mode === "complete") {
      clearActivePlaySession().catch(() => {});
    }

    try {
      await recordLastSession(
        {
          exerciseCount:
            mode === "complete"
              ? favs.length
              : uniqueNames.length || favs.length,
          sets: setsRef.current,
          type: String(typeRef.current),
          names: uniqueNames,
          volumeLoad: sessionVolumeRef.current,
          tensionSeconds: sessionTensionRef.current,
          caloriesEst: estimateCaloriesBurned({
            tensionSeconds: sessionTensionRef.current,
            volumeLoad: sessionVolumeRef.current,
          }),
        },
        { replaceLatest: earlySavedRef.current }
      );
      earlySavedRef.current = true;
      if (mode === "complete") {
        sessionCommittedRef.current = true;
      }
    } catch {
      /* keep flags so a retry can still finalize */
    }
  };

  /** Tab away / leave Play / background mid-workout → still update Home */
  const saveIfLeavingActiveWorkout = () => {
    const p = phaseRef.current;
    if (p === "playing" || p === "rest" || p === "done") {
      void saveSessionToHome(p === "done" ? "complete" : "early");
    }
  };
  // Keep the screen on during an active workout
  useEffect(() => {
    const active = phase === "ready" || phase === "playing" || phase === "rest";
    if (active) {
      activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    } else {
      deactivateKeepAwake(KEEP_AWAKE_TAG);
    }
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [phase]);

  useEffect(() => {
    AsyncStorage.getItem(PLAY_LAYOUT_KEY).then((stored) => {
      if (stored === "list" || stored === "tv") {
        setLayoutMode(stored);
      }
    });
  }, []);

  // Offer to resume an interrupted session once
  useEffect(() => {
    if (resumePrompted.current || pendingPlayStart) return;
    resumePrompted.current = true;
    let alive = true;
    (async () => {
      const saved = await loadActivePlaySession();
      if (!alive || !saved?.favorites?.length) return;
      Alert.alert(
        "Resume workout?",
        `Continue at exercise ${saved.currentIndex + 1} of your last session.`,
        [
          {
            text: "Discard",
            style: "destructive",
            onPress: () => {
              clearActivePlaySession().catch(() => {});
            },
          },
          {
            text: "Resume",
            onPress: () => {
              dispatch(setWorkout(saved.favorites));
              dispatch(setSessionSettings(saved.sets, saved.type));
              setCurrentIndex(saved.currentIndex);
              setTimer(saved.timer > 0 ? saved.timer : 45);
              setIsActive(saved.isActive);
              setSessionVolume(saved.sessionVolume ?? 0);
              setSessionTension(saved.sessionTension ?? 0);
              sessionCommittedRef.current = false;
              earlySavedRef.current =
                (saved.sessionTension ?? 0) > 0 ||
                (saved.sessionVolume ?? 0) > 0 ||
                saved.currentIndex > 0;
              setPhase(saved.phase);
            },
          },
        ]
      );
    })();
    return () => {
      alive = false;
    };
  }, [dispatch, pendingPlayStart]);

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
    sessionCommittedRef.current = false;
    earlySavedRef.current = false;
    setPhase("ready");
    dispatch(clearPlayStart());
  }, [pendingPlayStart, favorites.length, dispatch]);

  // Persist in-progress play so kill/background doesn't wipe progress
  useEffect(() => {
    if (phase !== "ready" && phase !== "playing" && phase !== "rest") {
      return;
    }
    if (!favorites.length) return;
    const t = setTimeout(() => {
      saveActivePlaySession({
        phase,
        currentIndex,
        timer,
        isActive,
        sessionVolume,
        sessionTension,
        sets,
        type: String(type),
        favorites: favorites.map((ex) => ({
          id: ex.id,
          name: ex.name,
          gifUrl: ex.gifUrl ?? "",
          equipment: ex.equipment ?? "",
          bodyPart: ex.bodyPart ?? "",
          targetWeight: ex.targetWeight ?? null,
          targetReps: ex.targetReps ?? null,
        })),
      }).catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [
    phase,
    currentIndex,
    timer,
    isActive,
    sessionVolume,
    sessionTension,
    sets,
    type,
    favorites,
  ]);

  // Flush resume snapshot + Home stats when leaving the app mid-workout
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "background" && state !== "inactive") return;
      saveIfLeavingActiveWorkout();
      const p = phaseRef.current;
      if (p !== "ready" && p !== "playing" && p !== "rest") return;
      const favs = favoritesRef.current;
      if (!favs.length) return;
      saveActivePlaySession({
        phase: p,
        currentIndex: currentIndexRef.current,
        timer,
        isActive,
        sessionVolume: sessionVolumeRef.current,
        sessionTension: sessionTensionRef.current,
        sets: setsRef.current,
        type: String(typeRef.current),
        favorites: favs.map((ex) => ({
          id: ex.id,
          name: ex.name,
          gifUrl: ex.gifUrl ?? "",
          equipment: ex.equipment ?? "",
          bodyPart: ex.bodyPart ?? "",
          targetWeight: ex.targetWeight ?? null,
          targetReps: ex.targetReps ?? null,
        })),
      }).catch(() => {});
    });
    return () => sub.remove();
  }, [timer, isActive]);

  // Switching tabs away from Play (common) — tabs often stay mounted
  useEffect(() => {
    const unsubBlur = nav.addListener("blur", () => {
      saveIfLeavingActiveWorkout();
    });
    return unsubBlur;
  }, [nav]);

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

  // Home stats when "Great job" appears
  useEffect(() => {
    if (phase !== "done") return;
    void saveSessionToHome("complete");
  }, [phase]);

  const beginReady = () => {
    if (!favorites.length) return;
    sessionCommittedRef.current = false;
    earlySavedRef.current = false;
    setCurrentIndex(0);
    setTimer(45);
    setIsActive(true);
    setSessionVolume(0);
    setSessionTension(0);
    setPhase("ready");
  };

  const resetToIdle = () => {
    clearActivePlaySession().catch(() => {});
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
    if (phase === "done") {
      resetToIdle();
      return;
    }
    Alert.alert("End workout?", "Save this session to Home and exit.", [
      { text: "Keep going", style: "cancel" },
      {
        text: "End",
        style: "destructive",
        onPress: () => {
          void (async () => {
            await saveSessionToHome("early");
            sessionCommittedRef.current = true;
            resetToIdle();
          })();
        },
      },
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
              <Text
                style={[
                  styles.idleTitle,
                  layout.isCompact && { fontSize: layout.font.hero },
                ]}
              >
                Play
              </Text>
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
                  {/* Spotify paused — reclaim space until wired up
                  <SpotifyVibePicker />
                  */}
                  <GradientCTA
                    title="Start Workout"
                    onPress={beginReady}
                    compact={layout.isCompact}
                    style={styles.idleCta}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.idleSub}>No exercises yet</Text>
                  <Text style={styles.idleHint}>
                    Build a queue in My Workout, then hit Start.
                  </Text>
                  {/* Spotify paused — reclaim space until wired up
                  <SpotifyVibePicker />
                  */}
                  <GradientCTA
                    title="My Workout"
                    icon="barbell-outline"
                    onPress={() => nav.navigate("My Workout")}
                    compact={layout.isCompact}
                    style={styles.idleCta}
                  />
                </>
              )}
            </View>
          )}

          {phase === "ready" && (
            <View
              style={[
                styles.centerBlock,
                { paddingTop: layout.readyTopPad as any },
              ]}
            >
              <Pressable
                onPress={endSession}
                style={[styles.endBtn, { top: 8 }]}
                hitSlop={12}
              >
                <Text style={styles.endBtnText}>End</Text>
              </Pressable>
              {layoutToggle}
              <Text
                style={[
                  styles.phaseTitle,
                  layout.isCompact && { fontSize: layout.font.title },
                ]}
              >
                Get Ready!
              </Text>
              <CountDown time={5} onZero={handleInitiateWorkout} />
            </View>
          )}

          {phase === "rest" && currentIndex + 1 < finalWorkout.length && (
            <View
              style={[
                styles.centerBlock,
                { paddingTop: layout.readyTopPad as any },
              ]}
            >
              <Pressable
                onPress={endSession}
                style={[styles.endBtn, { top: 8 }]}
                hitSlop={12}
              >
                <Text style={styles.endBtnText}>End</Text>
              </Pressable>
              {layoutToggle}
              <Text
                style={[
                  styles.phaseTitle,
                  layout.isCompact && { fontSize: layout.font.title },
                ]}
              >
                Rest...
              </Text>
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
              <View
                style={[
                  styles.card,
                  {
                    width: layout.width - (layout.isCompact ? 16 : 10),
                    maxHeight: layout.playGifSize + (layout.isCompact ? 56 : 72),
                  },
                ]}
              >
                <ExerciseGif
                  key={current.id}
                  exerciseId={current.id}
                  style={[
                    styles.imageFrame,
                    {
                      width: layout.playGifSize,
                      height: layout.playGifSize,
                      borderRadius: layout.isCompact ? 16 : 22,
                      marginBottom: layout.isCompact ? 6 : 10,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.name,
                    layout.isCompact && {
                      fontSize: 14,
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                    },
                  ]}
                >
                  {current.name.replace(/\(Male\)/i, "")}
                </Text>
              </View>

              <View
                style={[
                  styles.controlsDock,
                  layout.isCompact && { paddingBottom: 4, paddingTop: 0 },
                ]}
              >
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
                {/* Spotify paused — reclaim space until wired up
                <SpotifyVibePicker compact />
                */}
                <View style={styles.timerRow}>
                  <NeomorphicButton
                    icon={"caret-back-outline"}
                    onPress={handleBack}
                    title="Back"
                    extraButtonStyles={{
                      marginVertical: layout.isCompact ? 4 : 8,
                      padding: layout.isCompact ? 2 : 4,
                    }}
                    extraTextStyles={{ color: Colors.primary }}
                  />
                  <View style={{ ...styles.timerBox, ...NeomorphicStyles }}>
                    <View style={styles.buttonContainer}>
                      <Pressable onPress={() => setIsActive((v) => !v)}>
                        <Text
                          style={[
                            styles.startBtn,
                            layout.isCompact && { padding: 5, borderWidth: 1.5 },
                          ]}
                        >
                          {isActive ? (
                            <Ionicons
                              size={layout.isCompact ? 28 : 40}
                              name="pause"
                            />
                          ) : (
                            <Ionicons
                              size={layout.isCompact ? 28 : 40}
                              name="play"
                            />
                          )}
                        </Text>
                      </Pressable>
                    </View>
                    <View>
                      <Text
                        style={[
                          styles.counter,
                          layout.isCompact && {
                            fontSize: layout.font.timer,
                            marginLeft: 10,
                          },
                        ]}
                      >
                        00:{timerLabel}
                      </Text>
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
                    extraButtonStyles={{
                      marginVertical: layout.isCompact ? 4 : 8,
                      padding: layout.isCompact ? 4 : 7,
                    }}
                    extraTextStyles={{ color: Colors.primary }}
                  />
                </View>
              </View>
            </View>
          )}

          {phase === "done" && (
            <View
              style={[
                styles.doneBlock,
                layout.isCompact && { paddingTop: 28, paddingHorizontal: 16 },
              ]}
            >
              <NeomorphicView>
                <Image
                  source={img}
                  style={{
                    height: layout.isCompact ? 110 : 160,
                    width: layout.isCompact ? 110 : 160,
                    alignSelf: "center",
                  }}
                />
                <Text
                  style={[
                    styles.doneText,
                    layout.isCompact && { fontSize: 20, paddingTop: 8 },
                  ]}
                >
                  Great job — you got it done!
                </Text>
                {(() => {
                  const cals = estimateCaloriesBurned({
                    tensionSeconds: sessionTension,
                    volumeLoad: sessionVolume,
                  });
                  return (
                    <View style={styles.doneStats}>
                      {/* Total lifted — keep for later
                      <View style={styles.doneStat}>
                        <Text style={styles.doneStatValue}>
                          {sessionVolume > 0
                            ? formatVolumeLabel(sessionVolume)
                            : "—"}
                        </Text>
                        <Text style={styles.doneStatLabel}>total lifted</Text>
                      </View>
                      <View style={styles.doneStatDivider} />
                      */}
                      <View style={styles.doneStat}>
                        <Text style={styles.doneStatValue}>
                          {sessionTension > 0
                            ? formatTension(sessionTension)
                            : "—"}
                        </Text>
                        <Text style={styles.doneStatLabel}>work time</Text>
                      </View>
                      <View style={styles.doneStatDivider} />
                      <View style={styles.doneStat}>
                        <Text style={styles.doneStatValue}>
                          {cals > 0 ? formatCaloriesEst(cals) : "—"}
                        </Text>
                        <Text style={styles.doneStatLabel}>cal est.</Text>
                      </View>
                    </View>
                  );
                })()}
                <Text style={styles.doneCalHint}>
                  Rough estimate from work time (assumes ~170 lb). Not medical advice.
                </Text>
                <GradientCTA
                  title="Back to Play"
                  icon="musical-notes"
                  onPress={resetToIdle}
                  compact={layout.isCompact}
                  style={{ marginTop: layout.isCompact ? 12 : 16 }}
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
    paddingHorizontal: 16,
    paddingTop: 12,
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
    fontSize: 15,
    marginTop: 8,
    textAlign: "center",
  },
  idleHint: {
    color: Colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  idleCta: {
    alignSelf: "stretch",
  },
  queuePreview: {
    alignSelf: "stretch",
    ...Theme.raised,
    borderRadius: Theme.radius.lg,
    padding: 12,
    marginBottom: 16,
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
    paddingHorizontal: 16,
  },
  endBtn: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  endBtnText: {
    color: Colors.textMuted,
    fontSize: 14,
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
    marginTop: 16,
    gap: 6,
  },
  upNextLabel: {
    color: Colors.glowPurple,
    fontSize: 16,
  },
  upNextName: {
    color: Colors.glowCyan,
    fontSize: 16,
    textTransform: "capitalize",
  },
  playLayout: {
    flex: 1,
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
    flexGrow: 0,
    alignSelf: "center",
    marginHorizontal: 5,
    marginBottom: 4,
    ...Theme.raised,
    borderRadius: Theme.radius.lg,
    backgroundColor: Colors.glowCyanDim,
    borderBottomColor: Colors.glowPurple,
    borderRightColor: Colors.glowCyan,
    ...Theme.glow.cyan,
    overflow: "visible",
    justifyContent: "center",
    paddingVertical: 6,
  },
  imageFrame: {
    alignSelf: "center",
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
    padding: 10,
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
  doneStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
    gap: 8,
  },
  doneStat: {
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },
  doneStatValue: {
    fontFamily: DISPLAY_FONT,
    fontSize: 26,
    color: "#fff",
    letterSpacing: 0.5,
  },
  doneStatLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  doneStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.highlight,
  },
  doneCalHint: {
    color: Colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 12,
  },
  doneBlock: {
    alignItems: "center",
    paddingTop: 48,
    paddingHorizontal: 24,
  },
});
