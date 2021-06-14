import React,{useEffect,useState} from 'react'
import {View,Text,Image,StyleSheet, TouchableOpacity} from 'react-native'
import auth from '@react-native-firebase/auth'
import database from '@react-native-firebase/database'
import StarRating from 'react-native-star-rating';
const TripComplete = ({navigation, route}) => {
    const [details, setDetails] = useState({})
    const [rating, setRating] = useState(details.driverRating)
    const week = ['Sun', 'Mon','Tue','Wed','Thu','Fri','Sat']
    const month = ['Jan','Feb','Mar','Apr','May','Jun','July','Aug','Sept','Oct','Nov','Dec']
    useEffect(()=>{
        if(route.params){
            setDetails(route.params)
        }

    },[route.params])
    const onStarRatingPress = (rating) => {
        setRating(rating)

    }

    const submitNow = () => {
        if(rating>0){
            database().ref('users/'+details.driver+'/ratings/details').push({
                user:auth().currentUser.uid,
                rate:rating,
            }).then((res)=>{
                let path = database().ref('users/'+details.driver+'/ratings/');
                    path.once('value',snapVal=>{
                      if(snapVal.val()){
                          // rating calculation
                          let ratings = snapVal.val().details;
                          var total = 0;
                          var count = 0;
                          for(let key in ratings){
                              count = count+1;
                              total = total + ratings[key].rate;
                          }
                         let fRating = total/count;
                         if(fRating){
                             //avarage Rating submission
                             database().ref('users/'+details.driver+'/ratings/').update({userrating:parseFloat(fRating).toFixed(1)}).then(()=>{
                                
                                //Rating for perticular booking 
                                database().ref('users/'+details.driver+'/my_bookings/'+details.id +'/').update({
                                    rating:rating,
                                }).then(()=>{
                             database().ref('users/'+auth().currentUser.uid+'/my_bookings/'+details.id +'/').update({
                                        skip:true,
                                        rating_queue:false
                                    })
                                    navigation.navigate('payment',{...details})
                                   // this.sendPushNotification(this.state.getDetails.driver,this.state.getDetails.bookingKey,'you got '+this.state.starCount+' start rating ')
                                });
                             })
                         }
                      }
                    }) 
            }) 
        }else{}
        
    }
    let date = new Date(details.tripdate)
    let time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    return (
        <View>
        <View style={styles.card}>
            <View style={{justifyContent:'center',alignItems:'center'}}>
                <Text style={{fontSize: 26, fontWeight:'bold',color:'#666666'}}>
                {`${week[date.getDay()]}  ${month[date.getMonth()+1]}  ${date.getDate()}  ${time}  ${date.getFullYear()}`}
                </Text>
            </View>
            <View style={{flexDirection:'row', alignItems:'center',justifyContent:'space-around'}}>
                <Text style={{fontSize: 60, fontWeight: 'bold'}}>
                ₺ {details.trip_cost}
                </Text>
            </View>
            <View>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between', marginTop: 20 }}>
                    <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor:'green'}}/>
                    <Text style={{fontSize: 19, color:"#9b9b9b", fontWeight:'700'}}>
                        {details.pickup?.place}
                    </Text>
                </View>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop: 20}}>
                <View style={{height: 10, width: 10, borderRadius: 5, backgroundColor:'red'}}/>
                    <Text style={{fontSize: 19, color:"#9b9b9b", fontWeight:'700'}}>
                        {details.drop?.place}
                    </Text>
                </View>
            </View>
            <View style={{flexDirection:'row',justifyContent:'space-between',marginTop: 30}}>
                <Image
                style={{height: 40, width: 40, borderRadius: 20}} 
                source={details.driver_image == "" ? require("../public/profilePic.png"): {uri: details.driver_img}}/>

                <Text style={{fontSize: 21, fontWeight:'700', }}>
                    {details.driver_name}
                </Text>
            </View>
            <View style={{marginTop: 30}}>
            <StarRating
        disabled={false}
        maxStars={5}
        rating={rating}
        selectedStar={(rating) => onStarRatingPress(rating)}
        starStyle={{color:"#fda33b"}}
      />

            </View>


        </View>
        <TouchableOpacity style={styles.button} onPress={submitNow}>
          <Text style={{fontSize: 17, fontWeight:'bold',color:'white'}}>
              Submit and Pay
          </Text>
      </TouchableOpacity>
        </View>
    )
}



const styles = StyleSheet.create({
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
    button:{
        justifyContent:'center',
        alignItems:"center",
        backgroundColor:'#243235',
        paddingVertical: 15,
        paddingHorizontal: 60,
        borderRadius: 15,
        marginTop: 15
    }
})
export default TripComplete;