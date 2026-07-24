import Exercise from "../models/exercises";
import {
  MINUS_SETS,
  ADD_FAVORITE,
  SUBTRACT_FAVORITE,
  SET_WORKOUT,
  ADD_SETS,
  CLEAR,
  SET_SESSION_SETTINGS,
  REQUEST_PLAY_START,
  CLEAR_PLAY_START,
} from "./actions";

const initialState = {
  favoritedExercises: [] as Exercise[],
  sets: 4,
  workoutType: "Circuit" as string,
  pendingPlayStart: false,
  loadedWorkoutName: null as string | null,
};

const workOutReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_FAVORITE: {
      const existing = state.favoritedExercises.findIndex(
        (fav) => fav.id === action.exercise.id
      );
      if (existing < 0) {
        const newExercise = new Exercise(
          action.exercise.id,
          action.exercise.name,
          action.exercise.gifUrl,
          action.exercise.equipment,
          action.exercise.bodyPart
        );
        return {
          ...state,
          favoritedExercises: state.favoritedExercises.concat(newExercise),
        };
      }
      return state;
    }
    case SUBTRACT_FAVORITE: {
      const existingIndex = state.favoritedExercises.findIndex(
        (fav) => fav.id === action.exercise.id
      );
      if (existingIndex >= 0) {
        const updatedFavorites = [...state.favoritedExercises];
        updatedFavorites.splice(existingIndex, 1);
        return { ...state, favoritedExercises: updatedFavorites };
      }
      return state;
    }
    case SET_WORKOUT: {
      const list = (action.exercises || []).map(
        (ex: any) =>
          new Exercise(
            ex.id,
            ex.name,
            ex.gifUrl || "",
            ex.equipment || "",
            ex.bodyPart || ""
          )
      );
      return {
        ...state,
        favoritedExercises: list,
        loadedWorkoutName:
          action.workoutName != null && String(action.workoutName).trim()
            ? String(action.workoutName).trim()
            : null,
      };
    }
    case SET_SESSION_SETTINGS:
      return {
        ...state,
        sets: action.sets ?? state.sets,
        workoutType: action.workoutType ?? state.workoutType,
      };
    case REQUEST_PLAY_START:
      return { ...state, pendingPlayStart: true };
    case CLEAR_PLAY_START:
      return { ...state, pendingPlayStart: false };
    case ADD_SETS: {
      const index = state.favoritedExercises.findIndex(
        (fav) => fav.id === action.payload.id
      );
      const newFavorites = [...state.favoritedExercises];
      newFavorites[index].sets = newFavorites[index].sets + 1;
      return {
        ...state,
        favoritedExercises: newFavorites,
      };
    }
    case MINUS_SETS: {
      const indexForMinus = state.favoritedExercises.findIndex(
        (fav) => fav.id === action.payload.id
      );
      const newMinusFavorites = [...state.favoritedExercises];
      newMinusFavorites[indexForMinus].sets =
        newMinusFavorites[indexForMinus].sets - 1;
      return {
        ...state,
        favoritedExercises: newMinusFavorites,
      };
    }
    case CLEAR:
      return {
        ...state,
        favoritedExercises: [],
        loadedWorkoutName: null,
      };

    default:
      return state;
  }
};

export default workOutReducer;
