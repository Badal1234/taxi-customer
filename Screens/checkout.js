import React,{useEffect,useState} from 'react'
import {View,Image,Text,TouchableOpacity,StyleSheet,FlatList,Dimensions} from 'react-native'
import database from '@react-native-firebase/database';
import Icon from 'react-native-vector-icons/FontAwesome5'
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import Modal from 'react-native-modal'

const WIDTH = Dimensions.get('window').width
const CheckoutScreen = ({navigation, route}) => {
    const [details, setDetails] = useState({})
    const [coupon, setCoupon] = useState([])
    const [services, setServices] = useState([])
    const [indexes, setIndex] = useState([])
    const [discount, setDiscount] = useState(0)
    const [user, setUser] = useState(null)
    const [key, setkey] = useState()
    const [booking_id, setBooking] = useState(uuid.v4())
    const [visible, setVisible] = useState(false)
    useEffect(() =>{
        if(route.params){
            setDetails(route.params)
        }
    },[route.params])
    console.log('details',details.passengers)

    useEffect(() =>{
        database().ref('offers').once("value").then((snap)=>{
            var data = []
            snap.forEach(i=> data.push({key: i.key, ...i.val()}))
            setCoupon(data)
        })
        
    },[])
    function onAuthStateChanged(user) {
        console.log(user)
        setUser(user);
        
      }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
      }, [user]);
    const totalCalculate = () => {
        return details.grandTotal - discount

    }
    const calculateDiscount = (item) => {
        setkey(item.key)
        if(item.promo_discount_type == 'flat') setDiscount(item.promo_discount_value.toFixed(2))
        else setDiscount(item.grandTotal - (item.grandTotal) * (item.promo_discount_value/100).toFixed(2))
        
    }
    useEffect(() =>{
        database().ref('additional_service').once("value").then(snap=>{
            var data = []
            snap.forEach(i=> data.push({key: i.key, ...i.val()}))
            setServices(data)
        })

    },[])

    const submit = async() => {
        const jsonValue = JSON.stringify(details)
        await AsyncStorage.setItem('rideDetails', jsonValue)
        navigation.navigate('Login')

    }
    const generateOTP = (length) => {
        const digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < length; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
      };
    const confirm = () => {
        var user = auth().currentUser
        database().ref(`bookings/${booking_id}`).set({
            carImage: details.image,
            carType: details.name,
            customer: user.uid,
            customer_name:'',
            distance:details.distance,
            driver:'',
            driver_image:'',
            driver_name:'',
            drop: details.to,
            estimate: details.grandTotal,
            estimateDistance: details.distance,
            otp: generateOTP(4),
            pickup: details.from,
            serviceType:'pickup',
            status:'NEW',
            total_trip_time:0,
            trip_cost: 0,
            trip_end_time:'00.00',
            trip_start_time:'00.00',
            tripdate: new Date(details.tripDate).toISOString(),
            passengers: details.passengers
        })
        database().ref(`users/${user.uid}/my_bookings/${booking_id}`).set({
            carImage: details.image,
            carType: details.name,
            customer: user.uid,
            customer_name:'',
            distance:details.distance,
            driver:'',
            driver_image:'',
            driver_name:'',
            drop: details.to,
            estimate: details.grandTotal,
            estimateDistance: details.distance,
            otp: generateOTP(4),
            pickup: details.from,
            serviceType:'pickup',
            status:'NEW',
            total_trip_time:0,
            trip_cost: 0,
            trip_end_time:'00.00',
            trip_start_time:'00.00',
            tripdate: new Date(details.tripDate).toISOString(),
            passengers: details.passengers
        })
        setVisible(true)
    }
    console.log(coupon)

    const renderCar = () =>{
        return (
            <View>
                <View style={{flexDirection:'row', justifyContent:'space-around'}}>
                    <Image style={{height: 60, width: 100}} source={{uri: details.image}}/>
                    <Text style={{fontSize: 17, fontWeight:'bold'}}>
                        {details.name}
                    </Text>
                </View>

            </View>
        )
    }

    const renderModal = () => {
        return(
            <Modal isVisible={visible} style={{flex: 1,justifyContent:"center",alignItems:'center'}}>
                <View style={styles.modal}>
                    <Text style={{fontSize: 16, fontWeight:'700' }}>
                        Your booking is reserved. Wait till your booking is confirm
                    </Text>
                    <View style={{justifyContent:'center',alignItems:'center'}}>

                    <TouchableOpacity style={{padding: 5, backgroundColor:'black'}} onPress={()=>{
                        setVisible(false)
                        navigation.navigate('home')
                    }}>
                    <Text style={{fontSize: 16, fontWeight:'900',color:'white'}}>
                        OK
                    </Text>
                </TouchableOpacity>

                    </View>

                </View>

            </Modal>
        )
    }
    const removeFromArray = (key) => {
        const arr = [...indexes]
        setIndex(arr.filter(i=> i != key ))
    }
    const renderRow = (item) => {
        //console.log(item)
        return(
            <View style={{flexDirection:'row', justifyContent:'space-between',marginTop: 20}}>
                <View style={{justifyContent:"center", alignItems:"center"}}>
                <TouchableOpacity onPress={()=> {indexes.includes(item.key)?removeFromArray(item.key): setIndex([...indexes, item.key])}} style={{
                     height: 20,
                     width: 20, borderRadius: 10, 
                     backgroundColor: indexes.includes(item.key) ? 'black':'white',
                     borderWidth: 0.5, 
                     borderColor: 'black',marginLeft: 20}}>

                </TouchableOpacity>
                </View>
                <Text style={{fontSize: 16,fontStyle:'italic',fontWeight:'600',letterSpacing: 1 }}>
                    {item.name}
                </Text>
                <Text style={{fontSize: 17, fontWeight:'bold', color:'#32db64', marginRight: 20}}>
                    {item.price}
                </Text>
                 
            </View>
        )
    }

    const renderServices = () =>{
        return(
            <View style={styles.card}>
                <Text style={{
                    fontSize: 17, 
                    fontWeight:'bold', 
                    letterSpacing: 1, marginLeft: 20, color:'black'}}>Additional Services</Text>
                <View>
                    <FlatList data={services} renderItem={({item})=>renderRow(item)}/>
                </View>
            </View>
        )
    }

    const renderCoupon = () => {
        const renderItem = (item) => {
            return(
                <TouchableOpacity style={styles.coupon} onPress={()=> calculateDiscount(item)}>
                    <View>
                    <Text style={{fontSize: 15, fontWeight:'bold'}}>
                         {item.promo_name}
                     </Text>
            
                     <Text style={{fontSize: 12}}>
                        {item.promo_description}
                     </Text>
                        
                    </View>
                    <View>
                        <Text style={{fontSize: 17, fontWeight:'bold', color:'red',paddingRight: 20}}>
                           - ₺{item.promo_discount_value}
                        </Text>
                        <Text style={{fontSize: 11, color:'orange', fontWeight:"700"}}>
                            {key == item.key ? 'Applied' : null}
                        </Text>
                         
                    </View>

                </TouchableOpacity>
                )
        }
        return(
            <View style={styles.card}>
                <Text style={{fontSize: 19, fontWeight:'bold', marginLeft: 20, fontStyle:'italic'}}>
                    Discounts 
                </Text>
                <FlatList data={coupon} keyExtractor={(item)=> item.key} renderItem={({item})=> renderItem(item)}/>

            </View>
        )
    }
    const renderPrice = () => {
        return (
            <View style={styles.price}>
                <View>
                    <Text>

                    </Text>
                    <Text>

                    </Text>
                <Text style={{fontSize: 16, color:'black',fontWeight:"700"}}>
                    Grand Total
                </Text>

                </View>

                <View style={{paddingRight: 20}}>
                    <Text style={{fontSize: 16,fontWeight:"bold",color:'black'}}>
                        {details.grandTotal ? details.grandTotal.toFixed(2) : details.grandTotal}
                    </Text>
                    <Text style={{fontSize: 16, color:'red',fontWeight:"bold"}}>
                       - ₺ {discount}
                    </Text>
                    <Text style={{fontSize: 16, color:'green',fontWeight:"bold"}}>
                    ₺ {details.grandTotal ? (details.grandTotal.toFixed(2) - discount).toFixed(2) : details.grandTotal-discount}
                    </Text>
                </View>
            </View>
        )
    }

    const renderButton = () => {
        return(
            <TouchableOpacity onPress={user ? ()=> confirm() : ()=> submit()} style={styles.button}>
                <Text style={{fontSize: 19, fontWeight:"bold", color:'white'}}>
                   { user ? 'Confirm Ride' : 'Proceed to Login'}
                </Text>
            </TouchableOpacity>
        )
    }
    return(
        <View style={styles.card}>
            {renderCar()}
            {renderServices()}
            {renderCoupon()}
            {renderPrice()}   
            {renderButton()}
            {renderModal()}
        </View>
        )
}

const styles = StyleSheet.create({
    card:{
        paddingVertical: 10,
        backgroundColor:'#fff',
        margin: 2,
        shadowColor:'#000',
        shadowOffset:{height: 3, width: 3},
        elevation: 3,
        borderRadius: 10
    },
    coupon:{
        paddingVertical: 10,
        backgroundColor:'#fff',
        margin: 2,
        shadowColor:'#000',
        shadowOffset:{height: 3, width: 3},
        elevation: 3,
        borderRadius: 10,
        paddingLeft: 20,
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'

    },
    price:{
        paddingVertical: 10,
        backgroundColor:'#fff',
        margin: 2,
        shadowColor:'#000',
        shadowOffset:{height: 3, width: 3},
        elevation: 3,
        borderRadius: 10,
        paddingLeft: 20,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    button:{
      paddingVertical: 10,
    paddingHorizontal: 40,
      backgroundColor:'#243235',
      borderRadius: 40,
      width: 230,
      justifyContent:'center',
      alignItems:'center',
      alignSelf:'center',
      marginTop: 40

    },
    modal:{
        height: 90,
        width: WIDTH - 50 ,
        backgroundColor:'#eee',
        padding: 10

    }
})

export default CheckoutScreen;