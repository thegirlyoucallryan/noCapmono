import { createStackNavigator } from '@react-navigation/stack'
import { createNavigatorFactory, useNavigation } from '@react-navigation/native'
import HomeScreen from '../screens/HomeScreen'
import WorkoutDetail from '../screens/WorkoutDetailScreen'
import FavoritesScreen from '../screens/FavoritesScreen'
import WorkoutList from '../screens/WorkoutListScreen'
import Colors from '../constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import WorkoutListDetailScreen from '../screens/WorkoutListDetailScreen'
import PlayWorkoutScreen from '../screens/PlayWorkoutScreen'
import { connect } from 'react-redux'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import { SignIn } from '../screens/SignIn'
import { supabase } from '../../utils/supabase'
import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import NeomorphicButton from '../components/NeomorphicButton'
import { PedometerScreen } from '../screens/Pedometer'
import { CalculatorScreen } from '../screens/CalculatorScreen'
import { shadow } from 'react-native-paper'

//react native paper theme in constants to set background color of secondary container for tabs
export type RootStackParamList = {
  Home: undefined
  Display: { id: string; name: string }
  Play: any
  Details: { id?: string; name?: string }
  Finale: any
  Welcome: undefined
  Auth: undefined
  Tabs: undefined
  Workouts:
    | { equipment: any; bodyPart?: undefined }
    | { bodyPart: any; equipment?: undefined }
    | { userInput: string }
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
const Stack = createStackNavigator()

export function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null)
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session === null && (
        <Stack.Screen name="AuthStack" component={AuthStack} />
      )}
      {session?.user && <Stack.Screen name="Tabs" component={WorkoutTabs} />}
    </Stack.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Welcome"
        component={SignIn}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

export function WorkoutStack() {
  const nav = useNavigation()
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error: any) {
      console.error('Error logging out:', error?.message)
    }
  }

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={() => ({
        headerStyle: {
          backgroundColor: Colors.twentyThree,
          shadowOpacity: 0,
          elevation: 0,
        },
        headerTintColor: Colors.accent,
        headerTitleStyle: {
          fontWeight: '100',
          fontSize: 24,
        },
      })}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerRight: () => (
            <NeomorphicButton
              onPress={handleLogout}
              title={'Log out'}
              icon={'ios-log-out'}
              extraTextStyles={{ color: Colors.inner }}
              extraButtonStyles={{
                paddingVertical: 1,
                paddingHorizontal: 2,
                marginHorizontal: 29,
                marginVertical: 2,
              }}
            />
          ),
        })}
      />

      {/* <Stack.Screen name="Auth" component={AuthStack} /> */}
      <Stack.Screen name="Workouts" component={WorkoutList} />
      <Stack.Screen name="Display" component={WorkoutListDetailScreen} />
      <Stack.Screen
        name="Play"
        component={PlayWorkoutScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="Details" component={WorkoutDetail} />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

function TabBarIcon({
  value,
  tabInfo,
}: {
  value: number
  tabInfo: { color: string; focused: boolean }
}) {
  if (value === 0) {
    return (
      <View style={style.container}>
        <Ionicons name="barbell-outline" size={25} color={tabInfo.color} />
      </View>
    )
  }
  return (
    <View style={style.container}>
      <Text style={style.badge}>{value}</Text>
      <Ionicons name="barbell-outline" size={25} color={tabInfo.color} />
    </View>
  )
}

const Tab = createMaterialBottomTabNavigator()

export function WorkoutTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Search"
      activeColor={Colors.accent}
      shifting={false}
      inactiveColor={Colors.primary}
      barStyle={{ backgroundColor: Colors.twentyThree }}
    >
      <Tab.Screen
        name="Search"
        key={'Search'}
        component={WorkoutStack}
        options={() => ({
          tabBarColor: Colors.accent,

          tabBarIcon: (tabInfo) => {
            return <Ionicons name="search" size={25} color={tabInfo.color} />
          },
        })}
      />
      <Tab.Screen
        name="Steps"
        component={CalculatorScreen}
        options={() => ({
          tabBarIcon: (tabInfo) => {
            return (
              <Ionicons name="calculator" size={25} color={tabInfo.color} />
            )
          },
        })}
      />
      <Tab.Screen
        name="Workout"
        component={FavoritesScreen}
        options={() => ({
          tabBarIcon: (tabInfo) => {
            return <TabBarIconContainer tabInfo={tabInfo} />
          },
        })}
      />
    </Tab.Navigator>
  )
}

const TabBarIconContainer = connect((state) => ({
  value: state.favorites.favoritedExercises.length,
}))(TabBarIcon)

const style = StyleSheet.create({
  container: {
    position: 'relative',
    width: 25,
    elevation: 6,
    shadowColor: Colors.accent,
    padding: 1,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  badge: {
    fontSize: 14,
    fontWeight: 'bold',
    position: 'absolute',
    top: 0,
    backgroundColor: Colors.search,
    borderRadius: 12,
    paddingHorizontal: 5,
    right: -15,
    color: Colors.accent4,
  },
})

export const createMyNavigator = createNavigatorFactory(WorkoutTabs)
