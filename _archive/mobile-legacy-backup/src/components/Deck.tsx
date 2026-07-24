import { useRef, useState, PropsWithChildren, useEffect } from "react";
import { View, Animated, Dimensions, PanResponder } from "react-native";
import Colors from "../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { Exercise } from "../types/types";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

const Deck = ({
  onSwipeRight,
  onSwipeLeft,
  reset,
  data,
  renderNoMoreCards,
  renderCard
}: {
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  reset: boolean;
  data: Exercise[];
  renderNoMoreCards: ()=> React.JSX.Element;
  renderCard: (item: any)=> React.JSX.Element
}) => {
  const nav = useNavigation();

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reset) {
      setIndex(0);
    }
  }, [reset]);

  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe("right");
        }
        if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe("left");
        } else if (gesture.dx < SWIPE_THRESHOLD) {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  const getCardStyle = () => {
    const rotate = pan.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: ["-2deg", "0deg", "2deg"],
    });
    return {
      transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
    };
  };

  const forceSwipe = (direction: string) => {
    const ex = direction === "right" ? SCREEN_WIDTH : -SCREEN_WIDTH;

    Animated.timing(pan, {
      toValue: { x: ex, y: 0 },
      duration: 260,
      useNativeDriver: false,
    }).start(() => {
      onSwipeComplete(direction);
    });
  };

  const onSwipeComplete = (direction: string) => {
 
    const item = data[index];
  
    direction === "right" ? onSwipeRight() : onSwipeLeft();
    setIndex((prevState) => prevState + 1);
    pan.setValue({ x: 0, y: 0 });
  };

  const renderCards = () => {
    if (index >= data.length) {
      return renderNoMoreCards();
    
    }
    return data
      .map((item: { id: any }, i: number) => {
        if (i < index) {
          return null;
        }
        if (i === index) {
          return (
            <Animated.View
              key={`${item.id}  + ${Math.random()}`}
              style={[
                getCardStyle(),
                styles.cardStyle,
                { position: "absolute" },
              ]}
              {...panResponder.panHandlers}
            >
              {renderCard(item)}
            </Animated.View>
          );
        } else if (i > index) {
          return (
            <Animated.View
              key={`${item.id}  + ${Math.random()}`}
              style={[
                styles.cardStyle,
                { position: "absolute" },
                { top: 6 * (i - index) },
              ]}
            >
              {renderCard(item)}
            </Animated.View>
          );
        }
      })
      .reverse();
  };

  return <View>{renderCards()}</View>;
};

const styles = {
  cardStyle: {
    backgroundColor: Colors.twentyThree,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    zIndex: 1,
  },
};

export default Deck;
