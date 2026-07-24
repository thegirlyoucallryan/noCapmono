import { View, Text, StyleSheet } from "react-native";
import Colors from "../constants/Colors";

const FavoritesListLabelHeader = () => {
  return (
    <View style={styles.labelHeader}>
      <Text style={styles.labelText}>Reorder </Text>
      <Text style={styles.labelText}> Name </Text>
      <Text style={styles.labelText}>Equipment</Text>
      <Text style={styles.labelText}>Remove</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  labelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
   
    marginBottom: 10,
    paddingHorizontal: 18,
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  
  },
  labelText: {
    color: Colors.primary,
    margin: 3,
    fontSize: 12,
  },
});

export default FavoritesListLabelHeader;
