import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, Image, Dimensions } from "react-native";
import Colors from "../constants/Colors";
import { RouteProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/WorkoutNavigator";
import { Exercise } from "../types/types";
import Timer from "../components/Timer";
import { ScrollView } from "react-native-gesture-handler";
//@ts-ignore
import {EXPO_PUBLIC_API_KEY} from "@env"
import {Ionicons} from '@expo/vector-icons'

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
    if (exercise) {
      nav.setOptions({
        headerShown: true,
        headerTitleStyle: { color: Colors.accent, fontWeight: '100' },
        headerTintColor: Colors.inner,
        headerTitle: name.charAt(0).toUpperCase() + name.slice(1),
        headerLeft:()=> (<><Ionicons name="analytics-outline" /></>)
      });
    }
  }, []);
  // const apiKey = process.env.EXPO_PUBLIC_API_KEY

  const getWorkout = async () => {
    let response = await fetch(
      `https://exercisedb.p.rapidapi.com/exercises/exercise/${id}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
          "x-rapidapi-key": EXPO_PUBLIC_API_KEY
        },
      }
    );
    const resData = await response.json();

    setExercise(resData);
  };

  useEffect(() => {
    getWorkout();
  }, [id]);

  const uri = exercise?.gifUrl;

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      {/* <Text style={styles.infoname}>{exercise?.name}</Text> */}
      <View style={styles.trickContainer}>
       {exercise && <Image style={styles.image} source={{ uri: `${uri}` }} />}
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
    marginTop: 15,
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
