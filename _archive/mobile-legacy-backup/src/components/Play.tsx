import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { WorkoutType } from "../types/types";
import NeomorphicStyles from "../constants/NeomorphicStyles";
import Colors from "../constants/Colors";

const Play = ({
  favorites,
  sets,
  type,
}: {
  favorites: any;
  sets: number;
  type: WorkoutType;
}) => {
  const nav = useNavigation();
  return (
    <View style={styles.screen}>
      <Text style={[styles.play, { fontSize: 18 }]}>Start your workout</Text>
    
      <TouchableOpacity
        style={{ ...NeomorphicStyles, paddingHorizontal: 38 }}
        onPress={() => {
          nav.navigate("Play", {
            favorites: favorites,
            sets: sets,
            type: type,
          });
        }}
      >
    
          <Ionicons style={{...styles.play, position: 'relative'}} size={36} name="play" />
      
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    alignSelf: "center",
    alignItems: "center",
    padding: 15,
   
  
  },

  play: {
    alignSelf: "center",
    color: "white",
    padding: 12,
    // position: 'relative',

  },
  shadow: {
   backgroundColor: 'rgba(152, 242, 231, .12)',
   borderRadius: 22,
   position: 'absolute',
   padding: 14,
    top: 0,
 
  right: 0

  },
});

export default Play;
