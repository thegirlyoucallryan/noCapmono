import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import { supabase } from '../../utils/supabase'

import { ActivityIndicator } from 'react-native'
import NeomorphicStyles from '../constants/NeomorphicStyles'

function SignInWithGoogle() {
  GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    webClientId:
      '367662196638-9b1tk214mtjscshp14ljaljnaftfb5vs.apps.googleusercontent.com',
  })

  return (
    <GoogleSigninButton
      size={GoogleSigninButton.Size.Standard}
      // color={GoogleSigninButton.Color.Dark}
      style={{ padding: 0, margin: 0 }}
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices()
          const userInfo = await GoogleSignin.signIn()

          if (userInfo.idToken && userInfo.user !== null) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: userInfo.idToken,
            })

            if (error?.message === 'Bad ID token') {
              GoogleSignin.clearCachedAccessToken(userInfo.idToken).then(
                async () => {
                  const { idToken } = await GoogleSignin.getTokens()
                  supabase.auth.signInWithIdToken({
                    provider: 'google',
                    token: idToken,
                  })
                }
              )
            }
          } else {
            throw new Error('no ID token present!')
          }
        } catch (error: any) {
          if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            // user cancelled the login flow
          } else if (error.code === statusCodes.IN_PROGRESS) {
            ;<ActivityIndicator size={20} color={'white'} />
          } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
            // play services not available or outdated
          } else {
            // some other error happened
          }
        }
      }}
    />
  )
}

export default SignInWithGoogle
