import React,{useEffect,useState} from 'react'
import {View,StyleSheet,Text,TextInput,Alert, TouchableOpacity} from 'react-native'
import auth from '@react-native-firebase/auth'
import database from '@react-native-firebase/database'
import Icon from 'react-native-vector-icons/FontAwesome'
import Geolocation from '@react-native-community/geolocation';
import {request, PERMISSIONS} from 'react-native-permissions';
import Spinner from 'react-native-loading-spinner-overlay'
const ProfileScreen = ({navigation}) => {
    const [details, setDetails] = useState()

    useEffect(() =>{
        var user = auth().currentUser
        database().ref(`users/${user.uid}/`).once("value").then((snap)=>{
            setDetails(snap.val())
        })

    },[])
    //console.log(details.mobile)
    const renderHeader = () => {
        return(
            <View style={styles.header}>
                 <View>
               <Icon name={'bars'} color={'#fff'} size={22} onPress={() => navigation.openDrawer()} />
                </View>
                <Text style={{fontSize: 19, color:'white', fontWeight:'bold'}}>
                    Profile
                </Text>
                <View>

                </View>
             
            </View>
            )
    }

    const submit = () => {
        var user = auth().currentUser
        database().ref(`users/${user.uid}/`).update(details).then(()=>{
            Alert.alert('Profile Update Successfully')
        })
    }
    function getAddressFromCoordinates({ latitude, longitude }) {
        return new Promise((resolve) => {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDwAYYq1Tn7jUJBVWMmyhv9UCOelRHMEFk`
          fetch(url)
            .then(res => res.json())
            .then((resJson) => {
              // the response had a deeply nested structure :/
              console.log(resJson)
                resolve(resJson.results[0].formatted_address)
              
            })
            .catch((e) => {
              console.log('Error in getAddressFromCoordinates', e)
              resolve()
            })
        })
      }

    const setCurrentLocation = () => {
        request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION).then((res)=>{
            console.log(res)
            Geolocation.getCurrentPosition(async info=> {
                let location = info.coords 
                let place = await getAddressFromCoordinates({latitude: location.latitude, longitude: location.longitude})
                setDetails({...details, location:{latitude: location.latitude,longitude: location.longitude,place: place}})
                Alert.alert('Location has been updated')
            })

        })
        

    }
    const renderBody = () => {
        return(
            <View>
                <View>
                    <Text style={{fontSize: 17, fontWeight:'bold', paddingLeft: 20}}>
                        First Name
                    </Text>
                    <TextInput
                    placeholder={'First Name'} 
                    onChangeText={text=> {
                        setDetails({...details,firstName: text})
                    }}
                    value={details.firstName}
                    style={{borderBottomWidth: 0.7, width: '70%', marginLeft: 20, fontSize: 12,height: 40}}/>
                    
                </View>
                <View>
                    <Text style={{fontSize: 17, fontWeight:'bold', paddingLeft: 20}}>
                        Last Name
                    </Text>
                    <TextInput
                    placeholder={'Last Name'} 
                    onChangeText={text=> setDetails({...details,lastName: text})}
                    value={details.lastName}
                    style={{borderBottomWidth: 0.7, width: '70%', marginLeft: 20, fontSize: 12,height: 40}}/>
                    
                </View>
                <View>
                <View>
                    <Text style={{fontSize: 17, fontWeight:'bold', paddingLeft: 20}}>
                        Email
                    </Text>
                    <TextInput
                    placeholder={'Email'} 
                    onChangeText={text=> setDetails({...details,email: text})}
                    value={details.email}
                    style={{borderBottomWidth: 0.7, width: '70%', marginLeft: 20, fontSize: 12,height: 40}}/>
                    
                </View>
                </View>
                <View>
                <View>
                    <Text style={{fontSize: 17, fontWeight:'bold', paddingLeft: 20}}>
                        Number
                    </Text>
                    <TextInput
                    placeholder={'Number'} 
                    onChangeText={text=>setDetails({...details,mobile: text})}
                    value={details.mobile}
                    style={{borderBottomWidth: 0.7, width: '70%', marginLeft: 20, fontSize: 12,height: 40}}/>
                    
                </View>
                    
                </View>
                <View style={{flexDirection:'row', justifyContent:"space-between",alignItems:'center', paddingTop: 20}}>
                    <Text style={{fontSize: 14, fontWeight:'400', paddingLeft: 20}}>
                    {details.location?.place}
                    </Text>
                    <TouchableOpacity  onPress={setCurrentLocation}>
                    <Icon name={'edit'} color={'black'} size={19} />

                    </TouchableOpacity>
                    
                  
                </View>
            </View>)
    }

    const renderButton = () => {
        return(
            <TouchableOpacity style={styles.button} onPress={submit}>
                <Text style={{fontSize: 18, fontWeight:'bold', color:'white'}}>
                    save
                </Text>
            </TouchableOpacity>
        )
    }
    return (
        <View>
            <Spinner  visible={!details} textContent={'Loading'}/>
            {renderHeader()}
            {details ? renderBody(): null}
            {details ? renderButton() : null }


        </View>
        )
}

const styles = StyleSheet.create({
    header:{
        backgroundColor:'#243235',
            paddingVertical: 20,
            flexDirection:'row',
            justifyContent:'space-between',
            alignItems:'center',
            padding: 20

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

export default ProfileScreen;