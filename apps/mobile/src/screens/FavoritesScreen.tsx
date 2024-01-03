import React, { createRef } from 'react'
import { connect } from 'react-redux'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  PanResponder,
  Animated,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native'
import Colors from '../constants/Colors'
import { faSquareMinus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import Play from '../components/Play'
import FavoritesListLabelHeader from '../components/FavoritesListLabelHeader'
import Message from '../components/Message'
import { AddSetAction, SubtractSetAction } from '../store/actions'
import { SubtractFavorite, clearFavorites } from '../store/actions'
import { ScrollView, TextInput } from 'react-native-gesture-handler'
import SetSelector from '../components/SetsSelector'
import WorkoutTypeDropdown from '../components/WorkoutTypeDropdown'
import { Exercise, WorkoutType } from '../types/types'
import { Ionicons } from '@expo/vector-icons'
import { ToolTip } from '../components/ToolTip'
import NeomorphicStyles from '../constants/NeomorphicStyles'
import NeomorphicButton from '../components/NeomorphicButton'

const mapStateToProps = (state) => {
  return {
    favorites: state.favorites.favoritedExercises,
  }
}

const immutableMove = (arr: any[], from: number, to: number) => {
  return arr.reduce((prev, current, idx, self) => {
    if (from === to) {
      prev.push(current)
    }
    if (idx === from) {
      return prev
    }
    if (from < to) {
      prev.push(current)
    }
    if (idx === to) {
      prev.push(self[from])
    }
    if (from > to) {
      prev.push(current)
    }
    return prev
  }, [])
}

class FavoritesScreen extends React.Component {
  state = {
    dragging: false,
    draggingIdx: -1,
    favorites: this.props.favorites,
    sets: 4,
    type: 'Circuit',
    showToolTip: false,
  }

  point = new Animated.ValueXY()
  currentY = 0
  scrollOffset = 0
  flatlistTopOffset = 0
  rowHeight = 0
  currentIdx = -1
  active = false
  flatList = createRef()
  flatListHeight = 0
  count = createRef(0)
  _panResponder: any

  constructor(props) {
    super(props)

    this._panResponder = PanResponder.create({
      // Ask to be the responder:
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (evt, gestureState) => {
        // The gesture has started. Show visual feedback so the user knows
        // what is happening!
        // gestureState.d{x,y} will be set to zero now
        this.currentIdx = this.yToIndex(gestureState.y0)
        this.currentY = gestureState.y0
        Animated.event([{ y: this.point.y }], { useNativeDriver: false })({
          y: gestureState.y0 - this.rowHeight / 2,
        })
        this.active = true
        this.setState({ dragging: true, draggingIdx: this.currentIdx }, () => {
          this.animateList()
        })
      },
      onPanResponderMove: (evt, gestureState) => {
        this.currentY = gestureState.moveY
        Animated.event([{ y: this.point.y }], { useNativeDriver: false })({
          y: gestureState.moveY,
        })
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        this.reset()
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        this.reset()
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true
      },
    })
  }

  animateList = () => {
    if (!this.active) {
      return
    }

    requestAnimationFrame(() => {
      // check if we are near the bottom or top
      if (this.currentY + 100 > this.flatListHeight) {
        this.flatList.current.scrollToOffset({
          offset: this.scrollOffset + 20,
          animated: false,
        })
      } else if (this.currentY < 100) {
        this.flatList.current.scrollToOffset({
          offset: this.scrollOffset - 20,
          animated: false,
        })
      }

      // check y value see if we need to reorder
      const newIdx = this.yToIndex(this.currentY)
      if (this.currentIdx !== newIdx) {
        this.setState({
          favorites: immutableMove(
            this.state.favorites,
            this.currentIdx,
            newIdx
          ),
          draggingIdx: newIdx,
        })
        this.currentIdx = newIdx
      }

      this.animateList()
    })
  }

  yToIndex = (y) => {
    const value = Math.floor(
      (this.scrollOffset + y - this.flatlistTopOffset) / this.rowHeight
    )

    if (value < 0) {
      return 0
    }

    if (value > this.state.favorites.length - 1) {
      return this.state.favorites.length - 1
    }

    return value
  }

  //resets when user moves something in list
  reset = () => {
    this.active = false
    this.setState({ dragging: false, draggingIdx: -1 })
  }

  // updating state so user can add more favorites to their list and have it rerender the flatlist
  componentDidUpdate(prevProps: { favorites: Exercise[] }) {
    if (this.props.favorites != prevProps.favorites) {
      // let a = prevProps.favorites;
      // let b = this.props.favorites;
      // const c = a.concat(b.filter((item) => a.indexOf(item) < 0))
      this.count.current = 0
      return this.setState({
        favorites: this.props.favorites,
      })
    }
  }

  handleSetSelect = (selectedSets: number): void => {
    this.setState({ sets: selectedSets })
  }

  handleWorkoutType = (type: WorkoutType): void => {
    this.setState({ type: type })
  }

  render() {
    const { favorites, dragging, draggingIdx } = this.state

    const renderItem = ({ item, index }, noPanResponder = false) => (
      <View
        onLayout={(e) => {
          this.rowHeight = e.nativeEvent.layout.height
        }}
        style={[
          {
            ...NeomorphicStyles,
            flex: 1,
            flexDirection: 'row',
            margin: 10,
            opacity: draggingIdx === index ? 0 : 1,
            justifyContent: 'space-between',
            paddingVertical: 2,
            paddingHorizontal: 15,
            // marginHorizontal: 5,
            marginBottom: 4,
          },
        ]}
      >
        <View style={{ flexDirection: 'row' }}>
          <View {...(noPanResponder ? {} : this._panResponder.panHandlers)}>
            <Text style={styles.icon}>&uarr;&darr;</Text>
          </View>
          <View style={{ margin: 10 }}>
            <TouchableOpacity
              onPress={() => {
                this.props.navigation.navigate('Details', {
                  id: item.id,
                  name: item.name,
                })
              }}
            >
              <Text numberOfLines={1} style={styles.name}>
                {item.name.length < 25
                  ? item.name.replace(
                      item.equipment,
                      item.equipment.slice(0, 1) + '-'
                    )
                  : item.name
                      .replace(item.equipment, item.equipment.slice(0, 1) + '-')
                      .slice(0, 25) + '...'}
              </Text>
            </TouchableOpacity>
            <Text numberOfLines={1} style={styles.equipment}>
              {item.equipment}
            </Text>
          </View>
        </View>
        <View style={{ alignSelf: 'center', margin: 12 }}>
          <Pressable
            onPress={() => {
              this.props.SubtractFavorite(
                item.id,
                item.name,
                item.gifUrl,
                item.equipment
              )
            }}
          >
            <FontAwesomeIcon
              size={25}
              style={styles.icon}
              icon={faSquareMinus}
            />
          </Pressable>
        </View>
      </View>
    )

    return (
      <SafeAreaView style={styles.screen}>
        <Text style={styles.header}>Organize Your Sets</Text>
        {favorites.length ? (
          <>
            <Text style={styles.directionHeader}>
              Hold arrows to drag and drop and organize by equipment.
            </Text>

            <View
              style={{
                justifyContent: 'space-between',
                flexDirection: 'row',
                width: '100%',
                alignItems: 'center',

                paddingHorizontal: 10,
                borderRadius: 6,
                marginBottom: 4,
              }}
            >
              <>
                <SetSelector
                  onSelect={this.handleSetSelect}
                  sets={4}
                  currentSet={this.state.sets}
                />
                <View style={{ flexDirection: 'row' }}>
                  <WorkoutTypeDropdown
                    type={this.state.type}
                    setType={this.handleWorkoutType}
                  />
                  <Pressable
                    onPress={() =>
                      this.setState({ showToolTip: !this.state.showToolTip })
                    }
                  >
                    <Ionicons
                      name="help-circle-outline"
                      size={21}
                      color={Colors.primary}
                    />
                  </Pressable>
                </View>
              </>
              <NeomorphicButton
                extraTextStyles={{ fontSize: 16 }}
                extraButtonStyles={{
                  padding: 7,
                  paddingVertical: 10,
                  backgroundColor: Colors.accent,
                  shadowColor: Colors.accent,
                }}
                title="Clear"
                onPress={() => {
                  Alert.alert(
                    'Clear All',
                    'Would you like to remove all exercises from the list?',
                    [
                      {
                        text: 'Cancel',
                        onPress: () => {},
                      },
                      {
                        text: 'Remove All',
                        onPress: () => {
                          this.props.clearFavorites()
                        },
                        style: 'cancel',
                      },
                    ]
                  )
                }}
              />
            </View>
            <FavoritesListLabelHeader />
            {dragging && (
              <Animated.View
                style={{
                  position: 'absolute',
                  backgroundColor: 'transparent',
                  zIndex: 2,
                  width: '100%',
                  top: this.point.getLayout().top,
                }}
              >
                {renderItem({ item: favorites[draggingIdx], index: -1 }, true)}
              </Animated.View>
            )}
            {this.state.showToolTip && (
              <ToolTip close={() => this.setState({ showToolTip: false })} />
            )}
            {/* <View style={{paddingHorizontal: 5}}> */}
            <FlatList
              ref={this.flatList}
              scrollEnabled={!dragging}
              style={{ width: '100%' }}
              data={favorites}
              ListEmptyComponent={<Message />}
              renderItem={renderItem}
              onScroll={(e) => {
                this.scrollOffset = e.nativeEvent.contentOffset.y
              }}
              onLayout={(e) => {
                this.flatlistTopOffset = e.nativeEvent.layout.y
                this.flatListHeight = e.nativeEvent.layout.height
              }}
              scrollEventThrottle={16}
              keyExtractor={(item) => '' + item.id}
            />
            {/* </View> */}

            <Play
              favorites={this.state.favorites}
              sets={this.state.sets}
              type={this.state.type}
            />
          </>
        ) : (
          <Message />
        )}
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 10,
    backgroundColor: Colors.twentyThree,
    width: '100%',
  },

  workoutItem: {
    borderRadius: 20,
  },
  name: {
    color: Colors.accent,
    textTransform: 'capitalize',
    fontSize: 17,
  },

  equipment: {
    color: Colors.accent3,
    fontWeight: '300',
  },

  icon: {
    color: Colors.accent,

    fontSize: 25,
    alignSelf: 'center',
    padding: 8,
    fontWeight: 'bold',
  },

  container: {
    alignItems: 'center',
    width: '100%',
    borderRadius: 5,
    backgroundColor: Colors.twentyThree,
    // padding: 10,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 8,
    backgroundColor: Colors.inner,
    borderColor: 'transparent',
    color: 'white',
  },

  touch: {
    alignSelf: 'center',
  },
  directionHeader: {
    color: 'white',
    fontWeight: '200',
    fontSize: 15,
    textAlign: 'left',
    paddingRight: 55,
    margin: 5,
  },
  header: {
    fontSize: 25,
    // fontWeight: '100',
    color: Colors.accent,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  quantityBtn: {
    color: 'white',
    fontSize: 18,
    padding: 4,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    margin: 3,
    backgroundColor: '#111',
    width: 25,
  },
  quantity: {
    flexDirection: 'row',
    marginHorizontal: 5,
  },
  quantitySpan: {
    color: 'white',
    fontSize: 16,
    padding: 5,
    textAlign: 'center',
    margin: 5,
    backgroundColor: '#111',
    borderRadius: 4,
  },
  separator: {
    backgroundColor: Colors.accent,
    position: 'absolute',
    zIndex: 30,
    marginTop: -6,
    width: '120%',
  },
  separatorText: {
    color: Colors.twentyThree,
    fontSize: 18,
    fontWeight: '800',
    marginHorizontal: 10,
    alignSelf: 'center',
    padding: 3,
  },

  clear: {
    color: 'red',
    fontSize: 14,
    // marginVertical: 5,
  },
})

export default connect(mapStateToProps, {
  SubtractFavorite,
  AddSetAction,
  SubtractSetAction,
  clearFavorites,
})(FavoritesScreen)

// modular does not work so Here i have to create ref to control what I call better ui flatlist
// setting sets per group so each group is even and so the ui is less cluttered

// renderSeparator = (e) => {
//   this.count.current += 1;
//   return this.count.current % 4 == 0 ? (
//     <View style={styles.separator}>
//       <Text style={styles.separatorText}>Next Group</Text>
//       <View style={styles.quantity}>
//         <Text style={styles.separatorText}>Sets</Text>
//         <TouchableOpacity
//           onPress={() => {
//             dispatch(AddSetAction());
//           }}
//         >
//           <Text style={styles.quantityBtn}>+</Text>
//         </TouchableOpacity>
//         <Text style={styles.quantitySpan}>4</Text>
//         <TouchableOpacity
//           onPress={() => {
//             dispatch(SubtractSetAction());
//           }}
//         >
//           <Text style={styles.quantityBtn}>-</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   ) : null;
// };
