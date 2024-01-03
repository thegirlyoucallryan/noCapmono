import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ReturnedWorkoutList from "../components/ReturnedWorkoutList";
import Colors from "../constants/Colors";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faBlackboard, faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { AddFavorite } from "../store/actions";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { Exercise } from "../types/types";
import NeomorphicStyles from "../constants/NeomorphicStyles";
//@ts-ignore
import { EXPO_PUBLIC_API_KEY } from "@env";

const WorkoutList = ({ route }: any) => {
  const [exercises, setExercises] = useState([]);
  const nav = useNavigation();
  let url: string;
  const searchQuery = route.params.userInput;
  const equipment = route.params.equipment;
  const bodyPart = route.params.bodyPart;
  const { favoritedExercises } = useSelector((s) => s.favorites);


  function isExerciseFavorited(exerciseName: string) {
    for (const exercise of favoritedExercises) {
      if (exercise.name === exerciseName) {
        return true;
      }
    }
    return false;
  }

  const header = searchQuery || equipment || bodyPart;

  useEffect(() => {
    nav.setOptions({
      headerShown: true,

      headerTitleStyle: { color: Colors.accent },
      headerTintColor: Colors.inner,
      headerTitle: header.charAt(0).toUpperCase() + header.slice(1),
    });
  }, []);

  if (equipment) {
    url = `https://exercisedb.p.rapidapi.com/exercises/equipment/${equipment}`;
  } else if (bodyPart) {
    url = `https://exercisedb.p.rapidapi.com/exercises/bodyPart/${bodyPart}`;
  } else if (searchQuery) {
    url = `https://exercisedb.p.rapidapi.com/exercises/name/${searchQuery.toLowerCase()}`;
  }

  const getWorkout = async () => {
    await axios
      .get(url, {
        headers: {
          "x-rapidapi-host": "exercisedb.p.rapidapi.com",
          "x-rapidapi-key": EXPO_PUBLIC_API_KEY,
        },
      })
      .then(function (response) {
        const resData = response.data;
        setExercises(resData);
      })
      .catch(function (error) {
        console.log(error.message);
      });
  };

  useEffect(() => {
    getWorkout();
  }, []);

  const dispatch = useDispatch();

  function WorkoutRenderHandler(item: Exercise) {
    return (
      <View style={styles.screen}>
        <TouchableOpacity
          onPress={() => {
            nav.navigate("Display", {
              id: item.id,
              name: item.name,
            });
          }}
        >
          <View style={styles.workoutItem}>
            <View style={styles.flexthing}>
              <Text
                numberOfLines={1}
                style={{
                  ...styles.name,
                  color: !isExerciseFavorited(item.name)
                    ? Colors.accent
                    : Colors.primary,
                }}
              >
                {item.name.length > 32
                  ? item.name.slice(0, 32) + "..."
                  : item.name}
              </Text>
              <Text style={styles.equipment}>{item.equipment}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            ...NeomorphicStyles,
            alignSelf: "center",
            justifyContent: "center",
            alignItems: "center",
            padding: 8,
          }}
          onPress={() => {
            dispatch(
              AddFavorite(item.id, item.name, item.gifUrl, item.equipment)
            );
          }}
        >
          <FontAwesomeIcon size={16} style={styles.icon} icon={faSquarePlus} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.twentyThree }}>
      <ReturnedWorkoutList
        data={exercises}
        renderItem={({ item }: any) => WorkoutRenderHandler(item)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 28,
    justifyContent: "space-between",

    backgroundColor: Colors.twentyThree,
  },
  workoutItem: {
    flexDirection: "row",
    padding: 11,
  },
  name: {
    textTransform: "capitalize",
    fontSize: 16,
  },

  equipment: {
    color: "white",
    textTransform: "capitalize",
    fontWeight: "200",
  },
  flexthing: {
    flexDirection: "column",
  },
  icon: {
    color: Colors.accent,
  },
});

export default WorkoutList;
