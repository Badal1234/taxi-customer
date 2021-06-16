import React,{useState,useEffect} from 'react'
import {View,StyleSheet,FlatList,Text,TouchableOpacity} from 'react-native'
import database from '@react-native-firebase/database'
import auth from '@react-native-firebase/auth'
import Icon from 'react-native-vector-icons/FontAwesome'
import Spinner from 'react-native-loading-spinner-overlay'
const RideList = ({navigation}) => {
    const [rides, setRide] = useState([])
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
                <View>
               <Icon name={'bars'} color={'#fff'} size={22} onPress={() => navigation.openDrawer()} />
                </View>
                <Text style={{fontSize: 25, fontWeight:'bold', fontStyle:'italic',alignSelf:"center",color:'white'}}>
                    RideList
                </Text>
                <View>

                </View>
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
            case 'START':
                return 'Ride has started'
            case 'ACCEPTED':
                return 'Driver accept your request'   
            case 'END':
                return 'Completed'
            case 'CANCELLED':
                return 'Cancelled'               
        }


    }

    const onClick = (state,item) => {
        switch (state) {
            case 'START':
                return navigation.navigate('track',{...item})
            case 'ACCEPTED':
                return navigation.navigate('driver',{...item})
            case  'END':
                return  {}
            case 'CANCELLED':
                return     
            default:
                return  navigation.navigate('driver',{...item})    

        }
    }

    const paymentStatus = (status) => {
        switch (status) {
            case 'WAITING':
                return 'unpaid'
            case 'PAID':
            return 'Paid'
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
                        {
                            item.payment_status  ?                         <Text style={{fontSize: 16, fontWeight:'bold',color: item.paymentStatus == 'WAITING'? 'red': 'green'}}>
                            {item.trip_cost ?item.trip_cost: null } ({paymentStatus(item.payment_status)})
                        </Text> : <View></View>

                        }

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
            <Spinner visible={!rides.length} textContent={'Loading'}/>
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
            paddingVertical: 20,
            justifyContent:'space-between',
            alignItems:'center',
            flexDirection:'row',
            padding: 20

    },
})

export default RideList;