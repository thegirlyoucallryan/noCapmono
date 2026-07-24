export const ADD_FAVORITE = 'ADD_FAVORITE';
export const SUBTRACT_FAVORITE =  'SUBTRACT_FAVORITE';
export const ADD_SETS = 'ADD_SETS';
export const MINUS_SETS = 'MINUS_SETS';
export const CLEAR = 'CLEAR'

export const AddFavorite = (id: any, name: any, gifUrl: any, equipment: any) => {
  


    return{
        type: ADD_FAVORITE, 
        exercise: { 
            id, 
            name,
            gifUrl,
            equipment
         }
    };
};

export const SubtractFavorite = (id, name, gifUrl, equipment) => {
  


    return{
        type: SUBTRACT_FAVORITE, 
        exercise: { 
            id, 
            name,
            gifUrl,
            equipment
         }
    };
};

export const AddSetAction = (id) => {
   return {type: ADD_SETS, payload:{
        id,
       }
    };

};
export const SubtractSetAction = (id) => {
    return {type: MINUS_SETS, payload:{
         id,
        }
     };
 
 };


 export const clearFavorites = () => {
    return{
        type: CLEAR, 

    }
 }
