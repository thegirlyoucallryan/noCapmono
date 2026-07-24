import { NavigationContainer } from "@react-navigation/native"
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import {Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator, WorkoutStack, WorkoutTabs } from "./src/navigation/WorkoutNavigator";
import { createStore , combineReducers, applyMiddleware} from 'redux';
import workOutReducer from "./src/store/Reducers";
import loginReducer from "./src/store/AuthStore/reducer";
import ReduxThunk from 'redux-thunk'
import { PaperProvider } from "react-native-paper";
import { PaperTheme } from "./src/constants/PaperTheme";
import { useFonts } from "expo-font"
import Colors from "./src/constants/Colors";


const rootReducer = combineReducers({
  favorites: workOutReducer,
  logIn: loginReducer
});
const store = createStore(rootReducer, applyMiddleware(ReduxThunk));

export default function App() {


       
    

const [loaded] = useFonts({
    Sonsie: require("./assets/SonsieOne-Regular.ttf"),
})

if (!loaded) {
    return null
}
  return (
    <Provider store={store}>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={PaperTheme}>
      <StatusBar backgroundColor={Colors.twentyThree} animated={true} />
      
      <NavigationContainer>
      <AppNavigator/>
      
      </NavigationContainer>
      </PaperProvider>
  </GestureHandlerRootView>
  </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    // padding: 40
  },
});
// ["./android-manifest.plugin", "custom"]