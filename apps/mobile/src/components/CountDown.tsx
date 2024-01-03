import { Text, View, StyleSheet, Pressable } from 'react-native'
import Colors from '../constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import React, { useState, useEffect } from 'react'
import NeomorphicStyles from '../constants/NeomorphicStyles'
import NMPHInset from '../constants/NMPHInset'
import CircularProgress from 'react-native-circular-progress-indicator'
import NeomorphicButton from './NeomorphicButton'

const CountDown = ({
  time,
  onZero,
  setTimer,
}: {
  time: number
  onZero: () => void
  setTimer?: React.Dispatch<React.SetStateAction<number>>
}) => {
  const [seconds, setSeconds] = useState<number>(time)
  const [isActive, setIsActive] = useState<boolean>(true)

  const toggle = async () => {
    setIsActive(!isActive)
  }
  const handleReset = () => {
    setSeconds(time)
    setIsActive(false)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1)
      }, 1000)
    } else if (seconds === 0 && !isActive) {
      setTimer && setTimer(time)
    } else if (seconds === 0 && isActive) {
      onZero()
    }

    return () => {
      if (interval) {
        setTimer && setTimer(0)
        clearInterval(interval)
      }
    }
  }, [seconds, isActive, onZero])

  return (
    <View>
      <View>
        <View
          style={{
            ...NeomorphicStyles,
            ...NMPHInset,
            alignSelf: 'center',
            padding: 14,
            borderRadius: 400,
            shadowColor: Colors.accent,
          }}
        >
          <CircularProgress
            value={seconds}
            maxValue={time}
            radius={100}
            activeStrokeColor={Colors.accent}
            inActiveStrokeColor={Colors.backGround}
            inActiveStrokeOpacity={0.6}
            inActiveStrokeWidth={30}
            activeStrokeWidth={30}
            title={''}
            titleColor={Colors.primary}
            titleStyle={{ fontWeight: 'bold' }}
            dashedStrokeConfig={{
              count: time,
              width: 4,
            }}
          />
        </View>
        <View
          style={{ padding: 20, alignItems: 'center', alignSelf: 'center' }}
        >
          <NeomorphicButton
            onPress={toggle}
            icon={isActive ? 'pause' : 'play'}
            title={isActive ? 'pause' : 'play'}
            extraTextStyles={{ color: Colors.primary }}
            extraButtonStyles={{ padding: 5 }}
          />
        </View>
        <Pressable onPress={handleReset}>
          <Text style={styles.pauseBtn}> Reset </Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  timerBox: {
    alignItems: 'center',
    alignContent: 'center',

    margin: 10,
    justifyContent: 'center',

    flexDirection: 'row',
  },

  counter: {
    color: Colors.accent,
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
    alignContent: 'center',
  },

  startBtn: {
    color: Colors.primary,
    alignSelf: 'center',
    paddingTop: 20,
  },
  pauseBtn: {
    fontSize: 20,
    color: 'black',
    alignSelf: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
})

export default CountDown
