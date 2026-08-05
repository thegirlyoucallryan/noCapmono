import { View, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Colors from "../constants/Colors";
import { RaisedCard } from "./RaisedCard";
import { GradientCTA } from "./GradientCTA";
import { DISPLAY_FONT } from "../constants/Typography";
import fitness from "../assets/fitness.png";
import { Image } from "react-native";

const Message = () => {
  const nav = useNavigation<any>();

  return (
    <View style={styles.screen}>
      <RaisedCard style={styles.card}>
        <Text style={styles.messageHead}>No workout yet</Text>
        <Image source={fitness} style={styles.image} />
        <Text style={styles.message}>
          Head to Build to pick what you want to work or filter by equipment.
          Tap + to add exercises, then hit Start Workout.
        </Text>
        <GradientCTA
          title="Go to Build"
          icon="hammer-outline"
          onPress={() => nav.navigate("Build", { screen: "BuildHome" })}
          style={styles.cta}
        />
      </RaisedCard>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    padding: 24,
    alignItems: "center",
    width: "100%",
  },
  message: {
    color: "#ccc",
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 16,
  },
  messageHead: {
    fontSize: 24,
    fontFamily: DISPLAY_FONT,
    color: Colors.accent,
    marginBottom: 8,
  },
  image: {
    height: 140,
    width: 140,
    opacity: 0.85,
  },
  cta: {
    width: "100%",
    marginTop: 8,
  },
});

export default Message;
