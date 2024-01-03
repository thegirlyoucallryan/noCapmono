import { BaseToast, ErrorToast } from 'react-native-toast-message'
import Colors from './constants/Colors'
export const toastConfig = {
  congrats: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.primary,
        backgroundColor: Colors.backGround,
        fontFamily: 'Sonsie',
        zIndex: 55,
        height: 85,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,

        color: 'white',
      }}
      text1Style={{
        fontSize: 18,

        color: Colors.accent,
      }}
      text2Style={{
        fontSize: 24,
        color: Colors.primary,
      }}
      text2NumberOfLines={3}
    />
  ),
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: Colors.primary,
        backgroundColor: 'black',
        height: 185,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,
        color: 'white',
      }}
      text1Style={{
        fontSize: 18,
        color: Colors.primary,
      }}
      text2Style={{
        fontSize: 15,
        color: 'white',
      }}
      text2NumberOfLines={5}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: Colors.accent4,
        backgroundColor: 'black',
        fontFamily: 'Prata',
        height: 85,
        flex: 1,
      }}
      contentContainerStyle={{
        paddingHorizontal: 15,

        color: 'white',
      }}
      text1Style={{
        fontSize: 18,
        fontFamily: 'Sonsie',
        color: 'white',
      }}
      text2Style={{
        fontSize: 15,
        color: Colors.accent,
      }}
      text2NumberOfLines={4}
    />
  ),
}
