import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Image, Dimensions } from "react-native";
import { HeaderButtons, Item } from "react-navigation-header-buttons";
import CustomHeaderButton from "../components/HeaderButton";
import { useDispatch } from "react-redux";
import { AddFavorite } from "../store/actions";
import Colors from "../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { Exercise } from "../types/types";
//@ts-ignore
import { EXPO_PUBLIC_API_KEY } from "@env";

const SCREEN_WIDTH = Dimensions.get("window").width;

const WorkoutDetail = ({ route }: any) => {
  const id = route.params.id;
  const nav = useNavigation();
  const [exercise, setExercise] = useState<Exercise>();

  useEffect(() => {
    if (exercise) {
      nav.setOptions({
        headerShown: true,
        headerTitleStyle: { color: Colors.accent, fontWeight: "100" },
        headerTintColor: Colors.inner,
        headerTitle:
          exercise &&
          exercise?.name.charAt(0).toUpperCase() + exercise.name.slice(1),
      });
    }
  }, [exercise?.name]);

  const dispatch = useDispatch();

  const getWorkout = async () => {
    let response = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
          "x-rapidapi-key": EXPO_PUBLIC_API_KEY,
        },
      }
    );
    const resData = await response.json();

    setExercise(resData);
  };

  useEffect(() => {
    getWorkout();
  }, [id]);

  //   const addToWorkoutHandler = useCallback(() => {
  //     dispatch(
  //       AddFavorite(
  //         exercise?.id,
  //         exercise?.name,
  //         exercise?.gifUrl,
  //         exercise?.equipment
  //       )
  //     );
  //     nav.goBack();
  //   }, [exercise]);

  //   useEffect(() => {
  //     nav.setParams({ add: addToWorkoutHandler });
  //   }, [addToWorkoutHandler]);

  return (
    <View style={styles.screen}>
      {/* <Text style={styles.infoname}>{exercise?.name}</Text> */}
      <View style={styles.trickContainer}>
        {exercise?.gifUrl && (
          <Image style={styles.image} source={{ uri: exercise?.gifUrl }} />
        )}
        <View style={styles.infobox}>
          <Text style={styles.info}>Equipment: {exercise?.equipment}</Text>
          <Text style={styles.info}>Area worked: {exercise?.bodyPart}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.twentyThree,
  },
  trickContainer: {
    flex: 1,
    alignItems: "center",
  },

  image: {
    marginTop: 15,

    // borderRadius: 40,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },

  timerContainer: {
    alignItems: "center",
  },
  info: {
    color: Colors.primary,
    margin: 11,
    letterSpacing: 1,
    fontSize: 14,
  },
  infobox: {
    margin: 15,
    padding: 10,
    flexDirection: "row",
  },
  infoname: {
    color: Colors.accent,
    textTransform: "uppercase",
    fontSize: 18,
    marginTop: 15,
    textAlign: "center",
    marginHorizontal: 5,
  },
});

export default WorkoutDetail;
