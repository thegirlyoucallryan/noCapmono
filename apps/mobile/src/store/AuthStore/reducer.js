import { SIGNIN, SignInACtion } from "./actions"


const initialState = {
    isSignedIn: false,
}

const loginReducer = (state = initialState, action) => {
    switch(action.type){
        case SIGNIN:
             return{         
                isSignedIn: true
                }
            
        
        default: return state;
   
    
    }
 
};

export default loginReducer;