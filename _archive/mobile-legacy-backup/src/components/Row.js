import { useEffect } from 'react';
import  {View, Text, StyleSheet, Animated, Platform,  Easing,} from 'react-native';
import Colors from '.././constants/Colors'


const RowAnimate = props  => {

    
    const {data, _active} = props;

    useEffect(() => {
        if (props._active !== nextProps._active) {
            Animated.timing(_active, {
              duration: 300,
              easing: Easing.bounce,
              toValue: Number(nextProps._active),
            }).start();
          }

    },[nextProps])

    return(
        <Animated.View style={[
            styles.animationStyle,
          ]}>
         
            <Text >{data.name}</Text>
          </Animated.View>
        
      
    
    )
  
};


const styles = StyleSheet.create({
    animationStyle : {
        ...Platform.select({
          ios: {
            transform: [{
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.1],
              }),
            }],
            shadowRadius: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 10],
            }),
          },
  
          android: {
            transform: [{
              scale: this._active.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.07],
              }),
            }],
            elevation: this._active.interpolate({
              inputRange: [0, 1],
              outputRange: [2, 6],
            }),
          },
        })
      }
    

});

export default RowAnimate;