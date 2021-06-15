import React,{useEffect, useState, useRef} from 'react'
import {View,StyleSheet,Dimensions, TouchableOpacity,Text,Image} from 'react-native'
import Polyline from '@mapbox/polyline';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome'
import Modal from 'react-native-modal'
let WIDTH = Dimensions.get('window').width
let HEIGHT = Dimensions.get('window').height
const DistanceScreen = ({navigation, route}) =>{
    const [from, setFrom ] = useState()
    const [to, setTo] = useState()
    const [cords, setCords] = useState([])
    const [date, setDate] = useState(new Date());
    const [mode, setMode] = useState('date');
    const [show, setShow] = useState(false);
    const [car, setCar] = useState(false)
    const [distance, setDistance] = useState()
    const [duration, setDuration] = useState()
    const [country, setCountry] = useState('')
    const [warn, setWarn] = useState('')
    const [modal, setModal] = useState(false)
    const map = useRef()
    const carArray = [{image:'', name:'', price:'', persons:'', details:''}]

    const month = ['January', 'February',
     'March', 'April','May', 
     'June','July','August','September','October','November','December']

    const onChange = (event, selectedDate) => {
        //const currentDate = selectedDate || date;
        setShow(Platform.OS === 'ios');
        if (mode == 'date') {
            const currentDate =selectedDate || new Date();
            setDate(currentDate);
            setMode('time');
            setShow(Platform.OS !== 'ios'); // to show the picker again in time mode
          } else {
            const selectedTime = selectedDate || new Date();
            setDate(selectedTime);
            setShow(Platform.OS === 'ios');
            setMode('date');
          }
      };
    
      const showMode = (currentMode) => {
        setShow(true);
        setMode(currentMode);
        //setCar(true)
      };
    
      const showDatepicker = () => {
        showMode('date');
        //showTimepicker()
      };
    
      const showTimepicker = () => {
        showMode('time');
      };
      function getAddressFromCoordinates({latitude, longitude}) {
        return new Promise(resolve => {
          const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDwAYYq1Tn7jUJBVWMmyhv9UCOelRHMEFk`;
          fetch(url)
            .then(res => res.json())
            .then(resJson => {
              // the response had a deeply nested structure :/
              resJson.results[0].address_components.map(item=>{
                  if(item.types.includes('country')){
                      setCountry(item.long_name)
                  }
              })
              resolve(resJson.results[0].formatted_address);
            })
            .catch(e => {
              console.log('Error in getAddressFromCoordinates', e);
              resolve();
            });
        });
      }

    const getDirections = async(startLoc, dropLoc ) => {
        var resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${dropLoc}&key=AIzaSyDwAYYq1Tn7jUJBVWMmyhv9UCOelRHMEFk`)
        var respJson = await resp.json();
        console.log('res',respJson)
        setDistance(respJson.routes[0].legs[0].distance.value); setDuration(respJson.routes[0].legs[0].duration.value)
        var points = Polyline.decode(respJson.routes[0].overview_polyline.points);
        var coords = points.map((point) => {
            return {
                latitude: point[0],
                longitude: point[1]
            }
        })
        setCords(coords)

        map.current.fitToCoordinates([{ latitude: from ? from.latitude:0.00, longitude: from ? from.longitude:1.00 },{ latitude: to ? to.latitude:0.00, longitude: to ? to.longitude:1.00 }], {
            edgePadding: { top: 0, right: 0, bottom: -10, left: 0 },
            animated: true,
        })

    }

    useEffect(()=>{
        if(from  && to){
            getDirections('"' + from.latitude + ', ' + from.longitude + '"', '"' + to.latitude + ', ' + to.longitude + '"')
            getAddressFromCoordinates({latitude: from.latitude, longitude: from.longitude})
        }
        
    },[from, to])

    const warnModal = () => {
        return(
            <Modal isVisible={modal}>
                <View style={{height: 70, width:'100%',backgroundColor:'#fff',justifyContent:'center',alignItems:'center'}}> 
                <Text>
                    {warn}
                </Text>
                <TouchableOpacity onPress={()=> setModal(false)} style={{width: 40, height: 30, backgroundColor:'black',justifyContent:'center',alignItems:'center'}}>
                    <Text style={{color:'white'}}>
                        Ok
                    </Text>

                </TouchableOpacity>

                </View>

            </Modal>
        )
    }

    const optionModal = () => {
        return(
            !car ? <View style={styles.bottomBox}>
                <Text style={{fontSize: 23, color:'#666666',alignSelf:'center'}}>
                    {`${date.getDate()} - ${month[date.getMonth()]} - ${date.getFullYear()} at ${`${date.getHours()} : ${date.getMinutes()}`}`  }
                </Text>
            <TouchableOpacity 
            style={{
            width: Dimensions.get('window').width,
            shadowColor:'#000',
            shadowOffset:{height: 2, width: 2},
            flexDirection:'row',
            justifyContent:'space-around',
            borderWidth:0.1,
            height: 59,
            alignItems:'center',
            elevation:3,
            marginTop: 20
            }} onPress={showDatepicker}>

                <Text style={{fontSize: 16, fontWeight:'bold', color:'#2e342d'}}>
                    choose your date and time
                </Text>
                <View>
                    <Icon name={'calendar'} color={'black'} size={21}/>
                </View>
            </TouchableOpacity>
          <TouchableOpacity onPress={()=>
          {
              if(country == 'Turkey'){
                navigation.navigate('carSelect',{from: from, to: to, distance: distance, duration: duration,tripDate: date})
              }else{
                  setModal(true)
                  setWarn('We do not offer service in this location')
              }
            

          } 
         } style={{paddingHorizontal: 120, 
                paddingVertical: 10, 
                backgroundColor:'#243235', 
                marginTop:30, borderRadius: 20}}>
                <Text style={{fontSize:23, color: '#fff',fontWeight:"700"}}>
                    Proceed  
                </Text>
            </TouchableOpacity>
 
        </View>: 
        <View>
            {carArray.map(item=>{
                return(
                    <TouchableOpacity>
                        <View>
                            <Image source={{uri: item.image}} style={styles.image}/>
                            <Text>
                                {item.name}
                            </Text>
                        </View>
                        <View>
                            <Text>
                                Number of Persons
                            </Text>
                            <Text>
                                {item.persons}
                            </Text>
                            <Text>
                                {item.details}
                            </Text>
                        </View>
                        <View>
                            <Text>
                                {item.price}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )
            })}

        </View>

        )
        
    }

    useEffect(() =>{
        if(route.params?.to && route.params?.from){
            setFrom(route.params?.from)
            setTo(route.params?.to)
        }
    },[route.params?.to, route.params?.from])
    return(
        <View>
            <MapView provider={PROVIDER_GOOGLE} 
            ref={map}
            style={styles.mapStyle}
            onRegionChange={e=> console.log(e)}
            zoom={0.2}
            animated
            initialRegion={{
            
                latitude: from ? from.latitude : 22,
                longitude: to ? to.longitude : 88,
                "latitudeDelta": 0.0499598735255411,
                "longitudeDelta": 0.02829965204000473
            }}>
                <Marker coordinate={{latitude: from ? from.latitude: 1.00 , longitude: from ? from.longitude: 1.00}}
                title={from ?from.place: 'From'}/>
                <Marker 
                coordinate={{latitude: to ? to.latitude: 1.00 , longitude: to ? to.longitude: 1.00}}
                title={to ?to.place: 'To'}
                pinColor={'green'}/>

                       <MapView.Polyline
                            coordinates={cords}
                            strokeWidth={4}
                            strokeColor={'blue'}
                        />

              

            </MapView>
            {optionModal()}
            {warnModal()}
            
            {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      )}


        </View>
        )
}

const styles = StyleSheet.create({
    mapStyle:{
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width ,
    },
    bottomBox:{
        width: Dimensions.get('window').width,
        height: 240,
        backgroundColor: '#fff',
        position:'absolute',
        bottom: 0,
        alignItems:'center',
        shadowColor:'#000',
        shadowOffset:{height: 5, width: 5},
        elevation: 10,
        borderColor:'#0370bc',
        borderWidth:2,
        borderTopLeftRadius: 10, 
        borderTopRightRadius: 10
        

    }

})

export default DistanceScreen;