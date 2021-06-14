import React, {useState} from 'react'
import { StyleSheet,View,Image,Text} from 'react-native'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Location from '../../public/location.png'
const MapScreen = ({mapStyle, marker,onPositionChange,locationCur}) =>{
  const [location, setLocation] = useState({})
  console.log('marker',marker)
  console.log('location', locationCur)
  const onChange = (region) => {

    if(!marker) return
    console.log(region)
    onPositionChange(region)
    setLocation(region)
  }
    return(
        <MapView                 
        provider={PROVIDER_GOOGLE}
        showsUserLocation={true}
        followUserLocation
        loadingEnabled
        animated
        showsMyLocationButton={true}
        onRegionChangeComplete={onChange}
        region={{latitude: locationCur.latitude, longitude: locationCur.longitude,latitudeDelta: locationCur.latitudeDelta ?? 0.09,
          longitudeDelta: locationCur.longitudeDelta ?? 0.04,}}
        
        
        
        style={mapStyle}>
          
      

        </MapView>
    )
}

const styles = StyleSheet.create({
    markerFixed: {
       // backgroundColor:'#000'
        
      },
      marker: {
        height: 30,
        width: 30
      },
})

export default MapScreen;