import React from "react";
import { View, Pressable, Text } from "react-native";
import Colors from "../constants/Colors";
import { Exercise } from "../types/types";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DISPLAY_FONT } from "../constants/Typography";



export function FinaleScreen({route}: any){
    // const favorites = route.params.favorites
    const nav = useNavigation()
    return(
        <View  style={{flex: 1, backgroundColor: Colors.twentyThree}}>
        <View
          style={{
            alignSelf: "center",
            margin: 25,
            borderRadius: 4,
            backgroundColor: Colors.accent,
          }}
        >
          <Text
            style={{
              color: Colors.twentyThree,
              padding: 24,
              fontFamily: DISPLAY_FONT,
              fontSize: 24,
              textAlign: "center",
            }}
          >
            Great Job! 🛠️ You got it done!
          </Text>
        </View>
        {/* <View>
          <Pressable style={{alignSelf: "center", flexDirection: 'row', alignItems: 'center'}} onPress={()=> nav.navigate('Play', {favorites: favorites}) }>
            <Ionicons size={30} name="play" color={Colors.accent} />
            <Text style={{ color: Colors.accent, textAlign: "center" }}>
              Restart workout
            </Text>
          </Pressable>
        </View> */}
      </View>
    )
}