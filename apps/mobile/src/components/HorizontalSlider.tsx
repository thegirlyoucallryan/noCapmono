import { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const CHIP_WIDTH = 104;
const CHIP_HEIGHT = 108;
const LABEL_LINES = 2;
const LABEL_LINE_HEIGHT = 15;
const LABEL_BOX_HEIGHT = LABEL_LINE_HEIGHT * LABEL_LINES;
const CHIP_GAP = 10;
const SNAP = CHIP_WIDTH + CHIP_GAP;

type SliderItem = {
  id: string;
  keyName: string;
  equipment?: string;
  title?: string;
};

const BODY_PART_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  cardio: "heart-outline",
  shoulders: "expand-outline",
  back: "body-outline",
  chest: "fitness-outline",
  "upper arms": "barbell-outline",
  arms: "barbell-outline",
  "lower legs": "walk-outline",
  calves: "walk-outline",
  "upper legs": "footsteps-outline",
  legs: "footsteps-outline",
  waist: "ellipse-outline",
  abs: "ellipse-outline",
  "lower arms": "hand-left-outline",
  forearms: "hand-left-outline",
  neck: "person-outline",
};

const EQUIPMENT_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  band: "infinite-outline",
  "body weight": "body-outline",
  "bosu ball": "radio-button-on-outline",
  cable: "git-network-outline",
  dumbbell: "barbell-outline",
  rope: "pulse-outline",
  kettlebell: "fitness-outline",
  "medicine ball": "basketball-outline",
  "smith machine": "grid-outline",
  "stability ball": "radio-button-on-outline",
  weighted: "add-circle-outline",
  barbell: "barbell-outline",
  "ez barbell": "remove-outline",
  "leverage machine": "construct-outline",
};

function getIcon(
  type: string,
  label: string
): keyof typeof Ionicons.glyphMap {
  const key = label.toLowerCase();
  const map = type === "Equipment" ? EQUIPMENT_ICONS : BODY_PART_ICONS;
  return map[key] ?? "chevron-forward-circle-outline";
}

const SHORT_LABELS: Record<string, string> = {
  "misc. machines": "Machines",
  "stability ball": "Stab. Ball",
  "medicine ball": "Med. Ball",
  "smith machine": "Smith",
  "body weight": "Bodyweight",
  "ez barbell": "EZ Bar",
  "bosu ball": "Bosu",
  "lower legs": "Calves",
  "upper legs": "Legs",
  "upper arms": "Arms",
  "lower arms": "Forearms",
};

function formatLabel(item: SliderItem) {
  const raw = item.equipment || item.keyName || item.title || "";
  let label = item.equipment || item.keyName || raw;
  if (!item.equipment && item.keyName && item.keyName !== item.title) {
    label = item.keyName;
  }
  return SHORT_LABELS[label.toLowerCase()] ?? label;
}

function CategoryChip({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 28,
      bounciness: 6,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      accessibilityRole="button"
      accessibilityLabel={`Browse ${label}`}
    >
      <Animated.View style={[styles.chip, { transform: [{ scale }] }]}>
        <View style={styles.iconWell}>
          <Ionicons name={icon} size={22} color={Colors.accent} />
        </View>
        <View style={styles.labelBox}>
          <Text style={styles.chipText} numberOfLines={LABEL_LINES}>
            {label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const HorizontalSlider = ({
  data,
  type,
  title,
  compact = false,
}: {
  type: string;
  title?: string;
  compact?: boolean;
  data: SliderItem[];
}) => {
  const nav = useNavigation();
  const showLeftFade = useRef(new Animated.Value(0)).current;
  const showRightFade = useRef(new Animated.Value(1)).current;

  const updateFades = (offsetX: number, contentWidth: number, layoutWidth: number) => {
    const maxOffset = Math.max(contentWidth - layoutWidth, 0);
    Animated.timing(showLeftFade, {
      toValue: offsetX > 8 ? 1 : 0,
      duration: 120,
      useNativeDriver: true,
    }).start();
    Animated.timing(showRightFade, {
      toValue: offsetX < maxOffset - 8 ? 1 : 0,
      duration: 120,
      useNativeDriver: true,
    }).start();
  };

  const renderItem = ({ item }: { item: SliderItem }) => {
    const param =
      type === "Equipment"
        ? { equipment: item.keyName }
        : { bodyPart: item.title };
    const label = formatLabel(item);
    // Body parts: API title ("upper arms"); equipment: keyName ("dumbbell")
    const iconKey =
      type === "Body Part"
        ? item.title || item.keyName || label
        : item.keyName || item.title || label;
    const icon = getIcon(type, iconKey);

    return (
      <CategoryChip
        label={label}
        icon={icon}
        onPress={() => nav.navigate("Workouts" as any, param)}
      />
    );
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    updateFades(contentOffset.x, contentSize.width, layoutMeasurement.width);
  };

  return (
    <View style={[styles.section, compact && styles.sectionCompact]}>
      <Text style={[styles.headline, compact && styles.headlineCompact]}>
        {title ?? `Browse by ${type.toLowerCase()}`}
      </Text>

      <View style={styles.listWrap}>
        <Animated.View
          pointerEvents="none"
          style={[styles.edgeFade, styles.edgeLeft, { opacity: showLeftFade }]}
        >
          <LinearGradient
            colors={[Colors.twentyThree, "transparent"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <FlatList
          horizontal
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={SNAP}
          snapToAlignment="start"
          disableIntervalMomentum
          contentContainerStyle={styles.listContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
        />

        <Animated.View
          pointerEvents="none"
          style={[styles.edgeFade, styles.edgeRight, { opacity: showRightFade }]}
        >
          <LinearGradient
            colors={["transparent", Colors.twentyThree]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 4,
  },
  sectionCompact: {
    marginBottom: 0,
  },
  headline: {
    color: "#ccc",
    marginHorizontal: 4,
    marginBottom: 10,
    marginTop: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  headlineCompact: {
    marginTop: 0,
  },
  listWrap: {
    position: "relative",
  },
  listContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  chip: {
    width: CHIP_WIDTH,
    height: CHIP_HEIGHT,
    marginRight: CHIP_GAP,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
    borderWidth: 1,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 4,
  },
  iconWell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.inset,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  labelBox: {
    height: LABEL_BOX_HEIGHT,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  chipText: {
    fontSize: 11,
    lineHeight: LABEL_LINE_HEIGHT,
    color: "#eee",
    textAlign: "center",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  edgeFade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 28,
    zIndex: 2,
  },
  edgeLeft: {
    left: 0,
  },
  edgeRight: {
    right: 0,
  },
});

export default HorizontalSlider;
