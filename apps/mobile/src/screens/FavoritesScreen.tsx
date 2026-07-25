import React, { createRef } from "react";
import { connect } from "react-redux";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  PanResponder,
  Animated,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Colors from "../constants/Colors";
import Play from "../components/Play";
import Message from "../components/Message";
import {
  SubtractFavorite,
  clearFavorites,
  setWorkout,
  setSessionSettings,
  setExerciseTarget,
} from "../store/actions";
import { TargetWeightChip } from "../components/TargetWeightChip";
import SetSelector from "../components/SetsSelector";
import WorkoutTypeDropdown from "../components/WorkoutTypeDropdown";
import { Exercise, WorkoutType } from "../types/types";
import { Ionicons } from "@expo/vector-icons";
import { ToolTip } from "../components/ToolTip";
import { DISPLAY_FONT } from "../constants/Typography";
import { RaisedCard } from "../components/RaisedCard";
import { InsetButton } from "../components/InsetButton";
import { ExerciseGif } from "../components/ExerciseGif";
import { SmokyMountains } from "../components/SmokyMountains";
import { SaveWorkoutModal } from "../components/SaveWorkoutModal";
import { LoadSavedModal } from "../components/LoadSavedModal";
import {
  listSavedWorkouts,
  loadSavedWorkoutExercises,
  removeSavedWorkout,
  saveNamedWorkout} from "../../utils/workoutStore";
import type { SavedWorkout } from "../../utils/workoutApi";

const mapStateToProps = (state) => {
  return {
    favorites: state.favorites.favoritedExercises,
    loadedWorkoutName: state.favorites.loadedWorkoutName as string | null,
  };
};

const immutableMove = (arr: any[], from: number, to: number) => {
  return arr.reduce((prev, current, idx, self) => {
    if (from === to) {
      prev.push(current);
    }
    if (idx === from) {
      return prev;
    }
    if (from < to) {
      prev.push(current);
    }
    if (idx === to) {
      prev.push(self[from]);
    }
    if (from > to) {
      prev.push(current);
    }
    return prev;
  }, []);
};

class FavoritesScreen extends React.Component {
  state = {
    dragging: false,
    draggingIdx: -1,
    favorites: this.props.favorites,
    sets: 4,
    type: "Circuit",
    showToolTip: false,
    showSaveModal: false,
    showLoadModal: false,
    savedWorkouts: [] as SavedWorkout[]};

  point = new Animated.ValueXY();
  currentY = 0;
  scrollOffset = 0;
  flatlistTopOffset = 0;
  rowHeight = 0;
  currentIdx = -1;
  active = false;
  flatList = createRef();
  flatListHeight = 0;
  count = createRef(0);
  _panResponder: any;

