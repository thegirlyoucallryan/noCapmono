import { useForm, Controller, SubmitHandler } from 'react-hook-form'
import {
  Button,
  PermissionsAndroid,
  Platform,
  TextInput,
  View,
} from 'react-native'
import Colors from '../constants/Colors'
import { Text } from 'react-native'
import NMPHInset from '../constants/NMPHInset'
import NeomorphicButton from '../components/NeomorphicButton'
import { useEffect, useState } from 'react'
import { PedometerScreen } from './Pedometer'
import { ScrollView } from 'react-native-gesture-handler'
import NeomorphicStyles from '../constants/NeomorphicStyles'
import { requestPermissionsAsync } from 'expo-av/build/Audio'
import { Pedometer } from 'expo-sensors'

interface FormData {
  height: string
  weight: string
}

export function CalculatorScreen() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking')
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(false)
  const [bmi, setBmi] = useState<number>(0)

  const checkAndRequestPedometerPermission = async () => {
    if (Platform.OS === 'android') {
      const isAvailable = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
        {
          title: 'Pedometer App Permission',
          message: 'This permissions is required for the pedometer function.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      )
      if (!isAvailable) {
        console.log('not avail')
        const { status } = await requestPermissionsAsync()
        console.log(status)
        setPermissionsGranted(status === 'granted')
      }

      if (isAvailable === PermissionsAndroid.RESULTS.GRANTED) {
        setPermissionsGranted(true)
      } else {
        alert('Permission denied')
        return
      }
    }
    if (Platform.OS === 'ios') {
      const { status } = await Pedometer.getPermissionsAsync()

      if (status !== 'granted') {
        const newStatus = await Pedometer.requestPermissionsAsync()
        if (newStatus.status === 'granted') {
          setPermissionsGranted(true)
        } else {
          setPermissionsGranted(false)
        }
      }
    }
  }
  useEffect(() => {
    checkAndRequestPedometerPermission()
  }, [])

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      height: '',
      weight: '',
    },
  })
  const onSubmit: SubmitHandler<FormData> = (data) => {
    const meters = parseInt(data.height) * 0.0254
    const metersSq = meters * meters
    const kgs = parseInt(data.weight) * 0.453592

    setBmi(kgs / metersSq)
  }

  let bmiCategory

  switch (true) {
    case bmi !== undefined && bmi < 18.5:
      bmiCategory = 'Underweight'
      break
    case bmi !== undefined && bmi >= 18.5 && bmi <= 24.9:
      bmiCategory = 'Normal weight'
      break
    case bmi !== undefined && bmi >= 25 && bmi <= 29.9:
      bmiCategory = 'Overweight'
      break
    case bmi !== undefined && bmi >= 30:
      bmiCategory = 'Obese'
      break
    default:
      bmiCategory = 'Invalid BMI'
      break
  }

  return (
    <View style={{ backgroundColor: Colors.twentyThree, flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          backgroundColor: Colors.twentyThree,
          padding: 10,
          marginBottom: 20,
          justifyContent: 'space-between',
          flexGrow: 1,
        }}
      >
        <View style={{ marginBottom: 15 }}>
          <Text
            style={{
              color: Colors.accent,
              fontSize: 25,
            }}
          >
            Steps
          </Text>

          <PedometerScreen />
        </View>

        <View>
          <Text style={{ color: Colors.accent, fontSize: 25 }}>
            BMI Calculator
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <View>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={{
                      ...NMPHInset,
                      color: Colors.accent,
                      textAlign: 'center',
                      margin: 10,
                    }}
                    keyboardType="numeric"
                    placeholder="weight(lbs)"
                    onChangeText={onChange}
                    placeholderTextColor={Colors.accent}
                    value={value.toString()}
                  />
                )}
                name="weight"
              />
              {errors.weight && (
                <Text
                  style={{
                    color: 'white',
                    fontSize: 13,
                    marginHorizontal: 12,
                  }}
                >
                  required
                </Text>
              )}

              <Controller
                control={control}
                rules={{
                  maxLength: 100,
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={{
                      ...NMPHInset,
                      color: Colors.accent,
                      textAlign: 'center',
                      margin: 10,
                    }}
                    keyboardType="numeric"
                    returnKeyType="done"
                    placeholder="height(inches)"
                    onChangeText={onChange}
                    placeholderTextColor={Colors.accent}
                    value={value.toString()}
                  />
                )}
                name="height"
              />
              {errors.height && (
                <Text
                  style={{
                    color: 'white',
                    fontSize: 13,
                    marginHorizontal: 12,
                  }}
                >
                  required
                </Text>
              )}
              <NeomorphicButton
                title="Submit"
                onPress={handleSubmit(onSubmit)}
                extraButtonStyles={{
                  margin: 10,
                  padding: 10,
                  backgroundColor: Colors.accent,
                }}
                extraTextStyles={{ fontWeight: 'bold' }}
              />
            </View>
            <View>
              {bmi > 0 && (
                <View
                  style={{
                    ...NeomorphicStyles,
                    backgroundColor: Colors.accent,
                    padding: 5,
                    maxWidth: '75%',
                    shadowColor: Colors.accent,
                    alignSelf: 'center',
                    marginVertical: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      textAlign: 'center',
                    }}
                  >{`BMI Category: ${bmiCategory} ${Math.floor(bmi)}`}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
