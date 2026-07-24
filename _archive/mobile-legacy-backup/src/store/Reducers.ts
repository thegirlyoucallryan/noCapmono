
import Exercise from "../models/exercises";
import { MINUS_SETS, ADD_FAVORITE, SUBTRACT_FAVORITE} from "./actions";
import { ADD_SETS, CLEAR } from './actions'

const initialState = {
    favoritedExercises: [],

}


const workOutReducer = (state = initialState, action ) => {
    switch (action.type){
        case ADD_FAVORITE:
          const existing = state.favoritedExercises.findIndex(fav => fav.id === action.exercise.id);
          if(existing < 0){
             const newExercise = new Exercise(action.exercise.id, action.exercise.name, action.exercise.gifUrl, action.exercise.equipment)
                  
                return {...state, favoritedExercises: state.favoritedExercises.concat(newExercise) 
                }
                
                }
        case SUBTRACT_FAVORITE:
                const existingIndex = state.favoritedExercises.findIndex(fav => fav.id === action.exercise.id);
                if(existingIndex >= 0){
                    const updatedFavorites = [...state.favoritedExercises]
                    updatedFavorites.splice(existingIndex, 1);
                    return{...state, favoritedExercises: updatedFavorites  }
                       
                }
        case ADD_SETS: 
               const index= state.favoritedExercises.findIndex(fav => fav.id === action.payload.id);
               let newFavorites = [...state.favoritedExercises];
                newFavorites[index].sets = newFavorites[index].sets + 1;
               
              
                
               
               
              return {
                  ...state,
                favoritedExercises: newFavorites
              }
        case MINUS_SETS:
            const indexForMinus= state.favoritedExercises.findIndex(fav => fav.id === action.payload.id);
            let newMinusFavorites = [...state.favoritedExercises];
             newMinusFavorites[indexForMinus].sets = newMinusFavorites[indexForMinus].sets - 1;
            
           
             
            
            
           return {
               ...state,
             favoritedExercises: newMinusFavorites
           }
        case CLEAR: 
           return {
             favoritedExercises: []
           }

                

    default:
        return state;
    }



    
};

export default workOutReducer;