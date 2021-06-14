import React,{useEffect,useState} from 'react'
import {View,Text} from 'react-native'
import Track from './component/tracking'
import Icon from 'react-native-vector-icons/FontAwesome'
import database from '@react-native-firebase/database'
const TripTrack = ({navigation, route}) => {
    const [details, setDetails] = useState()
    const [alert, setAlert] = useState(true)
    useEffect(() =>{
        if(route.params){
            setDetails(route.params)
        }

    },[route.params])

    useEffect(()=>{
        if(details){
            database().ref(`bookings/${details.id}/`).on("value",(snap,err)=>{
                if(snap.val()){
                    if(snap.val().status == 'END' && snap.val().payment_status =='WAITING'){
                        navigation.navigate('complete',{...details})
    
                    }
                }
            })
        }

    },[details])

    const renderHeader  = () => {
        return( 
            <View style={{ backgroundColor:'#243235',
            paddingVertical: 20,justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
                <Icon name={'arrow-left'} color={'white'} size={21}/>
                <Text style={{fontSize: 19, color:'white',fontWeight:'bold'}}>
                    Track Your Ride
                    
                </Text>
                <View></View>
            </View>
        )
    }
    return(
        <View style={{flex:1}}>
            {renderHeader()}
            {details ? <Track bId={details.id} alldata={details}/>: null}
        </View>
    )
}

export default TripTrack