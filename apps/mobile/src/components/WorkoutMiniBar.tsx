import { Pressable, Text, StyleSheet, View } from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";

/** Reserve space at bottom of Build screens so content clears the docked bar. */
export const WORKOUT_MINI_BAR_INSET = 76;

const HIDDEN_ON = new Set(["Play", "Finale"]);

function useBuildStackRouteName(): string | undefined {
  return useNavigationState((tabState) => {
    const build = tabState.routes.find((r) => r.name === "Build");
    const stack = build?.state as
      | { index?: number; routes: { name: string }[] }
      | undefined;
    if (!stack?.routes?.length) return undefined;
    const idx = stack.index ?? stack.routes.length - 1;
    return stack.routes[idx]?.name;
  });
}

export function navigateToMyWorkout(navigation: any) {
  const tabNav = navigation.getParent?.();
  if (tabNav) {
    tabNav.navigate("My Workout");
  } else {
    navigation.navigate("My Workout");
  }
}

export function WorkoutMiniBar() {
  const navigation = useNavigation();
  const stackRoute = useBuildStackRouteName();
  const count = useSelector(
    (s: any) => s.favorites.favoritedExercises.length
  );

  if (count === 0 || (stackRoute && HIDDEN_ON.has(stackRoute))) {
    return null;
  }

  return (
    <View style={styles.dock} pointerEvents="box-none">
      <Pressable
        onPress={() => navigateToMyWorkout(navigation)}
        style={({ pressed }) => [
          styles.wrapper,
          pressed && styles.wrapperPressed,
        ]}
      >
        <View style={styles.left}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count}</Text>
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {count === 1 ? "exercise" : "exercises"} in your workout
          </Text>
        </View>
        <View style={styles.action}>
          <Text style={styles.actionText}>View exercises</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.accent} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.inset,
    backgroundColor: Colors.twentyThree,
  },
  wrapper: {
    borderRadius: 14,
    backgroundColor: Colors.surface,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  wrapperPressed: {
    opacity: 0.88,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    backgroundColor: Colors.accent4,
    borderRadius: 12,
    minWidth: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  label: {
    color: "#ddd",
    fontSize: 14,
    flexShrink: 1,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    color: Colors.accent,
    fontWeight: "600",
    fontSize: 14,
  },
});
