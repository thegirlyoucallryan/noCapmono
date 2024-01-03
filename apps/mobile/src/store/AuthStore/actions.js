 import axios from "axios";
 
// import firebase from "firebase/app";
// import "firebase/auth";



 export const SIGNUP = 'SIGNUP';
 export const SIGNIN = 'SIGNIN';

 
 export const SignUpAction = (phone) => {
     return async dispatch => {
        try{
            await axios.post('https://us-central1-one-time-password-d8d7a.cloudfunctions.net/createUser',{
                phone
            })
          await axios.post('https://us-central1-one-time-password-d8d7a.cloudfunctions.net/requestOneTimePass',{
                phone
            })
       
         }catch(error){console.log(error)};
         dispatch({type: SIGNUP, phone: phone})
        };

     };

     
export const SignInACtion = (phone, code) => {
    return async dispatch => {
        try{
            let {data}= await axios.post('https://us-central1-one-time-password-d8d7a.cloudfunctions.net/verifyPassword',{
                 phone,
                 code
             });
             
             firebase.auth().signInWithCustomToken(data.token)
                
          } catch (error){console.log(error)};
          dispatch({type: SIGNIN, payload: {  
              isSignedin: true,
                  
             
            
              
        }})

         }
     
    };





 