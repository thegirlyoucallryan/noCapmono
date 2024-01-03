
import  {View, TextInput, StyleSheet} from 'react-native';



const SetInput = props  => {


    return(
        <View>
        <TextInput 
              
                style={styles.textInput}
                keyboardType='numeric'
                onChange={props.onChangeText}
                value={props.value}
                type={props.type}
                id={props.id}
                name={props.name}
                maxLength={10} 
                placeholder={props.placeholder} 
                placeholderTextColor='white'
                //setting limit of input=
/>
        </View>
    )
  
};


const styles = StyleSheet.create({
    textInput: {
        color: '#999',
        padding: 6,
        backgroundColor: '#333',
        borderRadius: 5,
        textAlign: 'center'
        
    }

});

export default SetInput;