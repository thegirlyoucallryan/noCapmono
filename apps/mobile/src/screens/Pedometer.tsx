import { useState, useEffect } from "react";
import { PermissionsAndroid, StyleSheet, Platform, View } from "react-native";
import { Pedometer } from "expo-sensors";
import Colors from "../constants/Colors";
import CircularProgress from "react-native-circular-progress-indicator";
import NeomorphicStyles from "../constants/NeomorphicStyles";
import NMPHInset from "../constants/NMPHInset";

export function PedometerScreen() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState("checking");
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false);
  const [currentStepCount, setCurrentStepCount] = useState(0);

  const checkAndRequestPedometerPermission = async () => {
    if (Platform.OS === "android") {
      const isAvailable = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: "Pedometer App Permission",
          message: "This permissions is required for the pedometer function.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      if (!isAvailable) {
        await Pedometer.requestPermissionsAsync();
      }

      if (isAvailable === PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionsGranted(true);
      } else {
        alert("Permission denied");
        return;
      }
    }
    if (Platform.OS === "ios") {
      const { status } = await Pedometer.getPermissionsAsync();

      if (status === "granted") {
        setPermissionsGranted(true);
      } else {
        const newStatus = await Pedometer.requestPermissionsAsync();
        setPermissionsGranted(newStatus.status === "granted");
      }
    }
  };

  checkAndRequestPedometerPermission();

  useEffect(() => {
    if (permissionsGranted && isPedometerAvailable) {
      subscribe();
    }
  }, []);

  const subscribe = () => {
    Pedometer.watchStepCount((result) => {
      setCurrentStepCount(result.steps);
    });

    Pedometer.isAvailableAsync().then(
      (result) => {
        setIsPedometerAvailable(String(result));
      },

      (error) => {
        setIsPedometerAvailable(error);
      }
    );
  };

  return (
    <View
      style={{
        borderRadius: 550,
        padding: 26,
        alignContent: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          ...NeomorphicStyles,
          ...NMPHInset,
          alignSelf: "center",
          padding: 14,
          borderRadius: 400,
          shadowColor: Colors.accent,
        }}
      >
        <CircularProgress
          value={currentStepCount}
          maxValue={11500}
          radius={140}
          activeStrokeColor={Colors.accent}
          inActiveStrokeColor={Colors.backGround}
          inActiveStrokeOpacity={0.4}
          inActiveStrokeWidth={30}
          activeStrokeWidth={30}
          title={"Step Count"}
          titleColor={Colors.primary}
          titleStyle={{ fontWeight: "bold" }}
          dashedStrokeConfig={{
            count: 50,
            width: 4,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.twentyThree,
  },
});
