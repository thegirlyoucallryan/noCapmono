import { View, Text, StyleSheet, Image } from 'react-native'
import Colors from '../constants/Colors'
import NeomorphicButton from './NeomorphicButton'
import { useNavigation } from '@react-navigation/native'
import fitness from '../assets/fitness.png'
import { NeomorphicView } from './NeomorphicView'

const Message = () => {
  const nav = useNavigation()
  return (
    <View style={styles.screen}>
      <NeomorphicView>
        <Text style={styles.messageHead}>No Workout Yet?</Text>
        <Image source={fitness} style={{ height: 180, width: 180 }} />
        <Text style={styles.messageHead}>Lets change that!</Text>
        <Text style={styles.message}>
          Head to the search tab and customize your own workout! Simply wield
          the power of the plus icon to seamlessly add exercises to your
          customized routine.
        </Text>
        <NeomorphicButton
          title="Go to Search screen"
          onPress={() => {
            nav.navigate('Home')
          }}
          extraButtonStyles={{ padding: 18, marginBottom: 20 }}
          extraTextStyles={{
            color: Colors.accent,
            fontWeight: 'bold',
            fontSize: 17,
          }}
        />
      </NeomorphicView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: 10,
    alignItems: 'center',
  },
  MessageBox: {
    backgroundColor: '#222',
    padding: 10,
    paddingBottom: 59,

    alignItems: 'center',
  },

  message: {
    color: 'whitesmoke',
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '400',
    padding: 12,
  },
  messageHead: {
    fontSize: 28,
    color: 'white',
    alignSelf: 'center',
    padding: 20,
    fontWeight: 'bold',
  },
  sadface: {
    color: '#333',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 5,
  },
})

export default Message
