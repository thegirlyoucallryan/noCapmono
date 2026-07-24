export const ADD_FAVORITE = "ADD_FAVORITE";
export const SUBTRACT_FAVORITE = "SUBTRACT_FAVORITE";
export const ADD_SETS = "ADD_SETS";
export const MINUS_SETS = "MINUS_SETS";
export const CLEAR = "CLEAR";
export const SET_WORKOUT = "SET_WORKOUT";
export const SET_SESSION_SETTINGS = "SET_SESSION_SETTINGS";
export const REQUEST_PLAY_START = "REQUEST_PLAY_START";
export const CLEAR_PLAY_START = "CLEAR_PLAY_START";

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

/** Replace the whole My Workout queue (e.g. load a saved workout) */
export const setWorkout = (
  exercises: {
    id: string;
    name: string;
    gifUrl?: string;
    equipment?: string;
    bodyPart?: string;
  }[],
  workoutName?: string | null
) => {
  return {
    type: SET_WORKOUT,
    exercises,
    workoutName: workoutName ?? null,
  };
};

export const setSessionSettings = (sets: number, type: string) => ({
  type: SET_SESSION_SETTINGS,
  sets,
  workoutType: type,
});

/** Tell Play tab to kick off Get Ready */
export const requestPlayStart = () => ({ type: REQUEST_PLAY_START });
export const clearPlayStart = () => ({ type: CLEAR_PLAY_START });
