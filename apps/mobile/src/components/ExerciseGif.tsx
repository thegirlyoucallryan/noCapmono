import {
  Image,
  ImageProps,
  ImageStyle,
  PixelRatio,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
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
} & Omit<ImageProps, "source" | "style">;

function getCrispDisplaySize(resolution: number) {
  return resolution / PixelRatio.get();
}

/** Midpoint between native size and frame — larger without full upscale blur. */
function getSplitDisplaySize(resolution: number, frameSize: number) {
  const crispSize = getCrispDisplaySize(resolution);
  if (!frameSize || frameSize <= crispSize) {
    return crispSize;
  }
  return (crispSize + frameSize) / 2;
}

export function ExerciseGif({
  exerciseId,
  resolution = EXERCISE_GIF_RESOLUTION,
  style,
  imageStyle,
  resizeMode = "contain",
  ...props
}: ExerciseGifProps) {
  const [failed, setFailed] = useState(false);

  if (!exerciseId) {
    return null;
  }

  const crispSize = getCrispDisplaySize(resolution);
  const flattened = StyleSheet.flatten(style) ?? {};
  const frameWidth =
    typeof flattened.width === "number" ? flattened.width : crispSize;
  const frameHeight =
    typeof flattened.height === "number" ? flattened.height : crispSize;
  const frameSize = Math.min(frameWidth, frameHeight);
  const displaySize = getSplitDisplaySize(resolution, frameSize);

  if (failed) {
    return (
      <View style={[styles.frame, style, { width: frameWidth, height: frameHeight }]}>
        <Text style={styles.fallbackText}>GIF unavailable</Text>
      </View>
    );
  }

  return (
    <View style={[styles.frame, style, { width: frameWidth, height: frameHeight }]}>
      <Image
        source={getExerciseImageSource(exerciseId, resolution)}
        onError={() => setFailed(true)}
        resizeMode={resizeMode}
        style={[styles.image, { width: displaySize, height: displaySize }, imageStyle]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
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
