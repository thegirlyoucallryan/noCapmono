import { Text, View, StyleSheet, Pressable, Alert } from "react-native";
import Colors from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

import React, { useState, useEffect } from "react";
import { Sound } from "expo-av/build/Audio";

const Timer = ({ time, iconSize, initiateOnStart }: { time: number; iconSize?: number, initiateOnStart?:boolean }) => {
  const [seconds, setSeconds] = useState<number>(time);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sound, setSound] = useState<Sound>();

  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/mysterious_bass.wav"),
          { shouldPlay: false } // Load the sound without playing
        );
        setSound(sound);
      } catch (error) {
        console.error("Error loading sound:", error);
      }
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync(); // Unload the sound when the component is unmounted
      }
    };
  }, []);

  useEffect(() => {
    if (seconds === 0 && isActive && sound) {
      playSound();
    }
  }, [seconds, isActive, sound]);

  const playSound = async () => {
    try {
      await sound?.setPositionAsync(0); // Rewind the sound to the beginning
      await sound?.playAsync();
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const toggle = async () => {
    setIsActive(!isActive);
    try {
      await sound?.stopAsync();
    } catch (error) {
      console.error(error);
    }
  };

  const reset = async () => {
    setSeconds(time);
    setIsActive(false);
    try {
      await sound?.stopAsync();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    let interval: string | number | NodeJS.Timeout | null | undefined = null;

    if(initiateOnStart){
      interval = setInterval(() => {
        setSeconds((seconds: number) => seconds - 1);
      }, 1000);
    }

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((seconds: number) => seconds - 1);
      }, 1000);
    } else if (!isActive && seconds !== 0 && interval) {
      clearInterval(interval);
    }

    return () => clearInterval(interval!);
  }, [initiateOnStart ? initiateOnStart : isActive, seconds]);

  return (
    <View>
      <View style={styles.timerBox}>
        <View style={styles.buttonContainer}>
          <Pressable onPress={toggle}>
            <Text style={styles.startBtn}>
              {isActive ? (
                <Ionicons size={iconSize ? iconSize : 45} name="pause" />
              ) : (
                <Ionicons size={iconSize ? iconSize : 45} name="play" />
              )}
            </Text>
          </Pressable>
        </View>
        <View>
          <Text style={styles.counter}>00:{seconds}</Text>
          <Pressable onPress={reset}>
            <Text style={styles.pauseBtn}> Reset </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  timerBox: {
    // backgroundColor: "#232323",

    paddingHorizontal: 18,
    padding: 5,
    alignItems: "center",
    alignContent: "center",
    borderRadius: 10,
    // marginBottom: 10,
    justifyContent: "center",
    // elevation: 2,
    flexDirection: "row",
  },

  counter: {
    color: Colors.primary,
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 20,
    alignContent: "center",
  },
  buttonContainer: {
    alignContent: "center",
  },
  startBtn: {
    color: Colors.primary,
    borderColor: Colors.primary,
    borderWidth: 3,
    borderRadius: 200,
    padding: 10,
    paddingRight: 4,
    alignSelf: "center",
  },
  pauseBtn: {
    fontSize: 20,
    color: Colors.primary,
    alignSelf: "center",
  },
});

export default Timer;

// //async function Objects are not valid as a React child useEffect helped...I had it in React.useEffect when it was already imported...
// //[Unhandled promise rejection: TypeError: undefined is not an object (evaluating 'sound.stopAsync')]
// // i wrapped the reset and stop functions in async and awaited stop ... the error changed to a yellow warning for now
