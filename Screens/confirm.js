import React,{useEffect} from 'react'
import { View ,Text} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
const ConfirmScreen = ({navigation}) => {
    useEffect(()=>{
        setTimeout(()=>{
            navigation.navigate('home')
        },2000)

    },[])
    return(
        <View style={{flex: 1,justifyContent:'center', alignItems:'center'}}>
            <View style={{height: 120, width: 120,borderRadius: 60, backgroundColor:'green',justifyContent:'center', alignItems:'center'}}>
            <Icon name={'check'} size={45} color={'white'}/>

            </View>
            <Text style={{fontSize: 34 }}>
                Payment SuccessFull
            </Text>
            
        </View>
        )
}

export default ConfirmScreen;