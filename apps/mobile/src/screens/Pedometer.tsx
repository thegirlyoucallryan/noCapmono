import { useState, useEffect, useRef } from "react";
import {
  PermissionsAndroid,
  StyleSheet,
  Platform,
  View,
  Text,
  AppState,
  type AppStateStatus,
} from "react-native";
import { Pedometer } from "expo-sensors";
import Colors from "../constants/Colors";
import CircularProgress from "react-native-circular-progress-indicator";
import NeomorphicStyles from "../constants/NeomorphicStyles";
import NMPHInset from "../constants/NMPHInset";

const DAILY_GOAL = 11500;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function requestMotionPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
      {
        title: "Step counting",
        message: "No-Cap needs activity permission to count your steps.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const current = await Pedometer.getPermissionsAsync();
  if (current.granted) return true;
  const next = await Pedometer.requestPermissionsAsync();
  return next.granted;
}

async function fetchTodaySteps(): Promise<number | null> {
  // Historical range is iOS-only in expo-sensors.
  if (Platform.OS !== "ios") return null;
  try {
    const result = await Pedometer.getStepCountAsync(startOfToday(), new Date());
    return result?.steps ?? 0;
  } catch {
    return null;
  }
}

export function PedometerScreen() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [statusHint, setStatusHint] = useState("Checking motion sensors…");
  const baseStepsRef = useRef(0);
  const subscriptionRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;

    const startWatching = async () => {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (cancelled) return;

      setAvailable(isAvailable);
      if (!isAvailable) {
        setStatusHint(
          Platform.OS === "ios"
            ? "Pedometer unavailable on this device (simulator has no step hardware)."
            : "Step sensor unavailable on this device."
        );
        return;
      }

      const granted = await requestMotionPermission();
      if (cancelled) return;

      if (!granted) {
        setPermissionDenied(true);
        setStatusHint("Motion permission denied — enable it in Settings.");
        return;
      }

      setPermissionDenied(false);

      const today = await fetchTodaySteps();
      if (cancelled) return;

      if (today != null) {
        baseStepsRef.current = today;
        setCurrentStepCount(today);
        setStatusHint("Steps today");
      } else {
        baseStepsRef.current = 0;
        setCurrentStepCount(0);
        setStatusHint("Steps since opening Tools");
      }

      subscriptionRef.current?.remove();
      subscriptionRef.current = Pedometer.watchStepCount((result) => {
        setCurrentStepCount(baseStepsRef.current + result.steps);
      });
    };

    startWatching();

    const onAppState = (state: AppStateStatus) => {
      if (state !== "active") return;
      // Refresh today's baseline when returning to the app (iOS).
      void (async () => {
        const today = await fetchTodaySteps();
        if (cancelled || today == null) return;
        baseStepsRef.current = today;
        setCurrentStepCount(today);
        // Re-subscribe so live delta starts from zero again.
        subscriptionRef.current?.remove();
        subscriptionRef.current = Pedometer.watchStepCount((result) => {
          setCurrentStepCount(baseStepsRef.current + result.steps);
        });
      })();
    };

    const appSub = AppState.addEventListener("change", onAppState);

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      appSub.remove();
    };
  }, []);

  return (
    <View style={styles.wrap}>
      <View style={styles.ring}>
        <CircularProgress
          value={currentStepCount}
          maxValue={DAILY_GOAL}
          radius={140}
          activeStrokeColor={Colors.accent}
          inActiveStrokeColor={Colors.backGround}
          inActiveStrokeOpacity={0.4}
          inActiveStrokeWidth={30}
          activeStrokeWidth={30}
          title={"Step Count"}
          titleColor={Colors.primary}
          titleStyle={{ fontWeight: "bold" }}
          dashedStrokeConfig={{
            count: 50,
            width: 4,
          }}
        />
      </View>
      <Text style={styles.hint}>{statusHint}</Text>
      {available === false || permissionDenied ? (
        <Text style={styles.error}>
          {permissionDenied
            ? "Open Settings → No-Cap → Motion & Fitness."
            : "Try a physical device — simulators usually can't count steps."}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 550,
    padding: 26,
    alignContent: "center",
    justifyContent: "center",
  },
  ring: {
    ...NeomorphicStyles,
    ...NMPHInset,
    alignSelf: "center",
    padding: 14,
    borderRadius: 400,
    shadowColor: Colors.accent,
  },
  hint: {
    marginTop: 14,
    textAlign: "center",
    color: Colors.textSoft,
    fontSize: 13,
  },
  error: {
    marginTop: 6,
    textAlign: "center",
    color: Colors.primary,
    fontSize: 12,
    paddingHorizontal: 12,
  },
});
