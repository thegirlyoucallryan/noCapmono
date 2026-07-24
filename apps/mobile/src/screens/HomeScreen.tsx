import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Colors from "../constants/Colors";
import { ScrollView } from "react-native-gesture-handler";
import HorizontalSlider from "../components/HorizontalSlider";
import { BuildHero } from "../components/BuildHero";
import { SmokyMountains } from "../components/SmokyMountains";
import { WORKOUT_MINI_BAR_INSET } from "../components/WorkoutMiniBar";

const EquipmentObj = [
  { id: "c1", equipment: "Band", keyName: "band" },
  { id: "c2", equipment: "Body Weight", keyName: "body weight" },
  { id: "c3", equipment: "Bosu Ball", keyName: "bosu ball" },
  { id: "c4", equipment: "Cable", keyName: "cable" },
  { id: "c5", equipment: "Dumbbells", keyName: "dumbbell" },
  { id: "c6", equipment: "Rope", keyName: "rope" },
  { id: "c7", equipment: "Kettlebell", keyName: "kettlebell" },
  { id: "c8", equipment: "Medicine Ball", keyName: "medicine ball" },
  { id: "c9", equipment: "Smith Machine", keyName: "smith machine" },
  { id: "c10", equipment: "Stability Ball", keyName: "stability ball" },
  { id: "c11", equipment: "Weighted", keyName: "weighted" },
  { id: "c12", equipment: "Barbell", keyName: "barbell" },
  { id: "c13", equipment: "EZ Barbell", keyName: "ez barbell" },
  { id: "c14", equipment: "Misc. Machines", keyName: "leverage machine" },
];

const Categories = [
  { id: "c1", title: "cardio", keyName: "Cardio" },
  { id: "c2", title: "shoulders", keyName: "Shoulders" },
  { id: "c3", title: "back", keyName: "Back" },
  { id: "c4", title: "chest", keyName: "Chest" },
  { id: "c5", title: "upper arms", keyName: "Arms" },
  { id: "c6", title: "lower legs", keyName: "Calves" },
  { id: "c7", title: "upper legs", keyName: "Glutes" },
  { id: "c8", title: "waist", keyName: "Abs" },
  { id: "c9", title: "lower arms", keyName: "Forearms" },
  { id: "c10", title: "neck", keyName: "Neck" },
];

function OrDivider() {
  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>or</Text>
      <View style={styles.orLine} />
    </View>
  );
}

const HomeScreen = (props: any) => {
  const [userInput, setUserInput] = useState("");

  const onChangeHandler = () => {
    props.navigation.navigate("Workouts", {
      userInput: userInput});
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <View style={styles.atmosphere} pointerEvents="none">
        <SmokyMountains intensity={0.28} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <BuildHero />

        <Text style={styles.optionLabel}>Search by name</Text>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            onChangeText={setUserInput}
            placeholder="e.g. squats, plank, curl"
            placeholderTextColor={Colors.textMuted}
            returnKeyType="search"
            onSubmitEditing={onChangeHandler}
          />
          <Pressable
            onPress={onChangeHandler}
            style={[styles.searchBtn, !userInput && styles.searchBtnDisabled]}
            disabled={!userInput}
          >
            <Ionicons name="search" size={20} color={Colors.accent} />
          </Pressable>
        </View>

        <OrDivider />

        <HorizontalSlider
          data={Categories}
          type="Body Part"
          title="Body part you want to work"
          compact
        />

        <OrDivider />

        <HorizontalSlider
          data={EquipmentObj}
          type="Equipment"
          title="Equipment you have"
          compact
        />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.twentyThree},
  atmosphere: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 280,
    opacity: 0.9},
  scroll: {
    flex: 1},
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: WORKOUT_MINI_BAR_INSET},
  optionLabel: {
    color: "#ccc",
    marginHorizontal: 4,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500"},
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4},
  searchInput: {
    flex: 1,
    backgroundColor: Colors.inset,
    borderTopColor: Colors.shadowDark,
    borderLeftColor: Colors.shadowDark,
    borderBottomColor: Colors.highlight,
    borderRightColor: Colors.highlight,
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: "#fff",
    fontSize: 16},
  searchBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderTopColor: Colors.highlight,
    borderLeftColor: Colors.highlight,
    borderBottomColor: Colors.shadowDark,
    borderRightColor: Colors.shadowDark,
    borderWidth: 1},
  searchBtnDisabled: {
    opacity: 0.4},
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 12,
    gap: 10},
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.inset},
  orText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1}});

export default HomeScreen;
