import { useRef, useState, PropsWithChildren, useEffect } from "react";
import { View, Animated, Dimensions, PanResponder } from "react-native";
import Colors from "../constants/Colors";
import { useNavigation } from "@react-navigation/native";
import { Exercise } from "../types/types";
import CountDown from "./CountDown";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;

const Slider = ({

  reset,
  data,
  renderNoMoreCards,
  renderCard
}: {
//   onSwipeRight: () => void;
//   onSwipeLeft: () => void;
  reset: boolean;
  data: Exercise[];
  renderNoMoreCards: ()=> React.JSX.Element;
  renderCard: (item: any)=> React.JSX.Element
}) => {


  const [index, setIndex] = useState(0);


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
               
                styles.cardStyle,
                // { position: "absolute" },
              ]}
            
            >
              {renderCard(item)}
            </Animated.View>
          );
        } else if (i > index) {
          return (
            <View
              key={`${item.id}  + ${Math.random()}`}
           
            >
                  
              {renderCard(item)}
             
            </View>
          );
        }
      })
      .reverse();
  };

  return(<>
  <View style={{height: '100%'}}>{renderCards()}</View>

  </> );
};

const styles = {
  cardStyle: {
    // backgroundColor: Colors.twentyThree,
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    zIndex: 1,
  },
};

export default Slider;