  constructor(props) {
    super(props);

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
        this.currentIdx = this.yToIndex(gestureState.y0);
        this.currentY = gestureState.y0;
        Animated.event([{ y: this.point.y }], { useNativeDriver: false })({
          y: gestureState.y0 - this.rowHeight / 2});
        this.active = true;
        this.setState({ dragging: true, draggingIdx: this.currentIdx }, () => {
          this.animateList();
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        this.currentY = gestureState.moveY;
        Animated.event([{ y: this.point.y }], { useNativeDriver: false })({
          y: gestureState.moveY});
        // The most recent move distance is gestureState.move{X,Y}
        // The accumulated gesture distance since becoming responder is
        // gestureState.d{x,y}
      },
      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onPanResponderRelease: (evt, gestureState) => {
        // The user has released all touches while this view is the
        // responder. This typically means a gesture has succeeded
        this.reset();
      },
      onPanResponderTerminate: (evt, gestureState) => {
        // Another component has become the responder, so this gesture
        // should be cancelled
        this.reset();
      },
      onShouldBlockNativeResponder: (evt, gestureState) => {
        // Returns whether this component should block native components from becoming the JS
        // responder. Returns true by default. Is currently only supported on android.
        return true;
      }});
  }

  animateList = () => {
    if (!this.active) {
      return;
    }

    requestAnimationFrame(() => {
      // check if we are near the bottom or top
      if (this.currentY + 100 > this.flatListHeight) {
        this.flatList.current.scrollToOffset({
          offset: this.scrollOffset + 20,
          animated: false});
      } else if (this.currentY < 100) {
        this.flatList.current.scrollToOffset({
          offset: this.scrollOffset - 20,
          animated: false});
      }

      // check y value see if we need to reorder
      const newIdx = this.yToIndex(this.currentY);
      if (this.currentIdx !== newIdx) {
        this.setState({
          favorites: immutableMove(
            this.state.favorites,
            this.currentIdx,
            newIdx
          ),
          draggingIdx: newIdx});
        this.currentIdx = newIdx;
      }

      this.animateList();
    });
  };

  yToIndex = (y) => {
    const value = Math.floor(
      (this.scrollOffset + y - this.flatlistTopOffset) / this.rowHeight
    );

    if (value < 0) {
      return 0;
    }

    if (value > this.state.favorites.length - 1) {
      return this.state.favorites.length - 1;
    }

    return value;
  };

  //resets when user moves something in list
  reset = () => {
    this.active = false;
    this.setState({ dragging: false, draggingIdx: -1 }, () => {
      // Keep Redux queue in sync with drag order + targets for Play
      this.props.setWorkout(
        this.state.favorites,
        this.props.loadedWorkoutName
      );
    });
  };

  handleTargetSave = (
    exerciseId: string,
    targetWeight: number | null,
    targetReps: number | null
  ) => {
    const favorites = this.state.favorites.map((ex) =>
      ex.id === exerciseId ? { ...ex, targetWeight, targetReps } : ex
    );
    this.setState({ favorites });
    this.props.setExerciseTarget(exerciseId, targetWeight, targetReps);
  };

  // updating state so user can add more favorites to their list and have it rerender the flatlist
  componentDidUpdate(prevProps: { favorites: Exercise[] }) {
    if (this.props.favorites != prevProps.favorites) {
      // let a = prevProps.favorites;
      // let b = this.props.favorites;
      // const c = a.concat(b.filter((item) => a.indexOf(item) < 0))
      this.count.current = 0;
      return this.setState({
        favorites: this.props.favorites});
    }
  }

  handleSetSelect = (selectedSets: number): void => {
    this.setState({ sets: selectedSets });
    this.props.setSessionSettings(selectedSets, this.state.type);
  };

  handleWorkoutType = (type: WorkoutType): void => {
    this.setState({ type: type });
    this.props.setSessionSettings(this.state.sets, type as any);
  };

  componentDidMount() {
    this.refreshSaved();
  }

  refreshSaved = async () => {
    try {
      const savedWorkouts = await listSavedWorkouts();
      this.setState({ savedWorkouts });
    } catch (e) {
      console.warn(e);
    }
  };

  handleSaveWorkout = async (name: string) => {
    await saveNamedWorkout(name, this.state.favorites);
    await this.refreshSaved();
    this.props.setWorkout(this.state.favorites, name);
    Alert.alert("Saved", `"${name}" is ready to load anytime.`);
  };

  handleLoadWorkout = async (workout: SavedWorkout) => {
    const exercises = await loadSavedWorkoutExercises(workout.id);
    if (!exercises.length) {
      Alert.alert("Empty", "That workout has no exercises.");
      return;
    }
    this.props.setWorkout(exercises, workout.name);
    Alert.alert("Loaded", `"${workout.name}" is in My Workout.`);
  };

  handleDeleteSaved = (workout: SavedWorkout) => {
    Alert.alert("Delete saved workout", `Remove "${workout.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await removeSavedWorkout(workout.id);
          await this.refreshSaved();
        }},
    ]);
  };

  openLoadModal = async () => {
    await this.refreshSaved();
    this.setState({ showLoadModal: true });
  };

  render() {
    const { favorites, dragging, draggingIdx } = this.state;

    const renderItem = ({ item, index }, noPanResponder = false) => (
      <RaisedCard
        onLayout={(e) => {
          this.rowHeight = e.nativeEvent.layout.height;
        }}
        style={[
          styles.row,
          draggingIdx === index && styles.rowDragging,
        ]}
      >
        <View
          {...(noPanResponder ? {} : this._panResponder.panHandlers)}
          style={styles.dragHandle}
        >
          <Ionicons name="reorder-three" size={22} color={Colors.textMuted} />
        </View>

        <Text style={styles.index}>{index + 1}</Text>

        <ExerciseGif
          exerciseId={item.id}
          resolution={180}
          style={styles.thumb}
          glow={false}
        />

        <View style={styles.rowContent}>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate("Details", {
                id: item.id,
                name: item.name,
              });
            }}
          >
            <Text numberOfLines={1} style={styles.name}>
              {item.name}
            </Text>
            <Text numberOfLines={1} style={styles.equipment}>
              {item.equipment}
            </Text>
          </TouchableOpacity>
          <TargetWeightChip
            exerciseId={item.id}
            exerciseName={item.name}
            bodyPart={item.bodyPart}
            equipment={item.equipment}
            targetWeight={item.targetWeight}
            targetReps={item.targetReps}
            onSave={(w, r) => this.handleTargetSave(item.id, w, r)}
          />
        </View>

        <InsetButton
          size={36}
          onPress={() => {
            this.props.SubtractFavorite(
              item.id,
              item.name,
              item.gifUrl,
              item.equipment
            );
          }}
        >
          <Ionicons name="remove" size={20} color={Colors.accent4} />
        </InsetButton>
      </RaisedCard>
    );

    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.atmosphere} pointerEvents="none">
          <SmokyMountains intensity={0.32} />
        </View>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.header}>My Workout</Text>
            <Text style={styles.subheader}>
              {favorites.length
                ? `${favorites.length} exercise${favorites.length === 1 ? "" : "s"}`
                : "Browse exercises in Build to get started"}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={this.openLoadModal}
              style={[
                styles.loadHeaderBtn,
                !!this.props.loadedWorkoutName && styles.loadHeaderBtnActive,
              ]}
              hitSlop={6}
            >
              <Ionicons
                name="folder-open-outline"
                size={18}
                color={
                  this.props.loadedWorkoutName
                    ? Colors.glowCyan
                    : Colors.accent
                }
              />
              <Text
                style={[
                  styles.loadHeaderText,
                  !!this.props.loadedWorkoutName && styles.loadHeaderTextActive,
                ]}
                numberOfLines={1}
              >
                {this.props.loadedWorkoutName
                  ? this.props.loadedWorkoutName
                  : "Load"}
              </Text>
            </Pressable>
            {favorites.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{favorites.length}</Text>
              </View>
            )}
          </View>
        </View>

        {favorites.length ? (
          <>
            <RaisedCard style={styles.controlsCard}>
              <View style={styles.controlsRow}>
                <View style={styles.controlGroup}>
                  <Text style={styles.controlLabel}>Sets</Text>
                  <SetSelector
                    onSelect={this.handleSetSelect}
                    sets={4}
                    currentSet={this.state.sets}
                  />
                </View>

                <View style={styles.controlGroup}>
                  <View style={styles.modeHeader}>
                    <Text style={styles.controlLabel}>Mode</Text>
                    <Pressable
                      onPress={() =>
                        this.setState({ showToolTip: !this.state.showToolTip })
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name="information-circle-outline"
                        size={18}
                        color={Colors.textMuted}
                      />
                    </Pressable>
                  </View>
                  <WorkoutTypeDropdown
                    type={this.state.type}
                    setType={this.handleWorkoutType}
                  />
                </View>
              </View>

              <Text style={styles.modeHint}>
                {this.state.type === "Circuit"
                  ? "Circuit — rotate through all exercises each round"
                  : "Straight — finish all sets of each exercise before moving on"}
              </Text>
            </RaisedCard>

            <Text style={styles.reorderHint}>
              Hold ≡ to drag and reorder exercises
            </Text>

            {dragging && (
              <Animated.View
                style={[
                  styles.dragOverlay,
                  { top: this.point.getLayout().top },
                ]}
              >
                {renderItem({ item: favorites[draggingIdx], index: -1 }, true)}
              </Animated.View>
            )}

            {this.state.showToolTip && (
              <ToolTip close={() => this.setState({ showToolTip: false })} />
            )}

            <FlatList
              ref={this.flatList}
              scrollEnabled={!dragging}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              data={favorites}
              renderItem={renderItem}
              onScroll={(e) => {
                this.scrollOffset = e.nativeEvent.contentOffset.y;
              }}
              onLayout={(e) => {
                this.flatlistTopOffset = e.nativeEvent.layout.y;
                this.flatListHeight = e.nativeEvent.layout.height;
              }}
              scrollEventThrottle={16}
              keyExtractor={(item) => String(item.id)}
            />

            <View style={styles.actionStack}>
              <View style={styles.secondaryActions}>
                <Pressable
                  onPress={() => this.setState({ showSaveModal: true })}
                  style={({ pressed }) => [
                    styles.chipBtn,
                    styles.saveChip,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Ionicons name="bookmark" size={16} color={Colors.twentyThree} />
                  <Text style={styles.saveChipText}>Save</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Clear workout",
                      "Remove all exercises from your workout?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Clear all",
                          style: "destructive",
                          onPress: () => this.props.clearFavorites()},
                      ]
                    );
                  }}
                  style={({ pressed }) => [
                    styles.chipBtn,
                    styles.clearChip,
                    pressed && styles.chipPressed,
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={Colors.accent4}
                  />
                  <Text style={styles.clearChipText}>Clear</Text>
                </Pressable>
              </View>
              <Play
                favorites={this.state.favorites}
                sets={this.state.sets}
                type={this.state.type}
              />
            </View>
          </>
        ) : (
          <Message />
        )}

        <SaveWorkoutModal
          visible={this.state.showSaveModal}
          onClose={() => this.setState({ showSaveModal: false })}
          onSave={this.handleSaveWorkout}
        />
        <LoadSavedModal
          visible={this.state.showLoadModal}
          workouts={this.state.savedWorkouts}
          onClose={() => this.setState({ showLoadModal: false })}
          onLoad={this.handleLoadWorkout}
          onDelete={this.handleDeleteSaved}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.twentyThree},
  atmosphere: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 240},
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8},
  headerText: {
    flex: 1,
    minWidth: 0,
    marginRight: 12},
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8},
  loadHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(152, 242, 231, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(152, 242, 231, 0.25)",
    maxWidth: 140,
  },
  loadHeaderBtnActive: {
    backgroundColor: Colors.glowCyanDim,
    borderColor: "rgba(0, 212, 255, 0.35)",
  },
  loadHeaderText: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 1,
  },
  loadHeaderTextActive: {
    color: Colors.glowCyan,
  },
  header: {
    fontSize: 34,
    fontFamily: DISPLAY_FONT,
    color: Colors.accent,
    letterSpacing: 1.5},
  subheader: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 4},
  countBadge: {
    backgroundColor: Colors.accent4,
    borderRadius: 20,
    minWidth: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10},
  countText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16},
  controlsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14},
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"},
  controlGroup: {
    flex: 1},
  controlLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5},
  modeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4},
  modeHint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18},
  reorderHint: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
    marginHorizontal: 16},
  actionStack: {
    gap: 12,
    paddingTop: 4,
    paddingHorizontal: 20},
  secondaryActions: {
    flexDirection: "row",
    gap: 10},
  chipBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14},
  saveChip: {
    backgroundColor: Colors.accent},
  saveChipText: {
    color: Colors.twentyThree,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3},
  clearChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: "rgba(168, 97, 95, 0.45)"},
  clearChipText: {
    color: Colors.accent4,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3},
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }]},
  list: {
    flex: 1},
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8},
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 10,
    gap: 8},
  rowDragging: {
    opacity: 0},
  dragHandle: {
    padding: 4},
  dragOverlay: {
    position: "absolute",
    zIndex: 10,
    width: "100%",
    paddingHorizontal: 16},
  index: {
    color: Colors.textMuted,
    fontSize: 14,
    width: 18,
    textAlign: "center"},
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  rowContent: {
    flex: 1,
    minWidth: 0},
  name: {
    color: "#fff",
    textTransform: "capitalize",
    fontSize: 15,
    fontWeight: "500"},
  equipment: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    textTransform: "capitalize"}});

export default connect(mapStateToProps, {
  SubtractFavorite,
  clearFavorites,
  setWorkout,
  setSessionSettings,
  setExerciseTarget,
})(FavoritesScreen);
