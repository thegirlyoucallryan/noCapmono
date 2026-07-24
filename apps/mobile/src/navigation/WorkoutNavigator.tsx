import { createStackNavigator } from "@react-navigation/stack";
import { createNavigatorFactory } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import DashboardScreen from "../screens/DashboardScreen";
import WorkoutDetail from "../screens/WorkoutDetailScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import WorkoutList from "../screens/WorkoutListScreen";
import Colors from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import WorkoutListDetailScreen from "../screens/WorkoutListDetailScreen";
import PlayWorkoutScreen from "../screens/PlayWorkoutScreen";
import { connect } from "react-redux";
import { View, Text, StyleSheet } from "react-native";
import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { FinaleScreen } from "../screens/FinaleScreen";
import { SignIn } from "../screens/SignIn";
import { AcceptLegalScreen } from "../screens/AcceptLegalScreen";
import { TermsAndConditionsScreen } from "../screens/TermsAndConditionsScreen";
import { PrivacyPolicyScreen } from "../screens/PrivacyPolicyScreen";
import { supabase } from "../../utils/supabase";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { CalculatorScreen } from "../screens/CalculatorScreen";
import { WorkoutMiniBar } from "../components/WorkoutMiniBar";
import { hasAcceptedLegal, ensureLegalAfterSignIn } from "../../utils/workoutApi";
import { ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import { clearFavorites } from "../store/actions";
import { clearLegacySharedLocalData } from "../../utils/workoutStore";

export type RootStackParamList = {
  Home: undefined;
  BuildHome: undefined;
  MyWorkoutHome: undefined;
  Display: { id: string; name: string };
  Play: any;
  Details: { id?: string; name?: string };
  Finale: any;
  Welcome: undefined;
  Auth: undefined;
  Tabs: undefined;
  Workouts:
    | { equipment: any; bodyPart?: undefined }
    | { bodyPart: any; equipment?: undefined };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
const Stack = createStackNavigator();

export function AppNavigator() {
  const dispatch = useDispatch();
  const [session, setSession] = useState<Session | null>(null);
  const [legalOk, setLegalOk] = useState(false);
  const [booting, setBooting] = useState(true);

  const refreshLegal = async () => {
    try {
      await ensureLegalAfterSignIn();
      const ok = await hasAcceptedLegal();
      setLegalOk(ok);
    } catch {
      setLegalOk(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let lastUserId: string | null | undefined;

    clearLegacySharedLocalData().catch(() => {});

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      lastUserId = session?.user?.id ?? null;
      setSession(session);
      if (session?.user) {
        await refreshLegal();
      } else {
        setLegalOk(false);
      }
      setBooting(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextId = session?.user?.id ?? null;
      if (lastUserId !== undefined && lastUserId !== nextId) {
        dispatch(clearFavorites());
      }
      lastUserId = nextId;
      setSession(session);
      if (session?.user) {
        await refreshLegal();
      } else {
        setLegalOk(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  if (booting) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.twentyThree,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  const isAuthenticated = !!session?.user;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated && (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
      {isAuthenticated && !legalOk && (
        <Stack.Screen name="AcceptLegalStack">
          {() => <AcceptLegalStack onAccepted={() => setLegalOk(true)} />}
        </Stack.Screen>
      )}
      {isAuthenticated && legalOk && (
        <Stack.Screen name="Tabs" component={WorkoutTabs} />
      )}
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Welcome"
        component={SignIn}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function AcceptLegalStack({ onAccepted }: { onAccepted: () => void }) {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AcceptLegalHome" options={{ headerShown: false }}>
        {() => <AcceptLegalScreen onAccepted={onAccepted} />}
      </Stack.Screen>
      <Stack.Screen
        name="TermsAndConditions"
        component={TermsAndConditionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export function BuildTabShell() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.twentyThree }}>
      <WorkoutStack />
      <WorkoutMiniBar />
    </View>
  );
}

/** My Workout tab — list + exercise detail (Details lives here, not only under Build) */
export function MyWorkoutTabShell() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.twentyThree }}>
      <Stack.Navigator
        initialRouteName="MyWorkoutHome"
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: Colors.twentyThree,
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTintColor: Colors.accent,
          headerTitleStyle: {
            fontWeight: "100",
          },
        }}
      >
        <Stack.Screen name="MyWorkoutHome" component={FavoritesScreen} />
        <Stack.Screen
          name="Details"
          component={WorkoutDetail}
          options={{ headerShown: true }}
        />
        <Stack.Screen
          name="Display"
          component={WorkoutListDetailScreen}
          options={{ headerShown: true }}
        />
      </Stack.Navigator>
    </View>
  );
}

export function WorkoutStack() {
  return (
    <Stack.Navigator
      initialRouteName="BuildHome"
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: Colors.twentyThree,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: Colors.accent,
        headerTitleStyle: {
          fontWeight: "100",
        },
      }}
    >
      <Stack.Screen
        name="BuildHome"
        component={HomeScreen}
        options={{ title: "Build" }}
      />

      <Stack.Screen
        name="Workouts"
        component={WorkoutList}
        options={{ headerShown: true, title: "Exercises" }}
      />
      <Stack.Screen
        name="Display"
        component={WorkoutListDetailScreen}
        options={{ headerShown: true }}
      />
      <Stack.Screen
        name="Details"
        component={WorkoutDetail}
        options={{ headerShown: true }}
      />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen
        name="Finale"
        component={FinaleScreen}
        options={{ headerShown: true, title: "Done" }}
      />
    </Stack.Navigator>
  );
}

