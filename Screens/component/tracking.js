
import React from 'react';
import { StyleSheet,Text, View, TouchableOpacity, TouchableWithoutFeedback, PermissionsAndroid, StatusBar } from 'react-native';
import haversine from "haversine";
import MapView, {
Marker,
AnimatedRegion,
PROVIDER_GOOGLE
} from "react-native-maps";

import Geolocation from '@react-native-community/geolocation';
import Polyline from '@mapbox/polyline';
import database from '@react-native-firebase/database'
import auth from '@react-native-firebase/auth'

const LATITUDE_DELTA = 0.000;
const LONGITUDE_DELTA = 0.009;
const LATITUDE = 22.6107983;
const LONGITUDE = 88.4429171;
export default class TrackNow extends React.Component {
    
constructor(props) {
    super(props);
    this.state = {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        routeCoordinates: [],
        distanceTravelled: 0,
        prevLatLng: {},
        coordinate: new AnimatedRegion({
            latitude: LATITUDE,
            longitude: LONGITUDE,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        })
    };
    const { bId, alldata} = this.props;
    let keys = bId;
    console.log(keys)
    const dat=database().ref('bookings/'+keys);
    dat.on('value',snapshot=>{
        console.log('data.current',snapshot.val())
           var data = snapshot.val()
            if(data.current){
                let data = snapshot.val();
                 this.setState({latitude:data.current?.lat , longitude : data.current?.lng});
            }
    })
}

async componentDidMount() {
    const { coordinate } = this.state;

    
    // console.log(locationPermission)
    //this.requestCameraPermission();
    this.watchID = Geolocation.watchPosition(
    position => {
        const { routeCoordinates, distanceTravelled } = this.state;
        const { latitude, longitude } = position.coords;

        const newCoordinate = {
            latitude,
            longitude
        };
        coordinate.timing(newCoordinate).start();
        this.setState({
            latitude,
            longitude,
            routeCoordinates: routeCoordinates.concat([newCoordinate]),
            distanceTravelled:
            distanceTravelled + this.calcDistance(newCoordinate),
            prevLatLng: newCoordinate
        });
    },
        error => console.log(error),
        {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 1000,
            distanceFilter: 10
        }
    );
    const { bId, alldata} = this.props;
    console.log(alldata)
    if(alldata){
        let paramData = alldata;
        //console.log('paramData',paramData)
        this.setState({
            allData: paramData,
            startLoc: paramData.pickup.latitude+','+ paramData.pickup.longitude,
            destinationLoc: paramData.drop.latitude +','+ paramData.drop.longitude
        },()=>{
            //console.log(this.state.allData)
            this.getDirections();
        })
    }
}

componentWillUnmount() {
    Geolocation.clearWatch(this.watchID);
}
componentDidUpdate(){
    //console.log(this.state);
}

async getLocationAsync() {
    // const { Location, Permissions } = Expo;
    // permissions returns only for location permissions on iOS and under certain conditions, see Permissions.LOCATION
    const { status, permissions } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
    // return Location.getCurrentPositionAsync({enableHighAccuracy: true});
    } else {
    throw new Error('Location permission not granted');
    }
}

calcDistance = newLatLng => {
    const { prevLatLng } = this.state;
    return haversine(prevLatLng, newLatLng) || 0;
};

getMapRegion = () => ({
    latitude: this.state.latitude,
    longitude: this.state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA
});

requestCameraPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        // {
        //     title: languageJSON.location_permission,
        //     buttonNeutral: languageJSON.ask_me_later,
        //     buttonNegative: languageJSON.cancel,
        //     buttonPositive: languageJSON.no_driver_found_alert_OK_button
        // }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("You can use the camera");
        } else {
            console.log("Camera permission denied");
        }
    } catch (err) {
        console.warn(err);
    }
};

// find your origin and destination point coordinates and pass it to our method.
async getDirections() {
    try {
        console.log('start',this.state.destinationLoc)
        let resp = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${ this.state.startLoc }&destination=${ this.state.destinationLoc }&key=AIzaSyDwAYYq1Tn7jUJBVWMmyhv9UCOelRHMEFk`)
        let respJson = await resp.json();
        console.log("respJson",respJson)
        let points = Polyline.decode(respJson.routes[0].overview_polyline.points);
        console.log(points)
        let coords = points.map((point, index) => {
            return  {
                latitude : point[0],
                longitude : point[1]
            }
        })
        this.setState({coords: coords},()=>{
            setTimeout(() => {
                this.map.fitToCoordinates([{latitude: this.state.allData.pickup.latitude, longitude: this.state.allData.pickup.longitude}, {latitude: this.state.allData.drop.latitude, longitude: this.state.allData.drop.longitude}], {
                    edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
                    animated: true,
                 })  
            }, 1500);
            
        })
        return coords
    }
    catch(error) {
        alert(error)
        return error
    }
}

render() {
    console.log(this.state.coords)
    return (
              <View style={styles.innerContainer}>
                <MapView
                    ref={map => { this.map = map }}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    showUserLocation
                    followUserLocation
                    loadingEnabled
                    region={this.getMapRegion()}
                >
                <MapView.Polyline 
                    coordinates={this.state.coords?this.state.coords:[{latitude:0.00,longitude:0.00}]}
                    strokeWidth={5}
                    strokeColor={"blue"}
                /> 
                <MapView.Polyline coordinates={this.state.routeCoordinates} strokeWidth={5} />    
                
                <Marker.Animated
                    ref={marker => {
                    this.marker = marker;
                    }}
                    coordinate={new AnimatedRegion({
                        latitude: this.state.latitude,
                        longitude: this.state.longitude,
                        latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
                    })}
                    image={require('../../public/track_Car.png')}
                />
                <Marker
                    // ref={markerRef}
                    coordinate={{latitude: this.state.allData?this.state.allData.pickup.latitude: 0.00, longitude: this.state.allData?this.state.allData.pickup.longitude:0.00}} 
                    image={require('../../public/rsz_2red_pin.png')}
                />
                <Marker
                // ref={markerRef}
                coordinate={{latitude: this.state.allData?this.state.allData.drop.latitude:0.00, longitude: this.state.allData?this.state.allData.drop.longitude:0.00}}
                image={require('../../public/rsz_2red_pin.png')}
                />

                </MapView>
               
            </View>
    
    );
}

}

const styles = StyleSheet.create({
    container: {
        flex:1, 
        backgroundColor: '#fff', 
       // marginTop: StatusBar.currentHeight,
    },
    innerContainer: {
        flex:1, 
        backgroundColor: '#fff',
        justifyContent: "flex-end",
        alignItems: "center",
       
    },
    headerStyle: { 
        backgroundColor: '#243235', 
        borderBottomWidth: 0 
    },
    headerInnerStyle: {
        marginLeft:10,
        marginRight: 10
    },
    headerTitleStyle: { 
        color: '#eee',
        fontFamily:'Roboto-Bold',
        fontSize: 18
     },
    map: {
        ...StyleSheet.absoluteFillObject

    },
    bubble: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.7)",
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20
    },
    latlng: {
        width: 200,
        alignItems: "stretch"
    },
    button: {
        width: 80,
        paddingHorizontal: 12,
        alignItems: "center",
        marginHorizontal: 10
    },
    buttonContainer: {
        flexDirection: "row",
        marginVertical: 20,
        backgroundColor: "transparent"
    }
});
 