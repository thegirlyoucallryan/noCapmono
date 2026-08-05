export const ADD_FAVORITE = "ADD_FAVORITE";
export const SUBTRACT_FAVORITE = "SUBTRACT_FAVORITE";
export const ADD_SETS = "ADD_SETS";
export const MINUS_SETS = "MINUS_SETS";
export const CLEAR = "CLEAR";
export const SET_WORKOUT = "SET_WORKOUT";
export const SET_SESSION_SETTINGS = "SET_SESSION_SETTINGS";
export const REQUEST_PLAY_START = "REQUEST_PLAY_START";
export const CLEAR_PLAY_START = "CLEAR_PLAY_START";
export const SET_EXERCISE_TARGET = "SET_EXERCISE_TARGET";

export const AddFavorite = (
  id: any,
  name: any,
  gifUrl: any,
  equipment: any,
  bodyPart?: string
) => {
  return {
    type: ADD_FAVORITE,
    exercise: {
      id,
      name,
      gifUrl,
      equipment,
      bodyPart,
    },
  };
};

export const SubtractFavorite = (id, name, gifUrl, equipment) => {
  return {
    type: SUBTRACT_FAVORITE,
    exercise: {
      id,
      name,
      gifUrl,
      equipment,
    },
  };
};

export const AddSetAction = (id) => {
  return {
    type: ADD_SETS,
    payload: {
      id,
    },
  };
};

export const SubtractSetAction = (id) => {
  return {
    type: MINUS_SETS,
    payload: {
      id,
    },
  };
};

export const clearFavorites = () => {
  return {
    type: CLEAR,
  };
};

/** Replace the whole My Workout queue (e.g. load a saved workout).
 *  Omit name/id to keep the currently loaded saved-workout identity.
 *  Pass null explicitly to clear. */
export const setWorkout = (
  exercises: {
    id: string;
    name: string;
    gifUrl?: string;
    equipment?: string;
    bodyPart?: string;
    targetWeight?: number | null;
    targetReps?: number | null;
  }[],
  workoutName?: string | null,
  workoutId?: string | null
) => {
  const action: {
    type: typeof SET_WORKOUT;
    exercises: typeof exercises;
    workoutName?: string | null;
    workoutId?: string | null;
  } = {
    type: SET_WORKOUT,
    exercises,
  };
  if (arguments.length >= 2) {
    action.workoutName =
      workoutName != null && String(workoutName).trim()
        ? String(workoutName).trim()
        : null;
  }
  if (arguments.length >= 3) {
    action.workoutId =
      workoutId != null && String(workoutId).trim()
        ? String(workoutId).trim()
        : null;
  }
  return action;
};

export const setSessionSettings = (sets: number, type: string) => ({
  type: SET_SESSION_SETTINGS,
  sets,
  workoutType: type,
});

/** Planned weight/reps for one exercise in the current My Workout queue */
export const setExerciseTarget = (
  exerciseId: string,
  targetWeight: number | null,
  targetReps: number | null
) => ({
  type: SET_EXERCISE_TARGET,
  exerciseId,
  targetWeight,
  targetReps,
});

/** Tell Play tab to kick off Get Ready */
export const requestPlayStart = () => ({ type: REQUEST_PLAY_START });
export const clearPlayStart = () => ({ type: CLEAR_PLAY_START });
