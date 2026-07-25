import {
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  Platform,
} from "react-native";
import { useState } from "react";
import {
  EXERCISE_GIF_RESOLUTION,
  getExerciseImageSource,
} from "../../utils/exerciseApi";
import Colors from "../constants/Colors";

type ExerciseGifProps = {
  exerciseId?: string;
  resolution?: number;
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  /** Skip the deep blue glow (e.g. tiny list thumbs). Default true for large frames. */
  glow?: boolean;
} & Omit<ImageProps, "source" | "style">;

export function ExerciseGif({
  exerciseId,
  resolution = EXERCISE_GIF_RESOLUTION,
  style,
  imageStyle,
  resizeMode = "cover",
  glow,
  ...props
}: ExerciseGifProps) {
  const [failed, setFailed] = useState(false);

  if (!exerciseId) {
    return null;
  }

  const flattened = StyleSheet.flatten(style) ?? {};
  const frameWidth =
    typeof flattened.width === "number" ? flattened.width : resolution;
  const frameHeight =
    typeof flattened.height === "number" ? flattened.height : resolution;
  const radius =
    typeof flattened.borderRadius === "number" ? flattened.borderRadius : 18;
  const showGlow = glow ?? Math.min(frameWidth, frameHeight) >= 120;

  if (failed) {
    return (
      <View
        style={[
          styles.frame,
          showGlow && styles.glow,
          style,
          {
            width: frameWidth,
            height: frameHeight,
            borderRadius: radius,
          },
        ]}
      >
        <Text style={styles.fallbackText}>GIF unavailable</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.frame,
        showGlow && styles.glow,
        style,
        {
          width: frameWidth,
          height: frameHeight,
          borderRadius: radius,
        },
      ]}
    >
      <View
        style={[
          styles.clip,
          {
            width: frameWidth,
            height: frameHeight,
            borderRadius: radius,
          },
        ]}
      >
        <Image
          source={getExerciseImageSource(exerciseId, resolution)}
          onError={() => setFailed(true)}
          resizeMode={resizeMode}
          style={[
            styles.image,
            { width: frameWidth, height: frameHeight },
            imageStyle,
          ]}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0b1224",
  },
  glow: {
    shadowColor: "#0a2a6e",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.85,
    shadowRadius: 22,
    elevation: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0, 80, 180, 0.45)",
    ...Platform.select({
      ios: {},
      android: {
        // Android elevation alone; deepen with a faint cyan rim
        borderColor: "rgba(0, 100, 200, 0.35)",
      },
    }),
  },
  clip: {
    overflow: "hidden",
    backgroundColor: "#0b1224",
  },
  image: {
    alignSelf: "center",
  },
  fallbackText: {
    color: Colors.primary,
    textAlign: "center",
    padding: 16,
  },
});
