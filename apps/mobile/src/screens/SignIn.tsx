import {
  ScrollView,
  Image,
  View,
  Text,
  Platform,
  Modal,
  Alert,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native'
import Colors from '../constants/Colors'
import SignInWithGoogle from '../components/SignInWithGoogle'
import logo from '../assets/icon.png'
import React, { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import { SignInWithApple } from '../components/SigninWApple'
import NeomorphicStyles from '../constants/NeomorphicStyles'
import { supabase } from '../../utils/supabase'
import RenderHtml, {
  HTMLContentModel,
  HTMLElementModel,
} from 'react-native-render-html'
import NeomorphicButton from '../components/NeomorphicButton'
import BouncyCheckbox from 'react-native-bouncy-checkbox'

export function SignIn() {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false)
  const [terms, setTerms] = useState<string | null>(null)

  useEffect(() => {
    const fetchTerms = async () => {
      let termsandconditions = await supabase
        .from('termsandconditions')
        .select('data')

      if (termsandconditions) {
        termsandconditions?.data?.map((i) => setTerms(i.data))
      }
    }

    fetchTerms()
  }, [])

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <View
          style={{
            alignSelf: 'center',
            ...NeomorphicStyles,
            borderRadius: 200,
            margin: 40,
          }}
        >
          <Image
            source={logo}
            style={{
              width: 250,
              height: 250,
            }}
          />
        </View>

        <View style={{ margin: 20 }}>
          <Text
            style={{
              color: 'white',
              fontFamily: 'Sonsie',
              textAlign: 'center',
              fontSize: 25,
              padding: 20,
            }}
          >
            Welcome
          </Text>
          <Text
            style={{
              color: 'white',
              fontSize: 18,
              textAlign: 'center',
              fontFamily: 'JosefinSans-Regular',
            }}
          >
            Unleash Your Fitness Potential: Craft Your Ideal Workout from 1300
            Options – Your Customized Fitness Journey Starts Here!
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
        <BouncyCheckbox
          size={23}
          fillColor={Colors.accent}
          unfillColor={Colors.search}
          text="Agree to the"
          iconStyle={{ borderColor: Colors.accent }}
          innerIconStyle={{ borderWidth: 2 }}
          textStyle={{ fontFamily: 'JosefinSans-Regular' }}
          onPress={(isChecked: boolean) => {
            setTermsAccepted(isChecked)
          }}
        />
        <Pressable
          onPress={() => {
            setModalVisible(true)
          }}
        >
          <Text
            style={{
              color: Colors.accent,
              fontSize: 17,
              textDecorationLine: 'underline',
              marginLeft: 3,
            }}
          >
            Terms & Conditions
          </Text>
        </Pressable>
      </View>

      {modalVisible && terms && (
        <TermsAnConditionsModal
          terms={terms}
          setModalVisible={setModalVisible}
          modalVisible={modalVisible}
        />
      )}

      {termsAccepted && (
        <View
          style={{
            alignItems: 'center',
            paddingBottom: 100,
          }}
        >
          {Platform.OS === 'android' && <SignInWithGoogle />}
          <SignInWithApple />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.twentyThree,
    padding: 20,
    justifyContent: 'space-between',
  },
})

export function TermsAnConditionsModal({
  modalVisible,
  setModalVisible,
  terms,
}: {
  modalVisible: boolean
  setModalVisible: (arg: boolean) => void
  terms?: string
}) {
  const { width } = useWindowDimensions()

  const customHTMLElementModels = {
    bdt: HTMLElementModel.fromCustomModel({
      tagName: 'bdt',
      mixedUAStyles: {
        display: 'flex',
        width: width,
        flexWrap: 'nowrap',
      },
      contentModel: HTMLContentModel.block,
    }),
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.')
        setModalVisible(!modalVisible)
      }}
    >
      <View style={{ padding: 12, backgroundColor: 'white', height: '100%' }}>
        <NeomorphicButton
          onPress={() => setModalVisible(false)}
          title="Close"
          icon={'close'}
          extraTextStyles={{ color: Colors.primary }}
          extraButtonStyles={{
            // width: '20%',
            alignItems: 'center',
            alignSelf: 'flex-end',
            paddingVertical: 4,
            backgroundColor: 'white',
          }}
        />
        <ScrollView style={{ flexGrow: 1 }}>
          <Text>Terms & Conditions</Text>

          <View style={{ height: '100%' }}>
            {terms && (
              <RenderHtml
                contentWidth={width}
                source={{ html: terms }}
                customHTMLElementModels={customHTMLElementModels}
              />
            )}
            {!terms && (
              <ActivityIndicator
                size={45}
                color={Colors.backGround}
                style={{ height: '100%' }}
              />
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}
