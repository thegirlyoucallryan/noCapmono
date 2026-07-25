import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Colors from "../constants/Colors";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/WorkoutNavigator";
import { Exercise } from "../types/types";
import Timer from "../components/Timer";
import { ScrollView } from "react-native-gesture-handler";
import { fetchExercises } from "../../utils/exerciseApi";
import { ExerciseGif } from "../components/ExerciseGif";

// type DetailScreenRouteProp = RouteProp<RootStackParamList, "Details">;
// type DetailScreenProps = {
//   route: DetailScreenRouteProp;
// };

const SCREEN_WIDTH = Dimensions.get("window").width;

const WorkoutDetail = ({ route }: any) => {
  const id = route.params.id;
  const name = route.params.name;
  const nav = useNavigation();
  const [exercise, setExercise] = useState<Exercise>();

  useEffect(() => {
    if (name) {
      nav.setOptions({
        headerShown: true,
        headerTitleStyle: { color: Colors.accent, fontWeight: "100" },
        headerTintColor: Colors.inner,
        headerTitle: name.charAt(0).toUpperCase() + name.slice(1),
      });
    }
  }, [name, nav]);

  const getWorkout = async () => {
    try {
      const resData = await fetchExercises(`/exercises/exercise/${id}`);
      setExercise(resData as Exercise);
    } catch (error: any) {
      console.error("[API error]", error.message);
    }
  };

  useEffect(() => {
    getWorkout();
  }, [id]);


  return (
    <ScrollView contentContainerStyle={styles.screen}>
      {/* <Text style={styles.infoname}>{exercise?.name}</Text> */}
      <View style={styles.trickContainer}>
       {exercise?.id && (
         <ExerciseGif exerciseId={exercise.id} style={styles.image} />
       )}
        <View style={styles.infobox}>
          <Text style={styles.info}>Equipment: {exercise?.equipment}</Text>
          <Text style={styles.info}>Area worked: {exercise?.bodyPart}</Text>
        </View>
      </View>

      <View style={styles.timerContainer}><Timer time={45}/></View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.twentyThree,
    height: Dimensions.get('screen').height + 150,


  },
  trickContainer: {
    // flex: 1,
    alignItems: "center",
  },

  image: {
    marginTop: 12,
    alignSelf: "center",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 0.9,
    borderRadius: 22,
  },

  timerContainer: {
    alignItems: "center",


  },
  info: {
    color: Colors.primary,
    margin: 11,
    letterSpacing: 1,
  },
  infobox: {
    flexDirection: "row",
  },
  infoname: {
    color: Colors.accent,
    textTransform: "uppercase",
    fontSize: 18,
    marginTop: 45,
    
    textAlign: "center",
    marginHorizontal: 5,
  },
});

export default WorkoutDetail;
