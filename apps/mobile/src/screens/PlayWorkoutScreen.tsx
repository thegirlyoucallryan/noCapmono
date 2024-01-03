import {
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
} from 'react-native'
import { View } from 'react-native'
import Colors from '../constants/Colors'
import { Exercise } from '../types/types'
import React, { useEffect, useState } from 'react'
import CountDown from '../components/CountDown'
import { NeomorphicView } from '../components/NeomorphicView'
import img from '../assets/icon.png'
import NeomorphicStyles from '../constants/NeomorphicStyles'
import { Ionicons } from '@expo/vector-icons'
import NeomorphicButton from '../components/NeomorphicButton'
import NMPHInset from '../constants/NMPHInset'
import CircularProgress from 'react-native-circular-progress-indicator'
import Toast from 'react-native-toast-message'

let SCREEN_WIDTH = Dimensions.get('window').width

const PlayWorkoutScreen = ({ route }: any) => {
  const favorites = route.params.favorites as Exercise[]
  const sets = route.params.sets as number
  const type = route.params.type
  const setTime = 45
  const [initiateWorkout, setInitiateWorkout] = useState<boolean>(false)
  const [currentIndex, setCurrentIndex] = useState<number>(0)
  const [finished, setFinished] = useState<boolean>(false)
  const [isActive, setIsActive] = useState<boolean>(true)
  const [timer, setTimer] = useState<number>(setTime)
  const [rest, setRest] = useState<boolean>(false)

  const pauseMessage =
    'Timeout for You, but Not for our Energetic Animated Buddy! Brace yourself, the workout may be paused, but our virtual athlete is on an unstoppable marathon! #PauseAtYourOwnRisk'

  const toggle = async () => {
    if (isActive) {
      Toast.show({
        type: 'success',
        text1: 'Pause Pressed...',
        text2: pauseMessage,
        visibilityTime: 6500,
      })
    }

    setIsActive(!isActive)
  }
  const handleReset = () => {
    setIsActive(false)
    setTimer(setTime)
  }

  function repeatCircuit(favorites: Exercise[], sets: number) {
    const repeatedList = [...Array(sets)].flatMap(() => favorites)
    return repeatedList
  }

  function repeatStraight(favorites: Exercise[], sets: number) {
    return favorites.flatMap((item) => Array(sets).fill(item))
  }

  let repeatedSets =
    type == 'Circuit'
      ? repeatCircuit(favorites, sets)
      : repeatStraight(favorites, sets)

  let finalWorkout = repeatedSets.filter(function (x) {
    return x !== undefined
  })

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (initiateWorkout && isActive && timer > 0) {
      // Automatically progress to the next image every setTime seconds
      if (isActive && timer > 0) {
        interval = setInterval(() => {
          setTimer((prevSeconds) => prevSeconds - 1)
        }, 1000)
      }
    }
    if (!isActive && interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [initiateWorkout, timer, isActive])

  const handleInitiateWorkout = () => {
    setInitiateWorkout(true)
  }
  if (currentIndex < finalWorkout.length - 1 && timer === 0 && !rest) {
    setRest(true)
  }

  if (
    currentIndex === finalWorkout.length - 1 &&
    timer === 0 &&
    initiateWorkout
  ) {
    setCurrentIndex((prevIndex) => prevIndex + 1)
    setTimer(setTime)

    setIsActive(false)
    setFinished(true)
    setInitiateWorkout(false)
  }

  function handleNext() {
    setCurrentIndex((prevIndex) =>
      prevIndex < finalWorkout.length - 1
        ? prevIndex + 1
        : finalWorkout.length - 1
    )
    setTimer(setTime)
  }
  function handleBack() {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0))
    setTimer(setTime)
  }
  function handleRest() {
    if (currentIndex < finalWorkout.length - 1 && timer === 0) {
      setCurrentIndex((prevIndex) => prevIndex + 1)
      setTimer(setTime)
    }
    setRest(false)
  }

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        backgroundColor: Colors.twentyThree,
      }}
    >
      {!initiateWorkout && (
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: Colors.accent,
              fontSize: 30,
              fontFamily: 'Sonsie',
              marginTop: '30%',
            }}
          >
            Get Ready!
          </Text>
          <CountDown time={5} onZero={handleInitiateWorkout} />
        </View>
      )}

      {rest && (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            padding: 30,
          }}
        >
          <Text
            style={{
              color: Colors.accent,
              fontSize: 35,
              fontFamily: 'Sonsie',
            }}
          >
            Rest...
          </Text>
          <CountDown time={30} onZero={handleRest} />
          <View style={{ flexDirection: 'row', ...NMPHInset, padding: 22 }}>
            <Text
              style={{
                color: 'white',
                fontSize: 20,
              }}
            >
              Up next:
            </Text>
            <Text
              style={{
                color: 'white',
                fontSize: 20,
                marginHorizontal: 5,
                textTransform: 'capitalize',
              }}
            >
              {finalWorkout[currentIndex + 1].name}
            </Text>
          </View>
        </View>
      )}

      {initiateWorkout && !finished && !rest && (
        <View style={{ height: '100%' }}>
          <View style={styles.card}>
            <Text style={styles.name}>
              {finalWorkout[currentIndex].name.replace(/\(Male\)/i, '')}
            </Text>
            <Image
              source={{ uri: finalWorkout[currentIndex].gifUrl }}
              resizeMode="cover"
              style={styles.image}
            />
          </View>
          <View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                paddingTop: 4,
                alignItems: 'center',
              }}
            >
              <NeomorphicButton
                icon={'caret-back-outline'}
                onPress={handleBack}
                title="Back"
                extraButtonStyles={{ height: 50, padding: 4 }}
                extraTextStyles={{ color: Colors.primary }}
              />
              <View>
                <View
                  style={{
                    ...NeomorphicStyles,
                    ...NMPHInset,
                    alignSelf: 'center',
                    padding: 5,
                    borderRadius: 400,
                    shadowColor: Colors.accent,
                  }}
                >
                  <CircularProgress
                    value={timer}
                    maxValue={setTime}
                    radius={60}
                    activeStrokeColor={Colors.accent}
                    activeStrokeSecondaryColor={Colors.accent2}
                    inActiveStrokeColor={Colors.backGround}
                    inActiveStrokeOpacity={0.6}
                    inActiveStrokeWidth={30}
                    activeStrokeWidth={20}
                    strokeLinecap="square"
                    title={''}
                    titleColor={Colors.primary}
                    titleStyle={{ fontWeight: 'bold' }}
                    dashedStrokeConfig={{
                      count: setTime,
                      width: 4,
                    }}
                  />
                </View>
                <View
                  style={{
                    padding: 15,
                    alignItems: 'center',

                    justifyContent: 'space-between',
                    flexDirection: 'row-reverse',
                  }}
                >
                  <Pressable onPress={toggle}>
                    <Text style={styles.startBtn}>
                      {isActive ? (
                        <Ionicons size={30} name="pause" />
                      ) : (
                        <Ionicons size={30} name="play" />
                      )}
                    </Text>
                  </Pressable>

                  <Pressable onPress={handleReset}>
                    <Text style={styles.pauseBtn}> Reset </Text>
                  </Pressable>
                </View>
              </View>
              <NeomorphicButton
                icon={'caret-forward-outline'}
                onPress={handleNext}
                title="Next"
                extraButtonStyles={{ height: 50, padding: 7 }}
                extraTextStyles={{ color: Colors.primary }}
              />
            </View>
          </View>
        </View>
      )}
      {finished && (
        <View
          style={{
            alignSelf: 'center',
            marginTop: 10,
            position: 'absolute',
            zIndex: 500,
          }}
        >
          <NeomorphicView>
            <Image
              source={img}
              style={{ height: 200, width: 200, alignSelf: 'center' }}
            />
            <View
              style={{
                alignSelf: 'center',
                marginTop: 15,
                margin: 25,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: Colors.accent,
                  padding: 24,
                  fontFamily: 'Sonsie',
                  fontSize: 24,
                  textAlign: 'center',
                }}
              >
                Great Job! 🛠️ You got it done!
              </Text>
            </View>
          </NeomorphicView>
        </View>
      )}
    </ScrollView>
  )
}
export default PlayWorkoutScreen

const styles = StyleSheet.create({
  card: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    textAlign: 'center',
    alignSelf: 'center',
    margin: 5,
    backgroundColor: 'white',
  },
  image: {
    alignSelf: 'center',
    width: '100%',
    height: '100%',
  },
  name: {
    color: Colors.primary,
    padding: 11,
    fontSize: 18,
    textTransform: 'capitalize',
  },
  timerBox: {
    paddingHorizontal: 8,
    alignItems: 'center',
    alignContent: 'center',

    marginTop: 40,
    justifyContent: 'center',
    flexDirection: 'row',
  },

  counter: {
    color: Colors.accent,
    fontSize: 45,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 10,
    alignContent: 'center',
  },
  buttonContainer: {
    alignContent: 'center',
    alignItems: 'center',
  },
  startBtn: {
    color: Colors.accent,
    alignSelf: 'center',
    marginLeft: 15,
  },
  pauseBtn: {
    fontSize: 25,
    color: Colors.accent,
    alignSelf: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginRight: 15,
  },
})
