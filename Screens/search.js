import React,{useEffect,useState} from 'react'
import {TextInput, View, StyleSheet, Dimensions,TouchableOpacity,Platform,StatusBar} from 'react-native'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/FontAwesome'
navigator.geolocation = require('@react-native-community/geolocation');
const SearchScreen = ({navigation, route}) =>{
    const [state, setState] = useState()
    useEffect(()=>{
        if(route.params?.state){
            setState(route.params?.state)
        }

    },[route.params?.state])
    const InputComponent = () =>{
        return (
            <View>
                <TextInput style={styles.input}/>
            </View>
            )
    }
    const RightButton = () =>{
        return(
            <TouchableOpacity 
            onPress={()=>navigation.navigate('home',{marker: true, state: state})}
             style={{alignSelf:'center', marginLeft: 10, marginRight: 10}}>
                <Icon name={'map-marker'} size={24}/>
            </TouchableOpacity>
            )
    }
    return(
     
                    <GooglePlacesAutocomplete
        placeholder='Search'
        fetchDetails={true}
        //currentLocation={true}
        enablePoweredByContainer={false}
        onPress={(data, details = null) => {
          // 'details' is provided when fetchDetails = true
          console.log('data',data)
          navigation.navigate('home',{state: state, 
            latitude: details.geometry.location.lat, 
            longitude: details.geometry.location.lng,
            place: details.formatted_address})
          console.log(details.geometry.location.lat);
        }}
        query={{
          key: 'AIzaSyDwAYYq1Tn7jUJBVWMmyhv9UCOelRHMEFk',
          language: 'en',
          components: 'country:tr',
        }}
        GoogleReverseGeocodingQuery={{
            // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
            key: 'AIzaSyDwAYYq1Tn7jUJBVWMmyhv9UCOelRHMEFk',
            language: 'en',  
        }}
        currentLocationLabel="Current location"
        nearbyPlacesAPI='GoogleReverseGeocoding'
        renderRightButton= {RightButton}
        styles={{
            container:{marginTop: Platform.OS=='android' ? StatusBar.currentHeight : 44,},
            textInput:{color:'black', fontSize: 15}
        }}
        renderDescription={(row) => row.description || row.formatted_address || row.name}
      />

        

    )


}    

const styles = StyleSheet.create({
    input:{
        height: 40, 
        width: Dimensions.get('window').width
    }
})


export default SearchScreen;