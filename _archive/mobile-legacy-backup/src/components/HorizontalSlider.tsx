import { View, Text, StyleSheet, Animated, FlatList } from "react-native";
import Colors from "../constants/Colors";
import NeomorphicButton from "../components/NeomorphicButton";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useRef } from "react";

const HorizontalSlider = ({
  data,
  type,
}: {
  type: string;
  data: { id: string; keyName: string; equipment?: string; title?: string }[];
}) => {
  const nav = useNavigation();
  // const scrollX = useRef(new Animated.Value(0)).current;
  // const flatListRef = useRef<FlatList | null>(null);

  // useEffect(() => {
  //   const scrollAnimation = Animated.timing(scrollX, {
  //     toValue: 1,
  //     duration: 90000000,
  //     useNativeDriver: true,
  //     isInteraction: false,
  //   });

  //   Animated.loop(scrollAnimation).start();

  //   flatListRef.current?.scrollToOffset({
  //     offset: 100, // A sufficiently large offset to scroll to the end
  //     animated: false,
  //   });
  // }, [scrollX]);

  const renderList = (data: any) => {
    const param =
      type == "Equipment"
        ? { equipment: data.item.keyName }
        : { bodyPart: data.item.title };
    return (
      <NeomorphicButton
        title={data.item.equipment || data.item.keyName}
        onPress={() => {
          nav.navigate("Workouts", param);
        }}
        extraTextStyles={{
          fontSize: 15,
          color: Colors.accent,
          textAlign: "center",
          fontWeight: "bold",
        }}
        extraButtonStyles={{
          paddingVertical: 25,
          paddingHorizontal: 25,
          marginHorizontal: 5,
          marginBottom: 40,
          shadowColor: Colors.accent
        }}
      />
    );
  };

  return (
    <View>
      <Text style={styles.headline}>{`Search by ${type}`}</Text>

      <Animated.FlatList
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={2}
        horizontal
        keyExtractor={(item) => item.id}
        data={data}
        renderItem={renderList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headline: {
    color: "white",
    marginHorizontal: 15,
    marginBottom: 10,
    marginTop: 15,
    elevation: 19,
    fontSize: 17,
    fontWeight: "300",
   
  },
});

export default HorizontalSlider;
