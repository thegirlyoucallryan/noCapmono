import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native'

import Ionicons from '@expo/vector-icons/Ionicons'
import Colors from '../constants/Colors'
import logo from '../assets/icon.png'
import { ScrollView } from 'react-native-gesture-handler'
import HorizontalSlider from '../components/HorizontalSlider'
import NeomorphicStyles from '../constants/NeomorphicStyles'
import { NeomorphicView } from '../components/NeomorphicView'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { Exercise } from '../types/types'
import NMPHInset from '../constants/NMPHInset'

const EquipmentObj = [
  { id: 'c1', equipment: 'Band', keyName: 'band' },
  { id: 'c2', equipment: 'Body Weight', keyName: 'body weight' },
  { id: 'c3', equipment: 'Bosu Ball', keyName: 'bosu ball' },
  { id: 'c4', equipment: 'Cable', keyName: 'cable' },
  { id: 'c5', equipment: 'Dumbbells', keyName: 'dumbbell' },
  { id: 'c6', equipment: 'Rope', keyName: 'rope' },
  { id: 'c7', equipment: 'Kettlebell', keyName: 'kettlebell' },
  { id: 'c8', equipment: 'Medicine Ball', keyName: 'medicine ball' },
  { id: 'c9', equipment: 'Smith Machine', keyName: 'smith machine' },
  { id: 'c10', equipment: 'Stability Ball', keyName: 'stability ball' },
  { id: 'c11', equipment: 'Weighted', keyName: 'weighted' },
  { id: 'c12', equipment: 'Barbell', keyName: 'barbell' },
  { id: 'c13', equipment: 'EZ Barbell', keyName: 'ez barbell' },
  { id: 'c14', equipment: 'Misc. Machines', keyName: 'leverage machine' },
]
const Categories = [
  { id: 'c1', title: 'cardio', keyName: 'Cardio' },
  { id: 'c2', title: 'shoulders', keyName: 'Shoulders' },
  { id: 'c3', title: 'back', keyName: 'Back' },
  { id: 'c4', title: 'chest', keyName: 'Chest' },
  { id: 'c5', title: 'upper arms', keyName: 'Arms' },
  { id: 'c6', title: 'lower legs', keyName: 'Calves' },
  { id: 'c7', title: 'upper legs', keyName: 'Glutes' },
  { id: 'c8', title: 'waist', keyName: 'Abs' },
  { id: 'c9', title: 'lower arms', keyName: 'Forearms' },
  { id: 'c10', title: 'neck', keyName: 'Neck' },
]

const HomeScreen = () => {
  const [userInput, setUserInput] = useState('')
  const nav = useNavigation()
  const { favoritedExercises } = useSelector((s) => s.favorites)
  const onChangeHandler = () => {
    nav.navigate('Workouts', {
      userInput: userInput,
    })
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingVertical: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontFamily: 'Sonsie',
                fontSize: 19,
                color: Colors.accent,
              }}
            >
              Welcome
            </Text>
            <Text style={{ color: Colors.primary }}>
              {new Date().toDateString()}
            </Text>
          </View>
          <Text
            style={{
              color: 'white',
              fontSize: 17,
              marginTop: 10,
              marginHorizontal: 35,
            }}
          >
            Start selecting exercises for today's workout, then go to the
            workout tab...
          </Text>
        </View>
        <View>
          {favoritedExercises.length > 0 && (
            <View
              style={{
                backgroundColor: Colors.accent,
                paddingHorizontal: 35,

                ...NMPHInset,

                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 13, marginBottom: 3 }}>
                Selected exercises
              </Text>
              {favoritedExercises.map((f: Exercise) => (
                <Text
                  key={f.id}
                  style={{ textTransform: 'capitalize', fontSize: 15 }}
                >
                  {f.name}
                </Text>
              ))}
            </View>
          )}
        </View>

        <HorizontalSlider data={Categories} type={'Categories'} />
        <View>
          <Text style={styles.headline}>Search by Name</Text>
          <View style={styles.searchBox}>
            <TextInput
              style={{
                flex: 1,
                ...NeomorphicStyles,
                elevation: 0,
                borderTopColor: '#111111',
                borderLeftColor: '#111111',
                borderBottomColor: '#2e2e2e',
                borderRightColor: '#2e2e2e',
                borderWidth: 3,
                borderRadius: 11,
                paddingVertical: 9,
                paddingHorizontal: 25,
                marginHorizontal: 5,
                marginBottom: 40,
                color: 'white',
                shadowColor: 'transparent',
              }}
              onChangeText={(text) => {
                setUserInput(text)
              }}
              placeholder="Search i.e 'squats'"
              placeholderTextColor={Colors.accent}
            />

            <Pressable
              onPress={onChangeHandler}
              style={{
                ...NeomorphicStyles,
                alignSelf: 'center',
                paddingVertical: 14,
                paddingHorizontal: 25,
                marginHorizontal: 5,
                marginBottom: 40,
              }}
              disabled={!userInput}
            >
              <Ionicons name="search" size={18} color={Colors.accent} />
            </Pressable>
          </View>
        </View>

        <HorizontalSlider data={EquipmentObj} type={'Equipment'} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.twentyThree,
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },

  welcome: {
    height: Platform.OS === 'ios' ? 150 : 200,
    alignSelf: 'center',
    marginTop: Platform.OS === 'ios' ? 6 : -36,
    marginBottom: 15,
  },

  headline: {
    color: 'white',
    marginTop: 4,
    marginHorizontal: 15,
    marginBottom: 10,
    textAlign: 'left',
    elevation: 30,
    fontWeight: '300',
    fontSize: 17,
  },

  icon: {
    color: Colors.accent,
  },

  userName: {
    fontSize: 27,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  searchBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',

    // marginHorizontal: 5,
  },
  EquipmentContainer: {
    marginTop: 20,
    overflow: 'scroll',
  },
})

export default HomeScreen
