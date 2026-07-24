import { useState, useEffect } from 'react'
import {
  PermissionsAndroid,
  StyleSheet,
  Platform,
  View,
  Text,
} from 'react-native'
import { Pedometer } from 'expo-sensors'
import Colors from '../constants/Colors'
import { requestPermissionsAsync } from 'expo-sensors/build/Pedometer'
import CircularProgress from 'react-native-circular-progress-indicator'
import NeomorphicStyles from '../constants/NeomorphicStyles'
import NMPHInset from '../constants/NMPHInset'

export function PedometerScreen() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking')
  // const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false)
  const [currentStepCount, setCurrentStepCount] = useState(0)

  const dist = (currentStepCount * 2.2) / 5280
  const distance = dist.toFixed(2)

  const cal = dist * 60
  const caloriesBurnt = cal.toFixed(2)

  // useEffect(() => {
  //   checkAndRequestPedometerPermission()
  //   console.log('permissions', currentStepCount, permissionsGranted)
  // }, [])

  useEffect(() => {
    subscribe()
  }, [])

  const subscribe = () => {
    Pedometer.watchStepCount((result) => {
      setCurrentStepCount(result.steps)
    })

    Pedometer.isAvailableAsync().then(
      (result) => {
        setIsPedometerAvailable(String(result))
      },

      (error) => {
        setIsPedometerAvailable(error)
      }
    )
  }

  return (
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
          value={currentStepCount}
          clockwise
          maxValue={11500}
          radius={140}
          activeStrokeColor={Colors.accent}
          inActiveStrokeColor={Colors.backGround}
          inActiveStrokeOpacity={0.4}
          inActiveStrokeWidth={30}
          activeStrokeWidth={30}
          title={'Step Count'}
          titleColor={Colors.primary}
          titleStyle={{ fontWeight: 'bold' }}
          dashedStrokeConfig={{
            count: 100,
            width: 4,
          }}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 15,
          marginHorizontal: 35,
        }}
      >
        <View>
          <Text style={styles.stats}>{`${distance}`}</Text>
          <Text style={styles.unit}>{`Mi`}</Text>
        </View>
        <View>
          <Text style={styles.stats}>{`${caloriesBurnt}`}</Text>
          <Text style={styles.unit}>{` Cal`}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  stats: {
    fontSize: 30,
    color: Colors.accent,
    textAlign: 'center',
  },
  unit: {
    fontSize: 20,
    color: Colors.inner,
    textAlign: 'center',
  },
})
