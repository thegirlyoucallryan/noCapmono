import { NavigationContainer } from "@react-navigation/native";
import { StatusBar, StyleSheet } from "react-native";
import { Provider } from "react-redux";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/WorkoutNavigator";
import { createStore, combineReducers, applyMiddleware } from "redux";
import workOutReducer from "./src/store/Reducers";
import loginReducer from "./src/store/AuthStore/reducer";
import { thunk } from "redux-thunk";
import { PaperProvider } from "react-native-paper";
import { PaperTheme } from "./src/constants/PaperTheme";
import { useFonts, BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import Colors from "./src/constants/Colors";

SplashScreen.preventAutoHideAsync().catch(() => {});

const rootReducer = combineReducers({
  favorites: workOutReducer,
  logIn: loginReducer,
});
const store = createStore(rootReducer, applyMiddleware(thunk));

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    BebasNeue_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider theme={PaperTheme}>
            <StatusBar
              barStyle="light-content"
              backgroundColor={Colors.twentyThree}
              animated={true}
            />
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </PaperProvider>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
