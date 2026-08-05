import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "react-native";
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
import Constants from "expo-constants";
import * as Sentry from "@sentry/react-native";
import Colors from "./src/constants/Colors";
import { WorkoutQueuePersist } from "./src/components/WorkoutQueuePersist";

const sentryDsn =
  process.env.EXPO_PUBLIC_SENTRY_DSN ||
  String(
    (Constants.expoConfig?.extra as { sentryDsn?: string } | undefined)
      ?.sentryDsn ?? ""
  ).trim();

Sentry.init({
  dsn: sentryDsn || undefined,
  sendDefaultPii: true,
  tracesSampleRate: 0.2,
  enableAutoSessionTracking: true,
  enableLogs: true,
  environment: __DEV__ ? "development" : "production",
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.mobileReplayIntegration()],
});

if (sentryDsn) {
  Sentry.captureMessage("app_js_started", "info");
}

/**
 * TestFlight hang: preventAutoHide + waiting on useFonts (fonts often
 * never resolve in release). Never hold splash; never block UI on fonts.
 */
SplashScreen.hideAsync().catch(() => {});

const rootReducer = combineReducers({
  favorites: workOutReducer,
  logIn: loginReducer,
});
const store = createStore(rootReducer, applyMiddleware(thunk));

function App() {
  useFonts({
    BebasNeue_400Regular,
  });

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    if (sentryDsn) {
      Sentry.addBreadcrumb({ category: "boot", message: "App mounted" });
      Sentry.captureMessage("app_mounted", "info");
    }
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PaperProvider theme={PaperTheme}>
            <WorkoutQueuePersist />
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

export default Sentry.wrap(App);