function TabBarIcon({
  value,
  tabInfo,
}: {
  value: number;
  tabInfo: { color: string; focused: boolean };
}) {
  if (value === 0) {
    return (
      <View style={style.container}>
        <Ionicons name="barbell-outline" size={25} color={tabInfo.color} />
      </View>
    );
  }
  return (
    <View style={style.container}>
      <Text style={style.badge}>{value}</Text>
      <Ionicons name="barbell-outline" size={25} color={tabInfo.color} />
    </View>
  );
}

const Tab = createMaterialBottomTabNavigator();

export function WorkoutTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      activeColor={Colors.accent}
      shifting={false}
      inactiveColor={Colors.primary}
      barStyle={{ backgroundColor: Colors.twentyThree }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={() => ({
          tabBarIcon: (tabInfo) => (
            <Ionicons name="home-outline" size={25} color={tabInfo.color} />
          ),
        })}
      />
      <Tab.Screen
        name="Build"
        key={"Build"}
        component={BuildTabShell}
        options={() => ({
          tabBarColor: Colors.accent,
          tabBarIcon: (tabInfo) => (
            <Ionicons name="hammer-outline" size={25} color={tabInfo.color} />
          ),
        })}
      />
      <Tab.Screen
        name="My Workout"
        component={MyWorkoutTabShell}
        options={() => ({
          tabBarIcon: (tabInfo) => (
            <TabBarIconContainer tabInfo={tabInfo} />
          ),
        })}
      />
      <Tab.Screen
        name="Play"
        component={PlayWorkoutScreen}
        options={() => ({
          tabBarIcon: (tabInfo) => (
            <Ionicons name="play-circle-outline" size={25} color={tabInfo.color} />
          ),
        })}
      />
      <Tab.Screen
        name="Tools"
        component={CalculatorScreen}
        options={() => ({
          tabBarIcon: (tabInfo) => (
            <Ionicons name="calculator-outline" size={25} color={tabInfo.color} />
          ),
        })}
      />
    </Tab.Navigator>
  );
}

const TabBarIconContainer = connect((state) => ({
  value: state.favorites.favoritedExercises.length,
}))(TabBarIcon);

const style = StyleSheet.create({
  container: {
    position: "relative",
    width: 25,

    padding: 1,
  },
  badge: {
    fontSize: 14,
    fontWeight: "bold",
    position: "absolute",
    top: 0,
    backgroundColor: Colors.search,
    borderRadius: 12,
    paddingHorizontal: 5,
    right: -15,
    color: Colors.accent4,
  },
});

export const createMyNavigator = createNavigatorFactory(WorkoutTabs);
