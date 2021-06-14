import React,{useState,useEffect} from 'react'
import {View,StyleSheet,FlatList,Text,TouchableOpacity} from 'react-native'
import database from '@react-native-firebase/database'
import auth from '@react-native-firebase/auth'
import { defineAnimation } from 'react-native-reanimated'
const RideList = ({navigation}) => {
    const [rides, setRide] = useState()
    const week = ['Sun', 'Mon','Tue','Wed','Thu','Fri','Sat']
    const month = ['Jan','Feb','Mar','Apr','May','Jun','July','Aug','Sept','Oct','Nov','Dec']
    useEffect(()=>{
        const user = auth().currentUser
        console.log(user.uid)
        database().ref(`/users/${user.uid}/my_bookings`).on("value",(snap) => {
            const data = []
            snap.forEach((val)=>{
                data.push({...val.val(),id: val.key})
            })
            setRide(data)
        })
    },[])
    console.log(rides)
    const renderHeader = ( ) => {
        return(
            <View style={styles.header}>
                <Text style={{fontSize: 25, fontWeight:'bold', fontStyle:'italic',alignSelf:"center",color:'white'}}>
                    RideList
                </Text>
            </View>
            )
    }

    const showState = (state) => {
        switch (state) {
            case 'NEW':
                return 'Driver Will Assign Soon'
            case 'ASSIGNED':
                return 'RUNNING'
            case 'COMPLETED':
                return 'Ride has completed' 
            case 'STARTED':
                return 'Ride has started'
            case 'ACCEPTED':
                return 'Driver accept your request'   
            case 'END':
                return 'Completed'           
        }


    }

    const onClick = (state,item) => {
        switch (state) {
            case 'STARTED':
                return navigation.navigate('track',{...item})
            case 'ACCEPTED':
                return navigation.navigate('driver',{...item})
            case  'END':
                return  navigation.navigate('complete',{...item})
            default:
                return  navigation.navigate('driver',{...item})    

        }
    }
    const renderBody = () => {
        const renderRide = (item) =>{
            console.log(item)
            let date = new Date(item.tripdate)
            let time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
            return(
                <TouchableOpacity onPress={()=>onClick(item.status,item) } style={styles.card}>
                    <View>
                        <Text style={{fontSize: 18, fontWeight:'bold'}}>
                            {`${week[date.getDay()]}  ${month[date.getMonth()+1]}  ${date.getDate()}  ${time}  ${date.getFullYear()}`}
                        </Text>
                    </View>
                    <View style={{flexDirection:"row",justifyContent:'center',alignItems:'center'}}>
                        <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: 'blue'}}></View>
                    <Text style={{fontSize: 14, fontWeight:'500', fontStyle:'italic'}}>
                        {item.pickup.place}
                    </Text>
                    </View>
                    <View style={{flexDirection:"row",justifyContent:'center',alignItems:'center'}}>
                        <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor: 'red'}}></View>
                    <Text style={{fontSize: 14, fontWeight:'500', fontStyle:'italic'}}>
                        {item.pickup.place}
                    </Text>
                    </View>
                    <Text>
                        {item.tripDate}
                    </Text>
                    <View style={{flexDirection:'row',justifyContent:'space-between', paddingLeft: 10}}>
                        <Text style={{fontSize: 16, fontWeight:'bold',color:'red'}}>
                            {item.trip_cost ?item.trip_cost: null } ({item.payment_status == 'WAITING' ? 'Unpaid': null})
                        </Text>
                        <Text style={{fontSize: 12, fontWeight:'bold'}}>
                            {showState(item.status)}
                        </Text>
                    </View>
                   
                </TouchableOpacity>
            )
        }
        return(
            <View style={{flex:1}}>
                <FlatList data={rides} renderItem={({item})=> renderRide(item)}/>
            </View>
        )
    }
     return( 
        <View style={{flex:1}}>
            {renderHeader()}
            {renderBody()}
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        marginBottom: 20
    },
    card:{
        paddingVertical: 30,
        backgroundColor:'#fff',
        margin: 10,
        shadowColor:'#000',
        shadowOffset:{height: 3, width: 3},
        elevation: 3,
        padding: 10,
        borderRadius: 20
    },
    header:{
        backgroundColor:'#243235',
            paddingVertical: 20,justifyContent:'center',alignItems:'center',flexDirection:'row'

    },
})

export default RideList;