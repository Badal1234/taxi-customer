import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TextInput,
  TouchableOpacity,
  Platform,
  UIManager,
  LayoutAnimation,
  Alert,
  StatusBar,
} from 'react-native';
import MapComponent from './component/mapView';
import Geolocation from '@react-native-community/geolocation';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import {request, PERMISSIONS} from 'react-native-permissions';
import {  Marker } from 'react-native-maps';
const HomeScreen = ({navigation, route}) => {
  const [toLocation, setTo] = useState();
  const [fromLocation, setFrom] = useState();
  const [state, setState] = useState('from');
  const [marker, set_marker] = useState(false);
  const [location, setLocation] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(async () => {
    request(PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION).then(res => {
      Geolocation.getCurrentPosition(async info => {
        setLocation(info.coords);
        try {
          var loc = await getAddressFromCoordinates({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        } catch (err) {
          if (error.code == 2) Alert.alert('Please enable your location');
        }

        // setLocation({latitude: location.latitude, longitude:location.longitude,place: loc })
        const jsonValue = JSON.stringify({
          place: loc,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        await AsyncStorage.setItem('location', jsonValue);
      });
    });
  }, []);
  console.log(location);

  function getAddressFromCoordinates({latitude, longitude}) {
    return new Promise(resolve => {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDwAYYq1Tn7jUJBVWMmyhv9UCOelRHMEFk`;
      fetch(url)
        .then(res => res.json())
        .then(resJson => {
          // the response had a deeply nested structure :/
          console.log(resJson);
          resolve(resJson.results[0].formatted_address);
        })
        .catch(e => {
          console.log('Error in getAddressFromCoordinates', e);
          resolve();
        });
    });
  }
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
      }
    }
  }, []);
  useEffect(async() => {
    if (route.params?.marker) {
      set_marker(route.params?.marker);
      var loc = await getAddressFromCoordinates({latitude: location.latitude, longitude: location.longitude})
      if(route.params?.state == 'from'){
        setFrom({
          latitude: location.latitude,
          longitude: location.longitude,
          place:  loc
        })
      }else{
        setTo({
          latitude: location.latitude,
          longitude: location.longitude,
          place:  loc
        })

      }

    }
    if (route.params?.state) setState(route.params?.state);
  }, [route.param?.marker, route.params?.state]);
  useEffect(() => {
    if (route.params?.place) {
      if (route.params.state === 'from') {
        setLocation({
          ...location,
          latitude: route.params?.latitude,
          longitude: route.params?.longitude,
        });
        setFrom({
          latitude: route.params?.latitude,
          longitude: route.params?.longitude,
          place: route.params?.place,
        });
      } else {
        setLocation({
          ...location,
          latitude: route.params?.latitude,
          longitude: route.params?.longitude,
        });
        setTo({
          latitude: route.params?.latitude,
          longitude: route.params?.longitude,
          place: route.params?.place,
        });
      }
    }
  }, [route.params]);
  useEffect(() => {
    if (toLocation && fromLocation)
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
  }, [toLocation, fromLocation]);
  const onPositionChange = async (region) => {
    console.log(state);
    console.log('region',region)
    setLocation(region);
    var loc = await getAddressFromCoordinates({latitude: region.latitude, longitude: region.longitude});
    console.log('loc', loc);
    if (state === 'from') {
      setFrom({latitude: region.latitude, longitude: region.longitude, place: loc});
    } else setTo({latitude: region.latitude, longitude: region.longitude, place: loc});
  };
  return (
    <View style={{flex: 1}}>
      <MapComponent
        mapStyle={styles.mapStyle}
        locationCur={location}
        onPositionChange={onPositionChange}
        //onRegionChange={e=> onPositionChange(e)}
        marker={marker}
      >
         {marker ? <Marker
              source={require('../public/location.png')}
              style={{width: 26, height: 28}}
              resizeMode="contain"
              coordinate={location}
          /> : null}

      </MapComponent>

      <View
        style={{
          position: 'absolute',
          width: Dimensions.get('window').width,
          height: Dimensions.get('window').height,
        }}>
                  <View
        style={{ padding: StatusBar.currentHeight + 10,paddingBottom: 10}}>
        <Icon name={'bars'} size={22} onPress={() => navigation.openDrawer()} />
      </View>


        <View style={{ justifyContent:'center',alignItems:'center',}}>
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate('search', {state: 'from'})}
              style={styles.input}>
              <View
                style={{
                  height: 10,
                  width: 10,
                  borderRadius: 5,
                  backgroundColor: 'green',
                }}
              />
              <Text
                style={{fontSize: 15, fontWeight: '500', fontStyle: 'italic'}}>
                {fromLocation ? fromLocation.place : 'From'}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate('search', {state: 'to'})}
              style={styles.input}>
              <View
                style={{
                  height: 10,
                  width: 10,
                  borderRadius: 5,
                  backgroundColor: 'red',
                }}
              />
              <Text
                style={{fontSize: 15, fontWeight: '500', fontStyle: 'italic'}}>
                {toLocation ? toLocation.place : 'To'}
              </Text>
            </TouchableOpacity>
          </View>
         
        </View>
        {marker ? (
          <View style={styles.markerFixed}>
            <Image
              style={{width: 40, height: 40}}
              source={require('../public/location.png')}
            />
          </View>
        ) : null}
         <View style={{top: '40%'}}>
            {fromLocation && toLocation ? (
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('distance', {
                    from: fromLocation,
                    to: toLocation,
                  })
                }
                style={styles.buttonBook}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: '#fff',
                    letterSpacing: 1,
                  }}>
                  Book Your Ride
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mapStyle: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
  },
  input: {
    width: 340,
    height: 50,
    borderColor: '#000',
    borderWidth: 0.1,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    // justifyContent:'center',
    paddingLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonBook: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#243235',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 15,
    marginTop: 15,
  },
  markerFixed: {
    alignSelf: 'center',
    justifyContent:'center',
    alignItems:'center',
  //  position:'absolute'
  },
});

export default HomeScreen;
