import React,{useEffect,useState} from 'react'
import { View,Image,FlatList,StyleSheet,Text,TouchableOpacity,ActivityIndicator } from 'react-native'
import database from '@react-native-firebase/database';
import {farehelper} from './component/fareCalculator'
import Modal from 'react-native-modal'
import Spinner from 'react-native-loading-spinner-overlay';
const CarSelect = ({navigation, route}) => {
    const [carData, setCar] = useState([])
    const [rideDetails, setRide] = useState({})
    const data = [{name:'', image:'', details:'',
     maxPassenger:'',basePrice:'',
     rateDetails:{rate_per_hour:'', rate_per_km:'',min_fare:'',convenience_fees:''}}]

     useEffect(()=>{
         if(route.params?.from && route.params?.distance){
             setRide({from:route.params?.from, to: route.params?.to, distance: route.params?.distance, duration: route.params?.duration,tripDate:route.params?.tripDate  })
         }

     },[])

     useEffect(()=>{
          database().ref('/rates/car_type')
          .once("value")
          .then((snap)=>{
             setCar(snap.val())
          })

     },[])

    const renderCarDetails = (item) => {
        console.log(item)
        var fare = farehelper(rideDetails.distance, rideDetails.duration, ...carData)
        return(
            <TouchableOpacity onPress={()=> navigation.navigate('info',{...item, ...rideDetails, ...fare})} style={styles.card}>
                <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                    <Image source={{uri: item.image}} style={styles.image}/>
                    <Text style={{fontSize: 17, fontWeight:'bold', fontStyle:'italic'}}>
                        {item.name}
                    </Text>
                    <Text style={{fontSize: 19, fontWeight:'bold', color:'green', fontStyle: 'italic '}}>
                        ₺ {fare.grandTotal.toFixed(2)}
                        </Text>
                </View>
                <View style={{justifyContent:'center', paddingLeft: 20}}>
                    <Text style={{fontSize: 12, fontWeight:'800',letterSpacing: 1,fontStyle:'italic'}}>
                        {item.description}
                    </Text>
                    </View>

            </TouchableOpacity>
            )
    } 
    if(carData.length == 0){
        return(
            <Modal style={{flex:1, justifyContent:'center', alignItems:"center"}}>
                <View style={{height: 40, width: 210, backgroundColor:'#eee'}}>
                    <ActivityIndicator animating/>
                </View>

            </Modal>
            )
    }
    console.log('length',carData.length)
    return(

        <View style={{flex: 1}}>
            <Spinner
          visible={carData.length == 0}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
            
           <FlatList data={carData}   renderItem={({item})=> renderCarDetails(item)}/>
        </View>
        )
}

const styles = StyleSheet.create({
    image:{
        height: 70,
        width: 120,

    },
    card:{
        paddingVertical: 30,
        backgroundColor:'#fff',
        margin: 10,
        shadowColor:'#000',
        shadowOffset:{height: 3, width: 3},
        elevation: 3


    }
})
export default CarSelect;